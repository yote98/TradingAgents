"""
Performance Analyzer
Calculates comprehensive performance metrics for backtest results.
"""
import logging
from typing import Dict, List, Optional, Tuple
import pandas as pd
import numpy as np
from tradingagents.backtesting.config import BacktestResults

logger = logging.getLogger(__name__)


class PerformanceAnalyzer:
    """
    Analyzes backtest results and calculates performance metrics.
    Provides return metrics, risk metrics, and trade statistics.
    """
    
    def __init__(self, results: BacktestResults):
        """
        Initialize performance analyzer.
        
        Args:
            results: BacktestResults object to analyze
        """
        self.results = results
        
        # Convert to DataFrames for analysis
        self.trades_df = self._prepare_trades_df()
        self.equity_df = self._prepare_equity_df()
        
        logger.info("PerformanceAnalyzer initialized")
    
    def _prepare_trades_df(self) -> pd.DataFrame:
        """Convert trades list to DataFrame."""
        if not self.results.trades:
            return pd.DataFrame()
        
        df = pd.DataFrame(self.results.trades)
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'])
            df.set_index('date', inplace=True)
        return df
    
    def _prepare_equity_df(self) -> pd.DataFrame:
        """Convert equity history to DataFrame."""
        if not self.results.equity_history:
            return pd.DataFrame()
        
        df = pd.DataFrame(self.results.equity_history)
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'])
            df.set_index('date', inplace=True)
        return df
    
    def calculate_returns(self) -> Dict:
        """
        Calculate return metrics.
        
        Returns:
            Dictionary with return metrics
        """
        if self.equity_df.empty:
            return {
                'total_return': 0.0,
                'total_return_pct': 0.0,
                'cagr': 0.0,
                'daily_return_mean': 0.0,
                'daily_return_std': 0.0
            }
        
        initial_balance = self.results.initial_balance
        final_balance = self.results.final_balance
        
        # Total return
        total_return = final_balance - initial_balance
        total_return_pct = (total_return / initial_balance) * 100
        
        # CAGR (Compound Annual Growth Rate)
        days = len(self.equity_df)
        years = days / 252  # Trading days per year
        if years > 0 and final_balance > 0:
            cagr = (((final_balance / initial_balance) ** (1 / years)) - 1) * 100
        else:
            cagr = 0.0
        
        # Daily returns statistics
        if 'daily_return' in self.equity_df.columns:
            daily_returns = self.equity_df['daily_return'].dropna()
            daily_return_mean = daily_returns.mean() * 100
            daily_return_std = daily_returns.std() * 100
        else:
            daily_return_mean = 0.0
            daily_return_std = 0.0
        
        return {
            'total_return': total_return,
            'total_return_pct': total_return_pct,
            'cagr': cagr,
            'daily_return_mean': daily_return_mean,
            'daily_return_std': daily_return_std
        }
    
    def calculate_risk_metrics(self) -> Dict:
        """
        Calculate risk metrics.
        
        Returns:
            Dictionary with risk metrics
        """
        if self.equity_df.empty or 'daily_return' not in self.equity_df.columns:
            return {
                'sharpe_ratio': 0.0,
                'sortino_ratio': 0.0,
                'max_drawdown': 0.0,
                'max_drawdown_pct': 0.0,
                'volatility': 0.0,
                'calmar_ratio': 0.0
            }
        
        daily_returns = self.equity_df['daily_return'].dropna()
        
        # Sharpe Ratio (annualized, assuming 0% risk-free rate)
        if len(daily_returns) > 0 and daily_returns.std() > 0:
            sharpe_ratio = (daily_returns.mean() / daily_returns.std()) * np.sqrt(252)
        else:
            sharpe_ratio = 0.0
        
        # Sortino Ratio (annualized, using downside deviation)
        downside_returns = daily_returns[daily_returns < 0]
        if len(downside_returns) > 0:
            downside_std = downside_returns.std()
            if downside_std > 0:
                sortino_ratio = (daily_returns.mean() / downside_std) * np.sqrt(252)
            else:
                sortino_ratio = 0.0
        else:
            sortino_ratio = sharpe_ratio  # No downside, use Sharpe
        
        # Maximum Drawdown
        equity_curve = self.equity_df['total_equity']
        running_max = equity_curve.expanding().max()
        drawdown = equity_curve - running_max
        max_drawdown = drawdown.min()
        
        if running_max.max() > 0:
            max_drawdown_pct = (max_drawdown / running_max.max()) * 100
        else:
            max_drawdown_pct = 0.0
        
        # Volatility (annualized)
        volatility = daily_returns.std() * np.sqrt(252) * 100
        
        # Calmar Ratio (CAGR / Max Drawdown)
        returns = self.calculate_returns()
        cagr = returns['cagr']
        if abs(max_drawdown_pct) > 0:
            calmar_ratio = cagr / abs(max_drawdown_pct)
        else:
            calmar_ratio = 0.0
        
        return {
            'sharpe_ratio': sharpe_ratio,
            'sortino_ratio': sortino_ratio,
            'max_drawdown': max_drawdown,
            'max_drawdown_pct': max_drawdown_pct,
            'volatility': volatility,
            'calmar_ratio': calmar_ratio
        }
    
    def calculate_trade_statistics(self) -> Dict:
        """
        Calculate trade statistics.
        
        Returns:
            Dictionary with trade statistics
        """
        if self.trades_df.empty:
            return {
                'total_trades': 0,
                'winning_trades': 0,
                'losing_trades': 0,
                'win_rate': 0.0,
                'profit_factor': 0.0,
                'avg_win': 0.0,
                'avg_loss': 0.0,
                'avg_win_pct': 0.0,
                'avg_loss_pct': 0.0,
                'largest_win': 0.0,
                'largest_loss': 0.0,
                'avg_holding_period': 0.0
            }
        
        # Separate buy and sell trades
        buy_trades = self.trades_df[self.trades_df['action'] == 'BUY']
        sell_trades = self.trades_df[self.trades_df['action'] == 'SELL']
        
        # Calculate P&L for each sell (match with previous buy)
        # This is simplified - assumes FIFO matching
        total_trades = len(sell_trades)
        
        if total_trades == 0:
            return {
                'total_trades': len(self.trades_df),
                'winning_trades': 0,
                'losing_trades': 0,
                'win_rate': 0.0,
                'profit_factor': 0.0,
                'avg_win': 0.0,
                'avg_loss': 0.0,
                'avg_win_pct': 0.0,
                'avg_loss_pct': 0.0,
                'largest_win': 0.0,
                'largest_loss': 0.0,
                'avg_holding_period': 0.0
            }
        
        # Calculate P&L from net amounts
        # For simplicity, we'll use the net_amount field
        # Positive net_amount on SELL = profit, negative = loss
        sell_pnl = sell_trades['net_amount'].values
        
        winning_trades = sell_pnl[sell_pnl > 0]
        losing_trades = sell_pnl[sell_pnl < 0]
        
        num_wins = len(winning_trades)
        num_losses = len(losing_trades)
        
        # Win rate
        win_rate = (num_wins / total_trades) * 100 if total_trades > 0 else 0.0
        
        # Average win/loss
        avg_win = winning_trades.mean() if num_wins > 0 else 0.0
        avg_loss = abs(losing_trades.mean()) if num_losses > 0 else 0.0
        
        # Profit factor
        total_wins = winning_trades.sum() if num_wins > 0 else 0.0
        total_losses = abs(losing_trades.sum()) if num_losses > 0 else 0.0
        profit_factor = total_wins / total_losses if total_losses > 0 else 0.0
        
        # Largest win/loss
        largest_win = winning_trades.max() if num_wins > 0 else 0.0
        largest_loss = abs(losing_trades.min()) if num_losses > 0 else 0.0
        
        # Calculate percentage returns (simplified)
        # This would require matching buy/sell pairs for accurate calculation
        avg_win_pct = 0.0  # Placeholder
        avg_loss_pct = 0.0  # Placeholder
        
        # Average holding period (days)
        # This would require matching buy/sell pairs
        avg_holding_period = 0.0  # Placeholder
        
        return {
            'total_trades': total_trades,
            'winning_trades': num_wins,
            'losing_trades': num_losses,
            'win_rate': win_rate,
            'profit_factor': profit_factor,
            'avg_win': avg_win,
            'avg_loss': avg_loss,
            'avg_win_pct': avg_win_pct,
            'avg_loss_pct': avg_loss_pct,
            'largest_win': largest_win,
            'largest_loss': largest_loss,
            'avg_holding_period': avg_holding_period
        }
    
    def generate_equity_curve(self) -> pd.DataFrame:
        """
        Generate equity curve DataFrame.
        
        Returns:
            DataFrame with date index and equity values
        """
        if self.equity_df.empty:
            return pd.DataFrame()
        
        return self.equity_df[['total_equity', 'cash_balance']].copy()
    
    def generate_drawdown_series(self) -> pd.DataFrame:
        """
        Generate drawdown series.
        
        Returns:
            DataFrame with date index and drawdown values
        """
        if self.equity_df.empty:
            return pd.DataFrame()
        
        equity_curve = self.equity_df['total_equity']
        running_max = equity_curve.expanding().max()
        drawdown = equity_curve - running_max
        drawdown_pct = (drawdown / running_max) * 100
        
        df = pd.DataFrame({
            'drawdown': drawdown,
            'drawdown_pct': drawdown_pct,
            'running_max': running_max
        })
        
        return df
    
    def get_monthly_returns(self) -> pd.DataFrame:
        """
        Calculate monthly returns.
        
        Returns:
            DataFrame with monthly returns
        """
        if self.equity_df.empty:
            return pd.DataFrame()
        
        # Resample to monthly
        monthly_equity = self.equity_df['total_equity'].resample('M').last()
        monthly_returns = monthly_equity.pct_change() * 100
        
        df = pd.DataFrame({
            'month': monthly_equity.index,
            'equity': monthly_equity.values,
            'return_pct': monthly_returns.values
        })
        
        return df
    
    def get_summary(self) -> Dict:
        """
        Get comprehensive performance summary.
        
        Returns:
            Dictionary with all performance metrics
        """
        returns = self.calculate_returns()
        risk = self.calculate_risk_metrics()
        trades = self.calculate_trade_statistics()
        
        summary = {
            'period': {
                'start_date': self.results.start_date,
                'end_date': self.results.end_date,
                'days': len(self.equity_df)
            },
            'returns': returns,
            'risk': risk,
            'trades': trades,
            'account': {
                'initial_balance': self.results.initial_balance,
                'final_balance': self.results.final_balance
            }
        }
        
        return summary
    
    def print_summary(self):
        """Print formatted performance summary."""
        summary = self.get_summary()
        
        print("=" * 60)
        print("BACKTEST PERFORMANCE SUMMARY")
        print("=" * 60)
        
        # Period
        print(f"\nPeriod: {summary['period']['start_date']} to {summary['period']['end_date']}")
        print(f"Trading Days: {summary['period']['days']}")
        
        # Account
        print(f"\nInitial Balance: ${summary['account']['initial_balance']:,.2f}")
        print(f"Final Balance: ${summary['account']['final_balance']:,.2f}")
        
        # Returns
        returns = summary['returns']
        print(f"\n--- Returns ---")
        print(f"Total Return: ${returns['total_return']:,.2f} ({returns['total_return_pct']:.2f}%)")
        print(f"CAGR: {returns['cagr']:.2f}%")
        print(f"Daily Return (avg): {returns['daily_return_mean']:.3f}%")
        print(f"Daily Return (std): {returns['daily_return_std']:.3f}%")
        
        # Risk
        risk = summary['risk']
        print(f"\n--- Risk Metrics ---")
        print(f"Sharpe Ratio: {risk['sharpe_ratio']:.2f}")
        print(f"Sortino Ratio: {risk['sortino_ratio']:.2f}")
        print(f"Max Drawdown: ${risk['max_drawdown']:,.2f} ({risk['max_drawdown_pct']:.2f}%)")
        print(f"Volatility (annualized): {risk['volatility']:.2f}%")
        print(f"Calmar Ratio: {risk['calmar_ratio']:.2f}")
        
        # Trades
        trades = summary['trades']
        print(f"\n--- Trade Statistics ---")
        print(f"Total Trades: {trades['total_trades']}")
        print(f"Winning Trades: {trades['winning_trades']}")
        print(f"Losing Trades: {trades['losing_trades']}")
        print(f"Win Rate: {trades['win_rate']:.2f}%")
        print(f"Profit Factor: {trades['profit_factor']:.2f}")
        print(f"Average Win: ${trades['avg_win']:,.2f}")
        print(f"Average Loss: ${trades['avg_loss']:,.2f}")
        print(f"Largest Win: ${trades['largest_win']:,.2f}")
        print(f"Largest Loss: ${trades['largest_loss']:,.2f}")
        
        print("=" * 60)
