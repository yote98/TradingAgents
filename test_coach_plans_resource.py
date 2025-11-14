"""
Test script for coach_plans resource
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta

# Add mcp_server to path
sys.path.insert(0, os.path.dirname(__file__))

from mcp_server.resources.coach_plans import CoachPlansResource


# Mock storage manager for testing
class MockStorageManager:
    """Mock storage manager with sample data"""
    
    def __init__(self):
        self.plans = self._generate_mock_plans()
    
    def _generate_mock_plans(self):
        """Generate mock coach plans for testing"""
        plans = {}
        
        # Generate plans for last 7 days
        for i in range(7):
            date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
            plans[date] = {}
            
            # Add plans from different coaches
            if i % 2 == 0:  # Technical coach every other day
                plans[date]["coach_d"] = {
                    "id": i * 4 + 1,
                    "coach_name": "coach_d",
                    "date": date,
                    "plan": f"Technical Analysis for {date}:\n\n$AAPL showing strong support at $175. RSI at 45, MACD bullish crossover. Target $185, stop $172.\n\n$TSLA breaking resistance at $240. Volume increasing. Watch for continuation to $260.",
                    "author": "tech_trader",
                    "channel": "technical-analysis",
                    "charts": [
                        f"https://example.com/charts/aapl_{date}.png",
                        f"https://example.com/charts/tsla_{date}.png"
                    ],
                    "created_at": f"{date}T09:00:00Z",
                    "edited_at": None
                }
            
            if i % 3 == 0:  # Fundamental coach every 3 days
                plans[date]["coach_i"] = {
                    "id": i * 4 + 2,
                    "coach_name": "coach_i",
                    "date": date,
                    "plan": f"Fundamental Analysis for {date}:\n\n$AAPL: Strong earnings beat, P/E ratio attractive at 28. Services revenue growing 15% YoY. BUY rating.\n\n$MSFT: Cloud growth accelerating, Azure up 30%. Fair value $380, currently undervalued.",
                    "author": "fund_analyst",
                    "channel": "fundamentals",
                    "charts": [],
                    "created_at": f"{date}T10:00:00Z",
                    "edited_at": None
                }
            
            if i < 3:  # Sentiment coach for recent days
                plans[date]["coach_s"] = {
                    "id": i * 4 + 3,
                    "coach_name": "coach_s",
                    "date": date,
                    "plan": f"Sentiment Analysis for {date}:\n\n$AAPL: Twitter sentiment 75% bullish, StockTwits 80% bullish. Retail investors very optimistic.\n\n$NVDA: Reddit mentions up 200%, mostly positive. AI hype driving sentiment.",
                    "author": "sentiment_bot",
                    "channel": "social-sentiment",
                    "charts": [],
                    "created_at": f"{date}T11:00:00Z",
                    "edited_at": None
                }
            
            if i == 0:  # News coach for today only
                plans[date]["coach_n"] = {
                    "id": i * 4 + 4,
                    "coach_name": "coach_n",
                    "date": date,
                    "plan": f"News Analysis for {date}:\n\n$AAPL: New iPhone sales exceeding expectations. Analyst upgrades from 3 firms.\n\n$TSLA: Cybertruck production ramping up. Musk announces new factory in Texas.",
                    "author": "news_curator",
                    "channel": "market-news",
                    "charts": [],
                    "created_at": f"{date}T08:00:00Z",
                    "edited_at": None
                }
        
        return plans
    
    def get_plans_by_date(self, date: str):
        """Get plans for a specific date"""
        return self.plans.get(date, {})


async def test_coach_plans_resource():
    """Test the coach_plans resource"""
    
    print("=" * 60)
    print("Testing coach_plans resource")
    print("=" * 60)
    
    # Create mock storage
    storage = MockStorageManager()
    
    # Create resource
    print("\nCreating coach_plans resource...")
    resource = CoachPlansResource(storage)
    
    # Get resource definition
    resource_def = resource.get_resource_definition()
    print(f"\nResource Definition:")
    print(f"  URI Template: {resource_def.uri_template}")
    print(f"  Name: {resource_def.name}")
    print(f"  Description: {resource_def.description}")
    print(f"  MIME Type: {resource_def.mime_type}")
    
    # Test scenarios
    scenarios = [
        {
            "name": "All plans (last 7 days)",
            "ticker": None,
            "days": 7
        },
        {
            "name": "AAPL plans (last 7 days)",
            "ticker": "AAPL",
            "days": 7
        },
        {
            "name": "TSLA plans (last 7 days)",
            "ticker": "TSLA",
            "days": 7
        },
        {
            "name": "NVDA plans (last 7 days)",
            "ticker": "NVDA",
            "days": 7
        },
        {
            "name": "All plans (last 30 days)",
            "ticker": None,
            "days": 30
        }
    ]
    
    for scenario in scenarios:
        print(f"\n{'=' * 60}")
        print(f"Scenario: {scenario['name']}")
        print(f"{'=' * 60}")
        print(f"Ticker: {scenario['ticker'] or 'All'}")
        print(f"Days: {scenario['days']}")
        print()
        
        try:
            result = await resource.read(
                ticker=scenario['ticker'],
                days=scenario['days']
            )
            
            if result.success:
                print("✓ Resource read completed!")
                
                data = result.data
                print(f"\nDate Range: {data['date_range']['start']} to {data['date_range']['end']}")
                print(f"Total Plans: {data['total_plans']}")
                
                if data['total_plans'] > 0:
                    print(f"\nCoach Breakdown:")
                    for coach_data in data['plans']:
                        coach_name = coach_data['coach']
                        plan_count = coach_data['plan_count']
                        latest = coach_data['latest_plan']
                        
                        print(f"\n  {coach_name}:")
                        print(f"    Plans: {plan_count}")
                        if latest:
                            print(f"    Latest Date: {latest['date']}")
                            print(f"    Author: {latest['author']}")
                            print(f"    Preview: {latest['plan'][:100]}...")
                            if latest.get('charts'):
                                print(f"    Charts: {len(latest['charts'])}")
                else:
                    print(f"\n  {data.get('message', 'No plans found')}")
                
            else:
                print("✗ Resource read failed!")
                print(f"Error: {result.error}")
                
        except Exception as e:
            print(f"✗ Exception occurred: {e}")
            import traceback
            traceback.print_exc()
    
    print(f"\n{'=' * 60}")
    print("All tests completed")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    asyncio.run(test_coach_plans_resource())
