import { AnalysisConfig, AnalystType, AnalysisResults } from '@/types/sections';

export interface AnalyzeRequest {
  ticker: string;
  analysts: AnalystType[];
  config: AnalysisConfig;
}

export interface AnalyzeResponse {
  success: boolean;
  results?: AnalysisResults;
  error?: string;
}

export interface AnalysisError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Run a stock analysis using the TradingAgents backend
 * @param request Analysis configuration
 * @param useCache Whether to use cached results (default: true)
 * @returns Analysis results or error
 */
export async function runAnalysis(request: AnalyzeRequest, useCache: boolean = true): Promise<AnalyzeResponse> {
  try {
    // Check cache first if enabled
    if (useCache) {
      const cached = getCachedAnalysisResults(request.ticker);
      if (cached) {
        console.log(`Using cached analysis results for ${request.ticker}`);
        return {
          success: true,
          results: cached,
        };
      }
    }

    const response = await fetch('/api/analyze', {
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
      cacheAnalysisResults(request.ticker, data.results);
    }

    return data;
  } catch (error) {
    console.error('Analysis API error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error: Unable to connect to the analysis service. Please check your connection.',
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
 * Validate analysis configuration
 * @param config Analysis configuration
 * @returns Validation result with error message if invalid
 */
export function validateAnalysisConfig(config: AnalysisConfig): { valid: boolean; error?: string } {
  if (config.maxDebateRounds < 1 || config.maxDebateRounds > 10) {
    return {
      valid: false,
      error: 'Debate rounds must be between 1 and 10',
    };
  }

  const validModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-4', 'claude-3-sonnet', 'claude-3-opus'];
  if (!validModels.includes(config.deepThinkModel)) {
    return {
      valid: false,
      error: `Invalid deep think model: ${config.deepThinkModel}`,
    };
  }

  if (!validModels.includes(config.quickThinkModel)) {
    return {
      valid: false,
      error: `Invalid quick think model: ${config.quickThinkModel}`,
    };
  }

  return { valid: true };
}

/**
 * Validate analysis request
 * @param request Analysis request
 * @returns Validation result with error message if invalid
 */
export function validateAnalysisRequest(request: AnalyzeRequest): { valid: boolean; error?: string } {
  if (!request.ticker || !validateTicker(request.ticker)) {
    return {
      valid: false,
      error: 'Invalid ticker symbol. Must be 1-5 uppercase letters (e.g., AAPL, MSFT)',
    };
  }

  if (!request.analysts || request.analysts.length === 0) {
    return {
      valid: false,
      error: 'At least one analyst must be selected',
    };
  }

  const validAnalysts: AnalystType[] = ['market', 'fundamentals', 'news', 'social'];
  const invalidAnalysts = request.analysts.filter(a => !validAnalysts.includes(a));
  if (invalidAnalysts.length > 0) {
    return {
      valid: false,
      error: `Invalid analysts: ${invalidAnalysts.join(', ')}`,
    };
  }

  const configValidation = validateAnalysisConfig(request.config);
  if (!configValidation.valid) {
    return configValidation;
  }

  return { valid: true };
}

/**
 * Estimate analysis cost based on configuration
 * @param request Analysis request
 * @returns Estimated cost in USD
 */
export function estimateAnalysisCost(request: AnalyzeRequest): number {
  const { analysts, config } = request;
  
  // Base cost per analyst (rough estimate)
  const baseCostPerAnalyst = 0.05;
  
  // Cost multiplier based on model
  const modelMultipliers: Record<string, number> = {
    'gpt-4o-mini': 1,
    'gpt-4o': 3,
    'gpt-4-turbo': 5,
    'gpt-4': 5,
    'claude-3-sonnet': 3,
    'claude-3-opus': 8,
  };
  
  const modelMultiplier = modelMultipliers[config.deepThinkModel] || 1;
  
  // Cost increases with debate rounds
  const debateMultiplier = 1 + (config.maxDebateRounds - 1) * 0.5;
  
  const totalCost = analysts.length * baseCostPerAnalyst * modelMultiplier * debateMultiplier;
  
  return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
}

/**
 * Format analysis results for display
 * @param results Raw analysis results
 * @returns Formatted results
 */
export function formatAnalysisResults(results: AnalysisResults): AnalysisResults {
  return {
    ...results,
    timestamp: new Date(results.timestamp),
    confidence: Math.round(results.confidence * 100) / 100,
  };
}

/**
 * Cache analysis results in localStorage
 * @param ticker Stock ticker
 * @param results Analysis results
 */
export function cacheAnalysisResults(ticker: string, results: AnalysisResults): void {
  try {
    const cache = JSON.parse(localStorage.getItem('analysis_cache') || '{}');
    cache[ticker] = {
      results,
      timestamp: Date.now(),
    };
    localStorage.setItem('analysis_cache', JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to cache analysis results:', error);
  }
}

/**
 * Get cached analysis results
 * @param ticker Stock ticker
 * @param maxAge Maximum age in milliseconds (default: 5 minutes)
 * @returns Cached results or null if not found or expired
 */
export function getCachedAnalysisResults(ticker: string, maxAge: number = 5 * 60 * 1000): AnalysisResults | null {
  try {
    const cache = JSON.parse(localStorage.getItem('analysis_cache') || '{}');
    const cached = cache[ticker];
    
    if (!cached) {
      return null;
    }
    
    const age = Date.now() - cached.timestamp;
    if (age > maxAge) {
      return null;
    }
    
    return cached.results;
  } catch (error) {
    console.error('Failed to get cached analysis results:', error);
    return null;
  }
}

/**
 * Clear analysis cache
 */
export function clearAnalysisCache(): void {
  try {
    localStorage.removeItem('analysis_cache');
  } catch (error) {
    console.error('Failed to clear analysis cache:', error);
  }
}

/**
 * Invalidate cache for a specific ticker
 * @param ticker Stock ticker to invalidate
 */
export function invalidateAnalysisCache(ticker: string): void {
  try {
    const cache = JSON.parse(localStorage.getItem('analysis_cache') || '{}');
    delete cache[ticker];
    localStorage.setItem('analysis_cache', JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to invalidate analysis cache:', error);
  }
}

/**
 * Clean up expired cache entries
 * @param maxAge Maximum age in milliseconds (default: 5 minutes)
 */
export function cleanupAnalysisCache(maxAge: number = 5 * 60 * 1000): void {
  try {
    const cache = JSON.parse(localStorage.getItem('analysis_cache') || '{}');
    const now = Date.now();
    let cleaned = false;
    
    for (const ticker in cache) {
      const age = now - cache[ticker].timestamp;
      if (age > maxAge) {
        delete cache[ticker];
        cleaned = true;
      }
    }
    
    if (cleaned) {
      localStorage.setItem('analysis_cache', JSON.stringify(cache));
      console.log('Cleaned up expired analysis cache entries');
    }
  } catch (error) {
    console.error('Failed to cleanup analysis cache:', error);
  }
}
