/**
 * NotificationManager
 * 
 * Handles browser notifications for new coach plans with:
 * - Permission management
 * - User preferences (per-coach, throttling)
 * - localStorage persistence
 * - Notification display and click handling
 */

import {
  NotificationPreferences,
  NotificationData,
  CoachKey,
  DEFAULT_NOTIFICATION_PREFERENCES,
  isNotificationSupported,
  getNotificationPermission,
} from '@/types/notifications';

const STORAGE_KEY = 'coach-dashboard-notifications';

export class NotificationManager {
  private preferences: NotificationPreferences;

  constructor() {
    this.preferences = this.loadPreferences();
  }

  /**
   * Request notification permission from the browser
   * @returns Promise resolving to the permission state
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!isNotificationSupported()) {
      console.warn('[NotificationManager] Notification API not supported');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('[NotificationManager] Permission request result:', permission);
      
      // Enable notifications if permission granted
      if (permission === 'granted' && !this.preferences.enabled) {
        this.preferences.enabled = true;
        this.savePreferences(this.preferences);
      }
      
      return permission as NotificationPermission;
    } catch (error) {
      console.error('[NotificationManager] Error requesting permission:', error);
      return 'denied';
    }
  }

  /**
   * Get current notification permission state
   * @returns Current permission state
   */
  getPermissionState(): NotificationPermission {
    return getNotificationPermission();
  }

  /**
   * Check if notifications are supported and permission is granted
   * @returns true if notifications can be shown
   */
  canShowNotifications(): boolean {
    return isNotificationSupported() && 
           this.getPermissionState() === 'granted' &&
           this.preferences.enabled;
  }

  /**
   * Load notification preferences from localStorage
   * @returns NotificationPreferences object
   */
  private loadPreferences(): NotificationPreferences {
    if (typeof window === 'undefined') {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return { ...DEFAULT_NOTIFICATION_PREFERENCES };
      }

      const parsed = JSON.parse(stored);
      
      // Merge with defaults to handle missing fields from older versions
      return {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...parsed,
        coaches: {
          ...DEFAULT_NOTIFICATION_PREFERENCES.coaches,
          ...parsed.coaches,
        },
        lastNotificationTime: {
          ...DEFAULT_NOTIFICATION_PREFERENCES.lastNotificationTime,
          ...parsed.lastNotificationTime,
        },
      };
    } catch (error) {
      console.error('[NotificationManager] Error loading preferences:', error);
      return { ...DEFAULT_NOTIFICATION_PREFERENCES };
    }
  }

  /**
   * Get current notification preferences
   * @returns Current preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Save notification preferences to localStorage
   * @param prefs New preferences to save
   */
  savePreferences(prefs: NotificationPreferences): void {
    this.preferences = { ...prefs };
    
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
      console.log('[NotificationManager] Preferences saved:', this.preferences);
    } catch (error) {
      console.error('[NotificationManager] Error saving preferences:', error);
    }
  }

  /**
   * Check if enough time has passed since last notification for a coach
   * @param coachKey The coach to check
   * @returns true if notification can be shown
   */
  canNotify(coachKey: CoachKey): boolean {
    // Check if notifications are enabled globally
    if (!this.canShowNotifications()) {
      return false;
    }

    // Check if notifications are enabled for this coach
    if (!this.preferences.coaches[coachKey]) {
      return false;
    }

    // Check throttling
    const now = Date.now();
    const lastTime = this.preferences.lastNotificationTime[coachKey] || 0;
    const minIntervalMs = this.preferences.minInterval * 1000;
    
    const canNotify = (now - lastTime) >= minIntervalMs;
    
    if (!canNotify) {
      const remainingSeconds = Math.ceil((minIntervalMs - (now - lastTime)) / 1000);
      console.log(
        `[NotificationManager] Throttled for ${coachKey}, ` +
        `${remainingSeconds}s remaining`
      );
    }
    
    return canNotify;
  }

  /**
   * Show a notification for a new coach plan
   * @param coachKey The coach key (e.g., 'coach_d')
   * @param coachName The display name of the coach
   * @param planPreview Preview text from the plan
   */
  showPlanNotification(
    coachKey: CoachKey,
    coachName: string,
    planPreview: string
  ): void {
    if (!this.canNotify(coachKey)) {
      return;
    }

    try {
      const notification = new Notification(`New Plan from ${coachName}`, {
        body: planPreview,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `coach-plan-${coachKey}`,
        requireInteraction: false,
        silent: !this.preferences.sound,
        data: {
          coachKey,
          coachName,
          timestamp: Date.now(),
        } as NotificationData,
      });

      // Handle notification click - focus the dashboard
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Scroll to the top of the dashboard where new plans appear
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log('[NotificationManager] Notification clicked:', coachKey);
      };

      // Update last notification time
      this.preferences.lastNotificationTime[coachKey] = Date.now();
      this.savePreferences(this.preferences);

      console.log('[NotificationManager] Notification shown:', {
        coachKey,
        coachName,
        preview: planPreview.substring(0, 50),
      });
    } catch (error) {
      console.error('[NotificationManager] Error showing notification:', error);
    }
  }

  /**
   * Test notification - shows a sample notification
   * Useful for users to verify their notification setup
   */
  testNotification(): void {
    if (!isNotificationSupported()) {
      alert('Notifications are not supported in this browser');
      return;
    }

    const permission = this.getPermissionState();
    
    if (permission === 'denied') {
      alert(
        'Notifications are blocked. Please enable them in your browser settings.'
      );
      return;
    }

    if (permission === 'default') {
      alert('Please grant notification permission first.');
      return;
    }

    try {
      const notification = new Notification('Test Notification', {
        body: 'This is a test notification from Coach Dashboard',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false,
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      console.log('[NotificationManager] Test notification shown');
    } catch (error) {
      console.error('[NotificationManager] Error showing test notification:', error);
      alert(`Error showing notification: ${error}`);
    }
  }

  /**
   * Reset all notification timestamps
   * Useful for testing or troubleshooting
   */
  resetNotificationTimestamps(): void {
    this.preferences.lastNotificationTime = {
      coach_d: 0,
      coach_i: 0,
      coach_s: 0,
      coach_n: 0,
    };
    this.savePreferences(this.preferences);
    console.log('[NotificationManager] Notification timestamps reset');
  }

  /**
   * Enable notifications for all coaches
   */
  enableAllCoaches(): void {
    this.preferences.coaches = {
      coach_d: true,
      coach_i: true,
      coach_s: true,
      coach_n: true,
    };
    this.savePreferences(this.preferences);
  }

  /**
   * Disable notifications for all coaches
   */
  disableAllCoaches(): void {
    this.preferences.coaches = {
      coach_d: false,
      coach_i: false,
      coach_s: false,
      coach_n: false,
    };
    this.savePreferences(this.preferences);
  }
}

// Export singleton instance
let notificationManagerInstance: NotificationManager | null = null;

/**
 * Get the singleton NotificationManager instance
 * @returns NotificationManager instance
 */
export function getNotificationManager(): NotificationManager {
  if (!notificationManagerInstance) {
    notificationManagerInstance = new NotificationManager();
  }
  return notificationManagerInstance;
}
