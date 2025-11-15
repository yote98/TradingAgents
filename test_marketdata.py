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
    
    # Test 1: Get real-time quote for TSLA
    print("\n📊 Test 1: Real-time quote for TSLA")
    url = "https://api.marketdata.app/v1/stocks/quotes/TSLA/"
    params = {"token": api_key}
    
    try:
        response = requests.get(url, params=params, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Full Response: {data}")
            
            if data.get("s") == "ok":
                price = data.get("last", [None])[0]
                close = data.get("close", [None])[0]
                updated = data.get("updated", [None])[0]
                print(f"\n✅ TSLA Current Price: ${price}")
                print(f"✅ TSLA Close: ${close}")
                print(f"✅ Updated: {datetime.fromtimestamp(updated) if updated else 'N/A'}")
                print(f"\n🎯 Expected: $404.39 (Nov 14 close)")
                print(f"🎯 Got: ${close}")
                print(f"🎯 Difference: ${abs(close - 404.39) if close else 'N/A'}")
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
    
    # Test 2: Get historical data for TSLA
    print("\n📈 Test 2: Historical data for TSLA (last 5 days)")
    end_date = datetime.now()
    start_date = end_date - timedelta(days=5)
    
    url = "https://api.marketdata.app/v1/stocks/candles/D/TSLA/"
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
                    print(f"\n✅ Got {len(timestamps)} data points:")
                    for i in range(len(timestamps)):
                        date = datetime.fromtimestamp(timestamps[i])
                        close = closes[i]
                        print(f"  {date.strftime('%Y-%m-%d')}: ${close}")
                    
                    latest_date = datetime.fromtimestamp(timestamps[-1])
                    latest_close = closes[-1]
                    print(f"\n✅ Latest data: {latest_date.strftime('%Y-%m-%d')} - Close: ${latest_close}")
                    print(f"🎯 Expected Nov 14: $404.39")
                    print(f"🎯 Got: ${latest_close}")
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
    print(f"Today: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    success = test_marketdata()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ MarketData.app is responding!")
        print("\nIf prices don't match expected:")
        print("1. Check if MarketData.app has data delay")
        print("2. Verify your free trial is active")
        print("3. Check their status page")
        print("4. Consider switching to yfinance temporarily")
    else:
        print("❌ MarketData.app test failed")
        print("Check:")
        print("1. API key is correct")
        print("2. Free trial is still active")
        print("3. No rate limits hit")
    print("=" * 60)
