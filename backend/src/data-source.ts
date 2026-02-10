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
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'dashcortex',
    entities: [User, Tenant, UserConnector, KpiValue, RawEvent, Campaign],
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
});
