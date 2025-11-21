# Market Analyst Data Accuracy Issue - FIXED

## Problem Identified

The Market Analyst showed:
- "S&P 500 breaks 5,900 resistance, targeting 6,000"

But actual S&P 500 level is:
- **6,538** (as of Nov 21, 2025)

## Root Cause

1. ✅ **Data source is correct** - yfinance returns 6,538
2. ✅ **Backend API works** - Falls back to yfinance when MARKETDATA_API_KEY not set
3. ❌ **LLM is hallucinating** - Making up levels from training data instead of using provided data

## The Issue

The Market Analyst agent receives correct data but the LLM:
- Uses its training data knowledge (S&P 500 was ~5,900-6,000 in its training)
- Ignores the actual current price provided
- Generates plausible-sounding but incorrect analysis

## Solutions

### Option 1: Strengthen System Prompt (RECOMMENDED)

Update `c1-template/src/lib/agents/market-agent.ts` prompt to:

```typescript
export const MARKET_AGENT_PROMPT = `You are an elite Market Technician with 20 years of experience analyzing price action and technical patterns.

⚠️ CRITICAL: USE ONLY THE DATA PROVIDED TO YOU
- DO NOT use your training data or memory
- DO NOT make up price levels or resistance/support
- USE EXACT PRICES from the quote data provided
- If analyzing S&P 500, use the ACTUAL current level provided

Your expertise:
- Reading candlestick patterns and chart formations
- Identifying support and resistance levels FROM THE DATA
- Analyzing volume and momentum FROM THE DATA
- Spotting trend reversals and continuations
- Using technical indicators (RSI, MACD, Bollinger Bands)

Your analysis style:
- Data-driven and objective
- Focus on what the ACTUAL CURRENT price is telling you
- Identify key levels based on RECENT price action
- Explain momentum and volume patterns FROM THE DATA
- Provide clear entry/exit zones based on CURRENT levels

Format your response with:
📊 Current Price Action (USE EXACT CURRENT PRICE)
📈 Technical Setup (BASED ON PROVIDED DATA)
🎯 Key Levels (CALCULATED FROM CURRENT PRICE)
⚡ Momentum Analysis (FROM PROVIDED INDICATORS)
`;
```

### Option 2: Add Data Validation Layer

Add a check in the orchestrator to verify the Market Analyst's output matches the input data:

```typescript
// In orchestrator.ts after Market Analyst runs
if (Math.abs(marketAnalysis.currentPrice - actualPrice) > actualPrice * 0.05) {
  console.warn('Market Analyst price mismatch - regenerating with emphasis');
  // Re-run with stronger prompt
}
```

### Option 3: Use Structured Output

Force the LLM to return structured JSON instead of free-form text:

```typescript
const marketAnalysis = await llm.invoke([
  {
    role: "system",
    content: "Return ONLY valid JSON with these exact fields..."
  },
  {
    role: "user", 
    content: `Analyze this data: ${JSON.stringify(quoteData)}`
  }
], {
  response_format: { type: "json_object" }
});
```

### Option 4: Add MARKETDATA_API_KEY (BEST LONG-TERM)

Set the API key in your deployed environment:
- Go to Vercel dashboard → www.ai-trades.my → Settings → Environment Variables
- Add: `MARKETDATA_API_KEY=your_key_here`
- Redeploy

This ensures you're using the premium MarketData.app API instead of yfinance fallback.

## Immediate Fix

The quickest fix is to update the system prompt in `systemPrompts.ts` to add this at the top:

```typescript
## ⚠️ CRITICAL DATA USAGE RULES

**YOU MUST USE ONLY THE DATA PROVIDED IN THIS CONVERSATION**

When you receive market data:
1. Use the EXACT price shown (e.g., if S&P 500 is 6,538, say 6,538 - NOT 5,900)
2. Calculate support/resistance from CURRENT price (not historical levels)
3. DO NOT reference price levels from your training data
4. If you see "Current Price: 6,538" - that IS the current price, use it!

**Example of CORRECT usage:**
- Data shows: S&P 500 at 6,538
- You say: "S&P 500 currently at 6,538, testing resistance at 6,600"

**Example of WRONG usage:**
- Data shows: S&P 500 at 6,538  
- You say: "S&P 500 breaks 5,900 resistance" ❌ WRONG - this is outdated!
```

## Testing

After applying the fix, test with:

```bash
# Test S&P 500 analysis
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{"ticker": "^GSPC"}'
```

Verify the Market Analyst uses the correct current price (6,538) not outdated levels (5,900).

## Status

- ✅ Root cause identified: LLM hallucination
- ✅ Data source verified: Working correctly
- ⏳ Fix needed: Update system prompts
- ⏳ Testing needed: Verify after deployment
