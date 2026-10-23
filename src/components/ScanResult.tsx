import React from 'react';
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
  const displayImage = result?.annotatedDataUrl || imagePreviewUrl;

  return (
    <fieldset className="win-groupbox bg-[#D4D0C8] p-3 space-y-3">
      <legend className="flex items-center gap-2">
        <span>Optical Inspection &amp; Decoder Output</span>
        <span className="text-[10px] text-slate-600 font-normal">[jsQR Engine]</span>
      </legend>

      {/* Top Status Bar */}
      <div className="win-sunken bg-white p-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {status === 'processing' && (
            <span className="font-mono text-[#0A246A] font-bold animate-pulse">
              [ANALYZING PIXELS: Running Dual-Pass Rescaling Matrix Scan...]
            </span>
          )}

          {status === 'success' && (
            <span className="font-mono text-[#008000] font-bold">
              [STATUS: QR MATRIX ACQUIRED &amp; VERIFIED]
            </span>
          )}

          {status === 'error' && (
            <span className="font-mono text-[#AA0000] font-bold">
              [STATUS: PATTERN DETECTION FAILURE]
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onReset}
          className="win-button text-[10px]"
          title="Clear current image buffer"
        >
          ✕ Remove Image
        </button>
      </div>

      {/* Main Grid: Visual Frame + Inspector Properties */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
        {/* Left: Acquired Image Frame */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="win-sunken bg-[#001100] p-2 w-full flex items-center justify-center min-h-[220px] max-h-[300px] overflow-hidden">
            {displayImage ? (
              <img
                src={displayImage}
                alt="Acquired optical frame"
                className="max-h-[240px] max-w-full object-contain block image-rendering-pixelated"
              />
            ) : (
              <span className="text-[#00FF66] font-mono text-xs">[NO SIGNAL]</span>
            )}
          </div>

          {/* Image File Meta */}
          <div className="w-full text-[10px] font-mono text-slate-700 mt-1.5 space-y-0.5">
            <div>FILE: {selectedFile?.name || 'Clipboard_Snapshot.png'}</div>
            {selectedFile && <div>SIZE: {(selectedFile.size / 1024).toFixed(1)} KB</div>}
            {result?.dimensions && (
              <div>CANVAS: {result.dimensions.width}×{result.dimensions.height}px</div>
            )}
            {result?.location && (
              <div className="text-[#008000] font-bold">HUD: GREEN BOUNDING BOX ACTIVE</div>
            )}
          </div>
        </div>

        {/* Right: Decoded Result & Diagnostics */}
        <div className="md:col-span-7 space-y-2">
          {status === 'processing' && (
            <div className="win-sunken bg-white p-4 text-center space-y-2">
              <div className="text-xs font-bold text-[#0A246A]">Decompressing Raster Pixels...</div>
              <div className="w-full h-3 bg-[#D4D0C8] border border-[#808080] overflow-hidden">
                <div className="h-full bg-[#0A246A] w-3/4 animate-pulse"></div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Sampling 2D luminance threshold with attemptBoth inversion
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="win-sunken bg-[#FFEFEF] border border-[#AA0000] p-3 space-y-2 text-xs">
              <div className="font-bold text-[#AA0000]">[!] DECODER REJECTION NOTICE</div>
              <p className="text-[11px] leading-relaxed text-black">{errorMessage}</p>
              <div className="text-[10px] text-slate-700 border-t border-[#D4D0C8] pt-1">
                <span className="font-bold">Remedy Checklist:</span>
                <ul className="list-disc pl-4 space-y-0.5 mt-0.5">
                  <li>Ensure the 3 corner square finder patterns are in-frame.</li>
                  <li>Check image sharpness and glare reflections.</li>
                  <li>Verify image is not inverted beyond standard black/white.</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={onReset}
                className="win-button text-xs font-bold mt-1"
              >
                Scan Another File...
              </button>
            </div>
          )}

          {status === 'success' && result && (
            <div className="space-y-2">
              {/* Type Tag & Timestamp */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">Content Classification:</span>
                  <span className="win-raised bg-[#D4D0C8] px-2 py-0.5 font-bold text-[10px]">
                    {result.isUrl ? '🌐 HTTP/HTTPS URL' : '📄 PLAIN TEXT'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(result.detectedAt).toLocaleTimeString()}
                </span>
              </div>

              {/* Decoded Content Sunken Well */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>Decoded Payload Buffer:</span>
                  <span className="font-mono">{result.text.length} characters</span>
                </div>
                <textarea
                  readOnly
                  rows={5}
                  value={result.text}
                  className="win-sunken w-full p-2 text-xs font-mono bg-white text-black focus:outline-none select-all resize-y"
                />
              </div>

              {/* Actions Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {result.isUrl && result.url && (
                  <button
                    type="button"
                    id="btn-open-scanned-url"
                    onClick={onOpenUrl}
                    className="win-button font-bold text-xs"
                    title="Open external link with noopener/noreferrer guard"
                  >
                    🌐 Open Link in Browser ↗
                  </button>
                )}

                <button
                  type="button"
                  id="btn-copy-scanned-text"
                  onClick={onCopyResult}
                  className={`win-button text-xs ${copyFeedback ? 'win-button-pressed font-bold' : ''}`}
                >
                  {copyFeedback ? '✓ Copied to Clipboard' : '📋 Copy Text'}
                </button>

                <button
                  type="button"
                  onClick={onReset}
                  className="win-button text-xs ml-auto"
                >
                  Scan Another Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </fieldset>
  );
};
