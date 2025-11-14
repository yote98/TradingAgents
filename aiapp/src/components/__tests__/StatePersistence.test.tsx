/**
 * State Persistence Tests
 * Verifies that dashboard state persists across page refreshes
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardLayout from '../DashboardLayout';

// Mock localStorage
const localStorageMock = (() => {
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
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('State Persistence Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('Active Section Restoration', () => {
    it('should restore the previously active section from localStorage', async () => {
      // Set up localStorage with saved state
      const savedState = {
        activeSection: 'analyze',
        timestamp: Date.now(),
      };
      localStorageMock.setItem('dashboard_state', JSON.stringify(savedState));

      render(<DashboardLayout renderSections={true} />);

      // Wait for component to load and restore state
      await waitFor(() => {
        expect(screen.getByText(/Run Stock Analysis/i)).toBeInTheDocument();
      });

      // Verify the Analyze section is active
      const analyzeNav = screen.getByRole('button', { name: /Analyze/i });
      expect(analyzeNav).toHaveAttribute('aria-current', 'page');
    });

    it('should default to Home section when no saved state exists', async () => {
      // Ensure localStorage is empty
      localStorageMock.clear();

      render(<DashboardLayout renderSections={true} />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
      });

      // Verify the Home section is active
      const homeNav = screen.getByRole('button', { name: /Home/i });
      expect(homeNav).toHaveAttribute('aria-current', 'page');
    });

    it('should save active section to localStorage when changed', async () => {
      render(<DashboardLayout renderSections={true} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
      });

      // Navigate to Coaches section
      const coachesNav = screen.getByRole('button', { name: /Coaches/i });
      fireEvent.click(coachesNav);

      await waitFor(() => {
        expect(screen.getByText(/Coach Plans/i)).toBeInTheDocument();
      });

      // Verify localStorage was updated
      const savedState = JSON.parse(
        localStorageMock.getItem('dashboard_state') || '{}'
      );
      expect(savedState.activeSection).toBe('coaches');
      expect(savedState.timestamp).toBeDefined();
    });
  });

  describe('Settings Persistence', () => {
    it('should persist theme preference across refreshes', async () => {
      // Set up saved preferences
      const savedPreferences = {
        theme: 'dark',
        notifications: {
          enableNotifications: true,
          coachNotifications: {
            'Day Trading Coach': true,
            'Swing Trading Coach': false,
          },
        },
        apiConfig: {
          backendUrl: 'http://localhost:5000',
        },
      };
      localStorageMock.setItem(
        'user_preferences',
        JSON.stringify(savedPreferences)
      );

      render(<DashboardLayout renderSections={true} />);

      // Navigate to Settings
      const settingsNav = screen.getByRole('button', { name: /Settings/i });
      fireEvent.click(settingsNav);

      await waitFor(() => {
        expect(screen.getByText(/Dashboard Settings/i)).toBeInTheDocument();
      });

      // Verify theme is set to dark
      const themeSelect = screen.getByLabelText(/Theme/i) as HTMLSelectElement;
      expect(themeSelect.value).toBe('dark');
    });

    it('should save settings changes to localStorage', async () => {
      render(<DashboardLayout renderSections={true} />);

      // Navigate to Settings
      const settingsNav = screen.getByRole('button', { name: /Settings/i });
      fireEvent.click(settingsNav);

      await waitFor(() => {
        expect(screen.getByText(/Dashboard Settings/i)).toBeInTheDocument();
      });

      // Change theme
      const themeSelect = screen.getByLabelText(/Theme/i);
      fireEvent.change(themeSelect, { target: { value: 'dark' } });

      // Wait for save
      await waitFor(() => {
        const savedPreferences = JSON.parse(
          localStorageMock.getItem('user_preferences') || '{}'
        );
        expect(savedPreferences.theme).toBe('dark');
      });
    });

    it('should persist notification preferences', async () => {
      render(<DashboardLayout renderSections={true} />);

      // Navigate to Settings
      const settingsNav = screen.getByRole('button', { name: /Settings/i });
      fireEvent.click(settingsNav);

      await waitFor(() => {
        expect(screen.getByText(/Dashboard Settings/i)).toBeInTheDocument();
      });

      // Toggle notifications
      const notificationToggle = screen.getByLabelText(/Enable Notifications/i);
      fireEvent.click(notificationToggle);

      // Wait for save
      await waitFor(() => {
        const savedPreferences = JSON.parse(
          localStorageMock.getItem('user_preferences') || '{}'
        );
        expect(savedPreferences.notifications.enableNotifications).toBeDefined();
      });
    });
  });

  describe('Analysis Cache Persistence', () => {
    it('should cache analysis results for 5 minutes', async () => {
      const mockResults = {
        ticker: 'AAPL',
        timestamp: new Date().toISOString(),
        finalDecision: 'BUY',
        confidence: 0.8,
      };

      // Mock fetch for analysis
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: mockResults,
        }),
      });

      render(<DashboardLayout renderSections={true} />);

      // Navigate to Analyze
      const analyzeNav = screen.getByRole('button', { name: /Analyze/i });
      fireEvent.click(analyzeNav);

      await waitFor(() => {
        expect(screen.getByText(/Run Stock Analysis/i)).toBeInTheDocument();
      });

      // Run analysis
      const tickerInput = screen.getByLabelText(/Ticker/i);
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });

      const runButton = screen.getByRole('button', { name: /Run Analysis/i });
      fireEvent.click(runButton);

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText(/Analysis Results/i)).toBeInTheDocument();
      });

      // Verify cache was updated
      const cache = JSON.parse(
        localStorageMock.getItem('analysis_cache') || '{}'
      );
      expect(cache.AAPL).toBeDefined();
      expect(cache.AAPL.results.ticker).toBe('AAPL');
      expect(cache.AAPL.timestamp).toBeDefined();
    });

    it('should use cached results when available', async () => {
      const cachedResults = {
        ticker: 'TSLA',
        timestamp: new Date().toISOString(),
        finalDecision: 'HOLD',
        confidence: 0.6,
      };

      // Set up cache
      const cache = {
        TSLA: {
          results: cachedResults,
          timestamp: Date.now(),
        },
      };
      localStorageMock.setItem('analysis_cache', JSON.stringify(cache));

      // Mock fetch should not be called
      global.fetch = jest.fn();

      render(<DashboardLayout renderSections={true} />);

      // Navigate to Analyze
      const analyzeNav = screen.getByRole('button', { name: /Analyze/i });
      fireEvent.click(analyzeNav);

      await waitFor(() => {
        expect(screen.getByText(/Run Stock Analysis/i)).toBeInTheDocument();
      });

      // Request cached ticker
      const tickerInput = screen.getByLabelText(/Ticker/i);
      fireEvent.change(tickerInput, { target: { value: 'TSLA' } });

      const runButton = screen.getByRole('button', { name: /Run Analysis/i });
      fireEvent.click(runButton);

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText(/Analysis Results/i)).toBeInTheDocument();
      });

      // Verify fetch was not called (used cache)
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should invalidate cache after 5 minutes', async () => {
      const oldTimestamp = Date.now() - 6 * 60 * 1000; // 6 minutes ago
      const cachedResults = {
        ticker: 'NVDA',
        timestamp: new Date(oldTimestamp).toISOString(),
        finalDecision: 'BUY',
        confidence: 0.9,
      };

      // Set up expired cache
      const cache = {
        NVDA: {
          results: cachedResults,
          timestamp: oldTimestamp,
        },
      };
      localStorageMock.setItem('analysis_cache', JSON.stringify(cache));

      // Mock fresh fetch
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: {
            ticker: 'NVDA',
            finalDecision: 'SELL',
            confidence: 0.7,
          },
        }),
      });

      render(<DashboardLayout renderSections={true} />);

      // Navigate to Analyze
      const analyzeNav = screen.getByRole('button', { name: /Analyze/i });
      fireEvent.click(analyzeNav);

      await waitFor(() => {
        expect(screen.getByText(/Run Stock Analysis/i)).toBeInTheDocument();
      });

      // Request ticker with expired cache
      const tickerInput = screen.getByLabelText(/Ticker/i);
      fireEvent.change(tickerInput, { target: { value: 'NVDA' } });

      const runButton = screen.getByRole('button', { name: /Run Analysis/i });
      fireEvent.click(runButton);

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText(/Analysis Results/i)).toBeInTheDocument();
      });

      // Verify fetch was called (cache expired)
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Cross-Refresh State Consistency', () => {
    it('should maintain consistent state across multiple refreshes', async () => {
      // First render - navigate to Risk section
      const { unmount } = render(<DashboardLayout renderSections={true} />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
      });

      const riskNav = screen.getByRole('button', { name: /Risk/i });
      fireEvent.click(riskNav);

      await waitFor(() => {
        expect(screen.getByText(/Risk Management/i)).toBeInTheDocument();
      });

      // Unmount (simulate page refresh)
      unmount();

      // Second render - should restore Risk section
      render(<DashboardLayout renderSections={true} />);

      await waitFor(() => {
        expect(screen.getByText(/Risk Management/i)).toBeInTheDocument();
      });

      // Verify Risk nav is active
      const riskNavAgain = screen.getByRole('button', { name: /Risk/i });
      expect(riskNavAgain).toHaveAttribute('aria-current', 'page');
    });
  });
});
