import React, { useState, useRef, useEffect } from 'react';
import type { ActiveTab } from '../types';
import { AboutModal } from './AboutModal';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onClearHistory?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onClearHistory }) => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<'file' | 'view' | 'tools' | 'help' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div ref={menuRef} className="w-full bg-[#D4D0C8] border-b border-[#808080] select-none">
        {/* Windows 2000 Classic Title Bar */}
        <div className="win-titlebar px-2 py-1">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-xs">💾</span>
            <span className="font-bold text-xs truncate tracking-wide">
              PPLQR Studio v2.0 (Build 2003) - [ISO/IEC 18004 2D Utility]
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              type="button"
              className="win-titlebar-btn"
              title="Minimize"
              onClick={() => {}}
            >
              _
            </button>
            <button
              type="button"
              className="win-titlebar-btn"
              title="Maximize"
              onClick={() => {}}
            >
              □
            </button>
            <button
              type="button"
              className="win-titlebar-btn text-rose-800"
              title="Close / Exit"
              onClick={() => setIsAboutOpen(true)}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Windows 2000 Classic Menu Bar */}
        <div className="win-menubar relative flex items-center text-xs px-1 py-0.5">
          {/* File Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'file' ? null : 'file')}
              className={`win-menu-item text-xs font-sans ${openMenu === 'file' ? 'win-menu-item-active' : ''}`}
            >
              <u>F</u>ile
            </button>
            {openMenu === 'file' && (
              <div className="win-window absolute left-0 top-full z-50 bg-[#D4D0C8] border border-[#808080] shadow-md py-1 min-w-[200px] text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('generator');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex justify-between"
                >
                  <span>⚡ New QR Code (Generator)</span>
                  <span className="text-slate-500 font-mono text-[10px]">Ctrl+G</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('scanner');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex justify-between"
                >
                  <span>🔍 Acquire Image (Scanner)</span>
                  <span className="text-slate-500 font-mono text-[10px]">Ctrl+S</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('archiver');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex justify-between"
                >
                  <span>🗜️ Compress Files (WinRAR)</span>
                  <span className="text-slate-500 font-mono text-[10px]">Ctrl+W</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('log');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex justify-between"
                >
                  <span>📋 System Activity Log</span>
                  <span className="text-slate-500 font-mono text-[10px]">Ctrl+L</span>
                </button>
                <div className="border-t border-[#808080] my-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAboutOpen(true);
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white"
                >
                  Properties...
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'view' ? null : 'view')}
              className={`win-menu-item text-xs font-sans ${openMenu === 'view' ? 'win-menu-item-active' : ''}`}
            >
              <u>V</u>iew
            </button>
            {openMenu === 'view' && (
              <div className="win-window absolute left-0 top-full z-50 bg-[#D4D0C8] border border-[#808080] shadow-md py-1 min-w-[180px] text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('generator');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex items-center justify-between"
                >
                  <span>Generator Bay</span>
                  {activeTab === 'generator' && <span>✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('scanner');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex items-center justify-between"
                >
                  <span>Optical Scanner Bay</span>
                  {activeTab === 'scanner' && <span>✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('archiver');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex items-center justify-between"
                >
                  <span>WinRAR Archiver Bay</span>
                  {activeTab === 'archiver' && <span>✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('log');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex items-center justify-between"
                >
                  <span>Activity Audit Log</span>
                  {activeTab === 'log' && <span>✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Tools Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'tools' ? null : 'tools')}
              className={`win-menu-item text-xs font-sans ${openMenu === 'tools' ? 'win-menu-item-active' : ''}`}
            >
              <u>T</u>ools
            </button>
            {openMenu === 'tools' && (
              <div className="win-window absolute left-0 top-full z-50 bg-[#D4D0C8] border border-[#808080] shadow-md py-1 min-w-[200px] text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('archiver');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex items-center gap-1.5"
                >
                  <span>🗜️ WinRAR Compression Utility...</span>
                </button>
                <div className="border-t border-[#808080] my-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    if (onClearHistory) onClearHistory();
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white"
                >
                  Purge History Buffer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onTabChange('log');
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white"
                >
                  Inspect System Audit Log
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === 'help' ? null : 'help')}
              className={`win-menu-item text-xs font-sans ${openMenu === 'help' ? 'win-menu-item-active' : ''}`}
            >
              <u>H</u>elp
            </button>
            {openMenu === 'help' && (
              <div className="win-window absolute left-0 top-full z-50 bg-[#D4D0C8] border border-[#808080] shadow-md py-1 min-w-[200px] text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsAboutOpen(true);
                    setOpenMenu(null);
                  }}
                  className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex items-center gap-2"
                >
                  <span>About PPLQR Studio...</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Help Shortcut on far right */}
          <button
            type="button"
            onClick={() => setIsAboutOpen(true)}
            className="ml-auto text-[11px] text-[#0A246A] hover:underline px-2 py-0.5"
          >
            [?] About
          </button>
        </div>
      </div>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
};
