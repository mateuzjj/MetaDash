import { useTranslation } from 'react-i18next';
import { KPICard } from '@/components/KPICard';
import { LineChart } from '@/components/charts/LineChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { FunnelChart } from '@/components/charts/FunnelChart';
import { DataTable } from '@/components/DataTable';
import { 
  metaAdsKPIs, 
  funnelData,
  checkoutMetrics,
  bestAdsData,
  metaCampaignsData,
  generateTimeSeries
} from '@/data/mockData';
import type { CampaignData } from '@/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function MetaAdsView() {
  const { t } = useTranslation();

  const checkoutData = generateTimeSeries(20, 1500, 2500);

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
      key: 'costPerPurchase', 
      header: 'tables.costPerPurchase',
      align: 'right' as const,
      render: (item: CampaignData) => (
        <span className="text-slate-300 text-sm">
          R$ {item.costPerPurchase.toFixed(2)}
        </span>
      )
    },
    { 
      key: 'purchases', 
      header: 'tables.purchases',
      align: 'right' as const,
      render: (item: CampaignData) => (
        <span className="text-blue-400 font-medium text-sm">
          {item.purchases}
        </span>
      )
    },
  ];

  return (
    <div className="p-5 space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3">
        {metaAdsKPIs.map((kpi, index) => (
          <KPICard key={index} data={kpi} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Funnel Chart */}
        <div className="col-span-4 bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-4 text-center">{t('charts.trafficFunnel')}</h3>
          <FunnelChart data={funnelData} />
        </div>

        {/* Checkout Metrics */}
        <div className="col-span-4 space-y-3">
          {/* Initiated Checkouts */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 uppercase">{t('kpis.initiatedCheckouts')}</p>
                <p className="text-2xl font-bold text-white">{checkoutMetrics.initiated.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-green-400 text-[11px] mt-0.5">
                  <TrendingUp className="h-3 w-3" />
                  +{checkoutMetrics.initiatedDelta}%
                </div>
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full w-[75%] bg-green-500 rounded-full" />
            </div>
          </div>

          {/* Cost per Checkout */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 uppercase">{t('kpis.costPerCheckout')}</p>
                <p className="text-2xl font-bold text-white">R$ {checkoutMetrics.costPerCheckout.toFixed(2)}</p>
                <div className="flex items-center gap-1 text-green-400 text-[11px] mt-0.5">
                  <TrendingDown className="h-3 w-3" />
                  {checkoutMetrics.costPerCheckoutDelta}%
                </div>
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full w-[45%] bg-green-500 rounded-full" />
            </div>
          </div>

          {/* Line Chart - Checkouts vs Compras */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-[10px] text-slate-400">Checkouts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-[10px] text-slate-400">Compras</span>
              </div>
            </div>
            <LineChart 
              data={checkoutData} 
              lines={[
                { key: 'value', color: '#22C55E', name: 'Checkouts' },
                { key: 'value2', color: '#3B82F6', name: 'Compras' }
              ]} 
              height={100} 
              showGrid={false}
            />
          </div>
        </div>

        {/* Best Ads Donut */}
        <div className="col-span-4 bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">{t('charts.bestAds')}</h3>
          <DonutChart 
            data={bestAdsData} 
            height={180} 
            innerRadius={45} 
            outerRadius={65}
            legendPosition="right"
          />
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4">
            <button className="text-sm font-medium text-blue-400 border-b-2 border-blue-400 pb-1">
              {t('charts.campaigns')}
            </button>
            <button className="text-sm font-medium text-slate-400 hover:text-slate-300 pb-1">
              {t('charts.adSets')}
            </button>
            <button className="text-sm font-medium text-slate-400 hover:text-slate-300 pb-1">
              {t('charts.ads')}
            </button>
          </div>
        </div>
        <DataTable columns={campaignColumns} data={metaCampaignsData} rowsPerPage={8} />
      </div>
    </div>
  );
}
