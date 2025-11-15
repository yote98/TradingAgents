# Deploy MarketData.app Integration to Render

## Quick Steps

### 1. Add Environment Variable to Render

1. Go to your Render dashboard: https://dashboard.render.com/
2. Select your **backend service** (tradingagents-api)
3. Click **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Add:
   ```
   Key: MARKETDATA_API_KEY
   Value: TmhUbDMyS0VRTmRUcWlyc3RRMUg5N1B6enM3VkNnZGMwdS1KXzRxdFVLYz0
   ```
6. Click **Save Changes**

### 2. Trigger Redeploy

Render will automatically redeploy when you save the environment variable.

**OR** manually trigger:
1. Go to **Manual Deploy** tab
2. Click **Deploy latest commit**

### 3. Verify Deployment

Once deployed, test the API:

```bash
# Test health endpoint
curl https://your-backend.onrender.com/health

# Test quote endpoint
curl https://your-backend.onrender.com/quote/AAPL
```

Expected response:
```json
{
  "symbol": "AAPL",
  "price": 272.59,
  "source": "MarketData.app (Real-time)",
  "updated_datetime": "2025-11-15T08:59:53"
}
```

### 4. Test from Frontend

1. Go to your deployed frontend
2. Try analyzing a stock (e.g., "Analyze AAPL")
3. Check that prices are accurate and up-to-date

## Troubleshooting

### If prices still seem wrong:

1. **Check Render logs**:
   - Go to your backend service
   - Click **Logs** tab
   - Look for MarketData.app errors

2. **Verify environment variable**:
   - Make sure `MARKETDATA_API_KEY` is set correctly
   - No extra spaces or line breaks

3. **Clear cache**:
   - The system caches data for 1 hour
   - Wait an hour or restart the service

4. **Check API limits**:
   - Free tier: 100 calls/day
   - Check your MarketData.app dashboard

### If API returns errors:

**401 Unauthorized**:
- Token is invalid or expired
- Check your MarketData.app account

**429 Too Many Requests**:
- Hit daily limit (100 calls)
- Wait until tomorrow or upgrade plan

**Timeout**:
- Network issue
- System will fallback to FMP automatically

## Data Source Fallback Chain

The system automatically falls back if MarketData.app fails:

1. **MarketData.app** (primary) - Real-time prices
2. **FMP** (fallback) - Fundamentals + prices
3. **NewsData.io** - News and sentiment
4. **NewsAPI.org** - News fallback
5. **Alpha Vantage** - Legacy fallback

## Monitoring

### Check API Usage

**MarketData.app Dashboard**:
- https://www.marketdata.app/dashboard
- View daily usage
- Check remaining calls
- Upgrade if needed

### Render Metrics

**Backend Service**:
- Response times
- Error rates
- Memory usage
- CPU usage

## Success Criteria

✅ Health endpoint returns "healthy"
✅ Quote endpoint returns accurate prices
✅ Prices match current market data
✅ No errors in Render logs
✅ Frontend displays correct prices

## Next Steps

Once MarketData.app is deployed:

1. ✅ Test with multiple stocks
2. ✅ Verify data accuracy
3. ✅ Monitor API usage
4. 🎉 Ready for beta launch!

---

**Deployment Date**: November 16, 2025
**Status**: Ready to Deploy
