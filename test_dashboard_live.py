"""
Test Dashboard Live - End-to-End Testing
Tests the dashboard with real API calls
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_health():
    """Test API health endpoint"""
    print("\n🏥 Testing API Health...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    return response.status_code == 200

def test_coach_plans():
    """Test coach plans endpoint"""
    print("\n👥 Testing Coach Plans...")
    response = requests.get(f"{BASE_URL}/api/coach-plans/all")
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Coaches found: {len(data)}")
    for coach_id, plan in data.items():
        print(f"   - {coach_id}: {plan['plan'][:50]}...")
    return response.status_code == 200

def test_analysis(ticker="AAPL"):
    """Test analysis endpoint with minimal config"""
    print(f"\n📊 Testing Analysis for {ticker}...")
    print("   This will cost ~$0.01-0.02")
    
    payload = {
        "ticker": ticker,
        "analysts": ["market"],  # Just one analyst to keep costs low
        "config": {
            "deep_think_llm": "gpt-4o-mini",
            "quick_think_llm": "gpt-4o-mini",
            "max_debate_rounds": 1
        }
    }
    
    print(f"   Sending request...")
    start_time = time.time()
    response = requests.post(
        f"{BASE_URL}/api/analyze",
        json=payload,
        timeout=120
    )
    elapsed = time.time() - start_time
    
    print(f"   Status: {response.status_code}")
    print(f"   Time: {elapsed:.1f}s")
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            results = data.get("results", {})
            print(f"   ✓ Analysis complete!")
            print(f"   Decision: {results.get('finalDecision', 'N/A')}")
            print(f"   Confidence: {results.get('confidence', 0):.2f}")
            
            # Show bull/bear arguments
            bull_args = results.get('bullArguments', [])
            bear_args = results.get('bearArguments', [])
            print(f"\n   Bull Arguments ({len(bull_args)}):")
            for arg in bull_args[:2]:
                print(f"   + {arg}")
            print(f"\n   Bear Arguments ({len(bear_args)}):")
            for arg in bear_args[:2]:
                print(f"   - {arg}")
            
            return True
        else:
            print(f"   ✗ Analysis failed: {data.get('error', 'Unknown error')}")
            return False
    else:
        print(f"   ✗ Request failed: {response.text}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 Dashboard Live Testing")
    print("=" * 60)
    
    results = {
        "Health Check": test_health(),
        "Coach Plans": test_coach_plans(),
    }
    
    # Ask before running analysis (costs money)
    print("\n" + "=" * 60)
    print("⚠️  Analysis Test will cost ~$0.01-0.02")
    response = input("Run analysis test? (y/n): ")
    
    if response.lower() == 'y':
        results["Analysis"] = test_analysis()
    else:
        print("   Skipped analysis test")
        results["Analysis"] = None
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    for test_name, passed in results.items():
        if passed is None:
            status = "⊘ SKIPPED"
        elif passed:
            status = "✓ PASSED"
        else:
            status = "✗ FAILED"
        print(f"   {status}: {test_name}")
    
    print("\n" + "=" * 60)
    print("🎯 Next Steps:")
    print("   1. Open http://localhost:3000/dashboard in your browser")
    print("   2. Navigate through all 7 sections")
    print("   3. Try keyboard shortcuts (Alt+1 through Alt+7)")
    print("   4. Run an analysis from the Analyze section")
    print("   5. Check the Risk section for position sizing")
    print("=" * 60)

if __name__ == "__main__":
    main()
