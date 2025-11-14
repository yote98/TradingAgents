"""
Verify ACTUAL live prices RIGHT NOW from multiple sources
"""
import yfinance as yf
from datetime import datetime
import requests

def get_real_prices():
    """Get actual current prices from yfinance"""
    print("🔍 FETCHING REAL LIVE PRICES RIGHT NOW")
    print("=" * 70)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    tickers = ["AAPL", "TSLA", "NVDA", "MSFT", "AMD", "GOOGL"]
    
    for ticker in tickers:
        try:
            stock = yf.Ticker(ticker)
            
            # Get current price
            info = stock.info
            current_price = info.get('currentPrice') or info.get('regularMarketPrice')
            
            # Get latest historical data
            hist = stock.history(period="1d")
            if not hist.empty:
                latest_close = hist['Close'].iloc[-1]
                latest_date = hist.index[-1]
                
                print(f"\n{ticker}:")
                print(f"  Current Price (API): ${current_price:.2f}" if current_price else "  Current Price: N/A")
                print(f"  Latest Close: ${latest_close:.2f}")
                print(f"  Date: {latest_date.strftime('%Y-%m-%d')}")
                print(f"  Source: yfinance (Yahoo Finance)")
            else:
                print(f"\n{ticker}: No data available")
                
        except Exception as e:
            print(f"\n{ticker}: Error - {e}")
    
    print("\n" + "=" * 70)
    print("✅ THESE ARE REAL PRICES FROM YAHOO FINANCE")
    print("=" * 70)

def compare_with_tradingagents():
    """Compare with what TradingAgents would return"""
    print("\n\n🔍 WHAT TRADINGAGENTS RETURNS")
    print("=" * 70)
    
    try:
        from tradingagents.dataflows.interface import route_to_vendor
        from datetime import datetime, timedelta
        
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        
        ticker = "AAPL"
        print(f"\nFetching {ticker} from TradingAgents...")
        result = route_to_vendor("get_stock_data", ticker, start_date, end_date)
        
        if result:
            lines = result.split('\n')
            print(f"\n✅ TradingAgents returned data:")
            for line in lines[:10]:  # Show first 10 lines
                print(f"  {line}")
            
            # Extract latest price
            for line in reversed(lines):
                if line.startswith('2025-'):
                    parts = line.split(',')
                    if len(parts) >= 5:
                        date = parts[0]
                        close = parts[4]
                        print(f"\n📊 Latest from TradingAgents:")
                        print(f"  Date: {date}")
                        print(f"  Close: ${close}")
                        break
        else:
            print("❌ No data returned")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

def check_market_status():
    """Check if market is open"""
    print("\n\n🕐 MARKET STATUS")
    print("=" * 70)
    
    now = datetime.now()
    print(f"Current Time: {now.strftime('%Y-%m-%d %H:%M:%S %Z')}")
    
    # Check if it's a weekday
    if now.weekday() >= 5:
        print("⚠️  WEEKEND - Market is CLOSED")
        print("   Last trading day was Friday")
        print("   Prices shown are from last close")
    else:
        hour = now.hour
        if 9 <= hour < 16:  # Rough market hours (EST)
            print("✅ MARKET MAY BE OPEN (check timezone)")
        else:
            print("⚠️  MARKET IS CLOSED")
            print("   Prices shown are from last close")

if __name__ == "__main__":
    print("🚀 LIVE PRICE VERIFICATION")
    print("=" * 70)
    print("This will fetch ACTUAL current prices and compare with TradingAgents")
    print("=" * 70)
    
    check_market_status()
    get_real_prices()
    compare_with_tradingagents()
    
    print("\n" + "=" * 70)
    print("💡 IMPORTANT NOTES")
    print("=" * 70)
    print("""
1. If market is CLOSED, you'll see last closing prices
2. Different APIs may show slightly different prices due to:
   - Bid/Ask spread
   - Delayed vs real-time data
   - Different update frequencies
3. yfinance uses Yahoo Finance (free, 15-min delayed)
4. For REAL-TIME prices, you need paid data (Bloomberg, Reuters)

🎯 BOTTOM LINE:
If the prices match Yahoo Finance, your system is working correctly.
If they don't match, there's a real issue to fix.
""")
