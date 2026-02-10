import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ChartData } from '@/types';
import { cn } from '@/lib/utils';

interface BarChartProps {
  data: ChartData[];
  dataKey?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  className?: string;
  gradient?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
}

export function BarChart({
  data,
  dataKey = 'value',
  color = '#3B82F6',
  height = 200,
  showGrid = false,
  className,
  gradient = true,
  showXAxis = true,
  showYAxis = true,
}: BarChartProps) {
  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <ReBarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`barGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.9} />
              <stop offset="100%" stopColor={color} stopOpacity={0.5} />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
          )}
          {showXAxis && (
            <XAxis
              dataKey="name"
              stroke="#64748B"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              dy={5}
            />
          )}
          {showYAxis && (
            <YAxis
              stroke="#64748B"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
            />
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '6px',
              fontSize: '11px',
            }}
            labelStyle={{ color: '#94A3B8' }}
            itemStyle={{ color: '#F8FAFC' }}
            formatter={(value: number) => [value.toLocaleString(), '']}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar
            dataKey={dataKey}
            fill={gradient ? `url(#barGradient-${color.replace('#', '')})` : color}
            radius={[3, 3, 0, 0]}
            maxBarSize={40}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color ? String(entry.color) : (gradient ? `url(#barGradient-${color.replace('#', '')})` : color)} 
              />
            ))}
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
