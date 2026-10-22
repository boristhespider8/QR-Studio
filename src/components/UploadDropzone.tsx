import React, { useRef, useState } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { UploadCloud, Image as ImageIcon, FileCheck, AlertTriangle } from 'lucide-react';

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
      setClientError('Invalid file format. Please upload a PNG, JPG, JPEG, or WEBP image.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setClientError('File size is too large (maximum 15 MB).');
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
      // reset value so re-selecting same file fires change event
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone container */}
      <div
        id="qr-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/60 scale-[1.01]'
            : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/50'
        } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Upload QR code image area"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          id="qr-file-input"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isProcessing}
        />

        {/* Dropzone icon */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-xs transition-transform group-hover:scale-105">
          <UploadCloud className="w-8 h-8 stroke-[1.8]" />
        </div>

        {/* Text descriptions */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
          Drop your QR image here
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-5">
          or click to browse files from your device
        </p>

        {/* Browse Button */}
        <button
          id="btn-browse-files"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-100 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <ImageIcon className="w-4 h-4" />
          <span>Browse Files</span>
        </button>


        {/* Supported formats info */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5 text-slate-400" />
            Supports PNG, JPG, JPEG, WEBP
          </span>
          <span>•</span>
          <span>Up to 15 MB</span>
        </div>
      </div>

      {/* Client-side validation alert */}
      {clientError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{clientError}</span>
        </div>
      )}

      {/* Helpful Instructions Card */}
      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/70 text-xs text-slate-600 leading-relaxed">
        <strong className="text-slate-800 font-semibold block mb-1">For optimal scanning results:</strong>
        <ul className="list-disc list-inside space-y-0.5 text-slate-500">
          <li>Ensure the QR code is clearly in focus, well-lit, and not blurry.</li>
          <li>Make sure none of the four position markers or corner squares are cut off.</li>
        </ul>
      </div>
    </div>
  );
};
