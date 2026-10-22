import QRCode from 'qrcode';
import type { QRGeneratorOptions } from '../types';

/**
 * Generate a PNG Data URL using the 'qrcode' library
 */
export async function generateQRCodeDataUrl(options: QRGeneratorOptions): Promise<string> {
  const { content, foregroundColor, backgroundColor, size, errorCorrectionLevel, margin } = options;

  if (!content || !content.trim()) {
    throw new Error('Content is empty');
  }

  return await QRCode.toDataURL(content, {
    width: size,
    margin: margin,
    errorCorrectionLevel: errorCorrectionLevel,
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
  });
}

/**
 * Trigger file download in browser for PNG QR Code
 */
export function downloadQRCode(dataUrl: string, filename = 'qr-studio-code.png'): void {
  if (!dataUrl) return;
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies the QR code PNG image directly to clipboard if supported by browser
 */
export async function copyQRCodeImageToClipboard(dataUrl: string): Promise<boolean> {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    return false;
  }

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const item = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    console.error('Failed to copy QR image to clipboard:', err);
    return false;
  }
}
