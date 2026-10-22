import jsQR from 'jsqr';
import type { ScanResultData } from '../types';
import { isSafeHttpUrl } from './validators';

export interface ScanImageError {
  type: 'NO_QR' | 'INVALID_FILE' | 'IMAGE_LOAD_FAILED' | 'FILE_TOO_LARGE';
  message: string;
}

/**
 * Scan an image file for a QR code using HTML5 Canvas and jsQR
 */
export async function scanQRCodeFromImageFile(file: File): Promise<ScanResultData> {
  // Validate file
  if (!file) {
    throw new Error('No file provided.');
  }

  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
  if (!validTypes.includes(file.type.toLowerCase()) && !/\.(png|jpe?g|webp|svg)$/i.test(file.name)) {
    throw new Error('Unsupported file format. Please upload a PNG, JPG, JPEG, or WEBP image.');
  }

  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the 15 MB limit. Please select a smaller image.');
  }

  // Load image safely using Object URL
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image. The file may be corrupted or unreadable.'));
      img.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      throw new Error('Canvas 2D context is not supported by your browser.');
    }

    // Determine canvas dimensions. If image is extremely large (> 2000px), downscale to reduce memory/CPU
    let width = image.naturalWidth || image.width;
    let height = image.naturalHeight || image.height;

    if (width === 0 || height === 0) {
      throw new Error('Image dimensions are invalid.');
    }

    const MAX_DIMENSION = 2048;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    canvas.width = width;
    canvas.height = height;

    // Draw image onto canvas
    ctx.drawImage(image, 0, 0, width, height);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, width, height);

    // Attempt scan with jsQR
    let code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });

    // If initial pass didn't find QR and image was larger than 800px, try a second pass at 800px standard size
    if (!code && (width > 800 || height > 800)) {
      const targetWidth = 800;
      const targetHeight = Math.round((height / width) * 800);
      const smallCanvas = document.createElement('canvas');
      smallCanvas.width = targetWidth;
      smallCanvas.height = targetHeight;
      const smallCtx = smallCanvas.getContext('2d', { willReadFrequently: true });
      if (smallCtx) {
        smallCtx.drawImage(image, 0, 0, targetWidth, targetHeight);
        const smallData = smallCtx.getImageData(0, 0, targetWidth, targetHeight);
        code = jsQR(smallData.data, smallData.width, smallData.height, {
          inversionAttempts: 'attemptBoth',
        });
      }
    }

    if (!code || !code.data) {
      throw new Error(
        'No QR code detected in this image. Please ensure the QR code is clearly visible, well-lit, and not cropped.'
      );
    }

    const scannedText = code.data.trim();
    const isUrl = isSafeHttpUrl(scannedText);

    return {
      text: scannedText,
      isUrl,
      url: isUrl ? scannedText : null,
      detectedAt: Date.now(),
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
