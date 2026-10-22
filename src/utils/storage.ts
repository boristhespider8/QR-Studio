import type { ActivityItem } from '../types';

const STORAGE_KEY = 'qr_studio_recent_activity_v1';
const MAX_ACTIVITIES = 10;

/**
 * Check if localStorage is supported and accessible
 */
function isStorageAvailable(): boolean {
  try {
    const testKey = '__qr_studio_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Load recent activities from localStorage safely
 */
export function loadRecentActivities(): ActivityItem[] {
  if (!isStorageAvailable()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, MAX_ACTIVITIES);
    }
    return [];
  } catch (err) {
    console.warn('Failed to parse recent activities from localStorage:', err);
    return [];
  }
}

/**
 * Add a new activity item to the top of the list (max 10)
 */
export function saveActivityItem(
  item: Omit<ActivityItem, 'id' | 'timestamp'>
): ActivityItem[] {
  const current = loadRecentActivities();

  // Create full item
  const newItem: ActivityItem = {
    ...item,
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  // Avoid consecutive exact duplicate activities
  const filtered = current.filter(
    (existing) =>
      !(existing.type === newItem.type && existing.content === newItem.content)
  );

  const updated = [newItem, ...filtered].slice(0, MAX_ACTIVITIES);

  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save activity to localStorage:', err);
    }
  }

  return updated;
}

/**
 * Clear all activities
 */
export function clearAllActivities(): void {
  if (isStorageAvailable()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to clear activities from localStorage:', err);
    }
  }
}
