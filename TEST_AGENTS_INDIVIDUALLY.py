"""
Test Each Agent Individually
Validates that each analyst produces reasonable, accurate analysis
"""
import os
import sys
import shutil
from datetime import datetime, timedelta
from pathlib import Path

# Set environment variable
os.environ["OPENAI_API_KEY"] = "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"

from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

def clear_chromadb():
    """Clear ChromaDB collections to avoid conflicts"""
    chroma_path = Path("tradingagents/agents/utils/chroma_db")
    if chroma_path.exists():
        print(f"{Colors.YELLOW}[CLEAN] Clearing ChromaDB collections...{Colors.END}")
        try:
            shutil.rmtree(chroma_path)
            print(f"{Colors.GREEN}[OK] ChromaDB cleared{Colors.END}")
        except Exception as e:
            print(f"{Colors.YELLOW}[WARN] Could not clear ChromaDB: {e}{Colors.END}")

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}\n")

def print_success(text):
    print(f"{Colors.GREEN}[OK] {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}[FAIL] {text}{Colors.END}")

def print_info(text):
    print(f"{Colors.CYAN}[INFO] {text}{Colors.END}")

def print_analysis(title, content):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{title}:{Colors.END}")
    print(f"{Colors.CYAN}{'-'*70}{Colors.END}")
    # Truncate if too long
    if len(content) > 500:
        print(content[:500] + "...")
    else:
        print(content)
    print(f"{Colors.CYAN}{'-'*70}{Colors.END}")

def validate_market_analyst(report):
    """Validate Market Analyst output"""
    print_header("VALIDATING MARKET ANALYST")
    
    checks = {
        "mentions_price": any(word in report.lower() for word in ["price", "$", "trading", "volume"]),
        "mentions_indicators": any(word in report.lower() for word in ["rsi", "macd", "moving average", "support", "resistance", "trend"]),
        "has_numbers": any(char.isdigit() for char in report),
        "reasonable_length": 100 < len(report) < 10000,
        "not_error": "error" not in report.lower() and "exception" not in report.lower()
    }
    
    print_analysis("Market Analyst Report", report)
    
    print("\n[VALIDATION] Checks:")
    for check, passed in checks.items():
        if passed:
            print_success(f"{check}: PASS")
        else:
            print_error(f"{check}: FAIL")
    
    return all(checks.values())

def validate_fundamentals_analyst(report):
    """Validate Fundamentals Analyst output"""
    print_header("VALIDATING FUNDAMENTALS ANALYST")
    
    checks = {
        "mentions_financials": any(word in report.lower() for word in ["revenue", "earnings", "profit", "eps", "p/e", "market cap"]),
        "mentions_company": any(word in report.lower() for word in ["company", "business", "sector", "industry"]),
        "has_numbers": any(char.isdigit() for char in report),
        "reasonable_length": 100 < len(report) < 10000,
        "not_error": "error" not in report.lower() and "exception" not in report.lower()
    }
    
    print_analysis("Fundamentals Analyst Report", report)
    
    print("\n[VALIDATION] Checks:")
    for check, passed in checks.items():
        if passed:
            print_success(f"{check}: PASS")
        else:
            print_error(f"{check}: FAIL")
    
    return all(checks.values())

def validate_news_analyst(report):
    """Validate News Analyst output"""
    print_header("VALIDATING NEWS ANALYST")
    
    checks = {
        "mentions_news": any(word in report.lower() for word in ["news", "article", "report", "announcement", "headline"]),
        "mentions_sentiment": any(word in report.lower() for word in ["sentiment", "positive", "negative", "bullish", "bearish"]),
        "reasonable_length": 100 < len(report) < 10000,
        "not_error": "error" not in report.lower() and "exception" not in report.lower()
    }
    
    print_analysis("News Analyst Report", report)
    
    print("\n[VALIDATION] Checks:")
    for check, passed in checks.items():
        if passed:
            print_success(f"{check}: PASS")
        else:
            print_error(f"{check}: FAIL")
    
    return all(checks.values())

def validate_social_analyst(report):
    """Validate Social Analyst output"""
    print_header("VALIDATING SOCIAL ANALYST")
    
    checks = {
        "mentions_social": any(word in report.lower() for word in ["social", "twitter", "reddit", "sentiment", "community"]),
        "mentions_sentiment": any(word in report.lower() for word in ["sentiment", "positive", "negative", "bullish", "bearish", "neutral"]),
        "reasonable_length": 100 < len(report) < 10000,
        "not_error": "error" not in report.lower() and "exception" not in report.lower()
    }
    
    print_analysis("Social Analyst Report", report)
    
    print("\n[VALIDATION] Checks:")
    for check, passed in checks.items():
        if passed:
            print_success(f"{check}: PASS")
        else:
            print_error(f"{check}: FAIL")
    
    return all(checks.values())

