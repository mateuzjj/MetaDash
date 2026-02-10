import { useTranslation } from 'react-i18next';
import { KPICard } from '@/components/KPICard';
import { LineChart } from '@/components/charts/LineChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { DataTable } from '@/components/DataTable';
import { 
  googleAdsKPIs, 
  keywordsData,
  genderData,
  googleCampaignsData,
  generateTimeSeries
} from '@/data/mockData';
import type { KeywordData, CampaignData } from '@/types';
import { cn } from '@/lib/utils';

export function GoogleAdsView() {
  const { t } = useTranslation();

  const chartData = generateTimeSeries(15, 50, 150);

  const keywordColumns = [
    { key: 'keyword', header: 'tables.keyword' },
    { 
      key: 'clicks', 
      header: 'tables.clicks',
      align: 'right' as const,
      render: (item: KeywordData) => (
        <span className="text-slate-300 text-sm">{item.clicks}</span>
      )
    },
    { 
      key: 'conversions', 
      header: 'tables.conversions',
      align: 'right' as const,
      render: (item: KeywordData) => (
        <span className="text-green-400 font-medium text-sm">
          {item.conversions.toFixed(2)}
        </span>
      )
    },
  ];

  const campaignColumns = [
    { key: 'name', header: 'tables.campaign' },
    { 
      key: 'investment', 
      header: 'tables.investment',
      align: 'right' as const,
      render: (item: CampaignData) => (
        <span className="text-slate-300 text-sm">
          R$ {item.investment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    { 
      key: 'conversions', 
      header: 'tables.conversions',
      align: 'right' as const,
      render: (item: CampaignData) => (
        <span className="text-slate-300 text-sm">
          {item.conversions?.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}
        </span>
      )
    },
    { 
      key: 'costPerConversion', 
      header: 'tables.costPerConversion',
      align: 'right' as const,
      render: (item: CampaignData) => (
        <span className="text-slate-300 text-sm">
          R$ {item.costPerConversion?.toFixed(2)}
        </span>
      )
    },
    { 
      key: 'conversionRate', 
      header: 'tables.conversionRate',
      align: 'right' as const,
      render: (item: CampaignData) => (
        <span className={cn(
          "font-medium text-sm",
          (item.conversionRate || 0) > 50 ? "text-green-400" : "text-slate-300"
        )}>
          {item.conversionRate?.toFixed(2)}%
        </span>
      )
    },
  ];

  return (
    <div className="p-5 space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3">
        {googleAdsKPIs.map((kpi, index) => (
          <KPICard key={index} data={kpi} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Keywords Table */}
        <div className="col-span-3 bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">{t('charts.keywords')}</h3>
          <DataTable 
            columns={keywordColumns} 
            data={keywordsData} 
            rowsPerPage={10}
            showPagination={false}
          />
        </div>

        {/* Line Chart */}
        <div className="col-span-6 bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-[10px] text-slate-400">{t('charts.investment')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-[10px] text-slate-400">{t('charts.conversions')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-[10px] text-slate-400">{t('charts.costPerConversion')}</span>
            </div>
          </div>
          <LineChart 
            data={chartData} 
            lines={[
              { key: 'value', color: '#22C55E', name: t('charts.investment') },
              { key: 'value2', color: '#3B82F6', name: t('charts.conversions') },
              { key: 'value3', color: '#EF4444', name: t('charts.costPerConversion') }
            ]} 
            height={200} 
            showGrid={true}
          />
        </div>

        {/* Gender Donut */}
        <div className="col-span-3 bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">{t('charts.conversionsByGender')}</h3>
          <DonutChart 
            data={genderData} 
            height={160} 
            innerRadius={40} 
            outerRadius={60}
            legendPosition="right"
          />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-slate-800/50 rounded-lg">
              <p className="text-[10px] text-slate-400">CTR</p>
              <p className="text-lg font-bold text-white">3.29%</p>
            </div>
            <div className="text-center p-2 bg-slate-800/50 rounded-lg">
              <p className="text-[10px] text-slate-400">{t('kpis.conversionRate')}</p>
              <p className="text-lg font-bold text-white">96.68%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">{t('charts.campaigns')}</h3>
        </div>
        <DataTable columns={campaignColumns} data={googleCampaignsData} rowsPerPage={8} />
      </div>
    </div>
  );
}
