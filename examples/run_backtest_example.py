"""
Example: Run a Backtest with Performance Analysis and Visualizations

This script demonstrates the complete backtesting workflow:
1. Configure backtest parameters
2. Run backtest on historical data
3. Analyze performance metrics
4. Generate visualizations
"""
import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tradingagents.backtesting import (
    BacktestConfig,
    BacktestEngine,
    HistoricalDataManager,
    PerformanceAnalyzer,
    VisualizationGenerator
)


def run_simple_backtest():
    """Run a simple backtest example with full analysis."""
    print("=" * 70)
    print("TradingAgents Backtesting - Complete Example")
    print("=" * 70)
    
    # Configure the backtest
    config = BacktestConfig(
        initial_balance=10000.0,
        start_date="2023-01-01",
        end_date="2023-06-30",
        commission_rate=0.001,  # 0.1% commission
        slippage=0.001,  # 0.1% slippage
        risk_per_trade_pct=2.0,  # Risk 2% per trade
        max_position_size_pct=20.0,  # Max 20% per position
        data_interval="daily"
    )
    
    print(f"\\nConfiguration:")
    print(f"  Initial Balance: ${config.initial_balance:,.2f}")
    print(f"  Period: {config.start_date} to {config.end_date}")
    print(f"  Commission: {config.commission_rate:.1%}")
    print(f"  Slippage: {config.slippage:.1%}")
    print(f"  Risk per Trade: {config.risk_per_trade_pct:.1f}%")
    
    # Initialize components
    print("\\nInitializing components...")
    data_manager = HistoricalDataManager()
    
    # Note: TradingAgentsGraph integration is optional
    # For this example, we'll run without it (data-only backtest)
    print("  ✅ Data manager initialized")
    print("  ⚠️  Running without TradingAgentsGraph (data-only mode)")
    
    # Create backtest engine
    engine = BacktestEngine(
        config=config,
        trading_graph=None,  # Can add TradingAgentsGraph() here
        data_manager=data_manager
    )
    
    # Run backtest
    ticker = "AAPL"
    print(f"\\nRunning backtest for {ticker}...")
    print("(This may take a few minutes)")
    
    try:
        results = engine.run_backtest(ticker)
        
        # Display basic results
        print("\\n" + "=" * 70)
        print("BASIC RESULTS")
        print("=" * 70)
        print(results.summary())
        
        # Perform detailed analysis
        print("\\n" + "=" * 70)
        print("DETAILED PERFORMANCE ANALYSIS")
        print("=" * 70)
        analyzer = results.analyze()
        
        # Generate visualizations
        print("\\n" + "=" * 70)
        print("GENERATING VISUALIZATIONS")
        print("=" * 70)
        
        try:
            viz = VisualizationGenerator(analyzer)
            
            # Create output directory
            output_dir = f"backtest_charts_{ticker}"
            
            # Save all charts
            viz.save_all_charts(output_dir)
            
            print(f"\\n✅ All charts saved to {output_dir}/")
            print(f"   - {ticker}_equity_curve.png")
            print(f"   - {ticker}_drawdown.png")
            print(f"   - {ticker}_monthly_returns.png")
            print(f"   - {ticker}_trade_distribution.png")
            print(f"   - {ticker}_dashboard.png")
            
        except ImportError as e:
            print(f"\\n⚠️  Visualization error: {e}")
            print("   Install matplotlib with: pip install matplotlib")
        
        # Save results to JSON
        results_file = f"backtest_results_{ticker}_{config.start_date}_{config.end_date}.json"
        results.save(results_file)
        print(f"\\n✅ Results saved to: {results_file}")
        
        return results
        
    except Exception as e:
        print(f"\\n❌ Backtest failed: {e}")
        print("\\nTroubleshooting:")
        print("1. Check your internet connection")
        print("2. Verify the ticker symbol is valid")
        print("3. Try a different date range")
        print("4. Check if yfinance is installed: pip install yfinance")
        return None


def run_comparison_backtest():
    """Run backtests with different configurations for comparison."""
    print("\\n" + "=" * 70)
    print("CONFIGURATION COMPARISON")
    print("=" * 70)
    
    # Base configuration
    base_config = BacktestConfig(
        initial_balance=10000.0,
        start_date="2023-01-01",
        end_date="2023-06-30",
        commission_rate=0.001,
        slippage=0.001,
        data_interval="daily"
    )
    
    # Different risk levels to test
    risk_levels = [1.0, 2.0, 5.0]  # 1%, 2%, 5% risk per trade
    results_list = []
    
    for risk_pct in risk_levels:
        print(f"\\nTesting {risk_pct}% risk per trade...")
        
        # Create config variant
        config = base_config.copy()
        config.risk_per_trade_pct = risk_pct
        
        # Run backtest
        engine = BacktestEngine(config=config)
        
        try:
            result = engine.run_backtest("AAPL")
            results_list.append((risk_pct, result))
            
            print(f"  Final Balance: ${result.final_balance:,.2f}")
            print(f"  Total Return: {result.total_return_pct:.2f}%")
            print(f"  Total Trades: {result.total_trades}")
            
        except Exception as e:
            print(f"  ❌ Failed: {e}")
    
    # Compare results
    if results_list:
        print("\\n" + "=" * 70)
        print("COMPARISON SUMMARY")
        print("=" * 70)
        print(f"{'Risk %':<10} {'Final Balance':<18} {'Return %':<12} {'Trades':<10}")
        print("-" * 50)
        
        for risk_pct, result in results_list:
            print(f"{risk_pct:<10.1f} ${result.final_balance:<17,.2f} "
                  f"{result.total_return_pct:<11.2f}% {result.total_trades:<10}")
        
        # Find best performer
        best_result = max(results_list, key=lambda x: x[1].total_return_pct)
        print(f"\\n🏆 Best performer: {best_result[0]}% risk with "
              f"{best_result[1].total_return_pct:.2f}% return")


def main():
    """Main execution function."""
    print("\\n" + "=" * 70)
    print("TradingAgents Backtesting Framework")
    print("Complete Example with Analysis & Visualizations")
    print("=" * 70)
    
    # Run simple backtest
    result = run_simple_backtest()
    
    # Run comparison if simple backtest worked
    if result:
        user_input = input("\\nRun configuration comparison? (y/n): ")
        if user_input.lower() == 'y':
            run_comparison_backtest()
    
    print("\\n" + "=" * 70)
    print("Backtesting example completed!")
    print("=" * 70)
    
    print("\\nNext steps:")
    print("1. Try different tickers and date ranges")
    print("2. Experiment with different configurations")
    print("3. Integrate with TradingAgentsGraph for agent-based trading")
    print("4. Implement walk-forward analysis for robustness testing")
    print("5. Compare multiple strategies")
    
    print("\\nFor more examples, see:")
    print("  - examples/batch_analysis.py")
    print("  - examples/analyze_minimal.py")


if __name__ == "__main__":
    main()
