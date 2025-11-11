"""Quick test to check if OpenAI API is working"""
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

print("Testing OpenAI API...")
print("Sending a simple request...\n")

try:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Say 'API is working!'"}],
        max_tokens=10
    )
    
    print("✅ SUCCESS!")
    print(f"Response: {response.choices[0].message.content}")
    print("\nYour OpenAI API is working correctly!")
    print("You can now run: python demo_complete_system.py")
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    print("\nPossible issues:")
    print("1. Credits not activated yet (wait 5-10 minutes)")
    print("2. Wrong API key")
    print("3. API key doesn't have access to gpt-4o-mini")
    print("\nCheck your account at: https://platform.openai.com/account/usage")
