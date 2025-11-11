# 🎯 START HERE - Your Next Steps

## What You Have

A complete TradingAgents system with:
- ✅ Automated trading analysis (4 analysts, researchers, trader, risk management)
- ✅ External coach integration (optional Discord-based human guidance)
- ✅ Working examples and demos
- ✅ Complete documentation

## 🚀 Step-by-Step Guide

### Step 1: Set Up Environment (2 minutes)

```bash
# 1. Copy the example environment file
cp .env.example .env

# 2. Edit .env and add your API keys
# You need:
# - OPENAI_API_KEY (required)
# - ALPHA_VANTAGE_API_KEY (required)
```

**Get API Keys:**
- OpenAI: https://platform.openai.com/api-keys
- Alpha Vantage: https://www.alphavantage.co/support/#api-key (free)

**Your .env should look like:**
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
ALPHA_VANTAGE_API_KEY=YOURKEYHERE
```

### Step 2: Run the Demo (2 minutes)

```bash
python demo_complete_system.py
```

**What this does:**
- Runs TradingAgents analysis on NVDA stock
- Shows the automated trading decision
- Displays external coach plans (if available)
- Explains everything step-by-step

**Expected output:**
```
==================================================================
  RUNNING TRADINGAGENTS FOR NVDA ON 2024-05-10
==================================================================

Running automated analysis...
(This may take a minute as agents analyze data)

✓ Analysis complete!

📊 TRADING DECISION: BUY

This decision was made by:
  1. Internal analysts analyzing market data
  2. Bull/Bear researchers debating the analysis
  3. Trader proposing action
  4. Risk management team evaluating
  5. Risk manager making final decision
```

### Step 3: Try the Basic Example (1 minute)

```bash
python main.py
```

**What this does:**
- Simpler version of the demo
- Shows core functionality
- Good for understanding the basics

### Step 4: Experiment (10 minutes)

Try modifying `main.py`:

```python
# Change the ticker
_, decision, _ = ta.propagate("AAPL", "2024-05-10")  # Try Apple

# Change the date
_, decision, _ = ta.propagate("NVDA", "2024-06-15")  # Different date

# Try multiple tickers
for ticker in ["AAPL", "MSFT", "GOOGL"]:
    _, decision, _ = ta.propagate(ticker, "2024-05-10")
    print(f"{ticker}: {decision}")
```

### Step 5: Understand the System (5 minutes)

Read these files in order:
1. `SYSTEM_OVERVIEW.md` - Understand the architecture
2. `QUICK_REFERENCE.md` - Learn common commands
3. `GETTING_STARTED.md` - Detailed guide

### Step 6 (Optional): Set Up Discord Coaches

**Only do this if you want external human coach guidance.**

#### 6a. Install Discord Dependencies
```bash
pip install -r requirements-discord.txt
```

#### 6b. Create Discord Bot
1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Go to "Bot" → "Add Bot"
4. Enable "Message Content Intent"
5. Copy the bot token

#### 6c. Configure Environment
Add to your `.env`:
```bash
DISCORD_BOT_TOKEN=your_bot_token_here
```

#### 6d. Run Discord Bot Server
```bash
python examples/discord_bot_server.py
```

#### 6e. Post Coach Plans in Discord
In your Discord channel:
```
!plan d: NVDA showing support at $920. Watch for bounce.
[Attach TradingView chart image]
```

#### 6f. View Coach Plans
```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

ta = TradingAgentsGraph(debug=True, config=DEFAULT_CONFIG.copy())
_, decision, coach_plans = ta.propagate("NVDA", "2024-05-10")

print(f"System: {decision}")
print(f"Coach D: {coach_plans.get('coach_d_plan')}")
```

## 📋 Quick Checklist

**Must Do:**
- [ ] Set up `.env` with API keys
- [ ] Run `python demo_complete_system.py`
- [ ] Run `python main.py`
- [ ] Read `SYSTEM_OVERVIEW.md`

**Should Do:**
- [ ] Experiment with different tickers
- [ ] Try different dates
- [ ] Read `QUICK_REFERENCE.md`
- [ ] Customize configuration

**Optional:**
- [ ] Set up Discord bot
- [ ] Configure coach webhooks
- [ ] Post coach plans
- [ ] Build custom extensions

## 🎯 Your First Goal

**Get this working:**

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

config = DEFAULT_CONFIG.copy()
config["deep_think_llm"] = "gpt-4o-mini"  # Cheaper for testing
config["quick_think_llm"] = "gpt-4o-mini"

ta = TradingAgentsGraph(debug=True, config=config)
final_state, decision, _ = ta.propagate("AAPL", "2024-05-10")

print(f"Decision for AAPL: {decision}")
```

**Success looks like:**
```
Decision for AAPL: BUY
```

## 🆘 Common Issues

### "No module named 'tradingagents'"
```bash
pip install -e .
```

### "API key not found"
Check your `.env` file:
```bash
cat .env | grep API_KEY
```

### "Rate limit exceeded"
- Alpha Vantage free tier: 25 requests/day
- TradingAgents users get 60/min with no daily limit
- Use cached data or get premium key

### Demo takes too long
Use cheaper models:
```python
config["deep_think_llm"] = "gpt-4o-mini"
config["quick_think_llm"] = "gpt-4o-mini"
config["max_debate_rounds"] = 1
```

## 📚 Documentation Map

```
START_HERE.md (you are here)
    ↓
SYSTEM_OVERVIEW.md (understand the system)
    ↓
QUICK_REFERENCE.md (common commands)
    ↓
GETTING_STARTED.md (detailed guide)
    ↓
README_COACHES.md (coach system)
    ↓
docs/ (detailed documentation)
```

## 💡 Pro Tips

1. **Start without coaches** - Get the core system working first
2. **Use cheap models** - `gpt-4o-mini` is fine for testing
3. **Enable debug mode** - See what agents are thinking
4. **Cache data** - Avoid hitting API rate limits
5. **Read the output** - The system explains its reasoning

## 🎓 Learning Resources

### Examples
- `demo_complete_system.py` - Complete working demo
- `main.py` - Basic usage
- `examples/coach_integration_example.py` - Coach integration

### Documentation
- `SYSTEM_OVERVIEW.md` - Architecture
- `QUICK_REFERENCE.md` - Commands
- `GETTING_STARTED.md` - Detailed guide
- `README_COACHES.md` - Coach system

### Configuration
- `tradingagents/default_config.py` - All options
- `.env.example` - Environment variables

## 🚀 Next Actions

**Right now (5 minutes):**
1. Set up `.env` with your API keys
2. Run `python demo_complete_system.py`
3. Watch it work!

**Today (30 minutes):**
1. Read `SYSTEM_OVERVIEW.md`
2. Experiment with different tickers
3. Try customizing configuration

**This week:**
1. Set up Discord bot (optional)
2. Build a simple backtest
3. Customize for your needs

## 🎉 You're Ready!

You have everything you need. Just follow the steps above and you'll be running automated trading analysis in minutes.

**Start with:** `python demo_complete_system.py`

Good luck! 🚀
