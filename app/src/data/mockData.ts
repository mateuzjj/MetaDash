import type { KPIData, TimeSeriesData, ChartData, CampaignData, KeywordData, RegionData, FunnelStage } from '@/types';

// Generate sparkline data
const generateSparkline = (length: number, min: number, max: number): number[] => {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
};

// Generate time series data
export const generateTimeSeries = (days: number, min: number, max: number): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: Math.floor(Math.random() * (max - min + 1)) + min,
      value2: Math.floor(Math.random() * (max - min + 1)) + min,
      value3: Math.floor(Math.random() * (max - min + 1)) + min,
    });
  }
  return data;
};

// Overview KPIs - exact values from reference
export const overviewKPIs: KPIData[] = [
  {
    title: 'kpis.totalInvestment',
    value: 10453.14,
    delta: -15.8,
    sparklineData: generateSparkline(20, 8000, 12000),
    prefix: 'currency.symbol',
    color: 'red',
  },
  {
    title: 'kpis.totalConversions',
    value: '1,058.08',
    delta: 194.8,
    sparklineData: generateSparkline(20, 800, 1200),
    color: 'blue',
  },
  {
    title: 'kpis.conversionRate',
    value: '24.89',
    delta: 65.3,
    sparklineData: generateSparkline(20, 15, 30),
    suffix: 'percent',
    color: 'orange',
  },
  {
    title: 'kpis.totalRevenue',
    value: 28178.74,
    delta: 114.8,
    sparklineData: generateSparkline(20, 20000, 32000),
    prefix: 'currency.symbol',
    color: 'green',
  },
  {
    title: 'kpis.overallROI',
    value: '2.7',
    delta: 116.5,
    sparklineData: generateSparkline(20, 2, 4),
    color: 'cyan',
  },
];

export const totalImpressionsKPI: KPIData = {
  title: 'kpis.totalImpressions',
  value: '380,580',
  delta: 171.5,
  sparklineData: generateSparkline(20, 300000, 450000),
  color: 'blue',
};

// Meta Ads KPIs - exact values from reference
export const metaAdsKPIs: KPIData[] = [
  {
    title: 'kpis.investment',
    value: 22993.14,
    delta: 16.0,
    sparklineData: generateSparkline(20, 18000, 26000),
    prefix: 'currency.symbol',
    color: 'red',
  },
  {
    title: 'kpis.revenue',
    value: 32718.87,
    delta: 43.4,
    sparklineData: generateSparkline(20, 25000, 38000),
    prefix: 'currency.symbol',
    color: 'green',
  },
  {
    title: 'kpis.purchases',
    value: '720',
    delta: 54.2,
    sparklineData: generateSparkline(20, 600, 850),
    color: 'blue',
  },
  {
    title: 'kpis.averageROAS',
    value: '1.42',
    delta: -23.6,
    sparklineData: generateSparkline(20, 1.2, 2.0),
    color: 'purple',
  },
  {
    title: 'kpis.costPerPurchase',
    value: 31.93,
    delta: 23.8,
    sparklineData: generateSparkline(20, 25, 40),
    prefix: 'currency.symbol',
    color: 'orange',
  },
];

// Google Ads KPIs - exact values from reference
export const googleAdsKPIs: KPIData[] = [
  {
    title: 'kpis.investment',
    value: 2075.87,
    delta: -5.8,
    sparklineData: generateSparkline(20, 1800, 2400),
    prefix: 'currency.symbol',
    color: 'green',
  },
  {
    title: 'kpis.conversions',
    value: '1,911.4',
    delta: -5.0,
    sparklineData: generateSparkline(20, 1700, 2100),
    color: 'blue',
  },
  {
    title: 'kpis.costPerConversion',
    value: 1.09,
    delta: -0.8,
    sparklineData: generateSparkline(20, 0.9, 1.3),
    prefix: 'currency.symbol',
    color: 'red',
  },
  {
    title: 'kpis.clicks',
    value: '1,977',
    delta: -3.8,
    sparklineData: generateSparkline(20, 1700, 2200),
    color: 'orange',
  },
  {
    title: 'kpis.averageCPC',
    value: 1.05,
    delta: -2.1,
    sparklineData: generateSparkline(20, 0.9, 1.2),
    prefix: 'currency.symbol',
    color: 'purple',
  },
];

