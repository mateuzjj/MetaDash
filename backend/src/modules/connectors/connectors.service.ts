import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserConnector, ConnectorType, ConnectorStatus } from '../../entities/user-connector.entity';
import { GoogleAnalyticsService } from './services/google-analytics.service';
import { GoogleAdsService } from './services/google-ads.service';
import { MetaAdsService } from './services/meta-ads.service';

export interface ConnectorStatusInfo {
  id: string;
  type: ConnectorType;
  accountName: string;
  status: ConnectorStatus;
  lastSyncAt: Date | null;
  isTokenExpired: boolean;
}

@Injectable()
export class ConnectorsService {
  constructor(
    @InjectRepository(UserConnector)
    private connectorRepository: Repository<UserConnector>,
    private googleAnalyticsService: GoogleAnalyticsService,
    private googleAdsService: GoogleAdsService,
    private metaAdsService: MetaAdsService,
  ) { }

  async getUserConnectors(userId: string, tenantId: string): Promise<ConnectorStatusInfo[]> {
    const connectors = await this.connectorRepository.find({
      where: { userId, tenantId },
      order: { createdAt: 'DESC' },
    });

    return connectors.map((connector) => ({
      id: connector.id,
      type: connector.type,
      accountName: connector.accountName,
      status: connector.status,
      lastSyncAt: connector.lastSyncAt,
      isTokenExpired: connector.isTokenExpired(),
    }));
  }

  async getConnectorById(connectorId: string, userId: string, tenantId: string): Promise<UserConnector> {
    const connector = await this.connectorRepository.findOne({
      where: { id: connectorId, userId, tenantId },
    });

    if (!connector) {
      throw new NotFoundException('Connector not found');
    }

    return connector;
  }

  async revokeConnector(connectorId: string, userId: string, tenantId: string): Promise<void> {
    const connector = await this.getConnectorById(connectorId, userId, tenantId);
    connector.status = ConnectorStatus.REVOKED;
    await this.connectorRepository.save(connector);
  }

  async syncConnector(connectorId: string, userId: string, tenantId: string): Promise<void> {
    const connector = await this.getConnectorById(connectorId, userId, tenantId);

    if (connector.isTokenExpired()) {
      await this.refreshConnectorToken(connector);
    }

    switch (connector.type) {
      case ConnectorType.GOOGLE_ANALYTICS:
        await this.googleAnalyticsService.syncData(connector);
        break;
      case ConnectorType.GOOGLE_ADS:
        await this.googleAdsService.syncData(connector);
        break;
      case ConnectorType.META_ADS:
        await this.metaAdsService.syncData(connector);
        break;
      default:
        throw new Error(`Unsupported connector type: ${connector.type}`);
    }

    connector.lastSyncAt = new Date();
    await this.connectorRepository.save(connector);
  }

  private async refreshConnectorToken(connector: UserConnector): Promise<void> {
    switch (connector.type) {
      case ConnectorType.GOOGLE_ANALYTICS:
      case ConnectorType.GOOGLE_ADS:
        const tokens = await this.googleAnalyticsService.refreshToken(
          connector.refreshToken,
        );
        connector.accessToken = tokens.accessToken;
        connector.refreshToken = tokens.refreshToken;
        connector.tokenExpiresAt = tokens.expiresAt;
        break;
      case ConnectorType.META_ADS:
        const metaTokens = await this.metaAdsService.refreshToken(
          connector.refreshToken,
        );
        connector.accessToken = metaTokens.accessToken;
        connector.tokenExpiresAt = metaTokens.expiresAt;
        break;
    }

    await this.connectorRepository.save(connector);
  }

  async syncAllUserConnectors(userId: string, tenantId: string): Promise<{ success: number; failed: number }> {
    const connectors = await this.connectorRepository.find({
      where: { userId, tenantId, status: ConnectorStatus.ACTIVE, syncEnabled: true },
    });

    let success = 0;
    let failed = 0;

    for (const connector of connectors) {
      try {
        await this.syncConnector(connector.id, userId, tenantId);
        success++;
      } catch (error) {
        connector.lastError = error.message;
        connector.status = ConnectorStatus.ERROR;
        await this.connectorRepository.save(connector);
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * Get all connectors for a tenant (used by ETL/admin)
   */
  async getTenantConnectors(tenantId: string): Promise<UserConnector[]> {
    return this.connectorRepository.find({
      where: { tenantId, status: ConnectorStatus.ACTIVE, syncEnabled: true },
    });
  }
}
