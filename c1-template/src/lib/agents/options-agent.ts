/**
 * 📊 Options Analyst Agent
 * Expert in options flow, unusual activity, and derivatives analysis
 */

import { analyzeOptions, getOptionsChain } from '../data/options-client';

export interface OptionsAnalysisResult {
  putCallRatio: number;
  impliedVolatility: number;
  maxPain: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  unusualActivity: Array<{
    contract: string;
    type: 'call' | 'put';
    volume: number;
    reason: string;
  }>;
  summary: string;
  insights: string[];
}

export async function analyzeOptionsFlow(ticker: string): Promise<OptionsAnalysisResult | null> {
  try {
    const analysis = await analyzeOptions(ticker);
    
    if (!analysis) {
      return null;
    }

    // Generate insights based on the data
    const insights: string[] = [];

    // Put/Call Ratio insights
    if (analysis.putCallRatio < 0.7) {
      insights.push(`🟢 Low P/C ratio (${analysis.putCallRatio.toFixed(2)}) suggests bullish sentiment - more calls than puts being traded`);
    } else if (analysis.putCallRatio > 1.3) {
      insights.push(`🔴 High P/C ratio (${analysis.putCallRatio.toFixed(2)}) suggests bearish sentiment - more puts than calls being traded`);
    } else {
      insights.push(`⚪ Neutral P/C ratio (${analysis.putCallRatio.toFixed(2)}) - balanced options activity`);
    }

    // Implied Volatility insights
    if (analysis.impliedVolatility > 40) {
      insights.push(`⚡ High implied volatility (${analysis.impliedVolatility}%) - market expects significant price movement`);
    } else if (analysis.impliedVolatility < 20) {
      insights.push(`😴 Low implied volatility (${analysis.impliedVolatility}%) - market expects minimal price movement`);
    } else {
      insights.push(`📊 Moderate implied volatility (${analysis.impliedVolatility}%) - normal market conditions`);
    }

    // Max Pain insights
    if (analysis.maxPain > 0) {
      insights.push(`🎯 Max pain at $${analysis.maxPain} - price level where most options expire worthless`);
    }

    // Unusual Activity insights
    if (analysis.unusualActivity.length > 0) {
      const calls = analysis.unusualActivity.filter(a => a.type === 'call').length;
      const puts = analysis.unusualActivity.filter(a => a.type === 'put').length;
      
      if (calls > puts) {
        insights.push(`🐋 Unusual call activity detected - ${calls} contracts with abnormal volume (potential bullish positioning)`);
      } else if (puts > calls) {
        insights.push(`🐋 Unusual put activity detected - ${puts} contracts with abnormal volume (potential bearish positioning)`);
      } else {
        insights.push(`🐋 Unusual options activity detected - ${analysis.unusualActivity.length} contracts with abnormal volume`);
      }
    }

    return {
      ...analysis,
      insights
    };
  } catch (error) {
    console.error('Error analyzing options flow:', error);
    return null;
  }
}

export const OPTIONS_AGENT_PROMPT = `You are an elite Options Flow Analyst who specializes in derivatives markets and institutional positioning.

Your expertise:
- Analyzing options flow and unusual activity
- Interpreting Put/Call ratios and sentiment
- Understanding implied volatility and Greeks
- Identifying institutional positioning
- Spotting potential gamma squeezes or hedging activity
- Reading max pain levels and pinning behavior

Your analysis style:
- Focus on actionable options signals
- Explain what the smart money is doing
- Identify potential catalysts from options positioning
- Assess risk/reward from derivatives perspective
- Provide context on historical volatility patterns

Format your response with:
📊 Options Flow Summary
🎯 Put/Call Ratio Analysis
⚡ Implied Volatility Assessment
🐋 Unusual Activity Alerts
💡 Trading Implications
`;
