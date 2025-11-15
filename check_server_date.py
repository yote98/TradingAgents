"""
Quick script to check what date the server thinks it is
"""
from datetime import datetime
import pytz

print("=" * 60)
print("Server Date/Time Check")
print("=" * 60)

# UTC time
utc_now = datetime.now(pytz.UTC)
print(f"UTC Time: {utc_now}")
print(f"UTC Date: {utc_now.strftime('%Y-%m-%d')}")

# Local time
local_now = datetime.now()
print(f"\nLocal Time: {local_now}")
print(f"Local Date: {local_now.strftime('%Y-%m-%d')}")

# What MarketData.app might see
print(f"\nFormatted for APIs:")
print(f"  YYYY-MM-DD: {local_now.strftime('%Y-%m-%d')}")
print(f"  ISO 8601: {local_now.isoformat()}")

print("=" * 60)
