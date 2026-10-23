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
 * Generate vector SVG string
 */
export async function generateQRCodeSvg(options: QRGeneratorOptions): Promise<string> {
  const { content, foregroundColor, backgroundColor, size, errorCorrectionLevel, margin } = options;

  if (!content || !content.trim()) {
    throw new Error('Content is empty');
  }

  return await QRCode.toString(content, {
    type: 'svg',
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
 * Generate retro ASCII / ANSI block text QR Code
 */
export function generateQRCodeAscii(content: string, errorCorrectionLevel: QRGeneratorOptions['errorCorrectionLevel'] = 'M'): string {
  if (!content || !content.trim()) return '';

  try {
    const qr = QRCode.create(content, { errorCorrectionLevel });
    const size = qr.modules.size;
    const data = qr.modules.data;
    const quietZone = 2;
    const fullWidth = size + quietZone * 2;

    const lines: string[] = [];
    const emptyLine = '  '.repeat(fullWidth);

    for (let q = 0; q < quietZone; q++) {
      lines.push(emptyLine);
    }

    for (let r = 0; r < size; r++) {
      let rowStr = '  '.repeat(quietZone);
      for (let c = 0; c < size; c++) {
        const isDark = data[r * size + c];
        rowStr += isDark ? '██' : '  ';
      }
      rowStr += '  '.repeat(quietZone);
      lines.push(rowStr);
    }

    for (let q = 0; q < quietZone; q++) {
      lines.push(emptyLine);
    }

    return lines.join('\n');
  } catch (err) {
    console.error('Failed to generate ASCII QR:', err);
    return '';
  }
}

/**
 * Trigger file download in browser for PNG QR Code
 */
export function downloadQRCode(dataUrl: string, filename = 'PPLQR_OUTPUT.PNG'): void {
  if (!dataUrl) return;
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Trigger file download for text/svg/log data
 */
export function downloadTextFile(content: string, filename: string, mimeType = 'text/plain'): void {
  if (!content) return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
