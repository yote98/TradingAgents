"""
Check available Thesys models
"""
import requests

def check_models():
    """Check what models are available"""
    
    # Try to list models
    url = "https://api.thesys.dev/v1/models"
    
    headers = {
        "Authorization": f"Bearer YOUR_THESYS_API_KEY_HERE"
    }
    
    print("🔍 Checking Thesys models...")
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_models()
