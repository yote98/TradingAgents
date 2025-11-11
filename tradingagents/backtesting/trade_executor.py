"""
Trade Executor
Executes trades based on agent signals with realistic costs and position sizing.
"""
import logging
from typing import Dict
from enum import Enum
from tradingagents.backtesting.account import SimulatedAccount
from tradingagents.backtesting.config import BacktestConfig

logger = logging.getLogger(__name__)


class TradeSignal(Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"


class TradeExecutor:
    """Executes trades based on agent signals."""
    
    def __init__(self, config: BacktestConfig, account: SimulatedAccount):
        self.config = config
        self.account = account
    
    def execute_signal(self, ticker: str, signal: str, current_price: float,
                      date: str, agent_confidence: float = 1.0) -> bool:
        try:
            signal_enum = TradeSignal(signal.upper())
        except ValueError:
            return False
        
        if signal_enum == TradeSignal.HOLD:
            return False
        
        position_size = self._calculate_position_size(ticker, signal_enum, current_price, agent_confidence)
        if position_size <= 0:
            return False
        
        commission = self._calculate_commission(position_size, current_price)
        slippage = self._calculate_slippage(position_size, current_price)
        
        if signal_enum == TradeSignal.BUY:
            return self._execute_buy(ticker, position_size, current_price, date, commission, slippage)
        elif signal_enum == TradeSignal.SELL:
            return self._execute_sell(ticker, position_size, current_price, date, commission, slippage)
        
        return False
    
    def _calculate_position_size(self, ticker: str, signal: TradeSignal,
                                 price: float, confidence: float) -> float:
        if signal == TradeSignal.SELL:
            position = self.account.get_position(ticker)
            return position.shares if position else 0.0
        
        account_value = self.account.get_total_equity({})
        risk_amount = account_value * (self.config.risk_per_trade_pct / 100.0)
        adjusted_risk = risk_amount * confidence
        shares = adjusted_risk / price
        
        max_position_value = account_value * (self.config.max_position_size_pct / 100.0)
        max_shares = max_position_value / price
        
        return min(shares, max_shares)
    
    def _calculate_commission(self, shares: float, price: float) -> float:
        return shares * price * self.config.commission_rate
    
    def _calculate_slippage(self, shares: float, price: float) -> float:
        return shares * price * self.config.slippage
    
    def _execute_buy(self, ticker: str, shares: float, price: float,
                    date: str, commission: float, slippage: float) -> bool:
        shares = int(shares)
        if shares <= 0:
            return False
        
        if not self.account.can_buy(ticker, shares, price, commission, slippage):
            return False
        
        return self.account.buy(ticker, shares, price, date, commission, slippage)
    
    def _execute_sell(self, ticker: str, shares: float, price: float,
                     date: str, commission: float, slippage: float) -> bool:
        position = self.account.get_position(ticker)
        if not position:
            return False
        
        shares_to_sell = position.shares
        return self.account.sell(ticker, shares_to_sell, price, date, commission, slippage)
