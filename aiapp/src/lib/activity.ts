/**
 * Activity data fetching utilities
 * Fetches recent activity from localStorage and API
 */

import { Activity } from '@/types/sections';
import { getStorageItem } from './storage';

const ACTIVITY_STORAGE_KEY = 'dashboard_activity';
const MAX_ACTIVITY_ITEMS = 10;

/**
 * Get recent activity from localStorage
 * @returns Array of recent activities
 */
export async function getRecentActivity(): Promise<Activity[]> {
  try {
    // Get activity from localStorage
    const storedActivity = getStorageItem<Activity[]>(ACTIVITY_STORAGE_KEY, []);
    
    // Parse dates (localStorage stores them as strings)
    const parsedActivity = storedActivity.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
    
    // Sort by timestamp (most recent first)
    const sortedActivity = parsedActivity.sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
    
    // Return only the most recent items
    return sortedActivity.slice(0, MAX_ACTIVITY_ITEMS);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

/**
 * Add a new activity item
 * @param activity - Activity to add
 */
export function addActivity(activity: Omit<Activity, 'id'>): void {
  try {
    const currentActivity = getStorageItem<Activity[]>(ACTIVITY_STORAGE_KEY, []);
    
    // Create new activity with ID
    const newActivity: Activity = {
      ...activity,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Add to beginning of array
    const updatedActivity = [newActivity, ...currentActivity];
    
    // Keep only the most recent items
    const trimmedActivity = updatedActivity.slice(0, MAX_ACTIVITY_ITEMS * 2);
    
    // Save back to localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(trimmedActivity));
    }
  } catch (error) {
    console.error('Error adding activity:', error);
  }
}

/**
 * Clear all activity
 */
export function clearActivity(): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ACTIVITY_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error clearing activity:', error);
  }
}

/**
 * Get activity by type
 * @param type - Activity type to filter by
 * @returns Array of activities of the specified type
 */
export async function getActivityByType(type: Activity['type']): Promise<Activity[]> {
  const allActivity = await getRecentActivity();
  return allActivity.filter(item => item.type === type);
}

/**
 * Format activity for display
 * @param activity - Activity to format
 * @returns Formatted activity object
 */
export function formatActivity(activity: Activity): Activity {
  return {
    ...activity,
    timestamp: new Date(activity.timestamp)
  };
}

/**
 * Create sample activity for testing
 * @returns Array of sample activities
 */
export function createSampleActivity(): Activity[] {
  const now = new Date();
  
  return [
    {
      id: '1',
      type: 'analysis',
      title: 'NVDA Analysis Completed',
      timestamp: new Date(now.getTime() - 1000 * 60 * 15), // 15 minutes ago
      summary: 'Bullish outlook with 75% confidence. Strong fundamentals and positive sentiment.'
    },
    {
      id: '2',
      type: 'coach_plan',
      title: 'New Day Trading Plan',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
      summary: 'Swing trade opportunity on AAPL. Entry at $175, target $185.'
    },
    {
      id: '3',
      type: 'sentiment',
      title: 'Twitter Sentiment: Bullish on TSLA',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 5), // 5 hours ago
      summary: 'Strong positive sentiment detected. 78% bullish tweets in the last hour.'
    },
    {
      id: '4',
      type: 'analysis',
      title: 'AAPL Analysis Completed',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24), // 1 day ago
      summary: 'Hold recommendation. Market conditions neutral, waiting for better entry.'
    },
    {
      id: '5',
      type: 'coach_plan',
      title: 'New Swing Trading Plan',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      summary: 'Long-term position on MSFT. Strong fundamentals support upward trend.'
    }
  ];
}
