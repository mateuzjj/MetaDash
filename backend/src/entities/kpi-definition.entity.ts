import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum KpiCategory {
  INVESTMENT = 'investment',
  PERFORMANCE = 'performance',
  CONVERSION = 'conversion',
  ENGAGEMENT = 'engagement',
  REVENUE = 'revenue',
}

export enum KpiSource {
  GOOGLE_ANALYTICS = 'google_analytics',
  GOOGLE_ADS = 'google_ads',
  META_ADS = 'meta_ads',
  CALCULATED = 'calculated',
}

@Entity('kpi_definitions')
export class KpiDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: KpiCategory,
  })
  category: KpiCategory;

  @Column({
    type: 'enum',
    enum: KpiSource,
  })
  source: KpiSource;

  @Column({ name: 'api_metric_name', nullable: true })
  apiMetricName: string;

  @Column({ name: 'api_dimension', nullable: true })
  apiDimension: string;

  @Column({ name: 'calculation_formula', type: 'text', nullable: true })
  calculationFormula: string;

  @Column({ name: 'unit', nullable: true })
  unit: string;

  @Column({ name: 'format_pattern', default: '#,##0.00' })
  formatPattern: string;

  @Column({ name: 'is_positive_delta_good', default: true })
  isPositiveDeltaGood: boolean;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