def test_single_analyst(analyst_name, ticker="AAPL"):
    """Test a single analyst"""
    print_header(f"TESTING {analyst_name.upper()} ANALYST")
    
    print_info(f"Ticker: {ticker}")
    print_info(f"Analyst: {analyst_name}")
    print_info("This will take 30-60 seconds...")
    
    # Clear ChromaDB before each test
    clear_chromadb()
    
    try:
        # Configure for single analyst
        config = DEFAULT_CONFIG.copy()
        config["deep_think_llm"] = "gpt-4o-mini"
        config["quick_think_llm"] = "gpt-4o-mini"
        config["max_debate_rounds"] = 1
        
        # Initialize with only this analyst
        graph = TradingAgentsGraph(
            selected_analysts=[analyst_name],
            debug=False,
            config=config
        )
        
        # Run analysis
        trade_date = datetime.now().strftime("%Y-%m-%d")
        print_info(f"Running analysis for {trade_date}...")
        
        final_state, decision, coach_plans = graph.propagate(ticker, trade_date)
        
        # Get the analyst's report
        # Special case: social analyst uses "sentiment_report" key
        if analyst_name == "social":
            report_key = "sentiment_report"
        else:
            report_key = f"{analyst_name}_report"
        report = final_state.get(report_key, "")
        
        if not report:
            print_error(f"No report found for {analyst_name}")
            return False
        
        # Validate based on analyst type
        if analyst_name == "market":
            return validate_market_analyst(report)
        elif analyst_name == "fundamentals":
            return validate_fundamentals_analyst(report)
        elif analyst_name == "news":
            return validate_news_analyst(report)
        elif analyst_name == "social":
            return validate_social_analyst(report)
        else:
            print_error(f"Unknown analyst: {analyst_name}")
            return False
            
    except Exception as e:
        print_error(f"Error testing {analyst_name}: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_all_analysts_together(ticker="AAPL"):
    """Test all analysts working together"""
    print_header("TESTING ALL ANALYSTS TOGETHER")
    
    print_info(f"Ticker: {ticker}")
    print_info("This will take 2-3 minutes...")
    
    # Clear ChromaDB before full test
    clear_chromadb()
    
    try:
        config = DEFAULT_CONFIG.copy()
        config["deep_think_llm"] = "gpt-4o-mini"
        config["quick_think_llm"] = "gpt-4o-mini"
        config["max_debate_rounds"] = 1
        
        # Initialize with all analysts
        graph = TradingAgentsGraph(
            selected_analysts=["market", "fundamentals", "news", "social"],
            debug=False,
            config=config
        )
        
        # Run full analysis
        trade_date = datetime.now().strftime("%Y-%m-%d")
        print_info(f"Running full analysis for {trade_date}...")
        
        final_state, decision, coach_plans = graph.propagate(ticker, trade_date)
        
        # Check all reports exist
        analysts = ["market", "fundamentals", "news", "social"]
        all_present = True
        
        print("\n[REPORTS] Checking all analyst reports:")
        for analyst in analysts:
            # Special case: social analyst uses "sentiment_report" key
            if analyst == "social":
                report_key = "sentiment_report"
            else:
                report_key = f"{analyst}_report"
            report = final_state.get(report_key, "")
            if report:
                print_success(f"{analyst.capitalize()} Analyst: Report generated ({len(report)} chars)")
            else:
                print_error(f"{analyst.capitalize()} Analyst: NO REPORT")
                all_present = False
        
        # Check final decision
        final_decision = final_state.get("final_trade_decision", "")
        if final_decision:
            print_success(f"Final Decision: Generated ({len(final_decision)} chars)")
            print_analysis("Final Trading Decision", final_decision)
        else:
            print_error("Final Decision: MISSING")
            all_present = False
        
        return all_present
        
    except Exception as e:
        print_error(f"Error in full analysis: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print(f"\n{Colors.BOLD}{Colors.BLUE}")
    print("="*70)
    print("         INDIVIDUAL AGENT TESTING SUITE")
    print("         Validate Each Analyst's Output")
    print("="*70)
    print(f"{Colors.END}\n")
    
    # Clear ChromaDB before starting
    clear_chromadb()
    
    print_info(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_info("Testing with AAPL (Apple Inc.)")
    print_info("This will take 5-10 minutes total...\n")
    
    results = {}
    
    # Test each analyst individually
    analysts = ["market", "fundamentals", "news", "social"]
    
    for analyst in analysts:
        print(f"\n{Colors.YELLOW}{'='*70}{Colors.END}")
        print(f"{Colors.YELLOW}Testing {analyst.upper()} analyst...{Colors.END}")
        print(f"{Colors.YELLOW}{'='*70}{Colors.END}")
        
        results[analyst] = test_single_analyst(analyst)
        
        if results[analyst]:
            print_success(f"{analyst.capitalize()} Analyst: PASSED ✅")
        else:
            print_error(f"{analyst.capitalize()} Analyst: FAILED ❌")
    
    # Test all together
    print(f"\n{Colors.YELLOW}{'='*70}{Colors.END}")
    print(f"{Colors.YELLOW}Testing ALL analysts together...{Colors.END}")
    print(f"{Colors.YELLOW}{'='*70}{Colors.END}")
    
    results["full_system"] = test_all_analysts_together()
    
    # Final report
    print_header("FINAL TEST RESULTS")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    print(f"\n{Colors.BOLD}Tests Passed: {passed}/{total}{Colors.END}\n")
    
    for test_name, passed in results.items():
        if passed:
            print_success(f"{test_name.replace('_', ' ').title()}: PASSED")
        else:
            print_error(f"{test_name.replace('_', ' ').title()}: FAILED")
    
    print("\n" + "="*70)
    
    if all(results.values()):
        print(f"\n{Colors.GREEN}{Colors.BOLD}[SUCCESS] ALL AGENTS VALIDATED - READY FOR DEPLOYMENT!{Colors.END}\n")
        return 0
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}[WARNING] SOME AGENTS FAILED - REVIEW BEFORE DEPLOYMENT!{Colors.END}\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
