import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantModule } from './modules/tenants/tenants.module';
import { ConnectorsModule } from './modules/connectors/connectors.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { KpiModule } from './modules/kpi/kpi.module';
import { ExportsModule } from './modules/exports/exports.module';
import { EtlModule } from './modules/etl/etl.module';
import { Tenant } from './entities/tenant.entity';

import { TenantMiddleware } from './common/middleware/tenant.middleware';

import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import googleConfig from './config/google.config';
import metaConfig from './config/meta.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, googleConfig, metaConfig, jwtConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        // If DATABASE_URL is provided (Railway, Render, etc.), use it directly
        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false,
            logging: false,
            ssl: { rejectUnauthorized: false },
          };
        }

        // Fallback to SQLite (local development without Docker)
        return {
          type: 'sqlite' as const,
          database: 'dashcortex.sqlite',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
          logging: configService.get<string>('NODE_ENV') === 'development',
        };
      },
      inject: [ConfigService],
    }),

    // Scheduled Tasks
    ScheduleModule.forRoot(),

    // Feature Modules
    AuthModule,
    TenantModule,
    UsersModule,
    ConnectorsModule,
    AnalyticsModule,
    KpiModule,
    ExportsModule,
    EtlModule,
    TypeOrmModule.forFeature([Tenant]),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
