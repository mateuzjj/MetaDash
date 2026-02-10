import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google } from 'googleapis';

import { UserConnector } from '../../../entities/user-connector.entity';
import { KpiValue, Granularity } from '../../../entities/kpi-value.entity';
import { Campaign, CampaignSource, CampaignStatus } from '../../../entities/campaign.entity';

export interface GoogleAdsTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

@Injectable()
export class GoogleAdsService {
  private readonly logger = new Logger(GoogleAdsService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(KpiValue)
    private kpiValueRepository: Repository<KpiValue>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
  ) {}

  async refreshToken(refreshToken: string): Promise<GoogleAdsTokens> {
    const auth = new google.auth.OAuth2(
      this.configService.get('google.clientId'),
      this.configService.get('google.clientSecret'),
      this.configService.get('google.redirectUri'),
    );

    auth.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await auth.refreshAccessToken();

    return {
      accessToken: credentials.access_token,
      refreshToken: credentials.refresh_token || refreshToken,
      expiresAt: new Date(credentials.expiry_date),
    };
  }

  async syncData(connector: UserConnector): Promise<void> {
    this.logger.log(`Syncing Google Ads data for connector ${connector.id}`);

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: connector.accessToken });

    // Sync campaigns
    await this.syncCampaigns(connector, auth);

    // Sync performance metrics
    await this.syncPerformanceMetrics(connector, auth);
  }

  private async syncCampaigns(
    connector: UserConnector,
    auth: any,
  ): Promise<void> {
    const customerId = connector.accountId;
    const developerToken = this.configService.get('GOOGLE_ADS_DEVELOPER_TOKEN');

    try {
      // Use Google Ads API via REST
      const response = await fetch(
        `https://googleads.googleapis.com/v14/customers/${customerId}/googleAds:searchStream`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${connector.accessToken}`,
            'developer-token': developerToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              SELECT
                campaign.id,
                campaign.name,
                campaign.status,
                campaign.advertising_channel_type,
                campaign.start_date,
                campaign.end_date,
                campaign_budget.amount_micros
              FROM campaign
              WHERE campaign.status != 'REMOVED'
            `,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Google Ads API error: ${response.statusText}`);
      }

      const data = await response.json();

      for (const row of data.results || []) {
        await this.saveCampaign(row, connector.id);
      }

      this.logger.log(`Synced ${data.results?.length || 0} campaigns`);
    } catch (error) {
      this.logger.error(`Failed to sync campaigns: ${error.message}`);
      throw error;
    }
  }

  private async saveCampaign(row: any, connectorId: string): Promise<void> {
    const campaignData = row.campaign;
    const budgetData = row.campaignBudget;

    let campaign = await this.campaignRepository.findOne({
      where: {
        externalId: campaignData.id,
        source: CampaignSource.GOOGLE_ADS,
      },
    });

    const statusMap: Record<string, CampaignStatus> = {
      'ENABLED': CampaignStatus.ENABLED,
      'PAUSED': CampaignStatus.PAUSED,
      'REMOVED': CampaignStatus.REMOVED,
    };

    if (campaign) {
      campaign.name = campaignData.name;
      campaign.status = statusMap[campaignData.status] || CampaignStatus.PAUSED;
      campaign.dailyBudget = budgetData?.amountMicros
        ? parseInt(budgetData.amountMicros) / 1000000
        : null;
      campaign.startDate = campaignData.startDate
        ? new Date(campaignData.startDate)
        : null;
      campaign.endDate = campaignData.endDate
        ? new Date(campaignData.endDate)
        : null;
      campaign.lastSyncAt = new Date();
    } else {
      campaign = this.campaignRepository.create({
        externalId: campaignData.id,
        connectorId,
        source: CampaignSource.GOOGLE_ADS,
        name: campaignData.name,
        status: statusMap[campaignData.status] || CampaignStatus.PAUSED,
        dailyBudget: budgetData?.amountMicros
          ? parseInt(budgetData.amountMicros) / 1000000
          : null,
        startDate: campaignData.startDate
          ? new Date(campaignData.startDate)
          : null,
        endDate: campaignData.endDate
          ? new Date(campaignData.endDate)
          : null,
      });
    }

    await this.campaignRepository.save(campaign);
  }

  private async syncPerformanceMetrics(
    connector: UserConnector,
    auth: any,
  ): Promise<void> {
    const customerId = connector.accountId;
    const developerToken = this.configService.get('GOOGLE_ADS_DEVELOPER_TOKEN');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    try {
      const response = await fetch(
        `https://googleads.googleapis.com/v14/customers/${customerId}/googleAds:searchStream`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${connector.accessToken}`,
            'developer-token': developerToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              SELECT
                segments.date,
                campaign.id,
                campaign.name,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros,
                metrics.conversions,
                metrics.conversions_value
              FROM campaign
              WHERE segments.date >= '${startDate.toISOString().split('T')[0]}'
                AND segments.date <= '${endDate.toISOString().split('T')[0]}'
            `,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Google Ads API error: ${response.statusText}`);
      }

      const data = await response.json();

      for (const row of data.results || []) {
        await this.savePerformanceMetrics(row, connector.id);
      }

      this.logger.log(`Synced ${data.results?.length || 0} performance rows`);
    } catch (error) {
      this.logger.error(`Failed to sync performance metrics: ${error.message}`);
      throw error;
    }
  }

  private async savePerformanceMetrics(row: any, connectorId: string): Promise<void> {
    const date = row.segments?.date;
    const metrics = row.metrics;
    const campaign = row.campaign;

    if (!date || !metrics) return;

    const metricsData = [
      {
        code: 'impressions',
        value: parseInt(metrics.impressions) || 0,
      },
      {
        code: 'clicks',
        value: parseInt(metrics.clicks) || 0,
      },
      {
        code: 'cost',
        value: metrics.costMicros ? parseInt(metrics.costMicros) / 1000000 : 0,
      },
      {
        code: 'conversions',
        value: parseFloat(metrics.conversions) || 0,
      },
      {
        code: 'conversionValue',
        value: parseFloat(metrics.conversionsValue) || 0,
      },
    ];

    for (const metric of metricsData) {
      const kpiValue = this.kpiValueRepository.create({
        kpiDefinitionId: metric.code,
        connectorId,
        value: metric.value,
        date: new Date(date),
        granularity: Granularity.DAY,
        campaignId: campaign?.id,
        campaignName: campaign?.name,
      });

      await this.kpiValueRepository.save(kpiValue);
    }
  }

  async getKeywordsData(
    connector: UserConnector,
    campaignId?: string,
  ): Promise<any> {
    const customerId = connector.accountId;
    const developerToken = this.configService.get('GOOGLE_ADS_DEVELOPER_TOKEN');

    let query = `
      SELECT
        ad_group_criterion.criterion_id,
        ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM keyword_view
      WHERE segments.date DURING LAST_30_DAYS
    `;

    if (campaignId) {
      query += ` AND campaign.id = '${campaignId}'`;
    }

    const response = await fetch(
      `https://googleads.googleapis.com/v14/customers/${customerId}/googleAds:searchStream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${connector.accessToken}`,
          'developer-token': developerToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      },
    );

    if (!response.ok) {
      throw new Error(`Google Ads API error: ${response.statusText}`);
    }

    return response.json();
  }
}
