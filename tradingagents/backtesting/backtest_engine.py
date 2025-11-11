"""
Backtest Engine
Main orchestrator for running backtests with TradingAgents.
"""
import logging
from typing import Optional, Dict
from datetime import timedelta
import pandas as pd
from tradingagents.backtesting.config import BacktestConfig, BacktestResults
from tradingagents.backtesting.data_manager import HistoricalDataManager
from tradingagents.backtesting.account import SimulatedAccount
from tradingagents.backtesting.trade_executor import TradeExecutor

logger = logging.getLogger(__name__)


class BacktestEngine:
    """Main backtesting engine."""
    
    def __init__(self, config: BacktestConfig, trading_graph=None,
                 data_manager: Optional[HistoricalDataManager] = None):
        self.config = config
        self.trading_graph = trading_graph
        self.data_manager = data_manager or HistoricalDataManager()
        self.account = SimulatedAccount(config.initial_balance)
        self.executor = TradeExecutor(config, self.account)
        self.current_date = None
        self.total_days = 0
        self.completed_days = 0
    
    def run_backtest(self, ticker: str, start_date: Optional[str] = None,
                    end_date: Optional[str] = None) -> BacktestResults:
        start_date = start_date or self.config.start_date
        end_date = end_date or self.config.end_date
        
        if not start_date or not end_date:
            raise ValueError("Start and end dates must be provided")
        
        logger.info(f"Starting backtest for {ticker} from {start_date} to {end_date}")
        
        try:
            data = self._load_data(ticker, start_date, end_date)
            if data.empty:
                raise ValueError(f"No data available for {ticker}")
            
            self._run_backtest_loop(ticker, data)
            results = self._generate_results(ticker, start_date, end_date)
            
            logger.info(f"Backtest completed. Final equity: ${results.final_balance:,.2f}")
            return results
            
        except Exception as e:
            logger.error(f"Backtest failed: {e}")
            raise
    
    def _load_data(self, ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
        buffer_days = 100
        buffer_start = (pd.to_datetime(start_date) - timedelta(days=buffer_days)).strftime('%Y-%m-%d')
        
        data = self.data_manager.get_historical_data(
            ticker=ticker,
            start_date=buffer_start,
            end_date=end_date,
            interval=self.config.data_interval
        )
        
        backtest_data = data[start_date:end_date].copy()
        return backtest_data
    
    def _run_backtest_loop(self, ticker: str, data: pd.DataFrame):
        dates = data.index
        self.total_days = len(dates)
        self.completed_days = 0
        
        logger.info(f"Processing {self.total_days} trading days...")
        
        for i, date in enumerate(dates):
            self.current_date = date.strftime('%Y-%m-%d')
            current_data = data.loc[date]
            current_price = current_data['close']
            
            current_prices = {ticker: current_price}
            self.account.record_equity(self.current_date, current_prices)
            
            if self.trading_graph:
                try:
                    agent_result = self._run_agent_analysis(ticker, date, data)
                    if agent_result:
                        self._process_agent_decision(ticker, agent_result, current_price)
                except Exception as e:
                    logger.warning(f"Agent analysis failed on {self.current_date}: {e}")
            
            self.completed_days += 1
            if self.completed_days % 50 == 0:
                progress = (self.completed_days / self.total_days) * 100
                logger.info(f"Progress: {progress:.1f}% ({self.completed_days}/{self.total_days} days)")
        
        logger.info("Backtest simulation completed")
    
    def _run_agent_analysis(self, ticker: str, date: pd.Timestamp, data: pd.DataFrame) -> Optional[Dict]:
        try:
            historical_data = data.loc[:date]
            
            if hasattr(self.trading_graph, 'run_historical'):
                result = self.trading_graph.run_historical(
                    ticker=ticker,
                    trade_date=date.strftime('%Y-%m-%d'),
                    historical_data=historical_data
                )
            else:
                result = self.trading_graph.run(
                    ticker=ticker,
                    timeframe=self.config.data_interval
                )
            
            return result
        except Exception as e:
            logger.debug(f"Agent analysis error for {ticker} on {date}: {e}")
            return None
    
    def _process_agent_decision(self, ticker: str, agent_result: Dict, current_price: float):
        final_decision = agent_result.get("final_decision", {})
        if not final_decision:
            return
        
        decision_text = final_decision.get("decision", "").upper()
        signal = "HOLD"
        
        if "APPROVE" in decision_text or "BUY" in decision_text:
            signal = "BUY"
        elif "REJECT" in decision_text or "SELL" in decision_text:
            position = self.account.get_position(ticker)
            if position:
                signal = "SELL"
        
        self.executor.execute_signal(ticker, signal, current_price, self.current_date, 1.0)
    
    def _generate_results(self, ticker: str, start_date: str, end_date: str) -> BacktestResults:
        summary = {
            'initial_balance': self.config.initial_balance,
            'current_equity': self.account.equity_history[-1]['total_equity'] if self.account.equity_history else self.config.initial_balance,
            'total_trades': len(self.account.trades)
        }
        
        trades_df = self.account.get_trade_history()
        equity_df = self.account.get_equity_curve()
        
        trades_list = trades_df.to_dict('records') if not trades_df.empty else []
        equity_list = equity_df.reset_index().to_dict('records') if not equity_df.empty else []
        
        results = BacktestResults(
            ticker=ticker,
            start_date=start_date,
            end_date=end_date,
            initial_balance=self.config.initial_balance,
            final_balance=summary['current_equity'],
            trades=trades_list,
            equity_history=equity_list,
            config=self.config,
            total_return=summary['current_equity'] - self.config.initial_balance,
            total_return_pct=((summary['current_equity'] - self.config.initial_balance) / self.config.initial_balance) * 100,
            total_trades=summary['total_trades']
        )
        
        return results
    
    def get_progress(self) -> Dict:
        if self.total_days == 0:
            return {'progress_pct': 0.0, 'status': 'Not started'}
        
        progress_pct = (self.completed_days / self.total_days) * 100
        return {
            'progress_pct': progress_pct,
            'completed_days': self.completed_days,
            'total_days': self.total_days,
            'current_date': self.current_date,
            'status': 'Running' if progress_pct < 100 else 'Completed'
        }
