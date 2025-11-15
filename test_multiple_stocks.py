"""
Test MarketData.app with multiple stocks to verify accuracy
"""

import os
from tradingagents.dataflows.marketdata import get_marketdata_quote, get_marketdata_stock
from datetime import datetime, timedelta

# Set the token
os.environ["MARKETDATA_API_KEY"] = "TmhUbDMyS0VRTmRUcWlyc3RRMUg5N1B6enM3VkNnZGMwdS1KXzRxdFVLYz0"

print("=" * 70)
print("Testing MarketData.app with Multiple Stocks")
print("=" * 70)

# Test stocks with known recent prices
test_stocks = ["AAPL", "NVDA", "TSLA", "MSFT", "GOOGL"]

end_date = datetime.now().strftime("%Y-%m-%d")
start_date = (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d")

for symbol in test_stocks:
    print(f"\n{'=' * 70}")
    print(f"Testing {symbol}")
    print(f"{'=' * 70}")
    
    # Test historical data
    result = get_marketdata_stock(symbol, start_date, end_date)
    
    if "Error" in result:
        print(f"❌ {result}")
    else:
        lines = result.strip().split('\n')
        # Get last data line (skip header comments)
        data_lines = [l for l in lines if not l.startswith('#') and l.strip() and 'Date' not in l]
        if data_lines:
            last_line = data_lines[-1]
            parts = last_line.split(',')
            if len(parts) >= 5:
                date, open_p, high, low, close, *rest = parts
                print(f"✅ Latest data: {date}")
                print(f"   Close: ${close}")
                print(f"   High: ${high}, Low: ${low}")
        else:
            print(f"⚠️  No data lines found")

print(f"\n{'=' * 70}")
print("Test Complete!")
print(f"{'=' * 70}")
