import { useTranslation } from 'react-i18next';
import { KPICard } from '@/components/KPICard';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { BrazilMap } from '@/components/charts/BrazilMap';
import { DataTable } from '@/components/DataTable';
import { 
  analyticsKPIs, 
  analyticsLineData,
  analyticsWeekData,
  accessSourceData,
  brazilMapData,
  regionData,
  osData,
  deviceData,
  urlData
} from '@/data/mockData';
import type { RegionData } from '@/types';

export function AnalyticsView() {
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

  const urlColumns = [
    { key: 'url', header: 'tables.url' },
    { 
      key: 'accesses', 
      header: 'tables.accesses',
      align: 'right' as const,
      render: (item: { url: string; accesses: number }) => (
        <div className="flex items-center justify-end gap-2">
          <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 rounded-full"
              style={{ width: `${(item.accesses / 76) * 100}%` }}
            />
          </div>
          <span className="text-orange-400 font-medium text-sm w-6 text-right">
            {item.accesses}
          </span>
        </div>
      )
    },
  ];

  return (
    <div className="p-5 space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3">
        {analyticsKPIs.map((kpi, index) => (
          <KPICard key={index} data={kpi} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Brazil Map */}
        <div className="col-span-4 bg-slate-900 rounded-xl border border-slate-800 p-4">
          <BrazilMap data={brazilMapData} />
        </div>

        {/* Line Chart */}
        <div className="col-span-4 bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-[10px] text-slate-400">{t('charts.accessInPeriod')}</span>
          </div>
          <LineChart 
            data={analyticsLineData} 
            lines={[{ key: 'value', color: '#F97316', name: 'Acessos' }]} 
            height={180} 
            showGrid={true}
          />
        </div>

        {/* Bar Chart */}
        <div className="col-span-4 bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-[10px] text-slate-400">{t('charts.accessInWeek')}</span>
          </div>
          <BarChart data={analyticsWeekData} color="#F97316" height={180} />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Region Table */}
        <div className="col-span-4 bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">{t('charts.accessByRegion')}</h3>
          <DataTable columns={regionColumns} data={regionData} rowsPerPage={7} />
        </div>

        {/* OS Donut */}
        <div className="col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">{t('charts.operatingSystem')}</h3>
          <DonutChart 
            data={osData} 
            height={130} 
            innerRadius={30} 
            outerRadius={45}
            legendPosition="bottom"
            showLegend={true}
          />
        </div>

        {/* Device Donut */}
        <div className="col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">{t('charts.device')}</h3>
          <DonutChart 
            data={deviceData} 
            height={130} 
            innerRadius={30} 
            outerRadius={45}
            legendPosition="bottom"
            showLegend={true}
          />
        </div>

        {/* Access Source */}
        <div className="col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">{t('charts.accessSource')}</h3>
          <DonutChart 
            data={accessSourceData} 
            height={130} 
            innerRadius={30} 
            outerRadius={45}
            legendPosition="bottom"
            showLegend={true}
          />
        </div>

        {/* URL Table */}
        <div className="col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-3">{t('charts.accessByURL')}</h3>
          <DataTable 
            columns={urlColumns} 
            data={urlData} 
            rowsPerPage={6}
            showPagination={false}
          />
        </div>
      </div>
    </div>
  );
}
