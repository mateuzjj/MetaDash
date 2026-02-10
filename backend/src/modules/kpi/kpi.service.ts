import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { KpiDefinition, KpiCategory, KpiSource } from '../../entities/kpi-definition.entity';
import { KpiValue, Granularity } from '../../entities/kpi-value.entity';

export interface KpiData {
  code: string;
  name: string;
  value: number;
  previousValue: number;
  delta: number;
  unit: string;
  formatPattern: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

@Injectable()
export class KpiService {
  constructor(
    @InjectRepository(KpiDefinition)
    private kpiDefinitionRepository: Repository<KpiDefinition>,
    @InjectRepository(KpiValue)
    private kpiValueRepository: Repository<KpiValue>,
  ) { }

  /**
   * Get KPI definitions (global - no tenant filter needed)
   */
  async getKpiDefinitions(
    category?: KpiCategory,
    source?: KpiSource,
  ): Promise<KpiDefinition[]> {
    const query = this.kpiDefinitionRepository.createQueryBuilder('kpi');

    if (category) {
      query.andWhere('kpi.category = :category', { category });
    }

    if (source) {
      query.andWhere('kpi.source = :source', { source });
    }

    return query
      .where('kpi.enabled = :enabled', { enabled: true })
      .orderBy('kpi.displayOrder', 'ASC')
      .getMany();
  }

  /**
   * Get KPI values filtered by tenant
   */
  async getKpiValues(
    tenantId: string,
    connectorIds: string[],
    startDate: Date,
    endDate: Date,
    granularity: Granularity = Granularity.DAY,
  ): Promise<KpiData[]> {
    const definitions = await this.getKpiDefinitions();
    const results: KpiData[] = [];

    for (const definition of definitions) {
      const values = await this.kpiValueRepository.find({
        where: {
          tenantId,
          kpiDefinitionId: definition.code,
          connectorId: connectorIds[0],
          date: Between(startDate, endDate),
          granularity,
        },
        order: { date: 'DESC' },
      });

      if (values.length > 0) {
        const currentValue = values[0].value;
        const previousValue = values[values.length - 1]?.value || 0;
        const delta = previousValue !== 0
          ? ((currentValue - previousValue) / previousValue) * 100
          : 0;

        results.push({
          code: definition.code,
          name: definition.name,
          value: currentValue,
          previousValue,
          delta,
          unit: definition.unit,
          formatPattern: definition.formatPattern,
        });
      }
    }

    return results;
  }

  /**
   * Get time series data filtered by tenant
   */
  async getTimeSeriesData(
    tenantId: string,
    kpiCode: string,
    connectorIds: string[],
    startDate: Date,
    endDate: Date,
    granularity: Granularity = Granularity.DAY,
  ): Promise<TimeSeriesData[]> {
    const values = await this.kpiValueRepository.find({
      where: {
        tenantId,
        kpiDefinitionId: kpiCode,
        connectorId: connectorIds[0],
        date: Between(startDate, endDate),
        granularity,
      },
      order: { date: 'ASC' },
    });

    return values.map((v) => ({
      date: v.date.toISOString().split('T')[0],
      value: parseFloat(v.value.toString()),
    }));
  }

  /**
   * Overview KPIs grouped by category, filtered by tenant
   */
  async getOverviewKPIs(
    tenantId: string,
    connectorIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const kpis = await this.getKpiValues(tenantId, connectorIds, startDate, endDate);

    const grouped = {
      investment: kpis.filter((k) => ['cost', 'spend'].some((c) => k.code.includes(c))),
      performance: kpis.filter((k) => ['impressions', 'clicks', 'ctr'].some((c) => k.code.includes(c))),
      conversion: kpis.filter((k) => ['conversions', 'purchase'].some((c) => k.code.includes(c))),
      revenue: kpis.filter((k) => ['revenue', 'value'].some((c) => k.code.includes(c))),
    };

    return { kpis, grouped };
  }

  async createKpiDefinition(definition: Partial<KpiDefinition>): Promise<KpiDefinition> {
    const kpi = this.kpiDefinitionRepository.create(definition);
    return this.kpiDefinitionRepository.save(kpi);
  }

  async updateKpiDefinition(
    id: string,
    updates: Partial<KpiDefinition>,
  ): Promise<KpiDefinition> {
    const kpi = await this.kpiDefinitionRepository.findOne({ where: { id } });

    if (!kpi) {
      throw new NotFoundException('KPI definition not found');
    }

    Object.assign(kpi, updates);
    return this.kpiDefinitionRepository.save(kpi);
  }
}
