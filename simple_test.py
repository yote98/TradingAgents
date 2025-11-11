"""Simple test to diagnose import issues."""

import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

print("Testing imports step by step...\n")

# Test 1: Basic imports
print("1. Testing basic Python imports...")
try:
    import os
    import json
    from datetime import datetime
    print("   ✓ Basic imports work")
except Exception as e:
    print(f"   ✗ Basic imports failed: {e}")
    sys.exit(1)

# Test 2: Third-party dependencies
print("\n2. Testing third-party dependencies...")
deps = ['discord', 'flask', 'flask_cors', 'requests']
for dep in deps:
    try:
        __import__(dep)
        print(f"   ✓ {dep}")
    except ImportError as e:
        print(f"   ✗ {dep} - NOT INSTALLED")
        print(f"      Install with: pip install {dep.replace('_', '-')}")

# Test 3: Our modules
print("\n3. Testing our modules...")
modules = [
    ('config', 'tradingagents.integrations.discord_enhanced.config'),
    ('storage', 'tradingagents.integrations.discord_enhanced.storage'),
    ('service', 'tradingagents.integrations.discord_enhanced.service'),
]

for name, module_path in modules:
    try:
        __import__(module_path)
        print(f"   ✓ {name}")
    except Exception as e:
        print(f"   ✗ {name}")
        print(f"      Error: {e}")
        import traceback
        traceback.print_exc()

print("\n4. Testing database...")
try:
    from tradingagents.integrations.discord_enhanced import StorageManager
    test_db = './test_simple.db'
    storage = StorageManager(test_db)
    print("   ✓ Database works")
    
    # Cleanup
    import os
    if os.path.exists(test_db):
        os.remove(test_db)
except Exception as e:
    print(f"   ✗ Database failed: {e}")
    import traceback
    traceback.print_exc()

print("\nDone!")
