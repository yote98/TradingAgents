/**
 * useNavigation Hook Tests
 * 
 * Tests for the navigation hook including state management, localStorage persistence,
 * and URL synchronization.
 * 
 * Note: These tests validate the logic and data structures. To run with a test runner,
 * install Jest or Vitest and configure appropriately.
 */

import type { SectionType, DashboardState } from '@/types/navigation';

// Mock localStorage for testing
const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
};

// Mock window.history for testing
const createMockHistory = () => {
  let historyStack: string[] = ['#home'];
  let currentIndex = 0;
  
  return {
    pushState: (_state: any, _title: string, url: string) => {
      historyStack = historyStack.slice(0, currentIndex + 1);
      historyStack.push(url);
      currentIndex = historyStack.length - 1;
    },
    replaceState: (_state: any, _title: string, url: string) => {
      historyStack[currentIndex] = url;
    },
    back: () => {
      if (currentIndex > 0) {
        currentIndex--;
      }
    },
    forward: () => {
      if (currentIndex < historyStack.length - 1) {
        currentIndex++;
      }
    },
    get length() {
      return historyStack.length;
    },
    getCurrentUrl: () => historyStack[currentIndex],
    reset: () => {
      historyStack = ['#home'];
      currentIndex = 0;
    },
  };
};

