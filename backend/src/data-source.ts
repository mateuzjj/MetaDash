import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './entities/user.entity';
import { Tenant } from './entities/tenant.entity';
import { UserConnector } from './entities/user-connector.entity';
import { KpiValue } from './entities/kpi-value.entity';
import { RawEvent } from './entities/raw-event.entity';
import { Campaign } from './entities/campaign.entity';

dotenv.config();

export const AppDataSource = new DataSource({
    type: process.env.DATABASE_URL ? 'postgres' : 'sqlite',
    url: process.env.DATABASE_URL,
    database: process.env.DATABASE_URL ? undefined : 'dashcortex.sqlite',
    entities: ['src/**/*.entity{.ts,.js}'],
    migrations: ['src/migrations/*{.ts,.js}'],
    synchronize: false,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});
