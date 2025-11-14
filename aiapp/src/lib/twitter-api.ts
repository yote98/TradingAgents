/**
 * Twitter API Client
 * 
 * Provides functions for fetching Twitter sentiment data, Stocktwits messages,
 * and managing monitored accounts. Includes caching and retry logic.
 */

import {
  Tweet,
  SentimentData,
  StocktwitsMessage,
  TwitterSentimentResponse,
  StocktwitsResponse,
  AccountUpdateResponse,
  TwitterApiOptions,
  TwitterApiError,
  CacheEntry,
  StocktwitsRatio,
} from '@/types/twitter';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_C1_API_URL || 'http://localhost:5001';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Cache key generator
 */
function getCacheKey(endpoint: string, params?: Record<string, any>): string {
  const paramString = params ? JSON.stringify(params) : '';
  return `twitter_cache_${endpoint}_${paramString}`;
}

/**
 * Get data from browser storage cache
 */
function getFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    
    // Check if cache is still valid
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

/**
 * Save data to browser storage cache
 */
function saveToCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with exponential backoff retry logic
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If successful or client error (4xx), return immediately
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // Server error (5xx), retry
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error as Error;
    }

    // Don't sleep after the last attempt
    if (attempt < retries - 1) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  throw lastError || new Error('Request failed after retries');
}

/**
 * Transform API response tweet to Tweet interface
 */
function transformTweet(apiTweet: TwitterSentimentResponse['tweets'][0]): Tweet {
  return {
    id: apiTweet.id,
    account: apiTweet.account,
    text: apiTweet.text,
    timestamp: new Date(apiTweet.timestamp),
    sentiment: apiTweet.sentiment,
    tickers: apiTweet.tickers,
    url: apiTweet.url,
  };
}

/**
 * Transform API response sentiment to SentimentData interface
 */
function transformSentiment(apiSentiment: TwitterSentimentResponse['sentiment']): SentimentData {
  return {
    overall_score: apiSentiment.overall_score,
    bullish_args: apiSentiment.bullish_args,
    bearish_args: apiSentiment.bearish_args,
    themes: apiSentiment.themes,
    account_influence: apiSentiment.account_influence,
    confidence: 0.8, // Default confidence, can be enhanced later
  };
}

/**
 * Transform API response Stocktwits message to StocktwitsMessage interface
 */
function transformStocktwitsMessage(
  apiMessage: StocktwitsResponse['messages'][0]
): StocktwitsMessage {
  return {
    id: apiMessage.id,
    user: apiMessage.user,
    text: apiMessage.text,
    timestamp: new Date(apiMessage.timestamp),
    sentiment: apiMessage.sentiment,
    likes: apiMessage.likes,
  };
}

/**
 * Fetch Twitter sentiment data for a ticker
 * 
 * @param options - API options including ticker, accounts, and limit
 * @returns Object containing tweets and sentiment analysis
 */
export async function fetchTwitterSentiment(
  options: TwitterApiOptions = {}
): Promise<{ 
  tweets: Tweet[]; 
  sentiment: SentimentData | null; 
  lastUpdated: Date;
  metadata?: {
    cache_hit: boolean;
    total_tweets: number;
    filtered_tweets: number;
    last_updated: string;
  };
}> {
  const { ticker, accounts, limit = 50 } = options;

  // Build query parameters
  const params = new URLSearchParams();
  if (ticker) params.append('ticker', ticker);
  if (accounts && accounts.length > 0) params.append('accounts', accounts.join(','));
  if (limit) params.append('limit', limit.toString());

  const endpoint = '/api/twitter/sentiment';
  const url = `${API_BASE_URL}${endpoint}?${params.toString()}`;
  const cacheKey = getCacheKey(endpoint, { ticker, accounts, limit });

  // Try to get from cache first
  const cached = getFromCache<{ 
    tweets: Tweet[]; 
    sentiment: SentimentData | null; 
    lastUpdated: Date;
    metadata?: {
      cache_hit: boolean;
      total_tweets: number;
      filtered_tweets: number;
      last_updated: string;
    };
  }>(cacheKey);
  if (cached) {
    return {
      ...cached,
      metadata: {
        ...cached.metadata,
        cache_hit: true,
        total_tweets: cached.tweets.length,
        filtered_tweets: cached.tweets.length,
        last_updated: cached.lastUpdated.toISOString(),
      },
    };
  }

  try {
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      const errorData: TwitterApiError = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data: TwitterSentimentResponse = await response.json();

    // Transform API response to our interfaces
    const tweets = data.tweets.map(transformTweet);
    const sentiment = data.sentiment ? transformSentiment(data.sentiment) : null;
    const lastUpdated = new Date(data.metadata.last_updated);

    const result = { 
      tweets, 
      sentiment, 
      lastUpdated,
      metadata: data.metadata,
    };

    // Save to cache
    saveToCache(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error fetching Twitter sentiment:', error);
    throw error;
  }
}

/**
 * Fetch Stocktwits messages for a ticker
 * 
 * @param ticker - Stock ticker symbol
 * @param limit - Maximum number of messages to fetch
 * @returns Object containing messages and sentiment ratio
 */
export async function fetchStocktwits(
  ticker: string,
  limit = 30
): Promise<{ messages: StocktwitsMessage[]; sentimentRatio: StocktwitsRatio }> {
  const params = new URLSearchParams();
  params.append('ticker', ticker);
  params.append('limit', limit.toString());

  const endpoint = '/api/twitter/stocktwits';
  const url = `${API_BASE_URL}${endpoint}?${params.toString()}`;
  const cacheKey = getCacheKey(endpoint, { ticker, limit });

  // Try to get from cache first
  const cached = getFromCache<{ messages: StocktwitsMessage[]; sentimentRatio: StocktwitsRatio }>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      const errorData: TwitterApiError = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data: StocktwitsResponse = await response.json();

    // Transform API response to our interfaces
    const messages = data.messages.map(transformStocktwitsMessage);
    const sentimentRatio = data.sentiment_ratio;

    const result = { messages, sentimentRatio };

    // Save to cache
    saveToCache(cacheKey, result);

    return result;
  } catch (error) {
    console.error('Error fetching Stocktwits:', error);
    throw error;
  }
}

/**
 * Update monitored Twitter accounts
 * 
 * @param accounts - Array of Twitter usernames to monitor
 * @returns Response indicating success and validated accounts
 */
export async function updateAccounts(accounts: string[]): Promise<AccountUpdateResponse> {
  const url = `${API_BASE_URL}/api/twitter/accounts`;

  try {
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accounts }),
    });

    if (!response.ok) {
      const errorData: TwitterApiError = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data: AccountUpdateResponse = await response.json();

    // Clear relevant caches when accounts are updated
    clearTwitterCache();

    return data;
  } catch (error) {
    console.error('Error updating accounts:', error);
    throw error;
  }
}

/**
 * Clear all Twitter-related cache entries
 */
export function clearTwitterCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('twitter_cache_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing Twitter cache:', error);
  }
}

/**
 * Get cache status for debugging
 */
export function getCacheStatus(): { key: string; expiresIn: number }[] {
  try {
    const keys = Object.keys(localStorage);
    const status: { key: string; expiresIn: number }[] = [];

    keys.forEach(key => {
      if (key.startsWith('twitter_cache_')) {
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry<any> = JSON.parse(cached);
          const expiresIn = Math.max(0, entry.expiresAt - Date.now());
          status.push({ key, expiresIn });
        }
      }
    });

    return status;
  } catch (error) {
    console.error('Error getting cache status:', error);
    return [];
  }
}
