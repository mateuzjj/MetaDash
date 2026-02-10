import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CampaignStatus {
  ENABLED = 'enabled',
  PAUSED = 'paused',
  REMOVED = 'removed',
}

export enum CampaignSource {
  GOOGLE_ADS = 'google_ads',
  META_ADS = 'meta_ads',
}

@Entity('campaigns')
@Index(['tenantId', 'source', 'externalId'], { unique: true })
@Index(['tenantId', 'connectorId', 'status'])
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  @Column({ name: 'external_id' })
  externalId: string;

  @Column({ name: 'connector_id' })
  connectorId: string;

  @Column({
    type: 'enum',
    enum: CampaignSource,
  })
  source: CampaignSource;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.ENABLED,
  })
  status: CampaignStatus;

  @Column({ name: 'daily_budget', type: 'decimal', precision: 12, scale: 2, nullable: true })
  dailyBudget: number;

  @Column({ name: 'total_budget', type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalBudget: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'targeting_info', type: 'jsonb', nullable: true })
  targetingInfo: Record<string, any>;

  @Column({ name: 'last_sync_at', nullable: true })
  lastSyncAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
