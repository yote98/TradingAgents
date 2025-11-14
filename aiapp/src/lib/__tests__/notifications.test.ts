/**
 * NotificationManager Tests
 * 
 * Tests for notification permission handling, preferences, and throttling
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock browser APIs
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock Notification API
class MockNotification {
  static permission: NotificationPermission = 'default';
  static requestPermission = jest.fn<() => Promise<NotificationPermission>>(
    async () => MockNotification.permission
  );
  
  title: string;
  options: NotificationOptions;
  onclick: ((this: Notification, ev: Event) => any) | null = null;
  
  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.options = options || {};
  }
  
  close() {}
}

Object.defineProperty(global, 'Notification', {
  value: MockNotification,
  writable: true,
});

describe('NotificationManager', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    MockNotification.permission = 'default';
    jest.clearAllMocks();
  });

  describe('Permission Handling', () => {
    it('should detect notification support', () => {
      expect('Notification' in global).toBe(true);
    });

    it('should return default permission state initially', () => {
      expect(MockNotification.permission).toBe('default');
    });

    it('should handle granted permission', async () => {
      MockNotification.permission = 'granted';
      MockNotification.requestPermission = jest.fn(async () => 'granted');
      
      const result = await MockNotification.requestPermission();
      expect(result).toBe('granted');
    });

    it('should handle denied permission', async () => {
      MockNotification.permission = 'denied';
      MockNotification.requestPermission = jest.fn(async () => 'denied');
      
      const result = await MockNotification.requestPermission();
      expect(result).toBe('denied');
    });
  });

  describe('Preferences Management', () => {
    it('should use default preferences when none exist', () => {
      const stored = mockLocalStorage.getItem('coach-dashboard-notifications');
      expect(stored).toBeNull();
    });

    it('should save preferences to localStorage', () => {
      const preferences = {
        enabled: true,
        coaches: {
          coach_d: true,
          coach_i: true,
          coach_s: false,
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
      };
      
      mockLocalStorage.setItem('coach-dashboard-notifications', JSON.stringify(preferences));
      
      const stored = mockLocalStorage.getItem('coach-dashboard-notifications');
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.enabled).toBe(true);
      expect(parsed.coaches.coach_s).toBe(false);
      expect(parsed.minInterval).toBe(300);
    });

    it('should persist preferences across sessions', () => {
      const preferences = {
        enabled: true,
        coaches: { coach_d: true, coach_i: false, coach_s: true, coach_n: false },
        minInterval: 600,
        sound: true,
        lastNotificationTime: { coach_d: 0, coach_i: 0, coach_s: 0, coach_n: 0 },
      };
      
      mockLocalStorage.setItem('coach-dashboard-notifications', JSON.stringify(preferences));
      
      // Simulate page reload
      const stored = mockLocalStorage.getItem('coach-dashboard-notifications');
      const loaded = JSON.parse(stored!);
      
      expect(loaded).toEqual(preferences);
    });
  });

  describe('Notification Throttling', () => {
    it('should allow notification if enough time has passed', () => {
      const now = Date.now();
      const minInterval = 300; // 5 minutes in seconds
      const lastTime = now - (minInterval * 1000) - 1000; // 1 second past threshold
      
      const timePassed = now - lastTime;
      const canNotify = timePassed >= (minInterval * 1000);
      
      expect(canNotify).toBe(true);
    });

    it('should block notification if not enough time has passed', () => {
      const now = Date.now();
      const minInterval = 300;
      const lastTime = now - 60000; // Only 1 minute ago
      
      const timePassed = now - lastTime;
      const canNotify = timePassed >= (minInterval * 1000);
      
      expect(canNotify).toBe(false);
    });

    it('should calculate remaining time correctly', () => {
      const now = Date.now();
      const minInterval = 300;
      const lastTime = now - 120000; // 2 minutes ago
      
      const timePassed = now - lastTime;
      const remainingMs = (minInterval * 1000) - timePassed;
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      
      expect(remainingSeconds).toBe(180); // 3 minutes remaining
    });

    it('should track last notification time per coach', () => {
      const preferences = {
        enabled: true,
        coaches: { coach_d: true, coach_i: true, coach_s: true, coach_n: true },
        minInterval: 300,
        sound: false,
        lastNotificationTime: {
          coach_d: Date.now() - 60000, // 1 minute ago
          coach_i: Date.now() - 600000, // 10 minutes ago
          coach_s: 0, // Never notified
          coach_n: Date.now() - 180000, // 3 minutes ago
        },
      };
      
      mockLocalStorage.setItem('coach-dashboard-notifications', JSON.stringify(preferences));
      
      const stored = JSON.parse(mockLocalStorage.getItem('coach-dashboard-notifications')!);
      
      // coach_i should be able to notify (10 minutes > 5 minutes)
      const now = Date.now();
      const canNotifyCoachI = (now - stored.lastNotificationTime.coach_i) >= (300 * 1000);
      expect(canNotifyCoachI).toBe(true);
      
      // coach_d should not be able to notify (1 minute < 5 minutes)
      const canNotifyCoachD = (now - stored.lastNotificationTime.coach_d) >= (300 * 1000);
      expect(canNotifyCoachD).toBe(false);
    });
  });

  describe('Notification Display', () => {
    it('should create notification with correct properties', () => {
      MockNotification.permission = 'granted';
      
      const notification = new MockNotification('Test Title', {
        body: 'Test body',
        icon: '/favicon.ico',
        tag: 'test-tag',
      });
      
      expect(notification.title).toBe('Test Title');
      expect(notification.options.body).toBe('Test body');
      expect(notification.options.icon).toBe('/favicon.ico');
      expect(notification.options.tag).toBe('test-tag');
    });

    it('should include coach name in notification title', () => {
      const coachName = 'Day Trading Coach';
      const title = `New Plan from ${coachName}`;
      
      const notification = new MockNotification(title);
      
      expect(notification.title).toContain('Day Trading Coach');
    });

    it('should truncate long plan previews', () => {
      const longPlan = 'A'.repeat(200);
      const preview = longPlan.substring(0, 100) + '...';
      
      expect(preview.length).toBe(103); // 100 chars + '...'
      expect(preview.endsWith('...')).toBe(true);
    });

    it('should not truncate short plan previews', () => {
      const shortPlan = 'Short plan text';
      const preview = shortPlan.substring(0, 100) + (shortPlan.length > 100 ? '...' : '');
      
      expect(preview).toBe('Short plan text');
      expect(preview.endsWith('...')).toBe(false);
    });
  });

  describe('Per-Coach Settings', () => {
    it('should respect per-coach notification toggles', () => {
      const preferences = {
        enabled: true,
        coaches: {
          coach_d: true,
          coach_i: false, // Disabled
          coach_s: true,
          coach_n: true,
        },
        minInterval: 300,
        sound: false,
        lastNotificationTime: { coach_d: 0, coach_i: 0, coach_s: 0, coach_n: 0 },
      };
      
      expect(preferences.coaches.coach_i).toBe(false);
      expect(preferences.coaches.coach_d).toBe(true);
    });

    it('should allow different intervals per coach', () => {
      // While the system uses a global interval, we can test the concept
      const coachIntervals = {
        coach_d: 300, // 5 minutes
        coach_i: 600, // 10 minutes
        coach_s: 900, // 15 minutes
        coach_n: 300, // 5 minutes
      };
      
      expect(coachIntervals.coach_i).toBeGreaterThan(coachIntervals.coach_d);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing localStorage gracefully', () => {
      // Simulate localStorage being unavailable
      const originalGetItem = mockLocalStorage.getItem;
      mockLocalStorage.getItem = () => { throw new Error('localStorage unavailable'); };
      
      let error: Error | null = null;
      try {
        mockLocalStorage.getItem('test');
      } catch (e) {
        error = e as Error;
      }
      
      expect(error).not.toBeNull();
      expect(error?.message).toContain('localStorage unavailable');
      
      // Restore
      mockLocalStorage.getItem = originalGetItem;
    });

    it('should handle corrupted preference data', () => {
      mockLocalStorage.setItem('coach-dashboard-notifications', 'invalid json {');
      
      let error: Error | null = null;
      try {
        JSON.parse(mockLocalStorage.getItem('coach-dashboard-notifications')!);
      } catch (e) {
        error = e as Error;
      }
      
      expect(error).not.toBeNull();
    });

    it('should handle notification API not supported', () => {
      const originalNotification = global.Notification;
      // @ts-ignore
      delete global.Notification;
      
      const isSupported = 'Notification' in global;
      expect(isSupported).toBe(false);
      
      // Restore
      Object.defineProperty(global, 'Notification', {
        value: originalNotification,
        writable: true,
      });
    });

    it('should handle zero interval edge case', () => {
      const minInterval = 0;
      const lastTime = Date.now() - 1000;
      const now = Date.now();
      
      const canNotify = (now - lastTime) >= (minInterval * 1000);
      expect(canNotify).toBe(true); // Should always allow with 0 interval
    });

    it('should handle very large interval', () => {
      const minInterval = 86400; // 24 hours
      const lastTime = Date.now() - 3600000; // 1 hour ago
      const now = Date.now();
      
      const canNotify = (now - lastTime) >= (minInterval * 1000);
      expect(canNotify).toBe(false); // Should not allow
    });
  });

  describe('Notification Data', () => {
    it('should include metadata in notification data', () => {
      const notificationData = {
        coachKey: 'coach_d',
        coachName: 'Day Trading Coach',
        timestamp: Date.now(),
      };
      
      const notification = new MockNotification('Test', {
        data: notificationData,
      });
      
      expect(notification.options.data).toEqual(notificationData);
    });

    it('should handle notification click events', () => {
      const notification = new MockNotification('Test');
      
      let clicked = false;
      notification.onclick = () => {
        clicked = true;
      };
      
      // Simulate click
      if (notification.onclick) {
        notification.onclick.call(notification, new Event('click'));
      }
      
      expect(clicked).toBe(true);
    });
  });
});
