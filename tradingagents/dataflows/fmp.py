"""
Financial Modeling Prep (FMP) integration for fundamentals
Free tier: 250 API calls/day
API Docs: https://site.financialmodelingprep.com/developer/docs
"""

import os
import requests
from typing import Annotated
import json


def get_fmp_fundamentals(
    ticker: Annotated[str, "ticker symbol"],
    curr_date: Annotated[str, "current date in yyyy-mm-dd format"]
) -> str:
    """
    Get company fundamentals from Financial Modeling Prep
    
    Args:
        ticker: Stock ticker (e.g., AAPL, TSLA)
        curr_date: Current date for context
    
    Returns:
        JSON string with company overview, ratios, and metrics
    """
    api_key = os.getenv("FMP_API_KEY")
    
    if not api_key:
        return "Error: FMP_API_KEY not set in environment variables"
    
    ticker = ticker.upper()
    
    try:
        # Get company profile
        profile_url = f"https://financialmodelingprep.com/api/v3/profile/{ticker}"
        profile_response = requests.get(profile_url, params={"apikey": api_key}, timeout=10)
        profile_response.raise_for_status()
        profile = profile_response.json()[0] if profile_response.json() else {}
        
        # Get key metrics
        metrics_url = f"https://financialmodelingprep.com/api/v3/key-metrics/{ticker}"
        metrics_response = requests.get(metrics_url, params={"apikey": api_key, "limit": 1}, timeout=10)
        metrics_response.raise_for_status()
        metrics = metrics_response.json()[0] if metrics_response.json() else {}
        
        # Get financial ratios
        ratios_url = f"https://financialmodelingprep.com/api/v3/ratios/{ticker}"
        ratios_response = requests.get(ratios_url, params={"apikey": api_key, "limit": 1}, timeout=10)
        ratios_response.raise_for_status()
        ratios = ratios_response.json()[0] if ratios_response.json() else {}
        
        # Combine data
        fundamentals = {
            "symbol": ticker,
            "company_name": profile.get("companyName", "N/A"),
            "sector": profile.get("sector", "N/A"),
            "industry": profile.get("industry", "N/A"),
            "market_cap": profile.get("mktCap", 0),
            "price": profile.get("price", 0),
            "beta": profile.get("beta", 0),
            "pe_ratio": ratios.get("priceEarningsRatio", 0),
            "peg_ratio": ratios.get("priceEarningsToGrowthRatio", 0),
            "price_to_book": ratios.get("priceToBookRatio", 0),
            "debt_to_equity": ratios.get("debtEquityRatio", 0),
            "roe": ratios.get("returnOnEquity", 0),
            "roa": ratios.get("returnOnAssets", 0),
            "current_ratio": ratios.get("currentRatio", 0),
            "revenue_per_share": metrics.get("revenuePerShare", 0),
            "earnings_per_share": metrics.get("netIncomePerShare", 0),
            "dividend_yield": ratios.get("dividendYield", 0),
            "description": profile.get("description", "N/A"),
            "source": "Financial Modeling Prep",
            "date_retrieved": curr_date
        }
        
        return json.dumps(fundamentals, indent=2)
        
    except requests.exceptions.RequestException as e:
        return f"Error fetching data from FMP: {str(e)}"
    except Exception as e:
        return f"Error processing FMP response: {str(e)}"


def get_fmp_income_statement(
    ticker: Annotated[str, "ticker symbol"],
    freq: Annotated[str, "frequency: annual or quarterly"] = "annual"
) -> str:
    """Get income statement from FMP"""
    api_key = os.getenv("FMP_API_KEY")
    
    if not api_key:
        return "Error: FMP_API_KEY not set"
    
    period = "quarter" if freq.lower() == "quarterly" else "annual"
    url = f"https://financialmodelingprep.com/api/v3/income-statement/{ticker.upper()}"
    
    try:
        response = requests.get(url, params={"apikey": api_key, "period": period, "limit": 5}, timeout=10)
        response.raise_for_status()
        return json.dumps(response.json(), indent=2)
    except Exception as e:
        return f"Error: {str(e)}"


def get_fmp_balance_sheet(
    ticker: Annotated[str, "ticker symbol"],
    freq: Annotated[str, "frequency: annual or quarterly"] = "annual"
) -> str:
    """Get balance sheet from FMP"""
    api_key = os.getenv("FMP_API_KEY")
    
    if not api_key:
        return "Error: FMP_API_KEY not set"
    
    period = "quarter" if freq.lower() == "quarterly" else "annual"
    url = f"https://financialmodelingprep.com/api/v3/balance-sheet-statement/{ticker.upper()}"
    
    try:
        response = requests.get(url, params={"apikey": api_key, "period": period, "limit": 5}, timeout=10)
        response.raise_for_status()
        return json.dumps(response.json(), indent=2)
    except Exception as e:
        return f"Error: {str(e)}"


def get_fmp_cash_flow(
    ticker: Annotated[str, "ticker symbol"],
    freq: Annotated[str, "frequency: annual or quarterly"] = "annual"
) -> str:
    """Get cash flow statement from FMP"""
    api_key = os.getenv("FMP_API_KEY")
    
    if not api_key:
        return "Error: FMP_API_KEY not set"
    
    period = "quarter" if freq.lower() == "quarterly" else "annual"
    url = f"https://financialmodelingprep.com/api/v3/cash-flow-statement/{ticker.upper()}"
    
    try:
        response = requests.get(url, params={"apikey": api_key, "period": period, "limit": 5}, timeout=10)
        response.raise_for_status()
        return json.dumps(response.json(), indent=2)
    except Exception as e:
        return f"Error: {str(e)}"


def get_fmp_earnings(
    ticker: Annotated[str, "ticker symbol"]
) -> str:
    """Get earnings data from FMP"""
    api_key = os.getenv("FMP_API_KEY")
    
    if not api_key:
        return "Error: FMP_API_KEY not set"
    
    url = f"https://financialmodelingprep.com/api/v3/historical/earning_calendar/{ticker.upper()}"
    
    try:
        response = requests.get(url, params={"apikey": api_key, "limit": 10}, timeout=10)
        response.raise_for_status()
        return json.dumps(response.json(), indent=2)
    except Exception as e:
        return f"Error: {str(e)}"


if __name__ == "__main__":
    # Test the connection
    print("Testing FMP connection...")
    result = get_fmp_fundamentals("AAPL", "2024-01-01")
    print(result[:500] if len(result) > 500 else result)
