/**
 * Performance Tests for TwitterFeedPanel
 * 
 * Tests virtual scrolling, lazy loading, and memoization optimizations
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TwitterFeedPanel from '../TwitterFeedPanel';
import { Tweet, SentimentData } from '@/types/twitter';
import * as twitterApi from '@/lib/twitter-api';

// Mock the twitter API
jest.mock('@/lib/twitter-api');

// Generate large dataset for performance testing
function generateMockTweets(count: number): Tweet[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `tweet-${i}`,
    account: `TestAccount${i % 10}`,
    accountAvatar: `https://example.com/avatar${i % 10}.jpg`,
    text: `This is test tweet #${i} about $AAPL and $MSFT with some content`,
    timestamp: new Date(Date.now() - i * 60000),
    sentiment: (Math.random() * 2) - 1,
    tickers: ['AAPL', 'MSFT'],
    url: `https://twitter.com/test/status/${i}`,
    engagement: {
      likes: Math.floor(Math.random() * 1000),
      retweets: Math.floor(Math.random() * 500),
    },
  }));
}

const mockSentiment: SentimentData = {
  overall_score: 0.65,
  bullish_args: ['Strong momentum', 'Positive earnings'],
  bearish_args: ['High valuation', 'Market uncertainty'],
  themes: ['Tech rally', 'AI growth'],
  account_influence: {
    TestAccount0: 0.85,
    TestAccount1: 0.72,
  },
  confidence: 0.8,
};

describe('TwitterFeedPanel Performance Tests', () => {
  beforeEach(() => {
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => null);
    Storage.prototype.setItem = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should handle 1000+ tweets efficiently with virtual scrolling', async () => {
    const largeTweetSet = generateMockTweets(1000);
    
    (twitterApi.fetchTwitterSentiment as jest.Mock).mockResolvedValue({
      tweets: largeTweetSet,
      sentiment: mockSentiment,
      lastUpdated: new Date(),
    });

    const startTime = performance.now();
    
    const { container } = render(<TwitterFeedPanel ticker="AAPL" />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    const renderTime = performance.now() - startTime;
    
    // Should render in under 2 seconds even with 1000 tweets
    expect(renderTime).toBeLessThan(2000);
    
    // Should only render visible tweets (not all 1000)
    const tweetCards = container.querySelectorAll('[class*="bg-white rounded-lg"]');
    // Virtual scrolling should render only ~10-15 visible items
    expect(tweetCards.length).toBeLessThan(50);
    
    // Should show correct count
    expect(screen.getByText(/1000 tweets/i)).toBeInTheDocument();
  });

  test('should limit displayed tweets to 100 for performance', async () => {
    const largeTweetSet = generateMockTweets(500);
    
    (twitterApi.fetchTwitterSentiment as jest.Mock).mockResolvedValue({
      tweets: largeTweetSet,
      sentiment: mockSentiment,
      lastUpdated: new Date(),
    });

    render(<TwitterFeedPanel ticker="AAPL" maxTweets={100} />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    // API should be called with limit of 100
    expect(twitterApi.fetchTwitterSentiment).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 100,
      })
    );
  });

  test('should memoize filtered tweets to prevent unnecessary recalculations', async () => {
    const tweets = generateMockTweets(100);
    
    (twitterApi.fetchTwitterSentiment as jest.Mock).mockResolvedValue({
      tweets,
      sentiment: mockSentiment,
      lastUpdated: new Date(),
    });

    const { rerender } = render(<TwitterFeedPanel ticker="AAPL" />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    const startTime = performance.now();
    
    // Re-render with same props (should use memoized values)
    rerender(<TwitterFeedPanel ticker="AAPL" />);
    
    const rerenderTime = performance.now() - startTime;
    
    // Re-render should be very fast (< 100ms) due to memoization
    expect(rerenderTime).toBeLessThan(100);
  });

  test('should lazy load images only when visible', async () => {
    const tweets = generateMockTweets(50);
    
    (twitterApi.fetchTwitterSentiment as jest.Mock).mockResolvedValue({
      tweets,
      sentiment: mockSentiment,
      lastUpdated: new Date(),
    });

    const { container } = render(<TwitterFeedPanel ticker="AAPL" />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    // Check that images have loading="lazy" attribute
    const images = container.querySelectorAll('img[loading="lazy"]');
    expect(images.length).toBeGreaterThan(0);
  });

  test('should maintain performance with frequent filter changes', async () => {
    const tweets = generateMockTweets(200);
    
    (twitterApi.fetchTwitterSentiment as jest.Mock).mockResolvedValue({
      tweets,
      sentiment: mockSentiment,
      lastUpdated: new Date(),
    });

    const { rerender } = render(<TwitterFeedPanel />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    const startTime = performance.now();
    
    // Simulate multiple filter changes
    for (let i = 0; i < 10; i++) {
      rerender(<TwitterFeedPanel ticker={i % 2 === 0 ? 'AAPL' : 'MSFT'} />);
    }
    
    const totalTime = performance.now() - startTime;
    
    // All filter changes should complete in under 500ms
    expect(totalTime).toBeLessThan(500);
  });

  test('should handle memory efficiently with large datasets', async () => {
    const tweets = generateMockTweets(1000);
    
    (twitterApi.fetchTwitterSentiment as jest.Mock).mockResolvedValue({
      tweets,
      sentiment: mockSentiment,
      lastUpdated: new Date(),
    });

    // Check initial memory (if available)
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

    const { unmount } = render(<TwitterFeedPanel ticker="AAPL" />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    // Unmount to clean up
    unmount();

    // Memory should not increase dramatically
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable (< 50MB)
    if (initialMemory > 0) {
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    }
  });

  test('should optimize re-renders with React.memo on TweetCard', async () => {
    const tweets = generateMockTweets(20);
    
    (twitterApi.fetchTwitterSentiment as jest.Mock).mockResolvedValue({
      tweets,
      sentiment: mockSentiment,
      lastUpdated: new Date(),
    });

    const { rerender } = render(<TwitterFeedPanel ticker="AAPL" />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });

    // Force a re-render with same data
    const startTime = performance.now();
    rerender(<TwitterFeedPanel ticker="AAPL" />);
    const rerenderTime = performance.now() - startTime;
    
    // Should be very fast due to memoization
    expect(rerenderTime).toBeLessThan(50);
  });
});
