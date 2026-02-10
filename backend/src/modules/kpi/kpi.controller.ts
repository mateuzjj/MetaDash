import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { KpiService } from './kpi.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetTenantId } from '../../common/decorators/tenant.decorator';
import { Granularity } from '../../entities/kpi-value.entity';

@ApiTags('KPIs')
@Controller('kpi')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KpiController {
  constructor(private kpiService: KpiService) { }

  @Get('definitions')
  @ApiOperation({ summary: 'Get KPI definitions' })
  @ApiResponse({ status: 200, description: 'KPI definitions retrieved' })
  async getKpiDefinitions() {
    return this.kpiService.getKpiDefinitions();
  }

  @Get('values')
  @ApiOperation({ summary: 'Get KPI values' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'granularity', required: false, enum: Granularity })
  @ApiResponse({ status: 200, description: 'KPI values retrieved' })
  async getKpiValues(
    @Req() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('granularity') granularity: Granularity = Granularity.DAY,
    @GetTenantId() tenantId: string,
  ) {
    // Get user's connectors
    const connectorIds = req.user.connectors?.map((c: any) => c.id) || [];

    if (connectorIds.length === 0) {
      return { kpis: [], message: 'No connectors configured' };
    }

    return this.kpiService.getKpiValues(
      tenantId,
      connectorIds,
      new Date(startDate),
      new Date(endDate),
      granularity,
    );
  }

  @Get('time-series')
  @ApiOperation({ summary: 'Get time series data for a KPI' })
  @ApiQuery({ name: 'kpiCode', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'granularity', required: false, enum: Granularity })
  @ApiResponse({ status: 200, description: 'Time series data retrieved' })
  async getTimeSeriesData(
    @Req() req,
    @Query('kpiCode') kpiCode: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('granularity') granularity: Granularity = Granularity.DAY,
    @GetTenantId() tenantId: string,
  ) {
    const connectorIds = req.user.connectors?.map((c: any) => c.id) || [];

    return this.kpiService.getTimeSeriesData(
      tenantId,
      kpiCode,
      connectorIds,
      new Date(startDate),
      new Date(endDate),
      granularity,
    );
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get overview KPIs' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiResponse({ status: 200, description: 'Overview KPIs retrieved' })
  async getOverviewKPIs(
    @Req() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @GetTenantId() tenantId: string,
  ) {
    const connectorIds = req.user.connectors?.map((c: any) => c.id) || [];

    return this.kpiService.getOverviewKPIs(
      tenantId,
      connectorIds,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
