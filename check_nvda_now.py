import yfinance as yf
from datetime import datetime

# Get NVDA current price
nvda = yf.Ticker("NVDA")
info = nvda.info

price = info.get('regularMarketPrice') or info.get('currentPrice')
prev_close = info.get('previousClose')
change = info.get('regularMarketChange')
change_pct = info.get('regularMarketChangePercent')

print(f"NVDA Stock")
print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Current Price: ${price}")
print(f"Previous Close: ${prev_close}")
print(f"Change: ${change} ({change_pct}%)")
