import { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction.mjs";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const TRADINGAGENTS_API = process.env.TRADINGAGENTS_API_URL || "http://localhost:5000";

/**
 * Analyze Stock Tool
 * Runs comprehensive multi-agent analysis on a stock
 */
export const analyzeStockTool: RunnableToolFunctionWithParse<{
  ticker: string;
  max_debate_rounds?: number;
}> = {
  type: "function",
  function: {
    name: "analyze_stock",
    description: "Run comprehensive stock analysis using TradingAgents multi-agent system with market, fundamentals, news, and social analysts. Returns detailed analysis with buy/sell/hold recommendation.",
    parameters: zodToJsonSchema(
      z.object({
        ticker: z.string().describe("Stock ticker symbol (e.g., AAPL, TSLA, BTC-USD, NVDA)"),
        max_debate_rounds: z.number().optional().describe("Number of debate rounds between bull and bear researchers (default: 1, max: 3)"),
      })
    ),
    parse: (args: string) => {
      return JSON.parse(args);
    },
    function: async ({ ticker, max_debate_rounds = 1 }) => {
      try {
        const response = await fetch(`${TRADINGAGENTS_API}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker, max_debate_rounds }),
        });

        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Format the response for C1
        const currentPrice = result.market_data?.current_price || result.current_price;
        
        // Create a clear message that forces AI to acknowledge the price
        const priceAlert = currentPrice 
          ? `\n\n🚨 CRITICAL: Current Real-Time Price is $${currentPrice} from MarketData.app. All analysis MUST be based on this exact price. 🚨\n\n`
          : "";
        
        return JSON.stringify({
          success: true,
          ticker: result.ticker,
          current_price: currentPrice,
          price_alert: priceAlert,
          recommendation: result.final_decision,
          target_price: result.target_price,
          stop_loss: result.stop_loss,
          confidence: result.confidence,
          analysts: {
            market: result.market_report,
            fundamentals: result.fundamentals_report,
            news: result.news_report,
            social: result.social_report,
          },
          debate_summary: result.research_synthesis,
          timestamp: new Date().toISOString(),
        }, null, 2);
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: "Failed to analyze stock",
          details: error instanceof Error ? error.message : String(error),
          suggestion: "Make sure the TradingAgents API is running on port 5000",
        });
      }
    },
  },
};

/**
 * Backtest Strategy Tool
 */
export const backtestStrategyTool: RunnableToolFunctionWithParse<{
  ticker: string;
  start_date: string;
  end_date: string;
  initial_capital?: number;
}> = {
  type: "function",
  function: {
    name: "backtest_strategy",
    description: "Run backtesting on a trading strategy with historical data. Returns performance metrics including total return, Sharpe ratio, max drawdown, and trade history.",
    parameters: zodToJsonSchema(
      z.object({
        ticker: z.string().describe("Stock ticker symbol"),
        start_date: z.string().describe("Start date in YYYY-MM-DD format (e.g., 2024-01-01)"),
        end_date: z.string().describe("End date in YYYY-MM-DD format (e.g., 2024-12-01)"),
        initial_capital: z.number().optional().describe("Initial capital amount in dollars (default: 100000)"),
      })
    ),
    parse: (args: string) => JSON.parse(args),
    function: async ({ ticker, start_date, end_date, initial_capital = 100000 }) => {
      try {
        const response = await fetch(`${TRADINGAGENTS_API}/backtest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker, start_date, end_date, initial_capital }),
        });

        if (!response.ok) {
          throw new Error(`Backtest failed: ${response.statusText}`);
        }

        const result = await response.json();
        return JSON.stringify({
          success: true,
          ...result
        }, null, 2);
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: "Backtest failed",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    },
  },
};

/**
 * Calculate Risk Tool
 */
export const calculateRiskTool: RunnableToolFunctionWithParse<{
  ticker: string;
  account_value: number;
  risk_per_trade_pct: number;
  current_price: number;
}> = {
  type: "function",
  function: {
    name: "calculate_risk",
    description: "Calculate position sizing and risk metrics for a trade. Returns recommended position size, stop loss price, risk amount, and risk-reward ratio.",
    parameters: zodToJsonSchema(
      z.object({
        ticker: z.string().describe("Stock ticker symbol"),
        account_value: z.number().describe("Total account value in dollars"),
        risk_per_trade_pct: z.number().describe("Risk per trade as percentage (0.1-10.0, typically 1-2%)"),
        current_price: z.number().describe("Current stock price"),
      })
    ),
    parse: (args: string) => JSON.parse(args),
    function: async ({ ticker, account_value, risk_per_trade_pct, current_price }) => {
      try {
        const response = await fetch(`${TRADINGAGENTS_API}/risk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker, account_value, risk_per_trade_pct, current_price }),
        });

        if (!response.ok) {
          throw new Error(`Risk calculation failed: ${response.statusText}`);
        }

        const result = await response.json();
        return JSON.stringify({
          success: true,
          ...result
        }, null, 2);
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: "Risk calculation failed",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    },
  },
};

/**
 * Get Sentiment Tool
 */
export const getSentimentTool: RunnableToolFunctionWithParse<{
  ticker: string;
}> = {
  type: "function",
  function: {
    name: "get_sentiment",
    description: "Get social media sentiment analysis for a stock from Twitter, StockTwits, and Reddit. Returns sentiment scores, volume metrics, and trending topics.",
    parameters: zodToJsonSchema(
      z.object({
        ticker: z.string().describe("Stock ticker symbol"),
      })
    ),
    parse: (args: string) => JSON.parse(args),
    function: async ({ ticker }) => {
      try {
        const response = await fetch(`${TRADINGAGENTS_API}/sentiment/${ticker}`);
        
        if (!response.ok) {
          throw new Error(`Sentiment analysis failed: ${response.statusText}`);
        }

        const result = await response.json();
        return JSON.stringify({
          success: true,
          ...result
        }, null, 2);
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: "Sentiment analysis failed",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    },
  },
};
