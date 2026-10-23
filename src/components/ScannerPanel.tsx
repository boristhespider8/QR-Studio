import React from 'react';
import { useQRScanner } from '../hooks/useQRScanner';
import { UploadDropzone } from './UploadDropzone';
import { ScanResult } from './ScanResult';
import type { ActivityItem } from '../types';

interface ScannerPanelProps {
  onActivityAdded: (item: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
  isActive?: boolean;
}

export const ScannerPanel: React.FC<ScannerPanelProps> = ({ onActivityAdded, isActive = true }) => {
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
  } = useQRScanner({ onActivityAdded, isActive });

  return (
    <div className="space-y-3 p-1">
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
