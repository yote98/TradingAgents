# Quick Reference Card

## 🚀 Run the System

```bash
# Complete demo (recommended first run)
python demo_complete_system.py

# Basic example
python main.py

# Coach integration example
python examples/coach_integration_example.py
```

## 📝 Basic Usage

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

# Initialize
ta = TradingAgentsGraph(debug=True, config=DEFAULT_CONFIG.copy())

# Run analysis
final_state, decision, coach_plans = ta.propagate("NVDA", "2024-05-10")

# View results
print(f"Decision: {decision}")
print(f"Coach D: {coach_plans.get('coach_d_plan')}")
```

## 🔧 Configuration

```python
config = DEFAULT_CONFIG.copy()
config["deep_think_llm"] = "gpt-4o-mini"      # Cheaper model
config["quick_think_llm"] = "gpt-4o-mini"     # Cheaper model
config["max_debate_rounds"] = 1               # Fewer rounds = faster

# Select specific analysts
ta = TradingAgentsGraph(
    selected_analysts=["market", "fundamentals"],
    debug=True,
    config=config
)
```

## 🤖 Discord Bot Setup

```bash
# 1. Install dependencies
pip install -r requirements-discord.txt

# 2. Set bot token in .env
DISCORD_BOT_TOKEN=your_token_here

# 3. Run bot server
python examples/discord_bot_server.py
```

## 💬 Discord Commands

```
# Post coach plan
!plan d: Your analysis here
[Attach chart image]

# View all plans
!plans

# View plans for specific date
!plans 2024-05-10

# Clear plans (admin only)
!clear 2024-05-10
```

## 📊 Return Values

```python
final_state, decision, coach_plans = ta.propagate("NVDA", "2024-05-10")
```

- `final_state` - Complete agent state with all reports
- `decision` - Trading decision (BUY/SELL/HOLD)
- `coach_plans` - External coach plans (dict)

## 🔑 Environment Variables

```bash
# Required
OPENAI_API_KEY=your_key
ALPHA_VANTAGE_API_KEY=your_key

# Optional (for coaches)
DISCORD_BOT_TOKEN=your_token
DISCORD_COACH_D_WEBHOOK=https://...
DISCORD_COACH_I_WEBHOOK=https://...
DISCORD_COACH_S_WEBHOOK=https://...
DISCORD_COACH_N_WEBHOOK=https://...
DISCORD_SUMMARY_WEBHOOK=https://...
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `main.py` | Basic example |
| `demo_complete_system.py` | Complete demo |
| `examples/discord_bot_server.py` | Discord bot |
| `tradingagents/default_config.py` | Configuration |
| `.env` | API keys |

## 🎯 Common Tasks

### Run for Different Ticker
```python
_, decision, _ = ta.propagate("AAPL", "2024-05-10")
```

### Get Coach Plans Only
```python
coach_plans = ta.get_coach_plans("2024-05-10")
```

### Multiple Tickers
```python
for ticker in ["AAPL", "MSFT", "GOOGL"]:
    _, decision, _ = ta.propagate(ticker, "2024-05-10")
    print(f"{ticker}: {decision}")
```

### Backtest
```python
from datetime import datetime, timedelta

start = datetime(2024, 1, 1)
end = datetime(2024, 3, 31)
current = start

while current <= end:
    date_str = current.strftime("%Y-%m-%d")
    _, decision, _ = ta.propagate("AAPL", date_str)
    print(f"{date_str}: {decision}")
    current += timedelta(days=1)
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "No module named 'tradingagents'" | `pip install -e .` |
| "API key not found" | Check `.env` file |
| "Rate limit exceeded" | Use cached data or premium key |
| Discord bot not responding | Check bot permissions & token |

## 📚 Documentation

- `GETTING_STARTED.md` - Step-by-step guide
- `SYSTEM_OVERVIEW.md` - System architecture
- `README_COACHES.md` - Coach system
- `docs/COACHES_STANDALONE.md` - Detailed coach docs

## 💡 Tips

1. **Start Simple**: Run `demo_complete_system.py` first
2. **Use Cheap Models**: `gpt-4o-mini` for testing
3. **Cache Data**: Avoid API rate limits
4. **Debug Mode**: Set `debug=True` to see agent conversations
5. **Coaches Optional**: System works without them

## 🎓 Learning Path

1. ✅ Run `demo_complete_system.py`
2. ✅ Read `GETTING_STARTED.md`
3. ✅ Experiment with `main.py`
4. ✅ Set up Discord bot (optional)
5. ✅ Customize configuration
6. ✅ Build your own extensions

## 🆘 Need Help?

- Check `GETTING_STARTED.md` for detailed instructions
- Review examples in `examples/` folder
- Read documentation in `docs/` folder
- Check GitHub issues

## 🚀 Quick Start Checklist

- [ ] Set up `.env` with API keys
- [ ] Run `python demo_complete_system.py`
- [ ] Review the output
- [ ] Try `python main.py`
- [ ] (Optional) Set up Discord bot
- [ ] Customize for your needs

---

**Remember**: Coaches are external and don't influence decisions!
