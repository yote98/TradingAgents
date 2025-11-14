/**
 * Section Data Models
 * 
 * TypeScript interfaces for data used in dashboard sections
 */

// ============================================================================
// Home Section Types
// ============================================================================

/**
 * Activity item for recent activity feed
 */
export interface Activity {
  /** Unique identifier */
  id: string;
  
  /** Type of activity */
  type: 'analysis' | 'coach_plan' | 'sentiment';
  
  /** Activity title */
  title: string;
  
  /** When the activity occurred */
  timestamp: Date;
  
  /** Brief summary of the activity */
  summary: string;
}

/**
 * Quick statistics for dashboard overview
 */
export interface QuickStats {
  /** Total number of analyses run */
  totalAnalyses: number;
  
  /** Average win rate percentage */
  avgWinRate: number;
  
  /** Recent return percentage */
  recentReturn: number;
  
  /** Number of active coaches */
  activeCoaches: number;
}

// ============================================================================
// Analyze Section Types
// ============================================================================

/**
 * Available analyst types
 */
export type AnalystType = 'market' | 'fundamentals' | 'news' | 'social';

/**
 * Analysis configuration
 */
export interface AnalysisConfig {
  /** Maximum number of debate rounds */
  maxDebateRounds: number;
  
  /** Model for deep thinking tasks */
  deepThinkModel: string;
  
  /** Model for quick thinking tasks */
  quickThinkModel: string;
}

/**
 * Analysis results from TradingAgents
 */
export interface AnalysisResults {
  /** Stock ticker analyzed */
  ticker: string;
  
  /** When the analysis was run */
  timestamp: Date;
  
  /** Reports from each analyst */
  analystReports: Record<AnalystType, string>;
  
  /** Bullish arguments from debate */
  bullArguments: string[];
  
  /** Bearish arguments from debate */
  bearArguments: string[];
  
  /** Final trading decision */
  finalDecision: 'BUY' | 'SELL' | 'HOLD';
  
  /** Confidence score (0-1) */
  confidence: number;
  
  /** Reasoning for the decision */
  reasoning: string;
}

// ============================================================================
// Backtest Section Types
// ============================================================================

/**
 * Backtest configuration
 */
export interface BacktestConfig {
  /** Initial account balance */
  initialBalance: number;
  
  /** Commission rate (e.g., 0.001 = 0.1%) */
  commissionRate: number;
  
  /** Slippage (e.g., 0.001 = 0.1%) */
  slippage: number;
  
  /** Risk per trade percentage */
  riskPerTradePct: number;
  
  /** Maximum position size percentage */
  maxPositionSizePct: number;
}

/**
 * Backtest results
 */
export interface BacktestResults {
  /** Stock ticker backtested */
  ticker: string;
  
  /** Time period for backtest */
  period: {
    start: Date;
    end: Date;
  };
  
  /** Total return percentage */
  totalReturn: number;
  
  /** Win rate percentage */
  winRate: number;
  
  /** Sharpe ratio */
  sharpeRatio: number;
  
  /** Maximum drawdown percentage */
  maxDrawdown: number;
  
  /** List of all trades */
  trades: Trade[];
  
  /** Equity curve data points */
  equityCurve: DataPoint[];
}

/**
 * Individual trade in backtest
 */
export interface Trade {
  /** Trade date */
  date: Date;
  
  /** Buy or sell action */
  action: 'BUY' | 'SELL';
  
  /** Price at execution */
  price: number;
  
  /** Number of shares */
  quantity: number;
  
  /** Profit/loss for this trade */
  pnl: number;
}

/**
 * Data point for charts
 */
export interface DataPoint {
  /** Date of data point */
  date: Date;
  
  /** Value at this point */
  value: number;
}

// ============================================================================
// Risk Section Types
// ============================================================================

/**
 * Portfolio position
 */
export interface Position {
  /** Stock ticker */
  ticker: string;
  
  /** Number of shares held */
  shares: number;
  
  /** Entry price per share */
  entryPrice: number;
  
  /** Current price per share */
  currentPrice: number;
}

/**
 * Risk calculations for portfolio
 */
export interface RiskCalculations {
  /** Overall portfolio risk percentage */
  portfolioRisk: number;
  
  /** Recommended position sizes by ticker */
  positionSizes: Record<string, number>;
  
  /** Stop-loss levels by ticker */
  stopLosses: Record<string, number>;
  
  /** Risk/reward ratios by ticker */
  riskRewardRatios: Record<string, number>;
  
  /** Total portfolio exposure */
  totalExposure: number;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Request to run analysis
 */
export interface AnalyzeRequest {
  /** Stock ticker to analyze */
  ticker: string;
  
  /** Analysts to use */
  analysts: AnalystType[];
  
  /** Analysis configuration */
  config: AnalysisConfig;
}

/**
 * Response from analysis API
 */
export interface AnalyzeResponse {
  /** Whether the analysis succeeded */
  success: boolean;
  
  /** Analysis results if successful */
  results?: AnalysisResults;
  
  /** Error message if failed */
  error?: string;
}

/**
 * Request to run backtest
 */
export interface BacktestRequest {
  /** Stock ticker to backtest */
  ticker: string;
  
  /** Start date (ISO string) */
  startDate: string;
  
  /** End date (ISO string) */
  endDate: string;
  
  /** Strategy to use */
  strategy: string;
}

/**
 * Response from backtest API
 */
export interface BacktestResponse {
  /** Whether the backtest succeeded */
  success: boolean;
  
  /** Backtest results if successful */
  results?: BacktestResults;
  
  /** Error message if failed */
  error?: string;
}

// ============================================================================
// Cache Types
// ============================================================================

/**
 * Cached analysis result
 */
export interface CachedAnalysis {
  /** Analysis results */
  results: AnalysisResults;
  
  /** When it was cached */
  timestamp: number;
}

/**
 * Analysis cache structure
 */
export interface AnalysisCache {
  /** Cached results by ticker */
  [ticker: string]: CachedAnalysis;
}
