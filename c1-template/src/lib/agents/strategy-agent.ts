/**
 * 🎯 Trading Strategist Agent
 * Expert in synthesizing analysis and creating actionable trading plans
 */

import { MarketAnalysis } from './market-agent';
import { FundamentalAnalysis } from './fundamental-agent';
import { NewsAnalysis } from './news-agent';
import { Quote } from '../data/marketdata-client';

export interface TradingStrategy {
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entry: number;
  target: number;
  stopLoss: number;
  riskReward: number;
  positionSize: {
    conservative: string;
    moderate: string;
    aggressive: string;
  };
  timeframe: string;
  reasoning: string;
  keyPoints: string[];
}

import { DebateResult } from './debate-agent';
import { RiskAssessment } from './risk-agent';
import { OptionsAnalysisResult } from './options-agent';

export interface ComprehensiveAnalysis {
  quote: Quote;
  market: MarketAnalysis;
  fundamental: FundamentalAnalysis;
  news: NewsAnalysis;
  options?: OptionsAnalysisResult | null;
  debate?: DebateResult;
  strategy: TradingStrategy;
  riskAssessment?: RiskAssessment;
}

export function synthesizeStrategy(
  quote: Quote,
  market: MarketAnalysis,
  fundamental: FundamentalAnalysis,
  news: NewsAnalysis
): TradingStrategy {
  // Combine all signals to make a recommendation
  const signals = {
    market: market.signal === 'bullish' ? 1 : market.signal === 'bearish' ? -1 : 0,
    fundamental: fundamental.signal === 'undervalued' ? 1 : fundamental.signal === 'overvalued' ? -1 : 0,
    news: news.sentiment === 'positive' ? 1 : news.sentiment === 'negative' ? -1 : 0,
  };

  const totalSignal = signals.market + signals.fundamental + signals.news;
  const avgConfidence = (market.confidence + fundamental.confidence + news.confidence) / 3;

  // Determine recommendation
  let recommendation: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let confidence = avgConfidence;

  if (totalSignal >= 2) {
    recommendation = 'BUY';
    confidence = Math.min(avgConfidence + 10, 95);
  } else if (totalSignal <= -2) {
    recommendation = 'SELL';
    confidence = Math.min(avgConfidence + 10, 95);
  }

  // Calculate entry, target, and stop loss
  const currentPrice = quote.price;
  let entry = currentPrice;
  let target = currentPrice;
  let stopLoss = currentPrice;

  if (recommendation === 'BUY') {
    entry = currentPrice;
    target = market.keyLevels.resistance[0] || currentPrice * 1.10;
    stopLoss = market.keyLevels.support[0] || currentPrice * 0.95;
  } else if (recommendation === 'SELL') {
    entry = currentPrice;
    target = market.keyLevels.support[0] || currentPrice * 0.90;
    stopLoss = market.keyLevels.resistance[0] || currentPrice * 1.05;
  } else {
    // HOLD
    target = currentPrice * 1.05;
    stopLoss = currentPrice * 0.95;
  }

  const riskReward = Math.abs((target - entry) / (entry - stopLoss));

  // Calculate position sizing
  const positionSize = {
    conservative: '1-2% of portfolio',
    moderate: '3-5% of portfolio',
    aggressive: '5-10% of portfolio',
  };

  // Build reasoning
  const keyPoints: string[] = [];
  
  if (market.signal === 'bullish') {
    keyPoints.push(`Technical setup is ${market.signal} with ${market.confidence}% confidence`);
  }
  
  if (fundamental.signal !== 'fair') {
    keyPoints.push(`Stock appears ${fundamental.signal} based on fundamentals`);
  }
  
  if (news.sentiment !== 'neutral') {
    keyPoints.push(`News sentiment is ${news.sentiment} (${news.sentimentScore}/100)`);
  }

  const reasoning = `Based on comprehensive analysis across technical, fundamental, and sentiment factors, ${recommendation} recommendation with ${Math.round(confidence)}% confidence.`;

  return {
    recommendation,
    confidence: Math.round(confidence),
    entry: Math.round(entry * 100) / 100,
    target: Math.round(target * 100) / 100,
    stopLoss: Math.round(stopLoss * 100) / 100,
    riskReward: Math.round(riskReward * 10) / 10,
    positionSize,
    timeframe: recommendation === 'BUY' ? '2-4 weeks' : recommendation === 'SELL' ? '1-2 weeks' : 'Monitor',
    reasoning,
    keyPoints,
  };
}

export const STRATEGY_AGENT_PROMPT = `You are an elite Trading Strategist who synthesizes multiple perspectives into actionable trading plans.

Your expertise:
- Combining technical, fundamental, and sentiment analysis
- Risk management and position sizing
- Entry and exit timing
- Portfolio construction and diversification
- Adapting strategies to market conditions

Your analysis style:
- Synthesize all available information
- Provide clear, actionable recommendations
- Always include risk management
- Consider multiple timeframes
- Explain your reasoning clearly

Format your response with:
🎯 Recommendation (BUY/SELL/HOLD)
💡 Key Reasoning
📊 Trading Plan (Entry, Target, Stop)
⚖️ Risk Management
💰 Position Sizing
`;
