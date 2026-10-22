import React from 'react';
import { Download, Copy, Check, QrCode, RefreshCw, AlertCircle, Image as ImageIcon } from 'lucide-react';
import type { QRGenerationResult } from '../types';

interface QRPreviewProps {
  result: QRGenerationResult | null;
  error: string | null;
  isGenerating: boolean;
  copyFeedback: boolean;
  imageCopyFeedback: boolean;
  onDownload: () => void;
  onCopyContent: () => void;
  onCopyImage: () => void;
  onRegenerate: () => void;
}

export const QRPreview: React.FC<QRPreviewProps> = ({
  result,
  error,
  isGenerating,
  copyFeedback,
  imageCopyFeedback,
  onDownload,
  onCopyContent,
  onCopyImage,
  onRegenerate,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 flex flex-col justify-between h-full">
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Preview</span>
            {result && !error && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Ready to scan
              </span>
            )}
          </div>

          {result && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono font-medium">
              <span>{result.size}×{result.size}px</span>
              <span>•</span>
              <span>Level {result.errorCorrectionLevel}</span>
            </div>
          )}
        </div>

        {/* QR Display Card Area */}
        <div className="relative aspect-square max-w-[340px] mx-auto w-full rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-6 sm:p-8 transition-all overflow-hidden">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="text-xs font-semibold text-slate-500">Rendering QR...</span>
            </div>
          ) : result && !error ? (
            <div className="relative group flex items-center justify-center w-full h-full">
              <img
                id="generated-qr-image"
                src={result.dataUrl}
                alt={`QR code encoding ${result.content.substring(0, 30)}`}
                className="max-h-full max-w-full object-contain rounded-lg shadow-sm transition-transform group-hover:scale-[1.02]"
              />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center text-center p-4 text-rose-500">
              <AlertCircle className="w-10 h-10 mb-2 stroke-[1.8]" />
              <p className="text-xs font-semibold text-rose-600 max-w-[240px] leading-relaxed">
                {error}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center p-4 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center mb-3 shadow-xs">
                <QrCode className="w-7 h-7 text-slate-400 stroke-[1.5]" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Your QR Code</p>
              <p className="text-xs text-slate-500 max-w-[220px]">
                Enter a link or text on the left to see the instant live preview.
              </p>
            </div>
          )}
        </div>

        {/* Status text badge below preview */}
        {result && !error && (
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500 font-medium truncate px-2" title={result.content}>
              <span className="text-slate-400">Encodes: </span>
              <span className="text-slate-700 font-mono">{result.content}</span>
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5">
        {/* Download Button (Primary) */}
        <button
          id="btn-download-qr"
          type="button"
          onClick={onDownload}
          disabled={!result || !!error || isGenerating}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-md shadow-indigo-100 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Download className="w-4 h-4" />
          <span>Download PNG</span>
        </button>

        {/* Secondary Buttons Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Copy Content */}
          <button
            id="btn-copy-content"
            type="button"
            onClick={onCopyContent}
            disabled={!result || !!error}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
              copyFeedback
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:bg-slate-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Copy encoded text or URL"
          >
            {copyFeedback ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          {/* Copy Image */}
          <button
            id="btn-copy-image"
            type="button"
            onClick={onCopyImage}
            disabled={!result || !!error}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
              imageCopyFeedback
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 active:bg-slate-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Copy QR image to clipboard"
          >
            {imageCopyFeedback ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Image</span>
              </>
            )}
          </button>

          {/* Regenerate */}
          <button
            id="btn-regenerate-qr"
            type="button"
            onClick={onRegenerate}
            disabled={!result || !!error}
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Regenerate QR Code"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
