import React, { useRef, useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onFileSelected, isProcessing }) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndPass = (file: File) => {
    setClientError(null);

    const validExtensions = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const hasValidMime = validExtensions.includes(file.type.toLowerCase());
    const hasValidExt = /\.(png|jpe?g|webp)$/i.test(file.name);

    if (!hasValidMime && !hasValidExt) {
      setClientError('Invalid file signature. Supported raster formats: PNG, JPG, JPEG, WEBP.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setClientError('Buffer overflow: File size exceeds 15 MB threshold.');
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndPass(droppedFile);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      validateAndPass(selected);
      e.target.value = '';
    }
  };

  return (
    <fieldset className="win-groupbox bg-[#D4D0C8] p-3">
      <legend>TWAIN Image Acquisition Bay</legend>

      {/* Target Drop Zone */}
      <div
        id="qr-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`win-sunken relative p-8 text-center cursor-pointer transition-colors ${
          isDragOver ? 'bg-[#FFFFE1] border-2 border-black' : 'bg-white hover:bg-[#F9F8F5]'
        } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Acquisition Dropzone"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
          id="qr-file-input"
          aria-hidden="true"
        />

        {/* Technical Target Box */}
        <div className="flex flex-col items-center justify-center space-y-2">
          {/* Retro Flatbed Scanner Icon */}
          <div className="w-12 h-12 bg-[#D4D0C8] border-2 border-t-[#FFFFFF] border-l-[#FFFFFF] border-r-[#808080] border-b-[#808080] flex items-center justify-center font-mono font-bold text-sm shadow-xs">
            📷 2D
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-black font-sans">
              Drag &amp; Drop Image File Here, or Click to Browse Disk
            </p>
            <p className="text-[11px] text-slate-600 font-mono">
              [PNG, JPG, JPEG, WEBP | Max Buffer: 15 MB]
            </p>
          </div>

          <button
            type="button"
            className="win-button text-xs font-bold px-4 py-1.5 mt-2"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            📁 Browse Local Disk...
          </button>
        </div>
      </div>

      {/* Quick Clipboard Paste Callout */}
      <div className="win-sunken bg-[#FFFFE1] p-2 mt-2 flex items-center justify-between text-[11px] border border-[#000000]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#0A246A]">[!] CLIPBOARD ACCELERATOR:</span>
          <span>Press <kbd className="font-mono bg-white px-1 border border-[#808080]">Ctrl</kbd> + <kbd className="font-mono bg-white px-1 border border-[#808080]">V</kbd> to decode directly from screenshot / Snipping Tool.</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">No disk save required</span>
      </div>

      {/* Error Callout */}
      {clientError && (
        <div className="win-sunken bg-[#FFEFEF] border border-[#AA0000] p-2 mt-2 text-[#AA0000] text-xs font-bold">
          [X] ACQUISITION REJECTED: {clientError}
        </div>
      )}
    </fieldset>
  );
};
