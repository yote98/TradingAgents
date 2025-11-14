/**
 * Risk Management Calculation Utilities
 * 
 * Client-side calculations for position sizing, stop-loss levels,
 * and risk/reward ratios. No API calls required.
 */

export interface PositionSizeParams {
  portfolioValue: number;
  riskPerTrade: number; // percentage (e.g., 2 for 2%)
  stopLossPercent: number; // percentage (e.g., 5 for 5%)
}

export interface StopLossParams {
  entryPrice: number;
  riskPercent: number; // percentage (e.g., 5 for 5%)
}

export interface RiskRewardParams {
  entryPrice: number;
  stopLoss: number;
  target: number;
}

export interface KellyCriterionParams {
  winRate: number; // decimal (e.g., 0.6 for 60%)
  avgWin: number; // average win amount
  avgLoss: number; // average loss amount
}

export interface PortfolioRiskParams {
  positions: Array<{
    ticker: string;
    shares: number;
    entryPrice: number;
    currentPrice: number;
    stopLoss: number;
  }>;
  portfolioValue: number;
}

/**
 * Calculate position size based on fixed percentage risk
 * Formula: (Portfolio Value × Risk %) / Stop Loss %
 */
export function calculatePositionSize(params: PositionSizeParams): number {
  const { portfolioValue, riskPerTrade, stopLossPercent } = params;
  
  if (portfolioValue <= 0 || riskPerTrade <= 0 || stopLossPercent <= 0) {
    return 0;
  }
  
  const riskAmount = portfolioValue * (riskPerTrade / 100);
  const positionSize = riskAmount / (stopLossPercent / 100);
  
  return Math.floor(positionSize); // Round down to whole dollars
}

/**
 * Calculate number of shares based on position size and entry price
 */
export function calculateShares(positionSize: number, entryPrice: number): number {
  if (entryPrice <= 0) return 0;
  return Math.floor(positionSize / entryPrice);
}

/**
 * Calculate stop-loss price level
 * Formula: Entry Price × (1 - Risk %)
 */
export function calculateStopLoss(params: StopLossParams): number {
  const { entryPrice, riskPercent } = params;
  
  if (entryPrice <= 0 || riskPercent < 0) {
    return 0;
  }
  
  return entryPrice * (1 - riskPercent / 100);
}

/**
 * Calculate risk/reward ratio
 * Formula: (Target - Entry) / (Entry - Stop Loss)
 */
export function calculateRiskReward(params: RiskRewardParams): number {
  const { entryPrice, stopLoss, target } = params;
  
  const risk = entryPrice - stopLoss;
  const reward = target - entryPrice;
  
  if (risk <= 0) return 0;
  
  return reward / risk;
}

/**
 * Calculate optimal position size using Kelly Criterion
 * Formula: (Win Rate × Avg Win - Loss Rate × Avg Loss) / Avg Win
 * Returns percentage of portfolio to risk (0-1)
 */
export function calculateKellyCriterion(params: KellyCriterionParams): number {
  const { winRate, avgWin, avgLoss } = params;
  
  if (winRate < 0 || winRate > 1 || avgWin <= 0 || avgLoss <= 0) {
    return 0;
  }
  
  const lossRate = 1 - winRate;
  const kelly = (winRate * avgWin - lossRate * avgLoss) / avgWin;
  
  // Cap at 25% for safety (full Kelly can be aggressive)
  return Math.max(0, Math.min(kelly, 0.25));
}

/**
 * Calculate portfolio-level risk metrics
 */
export function calculatePortfolioRisk(params: PortfolioRiskParams): {
  totalRisk: number;
  totalRiskPercent: number;
  positionRisks: Array<{
    ticker: string;
    riskAmount: number;
    riskPercent: number;
  }>;
  totalExposure: number;
  totalExposurePercent: number;
} {
  const { positions, portfolioValue } = params;
  
  if (portfolioValue <= 0) {
    return {
      totalRisk: 0,
      totalRiskPercent: 0,
      positionRisks: [],
      totalExposure: 0,
      totalExposurePercent: 0,
    };
  }
  
  let totalRisk = 0;
  let totalExposure = 0;
  const positionRisks = positions.map(pos => {
    const positionValue = pos.shares * pos.currentPrice;
    const riskPerShare = pos.currentPrice - pos.stopLoss;
    const riskAmount = pos.shares * riskPerShare;
    
    totalRisk += riskAmount;
    totalExposure += positionValue;
    
    return {
      ticker: pos.ticker,
      riskAmount,
      riskPercent: (riskAmount / portfolioValue) * 100,
    };
  });
  
  return {
    totalRisk,
    totalRiskPercent: (totalRisk / portfolioValue) * 100,
    positionRisks,
    totalExposure,
    totalExposurePercent: (totalExposure / portfolioValue) * 100,
  };
}

/**
 * Calculate maximum position size to maintain portfolio risk limit
 */
export function calculateMaxPositionSize(
  portfolioValue: number,
  maxPortfolioRisk: number, // percentage
  currentRisk: number, // dollar amount
  stopLossPercent: number
): number {
  if (portfolioValue <= 0 || stopLossPercent <= 0) return 0;
  
  const maxRiskAmount = portfolioValue * (maxPortfolioRisk / 100);
  const availableRisk = maxRiskAmount - currentRisk;
  
  if (availableRisk <= 0) return 0;
  
  return availableRisk / (stopLossPercent / 100);
}

/**
 * Format currency values
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage values
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format ratio values
 */
export function formatRatio(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}:1`;
}
