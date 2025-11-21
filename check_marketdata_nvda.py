#!/usr/bin/env python3
"""Check MarketData.app actual price for NVDA"""
import requests
import os
from dotenv import load_dotenv

load_dotenv('c1-template/.env')

API_KEY = os.getenv('MARKETDATA_API_KEY')

print("=" * 60)
print("🔍 CHECKING MARKETDATA.APP FOR NVDA")
print("=" * 60)

# Test MarketData.app directly
print("\n1. MarketData.app API:")
try:
    url = f"https://api.marketdata.app/v1/stocks/quotes/NVDA/?token={API_KEY}"
    response = requests.get(url, timeout=10)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:500]}")
except Exception as e:
    print(f"   ERROR: {e}")

# Test Alpha Vantage
print("\n2. Alpha Vantage API:")
ALPHA_KEY = os.getenv('ALPHA_VANTAGE_API_KEY')
try:
    url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=NVDA&apikey={ALPHA_KEY}"
    response = requests.get(url, timeout=10)
    print(f"   Status: {response.status_code}")
    data = response.json()
    if 'Global Quote' in data:
        quote = data['Global Quote']
        print(f"   Price: ${quote.get('05. price', 'N/A')}")
        print(f"   Change: {quote.get('09. change', 'N/A')}")
        print(f"   Volume: {quote.get('06. volume', 'N/A')}")
    else:
        print(f"   Response: {response.text[:500]}")
except Exception as e:
    print(f"   ERROR: {e}")

# Test Yahoo Finance
print("\n3. Yahoo Finance API:")
try:
    url = "https://query1.finance.yahoo.com/v8/finance/chart/NVDA?interval=1m&range=1d"
    response = requests.get(url, timeout=10)
    print(f"   Status: {response.status_code}")
    data = response.json()
    meta = data.get('chart', {}).get('result', [{}])[0].get('meta', {})
    if meta:
        print(f"   Price: ${meta.get('regularMarketPrice', 'N/A')}")
        print(f"   Previous Close: ${meta.get('previousClose', 'N/A')}")
        print(f"   Volume: {meta.get('regularMarketVolume', 'N/A')}")
    else:
        print(f"   Response: {response.text[:500]}")
except Exception as e:
    print(f"   ERROR: {e}")

print("\n" + "=" * 60)
print("Which source has the correct price?")
print("Check against: https://www.google.com/finance/quote/NVDA:NASDAQ")
