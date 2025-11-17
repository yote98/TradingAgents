/**
 * 📊 Market Technician Agent
 * Expert in technical analysis, price action, and momentum
 */

import { getMarketDataClient, Quote } from '../data/marketdata-client';

export interface MarketAnalysis {
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  keyLevels: {
    resistance: number[];
    support: number[];
  };
  momentum: string;
  technicalIndicators: {
    rsi?: number;
    trend: 'uptrend' | 'downtrend' | 'sideways';
  };
  summary: string;
}

export async function analyzeMarket(ticker: string): Promise<MarketAnalysis> {
  const client = getMarketDataClient();
  
  // Get current quote and historical data
  const [quote, historical] = await Promise.all([
    client.getQuote(ticker),
    client.getHistoricalData(ticker, 30)
  ]);

  // Calculate technical indicators
  const analysis = calculateTechnicalAnalysis(quote, historical);

  return analysis;
}

function calculateTechnicalAnalysis(quote: Quote, historical: any): MarketAnalysis {
  // Simple technical analysis logic
  const changePercent = quote.changePercent;
  const priceRange = quote.high - quote.low;
  const pricePosition = (quote.price - quote.low) / priceRange;

  // Determine signal
  let signal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  let confidence = 50;

  if (changePercent > 2 && pricePosition > 0.7) {
    signal = 'bullish';
    confidence = 75;
  } else if (changePercent < -2 && pricePosition < 0.3) {
    signal = 'bearish';
    confidence = 75;
  }

  // Calculate support and resistance
  const resistance = [
    quote.high,
    quote.high * 1.05,
    quote.high * 1.10
  ];

  const support = [
    quote.low,
    quote.low * 0.95,
    quote.low * 0.90
  ];

  // Determine trend
  let trend: 'uptrend' | 'downtrend' | 'sideways' = 'sideways';
  if (changePercent > 1) trend = 'uptrend';
  if (changePercent < -1) trend = 'downtrend';

  return {
    signal,
    confidence,
    keyLevels: {
      resistance: resistance.map(r => Math.round(r * 100) / 100),
      support: support.map(s => Math.round(s * 100) / 100)
    },
    momentum: changePercent > 0 ? 'Strong buying pressure' : 'Selling pressure evident',
    technicalIndicators: {
      trend
    },
    summary: `${signal.toUpperCase()} signal with ${confidence}% confidence. Price is ${trend === 'uptrend' ? 'trending up' : trend === 'downtrend' ? 'trending down' : 'consolidating'}.`
  };
}

export const MARKET_AGENT_PROMPT = `You are an elite Market Technician with 20 years of experience analyzing price action and technical patterns.

Your expertise:
- Reading candlestick patterns and chart formations
- Identifying support and resistance levels
- Analyzing volume and momentum
- Spotting trend reversals and continuations
- Using technical indicators (RSI, MACD, Bollinger Bands)

Your analysis style:
- Data-driven and objective
- Focus on what the price is telling you
- Identify key levels traders are watching
- Explain momentum and volume patterns
- Provide clear entry/exit zones

Format your response with:
📊 Current Price Action
📈 Technical Setup
🎯 Key Levels
⚡ Momentum Analysis
`;
