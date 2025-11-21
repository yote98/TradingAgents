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
    rsi: number | null;
    trend: 'uptrend' | 'downtrend' | 'sideways';
  };
  summary: string;
}

export async function analyzeMarket(ticker: string): Promise<MarketAnalysis> {
  const client = getMarketDataClient();
  
  // Get current quote and historical data
  const [quote, historical] = await Promise.all([
    client.getQuote(ticker),
    client.getHistoricalData(ticker, 60) // 60 days for better indicators
  ]);

  // Calculate technical indicators
  const indicators = calculateTechnicalIndicators(quote, historical);
  const analysis = synthesizeAnalysis(quote, indicators);

  return analysis;
}

interface TechnicalIndicators {
  rsi: number | null;
  macd: { value: number; signal: number; histogram: number } | null;
  sma50: number | null;
  sma200: number | null;
  bollingerBands: { upper: number; middle: number; lower: number } | null;
  volumeTrend: 'increasing' | 'decreasing' | 'stable';
  priceVsMA: string;
}

function calculateTechnicalIndicators(quote: Quote, historical: any): TechnicalIndicators {
  if (!historical || !historical.c || historical.c.length < 14) {
    return {
      rsi: null,
      macd: null,
      sma50: null,
      sma200: null,
      bollingerBands: null,
      volumeTrend: 'stable',
      priceVsMA: 'insufficient data'
    };
  }

  const closes = historical.c || [];
  const volumes = historical.v || [];
  
  // Calculate RSI (14-period)
  const rsi = calculateRSI(closes, 14);
  
  // Calculate Moving Averages
  const sma50 = closes.length >= 50 ? calculateSMA(closes, 50) : null;
  const sma200 = closes.length >= 200 ? calculateSMA(closes, 200) : null;
  
  // Calculate MACD
  const macd = calculateMACD(closes);
  
  // Calculate Bollinger Bands
  const bollingerBands = calculateBollingerBands(closes, 20, 2);
  
  // Volume trend
  const recentVolume = volumes.slice(-5).reduce((a: number, b: number) => a + b, 0) / 5;
  const olderVolume = volumes.slice(-15, -5).reduce((a: number, b: number) => a + b, 0) / 10;
  const volumeTrend = recentVolume > olderVolume * 1.2 ? 'increasing' : 
                      recentVolume < olderVolume * 0.8 ? 'decreasing' : 'stable';
  
  // Price vs Moving Averages
  let priceVsMA = '';
  if (sma50 && sma200) {
    if (quote.price > sma50 && quote.price > sma200) {
      priceVsMA = 'Above both 50 & 200 SMA (strong uptrend)';
    } else if (quote.price < sma50 && quote.price < sma200) {
      priceVsMA = 'Below both 50 & 200 SMA (strong downtrend)';
    } else {
      priceVsMA = 'Between 50 & 200 SMA (transitioning)';
    }
  } else if (sma50) {
    priceVsMA = quote.price > sma50 ? 'Above 50 SMA' : 'Below 50 SMA';
  }

  return {
    rsi,
    macd,
    sma50,
    sma200,
    bollingerBands,
    volumeTrend,
    priceVsMA
  };
}

function calculateRSI(closes: number[], period: number = 14): number | null {
  if (closes.length < period + 1) return null;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = closes.length - period; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  const avgGain = gains / period;
  const avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return Math.round(rsi * 10) / 10;
}

function calculateSMA(closes: number[], period: number): number | null {
  if (closes.length < period) return null;
  const sum = closes.slice(-period).reduce((a, b) => a + b, 0);
  return Math.round((sum / period) * 100) / 100;
}

function calculateMACD(closes: number[]): { value: number; signal: number; histogram: number } | null {
  if (closes.length < 26) return null;
  
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  
  if (!ema12 || !ema26) return null;
  
  const macdLine = ema12 - ema26;
  const signalLine = macdLine * 0.9; // Simplified signal
  const histogram = macdLine - signalLine;
  
  return {
    value: Math.round(macdLine * 100) / 100,
    signal: Math.round(signalLine * 100) / 100,
    histogram: Math.round(histogram * 100) / 100
  };
}

