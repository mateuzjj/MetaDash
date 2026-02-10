import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  ChevronDown, 
  Filter, 
  Download, 
  RefreshCw,
  Globe,
  Bell,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ViewType } from '@/types';

interface HeaderProps {
  currentView: ViewType;
  dateRange: string;
  className?: string;
}

const viewTitles: Record<ViewType, { title: string; subtitle: string; icon: string; color: string }> = {
  overview: { 
    title: 'Meta + Google Ads + Analytics', 
    subtitle: 'Relatório Geral de Marketing',
    icon: '🔷',
    color: 'text-blue-400'
  },
  metaAds: { 
    title: 'Meta', 
    subtitle: 'Relatório Meta Ads',
    icon: '∞',
    color: 'text-blue-400'
  },
  googleAds: { 
    title: 'Google Ads', 
    subtitle: 'Relatório Google Ads',
    icon: '▲',
    color: 'text-green-400'
  },
  analytics: { 
    title: 'Analytics', 
    subtitle: 'Relatório Google Analytics',
    icon: '📊',
    color: 'text-orange-400'
  },
  mobile: { 
    title: 'Mobile', 
    subtitle: 'Relatório Mobile',
    icon: '📱',
    color: 'text-purple-400'
  },
};

const languages = [
  { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export function Header({ currentView, dateRange, className }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const viewInfo = viewTitles[currentView];
  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
  };

  return (
    <header className={cn(
      "flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-slate-800",
      className
    )}>
      {/* Left side - Title */}
      <div className="flex items-center gap-4">
        <div className={cn("text-2xl font-bold", viewInfo.color)}>
          {currentView === 'overview' && (
            <span className="flex items-center gap-2">
              <span className="text-blue-400">∞ Meta</span>
              <span className="text-green-400">▲ Google Ads</span>
              <span className="text-orange-400">📊 Analytics</span>
            </span>
          )}
          {currentView === 'metaAds' && <span className="text-blue-400">∞ Meta</span>}
          {currentView === 'googleAds' && <span className="text-green-400">▲ Google Ads</span>}
          {currentView === 'analytics' && <span className="text-orange-400">📊 Analytics</span>}
          {currentView === 'mobile' && <span className="text-purple-400">📱 Mobile</span>}
        </div>
        <div className="h-6 w-px bg-slate-700" />
        <div>
          <p className="text-sm text-slate-400">{viewInfo.subtitle} | <span className="text-slate-300">Nome da Empresa</span></p>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-3">
        {/* Filter buttons */}
        {currentView !== 'overview' && currentView !== 'analytics' && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300"
            >
              <Filter className="h-4 w-4 mr-2" />
              {t('filters.campaign')}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            {currentView === 'googleAds' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300"
                >
                  {t('filters.group')}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300"
                >
                  {t('filters.type')}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}
            {currentView === 'metaAds' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300"
                >
                  {t('filters.ad')}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}
          </>
        )}
        
        {currentView === 'analytics' && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300"
            >
              {t('filters.city')}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300"
            >
              {t('filters.region')}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </>
        )}

        {/* Export buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Date Range */}
        <Button
          variant="outline"
          size="sm"
          className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300"
        >
          <Calendar className="h-4 w-4 mr-2" />
          {dateRange}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>

        {/* Language selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300"
            >
              <Globe className="h-4 w-4 mr-2" />
              {currentLanguage.flag}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button
          variant="outline"
          size="sm"
          className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300 relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center text-white">
            3
          </span>
        </Button>

        {/* User */}
        <Button
          variant="outline"
          size="sm"
          className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300 rounded-full"
        >
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
