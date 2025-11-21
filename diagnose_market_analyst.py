"""
Diagnose what data the Market Analyst is receiving for S&P 500
"""
import os
from tradingagents.dataflows.marketdata import get_marketdata_index_quote, get_marketdata_quote

print("=" * 60)
print("MARKET ANALYST DATA DIAGNOSIS")
print("=" * 60)

# Test 1: Direct S&P 500 index quote
print("\n1. Testing S&P 500 Index (^GSPC)...")
result = get_marketdata_index_quote("^GSPC")
print(f"   Result: {result}")

if "error" not in result:
    print(f"   ✅ S&P 500 Price: {result.get('price')}")
    print(f"   Change: {result.get('change')} ({result.get('change_percent')}%)")
else:
    print(f"   ❌ Error: {result.get('error')}")

# Test 2: SPY as proxy
print("\n2. Testing SPY (S&P 500 ETF proxy)...")
result = get_marketdata_quote("SPY")
print(f"   Result: {result}")

if "error" not in result:
    spy_price = result.get('price') or result.get('mid')
    print(f"   ✅ SPY Price: ${spy_price}")
    if spy_price:
        sp500_estimate = spy_price * 10
        print(f"   Estimated S&P 500: ~{sp500_estimate:.0f}")
else:
    print(f"   ❌ Error: {result.get('error')}")

# Test 3: Check what yfinance returns
print("\n3. Testing yfinance (fallback)...")
try:
    import yfinance as yf
    sp500 = yf.Ticker("^GSPC")
    info = sp500.info
    price = info.get('regularMarketPrice') or info.get('currentPrice')
    print(f"   ✅ S&P 500 Price: {price}")
    print(f"   Previous Close: {info.get('previousClose')}")
    print(f"   Change: {info.get('regularMarketChange')} ({info.get('regularMarketChangePercent')}%)")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 60)
print("CONCLUSION")
print("=" * 60)

# Check if MARKETDATA_API_KEY is set
api_key = os.getenv("MARKETDATA_API_KEY")
if not api_key:
    print("\n⚠️  MARKETDATA_API_KEY is NOT set!")
    print("   The Market Analyst is likely using yfinance fallback")
    print("   This should still be accurate though...")
else:
    print(f"\n✅ MARKETDATA_API_KEY is set: {api_key[:10]}...")
    print("   The Market Analyst should be using MarketData.app")

print("\n💡 RECOMMENDATION:")
print("   If the Market Analyst shows wrong S&P 500 levels:")
print("   1. The LLM might be hallucinating/making up numbers")
print("   2. The frontend might be caching old responses")
print("   3. The system prompt might need updating")
print("   4. The data is correct but the LLM interpretation is wrong")