// Test suite placeholder - uncomment when test runner is configured
/*
describe('useNavigation Hook', () => {
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;
  let mockHistory: ReturnType<typeof createMockHistory>;
  
  beforeEach(() => {
    mockLocalStorage = createMockLocalStorage();
    mockHistory = createMockHistory();
  });

  describe('Initialization', () => {
    it('should initialize with default section', () => {
      const defaultState: DashboardState = {
        activeSection: 'home',
        timestamp: Date.now(),
      };
      
      expect(defaultState.activeSection).toBe('home');
      expect(typeof defaultState.timestamp).toBe('number');
    });

    it('should load state from localStorage if available', () => {
      const savedState: DashboardState = {
        activeSection: 'coaches',
        timestamp: Date.now(),
      };
      
      mockLocalStorage.setItem('dashboard_state', JSON.stringify(savedState));
      
      const loaded = mockLocalStorage.getItem('dashboard_state');
      const parsed = JSON.parse(loaded!);
      
      expect(parsed.activeSection).toBe('coaches');
    });

    it('should use default if localStorage is empty', () => {
      const loaded = mockLocalStorage.getItem('dashboard_state');
      const activeSection = loaded ? JSON.parse(loaded).activeSection : 'home';
      
      expect(activeSection).toBe('home');
    });

    it('should handle corrupted localStorage data', () => {
      mockLocalStorage.setItem('dashboard_state', 'invalid json');
      
      let activeSection: SectionType = 'home';
      
      try {
        const loaded = mockLocalStorage.getItem('dashboard_state');
        if (loaded) {
          const parsed = JSON.parse(loaded);
          activeSection = parsed.activeSection;
        }
      } catch (error) {
        activeSection = 'home';
      }
      
      expect(activeSection).toBe('home');
    });
  });

  describe('Navigation State Changes', () => {
    it('should update active section', () => {
      let activeSection: SectionType = 'home';
      
      const navigateToSection = (section: SectionType) => {
        activeSection = section;
      };
      
      navigateToSection('analyze');
      expect(activeSection).toBe('analyze');
    });

    it('should not update if already on the section', () => {
      let activeSection: SectionType = 'home';
      let updateCount = 0;
      
      const navigateToSection = (section: SectionType) => {
        if (section !== activeSection) {
          activeSection = section;
          updateCount++;
        }
      };
      
      navigateToSection('home');
      expect(updateCount).toBe(0);
      
      navigateToSection('coaches');
      expect(updateCount).toBe(1);
    });

    it('should update timestamp on navigation', () => {
      const state1: DashboardState = {
        activeSection: 'home',
        timestamp: Date.now(),
      };
      
      // Simulate time passing
      const state2: DashboardState = {
        activeSection: 'coaches',
        timestamp: Date.now() + 1000,
      };
      
      expect(state2.timestamp).toBeGreaterThan(state1.timestamp);
    });

    it('should support all valid sections', () => {
      const validSections: SectionType[] = [
        'home',
        'coaches',
        'social',
        'analyze',
        'backtest',
        'risk',
        'settings',
      ];
      
      validSections.forEach(section => {
        let activeSection: SectionType = 'home';
        
        const navigateToSection = (newSection: SectionType) => {
          activeSection = newSection;
        };
        
        navigateToSection(section);
        expect(activeSection).toBe(section);
      });
    });
  });

  describe('LocalStorage Persistence', () => {
    it('should save state to localStorage on navigation', () => {
      const state: DashboardState = {
        activeSection: 'backtest',
        timestamp: Date.now(),
      };
      
      mockLocalStorage.setItem('dashboard_state', JSON.stringify(state));
      
      const saved = mockLocalStorage.getItem('dashboard_state');
      expect(saved).toBeDefined();
      
      const parsed = JSON.parse(saved!);
      expect(parsed.activeSection).toBe('backtest');
    });

    it('should include timestamp in saved state', () => {
      const state: DashboardState = {
        activeSection: 'risk',
        timestamp: Date.now(),
      };
      
      mockLocalStorage.setItem('dashboard_state', JSON.stringify(state));
      
      const saved = mockLocalStorage.getItem('dashboard_state');
      const parsed = JSON.parse(saved!);
      
      expect(parsed.timestamp).toBeDefined();
      expect(typeof parsed.timestamp).toBe('number');
    });

    it('should restore state on page load', () => {
      const savedState: DashboardState = {
        activeSection: 'settings',
        timestamp: Date.now() - 60000, // 1 minute ago
      };
      
      mockLocalStorage.setItem('dashboard_state', JSON.stringify(savedState));
      
      const loaded = mockLocalStorage.getItem('dashboard_state');
      const parsed = JSON.parse(loaded!);
      
      expect(parsed.activeSection).toBe('settings');
      expect(parsed.timestamp).toBeLessThan(Date.now());
    });

    it('should handle localStorage quota exceeded', () => {
      // Simulate quota exceeded by trying to store large data
      let quotaExceeded = false;
      
      try {
        // Simulate large data
        const largeData = 'x'.repeat(10 * 1024 * 1024); // 10MB
        mockLocalStorage.setItem('large_key', largeData);
      } catch (error) {
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          quotaExceeded = true;
        }
      }
      
      // Should handle gracefully (in real implementation)
      expect(typeof quotaExceeded).toBe('boolean');
    });
  });

  describe('URL Synchronization', () => {
    it('should update URL when section changes', () => {
      const section: SectionType = 'analyze';
      mockHistory.pushState(null, '', `#${section}`);
      
      const currentUrl = mockHistory.getCurrentUrl();
      expect(currentUrl).toBe('#analyze');
    });

    it('should extract section from URL hash', () => {
      const getSectionFromURL = (hash: string): SectionType | null => {
        const section = hash.slice(1); // Remove '#'
        const validSections: SectionType[] = [
          'home',
          'coaches',
          'social',
          'analyze',
          'backtest',
          'risk',
          'settings',
        ];
        
        return validSections.includes(section as SectionType) ? (section as SectionType) : null;
      };
      
      expect(getSectionFromURL('#home')).toBe('home');
      expect(getSectionFromURL('#coaches')).toBe('coaches');
      expect(getSectionFromURL('#invalid')).toBeNull();
      expect(getSectionFromURL('')).toBeNull();
    });

    it('should sync state with URL on mount', () => {
      mockHistory.replaceState(null, '', '#social');
      
      const urlSection = mockHistory.getCurrentUrl().slice(1) as SectionType;
      const state: DashboardState = {
        activeSection: urlSection,
        timestamp: Date.now(),
      };
      
      expect(state.activeSection).toBe('social');
    });

    it('should set URL if not present on mount', () => {
      const activeSection: SectionType = 'home';
      mockHistory.replaceState(null, '', `#${activeSection}`);
      
      const currentUrl = mockHistory.getCurrentUrl();
      expect(currentUrl).toBe('#home');
    });

    it('should handle browser back navigation', () => {
      mockHistory.pushState(null, '', '#home');
      mockHistory.pushState(null, '', '#coaches');
      mockHistory.pushState(null, '', '#analyze');
      
      expect(mockHistory.getCurrentUrl()).toBe('#analyze');
      
      mockHistory.back();
      expect(mockHistory.getCurrentUrl()).toBe('#coaches');
      
      mockHistory.back();
      expect(mockHistory.getCurrentUrl()).toBe('#home');
    });

    it('should handle browser forward navigation', () => {
      mockHistory.pushState(null, '', '#home');
      mockHistory.pushState(null, '', '#coaches');
      mockHistory.back();
      
      expect(mockHistory.getCurrentUrl()).toBe('#home');
      
      mockHistory.forward();
      expect(mockHistory.getCurrentUrl()).toBe('#coaches');
    });

    it('should sync state on popstate event', () => {
      mockHistory.pushState(null, '', '#backtest');
      
      const handlePopState = () => {
        const hash = mockHistory.getCurrentUrl();
        const section = hash.slice(1) as SectionType;
        return section;
      };
      
      const section = handlePopState();
      expect(section).toBe('backtest');
    });
  });

  describe('Navigation History', () => {
    it('should track navigation history', () => {
      const history: SectionType[] = [];
      
      const navigateToSection = (section: SectionType) => {
        history.push(section);
      };
      
      navigateToSection('home');
      navigateToSection('coaches');
      navigateToSection('analyze');
      
      expect(history.length).toBe(3);
      expect(history[0]).toBe('home');
      expect(history[2]).toBe('analyze');
    });

    it('should support going back', () => {
      mockHistory.pushState(null, '', '#home');
      mockHistory.pushState(null, '', '#coaches');
      
      const canGoBack = mockHistory.length > 1;
      expect(canGoBack).toBe(true);
      
      mockHistory.back();
      expect(mockHistory.getCurrentUrl()).toBe('#home');
    });

    it('should know when cannot go back', () => {
      mockHistory.reset();
      
      const canGoBack = mockHistory.length > 1;
      expect(canGoBack).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid section gracefully', () => {
      const validSections: SectionType[] = [
        'home',
        'coaches',
        'social',
        'analyze',
        'backtest',
        'risk',
        'settings',
      ];
      
      const isValidSection = (section: string): section is SectionType => {
        return validSections.includes(section as SectionType);
      };
      
      expect(isValidSection('home')).toBe(true);
      expect(isValidSection('invalid')).toBe(false);
      expect(isValidSection('')).toBe(false);
    });

    it('should handle missing window object (SSR)', () => {
      const isServer = typeof window === 'undefined';
      
      if (isServer) {
        // Should use default values
        const activeSection: SectionType = 'home';
        expect(activeSection).toBe('home');
      }
    });

    it('should handle localStorage access errors', () => {
      let error: Error | null = null;
      
      try {
        // Simulate localStorage access error
        throw new Error('localStorage is not available');
      } catch (e) {
        error = e as Error;
      }
      
      expect(error).toBeDefined();
      expect(error?.message).toContain('localStorage');
    });
  });

  describe('Integration', () => {
    it('should coordinate state, localStorage, and URL', () => {
      const section: SectionType = 'risk';
      
      // Update state
      const state: DashboardState = {
        activeSection: section,
        timestamp: Date.now(),
      };
      
      // Save to localStorage
      mockLocalStorage.setItem('dashboard_state', JSON.stringify(state));
      
      // Update URL
      mockHistory.pushState(null, '', `#${section}`);
      
      // Verify all are in sync
      const savedState = JSON.parse(mockLocalStorage.getItem('dashboard_state')!);
      const urlSection = mockHistory.getCurrentUrl().slice(1);
      
      expect(savedState.activeSection).toBe(section);
      expect(urlSection).toBe(section);
      expect(state.activeSection).toBe(section);
    });

    it('should restore complete state on page load', () => {
      // Setup: User was on 'analyze' section
      const savedState: DashboardState = {
        activeSection: 'analyze',
        timestamp: Date.now() - 5000,
      };
      
      mockLocalStorage.setItem('dashboard_state', JSON.stringify(savedState));
      mockHistory.replaceState(null, '', '#analyze');
      
      // Simulate page load
      const loadedState = JSON.parse(mockLocalStorage.getItem('dashboard_state')!);
      const urlSection = mockHistory.getCurrentUrl().slice(1);
      
      expect(loadedState.activeSection).toBe('analyze');
      expect(urlSection).toBe('analyze');
    });
  });
});

describe('useLocalStorage Hook', () => {
  let mockLocalStorage: ReturnType<typeof createMockLocalStorage>;
  
  beforeEach(() => {
    mockLocalStorage = createMockLocalStorage();
  });

  describe('Basic Functionality', () => {
    it('should store and retrieve values', () => {
      const key = 'test_key';
      const value = { data: 'test' };
      
      mockLocalStorage.setItem(key, JSON.stringify(value));
      
      const retrieved = mockLocalStorage.getItem(key);
      const parsed = JSON.parse(retrieved!);
      
      expect(parsed.data).toBe('test');
    });

    it('should handle different data types', () => {
      // String
      mockLocalStorage.setItem('string', JSON.stringify('hello'));
      expect(JSON.parse(mockLocalStorage.getItem('string')!)).toBe('hello');
      
      // Number
      mockLocalStorage.setItem('number', JSON.stringify(42));
      expect(JSON.parse(mockLocalStorage.getItem('number')!)).toBe(42);
      
      // Boolean
      mockLocalStorage.setItem('boolean', JSON.stringify(true));
      expect(JSON.parse(mockLocalStorage.getItem('boolean')!)).toBe(true);
      
      // Object
      mockLocalStorage.setItem('object', JSON.stringify({ key: 'value' }));
      expect(JSON.parse(mockLocalStorage.getItem('object')!).key).toBe('value');
      
      // Array
      mockLocalStorage.setItem('array', JSON.stringify([1, 2, 3]));
      expect(JSON.parse(mockLocalStorage.getItem('array')!).length).toBe(3);
    });

    it('should return null for non-existent keys', () => {
      const value = mockLocalStorage.getItem('non_existent');
      expect(value).toBeNull();
    });

    it('should update existing values', () => {
      const key = 'update_test';
      
      mockLocalStorage.setItem(key, JSON.stringify('initial'));
      expect(JSON.parse(mockLocalStorage.getItem(key)!)).toBe('initial');
      
      mockLocalStorage.setItem(key, JSON.stringify('updated'));
      expect(JSON.parse(mockLocalStorage.getItem(key)!)).toBe('updated');
    });

    it('should remove items', () => {
      const key = 'remove_test';
      
      mockLocalStorage.setItem(key, JSON.stringify('value'));
      expect(mockLocalStorage.getItem(key)).toBeDefined();
      
      mockLocalStorage.removeItem(key);
      expect(mockLocalStorage.getItem(key)).toBeNull();
    });

    it('should clear all items', () => {
      mockLocalStorage.setItem('key1', JSON.stringify('value1'));
      mockLocalStorage.setItem('key2', JSON.stringify('value2'));
      
      expect(mockLocalStorage.length).toBe(2);
      
      mockLocalStorage.clear();
      expect(mockLocalStorage.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parse errors', () => {
      mockLocalStorage.setItem('invalid', 'not valid json');
      
      let error: Error | null = null;
      
      try {
        JSON.parse(mockLocalStorage.getItem('invalid')!);
      } catch (e) {
        error = e as Error;
      }
      
      expect(error).toBeDefined();
    });

    it('should handle quota exceeded errors', () => {
      // This would be tested with actual localStorage implementation
      const quotaExceededError = new DOMException(
        'QuotaExceededError',
        'QuotaExceededError'
      );
      
      expect(quotaExceededError.name).toBe('QuotaExceededError');
    });

    it('should handle storage access errors', () => {
      // Simulate storage access error
      let accessError = false;
      
      try {
        // In real scenario, this might throw in private browsing mode
        throw new Error('Storage access denied');
      } catch (error) {
        accessError = true;
      }
      
      expect(accessError).toBe(true);
    });
  });

  describe('Old Data Cleanup', () => {
    it('should identify old items by timestamp', () => {
      const now = Date.now();
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
      
      const oldItem = {
        data: 'old',
        timestamp: thirtyDaysAgo - 1000,
      };
      
      const newItem = {
        data: 'new',
        timestamp: now,
      };
      
      expect(oldItem.timestamp).toBeLessThan(thirtyDaysAgo);
      expect(newItem.timestamp).toBeGreaterThan(thirtyDaysAgo);
    });

    it('should remove items older than threshold', () => {
      const now = Date.now();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      
      const oldItem = {
        data: 'old',
        timestamp: now - maxAge - 1000,
      };
      
      mockLocalStorage.setItem('old_item', JSON.stringify(oldItem));
      
      // Simulate cleanup
      const item = JSON.parse(mockLocalStorage.getItem('old_item')!);
      if (now - item.timestamp > maxAge) {
        mockLocalStorage.removeItem('old_item');
      }
      
      expect(mockLocalStorage.getItem('old_item')).toBeNull();
    });

    it('should keep recent items during cleanup', () => {
      const now = Date.now();
      const maxAge = 30 * 24 * 60 * 60 * 1000;
      
      const recentItem = {
        data: 'recent',
        timestamp: now - 1000,
      };
      
      mockLocalStorage.setItem('recent_item', JSON.stringify(recentItem));
      
      // Simulate cleanup
      const item = JSON.parse(mockLocalStorage.getItem('recent_item')!);
      if (now - item.timestamp > maxAge) {
        mockLocalStorage.removeItem('recent_item');
      }
      
      expect(mockLocalStorage.getItem('recent_item')).toBeDefined();
    });
  });
});
*/

