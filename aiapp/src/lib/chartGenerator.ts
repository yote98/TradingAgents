/**
 * Chart Generator
 * 
 * Handles extraction of ticker information from plan text,
 * fetching market data, caching, and chart generation.
 */

import {
  ChartData,
  ChartCache,
  TickerInfo,
  OHLCVData,
  TIMEFRAME_TO_INTERVAL,
  CHART_CACHE_EXPIRATION,
  MAX_CACHE_SIZE,
} from '@/types/charts';
import { RateLimiter, alphaVantageRateLimiter } from './rateLimiter';

/**
 * ChartGenerator class
 * 
 * Provides methods for:
 * - Extracting ticker and timeframe from plan text
 * - Fetching market data via Alpha Vantage MCP
 * - Caching chart data in localStorage
 * - Managing cache expiration and cleanup
 * - Rate limiting API calls
 */
export class ChartGenerator {
  private static readonly CACHE_KEY = 'coach-dashboard-charts';
  private rateLimiter: RateLimiter;
  
  private static readonly TICKER_PATTERNS = [
    // Pattern: $TICKER or $TICKER.XX
    { pattern: /\$([A-Z]{1,5}(?:\.[A-Z]{1,2})?)/g, global: true },
    // Pattern: TICKER followed by timeframe (e.g., "AAPL 1D", "TSLA 4H")
    { pattern: /\b([A-Z]{2,5})\s+(?:on\s+)?(\d+[mMhHdDwW](?:in)?)\b/g, global: true },
    // Pattern: "ticker: AAPL" or "symbol: TSLA"
    { pattern: /(?:ticker|symbol):\s*([A-Z]{2,5})/gi, global: true },
    // Pattern: standalone ticker at start of sentence
    { pattern: /^([A-Z]{2,5})\s/m, global: false },
  ];

  private static readonly TIMEFRAME_PATTERNS = [
    // Pattern: 1D, 4H, 15min, 30m, etc.
    /\b(\d+)([mM](?:in)?|[hH]|[dD]|[wW]|[M](?:o)?)\b/g,
    // Pattern: "daily", "hourly", "weekly"
    /\b(daily|hourly|weekly|monthly)\b/gi,
    // Pattern: "1-day", "4-hour"
    /\b(\d+)-?(day|hour|minute|week|month)s?\b/gi,
  ];

  private static readonly VALID_TICKERS = new Set([
    // Major US stocks
    'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA',
    'BRK.A', 'BRK.B', 'UNH', 'JNJ', 'JPM', 'V', 'PG', 'XOM', 'HD',
    'CVX', 'MA', 'ABBV', 'PFE', 'AVGO', 'COST', 'MRK', 'KO', 'PEP',
    'TMO', 'CSCO', 'ACN', 'LLY', 'DHR', 'NKE', 'ABT', 'MCD', 'WMT',
    'DIS', 'ADBE', 'CRM', 'VZ', 'CMCSA', 'NFLX', 'INTC', 'AMD',
    // Add more as needed
  ]);

  constructor(rateLimiter?: RateLimiter) {
    this.rateLimiter = rateLimiter || alphaVantageRateLimiter;
  }

  /**
   * Get rate limiter status
   * 
   * @returns Rate limit status object
   */
  getRateLimitStatus() {
    return this.rateLimiter.getStatus();
  }

  /**
   * Extract ticker and timeframe information from plan text
   * 
   * @param planText - The coach plan text to parse
   * @returns TickerInfo object or null if extraction fails
   */
  extractTickerInfo(planText: string): TickerInfo | null {
    if (!planText || typeof planText !== 'string') {
      console.warn('[ChartGenerator] Invalid plan text provided');
      return null;
    }

    const ticker = this.extractTicker(planText);
    const timeframe = this.extractTimeframe(planText);

    if (!ticker) {
      console.debug('[ChartGenerator] No ticker found in plan text');
      return null;
    }

    // Use default timeframe if not found
    const finalTimeframe = timeframe || '1D';

    console.log(`[ChartGenerator] Extracted ticker: ${ticker}, timeframe: ${finalTimeframe}`);
    
    return {
      ticker,
      timeframe: finalTimeframe,
    };
  }

