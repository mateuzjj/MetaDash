import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';

import { KpiValue, Granularity } from '../../entities/kpi-value.entity';
import { Campaign } from '../../entities/campaign.entity';

export interface FunnelStage {
  name: string;
  value: number;
  rate: number;
}

export interface TrafficSource {
  name: string;
  value: number;
  percentage: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(KpiValue)
    private kpiValueRepository: Repository<KpiValue>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
  ) { }

  async getFunnelData(
    tenantId: string,
    connectorIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<FunnelStage[]> {
    const clicks = await this.getAggregatedValue(tenantId, 'clicks', connectorIds, startDate, endDate);
    const pageViews = await this.getAggregatedValue(tenantId, 'pageViews', connectorIds, startDate, endDate);
    const checkouts = await this.getAggregatedValue(tenantId, 'checkouts', connectorIds, startDate, endDate);
    const purchases = await this.getAggregatedValue(tenantId, 'purchases', connectorIds, startDate, endDate);

    return [
      { name: 'Clicks', value: clicks, rate: 100 },
      { name: 'Page Views', value: pageViews, rate: pageViews > 0 ? (pageViews / clicks) * 100 : 0 },
      { name: 'Checkouts', value: checkouts, rate: checkouts > 0 ? (checkouts / pageViews) * 100 : 0 },
      { name: 'Purchases', value: purchases, rate: purchases > 0 ? (purchases / checkouts) * 100 : 0 },
    ];
  }

  async getTrafficSources(
    tenantId: string,
    connectorIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<TrafficSource[]> {
    const values = await this.kpiValueRepository
      .createQueryBuilder('kpi')
      .select('kpi.campaignName', 'name')
      .addSelect('SUM(kpi.value)', 'value')
      .where('kpi.tenantId = :tenantId', { tenantId })
      .andWhere('kpi.kpiDefinitionId = :kpi', { kpi: 'sessions' })
      .andWhere('kpi.connectorId IN (:...connectorIds)', { connectorIds })
      .andWhere('kpi.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('kpi.campaignName')
      .getRawMany();

    const total = values.reduce((sum, v) => sum + parseFloat(v.value), 0);

    return values.map((v) => ({
      name: v.name || 'Direct',
      value: parseFloat(v.value),
      percentage: total > 0 ? (parseFloat(v.value) / total) * 100 : 0,
    }));
  }

  async getGeographicData(
    tenantId: string,
    connectorIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    return this.kpiValueRepository
      .createQueryBuilder('kpi')
      .select('kpi.region', 'region')
      .addSelect('kpi.city', 'city')
      .addSelect('SUM(kpi.value)', 'accesses')
      .where('kpi.tenantId = :tenantId', { tenantId })
      .andWhere('kpi.kpiDefinitionId = :kpi', { kpi: 'sessions' })
      .andWhere('kpi.connectorId IN (:...connectorIds)', { connectorIds })
      .andWhere('kpi.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('kpi.region IS NOT NULL')
      .groupBy('kpi.region')
      .addGroupBy('kpi.city')
      .orderBy('accesses', 'DESC')
      .limit(20)
      .getRawMany();
  }

  async getDeviceData(
    tenantId: string,
    connectorIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const [deviceCategories, operatingSystems] = await Promise.all([
      this.kpiValueRepository
        .createQueryBuilder('kpi')
        .select('kpi.deviceCategory', 'name')
        .addSelect('SUM(kpi.value)', 'value')
        .where('kpi.tenantId = :tenantId', { tenantId })
        .andWhere('kpi.kpiDefinitionId = :kpi', { kpi: 'sessions' })
        .andWhere('kpi.connectorId IN (:...connectorIds)', { connectorIds })
        .andWhere('kpi.date BETWEEN :startDate AND :endDate', { startDate, endDate })
        .andWhere('kpi.deviceCategory IS NOT NULL')
        .groupBy('kpi.deviceCategory')
        .getRawMany(),
      this.kpiValueRepository
        .createQueryBuilder('kpi')
        .select('kpi.operatingSystem', 'name')
        .addSelect('SUM(kpi.value)', 'value')
        .where('kpi.tenantId = :tenantId', { tenantId })
        .andWhere('kpi.kpiDefinitionId = :kpi', { kpi: 'sessions' })
        .andWhere('kpi.connectorId IN (:...connectorIds)', { connectorIds })
        .andWhere('kpi.date BETWEEN :startDate AND :endDate', { startDate, endDate })
        .andWhere('kpi.operatingSystem IS NOT NULL')
        .groupBy('kpi.operatingSystem')
        .getRawMany(),
    ]);

    return {
      devices: deviceCategories,
      operatingSystems,
    };
  }

  async getCampaignPerformance(
    tenantId: string,
    connectorIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    return this.campaignRepository
      .createQueryBuilder('campaign')
      .leftJoinAndSelect(
        'kpi_values',
        'kpi',
        'kpi.campaignId = campaign.externalId AND kpi.date BETWEEN :startDate AND :endDate AND kpi.tenantId = :tenantId',
        { startDate, endDate, tenantId },
      )
      .where('campaign.tenantId = :tenantId', { tenantId })
      .andWhere('campaign.connectorId IN (:...connectorIds)', { connectorIds })
      .select('campaign.id', 'id')
      .addSelect('campaign.name', 'name')
      .addSelect('campaign.status', 'status')
      .addSelect('SUM(CASE WHEN kpi.kpiDefinitionId = :spend THEN kpi.value ELSE 0 END)', 'spend')
      .addSelect('SUM(CASE WHEN kpi.kpiDefinitionId = :conversions THEN kpi.value ELSE 0 END)', 'conversions')
      .setParameter('spend', 'spend')
      .setParameter('conversions', 'conversions')
      .groupBy('campaign.id')
      .addGroupBy('campaign.name')
      .addGroupBy('campaign.status')
      .getRawMany();
  }

  private async getAggregatedValue(
    tenantId: string,
    kpiCode: string,
    connectorIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.kpiValueRepository
      .createQueryBuilder('kpi')
      .select('SUM(kpi.value)', 'total')
      .where('kpi.tenantId = :tenantId', { tenantId })
      .andWhere('kpi.kpiDefinitionId = :kpiCode', { kpiCode })
      .andWhere('kpi.connectorId IN (:...connectorIds)', { connectorIds })
      .andWhere('kpi.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getRawOne();

    return parseFloat(result?.total || '0');
  }
}
