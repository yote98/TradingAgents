/**
 * 🎭 Agent Orchestrator
 * Coordinates all 4 agents to work in parallel
 */

import { getMarketDataClient } from '../data/marketdata-client';
import { getCoinGeckoClient } from '../data/coingecko-client';
import { getReliableQuote } from '../data/reliable-quote';
import { analyzeMarket } from './market-agent';
import { analyzeFundamentals } from './fundamental-agent';
import { analyzeNews } from './news-agent';
import { analyzeSocial } from './social-agent';
import { analyzeOptionsFlow } from './options-agent';
import { synthesizeStrategy, ComprehensiveAnalysis } from './strategy-agent';
import { conductDebate } from './debate-agent';
import { assessRisk } from './risk-agent';

export async function analyzeStock(ticker: string): Promise<ComprehensiveAnalysis> {
  const coinGeckoClient = getCoinGeckoClient();
  
  // Check if it's a crypto symbol
  const isCrypto = coinGeckoClient.isCryptoSymbol(ticker);
  
  if (isCrypto) {
    return analyzeCrypto(ticker);
  }

  // Step 1: Get current quote using triple-redundant system (Finnhub → Alpha Vantage → Alpaca)
  const quote = await getReliableQuote(ticker);

  // Step 2: Run all 5 analysts in parallel for maximum speed
  const [market, fundamental, news, social, options] = await Promise.all([
    analyzeMarket(ticker),
    analyzeFundamentals(ticker),
    analyzeNews(ticker),
    analyzeSocial(ticker),
    analyzeOptionsFlow(ticker).catch(() => null), // Options data optional
  ]);

  // Step 3: Bull vs Bear Debate (eliminate bias)
  const debate = conductDebate(market, fundamental, news, social);

  // Step 4: Synthesize into trading strategy
  const strategy = synthesizeStrategy(quote, market, fundamental, news, social);

  // Step 5: Risk Management Team Assessment
  const riskAssessment = assessRisk(strategy, debate);

  return {
    quote,
    market,
    fundamental,
    news,
    social,
    options,
    debate,
    strategy,
    riskAssessment,
  };
}

async function analyzeCrypto(ticker: string): Promise<ComprehensiveAnalysis> {
  const coinGeckoClient = getCoinGeckoClient();
  
  // Get crypto quote
  const cryptoQuote = await coinGeckoClient.getCryptoQuote(ticker);
  
  if (!cryptoQuote) {
    throw new Error(`Cryptocurrency ${ticker} not found`);
  }

  // Convert crypto quote to standard quote format
  const quote = {
    symbol: cryptoQuote.symbol,
    price: cryptoQuote.price,
    change: cryptoQuote.change,
    changePercent: cryptoQuote.changePercent,
    volume: cryptoQuote.volume,
    marketCap: cryptoQuote.marketCap,
    high: cryptoQuote.high,
    low: cryptoQuote.low,
    open: cryptoQuote.price - cryptoQuote.change,
    previousClose: cryptoQuote.price - cryptoQuote.change,
  };

  // For crypto, create simplified technical analysis from price data
  const market = {
    signal: cryptoQuote.changePercent > 0 ? 'bullish' as const : 'bearish' as const,
    confidence: Math.min(Math.abs(cryptoQuote.changePercent) * 10, 80),
    technicalIndicators: {
      rsi: 50, // Neutral default
      macd: cryptoQuote.changePercent > 0 ? 'bullish' : 'bearish',
      trend: cryptoQuote.changePercent > 5 ? 'uptrend' : cryptoQuote.changePercent < -5 ? 'downtrend' : 'sideways',
    },
    momentum: `24h change: ${cryptoQuote.changePercent.toFixed(2)}%`,
    summary: `${cryptoQuote.changePercent > 0 ? 'BULLISH' : 'BEARISH'} with ${cryptoQuote.changePercent.toFixed(2)}% 24h change.`,
  };
  
  // Crypto doesn't have traditional fundamentals, so we create a crypto-specific analysis
  const fundamental = {
    signal: 'fair' as const,
    confidence: 60,
    valuation: {
      marketCap: cryptoQuote.marketCap,
    },
    strengths: [
      `Market Cap: $${(cryptoQuote.marketCap / 1_000_000_000).toFixed(2)}B`,
      cryptoQuote.maxSupply ? `Max Supply: ${(cryptoQuote.maxSupply / 1_000_000).toFixed(2)}M` : 'No max supply cap',
    ],
    concerns: [
      `${Math.abs(cryptoQuote.athChangePercent).toFixed(1)}% below all-time high`,
    ],
    summary: `Crypto asset with $${(cryptoQuote.marketCap / 1_000_000_000).toFixed(2)}B market cap.`,
  };

  // News analysis (can use same news agent)
  const news = await analyzeNews(ticker);

  // Bull vs Bear Debate
  const debate = conductDebate(market, fundamental, news);

  // Synthesize strategy
  const strategy = synthesizeStrategy(quote, market, fundamental, news);

  // Risk Assessment
  const riskAssessment = assessRisk(strategy, debate);

  return {
    quote,
    market,
    fundamental,
    news,
    debate,
    strategy,
    riskAssessment,
  };
}

export interface StreamingUpdate {
  type: 'quote' | 'market' | 'fundamental' | 'news' | 'strategy' | 'complete';
  data: any;
}

export async function* analyzeStockStreaming(ticker: string): AsyncGenerator<StreamingUpdate> {
  const client = getMarketDataClient();

  // Stream 1: Quote data
  const quote = await client.getQuote(ticker);
  yield { type: 'quote', data: quote };

  // Stream 2-5: Agents working in parallel
  const [market, fundamental, news, options] = await Promise.all([
    analyzeMarket(ticker).then(data => {
      return data;
    }),
    analyzeFundamentals(ticker).then(data => {
      return data;
    }),
    analyzeNews(ticker).then(data => {
      return data;
    }),
    analyzeOptionsFlow(ticker).catch(() => null),
  ]);

  yield { type: 'market', data: market };
  yield { type: 'fundamental', data: fundamental };
  yield { type: 'news', data: news };
  if (options) {
    yield { type: 'options' as any, data: options };
  }

  // Stream 5: Final strategy
  const strategy = synthesizeStrategy(quote, market, fundamental, news);
  yield { type: 'strategy', data: strategy };

  // Complete
  yield { 
    type: 'complete', 
    data: { quote, market, fundamental, news, options, strategy } 
  };
}
