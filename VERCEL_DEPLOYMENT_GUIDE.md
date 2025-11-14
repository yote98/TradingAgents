# 🚀 Deploy C1 Chat to Vercel

## Step 1: Prepare Your Repository

### A. Create .gitignore (if not exists)
Make sure these are in your `.gitignore`:
```
.env
.env.local
node_modules/
.next/
coach_n_signals.json
analyzed_signals.json
eval_results/
```

### B. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - C1 Chat with TradingAgents"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Step 2: Deploy to Vercel

### 1. Go to Vercel
Visit: https://vercel.com

### 2. Sign in with GitHub
Click "Sign in with GitHub"

### 3. Import Your Repository
- Click "Add New Project"
- Select your repository
- Click "Import"

### 4. Configure Project

**Root Directory:** `c1-template`

**Environment Variables (REQUIRED):**
```
THESYS_API_KEY=sk-th-0h5HIeJx7xYlMbXxs1wuC0wzRyqaWk8suygFlGtSPzcCxE69JzxrYoHmz0iQj1SkG69mIaUsIZkq5FzDOoK0p52ptUn9ooELJYMC
```

**Optional Environment Variables:**
```
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CX_KEY=your_google_cx_key
GEMINI_API_KEY=your_gemini_key
```

### 5. Deploy!
Click "Deploy" and wait 2-3 minutes.

## Step 3: What Works on Vercel

✅ **Works Great:**
- C1 Chat interface
- Quick stock queries
- OpenAI streaming responses
- Simple analysis (< 30 seconds)

⚠️ **Limited:**
- Full TradingAgents analysis (may timeout after 60 seconds)
- Discord bot (needs separate deployment)
- Auto-analyzer (needs separate deployment)

## Step 4: Test Your Deployment

Once deployed, visit your Vercel URL and try:
- "What's the current price of AAPL?"
- "Analyze TSLA" (quick analysis)

## 🔧 For Full System (Discord Bot + Auto-Analyzer)

The Discord bot and auto-analyzer need to run 24/7, which Vercel can't do.

**Recommended: Deploy backend to Railway**

See `RAILWAY_DEPLOYMENT_GUIDE.md` for instructions.

## 📊 Architecture

```
┌─────────────────────────────────────┐
│         VERCEL (FREE)               │
│                                     │
│  - C1 Chat UI                       │
│  - Quick queries                    │
│  - View results                     │
└─────────────────────────────────────┘
           │
           │ (For long analyses)
           ▼
┌─────────────────────────────────────┐
│      RAILWAY ($5-7/month)           │
│                                     │
│  - Discord Bot (24/7)               │
│  - Auto-Analyzer (24/7)             │
│  - Full TradingAgents               │
└─────────────────────────────────────┘
```

## 🎯 Next Steps

1. Deploy C1 Chat to Vercel (follow steps above)
2. Test the chat interface
3. Deploy backend to Railway for 24/7 operation
4. Connect them together

## 🆘 Troubleshooting

**Build fails?**
- Check that `c1-template` is set as root directory
- Verify all dependencies are in `package.json`

**Chat not working?**
- Check THESYS_API_KEY is set correctly
- Look at Vercel logs for errors

**Timeout errors?**
- This is normal for long analyses
- Deploy backend to Railway for full functionality

## 📝 Important Notes

- Your `.env` file is NOT pushed to GitHub (it's in .gitignore)
- You must add environment variables in Vercel dashboard
- Free tier has 60-second timeout limit
- For production, consider Vercel Pro ($20/month) for longer timeouts
