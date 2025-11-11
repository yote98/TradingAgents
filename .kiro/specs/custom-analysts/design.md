# Design Document: Custom Analysts

## Overview

This design document outlines the implementation of three new specialized analyst agents for the TradingAgents system: Options Analyst, Crypto Analyst, and Macro Analyst. These analysts will follow the existing analyst pattern used by the Market, Fundamentals, News, and Social Media analysts, integrating seamlessly with the LangGraph workflow and leveraging the Alpha Vantage MCP server for data retrieval.

The new analysts will be **internal automated agents** (not external coaches), generating data-driven reports that feed into the Research Team's Bull/Bear debate process.

## Architecture

### System Integration

The new analysts will integrate into the existing TradingAgents architecture at the **Internal Analysts** layer:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INTERNAL ANALYSTS (Required)                      │
│                         Automated Agents                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐│
│  │   Market     │  │ Fundamentals │  │     News     │  │ Social  ││
│  │   Analyst    │  │   Analyst    │  │   Analyst    │  │  Media  ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────┘│
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Options    │  │    Crypto    │  │    Macro     │  ← NEW      │
│  │   Analyst    │  │   Analyst    │  │   Analyst    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### File Structure

```
tradingagents/
├── agents/
│   ├── analysts/
│   │   ├── __init__.py
│   │   ├── options_analyst.py      ← NEW
│   │   ├── crypto_analyst.py       ← NEW
│   │   └── macro_analyst.py        ← NEW
│   └── utils/
│       ├── agent_states.py         ← UPDATE (add new report fields)
│       └── agent_utils.py          ← UPDATE (add MCP helper functions)
├── graph/
│   ├── trading_graph.py            ← UPDATE (register new analysts)
│   └── setup.py                    ← UPDATE (add analyst nodes)
└── tests/
    ├── test_options_analyst.py     ← NEW
    ├── test_crypto_analyst.py      ← NEW
    └── test_macro_analyst.py       ← NEW
```

## Components and Interfaces

### 1. Options Analyst

**Purpose**: Analyze options market data to provide insights on options strategies, implied volatility, and options positioning.

**Data Sources** (via Alpha Vantage MCP):
- `REALTIME_OPTIONS`: Current options chain data with Greeks
- `HISTORICAL_OPTIONS`: Historical options data for specific dates
- `TIME_SERIES_DAILY`: Underlying stock price data for context

**Key Functions**:

```python
def create_options_analyst(llm):
    """
    Creates the Options Analyst agent.
    
    Returns a node function that:
    1. Retrieves options data via MCP
    2. Analyzes options chain (calls/puts, strike distribution)
    3. Calculates key metrics (put/call ratio, max pain, IV percentile)
    4. Identifies potential strategies (covered calls, spreads, etc.)
    5. Generates structured report
    """
    
    def options_analyst_node(state):
        ticker = state["company_of_interest"]
        current_date = state["trade_date"]
        
        # Retrieve options data via MCP
        options_data = fetch_options_data(ticker)
        
        # Analyze options chain
        analysis = analyze_options_chain(options_data)
        
        # Generate LLM-powered insights
        prompt = create_options_analysis_prompt(ticker, current_date, analysis)
        chain = prompt | llm
        result = chain.invoke({})
        
        return {
            "messages": [result],
            "options_report": result.content,
        }
    
    return options_analyst_node
```

**Report Structure**:
- Options chain summary (volume, open interest)
- Put/Call ratio analysis
- Implied volatility analysis (IV rank, IV percentile)
- Key strike levels and max pain
- Suggested options strategies
- Risk considerations

### 2. Crypto Analyst

**Purpose**: Monitor and analyze cryptocurrency markets, providing insights on digital asset trends, volatility, and market sentiment.

**Data Sources** (via Alpha Vantage MCP):
- `CRYPTO_INTRADAY`: Intraday crypto price data
- `DIGITAL_CURRENCY_DAILY`: Daily crypto historical data
- `DIGITAL_CURRENCY_WEEKLY`: Weekly crypto data for trend analysis
- `DIGITAL_CURRENCY_MONTHLY`: Monthly crypto data for long-term trends
- `CURRENCY_EXCHANGE_RATE`: Real-time crypto exchange rates

