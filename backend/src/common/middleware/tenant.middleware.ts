import {
    Injectable,
    NestMiddleware,
    UnauthorizedException,
    NotFoundException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Tenant, TenantStatus } from '../../entities/tenant.entity';

declare global {
    namespace Express {
        interface Request {
            tenantId?: string;
            tenant?: Tenant;
            userId?: string;
        }
    }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
        private jwtService: JwtService,
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            // Extract JWT token from Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return next();
            }

            const token = authHeader.replace('Bearer ', '');
            if (!token) {
                return next();
            }

            // Decode JWT to get tenant ID
            const decoded = this.jwtService.decode(token) as any;
            if (!decoded || !decoded.tenantId) {
                throw new UnauthorizedException('Invalid token: missing tenant context');
            }

            // Fetch and validate tenant
            const tenant = await this.tenantRepository.findOne({
                where: { id: decoded.tenantId },
            });

            if (!tenant) {
                throw new NotFoundException(`Tenant not found: ${decoded.tenantId}`);
            }

            // Check if tenant is active
            if (tenant.status === TenantStatus.SUSPENDED) {
                throw new UnauthorizedException('Tenant account is suspended');
            }

            if (tenant.status === TenantStatus.CANCELLED) {
                throw new UnauthorizedException('Tenant account is cancelled');
            }

            // Check trial/subscription status
            if (tenant.isTrial && tenant.trialEndsAt && new Date() > tenant.trialEndsAt) {
                throw new UnauthorizedException('Trial period has expired');
            }

            // Attach tenant info to request
            req.tenantId = tenant.id;
            req.tenant = tenant;
            req.userId = decoded.sub || decoded.userId;

            next();
        } catch (error) {
            if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
                throw error;
            }
            // If JWT decode fails, just continue (public routes)
            next();
        }
    }
}
