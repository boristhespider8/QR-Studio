export type ContentType = 'url' | 'text';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type QRSize = 256 | 384 | 512;

export interface QRGeneratorOptions {
  type: ContentType;
  content: string;
  foregroundColor: string;
  backgroundColor: string;
  size: QRSize;
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
}

export interface QRGenerationResult {
  dataUrl: string;
  content: string;
  size: QRSize;
  errorCorrectionLevel: ErrorCorrectionLevel;
  timestamp: number;
}

export type ScanStatus = 'idle' | 'processing' | 'success' | 'error';

export interface ScanResultData {
  text: string;
  isUrl: boolean;
  url: string | null;
  detectedAt: number;
}

export type ActivityType = 'generated' | 'scanned';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  contentType: 'url' | 'text';
  content: string;
  timestamp: number;
  previewUrl?: string;
  meta?: {
    size?: number;
    errorLevel?: string;
    isUrl?: boolean;
  };
}

export type ActiveTab = 'generator' | 'scanner';
