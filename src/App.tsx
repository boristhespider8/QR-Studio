import React, { useState, useCallback } from 'react';
import type { ActiveTab, ActivityItem, ArchiveFileItem, QRGenerationResult } from './types';
import { Navbar } from './components/Navbar';
import { GeneratorPanel } from './components/GeneratorPanel';
import { ScannerPanel } from './components/ScannerPanel';
import { WinrarCompressor } from './components/WinrarCompressor';
import { RecentActivity } from './components/RecentActivity';
import { Footer } from './components/Footer';
import { calculateCrc32 } from './utils/compression';
import {
  loadRecentActivities,
  saveActivityItem,
  clearAllActivities,
} from './utils/storage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');
  // Initialize state directly from storage to prevent cascading renders warning
  const [activities, setActivities] = useState<ActivityItem[]>(() => loadRecentActivities());
  // Preloaded files queue for WinRAR
  const [preloadedArchiveFiles, setPreloadedArchiveFiles] = useState<ArchiveFileItem[]>([]);
  const [activeQrResult, setActiveQrResult] = useState<QRGenerationResult | null>(null);

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

  // When user clicks "WinRAR Archive" in QR Preview
  const handleArchiveQrCode = useCallback((result: QRGenerationResult) => {
    setActiveQrResult(result);
    try {
      const base64Data = result.dataUrl.split(',')[1];
      const binaryStr = atob(base64Data);
      const pngBytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        pngBytes[i] = binaryStr.charCodeAt(i);
      }

      const pngItem: ArchiveFileItem = {
        id: `qr-img-${Date.now()}`,
        name: `QRCode_${result.size}x${result.size}_${result.errorCorrectionLevel}.png`,
        size: pngBytes.length,
        data: pngBytes,
        type: 'image/png',
        lastModified: result.timestamp || Date.now(),
        crc32: calculateCrc32(pngBytes),
      };

      const metaContent =
        `=======================================================\n` +
        ` PPLQR STUDIO 2.0 - MATRIX SPECIFICATION\n` +
        ` Generated: ${new Date(result.timestamp).toLocaleString()}\n` +
        ` Resolution: ${result.size}x${result.size} px\n` +
        ` Error Correction Level: ${result.errorCorrectionLevel}\n` +
        ` Payload: ${result.content}\n` +
        ` CRC-32: ${pngItem.crc32}\n` +
        `=======================================================\n\n` +
        `ASCII MATRIX:\n` +
        `${result.asciiArt || ''}\n`;

      const metaBytes = new TextEncoder().encode(metaContent);
      const metaItem: ArchiveFileItem = {
        id: `qr-meta-${Date.now()}`,
        name: `QRCode_Specification.nfo`,
        size: metaBytes.length,
        data: metaBytes,
        type: 'text/plain',
        lastModified: Date.now(),
        crc32: calculateCrc32(metaBytes),
      };

      setPreloadedArchiveFiles([pngItem, metaItem]);
      setActiveTab('archiver');
    } catch (e) {
      console.error('Error packaging QR code to WinRAR:', e);
      setActiveTab('archiver');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#008080] p-1 sm:p-4 flex flex-col items-center justify-start font-sans select-none">
      {/* Main Desktop Window Container (PPLQR_STUDIO.EXE) */}
      <div className="win-window w-full max-w-6xl shadow-2xl flex flex-col bg-[#D4D0C8]">
        {/* Title Bar & Classic Menu Bar */}
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClearHistory={handleClearHistory}
        />

        {/* Folder Tab Strip */}
        <div className="win-tab-container px-2 pt-2 bg-[#D4D0C8]">
          <button
            type="button"
            id="tab-btn-generator"
            onClick={() => setActiveTab('generator')}
            className={`win-tab flex items-center gap-1.5 ${
              activeTab === 'generator' ? 'win-tab-active' : ''
            }`}
          >
            <span>⚡</span>
            <span>Generator Bay</span>
          </button>

          <button
            type="button"
            id="tab-btn-scanner"
            onClick={() => setActiveTab('scanner')}
            className={`win-tab flex items-center gap-1.5 ${
              activeTab === 'scanner' ? 'win-tab-active' : ''
            }`}
          >
            <span>🔍</span>
            <span>Optical Scanner Bay</span>
          </button>

          <button
            type="button"
            id="tab-btn-archiver"
            onClick={() => setActiveTab('archiver')}
            className={`win-tab flex items-center gap-1.5 ${
              activeTab === 'archiver' ? 'win-tab-active' : ''
            }`}
          >
            <span>🗜️</span>
            <span>WinRAR Archiver</span>
          </button>

          <button
            type="button"
            id="tab-btn-log"
            onClick={() => setActiveTab('log')}
            className={`win-tab flex items-center gap-1.5 ${
              activeTab === 'log' ? 'win-tab-active' : ''
            }`}
          >
            <span>📋</span>
            <span>System Activity Log ({activities.length})</span>
          </button>
        </div>

        {/* Window Workspace Content Area */}
        <main className="p-2 sm:p-3 bg-[#D4D0C8] min-h-[500px] flex-1">
          {activeTab === 'generator' && (
            <div id="generator-view" role="tabpanel">
              <GeneratorPanel
                onActivityAdded={handleAddActivity}
                onArchiveWithWinrar={handleArchiveQrCode}
              />
            </div>
          )}

          {activeTab === 'scanner' && (
            <div id="scanner-view" role="tabpanel">
              <ScannerPanel
                onActivityAdded={handleAddActivity}
                isActive={activeTab === 'scanner'}
              />
            </div>
          )}

          {activeTab === 'archiver' && (
            <div id="archiver-view" role="tabpanel">
              <WinrarCompressor
                preloadedFiles={preloadedArchiveFiles}
                currentQrResult={activeQrResult}
                activities={activities}
              />
            </div>
          )}

          {activeTab === 'log' && (
            <div id="activity-log-view" role="tabpanel">
              <RecentActivity
                activities={activities}
                onClearHistory={handleClearHistory}
              />
            </div>
          )}
        </main>

        {/* Bottom Status Bar */}
        <Footer />
      </div>
    </div>
  );
};

export default App;

