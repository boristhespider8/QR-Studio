import React, { useState, useEffect, useCallback } from 'react';
import type { ActiveTab, ActivityItem } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { GeneratorPanel } from './components/GeneratorPanel';
import { ScannerPanel } from './components/ScannerPanel';
import { RecentActivity } from './components/RecentActivity';
import { Footer } from './components/Footer';
import {
  loadRecentActivities,
  saveActivityItem,
  clearAllActivities,
} from './utils/storage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Load activities on mount
  useEffect(() => {
    const stored = loadRecentActivities();
    setActivities(stored);
  }, []);

  const handleAddActivity = useCallback(
    (item: Omit<ActivityItem, 'id' | 'timestamp'>) => {
      const updated = saveActivityItem(item);
      setActivities(updated);
    },
    []
  );

  const handleClearHistory = useCallback(() => {
    clearAllActivities();
    setActivities([]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
        {/* Hero Section */}
        <HeroSection activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Panels */}
        <div id="main-feature-area" className="transition-opacity duration-200">
          {activeTab === 'generator' ? (
            <div
              id="generator-view"
              role="tabpanel"
              aria-labelledby="nav-tab-generator"
            >
              <GeneratorPanel onActivityAdded={handleAddActivity} />
            </div>
          ) : (
            <div
              id="scanner-view"
              role="tabpanel"
              aria-labelledby="nav-tab-scanner"
            >
              <ScannerPanel onActivityAdded={handleAddActivity} />
            </div>
          )}
        </div>

        {/* Recent Activity Section */}
        <div id="recent-activity-section" className="pt-2 sm:pt-4">
          <RecentActivity
            activities={activities}
            onClearHistory={handleClearHistory}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
