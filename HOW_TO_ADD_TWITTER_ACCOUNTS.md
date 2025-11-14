# How to Add Individual Twitter/X Accounts

## Quick Guide

### Step 1: Edit Configuration

Open `tradingagents/default_config.py` and find the `twitter_monitor` section:

```python
"twitter_monitor": {
    "curated_accounts": [
        "ChartChampions",
        "unusual_whales",
        "DeItaone",
        "zerohedge",
        "TradingView",
        "Investingcom",
        "YahooFinance",
        "MarketWatch",
        # ADD YOUR ACCOUNTS HERE 👇
        "elonmusk",           # Elon Musk
        "jimcramer",          # Jim Cramer
        "carlquintanilla",    # Carl Quintanilla
        "SquawkCNBC",         # CNBC Squawk
        "business",           # Bloomberg
        "WSJ",                # Wall Street Journal
        "FT",                 # Financial Times
        "Reuters",            # Reuters
        "APompliano",         # Anthony Pompliano (crypto)
        "GRDecter",           # Gareth Decter
    ],
}
```

### Step 2: Save and Restart

That's it! The system will automatically start monitoring these accounts.

## Popular Accounts to Add

### Market Commentators
- `jimcramer` - CNBC Mad Money host
- `carlquintanilla` - CNBC anchor
- `ScottWapnerCNBC` - CNBC Fast Money
- `MelissaLeeCNBC` - CNBC Options Action

### Technical Analysts
- `TrendSpider` - Technical analysis platform
- `StockCharts` - Charting platform
- `GRDecter` - Technical analyst
- `allstarcharts` - JC Parets

### Options/Flow Traders
- `spotgamma` - Options gamma exposure
- `SqueezeMetrics` - Dark pool data
- `WOLF_Financial` - Options flow

### Crypto Focused
- `APompliano` - Anthony Pompliano
- `VitalikButerin` - Ethereum founder
- `CZ_Binance` - Binance CEO
- `SBF_FTX` - FTX (if still active)

### News Aggregators
- `business` - Bloomberg
- `WSJ` - Wall Street Journal
- `FT` - Financial Times
- `Reuters` - Reuters
- `CNBC` - CNBC official

### Individual Traders
- `AlphaCharts` - Trader/analyst
- `TraderStewie` - Day trader
- `InvestorsLive` - Nate Michaud
- `madaznfootballr` - Trader

### Institutional/Research
- `GoldmanSachs` - Goldman Sachs
- `MorganStanley` - Morgan Stanley
- `jpmorgan` - JPMorgan
- `BofAML` - Bank of America

## Best Practices

### Quality Over Quantity
- ✅ Add 10-20 high-quality accounts
- ❌ Don't add 100+ accounts (slow, noisy)

### Verify Account Activity
- Check if account is still active
- Ensure they post about stocks/markets
- Avoid spam/promotional accounts

### Test After Adding
```python
from tradingagents.dataflows.twitter_tools import get_twitter_sentiment

# Test with a popular ticker
report = get_twitter_sentiment("AAPL", "24h")
print(report)
```

### Monitor Performance
- Check if new accounts add value
- Remove accounts that don't mention tickers
- Adjust based on your trading style

## Rate Limiting

**Important**: More accounts = more requests

Current settings:
- `rate_limit_delay`: 6 seconds between requests
- `max_tweets_per_account`: 20 tweets per account

With 20 accounts:
- 20 accounts × 6 seconds = 120 seconds (2 minutes)
- This is fine for most use cases

If you add 50+ accounts:
- Consider increasing `rate_limit_delay` to 8-10 seconds
- Or reduce `max_tweets_per_account` to 10

## Advanced: Account Categories

You can organize accounts by category:

```python
# In your own config file
TRADING_ACCOUNTS = {
    "technical": ["ChartChampions", "TrendSpider", "GRDecter"],
    "options": ["unusual_whales", "spotgamma", "WOLF_Financial"],
    "news": ["DeItaone", "zerohedge", "business"],
    "crypto": ["APompliano", "VitalikButerin"],
}

# Use all or select by category
all_accounts = [acc for category in TRADING_ACCOUNTS.values() for acc in category]
```

## Troubleshooting

### Account not found
- Check spelling (case-sensitive)
- Verify account exists on Twitter/X
- Try accessing via Nitter: `https://nitter.net/username`

### No tweets returned
- Account may not tweet about stocks
- Try different ticker (more popular)
- Check if account is suspended

### Slow performance
- Reduce number of accounts
- Increase `rate_limit_delay`
- Enable caching (already enabled by default)

## Example Configuration

Here's a balanced setup with 15 accounts:

```python
"curated_accounts": [
    # Core (keep these)
    "ChartChampions",
    "unusual_whales",
    "DeItaone",
    
    # News
    "zerohedge",
    "business",
    "WSJ",
    
    # Technical
    "TradingView",
    "GRDecter",
    
    # Options
    "spotgamma",
    
    # Commentators
    "jimcramer",
    "carlquintanilla",
    
    # Platforms
    "Investingcom",
    "YahooFinance",
    "MarketWatch",
    "StockCharts",
],
```

This gives you:
- 15 accounts × 20 tweets = 300 tweets
- 15 accounts × 6 seconds = 90 seconds fetch time
- Good balance of speed and coverage
