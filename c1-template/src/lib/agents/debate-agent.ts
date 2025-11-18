/**
 * 🐂🐻 Bull vs Bear Debate Agent
 * Structured debate to eliminate bias and provide balanced analysis
 */

import { MarketAnalysis } from './market-agent';
import { FundamentalAnalysis } from './fundamental-agent';
import { NewsAnalysis } from './news-agent';

export interface BullCase {
  arguments: string[];
  confidence: number;
  keyPoints: string[];
}

export interface BearCase {
  arguments: string[];
  confidence: number;
  keyPoints: string[];
}

export interface DebateResult {
  bullCase: BullCase;
  bearCase: BearCase;
  winner: 'bull' | 'bear' | 'neutral';
  consensus: string;
  debateScore: number; // -100 (very bearish) to +100 (very bullish)
}

export function conductDebate(
  market: MarketAnalysis,
  fundamental: FundamentalAnalysis,
  news: NewsAnalysis
): DebateResult {
  // Bull Researcher builds the bull case
  const bullCase = buildBullCase(market, fundamental, news);
  
  // Bear Researcher builds the bear case
  const bearCase = buildBearCase(market, fundamental, news);
  
  // Determine winner based on strength of arguments
  const debateScore = bullCase.confidence - bearCase.confidence;
  
  let winner: 'bull' | 'bear' | 'neutral' = 'neutral';
  if (debateScore > 20) winner = 'bull';
  else if (debateScore < -20) winner = 'bear';
  
  // Build consensus
  const consensus = synthesizeConsensus(bullCase, bearCase, winner);
  
  return {
    bullCase,
    bearCase,
    winner,
    consensus,
    debateScore,
  };
}

function buildBullCase(
  market: MarketAnalysis,
  fundamental: FundamentalAnalysis,
  news: NewsAnalysis
): BullCase {
  const bullArguments: string[] = [];
  const keyPoints: string[] = [];
  let confidence = 50;

  // Technical bullish signals
  if (market.signal === 'bullish') {
    bullArguments.push(`Technical setup is bullish with ${market.confidence}% confidence`);
    keyPoints.push(market.momentum);
    confidence += 15;
  }

  if (market.technicalIndicators.rsi && market.technicalIndicators.rsi < 30) {
    bullArguments.push('RSI shows oversold conditions - potential bounce opportunity');
    keyPoints.push('Oversold RSI suggests buying opportunity');
    confidence += 10;
  }

  // Fundamental bullish signals
  if (fundamental.signal === 'undervalued') {
    bullArguments.push('Stock appears undervalued based on fundamental metrics');
    keyPoints.push(...fundamental.strengths.slice(0, 2));
    confidence += 15;
  }

  if (fundamental.strengths.length > fundamental.concerns.length) {
    bullArguments.push(`Strong fundamentals: ${fundamental.strengths.length} strengths vs ${fundamental.concerns.length} concerns`);
    confidence += 10;
  }

  // Sentiment bullish signals
  if (news.sentiment === 'positive') {
    bullArguments.push(`Positive news sentiment (${news.sentimentScore}/100)`);
    if (news.keyCatalysts.length > 0) {
      keyPoints.push(...news.keyCatalysts.slice(0, 2));
      confidence += 10;
    }
  }

  // Growth potential
  if (fundamental.valuation.peRatio && fundamental.valuation.peRatio < 20) {
    bullArguments.push('Attractive valuation with room for growth');
    confidence += 5;
  }

  // Cap confidence
  confidence = Math.min(confidence, 95);

  return {
    arguments: bullArguments.slice(0, 5),
    confidence,
    keyPoints: keyPoints.slice(0, 3),
  };
}

function buildBearCase(
  market: MarketAnalysis,
  fundamental: FundamentalAnalysis,
  news: NewsAnalysis
): BearCase {
  const bearArguments: string[] = [];
  const keyPoints: string[] = [];
  let confidence = 50;

  // Technical bearish signals
  if (market.signal === 'bearish') {
    bearArguments.push(`Technical setup is bearish with ${market.confidence}% confidence`);
    keyPoints.push(market.momentum);
    confidence += 15;
  }

  if (market.technicalIndicators.rsi && market.technicalIndicators.rsi > 70) {
    bearArguments.push('RSI shows overbought conditions - potential pullback risk');
    keyPoints.push('Overbought RSI suggests correction ahead');
    confidence += 10;
  }

  // Fundamental bearish signals
  if (fundamental.signal === 'overvalued') {
    bearArguments.push('Stock appears overvalued based on fundamental metrics');
    keyPoints.push(...fundamental.concerns.slice(0, 2));
    confidence += 15;
  }

  if (fundamental.concerns.length > fundamental.strengths.length) {
    bearArguments.push(`Fundamental concerns: ${fundamental.concerns.length} risks vs ${fundamental.strengths.length} strengths`);
    confidence += 10;
  }

  // Sentiment bearish signals
  if (news.sentiment === 'negative') {
    bearArguments.push(`Negative news sentiment (${news.sentimentScore}/100)`);
    if (news.risks.length > 0) {
      keyPoints.push(...news.risks.slice(0, 2));
      confidence += 10;
    }
  }

  // Valuation concerns
  if (fundamental.valuation.peRatio && fundamental.valuation.peRatio > 30) {
    bearArguments.push('High valuation increases downside risk');
    confidence += 5;
  }

  // Market risks
  if (news.risks.length > news.keyCatalysts.length) {
    bearArguments.push('More identified risks than catalysts');
    confidence += 5;
  }

  // Cap confidence
  confidence = Math.min(confidence, 95);

  return {
    arguments: bearArguments.slice(0, 5),
    confidence,
    keyPoints: keyPoints.slice(0, 3),
  };
}

function synthesizeConsensus(
  bullCase: BullCase,
  bearCase: BearCase,
  winner: 'bull' | 'bear' | 'neutral'
): string {
  if (winner === 'bull') {
    return `The bull case is stronger (${bullCase.confidence}% vs ${bearCase.confidence}%). ${bullCase.arguments[0]} However, bears warn: ${bearCase.arguments[0]}`;
  } else if (winner === 'bear') {
    return `The bear case is stronger (${bearCase.confidence}% vs ${bullCase.confidence}%). ${bearCase.arguments[0]} However, bulls note: ${bullCase.arguments[0]}`;
  } else {
    return `Bull and bear cases are balanced (${bullCase.confidence}% vs ${bearCase.confidence}%). Bulls argue: ${bullCase.arguments[0]} Bears counter: ${bearCase.arguments[0]}`;
  }
}