// Analytics KPIs - exact values from reference
export const analyticsKPIs: KPIData[] = [
  {
    title: 'kpis.totalAccesses',
    value: '8,354',
    delta: 62.3,
    sparklineData: generateSparkline(20, 6000, 9500),
    color: 'green',
  },
  {
    title: 'kpis.totalUsers',
    value: '7,105',
    delta: 43.7,
    sparklineData: generateSparkline(20, 5500, 8000),
    color: 'blue',
  },
  {
    title: 'kpis.newUsers',
    value: '6,443',
    delta: 61.5,
    sparklineData: generateSparkline(20, 5000, 7500),
    color: 'red',
  },
  {
    title: 'kpis.pageViews',
    value: '8,959',
    delta: 54.8,
    sparklineData: generateSparkline(20, 7000, 10000),
    color: 'orange',
  },
  {
    title: 'kpis.engagementRate',
    value: '28.36',
    delta: 3.8,
    sparklineData: generateSparkline(20, 25, 32),
    suffix: 'percent',
    color: 'purple',
  },
];

// Chart data - Meta Ads
export const metaAdsBarData: ChartData[] = [
  { name: 'Dom', value: 45 },
  { name: 'Seg', value: 52 },
  { name: 'Ter', value: 48 },
  { name: 'Qua', value: 55 },
  { name: 'Qui', value: 49 },
  { name: 'Sex', value: 58 },
  { name: 'Sáb', value: 44 },
];

// Google Ads line data
export const googleAdsLineData: TimeSeriesData[] = generateTimeSeries(11, 600, 1200);

// Analytics bar data
export const analyticsBarData: ChartData[] = [
  { name: 'Seg', value: 740 },
  { name: 'Ter', value: 920 },
  { name: 'Qua', value: 850 },
  { name: 'Qui', value: 680 },
  { name: 'Sex', value: 920 },
  { name: 'Sáb', value: 780 },
  { name: 'Dom', value: 650 },
];

// Access source data
export const accessSourceData: ChartData[] = [
  { name: 'fb', value: 35.7, color: '#1877F2' },
  { name: 'google', value: 28.4, color: '#4285F4' },
  { name: 'direct', value: 15.2, color: '#34A853' },
  { name: 'instagram', value: 12.8, color: '#E4405F' },
  { name: 'linkedin', value: 5.3, color: '#0A66C2' },
  { name: 'others', value: 2.6, color: '#9AA0A6' },
];

// Region data
export const regionData: RegionData[] = [
  { region: 'São Paulo', city: 'São Paulo', accesses: 2499 },
  { region: 'Rio de Janeiro', city: 'Rio de Janeiro', accesses: 445 },
  { region: 'Minas Gerais', city: 'Belo Horizonte', accesses: 369 },
  { region: 'Paraná', city: 'Curitiba', accesses: 343 },
  { region: 'Rio Grande do Sul', city: 'Porto Alegre', accesses: 338 },
  { region: 'Santa Catarina', city: 'Florianópolis', accesses: 327 },
  { region: 'Distrito Federal', city: 'Brasília', accesses: 286 },
];

// Funnel data - exact values from Meta Ads reference
export const funnelData: FunnelStage[] = [
  { name: 'funnel.clicks', value: 8000, rate: 0.93 },
  { name: 'funnel.pageViews', value: 8000, rate: 93.31 },
  { name: 'funnel.checkouts', value: 2474, rate: 31.30 },
  { name: 'funnel.purchases', value: 720, rate: 29.10 },
];

