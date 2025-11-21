# Deploy Fixed Code to Production

## What's Fixed
✅ Support/resistance calculation now uses current price (not today's high/low)
✅ SELL recommendations converted to bearish HOLD for retail traders
✅ Target prices now correctly above current price for BUY
✅ Stop loss now correctly below current price for BUY

## Files Changed
- `c1-template/src/lib/agents/market-agent.ts` - Fixed support/resistance calculation
- `c1-template/src/lib/agents/strategy-agent.ts` - Fixed SELL to HOLD conversion

## Deploy to Production

### Step 1: Commit Changes
```bash
cd c1-template
git add .
git commit -m "Fix: Correct support/resistance calculation and SELL to HOLD conversion"
```

### Step 2: Push to GitHub
```bash
git push origin main
```

### Step 3: Vercel Auto-Deploy
Vercel will automatically detect the push and redeploy (takes 2-3 minutes)

### Step 4: Verify Deployment
Once deployed, test on your live site:
- Go to your production URL
- Try "analyze NVDA"
- Verify target > current price for BUY
- Verify stop loss < current price for BUY

## Manual Deploy (if auto-deploy disabled)
```bash
cd c1-template
vercel --prod
```

## Clear Vercel Cache (if needed)
If you still see old data after deploy:
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Data Cache
4. Click "Purge Everything"
