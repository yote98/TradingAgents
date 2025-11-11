"""
Example: Walk-Forward Analysis

This script demonstrates walk-forward analysis to test strategy robustness
and detect overfitting.
"""
import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tradingagents.backtesting import (
    BacktestConfig,
    WalkForwardAnalyzer,
    quick_walk_forward
)


def basic_walk_forward():
    """Run a basic walk-forward analysis."""
    print("\n" + "="*70)
    print("BASIC WALK-FORWARD ANALYSIS")
    print("="*70)
    
    # Configure backtest
    config = BacktestConfig(
        initial_balance=10000,
        start_date="2022-01-01",  # Longer period for walk-forward
        end_date="2023-12-31",
        commission_rate=0.001,
        slippage=0.001,
        risk_per_trade_pct=2.0
    )
    
    # Run walk-forward analysis
    # Training: 180 days, Testing: 60 days
    results = quick_walk_forward(
        ticker="AAPL",
        config=config,
        start_date="2022-01-01",
        end_date="2023-12-31",
        train_days=180,
        test_days=60
    )
    
    return results


def compare_configurations():
    """Compare multiple configurations using walk-forward analysis."""
    print("\n" + "="*70)
    print("WALK-FORWARD CONFIGURATION COMPARISON")
    print("="*70)
    
    # Create different configurations
    configs = []
    
    # Conservative
    config1 = BacktestConfig(
        initial_balance=10000,
        commission_rate=0.001,
        slippage=0.001,
        risk_per_trade_pct=1.0,
        max_position_size_pct=10.0
    )
    configs.append(config1)
    
    # Moderate
    config2 = BacktestConfig(
        initial_balance=10000,
        commission_rate=0.001,
        slippage=0.001,
        risk_per_trade_pct=2.0,
        max_position_size_pct=20.0
    )
    configs.append(config2)
    
    # Aggressive
    config3 = BacktestConfig(
        initial_balance=10000,
        commission_rate=0.001,
        slippage=0.001,
        risk_per_trade_pct=5.0,
        max_position_size_pct=30.0
    )
    configs.append(config3)
    
    # Run comparison
    analyzer = WalkForwardAnalyzer(config1)
    results_df = analyzer.compare_walk_forward(
        ticker="AAPL",
        configs=configs,
        start_date="2022-01-01",
        end_date="2023-12-31",
        train_days=180,
        test_days=60
    )
    
    return results_df


def detailed_walk_forward():
    """Run detailed walk-forward analysis with custom parameters."""
    print("\n" + "="*70)
    print("DETAILED WALK-FORWARD ANALYSIS")
    print("="*70)
    
    config = BacktestConfig(
        initial_balance=10000,
        commission_rate=0.001,
        slippage=0.001,
        risk_per_trade_pct=2.0
    )
    
    analyzer = WalkForwardAnalyzer(config)
    
    # Custom parameters
    results = analyzer.run_walk_forward(
        ticker="AAPL",
        start_date="2022-01-01",
        end_date="2023-12-31",
        train_days=120,  # 4 months training
        test_days=30,    # 1 month testing
        step_days=30     # Move forward 1 month each time
    )
    
    # Generate report
    if results.in_sample_results:
        analyzer.generate_report(results, "walk_forward_report.md")
        print("\n✅ Detailed report saved to walk_forward_report.md")
    
    return results


def interpret_results(results):
    """Interpret walk-forward results."""
    print("\n" + "="*70)
    print("RESULTS INTERPRETATION")
    print("="*70)
    
    if not results.in_sample_results or not results.out_of_sample_results:
        print("⚠️  No results to interpret")
        return
    
    overfitting_score = results.overfitting_score
    degradation = results.performance_degradation
    
    print(f"\nOverfitting Score: {overfitting_score:.2f}")
    print(f"Performance Degradation: {degradation:.2f}%")
    
    print("\n📊 What This Means:")
    
    if overfitting_score < 10:
        print("  ✅ Your strategy is ROBUST")
        print("     - Minimal overfitting detected")
        print("     - Performance is consistent")
        print("     - Strategy should work well on live data")
    elif overfitting_score < 25:
        print("  ✅ Your strategy is ACCEPTABLE")
        print("     - Some overfitting but manageable")
        print("     - Performance degrades slightly")
        print("     - Strategy is still viable for live trading")
    elif overfitting_score < 50:
        print("  ⚠️  Your strategy shows MODERATE OVERFITTING")
        print("     - Significant performance degradation")
        print("     - Consider simplifying strategy")
        print("     - Test with different parameters")
    else:
        print("  ❌ Your strategy shows SEVERE OVERFITTING")
        print("     - High performance degradation")
        print("     - Strategy may not work on live data")
        print("     - Recommend redesigning strategy")
    
    print("\n💡 Recommendations:")
    
    if overfitting_score > 25:
        print("  1. Simplify your strategy (fewer indicators/rules)")
        print("  2. Use longer training periods")
        print("  3. Test on multiple tickers")
        print("  4. Avoid over-optimization")
    else:
        print("  1. Strategy looks good for live trading")
        print("  2. Continue monitoring performance")
        print("  3. Consider testing on other tickers")


def main():
    """Main execution function."""
    print("\n" + "="*70)
    print("TradingAgents Walk-Forward Analysis Examples")
    print("="*70)
    
    print("\nWalk-forward analysis helps you:")
    print("  1. Detect overfitting in your strategy")
    print("  2. Validate performance on unseen data")
    print("  3. Test strategy robustness")
    print("  4. Build confidence before live trading")
    
    try:
        # 1. Basic walk-forward
        print("\n" + "="*70)
        print("1. BASIC WALK-FORWARD ANALYSIS")
        print("="*70)
        results = basic_walk_forward()
        interpret_results(results)
        
        # 2. Compare configurations
        print("\n" + "="*70)
        print("2. CONFIGURATION COMPARISON")
        print("="*70)
        compare_configurations()
        
        # 3. Detailed analysis
        print("\n" + "="*70)
        print("3. DETAILED ANALYSIS WITH REPORT")
        print("="*70)
        detailed_walk_forward()
        
        print("\n" + "="*70)
        print("WALK-FORWARD ANALYSIS COMPLETE!")
        print("="*70)
        
        print("\n📚 Key Takeaways:")
        print("  - Walk-forward analysis tests strategy on unseen data")
        print("  - Low overfitting score = robust strategy")
        print("  - High overfitting score = strategy may fail on live data")
        print("  - Use this before deploying any strategy")
        
        print("\n📁 Files Generated:")
        print("  - walk_forward_report.md (detailed analysis)")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting:")
        print("  1. Check internet connection")
        print("  2. Verify ticker symbol")
        print("  3. Try shorter date range")
        print("  4. Ensure yfinance is installed")


if __name__ == "__main__":
    main()
