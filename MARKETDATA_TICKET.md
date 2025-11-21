# MarketData.app Support Ticket

## Category: API Problems

## Subject:
403 Error - IP Security Blocking Cloud Deployment (Considering Paid Subscription)

## Message:

Hello MarketData Support Team,

I'm experiencing a critical issue with your API that's preventing me from using your service for my production trading application. I'm currently evaluating MarketData.app for a paid subscription, but this blocker is preventing me from moving forward.

**Issue:**
Getting 403 errors with message: "Access denied. Only one device is permitted. Your IP address has changed, and your account is temporarily blocked for security reasons."

**API Key:** TmhUbDMyS0VRTmRUcWlyc3RRMUg5N1B6enM3VkNnZGMwdS1KXzRxdFVLYz0

**Test Results:**
- 0/5 requests successful (100% failure rate)
- All requests return 403 status
- Tested endpoints: /v1/stocks/quotes/
- Tested symbols: NVDA, AAPL, TSLA, MSFT

**Deployment Environment:**
- Platform: Vercel (cloud hosting)
- Application: Real-time stock trading analysis platform
- IP Type: Dynamic (standard for cloud deployments)
- Traffic: Legitimate API calls from single application

**Business Context:**
I chose MarketData.app because you have the best data quality and coverage in the market. Your API is superior to competitors (Alpha Vantage, Finnhub, Polygon) in terms of:
- Data accuracy
- Response speed
- Comprehensive coverage
- Clean API design

I'm ready to subscribe to a paid plan, but I need this IP restriction issue resolved first. My application requires cloud hosting (Vercel/AWS/similar), which inherently uses dynamic IPs.

**What I Need:**
1. Whitelist my account for dynamic IP usage, OR
2. Provide guidance on how to use your API with cloud hosting, OR
3. Increase device/IP limit to accommodate cloud deployments

**Questions:**
- Do your paid plans support cloud hosting with dynamic IPs?
- Is there a business/enterprise plan that removes IP restrictions?
- Can you recommend best practices for using your API in production?

**Why This Matters:**
I'm building a production trading application with real users. If MarketData.app can support cloud deployments, I'd prefer to use only your service instead of maintaining multiple API providers. Your data quality is worth paying for, but only if it works reliably in production.

Currently using free alternatives (Finnhub, Alpha Vantage, Alpaca) as fallbacks, but would happily consolidate to MarketData.app alone with a paid subscription if this issue is resolved.

Please advise on:
1. How to resolve the current 403 blocking
2. Which paid plan supports cloud hosting
3. Any additional configuration needed for production use

Thank you for your help. Looking forward to becoming a paying customer once this is resolved.

Best regards,
[Your Name]

---

**Technical Details (if needed):**
- Request URL: https://api.marketdata.app/v1/stocks/quotes/NVDA/?token=[KEY]
- Error: 403 Forbidden
- Error Message: "Access denied. Only one device is permitted. Your IP address has changed..."
- Deployment: Vercel Edge Network (multiple regions)
- Expected behavior: API should work from cloud hosting platforms
