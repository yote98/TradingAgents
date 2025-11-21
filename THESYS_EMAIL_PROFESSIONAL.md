# Professional Email to Thesys Support

**Subject:** C1 API Caching Issue with Real-Time Financial Data

---

Hi Thesys Team,

I'm building a real-time stock analysis platform using your C1 API (model: `c1/anthropic/claude-sonnet-4/v-20250617`) and experiencing what appears to be aggressive response caching that's problematic for my use case.

## The Issue

When users request stock analysis (e.g., "analyse NVDA"), the AI returns cached responses with outdated prices, even though I'm injecting fresh market data with timestamps into system messages.

**Example:**
- My backend fetches current price: **$180.64** (verified via Finnhub API)
- I inject this into system message: `"Current Price: 180.64"` with ISO timestamp
- AI response shows: **$145-150** (from a previous session)

## What I've Tried

1. ✅ Adding timestamps to system messages
2. ✅ Including explicit instructions: "Use these EXACT prices"
3. ✅ Implementing cache-busting with unique request IDs
4. ✅ Using new thread IDs for each request
5. ✅ Verified backend is returning correct data

Despite all this, the AI appears to be using semantic caching and returning responses based on question similarity rather than the injected data.

## Technical Details

**API Configuration:**
```typescript
const llmStream = await client.chat.completions.create({
  model: "c1/anthropic/claude-sonnet-4/v-20250617",
  messages: messageStore.getOpenAICompatibleMessageList(),
  stream: true,
});
```

**System Message Format:**
```
🚨 REAL-TIME DATA (2025-11-21T07:58:48.549Z) 🚨

NVDA:
- Current Price: 180.64
- Recommendation: HOLD
- Target: 189.67

CRITICAL: Use these EXACT prices in your response!
```

**Console Logs Confirm:**
```
🔥 Cache-busting ID: 1763713678190-nweine5cc
🎯 FOUND 1 TICKER(S): NVDA
✅ Injected data: NVDA=180.64
```

## My Questions

1. **Does C1 implement semantic caching?** If similar questions are asked, does it return cached responses regardless of system message content?

2. **How can I disable or bypass caching for real-time data?** Is there a parameter, header, or configuration option?

3. **Is there a recommended approach for financial applications?** Stock prices change constantly, so cached responses are problematic.

4. **Should I use a different model?** Is there a C1 model better suited for real-time data that doesn't cache aggressively?

## Use Case Context

I'm building a platform where users analyze stocks with live market data. Every request must use current prices, not historical data from previous sessions. The backend infrastructure is solid (triple-redundant data sources, real-time APIs), but the AI caching is preventing accurate analysis.

## What Would Help

- Documentation on C1's caching behavior
- A way to force fresh responses per request
- Guidance on best practices for real-time financial data
- Any cache-control parameters I should be using

I appreciate your help with this. The C1 API is powerful, but I need to ensure users get analysis based on current market conditions, not cached historical data.

Thanks,
[Your Name]

---

**Attachments to Include:**
- Screenshot of terminal logs showing cache-busting ID and correct data injection
- Screenshot of UI showing old prices despite fresh data
- Code snippet of your chat route implementation
