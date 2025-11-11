"""
Quick Test Script for Backtesting Framework
Tests basic functionality without requiring TradingAgentsGraph
"""
import sys
import os

# Add project to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all modules can be imported."""
    print("Testing imports...")
    try:
        from tradingagents.backtesting import (
            BacktestConfig,
            BacktestResults,
            BacktestEngine,
            HistoricalDataManager,
            PerformanceAnalyzer,
            VisualizationGenerator,
            StrategyComparator,
            compare_risk_levels,
            compare_position_sizing_methods,
            compare_tickers
        )
        print("✅ All imports successful!")
        return True
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False


def test_config():
    """Test configuration creation and validation."""
    print("\nTesting configuration...")
    try:
        from tradingagents.backtesting import BacktestConfig
        
        config = BacktestConfig(
            initial_balance=10000,
            start_date="2023-01-01",
            end_date="2023-06-30",
            commission_rate=0.001,
            slippage=0.001,
            risk_per_trade_pct=2.0
        )
        
        print(f"  Initial Balance: ${config.initial_balance:,.2f}")
        print(f"  Period: {config.start_date} to {config.end_date}")
        print(f"  Commission: {config.commission_rate:.1%}")
        print("✅ Configuration test passed!")
        return True
    except Exception as e:
        print(f"❌ Configuration test failed: {e}")
        return False


def test_data_manager():
    """Test data manager functionality."""
    print("\nTesting data manager...")
    try:
        from tradingagents.backtesting import HistoricalDataManager
        
        manager = HistoricalDataManager()
        print("  Data manager initialized")
        
        # Try to fetch some data
        print("  Fetching AAPL data (this may take a moment)...")
        data = manager.get_historical_data(
            ticker="AAPL",
            start_date="2023-01-01",
            end_date="2023-01-31",
            interval="daily"
        )
        
        if not data.empty:
            print(f"  ✅ Fetched {len(data)} days of data")
            print(f"  Date range: {data.index[0]} to {data.index[-1]}")
            print("✅ Data manager test passed!")
            return True
        else:
            print("  ⚠️  No data returned (check internet connection)")
            return False
            
    except Exception as e:
        print(f"❌ Data manager test failed: {e}")
        return False


def test_simulated_account():
    """Test simulated account functionality."""
    print("\nTesting simulated account...")
    try:
        from tradingagents.backtesting.account import SimulatedAccount
        
        account = SimulatedAccount(initial_balance=10000)
        print(f"  Initial balance: ${account.initial_balance:,.2f}")
        
        # Test buy
        success = account.buy("AAPL", 10, 150.0, "2023-01-01", commission=1.5)
        if success:
            print(f"  ✅ Buy executed: 10 shares at $150")
            print(f"  Cash balance: ${account.cash_balance:,.2f}")
        
        # Test position
        position = account.get_position("AAPL")
        if position:
            print(f"  Position: {position.shares} shares, avg cost ${position.avg_cost:.2f}")
        
        # Test sell
        success = account.sell("AAPL", 5, 155.0, "2023-01-02", commission=1.5)
        if success:
            print(f"  ✅ Sell executed: 5 shares at $155")
            print(f"  Cash balance: ${account.cash_balance:,.2f}")
        
        print("✅ Simulated account test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Simulated account test failed: {e}")
        return False


