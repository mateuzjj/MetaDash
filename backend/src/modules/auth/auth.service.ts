import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole, UserStatus } from '../../entities/user.entity';
import { UserConnector, ConnectorType } from '../../entities/user-connector.entity';
import { Tenant, TenantStatus, SubscriptionPlan } from '../../entities/tenant.entity';

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  tenantId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserConnector)
    private connectorRepository: Repository<UserConnector>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    tenantName?: string,
  ): Promise<{ user: User; tokens: AuthTokens }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create tenant
    let tenantId: string;
    let role = UserRole.VIEWER;

    if (tenantName) {
      // Check if tenant name exists
      const existingTenant = await this.tenantRepository.findOne({
        where: { name: tenantName },
      });

      if (existingTenant) {
        throw new ConflictException('Tenant name already taken');
      }

      const tenant = this.tenantRepository.create({
        name: tenantName,
        subdomain: tenantName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        status: TenantStatus.TRIAL,
        plan: SubscriptionPlan.PROFESSIONAL, // Default trial plan
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      });

      await this.tenantRepository.save(tenant);
      tenantId = tenant.id;
      role = UserRole.ADMIN; // Creator is admin
    } else {
      // Assign to default public tenant (if allows) or error
      // For now, we require tenant name or assign to a default 'Demo' tenant
      const defaultTenant = await this.tenantRepository.findOne({
        where: { name: 'Default Organization' },
      });

      if (!defaultTenant) {
        throw new Error('Default tenant not found');
      }
      tenantId = defaultTenant.id;
    }

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      status: UserStatus.ACTIVE,
      tenantId,
    });

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async googleLogin(googleProfile: any): Promise<{ user: User; tokens: AuthTokens }> {
    const { email, firstName, lastName, picture, id: googleId } = googleProfile;

    // Get default tenant
    const defaultTenant = await this.tenantRepository.findOne({
      where: { name: 'Default Organization' },
    });

    if (!defaultTenant) {
      throw new Error('Default tenant not found');
    }

    let user = await this.userRepository.findOne({
      where: [{ email }, { googleId }],
    });

    if (!user) {
      // Create new user
      user = this.userRepository.create({
        email,
        firstName,
        lastName,
        avatar: picture,
        googleId,
        role: UserRole.VIEWER,
        status: UserStatus.ACTIVE,
        emailVerified: true,

        tenantId: defaultTenant.id,
      });
    } else {
      // Update existing user
      user.googleId = googleId;
      user.avatar = picture;
      user.lastLoginAt = new Date();
    }

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId, // Include tenant context in JWT
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      }),
    ]);

    // Parse expiresIn to get the number of seconds
    const expiresInStr = this.configService.get('jwt.expiresIn', '15m');
    const expiresIn = this.parseExpiresIn(expiresInStr);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * (multipliers[unit] || 60);
  }

  async saveConnectorTokens(
    userId: string,
    type: ConnectorType,
    accountId: string,
    accessToken: string,
    refreshToken: string,
    expiresAt: Date,
    accountName?: string,
  ): Promise<UserConnector> {
    // Find existing connector
    let connector = await this.connectorRepository.findOne({
      where: { userId, type, accountId },
    });

    if (connector) {
      // Update existing
      connector.accessToken = accessToken;
      connector.refreshToken = refreshToken;
      connector.tokenExpiresAt = expiresAt;
      connector.accountName = accountName || connector.accountName;
      connector.status = 'active' as any;
    } else {
      // Create new
      connector = this.connectorRepository.create({
        userId,
        type,
        accountId,
        accountName,
        accessToken,
        refreshToken,
        tokenExpiresAt: expiresAt,
        status: 'active' as any,
      });
    }

    return this.connectorRepository.save(connector);
  }

  async getUserConnectors(userId: string): Promise<UserConnector[]> {
    return this.connectorRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
