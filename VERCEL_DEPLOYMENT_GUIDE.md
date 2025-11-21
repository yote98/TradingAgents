# Vercel Deployment Quick Reference

## 🔗 Finding Your Deployment URL

Your Vercel deployment URL can be found in:
1. **Vercel Dashboard**: https://vercel.com/dashboard
2. **Deployment Logs**: Look for "Deployment completed" message
3. **Git Commit**: Check the Vercel bot comment on your GitHub commit

Format: `https://your-project-name.vercel.app` or `https://your-project-name-hash.vercel.app`

## ✅ Post-Deployment Checklist

### 1. Verify Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Required Variables:**
```bash
# OpenAI
OPENAI_API_KEY=sk-...

# MarketData.app (Primary)
NEXT_PUBLIC_MARKETDATA_API_KEY=your_key
MARKETDATA_API_KEY=your_key

# Finnhub (Backup)
FINNHUB_API_KEY=your_key

# Alpha Vantage
ALPHA_VANTAGE_API_KEY=your_key

# Stripe (if using payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...

# Optional
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
TWITTER_BEARER_TOKEN=...
```

### 2. Test Your Deployment

**Quick Test:**
```bash
# Update the URL in test_deployed_vercel.py
python test_deployed_vercel.py
```

**Manual Browser Tests:**
1. Visit: `https://your-app.vercel.app`
2. Visit: `https://your-app.vercel.app/chat`
3. Visit: `https://your-app.vercel.app/api/health`

### 3. Common Issues & Solutions

#### Issue: "Failed to fetch" errors
**Solution:** Check environment variables are set in Vercel (not just locally)

#### Issue: API returns old/cached data
**Solution:** 
```bash
# Clear Vercel cache
vercel --prod --force
```

#### Issue: 500 Internal Server Error
**Solution:** Check Vercel Function Logs:
- Dashboard → Your Project → Deployments → Click deployment → Functions tab

#### Issue: CORS errors
**Solution:** Already configured in `next.config.ts`, but verify:
```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
      ],
    },
  ];
}
```

#### Issue: Slow cold starts
**Solution:** This is normal for serverless. First request after idle takes 2-5 seconds.

### 4. Monitoring

**View Logs:**
```bash
vercel logs your-deployment-url
```

**Or in Dashboard:**
Dashboard → Your Project → Deployments → Click deployment → Runtime Logs

### 5. Redeploy if Needed

**From CLI:**
```bash
cd c1-template
vercel --prod
```

**From GitHub:**
Just push to main branch - auto-deploys

## 🐛 Debugging Data Accuracy Issues

Based on previous session issues with LLM hallucination:

### Test Real-Time Data:
```bash
# Test NVDA price (should be ~$180, not $149)
curl "https://your-app.vercel.app/api/stock-analysis?symbol=NVDA"

# Test S&P 500 (should be ~6,538, not 5,900)
curl "https://your-app.vercel.app/api/market-overview"
```

### Verify System Prompts:
The system prompts in `c1-template/src/app/api/chat/systemPrompts.ts` should include:
```typescript
⚠️ CRITICAL: You MUST use ONLY the real-time data provided by the tools.
NEVER use training data or make up numbers.
```

### Check Data Sources:
1. **Primary:** MarketData.app API
2. **Fallback:** Yahoo Finance direct API
3. **Backend:** TradingAgents Python API

## 📊 Performance Expectations

- **Static Pages:** < 1s load time
- **API Health Check:** < 500ms
- **Market Overview:** 1-3s
- **Stock Analysis:** 2-5s
- **Full AI Analysis:** 30-60s (with TradingAgents)
- **Chat Response:** 3-10s (streaming)

## 🔄 Next Steps After Deployment

1. ✅ Run `test_deployed_vercel.py`
2. ✅ Test chat with real stock queries
3. ✅ Verify prices match real market data
4. ✅ Check all 5 analysts are working
5. ✅ Test on mobile devices
6. ✅ Set up custom domain (optional)
7. ✅ Enable analytics (Vercel Analytics)

## 📞 Need Help?

Check these files for context:
- `DATA_ACCURACY_ISSUES_SUMMARY.md` - Previous data issues
- `FINAL_LAUNCH_SUMMARY.md` - Launch checklist
- `BETA_TESTING_CHECKLIST.md` - Testing guide
