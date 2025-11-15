"""
Quick test script to verify MarketData.app is working
Run this locally to test your API key
"""

import os
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

def test_marketdata():
    api_key = os.getenv("MARKETDATA_API_KEY")
    
    if not api_key:
        print("❌ MARKETDATA_API_KEY not set in .env")
        return False
    
    print(f"✅ API Key found: {api_key[:10]}...")
    
    # Test 1: Get real-time quote
    print("\n📊 Test 1: Real-time quote for NVDA")
    url = "https://api.marketdata.app/v1/stocks/quotes/NVDA/"
    params = {"token": api_key}
    
    try:
        response = requests.get(url, params=params, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {data}")
            
            if data.get("s") == "ok":
                price = data.get("last", [None])[0]
                updated = data.get("updated", [None])[0]
                print(f"✅ NVDA Price: ${price}")
                print(f"✅ Updated: {datetime.fromtimestamp(updated) if updated else 'N/A'}")
                return True
            else:
                print(f"❌ API Error: {data.get('errmsg', 'Unknown error')}")
                return False
        else:
            print(f"❌ HTTP Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False
    
    # Test 2: Get historical data
    print("\n📈 Test 2: Historical data for NVDA (last 5 days)")
    end_date = datetime.now()
    start_date = end_date - timedelta(days=5)
    
    url = "https://api.marketdata.app/v1/stocks/candles/D/NVDA/"
    params = {
        "from": start_date.strftime("%Y-%m-%d"),
        "to": end_date.strftime("%Y-%m-%d"),
        "token": api_key
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("s") == "ok":
                timestamps = data.get("t", [])
                closes = data.get("c", [])
                
                if timestamps and closes:
                    latest_date = datetime.fromtimestamp(timestamps[-1])
                    latest_close = closes[-1]
                    print(f"✅ Latest data: {latest_date.strftime('%Y-%m-%d')} - Close: ${latest_close}")
                    print(f"✅ Total data points: {len(timestamps)}")
                    return True
                else:
                    print("❌ No data returned")
                    return False
            else:
                print(f"❌ API Error: {data.get('errmsg', 'Unknown error')}")
                return False
        else:
            print(f"❌ HTTP Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("Testing MarketData.app API Connection")
    print("=" * 60)
    
    success = test_marketdata()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ MarketData.app is working correctly!")
        print("If your app still shows old data, check:")
        print("1. API key is set in Render environment")
        print("2. Backend has redeployed with new code")
        print("3. Clear any cached data")
    else:
        print("❌ MarketData.app test failed")
        print("Check:")
        print("1. API key is correct")
        print("2. Free trial is still active")
        print("3. No rate limits hit")
    print("=" * 60)
