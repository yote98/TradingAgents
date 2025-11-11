"""
Quick Backtest Demo
Runs a simple backtest to demonstrate the framework.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from tradingagents.backtesting import (
    BacktestConfig,
    BacktestEngine,
    PerformanceAnalyzer,
    VisualizationGenerator
)

def main():
    print("="*70)
    print("BACKTESTING FRAMEWORK DEMO")
    print("="*70)
    
    # Configure backtest
    print("\n📋 Configuration:")
    config = BacktestConfig(
        initial_balance=10000.0,
        start_date="2023-01-01",
        end_date="2023-03-31",  # Short period for quick demo
        commission_rate=0.001,
        slippage=0.001,
        risk_per_trade_pct=2.0,
        max_position_size_pct=20.0
    )
    
    print(f"  Initial Balance: ${config.initial_balance:,.2f}")
    print(f"  Period: {config.start_date} to {config.end_date}")
    print(f"  Commission: {config.commission_rate:.1%}")
    print(f"  Slippage: {config.slippage:.1%}")
    print(f"  Risk per Trade: {config.risk_per_trade_pct}%")
    
    # Create engine
    print("\n🔧 Initializing backtest engine...")
    engine = BacktestEngine(config)
    print("  ✅ Engine ready")
    
    # Run backtest
    ticker = "AAPL"
    print(f"\n🚀 Running backtest for {ticker}...")
    print("  (This will take a moment to fetch data and simulate trading)")
    
    try:
        results = engine.run_backtest(ticker)
        
        # Display basic results
        print("\n" + "="*70)
        print("📊 BACKTEST RESULTS")
        print("="*70)
        print(results.summary())
        
        # Detailed analysis
        print("\n" + "="*70)
        print("📈 DETAILED PERFORMANCE ANALYSIS")
        print("="*70)
        analyzer = results.analyze()
        
        # Generate visualizations
        print("\n" + "="*70)
        print("🎨 GENERATING VISUALIZATIONS")
        print("="*70)
        
        try:
            viz = VisualizationGenerator(analyzer)
            output_dir = f"demo_backtest_{ticker}"
            viz.save_all_charts(output_dir)
            print(f"\n✅ Charts saved to {output_dir}/")
            print(f"   - {ticker}_equity_curve.png")
            print(f"   - {ticker}_drawdown.png")
            print(f"   - {ticker}_monthly_returns.png")
            print(f"   - {ticker}_trade_distribution.png")
            print(f"   - {ticker}_dashboard.png")
        except ImportError:
            print("\n⚠️  matplotlib not installed. Skipping visualizations.")
            print("   Install with: pip install matplotlib")
        
        # Export results
        print("\n" + "="*70)
        print("💾 EXPORTING RESULTS")
        print("="*70)
        
        results_file = f"demo_backtest_{ticker}_results.json"
        results.save(results_file)
        print(f"✅ Results saved to {results_file}")
        
        results.export_trades_csv(f"demo_backtest_{ticker}_trades.csv")
        print(f"✅ Trades exported to demo_backtest_{ticker}_trades.csv")
        
        results.export_equity_csv(f"demo_backtest_{ticker}_equity.csv")
        print(f"✅ Equity exported to demo_backtest_{ticker}_equity.csv")
        
        # Summary
        print("\n" + "="*70)
        print("🎉 DEMO COMPLETE!")
        print("="*70)
        
        print(f"\n📊 Key Metrics:")
        print(f"   Total Return: {results.total_return_pct:.2f}%")
        print(f"   Final Balance: ${results.final_balance:,.2f}")
        print(f"   Total Trades: {results.total_trades}")
        
        # Get risk metrics
        risk = analyzer.calculate_risk_metrics()
        print(f"\n📉 Risk Metrics:")
        print(f"   Sharpe Ratio: {risk['sharpe_ratio']:.2f}")
        print(f"   Max Drawdown: {risk['max_drawdown_pct']:.2f}%")
        
        # Get trade stats
        trades = analyzer.calculate_trade_statistics()
        print(f"\n💰 Trade Statistics:")
        print(f"   Win Rate: {trades['win_rate']:.2f}%")
        print(f"   Profit Factor: {trades['profit_factor']:.2f}")
        
        print("\n" + "="*70)
        print("✅ Backtesting framework is working perfectly!")
        print("="*70)
        
        print("\n📚 Next Steps:")
        print("  1. Try different tickers: GOOGL, MSFT, TSLA")
        print("  2. Adjust date ranges for longer backtests")
        print("  3. Compare different risk levels")
        print("  4. Run: python examples/run_backtest_example.py")
        print("  5. Run: python examples/compare_strategies_example.py")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Backtest failed: {e}")
        print("\nTroubleshooting:")
        print("  1. Check internet connection")
        print("  2. Verify ticker symbol is valid")
        print("  3. Try a different date range")
        print("  4. Ensure yfinance is installed: pip install yfinance")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