def test_performance_analyzer():
    """Test performance analyzer with mock data."""
    print("\nTesting performance analyzer...")
    try:
        from tradingagents.backtesting import BacktestResults, PerformanceAnalyzer
        
        # Create mock results
        results = BacktestResults(
            ticker="AAPL",
            start_date="2023-01-01",
            end_date="2023-06-30",
            initial_balance=10000,
            final_balance=11500,
            trades=[
                {
                    'date': '2023-01-15',
                    'ticker': 'AAPL',
                    'action': 'BUY',
                    'shares': 10,
                    'price': 150.0,
                    'gross_amount': 1500,
                    'commission': 1.5,
                    'slippage': 1.5,
                    'net_amount': -1503
                },
                {
                    'date': '2023-02-15',
                    'ticker': 'AAPL',
                    'action': 'SELL',
                    'shares': 10,
                    'price': 165.0,
                    'gross_amount': 1650,
                    'commission': 1.5,
                    'slippage': 1.5,
                    'net_amount': 1647
                }
            ],
            equity_history=[
                {'date': '2023-01-01', 'cash_balance': 10000, 'total_equity': 10000, 'positions': {}, 'daily_return': 0},
                {'date': '2023-06-30', 'cash_balance': 11500, 'total_equity': 11500, 'positions': {}, 'daily_return': 0.01}
            ]
        )
        
        analyzer = PerformanceAnalyzer(results)
        
        # Test metrics
        returns = analyzer.calculate_returns()
        print(f"  Total Return: {returns['total_return_pct']:.2f}%")
        
        risk = analyzer.calculate_risk_metrics()
        print(f"  Sharpe Ratio: {risk['sharpe_ratio']:.2f}")
        
        trades = analyzer.calculate_trade_statistics()
        print(f"  Total Trades: {trades['total_trades']}")
        
        print("✅ Performance analyzer test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Performance analyzer test failed: {e}")
        return False


def test_visualization():
    """Test visualization generator (without displaying)."""
    print("\nTesting visualization generator...")
    try:
        # Check if matplotlib is available
        try:
            import matplotlib
            matplotlib.use('Agg')  # Non-interactive backend
            print("  matplotlib available")
        except ImportError:
            print("  ⚠️  matplotlib not installed (optional)")
            print("  Install with: pip install matplotlib")
            return True  # Not a failure, just optional
        
        from tradingagents.backtesting import BacktestResults, PerformanceAnalyzer, VisualizationGenerator
        
        # Create mock results
        results = BacktestResults(
            ticker="AAPL",
            start_date="2023-01-01",
            end_date="2023-06-30",
            initial_balance=10000,
            final_balance=11500,
            equity_history=[
                {'date': '2023-01-01', 'cash_balance': 10000, 'total_equity': 10000, 'positions': {}, 'daily_return': 0},
                {'date': '2023-06-30', 'cash_balance': 11500, 'total_equity': 11500, 'positions': {}, 'daily_return': 0.01}
            ]
        )
        
        analyzer = PerformanceAnalyzer(results)
        viz = VisualizationGenerator(analyzer)
        
        print("  ✅ Visualization generator initialized")
        print("✅ Visualization test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Visualization test failed: {e}")
        return False


def test_strategy_comparator():
    """Test strategy comparator."""
    print("\nTesting strategy comparator...")
    try:
        from tradingagents.backtesting import BacktestConfig, StrategyComparator
        
        comparator = StrategyComparator()
        
        config1 = BacktestConfig(
            initial_balance=10000,
            start_date="2023-01-01",
            end_date="2023-01-31",
            risk_per_trade_pct=1.0
        )
        
        config2 = BacktestConfig(
            initial_balance=10000,
            start_date="2023-01-01",
            end_date="2023-01-31",
            risk_per_trade_pct=2.0
        )
        
        comparator.add_strategy(config1, "Conservative")
        comparator.add_strategy(config2, "Moderate")
        
        print("  ✅ Added 2 strategies")
        print("✅ Strategy comparator test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Strategy comparator test failed: {e}")
        return False


def main():
    """Run all tests."""
    print("="*70)
    print("BACKTESTING FRAMEWORK TEST SUITE")
    print("="*70)
    
    tests = [
        ("Imports", test_imports),
        ("Configuration", test_config),
        ("Data Manager", test_data_manager),
        ("Simulated Account", test_simulated_account),
        ("Performance Analyzer", test_performance_analyzer),
        ("Visualization", test_visualization),
        ("Strategy Comparator", test_strategy_comparator)
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n❌ Test '{name}' crashed: {e}")
            results.append((name, False))
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    print(f"\n{passed}/{total} tests passed ({passed/total*100:.0f}%)")
    
    if passed == total:
        print("\n🎉 All tests passed! Backtesting framework is working!")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")
    
    print("="*70)
    
    return passed == total


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
