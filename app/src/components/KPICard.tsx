import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { KPIData } from '@/types';
import { cn } from '@/lib/utils';

interface KPICardProps {
  data: KPIData;
  className?: string;
  showProgressBar?: boolean;
}

const colorMap = {
  blue: {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    text: 'text-white',
    line: '#3B82F6',
    bar: 'bg-blue-500',
  },
  green: {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    text: 'text-white',
    line: '#22C55E',
    bar: 'bg-green-500',
  },
  orange: {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    text: 'text-white',
    line: '#F59E0B',
    bar: 'bg-amber-500',
  },
  red: {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    text: 'text-white',
    line: '#EF4444',
    bar: 'bg-red-500',
  },
  purple: {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    text: 'text-white',
    line: '#A855F7',
    bar: 'bg-purple-500',
  },
  cyan: {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    text: 'text-white',
    line: '#06B6D4',
    bar: 'bg-cyan-500',
  },
};

export function KPICard({ data, className, showProgressBar = true }: KPICardProps) {
  const { t } = useTranslation();
  const colors = colorMap[data.color || 'blue'];
  
  const isPositive = data.delta >= 0;
  const formattedValue = typeof data.value === 'number' 
    ? data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : data.value;

  const sparklineData = data.sparklineData.map((value, index) => ({ index, value }));

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border",
      "bg-slate-900",
      colors.border,
      className
    )}>
      <div className="p-4 pb-2">
        {/* Title */}
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
          {t(data.title)}
        </p>
        
        {/* Value and Delta */}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-bold text-white">
            {data.prefix && t(data.prefix)}{formattedValue}{data.suffix && t(data.suffix)}
          </span>
        </div>
        
        {/* Delta */}
        <div className={cn(
          "flex items-center gap-0.5 text-[11px] font-medium mt-0.5",
          isPositive ? 'text-green-400' : 'text-red-400'
        )}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isPositive ? '+' : ''}{data.delta}%
        </div>
        
        {/* Sparkline */}
        <div className="mt-2 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors.line}
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Progress bar at bottom */}
      {showProgressBar && (
        <div className="h-1.5 w-full bg-slate-800">
          <div 
            className={cn("h-full rounded-r-full", colors.bar)}
            style={{ width: `${Math.min(Math.abs(data.delta) * 2, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
