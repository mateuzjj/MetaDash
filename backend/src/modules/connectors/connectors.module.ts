import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectorsService } from './connectors.service';
import { ConnectorsController } from './connectors.controller';
import { GoogleAnalyticsService } from './services/google-analytics.service';
import { GoogleAdsService } from './services/google-ads.service';
import { MetaAdsService } from './services/meta-ads.service';
import { UserConnector } from '../../entities/user-connector.entity';
import { KpiValue } from '../../entities/kpi-value.entity';
import { RawEvent } from '../../entities/raw-event.entity';
import { Campaign } from '../../entities/campaign.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([UserConnector, KpiValue, RawEvent, Campaign]),
  ],
  controllers: [ConnectorsController],
  providers: [
    ConnectorsService,
    GoogleAnalyticsService,
    GoogleAdsService,
    MetaAdsService,
  ],
  exports: [
    ConnectorsService,
    GoogleAnalyticsService,
    GoogleAdsService,
    MetaAdsService,
  ],
})
export class ConnectorsModule { }
