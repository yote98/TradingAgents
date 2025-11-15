"""
Test the /quote API endpoint with MarketData.app
"""

import requests

print("=" * 70)
print("Testing /quote API Endpoint")
print("=" * 70)

# Test the local API
base_url = "http://localhost:5000/quote"

test_symbols = ["AAPL", "NVDA", "TSLA"]

for symbol in test_symbols:
    print(f"\n{'=' * 70}")
    print(f"Testing {symbol}")
    print(f"{'=' * 70}")
    
    url = f"{base_url}/{symbol}"
    
    try:
        response = requests.get(url, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Status: {response.status_code}")
            print(f"📊 Response:")
            print(f"   Symbol: {data.get('symbol')}")
            print(f"   Price: ${data.get('price')}")
            print(f"   Source: {data.get('source')}")
            print(f"   Updated: {data.get('updated_datetime', 'N/A')}")
        else:
            print(f"❌ Status: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print(f"❌ API not running. Start it with: python tradingagents_api.py")
        break
    except Exception as e:
        print(f"❌ Error: {e}")

print(f"\n{'=' * 70}")
print("Test Complete!")
print(f"{'=' * 70}")
