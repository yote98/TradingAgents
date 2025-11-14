/**
 * TypeScript type definitions for Browser Notification API
 * and dashboard notification preferences
 */

/**
 * Browser Notification API permission states
 */
export type NotificationPermission = 'default' | 'granted' | 'denied';

/**
 * Notification options for browser notifications
 */
export interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}

/**
 * Coach types in the system
 */
export type CoachKey = 'coach_d' | 'coach_i' | 'coach_s' | 'coach_n';

/**
 * Per-coach notification settings
 */
export interface CoachNotificationSettings {
  coach_d: boolean;
  coach_i: boolean;
  coach_s: boolean;
  coach_n: boolean;
}

/**
 * User notification preferences
 */
export interface NotificationPreferences {
  /** Global enable/disable for all notifications */
  enabled: boolean;
  
  /** Per-coach notification toggles */
  coaches: CoachNotificationSettings;
  
  /** Minimum seconds between notifications for the same coach */
  minInterval: number;
  
  /** Enable notification sound */
  sound: boolean;
  
  /** Last notification timestamp for each coach (epoch ms) */
  lastNotificationTime: Record<CoachKey, number>;
}

/**
 * Default notification preferences
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: false, // Disabled by default until user grants permission
  coaches: {
    coach_d: true,
    coach_i: true,
    coach_s: true,
    coach_n: true,
  },
  minInterval: 300, // 5 minutes
  sound: false,
  lastNotificationTime: {
    coach_d: 0,
    coach_i: 0,
    coach_s: 0,
    coach_n: 0,
  },
};

/**
 * Notification display data
 */
export interface NotificationData {
  coachKey: CoachKey;
  coachName: string;
  planPreview: string;
  timestamp: number;
}

/**
 * Browser Notification API support check
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission as NotificationPermission;
}
