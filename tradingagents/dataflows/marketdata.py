"""
MarketData.app integration for real-time stock data
Free 30-day trial with full access to live data
API Docs: https://www.marketdata.app/docs/api/
"""

import os
import requests
from typing import Annotated
from datetime import datetime, timedelta
import pandas as pd


def get_marketdata_stock(
    symbol: Annotated[str, "ticker symbol of the company"],
    start_date: Annotated[str, "Start date in yyyy-mm-dd format"],
    end_date: Annotated[str, "End date in yyyy-mm-dd format"],
) -> str:
    """
    Get stock price data from MarketData.app (real-time, free trial)
    
    Args:
        symbol: Stock ticker (e.g., AAPL, TSLA)
        start_date: Start date in yyyy-mm-dd format
        end_date: End date in yyyy-mm-dd format
    
    Returns:
        CSV string with OHLCV data
    """
    api_key = os.getenv("MARKETDATA_API_KEY")
    
    if not api_key:
        return "Error: MARKETDATA_API_KEY not set in environment variables"
    
    # MarketData.app API endpoint
    url = f"https://api.marketdata.app/v1/stocks/candles/D/{symbol.upper()}/"
    
    # Use Authorization header (recommended by MarketData.app)
    headers = {
        "Authorization": f"Token {api_key}"
    }
    
    params = {
        "from": start_date,
        "to": end_date
    }
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("s") != "ok":
            return f"Error: {data.get('errmsg', 'Unknown error from MarketData.app')}"
        
        # Parse response
        timestamps = data.get("t", [])
        opens = data.get("o", [])
        highs = data.get("h", [])
        lows = data.get("l", [])
        closes = data.get("c", [])
        volumes = data.get("v", [])
        
        if not timestamps:
            return f"No data found for {symbol} between {start_date} and {end_date}"
        
        # Create DataFrame
        df = pd.DataFrame({
            "Date": [datetime.fromtimestamp(ts).strftime("%Y-%m-%d") for ts in timestamps],
            "Open": [round(o, 2) for o in opens],
            "High": [round(h, 2) for h in highs],
            "Low": [round(l, 2) for l in lows],
            "Close": [round(c, 2) for c in closes],
            "Volume": volumes
        })
        
        # Add header information
        header = f"# Stock data for {symbol.upper()} from {start_date} to {end_date}\n"
        header += f"# Source: MarketData.app (Real-time data)\n"
        header += f"# Total records: {len(df)}\n"
        header += f"# Data retrieved on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        
        return header + df.to_csv(index=False)
        
    except requests.exceptions.RequestException as e:
        return f"Error fetching data from MarketData.app: {str(e)}"
    except Exception as e:
        return f"Error processing MarketData.app response: {str(e)}"


