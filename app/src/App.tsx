import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { OverviewView } from '@/views/OverviewView';
import { MetaAdsView } from '@/views/MetaAdsView';
import { GoogleAdsView } from '@/views/GoogleAdsView';
import { AnalyticsView } from '@/views/AnalyticsView';
import { MobileView } from '@/views/MobileView';
import type { ViewType } from '@/types';
import './i18n';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [dateRange] = useState('Aug 1, 2025 - Aug 11, 2025');

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewView />;
      case 'metaAds':
        return <MetaAdsView />;
      case 'googleAds':
        return <GoogleAdsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'mobile':
        return <MobileView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          currentView={currentView}
          dateRange={dateRange}
        />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
