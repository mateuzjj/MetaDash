import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Req,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { ConnectorsService } from './connectors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetTenantId } from '../../common/decorators/tenant.decorator';
import { UserRole } from '../../entities/user.entity';
import { ConnectGoogleDto } from './dto/connect-google.dto';
import { ConnectMetaDto } from './dto/connect-meta.dto';

@ApiTags('Connectors')
@Controller('connectors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ConnectorsController {
  constructor(private connectorsService: ConnectorsService) { }

  @Get()
  @ApiOperation({ summary: 'Get all user connectors' })
  @ApiResponse({ status: 200, description: 'List of connectors' })
  async getUserConnectors(@Req() req, @GetTenantId() tenantId: string) {
    return this.connectorsService.getUserConnectors(req.user.id, tenantId);
  }

  @Post('google')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Connect Google account' })
  @ApiResponse({ status: 201, description: 'Google account connected' })
  async connectGoogle(@Req() req, @Body() connectDto: ConnectGoogleDto) {
    // Implementation would handle OAuth flow
    return { message: 'Connect Google endpoint' };
  }

  @Post('meta')
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Connect Meta account' })
  @ApiResponse({ status: 201, description: 'Meta account connected' })
  async connectMeta(@Req() req, @Body() connectDto: ConnectMetaDto) {
    // Implementation would handle OAuth flow
    return { message: 'Connect Meta endpoint' };
  }

  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Sync connector data' })
  @ApiResponse({ status: 200, description: 'Sync initiated' })
  async syncConnector(@Param('id') connectorId: string, @Req() req, @GetTenantId() tenantId: string) {
    await this.connectorsService.syncConnector(connectorId, req.user.id, tenantId);
    return { message: 'Sync initiated successfully' };
  }

  @Post('sync-all')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.ANALYST)
  @ApiOperation({ summary: 'Sync all connectors' })
  @ApiResponse({ status: 200, description: 'All syncs initiated' })
  async syncAllConnectors(@Req() req, @GetTenantId() tenantId: string) {
    const result = await this.connectorsService.syncAllUserConnectors(req.user.id, tenantId);
    return {
      message: 'Sync completed',
      ...result,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Revoke connector' })
  @ApiResponse({ status: 200, description: 'Connector revoked' })
  async revokeConnector(@Param('id') connectorId: string, @Req() req, @GetTenantId() tenantId: string) {
    await this.connectorsService.revokeConnector(connectorId, req.user.id, tenantId);
    return { message: 'Connector revoked successfully' };
  }
}