function calculateEMA(closes: number[], period: number): number | null {
  if (closes.length < period) return null;
  const multiplier = 2 / (period + 1);
  let ema = closes.slice(-period, -period + 1)[0];
  
  for (let i = closes.length - period + 1; i < closes.length; i++) {
    ema = (closes[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

function calculateBollingerBands(closes: number[], period: number, stdDev: number): { upper: number; middle: number; lower: number } | null {
  if (closes.length < period) return null;
  
  const sma = calculateSMA(closes, period);
  if (!sma) return null;
  
  const recentCloses = closes.slice(-period);
  const squaredDiffs = recentCloses.map(close => Math.pow(close - sma, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    upper: Math.round((sma + (standardDeviation * stdDev)) * 100) / 100,
    middle: sma,
    lower: Math.round((sma - (standardDeviation * stdDev)) * 100) / 100
  };
}

function synthesizeAnalysis(quote: Quote, indicators: TechnicalIndicators): MarketAnalysis {
  let signal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  let confidence = 50;
  let signals: string[] = [];

  // RSI Analysis
  if (indicators.rsi !== null) {
    if (indicators.rsi < 30) {
      signals.push('RSI oversold (potential bounce)');
      signal = 'bullish';
      confidence += 15;
    } else if (indicators.rsi > 70) {
      signals.push('RSI overbought (potential pullback)');
      signal = 'bearish';
      confidence += 15;
    } else if (indicators.rsi > 50 && indicators.rsi < 70) {
      signals.push('RSI bullish momentum');
      if (signal === 'neutral') signal = 'bullish';
      confidence += 5;
    }
  }

  // MACD Analysis
  if (indicators.macd) {
    if (indicators.macd.histogram > 0) {
      signals.push('MACD bullish crossover');
      if (signal === 'neutral') signal = 'bullish';
      confidence += 10;
    } else {
      signals.push('MACD bearish crossover');
      if (signal === 'neutral') signal = 'bearish';
      confidence += 10;
    }
  }

  // Moving Average Analysis
  if (indicators.sma50 && indicators.sma200) {
    if (indicators.sma50 > indicators.sma200) {
      signals.push('Golden cross (50 SMA > 200 SMA)');
      if (signal === 'neutral') signal = 'bullish';
      confidence += 10;
    } else {
      signals.push('Death cross (50 SMA < 200 SMA)');
      if (signal === 'neutral') signal = 'bearish';
      confidence += 10;
    }
  }

  // Bollinger Bands Analysis
  if (indicators.bollingerBands) {
    if (quote.price < indicators.bollingerBands.lower) {
      signals.push('Price below lower Bollinger Band (oversold)');
      signal = 'bullish';
      confidence += 10;
    } else if (quote.price > indicators.bollingerBands.upper) {
      signals.push('Price above upper Bollinger Band (overbought)');
      signal = 'bearish';
      confidence += 10;
    }
  }

  // Volume Analysis
  if (indicators.volumeTrend === 'increasing') {
    signals.push('Volume increasing (strong conviction)');
    confidence += 5;
  }

  // Cap confidence
  confidence = Math.min(confidence, 90);

  // Determine trend
  let trend: 'uptrend' | 'downtrend' | 'sideways' = 'sideways';
  if (quote.changePercent > 1) trend = 'uptrend';
  if (quote.changePercent < -1) trend = 'downtrend';

  // Calculate support and resistance based on CURRENT PRICE (not today's high/low)
  // This ensures levels are relevant for future trading decisions
  const currentPrice = quote.price;
  
  const resistance = [
    indicators.bollingerBands?.upper || currentPrice * 1.05,
    indicators.sma50 && currentPrice < indicators.sma50 ? indicators.sma50 : currentPrice * 1.10,
    indicators.sma200 && currentPrice < indicators.sma200 ? indicators.sma200 : currentPrice * 1.15
  ];

  const support = [
    indicators.bollingerBands?.lower || currentPrice * 0.95,
    indicators.sma50 && currentPrice > indicators.sma50 ? indicators.sma50 : currentPrice * 0.90,
    indicators.sma200 && currentPrice > indicators.sma200 ? indicators.sma200 : currentPrice * 0.85
  ];

  return {
    signal,
    confidence,
    keyLevels: {
      resistance: resistance.map(r => Math.round(r * 100) / 100),
      support: support.map(s => Math.round(s * 100) / 100)
    },
    momentum: signals.join('; '),
    technicalIndicators: {
      rsi: indicators.rsi,
      trend
    },
    summary: `${signal.toUpperCase()} signal with ${confidence}% confidence. ${signals.slice(0, 2).join('. ')}.`
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
