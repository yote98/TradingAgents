# MarketData.app Support Ticket Template

## Form Fields to Fill:

### Category of Question:
✅ **API Problems** (already selected)

### API Request:
```
https://api.marketdata.app/v1/options/chain/SPY/
```
(This is already filled in - you can keep it or change to the specific endpoint failing)

### Ray ID:
```
8612e1667fc4d4ec-MCI
```
(Already filled in - keep this)

### Subject:
```
API returning "Failed to fetch quote" errors in production - Vercel deployment
```

### Message:
```
Hello MarketData Support Team,

I'm experiencing consistent API failures in my production Vercel deployment. The API was working in development but fails in production.

**Issue Details:**
- Error: "Failed to fetch quote" 
- Occurs on: Stock quote endpoints (e.g., /v1/stocks/quotes/{symbol}/)
- Environment: Vercel serverless functions (Node.js 22.x)
- Region: US East (iad1)
- Started: November 21, 2024

**What I've Tried:**
1. Verified API key is correctly set in Vercel environment variables
2. Tested with multiple symbols (NVDA, AAPL, TSLA, SPY)
3. Confirmed API key works in local development
4. Checked rate limits - well within free tier limits
5. Implemented Yahoo Finance fallback as temporary solution

**Request Details:**
- API Key: [Your API key - first/last 4 chars only]
- Typical request: GET https://api.marketdata.app/v1/stocks/quotes/NVDA/
- Headers: Authorization: Bearer {token}
- Expected: Stock quote data
- Actual: Connection failures or timeout errors

**Impact:**
This is blocking my production deployment. I've had to implement a fallback to Yahoo Finance, but would prefer to use MarketData.app as the primary data source.

**Questions:**
1. Are there any known issues with Vercel serverless functions?
2. Do I need to whitelist Vercel's IP ranges?
3. Are there any CORS or rate limiting issues specific to serverless environments?
4. Is there a different endpoint I should use for production?

**Additional Context:**
- Using the free tier currently
- Planning to upgrade to paid tier once production is stable
- Application: AI-powered stock analysis platform
- GitHub: https://github.com/yote98/TradingAgents

Please let me know if you need any additional information or logs.

Thank you for your help!

Best regards,
[Your name]
```

---

## Alternative Shorter Version (if you prefer):

### Subject:
```
Production API failures - "Failed to fetch quote" on Vercel deployment
```

### Message:
```
Hi MarketData Team,

I'm getting "Failed to fetch quote" errors when calling your API from my Vercel production deployment, but it works fine locally.

Environment:
- Platform: Vercel serverless (Node.js 22.x)
- Region: US East
- Endpoints failing: /v1/stocks/quotes/{symbol}/
- API key is correctly set in environment variables

The same code and API key work perfectly in local development but fail in production.

Is there something specific I need to configure for Vercel/serverless environments? Do I need to whitelist IPs?

Currently using Yahoo Finance as a fallback, but would prefer MarketData.app as primary source.

Thanks for your help!
```

---

## What to Include (Optional):

If they ask for more details, you can provide:

**Error Logs:**
```
Error: Failed to fetch quote for NVDA
Status: undefined or timeout
Environment: Production (Vercel)
Timestamp: 2024-11-21
```

**Working Local Request:**
```bash
curl -H "Authorization: Bearer YOUR_KEY" \
  https://api.marketdata.app/v1/stocks/quotes/NVDA/
# Works fine locally
```

**Failing Production Request:**
```
Same request from Vercel serverless function
Returns: Connection error or timeout
```

---

## Tips:

1. **Be specific** - Mention it's a Vercel serverless deployment
2. **Show you've tried** - List the troubleshooting steps
3. **Mention upgrade plans** - Shows you're a serious user
4. **Include Ray ID** - Already captured in the form
5. **Be polite** - Support teams appreciate courtesy

## After Submitting:

1. You should get a ticket number
2. Response time is usually 24-48 hours
3. Meanwhile, your Yahoo Finance fallback will keep things working
4. Once they respond, you can update your code accordingly

---

**Copy the message above and paste it into the "Message" field in the form!**
