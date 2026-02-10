import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetTenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) { }

  @Get('funnel')
  @ApiOperation({ summary: 'Get funnel data' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Funnel data retrieved' })
  async getFunnelData(
    @Req() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @GetTenantId() tenantId: string,
  ) {
    const connectorIds = req.user.connectors?.map((c: any) => c.id) || [];

    return this.analyticsService.getFunnelData(
      tenantId,
      connectorIds,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('traffic-sources')
  @ApiOperation({ summary: 'Get traffic sources' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Traffic sources retrieved' })
  async getTrafficSources(
    @Req() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @GetTenantId() tenantId: string,
  ) {
    const connectorIds = req.user.connectors?.map((c: any) => c.id) || [];

    return this.analyticsService.getTrafficSources(
      tenantId,
      connectorIds,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('geographic')
  @ApiOperation({ summary: 'Get geographic data' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Geographic data retrieved' })
  async getGeographicData(
    @Req() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @GetTenantId() tenantId: string,
  ) {
    const connectorIds = req.user.connectors?.map((c: any) => c.id) || [];

    return this.analyticsService.getGeographicData(
      tenantId,
      connectorIds,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('devices')
  @ApiOperation({ summary: 'Get device and OS data' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Device data retrieved' })
  async getDeviceData(
    @Req() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @GetTenantId() tenantId: string,
  ) {
    const connectorIds = req.user.connectors?.map((c: any) => c.id) || [];

    return this.analyticsService.getDeviceData(
      tenantId,
      connectorIds,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Get campaign performance' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Campaign performance retrieved' })
  async getCampaignPerformance(
    @Req() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @GetTenantId() tenantId: string,
  ) {
    const connectorIds = req.user.connectors?.map((c: any) => c.id) || [];

    return this.analyticsService.getCampaignPerformance(
      tenantId,
      connectorIds,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
