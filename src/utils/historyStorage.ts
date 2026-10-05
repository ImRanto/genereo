import type { HistoryItem } from '../types/history';

const STORAGE_KEY = 'qr_generator_history_v1';
const MAX_HISTORY_ITEMS = 20;

/**
 * Loads history items from localStorage.
 */
export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error('Failed to load history from localStorage:', err);
    return [];
  }
}

/**
 * Saves a new QR code to local history (max 20 items, newest first).
 * Deduplicates if exact same ID exists or moves updated item to top.
 */
export function saveToHistory(item: Omit<HistoryItem, 'id' | 'createdAt'> & { id?: string }): HistoryItem[] {
  try {
    const current = getHistory();
    const newItem: HistoryItem = {
      ...item,
      id: item.id || `qr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };

    // Filter out duplicate ID if present
    const filtered = current.filter((i) => i.id !== newItem.id);

    // Prepend new item and cap at 20
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (err) {
      const isQuotaExceeded =
        err instanceof DOMException &&
        (err.name === 'QuotaExceededError' || err.code === 22 || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');

      if (isQuotaExceeded) {
        console.warn('localStorage QuotaExceededError caught. Purging oldest 5 history items and retrying...');
        // Remove 5 oldest items from updated array and retry once
        const purged = updated.slice(0, Math.max(1, updated.length - 5));
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(purged));
          return purged;
        } catch {
          console.warn('Retry after purging 5 items failed. Stripping logoUrl and saving...');
          // Strip logoUrl if quota is still exceeded
          const itemWithoutLogo: HistoryItem = {
            ...newItem,
            designOptions: newItem.designOptions
              ? { ...newItem.designOptions, logoUrl: undefined }
              : undefined,
          };
          const updatedWithoutLogo = [itemWithoutLogo, ...filtered].slice(0, Math.max(1, current.length - 5));
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWithoutLogo));
            return updatedWithoutLogo;
          } catch (finalErr) {
            console.error('Final attempt to save history failed:', finalErr);
            return current;
          }
        }
      } else {
        console.error('Failed to save item to history:', err);
        return current;
      }
    }
  } catch (err) {
    console.error('Failed to prepare item for history:', err);
    return getHistory();
  }
}

/**
 * Deletes a single history item by ID.
 */
export function deleteFromHistory(id: string): HistoryItem[] {
  try {
    const current = getHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete item from history:', err);
    return getHistory();
  }
}

/**
 * Clears all local history.
 */
export function clearHistory(): HistoryItem[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
  return [];
}
