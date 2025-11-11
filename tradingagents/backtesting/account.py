"""
Simulated Trading Account
Manages positions, cash balance, and equity tracking for backtesting.
"""
import logging
from typing import Dict, List, Optional
from dataclasses import dataclass
import pandas as pd

logger = logging.getLogger(__name__)


@dataclass
class Position:
    """Represents a position in a security."""
    ticker: str
    shares: float
    avg_cost: float
    entry_date: str
    current_price: float = 0.0
    
    @property
    def market_value(self) -> float:
        return self.shares * self.current_price
    
    @property
    def cost_basis(self) -> float:
        return self.shares * self.avg_cost
    
    @property
    def unrealized_pnl(self) -> float:
        return self.market_value - self.cost_basis


@dataclass
class Trade:
    """Represents a completed trade."""
    ticker: str
    action: str
    shares: float
    price: float
    date: str
    commission: float = 0.0
    slippage: float = 0.0
    
    @property
    def gross_amount(self) -> float:
        return self.shares * self.price
    
    @property
    def net_amount(self) -> float:
        if self.action == "BUY":
            return -(self.gross_amount + self.commission + self.slippage)
        else:
            return self.gross_amount - self.commission - self.slippage


class SimulatedAccount:
    """Simulated trading account for backtesting."""
    
    def __init__(self, initial_balance: float):
        self.initial_balance = initial_balance
        self.cash_balance = initial_balance
        self.positions: Dict[str, Position] = {}
        self.trades: List[Trade] = []
        self.equity_history: List[Dict] = []
    
    def get_position(self, ticker: str) -> Optional[Position]:
        return self.positions.get(ticker)
    
    def get_total_equity(self, current_prices: Dict[str, float]) -> float:
        total_position_value = 0.0
        for ticker, position in self.positions.items():
            if ticker in current_prices:
                position.current_price = current_prices[ticker]
                total_position_value += position.market_value
        return self.cash_balance + total_position_value
    
    def can_buy(self, ticker: str, shares: float, price: float, 
                commission: float = 0.0, slippage: float = 0.0) -> bool:
        total_cost = (shares * price) + commission + slippage
        return self.cash_balance >= total_cost
    
    def can_sell(self, ticker: str, shares: float) -> bool:
        position = self.get_position(ticker)
        if not position:
            return False
        return position.shares >= shares
    
    def buy(self, ticker: str, shares: float, price: float, date: str,
            commission: float = 0.0, slippage: float = 0.0) -> bool:
        if not self.can_buy(ticker, shares, price, commission, slippage):
            return False
        
        gross_cost = shares * price
        total_cost = gross_cost + commission + slippage
        self.cash_balance -= total_cost
        
        if ticker in self.positions:
            existing = self.positions[ticker]
            total_shares = existing.shares + shares
            total_cost_basis = existing.cost_basis + gross_cost
            avg_cost = total_cost_basis / total_shares
            self.positions[ticker] = Position(
                ticker=ticker,
                shares=total_shares,
                avg_cost=avg_cost,
                entry_date=existing.entry_date,
                current_price=price
            )
        else:
            self.positions[ticker] = Position(
                ticker=ticker,
                shares=shares,
                avg_cost=price,
                entry_date=date,
                current_price=price
            )
        
        trade = Trade(ticker, "BUY", shares, price, date, commission, slippage)
        self.trades.append(trade)
        return True
    
    def sell(self, ticker: str, shares: float, price: float, date: str,
             commission: float = 0.0, slippage: float = 0.0) -> bool:
        if not self.can_sell(ticker, shares):
            return False
        
        position = self.positions[ticker]
        gross_proceeds = shares * price
        net_proceeds = gross_proceeds - commission - slippage
        self.cash_balance += net_proceeds
        
        remaining_shares = position.shares - shares
        if remaining_shares <= 0:
            del self.positions[ticker]
        else:
            self.positions[ticker] = Position(
                ticker=ticker,
                shares=remaining_shares,
                avg_cost=position.avg_cost,
                entry_date=position.entry_date,
                current_price=price
            )
        
        trade = Trade(ticker, "SELL", shares, price, date, commission, slippage)
        self.trades.append(trade)
        return True
    
    def record_equity(self, date: str, current_prices: Dict[str, float]):
        total_equity = self.get_total_equity(current_prices)
        
        equity_record = {
            'date': date,
            'cash_balance': self.cash_balance,
            'total_equity': total_equity,
            'positions': {},
            'daily_return': 0.0
        }
        
        if len(self.equity_history) > 0:
            prev_equity = self.equity_history[-1]['total_equity']
            if prev_equity > 0:
                equity_record['daily_return'] = (total_equity - prev_equity) / prev_equity
        
        self.equity_history.append(equity_record)
    
    def get_equity_curve(self) -> pd.DataFrame:
        if not self.equity_history:
            return pd.DataFrame()
        df = pd.DataFrame(self.equity_history)
        df['date'] = pd.to_datetime(df['date'])
        df.set_index('date', inplace=True)
        return df
    
    def get_trade_history(self) -> pd.DataFrame:
        if not self.trades:
            return pd.DataFrame()
        trade_data = []
        for trade in self.trades:
            trade_data.append({
                'date': trade.date,
                'ticker': trade.ticker,
                'action': trade.action,
                'shares': trade.shares,
                'price': trade.price,
                'gross_amount': trade.gross_amount,
                'commission': trade.commission,
                'slippage': trade.slippage,
                'net_amount': trade.net_amount
            })
        df = pd.DataFrame(trade_data)
        df['date'] = pd.to_datetime(df['date'])
        return df
