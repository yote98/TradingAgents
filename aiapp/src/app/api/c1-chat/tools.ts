export const tools = [
  {
    type: "function" as const,
    function: {
      name: "analyze_stock",
      description: "Analyze a stock using TradingAgents multi-agent system with Market, Fundamentals, News, and Social analysts",
      parameters: {
        type: "object",
        properties: {
          ticker: {
            type: "string",
            description: "Stock ticker symbol (e.g., AAPL, TSLA, MSFT)",
          },
          analysts: {
            type: "array",
            items: {
              type: "string",
              enum: ["market", "fundamentals", "news", "social"],
            },
            description: "List of analysts to include (default: all)",
          },
        },
        required: ["ticker"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "backtest_strategy",
      description: "Run a backtest of a trading strategy on historical data",
      parameters: {
        type: "object",
        properties: {
          ticker: {
            type: "string",
            description: "Stock ticker symbol",
          },
          start_date: {
            type: "string",
            description: "Start date in YYYY-MM-DD format",
          },
          end_date: {
            type: "string",
            description: "End date in YYYY-MM-DD format",
          },
          initial_capital: {
            type: "number",
            description: "Initial capital amount (default: 10000)",
          },
        },
        required: ["ticker", "start_date", "end_date"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "calculate_risk",
      description: "Calculate position sizing and risk metrics for a trade",
      parameters: {
        type: "object",
        properties: {
          ticker: {
            type: "string",
            description: "Stock ticker symbol",
          },
          account_value: {
            type: "number",
            description: "Total account value in dollars",
          },
          risk_per_trade_pct: {
            type: "number",
            description: "Risk per trade as percentage (0.1-10.0)",
          },
          current_price: {
            type: "number",
            description: "Current stock price",
          },
        },
        required: ["ticker", "account_value", "risk_per_trade_pct", "current_price"],
      },
    },
  },
];
