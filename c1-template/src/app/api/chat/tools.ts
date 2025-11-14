import type { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction.mjs";
import type { RunnableToolFunctionWithoutParse } from "openai/lib/RunnableFunction.mjs";
import { googleImageTool } from "./tools/googleImage";
import { weatherTool } from "./tools/weather";
import { 
  analyzeStockTool, 
  backtestStrategyTool, 
  calculateRiskTool, 
  getSentimentTool 
} from "./tools/tradingagents";

/**
 * Collection of tools available to the AI agent.
 * Each tool is a function that the AI can use to perform specific tasks.
 *
 * Current tools:
 * - googleImageTool: Fetches image URLs based on text descriptions
 * - weatherTool: Gets weather information
 * - analyzeStockTool: Multi-agent stock analysis
 * - backtestStrategyTool: Historical strategy testing
 * - calculateRiskTool: Position sizing and risk metrics
 * - getSentimentTool: Social media sentiment analysis
 *
 * ADD MORE TOOLS HERE TO EXTEND THE AI'S CAPABILITIES
 */

export const tools: (
  | RunnableToolFunctionWithoutParse
  | RunnableToolFunctionWithParse<any>
)[] = [
  googleImageTool, 
  weatherTool,
  // TradingAgents tools
  analyzeStockTool,
  backtestStrategyTool,
  calculateRiskTool,
  getSentimentTool,
];
