"""
Walk-Forward Analysis
Tests strategy robustness by splitting data into training and testing periods.
Helps detect overfitting and validates strategy performance.
"""
import logging
from typing import List, Dict, Any, Optional
from datetime import timedelta
import pandas as pd
from tradingagents.backtesting.config import BacktestConfig, BacktestResults, WalkForwardResults
from tradingagents.backtesting.backtest_engine import BacktestEngine

logger = logging.getLogger(__name__)


class WalkForwardAnalyzer:
    """
    Performs walk-forward analysis to test strategy robustness.
    
    Walk-forward analysis splits historical data into multiple periods:
    - Training period (in-sample): Optimize strategy parameters
    - Testing period (out-of-sample): Validate performance
    
    This helps detect overfitting and ensures strategy works on unseen data.
    """
    
    def __init__(self, config: BacktestConfig, trading_graph=None):
        """
        Initialize walk-forward analyzer.
        
        Args:
            config: Base backtest configuration
            trading_graph: TradingAgentsGraph instance (optional)
        """
        self.config = config
        self.trading_graph = trading_graph
        
        logger.info("WalkForwardAnalyzer initialized")
    
    def run_walk_forward(
        self,
        ticker: str,
        start_date: str,
        end_date: str,
        train_days: int = 180,
        test_days: int = 60,
        step_days: Optional[int] = None
    ) -> WalkForwardResults:
        """
        Run walk-forward analysis.
        
        Args:
            ticker: Stock symbol
            start_date: Overall start date
            end_date: Overall end date
            train_days: Training period length in days
            test_days: Testing period length in days
            step_days: Step size between windows (defaults to test_days)
        
        Returns:
            WalkForwardResults with in-sample and out-of-sample results
        """
        if step_days is None:
            step_days = test_days
        
        print(f"\n{'='*70}")
        print(f"WALK-FORWARD ANALYSIS: {ticker}")
        print(f"{'='*70}")
        print(f"Period: {start_date} to {end_date}")
        print(f"Training: {train_days} days, Testing: {test_days} days")
        print(f"Step: {step_days} days")
        
        # Calculate periods
        start_dt = pd.to_datetime(start_date)
        end_dt = pd.to_datetime(end_date)
        
        in_sample_results = []
        out_of_sample_results = []
        
        current_start = start_dt
        period_num = 0
        
        while current_start + timedelta(days=train_days + test_days) <= end_dt:
            period_num += 1
            
            # Define periods
            train_end = current_start + timedelta(days=train_days)
            test_start = train_end + timedelta(days=1)
            test_end = test_start + timedelta(days=test_days)
            
            print(f"\n{'='*70}")
            print(f"Period {period_num}")
            print(f"{'='*70}")
            print(f"Training: {current_start.date()} to {train_end.date()}")
            print(f"Testing:  {test_start.date()} to {test_end.date()}")
            
            try:
                # In-sample (training) backtest
                print("\n  Running in-sample backtest...")
                engine_train = BacktestEngine(
                    config=self.config,
                    trading_graph=self.trading_graph
                )
                
                in_sample = engine_train.run_backtest(
                    ticker,
                    current_start.strftime('%Y-%m-%d'),
                    train_end.strftime('%Y-%m-%d')
                )
                in_sample_results.append(in_sample)
                print(f"  ✅ In-sample return: {in_sample.total_return_pct:.2f}%")
                
                # Out-of-sample (testing) backtest
                print("  Running out-of-sample backtest...")
                engine_test = BacktestEngine(
                    config=self.config,
                    trading_graph=self.trading_graph
                )
                
                out_of_sample = engine_test.run_backtest(
                    ticker,
                    test_start.strftime('%Y-%m-%d'),
                    test_end.strftime('%Y-%m-%d')
                )
                out_of_sample_results.append(out_of_sample)
                print(f"  ✅ Out-of-sample return: {out_of_sample.total_return_pct:.2f}%")
                
            except Exception as e:
                logger.warning(f"Period {period_num} failed: {e}")
                print(f"  ❌ Period failed: {e}")
            
            # Move to next period
            current_start += timedelta(days=step_days)
        
        # Calculate metrics
        print(f"\n{'='*70}")
        print("WALK-FORWARD ANALYSIS RESULTS")
        print(f"{'='*70}")
        
        if not in_sample_results or not out_of_sample_results:
            print("⚠️  Insufficient data for analysis")
            return WalkForwardResults()
        
        # Calculate average performance
        avg_in_sample = sum(r.total_return_pct for r in in_sample_results) / len(in_sample_results)
        avg_out_sample = sum(r.total_return_pct for r in out_of_sample_results) / len(out_of_sample_results)
        
        # Performance degradation
        degradation = avg_in_sample - avg_out_sample
        
        # Overfitting score (0-100, higher = more overfitting)
        if avg_in_sample > 0:
            overfitting_score = (degradation / avg_in_sample) * 100
        else:
            overfitting_score = 0.0
        
        print(f"\nPeriods Tested: {len(in_sample_results)}")
        print(f"\nAverage Performance:")
        print(f"  In-Sample (Training):  {avg_in_sample:.2f}%")
        print(f"  Out-of-Sample (Test):  {avg_out_sample:.2f}%")
        print(f"  Performance Degradation: {degradation:.2f}%")
        print(f"  Overfitting Score: {overfitting_score:.2f}")
        
        # Interpretation
        print(f"\n{'='*70}")
        print("INTERPRETATION")
        print(f"{'='*70}")
        
        if overfitting_score < 10:
            print("✅ EXCELLENT: Strategy shows minimal overfitting")
            print("   Performance is consistent between training and testing")
        elif overfitting_score < 25:
            print("✅ GOOD: Strategy shows acceptable overfitting")
            print("   Some performance degradation but still viable")
        elif overfitting_score < 50:
            print("⚠️  MODERATE: Strategy shows significant overfitting")
            print("   Consider simplifying strategy or adjusting parameters")
        else:
            print("❌ HIGH: Strategy shows severe overfitting")
            print("   Strategy may not perform well on live data")
        
        # Consistency analysis
        print(f"\n{'='*70}")
        print("CONSISTENCY ANALYSIS")
        print(f"{'='*70}")
        
        # Count winning periods
        winning_in_sample = sum(1 for r in in_sample_results if r.total_return_pct > 0)
        winning_out_sample = sum(1 for r in out_of_sample_results if r.total_return_pct > 0)
        
        print(f"Winning Periods:")
        print(f"  In-Sample:  {winning_in_sample}/{len(in_sample_results)} ({winning_in_sample/len(in_sample_results)*100:.1f}%)")
        print(f"  Out-of-Sample: {winning_out_sample}/{len(out_of_sample_results)} ({winning_out_sample/len(out_of_sample_results)*100:.1f}%)")
        
        # Create results object
        results = WalkForwardResults(
            in_sample_results=in_sample_results,
            out_of_sample_results=out_of_sample_results,
            performance_degradation=degradation,
            overfitting_score=overfitting_score
        )
        
        return results
    
    def compare_walk_forward(
        self,
        ticker: str,
        configs: List[BacktestConfig],
        start_date: str,
        end_date: str,
        train_days: int = 180,
        test_days: int = 60
    ) -> pd.DataFrame:
        """
        Compare multiple configurations using walk-forward analysis.
        
        Args:
            ticker: Stock symbol
            configs: List of configurations to test
            start_date: Overall start date
            end_date: Overall end date
            train_days: Training period length
            test_days: Testing period length
        
        Returns:
            DataFrame with comparison results
        """
        print(f"\n{'='*70}")
        print(f"WALK-FORWARD COMPARISON: {ticker}")
        print(f"{'='*70}")
        print(f"Testing {len(configs)} configurations...")
        
        comparison_data = []
        
        for i, config in enumerate(configs, 1):
            print(f"\n[{i}/{len(configs)}] Testing configuration {i}...")
            
            try:
                analyzer = WalkForwardAnalyzer(config, self.trading_graph)
                results = analyzer.run_walk_forward(
                    ticker, start_date, end_date, train_days, test_days
                )
                
                # Calculate metrics
                if results.in_sample_results and results.out_of_sample_results:
                    avg_in = sum(r.total_return_pct for r in results.in_sample_results) / len(results.in_sample_results)
                    avg_out = sum(r.total_return_pct for r in results.out_of_sample_results) / len(results.out_of_sample_results)
                    
                    comparison_data.append({
                        'Config': f'Config {i}',
                        'In-Sample Avg': avg_in,
                        'Out-of-Sample Avg': avg_out,
                        'Degradation': results.performance_degradation,
                        'Overfitting Score': results.overfitting_score,
                        'Periods': len(results.in_sample_results)
                    })
                    
                    print(f"  ✅ Complete - Overfitting Score: {results.overfitting_score:.2f}")
                
            except Exception as e:
                print(f"  ❌ Failed: {e}")
        
        # Create comparison DataFrame
        df = pd.DataFrame(comparison_data)
        
        if not df.empty:
            print(f"\n{'='*70}")
            print("COMPARISON RESULTS")
            print(f"{'='*70}\n")
            print(df.to_string(index=False))
            
            # Find best configuration
            best_idx = df['Overfitting Score'].idxmin()
            best = df.loc[best_idx]
            
            print(f"\n{'='*70}")
            print("BEST CONFIGURATION")
            print(f"{'='*70}")
            print(f"  {best['Config']}")
            print(f"  Out-of-Sample Return: {best['Out-of-Sample Avg']:.2f}%")
            print(f"  Overfitting Score: {best['Overfitting Score']:.2f}")
        
        return df
    
    def generate_report(self, results: WalkForwardResults, filepath: str):
        """
        Generate detailed walk-forward analysis report.
        
        Args:
            results: WalkForwardResults to analyze
            filepath: Path to save report
        """
        with open(filepath, 'w') as f:
            f.write("# Walk-Forward Analysis Report\n\n")
            
            f.write("## Summary\n\n")
            f.write(f"- Periods Tested: {len(results.in_sample_results)}\n")
            
            if results.in_sample_results and results.out_of_sample_results:
                avg_in = sum(r.total_return_pct for r in results.in_sample_results) / len(results.in_sample_results)
                avg_out = sum(r.total_return_pct for r in results.out_of_sample_results) / len(results.out_of_sample_results)
                
                f.write(f"- Average In-Sample Return: {avg_in:.2f}%\n")
                f.write(f"- Average Out-of-Sample Return: {avg_out:.2f}%\n")
                f.write(f"- Performance Degradation: {results.performance_degradation:.2f}%\n")
                f.write(f"- Overfitting Score: {results.overfitting_score:.2f}\n\n")
                
                f.write("## Period-by-Period Results\n\n")
                f.write("| Period | In-Sample | Out-of-Sample | Difference |\n")
                f.write("|--------|-----------|---------------|------------|\n")
                
                for i, (in_res, out_res) in enumerate(zip(results.in_sample_results, results.out_of_sample_results), 1):
                    diff = in_res.total_return_pct - out_res.total_return_pct
                    f.write(f"| {i} | {in_res.total_return_pct:.2f}% | {out_res.total_return_pct:.2f}% | {diff:.2f}% |\n")
        
        print(f"✅ Report saved to {filepath}")


def quick_walk_forward(
    ticker: str,
    config: BacktestConfig,
    start_date: str,
    end_date: str,
    train_days: int = 180,
    test_days: int = 60
) -> WalkForwardResults:
    """
    Quick walk-forward analysis helper function.
    
    Args:
        ticker: Stock symbol
        config: Backtest configuration
        start_date: Start date
        end_date: End date
        train_days: Training period length
        test_days: Testing period length
    
    Returns:
        WalkForwardResults
    """
    analyzer = WalkForwardAnalyzer(config)
    return analyzer.run_walk_forward(ticker, start_date, end_date, train_days, test_days)