  /**
   * Extract ticker symbol from text
   * 
   * @param text - Text to parse
   * @returns Ticker symbol or null
   */
  private extractTicker(text: string): string | null {
    // Try each pattern
    for (const { pattern, global: isGlobal } of ChartGenerator.TICKER_PATTERNS) {
      if (isGlobal) {
        // Use matchAll for global patterns
        const matches = Array.from(text.matchAll(pattern));
        
        for (const match of matches) {
          const ticker = match[1]?.toUpperCase();
          
          if (ticker && this.isValidTicker(ticker)) {
            return ticker;
          }
        }
      } else {
        // Use exec for non-global patterns
        const match = pattern.exec(text);
        if (match) {
          const ticker = match[1]?.toUpperCase();
          
          if (ticker && this.isValidTicker(ticker)) {
            return ticker;
          }
        }
      }
    }

    return null;
  }

  /**
   * Validate ticker symbol
   * 
   * @param ticker - Ticker to validate
   * @returns True if valid
   */
  private isValidTicker(ticker: string): boolean {
    // Check if in known list
    if (ChartGenerator.VALID_TICKERS.has(ticker)) {
      return true;
    }

    // Basic validation: 1-5 uppercase letters, optionally followed by .XX
    const isValidFormat = /^[A-Z]{1,5}(?:\.[A-Z]{1,2})?$/.test(ticker);
    
    // Avoid common false positives
    const falsePositives = new Set(['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE']);
    
    return isValidFormat && !falsePositives.has(ticker);
  }

  /**
   * Extract timeframe from text
   * 
   * @param text - Text to parse
   * @returns Normalized timeframe string or null
   */
  private extractTimeframe(text: string): string | null {
    for (const pattern of ChartGenerator.TIMEFRAME_PATTERNS) {
      const match = pattern.exec(text);
      
      if (match) {
        return this.normalizeTimeframe(match[0]);
      }
    }

    return null;
  }

  /**
   * Normalize timeframe to standard format
   * 
   * @param timeframe - Raw timeframe string
   * @returns Normalized timeframe (e.g., "1D", "4H", "15min")
   */
  private normalizeTimeframe(timeframe: string): string {
    const lower = timeframe.toLowerCase();

    // Handle word formats
    if (lower.includes('daily') || lower.includes('day')) {
      return '1D';
    }
    if (lower.includes('hourly') || lower.includes('hour')) {
      return '1H';
    }
    if (lower.includes('weekly') || lower.includes('week')) {
      return '1W';
    }
    if (lower.includes('monthly') || lower.includes('month')) {
      return '1M';
    }

    // Handle numeric formats (1d, 4h, 15min, etc.)
    const numericMatch = /(\d+)([mhMHdDwW])/.exec(timeframe);
    if (numericMatch) {
      const value = numericMatch[1];
      const unit = numericMatch[2].toUpperCase();

      switch (unit) {
        case 'M':
          return `${value}min`;
        case 'H':
          return `${value}H`;
        case 'D':
          return `${value}D`;
        case 'W':
          return `${value}W`;
        default:
          return `${value}${unit}`;
      }
    }

    // Return as-is if already in good format
    return timeframe;
  }

