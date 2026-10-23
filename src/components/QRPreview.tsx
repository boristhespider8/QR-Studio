import React, { useState } from 'react';
import type { QRGenerationResult } from '../types';

interface QRPreviewProps {
  result: QRGenerationResult | null;
  error: string | null;
  isGenerating: boolean;
  copyFeedback: boolean;
  imageCopyFeedback: boolean;
  asciiCopyFeedback: boolean;
  onDownloadPng: () => void;
  onDownloadSvg: () => void;
  onDownloadAscii: () => void;
  onCopyContent: () => void;
  onCopyImage: () => void;
  onCopyAscii: () => void;
  onArchiveWithWinrar?: () => void;
}

export const QRPreview: React.FC<QRPreviewProps> = ({
  result,
  error,
  isGenerating,
  copyFeedback,
  imageCopyFeedback,
  asciiCopyFeedback,
  onDownloadPng,
  onDownloadSvg,
  onDownloadAscii,
  onCopyContent,
  onCopyImage,
  onCopyAscii,
  onArchiveWithWinrar,
}) => {
  const [viewMode, setViewMode] = useState<'matrix' | 'ascii'>('matrix');

  return (
    <fieldset className="win-groupbox flex flex-col justify-between h-full bg-[#D4D0C8]">
      <legend className="flex items-center gap-2">
        <span>Hardware Preview Viewport</span>
        <span className="text-[10px] text-slate-600 font-normal">[CRT Output Bay]</span>
      </legend>

      {/* Viewport Top Bar / HUD */}
      <div className="flex items-center justify-between mb-2 px-1 text-[11px]">
        {/* LED Indicator */}
        <div className="flex items-center gap-1.5 font-mono">
          {isGenerating ? (
            <span className="inline-flex items-center gap-1 text-[#B8860B] font-bold">
              <span className="w-2.5 h-2.5 bg-[#FFD700] border border-black animate-pulse inline-block"></span>
              [RENDERING]
            </span>
          ) : result && !error ? (
            <span className="inline-flex items-center gap-1 text-[#008000] font-bold">
              <span className="w-2.5 h-2.5 bg-[#00FF00] border border-black inline-block shadow-[0_0_4px_#00FF00]"></span>
              [READY]
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[#AA0000] font-bold">
              <span className="w-2.5 h-2.5 bg-[#FF0000] border border-black inline-block"></span>
              [WAITING]
            </span>
          )}
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`win-button text-[10px] px-2 py-0.5 ${viewMode === 'matrix' ? 'win-button-pressed font-bold' : ''}`}
          >
            Matrix View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('ascii')}
            className={`win-button text-[10px] px-2 py-0.5 ${viewMode === 'ascii' ? 'win-button-pressed font-bold' : ''}`}
          >
            ASCII/NFO
          </button>
        </div>
      </div>

      {/* CRT Monitor Screen Box */}
      <div className="win-sunken bg-[#001100] text-[#00FF66] p-3 flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden font-mono border-2 border-t-[#808080] border-l-[#808080] border-r-[#FFFFFF] border-b-[#FFFFFF]">
        {/* Pixel Scanline Background Texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #00FF66, #00FF66 1px, transparent 1px, transparent 2px)',
          }}
        ></div>

        {isGenerating ? (
          <div className="flex flex-col items-center gap-2 z-10">
            <span className="text-sm font-bold tracking-widest text-[#00FF66] animate-pulse">
              CALCULATING ISO/IEC 18004 MATRIX...
            </span>
            <span className="text-[10px] text-[#00AA44]">Processing 2D Reed-Solomon Polynomials</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center text-center p-4 text-[#FF5555] z-10">
            <span className="font-bold text-sm mb-1">[!] ENGINE ERROR</span>
            <p className="text-xs max-w-[260px] leading-tight font-sans text-red-300">{error}</p>
          </div>
        ) : result ? (
          viewMode === 'matrix' ? (
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-2">
              <div className="p-2 bg-white border border-[#444] shadow-sm max-w-[280px] max-h-[280px]">
                <img
                  id="generated-qr-image"
                  src={result.dataUrl}
                  alt="Generated QR Code Matrix"
                  className="w-full h-full object-contain block image-rendering-pixelated"
                />
              </div>
              <div className="mt-2 text-[10px] text-[#00FF66] font-mono tracking-wider">
                RES: {result.size}×{result.size}px | ECL: {result.errorCorrectionLevel} | TS: {result.timestamp}
              </div>
            </div>
          ) : (
            <div className="w-full h-full max-h-[300px] overflow-auto z-10 text-[9px] leading-[9px] select-text bg-[#000800] p-2 border border-[#004400]">
              <pre className="whitespace-pre font-mono text-[#00FF66] m-0">
                {result.asciiArt || 'No ASCII representation available.'}
              </pre>
            </div>
          )
        ) : (
          <div className="text-center text-[#008833] z-10">
            <div className="text-base font-bold mb-1">[ SIGNAL IDLE ]</div>
            <div className="text-[11px] font-sans">Input text or link to render hardware matrix</div>
          </div>
        )}
      </div>

      {/* Hardware Details Sunken Strip */}
      {result && !error && (
        <div className="win-sunken bg-white p-1.5 my-2 text-[10px] font-mono text-black truncate select-all flex items-center justify-between">
          <span className="truncate mr-2">PAYLOAD: {result.content}</span>
          <span className="shrink-0 text-slate-500 font-sans">({result.content.length} chars)</span>
        </div>
      )}

      {/* Action Command Buttons */}
      <div className="space-y-1.5 pt-1">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            type="button"
            id="btn-save-png"
            onClick={onDownloadPng}
            disabled={!result || !!error}
            className="win-button font-bold text-xs py-1.5"
            title="Download PNG raster image"
          >
            <span>💾 Save .PNG</span>
          </button>

          <button
            type="button"
            id="btn-save-svg"
            onClick={onDownloadSvg}
            disabled={!result || !result.svgString || !!error}
            className="win-button text-xs py-1.5"
            title="Export vector SVG file"
          >
            <span>📐 Save .SVG</span>
          </button>

          <button
            type="button"
            id="btn-save-ascii"
            onClick={onDownloadAscii}
            disabled={!result || !result.asciiArt || !!error}
            className="win-button text-xs py-1.5"
            title="Export ASCII text file"
          >
            <span>📟 Save .NFO</span>
          </button>

          <button
            type="button"
            id="btn-archive-winrar"
            onClick={onArchiveWithWinrar}
            disabled={!result || !!error}
            className="win-button font-bold text-xs py-1.5 text-[#0A246A]"
            title="Send QR matrix & specs to WinRAR Archiver"
          >
            <span>🗜️ WinRAR .ZIP</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            id="btn-copy-image"
            onClick={onCopyImage}
            disabled={!result || !!error}
            className={`win-button text-[11px] ${imageCopyFeedback ? 'win-button-pressed font-bold' : ''}`}
            title="Copy PNG blob to system clipboard"
          >
            <span>{imageCopyFeedback ? '✓ Copied' : '📋 Copy Image'}</span>
          </button>

          <button
            type="button"
            id="btn-copy-payload"
            onClick={onCopyContent}
            disabled={!result || !!error}
            className={`win-button text-[11px] ${copyFeedback ? 'win-button-pressed font-bold' : ''}`}
            title="Copy plain text payload to clipboard"
          >
            <span>{copyFeedback ? '✓ Copied' : '📄 Copy Text'}</span>
          </button>

          <button
            type="button"
            id="btn-copy-ascii"
            onClick={onCopyAscii}
            disabled={!result || !result.asciiArt || !!error}
            className={`win-button text-[11px] ${asciiCopyFeedback ? 'win-button-pressed font-bold' : ''}`}
            title="Copy ASCII art to clipboard"
          >
            <span>{asciiCopyFeedback ? '✓ Copied' : '📟 Copy ASCII'}</span>
          </button>
        </div>
      </div>
    </fieldset>
  );
};
