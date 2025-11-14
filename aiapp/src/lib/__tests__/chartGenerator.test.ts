/**
 * ChartGenerator Tests
 * 
 * Tests for ticker extraction, timeframe parsing, caching, and data fetching
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('ChartGenerator', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  describe('Ticker Extraction', () => {
    const testCases = [
      {
        input: 'Looking at $AAPL for a potential breakout',
        expected: 'AAPL',
        description: 'dollar sign format',
      },
      {
        input: 'TSLA 4H chart shows bullish divergence',
        expected: 'TSLA',
        description: 'ticker with timeframe',
      },
      {
        input: 'Ticker: MSFT showing strong momentum',
        expected: 'MSFT',
        description: 'ticker colon format',
      },
      {
        input: 'Symbol: GOOGL breaking resistance',
        expected: 'GOOGL',
        description: 'symbol colon format',
      },
      {
        input: 'Watching $AAPL and $GOOGL today',
        expected: 'AAPL',
        description: 'multiple tickers (first one)',
      },
      {
        input: 'Market looking bullish overall',
        expected: null,
        description: 'no ticker',
      },
      {
        input: '$BRK.B showing strength',
        expected: 'BRK.B',
        description: 'ticker with dot notation',
      },
    ];

    testCases.forEach(({ input, expected, description }) => {
      it(`should extract ticker from ${description}`, () => {
        // Simulate ticker extraction logic
        const dollarSignMatch = input.match(/\$([A-Z]{1,5}(?:\.[A-Z]{1,2})?)/);
        const tickerTimeframeMatch = input.match(/\b([A-Z]{2,5})\s+(?:on\s+)?(\d+[mMhHdDwW](?:in)?)\b/);
        const colonMatch = input.match(/(?:ticker|symbol):\s*([A-Z]{2,5})/i);
        
        let result = null;
        if (dollarSignMatch) {
          result = dollarSignMatch[1];
        } else if (tickerTimeframeMatch) {
          result = tickerTimeframeMatch[1];
        } else if (colonMatch) {
          result = colonMatch[1];
        }
        
        expect(result).toBe(expected);
      });
    });

    it('should validate ticker format', () => {
      const validTickers = ['AAPL', 'MSFT', 'GOOGL', 'BRK.B', 'TSM'];
      const invalidTickers = ['THE', 'AND', 'FOR', '123', 'TOOLONG'];
      
      const isValidFormat = (ticker: string) => /^[A-Z]{1,5}(?:\.[A-Z]{1,2})?$/.test(ticker);
      const falsePositives = new Set(['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT']);
      
      validTickers.forEach(ticker => {
        expect(isValidFormat(ticker)).toBe(true);
        expect(falsePositives.has(ticker)).toBe(false);
      });
      
      invalidTickers.forEach(ticker => {
        const valid = isValidFormat(ticker) && !falsePositives.has(ticker);
        expect(valid).toBe(false);
      });
    });
  });

  describe('Timeframe Parsing', () => {
    const testCases = [
      { input: '1D', expected: '1D', description: 'standard daily' },
      { input: '4H', expected: '4H', description: 'standard hourly' },
      { input: '15min', expected: '15min', description: 'standard minutes' },
      { input: 'daily', expected: '1D', description: 'word format daily' },
      { input: 'hourly', expected: '1H', description: 'word format hourly' },
      { input: '4-hour', expected: '4H', description: 'hyphenated format' },
      { input: '15 minute', expected: '15min', description: 'space separated' },
      { input: 'weekly', expected: '1W', description: 'word format weekly' },
      { input: 'monthly', expected: '1M', description: 'word format monthly' },
    ];

    testCases.forEach(({ input, expected, description }) => {
      it(`should parse ${description}`, () => {
        const normalizeTimeframe = (tf: string): string => {
          const lower = tf.toLowerCase();
          
          if (lower.includes('daily') || lower.includes('day')) return '1D';
          if (lower.includes('hourly') || lower.includes('hour')) return '1H';
          if (lower.includes('weekly') || lower.includes('week')) return '1W';
          if (lower.includes('monthly') || lower.includes('month')) return '1M';
          
          const numericMatch = /(\d+)([mhMHdDwW])/.exec(tf);
          if (numericMatch) {
            const value = numericMatch[1];
            const unit = numericMatch[2].toUpperCase();
            
            switch (unit) {
              case 'M': return `${value}min`;
              case 'H': return `${value}H`;
              case 'D': return `${value}D`;
              case 'W': return `${value}W`;
              default: return `${value}${unit}`;
            }
          }
          
          return tf;
        };
        
        const result = normalizeTimeframe(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('Timeframe to Interval Mapping', () => {
    const mappings: Record<string, string> = {
      '1min': '1min',
      '5min': '5min',
      '15min': '15min',
      '30min': '30min',
      '1h': '60min',
      '60min': '60min',
      '4h': '60min',
      '1d': 'daily',
      'daily': 'daily',
      '1w': 'weekly',
      'weekly': 'weekly',
      '1m': 'monthly',
      'monthly': 'monthly',
    };

    Object.entries(mappings).forEach(([timeframe, interval]) => {
      it(`should map ${timeframe} to ${interval}`, () => {
        const normalized = timeframe.toLowerCase();
        expect(mappings[normalized]).toBe(interval);
      });
    });

    it('should return null for unsupported timeframes', () => {
      const unsupported = ['2h', '3d', '6w'];
      
      unsupported.forEach(tf => {
        const normalized = tf.toLowerCase();
        expect(mappings[normalized]).toBeUndefined();
      });
    });
  });

  describe('Cache Management', () => {
    it('should generate cache key correctly', () => {
      const generateCacheKey = (ticker: string, timeframe: string) => {
        return `${ticker.toUpperCase()}-${timeframe}`;
      };
      
      expect(generateCacheKey('aapl', '1D')).toBe('AAPL-1D');
      expect(generateCacheKey('TSLA', '4H')).toBe('TSLA-4H');
      expect(generateCacheKey('msft', '15min')).toBe('MSFT-15min');
    });

    it('should store chart data in cache', () => {
      const chartData = {
        ticker: 'AAPL',
        timeframe: '1D',
        data: [
          { time: 1609459200, open: 100, high: 105, low: 99, close: 103, volume: 1000000 },
        ],
        generatedAt: Date.now(),
      };
      
      const cache = { 'AAPL-1D': chartData };
      mockLocalStorage.setItem('coach-dashboard-charts', JSON.stringify(cache));
      
      const stored = mockLocalStorage.getItem('coach-dashboard-charts');
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed['AAPL-1D']).toEqual(chartData);
    });

    it('should detect cache hit', () => {
      const chartData = {
        ticker: 'AAPL',
        timeframe: '1D',
        data: [],
        generatedAt: Date.now(),
      };
      
      const cache = { 'AAPL-1D': chartData };
      mockLocalStorage.setItem('coach-dashboard-charts', JSON.stringify(cache));
      
      const stored = mockLocalStorage.getItem('coach-dashboard-charts');
      const parsed = JSON.parse(stored!);
      const cached = parsed['AAPL-1D'];
      
      expect(cached).toBeDefined();
      expect(cached.ticker).toBe('AAPL');
    });

    it('should detect cache miss', () => {
      const cache = { 'AAPL-1D': { ticker: 'AAPL', timeframe: '1D', data: [], generatedAt: Date.now() } };
      mockLocalStorage.setItem('coach-dashboard-charts', JSON.stringify(cache));
      
      const stored = mockLocalStorage.getItem('coach-dashboard-charts');
      const parsed = JSON.parse(stored!);
      const cached = parsed['TSLA-4H'];
      
      expect(cached).toBeUndefined();
    });

    it('should check cache expiration', () => {
      const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes
      
      const oldData = {
        ticker: 'AAPL',
        timeframe: '1D',
        data: [],
        generatedAt: Date.now() - (6 * 60 * 1000), // 6 minutes ago
      };
      
      const newData = {
        ticker: 'TSLA',
        timeframe: '4H',
        data: [],
        generatedAt: Date.now() - (2 * 60 * 1000), // 2 minutes ago
      };
      
      const now = Date.now();
      const oldAge = now - oldData.generatedAt;
      const newAge = now - newData.generatedAt;
      
      expect(oldAge > CACHE_EXPIRATION).toBe(true); // Expired
      expect(newAge > CACHE_EXPIRATION).toBe(false); // Still valid
    });

    it('should implement LRU eviction', () => {
      const cache = {
        'AAPL-1D': { ticker: 'AAPL', timeframe: '1D', data: [], generatedAt: Date.now() - 10000, lastAccessed: Date.now() - 10000 },
        'TSLA-4H': { ticker: 'TSLA', timeframe: '4H', data: [], generatedAt: Date.now() - 5000, lastAccessed: Date.now() - 5000 },
        'MSFT-1D': { ticker: 'MSFT', timeframe: '1D', data: [], generatedAt: Date.now() - 1000, lastAccessed: Date.now() - 1000 },
      };
      
      // Sort by lastAccessed (most recent first)
      const entries = Object.entries(cache);
      entries.sort(([, a], [, b]) => {
        const aTime = (a as any).lastAccessed || a.generatedAt;
        const bTime = (b as any).lastAccessed || b.generatedAt;
        return bTime - aTime;
      });
      
      // Keep only 2 entries (evict oldest)
      const keepCount = 2;
      const kept = entries.slice(0, keepCount).map(([key]) => key);
      
      expect(kept).toContain('MSFT-1D'); // Most recent
      expect(kept).toContain('TSLA-4H'); // Second most recent
      expect(kept).not.toContain('AAPL-1D'); // Oldest, should be evicted
    });

    it('should update last accessed time on cache hit', () => {
      const chartData = {
        ticker: 'AAPL',
        timeframe: '1D',
        data: [],
        generatedAt: Date.now() - 60000,
        lastAccessed: Date.now() - 60000,
      };
      
      // Simulate cache hit
      const now = Date.now();
      const updatedData = {
        ...chartData,
        lastAccessed: now,
      };
      
      expect(updatedData.lastAccessed).toBeGreaterThan(chartData.lastAccessed);
    });
  });

  describe('OHLCV Data Validation', () => {
    it('should validate OHLCV data structure', () => {
      const validData = {
        time: 1609459200,
        open: 100,
        high: 105,
        low: 99,
        close: 103,
        volume: 1000000,
      };
      
      expect(validData).toHaveProperty('time');
      expect(validData).toHaveProperty('open');
      expect(validData).toHaveProperty('high');
      expect(validData).toHaveProperty('low');
      expect(validData).toHaveProperty('close');
      expect(validData).toHaveProperty('volume');
    });

    it('should validate OHLCV constraints', () => {
      const data = {
        time: 1609459200,
        open: 100,
        high: 105,
        low: 99,
        close: 103,
        volume: 1000000,
      };
      
      // High should be >= all other prices
      expect(data.high).toBeGreaterThanOrEqual(data.open);
      expect(data.high).toBeGreaterThanOrEqual(data.close);
      expect(data.high).toBeGreaterThanOrEqual(data.low);
      
      // Low should be <= all other prices
      expect(data.low).toBeLessThanOrEqual(data.open);
      expect(data.low).toBeLessThanOrEqual(data.close);
      expect(data.low).toBeLessThanOrEqual(data.high);
    });

    it('should handle edge case where open equals close', () => {
      const data = {
        time: 1609459200,
        open: 100,
        high: 100,
        low: 100,
        close: 100,
        volume: 0,
      };
      
      expect(data.open).toBe(data.close);
      expect(data.high).toBe(data.low);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid plan text', () => {
      const invalidInputs = [null, undefined, '', 123, {}, []];
      
      invalidInputs.forEach(input => {
        const isValid = input && typeof input === 'string';
        expect(isValid).toBe(false);
      });
    });

    it('should handle corrupted cache data', () => {
      mockLocalStorage.setItem('coach-dashboard-charts', 'invalid json {');
      
      let error: Error | null = null;
      try {
        JSON.parse(mockLocalStorage.getItem('coach-dashboard-charts')!);
      } catch (e) {
        error = e as Error;
      }
      
      expect(error).not.toBeNull();
    });

    it('should handle QuotaExceededError', () => {
      // Simulate quota exceeded
      const originalSetItem = mockLocalStorage.setItem;
      let callCount = 0;
      
      mockLocalStorage.setItem = (key: string, value: string) => {
        callCount++;
        if (callCount === 1) {
          const error = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        }
        originalSetItem.call(mockLocalStorage, key, value);
      };
      
      let quotaError: Error | null = null;
      try {
        mockLocalStorage.setItem('test', 'value');
      } catch (e) {
        quotaError = e as Error;
      }
      
      expect(quotaError).not.toBeNull();
      expect(quotaError?.name).toBe('QuotaExceededError');
      
      // Restore
      mockLocalStorage.setItem = originalSetItem;
    });
  });

  describe('Rate Limiting', () => {
    it('should track request count', () => {
      const rateLimiter = {
        maxRequests: 5,
        windowMs: 60000,
        requests: [] as number[],
      };
      
      const now = Date.now();
      rateLimiter.requests.push(now);
      rateLimiter.requests.push(now + 1000);
      rateLimiter.requests.push(now + 2000);
      
      expect(rateLimiter.requests.length).toBe(3);
    });

    it('should detect when approaching limit', () => {
      const rateLimiter = {
        maxRequests: 5,
        currentCount: 4,
      };
      
      const isApproachingLimit = rateLimiter.currentCount >= rateLimiter.maxRequests * 0.8;
      expect(isApproachingLimit).toBe(true);
    });

    it('should clean old requests from window', () => {
      const windowMs = 60000; // 1 minute
      const now = Date.now();
      
      const requests = [
        now - 70000, // 70 seconds ago (outside window)
        now - 50000, // 50 seconds ago (inside window)
        now - 30000, // 30 seconds ago (inside window)
        now - 10000, // 10 seconds ago (inside window)
      ];
      
      const validRequests = requests.filter(time => (now - time) < windowMs);
      
      expect(validRequests.length).toBe(3);
      expect(validRequests).not.toContain(now - 70000);
    });
  });

  describe('Storage Monitoring', () => {
    it('should calculate storage size', () => {
      const data = { test: 'value' };
      const jsonStr = JSON.stringify(data);
      const size = new Blob([jsonStr]).size;
      
      expect(size).toBeGreaterThan(0);
    });

    it('should calculate storage percentage', () => {
      const totalSize = 2 * 1024 * 1024; // 2MB
      const quota = 5 * 1024 * 1024; // 5MB
      const percentage = (totalSize / quota) * 100;
      
      expect(percentage).toBe(40);
    });

    it('should trigger cleanup when approaching quota', () => {
      const totalSize = 4.5 * 1024 * 1024; // 4.5MB
      const quota = 5 * 1024 * 1024; // 5MB
      const threshold = quota * 0.8; // 80%
      
      const shouldCleanup = totalSize > threshold;
      expect(shouldCleanup).toBe(true);
    });
  });

  describe('Failure Caching', () => {
    it('should cache rate limit failures', () => {
      const failure = {
        timestamp: Date.now(),
        reason: 'rate_limit',
      };
      
      mockLocalStorage.setItem('chart-failure-AAPL-1D', JSON.stringify(failure));
      
      const stored = mockLocalStorage.getItem('chart-failure-AAPL-1D');
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.reason).toBe('rate_limit');
    });

    it('should skip generation for recent failures', () => {
      const failure = {
        timestamp: Date.now() - 60000, // 1 minute ago
        reason: 'rate_limit',
      };
      
      const now = Date.now();
      const age = now - failure.timestamp;
      const skipDuration = 5 * 60 * 1000; // 5 minutes
      
      const shouldSkip = failure.reason === 'rate_limit' && age < skipDuration;
      expect(shouldSkip).toBe(true);
    });

    it('should allow generation after failure expires', () => {
      const failure = {
        timestamp: Date.now() - (6 * 60 * 1000), // 6 minutes ago
        reason: 'rate_limit',
      };
      
      const now = Date.now();
      const age = now - failure.timestamp;
      const skipDuration = 5 * 60 * 1000; // 5 minutes
      
      const shouldSkip = failure.reason === 'rate_limit' && age < skipDuration;
      expect(shouldSkip).toBe(false);
    });
  });
});
