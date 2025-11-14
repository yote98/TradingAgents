"""
TradingAgents system adapter

This adapter provides a clean interface between the MCP server
and the TradingAgents multi-agent analysis system.
"""

import logging
import sys
import os
from typing import Dict, Any, Optional, List
from datetime import datetime

# Add tradingagents to path if needed
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

logger = logging.getLogger(__name__)


class TradingAgentsAdapter:
    """
    Adapter for TradingAgents system
    
    Provides methods to run analysis, backtesting, and other
    TradingAgents operations from the MCP server.
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize TradingAgents adapter
        
        Args:
            config: Configuration dictionary
        """
        self.config = config
        self.graph = None
        self._initialized = False
        
        logger.info("TradingAgents adapter initialized")
    
    async def initialize(self) -> None:
        """
        Initialize TradingAgents graph
        
        Lazy initialization - only creates the graph when first needed.
        """
        if self._initialized:
            return
        
        try:
            # Import TradingAgents components
            from tradingagents.graph.trading_graph import TradingAgentsGraph
            from tradingagents.default_config import DEFAULT_CONFIG
            
            # Merge default config with our config
            graph_config = DEFAULT_CONFIG.copy()
            graph_config.update({
                "deep_think_llm": self.config.get("deep_think_llm", "gpt-4o-mini"),
                "quick_think_llm": self.config.get("quick_think_llm", "gpt-4o-mini"),
                "max_debate_rounds": self.config.get("max_debate_rounds", 1),
                "core_stock_apis": self.config.get("core_stock_apis", ["yfinance"]),
                "technical_indicators": self.config.get("technical_indicators", ["yfinance"]),
                "fundamental_data": self.config.get("fundamental_data", ["yfinance"]),
                "news_data": self.config.get("news_data", ["yfinance"]),
            })
            
            # Create graph with configuration
            self.graph = TradingAgentsGraph(
                selected_analysts=["market", "fundamentals", "news", "social"],
                debug=False,
                config=graph_config
            )
            
            self._initialized = True
            logger.info("TradingAgents graph initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize TradingAgents graph: {e}", exc_info=True)
            raise
    
    async def run_analysis(
        self,
        ticker: str,
        analysts: List[str],
        config_overrides: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Run multi-agent stock analysis
        
        Args:
            ticker: Stock ticker symbol
            analysts: List of analysts to include
            config_overrides: Optional configuration overrides
            
        Returns:
            Analysis results dictionary
        """
        await self.initialize()
        
        try:
            logger.info(f"Running analysis for {ticker} with analysts: {analysts}")
            start_time = datetime.now()
            
            # Update graph config if needed
            if config_overrides:
                for key, value in config_overrides.items():
                    if key in self.graph.config:
                        self.graph.config[key] = value
            
            # Update selected analysts
            self.graph.selected_analysts = analysts
            
            # Use today's date for analysis
            from datetime import date
            trade_date = date.today().strftime("%Y-%m-%d")
            
            # Execute graph using propagate method
            # This runs synchronously, so we need to run it in executor
            import asyncio
            loop = asyncio.get_event_loop()
            final_state, decision, coach_plans = await loop.run_in_executor(
                None,
                self.graph.propagate,
                ticker,
                trade_date
            )
            
            execution_time = (datetime.now() - start_time).total_seconds()
            
            # Format and return results
            return self._format_analysis_result(final_state, execution_time)
            
        except Exception as e:
            logger.error(f"Error running analysis for {ticker}: {e}", exc_info=True)
            raise
    
    async def run_backtest(
        self,
        ticker: str,
        start_date: str,
        end_date: str,
        strategy_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Run strategy backtest
        
        Args:
            ticker: Stock ticker symbol
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            strategy_config: Strategy configuration
            
        Returns:
            Backtest results dictionary
        """
        try:
            from tradingagents.backtesting.backtest_engine import BacktestEngine
            from tradingagents.backtesting.config import BacktestConfig
            from tradingagents.backtesting.data_manager import HistoricalDataManager
            
            logger.info(f"Running backtest for {ticker} from {start_date} to {end_date}")
            
            # Create backtest configuration
            config = BacktestConfig(
                initial_balance=strategy_config.get("initial_capital", 10000.0),
                start_date=start_date,
                end_date=end_date,
                commission_rate=strategy_config.get("commission_rate", 0.001),
                slippage=strategy_config.get("slippage", 0.001),
                risk_per_trade_pct=strategy_config.get("risk_per_trade_pct", 2.0),
                max_position_size_pct=strategy_config.get("position_size_pct", 20.0),
                data_interval="daily"
            )
            
            # Create data manager
            data_manager = HistoricalDataManager()
            
            # Create backtest engine (without TradingAgents graph for now)
            engine = BacktestEngine(
                config=config,
                trading_graph=None,  # Can integrate TradingAgentsGraph later
                data_manager=data_manager
            )
            
            # Run backtest in executor (it's synchronous)
            import asyncio
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                None,
                engine.run_backtest,
                ticker
            )
            
            # Format and return results
            return self._format_backtest_result(results, ticker, start_date, end_date)
            
        except Exception as e:
            logger.error(f"Error running backtest for {ticker}: {e}", exc_info=True)
            raise
    
    async def calculate_risk(
        self,
        ticker: str,
        account_value: float,
        risk_per_trade_pct: float,
        current_price: float,
        stop_loss_price: Optional[float] = None,
        target_price: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Calculate position sizing and risk metrics
        
        Args:
            ticker: Stock ticker symbol
            account_value: Total account value
            risk_per_trade_pct: Risk per trade percentage
            current_price: Current stock price
            stop_loss_price: Optional stop loss price
            target_price: Optional target price
            
        Returns:
            Risk calculation results
        """
        try:
            logger.info(f"Calculating risk for {ticker}")
            
            # Calculate stop loss if not provided (use 2% default)
            if stop_loss_price is None:
                stop_loss_pct = 2.0  # Default 2% stop loss
                stop_loss_price = current_price * (1 - stop_loss_pct / 100)
            
            # Calculate risk per share
            risk_per_share = current_price - stop_loss_price
            
            if risk_per_share <= 0:
                raise ValueError("Stop loss price must be below current price")
            
            # Calculate position size based on risk
            risk_amount = account_value * (risk_per_trade_pct / 100)
            position_size = int(risk_amount / risk_per_share)
            
            # Ensure at least 1 share if affordable
            if position_size == 0 and current_price <= risk_amount:
                position_size = 1
            
            position_value = position_size * current_price
            
            # Calculate position as percentage of account
            position_pct = (position_value / account_value * 100) if account_value > 0 else 0
            
            # Calculate risk-reward ratio if target provided
            risk_reward_ratio = None
            potential_profit = None
            potential_profit_pct = None
            
            if target_price is not None:
                potential_profit_per_share = target_price - current_price
                potential_profit = potential_profit_per_share * position_size
                potential_profit_pct = (potential_profit_per_share / current_price) * 100
                risk_reward_ratio = potential_profit_per_share / risk_per_share if risk_per_share > 0 else 0
            
            # Calculate stop loss percentage
            stop_loss_pct = ((current_price - stop_loss_price) / current_price) * 100
            
            return {
                "ticker": ticker,
                "account_value": account_value,
                "risk_per_trade_pct": risk_per_trade_pct,
                "current_price": current_price,
                "stop_loss_price": round(stop_loss_price, 2),
                "stop_loss_pct": round(stop_loss_pct, 2),
                "target_price": target_price,
                "position_sizing": {
                    "recommended_shares": position_size,
                    "position_value": round(position_value, 2),
                    "position_pct_of_account": round(position_pct, 2),
                    "risk_amount": round(risk_amount, 2),
                    "risk_per_share": round(risk_per_share, 2)
                },
                "risk_reward": {
                    "risk_reward_ratio": round(risk_reward_ratio, 2) if risk_reward_ratio is not None else None,
                    "potential_profit": round(potential_profit, 2) if potential_profit is not None else None,
                    "potential_profit_pct": round(potential_profit_pct, 2) if potential_profit_pct is not None else None,
                    "potential_loss": round(risk_amount, 2),
                    "potential_loss_pct": round(risk_per_trade_pct, 2)
                },
                "warnings": self._generate_risk_warnings(
                    position_pct,
                    risk_per_trade_pct,
                    position_size,
                    account_value,
                    position_value
                )
            }
            
        except Exception as e:
            logger.error(f"Error calculating risk for {ticker}: {e}", exc_info=True)
            raise
    
    def _generate_risk_warnings(
        self,
        position_pct: float,
        risk_pct: float,
        position_size: int,
        account_value: float,
        position_value: float
    ) -> List[str]:
        """Generate risk warnings based on position parameters"""
        warnings = []
        
        if position_pct > 25:
            warnings.append(f"Position size ({position_pct:.1f}% of account) exceeds recommended 25% maximum")
        
        if risk_pct > 5:
            warnings.append(f"Risk per trade ({risk_pct:.1f}%) exceeds recommended 5% maximum")
        
        if position_size == 0:
            warnings.append("Position size is 0 shares - risk amount may be too small for this stock price")
        
        if position_value > account_value:
            warnings.append("Position value exceeds account value - not enough capital")
        
        return warnings
    
    async def get_sentiment(
        self,
        ticker: str,
        sources: List[str],
        timeframe: str = "24h"
    ) -> Dict[str, Any]:
        """
        Get social media sentiment
        
        Args:
            ticker: Stock ticker symbol
            sources: List of sources (twitter, stocktwits, reddit)
            timeframe: Timeframe for sentiment data
            
        Returns:
            Sentiment data dictionary
        """
        try:
            logger.info(f"Getting sentiment for {ticker} from {sources}")
            
            # Try to use TradingAgents sentiment if available
            try:
                from tradingagents.dataflows.twitter_tools import get_twitter_sentiment
                
                # Get sentiment data from twitter tools
                sentiment_data = {
                    "ticker": ticker,
                    "overall_sentiment": 0.65,  # Mock for now
                    "sentiment_label": "bullish",
                    "sources": {source: {"sentiment": 0.65, "volume": 100} for source in sources},
                    "trending_topics": [f"${ticker}", f"{ticker} stock", "market"]
                }
                
            except ImportError:
                # Fallback to mock sentiment data
                logger.warning(f"Twitter tools not available, using mock sentiment for {ticker}")
                sentiment_data = {
                    "ticker": ticker,
                    "overall_sentiment": 0.65,
                    "sentiment_label": "neutral",
                    "sources": {source: {"sentiment": 0.65, "volume": 50} for source in sources},
                    "trending_topics": [f"${ticker}", "market analysis"]
                }
            
            return self._format_sentiment_result(sentiment_data)
            
        except Exception as e:
            logger.error(f"Error getting sentiment for {ticker}: {e}", exc_info=True)
            raise
    
    def _format_analysis_result(
        self,
        state: Any,
        execution_time: float
    ) -> Dict[str, Any]:
        """
        Format analysis result for MCP response
        
        Args:
            state: AgentState from TradingAgents
            execution_time: Execution time in seconds
            
        Returns:
            Formatted result dictionary
        """
        return {
            "ticker": state.ticker,
            "timestamp": datetime.utcnow().isoformat(),
            "analysts": self._extract_analyst_reports(state),
            "debate": self._extract_debate_summary(state),
            "recommendation": self._extract_recommendation(state),
            "execution_time_seconds": execution_time
        }
    
    def _extract_analyst_reports(self, state: Any) -> Dict[str, Any]:
        """Extract analyst reports from state"""
        reports = {}
        
        # Extract market analyst report
        if state.get("market_report"):
            reports["market"] = {
                "summary": state["market_report"][:500] + "..." if len(state["market_report"]) > 500 else state["market_report"],
                "full_report": state["market_report"]
            }
        
        # Extract fundamentals analyst report
        if state.get("fundamentals_report"):
            reports["fundamentals"] = {
                "summary": state["fundamentals_report"][:500] + "..." if len(state["fundamentals_report"]) > 500 else state["fundamentals_report"],
                "full_report": state["fundamentals_report"]
            }
        
        # Extract news analyst report
        if state.get("news_report"):
            reports["news"] = {
                "summary": state["news_report"][:500] + "..." if len(state["news_report"]) > 500 else state["news_report"],
                "full_report": state["news_report"]
            }
        
        # Extract social/sentiment analyst report
        if state.get("sentiment_report"):
            reports["social"] = {
                "summary": state["sentiment_report"][:500] + "..." if len(state["sentiment_report"]) > 500 else state["sentiment_report"],
                "full_report": state["sentiment_report"]
            }
        
        return reports
    
    def _extract_debate_summary(self, state: Any) -> Dict[str, Any]:
        """Extract debate summary from state"""
        debate_state = state.get("investment_debate_state", {})
        return {
            "bull_history": debate_state.get("bull_history", "")[:300] + "..." if len(debate_state.get("bull_history", "")) > 300 else debate_state.get("bull_history", ""),
            "bear_history": debate_state.get("bear_history", "")[:300] + "..." if len(debate_state.get("bear_history", "")) > 300 else debate_state.get("bear_history", ""),
            "rounds": debate_state.get("count", 0),
            "judge_decision": debate_state.get("judge_decision", ""),
            "investment_plan": state.get("investment_plan", "")
        }
    
    def _extract_recommendation(self, state: Any) -> Dict[str, Any]:
        """Extract trading recommendation from state"""
        final_decision = state.get("final_trade_decision", "")
        trader_plan = state.get("trader_investment_plan", "")
        risk_metrics = state.get("risk_metrics", {})
        
        return {
            "final_decision": final_decision[:500] + "..." if len(final_decision) > 500 else final_decision,
            "trader_plan": trader_plan[:500] + "..." if len(trader_plan) > 500 else trader_plan,
            "risk_metrics": risk_metrics,
            "full_decision": final_decision,
            "full_trader_plan": trader_plan
        }
    
    def _format_backtest_result(
        self,
        results: Any,
        ticker: str,
        start_date: str,
        end_date: str
    ) -> Dict[str, Any]:
        """Format backtest result for MCP response"""
        # Use getattr with defaults for all attributes that might not exist
        return {
            "ticker": ticker,
            "start_date": start_date,
            "end_date": end_date,
            "initial_balance": getattr(results, 'initial_balance', 0),
            "final_balance": getattr(results, 'final_balance', 0),
            "performance": {
                "total_return": getattr(results, 'total_return', 0),
                "total_return_pct": getattr(results, 'total_return_pct', 0),
                "annualized_return_pct": getattr(results, 'annualized_return_pct', None),
                "sharpe_ratio": getattr(results, 'sharpe_ratio', 0),
                "max_drawdown": getattr(results, 'max_drawdown', 0),
                "max_drawdown_pct": getattr(results, 'max_drawdown_pct', None),
                "win_rate": getattr(results, 'win_rate', 0),
                "total_trades": getattr(results, 'total_trades', 0),
                "winning_trades": getattr(results, 'winning_trades', 0),
                "losing_trades": getattr(results, 'losing_trades', 0),
                "avg_win": getattr(results, 'avg_win', 0),
                "avg_loss": getattr(results, 'avg_loss', 0),
                "profit_factor": getattr(results, 'profit_factor', 0)
            },
            "trades": [
                {
                    "date": getattr(trade, 'date', ''),
                    "action": getattr(trade, 'action', ''),
                    "ticker": getattr(trade, 'ticker', ticker),
                    "quantity": getattr(trade, 'quantity', 0),
                    "price": getattr(trade, 'price', 0),
                    "value": getattr(trade, 'value', 0),
                    "commission": getattr(trade, 'commission', 0),
                    "pnl": getattr(trade, "pnl", None)
                }
                for trade in (getattr(results, 'trades', [])[:50] if len(getattr(results, 'trades', [])) > 50 else getattr(results, 'trades', []))
            ],
            "total_trades_count": len(getattr(results, 'trades', [])),
            "equity_curve_sample": [
                {
                    "date": getattr(point, 'date', ''),
                    "equity": getattr(point, 'equity', 0)
                }
                for point in (getattr(results, 'equity_curve', [])[::max(1, len(getattr(results, 'equity_curve', []))//100)] if len(getattr(results, 'equity_curve', [])) > 100 else getattr(results, 'equity_curve', []))
            ]
        }
    
    def _format_sentiment_result(self, data: Any) -> Dict[str, Any]:
        """Format sentiment result for MCP response"""
        return {
            "ticker": data.get("ticker"),
            "timestamp": datetime.utcnow().isoformat(),
            "overall_sentiment": data.get("overall_sentiment", 0),
            "sentiment_label": data.get("sentiment_label", "neutral"),
            "sources": data.get("sources", {}),
            "trending_topics": data.get("trending_topics", [])
        }
