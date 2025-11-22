# 🎯 MCP Tool Calling - Complete Implementation Guide

## What We Built

Instead of manually detecting tickers and fetching data, the AI now **automatically calls MCP tools** when it needs financial data!

## Architecture

```
User: "What's NVDA price?"
  ↓
Chat API receives message
  ↓
AI analyzes message
  ↓
AI decides: "I need stock data for NVDA"
  ↓
AI calls: get_stock_data(ticker="NVDA")
  ↓
MCP tool executes → fetches real-time data
  ↓
Tool returns: { ticker: "NVDA", price: 180.45, ... }
  ↓
AI receives tool result
  ↓
AI responds: "NVDA is currently trading at $180.45..."
```

## Files Created/Modified

### 1. MCP Configuration (`.kiro/settings/mcp.json`)
```json
{
  "mcpServers": {
    "financialdatasets": {
      "url": "https://mcp.financialdatasets.ai/mcp",
      "headers": {
        "X-API-KEY": "YOUR_API_KEY_HERE"
      },
      "disabled": false,
      "autoApprove": [
        "get_stock_price",
        "get_company_info",
        "get_analyst_estimates"
      ]
    }
  }
}
```

### 2. Tool Definition (`c1-template/src/app/api/chat/tools/financialDatasets.ts`)
- Defines `get_stock_data` tool
- Handles MCP API calls
- Includes fallback to local API

### 3. Tool Executor (`c1-template/src/app/api/chat/tools/financialDatasets.ts`)
- `executeFinancialDatasetsTool()` function
- Calls Financial Datasets MCP server
- Returns formatted data

### 4. Chat Route with Tool Calling (`c1-template/src/app/api/chat/route-with-tools.ts`)
- Passes tools to AI
- Handles tool call requests
- Executes tools
- Returns results to AI
- Streams final response

## Setup Steps

### Step 1: Get Financial Datasets API Key

1. Go to https://financialdatasets.ai/
2. Sign up (they have a free tier!)
3. Get your API key from dashboard
4. Add to `.env`:

```bash
FINANCIAL_DATASETS_API_KEY=your_key_here
```

### Step 2: Update MCP Config

Replace `YOUR_API_KEY_HERE` in `.kiro/settings/mcp.json` with your actual key:

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

### Step 3: Switch to Tool-Enabled Route

**Option A: Replace existing route**
```bash
cd c1-template/src/app/api/chat
mv route.ts route-old.ts
mv route-with-tools.ts route.ts
```

**Option B: Test side-by-side**
Keep both and test the new one at `/api/chat-tools`

### Step 4: Add Environment Variable

Add to `c1-template/.env`:
```bash
FINANCIAL_DATASETS_API_KEY=your_key_here
```

### Step 5: Restart Server

```bash
cd c1-template
npm run dev
```

## Testing

### Test 1: Simple Price Query
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

### Test 2: Multiple Stocks
```
You: "Compare AAPL and TSLA"

Expected:
🔧 AI requested 2 tool call(s)
🔧 Executing tool: get_stock_data (AAPL)
🔧 Executing tool: get_stock_data (TSLA)
✅ Both results returned
```

### Test 3: Implicit Ticker
```
You: "Should I buy Nvidia?"

Expected:
AI recognizes "Nvidia" → NVDA
🔧 Calls get_stock_data("NVDA")
✅ Returns analysis with real-time data
```

## Run Automated Tests

```bash
python test_mcp_tool_calling.py
```

Watch the server console for tool call logs!

## Benefits vs Manual Approach

### Before (Manual Detection)
```typescript
// ❌ Manual ticker detection
const tickerMatches = textContent.match(/\b([A-Z]{2,5})\b/g);
if (tickerMatches) {
  // Manually fetch data
  const data = await fetch(`/api/analyze?ticker=${ticker}`);
  // Manually inject into conversation
  messageStore.addMessage({ role: 'system', content: JSON.stringify(data) });
}
```

**Problems:**
- Regex can miss tickers (e.g., "Nvidia" → NVDA)
- Manual data injection is clunky
- Hard to handle multiple stocks
- No context awareness

### After (AI Tool Calling)
```typescript
// ✅ AI decides when to fetch data
const llmResponse = await client.chat.completions.create({
  model: "c1/anthropic/claude-sonnet-4/v-20250930",
  messages: messageStore.getOpenAICompatibleMessageList(),
  tools: [financialDatasetsTool], // AI can call this automatically
});
```

**Benefits:**
- AI understands context ("Nvidia" → NVDA)
- AI decides when data is needed
- Handles multiple stocks intelligently
- Natural conversation flow
- Extensible (add more tools easily)

## Available MCP Tools

You can add more tools from Financial Datasets:

```typescript
const tools = [
  financialDatasetsTool,           // Stock prices
  companyInfoTool,                 // Fundamentals
  analystEstimatesTool,            // Analyst ratings
  earningsTool,                    // Earnings data
  insiderTradesTool,               // Insider activity
  institutionalOwnershipTool,      // Institutional holdings
  newsTool,                        // Company news
];
```

## Debugging

### Check if tool was called:
```bash
# Server console should show:
🔧 AI requested 1 tool call(s)
🔧 Executing tool: get_stock_data
📊 Arguments: {"ticker":"NVDA"}
✅ Tool result: {...}
```

### If tool isn't called:
1. Check AI has access to tools (tools array passed to API)
2. Check tool description is clear
3. Check API key is valid
4. Try more explicit prompt: "Get the current price of NVDA"

### If tool fails:
1. Check Financial Datasets API key
2. Check network connectivity
3. Check fallback to local API works
4. Check error logs

## Next Steps

1. ✅ Get Financial Datasets API key
2. ✅ Update `.env` with key
3. ✅ Update MCP config with key
4. ✅ Switch to tool-enabled route
5. ✅ Test with "What's NVDA price?"
6. ✅ Watch console for tool calls
7. ✅ Verify real-time data in response

## Advanced: Add More Tools

Want to add earnings data?

```typescript
// c1-template/src/app/api/chat/tools/earnings.ts
export const earningsTool = {
  type: "function" as const,
  function: {
    name: "get_earnings",
    description: "Get earnings data and estimates for a stock",
    parameters: {
      type: "object",
      properties: {
        ticker: { type: "string" },
      },
      required: ["ticker"],
    },
  },
};

export async function executeEarningsTool(args: { ticker: string }) {
  // Call MCP server for earnings data
  // ...
}
```

Then add to tools array:
```typescript
const availableTools = [
  financialDatasetsTool,
  earningsTool, // New!
];
```

## Documentation

- Financial Datasets MCP: https://docs.financialdatasets.ai/mcp-server
- MCP Protocol: https://modelcontextprotocol.io/
- OpenAI Tool Calling: https://platform.openai.com/docs/guides/function-calling
- Thesys C1 Docs: https://docs.thesys.dev/

---

**The key insight**: Let the AI decide when to fetch data, not your code! 🎯

The AI is smarter than regex at understanding when users want stock data.
