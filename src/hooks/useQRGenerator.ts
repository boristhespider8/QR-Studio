import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ContentType,
  ErrorCorrectionLevel,
  QRGeneratorOptions,
  QRGenerationResult,
  QRSize,
  ActivityItem,
} from '../types';
import { generateQRCodeDataUrl, downloadQRCode, copyQRCodeImageToClipboard } from '../utils/qrGenerator';
import { validateContent, copyToClipboard } from '../utils/validators';

const DEFAULT_OPTIONS: QRGeneratorOptions = {
  type: 'url',
  content: 'https://example.com',
  foregroundColor: '#0f172a', // Deep slate
  backgroundColor: '#ffffff',
  size: 384,
  errorCorrectionLevel: 'M',
  margin: 2,
};

interface UseQRGeneratorProps {
  onActivityAdded?: (item: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
}

export function useQRGenerator({ onActivityAdded }: UseQRGeneratorProps = {}) {
  const [options, setOptions] = useState<QRGeneratorOptions>(DEFAULT_OPTIONS);
  const [result, setResult] = useState<QRGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [imageCopyFeedback, setImageCopyFeedback] = useState<boolean>(false);

  // Keep ref of last logged content to avoid logging duplicates on every keystroke
  const lastLoggedContentRef = useRef<string>('');

  const generate = useCallback(
    async (currentOptions: QRGeneratorOptions, shouldLog = false) => {
      const validation = validateContent(currentOptions.type, currentOptions.content);

      if (!validation.isValid) {
        setError(validation.error);
        setResult(null);
        return;
      }

      setError(null);
      setIsGenerating(true);

      try {
        const payloadToEncode = validation.normalized;
        const dataUrl = await generateQRCodeDataUrl({
          ...currentOptions,
          content: payloadToEncode,
        });

        setResult({
          dataUrl,
          content: payloadToEncode,
          size: currentOptions.size,
          errorCorrectionLevel: currentOptions.errorCorrectionLevel,
          timestamp: Date.now(),
        });

        if (shouldLog && onActivityAdded && payloadToEncode !== lastLoggedContentRef.current) {
          lastLoggedContentRef.current = payloadToEncode;
          onActivityAdded({
            type: 'generated',
            contentType: currentOptions.type,
            content: payloadToEncode,
            meta: {
              size: currentOptions.size,
              errorLevel: currentOptions.errorCorrectionLevel,
              isUrl: currentOptions.type === 'url',
            },
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to generate QR Code';
        setError(msg);
        setResult(null);
      } finally {
        setIsGenerating(false);
      }
    },
    [onActivityAdded]
  );

  // Debounced auto-generation
  useEffect(() => {
    const handler = setTimeout(() => {
      if (options.content.trim()) {
        generate(options, false);
      } else {
        setResult(null);
        setError('Please enter a link or text to generate a QR Code');
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [options, generate]);

  // Explicit user trigger (e.g. clicking "Generate QR Code" button)
  const handleExplicitGenerate = () => {
    if (options.content.trim()) {
      generate(options, true);
    } else {
      setError('Please enter a link or text to generate a QR Code');
    }
  };

  const setContent = (content: string) => {
    setOptions((prev) => ({ ...prev, content }));
  };

  const setType = (type: ContentType) => {
    setOptions((prev) => {
      // If switching to URL and current text doesn't look like URL, reset to friendly placeholder
      let newContent = prev.content;
      if (type === 'url' && (!prev.content.includes('.') || prev.content.includes('\n'))) {
        newContent = 'https://example.com';
      }
      return { ...prev, type, content: newContent };
    });
  };

  const setForegroundColor = (foregroundColor: string) => {
    setOptions((prev) => ({ ...prev, foregroundColor }));
  };

  const setBackgroundColor = (backgroundColor: string) => {
    setOptions((prev) => ({ ...prev, backgroundColor }));
  };

  const setSize = (size: QRSize) => {
    setOptions((prev) => ({ ...prev, size }));
  };

  const setErrorCorrectionLevel = (errorCorrectionLevel: ErrorCorrectionLevel) => {
    setOptions((prev) => ({ ...prev, errorCorrectionLevel }));
  };

  const setMargin = (margin: number) => {
    setOptions((prev) => ({ ...prev, margin }));
  };

  const resetSettings = () => {
    setOptions({
      ...DEFAULT_OPTIONS,
      type: options.type,
      content: options.content || 'https://example.com',
    });
  };

  const handleDownload = () => {
    if (!result) return;
    const cleanName = options.type === 'url' ? 'qrcode-url' : 'qrcode-text';
    downloadQRCode(result.dataUrl, `${cleanName}-${Date.now()}.png`);

    // Also log to activity on download if not logged yet
    if (onActivityAdded && result.content !== lastLoggedContentRef.current) {
      lastLoggedContentRef.current = result.content;
      onActivityAdded({
        type: 'generated',
        contentType: options.type,
        content: result.content,
        meta: {
          size: options.size,
          errorLevel: options.errorCorrectionLevel,
        },
      });
    }
  };

  const handleCopyContent = async () => {
    if (!result) return false;
    const ok = await copyToClipboard(result.content);
    if (ok) {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
    return ok;
  };

  const handleCopyImage = async () => {
    if (!result) return false;
    const ok = await copyQRCodeImageToClipboard(result.dataUrl);
    if (ok) {
      setImageCopyFeedback(true);
      setTimeout(() => setImageCopyFeedback(false), 2000);
    }
    return ok;
  };

  return {
    options,
    result,
    error,
    isGenerating,
    copyFeedback,
    imageCopyFeedback,
    setContent,
    setType,
    setForegroundColor,
    setBackgroundColor,
    setSize,
    setErrorCorrectionLevel,
    setMargin,
    resetSettings,
    handleExplicitGenerate,
    handleDownload,
    handleCopyContent,
    handleCopyImage,
  };
}
