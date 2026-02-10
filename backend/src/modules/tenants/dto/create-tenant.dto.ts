import { IsString, IsOptional, IsEnum, IsEmail, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlan } from '../../../entities/tenant.entity';

export class CreateTenantDto {
    @ApiProperty({ description: 'Tenant name', example: 'Acme Corporation' })
    @IsString()
    @MinLength(3)
    name: string;

    @ApiPropertyOptional({ description: 'Subdomain for tenant', example: 'acme' })
    @IsString()
    @IsOptional()
    subdomain?: string;

    @ApiPropertyOptional({
        description: 'Subscription plan',
        enum: SubscriptionPlan,
        default: SubscriptionPlan.FREE,
    })
    @IsEnum(SubscriptionPlan)
    @IsOptional()
    plan?: SubscriptionPlan;

    @ApiPropertyOptional({ description: 'Contact email', example: 'contact@acme.com' })
    @IsEmail()
    @IsOptional()
    contactEmail?: string;

    @ApiPropertyOptional({ description: 'Billing email', example: 'billing@acme.com' })
    @IsEmail()
    @IsOptional()
    billingEmail?: string;

    @ApiPropertyOptional({ description: 'Timezone', example: 'America/Sao_Paulo' })
    @IsString()
    @IsOptional()
    timezone?: string;

    @ApiPropertyOptional({ description: 'Currency', example: 'BRL' })
    @IsString()
    @IsOptional()
    currency?: string;

    @ApiPropertyOptional({ description: 'Language', example: 'pt-BR' })
    @IsString()
    @IsOptional()
    language?: string;
}
