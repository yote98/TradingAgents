"""
Diagnose why specific tickers failed in tests
Tests: META, DIS, SPY, JPM, BAC, WFC
"""
import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Failing tickers from tests
FAILING_TICKERS = {
    'META': 'No price shown',
    'DIS': 'Not fetching',
    'SPY': 'No price shown',
    'JPM': 'Wrong price',
    'BAC': 'Wrong price',
    'WFC': 'Wrong price',
}

# Working tickers for comparison
WORKING_TICKERS = ['AAPL', 'AMZN', 'NKE', 'COST', 'QQQ', 'DIA']

def test_marketdata_app_direct():
    """Test marketdata.app API directly"""
    api_key = os.getenv('MARKETDATA_API_KEY')
    
    if not api_key:
        print("❌ MARKETDATA_API_KEY not found in .env")
        return
    
    print("=" * 70)
    print("🔍 Testing marketdata.app API Directly")
    print("=" * 70)
    
    for ticker, issue in FAILING_TICKERS.items():
        try:
            url = f"https://api.marketdata.app/v1/stocks/quotes/{ticker}/?token={api_key}"
            response = requests.get(url, timeout=10)
            
            if response.ok:
                data = response.json()
                if data.get('s') == 'ok' and data.get('last'):
                    price = data['last'][0]
                    print(f"✅ {ticker:6} = ${price:8.2f} (marketdata.app works)")
                else:
                    print(f"⚠️ {ticker:6} - Response: {data}")
            else:
                print(f"❌ {ticker:6} - HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ {ticker:6} - Error: {e}")
    
    print()

def test_yahoo_finance():
    """Test Yahoo Finance as fallback"""
    print("=" * 70)
    print("🔍 Testing Yahoo Finance (Fallback)")
    print("=" * 70)
    
    for ticker, issue in FAILING_TICKERS.items():
        try:
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
            response = requests.get(url, timeout=10)
            
            if response.ok:
                data = response.json()
                result = data.get('chart', {}).get('result', [{}])[0]
                meta = result.get('meta', {})
                price = meta.get('regularMarketPrice', 0)
                
                if price > 0:
                    print(f"✅ {ticker:6} = ${price:8.2f} (Yahoo Finance works)")
                else:
                    print(f"⚠️ {ticker:6} - No price in response")
            else:
                print(f"❌ {ticker:6} - HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ {ticker:6} - Error: {e}")
    
    print()

def test_vercel_api():
    """Test your Vercel /api/quote endpoint"""
    base_url = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://trading-agents.vercel.app')
    
    print("=" * 70)
    print(f"🔍 Testing Vercel API: {base_url}")
    print("=" * 70)
    
    for ticker, issue in FAILING_TICKERS.items():
        try:
            url = f"{base_url}/api/quote?symbol={ticker}"
            response = requests.get(url, timeout=10)
            
            if response.ok:
                data = response.json()
                price = data.get('price', 0)
                
                if price > 0:
                    print(f"✅ {ticker:6} = ${price:8.2f} (Vercel API works)")
                else:
                    print(f"⚠️ {ticker:6} - Price is 0: {data}")
            else:
                print(f"❌ {ticker:6} - HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ {ticker:6} - Error: {e}")
    
    print()

def compare_working_vs_failing():
    """Compare working tickers vs failing ones"""
    print("=" * 70)
    print("📊 Comparison: Working vs Failing Tickers")
    print("=" * 70)
    
    print("\n✅ WORKING TICKERS:")
    for ticker in WORKING_TICKERS:
        print(f"   {ticker}")
    
    print("\n❌ FAILING TICKERS:")
    for ticker, issue in FAILING_TICKERS.items():
        print(f"   {ticker:6} - {issue}")
    
    print("\n🔍 PATTERN ANALYSIS:")
    print("   - META: Tech stock (like AAPL, AMZN which work)")
    print("   - DIS: Entertainment (unique sector)")
    print("   - SPY: ETF (DIA works, SPY doesn't)")
    print("   - JPM, BAC, WFC: All financial stocks")
    print("\n   💡 Hypothesis: Financial stocks might have different API response format")
    print()

if __name__ == '__main__':
    print("\n🧪 TICKER FAILURE DIAGNOSTIC\n")
    
    # Run all tests
    test_marketdata_app_direct()
    test_yahoo_finance()
    test_vercel_api()
    compare_working_vs_failing()
    
    print("=" * 70)
    print("📋 SUMMARY")
    print("=" * 70)
    print("1. Check which API source works for failing tickers")
    print("2. If marketdata.app fails → use Yahoo Finance")
    print("3. If both work → problem is in our code/AI")
    print("4. If both fail → ticker not supported")
    print("\n💡 Next step: Check Vercel logs to see actual API responses")
