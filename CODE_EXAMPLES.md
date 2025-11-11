# Code Examples Guide

> **Quick Reference:** All example scripts and how to use them.

---

## 📁 Example Files Overview

| File | Purpose | Cost | Speed | Best For |
|------|---------|------|-------|----------|
| `main.py` | Basic usage | $0.20 | 30-60s | Learning |
| `demo_complete_system.py` | Full demo | $0.50 | 1-2min | Understanding |
| `examples/analyze_minimal.py` | Minimal cost | $0.01-0.05 | 10-20s | Quick checks |
| `examples/analyze_multiple.py` | Batch analysis | $0.10-0.30 | 30-60s | Multiple stocks |
| `examples/batch_analysis.py` | Advanced batch | Varies | Varies | Production |
| `examples/config_presets.py` | Configurations | N/A | N/A | Setup |

---

## 🚀 Quick Start Examples

### 1. Basic Usage (`main.py`)

**Purpose:** Learn the basics of TradingAgents

**Usage:**
```bash
python main.py
```

**What it does:**
- Analyzes NVDA stock
- Uses 3 analysts (market, fundamentals, news)
- Shows complete workflow
- Displays final decision

**Cost:** ~$0.20 per run

**Customize:**
```python
# Edit main.py to change:
ticker = "AAPL"  # Change stock
trade_date = "2024-01-15"  # Change date
config["selected_analysts"] = ["market"]  # Use fewer analysts
```

---

### 2. Complete System Demo (`demo_complete_system.py`)

**Purpose:** See the full system in action with detailed output

**Usage:**
```bash
python demo_complete_system.py
```

**What it does:**
- Complete analysis workflow
- Shows all analyst reports
- Displays decision reasoning
- Includes coach plans (if available)
- Formatted, easy-to-read output

**Cost:** ~$0.50 per run

**Features:**
- ✅ Detailed section headers
- ✅ Analyst report excerpts
- ✅ Risk management decision
- ✅ External coach plans
- ✅ Summary and next steps

---

### 3. Minimal Analysis (`examples/analyze_minimal.py`)

**Purpose:** Ultra-fast, ultra-cheap analysis

**Usage:**
```bash
# Single stock
python examples/analyze_minimal.py AAPL

# Multiple stocks
python examples/analyze_minimal.py AAPL MSFT GOOGL

# Compare configurations
python examples/analyze_minimal.py --compare AAPL
```

**What it does:**
- Uses only 1 analyst (Market)
- Uses cheapest model (gpt-4o-mini)
- Fastest analysis possible
- Perfect for quick checks

**Cost:** $0.01-0.05 per stock

**When to use:**
- ✅ Quick intraday checks
- ✅ Scanning large watchlists
- ✅ High-frequency analysis
- ✅ Budget-conscious trading
- ✅ Testing the system

**Example output:**
```
============================================================
MINIMAL ANALYSIS: AAPL
============================================================
Date: 2024-01-15
Config: Market analyst only (minimal cost)
Model: gpt-4o-mini (fastest)
============================================================

============================================================
RESULT: AAPL
============================================================
Signal: BUY

Final Decision:
Based on technical analysis, AAPL shows bullish momentum...

Estimated cost: $0.03
```

---

### 4. Multiple Stocks (`examples/analyze_multiple.py`)

**Purpose:** Analyze multiple stocks efficiently

**Usage:**
```bash
# Analyze specific stocks
python examples/analyze_multiple.py AAPL MSFT GOOGL

# Analyze default watchlist
python examples/analyze_multiple.py --default

# Morning routine
python examples/analyze_multiple.py --morning

# Evening review
python examples/analyze_multiple.py --evening

# Weekend deep dive
python examples/analyze_multiple.py --weekend
```

**What it does:**
- Batch processes multiple stocks
- Uses swing_trading configuration
- Saves results automatically
- Generates summary

**Cost:** ~$0.20 per stock

**Example output:**
```
============================================================
MINIMAL BATCH ANALYSIS
============================================================
Stocks: AAPL, MSFT, GOOGL
Date: 2024-01-15
Config: Minimal (market analyst only)
============================================================

[1/3] Analyzing AAPL...
  ✓ AAPL: BUY
[2/3] Analyzing MSFT...
  ✓ MSFT: HOLD
[3/3] Analyzing GOOGL...
  ✓ GOOGL: BUY

============================================================
SUMMARY
============================================================
Total: 3 stocks
  BUY:  2
  SELL: 0
  HOLD: 1
============================================================

Estimated cost: $0.60 (3 stocks × $0.20)
```

---

