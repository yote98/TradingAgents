# 🤖 Coach N Auto-Analysis System

## What This Does

Automatically analyzes stocks when Unusual Whales posts signals in your Discord channel!

**Flow:**
```
Unusual Whales posts → Discord Bot captures → Auto-Analyzer detects → TradingAgents analyzes → Results saved
```

## Quick Start

### Option 1: Start Everything at Once (Easiest)
```bash
start_coach_n_system.bat
```

This opens 2 windows:
- **Window 1**: Discord bot capturing signals
- **Window 2**: Auto-analyzer watching for new signals

### Option 2: Start Manually

**Terminal 1 - Discord Bot:**
```bash
python discord_to_coach_n.py
```

**Terminal 2 - Auto-Analyzer:**
```bash
python auto_analyze_signals.py
```

## How It Works

1. **Discord Bot** (`discord_to_coach_n.py`)
   - Listens to Unusual Whales channel
   - Saves messages to `coach_n_signals.json`

2. **Auto-Analyzer** (`auto_analyze_signals.py`)
   - Checks `coach_n_signals.json` every 30 seconds
   - Extracts ticker symbols (e.g., $AAPL)
   - Runs TradingAgents analysis
   - Saves results to `eval_results/{ticker}/`
   - Tracks analyzed signals in `analyzed_signals.json`

## Configuration

Edit `auto_analyze_signals.py` to customize:

```python
CHECK_INTERVAL = 30  # How often to check for new signals (seconds)
analysts=['market', 'fundamentals']  # Which analysts to use
debug=False  # Set True to see agent reasoning
```

## View Results

Results are saved to:
```
eval_results/{TICKER}/TradingAgentsStrategy_logs/
```

## Stop the System

Press `Ctrl+C` in each terminal window

## Troubleshooting

**No signals detected?**
- Make sure Discord bot is running
- Check `coach_n_signals.json` exists
- Post a test message in your Unusual Whales channel

**Analysis not triggering?**
- Check ticker extraction works (must have $TICKER or TICKER: format)
- Look for errors in auto-analyzer window

**Want to re-analyze old signals?**
```bash
del analyzed_signals.json
```

## Next Steps

- Add more analysts for deeper analysis
- Customize ticker extraction patterns
- Set up notifications when analysis completes
- Integrate with your trading dashboard
