# Message for Thesys Support

## Issue Summary

We're experiencing aggressive response caching in the C1/Thesys API that's causing stale data to be returned even when we inject fresh, timestamped data into system messages.

## The Problem

**Expected Behavior:**
- User asks: "analyse NVDA"
- Our backend fetches live price: $180.64
- We inject this into a system message with timestamp
- AI should use the fresh data in its response

**Actual Behavior:**
- User asks: "analyse NVDA"
- Our backend fetches live price: $180.64
- We inject this into system message with timestamp: `2025-11-21T07:58:48.549Z`
- AI returns cached response with old price: $145-150
- AI ignores the fresh data we injected

## Technical Details

**API Endpoint:** `https://api.thesys.dev/v1/embed`
**Model:** `c1/anthropic/claude-sonnet-4/v-20250617`
**Request Type:** Streaming chat completion

**Our System Message Format:**
```
🚨 REAL-TIME DATA (2025-11-21T07:58:48.549Z) 🚨

NVDA:
- Current Price: 180.64
- Recommendation: HOLD
- Confidence: 67%
- Target: 189.67
- Stop Loss: 171.61

CRITICAL: Use these EXACT prices in your response! This is real-time market data.

Full analysis data: {detailed JSON with current_price: 180.64}
```

**What We're Seeing:**
Despite the system message containing `current_price: 180.64`, the AI response shows prices from an earlier session ($145-150 range).

## Evidence

1. **Backend API returns correct data:**
   - `/api/analyze` endpoint returns: `{"current_price": 180.64}`
   - Timestamp: `2025-11-21T07:58:48.549Z`

2. **System message injection confirmed:**
   - Console logs show: `✅ Injected data for 1 ticker(s): NVDA=180.64`

3. **AI response uses stale data:**
   - UI displays: Price Target $165, Support $140, Resistance $152
   - These values are from a previous session

## Questions for Thesys

1. **Does C1/Thesys implement semantic caching?**
   - Are similar questions cached based on content similarity?
   - How long are responses cached?

2. **How can we force cache invalidation?**
   - Do timestamps in system messages bypass cache?
   - Is there a cache-control header we can use?
   - Can we add a unique identifier to force fresh responses?

3. **Is there a way to disable caching for real-time data applications?**
   - Our use case requires fresh market data on every request
   - Cached responses are problematic for financial data

4. **What's the recommended approach for real-time data?**
   - Should we use a different model?
   - Is there a parameter to control cache behavior?
   - Should we append unique IDs to each message?

## Our Use Case

We're building a real-time stock analysis platform where:
- Users request analysis for stocks (e.g., "analyse NVDA")
- We fetch live market data from APIs (Finnhub, Alpha Vantage, Alpaca)
- We inject this fresh data into system messages
- AI should analyze using the current prices, not cached historical data

**Critical requirement:** Every analysis must use the latest market data, as stock prices change constantly.

## Workarounds We've Tried

1. ✅ Adding timestamps to system messages → Still cached
2. ✅ Including "CRITICAL: Use these EXACT prices" → Ignored
3. ✅ Clearing browser cache → No effect
4. ✅ Using new chat threads → Helps temporarily
5. ✅ Varying the question phrasing → Helps temporarily

## What We Need

**Option A:** Documentation on how to disable/bypass caching for real-time data applications

**Option B:** A parameter or header to control cache behavior per request

**Option C:** Guidance on the recommended architecture for real-time data with C1/Thesys

## Code Reference

**Our chat route:** `c1-template/src/app/api/chat/route.ts`

```typescript
const llmStream = await client.chat.completions.create({
  model: "c1/anthropic/claude-sonnet-4/v-20250617",
  messages: messageStore.getOpenAICompatibleMessageList(),
  stream: true,
});
```

**Message structure:**
```typescript
{
  role: 'system',
  content: `🚨 REAL-TIME DATA (${new Date().toISOString()}) 🚨
  
  NVDA:
  - Current Price: ${data.current_price}
  ...
  
  CRITICAL: Use these EXACT prices in your response!`
}
```

## Request

Please advise on:
1. How C1/Thesys caching works
2. How to ensure fresh responses for real-time data
3. Best practices for financial/market data applications
4. Any cache-control parameters we should use

Thank you!
