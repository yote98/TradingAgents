"""
Visualization Generator
Creates charts and plots for backtest results.
"""
import logging
from typing import Optional, List
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

# Try to import matplotlib, but make it optional
try:
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates
    from matplotlib.figure import Figure
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False
    logger.warning("matplotlib not available. Install with: pip install matplotlib")


class VisualizationGenerator:
    """
    Generates visualizations for backtest results.
    Creates equity curves, drawdown charts, and other performance plots.
    """
    
    def __init__(self, analyzer):
        """
        Initialize visualization generator.
        
        Args:
            analyzer: PerformanceAnalyzer instance
        """
        if not MATPLOTLIB_AVAILABLE:
            raise ImportError("matplotlib is required for visualizations. Install with: pip install matplotlib")
        
        self.analyzer = analyzer
        self.results = analyzer.results
        
        # Set default style
        plt.style.use('seaborn-v0_8-darkgrid' if 'seaborn-v0_8-darkgrid' in plt.style.available else 'default')
        
        logger.info("VisualizationGenerator initialized")
    
    def plot_equity_curve(
        self,
        filepath: Optional[str] = None,
        show: bool = True,
        figsize: tuple = (12, 6)
    ) -> Optional[Figure]:
        """
        Plot equity curve over time.
        
        Args:
            filepath: Path to save figure (optional)
            show: Whether to display the plot
            figsize: Figure size (width, height)
        
        Returns:
            matplotlib Figure object
        """
        equity_df = self.analyzer.generate_equity_curve()
        
        if equity_df.empty:
            logger.warning("No equity data to plot")
            return None
        
        fig, ax = plt.subplots(figsize=figsize)
        
        # Plot equity curve
        ax.plot(equity_df.index, equity_df['total_equity'], 
                label='Portfolio Value', linewidth=2, color='#2E86AB')
        
        # Add initial balance reference line
        ax.axhline(y=self.results.initial_balance, 
                   color='gray', linestyle='--', alpha=0.5, 
                   label='Initial Balance')
        
        # Formatting
        ax.set_title(f'Equity Curve - {self.results.ticker}', fontsize=14, fontweight='bold')
        ax.set_xlabel('Date', fontsize=12)
        ax.set_ylabel('Portfolio Value ($)', fontsize=12)
        ax.legend(loc='best')
        ax.grid(True, alpha=0.3)
        
        # Format y-axis as currency
        ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x:,.0f}'))
        
        # Format x-axis dates
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
        plt.xticks(rotation=45)
        
        plt.tight_layout()
        
        if filepath:
            plt.savefig(filepath, dpi=300, bbox_inches='tight')
            logger.info(f"Equity curve saved to {filepath}")
        
        if show:
            plt.show()
        
        return fig
    
    def plot_drawdown(
        self,
        filepath: Optional[str] = None,
        show: bool = True,
        figsize: tuple = (12, 6)
    ) -> Optional[Figure]:
        """
        Plot drawdown over time.
        
        Args:
            filepath: Path to save figure (optional)
            show: Whether to display the plot
            figsize: Figure size (width, height)
        
        Returns:
            matplotlib Figure object
        """
        drawdown_df = self.analyzer.generate_drawdown_series()
        
        if drawdown_df.empty:
            logger.warning("No drawdown data to plot")
            return None
        
        fig, ax = plt.subplots(figsize=figsize)
        
        # Plot drawdown
        ax.fill_between(drawdown_df.index, 
                        drawdown_df['drawdown_pct'], 
                        0, 
                        color='#A23B72', 
                        alpha=0.3, 
                        label='Drawdown')
        ax.plot(drawdown_df.index, 
                drawdown_df['drawdown_pct'], 
                color='#A23B72', 
                linewidth=1.5)
        
        # Formatting
        ax.set_title(f'Drawdown - {self.results.ticker}', fontsize=14, fontweight='bold')
        ax.set_xlabel('Date', fontsize=12)
        ax.set_ylabel('Drawdown (%)', fontsize=12)
        ax.legend(loc='best')
        ax.grid(True, alpha=0.3)
        
        # Format x-axis dates
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
        plt.xticks(rotation=45)
        
        plt.tight_layout()
        
        if filepath:
            plt.savefig(filepath, dpi=300, bbox_inches='tight')
            logger.info(f"Drawdown chart saved to {filepath}")
        
        if show:
            plt.show()
        
        return fig
    
    def plot_monthly_returns(
        self,
        filepath: Optional[str] = None,
        show: bool = True,
        figsize: tuple = (14, 6)
    ) -> Optional[Figure]:
        """
        Plot monthly returns as a bar chart.
        
        Args:
            filepath: Path to save figure (optional)
            show: Whether to display the plot
            figsize: Figure size (width, height)
        
        Returns:
            matplotlib Figure object
        """
        monthly_df = self.analyzer.get_monthly_returns()
        
        if monthly_df.empty:
            logger.warning("No monthly returns data to plot")
            return None
        
        fig, ax = plt.subplots(figsize=figsize)
        
        # Create bar chart with colors based on positive/negative
        colors = ['#06A77D' if x > 0 else '#D62246' for x in monthly_df['return_pct']]
        
        ax.bar(monthly_df['month'], monthly_df['return_pct'], color=colors, alpha=0.7)
        
        # Add zero line
        ax.axhline(y=0, color='black', linestyle='-', linewidth=0.8)
        
        # Formatting
        ax.set_title(f'Monthly Returns - {self.results.ticker}', fontsize=14, fontweight='bold')
        ax.set_xlabel('Month', fontsize=12)
        ax.set_ylabel('Return (%)', fontsize=12)
        ax.grid(True, alpha=0.3, axis='y')
        
        # Format x-axis dates
        ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m'))
        plt.xticks(rotation=45)
        
        plt.tight_layout()
        
        if filepath:
            plt.savefig(filepath, dpi=300, bbox_inches='tight')
            logger.info(f"Monthly returns chart saved to {filepath}")
        
        if show:
            plt.show()
        
        return fig
    
    def plot_trade_distribution(
        self,
        filepath: Optional[str] = None,
        show: bool = True,
        figsize: tuple = (12, 6)
    ) -> Optional[Figure]:
        """
        Plot distribution of trade P&L.
        
        Args:
            filepath: Path to save figure (optional)
            show: Whether to display the plot
            figsize: Figure size (width, height)
        
        Returns:
            matplotlib Figure object
        """
        if self.analyzer.trades_df.empty:
            logger.warning("No trade data to plot")
            return None
        
        # Get sell trades (which have P&L)
        sell_trades = self.analyzer.trades_df[self.analyzer.trades_df['action'] == 'SELL']
        
        if sell_trades.empty:
            logger.warning("No completed trades to plot")
            return None
        
        fig, ax = plt.subplots(figsize=figsize)
        
        # Plot histogram of P&L
        pnl = sell_trades['net_amount']
        ax.hist(pnl, bins=30, color='#2E86AB', alpha=0.7, edgecolor='black')
        
        # Add vertical line at zero
        ax.axvline(x=0, color='red', linestyle='--', linewidth=2, label='Break-even')
        
        # Add mean line
        mean_pnl = pnl.mean()
        ax.axvline(x=mean_pnl, color='green', linestyle='--', linewidth=2, 
                   label=f'Mean: ${mean_pnl:.2f}')
        
        # Formatting
        ax.set_title(f'Trade P&L Distribution - {self.results.ticker}', 
                     fontsize=14, fontweight='bold')
        ax.set_xlabel('Profit/Loss ($)', fontsize=12)
        ax.set_ylabel('Number of Trades', fontsize=12)
        ax.legend(loc='best')
        ax.grid(True, alpha=0.3, axis='y')
        
        # Format x-axis as currency
        ax.xaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x:,.0f}'))
        
        plt.tight_layout()
        
        if filepath:
            plt.savefig(filepath, dpi=300, bbox_inches='tight')
            logger.info(f"Trade distribution chart saved to {filepath}")
        
        if show:
            plt.show()
        
        return fig
    
    def create_dashboard(
        self,
        filepath: Optional[str] = None,
        show: bool = True,
        figsize: tuple = (16, 12)
    ) -> Optional[Figure]:
        """
        Create a comprehensive dashboard with multiple plots.
        
        Args:
            filepath: Path to save figure (optional)
            show: Whether to display the plot
            figsize: Figure size (width, height)
        
        Returns:
            matplotlib Figure object
        """
        fig = plt.figure(figsize=figsize)
        gs = fig.add_gridspec(3, 2, hspace=0.3, wspace=0.3)
        
        # 1. Equity Curve (top, full width)
        ax1 = fig.add_subplot(gs[0, :])
        equity_df = self.analyzer.generate_equity_curve()
        if not equity_df.empty:
            ax1.plot(equity_df.index, equity_df['total_equity'], 
                    linewidth=2, color='#2E86AB')
            ax1.axhline(y=self.results.initial_balance, 
                       color='gray', linestyle='--', alpha=0.5)
            ax1.set_title('Equity Curve', fontsize=12, fontweight='bold')
            ax1.set_ylabel('Portfolio Value ($)')
            ax1.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x:,.0f}'))
            ax1.grid(True, alpha=0.3)
        
        # 2. Drawdown (middle left)
        ax2 = fig.add_subplot(gs[1, 0])
        drawdown_df = self.analyzer.generate_drawdown_series()
        if not drawdown_df.empty:
            ax2.fill_between(drawdown_df.index, 
                            drawdown_df['drawdown_pct'], 
                            0, 
                            color='#A23B72', 
                            alpha=0.3)
            ax2.plot(drawdown_df.index, 
                    drawdown_df['drawdown_pct'], 
                    color='#A23B72', 
                    linewidth=1.5)
            ax2.set_title('Drawdown', fontsize=12, fontweight='bold')
            ax2.set_ylabel('Drawdown (%)')
            ax2.grid(True, alpha=0.3)
        
        # 3. Monthly Returns (middle right)
        ax3 = fig.add_subplot(gs[1, 1])
        monthly_df = self.analyzer.get_monthly_returns()
        if not monthly_df.empty:
            colors = ['#06A77D' if x > 0 else '#D62246' for x in monthly_df['return_pct']]
            ax3.bar(range(len(monthly_df)), monthly_df['return_pct'], color=colors, alpha=0.7)
            ax3.axhline(y=0, color='black', linestyle='-', linewidth=0.8)
            ax3.set_title('Monthly Returns', fontsize=12, fontweight='bold')
            ax3.set_ylabel('Return (%)')
            ax3.grid(True, alpha=0.3, axis='y')
        
        # 4. Trade Distribution (bottom left)
        ax4 = fig.add_subplot(gs[2, 0])
        if not self.analyzer.trades_df.empty:
            sell_trades = self.analyzer.trades_df[self.analyzer.trades_df['action'] == 'SELL']
            if not sell_trades.empty:
                pnl = sell_trades['net_amount']
                ax4.hist(pnl, bins=20, color='#2E86AB', alpha=0.7, edgecolor='black')
                ax4.axvline(x=0, color='red', linestyle='--', linewidth=2)
                ax4.set_title('Trade P&L Distribution', fontsize=12, fontweight='bold')
                ax4.set_xlabel('Profit/Loss ($)')
                ax4.set_ylabel('Count')
                ax4.grid(True, alpha=0.3, axis='y')
        
        # 5. Performance Metrics (bottom right)
        ax5 = fig.add_subplot(gs[2, 1])
        ax5.axis('off')
        
        # Get metrics
        summary = self.analyzer.get_summary()
        returns = summary['returns']
        risk = summary['risk']
        trades = summary['trades']
        
        # Create text summary
        metrics_text = f"""
        PERFORMANCE METRICS
        
        Returns:
          Total Return: {returns['total_return_pct']:.2f}%
          CAGR: {returns['cagr']:.2f}%
        
        Risk:
          Sharpe Ratio: {risk['sharpe_ratio']:.2f}
          Max Drawdown: {risk['max_drawdown_pct']:.2f}%
          Volatility: {risk['volatility']:.2f}%
        
        Trades:
          Total: {trades['total_trades']}
          Win Rate: {trades['win_rate']:.2f}%
          Profit Factor: {trades['profit_factor']:.2f}
        """
        
        ax5.text(0.1, 0.5, metrics_text, fontsize=10, family='monospace',
                verticalalignment='center')
        
        # Overall title
        fig.suptitle(f'Backtest Dashboard - {self.results.ticker}', 
                    fontsize=16, fontweight='bold', y=0.98)
        
        if filepath:
            plt.savefig(filepath, dpi=300, bbox_inches='tight')
            logger.info(f"Dashboard saved to {filepath}")
        
        if show:
            plt.show()
        
        return fig
    
    def save_all_charts(self, output_dir: str = "backtest_charts"):
        """
        Save all charts to a directory.
        
        Args:
            output_dir: Directory to save charts
        """
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        ticker = self.results.ticker
        
        # Save individual charts
        self.plot_equity_curve(
            filepath=f"{output_dir}/{ticker}_equity_curve.png",
            show=False
        )
        
        self.plot_drawdown(
            filepath=f"{output_dir}/{ticker}_drawdown.png",
            show=False
        )
        
        self.plot_monthly_returns(
            filepath=f"{output_dir}/{ticker}_monthly_returns.png",
            show=False
        )
        
        self.plot_trade_distribution(
            filepath=f"{output_dir}/{ticker}_trade_distribution.png",
            show=False
        )
        
        self.create_dashboard(
            filepath=f"{output_dir}/{ticker}_dashboard.png",
            show=False
        )
        
        logger.info(f"All charts saved to {output_dir}/")
        print(f"✅ All charts saved to {output_dir}/")
