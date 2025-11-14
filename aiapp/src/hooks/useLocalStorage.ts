/**
 * useLocalStorage Hook
 * 
 * Generic localStorage hook with TypeScript support and error handling
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with TypeScript
 * 
 * @param key - localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns [storedValue, setValue] tuple
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        // Handle quota exceeded error
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.error('localStorage quota exceeded. Consider clearing old data.');
          
          // Attempt to clear old data and retry
          try {
            // Clear items older than 30 days
            clearOldLocalStorageItems();
            window.localStorage.setItem(key, JSON.stringify(value));
            setStoredValue(value instanceof Function ? value(storedValue) : value);
          } catch (retryError) {
            console.error('Failed to save to localStorage even after cleanup:', retryError);
          }
        } else {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
      }
    },
    [key, storedValue]
  );

  // Listen for changes to this key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

/**
 * Clear localStorage items older than specified days
 * Helper function to handle quota exceeded errors
 */
function clearOldLocalStorageItems(daysOld: number = 30): void {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  const maxAge = daysOld * 24 * 60 * 60 * 1000; // Convert days to milliseconds

  try {
    // Iterate through all localStorage keys
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;

      try {
        const item = window.localStorage.getItem(key);
        if (!item) continue;

        const parsed = JSON.parse(item);
        
        // Check if item has a timestamp and is old
        if (parsed && typeof parsed === 'object' && 'timestamp' in parsed) {
          const timestamp = parsed.timestamp as number;
          if (now - timestamp > maxAge) {
            window.localStorage.removeItem(key);
            console.log(`Removed old localStorage item: ${key}`);
          }
        }
      } catch (error) {
        // Skip items that can't be parsed
        continue;
      }
    }
  } catch (error) {
    console.error('Error clearing old localStorage items:', error);
  }
}
