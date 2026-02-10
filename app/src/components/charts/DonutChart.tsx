import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { ChartData } from '@/types';
import { cn } from '@/lib/utils';

interface DonutChartProps {
  data: ChartData[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  legendPosition?: 'right' | 'bottom';
  className?: string;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  data,
  height = 200,
  innerRadius = 50,
  outerRadius = 70,
  showLegend = true,
  legendPosition = 'right',
  className,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const { t } = useTranslation();

  const defaultColors = ['#3B82F6', '#22C55E', '#F97316', '#EF4444', '#A855F7', '#9AA0A6'];

  return (
    <div className={cn("w-full relative", className)}>
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx={showLegend && legendPosition === 'right' ? '35%' : '50%'}
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={1}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color ? String(entry.color) : defaultColors[index % defaultColors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '6px',
                fontSize: '11px',
              }}
              labelStyle={{ color: '#94A3B8' }}
              itemStyle={{ color: '#F8FAFC' }}
              formatter={(value: number, name: string) => [`${value}%`, t(name)]}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center label */}
        {centerLabel && centerValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-slate-400">{centerLabel}</span>
            <span className="text-lg font-bold text-white">{centerValue}</span>
          </div>
        )}
      </div>
      
      {/* Custom legend */}
      {showLegend && (
        <div className={cn(
          "mt-2",
          legendPosition === 'right' ? "absolute right-0 top-1/2 -translate-y-1/2" : ""
        )}>
          <div className={cn(
            "flex gap-2",
            legendPosition === 'right' ? "flex-col" : "flex-wrap justify-center"
          )}>
            {data.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: entry.color ? String(entry.color) : defaultColors[index % defaultColors.length] }}
                />
                <span className="text-[10px] text-slate-400">{t(entry.name)}</span>
                <span className="text-[10px] text-white font-medium">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
