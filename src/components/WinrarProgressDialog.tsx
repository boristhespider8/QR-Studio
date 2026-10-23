import React from 'react';
import type { ArchiveResult } from '../types';
import { formatBytes } from '../utils/compression';

interface WinrarProgressDialogProps {
  isOpen: boolean;
  archiveName: string;
  progress: number;
  currentFile: string;
  isFinished: boolean;
  result: ArchiveResult | null;
  error: string | null;
  onDownload: () => void;
  onClose: () => void;
  onInspect?: () => void;
}

export const WinrarProgressDialog: React.FC<WinrarProgressDialogProps> = ({
  isOpen,
  archiveName,
  progress,
  currentFile,
  isFinished,
  result,
  error,
  onDownload,
  onClose,
  onInspect,
}) => {
  if (!isOpen) return null;

  const savedPercent = result
    ? Math.max(0, 100 - result.compressionRatio).toFixed(1)
    : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 win-modal-backdrop select-none">
      <div className="win-window w-full max-w-lg shadow-2xl bg-[#D4D0C8] flex flex-col border-2 border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#000000] border-b-[#000000]">
        {/* WinRAR Classic Titlebar */}
        <div className="win-titlebar px-2 py-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            {/* WinRAR Book Stack Mini Icon */}
            <span className="text-sm">🗜️</span>
            <span className="font-bold text-xs truncate">
              {isFinished
                ? `WinRAR: Archiving finished - [${archiveName}]`
                : `WinRAR: Archiving to [${archiveName}]...`}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="win-titlebar-btn font-bold"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-3 flex flex-col gap-3 text-xs">
          {/* Top Status & Retro Book Animation Header */}
          <div className="flex items-start gap-3 bg-[#E4E0D8] p-2 border border-[#808080]">
            {/* Authentic WinRAR Book Stack SVG Icon */}
            <div className="w-12 h-12 shrink-0 bg-[#FFFFFF] border border-[#808080] shadow-inner flex flex-col items-center justify-center p-1 relative overflow-hidden">
              <div className="w-8 h-2.5 bg-[#004080] border border-black shadow-xs mb-0.5 rounded-none flex items-center justify-end pr-0.5">
                <span className="w-1 h-1 bg-white inline-block"></span>
              </div>
              <div className="w-8 h-2.5 bg-[#008000] border border-black shadow-xs mb-0.5 rounded-none flex items-center justify-end pr-0.5">
                <span className="w-1 h-1 bg-white inline-block"></span>
              </div>
              <div className="w-8 h-2.5 bg-[#B22222] border border-black shadow-xs rounded-none flex items-center justify-end pr-0.5">
                <span className="w-1 h-1 bg-white inline-block"></span>
              </div>
              {/* Belt across books */}
              <div className="absolute inset-y-0 w-2.5 left-3 bg-[#D4AF37] border-x border-black/60 opacity-90 flex items-center justify-center">
                <div className="w-1.5 h-1.5 border border-black bg-white/80"></div>
              </div>
              {/* Subtle animated processing sparkle if packing */}
              {!isFinished && !error && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 animate-ping"></div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-bold text-[12px] text-[#0A246A] truncate">
                {isFinished
                  ? 'Archive Created Successfully'
                  : 'Compressing files into archive...'}
              </div>
              <div className="text-[11px] text-[#404040] font-mono truncate mt-0.5">
                {error
                  ? `Error: ${error}`
                  : isFinished
                  ? `Completed in ${result?.durationMs ?? 0} ms • CRC32 Verified`
                  : `Current file: ${currentFile || 'Initializing...'}`}
              </div>
            </div>
          </div>

          {error ? (
            <div className="p-3 bg-[#FFF0F0] border border-[#AA0000] text-[#AA0000] font-bold">
              Archiving failed: {error}
            </div>
          ) : (
            <>
              {/* Progress Bar 1: Total Progress */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Total progress:</span>
                  <span className="font-bold">{progress}%</span>
                </div>
                <div className="win-progress-well w-full">
                  <div
                    className="win-progress-fill-blue"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  ></div>
                </div>
              </div>

              {/* Progress Bar 2: Current Task / File */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="truncate">Current: {currentFile || 'Finalizing'}</span>
                  <span>{isFinished ? '100%' : `${Math.min(100, progress + 10)}%`}</span>
                </div>
                <div className="win-progress-well w-full">
                  <div
                    className="win-progress-fill-green"
                    style={{
                      width: `${
                        isFinished
                          ? 100
                          : Math.min(100, Math.max(0, (progress * 1.2) % 100))
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Classic WinRAR Statistics Groupbox */}
              <fieldset className="win-groupbox p-2 text-[11px] font-mono">
                <legend className="font-bold font-sans">Archiving Statistics</legend>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#555]">Original size:</span>
                    <span className="font-bold">
                      {result ? formatBytes(result.uncompressedSize) : 'Computing...'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#555]">Packed size:</span>
                    <span className="font-bold text-[#0A246A]">
                      {result ? formatBytes(result.compressedSize) : 'Computing...'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#555]">Compression ratio:</span>
                    <span className="font-bold">
                      {result ? `${result.compressionRatio}%` : 'Calculating...'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#555]">Space saved:</span>
                    <span className="font-bold text-[#008000]">
                      {result ? `-${savedPercent}%` : 'Calculating...'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#555]">Files packed:</span>
                    <span className="font-bold">
                      {result ? result.fileCount : '...'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#555]">Engine / Level:</span>
                    <span className="font-bold truncate">
                      {result ? `${result.engine.toUpperCase()} (L${result.level})` : '...'}
                    </span>
                  </div>
                </div>
              </fieldset>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#808080] mt-1">
            <div className="text-[10px] text-[#555]">
              {isFinished ? 'Status: 100% Ready' : 'Processing client-side RAM...'}
            </div>

            <div className="flex items-center gap-2">
              {isFinished && result && (
                <>
                  <button
                    type="button"
                    onClick={onDownload}
                    className="win-button font-bold px-3 py-1 bg-[#D4D0C8] border-2"
                  >
                    <span>💾 Save Archive to Disk</span>
                  </button>

                  {onInspect && (
                    <button
                      type="button"
                      onClick={onInspect}
                      className="win-button px-2 py-1"
                    >
                      <span>🔍 Inspect</span>
                    </button>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="win-button px-4 py-1"
              >
                {isFinished ? 'Done' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
