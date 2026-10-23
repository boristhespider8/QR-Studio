import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ContentType,
  ErrorCorrectionLevel,
  QRGeneratorOptions,
  QRGenerationResult,
  QRSize,
  ActivityItem,
  TemplateType,
} from '../types';
import {
  generateQRCodeDataUrl,
  generateQRCodeSvg,
  generateQRCodeAscii,
  downloadQRCode,
  downloadTextFile,
  copyQRCodeImageToClipboard,
} from '../utils/qrGenerator';
import { validateContent, copyToClipboard } from '../utils/validators';

const DEFAULT_OPTIONS: QRGeneratorOptions = {
  type: 'url',
  template: 'url',
  content: 'https://example.com',
  foregroundColor: '#000000', // Classic 1-bit Black
  backgroundColor: '#FFFFFF', // Pure White
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
  const [asciiCopyFeedback, setAsciiCopyFeedback] = useState<boolean>(false);

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
        const [dataUrl, svgString] = await Promise.all([
          generateQRCodeDataUrl({
            ...currentOptions,
            content: payloadToEncode,
          }),
          generateQRCodeSvg({
            ...currentOptions,
            content: payloadToEncode,
          }),
        ]);

        const asciiArt = generateQRCodeAscii(payloadToEncode, currentOptions.errorCorrectionLevel);

        setResult({
          dataUrl,
          svgString,
          asciiArt,
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
              template: currentOptions.template,
            },
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Matrix generation failure';
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
        setError('Ready. Enter payload string to render matrix.');
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [options, generate]);

  const handleExplicitGenerate = () => {
    if (options.content.trim()) {
      generate(options, true);
    } else {
      setError('Payload buffer empty.');
    }
  };

  const setContent = (content: string) => {
    setOptions((prev) => ({ ...prev, content }));
  };

  const setType = (type: ContentType) => {
    setOptions((prev) => {
      let newContent = prev.content;
      if (type === 'url' && (!prev.content.includes('.') || prev.content.includes('\n'))) {
        newContent = 'https://example.com';
      }
      return { ...prev, type, content: newContent };
    });
  };

  const setTemplate = (template: TemplateType) => {
    setOptions((prev) => ({ ...prev, template }));
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

  const handleDownloadPng = () => {
    if (!result) return;
    const stamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    downloadQRCode(result.dataUrl, `PPLQR_${stamp}.PNG`);

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

  const handleDownloadSvg = () => {
    if (!result || !result.svgString) return;
    const stamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    downloadTextFile(result.svgString, `PPLQR_${stamp}.SVG`, 'image/svg+xml');
  };

  const handleDownloadAscii = () => {
    if (!result || !result.asciiArt) return;
    const stamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    downloadTextFile(result.asciiArt, `PPLQR_ASCII_${stamp}.NFO`, 'text/plain');
  };

  const handleCopyContent = async () => {
    if (!result) return false;
    const ok = await copyToClipboard(result.content);
    if (ok) {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1800);
    }
    return ok;
  };

  const handleCopyImage = async () => {
    if (!result) return false;
    const ok = await copyQRCodeImageToClipboard(result.dataUrl);
    if (ok) {
      setImageCopyFeedback(true);
      setTimeout(() => setImageCopyFeedback(false), 1800);
    }
    return ok;
  };

  const handleCopyAscii = async () => {
    if (!result || !result.asciiArt) return false;
    const ok = await copyToClipboard(result.asciiArt);
    if (ok) {
      setAsciiCopyFeedback(true);
      setTimeout(() => setAsciiCopyFeedback(false), 1800);
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
    asciiCopyFeedback,
    setContent,
    setType,
    setTemplate,
    setForegroundColor,
    setBackgroundColor,
    setSize,
    setErrorCorrectionLevel,
    setMargin,
    resetSettings,
    handleExplicitGenerate,
    handleDownloadPng,
    handleDownloadSvg,
    handleDownloadAscii,
    handleCopyContent,
    handleCopyImage,
    handleCopyAscii,
  };
}
