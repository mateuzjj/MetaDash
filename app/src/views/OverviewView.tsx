import { useTranslation } from 'react-i18next';
import { KPICard } from '@/components/KPICard';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { DataTable } from '@/components/DataTable';
import { 
  overviewKPIs, 
  totalImpressionsKPI,
  metaAdsBarData, 
  googleAdsLineData, 
  analyticsBarData,
  accessSourceData,
  regionData 
} from '@/data/mockData';
import type { RegionData } from '@/types';

export function OverviewView() {
  const { t } = useTranslation();

  const regionColumns = [
    { key: 'region', header: 'tables.region' },
    { key: 'city', header: 'tables.city' },
    { 
      key: 'accesses', 
      header: 'tables.accesses',
      align: 'right' as const,
      render: (item: RegionData) => (
        <span className="text-orange-400 font-medium text-sm">
          {item.accesses.toLocaleString()}
        </span>
      )
    },
  ];

  return (
    <div className="p-5 space-y-5">
      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-5 gap-3">
        {overviewKPIs.map((kpi, index) => (
          <KPICard key={index} data={kpi} />
        ))}
      </div>

      {/* KPI Card - Impressions */}
      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-1">
          <KPICard data={totalImpressionsKPI} />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left column - Impressions and line chart */}
        <div className="col-span-3 space-y-4">
          {/* Impressions with progress bar */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <p className="text-[11px] text-slate-400 uppercase">{t('kpis.totalImpressions')}</p>
            <p className="text-2xl font-bold text-white mt-1">380,580</p>
            <div className="flex items-center gap-1 text-green-400 text-[11px] mt-0.5">
              <span>↑</span>
              <span>171.5%</span>
            </div>
            <div className="mt-3 h-8">
              <LineChart 
                data={Array.from({ length: 20 }, (_, i) => ({ 
                  date: String(i), 
                  value: 300000 + Math.random() * 150000 
                }))} 
                lines={[{ key: 'value', color: '#3B82F6', name: '' }]} 
                height={32} 
                showGrid={false}
              />
            </div>
            <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full w-[85%] bg-blue-500 rounded-full" />
            </div>
          </div>

          {/* Meta vs Google Ads line chart */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-[10px] text-slate-400">Meta Ads</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-[10px] text-slate-400">Google Ads</span>
              </div>
            </div>
            <LineChart 
              data={Array.from({ length: 11 }, (_, i) => ({ 
                date: String(i), 
                value: 800 + Math.random() * 400,
                value2: 600 + Math.random() * 300
              }))} 
              lines={[
                { key: 'value', color: '#3B82F6', name: 'Meta' },
                { key: 'value2', color: '#22C55E', name: 'Google' }
              ]} 
              height={120} 
              showGrid={false}
            />
          </div>
        </div>

        {/* Meta Ads Bar Chart */}
        <div className="col-span-3 bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Meta Ads</h3>
            <span className="text-[10px] text-slate-400">Compras na Semana</span>
          </div>
          <BarChart data={metaAdsBarData} color="#3B82F6" height={100} showGrid={false} />
          <div className="mt-4 space-y-2 border-t border-slate-800 pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 text-xs">Investimento</span>
              <span className="text-white font-medium text-sm">R$ 9,598.38</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 text-xs">Compras</span>
              <span className="text-white font-medium text-sm">315</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 text-xs">Custo por Compra</span>
              <span className="text-green-400 font-medium text-sm">R$ 30.47 ↓ 1.6%</span>
            </div>
          </div>
        </div>

        {/* Google Ads Line Chart */}
        <div className="col-span-3 bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white">Google Ads</h3>
            <span className="text-[10px] text-slate-400">Conversões na Semana</span>
          </div>
          <BarChart data={googleAdsLineData.slice(0, 7).map(d => ({ name: d.date.substring(0, 2), value: d.value }))} color="#22C55E" height={100} showGrid={false} />
          <div className="mt-4 space-y-2 border-t border-slate-800 pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 text-xs">Investimento</span>
              <span className="text-white font-medium text-sm">R$ 854.76</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 text-xs">Conversões</span>
              <span className="text-white font-medium text-sm">743.08</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400 text-xs">Custo por Conversão</span>
              <span className="text-green-400 font-medium text-sm">R$ 1.15 ↓ 5.5%</span>
            </div>
          </div>
        </div>

        {/* Right column - Analytics and Donut */}
        <div className="col-span-3 space-y-4">
          {/* Google Analytics Bar Chart */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Google Analytics</h3>
              <span className="text-[10px] text-slate-400">Acessos na Semana</span>
            </div>
            <BarChart data={analyticsBarData} color="#F97316" height={80} showGrid={false} />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                <p className="text-[10px] text-slate-400">Sessões</p>
                <p className="text-lg font-bold text-white">4,621</p>
                <p className="text-[10px] text-green-400">+7.71%</p>
              </div>
              <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                <p className="text-[10px] text-slate-400">Total de Usuários</p>
                <p className="text-lg font-bold text-white">4,151</p>
                <p className="text-[10px] text-green-400">+7.13%</p>
              </div>
              <div className="text-center p-2 bg-slate-800/50 rounded-lg col-span-2">
                <p className="text-[10px] text-slate-400">Novos Usuários</p>
                <p className="text-lg font-bold text-white">3,813</p>
                <p className="text-[10px] text-green-400">+5.23%</p>
              </div>
            </div>
          </div>

          {/* Access Source Donut */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-2">{t('charts.accessSource')}</h3>
            <DonutChart 
              data={accessSourceData} 
              height={140} 
              innerRadius={35} 
              outerRadius={55}
              legendPosition="right"
            />
          </div>
        </div>
      </div>

      {/* Region Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">{t('charts.accessByRegion')}</h3>
        </div>
        <DataTable columns={regionColumns} data={regionData} rowsPerPage={7} />
      </div>
    </div>
  );
}
