import React, { useState } from 'react';
import { QrCode, Sparkles, ScanLine, Info, ShieldCheck } from 'lucide-react';
import type { ActiveTab } from '../types';
import { AboutModal } from './AboutModal';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-md shadow-indigo-200 transition-transform hover:scale-105">
              <QrCode className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                  QR <span className="text-indigo-600">Studio</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <ShieldCheck className="w-3 h-3" />
                  Client-side
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60" aria-label="Main Navigation">
              <button
                id="nav-tab-generator"
                type="button"
                onClick={() => onTabChange('generator')}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'generator'
                    ? 'bg-white text-indigo-700 shadow-sm shadow-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
                }`}
                aria-pressed={activeTab === 'generator'}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generator</span>
              </button>

              <button
                id="nav-tab-scanner"
                type="button"
                onClick={() => onTabChange('scanner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'scanner'
                    ? 'bg-white text-indigo-700 shadow-sm shadow-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
                }`}
                aria-pressed={activeTab === 'scanner'}
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>Scanner</span>
              </button>
            </nav>

            {/* About Button */}
            <button
              id="nav-about-btn"
              type="button"
              onClick={() => setIsAboutOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
              title="About QR Studio"
            >
              <Info className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">About</span>
            </button>
          </div>
        </div>
      </header>

      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
};
