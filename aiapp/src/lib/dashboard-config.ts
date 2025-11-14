/**
 * Dashboard configuration and constants
 */

import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/types/notifications';
import { DEFAULT_CHART_OPTIONS } from '@/types/charts';

/**
 * Dashboard settings
 */
export interface DashboardSettings {
  /** Chart theme preference */
  chartTheme: 'light' | 'dark';
  
  /** Show original chart URLs as fallback */
  showOriginalCharts: boolean;
  
  /** Automatically generate charts for new plans */
  autoGenerateCharts: boolean;
  
  /** Dashboard polling interval in milliseconds */
  pollingInterval: number;
}

/**
 * Default dashboard settings
 */
export const DEFAULT_DASHBOARD_SETTINGS: DashboardSettings = {
  chartTheme: 'light',
  showOriginalCharts: false,
  autoGenerateCharts: true,
  pollingInterval: 30000, // 30 seconds
};

/**
 * Coach display names
 */
export const COACH_NAMES: Record<string, string> = {
  coach_d: 'Coach D',
  coach_i: 'Coach I',
  coach_s: 'Coach S',
  coach_n: 'Coach N',
};

/**
 * Coach colors for UI
 */
export const COACH_COLORS: Record<string, string> = {
  coach_d: '#3B82F6', // blue
  coach_i: '#10B981', // green
  coach_s: '#F59E0B', // amber
  coach_n: '#8B5CF6', // purple
};

/**
 * Export all default configurations
 */
export const DEFAULT_CONFIG = {
  notifications: DEFAULT_NOTIFICATION_PREFERENCES,
  charts: DEFAULT_CHART_OPTIONS,
  dashboard: DEFAULT_DASHBOARD_SETTINGS,
};
