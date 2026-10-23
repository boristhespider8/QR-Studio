import React, { useState } from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'specs' | 'license'>('general');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-none select-none font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="win-window max-w-md w-full p-1 bg-[#D4D0C8] shadow-2xl">
        {/* Title Bar */}
        <div className="win-titlebar mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">💾</span>
            <span id="about-dialog-title" className="text-xs font-bold tracking-wide">
              System Properties &amp; About PPLQR.EXE
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="win-titlebar-btn"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Tab Strip */}
        <div className="win-tab-container px-2 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`win-tab ${activeTab === 'general' ? 'win-tab-active' : ''}`}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`win-tab ${activeTab === 'specs' ? 'win-tab-active' : ''}`}
          >
            Engine Specs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('license')}
            className={`win-tab ${activeTab === 'license' ? 'win-tab-active' : ''}`}
          >
            Privacy &amp; EULA
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-3 bg-[#D4D0C8] space-y-3 min-h-[220px]">
          {activeTab === 'general' && (
            <div className="space-y-3">
              <div className="flex items-start gap-4">
                {/* Classic PC Hardware Icon */}
                <div className="w-16 h-16 bg-[#D4D0C8] border-2 border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#808080] border-b-[#808080] flex flex-col items-center justify-center shrink-0">
                  <span className="text-2xl">🖥️</span>
                  <span className="text-[9px] font-mono font-bold mt-0.5">v2.0</span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="font-bold text-sm text-[#0A246A]">
                    PPLQR Studio Professional
                  </div>
                  <div className="text-[11px] text-black">
                    Authentic Early 2000s Desktop Edition
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">
                    Build 2003.SP2 (ISO/IEC 18004 Compliant)
                  </div>
                  <div className="text-[10px] text-slate-600">
                    Copyright © 2000–2026 PPLQR Software Labs.
                  </div>
                </div>
              </div>

              <div className="border-t border-[#808080] pt-2 text-xs space-y-1">
                <div className="font-bold">Registered Operating Environment:</div>
                <div className="win-sunken bg-white p-2 font-mono text-[11px] text-black space-y-0.5">
                  <div>Host OS    : Windows NT / Modern Browser Sandbox</div>
                  <div>Security   : 100% Client-Side In-Memory Execution</div>
                  <div>Telemetry  : 0.00% (Strictly Zero Network Calls)</div>
                  <div>Storage    : LocalStorage Session Cache (Max 10)</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-2 text-xs">
              <div className="font-bold">Core Processing Libraries:</div>
              <div className="win-sunken bg-white p-2 font-mono text-[10px] space-y-1 text-black">
                <div className="text-[#0A246A] font-bold">1. Matrix Generator (qrcode v1.5.4):</div>
                <div className="pl-2">
                  - 2D Reed-Solomon polynomial error correction (L, M, Q, H)<br/>
                  - Raster PNG export &amp; Vector SVG generator<br/>
                  - ANSI/ASCII text terminal block art engine
                </div>

                <div className="text-[#0A246A] font-bold mt-1">2. Optical Matrix Decoder (jsQR v1.4.0):</div>
                <div className="pl-2">
                  - HTML5 Canvas 2D pixel extraction ({'{'} willReadFrequently: true {'}'})<br/>
                  - Dual-pass resolution downscaling (2048px -&gt; 800px fallback)<br/>
                  - Computer vision neon green bounding box annotation
                </div>

                <div className="text-[#0A246A] font-bold mt-1">3. WinRAR Archiver Engine (fflate v0.8 &amp; Web Streams):</div>
                <div className="pl-2">
                  - Multi-format: ZIP (Deflate), TAR.GZ (GNU Zip), TAR (POSIX), GZ, CompressionStream<br/>
                  - Compression Levels: Store (0), Fastest (1), Fast (3), Normal (6), Good (7), Best (9)<br/>
                  - IEEE 802.3 32-bit CRC-32 validation &amp; ZIP inspection/extraction
                </div>
              </div>
            </div>
          )}

          {activeTab === 'license' && (
            <div className="space-y-2 text-xs">
              <div className="font-bold">Privacy Guarantee &amp; Terms:</div>
              <textarea
                readOnly
                rows={7}
                className="win-sunken w-full p-2 text-[10px] font-mono bg-white text-black resize-none"
                value={`PPLQR STUDIO END USER PRIVACY STATEMENT:

1. ZERO SERVER TRANSMISSION:
All payloads, plain texts, WiFi passwords, and uploaded image files are processed exclusively within the local browser memory heap. No remote servers receive your data.

2. LOCAL DATA HYGIENE:
Recent activities are maintained in your personal browser's localStorage. You retain complete authority to purge audit records at any moment.

3. SAFE REDIRECTION:
Scanned hyperlinks will not auto-navigate. All link opening uses strict 'noopener noreferrer' sandboxing.`}
              />
            </div>
          )}
        </div>

        {/* Dialog Bottom Actions */}
        <div className="flex justify-end gap-2 p-2 bg-[#D4D0C8] border-t border-[#808080]">
          <button
            type="button"
            id="btn-about-ok"
            onClick={onClose}
            className="win-button font-bold text-xs px-6 py-1"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
