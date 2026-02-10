import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Infinity, 
  Triangle, 
  BarChart3, 
  Smartphone,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ViewType } from '@/types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  className?: string;
}

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'navigation.overview', icon: LayoutDashboard },
  { id: 'metaAds', label: 'navigation.metaAds', icon: Infinity },
  { id: 'googleAds', label: 'navigation.googleAds', icon: Triangle },
  { id: 'analytics', label: 'navigation.analytics', icon: BarChart3 },
  { id: 'mobile', label: 'navigation.mobile', icon: Smartphone },
];

export function Sidebar({ currentView, onViewChange, className }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className={cn(
      "flex flex-col h-full w-16 bg-slate-900/80 border-r border-slate-800",
      className
    )}>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">D</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "w-full flex flex-col items-center py-3 px-2 transition-all duration-200",
                    "hover:bg-slate-800/50 group",
                    isActive && "bg-slate-800/80"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-blue-500/20 text-blue-400" 
                      : "text-slate-400 group-hover:text-slate-300"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={cn(
                    "mt-1 text-[10px] font-medium transition-colors",
                    isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400"
                  )}>
                    {t(item.label)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom actions */}
      <div className="py-4 border-t border-slate-800">
        <ul className="space-y-1">
          <li>
            <button className="w-full flex flex-col items-center py-2 px-2 text-slate-400 hover:text-slate-300 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </li>
          <li>
            <button className="w-full flex flex-col items-center py-2 px-2 text-slate-400 hover:text-slate-300 transition-colors">
              <HelpCircle className="h-5 w-5" />
            </button>
          </li>
          <li>
            <button className="w-full flex flex-col items-center py-2 px-2 text-slate-400 hover:text-red-400 transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </li>
        </ul>
      </div>

      {/* Brand */}
      <div className="py-3 border-t border-slate-800 text-center">
        <span className="text-[10px] text-slate-600 font-medium">DashCortex</span>
      </div>
    </aside>
  );
}
