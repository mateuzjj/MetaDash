import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { UpgradePlanDto } from './dto/upgrade-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetTenantId } from '../../common/decorators/tenant.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('tenants')
@Controller('tenants')
export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    @Post()
    @ApiOperation({ summary: 'Create new tenant (admin only)' })
    @ApiResponse({ status: 201, description: 'Tenant created successfully' })
    @ApiResponse({ status: 409, description: 'Subdomain or name already exists' })
    async create(@Body() createTenantDto: CreateTenantDto) {
        return this.tenantService.create(createTenantDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all tenants (admin only)' })
    @ApiResponse({ status: 200, description: 'List of all tenants' })
    async findAll() {
        return this.tenantService.findAll();
    }

    @Get('current')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current tenant info' })
    @ApiResponse({ status: 200, description: 'Current tenant details' })
    async getCurrent(@GetTenantId() tenantId: string) {
        return this.tenantService.findOne(tenantId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get tenant by ID (admin only)' })
    @ApiResponse({ status: 200, description: 'Tenant details' })
    @ApiResponse({ status: 404, description: 'Tenant not found' })
    async findOne(@Param('id') id: string) {
        return this.tenantService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update tenant (admin only)' })
    @ApiResponse({ status: 200, description: 'Tenant updated successfully' })
    @ApiResponse({ status: 404, description: 'Tenant not found' })
    async update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
        return this.tenantService.update(id, updateTenantDto);
    }

    @Patch(':id/suspend')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Suspend tenant (admin only)' })
    @ApiResponse({ status: 200, description: 'Tenant suspended' })
    async suspend(@Param('id') id: string) {
        return this.tenantService.suspend(id);
    }

    @Patch(':id/activate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Activate tenant (admin only)' })
    @ApiResponse({ status: 200, description: 'Tenant activated' })
    async activate(@Param('id') id: string) {
        return this.tenantService.activate(id);
    }

    @Patch(':id/upgrade')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Upgrade tenant subscription plan' })
    @ApiResponse({ status: 200, description: 'Plan upgraded successfully' })
    async upgradePlan(@Param('id') id: string, @Body() upgradePlanDto: UpgradePlanDto) {
        return this.tenantService.upgradePlan(id, upgradePlanDto.plan);
    }
}
