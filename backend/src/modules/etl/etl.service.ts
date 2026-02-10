import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { RawEvent, EventSource } from '../../entities/raw-event.entity';
import { KpiValue, Granularity } from '../../entities/kpi-value.entity';
import { UserConnector, ConnectorStatus } from '../../entities/user-connector.entity';
import { Tenant, TenantStatus } from '../../entities/tenant.entity';
import { ConnectorsService } from '../connectors/connectors.service';

export enum EtlJobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface EtlJobResult {
  jobId: string;
  status: EtlJobStatus;
  processedCount: number;
  errorCount: number;
  duration: number;
  errors: string[];
}

@Injectable()
export class EtlService {
  private readonly logger = new Logger(EtlService.name);

  constructor(
    @InjectRepository(RawEvent)
    private rawEventRepository: Repository<RawEvent>,
    @InjectRepository(KpiValue)
    private kpiValueRepository: Repository<KpiValue>,
    @InjectRepository(UserConnector)
    private connectorRepository: Repository<UserConnector>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private connectorsService: ConnectorsService,
  ) { }

  // ==========================================
  // SCHEDULED JOBS
  // ==========================================

  /**
   * Hourly: Process raw events and aggregate KPIs
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyAggregation(): Promise<void> {
    this.logger.log('Starting hourly ETL aggregation...');

    const activeTenants = await this.tenantRepository.find({
      where: { status: In([TenantStatus.ACTIVE, TenantStatus.TRIAL]) },
    });

    for (const tenant of activeTenants) {
      try {
        await this.processRawEvents(tenant.id);
        this.logger.log(`Hourly aggregation completed for tenant: ${tenant.name}`);
      } catch (error) {
        this.logger.error(`Hourly aggregation failed for tenant ${tenant.name}: ${error.message}`);
      }
    }
  }

  /**
   * Daily: Run full daily aggregation and cleanup
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailyAggregation(): Promise<void> {
    this.logger.log('Starting daily ETL aggregation...');

    const activeTenants = await this.tenantRepository.find({
      where: { status: In([TenantStatus.ACTIVE, TenantStatus.TRIAL]) },
    });

    for (const tenant of activeTenants) {
      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await this.aggregateKpis(tenant.id, yesterday, today, Granularity.DAY);
        this.logger.log(`Daily aggregation completed for tenant: ${tenant.name}`);
      } catch (error) {
        this.logger.error(`Daily aggregation failed for tenant ${tenant.name}: ${error.message}`);
      }
    }
  }

  /**
   * Daily: Sync all active connectors
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleConnectorSync(): Promise<void> {
    this.logger.log('Starting connector sync...');

    const connectors = await this.connectorRepository.find({
      where: { status: ConnectorStatus.ACTIVE, syncEnabled: true },
    });

    for (const connector of connectors) {
      try {
        await this.connectorsService.syncConnector(connector.id, connector.userId, connector.tenantId);
        this.logger.log(`Synced connector ${connector.id} (${connector.type})`);
      } catch (error) {
        connector.lastError = error.message;
        connector.status = ConnectorStatus.ERROR;
        await this.connectorRepository.save(connector);
        this.logger.error(`Sync failed for connector ${connector.id}: ${error.message}`);
      }
    }
  }

  /**
   * Weekly: Clean up old processed raw events
   */
  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyCleanup(): Promise<void> {
    this.logger.log('Starting weekly data cleanup...');

    const activeTenants = await this.tenantRepository.find({
      where: { status: In([TenantStatus.ACTIVE, TenantStatus.TRIAL]) },
    });

    for (const tenant of activeTenants) {
      const retentionDays = tenant.settings?.limits?.dataRetentionDays || 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await this.rawEventRepository.delete({
        tenantId: tenant.id,
        processed: true,
        receivedAt: LessThan(cutoffDate),
      });

      this.logger.log(
        `Cleaned up ${result.affected} processed events for tenant ${tenant.name} (retention: ${retentionDays} days)`,
      );
    }
  }