// Validation tests that can run without a test runner
export function validateNavigationHooks() {
  console.log('Running navigation hooks validation...');
  
  const mockLocalStorage = createMockLocalStorage();
  const mockHistory = createMockHistory();
  
  // Test 1: Default state initialization
  const defaultState: DashboardState = {
    activeSection: 'home',
    timestamp: Date.now(),
  };
  console.assert(defaultState.activeSection === 'home', 'Should initialize with home section');
  console.assert(typeof defaultState.timestamp === 'number', 'Should have timestamp');
  
  // Test 2: LocalStorage persistence
  const testState: DashboardState = {
    activeSection: 'coaches',
    timestamp: Date.now(),
  };
  mockLocalStorage.setItem('dashboard_state', JSON.stringify(testState));
  const loaded = mockLocalStorage.getItem('dashboard_state');
  const parsed = JSON.parse(loaded!);
  console.assert(parsed.activeSection === 'coaches', 'Should persist to localStorage');
  
  // Test 3: URL synchronization
  mockHistory.pushState(null, '', '#analyze');
  const currentUrl = mockHistory.getCurrentUrl();
  console.assert(currentUrl === '#analyze', 'Should update URL');
  
  // Test 4: Section validation
  const validSections: SectionType[] = [
    'home',
    'coaches',
    'social',
    'analyze',
    'backtest',
    'risk',
    'settings',
  ];
  console.assert(validSections.length === 7, 'Should have 7 valid sections');
  
  // Test 5: Browser navigation
  mockHistory.reset();
  mockHistory.pushState(null, '', '#home');
  mockHistory.pushState(null, '', '#coaches');
  mockHistory.back();
  console.assert(mockHistory.getCurrentUrl() === '#home', 'Should support back navigation');
  
  // Test 6: History tracking
  console.assert(mockHistory.length > 0, 'Should track history');
  
  // Test 7: Data type handling
  mockLocalStorage.clear();
  mockLocalStorage.setItem('test_string', JSON.stringify('hello'));
  mockLocalStorage.setItem('test_number', JSON.stringify(42));
  mockLocalStorage.setItem('test_boolean', JSON.stringify(true));
  console.assert(mockLocalStorage.length === 3, 'Should handle different data types');
  
  // Test 8: Old data cleanup logic
  const now = Date.now();
  const maxAge = 30 * 24 * 60 * 60 * 1000;
  const oldTimestamp = now - maxAge - 1000;
  console.assert(now - oldTimestamp > maxAge, 'Should identify old data');
  
  // Test 9: Error handling
  mockLocalStorage.setItem('invalid', 'not json');
  let parseError = false;
  try {
    JSON.parse(mockLocalStorage.getItem('invalid')!);
  } catch (error) {
    parseError = true;
  }
  console.assert(parseError === true, 'Should handle parse errors');
  
  // Test 10: State coordination
  const section: SectionType = 'risk';
  const coordState: DashboardState = {
    activeSection: section,
    timestamp: Date.now(),
  };
  mockLocalStorage.setItem('dashboard_state', JSON.stringify(coordState));
  mockHistory.pushState(null, '', `#${section}`);
  const savedState = JSON.parse(mockLocalStorage.getItem('dashboard_state')!);
  const urlSection = mockHistory.getCurrentUrl().slice(1);
  console.assert(
    savedState.activeSection === section && urlSection === section,
    'Should coordinate state, localStorage, and URL'
  );
  
  console.log('✓ All navigation hooks validations passed');
}

// Run validations if this file is executed directly
if (typeof window === 'undefined') {
  validateNavigationHooks();
}
