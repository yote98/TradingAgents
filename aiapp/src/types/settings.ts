/**
 * Settings types for the dashboard
 */

import { NotificationPreferences } from './notifications';

/**
 * Theme options
 */
export type Theme = 'light' | 'dark';

/**
 * API configuration
 */
export interface APIConfig {
  backendUrl: string;
  timeout: number;
}

/**
 * User settings
 */
export interface UserSettings {
  theme: Theme;
  notifications: NotificationPreferences;
  apiConfig: APIConfig;
}

/**
 * Default API configuration
 */
export const DEFAULT_API_CONFIG: APIConfig = {
  backendUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 30000, // 30 seconds
};

/**
 * Default user settings
 */
export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'light',
  notifications: {
    enabled: false,
    coaches: {
      coach_d: true,
      coach_i: true,
      coach_s: true,
      coach_n: true,
    },
    minInterval: 300,
    sound: false,
    lastNotificationTime: {
      coach_d: 0,
      coach_i: 0,
      coach_s: 0,
      coach_n: 0,
    },
  },
  apiConfig: DEFAULT_API_CONFIG,
};

/**
 * Validate settings object
 */
export function validateSettings(settings: Partial<UserSettings>): boolean {
  // Check theme
  if (settings.theme && !['light', 'dark'].includes(settings.theme)) {
    return false;
  }

  // Check API config
  if (settings.apiConfig) {
    if (typeof settings.apiConfig.backendUrl !== 'string' || !settings.apiConfig.backendUrl) {
      return false;
    }
    if (typeof settings.apiConfig.timeout !== 'number' || settings.apiConfig.timeout < 1000) {
      return false;
    }
  }

  // Check notifications
  if (settings.notifications) {
    if (typeof settings.notifications.enabled !== 'boolean') {
      return false;
    }
  }

  return true;
}
