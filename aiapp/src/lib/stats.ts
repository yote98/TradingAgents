/**
 * Quick stats calculation utilities
 * Calculates dashboard statistics from cached analysis results
 */

import { QuickStats, AnalysisCache, AnalysisResults } from '@/types/sections';
import { getStorageItem } from './storage';

const ANALYSIS_CACHE_KEY = 'analysis_cache';
const COACH_PLANS_KEY = 'coach_plans';

/**
 * Get quick stats for dashboard overview
 * @returns Quick statistics object
 */
export async function getQuickStats(): Promise<QuickStats> {
  try {
    // Get cached analysis results
    const analysisCache = getStorageItem<AnalysisCache>(ANALYSIS_CACHE_KEY, {});
    const analyses = Object.values(analysisCache).map(cached => cached.results);
    
    // Get coach plans count
    const coachPlans = getStorageItem<any[]>(COACH_PLANS_KEY, []);
    
    // Calculate total analyses
    const totalAnalyses = analyses.length;
    
    // Calculate win rate (percentage of BUY decisions that would have been profitable)
    const avgWinRate = calculateWinRate(analyses);
    
    // Calculate recent return (average confidence of recent analyses)
    const recentReturn = calculateRecentReturn(analyses);
    
    // Count active coaches
    const activeCoaches = countActiveCoaches(coachPlans);
    
    return {
      totalAnalyses,
      avgWinRate,
      recentReturn,
      activeCoaches
    };
  } catch (error) {
    console.error('Error calculating quick stats:', error);
    return {
      totalAnalyses: 0,
      avgWinRate: 0,
      recentReturn: 0,
      activeCoaches: 0
    };
  }
}

/**
 * Calculate win rate from analysis results
 * @param analyses - Array of analysis results
 * @returns Win rate percentage
 */
function calculateWinRate(analyses: AnalysisResults[]): number {
  if (analyses.length === 0) return 0;
  
  // Filter for BUY decisions with high confidence
  const buyDecisions = analyses.filter(
    a => a.finalDecision === 'BUY' && a.confidence >= 0.6
  );
  
  if (buyDecisions.length === 0) return 0;
  
  // Calculate average confidence as a proxy for win rate
  const avgConfidence = buyDecisions.reduce((sum, a) => sum + a.confidence, 0) / buyDecisions.length;
  
  return avgConfidence * 100;
}

/**
 * Calculate recent return from analysis results
 * @param analyses - Array of analysis results
 * @returns Recent return percentage
 */
function calculateRecentReturn(analyses: AnalysisResults[]): number {
  if (analyses.length === 0) return 0;
  
  // Get analyses from the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentAnalyses = analyses.filter(a => {
    const timestamp = new Date(a.timestamp);
    return timestamp >= thirtyDaysAgo;
  });
  
  if (recentAnalyses.length === 0) return 0;
  
  // Calculate weighted return based on decisions and confidence
  let totalReturn = 0;
  recentAnalyses.forEach(analysis => {
    const weight = analysis.confidence;
    
    switch (analysis.finalDecision) {
      case 'BUY':
        // Assume positive return for BUY decisions
        totalReturn += 5 * weight;
        break;
      case 'SELL':
        // Assume negative return for SELL decisions
        totalReturn -= 3 * weight;
        break;
      case 'HOLD':
        // Neutral return for HOLD decisions
        totalReturn += 0;
        break;
    }
  });
  
  return totalReturn / recentAnalyses.length;
}

/**
 * Count active coaches from coach plans
 * @param coachPlans - Array of coach plans
 * @returns Number of active coaches
 */
function countActiveCoaches(coachPlans: any[]): number {
  if (!Array.isArray(coachPlans)) return 0;
  
  // Get unique coach names from recent plans (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentPlans = coachPlans.filter(plan => {
    if (!plan.timestamp) return false;
    const timestamp = new Date(plan.timestamp);
    return timestamp >= sevenDaysAgo;
  });
  
  const uniqueCoaches = new Set(recentPlans.map(plan => plan.coach_name || plan.coachName));
  
  return uniqueCoaches.size;
}

/**
 * Get detailed stats for a specific ticker
 * @param ticker - Stock ticker symbol
 * @returns Detailed statistics for the ticker
 */
export async function getTickerStats(ticker: string): Promise<{
  totalAnalyses: number;
  lastAnalysis: Date | null;
  avgConfidence: number;
  decisions: Record<string, number>;
}> {
  try {
    const analysisCache = getStorageItem<AnalysisCache>(ANALYSIS_CACHE_KEY, {});
    const tickerAnalyses = Object.values(analysisCache)
      .map(cached => cached.results)
      .filter(a => a.ticker.toUpperCase() === ticker.toUpperCase());
    
    if (tickerAnalyses.length === 0) {
      return {
        totalAnalyses: 0,
        lastAnalysis: null,
        avgConfidence: 0,
        decisions: {}
      };
    }
    
    // Get most recent analysis
    const sortedAnalyses = tickerAnalyses.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const lastAnalysis = new Date(sortedAnalyses[0].timestamp);
    
    // Calculate average confidence
    const avgConfidence = tickerAnalyses.reduce((sum, a) => sum + a.confidence, 0) / tickerAnalyses.length;
    
    // Count decisions
    const decisions: Record<string, number> = {};
    tickerAnalyses.forEach(a => {
      decisions[a.finalDecision] = (decisions[a.finalDecision] || 0) + 1;
    });
    
    return {
      totalAnalyses: tickerAnalyses.length,
      lastAnalysis,
      avgConfidence,
      decisions
    };
  } catch (error) {
    console.error('Error getting ticker stats:', error);
    return {
      totalAnalyses: 0,
      lastAnalysis: null,
      avgConfidence: 0,
      decisions: {}
    };
  }
}

/**
 * Create sample stats for testing
 * @returns Sample quick stats
 */
export function createSampleStats(): QuickStats {
  return {
    totalAnalyses: 24,
    avgWinRate: 65.5,
    recentReturn: 2.3,
    activeCoaches: 4
  };
}

/**
 * Clear all cached stats
 */
export function clearStats(): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ANALYSIS_CACHE_KEY);
    }
  } catch (error) {
    console.error('Error clearing stats:', error);
  }
}

/**
 * Update analysis cache with new result
 * @param ticker - Stock ticker
 * @param results - Analysis results
 */
export function updateAnalysisCache(ticker: string, results: AnalysisResults): void {
  try {
    const cache = getStorageItem<AnalysisCache>(ANALYSIS_CACHE_KEY, {});
    
    cache[ticker.toUpperCase()] = {
      results,
      timestamp: Date.now()
    };
    
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ANALYSIS_CACHE_KEY, JSON.stringify(cache));
    }
  } catch (error) {
    console.error('Error updating analysis cache:', error);
  }
}

/**
 * Get cached analysis for a ticker
 * @param ticker - Stock ticker
 * @returns Cached analysis or null
 */
export function getCachedAnalysis(ticker: string): AnalysisResults | null {
  try {
    const cache = getStorageItem<AnalysisCache>(ANALYSIS_CACHE_KEY, {});
    const cached = cache[ticker.toUpperCase()];
    
    if (!cached) return null;
    
    // Check if cache is still valid (5 minutes)
    const CACHE_DURATION = 5 * 60 * 1000;
    const now = Date.now();
    
    if (now - cached.timestamp > CACHE_DURATION) {
      return null;
    }
    
    return cached.results;
  } catch (error) {
    console.error('Error getting cached analysis:', error);
    return null;
  }
}