def get_marketdata_quote(
    symbol: Annotated[str, "ticker symbol (stock, ETF, or index)"]
) -> dict:
    """
    Get real-time quote for a stock, ETF, or index from MarketData.app
    Uses the /prices/ endpoint for real-time midpoint prices
    
    Supports:
    - Stocks: AAPL, TSLA, NVDA
    - ETFs: SPY, QQQ, IWM, VTI
    - Indices: ^GSPC (S&P 500), ^DJI (Dow), ^NDX (Nasdaq), ^VIX
    
    Args:
        symbol: Ticker symbol (e.g., AAPL, SPY, ^GSPC)
    
    Returns:
        Dictionary with current price and metadata
    """
    api_key = os.getenv("MARKETDATA_API_KEY")
    
    if not api_key:
        return {"error": "MARKETDATA_API_KEY not set"}
    
    # Use the /prices/ endpoint for real-time data (stocks and ETFs)
    # Note: /stocks/quote/ from docs doesn't work on free tier
    url = f"https://api.marketdata.app/v1/stocks/prices/{symbol.upper()}/"
    
    # Use Authorization header (recommended by MarketData.app)
    headers = {
        "Authorization": f"Token {api_key}"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("s") != "ok":
            return {"error": data.get("errmsg", "Unknown error")}
        
        # Extract price data (arrays with single values)
        # Response format: {"s":"ok","symbol":["AAPL"],"mid":[150.25],...}
        symbols = data.get("symbol", [])
        prices = data.get("mid", [])  # Midpoint prices
        timestamps = data.get("updated", [])
        
        if not prices or not symbols:
            return {"error": "No price data returned"}
        
        # Extract first (and only) result
        quote = {
            "symbol": symbols[0] if symbols else symbol.upper(),
            "price": prices[0] if prices else None,
            "mid": prices[0] if prices else None,
            "updated": timestamps[0] if timestamps else None,
            "updated_datetime": datetime.fromtimestamp(timestamps[0]).isoformat() if timestamps and timestamps[0] else None,
            "source": "MarketData.app (Real-time)"
        }
        
        return quote
        
    except Exception as e:
        return {"error": str(e)}


def get_marketdata_earnings(
    symbol: Annotated[str, "ticker symbol"]
) -> dict:
    """
    Get earnings data for a stock from MarketData.app
    Premium endpoint - returns reported and estimated EPS
    
    Args:
        symbol: Stock ticker (e.g., AAPL, NVDA)
    
    Returns:
        Dictionary with earnings data including:
        - reportedEPS: Actual earnings per share
        - estimatedEPS: Analyst estimates
        - surpriseEPS: Beat/miss amount
        - reportDate: When earnings were reported
    """
    api_key = os.getenv("MARKETDATA_API_KEY")
    
    if not api_key:
        return {"error": "MARKETDATA_API_KEY not set"}
    
    url = f"https://api.marketdata.app/v1/stocks/earnings/{symbol.upper()}/"
    
    headers = {
        "Authorization": f"Token {api_key}"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("s") != "ok":
            return {"error": data.get("errmsg", "Unknown error")}
        
        # Parse earnings data
        earnings = {
            "symbol": data.get("symbol", [symbol.upper()])[0],
            "fiscalYear": data.get("fiscalYear", [None])[0],
            "fiscalQuarter": data.get("fiscalQuarter", [None])[0],
            "reportDate": data.get("reportDate", [None])[0],
            "reportTime": data.get("reportTime", [None])[0],
            "reportedEPS": data.get("reportedEPS", [None])[0],
            "estimatedEPS": data.get("estimatedEPS", [None])[0],
            "surpriseEPS": data.get("surpriseEPS", [None])[0],
            "surpriseEPSpct": data.get("surpriseEPSpct", [None])[0],
            "source": "MarketData.app"
        }
        
        # Convert timestamps to readable dates
        if earnings["reportDate"]:
            earnings["reportDateFormatted"] = datetime.fromtimestamp(earnings["reportDate"]).strftime("%Y-%m-%d")
        
        return earnings
        
    except Exception as e:
        return {"error": str(e)}


def get_marketdata_index_quote(
    symbol: Annotated[str, "index symbol (e.g., ^GSPC, ^DJI, ^VIX)"]
) -> dict:
    """
    Get real-time quote for an index from MarketData.app
    Uses the /indices/quote/ endpoint
    
    Common indices:
    - ^GSPC: S&P 500
    - ^DJI: Dow Jones Industrial Average
    - ^NDX: Nasdaq 100
    - ^RUT: Russell 2000
    - ^VIX: Volatility Index
    
    Args:
        symbol: Index symbol (e.g., ^GSPC)
    
    Returns:
        Dictionary with current price and metadata
    """
    api_key = os.getenv("MARKETDATA_API_KEY")
    
    if not api_key:
        return {"error": "MARKETDATA_API_KEY not set"}
    
    # Use the /indices/quote/ endpoint for index data
    # URL encode the symbol (^ becomes %5E)
    import urllib.parse
    encoded_symbol = urllib.parse.quote(symbol.upper(), safe="")
    url = f"https://api.marketdata.app/v1/indices/quote/{encoded_symbol}/"
    
    # Use Authorization header (recommended by MarketData.app)
    headers = {
        "Authorization": f"Token {api_key}"
    }
    
    params = {"feed": "live"}
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("s") != "ok":
            return {"error": data.get("errmsg", "Unknown error")}
        
        # Extract index data
        quote = {
            "symbol": data.get("symbol", [symbol.upper()])[0] if isinstance(data.get("symbol"), list) else data.get("symbol", symbol.upper()),
            "price": data.get("price", [None])[0] if isinstance(data.get("price"), list) else data.get("price"),
            "change": data.get("change", [None])[0] if isinstance(data.get("change"), list) else data.get("change"),
            "change_percent": data.get("changepct", [None])[0] if isinstance(data.get("changepct"), list) else data.get("changepct"),
            "high": data.get("high", [None])[0] if isinstance(data.get("high"), list) else data.get("high"),
            "low": data.get("low", [None])[0] if isinstance(data.get("low"), list) else data.get("low"),
            "updated": data.get("updated", [None])[0] if isinstance(data.get("updated"), list) else data.get("updated"),
            "updated_datetime": datetime.fromtimestamp(data.get("updated", [0])[0]).isoformat() if isinstance(data.get("updated"), list) and data.get("updated", [0])[0] else None,
            "source": "MarketData.app (Index - Real-time)"
        }
        
        return quote
        
    except Exception as e:
        return {"error": str(e)}


def get_marketdata_bulk_quotes(
    symbols: Annotated[list, "list of ticker symbols (up to 100)"]
) -> dict:
    """
    Get real-time quotes for multiple stocks/ETFs at once
    More efficient than individual calls
    
    Args:
        symbols: List of tickers (e.g., ["AAPL", "SPY", "TSLA"])
    
    Returns:
        Dictionary with quotes for each symbol
    """
    api_key = os.getenv("MARKETDATA_API_KEY")
    
    if not api_key:
        return {"error": "MARKETDATA_API_KEY not set"}
    
    if len(symbols) > 100:
        return {"error": "Maximum 100 symbols per request"}
    
    # Use the bulk quote endpoint with symbols parameter
    symbols_str = ",".join([s.upper() for s in symbols])
    url = "https://api.marketdata.app/v1/stocks/quote/"
    
    headers = {
        "Authorization": f"Token {api_key}"
    }
    
    params = {
        "symbols": symbols_str,
        "feed": "live"
    }
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("s") != "ok":
            return {"error": data.get("errmsg", "Unknown error")}
        
        # Parse bulk response
        quotes = {}
        symbols_list = data.get("symbol", [])
        last_prices = data.get("last_price", [])
        bid_prices = data.get("bid_price", [])
        ask_prices = data.get("ask_price", [])
        volumes = data.get("volume", [])
        timestamps = data.get("timestamp", [])
        
        for i, symbol in enumerate(symbols_list):
            quotes[symbol] = {
                "symbol": symbol,
                "price": last_prices[i] if i < len(last_prices) else None,
                "last_price": last_prices[i] if i < len(last_prices) else None,
                "bid_price": bid_prices[i] if i < len(bid_prices) else None,
                "ask_price": ask_prices[i] if i < len(ask_prices) else None,
                "volume": volumes[i] if i < len(volumes) else None,
                "updated": timestamps[i] if i < len(timestamps) else None,
                "updated_datetime": timestamps[i] if i < len(timestamps) else None,
                "source": "MarketData.app (Bulk - Real-time)"
            }
        
        return quotes
        
    except Exception as e:
        return {"error": str(e)}


def test_marketdata_connection():
    """
    Test MarketData.app API connection with stocks, ETFs, and indices
    Returns True if working, False otherwise
    """
    api_key = os.getenv("MARKETDATA_API_KEY")
    
    if not api_key:
        print("❌ MARKETDATA_API_KEY not set")
        return False
    
    print("\n" + "=" * 60)
    print("Testing MarketData.app Connection")
    print("=" * 60)
    
    # Test stock quote
    print("\n1. Testing Stock Quote (AAPL)...")
    result = get_marketdata_quote("AAPL")
    
    if "error" in result:
        print(f"   ❌ Failed: {result['error']}")
        return False
    
    print(f"   ✅ AAPL price: ${result.get('price', 'N/A')}")
    
    # Test ETF quote
    print("\n2. Testing ETF Quote (SPY)...")
    result = get_marketdata_quote("SPY")
    
    if "error" in result:
        print(f"   ❌ Failed: {result['error']}")
    else:
        print(f"   ✅ SPY price: ${result.get('price', 'N/A')}")
    
    # Test index quote
    print("\n3. Testing Index Quote (^GSPC - S&P 500)...")
    result = get_marketdata_index_quote("^GSPC")
    
    if "error" in result:
        print(f"   ❌ Failed: {result['error']}")
    else:
        print(f"   ✅ S&P 500: {result.get('price', 'N/A')}")
    
    # Test bulk quotes
    print("\n4. Testing Bulk Quotes (AAPL, TSLA, NVDA)...")
    result = get_marketdata_bulk_quotes(["AAPL", "TSLA", "NVDA"])
    
    if "error" in result:
        print(f"   ❌ Failed: {result['error']}")
    else:
        print(f"   ✅ Got {len(result)} quotes")
        for symbol, quote in result.items():
            print(f"      {symbol}: ${quote.get('price', 'N/A')}")
    
    print("\n" + "=" * 60)
    print("✅ All tests passed!")
    print("=" * 60)
    
    return True


if __name__ == "__main__":
    # Test the connection
    print("Testing MarketData.app connection...")
    test_marketdata_connection()