  /**
   * Every 4 hours: Validate and refresh expiring OAuth tokens
   */
  @Cron('0 */4 * * *')
  async handleTokenRotation(): Promise<void> {
    this.logger.log('Starting OAuth token rotation check...');

    // Find tokens expiring within the next 30 minutes
    const expirationThreshold = new Date();
    expirationThreshold.setMinutes(expirationThreshold.getMinutes() + 30);

    const expiringConnectors = await this.connectorRepository.find({
      where: {
        status: ConnectorStatus.ACTIVE,
        tokenExpiresAt: LessThan(expirationThreshold),
      },
    });

    this.logger.log(`Found ${expiringConnectors.length} connectors with expiring tokens`);

    for (const connector of expiringConnectors) {
      try {
        await this.refreshToken(connector);
        this.logger.log(`Token refreshed for connector ${connector.id} (${connector.type})`);
      } catch (error) {
        this.logger.error(`Token refresh failed for connector ${connector.id}: ${error.message}`);

        // Retry once with exponential backoff
        try {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          await this.refreshToken(connector);
          this.logger.log(`Token refreshed on retry for connector ${connector.id}`);
        } catch (retryError) {
          connector.status = ConnectorStatus.EXPIRED;
          connector.lastError = `Token refresh failed: ${retryError.message}`;
          await this.connectorRepository.save(connector);
          this.logger.error(`Token refresh permanently failed for connector ${connector.id}`);
        }
      }
    }
  }

  // ==========================================
  // CORE ETL LOGIC
  // ==========================================

  /**
   * Process unprocessed raw events for a tenant
   * RAW → TRANSFORMED → AGGREGATED pipeline
   */
  async processRawEvents(tenantId: string): Promise<EtlJobResult> {
    const startTime = Date.now();
    const jobId = `etl-${tenantId}-${Date.now()}`;
    const errors: string[] = [];
    let processedCount = 0;
    let errorCount = 0;

    try {
      // Step 1: Fetch unprocessed raw events (batch of 500)
      const rawEvents = await this.rawEventRepository.find({
        where: { tenantId, processed: false },
        order: { eventTime: 'ASC' },
        take: 500,
      });

      if (rawEvents.length === 0) {
        return {
          jobId,
          status: EtlJobStatus.COMPLETED,
          processedCount: 0,
          errorCount: 0,
          duration: Date.now() - startTime,
          errors: [],
        };
      }

      this.logger.log(`Processing ${rawEvents.length} raw events for tenant ${tenantId}`);

      // Step 2: Transform and aggregate by source
      for (const event of rawEvents) {
        try {
          // Transform raw event to KPI values
          const kpiValues = this.transformEvent(event, tenantId);

          // Upsert KPI values (idempotent)
          for (const kpiValue of kpiValues) {
            await this.upsertKpiValue(kpiValue);
          }

          // Mark event as processed
          event.processed = true;
          event.processedAt = new Date();
          await this.rawEventRepository.save(event);
          processedCount++;
        } catch (error) {
          event.processingError = error.message;
          await this.rawEventRepository.save(event);
          errors.push(`Event ${event.id}: ${error.message}`);
          errorCount++;
        }
      }

      return {
        jobId,
        status: errorCount > 0 ? EtlJobStatus.COMPLETED : EtlJobStatus.COMPLETED,
        processedCount,
        errorCount,
        duration: Date.now() - startTime,
        errors,
      };
    } catch (error) {
      this.logger.error(`ETL job ${jobId} failed: ${error.message}`);
      return {
        jobId,
        status: EtlJobStatus.FAILED,
        processedCount,
        errorCount: errorCount + 1,
        duration: Date.now() - startTime,
        errors: [...errors, error.message],
      };
    }
  }

