import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum ConnectorType {
  GOOGLE_ANALYTICS = 'google_analytics',
  GOOGLE_ADS = 'google_ads',
  META_ADS = 'meta_ads',
}

export enum ConnectorStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  ERROR = 'error',
}

@Entity('user_connectors')
export class UserConnector {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  @Column(() => User)
  userId: string;

  @ManyToOne(() => User, (user) => user.connectors)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: ConnectorType,
  })
  type: ConnectorType;

  @Column({ name: 'account_id' })
  accountId: string;

  @Column({ name: 'account_name', nullable: true })
  accountName: string;

  @Column({ name: 'access_token', type: 'text' })
  accessToken: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken: string;

  @Column({ name: 'token_expires_at' })
  tokenExpiresAt: Date;

  @Column({
    type: 'enum',
    enum: ConnectorStatus,
    default: ConnectorStatus.ACTIVE,
  })
  status: ConnectorStatus;

  @Column({ name: 'last_sync_at', nullable: true })
  lastSyncAt: Date;

  @Column({ name: 'last_error', nullable: true })
  lastError: string;

  @Column({ name: 'sync_enabled', default: true })
  syncEnabled: boolean;

  @Column({ name: 'property_ids', type: 'simple-array', nullable: true })
  propertyIds: string[];

  @Column({ name: 'manager_account_id', nullable: true })
  managerAccountId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  isTokenExpired(): boolean {
    return new Date() >= this.tokenExpiresAt;
  }
}
