export interface KPIData {
  title: string;
  value: string | number;
  delta: number;
  sparklineData: number[];
  prefix?: string;
  suffix?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'cyan';
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  value2?: number;
  value3?: number;
}

export interface CampaignData {
  id: string;
  name: string;
  investment: number;
  costPerPurchase: number;
  purchases: number;
  conversions?: number;
  costPerConversion?: number;
  conversionRate?: number;
  clicks?: number;
}

export interface KeywordData {
  keyword: string;
  clicks: number;
  conversions: number;
}

export interface RegionData {
  region: string;
  city: string;
  accesses: number;
}

export interface FunnelStage {
  name: string;
  value: number;
  rate?: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export type ViewType = 'overview' | 'metaAds' | 'googleAds' | 'analytics' | 'mobile';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'viewer' | 'analyst' | 'admin';
  avatar?: string;
}

export interface FilterState {
  dateRange: DateRange;
  campaign?: string;
  ad?: string;
  region?: string;
  city?: string;
}