**Key Functions**:

```python
def create_crypto_analyst(llm):
    """
    Creates the Crypto Analyst agent.
    
    Returns a node function that:
    1. Retrieves crypto market data via MCP
    2. Analyzes price trends and volatility
    3. Compares multiple cryptocurrencies
    4. Identifies correlation with traditional markets
    5. Generates structured report
    """
    
    def crypto_analyst_node(state):
        ticker = state["company_of_interest"]
        current_date = state["trade_date"]
        
        # Retrieve crypto data via MCP
        crypto_data = fetch_crypto_data(ticker, current_date)
        
        # Analyze crypto trends
        analysis = analyze_crypto_trends(crypto_data)
        
        # Generate LLM-powered insights
        prompt = create_crypto_analysis_prompt(ticker, current_date, analysis)
        chain = prompt | llm
        result = chain.invoke({})
        
        return {
            "messages": [result],
            "crypto_report": result.content,
        }
    
    return crypto_analyst_node
```

**Report Structure**:
- Current price and 24h/7d/30d performance
- Volume analysis and liquidity assessment
- Volatility metrics
- Correlation with BTC/ETH (if analyzing altcoins)
- Market sentiment indicators
- Key support/resistance levels

### 3. Macro Analyst

**Purpose**: Analyze macroeconomic indicators and their potential impact on market conditions and trading strategies.

**Data Sources** (via Alpha Vantage MCP):
- `REAL_GDP`: GDP growth data
- `UNEMPLOYMENT`: Unemployment rate
- `CPI`: Consumer Price Index
- `INFLATION`: Inflation rates
- `FEDERAL_FUNDS_RATE`: Fed funds rate
- `TREASURY_YIELD`: Treasury yields (multiple maturities)
- `RETAIL_SALES`: Retail sales data
- `DURABLES`: Durable goods orders
- `NONFARM_PAYROLL`: Employment data

**Key Functions**:

```python
def create_macro_analyst(llm):
    """
    Creates the Macro Analyst agent.
    
    Returns a node function that:
    1. Retrieves economic indicators via MCP
    2. Analyzes economic trends and cycles
    3. Assesses monetary policy implications
    4. Identifies market regime (risk-on/risk-off)
    5. Generates structured report
    """
    
    def macro_analyst_node(state):
        ticker = state["company_of_interest"]
        current_date = state["trade_date"]
        
        # Retrieve macro data via MCP
        macro_data = fetch_macro_indicators(current_date)
        
        # Analyze economic conditions
        analysis = analyze_macro_conditions(macro_data)
        
        # Generate LLM-powered insights
        prompt = create_macro_analysis_prompt(ticker, current_date, analysis)
        chain = prompt | llm
        result = chain.invoke({})
        
        return {
            "messages": [result],
            "macro_report": result.content,
        }
    
    return macro_analyst_node
```

**Report Structure**:
- Economic cycle assessment (expansion/contraction)
- Key indicator trends (GDP, unemployment, inflation)
- Monetary policy stance and implications
- Yield curve analysis
- Market regime identification
- Sector rotation recommendations
- Risk assessment based on macro conditions

## Data Models

### AgentState Extensions

Add new report fields to `AgentState` in `agent_states.py`:

```python
class AgentState(MessagesState):
    # ... existing fields ...
    
    # New analyst reports
    options_report: Annotated[str, "Report from the Options Analyst"]
    crypto_report: Annotated[str, "Report from the Crypto Analyst"]
    macro_report: Annotated[str, "Report from the Macro Analyst"]
```

### MCP Helper Functions

Add new helper functions to `agent_utils.py` for MCP data retrieval:

