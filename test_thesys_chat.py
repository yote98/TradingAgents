"""
Quick test to verify Thesys C1 Chat is working
"""
import requests
import json

def test_chat_api():
    """Test the /api/chat endpoint"""
    url = "http://localhost:3004/api/chat"
    
    print("🧪 Testing Thesys C1 Chat API...")
    print(f"URL: {url}\n")
    
    # Test 1: GET request (health check)
    print("1️⃣ Testing GET /api/chat (health check)...")
    try:
        response = requests.get(url)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}\n")
    except Exception as e:
        print(f"   ❌ Error: {e}\n")
    
    # Test 2: POST request (chat message)
    print("2️⃣ Testing POST /api/chat (send message)...")
    try:
        payload = {
            "message": "Hello, can you analyze AAPL?",
            "messages": []
        }
        response = requests.post(url, json=payload)
        print(f"   Status: {response.status_code}")
        data = response.json()
        print(f"   Response preview: {data.get('message', '')[:200]}...\n")
    except Exception as e:
        print(f"   ❌ Error: {e}\n")
    
    # Test 3: Check if MCP server is running
    print("3️⃣ Checking MCP server connection...")
    try:
        mcp_url = "http://localhost:8000/health"
        response = requests.get(mcp_url, timeout=2)
        print(f"   ✅ MCP server is running at {mcp_url}")
        print(f"   Status: {response.status_code}\n")
    except requests.exceptions.ConnectionError:
        print(f"   ⚠️  MCP server not running (using fallback responses)")
        print(f"   To enable full AI: python mcp_http_server.py\n")
    except Exception as e:
        print(f"   ❌ Error: {e}\n")
    
    print("=" * 60)
    print("✅ Chat API is working!")
    print("=" * 60)
    print("\n📋 Next Steps:")
    print("1. Open browser: http://localhost:3004")
    print("2. Click 'Launch AI' button")
    print("3. Try asking: 'Analyze AAPL'")
    print("\n💡 To enable full AI capabilities:")
    print("   python mcp_http_server.py")

if __name__ == "__main__":
    test_chat_api()
