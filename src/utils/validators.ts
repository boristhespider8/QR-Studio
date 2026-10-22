import type { ContentType } from '../types';

/**
 * Checks if a string is a valid HTTP/HTTPS URL
 */
export function isSafeHttpUrl(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  try {
    const url = new URL(input.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalizes input into a full valid URL if it's missing the protocol (e.g., "google.com" -> "https://google.com")
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Already has scheme
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) {
    return trimmed;
  }

  // Common pattern for domains or localhost: e.g. domain.com, sub.domain.org, localhost:3000
  if (
    /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(trimmed) ||
    /^localhost(:\d+)?(\/.*)?$/i.test(trimmed) ||
    /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?(\/.*)?$/.test(trimmed)
  ) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

/**
 * Validates user input based on content type (URL or Text)
 */
export function validateContent(
  type: ContentType,
  value: string
): { isValid: boolean; error: string | null; normalized: string } {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: type === 'url' ? 'Please enter a valid website URL' : 'Please enter some text content',
      normalized: '',
    };
  }

  if (type === 'url') {
    const normalized = normalizeUrl(trimmed);
    if (!isSafeHttpUrl(normalized)) {
      return {
        isValid: false,
        error: 'Please enter a valid URL (e.g., https://example.com or example.com)',
        normalized,
      };
    }
    return {
      isValid: true,
      error: null,
      normalized,
    };
  }

  // Text content
  if (trimmed.length > 2500) {
    return {
      isValid: false,
      error: 'Text length exceeds recommended limit (2500 characters) for reliable scanning',
      normalized: value,
    };
  }

  return {
    isValid: true,
    error: null,
    normalized: value,
  };
}

/**
 * Fallback-safe clipboard copy function
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // Try modern Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  // Fallback using textarea + execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
