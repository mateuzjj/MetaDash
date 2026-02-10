import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserConnector } from '../../../entities/user-connector.entity';
import { KpiValue, Granularity } from '../../../entities/kpi-value.entity';
import { Campaign, CampaignSource, CampaignStatus } from '../../../entities/campaign.entity';

export interface MetaTokens {
  accessToken: string;
  expiresAt: Date;
}

@Injectable()
export class MetaAdsService {
  private readonly logger = new Logger(MetaAdsService.name);
  private readonly apiVersion: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(KpiValue)
    private kpiValueRepository: Repository<KpiValue>,
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
  ) {
    this.apiVersion = this.configService.get('meta.apiVersion', 'v18.0');
  }

  async refreshToken(refreshToken: string): Promise<MetaTokens> {
    // Meta uses long-lived tokens, typically valid for 60 days
    // For refresh, we need to exchange the token
    const appId = this.configService.get('meta.appId');
    const appSecret = this.configService.get('meta.appSecret');

    const response = await fetch(
      `https://graph.facebook.com/${this.apiVersion}/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${appId}&` +
        `client_secret=${appSecret}&` +
        `fb_exchange_token=${refreshToken}`,
    );

    if (!response.ok) {
      throw new Error('Failed to refresh Meta token');
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  async syncData(connector: UserConnector): Promise<void> {
    this.logger.log(`Syncing Meta Ads data for connector ${connector.id}`);

    // Sync campaigns
    await this.syncCampaigns(connector);

    // Sync insights
    await this.syncInsights(connector);

    // Sync adsets
    await this.syncAdSets(connector);
  }

  private async syncCampaigns(connector: UserConnector): Promise<void> {
    const accountId = connector.accountId;

    try {
      const response = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${accountId}/campaigns?` +
          `fields=id,name,status,daily_budget,lifetime_budget,start_time,end_time,objective&` +
          `access_token=${connector.accessToken}`,
      );

      if (!response.ok) {
        throw new Error(`Meta API error: ${response.statusText}`);
      }

      const data = await response.json();

      for (const campaign of data.data || []) {
        await this.saveCampaign(campaign, connector.id);
      }

      this.logger.log(`Synced ${data.data?.length || 0} Meta campaigns`);
    } catch (error) {
      this.logger.error(`Failed to sync Meta campaigns: ${error.message}`);
      throw error;
    }
  }

  private async saveCampaign(campaignData: any, connectorId: string): Promise<void> {
    let campaign = await this.campaignRepository.findOne({
      where: {
        externalId: campaignData.id,
        source: CampaignSource.META_ADS,
      },
    });

    const statusMap: Record<string, CampaignStatus> = {
      'ACTIVE': CampaignStatus.ENABLED,
      'PAUSED': CampaignStatus.PAUSED,
      'DELETED': CampaignStatus.REMOVED,
      'ARCHIVED': CampaignStatus.REMOVED,
    };

    const dailyBudget = campaignData.daily_budget
      ? parseInt(campaignData.daily_budget) / 100
      : null;

    if (campaign) {
      campaign.name = campaignData.name;
      campaign.status = statusMap[campaignData.status] || CampaignStatus.PAUSED;
      campaign.dailyBudget = dailyBudget;
      campaign.startDate = campaignData.start_time
        ? new Date(campaignData.start_time)
        : null;
      campaign.endDate = campaignData.end_time
        ? new Date(campaignData.end_time)
        : null;
      campaign.lastSyncAt = new Date();
    } else {
      campaign = this.campaignRepository.create({
        externalId: campaignData.id,
        connectorId,
        source: CampaignSource.META_ADS,
        name: campaignData.name,
        status: statusMap[campaignData.status] || CampaignStatus.PAUSED,
        dailyBudget,
        startDate: campaignData.start_time
          ? new Date(campaignData.start_time)
          : null,
        endDate: campaignData.end_time
          ? new Date(campaignData.end_time)
          : null,
      });
    }

    await this.campaignRepository.save(campaign);
  }

  private async syncInsights(connector: UserConnector): Promise<void> {
    const accountId = connector.accountId;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    try {
      const response = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${accountId}/insights?` +
          `fields=campaign_id,campaign_name,spend,impressions,clicks,conversions,` +
          `conversion_values,cpc,cpm,ctr,actions&` +
          `time_range={'since':'${this.formatDate(startDate)}','until':'${this.formatDate(endDate)}'}&` +
          `time_increment=1&` +
          `access_token=${connector.accessToken}`,
      );

      if (!response.ok) {
        throw new Error(`Meta API error: ${response.statusText}`);
      }

      const data = await response.json();

      for (const insight of data.data || []) {
        await this.saveInsight(insight, connector.id);
      }

      this.logger.log(`Synced ${data.data?.length || 0} Meta insights`);
    } catch (error) {
      this.logger.error(`Failed to sync Meta insights: ${error.message}`);
      throw error;
    }
  }

  private async saveInsight(insight: any, connectorId: string): Promise<void> {
    const date = insight.date_start;

    const purchases = insight.actions?.find(
      (a: any) => a.action_type === 'purchase',
    );
    const purchaseValue = insight.action_values?.find(
      (a: any) => a.action_type === 'purchase',
    );

    const metricsData = [
      { code: 'spend', value: parseFloat(insight.spend) || 0 },
      { code: 'impressions', value: parseInt(insight.impressions) || 0 },
      { code: 'clicks', value: parseInt(insight.clicks) || 0 },
      { code: 'conversions', value: parseFloat(insight.conversions) || 0 },
      { code: 'purchases', value: purchases ? parseInt(purchases.value) : 0 },
      { code: 'purchaseValue', value: purchaseValue ? parseFloat(purchaseValue.value) : 0 },
      { code: 'cpc', value: parseFloat(insight.cpc) || 0 },
      { code: 'cpm', value: parseFloat(insight.cpm) || 0 },
      { code: 'ctr', value: parseFloat(insight.ctr) || 0 },
    ];

    for (const metric of metricsData) {
      const kpiValue = this.kpiValueRepository.create({
        kpiDefinitionId: metric.code,
        connectorId,
        value: metric.value,
        date: new Date(date),
        granularity: Granularity.DAY,
        campaignId: insight.campaign_id,
        campaignName: insight.campaign_name,
      });

      await this.kpiValueRepository.save(kpiValue);
    }
  }

  private async syncAdSets(connector: UserConnector): Promise<void> {
    const accountId = connector.accountId;

    try {
      const response = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${accountId}/adsets?` +
          `fields=id,name,campaign{id,name},status,daily_budget,lifetime_budget,targeting&` +
          `access_token=${connector.accessToken}`,
      );

      if (!response.ok) {
        throw new Error(`Meta API error: ${response.statusText}`);
      }

      const data = await response.json();
      this.logger.log(`Synced ${data.data?.length || 0} Meta adsets`);
    } catch (error) {
      this.logger.error(`Failed to sync Meta adsets: ${error.message}`);
    }
  }

  async getFunnelData(
    connector: UserConnector,
    campaignId?: string,
  ): Promise<any> {
    const accountId = connector.accountId;

    let url =
      `https://graph.facebook.com/${this.apiVersion}/${accountId}/insights?` +
      `fields=actions,action_values&` +
      `date_preset=last_30d&` +
      `access_token=${connector.accessToken}`;

    if (campaignId) {
      url += `&filtering=[{'field':'campaign.id','operator':'EQUALS','value':'${campaignId}'}]`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Meta API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getDemographicsData(
    connector: UserConnector,
    breakdown: 'age' | 'gender' | 'country' | 'region',
  ): Promise<any> {
    const accountId = connector.accountId;

    const response = await fetch(
      `https://graph.facebook.com/${this.apiVersion}/${accountId}/insights?` +
        `fields=impressions,clicks,spend,conversions&` +
        `breakdowns=${breakdown}&` +
        `date_preset=last_30d&` +
        `access_token=${connector.accessToken}`,
    );

    if (!response.ok) {
      throw new Error(`Meta API error: ${response.statusText}`);
    }

    return response.json();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
