/**
 * LocalStorage utility functions for Coach Dashboard
 * Provides type-safe storage operations with error handling
 */

/**
 * Safely get an item from localStorage
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist or parsing fails
 * @returns Parsed value or default
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely set an item in localStorage
 * @param key - Storage key
 * @param value - Value to store (will be JSON stringified)
 * @returns Success boolean
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    // Handle QuotaExceededError
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Consider clearing old data.');
    }
    return false;
  }
}

/**
 * Remove an item from localStorage
 * @param key - Storage key
 * @returns Success boolean
 */
export function removeStorageItem(key: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all items from localStorage
 * @returns Success boolean
 */
export function clearStorage(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Get the approximate size of localStorage in bytes
 * @returns Size in bytes
 */
export function getStorageSize(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  let total = 0;
  try {
    for (const key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        const value = window.localStorage.getItem(key);
        total += key.length + (value?.length || 0);
      }
    }
  } catch (error) {
    console.error('Error calculating localStorage size:', error);
  }
  return total;
}

/**
 * Get the size of a specific localStorage key in bytes
 * @param key - Storage key
 * @returns Size in bytes
 */
export function getKeySize(key: string): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  try {
    const value = window.localStorage.getItem(key);
    if (!value) return 0;
    return key.length + value.length;
  } catch (error) {
    console.error(`Error calculating size for key "${key}":`, error);
    return 0;
  }
}

/**
 * Get storage usage as a percentage of typical quota (5MB)
 * @returns Percentage (0-100)
 */
export function getStorageUsagePercent(): number {
  const TYPICAL_QUOTA = 5 * 1024 * 1024; // 5MB
  const currentSize = getStorageSize();
  return (currentSize / TYPICAL_QUOTA) * 100;
}

/**
 * Check if storage is approaching quota
 * @param threshold - Percentage threshold (default 80%)
 * @returns True if approaching quota
 */
export function isStorageApproachingQuota(threshold: number = 80): boolean {
  return getStorageUsagePercent() >= threshold;
}

/**
 * Check if localStorage is available
 * @returns True if localStorage is available
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

// Storage keys used by the dashboard
export const STORAGE_KEYS = {
  NOTIFICATIONS: 'coach-dashboard-notifications',
  CHARTS: 'coach-dashboard-charts',
  SETTINGS: 'coach-dashboard-settings',
  USER_SETTINGS: 'dashboard-user-settings', // New key for comprehensive user settings
  THEME: 'dashboard-theme', // Theme preference
} as const;

/**
 * Settings-specific storage utilities
 */

import type { UserSettings } from '@/types/settings';
import { DEFAULT_USER_SETTINGS, validateSettings } from '@/types/settings';

/**
 * Load user settings from localStorage
 * @returns User settings or default settings if not found/invalid
 */
export function loadUserSettings(): UserSettings {
  const settings = getStorageItem<UserSettings>(
    STORAGE_KEYS.USER_SETTINGS,
    DEFAULT_USER_SETTINGS
  );

  // Validate loaded settings
  if (!validateSettings(settings)) {
    console.warn('Invalid settings loaded, using defaults');
    return DEFAULT_USER_SETTINGS;
  }

  return settings;
}

/**
 * Save user settings to localStorage
 * @param settings - User settings to save
 * @returns Success boolean
 */
export function saveUserSettings(settings: UserSettings): boolean {
  // Validate before saving
  if (!validateSettings(settings)) {
    console.error('Cannot save invalid settings');
    return false;
  }

  return setStorageItem(STORAGE_KEYS.USER_SETTINGS, settings);
}

/**
 * Load theme preference from localStorage
 * @returns Theme preference or 'light' as default
 */
export function loadTheme(): 'light' | 'dark' {
  return getStorageItem<'light' | 'dark'>(STORAGE_KEYS.THEME, 'light');
}

/**
 * Save theme preference to localStorage
 * @param theme - Theme to save
 * @returns Success boolean
 */
export function saveTheme(theme: 'light' | 'dark'): boolean {
  return setStorageItem(STORAGE_KEYS.THEME, theme);
}

/**
 * Apply theme to document
 * @param theme - Theme to apply
 */
export function applyTheme(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(theme);
  
  // Also update data attribute for CSS selectors
  document.documentElement.setAttribute('data-theme', theme);
}

/**
 * Initialize theme on app load
 * Loads theme from storage and applies it
 */
export function initializeTheme(): void {
  const theme = loadTheme();
  applyTheme(theme);
}
