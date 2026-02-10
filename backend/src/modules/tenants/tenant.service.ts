import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus, SubscriptionPlan } from '../../entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
    constructor(
        @InjectRepository(Tenant)
        private tenantRepository: Repository<Tenant>,
    ) { }

    /**
     * Create a new tenant
     */
    async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
        // Check if subdomain is already taken
        if (createTenantDto.subdomain) {
            const existing = await this.tenantRepository.findOne({
                where: { subdomain: createTenantDto.subdomain },
            });
            if (existing) {
                throw new ConflictException('Subdomain already taken');
            }
        }

        // Check if name is already taken
        const existingName = await this.tenantRepository.findOne({
            where: { name: createTenantDto.name },
        });
        if (existingName) {
            throw new ConflictException('Tenant name already exists');
        }

        // Set trial end date (14 days from now by default)
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 14);

        const tenant = this.tenantRepository.create({
            ...createTenantDto,
            status: TenantStatus.TRIAL,
            trialEndsAt,
            settings: {
                timezone: createTenantDto.timezone || 'America/Sao_Paulo',
                currency: createTenantDto.currency || 'BRL',
                language: createTenantDto.language || 'pt-BR',
                features: [],
                limits: {
                    users: this.getUserLimit(createTenantDto.plan),
                    connectors: this.getConnectorLimit(createTenantDto.plan),
                    dataRetentionDays: this.getDataRetentionDays(createTenantDto.plan),
                },
            },
        });

        return this.tenantRepository.save(tenant);
    }

    /**
     * Find all tenants (admin only)
     */
    async findAll(): Promise<Tenant[]> {
        return this.tenantRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Find tenant by ID
     */
    async findOne(id: string): Promise<Tenant> {
        const tenant = await this.tenantRepository.findOne({ where: { id } });
        if (!tenant) {
            throw new NotFoundException(`Tenant not found: ${id}`);
        }
        return tenant;
    }

    /**
     * Find tenant by subdomain
     */
    async findBySubdomain(subdomain: string): Promise<Tenant> {
        const tenant = await this.tenantRepository.findOne({ where: { subdomain } });
        if (!tenant) {
            throw new NotFoundException(`Tenant not found: ${subdomain}`);
        }
        return tenant;
    }

    /**
     * Update tenant
     */
    async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
        const tenant = await this.findOne(id);

        // Check subdomain uniqueness if changing
        if (updateTenantDto.subdomain && updateTenantDto.subdomain !== tenant.subdomain) {
            const existing = await this.tenantRepository.findOne({
                where: { subdomain: updateTenantDto.subdomain },
            });
            if (existing) {
                throw new ConflictException('Subdomain already taken');
            }
        }

        // Update settings if provided
        if (updateTenantDto.settings) {
            tenant.settings = {
                ...tenant.settings,
                ...updateTenantDto.settings,
            };
        }

        // Update plan limits if plan changed
        if (updateTenantDto.plan && updateTenantDto.plan !== tenant.plan) {
            tenant.settings.limits = {
                users: this.getUserLimit(updateTenantDto.plan),
                connectors: this.getConnectorLimit(updateTenantDto.plan),
                dataRetentionDays: this.getDataRetentionDays(updateTenantDto.plan),
            };
        }

        Object.assign(tenant, updateTenantDto);
        return this.tenantRepository.save(tenant);
    }

    /**
     * Suspend tenant
     */
    async suspend(id: string): Promise<Tenant> {
        const tenant = await this.findOne(id);
        tenant.status = TenantStatus.SUSPENDED;
        return this.tenantRepository.save(tenant);
    }

    /**
     * Activate tenant
     */
    async activate(id: string): Promise<Tenant> {
        const tenant = await this.findOne(id);
        tenant.status = TenantStatus.ACTIVE;
        return this.tenantRepository.save(tenant);
    }

    /**
     * Cancel tenant subscription
     */
    async cancel(id: string): Promise<Tenant> {
        const tenant = await this.findOne(id);
        tenant.status = TenantStatus.CANCELLED;
        return this.tenantRepository.save(tenant);
    }

    /**
     * Upgrade tenant subscription
     */
    async upgradePlan(id: string, plan: SubscriptionPlan): Promise<Tenant> {
        const tenant = await this.findOne(id);

        // Convert from trial to active if upgrading
        if (tenant.status === TenantStatus.TRIAL) {
            tenant.status = TenantStatus.ACTIVE;
        }

        tenant.plan = plan;

        // Update limits based on new plan
        tenant.settings.limits = {
            users: this.getUserLimit(plan),
            connectors: this.getConnectorLimit(plan),
            dataRetentionDays: this.getDataRetentionDays(plan),
        };

        // Set subscription end date (30 days from now)
        const subscriptionEndsAt = new Date();
        subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 30);
        tenant.subscriptionEndsAt = subscriptionEndsAt;

        return this.tenantRepository.save(tenant);
    }

    /**
     * Helper: Get user limit by plan
     */
    private getUserLimit(plan: SubscriptionPlan): number {
        switch (plan) {
            case SubscriptionPlan.FREE:
                return 1;
            case SubscriptionPlan.STARTER:
                return 5;
            case SubscriptionPlan.PROFESSIONAL:
                return 20;
            case SubscriptionPlan.ENTERPRISE:
                return 100;
            default:
                return 1;
        }
    }

    /**
     * Helper: Get connector limit by plan
     */
    private getConnectorLimit(plan: SubscriptionPlan): number {
        switch (plan) {
            case SubscriptionPlan.FREE:
                return 1;
            case SubscriptionPlan.STARTER:
                return 3;
            case SubscriptionPlan.PROFESSIONAL:
                return 10;
            case SubscriptionPlan.ENTERPRISE:
                return 50;
            default:
                return 1;
        }
    }

    /**
     * Helper: Get data retention days by plan
     */
    private getDataRetentionDays(plan: SubscriptionPlan): number {
        switch (plan) {
            case SubscriptionPlan.FREE:
                return 30;
            case SubscriptionPlan.STARTER:
                return 90;
            case SubscriptionPlan.PROFESSIONAL:
                return 365;
            case SubscriptionPlan.ENTERPRISE:
                return 730; // 2 years
            default:
                return 30;
        }
    }
}