  /**
   * Fetch market data via Alpha Vantage MCP with retry logic and rate limiting
   * 
   * @param ticker - Stock ticker symbol
   * @param timeframe - Timeframe string (e.g., "1D", "4H", "15min")
   * @param retryCount - Current retry attempt (internal use)
   * @returns Array of OHLCV data points
   */
  async fetchMarketData(
    ticker: string,
    timeframe: string,
    retryCount: number = 0
  ): Promise<OHLCVData[]> {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 2000; // 2 seconds

    try {
      // Check rate limit status
      const status = this.rateLimiter.getStatus();
      
      if (status.isApproachingLimit) {
        console.warn(`[ChartGenerator] Approaching rate limit (${status.currentCount}/${status.maxRequests})`);
      }

      // Acquire rate limit slot (will queue if necessary)
      await this.rateLimiter.acquire();

      console.log(`[ChartGenerator] Fetching market data for ${ticker} ${timeframe} (attempt ${retryCount + 1})`);

      // Map timeframe to Alpha Vantage interval
      const interval = this.mapTimeframeToInterval(timeframe);
      
      if (!interval) {
        throw new Error(`Unsupported timeframe: ${timeframe}`);
      }

      // Call our API endpoint which will use Alpha Vantage MCP
      const response = await fetch('/api/market-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker,
          interval,
          timeframe,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.message || 'Failed to fetch market data';
        
        // Check if it's a rate limit error
        if (errorMessage.includes('rate limit') && retryCount < MAX_RETRIES) {
          console.warn(`[ChartGenerator] Rate limit hit, retrying in ${RETRY_DELAY}ms...`);
          await this.delay(RETRY_DELAY);
          return this.fetchMarketData(ticker, timeframe, retryCount + 1);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format from market data API');
      }

      console.log(`[ChartGenerator] Fetched ${data.data.length} data points for ${ticker}`);
      
      return data.data;
    } catch (error) {
      // Retry on network errors
      if (
        retryCount < MAX_RETRIES &&
        (error instanceof TypeError || (error instanceof Error && error.message.includes('fetch')))
      ) {
        console.warn(`[ChartGenerator] Network error, retrying in ${RETRY_DELAY}ms...`);
        await this.delay(RETRY_DELAY);
        return this.fetchMarketData(ticker, timeframe, retryCount + 1);
      }

      console.error('[ChartGenerator] Error fetching market data:', error);
      throw error;
    }
  }

  /**
   * Delay helper for retry logic
   * 
   * @param ms - Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Map timeframe to Alpha Vantage interval
   * 
   * @param timeframe - Timeframe string
   * @returns Alpha Vantage interval or null
   */
  private mapTimeframeToInterval(timeframe: string): string | null {
    // Normalize timeframe
    const normalized = timeframe.toLowerCase();

    // Direct mappings
    const mappings: Record<string, string> = {
      '1min': '1min',
      '5min': '5min',
      '15min': '15min',
      '30min': '30min',
      '1h': '60min',
      '60min': '60min',
      '4h': '60min', // Will need aggregation
      '1d': 'daily',
      'daily': 'daily',
      '1w': 'weekly',
      'weekly': 'weekly',
      '1m': 'monthly',
      'monthly': 'monthly',
    };

    return mappings[normalized] || null;
  }

  /**
   * Generate chart with automatic caching and data fetching
   * 
   * @param ticker - Stock ticker symbol
   * @param timeframe - Timeframe string
   * @returns ChartData object
   */
  async generateChart(ticker: string, timeframe: string): Promise<ChartData> {
    try {
      // Check cache first
      const cached = this.getCachedChart(ticker, timeframe);
      if (cached) {
        return cached;
      }

      // Fetch fresh data
      const data = await this.fetchMarketData(ticker, timeframe);

      // Create chart data object
      const chartData: ChartData = {
        ticker,
        timeframe,
        data,
        generatedAt: Date.now(),
      };

      // Cache the result
      this.cacheChart(ticker, timeframe, chartData);

      return chartData;
    } catch (error) {
      console.error('[ChartGenerator] Error generating chart:', error);
      throw error;
    }
  }

  /**
   * Generate chart from plan text
   * Convenience method that extracts ticker info and generates chart
   * 
   * @param planText - Coach plan text
   * @returns ChartData object or null if extraction fails
   */
  async generateChartFromPlan(planText: string): Promise<ChartData | null> {
    try {
      const tickerInfo = this.extractTickerInfo(planText);
      
      if (!tickerInfo) {
        console.debug('[ChartGenerator] Could not extract ticker info from plan');
        return null;
      }

      return await this.generateChart(tickerInfo.ticker, tickerInfo.timeframe);
    } catch (error) {
      console.error('[ChartGenerator] Error generating chart from plan:', error);
      return null;
    }
  }

  /**
   * Generate chart with fallback support
   * Attempts to generate chart, returns error info if it fails
   * 
   * @param ticker - Stock ticker symbol
   * @param timeframe - Timeframe string
   * @param fallbackUrl - Optional fallback chart URL
   * @returns Object with chart data or error info
   */
  async generateChartWithFallback(
    ticker: string,
    timeframe: string,
    fallbackUrl?: string
  ): Promise<{
    success: boolean;
    data?: ChartData;
    error?: string;
    fallbackUrl?: string;
    shouldUseFallback: boolean;
  }> {
    try {
      const chartData = await this.generateChart(ticker, timeframe);
      
      return {
        success: true,
        data: chartData,
        shouldUseFallback: false,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('[ChartGenerator] Chart generation failed, using fallback:', errorMessage);
      
      // Determine if we should use fallback
      const shouldUseFallback = !!fallbackUrl;
      
      // Check if it's a rate limit error - cache the failure temporarily
      if (errorMessage.includes('rate limit')) {
        this.cacheFailure(ticker, timeframe, 'rate_limit');
      }
      
      return {
        success: false,
        error: errorMessage,
        fallbackUrl,
        shouldUseFallback,
      };
    }
  }

  /**
   * Check if chart generation recently failed for a ticker/timeframe
   * 
   * @param ticker - Stock ticker symbol
   * @param timeframe - Timeframe string
   * @returns True if should skip generation attempt
   */
  shouldSkipGeneration(ticker: string, timeframe: string): boolean {
    try {
      const failureKey = `chart-failure-${ticker}-${timeframe}`;
      const failureStr = localStorage.getItem(failureKey);
      
      if (!failureStr) {
        return false;
      }

      const failure = JSON.parse(failureStr);
      const now = Date.now();
      const age = now - failure.timestamp;

      // Skip for 5 minutes after rate limit error
      if (failure.reason === 'rate_limit' && age < 5 * 60 * 1000) {
        console.debug(`[ChartGenerator] Skipping generation for ${ticker} due to recent rate limit`);
        return true;
      }

      // Skip for 1 minute after other errors
      if (age < 60 * 1000) {
        console.debug(`[ChartGenerator] Skipping generation for ${ticker} due to recent failure`);
        return true;
      }

      // Clear old failure
      localStorage.removeItem(failureKey);
      return false;
    } catch (error) {
      console.error('[ChartGenerator] Error checking failure cache:', error);
      return false;
    }
  }

  /**
   * Cache a chart generation failure
   * 
   * @param ticker - Stock ticker symbol
   * @param timeframe - Timeframe string
   * @param reason - Failure reason
   */
  private cacheFailure(ticker: string, timeframe: string, reason: string): void {
    try {
      const failureKey = `chart-failure-${ticker}-${timeframe}`;
      const failure = {
        timestamp: Date.now(),
        reason,
      };
      
      localStorage.setItem(failureKey, JSON.stringify(failure));
      console.log(`[ChartGenerator] Cached failure for ${ticker} ${timeframe}: ${reason}`);
    } catch (error) {
      console.error('[ChartGenerator] Error caching failure:', error);
    }
  }

  /**
   * Clear all failure caches
   */
  clearFailureCache(): void {
    try {
      const keys = Object.keys(localStorage);
      const failureKeys = keys.filter(key => key.startsWith('chart-failure-'));
      
      for (const key of failureKeys) {
        localStorage.removeItem(key);
      }
      
      console.log(`[ChartGenerator] Cleared ${failureKeys.length} failure cache entries`);
    } catch (error) {
      console.error('[ChartGenerator] Error clearing failure cache:', error);
    }
  }

  /**
   * Get cached chart data and update LRU timestamp
   * 
   * @param ticker - Stock ticker symbol
   * @param timeframe - Timeframe string
   * @returns Cached ChartData or null if not found/expired
   */
  getCachedChart(ticker: string, timeframe: string): ChartData | null {
    try {
      const cacheKey = this.generateCacheKey(ticker, timeframe);
      const cacheStr = localStorage.getItem(ChartGenerator.CACHE_KEY);
      
      if (!cacheStr) {
        return null;
      }

      const cache: ChartCache = JSON.parse(cacheStr);
      const cached = cache[cacheKey];

      if (!cached) {
        return null;
      }

      // Check if expired
      const now = Date.now();
      const age = now - cached.generatedAt;

      if (age > CHART_CACHE_EXPIRATION) {
        console.debug(`[ChartGenerator] Cache expired for ${cacheKey}`);
        return null;
      }

      // Update last accessed time for LRU
      const updatedData: ChartData = {
        ticker: cached.ticker,
        timeframe: cached.timeframe,
        data: cached.data,
        generatedAt: cached.generatedAt,
        lastAccessed: now,
      };
      cache[cacheKey] = updatedData;

      // Save updated cache (with access time)
      try {
        localStorage.setItem(ChartGenerator.CACHE_KEY, JSON.stringify(cache));
      } catch (error) {
        // Ignore errors when updating access time
        console.debug('[ChartGenerator] Could not update access time:', error);
      }

      console.log(`[ChartGenerator] Cache hit for ${cacheKey}`);
      return cached;
    } catch (error) {
      console.error('[ChartGenerator] Error reading cache:', error);
      return null;
    }
  }

  /**
   * Cache chart data with LRU eviction
   * 
   * @param ticker - Stock ticker symbol
   * @param timeframe - Timeframe string
   * @param data - Chart data to cache
   */
  cacheChart(ticker: string, timeframe: string, data: ChartData): void {
    try {
      const cacheKey = this.generateCacheKey(ticker, timeframe);
      const cacheStr = localStorage.getItem(ChartGenerator.CACHE_KEY);
      
      let cache: ChartCache = {};
      if (cacheStr) {
        cache = JSON.parse(cacheStr);
      }

      // Add new data with access timestamp for LRU
      const cachedData: ChartData = {
        ticker: data.ticker,
        timeframe: data.timeframe,
        data: data.data,
        generatedAt: data.generatedAt,
        lastAccessed: Date.now(),
      };
      cache[cacheKey] = cachedData;

      // Try to save
      this.saveCacheWithEviction(cache);
      
      console.log(`[ChartGenerator] Cached chart for ${cacheKey}`);
    } catch (error) {
      console.error('[ChartGenerator] Error caching chart:', error);
    }
  }

  /**
   * Save cache with automatic eviction on quota exceeded
   * 
   * @param cache - Cache object to save
   */
  private saveCacheWithEviction(cache: ChartCache): void {
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    while (attempts < MAX_ATTEMPTS) {
      try {
        const cacheStr = JSON.stringify(cache);
        const cacheSize = new Blob([cacheStr]).size;

        // Proactive eviction if approaching size limit
        if (cacheSize > MAX_CACHE_SIZE * 0.9) {
          console.warn('[ChartGenerator] Cache approaching size limit, evicting entries');
          cache = this.evictLRUEntries(cache, 0.5); // Keep 50%
          continue;
        }

        localStorage.setItem(ChartGenerator.CACHE_KEY, cacheStr);
        return; // Success
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn(`[ChartGenerator] QuotaExceededError, evicting entries (attempt ${attempts + 1})`);
          
          // Evict progressively more entries
          const keepRatio = 0.7 - (attempts * 0.2); // 70%, 50%, 30%
          cache = this.evictLRUEntries(cache, keepRatio);
          
          attempts++;
        } else {
          throw error;
        }
      }
    }

    // If we still can't save after eviction, clear everything
    console.error('[ChartGenerator] Failed to save cache after eviction, clearing all');
    this.clearCache();
  }

  /**
   * Generate cache key from ticker and timeframe
   * 
   * @param ticker - Stock ticker symbol
   * @param timeframe - Timeframe string
   * @returns Cache key string
   */
  private generateCacheKey(ticker: string, timeframe: string): string {
    return `${ticker.toUpperCase()}-${timeframe}`;
  }

  /**
   * Evict LRU (Least Recently Used) cache entries
   * 
   * @param cache - Current cache object
   * @param keepRatio - Ratio of entries to keep (0-1)
   * @returns Reduced cache object
   */
  private evictLRUEntries(cache: ChartCache, keepRatio: number = 0.5): ChartCache {
    const entries = Object.entries(cache);
    
    if (entries.length === 0) {
      return {};
    }

    // Sort by last accessed time (most recent first)
    entries.sort(([, a], [, b]) => {
      const aTime = (a as any).lastAccessed || a.generatedAt;
      const bTime = (b as any).lastAccessed || b.generatedAt;
      return bTime - aTime;
    });

    // Keep only the specified ratio of entries
    const keepCount = Math.max(1, Math.floor(entries.length * keepRatio));
    const newCache: ChartCache = {};

    for (let i = 0; i < keepCount; i++) {
      const [key, value] = entries[i];
      newCache[key] = value;
    }

    const evictedCount = entries.length - keepCount;
    console.log(`[ChartGenerator] Evicted ${evictedCount} LRU entries (kept ${keepCount})`);

    return newCache;
  }

  /**
   * Evict oldest cache entries to reduce size (legacy method)
   * 
   * @param cache - Current cache object
   * @returns Reduced cache object
   */
  private evictOldestEntries(cache: ChartCache): ChartCache {
    return this.evictLRUEntries(cache, 0.5);
  }

  /**
   * Clear old cache entries
   * Removes entries older than CHART_CACHE_EXPIRATION
   */
  clearOldCache(): void {
    try {
      const cacheStr = localStorage.getItem(ChartGenerator.CACHE_KEY);
      
      if (!cacheStr) {
        return;
      }

      const cache: ChartCache = JSON.parse(cacheStr);
      const now = Date.now();
      const newCache: ChartCache = {};
      let removedCount = 0;

      for (const [key, value] of Object.entries(cache)) {
        const age = now - value.generatedAt;
        
        if (age <= CHART_CACHE_EXPIRATION) {
          newCache[key] = value;
        } else {
          removedCount++;
        }
      }

      if (removedCount > 0) {
        localStorage.setItem(ChartGenerator.CACHE_KEY, JSON.stringify(newCache));
        console.log(`[ChartGenerator] Cleared ${removedCount} expired cache entries`);
      }
    } catch (error) {
      console.error('[ChartGenerator] Error clearing old cache:', error);
    }
  }

  /**
   * Clear all cached charts
   */
  clearCache(): void {
    try {
      localStorage.removeItem(ChartGenerator.CACHE_KEY);
      console.log('[ChartGenerator] Cache cleared');
    } catch (error) {
      console.error('[ChartGenerator] Error clearing cache:', error);
    }
  }

  /**
   * Get cache statistics
   * 
   * @returns Cache stats object
   */
  getCacheStats(): {
    entryCount: number;
    totalSize: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    try {
      const cacheStr = localStorage.getItem(ChartGenerator.CACHE_KEY);
      
      if (!cacheStr) {
        return {
          entryCount: 0,
          totalSize: 0,
          oldestEntry: null,
          newestEntry: null,
        };
      }

      const cache: ChartCache = JSON.parse(cacheStr);
      const entries = Object.values(cache);
      
      const timestamps = entries.map(e => e.generatedAt);
      
      return {
        entryCount: entries.length,
        totalSize: new Blob([cacheStr]).size,
        oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
        newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null,
      };
    } catch (error) {
      console.error('[ChartGenerator] Error getting cache stats:', error);
      return {
        entryCount: 0,
        totalSize: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    }
  }

  /**
   * Monitor and optimize storage if needed
   * Should be called periodically
   */
  monitorStorage(): void {
    try {
      const stats = this.getCacheStats();
      const sizeInMB = (stats.totalSize / (1024 * 1024)).toFixed(2);
      
      console.log(`[ChartGenerator] Cache stats: ${stats.entryCount} entries, ${sizeInMB}MB`);

      // If cache is large, clean old entries
      if (stats.totalSize > MAX_CACHE_SIZE * 0.8) {
        console.warn('[ChartGenerator] Cache size high, cleaning old entries');
        this.clearOldCache();
      }

      // Check overall localStorage usage
      if (typeof window !== 'undefined') {
        let totalSize = 0;
        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            const value = localStorage.getItem(key);
            totalSize += key.length + (value?.length || 0);
          }
        }
        
        const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
        const QUOTA_5MB = 5 * 1024 * 1024;
        const usagePercent = ((totalSize / QUOTA_5MB) * 100).toFixed(1);
        
        console.log(`[ChartGenerator] Total localStorage: ${totalMB}MB (${usagePercent}% of typical 5MB quota)`);

        // If approaching quota, be more aggressive with eviction
        if (totalSize > QUOTA_5MB * 0.8) {
          console.warn('[ChartGenerator] localStorage approaching quota, aggressive cleanup');
          const cacheStr = localStorage.getItem(ChartGenerator.CACHE_KEY);
          if (cacheStr) {
            const cache: ChartCache = JSON.parse(cacheStr);
            const reducedCache = this.evictLRUEntries(cache, 0.3); // Keep only 30%
            localStorage.setItem(ChartGenerator.CACHE_KEY, JSON.stringify(reducedCache));
          }
        }
      }
    } catch (error) {
      console.error('[ChartGenerator] Error monitoring storage:', error);
    }
  }
}
