"""
Test earnings calendar data from different sources
"""
import os
from datetime import datetime, timedelta

def test_alpha_vantage_earnings():
    """Test Alpha Vantage earnings calendar"""
    print("🔍 Testing Alpha Vantage Earnings Calendar")
    print("=" * 60)
    
    try:
        import requests
        
        api_key = os.getenv("ALPHA_VANTAGE_API_KEY")
        if not api_key:
            print("❌ ALPHA_VANTAGE_API_KEY not set in .env")
            return False
        
        # Get earnings calendar for next 3 months
        url = f"https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&horizon=3month&apikey={api_key}"
        
        print(f"\n📊 Fetching earnings calendar...")
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.text
            lines = data.split('\n')
            
            print(f"✅ Got {len(lines)} lines of data")
            print(f"\n📋 First 20 earnings (this week):\n")
            
            # Parse CSV
            header = lines[0].split(',')
            print(f"Columns: {', '.join(header)}")
            print("-" * 60)
            
            # Show first 20 companies
            for i, line in enumerate(lines[1:21], 1):
                if line.strip():
                    parts = line.split(',')
                    if len(parts) >= 3:
                        symbol = parts[0]
                        name = parts[1]
                        report_date = parts[2]
                        print(f"{i:2d}. {symbol:6s} - {name[:30]:30s} - {report_date}")
            
            # Check for specific stocks Grok mentioned
            print("\n" + "=" * 60)
            print("🔍 Checking for stocks Grok mentioned:")
            print("=" * 60)
            
            grok_stocks = ["AMD", "PLTR", "VRTX", "MCD", "WMB"]
            for stock in grok_stocks:
                found = False
                for line in lines[1:]:
                    if line.startswith(stock + ','):
                        parts = line.split(',')
                        if len(parts) >= 3:
                            print(f"✅ {stock:6s} - {parts[1][:30]:30s} - {parts[2]}")
                            found = True
                            break
                if not found:
                    print(f"❌ {stock:6s} - Not found in calendar")
            
            return True
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_yfinance_earnings():
    """Test yfinance earnings calendar"""
    print("\n\n🔍 Testing yfinance Earnings Calendar")
    print("=" * 60)
    
    try:
        import yfinance as yf
        from datetime import datetime, timedelta
        
        print("\n📊 Checking specific stocks from Grok's list...")
        
        grok_stocks = ["AMD", "PLTR", "VRTX", "MCD", "WMB"]
        
        for ticker in grok_stocks:
            try:
                stock = yf.Ticker(ticker)
                calendar = stock.calendar
                
                if calendar is not None and not calendar.empty:
                    print(f"\n✅ {ticker}:")
                    print(f"   {calendar}")
                else:
                    print(f"\n⚠️  {ticker}: No earnings calendar data")
                    
            except Exception as e:
                print(f"\n❌ {ticker}: Error - {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Earnings Calendar Data Source Test")
    print("=" * 60)
    print(f"Testing for week of November 10-16, 2025")
    print("=" * 60)
    
    av_ok = test_alpha_vantage_earnings()
    yf_ok = test_yfinance_earnings()
    
    print("\n" + "=" * 60)
    print("📋 RESULTS")
    print("=" * 60)
    print(f"Alpha Vantage: {'✅ OK' if av_ok else '❌ FAILED'}")
    print(f"yfinance: {'✅ OK' if yf_ok else '❌ FAILED'}")
    
    print("\n" + "=" * 60)
    print("💡 EXPLANATION")
    print("=" * 60)
    print("""
The discrepancy between Grok and your system is because:

1. **Different Data Sources**: 
   - Grok uses aggregated data from multiple sources
   - Your system uses Alpha Vantage or yfinance
   - Each has different update schedules

2. **Different Time Zones**:
   - Earnings dates can vary by timezone
   - "After hours" vs "Before open" timing

3. **Data Freshness**:
   - Some APIs update daily, others real-time
   - Earnings dates can change last-minute

4. **Coverage Differences**:
   - Not all APIs cover all companies
   - Some focus on S&P 500, others broader

🎯 RECOMMENDATION:
Use Alpha Vantage EARNINGS_CALENDAR API for most accurate data
that matches your TradingAgents system.
""")
