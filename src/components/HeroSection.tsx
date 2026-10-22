import React from 'react';
import type { ActiveTab } from '../types';
import { Sparkles, Scan, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ activeTab, onTabChange }) => {
  return (
    <section className="pt-8 pb-6 sm:pt-10 sm:pb-8 text-center px-4 max-w-4xl mx-auto">
      {/* Privacy Tag */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-4 shadow-xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
        <span>100% Private &amp; Runs in Browser</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
        Everything QR, <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Made Simple.</span>
      </h1>

      {/* Concise Subtitle */}
      <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Create QR codes from any link or scan them from an image in seconds.
      </p>

      {/* Main Action Tabs */}
      <div className="mt-6 sm:mt-7 flex items-center justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'generator'}
            id="tab-generator-button"
            onClick={() => onTabChange('generator')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'generator'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate QR</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'scanner'}
            id="tab-scanner-button"
            onClick={() => onTabChange('scanner')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'scanner'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>Scan QR</span>
          </button>
        </div>
      </div>
    </section>
  );
};
