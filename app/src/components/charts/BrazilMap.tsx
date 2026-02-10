import { cn } from '@/lib/utils';

interface BrazilMapProps {
  data: { state: string; value: number; name: string }[];
  className?: string;
}

// Simplified Brazil map with states as paths
const brazilStates = [
  { code: 'AC', path: 'M45,180 L55,175 L60,185 L50,190 Z', name: 'Acre' },
  { code: 'AL', path: 'M420,140 L430,135 L435,145 L425,150 Z', name: 'Alagoas' },
  { code: 'AM', path: 'M80,80 L150,70 L160,120 L100,140 L70,120 Z', name: 'Amazonas' },
  { code: 'AP', path: 'M200,40 L220,35 L225,50 L205,55 Z', name: 'Amapá' },
  { code: 'BA', path: 'M320,120 L380,110 L390,150 L350,170 L320,150 Z', name: 'Bahia' },
  { code: 'CE', path: 'M380,90 L400,85 L405,100 L385,105 Z', name: 'Ceará' },
  { code: 'DF', path: 'M280,155 L290,150 L295,160 L285,165 Z', name: 'Distrito Federal' },
  { code: 'ES', path: 'M340,190 L355,185 L360,200 L345,205 Z', name: 'Espírito Santo' },
  { code: 'GO', path: 'M250,140 L290,135 L295,165 L255,170 Z', name: 'Goiás' },
  { code: 'MA', path: 'M300,70 L350,65 L355,90 L305,95 Z', name: 'Maranhão' },
  { code: 'MG', path: 'M290,160 L340,155 L345,195 L300,200 Z', name: 'Minas Gerais' },
  { code: 'MS', path: 'M200,180 L250,175 L255,210 L205,215 Z', name: 'Mato Grosso do Sul' },
  { code: 'MT', path: 'M180,130 L250,125 L255,175 L185,180 Z', name: 'Mato Grosso' },
  { code: 'PA', path: 'M200,60 L300,55 L310,100 L210,110 Z', name: 'Pará' },
  { code: 'PB', path: 'M410,115 L425,110 L430,125 L415,130 Z', name: 'Paraíba' },
  { code: 'PE', path: 'M400,105 L420,100 L425,115 L405,120 Z', name: 'Pernambuco' },
  { code: 'PI', path: 'M340,85 L370,80 L375,105 L345,110 Z', name: 'Piauí' },
  { code: 'PR', path: 'M260,220 L310,215 L315,250 L265,255 Z', name: 'Paraná' },
  { code: 'RJ', path: 'M320,205 L340,200 L345,220 L325,225 Z', name: 'Rio de Janeiro' },
  { code: 'RN', path: 'M415,100 L430,95 L435,110 L420,115 Z', name: 'Rio Grande do Norte' },
  { code: 'RO', path: 'M120,160 L160,155 L165,185 L125,190 Z', name: 'Rondônia' },
  { code: 'RR', path: 'M130,50 L160,45 L165,70 L135,75 Z', name: 'Roraima' },
  { code: 'RS', path: 'M250,260 L310,255 L315,290 L255,295 Z', name: 'Rio Grande do Sul' },
  { code: 'SC', path: 'M270,245 L310,240 L315,265 L275,270 Z', name: 'Santa Catarina' },
  { code: 'SE', path: 'M405,135 L420,130 L425,145 L410,150 Z', name: 'Sergipe' },
  { code: 'SP', path: 'M280,195 L330,190 L335,230 L285,235 Z', name: 'São Paulo' },
  { code: 'TO', path: 'M280,100 L320,95 L325,130 L285,135 Z', name: 'Tocantins' },
];

export function BrazilMap({ data, className }: BrazilMapProps) {
  
  const maxValue = Math.max(...data.map(d => d.value));
  
  const getStateValue = (stateCode: string) => {
    const stateData = data.find(d => d.state === stateCode);
    return stateData ? stateData.value : 0;
  };
  
  const getStateColor = (stateCode: string) => {
    const value = getStateValue(stateCode);
    if (value === 0) return '#1E293B';
    const intensity = value / maxValue;
    // Orange gradient from dark to light
    const r = Math.floor(249 + (255 - 249) * (1 - intensity));
    const g = Math.floor(115 + (255 - 115) * (1 - intensity));
    const b = Math.floor(22 + (255 - 22) * (1 - intensity));
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 500 350"
        className="w-full h-auto"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}
      >
        {/* Background */}
        <rect width="500" height="350" fill="transparent" />
        
        {/* States */}
        {brazilStates.map((state) => (
          <path
            key={state.code}
            d={state.path}
            fill={getStateColor(state.code)}
            stroke="#334155"
            strokeWidth="1"
            className="transition-all duration-300 hover:opacity-80 cursor-pointer"
          >
            <title>{`${state.name}: ${getStateValue(state.code).toLocaleString()} acessos`}</title>
          </path>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1E293B' }} />
          <span className="text-xs text-slate-400">0</span>
        </div>
        <div className="w-24 h-2 rounded-full bg-gradient-to-r from-[#1E293B] via-[#F97316] to-[#FDBA74]" />
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FDBA74' }} />
          <span className="text-xs text-slate-400">{maxValue.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
