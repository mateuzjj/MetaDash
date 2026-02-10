import { KPICard } from '@/components/KPICard';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { Smartphone, Tablet, Monitor, Download, Users, Activity } from 'lucide-react';
import { generateTimeSeries } from '@/data/mockData';

export function MobileView() {

  const mobileKPIs = [
    {
      title: 'kpis.totalAccesses',
      value: '5,247',
      delta: 42.5,
      sparklineData: Array.from({ length: 20 }, () => Math.floor(Math.random() * 3000) + 4000),
      color: 'purple' as const,
    },
    {
      title: 'kpis.totalUsers',
      value: '4,892',
      delta: 38.2,
      sparklineData: Array.from({ length: 20 }, () => Math.floor(Math.random() * 2500) + 3500),
      color: 'blue' as const,
    },
    {
      title: 'kpis.engagementRate',
      value: '32.8',
      delta: 8.4,
      sparklineData: Array.from({ length: 20 }, () => Math.floor(Math.random() * 10) + 28),
      suffix: 'percent',
      color: 'green' as const,
    },
    {
      title: 'kpis.averageCPC',
      value: 0.87,
      delta: -12.3,
      sparklineData: Array.from({ length: 20 }, () => Math.random() * 0.5 + 0.6),
      prefix: 'currency.symbol',
      color: 'orange' as const,
    },
    {
      title: 'kpis.conversionRate',
      value: '18.4',
      delta: 15.7,
      sparklineData: Array.from({ length: 20 }, () => Math.floor(Math.random() * 8) + 14),
      suffix: 'percent',
      color: 'red' as const,
    },
  ];

  const deviceBreakdown = [
    { name: 'Mobile', value: 78.5, color: '#A855F7' },
    { name: 'Desktop', value: 15.2, color: '#3B82F6' },
    { name: 'Tablet', value: 6.3, color: '#22C55E' },
  ];

  const osBreakdown = [
    { name: 'iOS', value: 62.4, color: '#F97316' },
    { name: 'Android', value: 35.8, color: '#34A853' },
    { name: 'Other', value: 1.8, color: '#9AA0A6' },
  ];

  const screenSizes = [
    { name: '390x844', value: 28 },
    { name: '414x896', value: 22 },
    { name: '375x812', value: 18 },
    { name: '360x800', value: 15 },
    { name: '393x852', value: 10 },
    { name: 'Other', value: 7 },
  ];

  const mobileData = generateTimeSeries(14, 3000, 6000);

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        {mobileKPIs.map((kpi, index) => (
          <KPICard key={index} data={kpi} />
        ))}
      </div>

      {/* Device Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <Smartphone className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Mobile Sessions</p>
            <p className="text-xl font-bold text-white">4,118</p>
            <p className="text-xs text-green-400">+45.2%</p>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Monitor className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Desktop Sessions</p>
            <p className="text-xl font-bold text-white">798</p>
            <p className="text-xs text-red-400">-8.3%</p>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 flex items-center gap-4">
          <div className="p-3 bg-green-500/20 rounded-lg">
            <Tablet className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Tablet Sessions</p>
            <p className="text-xl font-bold text-white">331</p>
            <p className="text-xs text-green-400">+12.7%</p>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-500/20 rounded-lg">
            <Download className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">App Downloads</p>
            <p className="text-xl font-bold text-white">1,247</p>
            <p className="text-xs text-green-400">+67.4%</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Device Breakdown */}
        <div className="col-span-3 bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Device Breakdown</h3>
          <DonutChart 
            data={deviceBreakdown} 
            height={180} 
            innerRadius={50} 
            outerRadius={70}
            legendPosition="right"
          />
        </div>

        {/* OS Breakdown */}
        <div className="col-span-3 bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Operating System</h3>
          <DonutChart 
            data={osBreakdown} 
            height={180} 
            innerRadius={50} 
            outerRadius={70}
            legendPosition="right"
          />
        </div>

        {/* Screen Sizes */}
        <div className="col-span-3 bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Screen Sizes</h3>
          <BarChart data={screenSizes} color="#A855F7" height={180} showGrid={false} />
        </div>

        {/* Mobile Traffic */}
        <div className="col-span-3 bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Mobile Traffic</h3>
          <LineChart 
            data={mobileData} 
            lines={[{ key: 'value', color: '#A855F7', name: 'Sessions' }]} 
            height={180} 
            showGrid={false}
          />
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">User Engagement</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Avg. Session Duration</span>
              <span className="text-sm font-medium text-white">4m 32s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Pages per Session</span>
              <span className="text-sm font-medium text-white">3.8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Bounce Rate</span>
              <span className="text-sm font-medium text-green-400">28.4%</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Avg. Load Time</span>
              <span className="text-sm font-medium text-white">1.2s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Core Web Vitals</span>
              <span className="text-sm font-medium text-green-400">Good</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Mobile Score</span>
              <span className="text-sm font-medium text-green-400">94/100</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center gap-3 mb-4">
            <Download className="h-5 w-5 text-green-400" />
            <h3 className="text-sm font-semibold text-white">App Metrics</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Active Users</span>
              <span className="text-sm font-medium text-white">2,847</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Retention (D7)</span>
              <span className="text-sm font-medium text-green-400">42.3%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Crash Rate</span>
              <span className="text-sm font-medium text-green-400">0.02%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