### 5. Advanced Batch Analysis (`examples/batch_analysis.py`)

**Purpose:** Production-ready batch processing with advanced features

**Usage:**
```bash
# Morning routine
python examples/batch_analysis.py morning

# Evening review
python examples/batch_analysis.py evening

# Weekend deep dive
python examples/batch_analysis.py weekend

# Daily batch
python examples/batch_analysis.py daily

# Weekly batch
python examples/batch_analysis.py weekly
```

**What it does:**
- Pre-built routines for different times
- Automatic result saving
- CSV export
- Progress tracking
- Error handling

**Cost:** Varies by routine

**Features:**
- ✅ Scheduled routines
- ✅ Result persistence
- ✅ CSV export
- ✅ Progress tracking
- ✅ Error recovery

---

### 6. Configuration Presets (`examples/config_presets.py`)

**Purpose:** Ready-to-use configuration templates

**Usage:**
```python
from examples.config_presets import get_config

# Get a preset
config = get_config("swing_trading")

# Customize a preset
config = customize_config(
    "day_trading",
    selected_analysts=["market", "fundamentals"]
)

# Compare presets
print_config_comparison()
```

**Available presets:**
- `ultra_low_cost` - Testing ($0.005-0.02)
- `day_trading` - Fast & cheap ($0.01-0.05)
- `swing_trading` - Balanced ($0.10-0.30) ⭐
- `long_term` - Thorough ($0.50-1.50)
- `premium` - Maximum quality ($2-5)

---

## 🎓 Usage Patterns

### Pattern 1: Learning the System

```bash
# Day 1: Basic usage
python main.py

# Day 2: Full demo
python demo_complete_system.py

# Day 3: Try minimal
python examples/analyze_minimal.py AAPL

# Day 4: Multiple stocks
python examples/analyze_multiple.py AAPL MSFT GOOGL
```

---

### Pattern 2: Daily Trading Routine

```bash
# Morning (8:00 AM): Quick scan
python examples/analyze_minimal.py AAPL MSFT GOOGL NVDA TSLA

# Mid-day: Check positions (uses cache, free!)
python examples/analyze_minimal.py AAPL

# Evening (5:00 PM): Detailed review
python examples/analyze_multiple.py --evening
```

---

### Pattern 3: Weekly Analysis

```bash
# Sunday evening: Deep dive
python examples/batch_analysis.py weekend

# Monday-Friday: Quick checks
python examples/analyze_minimal.py [your stocks]
```

---

### Pattern 4: Cost-Optimized

```bash
# Step 1: Quick scan (cheap)
python examples/analyze_minimal.py AAPL MSFT GOOGL NVDA TSLA AMD META AMZN NFLX GOOG
# Cost: $0.30, identifies 3 BUY signals

# Step 2: Deep dive on BUY signals only
python examples/analyze_multiple.py AAPL NVDA META
# Cost: $0.60

# Total: $0.90 vs $2.00 (55% savings!)
```

---

## 🔧 Customization Examples

### Example 1: Change Stock and Date

```python
# Edit main.py
ticker = "TSLA"  # Change from NVDA
trade_date = "2024-01-15"  # Change date

final_state, decision, coach_plans = ta.propagate(ticker, trade_date)
```

---

### Example 2: Use Different Configuration

```python
# Edit main.py
from examples.config_presets import get_config

# Use day trading config
config = get_config("day_trading")

ta = TradingAgentsGraph(config=config)
```

---

### Example 3: Analyze Your Watchlist

```python
# Edit examples/analyze_multiple.py
DEFAULT_WATCHLIST = [
    "AAPL",   # Your stocks
    "MSFT",
    "GOOGL",
    "NVDA",
    "TSLA",
]
```

---

### Example 4: Custom Batch Routine

```python
# Create your own routine
from examples.batch_analysis import run_batch_analysis

def my_routine():
    """My custom analysis routine."""
    watchlist = ["AAPL", "MSFT", "GOOGL"]
    
    results = run_batch_analysis(
        watchlist=watchlist,
        config_preset="swing_trading",
        analysis_date="today",
        save_results=True
    )
    
    return results

# Run it
results = my_routine()
```

---

## 📊 Cost Comparison

| Example | Analysts | Model | Cost | Speed |
|---------|----------|-------|------|-------|
| `main.py` | 3 | gpt-4o-mini | $0.20 | 30-60s |
| `demo_complete_system.py` | 3 | gpt-4o-mini | $0.50 | 1-2min |
| `analyze_minimal.py` | 1 | gpt-4o-mini | $0.03 | 10-20s |
| `analyze_multiple.py` | 2 | gpt-4o-mini | $0.20 | 30-60s |
| `batch_analysis.py` (morning) | 1 | gpt-4o-mini | $0.03 | 10-20s |
| `batch_analysis.py` (evening) | 2 | gpt-4o-mini | $0.20 | 30-60s |
| `batch_analysis.py` (weekend) | 3 | gpt-4o | $1.00 | 1-3min |

