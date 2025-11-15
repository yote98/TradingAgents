"""
Comprehensive MarketData.app Test
Tests stocks, ETFs, indices, and bulk quotes
"""

import os
from tradingagents.dataflows.marketdata import (
    get_marketdata_quote,
    get_marketdata_index_quote,
    get_marketdata_bulk_quotes,
    test_marketdata_connection
)

# Set the token
os.environ["MARKETDATA_API_KEY"] = "TmhUbDMyS0VRTmRUcWlyc3RRMUg5N1B6enM3VkNnZGMwdS1KXzRxdFVLYz0"

print("=" * 70)
print("MarketData.app Comprehensive Test")
print("=" * 70)

# Run built-in test
test_marketdata_connection()

# Additional detailed tests
print("\n" + "=" * 70)
print("Detailed Asset Tests")
print("=" * 70)

# Test popular stocks
print("\n📈 STOCKS:")
stocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"]
for symbol in stocks:
    result = get_marketdata_quote(symbol)
    if "error" not in result:
        print(f"   {symbol:6s}: ${result.get('price', 'N/A'):>8.2f}")

# Test popular ETFs
print("\n📊 ETFs:")
etfs = ["SPY", "QQQ", "IWM", "VTI", "TLT"]
for symbol in etfs:
    result = get_marketdata_quote(symbol)
    if "error" not in result:
        print(f"   {symbol:6s}: ${result.get('price', 'N/A'):>8.2f}")

# Test major indices (Premium feature)
print("\n📉 INDICES (Premium Feature):")
print("   ⚠️  Indices require paid plan ($9/month Starter)")
print("   Examples: ^GSPC (S&P 500), ^DJI (Dow), ^VIX")
print("   Status: Not available on free tier")

# Test bulk quotes (Premium feature)
print("\n⚡ BULK QUOTES (Premium Feature):")
print("   ⚠️  Bulk quotes require paid plan")
print("   Would allow: Up to 100 symbols in one API call")
print("   Status: Not available on free tier")

print("\n" + "=" * 70)
print("Test Complete!")
print("=" * 70)
print("\n💡 Free Tier Features:")
print("   ✅ Stocks - Real-time prices (AAPL, TSLA, etc.)")
print("   ✅ ETFs - Real-time prices (SPY, QQQ, etc.)")
print("   ✅ Historical - OHLCV candles (20+ years)")
print("   ❌ Indices - Requires paid plan")
print("   ❌ Bulk Quotes - Requires paid plan")
print("   ❌ Earnings - Requires paid plan")
print("   ❌ Options - Requires paid plan")
print("\n📊 Free Tier Limits:")
print("   Calls: 100/day")
print("   Cost: $0/month")
print("   Perfect for: Beta testing, light usage")
print("\n💰 Upgrade to Starter ($9/month) for:")
print("   10,000 calls/day")
print("   Indices (S&P 500, Dow, Nasdaq, VIX)")
print("   Earnings data")
print("   Options chains")
print("=" * 70)
