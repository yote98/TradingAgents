# 🚀 Deploy Complete System to Render

## Why Render is Perfect for Your System

✅ **Supports Python** (Discord bot + TradingAgents)  
✅ **Supports Next.js** (C1 Chat frontend)  
✅ **24/7 background services** (Discord bot runs continuously)  
✅ **Free tier available** (with limitations)  
✅ **Easy deployment** from GitHub  

## 📦 What We'll Deploy

1. **C1 Chat Frontend** (Next.js) - Web Service
2. **Discord Bot + Auto-Analyzer** (Python) - Background Worker
3. **TradingAgents API** (Python) - Web Service (optional)

---

## Part 1: Deploy C1 Chat Frontend

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Ready for Render deployment"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Create Web Service on Render

1. Go to https://render.com
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:

**Name:** `tradingagents-c1-chat`  
**Root Directory:** `c1-template`  
**Environment:** `Node`  
**Build Command:** `npm install && npm run build`  
**Start Command:** `npm start`  
**Instance Type:** Free (or Starter $7/month for better performance)

**Environment Variables:**
```
THESYS_API_KEY=sk-th-0h5HIeJx7xYlMbXxs1wuC0wzRyqaWk8suygFlGtSPzcCxE69JzxrYoHmz0iQj1SkG69mIaUsIZkq5FzDOoK0p52ptUn9ooELJYMC
```

6. Click "Create Web Service"

✅ **Your C1 Chat will be live at:** `https://tradingagents-c1-chat.onrender.com`

---

## Part 2: Deploy Discord Bot + Auto-Analyzer

This is the 24/7 background service that captures signals and runs analyses.

### Step 1: Create requirements.txt

Create `requirements_discord.txt` in your root directory:
```txt
discord.py>=2.3.0
python-dotenv>=1.0.0
langchain>=0.1.0
langchain-openai>=0.0.5
yfinance>=0.2.0
pandas>=2.0.0
```

### Step 2: Create Start Script

Create `start_discord_system.py`:
```python
"""
Start Discord Bot + Auto-Analyzer
Runs both processes together for Render deployment
"""
import subprocess
import time
import sys

def start_process(command, name):
    """Start a process and return the Popen object"""
    print(f"🚀 Starting {name}...")
    return subprocess.Popen(
        command,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True
    )

def main():
    print("="*60)
    print("🤖 TradingAgents Discord System")
    print("="*60)
    
    # Start Discord bot
    bot_process = start_process(
        "python discord_to_coach_n.py",
        "Discord Bot"
    )
    
    # Wait a bit for bot to start
    time.sleep(5)
    
    # Start auto-analyzer
    analyzer_process = start_process(
        "python auto_analyze_signals.py",
        "Auto-Analyzer"
    )
    
    print("\n✅ Both services started!")
    print("📡 Discord Bot: Capturing signals")
    print("🔍 Auto-Analyzer: Watching for new signals")
    print("\nPress Ctrl+C to stop\n")
    
    try:
        # Keep running and show output
        while True:
            # Show bot output
            bot_line = bot_process.stdout.readline()
            if bot_line:
                print(f"[BOT] {bot_line.strip()}")
            
            # Show analyzer output
            analyzer_line = analyzer_process.stdout.readline()
            if analyzer_line:
                print(f"[ANALYZER] {analyzer_line.strip()}")
            
            time.sleep(0.1)
            
    except KeyboardInterrupt:
        print("\n\n👋 Stopping services...")
        bot_process.terminate()
        analyzer_process.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()
```

### Step 3: Create Background Worker on Render

1. In Render dashboard, click "New +" → "Background Worker"
2. Connect your repository
3. Configure:

**Name:** `tradingagents-discord-bot`  
**Environment:** `Python 3`  
**Build Command:** `pip install -r requirements_discord.txt`  
**Start Command:** `python start_discord_system.py`  
**Instance Type:** Starter ($7/month - required for 24/7)

**Environment Variables:**
```
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CHANNEL_ID=1364899537931599916
OPENAI_API_KEY=your_openai_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
```

4. Click "Create Background Worker"

✅ **Your Discord bot will run 24/7!**

---

## Part 3: Verify Deployment

### Test C1 Chat
1. Visit your Render URL: `https://tradingagents-c1-chat.onrender.com`
2. Try a query: "What's the price of AAPL?"
3. Check if streaming works

### Test Discord Bot
1. Post a message in your Unusual Whales channel with a ticker (e.g., "$TSLA news")
2. Check Render logs to see if it was captured
3. Wait 30 seconds for auto-analyzer to trigger

### View Logs
- Go to Render dashboard
- Click on your service
- Click "Logs" tab
- Watch real-time output

---

## 💰 Cost Breakdown

**Free Option:**
- C1 Chat: Free (spins down after inactivity)
- Discord Bot: ❌ Can't run 24/7 on free tier

**Paid Option ($7/month):**
- C1 Chat: Free or $7/month (always on)
- Discord Bot: $7/month (required for 24/7)
- **Total: $7-14/month**

---

## 🔧 Configuration Tips

### Auto-Deploy on Git Push
Render automatically redeploys when you push to GitHub!

### Environment Variables
Add/update in Render dashboard → Service → Environment

### View Analysis Results
Results are saved in the worker's filesystem, but won't persist across restarts.
Consider adding cloud storage (S3, Google Cloud Storage) for permanent storage.

### Scaling
Upgrade instance type in Render dashboard for better performance.

---

## 🆘 Troubleshooting

**C1 Chat not loading?**
- Check build logs for errors
- Verify THESYS_API_KEY is set
- Check if root directory is set to `c1-template`

**Discord bot not capturing messages?**
- Verify DISCORD_BOT_TOKEN is correct
- Check bot has MESSAGE_CONTENT intent enabled
- Look at worker logs for errors

**Auto-analyzer not triggering?**
- Check if signals file is being created
- Verify OpenAI API key is set
- Look for timeout errors in logs

**Free tier spinning down?**
- Upgrade to Starter ($7/month) for always-on
- Or accept 50-second cold start delay

---

## 🎯 Next Steps

1. Deploy C1 Chat (Part 1)
2. Test the chat interface
3. Deploy Discord Bot (Part 2)
4. Monitor logs to verify everything works
5. Enjoy your 24/7 automated trading intelligence system!

---

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│         RENDER WEB SERVICE              │
│                                         │
│  C1 Chat Frontend (Next.js)             │
│  - Chat interface                       │
│  - Quick queries                        │
│  - View results                         │
│                                         │
│  URL: your-app.onrender.com             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      RENDER BACKGROUND WORKER           │
│                                         │
│  Discord Bot + Auto-Analyzer (Python)   │
│  - Captures Unusual Whales signals      │
│  - Auto-analyzes new signals            │
│  - Runs TradingAgents                   │
│  - Saves results                        │
│                                         │
│  Runs 24/7                              │
└─────────────────────────────────────────┘
```

Perfect setup for your automated trading system!
