import React from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import type { ScanResultData, ScanStatus } from '../types';

interface ScanResultProps {
  status: ScanStatus;
  selectedFile: File | null;
  imagePreviewUrl: string | null;
  result: ScanResultData | null;
  errorMessage: string | null;
  copyFeedback: boolean;
  onCopyResult: () => void;
  onOpenUrl: () => void;
  onReset: () => void;
}

export const ScanResult: React.FC<ScanResultProps> = ({
  status,
  selectedFile,
  imagePreviewUrl,
  result,
  errorMessage,
  copyFeedback,
  onCopyResult,
  onOpenUrl,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          {status === 'processing' && (
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing image pixels...</span>
            </div>
          )}

          {status === 'success' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>QR Code detected</span>
            </div>
          )}

          {status === 'error' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Scan Unsuccessful</span>
            </div>
          )}
        </div>

        <button
          id="btn-scan-another"
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove Image</span>
        </button>
      </div>

      {/* Main Grid: Uploaded Preview & Scanned Output */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Uploaded Image Preview */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="w-full aspect-square max-w-[260px] rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-2 relative shadow-xs">
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt="Uploaded QR Code preview"
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            ) : (
              <span className="text-xs text-slate-400">No preview</span>
            )}

            {status === 'processing' && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                <RefreshCw className="w-7 h-7 animate-spin mb-2" />
                <span className="text-xs font-medium">Scanning...</span>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="mt-2 text-center">
              <p className="text-[11px] font-medium text-slate-500 truncate max-w-[240px]">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}
        </div>

        {/* Right: Decoding Result or Error */}
        <div className="md:col-span-7 space-y-4">
          {status === 'processing' && (
            <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-100">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800 mb-1">Processing QR Data</h4>
              <p className="text-xs text-slate-500">
                Decoding canvas pixels with jsQR...
              </p>
            </div>
          )}

          {status === 'success' && result && (
            <div className="space-y-4">
              {/* Type Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Content Type:</span>
                {result.isUrl ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    <LinkIcon className="w-3.5 h-3.5" />
                    Web Link (URL)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    <FileText className="w-3.5 h-3.5" />
                    Plain Text
                  </span>
                )}
              </div>

              {/* Scanned Content Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Decoded Content:
                </label>
                <div className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs sm:text-sm break-all leading-relaxed max-h-48 overflow-y-auto border border-slate-800 shadow-inner select-all">
                  {result.text}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {/* Copy Button */}
                <button
                  id="btn-copy-scan-result"
                  type="button"
                  onClick={onCopyResult}
                  className={`flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    copyFeedback
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                  }`}
                >
                  {copyFeedback ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Result</span>
                    </>
                  )}
                </button>

                {/* Open Link Button (Only if valid URL) */}
                {result.isUrl && result.url && (
                  <button
                    id="btn-open-scanned-url"
                    type="button"
                    onClick={onOpenUrl}
                    className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all shadow-xs"
                    title="Open link in a new tab"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                    <span>Open Link</span>
                  </button>
                )}

                {/* Scan Another Image */}
                <button
                  type="button"
                  onClick={onReset}
                  className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Scan Another</span>
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Detection Failed</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  {errorMessage || 'Could not find a valid QR Code in this image.'}
                </p>
              </div>

              {/* Troubleshooting Tips */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <p className="font-semibold text-slate-800">Troubleshooting tips:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-500">
                  <li>Make sure the QR code is clearly visible and not blurry.</li>
                  <li>Check that the entire QR code (including all four corner patterns) is within the picture.</li>
                  <li>Avoid high glare or reflection on screens and glossy paper.</li>
                </ul>
              </div>

              <div>
                <button
                  type="button"
                  onClick={onReset}
                  className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Another Image</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
