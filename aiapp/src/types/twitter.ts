/**
 * Twitter Integration Type Definitions
 * 
 * Defines interfaces for Twitter sentiment data, tweets, Stocktwits messages,
 * and API responses used throughout the Twitter dashboard integration.
 */

/**
 * Individual tweet data structure
 */
export interface Tweet {
  id: string;
  account: string;
  accountAvatar?: string;
  text: string;
  timestamp: Date;
  sentiment: number; // -1.0 (bearish) to 1.0 (bullish)
  tickers: string[];
  url: string;
  engagement?: {
    likes: number;
    retweets: number;
  };
}

/**
 * Aggregated sentiment analysis data
 */
export interface SentimentData {
  overall_score: number; // -1.0 (bearish) to 1.0 (bullish)
  bullish_args: string[];
  bearish_args: string[];
  themes: string[];
  account_influence: Record<string, number>;
  confidence: number; // 0.0 to 1.0
}

/**
 * Stocktwits message data structure
 */
export interface StocktwitsMessage {
  id: string;
  user: string;
  userAvatar?: string;
  text: string;
  timestamp: Date;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  likes: number;
}

/**
 * Stocktwits sentiment ratio
 */
export interface StocktwitsRatio {
  bullish: number;
  bearish: number;
}

/**
 * State management for Twitter feed component
 */
export interface TwitterFeedState {
  tweets: Tweet[];
  sentiment: SentimentData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  accounts: string[];
  filter: string;
}

/**
 * API response for Twitter sentiment endpoint
 */
export interface TwitterSentimentResponse {
  tweets: Array<{
    id: string;
    account: string;
    text: string;
    timestamp: string;
    sentiment: number;
    tickers: string[];
    url: string;
  }>;
  sentiment: {
    overall_score: number;
    bullish_args: string[];
    bearish_args: string[];
    themes: string[];
    account_influence: Record<string, number>;
  };
  metadata: {
    total_tweets: number;
    filtered_tweets: number;
    last_updated: string;
    cache_hit: boolean;
  };
}

/**
 * API response for Stocktwits endpoint
 */
export interface StocktwitsResponse {
  messages: Array<{
    id: string;
    user: string;
    text: string;
    timestamp: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    likes: number;
  }>;
  sentiment_ratio: {
    bullish: number;
    bearish: number;
  };
}

/**
 * API response for account update endpoint
 */
export interface AccountUpdateResponse {
  success: boolean;
  accounts: string[];
  validated: boolean;
}

/**
 * Cache entry structure for browser storage
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Options for API requests
 */
export interface TwitterApiOptions {
  ticker?: string;
  accounts?: string[];
  limit?: number;
}

/**
 * Error response from API
 */
export interface TwitterApiError {
  error: string;
  message: string;
  status: number;
}