export const checkoutMetrics = {
  initiated: 2474,
  initiatedDelta: 152.7,
  costPerCheckout: 9.29,
  costPerCheckoutDelta: 56.4,
  addToCart: 0,
  frequency: 3.98,
  cpm: 25.13,
};

// Best ads data
export const bestAdsData: ChartData[] = [
  { name: 'Ad 1', value: 35.7, color: '#3B82F6' },
  { name: 'Ad 2', value: 28.4, color: '#60A5FA' },
  { name: 'Ad 3', value: 15.2, color: '#93C5FD' },
  { name: 'Ad 4', value: 12.8, color: '#BFDBFE' },
  { name: 'Ad 5', value: 7.9, color: '#DBEAFE' },
];

// Gender data
export const genderData: ChartData[] = [
  { name: 'gender.female', value: 45.8, color: '#22C55E' },
  { name: 'gender.male', value: 35.4, color: '#4ADE80' },
  { name: 'gender.unknown', value: 18.8, color: '#86EFAC' },
];

// Keywords data
export const keywordsData: KeywordData[] = [
  { keyword: 'marketing digital', clicks: 61, conversions: 57.92 },
  { keyword: 'google ads', clicks: 46, conversions: 46.33 },
  { keyword: 'facebook ads', clicks: 23, conversions: 24 },
  { keyword: 'instagram ads', clicks: 21, conversions: 19.94 },
  { keyword: 'seo', clicks: 17, conversions: 15 },
  { keyword: 'analytics', clicks: 15, conversions: 13 },
  { keyword: 'conversion', clicks: 13, conversions: 13 },
  { keyword: 'roi', clicks: 11, conversions: 11 },
  { keyword: 'cpc', clicks: 9, conversions: 8 },
  { keyword: 'ctr', clicks: 9, conversions: 10 },
];

// Campaigns data
export const metaCampaignsData: CampaignData[] = [
  { id: '1', name: 'Campanha 1', investment: 5676.77, costPerPurchase: 30.47, purchases: 212 },
  { id: '2', name: 'Campanha 2', investment: 5675.08, costPerPurchase: 31.93, purchases: 166 },
  { id: '3', name: 'Campanha 3', investment: 4903.82, costPerPurchase: 28.19, purchases: 31 },
  { id: '4', name: 'Campanha 4', investment: 2879.16, costPerPurchase: 29.0, purchases: 90 },
  { id: '5', name: 'Campanha 5', investment: 2058.08, costPerPurchase: 28.58, purchases: 29 },
  { id: '6', name: 'Campanha 6', investment: 964.11, costPerPurchase: 27.55, purchases: 25 },
  { id: '7', name: 'Campanha 7', investment: 501.25, costPerPurchase: 25.06, purchases: 19 },
  { id: '8', name: 'Campanha 8', investment: 418.67, costPerPurchase: 23.26, purchases: 16 },
];

export const googleCampaignsData: CampaignData[] = [
  { id: '1', name: 'Campanha Google 1', investment: 1075.87, costPerPurchase: 0.56, purchases: 1911, conversions: 1911.4, costPerConversion: 1.09, conversionRate: 96.68, clicks: 1977 },
  { id: '2', name: 'Campanha Google 2', investment: 0, costPerPurchase: 0, purchases: 0, conversions: 0, costPerConversion: 0, conversionRate: 0, clicks: 0 },
  { id: '3', name: 'Campanha Google 3', investment: 0, costPerPurchase: 0, purchases: 0, conversions: 0, costPerConversion: 0, conversionRate: 0, clicks: 0 },
  { id: '4', name: 'Campanha Google 4', investment: 0, costPerPurchase: 0, purchases: 0, conversions: 0, costPerConversion: 0, conversionRate: 0, clicks: 0 },
  { id: '5', name: 'Campanha Google 5', investment: 0, costPerPurchase: 0, purchases: 0, conversions: 0, costPerConversion: 0, conversionRate: 0, clicks: 0 },
  { id: '6', name: 'Campanha Google 6', investment: 0, costPerPurchase: 0, purchases: 0, conversions: 0, costPerConversion: 0, conversionRate: 0, clicks: 0 },
  { id: '7', name: 'Campanha Google 7', investment: 0, costPerPurchase: 0, purchases: 0, conversions: 0, costPerConversion: 0, conversionRate: 0, clicks: 0 },
  { id: '8', name: 'Campanha Google 8', investment: 0, costPerPurchase: 0, purchases: 0, conversions: 0, costPerConversion: 0, conversionRate: 0, clicks: 0 },
];

