# 🚀 DEPLOY TO RENDER - ESCAPE VERCEL HELL

Vercel is being difficult. Let's deploy to Render instead - it's simpler and has NO caching issues.

## Step-by-Step Render Deployment (5 Minutes)

### 1. Go to Render Dashboard
https://dashboard.render.com/

### 2. Create New Web Service
- Click **"New +"** button (top right)
- Select **"Web Service"**

### 3. Connect GitHub Repository
- Click **"Connect account"** if not connected
- Select repository: **TradingAgents**
- Click **"Connect"**

### 4. Configure Service
Fill in these settings:

**Basic Settings:**
- **Name**: `alphaflow-ai` (or whatever you want)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `c1-template`

**Build & Deploy:**
- **Runtime**: `Node`
- **Build Command**: 
  ```
  npm install && npm run build
  ```
- **Start Command**: 
  ```
  npm start
  ```

### 5. Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these (copy from your `.env` file):

```
THESYS_API_KEY=your_thesys_key_here
NEXT_PUBLIC_BASE_URL=https://alphaflow-ai.onrender.com
ALPHA_VANTAGE_API_KEY=your_key
MARKETDATA_API_KEY=your_key
COINGECKO_API_KEY=your_key
NEWSDATA_API_KEY=your_key
REDDIT_CLIENT_ID=your_id
REDDIT_CLIENT_SECRET=your_secret
REDDIT_USER_AGENT=your_agent
```

**IMPORTANT**: Set `NEXT_PUBLIC_BASE_URL` to your Render URL (you'll get this after deploy)

### 6. Select Plan
- Choose **"Free"** plan (perfect for testing)
- Free tier includes:
  - 750 hours/month
  - Automatic SSL
  - Custom domains

### 7. Create Web Service
- Click **"Create Web Service"**
- Wait 5-10 minutes for first deploy
- Watch the logs for any errors

### 8. Test Your Deployment
Once deployed, you'll get a URL like:
`https://alphaflow-ai.onrender.com`

Test it:
1. Go to `https://alphaflow-ai.onrender.com/chat`
2. Ask: "what's NVDA price?"
3. Should see **$180+** (correct price!)

### 9. Update NEXT_PUBLIC_BASE_URL
If you forgot to set it correctly:
1. Go to **Environment** tab
2. Edit `NEXT_PUBLIC_BASE_URL`
3. Set to your Render URL
4. Click **"Save Changes"**
5. Render will auto-redeploy

### 10. Point Your Domain (Optional)
Once working on Render:
1. Go to **Settings** tab
2. Scroll to **"Custom Domain"**
3. Click **"Add Custom Domain"**
4. Enter: `www.ai-trades.my`
5. Follow DNS instructions
6. Wait for SSL certificate (automatic)

## Why Render > Vercel for This

✅ **No aggressive caching** - Render doesn't cache like Vercel
✅ **Simpler config** - Less magic, more predictable
✅ **Better for dynamic apps** - Perfect for real-time data
✅ **Free tier** - Same as Vercel
✅ **Auto SSL** - Just like Vercel
✅ **GitHub integration** - Auto-deploy on push

## Troubleshooting

**Build fails?**
- Check Node version (should be 18+)
- Check build logs for errors
- Make sure `package.json` has `"start": "next start"`

**App crashes?**
- Check environment variables are set
- Check logs in Render dashboard
- Make sure all API keys are valid

**Still seeing old prices?**
- Clear browser cache
- Try incognito mode
- Check `NEXT_PUBLIC_BASE_URL` is correct

## Next Steps After Render Works

1. Test thoroughly on Render URL
2. If working perfectly, point domain to Render
3. Keep Vercel as backup (or delete it)
4. Enjoy life without caching nightmares! 🎉

## Need Help?

Render has great docs: https://render.com/docs/deploy-nextjs-app

Or just ask me - I'll walk you through it!