```python
@tool
def get_options_data(ticker: str, require_greeks: bool = True) -> str:
    """
    Retrieve realtime options data for a ticker.
    
    Args:
        ticker: Stock symbol
        require_greeks: Whether to include Greeks in the response
    
    Returns:
        CSV string with options chain data
    """
    # Call Alpha Vantage MCP REALTIME_OPTIONS
    pass

@tool
def get_crypto_intraday(symbol: str, market: str, interval: str) -> str:
    """
    Retrieve intraday cryptocurrency data.
    
    Args:
        symbol: Crypto symbol (e.g., "BTC", "ETH")
        market: Market currency (e.g., "USD", "EUR")
        interval: Time interval (1min, 5min, 15min, 30min, 60min)
    
    Returns:
        CSV string with intraday crypto data
    """
    # Call Alpha Vantage MCP CRYPTO_INTRADAY
    pass

@tool
def get_crypto_daily(symbol: str, market: str) -> str:
    """
    Retrieve daily cryptocurrency data.
    
    Args:
        symbol: Crypto symbol (e.g., "BTC", "ETH")
        market: Market currency (e.g., "USD", "EUR")
    
    Returns:
        CSV string with daily crypto data
    """
    # Call Alpha Vantage MCP DIGITAL_CURRENCY_DAILY
    pass

@tool
def get_economic_indicator(indicator: str, interval: str = "monthly") -> str:
    """
    Retrieve economic indicator data.
    
    Args:
        indicator: Indicator type (GDP, UNEMPLOYMENT, CPI, etc.)
        interval: Data interval (daily, weekly, monthly, quarterly, annual)
    
    Returns:
        CSV string with economic indicator data
    """
    # Call appropriate Alpha Vantage MCP endpoint based on indicator
    pass

@tool
def get_treasury_yield(maturity: str = "10year", interval: str = "monthly") -> str:
    """
    Retrieve treasury yield data.
    
    Args:
        maturity: Maturity timeline (3month, 2year, 5year, 7year, 10year, 30year)
        interval: Data interval (daily, weekly, monthly)
    
    Returns:
        CSV string with treasury yield data
    """
    # Call Alpha Vantage MCP TREASURY_YIELD
    pass
```

## Error Handling

### Graceful Degradation Strategy

Each analyst will implement a multi-tier error handling approach:

1. **API Call Level**:
```python
def fetch_with_retry(mcp_function, max_retries=3, backoff_factor=2):
    """
    Fetch data with exponential backoff retry logic.
    """
    for attempt in range(max_retries):
        try:
            return mcp_function()
        except RateLimitError:
            if attempt < max_retries - 1:
                sleep_time = backoff_factor ** attempt
                time.sleep(sleep_time)
            else:
                raise
        except Exception as e:
            logger.error(f"API call failed: {e}")
            if attempt == max_retries - 1:
                return None
    return None
```

2. **Data Validation Level**:
```python
def validate_data(data, required_fields):
    """
    Validate that data contains required fields and is not empty.
    """
    if data is None or len(data) == 0:
        return False, "No data returned"
    
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    return True, "Valid"
```

3. **Report Generation Level**:
```python
def generate_report_with_fallback(data, analysis_function, llm):
    """
    Generate report with fallback to partial analysis if data is incomplete.
    """
    if data is None:
        return "Unable to retrieve data. Analysis unavailable."
    
    try:
        analysis = analysis_function(data)
        prompt = create_prompt(analysis)
        result = (prompt | llm).invoke({})
        return result.content
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        return f"Partial analysis available. Error: {str(e)}"
```

### Error Response Format

Each analyst will include data quality indicators in their reports:

```python
report_metadata = {
    "data_quality": "complete" | "partial" | "unavailable",
    "missing_fields": [],
    "api_errors": [],
    "timestamp": current_timestamp
}
```

## Testing Strategy

### Unit Tests

Each analyst will have comprehensive unit tests covering:

1. **Data Retrieval Tests**:
```python
def test_options_analyst_data_retrieval():
    """Test that options data is correctly retrieved via MCP."""
    # Mock MCP response
    # Call analyst function
    # Verify data structure
    pass

def test_crypto_analyst_multiple_symbols():
    """Test crypto analyst with multiple cryptocurrency symbols."""
    pass

def test_macro_analyst_indicator_parsing():
    """Test parsing of economic indicator data."""
    pass
```

2. **Analysis Logic Tests**:
```python
def test_options_chain_analysis():
    """Test options chain analysis calculations."""
    # Test put/call ratio calculation
    # Test max pain calculation
    # Test IV percentile calculation
    pass

def test_crypto_trend_detection():
    """Test cryptocurrency trend detection logic."""
    pass

def test_macro_regime_identification():
    """Test market regime identification from macro data."""
    pass
```

