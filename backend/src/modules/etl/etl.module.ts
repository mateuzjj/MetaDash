import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { EtlService } from './etl.service';
import { EtlController } from './etl.controller';
import { RawEvent } from '../../entities/raw-event.entity';
import { KpiValue } from '../../entities/kpi-value.entity';
import { UserConnector } from '../../entities/user-connector.entity';
import { Tenant } from '../../entities/tenant.entity';
import { ConnectorsModule } from '../connectors/connectors.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([RawEvent, KpiValue, UserConnector, Tenant]),
    ConnectorsModule,
  ],
  controllers: [EtlController],
  providers: [EtlService],
  exports: [EtlService],
})
export class EtlModule { }
