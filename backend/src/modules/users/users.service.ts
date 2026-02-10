import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole, UserStatus } from '../../entities/user.entity';
import { UserConnector } from '../../entities/user-connector.entity';

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
  timezone?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserConnector)
    private connectorRepository: Repository<UserConnector>,
  ) { }

  async findById(id: string, tenantId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, tenantId },
      relations: ['connectors'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string, tenantId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, tenantId },
      relations: ['connectors'],
    });
  }

  async updateUser(id: string, tenantId: string, updates: UpdateUserDto): Promise<User> {
    const user = await this.findById(id, tenantId);
    Object.assign(user, updates);
    return this.userRepository.save(user);
  }

  async updateRole(id: string, tenantId: string, role: UserRole): Promise<User> {
    const user = await this.findById(id, tenantId);
    user.role = role;
    return this.userRepository.save(user);
  }

  async updateStatus(id: string, tenantId: string, status: UserStatus): Promise<User> {
    const user = await this.findById(id, tenantId);
    user.status = status;
    return this.userRepository.save(user);
  }

  async listUsers(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      where: { tenantId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { users, total };
  }

  async deleteUser(id: string, tenantId: string): Promise<void> {
    const user = await this.findById(id, tenantId);
    await this.userRepository.remove(user);
  }

  async getUserConnectors(userId: string, tenantId: string): Promise<UserConnector[]> {
    return this.connectorRepository.find({
      where: { userId, tenantId },
      order: { createdAt: 'DESC' },
    });
  }
}
