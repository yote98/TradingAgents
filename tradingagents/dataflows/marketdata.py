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
    
    params = {
        "from": start_date,
        "to": end_date,
        "token": api_key
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
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
    symbol: Annotated[str, "ticker symbol of the company"]
) -> dict:
    """
    Get real-time quote for a stock from MarketData.app
    Uses the /prices/ endpoint for real-time midpoint prices
    
    Args:
        symbol: Stock ticker (e.g., AAPL, TSLA)
    
    Returns:
        Dictionary with current price and metadata
    """
    api_key = os.getenv("MARKETDATA_API_KEY")
    
    if not api_key:
        return {"error": "MARKETDATA_API_KEY not set"}
    
    # Use the /prices/ endpoint for real-time data
    url = f"https://api.marketdata.app/v1/stocks/prices/{symbol.upper()}/"
    
    params = {"token": api_key}
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("s") != "ok":
            return {"error": data.get("errmsg", "Unknown error")}
        
        # Extract price data (arrays with single values)
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


def test_marketdata_connection():
    """
    Test MarketData.app API connection
    Returns True if working, False otherwise
    """
    api_key = os.getenv("MARKETDATA_API_KEY")
    
    if not api_key:
        print("❌ MARKETDATA_API_KEY not set")
        return False
    
    # Test with AAPL quote
    result = get_marketdata_quote("AAPL")
    
    if "error" in result:
        print(f"❌ MarketData.app test failed: {result['error']}")
        return False
    
    print(f"✅ MarketData.app working! AAPL price: ${result.get('price', 'N/A')}")
    return True


if __name__ == "__main__":
    # Test the connection
    print("Testing MarketData.app connection...")
    test_marketdata_connection()
