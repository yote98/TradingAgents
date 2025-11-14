/**
 * Navigation Types
 * 
 * TypeScript interfaces for dashboard navigation state management
 */

/**
 * Available dashboard sections
 */
export type SectionType = 
  | 'home' 
  | 'coaches' 
  | 'social' 
  | 'analyze' 
  | 'backtest' 
  | 'risk' 
  | 'settings';

/**
 * Navigation state for the dashboard
 */
export interface NavigationState {
  /** Currently active section */
  activeSection: SectionType;
  
  /** Navigation history for back/forward functionality */
  history: SectionType[];
  
  /** Whether the sidebar is collapsed (mobile) */
  sidebarCollapsed: boolean;
}

/**
 * User preferences stored in localStorage
 */
export interface UserPreferences {
  /** Theme preference */
  theme: 'light' | 'dark';
  
  /** Default section to show on load */
  defaultSection: SectionType;
  
  /** Notification preferences */
  notifications: NotificationPreferences;
  
  /** API configuration */
  apiConfig: APIConfig;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  /** Enable browser notifications */
  enableNotifications: boolean;
  
  /** Per-coach notification settings */
  coachNotifications: Record<string, boolean>;
  
  /** Enable analysis completion notifications */
  analysisNotifications: boolean;
}

/**
 * API configuration
 */
export interface APIConfig {
  /** Backend API URL */
  backendUrl: string;
  
  /** Request timeout in milliseconds */
  timeout: number;
}

/**
 * Dashboard state stored in localStorage
 */
export interface DashboardState {
  /** Active section */
  activeSection: SectionType;
  
  /** Timestamp of last update */
  timestamp: number;
}

/**
 * Stored preferences with version for migration
 */
export interface StoredPreferences extends UserPreferences {
  /** Version for handling migrations */
  version: string;
}
