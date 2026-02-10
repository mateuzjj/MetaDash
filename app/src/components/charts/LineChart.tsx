import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import type { TimeSeriesData } from '@/types';
import { cn } from '@/lib/utils';

interface LineChartProps {
  data: TimeSeriesData[];
  lines?: { key: string; color: string; name: string }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showArea?: boolean;
  className?: string;
}

export function LineChart({
  data,
  lines = [{ key: 'value', color: '#3B82F6', name: 'Value' }],
  height = 200,
  showGrid = true,
  showLegend = false,
  showArea = false,
  className,
}: LineChartProps) {
  const ChartComponent = showArea ? AreaChart : ReLineChart;

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            {lines.map((line) => (
              <linearGradient key={line.key} id={`areaGradient-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={line.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={line.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
          )}
          <XAxis
            dataKey="date"
            stroke="#64748B"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            dy={5}
          />
          <YAxis
            stroke="#64748B"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
          />
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
          />
          {showLegend && <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />}
          {lines.map((line) => (
            showArea ? (
              <Area
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={2}
                fill={`url(#areaGradient-${line.key})`}
                dot={false}
                name={line.name}
              />
            ) : (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                name={line.name}
              />
            )
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
