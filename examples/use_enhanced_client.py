"""
Example: Using the Enhanced Webhook Client in TradingAgents

This shows how coach agents can fetch plans from the Discord bot server.
"""

import sys
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from tradingagents.integrations.discord_enhanced import create_client


def main():
    """Demonstrate enhanced webhook client usage."""
    
    # Create client (points to Discord bot server API)
    client = create_client(api_base_url="http://localhost:5000")
    
    print("=" * 60)
    print("Enhanced Webhook Client Demo")
    print("=" * 60)
    
    # Check server health
    print("\n1. Checking server health...")
    health = client.check_health()
    print(f"   Status: {health.get('status', 'unknown')}")
    if 'components' in health:
        print(f"   Database: {health['components']['database']['status']}")
        print(f"   Bot: {health['components']['discord_bot']['status']}")
    
    # Fetch plan for coach d (day trading)
    print("\n2. Fetching plan for Coach D (Day Trading)...")
    plan_d = client.fetch_coach_plan('d')
    print(f"   Plan: {plan_d['plan'][:100]}...")
    print(f"   Charts: {len(plan_d.get('charts', []))} attached")
    
    # Fetch plan for coach i (intraday)
    print("\n3. Fetching plan for Coach I (Intraday)...")
    plan_i = client.fetch_coach_plan('i')
    print(f"   Plan: {plan_i['plan'][:100]}...")
    
    # Fetch all plans for today
    print("\n4. Fetching all plans for today...")
    all_plans = client.fetch_all_coach_plans()
    print(f"   Found plans for {len(all_plans)} coaches")
    for coach_name in all_plans.keys():
        print(f"   - {coach_name}")
    
    # Fetch plan for specific date
    print("\n5. Fetching plan for specific date (2024-01-15)...")
    historical_plan = client.fetch_coach_plan('d', date='2024-01-15')
    print(f"   Plan: {historical_plan['plan'][:100]}...")
    
    # Get client metrics
    print("\n6. Client metrics...")
    metrics = client.get_metrics()
    print(f"   Total requests: {metrics['requests']['total']}")
    print(f"   Cache hits: {metrics['requests']['cache_hits']}")
    print(f"   Cache misses: {metrics['requests']['cache_misses']}")
    print(f"   Cache hit rate: {metrics['requests']['cache_hit_rate_percent']}%")
    print(f"   Cache size: {metrics['cache']['size']}/{metrics['cache']['max_size']}")
    
    # Get server metrics
    print("\n7. Server metrics...")
    server_metrics = client.get_server_metrics()
    if 'error' not in server_metrics:
        print(f"   Uptime: {server_metrics.get('uptime_seconds', 0):.0f}s")
        print(f"   Total plans: {server_metrics['database']['total_plans']}")
        print(f"   Total charts: {server_metrics['database']['total_charts']}")
    
    # Demonstrate caching (second fetch should be instant)
    print("\n8. Testing cache (fetching same plan again)...")
    import time
    start = time.time()
    cached_plan = client.fetch_coach_plan('d')
    elapsed = time.time() - start
    print(f"   Fetch time: {elapsed*1000:.1f}ms (cached)")
    
    print("\n" + "=" * 60)
    print("Demo complete!")
    print("=" * 60)


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\nError: {e}")
        print("\nMake sure the Discord bot server is running:")
        print("  python examples/discord_bot_server_enhanced.py")
        sys.exit(1)
