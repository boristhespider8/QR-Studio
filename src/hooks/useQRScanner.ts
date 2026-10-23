import { useState, useCallback, useEffect } from 'react';
import type { ScanResultData, ScanStatus, ActivityItem } from '../types';
import { scanQRCodeFromImageFile } from '../utils/qrScanner';
import { copyToClipboard } from '../utils/validators';

interface UseQRScannerProps {
  onActivityAdded?: (item: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
  isActive?: boolean;
}

export function useQRScanner({ onActivityAdded, isActive = true }: UseQRScannerProps = {}) {
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResultData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  // Clean up object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const processFile = useCallback(
    async (file: File) => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }

      setSelectedFile(file);
      const newPreview = URL.createObjectURL(file);
      setImagePreviewUrl(newPreview);

      setStatus('processing');
      setErrorMessage(null);
      setResult(null);

      try {
        const scanResult = await scanQRCodeFromImageFile(file);
        setResult(scanResult);
        setStatus('success');

        if (onActivityAdded) {
          onActivityAdded({
            type: 'scanned',
            contentType: scanResult.isUrl ? 'url' : 'text',
            content: scanResult.text,
            meta: {
              isUrl: scanResult.isUrl,
            },
          });
        }
      } catch (err: unknown) {
        setStatus('error');
        const message =
          err instanceof Error
            ? err.message
            : 'Acquisition error: QR matrix unreadable or contrast insufficient.';
        setErrorMessage(message);
      }
    },
    [imagePreviewUrl, onActivityAdded]
  );

  // Global Ctrl+V clipboard paste support
  useEffect(() => {
    if (!isActive) return;

    const handlePaste = (e: ClipboardEvent) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData || !clipboardData.items) return;

      for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isActive, processFile]);

  const resetScanner = useCallback(() => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setResult(null);
    setErrorMessage(null);
    setStatus('idle');
    setCopyFeedback(false);
  }, [imagePreviewUrl]);

  const handleCopyResult = useCallback(async () => {
    if (!result) return false;
    const ok = await copyToClipboard(result.text);
    if (ok) {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1800);
    }
    return ok;
  }, [result]);

  const handleOpenUrl = useCallback(() => {
    if (result && result.isUrl && result.url) {
      window.open(result.url, '_blank', 'noopener,noreferrer');
    }
  }, [result]);

  return {
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
  };
}
