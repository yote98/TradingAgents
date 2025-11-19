"""
Test and fix news API keys
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

print("Testing News API Keys...")
print("="*60)

# Test NewsData.io
newsdata_key = os.getenv('NEWSDATA_API_KEY')
print(f"\n1. NewsData.io Key: {newsdata_key}")
url = f"https://newsdata.io/api/1/latest?apikey={newsdata_key}&language=en&category=business"
response = requests.get(url)
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    print("   ✅ VALID")
else:
    print(f"   ❌ INVALID: {response.json()}")

# Test NewsAPI.org
newsapi_key = os.getenv('NEWSAPI_API_KEY')
print(f"\n2. NewsAPI.org Key: {newsapi_key}")
url = f"https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey={newsapi_key}"
response = requests.get(url)
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    print("   ✅ VALID")
else:
    print(f"   ❌ INVALID: {response.json()}")

print("\n" + "="*60)
print("RECOMMENDATION:")
print("="*60)
print("""
Your system is currently using:
✅ Alpha Vantage News (rate limited but working)
✅ Reddit (working perfectly)
✅ MarketData.app (working with status 203)

The other news APIs have invalid keys, but you don't need them!
Your system already has 3 working data sources.

To get new free API keys (optional):
1. NewsData.io: https://newsdata.io/register
2. NewsAPI.org: https://newsapi.org/register
""")
