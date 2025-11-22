# 🚀 Deploy Tool Calling to Vercel

## What's Ready

✅ Tool calling works perfectly on localhost
✅ Real-time prices verified against TradingView
✅ AI automatically fetches data when users mention tickers
✅ No more stale training data

## Pre-Deployment Checklist

### 1. Commit Your Changes

```bash
cd c1-template
git add .
git commit -m "Add AI tool calling for automatic real-time data fetching"
git push
```

### 2. Set Environment Variables on Vercel

Go to your Vercel dashboard → Project Settings → Environment Variables

**Add these variables:**

```
THESYS_API_KEY=sk-th-0h5HIeJx7xYlMbXxs1wuC0wzRyqaWk8suygFlGtSPzcCxE69JzxrYoHmz0iQj1SkG69mIaUsIZkq5FzDOoK0p52ptUn9ooELJYMC

MARKETDATA_API_KEY=TmhUbDMyS0VRTmRUcWlyc3RRMUg5N1B6enM3VkNnZGMwdS1KXzRxdFVLYz0

ALPHA_VANTAGE_API_KEY=H0MDWALD76X9X96C

NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

**CRITICAL:** Change `NEXT_PUBLIC_BASE_URL` to your actual Vercel URL!

### 3. Deploy

```bash
vercel --prod
```

Or push to your main branch if you have auto-deploy enabled.

## After Deployment

### Test It!

1. **Go to your Vercel URL** (e.g., `https://your-app.vercel.app/chat`)

2. **Ask about a stock:**
   ```
   What's the price of NVDA?
   ```

3. **Check Vercel logs:**
   ```bash
   vercel logs --follow
   ```

   Look for:
   ```
   🔧 AI requested 1 tool call(s)
   🔧 Executing tool: get_stock_data
   📡 Trying MarketData.app for NVDA...
   ✅ Got data from MarketData.app
   ```

### Verify Real-Time Data

- Prices should match TradingView
- No $145 or other stale prices
- AI should mention specific dollar amounts with cents

## Troubleshooting

### If Tool Calling Doesn't Work on Vercel

**Check 1: Environment Variables**
```bash
vercel env ls
```
Make sure all keys are set, especially `NEXT_PUBLIC_BASE_URL`

**Check 2: Logs**
```bash
vercel logs --follow
```
Look for tool execution logs

**Check 3: Clear Vercel Cache**
```bash
vercel --prod --force
```

### If Prices Are Still Stale

**Option 1: Hard refresh browser**
- Chrome: Ctrl+Shift+R
- Clear browser cache

**Option 2: Check NEXT_PUBLIC_BASE_URL**
- Should be your Vercel URL, not localhost
- Must start with `https://`

**Option 3: Verify API endpoints exist**
- `/api/quote` should return data
- `/api/analyze` should return data

## What Changed

### Files Modified:
1. `c1-template/src/app/api/chat/route.ts` - Added tool execution logic
2. `c1-template/src/app/api/chat/systemPrompts.ts` - Updated AI instructions
3. `c1-template/src/app/api/chat/tools/financialDatasets.ts` - Tool definition (already existed)
4. `c1-template/.env` - Added NEXT_PUBLIC_BASE_URL

### How It Works:
1. User mentions a ticker (e.g., "AAPL")
2. AI calls `get_stock_data` tool
3. Tool fetches from MarketData.app → Alpha Vantage → yfinance
4. AI uses real-time data in response
5. No more stale training data!

## Success Indicators

✅ Vercel logs show tool calls being executed
✅ Prices match TradingView
✅ AI mentions specific dollar amounts
✅ No generic/outdated prices
✅ Response includes current market conditions

## Rollback Plan

If something goes wrong, you can revert:

```bash
git revert HEAD
git push
```

Or redeploy the previous version from Vercel dashboard.

## Next Steps After Successful Deployment

1. Test with multiple tickers
2. Test with natural language queries
3. Monitor Vercel logs for any errors
4. Check API usage (MarketData.app, Alpha Vantage)
5. Celebrate! 🎉

---

**Remember:** The tool uses your free APIs (MarketData.app, Alpha Vantage, yfinance), so no additional costs!
