"""
Example: Compare Multiple Strategies

This script demonstrates how to compare different strategy configurations
to find the optimal parameters for your trading approach.
"""
import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tradingagents.backtesting import (
    BacktestConfig,
    StrategyComparator,
    compare_risk_levels,
    compare_position_sizing_methods,
    compare_tickers
)


def compare_risk_strategies():
    """Compare different risk levels."""
    print("\n" + "="*70)
    print("COMPARING RISK LEVELS")
    print("="*70)
    
    # Base configuration
    base_config = BacktestConfig(
        initial_balance=10000,
        start_date="2023-01-01",
        end_date="2023-06-30",
        commission_rate=0.001,
        slippage=0.001
    )
    
    # Test different risk levels
    risk_levels = [1.0, 2.0, 3.0, 5.0]
    
    results_df = compare_risk_levels(
        ticker="AAPL",
        risk_levels=risk_levels,
        base_config=base_config
    )
    
    # Export results
    results_df.to_csv("risk_comparison.csv", index=False)
    print("\n✅ Results saved to risk_comparison.csv")
    
    return results_df


def compare_sizing_methods():
    """Compare different position sizing methods."""
    print("\n" + "="*70)
    print("COMPARING POSITION SIZING METHODS")
    print("="*70)
    
    base_config = BacktestConfig(
        initial_balance=10000,
        start_date="2023-01-01",
        end_date="2023-06-30",
        commission_rate=0.001,
        slippage=0.001,
        risk_per_trade_pct=2.0
    )
    
    results_df = compare_position_sizing_methods(
        ticker="AAPL",
        base_config=base_config
    )
    
    # Export results
    results_df.to_csv("sizing_comparison.csv", index=False)
    print("\n✅ Results saved to sizing_comparison.csv")
    
    return results_df


def compare_multiple_tickers():
    """Compare same strategy across different stocks."""
    print("\n" + "="*70)
    print("COMPARING ACROSS TICKERS")
    print("="*70)
    
    config = BacktestConfig(
        initial_balance=10000,
        start_date="2023-01-01",
        end_date="2023-06-30",
        commission_rate=0.001,
        slippage=0.001,
        risk_per_trade_pct=2.0
    )
    
    tickers = ["AAPL", "GOOGL", "MSFT", "TSLA"]
    
    results_df = compare_tickers(
        tickers=tickers,
        config=config
    )
    
    # Export results
    results_df.to_csv("ticker_comparison.csv", index=False)
    print("\n✅ Results saved to ticker_comparison.csv")
    
    return results_df


def custom_comparison():
    """Create a custom comparison with specific configurations."""
    print("\n" + "="*70)
    print("CUSTOM STRATEGY COMPARISON")
    print("="*70)
    
    # Create comparator
    comparator = StrategyComparator()
    
    # Strategy 1: Conservative
    config1 = BacktestConfig(
        initial_balance=10000,
        start_date="2023-01-01",
        end_date="2023-06-30",
        commission_rate=0.001,
        slippage=0.001,
        risk_per_trade_pct=1.0,
        max_position_size_pct=10.0,
        position_sizing_method="fixed_percentage"
    )
    comparator.add_strategy(config1, "Conservative")
    
    # Strategy 2: Moderate
    config2 = BacktestConfig(
        initial_balance=10000,
        start_date="2023-01-01",
        end_date="2023-06-30",
        commission_rate=0.001,
        slippage=0.001,
        risk_per_trade_pct=2.0,
        max_position_size_pct=20.0,
        position_sizing_method="risk_based"
    )
    comparator.add_strategy(config2, "Moderate")
    
    # Strategy 3: Aggressive
    config3 = BacktestConfig(
        initial_balance=10000,
        start_date="2023-01-01",
        end_date="2023-06-30",
        commission_rate=0.001,
        slippage=0.001,
        risk_per_trade_pct=5.0,
        max_position_size_pct=30.0,
        position_sizing_method="equal_weight"
    )
    comparator.add_strategy(config3, "Aggressive")
    
    # Run comparison
    results_df = comparator.run_comparison("AAPL")
    
    # Print results
    comparator.print_comparison()
    
    # Get best strategy
    best_config, best_result = comparator.get_best_strategy('sharpe_ratio')
    print(f"\n🏆 Best Strategy (by Sharpe Ratio):")
    print(f"   Return: {best_result.total_return_pct:.2f}%")
    print(f"   Sharpe: {best_result.sharpe_ratio:.2f}")
    print(f"   Max DD: {best_result.max_drawdown:.2f}%")
    
    # Export
    comparator.export_comparison("custom_comparison.csv")
    
    return results_df


def main():
    """Main execution function."""
    print("\n" + "="*70)
    print("TradingAgents Strategy Comparison Examples")
    print("="*70)
    
    print("\nThis script demonstrates different ways to compare strategies:")
    print("1. Compare risk levels")
    print("2. Compare position sizing methods")
    print("3. Compare across tickers")
    print("4. Custom comparison")
    
    # Run all comparisons
    try:
        # 1. Risk levels
        print("\n" + "="*70)
        print("1. RISK LEVEL COMPARISON")
        print("="*70)
        compare_risk_strategies()
        
        # 2. Position sizing
        print("\n" + "="*70)
        print("2. POSITION SIZING COMPARISON")
        print("="*70)
        compare_sizing_methods()
        
        # 3. Tickers
        print("\n" + "="*70)
        print("3. TICKER COMPARISON")
        print("="*70)
        compare_multiple_tickers()
        
        # 4. Custom
        print("\n" + "="*70)
        print("4. CUSTOM COMPARISON")
        print("="*70)
        custom_comparison()
        
        print("\n" + "="*70)
        print("ALL COMPARISONS COMPLETE!")
        print("="*70)
        
        print("\nResults saved:")
        print("  - risk_comparison.csv")
        print("  - sizing_comparison.csv")
        print("  - ticker_comparison.csv")
        print("  - custom_comparison.csv")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Check internet connection")
        print("2. Verify ticker symbols are valid")
        print("3. Try a different date range")
        print("4. Ensure yfinance is installed: pip install yfinance")


if __name__ == "__main__":
    main()
