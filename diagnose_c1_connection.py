#!/usr/bin/env python3
"""
Diagnose C1 MCP connection issues
"""

import requests
import json
import time

def test_mcp_server_health():
    """Test if MCP server is responding correctly"""
    print("🔍 Testing MCP Server Health...")
    
    try:
        # Test basic connection
        response = requests.get("http://localhost:8000", timeout=5)
        print(f"✅ MCP Server Status: {response.status_code}")
        
        # Check response content
        content = response.text[:200] + "..." if len(response.text) > 200 else response.text
        print(f"📄 Response Preview: {content}")
        
        # Test if it's MCP compliant
        if "MCP" in response.text or "protocol" in response.text.lower():
            print("✅ MCP Protocol detected")
        else:
            print("⚠️  Server responding but may not be MCP compliant")
            
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ MCP Server not responding on port 8000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_mcp_endpoints():
    """Test specific MCP endpoints"""
    print("\n🔍 Testing MCP Endpoints...")
    
    endpoints = [
        "/",
        "/mcp",
        "/mcp/stream",
        "/health",
        "/tools"
    ]
    
    for endpoint in endpoints:
        try:
            url = f"http://localhost:8000{endpoint}"
            response = requests.get(url, timeout=3)
            print(f"✅ {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: {str(e)[:50]}...")

def check_port_conflicts():
    """Check if port 8000 is being used by multiple processes"""
    print("\n🔍 Checking Port Usage...")
    
    import subprocess
    try:
        # Windows command to check port usage
        result = subprocess.run(['netstat', '-ano'], capture_output=True, text=True)
        lines = result.stdout.split('\n')
        
        port_8000_processes = []
        for line in lines:
            if ':8000' in line and 'LISTENING' in line:
                port_8000_processes.append(line.strip())
        
        if port_8000_processes:
            print(f"✅ Found {len(port_8000_processes)} process(es) on port 8000:")
            for proc in port_8000_processes:
                print(f"   {proc}")
        else:
            print("❌ No processes found listening on port 8000")
            
    except Exception as e:
        print(f"⚠️  Could not check port usage: {e}")

def test_c1_connection_requirements():
    """Test what C1 specifically needs"""
    print("\n🔍 Testing C1 Connection Requirements...")
    
    # Test CORS headers
    try:
        response = requests.options("http://localhost:8000", timeout=3)
        print(f"✅ OPTIONS request: {response.status_code}")
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        }
        
        print("📋 CORS Headers:")
        for header, value in cors_headers.items():
            if value:
                print(f"   ✅ {header}: {value}")
            else:
                print(f"   ❌ {header}: Missing")
                
    except Exception as e:
        print(f"❌ CORS test failed: {e}")

def provide_solutions():
    """Provide solutions based on test results"""
    print("\n💡 SOLUTIONS:")
    print("=" * 50)
    
    print("\n1. If MCP server is not running:")
    print("   python mcp_http_server_v2.py")
    
    print("\n2. If server is running but C1 can't connect:")
    print("   - Check if C1 is using the correct URL: http://localhost:8000")
    print("   - Verify transport type is set to 'SSE' in C1")
    print("   - Try removing and re-adding the MCP server in C1")
    
    print("\n3. If CORS issues:")
    print("   - The server may need CORS headers for browser connections")
    print("   - C1 runs in browser and needs proper CORS configuration")
    
    print("\n4. If port conflicts:")
    print("   - Stop other processes using port 8000")
    print("   - Or change MCP server to use different port")
    
    print("\n5. Quick fixes to try:")
    print("   - Restart MCP server: Ctrl+C then python mcp_http_server_v2.py")
    print("   - Refresh C1 page in browser")
    print("   - Check browser console for detailed error messages")

def main():
    """Run all diagnostic tests"""
    print("🚀 C1 MCP Connection Diagnostics")
    print("=" * 50)
    
    # Run tests
    server_ok = test_mcp_server_health()
    
    if server_ok:
        test_mcp_endpoints()
        test_c1_connection_requirements()
    
    check_port_conflicts()
    provide_solutions()
    
    # Summary
    print("\n📊 SUMMARY:")
    print("=" * 50)
    if server_ok:
        print("✅ MCP Server is running")
        print("🔧 Issue is likely with C1 connection configuration")
        print("💡 Try the solutions above, especially #2 and #5")
    else:
        print("❌ MCP Server is not running or not accessible")
        print("🔧 Start the server first: python mcp_http_server_v2.py")

if __name__ == "__main__":
    main()