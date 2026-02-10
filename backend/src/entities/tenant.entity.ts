import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
  CANCELLED = 'cancelled',
}

export enum SubscriptionPlan {
  FREE = 'free',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  name: string;

  @Column({ unique: true, nullable: true })
  @Index()
  subdomain: string;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.TRIAL,
  })
  status: TenantStatus;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
  })
  plan: SubscriptionPlan;

  @Column({ name: 'trial_ends_at', nullable: true })
  trialEndsAt: Date;

  @Column({ name: 'subscription_ends_at', nullable: true })
  subscriptionEndsAt: Date;

  @Column({ type: 'jsonb', default: {}, nullable: true })
  settings: {
    timezone?: string;
    currency?: string;
    language?: string;
    features?: string[];
    limits?: {
      users?: number;
      connectors?: number;
      dataRetentionDays?: number;
    };
  };

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ name: 'primary_color', nullable: true })
  primaryColor: string;

  @Column({ name: 'contact_email', nullable: true })
  contactEmail: string;

  @Column({ name: 'billing_email', nullable: true })
  billingEmail: string;

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties
  get isActive(): boolean {
    return this.status === TenantStatus.ACTIVE;
  }

  get isTrial(): boolean {
    return this.status === TenantStatus.TRIAL;
  }

  get hasActiveSubscription(): boolean {
    if (!this.subscriptionEndsAt) return false;
    return new Date() < this.subscriptionEndsAt;
  }
}
