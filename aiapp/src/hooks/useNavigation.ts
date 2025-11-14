/**
 * useNavigation Hook
 * 
 * Custom hook for managing dashboard navigation state with localStorage persistence
 * and URL synchronization
 */

'use client';

import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { SectionType, DashboardState } from '@/types/navigation';

const STORAGE_KEY = 'dashboard_state';
const DEFAULT_SECTION: SectionType = 'home';

/**
 * Navigation hook return type
 */
interface UseNavigationReturn {
  /** Currently active section */
  activeSection: SectionType;
  
  /** Navigate to a specific section */
  navigateToSection: (section: SectionType) => void;
  
  /** Navigate back to previous section */
  goBack: () => void;
  
  /** Check if can go back */
  canGoBack: boolean;
}

/**
 * Custom hook for managing dashboard navigation
 * 
 * Features:
 * - Active section state management
 * - localStorage persistence
 * - URL synchronization
 * - Browser back/forward support
 * - Navigation history
 * 
 * @returns Navigation state and handlers
 */
export function useNavigation(): UseNavigationReturn {
  // Load initial state from localStorage
  const [dashboardState, setDashboardState] = useLocalStorage<DashboardState>(
    STORAGE_KEY,
    {
      activeSection: DEFAULT_SECTION,
      timestamp: Date.now(),
    }
  );

  // Sync with URL on mount and handle browser navigation
  useEffect(() => {
    // Get section from URL hash
    const getSectionFromURL = (): SectionType | null => {
      if (typeof window === 'undefined') return null;
      
      const hash = window.location.hash.slice(1); // Remove '#'
      const validSections: SectionType[] = [
        'home',
        'coaches',
        'social',
        'analyze',
        'backtest',
        'risk',
        'settings',
      ];
      
      return validSections.includes(hash as SectionType) ? (hash as SectionType) : null;
    };

    // Initialize from URL if present
    const urlSection = getSectionFromURL();
    if (urlSection && urlSection !== dashboardState.activeSection) {
      setDashboardState({
        activeSection: urlSection,
        timestamp: Date.now(),
      });
    } else if (!urlSection) {
      // Set URL to match current state
      window.history.replaceState(
        null,
        '',
        `#${dashboardState.activeSection}`
      );
    }

    // Handle browser back/forward navigation
    const handlePopState = () => {
      const section = getSectionFromURL();
      if (section) {
        setDashboardState({
          activeSection: section,
          timestamp: Date.now(),
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []); // Only run on mount

  // Navigate to a specific section
  const navigateToSection = useCallback(
    (section: SectionType) => {
      if (section === dashboardState.activeSection) {
        return; // Already on this section
      }

      // Update state
      setDashboardState({
        activeSection: section,
        timestamp: Date.now(),
      });

      // Update URL
      if (typeof window !== 'undefined') {
        window.history.pushState(
          null,
          '',
          `#${section}`
        );
      }
    },
    [dashboardState.activeSection, setDashboardState]
  );

  // Navigate back (using browser history)
  const goBack = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }, []);

  // Check if can go back
  const canGoBack = typeof window !== 'undefined' && window.history.length > 1;

  return {
    activeSection: dashboardState.activeSection,
    navigateToSection,
    goBack,
    canGoBack,
  };
}
