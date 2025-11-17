/**
 * 🎭 Agent Orchestrator
 * Coordinates all 4 agents to work in parallel
 */

import { getMarketDataClient } from '../data/marketdata-client';
import { analyzeMarket } from './market-agent';
import { analyzeFundamentals } from './fundamental-agent';
import { analyzeNews } from './news-agent';
import { synthesizeStrategy, ComprehensiveAnalysis } from './strategy-agent';

export async function analyzeStock(ticker: string): Promise<ComprehensiveAnalysis> {
  const client = getMarketDataClient();

  // Step 1: Get current quote (needed by all agents)
  const quote = await client.getQuote(ticker);

  // Step 2: Run all 4 agents in parallel for maximum speed
  const [market, fundamental, news] = await Promise.all([
    analyzeMarket(ticker),
    analyzeFundamentals(ticker),
    analyzeNews(ticker),
  ]);

  // Step 3: Synthesize into trading strategy
  const strategy = synthesizeStrategy(quote, market, fundamental, news);

  return {
    quote,
    market,
    fundamental,
    news,
    strategy,
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

  // Stream 2-4: Agents working in parallel
  const [market, fundamental, news] = await Promise.all([
    analyzeMarket(ticker).then(data => {
      return data;
    }),
    analyzeFundamentals(ticker).then(data => {
      return data;
    }),
    analyzeNews(ticker).then(data => {
      return data;
    }),
  ]);

  yield { type: 'market', data: market };
  yield { type: 'fundamental', data: fundamental };
  yield { type: 'news', data: news };

  // Stream 5: Final strategy
  const strategy = synthesizeStrategy(quote, market, fundamental, news);
  yield { type: 'strategy', data: strategy };

  // Complete
  yield { 
    type: 'complete', 
    data: { quote, market, fundamental, news, strategy } 
  };
}