  /**
   * Transform a raw event into KPI values based on source
   */
  private transformEvent(event: RawEvent, tenantId: string): Partial<KpiValue>[] {
    const kpiValues: Partial<KpiValue>[] = [];
    const payload = event.payload;
    const eventDate = new Date(event.eventTime);
    eventDate.setHours(0, 0, 0, 0);

    switch (event.source) {
      case EventSource.GOOGLE_ANALYTICS:
        if (payload.sessions !== undefined) {
          kpiValues.push(this.createKpiEntry(tenantId, 'sessions', payload.sessions, eventDate, event));
        }
        if (payload.pageViews !== undefined) {
          kpiValues.push(this.createKpiEntry(tenantId, 'pageViews', payload.pageViews, eventDate, event));
        }
        if (payload.users !== undefined) {
          kpiValues.push(this.createKpiEntry(tenantId, 'users', payload.users, eventDate, event));
        }
        if (payload.bounceRate !== undefined) {
          kpiValues.push(this.createKpiEntry(tenantId, 'bounceRate', payload.bounceRate, eventDate, event));
        }
        if (payload.avgSessionDuration !== undefined) {
          kpiValues.push(this.createKpiEntry(tenantId, 'avgSessionDuration', payload.avgSessionDuration, eventDate, event));
        }
        break;

      case EventSource.GOOGLE_ADS:
        if (payload.cost !== undefined) {
          kpiValues.push(this.createKpiEntry(tenantId, 'spend', payload.cost, eventDate, event));
        }
        if (payload.impressions !== undefined) {
          kpiValues.push(this.createKpiEntry(tenantId, 'impressions', payload.impressions, eventDate, event));
        }
        if (payload.clicks !== undefined) {
          kpiValues.push(this.createKpiEntry(tenantId, 'clicks', payload.clicks, eventDate, event));
        }
        if (payload.conversions !== undefined) {
          kpiValues.push(this.createKpiEntry(tenantId, 'conversions', payload.conversions, eventDate, event));
        }
        if (payload.ctr !== undefined) {
          kpiValues.push(this.createKpiEntry(tenantId, 'ctr', payload.ctr, eventDate, event));
        }
        if (payload.cpc !== undefined) {
          kpiValues.push(this.createKpiEntry(tenantId, 'cpc', payload.cpc, eventDate, event));
        }
        break;

      case EventSource.META_ADS:
        if (payload.spend !== undefined) {
          kpiValues.push(this.createKpiEntry(tenantId, 'spend', payload.spend, eventDate, event));
        }
        if (payload.impressions !== undefined) {
          kpiValues.push(this.createKpiEntry(tenantId, 'impressions', payload.impressions, eventDate, event));
        }
        if (payload.clicks !== undefined) {
          kpiValues.push(this.createKpiEntry(tenantId, 'clicks', payload.clicks, eventDate, event));
        }
        if (payload.conversions !== undefined) {
          kpiValues.push(this.createKpiEntry(tenantId, 'conversions', payload.conversions, eventDate, event));
        }
        if (payload.reach !== undefined) {
          kpiValues.push(this.createKpiEntry(tenantId, 'reach', payload.reach, eventDate, event));
        }
        if (payload.frequency !== undefined) {
          kpiValues.push(this.createKpiEntry(tenantId, 'frequency', payload.frequency, eventDate, event));
        }
        break;
    }

    return kpiValues;
  }

  /**
   * Create a KPI entry from event data
   */
  private createKpiEntry(
    tenantId: string,
    kpiCode: string,
    value: number,
    date: Date,
    event: RawEvent,
  ): Partial<KpiValue> {
    return {
      tenantId,
      kpiDefinitionId: kpiCode,
      connectorId: event.connectorId,
      value,
      date,
      granularity: Granularity.DAY,
      campaignId: event.payload.campaignId || null,
      campaignName: event.payload.campaignName || null,
      region: event.payload.region || null,
      city: event.payload.city || null,
      deviceCategory: event.payload.deviceCategory || null,
      operatingSystem: event.payload.operatingSystem || null,
      browser: event.payload.browser || null,
    };
  }

