import { NextRequest, NextResponse } from 'next/server';
import { analyzeStock } from '@/lib/agents/orchestrator';

// CRITICAL: Disable ALL caching for analysis data
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * POST /api/analyze
 * Direct TypeScript analysis endpoint (bypasses Python API)
 * ZERO CACHING - Always returns fresh analysis
 */
export async function POST(request: NextRequest) {
  try {
    const { ticker } = await request.json();

    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker symbol is required' },
        { status: 400 }
      );
    }

    // Run the complete analysis with all agents
    const analysis = await analyzeStock(ticker);

    // Format response to match expected structure
    return NextResponse.json({
      success: true,
      ticker: analysis.quote.symbol,
      current_price: analysis.quote.price,
      market_data: {
        current_price: analysis.quote.price,
        change: analysis.quote.change,
        change_percent: analysis.quote.changePercent,
        volume: analysis.quote.volume,
        market_cap: analysis.quote.marketCap,
      },
      
      // Analyst reports
      market_report: {
        signal: analysis.market.signal,
        confidence: analysis.market.confidence,
        indicators: analysis.market.technicalIndicators,
        summary: analysis.market.summary,
      },
      
      fundamentals_report: {
        signal: analysis.fundamental.signal,
        confidence: analysis.fundamental.confidence,
        strengths: analysis.fundamental.strengths,
        concerns: analysis.fundamental.concerns,
        summary: analysis.fundamental.summary,
      },
      
      news_report: {
        sentiment: analysis.news.sentiment,
        score: analysis.news.sentimentScore,
        confidence: analysis.news.confidence,
        recent_articles: analysis.news.recentNews?.length || 0,
        key_catalysts: analysis.news.keyCatalysts,
        risks: analysis.news.risks,
        summary: analysis.news.summary,
      },
      
      // Bull vs Bear Debate
      debate: analysis.debate ? {
        winner: analysis.debate.winner,
        debate_score: analysis.debate.debateScore,
        bull_case: {
          confidence: analysis.debate.bullCase.confidence,
          arguments: analysis.debate.bullCase.arguments,
        },
        bear_case: {
          confidence: analysis.debate.bearCase.confidence,
          arguments: analysis.debate.bearCase.arguments,
        },
        consensus: analysis.debate.consensus,
      } : undefined,
      
      // Trading Strategy
      final_decision: analysis.strategy.recommendation,
      confidence: analysis.strategy.confidence,
      target_price: analysis.strategy.target,
      stop_loss: analysis.strategy.stopLoss,
      risk_reward_ratio: analysis.strategy.riskReward,
      reasoning: analysis.strategy.reasoning,
      
      // Risk Management Assessment
      risk_assessment: analysis.riskAssessment ? {
        final_decision: analysis.riskAssessment.finalDecision,
        perspectives: analysis.riskAssessment.perspectives,
        consensus: analysis.riskAssessment.consensus,
        adjusted_strategy: analysis.riskAssessment.adjustedStrategy,
      } : undefined,
      
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  }
}
