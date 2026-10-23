export type ContentType = 'url' | 'text';

export type TemplateType = 'custom' | 'url' | 'wifi' | 'vcard';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type QRSize = 256 | 384 | 512;

export interface QRGeneratorOptions {
  type: ContentType;
  template?: TemplateType;
  content: string;
  foregroundColor: string;
  backgroundColor: string;
  size: QRSize;
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
}

export interface QRGenerationResult {
  dataUrl: string;
  svgString?: string;
  asciiArt?: string;
  content: string;
  size: QRSize;
  errorCorrectionLevel: ErrorCorrectionLevel;
  timestamp: number;
}

export type ScanStatus = 'idle' | 'processing' | 'success' | 'error';

export interface Point {
  x: number;
  y: number;
}

export interface ScanLocation {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export interface ScanResultData {
  text: string;
  isUrl: boolean;
  url: string | null;
  detectedAt: number;
  location?: ScanLocation;
  dimensions?: { width: number; height: number };
  annotatedDataUrl?: string;
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
    template?: string;
  };
}

export type ActiveTab = 'generator' | 'scanner' | 'archiver' | 'log';

export type CompressionLevel = 0 | 1 | 3 | 6 | 7 | 9;

export type CompressionEngine = 'zip' | 'tar.gz' | 'tar' | 'gz' | 'stream-deflate';

export interface ArchiveFileItem {
  id: string;
  name: string;
  size: number;
  data: Uint8Array;
  type: string;
  lastModified: number;
  crc32?: string;
  packedSize?: number;
}

export interface ArchiveOptions {
  archiveName: string;
  engine: CompressionEngine;
  level: CompressionLevel;
  comment?: string;
  password?: string;
  solidArchive?: boolean;
  volumeSplitSize?: number;
}

export interface CompressedFileDetail {
  name: string;
  originalSize: number;
  compressedSize: number;
  ratio: number;
  crc32: string;
}

export interface ArchiveResult {
  blob: Blob;
  fileName: string;
  mimeType: string;
  uncompressedSize: number;
  compressedSize: number;
  compressionRatio: number;
  durationMs: number;
  fileCount: number;
  files: CompressedFileDetail[];
  timestamp: number;
  engine: CompressionEngine;
  level: CompressionLevel;
  comment?: string;
}

