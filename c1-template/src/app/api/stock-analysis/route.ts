import { NextRequest, NextResponse } from 'next/server';
import { analyzeStock } from '@/lib/agents/orchestrator';

/**
 * POST /api/stock-analysis
 * Returns pre-formatted stock analysis (bypasses AI to ensure correct prices)
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

    // Run the complete analysis
    const analysis = await analyzeStock(ticker);

    // Format the response as markdown with StockCard component
    const markdown = `<StockCard
  ticker="${analysis.quote.symbol}"
  price={${analysis.quote.price}}
  recommendation="${analysis.strategy.recommendation}"
  confidence={${analysis.strategy.confidence}}
  target={${analysis.strategy.target}}
  stopLoss={${analysis.strategy.stopLoss}}
/>

# 📊 ${analysis.quote.symbol} Analysis
*Elite AI Trading Analysis - ${new Date().toLocaleDateString()}*

## 🚀 Quick Summary
${analysis.strategy.reasoning}

---

## 🤖 AI Analyst Network Results

| Analyst | Signal | Key Finding | Confidence |
|---------|--------|-------------|------------|
| 📊 Technical | ${analysis.market.signal.toUpperCase()} | ${analysis.market.momentum} | ${'🟢'.repeat(Math.floor(analysis.market.confidence / 20))}${'⚪'.repeat(5 - Math.floor(analysis.market.confidence / 20))} ${analysis.market.confidence}% |
| 💰 Fundamental | ${analysis.fundamental.signal.toUpperCase()} | ${analysis.fundamental.strengths[0] || 'N/A'} | ${'🟢'.repeat(Math.floor(analysis.fundamental.confidence / 20))}${'⚪'.repeat(5 - Math.floor(analysis.fundamental.confidence / 20))} ${analysis.fundamental.confidence}% |
| 📰 News | ${analysis.news.sentiment.toUpperCase()} | Sentiment: ${analysis.news.sentimentScore}/100 | ${'🟢'.repeat(Math.floor(analysis.news.confidence / 20))}${'⚪'.repeat(5 - Math.floor(analysis.news.confidence / 20))} ${analysis.news.confidence}% |

---

## 🐂 BULLS vs 🐻 BEARS

${analysis.debate ? `
**Winner: ${analysis.debate.winner}** (Score: ${analysis.debate.debateScore > 0 ? '+' : ''}${analysis.debate.debateScore})

### Bulls Say: 🐂
${analysis.debate.bullCase.arguments.map(arg => `✅ ${arg}`).join('\n')}

**Bull Confidence: ${analysis.debate.bullCase.confidence}%**

### Bears Say: 🐻
${analysis.debate.bearCase.arguments.map(arg => `⚠️ ${arg}`).join('\n')}

**Bear Confidence: ${analysis.debate.bearCase.confidence}%**

**Consensus:** ${analysis.debate.consensus}
` : 'Debate data not available'}

---

## ⚖️ Risk Management Team

${analysis.riskAssessment ? `
**Final Decision: ${analysis.riskAssessment.finalDecision}**

${analysis.riskAssessment.perspectives.map(p => `
**${p.name.toUpperCase()} Perspective:** ${p.recommendation}
${p.reasoning}
`).join('\n')}

**Team Consensus:** ${analysis.riskAssessment.consensus}

### Position Sizing Recommendations:
- **Conservative:** 1-2% of portfolio
- **Moderate:** 3-5% of portfolio  
- **Aggressive:** 5-10% of portfolio
` : 'Risk assessment not available'}

---

## 🎯 Trading Plan

- **Entry:** $${analysis.quote.price} (current price)
- **Target:** $${analysis.strategy.target} (+${((analysis.strategy.target - analysis.quote.price) / analysis.quote.price * 100).toFixed(2)}%)
- **Stop Loss:** $${analysis.strategy.stopLoss} (-${((analysis.quote.price - analysis.strategy.stopLoss) / analysis.quote.price * 100).toFixed(2)}%)
- **Risk/Reward:** ${analysis.strategy.riskReward}:1
- **Timeframe:** ${analysis.strategy.timeframe}

---

## 📍 Key Levels

- 🔴 **Resistance:** Check technical analysis
- 🟢 **Support:** Check technical analysis
- ⚡ **Current:** $${analysis.quote.price}

---

*Analysis generated at ${new Date().toISOString()}*
*Data sources: MarketData.app, FMP, NewsData.io*
`;

    return NextResponse.json({
      success: true,
      markdown,
      data: analysis,
    });
  } catch (error) {
    console.error('Stock analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
