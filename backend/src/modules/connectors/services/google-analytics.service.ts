import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google, analyticsdata_v1beta } from 'googleapis';

import { UserConnector } from '../../../entities/user-connector.entity';
import { KpiValue, Granularity } from '../../../entities/kpi-value.entity';
import { RawEvent, EventSource } from '../../../entities/raw-event.entity';

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface GA4Metric {
  name: string;
  value: number;
}

export interface GA4Dimension {
  name: string;
  value: string;
}

@Injectable()
export class GoogleAnalyticsService {
  private readonly logger = new Logger(GoogleAnalyticsService.name);
  private analyticsData: analyticsdata_v1beta.Analyticsdata;

  constructor(
    private configService: ConfigService,
    @InjectRepository(KpiValue)
    private kpiValueRepository: Repository<KpiValue>,
    @InjectRepository(RawEvent)
    private rawEventRepository: Repository<RawEvent>,
  ) {
    const auth = new google.auth.OAuth2(
      this.configService.get('google.clientId'),
      this.configService.get('google.clientSecret'),
      this.configService.get('google.redirectUri'),
    );

    this.analyticsData = new analyticsdata_v1beta.Analyticsdata({ auth });
  }

  async refreshToken(refreshToken: string): Promise<GoogleTokens> {
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
    this.logger.log(`Syncing Google Analytics data for connector ${connector.id}`);

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: connector.accessToken });

    const analyticsData = new analyticsdata_v1beta.Analyticsdata({ auth });

    // Get property IDs from connector or fetch all available
    const propertyIds = connector.propertyIds || [
      await this.getDefaultPropertyId(auth),
    ];

    for (const propertyId of propertyIds) {
      await this.syncPropertyData(analyticsData, propertyId, connector);
    }
  }

  private async getDefaultPropertyId(auth: any): Promise<string> {
    const analyticsAdmin = google.analyticsadmin({ version: 'v1alpha', auth });
    const response = await analyticsAdmin.properties.list({
      filter: 'propertyType=PROPERTY_TYPE_ORDINARY',
    });

    if (!response.data.properties || response.data.properties.length === 0) {
      throw new Error('No Google Analytics 4 properties found');
    }

    return response.data.properties[0].name.split('/')[1];
  }

  private async syncPropertyData(
    analyticsData: analyticsdata_v1beta.Analyticsdata,
    propertyId: string,
    connector: UserConnector,
  ): Promise<void> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days

    const dateRange = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };

    // Fetch key metrics
    const metrics = [
      { name: 'sessions' },
      { name: 'totalUsers' },
      { name: 'newUsers' },
      { name: 'screenPageViews' },
      { name: 'engagementRate' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
    ];

    const dimensions = [
      { name: 'date' },
    ];

    try {
      const response = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [dateRange],
          metrics,
          dimensions,
        },
      });

      if (response.data.rows) {
        for (const row of response.data.rows) {
          await this.saveMetrics(row, connector.id, propertyId);
        }
      }

      this.logger.log(`Synced ${response.data.rows?.length || 0} rows for property ${propertyId}`);
    } catch (error) {
      this.logger.error(`Failed to sync property ${propertyId}: ${error.message}`);
      throw error;
    }
  }

  private async saveMetrics(
    row: any,
    connectorId: string,
    propertyId: string,
  ): Promise<void> {
    const date = row.dimensionValues[0].value;
    const metricValues = row.metricValues;

    const metrics = [
      { code: 'sessions', value: parseFloat(metricValues[0].value) },
      { code: 'totalUsers', value: parseFloat(metricValues[1].value) },
      { code: 'newUsers', value: parseFloat(metricValues[2].value) },
      { code: 'pageViews', value: parseFloat(metricValues[3].value) },
      { code: 'engagementRate', value: parseFloat(metricValues[4].value) },
      { code: 'avgSessionDuration', value: parseFloat(metricValues[5].value) },
      { code: 'bounceRate', value: parseFloat(metricValues[6].value) },
    ];

    for (const metric of metrics) {
      const kpiValue = this.kpiValueRepository.create({
        kpiDefinitionId: metric.code,
        connectorId,
        value: metric.value,
        date: new Date(date),
        granularity: Granularity.DAY,
      });

      await this.kpiValueRepository.save(kpiValue);
    }
  }

  async getRealtimeData(connector: UserConnector): Promise<any> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: connector.accessToken });

    const analyticsData = new analyticsdata_v1beta.Analyticsdata({ auth });

    const propertyId = connector.propertyIds?.[0];
    if (!propertyId) {
      throw new Error('No property ID configured');
    }

    try {
      const response = await analyticsData.properties.runRealtimeReport({
        property: `properties/${propertyId}`,
        requestBody: {
          metrics: [
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
          ],
          dimensions: [
            { name: 'minutesAgo' },
          ],
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get realtime data: ${error.message}`);
      throw error;
    }
  }

  async getAudienceData(connector: UserConnector, startDate: Date, endDate: Date): Promise<any> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: connector.accessToken });

    const analyticsData = new analyticsdata_v1beta.Analyticsdata({ auth });

    const propertyId = connector.propertyIds?.[0];
    if (!propertyId) {
      throw new Error('No property ID configured');
    }

    const response = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'newUsers' },
          { name: 'returningUsers' },
        ],
        dimensions: [
          { name: 'country' },
          { name: 'region' },
          { name: 'city' },
          { name: 'deviceCategory' },
          { name: 'operatingSystem' },
        ],
      },
    });

    return response.data;
  }

  async getAcquisitionData(connector: UserConnector, startDate: Date, endDate: Date): Promise<any> {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: connector.accessToken });

    const analyticsData = new analyticsdata_v1beta.Analyticsdata({ auth });

    const propertyId = connector.propertyIds?.[0];
    if (!propertyId) {
      throw new Error('No property ID configured');
    }

    const response = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
        ],
        dimensions: [
          { name: 'sessionDefaultChannelGroup' },
          { name: 'sessionSource' },
          { name: 'sessionMedium' },
        ],
      },
    });

    return response.data;
  }
}
