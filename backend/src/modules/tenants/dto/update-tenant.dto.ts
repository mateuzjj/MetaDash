import { PartialType } from '@nestjs/swagger';
import { CreateTenantDto } from './create-tenant.dto';
import { IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TenantStatus } from '../../../entities/tenant.entity';

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
    @ApiPropertyOptional({ enum: TenantStatus })
    @IsEnum(TenantStatus)
    @IsOptional()
    status?: TenantStatus;

    @ApiPropertyOptional({ description: 'Tenant settings (JSON object)' })
    @IsObject()
    @IsOptional()
    settings?: any;
}
