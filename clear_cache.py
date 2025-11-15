"""
Clear cached stock data to force fresh fetches
Run this when you see old/incorrect prices (like pre-split data)
"""

import os
import glob
from pathlib import Path

def clear_cache():
    """Clear all cached stock data"""
    
    cache_dir = Path("tradingagents/dataflows/data_cache")
    
    if not cache_dir.exists():
        print(f"❌ Cache directory not found: {cache_dir}")
        return
    
    # Find all CSV files
    csv_files = list(cache_dir.glob("**/*.csv"))
    json_files = list(cache_dir.glob("**/*.json"))
    
    all_files = csv_files + json_files
    
    if not all_files:
        print("✅ No cache files found - cache is already clean!")
        return
    
    print(f"Found {len(all_files)} cached files:")
    for file in all_files:
        print(f"  - {file.name}")
    
    confirm = input("\n⚠️  Delete all these files? (yes/no): ")
    
    if confirm.lower() == "yes":
        deleted = 0
        for file in all_files:
            try:
                file.unlink()
                deleted += 1
            except Exception as e:
                print(f"❌ Error deleting {file.name}: {e}")
        
        print(f"\n✅ Deleted {deleted} cache files!")
        print("Next analysis will fetch fresh data.")
    else:
        print("\n❌ Cancelled - no files deleted")


def clear_specific_stock(symbol):
    """Clear cache for a specific stock"""
    
    cache_dir = Path("tradingagents/dataflows/data_cache")
    
    if not cache_dir.exists():
        print(f"❌ Cache directory not found: {cache_dir}")
        return
    
    # Find files for this symbol
    pattern = f"**/{symbol}*.csv"
    files = list(cache_dir.glob(pattern))
    
    if not files:
        print(f"✅ No cache files found for {symbol}")
        return
    
    print(f"Found {len(files)} cached files for {symbol}:")
    for file in files:
        print(f"  - {file.name}")
        try:
            file.unlink()
            print(f"    ✅ Deleted")
        except Exception as e:
            print(f"    ❌ Error: {e}")
    
    print(f"\n✅ Cleared cache for {symbol}!")


if __name__ == "__main__":
    import sys
    
    print("=" * 60)
    print("TradingAgents Cache Cleaner")
    print("=" * 60)
    
    if len(sys.argv) > 1:
        # Clear specific stock
        symbol = sys.argv[1].upper()
        print(f"\nClearing cache for {symbol}...")
        clear_specific_stock(symbol)
    else:
        # Clear all cache
        print("\nClearing ALL cached data...")
        clear_cache()
    
    print("\n" + "=" * 60)
    print("Done! Next analysis will fetch fresh data.")
    print("=" * 60)