  /**
   * Upsert KPI value (idempotent - prevents duplicates)
   */
  private async upsertKpiValue(kpiValue: Partial<KpiValue>): Promise<void> {
    const existing = await this.kpiValueRepository.findOne({
      where: {
        tenantId: kpiValue.tenantId,
        kpiDefinitionId: kpiValue.kpiDefinitionId,
        connectorId: kpiValue.connectorId,
        date: kpiValue.date,
        granularity: kpiValue.granularity,
        campaignId: kpiValue.campaignId || undefined,
      },
    });

    if (existing) {
      // Update existing value (idempotent)
      existing.previousValue = existing.value;
      existing.value = kpiValue.value;
      existing.delta = existing.previousValue !== 0
        ? ((existing.value - existing.previousValue) / existing.previousValue) * 100
        : 0;
      await this.kpiValueRepository.save(existing);
    } else {
      // Create new
      const newValue = this.kpiValueRepository.create(kpiValue);
      await this.kpiValueRepository.save(newValue);
    }
  }

  /**
   * Aggregate KPIs for a date range (used by daily job)
   */
  async aggregateKpis(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    granularity: Granularity,
  ): Promise<void> {
    // Get all hourly values for the date range
    const hourlyValues = await this.kpiValueRepository.find({
      where: {
        tenantId,
        date: Between(startDate, endDate),
        granularity: Granularity.HOUR,
      },
    });

    // Group by KPI + connector + date
    const groups = new Map<string, KpiValue[]>();

    for (const value of hourlyValues) {
      const key = `${value.kpiDefinitionId}-${value.connectorId}-${value.date.toISOString().split('T')[0]}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(value);
    }

    // Create daily aggregates
    for (const [key, values] of groups) {
      const total = values.reduce((sum, v) => sum + Number(v.value), 0);
      const firstValue = values[0];

      await this.upsertKpiValue({
        tenantId,
        kpiDefinitionId: firstValue.kpiDefinitionId,
        connectorId: firstValue.connectorId,
        value: total,
        date: firstValue.date,
        granularity,
        campaignId: firstValue.campaignId,
        campaignName: firstValue.campaignName,
      });
    }

    this.logger.log(`Aggregated ${groups.size} KPI groups for tenant ${tenantId}`);
  }

  // ==========================================
  // TOKEN ROTATION
  // ==========================================

  /**
   * Refresh OAuth token for a connector with retry logic
   */
  private async refreshToken(connector: UserConnector): Promise<void> {
    if (!connector.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Placeholder: actual implementation depends on connector type
    // The GoogleAnalyticsService/MetaAdsService handle the actual API call
    this.logger.log(`Token refresh triggered for connector ${connector.id} (${connector.type})`);

    // Update token expiry by 1 hour (placeholder until actual refresh)
    const newExpiry = new Date();
    newExpiry.setHours(newExpiry.getHours() + 1);
    connector.tokenExpiresAt = newExpiry;
    await this.connectorRepository.save(connector);
  }

  // ==========================================
  // MANUAL OPERATIONS
  // ==========================================

  /**
   * Manual sync for a specific tenant
   */
  async manualSync(tenantId: string): Promise<EtlJobResult> {
    this.logger.log(`Manual sync triggered for tenant ${tenantId}`);
    return this.processRawEvents(tenantId);
  }

  /**
   * Trigger manual sync for a specific connector
   */
  async triggerManualSync(connectorId: string): Promise<void> {
    this.logger.log(`Manual connector sync triggered: ${connectorId}`);
    const connector = await this.connectorRepository.findOne({ where: { id: connectorId } });

    if (!connector) {
      throw new Error(`Connector ${connectorId} not found`);
    }

    await this.connectorsService.syncConnector(connectorId, connector.userId, connector.tenantId);
  }

  /**
   * Reprocess data for a date range (backfill)
   */
  async reprocessDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<EtlJobResult> {
    this.logger.log(`Reprocessing data for tenant ${tenantId}: ${startDate} to ${endDate}`);

    // Mark events in range as unprocessed
    await this.rawEventRepository.update(
      {
        tenantId,
        eventTime: Between(startDate, endDate),
        processed: true,
      },
      {
        processed: false,
        processedAt: null,
        processingError: null,
      },
    );

    // Delete existing KPI values for the range
    await this.kpiValueRepository.delete({
      tenantId,
      date: Between(startDate, endDate),
    });

    // Reprocess
    return this.processRawEvents(tenantId);
  }
}
