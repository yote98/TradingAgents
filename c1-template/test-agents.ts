/**
 * Test script for the new TypeScript agents
 * Run with: npx tsx test-agents.ts
 */

// Load environment variables from parent directory
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { analyzeStock } from './src/lib/agents/orchestrator';

async function testAgents() {
  console.log('🧪 Testing TradingAgents v2.0...\n');

  const ticker = process.argv[2] || 'AAPL'; // Test with Apple or pass ticker as argument
  
  try {
    console.log(`📊 Analyzing ${ticker}...`);
    console.log('⏳ This may take 10-15 seconds...\n');

    const analysis = await analyzeStock(ticker);

    console.log('✅ Analysis Complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Quote
    console.log('💰 CURRENT QUOTE');
    console.log(`Price: $${analysis.quote.price}`);
    const changePct = Number(analysis.quote.changePercent) || 0;
    console.log(`Change: ${changePct > 0 ? '+' : ''}${changePct.toFixed(2)}%`);
    console.log(`Volume: ${analysis.quote.volume.toLocaleString()}`);
    console.log(`Market Cap: $${(analysis.quote.marketCap / 1_000_000_000).toFixed(2)}B\n`);

    // Market Analysis
    console.log('📊 MARKET TECHNICIAN');
    console.log(`Signal: ${analysis.market.signal.toUpperCase()}`);
    console.log(`Confidence: ${analysis.market.confidence}%`);
    console.log(`RSI: ${analysis.market.technicalIndicators.rsi || 'N/A'}`);
    console.log(`Trend: ${analysis.market.technicalIndicators.trend}`);
    console.log(`Momentum: ${analysis.market.momentum}`);
    console.log(`Summary: ${analysis.market.summary}\n`);

    // Fundamental Analysis
    console.log('💰 FUNDAMENTAL ANALYST');
    console.log(`Signal: ${analysis.fundamental.signal.toUpperCase()}`);
    console.log(`Confidence: ${analysis.fundamental.confidence}%`);
    if (analysis.fundamental.valuation.peRatio) {
      console.log(`P/E Ratio: ${analysis.fundamental.valuation.peRatio.toFixed(2)}`);
    }
    console.log(`Strengths: ${analysis.fundamental.strengths.length}`);
    console.log(`Concerns: ${analysis.fundamental.concerns.length}`);
    console.log(`Summary: ${analysis.fundamental.summary}\n`);

    // News Analysis
    console.log('📰 NEWS & SENTIMENT');
    console.log(`Sentiment: ${analysis.news.sentiment.toUpperCase()}`);
    console.log(`Score: ${analysis.news.sentimentScore}/100`);
    console.log(`Confidence: ${analysis.news.confidence}%`);
    console.log(`Recent Articles: ${analysis.news.recentNews.length}`);
    console.log(`Key Catalysts: ${analysis.news.keyCatalysts.length}`);
    console.log(`Risks: ${analysis.news.risks.length}`);
    console.log(`Summary: ${analysis.news.summary}\n`);

    // Bull vs Bear Debate
    if (analysis.debate) {
      console.log('⚔️ BULL VS BEAR DEBATE');
      console.log(`Winner: ${analysis.debate.winner.toUpperCase()}`);
      console.log(`Debate Score: ${analysis.debate.debateScore > 0 ? '+' : ''}${analysis.debate.debateScore}`);
      console.log(`\n🐂 BULL CASE (${analysis.debate.bullCase.confidence}% confidence):`);
      analysis.debate.bullCase.arguments.forEach(arg => console.log(`  ✅ ${arg}`));
      console.log(`\n🐻 BEAR CASE (${analysis.debate.bearCase.confidence}% confidence):`);
      analysis.debate.bearCase.arguments.forEach(arg => console.log(`  ⚠️ ${arg}`));
      console.log(`\nConsensus: ${analysis.debate.consensus}\n`);
    }

    // Trading Strategy
    console.log('🎯 TRADING STRATEGIST');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`RECOMMENDATION: ${analysis.strategy.recommendation}`);
    console.log(`CONFIDENCE: ${analysis.strategy.confidence}%`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Entry: $${analysis.strategy.entry}`);
    console.log(`Target: $${analysis.strategy.target} (+${((analysis.strategy.target - analysis.strategy.entry) / analysis.strategy.entry * 100).toFixed(2)}%)`);
    console.log(`Stop Loss: $${analysis.strategy.stopLoss} (-${((analysis.strategy.entry - analysis.strategy.stopLoss) / analysis.strategy.entry * 100).toFixed(2)}%)`);
    console.log(`Risk/Reward: 1:${analysis.strategy.riskReward}`);
    console.log(`Timeframe: ${analysis.strategy.timeframe}\n`);

    // Risk Management Team
    if (analysis.riskAssessment) {
      console.log('⚖️ RISK MANAGEMENT TEAM');
      console.log(`Final Decision: ${analysis.riskAssessment.finalDecision}`);
      console.log(`\nPerspectives:`);
      analysis.riskAssessment.perspectives.forEach(p => {
        const icon = p.name === 'risky' ? '🟡' : p.name === 'neutral' ? '⚪' : '🔵';
        console.log(`  ${icon} ${p.name.toUpperCase()}: ${p.recommendation} - ${p.reasoning}`);
      });
      console.log(`\nConsensus: ${analysis.riskAssessment.consensus}\n`);
    }

    console.log('Position Sizing:');
    console.log(`  Conservative: ${analysis.strategy.positionSize.conservative}`);
    console.log(`  Moderate: ${analysis.strategy.positionSize.moderate}`);
    console.log(`  Aggressive: ${analysis.strategy.positionSize.aggressive}`);
    console.log(`\nReasoning: ${analysis.strategy.reasoning}`);
    console.log(`\nKey Points:`);
    analysis.strategy.keyPoints.forEach(point => console.log(`  • ${point}`));

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Complete institutional-grade analysis!\n');

  } catch (error) {
    console.error('❌ Error testing agents:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
  }
}

// Run the test
testAgents();
