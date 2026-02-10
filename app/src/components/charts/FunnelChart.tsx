import { useTranslation } from 'react-i18next';
import type { FunnelStage } from '@/types';
import { cn } from '@/lib/utils';

interface FunnelChartProps {
  data: FunnelStage[];
  className?: string;
}

export function FunnelChart({ data, className }: FunnelChartProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* 3D Funnel */}
      <div className="relative w-full max-w-[280px]">
        {data.map((stage, index) => {
          const widthPercent = 100 - (index * 18);
          const isLast = index === data.length - 1;
          
          return (
            <div
              key={stage.name}
              className="relative mx-auto"
              style={{ width: `${widthPercent}%` }}
            >
              {/* Funnel segment with 3D effect */}
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center py-4 px-2",
                  "text-white text-center",
                  "bg-gradient-to-b from-blue-400 to-blue-600",
                  index === 0 && "rounded-t-lg",
                  isLast && "rounded-b-lg"
                )}
                style={{
                  clipPath: !isLast 
                    ? `polygon(5% 0, 95% 0, 100% 100%, 0% 100%)`
                    : 'none',
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2), 0 4px 8px rgba(0,0,0,0.3)',
                }}
              >
                <span className="text-[10px] font-medium text-blue-100 uppercase tracking-wide">
                  {t(stage.name)}
                </span>
                <span className="text-2xl font-bold">{(stage.value / 1000).toFixed(1)}K</span>
              </div>
              
              {/* Rate indicator */}
              {stage.rate && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-2">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">
                      {index === 0 ? 'Taxa de Clique' : index === 1 ? 'Current Rate' : index === 2 ? 'Taxa de Checkout' : 'Taxa de Compra'}
                    </span>
                    <span className="text-sm font-semibold text-white">{stage.rate.toFixed(2)}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Bottom metrics */}
      <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-[280px]">
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <p className="text-[10px] text-slate-400 uppercase">Add to Cart</p>
          <p className="text-lg font-bold text-white">0</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <p className="text-[10px] text-slate-400 uppercase">Frequência</p>
          <p className="text-lg font-bold text-white">3.98</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <p className="text-[10px] text-slate-400 uppercase">CPM</p>
          <p className="text-lg font-bold text-white">R$ 25.13</p>
        </div>
      </div>
    </div>
  );
}
