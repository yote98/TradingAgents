import { BacktestConfig, BacktestResults } from '@/types/sections';

export interface BacktestRequest {
  ticker: string;
  startDate: string;
  endDate: string;
  config: BacktestConfig;
}

export interface BacktestResponse {
  success: boolean;
  results?: BacktestResults;
  error?: string;
}

export interface BacktestError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Run a backtest using the TradingAgents backend
 * @param request Backtest configuration
 * @param useCache Whether to use cached results (default: true)
 * @returns Backtest results or error
 */
export async function runBacktest(request: BacktestRequest, useCache: boolean = true): Promise<BacktestResponse> {
  try {
    // Check cache first if enabled
    if (useCache) {
      const cached = getCachedBacktestResults(request.ticker, request.startDate, request.endDate);
      if (cached) {
        console.log(`Using cached backtest results for ${request.ticker} (${request.startDate} to ${request.endDate})`);
        return {
          success: true,
          results: cached,
        };
      }
    }

    const response = await fetch('/api/backtest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    // Cache successful results
    if (data.success && data.results) {
      cacheBacktestResults(request.ticker, data.results);
    }

    return data;
  } catch (error) {
    console.error('Backtest API error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error: Unable to connect to the backtest service. Please check your connection.',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Validate ticker symbol format
 * @param ticker Stock ticker symbol
 * @returns true if valid, false otherwise
 */
export function validateTicker(ticker: string): boolean {
  const tickerRegex = /^[A-Z]{1,5}$/;
  return tickerRegex.test(ticker);
}

/**
 * Validate date range
 * @param startDate Start date string
 * @param endDate End date string
 * @returns Validation result with error message if invalid
 */
export function validateDateRange(startDate: string, endDate: string): { valid: boolean; error?: string } {
  if (!startDate || !endDate) {
    return {
      valid: false,
      error: 'Both start and end dates are required',
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      valid: false,
      error: 'Invalid date format',
    };
  }

  if (start >= end) {
    return {
      valid: false,
      error: 'End date must be after start date',
    };
  }

  if (end > today) {
    return {
      valid: false,
      error: 'End date cannot be in the future',
    };
  }

  // Check minimum date range (at least 7 days)
  const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff < 7) {
    return {
      valid: false,
      error: 'Date range must be at least 7 days',
    };
  }

  return { valid: true };
}

/**
 * Validate backtest configuration
 * @param config Backtest configuration
 * @returns Validation result with error message if invalid
 */
export function validateBacktestConfig(config: BacktestConfig): { valid: boolean; error?: string } {
  if (config.initialBalance <= 0) {
    return {
      valid: false,
      error: 'Initial balance must be positive',
    };
  }

  if (config.initialBalance < 1000) {
    return {
      valid: false,
      error: 'Initial balance must be at least $1,000',
    };
  }

  if (config.commissionRate < 0 || config.commissionRate > 0.1) {
    return {
      valid: false,
      error: 'Commission rate must be between 0% and 10%',
    };
  }

  if (config.slippage < 0 || config.slippage > 0.1) {
    return {
      valid: false,
      error: 'Slippage must be between 0% and 10%',
    };
  }

  if (config.riskPerTradePct <= 0 || config.riskPerTradePct > 100) {
    return {
      valid: false,
      error: 'Risk per trade must be between 0% and 100%',
    };
  }

  if (config.maxPositionSizePct <= 0 || config.maxPositionSizePct > 100) {
    return {
      valid: false,
      error: 'Max position size must be between 0% and 100%',
    };
  }

  return { valid: true };
}

/**
 * Validate backtest request
 * @param request Backtest request
 * @returns Validation result with error message if invalid
 */
export function validateBacktestRequest(request: BacktestRequest): { valid: boolean; error?: string } {
  if (!request.ticker || !validateTicker(request.ticker)) {
    return {
      valid: false,
      error: 'Invalid ticker symbol. Must be 1-5 uppercase letters (e.g., AAPL, MSFT)',
    };
  }

  const dateValidation = validateDateRange(request.startDate, request.endDate);
  if (!dateValidation.valid) {
    return dateValidation;
  }

  const configValidation = validateBacktestConfig(request.config);
  if (!configValidation.valid) {
    return configValidation;
  }

  return { valid: true };
}

/**
 * Estimate backtest duration based on date range
 * @param startDate Start date string
 * @param endDate End date string
 * @returns Estimated duration in seconds
 */
export function estimateBacktestDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  
  // Rough estimate: ~0.5 seconds per trading day
  const estimatedSeconds = Math.ceil(daysDiff * 0.5);
  
  return Math.max(estimatedSeconds, 10); // Minimum 10 seconds
}

/**
 * Format backtest results for display
 * @param results Raw backtest results
 * @returns Formatted results
 */
export function formatBacktestResults(results: BacktestResults): BacktestResults {
  return {
    ...results,
    period: {
      start: new Date(results.period.start),
      end: new Date(results.period.end),
    },
    trades: results.trades.map(trade => ({
      ...trade,
      date: new Date(trade.date),
    })),
    equityCurve: results.equityCurve.map(point => ({
      ...point,
      date: new Date(point.date),
    })),
    totalReturn: Math.round(results.totalReturn * 100) / 100,
    winRate: Math.round(results.winRate * 100) / 100,
    sharpeRatio: Math.round(results.sharpeRatio * 100) / 100,
    maxDrawdown: Math.round(results.maxDrawdown * 100) / 100,
  };
}

/**
 * Cache backtest results in localStorage
 * @param ticker Stock ticker
 * @param results Backtest results
 */
export function cacheBacktestResults(ticker: string, results: BacktestResults): void {
  try {
    const cache = JSON.parse(localStorage.getItem('backtest_cache') || '{}');
    const cacheKey = `${ticker}_${results.period.start}_${results.period.end}`;
    cache[cacheKey] = {
      results,
      timestamp: Date.now(),
    };
    localStorage.setItem('backtest_cache', JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to cache backtest results:', error);
  }
}

/**
 * Get cached backtest results
 * @param ticker Stock ticker
 * @param startDate Start date string
 * @param endDate End date string
 * @param maxAge Maximum age in milliseconds (default: 1 hour)
 * @returns Cached results or null if not found or expired
 */
export function getCachedBacktestResults(
  ticker: string,
  startDate: string,
  endDate: string,
  maxAge: number = 60 * 60 * 1000
): BacktestResults | null {
  try {
    const cache = JSON.parse(localStorage.getItem('backtest_cache') || '{}');
    const cacheKey = `${ticker}_${startDate}_${endDate}`;
    const cached = cache[cacheKey];
    
    if (!cached) {
      return null;
    }
    
    const age = Date.now() - cached.timestamp;
    if (age > maxAge) {
      return null;
    }
    
    return cached.results;
  } catch (error) {
    console.error('Failed to get cached backtest results:', error);
    return null;
  }
}

/**
 * Clear backtest cache
 */
export function clearBacktestCache(): void {
  try {
    localStorage.removeItem('backtest_cache');
  } catch (error) {
    console.error('Failed to clear backtest cache:', error);
  }
}

/**
 * Invalidate cache for a specific ticker and date range
 * @param ticker Stock ticker to invalidate
 * @param startDate Start date string
 * @param endDate End date string
 */
export function invalidateBacktestCache(ticker: string, startDate: string, endDate: string): void {
  try {
    const cache = JSON.parse(localStorage.getItem('backtest_cache') || '{}');
    const cacheKey = `${ticker}_${startDate}_${endDate}`;
    delete cache[cacheKey];
    localStorage.setItem('backtest_cache', JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to invalidate backtest cache:', error);
  }
}

/**
 * Clean up expired cache entries
 * @param maxAge Maximum age in milliseconds (default: 1 hour)
 */
export function cleanupBacktestCache(maxAge: number = 60 * 60 * 1000): void {
  try {
    const cache = JSON.parse(localStorage.getItem('backtest_cache') || '{}');
    const now = Date.now();
    let cleaned = false;
    
    for (const cacheKey in cache) {
      const age = now - cache[cacheKey].timestamp;
      if (age > maxAge) {
        delete cache[cacheKey];
        cleaned = true;
      }
    }
    
    if (cleaned) {
      localStorage.setItem('backtest_cache', JSON.stringify(cache));
      console.log('Cleaned up expired backtest cache entries');
    }
  } catch (error) {
    console.error('Failed to cleanup backtest cache:', error);
  }
}

/**
 * Download backtest results as JSON
 * @param results Backtest results
 */
export function downloadBacktestResults(results: BacktestResults): void {
  try {
    const resultsText = JSON.stringify(results, null, 2);
    const blob = new Blob([resultsText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backtest-${results.ticker}-${results.period.start}-${results.period.end}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download backtest results:', error);
  }
}
