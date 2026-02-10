import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetTenantId } from '../../common/decorators/tenant.decorator';
import { UserRole, UserStatus } from '../../entities/user.entity';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getMe(@Req() req, @GetTenantId() tenantId: string) {
    return this.usersService.findById(req.user.id, tenantId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateMe(@Req() req, @Body() updates: any, @GetTenantId() tenantId: string) {
    return this.usersService.updateUser(req.user.id, tenantId, updates);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all users (admin only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Users list retrieved' })
  async listUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @GetTenantId() tenantId: string,
  ) {
    return this.usersService.listUsers(tenantId, parseInt(page), parseInt(limit));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User retrieved' })
  async getUser(@Param('id') id: string, @GetTenantId() tenantId: string) {
    return this.usersService.findById(id, tenantId);
  }

  @Put(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user role (admin only)' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
    @GetTenantId() tenantId: string,
  ) {
    return this.usersService.updateRole(id, tenantId, role);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user status (admin only)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
    @GetTenantId() tenantId: string,
  ) {
    return this.usersService.updateStatus(id, tenantId, status);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async deleteUser(@Param('id') id: string, @GetTenantId() tenantId: string) {
    await this.usersService.deleteUser(id, tenantId);
    return { message: 'User deleted successfully' };
  }
}
