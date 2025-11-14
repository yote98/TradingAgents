/**
 * User Journey Integration Tests
 * Tests complete user flows through the dashboard
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

// Mock fetch for API calls
global.fetch = jest.fn();

describe('User Journey Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    // Reset window size to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Journey 1: Home → Analyze → View Results', () => {
    it('should navigate from Home to Analyze and display results', async () => {
      // Mock successful analysis response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: {
            ticker: 'AAPL',
            timestamp: new Date().toISOString(),
            analystReports: {
              market: 'Market analysis report',
              fundamentals: 'Fundamentals report',
            },
            bullArguments: ['Strong revenue growth'],
            bearArguments: ['High valuation'],
            finalDecision: 'BUY',
            confidence: 0.75,
            reasoning: 'Strong fundamentals outweigh valuation concerns',
          },
        }),
      });

      const { container } = render(<DashboardLayout renderSections={true} />);

      // Wait for Home section to load
      await waitFor(() => {
        expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
      });

      // Navigate to Analyze section
      const analyzeNav = screen.getByRole('button', { name: /Analyze/i });
      fireEvent.click(analyzeNav);

      // Wait for Analyze section to load
      await waitFor(() => {
        expect(screen.getByText(/Run Stock Analysis/i)).toBeInTheDocument();
      });

      // Fill in analysis form
      const tickerInput = screen.getByLabelText(/Ticker/i);
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });

      // Submit analysis
      const runButton = screen.getByRole('button', { name: /Run Analysis/i });
      fireEvent.click(runButton);

      // Wait for results to appear
      await waitFor(() => {
        expect(screen.getByText(/Analysis Results/i)).toBeInTheDocument();
      });

      // Verify results are displayed
      expect(screen.getByText(/AAPL/i)).toBeInTheDocument();
      expect(screen.getByText(/BUY/i)).toBeInTheDocument();
    });
  });

  describe('Journey 2: Coaches → Social → Settings', () => {
    it('should navigate through Coaches, Social, and Settings sections', async () => {
      // Mock coach plans response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          plans: [
            {
              id: '1',
              coach_name: 'Day Trading Coach',
              ticker: 'TSLA',
              plan: 'Buy at support',
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });

      render(<DashboardLayout renderSections={true} />);

      // Navigate to Coaches section
      const coachesNav = screen.getByRole('button', { name: /Coaches/i });
      fireEvent.click(coachesNav);

      await waitFor(() => {
        expect(screen.getByText(/Coach Plans/i)).toBeInTheDocument();
      });

      // Navigate to Social section
      const socialNav = screen.getByRole('button', { name: /Social/i });
      fireEvent.click(socialNav);

      await waitFor(() => {
        expect(screen.getByText(/Social Sentiment/i)).toBeInTheDocument();
      });

      // Navigate to Settings section
      const settingsNav = screen.getByRole('button', { name: /Settings/i });
      fireEvent.click(settingsNav);

      await waitFor(() => {
        expect(screen.getByText(/Dashboard Settings/i)).toBeInTheDocument();
      });

      // Verify settings form is present
      expect(screen.getByLabelText(/Theme/i)).toBeInTheDocument();
    });
  });

  describe('Journey 3: Mobile Navigation Flow', () => {
    it('should handle mobile navigation correctly', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<DashboardLayout renderSections={true} />);

      // Trigger resize event
      fireEvent(window, new Event('resize'));

      await waitFor(() => {
        // Sidebar should be collapsed on mobile
        const sidebar = document.querySelector('[data-testid="sidebar"]');
        expect(sidebar).toHaveClass('collapsed');
      });

      // Open mobile menu
      const menuButton = screen.getByRole('button', { name: /menu/i });
      fireEvent.click(menuButton);

      await waitFor(() => {
        // Sidebar should be expanded
        const sidebar = document.querySelector('[data-testid="sidebar"]');
        expect(sidebar).not.toHaveClass('collapsed');
      });

      // Select a section
      const analyzeNav = screen.getByRole('button', { name: /Analyze/i });
      fireEvent.click(analyzeNav);

      await waitFor(() => {
        // Sidebar should auto-close after selection
        const sidebar = document.querySelector('[data-testid="sidebar"]');
        expect(sidebar).toHaveClass('collapsed');
      });

      // Verify section changed
      expect(screen.getByText(/Run Stock Analysis/i)).toBeInTheDocument();
    });
  });

  describe('Journey 4: Keyboard Navigation', () => {
    it('should support keyboard shortcuts for navigation', async () => {
      render(<DashboardLayout renderSections={true} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
      });

      // Press Alt+4 to navigate to Analyze
      fireEvent.keyDown(window, { key: '4', altKey: true });

      await waitFor(() => {
        expect(screen.getByText(/Run Stock Analysis/i)).toBeInTheDocument();
      });

      // Press Alt+2 to navigate to Coaches
      fireEvent.keyDown(window, { key: '2', altKey: true });

      await waitFor(() => {
        expect(screen.getByText(/Coach Plans/i)).toBeInTheDocument();
      });

      // Press Alt+7 to navigate to Settings
      fireEvent.keyDown(window, { key: '7', altKey: true });

      await waitFor(() => {
        expect(screen.getByText(/Dashboard Settings/i)).toBeInTheDocument();
      });
    });
  });

  describe('Journey 5: Error Recovery', () => {
    it('should handle API errors gracefully and allow retry', async () => {
      // Mock failed analysis response
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<DashboardLayout renderSections={true} />);

      // Navigate to Analyze section
      const analyzeNav = screen.getByRole('button', { name: /Analyze/i });
      fireEvent.click(analyzeNav);

      await waitFor(() => {
        expect(screen.getByText(/Run Stock Analysis/i)).toBeInTheDocument();
      });

      // Fill in form
      const tickerInput = screen.getByLabelText(/Ticker/i);
      fireEvent.change(tickerInput, { target: { value: 'AAPL' } });

      // Submit analysis
      const runButton = screen.getByRole('button', { name: /Run Analysis/i });
      fireEvent.click(runButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      // Mock successful retry
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: {
            ticker: 'AAPL',
            finalDecision: 'BUY',
          },
        }),
      });

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      // Wait for success
      await waitFor(() => {
        expect(screen.getByText(/Analysis Results/i)).toBeInTheDocument();
      });
    });
  });

  describe('Journey 6: Section State Preservation', () => {
    it('should preserve section state when navigating away and back', async () => {
      render(<DashboardLayout renderSections={true} />);

      // Navigate to Analyze section
      const analyzeNav = screen.getByRole('button', { name: /Analyze/i });
      fireEvent.click(analyzeNav);

      await waitFor(() => {
        expect(screen.getByText(/Run Stock Analysis/i)).toBeInTheDocument();
      });

      // Fill in ticker
      const tickerInput = screen.getByLabelText(/Ticker/i);
      fireEvent.change(tickerInput, { target: { value: 'NVDA' } });

      // Navigate away to Home
      const homeNav = screen.getByRole('button', { name: /Home/i });
      fireEvent.click(homeNav);

      await waitFor(() => {
        expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
      });

      // Navigate back to Analyze
      fireEvent.click(analyzeNav);

      await waitFor(() => {
        expect(screen.getByText(/Run Stock Analysis/i)).toBeInTheDocument();
      });

      // Verify ticker value is preserved
      const tickerInputAgain = screen.getByLabelText(/Ticker/i) as HTMLInputElement;
      expect(tickerInputAgain.value).toBe('NVDA');
    });
  });
});
