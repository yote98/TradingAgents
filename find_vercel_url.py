"""
Find the correct Vercel deployment URL
"""
import subprocess
import re

def find_vercel_url():
    """Find the Vercel URL from git remote"""
    
    try:
        # Get git remote URL
        result = subprocess.run(
            ['git', 'remote', 'get-url', 'origin'],
            capture_output=True,
            text=True
        )
        
        git_url = result.stdout.strip()
        print(f"📦 Git Remote: {git_url}")
        
        # Extract repo name
        match = re.search(r'github\.com[:/]([^/]+)/([^/.]+)', git_url)
        if match:
            username = match.group(1)
            repo = match.group(2)
            print(f"👤 Username: {username}")
            print(f"📁 Repo: {repo}")
            
            # Common Vercel URL patterns
            urls = [
                f"https://{repo}.vercel.app",
                f"https://{repo}-{username}.vercel.app",
                f"https://{repo}-git-main-{username}.vercel.app",
            ]
            
            print("\n🌐 Possible Vercel URLs:")
            for url in urls:
                print(f"  - {url}")
            
            print("\n💡 Check your Vercel dashboard for the exact URL:")
            print("   https://vercel.com/dashboard")
            
            return urls[0]
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    print("=" * 60)
    print("🔍 FINDING VERCEL URL")
    print("=" * 60)
    find_vercel_url()
    print("=" * 60)