3. **Error Handling Tests**:
```python
def test_options_analyst_api_failure():
    """Test graceful handling of API failures."""
    # Mock API failure
    # Verify partial report generation
    pass

def test_crypto_analyst_rate_limit():
    """Test rate limit handling with exponential backoff."""
    pass

def test_macro_analyst_missing_data():
    """Test handling of missing economic data."""
    pass
```

### Integration Tests

Integration tests will verify analyst interaction with the LangGraph workflow:

```python
def test_options_analyst_in_workflow():
    """Test Options Analyst integration in full trading workflow."""
    # Create test state
    # Run workflow with Options Analyst enabled
    # Verify state updates correctly
    # Verify report reaches Research Team
    pass

def test_all_analysts_together():
    """Test all analysts (including new ones) working together."""
    # Enable all analysts
    # Run full workflow
    # Verify no conflicts
    # Verify all reports generated
    pass
```

### Mock Data Strategy

Create mock MCP responses for testing without API calls:

```python
# tests/mocks/mcp_responses.py

MOCK_OPTIONS_DATA = """
symbol,strike,type,expiration,bid,ask,volume,open_interest,delta,gamma,theta,vega
AAPL,265,call,2025-11-21,5.20,5.40,1250,3500,0.65,0.08,-0.15,0.25
AAPL,270,call,2025-11-21,2.80,3.00,2100,5200,0.45,0.10,-0.18,0.30
...
"""

MOCK_CRYPTO_DATA = """
timestamp,open,high,low,close,volume
2025-11-07 00:00:00,268.50,272.30,266.80,270.10,45000
...
"""

MOCK_MACRO_DATA = {
    "GDP": "...",
    "UNEMPLOYMENT": "...",
    "CPI": "...",
}
```

## Implementation Phases

### Phase 1: Foundation (Options Analyst)
1. Create `options_analyst.py` with basic structure
2. Implement MCP helper functions for options data
3. Add `options_report` field to `AgentState`
4. Create unit tests with mocked data
5. Integrate into `trading_graph.py`

### Phase 2: Crypto Support (Crypto Analyst)
1. Create `crypto_analyst.py` with basic structure
2. Implement MCP helper functions for crypto data
3. Add `crypto_report` field to `AgentState`
4. Create unit tests with mocked data
5. Integrate into `trading_graph.py`

### Phase 3: Macro Analysis (Macro Analyst)
1. Create `macro_analyst.py` with basic structure
2. Implement MCP helper functions for economic indicators
3. Add `macro_report` field to `AgentState`
4. Create unit tests with mocked data
5. Integrate into `trading_graph.py`

### Phase 4: Integration & Testing
1. Create integration tests for all three analysts
2. Test full workflow with all analysts enabled
3. Verify backward compatibility with existing analysts
4. Performance testing and optimization
5. Documentation updates

## Configuration

Add analyst selection to the configuration:

```python
# In default_config.py or user config
config = {
    # ... existing config ...
    
    "selected_analysts": [
        "market",
        "social", 
        "news",
        "fundamentals",
        "options",      # NEW
        "crypto",       # NEW
        "macro"         # NEW
    ],
}
```

Users can enable/disable specific analysts by modifying this list.

## Performance Considerations

1. **Parallel Data Fetching**: Where possible, fetch data for multiple analysts in parallel
2. **Caching**: Implement caching for macro data (changes infrequently)
3. **Rate Limiting**: Respect Alpha Vantage API rate limits with intelligent request scheduling
4. **Selective Activation**: Allow users to enable only needed analysts to reduce API calls

## Security Considerations

1. **API Key Management**: Ensure Alpha Vantage API key is securely stored and not logged
2. **Data Validation**: Validate all external data before processing
3. **Error Message Sanitization**: Avoid exposing sensitive information in error messages
4. **Rate Limit Protection**: Implement rate limiting to prevent API key abuse

## Future Enhancements

1. **Historical Analysis**: Add ability to backtest analyst recommendations
2. **Analyst Weighting**: Allow users to configure relative importance of each analyst
3. **Custom Indicators**: Support for user-defined custom indicators
4. **Multi-Asset Support**: Extend crypto analyst to support forex and commodities
5. **Real-time Alerts**: Add ability to trigger alerts based on analyst findings
