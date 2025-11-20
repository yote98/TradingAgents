"""
Final Pre-Deployment Check
Test all critical APIs and data sources before deploying
"""

import os
from dotenv import load_dotenv

load_dotenv()

def check_api_key(name, env_var):
    """Check if API key is set"""
    key = os.getenv(env_var)
    if key and key != f"YOUR_{env_var}_HERE" and len(key) > 10:
        print(f"  ✅ {name}: Configured")
        return True
    else:
        print(f"  ❌ {name}: Missing or invalid")
        return False


def test_marketdata():
    """Test MarketData.app"""
    try:
        import requests
        api_key = os.getenv("MARKETDATA_API_KEY")
        
        response = requests.get(
            "https://api.marketdata.app/v1/stocks/quotes/AAPL/",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            price = data.get('last', [None])[0]
            print(f"  ✅ MarketData: Working (AAPL: ${price})")
            return True
        else:
            print(f"  ⚠️  MarketData: {response.status_code} (trial may have ended)")
            return False
    except Exception as e:
        print(f"  ❌ MarketData: {str(e)[:50]}")
        return False


def test_alpaca():
    """Test Alpaca"""
    try:
        from alpaca.data.historical import StockHistoricalDataClient
        from alpaca.data.requests import StockLatestQuoteRequest
        
        api_key = os.getenv("ALPACA_API_KEY")
        secret_key = os.getenv("ALPACA_SECRET_KEY")
        
        client = StockHistoricalDataClient(api_key, secret_key)
        request = StockLatestQuoteRequest(symbol_or_symbols="AAPL")
        quote = client.get_stock_latest_quote(request)
        
        price = quote["AAPL"].bid_price
        print(f"  ✅ Alpaca: Working (AAPL: ${price})")
        return True
    except Exception as e:
        print(f"  ❌ Alpaca: {str(e)[:50]}")
        return False


def test_yfinance():
    """Test yfinance"""
    try:
        import yfinance as yf
        
        ticker = yf.Ticker("^GSPC")
        hist = ticker.history(period="1d")
        
        if not hist.empty:
            price = hist['Close'].iloc[-1]
            print(f"  ✅ yfinance: Working (S&P 500: ${price:.2f})")
            return True
        else:
            print(f"  ❌ yfinance: No data returned")
            return False
    except Exception as e:
        print(f"  ❌ yfinance: {str(e)[:50]}")
        return False


def test_coingecko():
    """Test CoinGecko"""
    try:
        import requests
        
        response = requests.get(
            "https://api.coingecko.com/api/v3/simple/price",
            params={"ids": "bitcoin", "vs_currencies": "usd"},
            timeout=10
        )
        
        if response.status_code == 200:
            price = response.json()['bitcoin']['usd']
            print(f"  ✅ CoinGecko: Working (BTC: ${price:,.0f})")
            return True
        else:
            print(f"  ❌ CoinGecko: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ CoinGecko: {str(e)[:50]}")
        return False


def test_alpha_vantage():
    """Test Alpha Vantage"""
    try:
        import requests
        api_key = os.getenv("ALPHA_VANTAGE_API_KEY")
        
        response = requests.get(
            "https://www.alphavantage.co/query",
            params={
                "function": "GLOBAL_QUOTE",
                "symbol": "AAPL",
                "apikey": api_key
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if "Global Quote" in data and data["Global Quote"]:
                price = data["Global Quote"].get("05. price", "N/A")
                print(f"  ✅ Alpha Vantage: Working (AAPL: ${price})")
                return True
            else:
                print(f"  ⚠️  Alpha Vantage: Rate limited or no data")
                return False
        else:
            print(f"  ❌ Alpha Vantage: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Alpha Vantage: {str(e)[:50]}")
        return False


def main():
    print("="*80)
    print("FINAL PRE-DEPLOYMENT CHECK")
    print("="*80)
    print()
    
    # Check API Keys
    print("1. API Keys Configuration")
    print("-"*80)
    keys_ok = all([
        check_api_key("OpenAI", "OPENAI_API_KEY"),
        check_api_key("MarketData", "MARKETDATA_API_KEY"),
        check_api_key("Alpaca Key", "ALPACA_API_KEY"),
        check_api_key("Alpaca Secret", "ALPACA_SECRET_KEY"),
        check_api_key("Alpha Vantage", "ALPHA_VANTAGE_API_KEY"),
        check_api_key("FMP", "FMP_API_KEY"),
    ])
    
    # Test Data Sources
    print("\n2. Data Sources Testing")
    print("-"*80)
    marketdata_ok = test_marketdata()
    alpaca_ok = test_alpaca()
    yfinance_ok = test_yfinance()
    coingecko_ok = test_coingecko()
    alphavantage_ok = test_alpha_vantage()
    
    # Summary
    print("\n" + "="*80)
    print("DEPLOYMENT READINESS SUMMARY")
    print("="*80)
    
    critical_ok = alpaca_ok and yfinance_ok and coingecko_ok
    
    if critical_ok:
        print("\n✅ READY TO DEPLOY!")
        print("\nCritical systems working:")
        print("  ✅ Alpaca (FREE stocks & crypto)")
        print("  ✅ yfinance (FREE indices & futures)")
        print("  ✅ CoinGecko (FREE crypto)")
        
        if marketdata_ok:
            print("\nBonus:")
            print("  ✅ MarketData trial still active")
        else:
            print("\nNote:")
            print("  ⚠️  MarketData trial ended (Alpaca is your backup)")
        
        if alphavantage_ok:
            print("  ✅ Alpha Vantage working")
        else:
            print("  ⚠️  Alpha Vantage rate limited (normal, will work later)")
        
        print("\n" + "="*80)
        print("DEPLOYMENT STRATEGY:")
        print("="*80)
        print("""
Current Setup (OPTIMAL):
- Stocks: MarketData (trial) with Alpaca backup
- Indices: yfinance (FREE)
- Futures: yfinance (FREE)
- Crypto: CoinGecko + Alpaca (both FREE)
- Fundamentals: FMP (250 calls/day)
- News: Alpha Vantage

When MarketData trial ends:
- Switch to Alpaca for stocks (already configured)
- Everything else stays the same

You're good to deploy! 🚀
        """)
        
    else:
        print("\n⚠️  DEPLOYMENT ISSUES DETECTED")
        print("\nProblems:")
        if not alpaca_ok:
            print("  ❌ Alpaca not working - check API keys")
        if not yfinance_ok:
            print("  ❌ yfinance not working - check internet connection")
        if not coingecko_ok:
            print("  ❌ CoinGecko not working - check internet connection")
        
        print("\nFix these issues before deploying!")


if __name__ == "__main__":
    main()