---

## 🎯 Which Example to Use?

### Use `main.py` when:
- ✅ Learning the system
- ✅ First time user
- ✅ Want to see basic workflow
- ✅ Testing configuration

### Use `demo_complete_system.py` when:
- ✅ Want detailed output
- ✅ Understanding the workflow
- ✅ Showing to others
- ✅ Debugging issues

### Use `analyze_minimal.py` when:
- ✅ Quick intraday checks
- ✅ Scanning many stocks
- ✅ Budget is tight
- ✅ Speed is priority

### Use `analyze_multiple.py` when:
- ✅ Analyzing 3-10 stocks
- ✅ Daily routine
- ✅ Balanced approach
- ✅ Want saved results

### Use `batch_analysis.py` when:
- ✅ Production use
- ✅ Scheduled routines
- ✅ Need CSV export
- ✅ Advanced features

---

## 💡 Pro Tips

### Tip 1: Start Simple
```bash
# Day 1: Learn basics
python main.py

# Day 2: Try minimal
python examples/analyze_minimal.py AAPL

# Day 3: Multiple stocks
python examples/analyze_multiple.py AAPL MSFT GOOGL
```

### Tip 2: Use Cache
```bash
# Morning: Fetch data
python examples/analyze_minimal.py AAPL MSFT GOOGL

# Throughout day: Free analysis (uses cache)
python examples/analyze_minimal.py AAPL  # $0
python examples/analyze_minimal.py MSFT  # $0
python examples/analyze_minimal.py GOOGL # $0
```

### Tip 3: Batch Everything
```bash
# Inefficient: 3 separate runs
python examples/analyze_minimal.py AAPL
python examples/analyze_minimal.py MSFT
python examples/analyze_minimal.py GOOGL

# Efficient: 1 batch run
python examples/analyze_minimal.py AAPL MSFT GOOGL
```

### Tip 4: Use Right Tool
```bash
# Quick check: minimal
python examples/analyze_minimal.py AAPL

# Important decision: full analysis
python main.py  # Edit to use long_term config
```

---

## 🔍 Troubleshooting

### "ModuleNotFoundError"
```bash
# Install dependencies
pip install -r requirements.txt

# Install as package
pip install -e .
```

### "API Key Error"
```bash
# Check .env file
cat .env

# Should have:
OPENAI_API_KEY=your_key_here
ALPHA_VANTAGE_API_KEY=your_key_here
```

### "Too Expensive"
```bash
# Use minimal configuration
python examples/analyze_minimal.py AAPL

# Or edit config in main.py
config["selected_analysts"] = ["market"]  # Only 1 analyst
config["deep_think_llm"] = "gpt-4o-mini"  # Cheapest model
```

### "Too Slow"
```bash
# Use minimal analysis
python examples/analyze_minimal.py AAPL

# Or reduce debate rounds
config["max_debate_rounds"] = 1
```

---

## 📚 Related Documentation

- `QUICK_REFERENCE.md` - Command reference
- `CONFIG_OPTIMIZATION_GUIDE.md` - Configuration details
- `MINIMAL_ANALYSIS_GUIDE.md` - Minimal analysis guide
- `BATCH_ANALYSIS_GUIDE.md` - Batch processing guide
- `COST_SAVING_TIPS.md` - Cost optimization

---

## ✅ Quick Reference

### Run Examples
```bash
# Basic
python main.py

# Full demo
python demo_complete_system.py

# Minimal (single)
python examples/analyze_minimal.py AAPL

# Minimal (multiple)
python examples/analyze_minimal.py AAPL MSFT GOOGL

# Multiple stocks
python examples/analyze_multiple.py AAPL MSFT GOOGL

# Morning routine
python examples/batch_analysis.py morning

# Evening review
python examples/batch_analysis.py evening
```

### Customize
```python
# Change stock
ticker = "AAPL"

# Change date
trade_date = "2024-01-15"

# Change config
config = get_config("day_trading")

# Change analysts
config["selected_analysts"] = ["market"]
```

---

**Remember:** Start with `main.py` to learn, then use `analyze_minimal.py` for daily quick checks, and `batch_analysis.py` for production use! 🚀

---

**Last Updated:** 2024
