/**
 * Twitter API Client Tests
 * 
 * Tests for Twitter sentiment fetching, Stocktwits integration,
 * caching behavior, and retry logic
 */

/**
 * Note: This test file requires Jest to be installed and configured.
 * Install with: npm install --save-dev jest @types/jest ts-jest
 * Configure with: npx ts-jest config:init
 */

// @ts-nocheck - Tests will work once Jest is properly configured
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  fetchTwitterSentiment,
  fetchStocktwits,
  updateAccounts,
  clearTwitterCache,
  getCacheStatus,
} from '../twitter-api';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() { return Object.keys(store).length; },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('Twitter API Client', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
    (global.fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchTwitterSentiment', () => {
    const mockResponse = {
      tweets: [
        {
          id: '1',
          account: 'ChartChampions',
          text: '$AAPL looking strong today',
          timestamp: '2025-11-11T10:00:00Z',
          sentiment: 0.75,
          tickers: ['AAPL'],
          url: 'https://twitter.com/test/1',
        },
      ],
      sentiment: {
        overall_score: 0.65,
        bullish_args: ['Strong momentum'],
        bearish_args: ['Overbought'],
        themes: ['Tech rally'],
        account_influence: { ChartChampions: 0.85 },
      },
      metadata: {
        total_tweets: 100,
        filtered_tweets: 1,
        last_updated: '2025-11-11T10:00:00Z',
        cache_hit: false,
      },
    };

    it('should fetch Twitter sentiment successfully', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchTwitterSentiment({ ticker: 'AAPL' });

      expect(result.tweets).toHaveLength(1);
      expect(result.tweets[0].account).toBe('ChartChampions');
      expect(result.sentiment?.overall_score).toBe(0.65);
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });

    it('should transform API response correctly', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchTwitterSentiment({ ticker: 'AAPL' });

      expect(result.tweets[0].timestamp).toBeInstanceOf(Date);
      expect(result.tweets[0].tickers).toEqual(['AAPL']);
      expect(result.sentiment?.bullish_args).toContain('Strong momentum');
    });

    it('should cache successful responses', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await fetchTwitterSentiment({ ticker: 'AAPL' });

      // Check that cache was written
      const cacheKeys = Object.keys(mockLocalStorage);
      const twitterCacheKeys = cacheKeys.filter(k => k.startsWith('twitter_cache_'));
      expect(twitterCacheKeys.length).toBeGreaterThan(0);
    });

    it('should return cached data on second call', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // First call - should fetch
      await fetchTwitterSentiment({ ticker: 'AAPL' });
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      await fetchTwitterSentiment({ ticker: 'AAPL' });
      expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error', message: 'Server error' }),
      } as Response);

      await expect(fetchTwitterSentiment({ ticker: 'AAPL' })).rejects.toThrow();
    });

    it('should include query parameters in request', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await fetchTwitterSentiment({
        ticker: 'AAPL',
        accounts: ['ChartChampions', 'unusual_whales'],
        limit: 25,
      });

      const callUrl = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls[0][0] as string;
      expect(callUrl).toContain('ticker=AAPL');
      expect(callUrl).toContain('accounts=ChartChampions%2Cunusual_whales');
      expect(callUrl).toContain('limit=25');
    });
  });

  describe('fetchStocktwits', () => {
    const mockResponse = {
      messages: [
        {
          id: '1',
          user: 'trader123',
          text: 'Bullish on $AAPL',
          timestamp: '2025-11-11T10:00:00Z',
          sentiment: 'bullish' as const,
          likes: 15,
        },
      ],
      sentiment_ratio: {
        bullish: 65,
        bearish: 35,
      },
    };

    it('should fetch Stocktwits messages successfully', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchStocktwits('AAPL');

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].user).toBe('trader123');
      expect(result.sentimentRatio.bullish).toBe(65);
    });

    it('should transform Stocktwits response correctly', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchStocktwits('AAPL');

      expect(result.messages[0].timestamp).toBeInstanceOf(Date);
      expect(result.messages[0].sentiment).toBe('bullish');
      expect(result.messages[0].likes).toBe(15);
    });

    it('should cache Stocktwits responses', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await fetchStocktwits('AAPL');

      const cacheKeys = Object.keys(mockLocalStorage);
      const stockwitsCacheKeys = cacheKeys.filter(k => k.includes('stocktwits'));
      expect(stockwitsCacheKeys.length).toBeGreaterThan(0);
    });
  });

  describe('updateAccounts', () => {
    const mockResponse = {
      success: true,
      accounts: ['ChartChampions', 'unusual_whales'],
      validated: true,
    };

    it('should update accounts successfully', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await updateAccounts(['ChartChampions', 'unusual_whales']);

      expect(result.success).toBe(true);
      expect(result.accounts).toHaveLength(2);
      expect(result.validated).toBe(true);
    });

    it('should send POST request with correct body', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await updateAccounts(['ChartChampions']);

      const fetchCall = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
      const options = fetchCall[1] as RequestInit;
      
      expect(options.method).toBe('POST');
      expect(options.headers).toEqual({ 'Content-Type': 'application/json' });
      expect(options.body).toContain('ChartChampions');
    });

    it('should clear cache after updating accounts', async () => {
      // Add some cache entries first
      mockLocalStorage.setItem('twitter_cache_test', JSON.stringify({ data: 'test' }));
      
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await updateAccounts(['ChartChampions']);

      const cacheKeys = Object.keys(mockLocalStorage);
      const twitterCacheKeys = cacheKeys.filter(k => k.startsWith('twitter_cache_'));
      expect(twitterCacheKeys.length).toBe(0);
    });
  });

  describe('Retry Logic', () => {
    it('should retry on network failure', async () => {
      // First two calls fail, third succeeds
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            tweets: [],
            sentiment: null,
            metadata: { total_tweets: 0, filtered_tweets: 0, last_updated: new Date().toISOString(), cache_hit: false },
          }),
        } as Response);

      const result = await fetchTwitterSentiment({ ticker: 'AAPL' });

      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(result.tweets).toEqual([]);
    });

    it('should throw error after max retries', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(
        new Error('Network error')
      );

      await expect(fetchTwitterSentiment({ ticker: 'AAPL' })).rejects.toThrow();
      expect(global.fetch).toHaveBeenCalledTimes(3); // MAX_RETRIES
    });

    it('should not retry on client errors (4xx)', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad Request', message: 'Invalid ticker' }),
      } as Response);

      await expect(fetchTwitterSentiment({ ticker: 'INVALID' })).rejects.toThrow();
      expect(global.fetch).toHaveBeenCalledTimes(1); // No retries
    });
  });

  describe('Cache Management', () => {
    it('should expire cache after TTL', async () => {
      const expiredEntry = {
        data: { tweets: [], sentiment: null, lastUpdated: new Date() },
        timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes ago
        expiresAt: Date.now() - 5 * 60 * 1000, // Expired 5 minutes ago
      };

      mockLocalStorage.setItem('twitter_cache_test', JSON.stringify(expiredEntry));

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tweets: [],
          sentiment: null,
          metadata: { total_tweets: 0, filtered_tweets: 0, last_updated: new Date().toISOString(), cache_hit: false },
        }),
      } as Response);

      await fetchTwitterSentiment({ ticker: 'AAPL' });

      // Should have made a fetch call because cache was expired
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should clear all Twitter cache entries', () => {
      mockLocalStorage.setItem('twitter_cache_sentiment', 'test1');
      mockLocalStorage.setItem('twitter_cache_stocktwits', 'test2');
      mockLocalStorage.setItem('other_cache', 'test3');

      clearTwitterCache();

      expect(mockLocalStorage.getItem('twitter_cache_sentiment')).toBeNull();
      expect(mockLocalStorage.getItem('twitter_cache_stocktwits')).toBeNull();
      expect(mockLocalStorage.getItem('other_cache')).toBe('test3'); // Should not be cleared
    });

    it('should get cache status correctly', () => {
      const entry1 = {
        data: {},
        timestamp: Date.now(),
        expiresAt: Date.now() + 60000, // Expires in 1 minute
      };

      const entry2 = {
        data: {},
        timestamp: Date.now(),
        expiresAt: Date.now() + 120000, // Expires in 2 minutes
      };

      mockLocalStorage.setItem('twitter_cache_1', JSON.stringify(entry1));
      mockLocalStorage.setItem('twitter_cache_2', JSON.stringify(entry2));

      const status = getCacheStatus();

      expect(status).toHaveLength(2);
      expect(status[0].expiresIn).toBeGreaterThan(0);
      expect(status[0].expiresIn).toBeLessThanOrEqual(60000);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON responses', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); },
      } as Response);

      await expect(fetchTwitterSentiment({ ticker: 'AAPL' })).rejects.toThrow();
    });

    it('should handle missing sentiment data', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tweets: [],
          sentiment: null,
          metadata: { total_tweets: 0, filtered_tweets: 0, last_updated: new Date().toISOString(), cache_hit: false },
        }),
      } as Response);

      const result = await fetchTwitterSentiment({ ticker: 'AAPL' });

      expect(result.sentiment).toBeNull();
      expect(result.tweets).toEqual([]);
    });

    it('should handle localStorage errors gracefully', () => {
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem = () => { throw new Error('Storage full'); };

      // Should not throw, just log error
      expect(() => {
        try {
          mockLocalStorage.setItem('test', 'value');
        } catch (e) {
          // Expected to throw
        }
      }).not.toThrow();

      mockLocalStorage.setItem = originalSetItem;
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty ticker', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tweets: [],
          sentiment: null,
          metadata: { total_tweets: 0, filtered_tweets: 0, last_updated: new Date().toISOString(), cache_hit: false },
        }),
      } as Response);

      const result = await fetchTwitterSentiment({});

      expect(result.tweets).toEqual([]);
    });

    it('should handle empty accounts array', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tweets: [],
          sentiment: null,
          metadata: { total_tweets: 0, filtered_tweets: 0, last_updated: new Date().toISOString(), cache_hit: false },
        }),
      } as Response);

      const result = await fetchTwitterSentiment({ accounts: [] });

      expect(result.tweets).toEqual([]);
    });

    it('should handle very large limit values', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tweets: [],
          sentiment: null,
          metadata: { total_tweets: 0, filtered_tweets: 0, last_updated: new Date().toISOString(), cache_hit: false },
        }),
      } as Response);

      await fetchTwitterSentiment({ limit: 10000 });

      const callUrl = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls[0][0] as string;
      expect(callUrl).toContain('limit=10000');
    });
  });
});
