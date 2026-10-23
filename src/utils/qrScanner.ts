import jsQR from 'jsqr';
import type { ScanResultData, ScanLocation, Point } from '../types';
import { isSafeHttpUrl } from './validators';

export interface ScanImageError {
  type: 'NO_QR' | 'INVALID_FILE' | 'IMAGE_LOAD_FAILED' | 'FILE_TOO_LARGE';
  message: string;
}

/**
 * Helper to draw retro HUD computer vision bounding box on canvas
 */
function drawBoundingBox(
  ctx: CanvasRenderingContext2D,
  location: {
    topLeftCorner: Point;
    topRightCorner: Point;
    bottomRightCorner: Point;
    bottomLeftCorner: Point;
  }
) {
  const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = location;

  // Draw semi-transparent green fill
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(topLeftCorner.x, topLeftCorner.y);
  ctx.lineTo(topRightCorner.x, topRightCorner.y);
  ctx.lineTo(bottomRightCorner.x, bottomRightCorner.y);
  ctx.lineTo(bottomLeftCorner.x, bottomLeftCorner.y);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
  ctx.fill();

  // Draw neon green polygon border
  ctx.lineWidth = Math.max(3, Math.round(ctx.canvas.width / 200));
  ctx.strokeStyle = '#00FF00';
  ctx.lineJoin = 'miter';
  ctx.stroke();

  // Draw corner brackets & crosshairs
  const corners = [topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner];
  corners.forEach((pt) => {
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, Math.max(4, Math.round(ctx.canvas.width / 150)), 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Draw center crosshair
  const centerX = (topLeftCorner.x + topRightCorner.x + bottomRightCorner.x + bottomLeftCorner.x) / 4;
  const centerY = (topLeftCorner.y + topRightCorner.y + bottomRightCorner.y + bottomLeftCorner.y) / 4;
  const crossSize = Math.max(10, Math.round(ctx.canvas.width / 60));

  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - crossSize, centerY);
  ctx.lineTo(centerX + crossSize, centerY);
  ctx.moveTo(centerX, centerY - crossSize);
  ctx.lineTo(centerX, centerY + crossSize);
  ctx.stroke();

  ctx.restore();
}

/**
 * Scan an image file for a QR code using HTML5 Canvas and jsQR
 */
export async function scanQRCodeFromImageFile(file: File): Promise<ScanResultData> {
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

    // Get pixel data for primary pass
    const imageData = ctx.getImageData(0, 0, width, height);

    // Attempt scan with jsQR
    let code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });

    let activeCanvas = canvas;
    let activeCtx = ctx;

    // Dual-pass fallback if initial pass fails on large image
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
        if (code) {
          activeCanvas = smallCanvas;
          activeCtx = smallCtx;
        }
      }
    }

    if (!code || !code.data) {
      throw new Error(
        'No QR code detected in this image. Ensure the 3 corner markers are intact, well-lit, and not cropped.'
      );
    }

    // Render green HUD bounding box on the detected QR code
    drawBoundingBox(activeCtx, code.location);
    const annotatedDataUrl = activeCanvas.toDataURL('image/png');

    const scannedText = code.data.trim();
    const isUrl = isSafeHttpUrl(scannedText);

    const scanLocation: ScanLocation = {
      topLeft: code.location.topLeftCorner,
      topRight: code.location.topRightCorner,
      bottomRight: code.location.bottomRightCorner,
      bottomLeft: code.location.bottomLeftCorner,
    };

    return {
      text: scannedText,
      isUrl,
      url: isUrl ? scannedText : null,
      detectedAt: Date.now(),
      location: scanLocation,
      dimensions: { width: activeCanvas.width, height: activeCanvas.height },
      annotatedDataUrl,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
