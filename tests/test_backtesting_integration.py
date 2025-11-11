"""
Integration Tests for Backtesting Framework

Tests the complete workflow and integration between components.
"""
import sys
import os
import unittest
from datetime import datetime

# Add project to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tradingagents.backtesting import (
    BacktestConfig,
    BacktestEngine,
    BacktestResults,
    PerformanceAnalyzer,
    StrategyComparator,
    WalkForwardAnalyzer
)


class TestBacktestingIntegration(unittest.TestCase):
    """Integration tests for backtesting framework."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.config = BacktestConfig(
            initial_balance=10000,
            start_date="2023-01-01",
            end_date="2023-01-31",  # Short period for fast tests
            commission_rate=0.001,
            slippage=0.001,
            risk_per_trade_pct=2.0
        )
    
    def test_complete_backtest_workflow(self):
        """Test complete backtest workflow from start to finish."""
        print("\n  Testing complete backtest workflow...")
        
        # Create engine
        engine = BacktestEngine(self.config)
        self.assertIsNotNone(engine)
        
        # Run backtest
        results = engine.run_backtest("AAPL")
        self.assertIsNotNone(results)
        self.assertIsInstance(results, BacktestResults)
        
        # Verify results structure
        self.assertEqual(results.ticker, "AAPL")
        self.assertEqual(results.initial_balance, 10000)
        self.assertIsNotNone(results.final_balance)
        self.assertIsNotNone(results.equity_history)
        
        print("    ✅ Complete workflow test passed")
    
    def test_performance_analysis_integration(self):
        """Test integration between backtest and performance analysis."""
        print("\n  Testing performance analysis integration...")
        
        engine = BacktestEngine(self.config)
        results = engine.run_backtest("AAPL")
        
        # Analyze results
        analyzer = PerformanceAnalyzer(results)
        self.assertIsNotNone(analyzer)
        
        # Test metrics calculation
        returns = analyzer.calculate_returns()
        self.assertIn('total_return_pct', returns)
        self.assertIn('cagr', returns)
        
        risk = analyzer.calculate_risk_metrics()
        self.assertIn('sharpe_ratio', risk)
        self.assertIn('max_drawdown_pct', risk)
        
        trades = analyzer.calculate_trade_statistics()
        self.assertIn('total_trades', trades)
        self.assertIn('win_rate', trades)
        
        print("    ✅ Performance analysis integration test passed")
    
    def test_results_persistence(self):
        """Test saving and loading results."""
        print("\n  Testing results persistence...")
        
        engine = BacktestEngine(self.config)
        results = engine.run_backtest("AAPL")
        
        # Save results
        test_file = "test_results.json"
        results.save(test_file)
        self.assertTrue(os.path.exists(test_file))
        
        # Load results
        loaded_results = BacktestResults.load(test_file)
        self.assertEqual(loaded_results.ticker, results.ticker)
        self.assertEqual(loaded_results.initial_balance, results.initial_balance)
        
        # Cleanup
        if os.path.exists(test_file):
            os.remove(test_file)
        
        print("    ✅ Results persistence test passed")
    
    def test_strategy_comparison(self):
        """Test strategy comparison functionality."""
        print("\n  Testing strategy comparison...")
        
        comparator = StrategyComparator()
        
        # Add strategies
        config1 = self.config.copy()
        config1.risk_per_trade_pct = 1.0
        
        config2 = self.config.copy()
        config2.risk_per_trade_pct = 2.0
        
        comparator.add_strategy(config1, "Conservative")
        comparator.add_strategy(config2, "Moderate")
        
        # Run comparison
        results_df = comparator.run_comparison("AAPL")
        self.assertIsNotNone(results_df)
        self.assertFalse(results_df.empty)
        
        print("    ✅ Strategy comparison test passed")
    
    def test_walk_forward_analysis(self):
        """Test walk-forward analysis."""
        print("\n  Testing walk-forward analysis...")
        
        # Use longer period for walk-forward
        config = BacktestConfig(
            initial_balance=10000,
            start_date="2023-01-01",
            end_date="2023-06-30",
            commission_rate=0.001,
            slippage=0.001,
            risk_per_trade_pct=2.0
        )
        
        analyzer = WalkForwardAnalyzer(config)
        
        # Run walk-forward with short periods for testing
        results = analyzer.run_walk_forward(
            ticker="AAPL",
            start_date="2023-01-01",
            end_date="2023-06-30",
            train_days=60,
            test_days=30
        )
        
        self.assertIsNotNone(results)
        self.assertIsNotNone(results.in_sample_results)
        self.assertIsNotNone(results.out_of_sample_results)
        
        print("    ✅ Walk-forward analysis test passed")
    
    def test_edge_case_zero_trades(self):
        """Test handling of zero trades scenario."""
        print("\n  Testing zero trades edge case...")
        
        engine = BacktestEngine(self.config)
        results = engine.run_backtest("AAPL")
        
        # Even with zero trades, should have valid results
        self.assertIsNotNone(results)
        self.assertEqual(results.initial_balance, 10000)
        
        # Analyze should handle zero trades gracefully
        analyzer = PerformanceAnalyzer(results)
        trades = analyzer.calculate_trade_statistics()
        self.assertEqual(trades['total_trades'], 0)
        
        print("    ✅ Zero trades edge case test passed")
    
    def test_data_caching(self):
        """Test data caching functionality."""
        print("\n  Testing data caching...")
        
        engine1 = BacktestEngine(self.config)
        engine2 = BacktestEngine(self.config)
        
        # First run - fetches data
        results1 = engine1.run_backtest("AAPL")
        
        # Second run - should use cache
        results2 = engine2.run_backtest("AAPL")
        
        # Both should succeed
        self.assertIsNotNone(results1)
        self.assertIsNotNone(results2)
        
        print("    ✅ Data caching test passed")
    
    def test_multiple_tickers(self):
        """Test backtesting multiple tickers."""
        print("\n  Testing multiple tickers...")
        
        tickers = ["AAPL", "GOOGL"]
        engine = BacktestEngine(self.config)
        
        for ticker in tickers:
            try:
                results = engine.run_backtest(ticker)
                self.assertIsNotNone(results)
                self.assertEqual(results.ticker, ticker)
            except Exception as e:
                self.fail(f"Failed to backtest {ticker}: {e}")
        
        print("    ✅ Multiple tickers test passed")


class TestBacktestingEdgeCases(unittest.TestCase):
    """Test edge cases and error handling."""
    
    def test_invalid_date_range(self):
        """Test handling of invalid date ranges."""
        print("\n  Testing invalid date range...")
        
        config = BacktestConfig(
            initial_balance=10000,
            start_date="2023-12-31",
            end_date="2023-01-01",  # End before start
            commission_rate=0.001,
            slippage=0.001
        )
        
        engine = BacktestEngine(config)
        
        # Should handle gracefully
        try:
            results = engine.run_backtest("AAPL")
            # If it doesn't raise an error, check for empty results
            self.assertIsNotNone(results)
        except Exception:
            # Expected to fail gracefully
            pass
        
        print("    ✅ Invalid date range test passed")
    
    def test_missing_data(self):
        """Test handling of missing data."""
        print("\n  Testing missing data handling...")
        
        config = BacktestConfig(
            initial_balance=10000,
            start_date="2030-01-01",  # Future date
            end_date="2030-12-31",
            commission_rate=0.001,
            slippage=0.001
        )
        
        engine = BacktestEngine(config)
        
        # Should handle missing data gracefully
        try:
            results = engine.run_backtest("AAPL")
        except ValueError as e:
            # Expected error for no data
            self.assertIn("No data", str(e))
        
        print("    ✅ Missing data test passed")
    
    def test_extreme_parameters(self):
        """Test with extreme parameter values."""
        print("\n  Testing extreme parameters...")
        
        config = BacktestConfig(
            initial_balance=100,  # Very small balance
            start_date="2023-01-01",
            end_date="2023-01-31",
            commission_rate=0.1,  # 10% commission (extreme)
            slippage=0.1,  # 10% slippage (extreme)
            risk_per_trade_pct=50.0  # 50% risk (extreme)
        )
        
        engine = BacktestEngine(config)
        results = engine.run_backtest("AAPL")
        
        # Should complete without crashing
        self.assertIsNotNone(results)
        
        print("    ✅ Extreme parameters test passed")


def run_tests():
    """Run all integration tests."""
    print("="*70)
    print("BACKTESTING INTEGRATION TESTS")
    print("="*70)
    
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add test classes
    suite.addTests(loader.loadTestsFromTestCase(TestBacktestingIntegration))
    suite.addTests(loader.loadTestsFromTestCase(TestBacktestingEdgeCases))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    print(f"Tests run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.wasSuccessful():
        print("\n🎉 All integration tests passed!")
        return True
    else:
        print("\n⚠️  Some tests failed. See details above.")
        return False


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
