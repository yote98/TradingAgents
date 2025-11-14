# Task 6 Complete: calculate_risk Tool Implementation

## Summary

Successfully implemented the `calculate_risk` tool for the TradingAgents MCP server. This tool enables C1 and other MCP clients to calculate position sizing and risk metrics for trades based on account size and risk tolerance.

## What Was Implemented

### 1. CalculateRiskTool Handler (`mcp_server/tools/risk.py`)

Created a complete tool handler with:
- **Input validation**: Validates ticker, account value, risk percentage, prices
- **Price validation**: Ensures stop loss is below current price, target is above
- **Error handling**: Comprehensive error handling with structured error responses
- **Logging**: Detailed logging of risk calculations
- **MCP compliance**: Returns ToolResult objects compatible with MCP protocol

**Key Features:**
- Accepts ticker, account value, risk percentage, current price
- Optional stop loss price (auto-calculated if not provided)
- Optional target price for risk-reward analysis
- Returns position sizing, risk metrics, and warnings
- Fast execution (no timeout needed)

### 2. TradingAgents Adapter Updates (`mcp_server/adapters/tradingagents.py`)

Enhanced the adapter with comprehensive risk calculation:
- **Auto stop loss**: Calculates 2% default stop loss if not provided
- **Position sizing**: Calculates shares based on risk tolerance
- **Risk metrics**: Computes risk per share, risk amount, position percentage
- **Risk-reward analysis**: Calculates ratio, potential profit/loss when target provided
- **Warning system**: Generates warnings for excessive risk or position size

**Risk Warnings:**
- Position size > 25% of account
- Risk per trade > 5%
- Position size of 0 shares
- Position value exceeds account value

### 3. Server Integration

Updated files to register the tool:
- `mcp_server/tools/__init__.py`: Added CalculateRiskTool export
- `mcp_server/__main__.py`: Registered calculate_risk tool with server

### 4. Testing (`test_risk_tool.py`)

Created comprehensive test script with three scenarios:
- **Conservative Trade**: 1% risk, defined stop loss
- **Moderate Trade**: 2% risk, auto stop loss
- **Aggressive Trade**: 3% risk, wider stop loss

## API Specification

### Input Schema

```json
{
  "ticker": "AAPL",
  "account_value": 10000,
  "risk_per_trade_pct": 2.0,
  "current_price": 150.00,
  "stop_loss_price": 147.00,  // Optional
  "target_price": 156.00       // Optional
}
```

### Output Format

```json
{
  "ticker": "AAPL",
  "account_value": 10000.0,
  "risk_per_trade_pct": 2.0,
  "current_price": 150.00,
  "stop_loss_price": 147.00,
  "stop_loss_pct": 2.00,
  "target_price": 156.00,
  "position_sizing": {
    "recommended_shares": 66,
    "position_value": 9900.00,
    "position_pct_of_account": 99.00,
    "risk_amount": 200.00,
    "risk_per_share": 3.00
  },
  "risk_reward": {
    "risk_reward_ratio": 2.00,
    "potential_profit": 396.00,
    "potential_profit_pct": 4.00,
    "potential_loss": 200.00,
    "potential_loss_pct": 2.00
  },
  "warnings": [
    "Position size (99.0% of account) exceeds recommended 25% maximum"
  ],
  "execution_time_seconds": 0.001
}
```

## Risk Metrics Explained

### Position Sizing
- **Recommended Shares**: Number of shares to buy based on risk tolerance
- **Position Value**: Total dollar value of the position
- **Position % of Account**: Position size as percentage of total account
- **Risk Amount**: Dollar amount at risk (account × risk %)
- **Risk per Share**: Dollar risk per share (current price - stop loss)

### Risk/Reward Analysis
- **Risk/Reward Ratio**: Ratio of potential profit to potential loss
- **Potential Profit**: Dollar profit if target is reached
- **Potential Profit %**: Percentage gain if target is reached
- **Potential Loss**: Dollar loss if stop loss is hit
- **Potential Loss %**: Percentage loss if stop loss is hit

### Stop Loss
- **Stop Loss Price**: Price at which to exit the trade
- **Stop Loss %**: Percentage below current price

## Risk Management Best Practices

The tool implements industry-standard risk management guidelines:

1. **Risk per Trade**: Recommended 1-2%, maximum 5%
2. **Position Size**: Recommended < 25% of account
3. **Stop Loss**: Typically 2-5% below entry
4. **Risk/Reward Ratio**: Minimum 1.5:1, ideally 2:1 or higher

## Files Created/Modified

### Created:
- `mcp_server/tools/risk.py`
- `test_risk_tool.py`
- `MCP_TASK_6_COMPLETE.md`

### Modified:
- `mcp_server/adapters/tradingagents.py` (enhanced calculate_risk method)
- `mcp_server/tools/__init__.py` (added CalculateRiskTool export)
- `mcp_server/__main__.py` (registered risk tool)

## Usage Example

```python
# In C1 or MCP client
result = await mcp_client.call_tool(
    "calculate_risk",
    {
        "ticker": "AAPL",
        "account_value": 10000,
        "risk_per_trade_pct": 2.0,
        "current_price": 150.00,
        "stop_loss_price": 147.00,
        "target_price": 156.00
    }
)
```

## Use Cases

1. **Position Sizing**: Determine how many shares to buy
2. **Risk Assessment**: Evaluate if a trade fits risk tolerance
3. **Trade Planning**: Calculate stop loss and target prices
4. **Portfolio Management**: Ensure positions don't exceed limits
5. **Risk/Reward Analysis**: Evaluate if trade has favorable risk/reward

## Requirements Satisfied

✓ **Requirement 4.1**: Tool exposed with correct parameters  
✓ **Requirement 4.2**: Calculates position size using risk management system  
✓ **Requirement 4.3**: Accepts account value, risk %, and price parameters  
✓ **Requirement 4.4**: Returns position size, stop loss, and risk-reward ratio  
✓ **Requirement 4.5**: Validates risk percentage between 0.1 and 10.0  

## Next Steps

With Tasks 4, 5, and 6 complete, we now have three powerful tools for C1:
1. **analyze_stock**: Multi-agent stock analysis ✅
2. **backtest_strategy**: Historical strategy testing ✅
3. **calculate_risk**: Position sizing and risk management ✅

**Remaining tools to implement:**
- Task 7: get_sentiment tool
- Task 8: coach_plans resource

---

**Status**: ✅ Complete  
**Date**: November 11, 2025  
**Task**: 6. Implement calculate_risk tool