// Analytics chart data
export const analyticsLineData: TimeSeriesData[] = generateTimeSeries(26, 200, 600);
export const analyticsWeekData: ChartData[] = [
  { name: '1', value: 1199 },
  { name: '2', value: 1266 },
  { name: '3', value: 1199 },
  { name: '4', value: 1146 },
  { name: '5', value: 1109 },
  { name: '6', value: 1021 },
  { name: '7', value: 891 },
];

// OS and Device data
export const osData: ChartData[] = [
  { name: 'iOS', value: 54.8, color: '#FF9500' },
  { name: 'Android', value: 38.2, color: '#34A853' },
  { name: 'Windows', value: 4.5, color: '#00A4EF' },
  { name: 'MacOS', value: 2.1, color: '#FF6B6B' },
  { name: 'Linux', value: 0.4, color: '#9AA0A6' },
];

export const deviceData: ChartData[] = [
  { name: 'Mobile', value: 78.5, color: '#FF9500' },
  { name: 'Desktop', value: 18.3, color: '#4285F4' },
  { name: 'Tablet', value: 3.2, color: '#34A853' },
];

// URL data
export const urlData: { url: string; accesses: number }[] = [
  { url: '/', accesses: 76 },
  { url: '/produtos', accesses: 24 },
  { url: '/sobre', accesses: 15 },
  { url: '/contato', accesses: 13 },
  { url: '/blog', accesses: 11 },
  { url: '/precos', accesses: 9 },
];

// Brazil map data
export const brazilMapData = [
  { state: 'SP', value: 2499, name: 'São Paulo' },
  { state: 'RJ', value: 445, name: 'Rio de Janeiro' },
  { state: 'MG', value: 369, name: 'Minas Gerais' },
  { state: 'PR', value: 343, name: 'Paraná' },
  { state: 'RS', value: 338, name: 'Rio Grande do Sul' },
  { state: 'SC', value: 327, name: 'Santa Catarina' },
  { state: 'DF', value: 286, name: 'Distrito Federal' },
  { state: 'BA', value: 245, name: 'Bahia' },
  { state: 'CE', value: 198, name: 'Ceará' },
  { state: 'PE', value: 176, name: 'Pernambuco' },
  { state: 'GO', value: 165, name: 'Goiás' },
  { state: 'ES', value: 142, name: 'Espírito Santo' },
  { state: 'PB', value: 98, name: 'Paraíba' },
  { state: 'RN', value: 87, name: 'Rio Grande do Norte' },
  { state: 'MT', value: 76, name: 'Mato Grosso' },
  { state: 'AL', value: 65, name: 'Alagoas' },
  { state: 'MS', value: 58, name: 'Mato Grosso do Sul' },
  { state: 'SE', value: 45, name: 'Sergipe' },
  { state: 'PI', value: 38, name: 'Piauí' },
  { state: 'TO', value: 32, name: 'Tocantins' },
  { state: 'AC', value: 28, name: 'Acre' },
  { state: 'AP', value: 22, name: 'Amapá' },
  { state: 'RR', value: 18, name: 'Roraima' },
  { state: 'AM', value: 156, name: 'Amazonas' },
  { state: 'PA', value: 134, name: 'Pará' },
  { state: 'RO', value: 41, name: 'Rondônia' },
  { state: 'MA', value: 89, name: 'Maranhão' },
];
