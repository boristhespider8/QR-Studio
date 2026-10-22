import React from 'react';
import { useQRScanner } from '../hooks/useQRScanner';
import { UploadDropzone } from './UploadDropzone';
import { ScanResult } from './ScanResult';
import type { ActivityItem } from '../types';
import { ScanLine } from 'lucide-react';

interface ScannerPanelProps {
  onActivityAdded: (item: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
}

export const ScannerPanel: React.FC<ScannerPanelProps> = ({ onActivityAdded }) => {
  const {
    status,
    selectedFile,
    imagePreviewUrl,
    result,
    errorMessage,
    copyFeedback,
    processFile,
    resetScanner,
    handleCopyResult,
    handleOpenUrl,
  } = useQRScanner({ onActivityAdded });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <ScanLine className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">QR Code Scanner</h2>
        </div>
        <span className="text-xs text-slate-400 font-medium">Decoded locally in browser</span>
      </div>

      {/* Conditional rendering based on upload state */}
      {status === 'idle' && !selectedFile ? (
        <UploadDropzone
          onFileSelected={processFile}
          isProcessing={false}
        />

      ) : (
        <ScanResult
          status={status}
          selectedFile={selectedFile}
          imagePreviewUrl={imagePreviewUrl}
          result={result}
          errorMessage={errorMessage}
          copyFeedback={copyFeedback}
          onCopyResult={handleCopyResult}
          onOpenUrl={handleOpenUrl}
          onReset={resetScanner}
        />
      )}
    </div>
  );
};
