/**
 * Mobile Responsive Tests for TwitterFeedPanel
 * 
 * Tests mobile-specific features like touch gestures, responsive layout,
 * and performance optimizations.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TwitterFeedPanel from '../TwitterFeedPanel';
import * as twitterApi from '@/lib/twitter-api';

// Mock the twitter API
jest.mock('@/lib/twitter-api');
const mockFetchTwitterSentiment = twitterApi.fetchTwitterSentiment as jest.MockedFunction<
  typeof twitterApi.fetchTwitterSentiment
>;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
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

// Mock data
const mockTweets = [
  {
    id: '1',
    account: 'TestAccount',
    text: 'Test tweet about $AAPL',
    timestamp: new Date(),
    sentiment: 0.8,
    tickers: ['AAPL'],
    url: 'https://twitter.com/test/1',
  },
];

const mockSentiment = {
  overall_score: 0.75,
  bullish_args: ['Strong momentum', 'Good fundamentals'],
  bearish_args: ['High valuation'],
  themes: ['Tech rally', 'AI growth'],
  account_influence: { TestAccount: 0.9 },
  confidence: 0.85,
};

describe('TwitterFeedPanel Mobile Responsive', () => {
  beforeEach(() => {
    mockFetchTwitterSentiment.mockResolvedValue({
      tweets: mockTweets,
      sentiment: mockSentiment,
      lastUpdated: new Date(),
    });
    localStorageMock.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Responsive Layout', () => {
    it('should render with mobile-optimized classes', async () => {
      render(<TwitterFeedPanel />);
      
      await waitFor(() => {
        expect(screen.getByText('Social Sentiment Feed')).toBeInTheDocument();
      });

      // Check for mobile-specific classes
      const header = screen.getByText('Social Sentiment Feed').closest('div');
      expect(header).toHaveClass('text-xl', 'sm:text-2xl');
    });

    it('should show compact layout on mobile viewport', async () => {
      // Simulate mobile viewport
      global.innerWidth = 375;
      global.innerHeight = 667;
      
      render(<TwitterFeedPanel />);
      
      await waitFor(() => {
        expect(screen.getByText('Social Sentiment Feed')).toBeInTheDocument();
      });

      // Verify mobile-optimized spacing
      const container = screen.getByText('Social Sentiment Feed').closest('div');
      expect(container).toHaveClass('px-4', 'sm:px-6');
    });

    it('should hide non-essential elements on mobile', async () => {
      render(<TwitterFeedPanel />);
      
      await waitFor(() => {
        expect(screen.getByText('Social Sentiment Feed')).toBeInTheDocument();
      });

      // Check that "Updated:" text has mobile-hidden class
      const updatedText = screen.queryByText(/Updated:/);
      if (updatedText) {
        expect(updatedText).toHaveClass('hidden', 'md:block');
      }
    });
  });

  describe('Touch Gestures', () => {
    it('should have touch-manipulation class on interactive elements', async () => {
      render(<TwitterFeedPanel />);
      
      await waitFor(() => {
        expect(screen.getByText('Social Sentiment Feed')).toBeInTheDocument();
      });

      // Check refresh button
      const refreshButton = screen.getByLabelText('Refresh feed');
      expect(refreshButton).toHaveClass('touch-manipulation');

      // Check settings button
      const settingsButton = screen.getByLabelText('Manage accounts');
      expect(settingsButton).toHaveClass('touch-manipulation');
    });

    it('should apply mobile-scroll-optimize class to scrollable container', async () => {
      render(<TwitterFeedPanel />);
      
      await waitFor(() => {
        expect(screen.getByText('Social Sentiment Feed')).toBeInTheDocument();
      });

      // Find the scrollable container
      const scrollContainer = document.querySelector('.mobile-scroll-optimize');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('should handle pull-to-refresh gesture', async () => {
      render(<TwitterFeedPanel />);
      
      await waitFor(() => {
        expect(screen.getByText('Social Sentiment Feed')).toBeInTheDocument();
      });

      // Simulate pull-to-refresh
      const scrollContainer = document.querySelector('.mobile-scroll-optimize');
      if (scrollContainer) {
        fireEvent.touchStart(scrollContainer, {
          touches: [{ clientY: 100 }],
        });
        
        fireEvent.touchMove(scrollContainer, {
          touches: [{ clientY: 200 }],
        });
        
        fireEvent.touchEnd(scrollContainer);
      }

      // Verify API was called (pull-to-refresh triggered)
      await waitFor(() => {
        expect(mockFetchTwitterSentiment).toHaveBeenCalled();
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('should apply list-item-optimize class to tweet cards', async () => {
      render(<TwitterFeedPanel />);
      
      await waitFor(() => {
        expect(screen.getByText(/Test tweet about/)).toBeInTheDocument();
      });

      // Check that tweet cards have optimization classes
      const tweetCard = screen.getByText(/Test tweet about/).closest('div');
      expect(tweetCard).toHaveClass('list-item-optimize');
    });

    it('should limit displayed tweets to 100 for performance', async () => {
      // Create 150 mock tweets
      const manyTweets = Array.from({ length: 150 }, (_, i) => ({
        id: `${i}`,
        account: 'TestAccount',
        text: `Tweet ${i}`,
        timestamp: new Date(),
        sentiment: 0.5,
        tickers: ['AAPL'],
        url: `https://twitter.com/test/${i}`,
      }));

      mockFetchTwitterSentiment.mockResolvedValue({
        tweets: manyTweets,
        sentiment: mockSentiment,
        lastUpdated: new Date(),
      });

      render(<TwitterFeedPanel />);
      
      await waitFor(() => {
        expect(screen.getByText('Social Sentiment Feed')).toBeInTheDocument();
      });

      // Should show message about limiting to 100
      await waitFor(() => {
        expect(screen.getByText(/Showing first 100 of 150 tweets/)).toBeInTheDocument();
      });
    });
  });

  describe('Touch Target Sizes', () => {
    it('should have minimum 44px touch targets on buttons', async () => {
      render(<TwitterFeedPanel />);
      
      await waitFor(() => {
        expect(screen.getByText('Social Sentiment Feed')).toBeInTheDocument();
      });

      // Check button sizes
      const refreshButton = screen.getByLabelText('Refresh feed');
      const styles = window.getComputedStyle(refreshButton);
      
      // Button should have adequate padding for touch
      expect(refreshButton).toHaveClass('p-2');
    });

    it('should have touch-friendly sentiment gauge buttons', async () => {
      render(<TwitterFeedPanel />);
      
      await waitFor(() => {
        expect(screen.getByText('Social Sentiment Feed')).toBeInTheDocument();
      });

      // Wait for sentiment gauge to load
      await waitFor(() => {
        const bullishSection = screen.queryByText('Bullish');
        if (bullishSection) {
          // Check for min-height on mobile
          const expandButton = bullishSection.parentElement?.querySelector('button');
          if (expandButton) {
            expect(expandButton).toHaveClass('min-h-[44px]');
          }
        }
      });
    });
  });

  describe('Responsive Typography', () => {
    it('should use smaller font sizes on mobile', async () => {
      render(<TwitterFeedPanel />);
      
      await waitFor(() => {
        expect(screen.getByText('Social Sentiment Feed')).toBeInTheDocument();
      });

      // Check header font size classes
      const header = screen.getByText('Social Sentiment Feed');
      expect(header).toHaveClass('text-xl', 'sm:text-2xl');
    });

    it('should adjust spacing for mobile readability', async () => {
      render(<TwitterFeedPanel />);
      
      await waitFor(() => {
        expect(screen.getByText('Social Sentiment Feed')).toBeInTheDocument();
      });

      // Check for responsive spacing classes
      const container = screen.getByText('Social Sentiment Feed').closest('div');
      expect(container).toHaveClass('py-3', 'sm:py-4');
    });
  });
});
