"""
Simple MarketData.app API test
Just add your API key and run: python test_marketdata_simple.py
"""

import requests
from datetime import datetime

# PUT YOUR API KEY HERE
API_KEY = "YOUR_API_KEY_HERE"  # Replace with your actual key

print("=" * 70)
print("MarketData.app Simple Test")
print("=" * 70)

if API_KEY == "YOUR_API_KEY_HERE":
    print("\n❌ Please edit this file and add your API key on line 10")
    print("   API_KEY = \"your-actual-key-here\"")
    exit(1)

print(f"\n✅ API Key: {API_KEY[:15]}...")

# Test 1: Get real-time price for TSLA
print("\n" + "=" * 70)
print("Test 1: Get TSLA Real-Time Price")
print("=" * 70)

url = f"https://api.marketdata.app/v1/stocks/prices/TSLA/?token={API_KEY}"
print(f"URL: {url[:60]}...")

try:
    response = requests.get(url, timeout=10)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n📊 Full Response:")
        print(data)
        
        if data.get("s") == "ok":
            print(f"\n✅ SUCCESS!")
            symbols = data.get('symbol', [])
            prices = data.get('mid', [])  # Midpoint prices
            timestamps = data.get('updated', [])
            
            if symbols and prices:
                print(f"   Symbol: {symbols[0]}")
                print(f"   Price (Mid): ${prices[0]}")
                
                if timestamps and timestamps[0]:
                    print(f"   Updated: {datetime.fromtimestamp(timestamps[0])}")
                
                print(f"\n🎯 Expected TSLA close (Nov 14): $404.39")
                print(f"🎯 Got: ${prices[0]}")
                diff = abs(prices[0] - 404.39)
                print(f"🎯 Difference: ${diff:.2f}")
                
                if diff < 10:
                    print("   ✅ Price looks accurate!")
                else:
                    print("   ⚠️  Price seems off - might be from different date")
            else:
                print("   ❌ No price data in response")
        else:
            print(f"\n❌ API Error: {data.get('errmsg', 'Unknown error')}")
    else:
        print(f"\n❌ HTTP Error {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"\n❌ Exception: {e}")

# Test 2: Get historical candles
print("\n" + "=" * 70)
print("Test 2: Get TSLA Historical Data (Last 5 Days)")
print("=" * 70)

from datetime import timedelta
end_date = datetime.now()
start_date = end_date - timedelta(days=5)

url = f"https://api.marketdata.app/v1/stocks/candles/D/TSLA/?from={start_date.strftime('%Y-%m-%d')}&to={end_date.strftime('%Y-%m-%d')}&token={API_KEY}"
print(f"URL: {url[:80]}...")

try:
    response = requests.get(url, timeout=10)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        
        if data.get("s") == "ok":
            timestamps = data.get("t", [])
            closes = data.get("c", [])
            
            print(f"\n✅ Got {len(timestamps)} data points:")
            for i in range(len(timestamps)):
                date = datetime.fromtimestamp(timestamps[i])
                close = closes[i]
                print(f"   {date.strftime('%Y-%m-%d')}: ${close:.2f}")
            
            if timestamps:
                latest_date = datetime.fromtimestamp(timestamps[-1])
                latest_close = closes[-1]
                print(f"\n🎯 Latest: {latest_date.strftime('%Y-%m-%d')} - ${latest_close:.2f}")
                print(f"🎯 Expected Nov 14: $404.39")
        else:
            print(f"\n❌ API Error: {data.get('errmsg', 'Unknown error')}")
    else:
        print(f"\n❌ HTTP Error {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"\n❌ Exception: {e}")

print("\n" + "=" * 70)
print("Test Complete!")
print("=" * 70)
print("\nIf prices are accurate:")
print("  1. Add this key to your .env file")
print("  2. Add to Render environment variables")
print("  3. Redeploy")
print("\nIf prices are wrong:")
print("  1. Check MarketData.app dashboard for data coverage")
print("  2. Contact their support")
print("  3. Consider alternative data source (IBKR, Polygon.io)")
print("=" * 70)
