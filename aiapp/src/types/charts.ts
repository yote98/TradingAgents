/**
 * TypeScript type definitions for chart data and configuration
 */

/**
 * OHLCV (Open, High, Low, Close, Volume) data point
 */
export interface OHLCVData {
  /** Unix timestamp in seconds */
  time: number;
  
  /** Opening price */
  open: number;
  
  /** Highest price */
  high: number;
  
  /** Lowest price */
  low: number;
  
  /** Closing price */
  close: number;
  
  /** Trading volume */
  volume: number;
}

/**
 * Cached chart data
 */
export interface ChartData {
  /** Stock ticker symbol */
  ticker: string;
  
  /** Timeframe (e.g., "1D", "4H", "15min") */
  timeframe: string;
  
  /** OHLCV data points */
  data: OHLCVData[];
  
  /** Timestamp when chart was generated (epoch ms) */
  generatedAt: number;
  
  /** Timestamp when chart was last accessed (epoch ms) - for LRU eviction */
  lastAccessed?: number;
}

/**
 * Chart cache storage structure
 */
export interface ChartCache {
  [key: string]: ChartData;
}

/**
 * Ticker information extracted from plan text
 */
export interface TickerInfo {
  /** Stock ticker symbol */
  ticker: string;
  
  /** Timeframe (e.g., "1D", "4H", "15min") */
  timeframe: string;
}

/**
 * Chart theme options
 */
export type ChartTheme = 'light' | 'dark';

/**
 * Chart type options
 */
export type ChartType = 'candlestick' | 'line' | 'area';

/**
 * Chart display options
 */
export interface ChartOptions {
  /** Chart theme */
  theme: ChartTheme;
  
  /** Chart type */
  type: ChartType;
  
  /** Show volume bars */
  showVolume: boolean;
  
  /** Watermark text */
  watermark?: string;
  
  /** Chart width in pixels */
  width?: number;
  
  /** Chart height in pixels */
  height?: number;
}

/**
 * Default chart options
 */
export const DEFAULT_CHART_OPTIONS: ChartOptions = {
  theme: 'light',
  type: 'candlestick',
  showVolume: true,
  watermark: 'Generated from public market data',
  width: 600,
  height: 400,
};

/**
 * Chart generation status
 */
export type ChartStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Chart generation result
 */
export interface ChartResult {
  status: ChartStatus;
  data?: ChartData;
  error?: string;
}

/**
 * Timeframe mapping to Alpha Vantage intervals
 */
export const TIMEFRAME_TO_INTERVAL: Record<string, string> = {
  '1min': '1min',
  '5min': '5min',
  '15min': '15min',
  '30min': '30min',
  '1H': '60min',
  '4H': '60min', // Will need to aggregate
  '1D': 'daily',
  '1W': 'weekly',
  '1M': 'monthly',
};

/**
 * Cache expiration time in milliseconds (5 minutes)
 */
export const CHART_CACHE_EXPIRATION = 5 * 60 * 1000;

/**
 * Maximum cache size in bytes (5MB)
 */
export const MAX_CACHE_SIZE = 5 * 1024 * 1024;
