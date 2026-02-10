import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

export enum Granularity {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

@Entity('kpi_values')
@Index(['tenantId', 'kpiDefinitionId', 'connectorId', 'date', 'granularity'], { unique: true })
export class KpiValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  @Column({ name: 'kpi_definition_id' })
  kpiDefinitionId: string;

  @Column({ name: 'connector_id' })
  connectorId: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  value: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  previousValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  delta: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: Granularity,
    default: Granularity.DAY,
  })
  granularity: Granularity;

  @Column({ name: 'campaign_id', nullable: true })
  campaignId: string;

  @Column({ name: 'campaign_name', nullable: true })
  campaignName: string;

  @Column({ name: 'adset_id', nullable: true })
  adsetId: string;

  @Column({ name: 'ad_id', nullable: true })
  adId: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  city: string;

  @Column({ name: 'device_category', nullable: true })
  deviceCategory: string;

  @Column({ name: 'operating_system', nullable: true })
  operatingSystem: string;

  @Column({ name: 'browser', nullable: true })
  browser: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
