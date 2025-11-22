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
  const [quote, fundamentals] = await Promise.all([
    client.getQuote(ticker),
    client.getFundamentals(ticker)
  ]);

  const analysis = calculateFundamentalAnalysis(quote, fundamentals, ticker);
  
  return analysis;
}

function calculateFundamentalAnalysis(quote: Quote, fundamentals: any, ticker: string): FundamentalAnalysis {
  const marketCap = fundamentals?.marketCap || quote.marketCap;
  const peRatio = fundamentals?.peRatio;
  const pegRatio = fundamentals?.pegRatio;
  const profitMargin = fundamentals?.profitMargin;
  const roe = fundamentals?.returnOnEquity;
  
  let signal: 'undervalued' | 'overvalued' | 'fair' = 'fair';
  let confidence = 50;

  const strengths: string[] = [];
  const concerns: string[] = [];

  // Valuation analysis
  if (peRatio) {
    if (peRatio < 15) {
      signal = 'undervalued';
      confidence = 70;
      strengths.push(`Low P/E ratio of ${peRatio.toFixed(1)} suggests undervaluation`);
    } else if (peRatio > 30) {
      signal = 'overvalued';
      confidence = 70;
      concerns.push(`High P/E ratio of ${peRatio.toFixed(1)} indicates premium valuation`);
    } else {
      strengths.push(`Reasonable P/E ratio of ${peRatio.toFixed(1)}`);
    }
  }

  // Growth analysis
  if (pegRatio) {
    if (pegRatio < 1) {
      strengths.push(`PEG ratio of ${pegRatio.toFixed(2)} suggests growth at reasonable price`);
      if (signal === 'fair') signal = 'undervalued';
      confidence += 10;
    } else if (pegRatio > 2) {
      concerns.push(`High PEG ratio of ${pegRatio.toFixed(2)} may indicate overvaluation`);
    }
  }

  // Profitability analysis
  if (profitMargin) {
    if (profitMargin > 0.20) {
      strengths.push(`Strong profit margin of ${(profitMargin * 100).toFixed(1)}%`);
      confidence += 5;
    } else if (profitMargin < 0.05) {
      concerns.push(`Low profit margin of ${(profitMargin * 100).toFixed(1)}%`);
    }
  }

  // Return on equity
  if (roe) {
    if (roe > 0.15) {
      strengths.push(`Excellent ROE of ${(roe * 100).toFixed(1)}%`);
      confidence += 5;
    } else if (roe < 0.05) {
      concerns.push(`Weak ROE of ${(roe * 100).toFixed(1)}%`);
    }
  }

  // Market cap analysis
  if (marketCap > 100_000_000_000) {
    strengths.push('Large-cap stability and liquidity');
  } else if (marketCap < 2_000_000_000) {
    concerns.push('Small-cap volatility and liquidity risk');
  }

  // Volume analysis
  if (quote.volume > 10_000_000) {
    strengths.push('High trading volume indicates strong interest');
  } else if (quote.volume < 1_000_000) {
    concerns.push('Low trading volume may limit liquidity');
  }

  // Recent price action
  if (quote.changePercent < -10) {
    concerns.push('Significant recent decline may signal fundamental issues');
  }

  confidence = Math.min(Math.max(confidence, 40), 90);

  return {
    signal,
    confidence,
    valuation: {
      marketCap,
      peRatio,
      priceToSales: fundamentals?.revenuePerShare ? quote.price / fundamentals.revenuePerShare : undefined,
    },
    strengths: strengths.slice(0, 5),
    concerns: concerns.slice(0, 5),
    summary: `${signal.toUpperCase()} with ${confidence}% confidence. Market cap: $${(marketCap / 1_000_000_000).toFixed(2)}B${peRatio ? `, P/E: ${peRatio.toFixed(1)}` : ''}.`
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

Format your response with clean section headers (no emojis):
- Valuation Overview
- Financial Health
- Competitive Position
- Key Risks
`;
