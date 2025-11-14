# Setup Coach N to Read Unusual Whales Signals

## What You Want
Your Unusual Whales bot posts signals to Discord → Coach N reads them → Uses them in analysis

## How It Works

### Current System Architecture
The TradingAgents coach system uses a **Discord Bot** (not webhooks) to:
1. **Listen** to messages in Discord channels
2. Store them in a database
3. Make them available to coaches during analysis

### What You Need

**Option 1: Discord Bot (Recommended)**
- Create a Discord bot
- Add it to your server
- Configure it to listen to the channel where Unusual Whales posts
- Coach N will read those messages

**Option 2: Simple Webhook Listener (Easier)**
- Set up a simple server that receives webhook posts
- Store the messages
- Coach N reads from the storage

## Quick Setup - Option 2 (Easiest)

### Step 1: Create a Webhook Receiver

Your Unusual Whales bot posts to a webhook → Your server receives it → Stores it → Coach N reads it

```python
# webhook_receiver.py
from flask import Flask, request, jsonify
import json
from datetime import datetime
from pathlib import Path

app = Flask(__name__)

# Storage file
SIGNALS_FILE = Path("coach_n_signals.json")

def load_signals():
    """Load existing signals"""
    if SIGNALS_FILE.exists():
        with open(SIGNALS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_signal(signal_data):
    """Save a new signal"""
    signals = load_signals()
    
    # Add timestamp
    signal_data['received_at'] = datetime.now().isoformat()
    
    # Add to list
    signals.append(signal_data)
    
    # Keep only last 100 signals
    signals = signals[-100:]
    
    # Save
    with open(SIGNALS_FILE, 'w') as f:
        json.dump(signals, f, indent=2)

@app.route('/webhook/unusual-whales', methods=['POST'])
def receive_signal():
    """Receive signal from Unusual Whales bot"""
    try:
        data = request.json
        
        # Extract the message content
        signal = {
            'content': data.get('content', ''),
            'embeds': data.get('embeds', []),
            'source': 'unusual_whales'
        }
        
        save_signal(signal)
        
        print(f"✅ Received signal: {signal['content'][:50]}...")
        
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/signals/latest', methods=['GET'])
def get_latest_signals():
    """Get latest signals for Coach N"""
    signals = load_signals()
    return jsonify(signals)

if __name__ == '__main__':
    print("🚀 Starting Unusual Whales Signal Receiver")
    print("   Listening on http://localhost:5001")
    print("   Webhook URL: http://localhost:5001/webhook/unusual-whales")
    app.run(host='0.0.0.0', port=5001, debug=True)
```

### Step 2: Configure Unusual Whales Bot

In your Unusual Whales bot, set the webhook URL to:
```
http://YOUR_SERVER_IP:5001/webhook/unusual-whales
```

### Step 3: Create Coach N Integration

```python
# coach_n_unusual_whales.py
import json
from pathlib import Path
from datetime import datetime, timedelta

def get_unusual_whales_signals(hours=24):
    """
    Get Unusual Whales signals from the last X hours
    
    Args:
        hours: How many hours back to look
        
    Returns:
        List of signals
    """
    signals_file = Path("coach_n_signals.json")
    
    if not signals_file.exists():
        return []
    
    with open(signals_file, 'r') as f:
        all_signals = json.load(f)
    
    # Filter by time
    cutoff = datetime.now() - timedelta(hours=hours)
    recent_signals = []
    
    for signal in all_signals:
        signal_time = datetime.fromisoformat(signal['received_at'])
        if signal_time > cutoff:
            recent_signals.append(signal)
    
    return recent_signals

def format_signals_for_coach_n(ticker):
    """
    Format signals for Coach N to use in analysis
    
    Args:
        ticker: Stock ticker being analyzed
        
    Returns:
        Formatted string for Coach N
    """
    signals = get_unusual_whales_signals(hours=24)
    
    if not signals:
        return "No recent Unusual Whales signals available."
    
    # Filter signals related to this ticker
    relevant_signals = [
        s for s in signals 
        if ticker.upper() in s.get('content', '').upper()
    ]
    
    if not relevant_signals:
        return f"No Unusual Whales signals found for {ticker} in the last 24 hours."
    
    # Format for Coach N
    report = f"📊 Unusual Whales Signals for {ticker}:\n\n"
    
    for i, signal in enumerate(relevant_signals, 1):
        content = signal.get('content', 'No content')
        time = signal.get('received_at', 'Unknown time')
        report += f"{i}. [{time}] {content}\n\n"
    
    return report

# Example usage
if __name__ == "__main__":
    ticker = "AAPL"
    report = format_signals_for_coach_n(ticker)
    print(report)
```

### Step 4: Integrate with Coach N

Modify Coach N to use Unusual Whales signals:

```python
# In your analysis script
from coach_n_unusual_whales import format_signals_for_coach_n

# When running analysis
ticker = "AAPL"
unusual_whales_data = format_signals_for_coach_n(ticker)

# Pass to Coach N
config = {
    "enable_coaches": True,
    "selected_coaches": ["coach_n"],
    "coach_n_data": unusual_whales_data  # Custom data for Coach N
}
```

## Simpler Alternative: Just Use the Webhook You Created!

If your Unusual Whales bot can POST to your webhook, you can:

1. **Set up the receiver** (run `webhook_receiver.py`)
2. **Configure Unusual Whales** to post to `http://your-ip:5001/webhook/unusual-whales`
3. **Coach N reads** from `coach_n_signals.json`

That's it! No Discord bot needed.

## What Do You Want to Do?

1. **Set up the webhook receiver** (I can create the full code)
2. **Use the existing Discord bot system** (more complex but more features)
3. **Something else?**

Let me know and I'll help you set it up! 🚀
