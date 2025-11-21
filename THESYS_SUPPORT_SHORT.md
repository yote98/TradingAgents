# Quick Message for Thesys Chatbot

Hi! I'm using the C1 API with model `c1/anthropic/claude-sonnet-4/v-20250617` for a real-time stock analysis app.

**Problem:** The AI returns cached responses with old stock prices even when I inject fresh data with timestamps into system messages.

**Example:**
- My backend fetches: NVDA price = $180.64 (current)
- I inject into system message: "Current Price: 180.64" with timestamp
- AI response shows: $145-150 (old cached data)

**Questions:**
1. Does C1 implement semantic caching for similar questions?
2. How can I force fresh responses for real-time financial data?
3. Is there a cache-control parameter or header I should use?
4. Should I append unique IDs to bypass caching?

My use case requires every request to use the latest market data, not cached responses. What's the recommended approach?

Thanks!
