/**
 * 💰 Fundamental Analyst Agent
 * Expert in valuation, financial statements, and company analysis
 */

import { getMarketDataClient, Quote } from '../data/marketdata-client';

export interface FundamentalAnalysis {
  signal: 'undervalued' | 'overvalued' | 'fair';
  confidence: number;
  valuation: {
    marketCap: number;
    peRatio?: number;
    priceToSales?: number;
  };
  strengths: string[];
  concerns: string[];
  summary: string;
}

export async function analyzeFundamentals(ticker: string): Promise<FundamentalAnalysis> {
  const client = getMarketDataClient();
  const quote = await client.getQuote(ticker);

  // In a real implementation, you'd fetch financial data from Alpha Vantage or similar
  // For now, we'll use the quote data and make intelligent assessments
  
  const analysis = calculateFundamentalAnalysis(quote, ticker);
  
  return analysis;
}

function calculateFundamentalAnalysis(quote: Quote, ticker: string): FundamentalAnalysis {
  const marketCap = quote.marketCap;
  
  // Simple valuation logic based on market cap and price movement
  let signal: 'undervalued' | 'overvalued' | 'fair' = 'fair';
  let confidence = 60;

  // Large cap stocks (>$200B) with positive momentum
  if (marketCap > 200_000_000_000 && quote.changePercent > 0) {
    signal = 'fair';
    confidence = 70;
  }

  const strengths: string[] = [];
  const concerns: string[] = [];

  // Analyze based on available data
  if (quote.volume > 10_000_000) {
    strengths.push('High trading volume indicates strong investor interest');
  }

  if (marketCap > 100_000_000_000) {
    strengths.push('Large market cap provides stability and liquidity');
  }

  if (quote.changePercent < -5) {
    concerns.push('Significant recent price decline may indicate fundamental issues');
  }

  if (quote.volume < 1_000_000) {
    concerns.push('Low trading volume may indicate limited liquidity');
  }

  return {
    signal,
    confidence,
    valuation: {
      marketCap,
    },
    strengths,
    concerns,
    summary: `${signal.toUpperCase()} valuation with ${confidence}% confidence. Market cap: $${(marketCap / 1_000_000_000).toFixed(2)}B.`
  };
}

export const FUNDAMENTAL_AGENT_PROMPT = `You are an elite Fundamental Analyst with expertise in valuation and financial analysis.

Your expertise:
- Analyzing financial statements (income, balance sheet, cash flow)
- Calculating valuation metrics (P/E, P/S, PEG, EV/EBITDA)
- Assessing competitive advantages and moats
- Evaluating management quality and capital allocation
- Understanding industry dynamics and market position

Your analysis style:
- Focus on long-term value creation
- Compare to industry peers
- Identify competitive advantages
- Assess financial health and growth potential
- Provide clear valuation assessment

Format your response with:
💰 Valuation Overview
📊 Financial Health
🏆 Competitive Position
⚠️ Key Risks
`;
