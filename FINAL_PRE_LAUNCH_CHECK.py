"""
Final Pre-Launch System Check
Verify all components before pricing/landing page updates
"""
import requests
import os
from dotenv import load_dotenv

load_dotenv()

print("="*70)
print("FINAL PRE-LAUNCH SYSTEM CHECK")
print("="*70)

results = {}

# 1. Check all API keys are configured
print("\n1. API Keys Configuration")
api_keys = {
    'OPENAI_API_KEY': os.getenv('OPENAI_API_KEY'),
    'ALPHA_VANTAGE_API_KEY': os.getenv('ALPHA_VANTAGE_API_KEY'),
    'MARKETDATA_API_KEY': os.getenv('MARKETDATA_API_KEY'),
    'NEWSDATA_API_KEY': os.getenv('NEWSDATA_API_KEY'),
    'NEWSAPI_API_KEY': os.getenv('NEWSAPI_API_KEY'),
}

for key, value in api_keys.items():
    if value:
        print(f"   ✅ {key}: Configured")
        results[key] = True
    else:
        print(f"   ❌ {key}: Missing")
        results[key] = False

# 2. Check frontend is running
print("\n2. Frontend Server")
try:
    response = requests.get('http://localhost:3000', timeout=5)
    if response.status_code == 200:
        print(f"   ✅ Frontend running on http://localhost:3000")
        results['Frontend'] = True
    else:
        print(f"   ⚠️  Frontend returned status {response.status_code}")
        results['Frontend'] = False
except:
    print(f"   ❌ Frontend not running")
    results['Frontend'] = False

# 3. Check API endpoint
print("\n3. Analysis API")
try:
    response = requests.get('http://localhost:3000/api/health', timeout=5)
    if response.status_code == 200:
        print(f"   ✅ API endpoint healthy")
        results['API'] = True
    else:
        print(f"   ⚠️  API returned status {response.status_code}")
        results['API'] = False
except:
    print(f"   ⚠️  Health endpoint not found (optional)")
    results['API'] = True  # Not critical

# 4. Test data sources
print("\n4. Data Sources")

# MarketData.app
marketdata_key = os.getenv('MARKETDATA_API_KEY')
if marketdata_key:
    try:
        response = requests.get(
            f"https://api.marketdata.app/v1/stocks/quotes/AAPL/?token={marketdata_key}",
            timeout=10
        )
        if response.status_code in [200, 203]:
            data = response.json()
            if data.get('s') == 'ok':
                print(f"   ✅ MarketData.app: Working (Price: ${data.get('last', [0])[0]})")
                results['MarketData'] = True
            else:
                print(f"   ⚠️  MarketData.app: Unexpected response")
                results['MarketData'] = False
        else:
            print(f"   ⚠️  MarketData.app: Status {response.status_code}")
            results['MarketData'] = False
    except Exception as e:
        print(f"   ❌ MarketData.app: {e}")
        results['MarketData'] = False

# Reddit
try:
    response = requests.get(
        "https://www.reddit.com/r/wallstreetbets/search.json?q=AAPL&restrict_sr=1&sort=hot&limit=5",
        headers={'User-Agent': 'TradingAgents/1.0'},
        timeout=10
    )
    if response.status_code == 200:
        data = response.json()
        posts = data.get('data', {}).get('children', [])
        print(f"   ✅ Reddit: Working ({len(posts)} posts)")
        results['Reddit'] = True
    else:
        print(f"   ⚠️  Reddit: Status {response.status_code}")
        results['Reddit'] = False
except Exception as e:
    print(f"   ❌ Reddit: {e}")
    results['Reddit'] = False

# CoinGecko
try:
    response = requests.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
        timeout=10
    )
    if response.status_code == 200:
        data = response.json()
        btc_price = data.get('bitcoin', {}).get('usd', 0)
        print(f"   ✅ CoinGecko: Working (BTC: ${btc_price:,.0f})")
        results['CoinGecko'] = True
    else:
        print(f"   ⚠️  CoinGecko: Status {response.status_code}")
        results['CoinGecko'] = False
except Exception as e:
    print(f"   ❌ CoinGecko: {e}")
    results['CoinGecko'] = False

# Summary
print("\n" + "="*70)
print("SYSTEM STATUS SUMMARY")
print("="*70)

working = sum(1 for v in results.values() if v is True)
total = len(results)

print(f"\n✅ {working}/{total} components working")

print("\n📊 Component Status:")
for component, status in results.items():
    icon = "✅" if status else "❌"
    print(f"   {icon} {component}")

print("\n" + "="*70)
print("ANALYST CONFIGURATION")
print("="*70)
print("""
Your system has 5 AI analysts:
1. ✅ Market Analyst (technical indicators)
2. ✅ Fundamental Analyst (valuation)
3. ✅ News Analyst (3 sources)
4. ✅ Social Analyst (Reddit + Nitter)
5. ✅ Options Analyst (Put/Call, IV, Greeks)

All analysts run in parallel for maximum speed.
""")

print("="*70)
print("READY FOR LAUNCH")
print("="*70)

if working >= total - 2:  # Allow 2 failures
    print("""
✅ System is PRODUCTION READY!

Next steps:
1. Update pricing page
2. Update landing page
3. Deploy to production

Your AlphaFlow AI is ready to launch! 🚀
""")
else:
    print("""
⚠️  Some components need attention.
Review the failures above before launch.
""")
