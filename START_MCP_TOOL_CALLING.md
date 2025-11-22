# 🚀 Start Here: MCP Tool Calling in 15 Minutes

## What You're Building

An AI that **automatically fetches stock data** when users ask about stocks - no manual regex detection needed!

## Quick Setup (15 minutes)

### 1. Get API Key (5 min)

```bash
# Go to: https://financialdatasets.ai/
# Click "Sign Up" (free tier available)
# Go to Dashboard → API Keys
# Copy your key (starts with "fd_")
```

### 2. Add to Environment (1 min)

Edit `c1-template/.env`:
```bash
FINANCIAL_DATASETS_API_KEY=fd_your_key_here
```

### 3. Update MCP Config (1 min)

Edit `.kiro/settings/mcp.json` - replace `YOUR_API_KEY_HERE`:
```json
{
  "mcpServers": {
    "financialdatasets": {
      "url": "https://mcp.financialdatasets.ai/mcp",
      "headers": {
        "X-API-KEY": "fd_your_actual_key_here"
      },
      "disabled": false,
      "autoApprove": ["get_stock_price"]
    }
  }
}
```

### 4. Switch to Tool-Enabled Route (2 min)

**Windows:**
```cmd
cd c1-template\src\app\api\chat
copy route.ts route-backup.ts
copy route-with-tools.ts route.ts
```

**Mac/Linux:**
```bash
cd c1-template/src/app/api/chat
cp route.ts route-backup.ts
cp route-with-tools.ts route.ts
```

### 5. Restart Server (1 min)

```bash
cd c1-template
npm run dev
```

### 6. Test It! (5 min)

Open http://localhost:3002

**Test 1: Simple Price**
```
You: "What's NVDA price?"

Expected console output:
🔧 AI requested 1 tool call(s)
🔧 Executing tool: get_stock_data
📊 Arguments: {"ticker":"NVDA"}
✅ Tool result: {"ticker":"NVDA","price":180.45,...}

Expected response:
"NVDA is currently trading at $180.45..."
```

**Test 2: Company Name**
```
You: "What's Nvidia trading at?"

Expected:
AI recognizes "Nvidia" → NVDA
🔧 Calls get_stock_data("NVDA")
✅ Returns real-time price
```

**Test 3: Multiple Stocks**
```
You: "Compare AAPL and TSLA"

Expected:
🔧 AI calls get_stock_data("AAPL")
🔧 AI calls get_stock_data("TSLA")
✅ Returns comparison
```

## How to Know It's Working

### ✅ Success Indicators

**In Browser:**
- AI responds with current stock price
- Price is accurate (matches real market data)
- Response includes StockCard component

**In Server Console:**
```
📝 User message: "What's NVDA price?"
🔧 AI requested 1 tool call(s)
🔧 Executing tool: get_stock_data
📊 Arguments: {"ticker":"NVDA"}
✅ Tool result: {"ticker":"NVDA","price":180.45,...}
```

**In Response:**
- Real-time price (not outdated training data)
- Formatted StockCard component
- Accurate market data

### ❌ Troubleshooting

**Tool not called?**
```bash
# Check 1: Tools passed to API?
# Look for: tools: [financialDatasetsTool]

# Check 2: Tool description clear?
# Try explicit: "Get current price of NVDA"

# Check 3: API key valid?
# Test: curl https://mcp.financialdatasets.ai/mcp
```

**Tool fails?**
```bash
# Check 1: API key in .env?
echo $FINANCIAL_DATASETS_API_KEY

# Check 2: Network connectivity?
ping mcp.financialdatasets.ai

# Check 3: Fallback works?
# Should fall back to local /api/quote
```

**Wrong price?**
```bash
# Check 1: Tool result in console
# Should show real-time data

# Check 2: AI using tool data?
# Should NOT use training data

# Check 3: Cache cleared?
# Hard refresh: Ctrl+Shift+R
```

## Rollback (if needed)

```bash
cd c1-template/src/app/api/chat
cp route-backup.ts route.ts
cd ../../../..
npm run dev
```

## What's Different?

### Before (Manual Detection)
```typescript
// ❌ Regex detection
const tickerMatches = userMessage.match(/\b([A-Z]{2,5})\b/g);
if (tickerMatches) {
  const data = await fetch(`/api/analyze?ticker=${ticker}`);
  messageStore.addMessage({ role: 'system', content: JSON.stringify(data) });
}
```

**Problems:**
- Misses "Nvidia", "Apple", "Tesla"
- Always fetches (even if not needed)
- Hard to extend
- No context awareness

### After (Tool Calling)
```typescript
// ✅ AI decides when to fetch
const llmResponse = await client.chat.completions.create({
  model: "...",
  messages: messageStore.getOpenAICompatibleMessageList(),
  tools: [financialDatasetsTool], // AI can call this!
});
```

**Benefits:**
- AI understands "Nvidia" → NVDA
- Only fetches when needed
- Easy to extend (add more tools)
- Context-aware follow-ups

## Next Steps

### Add More Tools

**Earnings Data:**
```typescript
const earningsTool = {
  type: "function",
  function: {
    name: "get_earnings",
    description: "Get earnings data for a stock",
    parameters: {
      type: "object",
      properties: {
        ticker: { type: "string" }
      }
    }
  }
};
```

**News Data:**
```typescript
const newsTool = {
  type: "function",
  function: {
    name: "get_news",
    description: "Get recent news for a stock",
    parameters: {
      type: "object",
      properties: {
        ticker: { type: "string" }
      }
    }
  }
};
```

Then add to tools array:
```typescript
const availableTools = [
  financialDatasetsTool,
  earningsTool,  // New!
  newsTool,      // New!
];
```

## Documentation

- **Complete Guide**: `MCP_TOOL_CALLING_COMPLETE_GUIDE.md`
- **Visual Flow**: `MCP_TOOL_CALLING_FLOW.md`
- **Comparison**: `TOOL_CALLING_VS_MANUAL.md`
- **Summary**: `MCP_TOOL_CALLING_SUMMARY.md`

## Support

**Stuck?** Check:
1. Server console for errors
2. Browser console for errors
3. API key is valid
4. Network connectivity
5. Fallback to manual detection works

**Still stuck?** Review:
- `MCP_TOOL_CALLING_COMPLETE_GUIDE.md` - Detailed setup
- `MCP_TOOL_CALLING_FLOW.md` - Visual diagrams
- `TOOL_CALLING_VS_MANUAL.md` - Comparison

---

## Quick Reference

### Files Modified
- ✅ `c1-template/.env` - Added API key
- ✅ `.kiro/settings/mcp.json` - Added MCP server
- ✅ `c1-template/src/app/api/chat/route.ts` - Switched to tool-calling version

### Files Created
- ✅ `c1-template/src/app/api/chat/tools/financialDatasets.ts` - Tool definition
- ✅ `c1-template/src/app/api/chat/route-with-tools.ts` - Enhanced route

### Test Commands
```bash
# Start server
cd c1-template && npm run dev

# Test in browser
http://localhost:3002

# Run automated tests
python test_mcp_tool_calling.py
```

---

**Ready?** Get your API key and let's go! 🚀

Total time: ~15 minutes
