# Stock Comparison Bug

## Issue
When user asks "Compare AAPL to MSFT", the AI provides only a text summary instead of showing StockCard components with real-time data for both stocks.

## Expected Behavior
1. System detects both AAPL and MSFT tickers
2. Fetches real-time data for both stocks
3. Injects StockCard components into the conversation
4. AI displays both StockCards followed by comparison analysis

## Actual Behavior
- AI provides text summary: "Analysis complete. Apple shows stronger momentum with BUY rating (78% confidence) while Microsoft presents a cautious HOLD (58% confidence)."
- No StockCard components are shown
- No real-time prices displayed

## Root Causes

### 1. StockCard Component Not Rendering
- StockCards are being output as text: `<StockCard ticker="AAPL".../>` 
- C1Chat doesn't recognize custom components
- Need to register components with TheSys GenUI SDK

### 2. AI Not Following Instructions
- System message includes StockCard syntax
- AI is ignoring it and providing summary instead
- Need stronger prompting to force component usage

## Solutions

### Short-term Fix
Update system prompts to be more explicit:
```
**MANDATORY: Start your response with these StockCard components (copy EXACTLY):**

<StockCard ticker="AAPL" price={268.55} ... />
<StockCard ticker="MSFT" price={378.90} ... />

**Then provide your comparison analysis**
```

### Long-term Fix
1. Register StockCard with TheSys GenUI SDK
2. Use proper component rendering instead of text
3. Test with TheSys playground to verify component support

## Testing
Try these prompts:
- "Compare AAPL to MSFT"
- "Compare AAPL, MSFT, and GOOGL"
- "Which is better: NVDA or AMD?"

Expected: Should see StockCard for each stock, then comparison

## Files to Check
- `c1-template/src/app/api/chat/route.ts` - Data injection logic
- `c1-template/src/app/api/chat/systemPrompts.ts` - AI instructions
- `c1-template/src/app/chat/page.tsx` - C1Chat configuration
- TheSys GenUI SDK docs - Component registration

## Priority
**HIGH** - This is a core feature that's not working properly

## Related Issues
- STOCKCARD_BUG_FIX.md - Component rendering issue
- Both bugs stem from same root cause: custom components not registered with C1Chat
