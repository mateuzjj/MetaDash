import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

export enum EventSource {
  GOOGLE_ANALYTICS = 'google_analytics',
  GOOGLE_ADS = 'google_ads',
  META_ADS = 'meta_ads',
}

@Entity('raw_events')
@Index(['tenantId', 'source', 'receivedAt'])
@Index(['tenantId', 'source', 'externalId'])
@Index(['tenantId', 'processed'])
export class RawEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  @Column({
    type: 'enum',
    enum: EventSource,
  })
  source: EventSource;

  @Column({ name: 'external_id' })
  externalId: string;

  @Column({ name: 'connector_id' })
  connectorId: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ name: 'event_type', nullable: true })
  eventType: string;

  @Column({ name: 'event_time', type: 'timestamp' })
  eventTime: Date;

  @Column({ name: 'received_at', type: 'timestamp' })
  receivedAt: Date;

  @Column({ name: 'processed', default: false })
  processed: boolean;

  @Column({ name: 'processed_at', nullable: true })
  processedAt: Date;

  @Column({ name: 'processing_error', nullable: true })
  processingError: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
