"""
TradingAgents API Server
Flask API that exposes TradingAgents functionality to the C1 frontend
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
from datetime import datetime

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

app = Flask(__name__)
CORS(app)  # Enable CORS for C1 frontend

# Initialize TradingAgents with optimized config
config = DEFAULT_CONFIG.copy()
config["quick_think_llm"] = "gpt-4o-mini"  # Fast and cheap
config["deep_think_llm"] = "gpt-4o-mini"   # Use same for consistency
config["max_debate_rounds"] = 1             # Quick analysis
config["enable_coaches"] = False            # Disable for speed
config["enable_memory"] = False             # Disable for speed

print("=" * 60)
print("TradingAgents API Server")
print("=" * 60)
print("Initializing TradingAgents...")

try:
    graph = TradingAgentsGraph(config=config)
    print("✅ TradingAgents initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize TradingAgents: {e}")
    graph = None

print("=" * 60)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "tradingagents": "initialized" if graph else "failed",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Analyze a stock using TradingAgents multi-agent system
    
    Request body:
    {
        "ticker": "AAPL",
        "max_debate_rounds": 1
    }
    """
    if not graph:
        return jsonify({
            "error": "TradingAgents not initialized",
            "suggestion": "Check server logs for initialization errors"
        }), 500
    
    try:
        data = request.json
        ticker = data.get('ticker')
        max_debate_rounds = data.get('max_debate_rounds', 1)
        
        if not ticker:
            return jsonify({"error": "ticker is required"}), 400
        
        print(f"\n📊 Analyzing {ticker}...")
        
        # Update config for this request
        request_config = config.copy()
        request_config["max_debate_rounds"] = max_debate_rounds
        
        # Run analysis
        result = graph.run(ticker=ticker, timeframe="1mo")
        
        print(f"✅ Analysis complete for {ticker}")
        
        # Extract key information
        response = {
            "ticker": ticker,
            "final_decision": result.get("final_decision", "No decision available"),
            "market_report": result.get("market_report", "No market data"),
            "fundamentals_report": result.get("fundamentals_report", "No fundamentals data"),
            "news_report": result.get("news_report", "No news data"),
            "social_report": result.get("social_report", "No social data"),
            "research_synthesis": result.get("research_synthesis", "No synthesis available"),
            "market_data": {
                "current_price": result.get("current_price"),
                "timestamp": datetime.now().isoformat()
            },
            "confidence": result.get("confidence", 0),
            "target_price": result.get("target_price"),
            "stop_loss": result.get("stop_loss"),
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Analysis error: {e}")
        return jsonify({
            "error": "Analysis failed",
            "details": str(e)
        }), 500

@app.route('/backtest', methods=['POST'])
def backtest():
    """
    Run backtesting on a trading strategy
    
    Request body:
    {
        "ticker": "AAPL",
        "start_date": "2024-01-01",
        "end_date": "2024-12-01",
        "initial_capital": 100000
    }
    """
    try:
        data = request.json
        ticker = data.get('ticker')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        initial_capital = data.get('initial_capital', 100000)
        
        if not all([ticker, start_date, end_date]):
            return jsonify({"error": "ticker, start_date, and end_date are required"}), 400
        
        print(f"\n📈 Backtesting {ticker} from {start_date} to {end_date}...")
        
        # TODO: Implement actual backtesting
        # For now, return mock data
        response = {
            "ticker": ticker,
            "period": f"{start_date} to {end_date}",
            "initial_capital": initial_capital,
            "final_capital": initial_capital * 1.15,  # Mock 15% return
            "total_return": 15.0,
            "sharpe_ratio": 1.5,
            "max_drawdown": -8.5,
            "win_rate": 65.0,
            "total_trades": 24,
            "note": "Backtesting feature coming soon - this is mock data"
        }
        
        print(f"✅ Backtest complete for {ticker}")
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Backtest error: {e}")
        return jsonify({
            "error": "Backtest failed",
            "details": str(e)
        }), 500

@app.route('/risk', methods=['POST'])
def calculate_risk():
    """
    Calculate risk metrics for a position
    
    Request body:
    {
        "ticker": "AAPL",
        "account_value": 100000,
        "risk_per_trade_pct": 2.0,
        "current_price": 180.50
    }
    """
    try:
        data = request.json
        ticker = data.get('ticker')
        account_value = data.get('account_value')
        risk_per_trade_pct = data.get('risk_per_trade_pct')
        current_price = data.get('current_price')
        
        if not all([ticker, account_value, risk_per_trade_pct, current_price]):
            return jsonify({"error": "All parameters are required"}), 400
        
        print(f"\n🛡️ Calculating risk for {ticker}...")
        
        # Calculate position sizing
        risk_amount = account_value * (risk_per_trade_pct / 100)
        stop_loss_pct = 5.0  # 5% stop loss
        stop_loss_price = current_price * (1 - stop_loss_pct / 100)
        risk_per_share = current_price - stop_loss_price
        position_size = int(risk_amount / risk_per_share) if risk_per_share > 0 else 0
        position_value = position_size * current_price
        
        response = {
            "ticker": ticker,
            "account_value": account_value,
            "risk_per_trade_pct": risk_per_trade_pct,
            "current_price": current_price,
            "recommended_position_size": position_size,
            "position_value": position_value,
            "stop_loss_price": round(stop_loss_price, 2),
            "risk_amount": round(risk_amount, 2),
            "risk_per_share": round(risk_per_share, 2),
            "risk_reward_ratio": 2.0,  # Assuming 2:1 risk/reward
        }
        
        print(f"✅ Risk calculation complete for {ticker}")
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Risk calculation error: {e}")
        return jsonify({
            "error": "Risk calculation failed",
            "details": str(e)
        }), 500

@app.route('/sentiment/<ticker>', methods=['GET'])
def get_sentiment(ticker):
    """
    Get social media sentiment for a stock
    """
    try:
        print(f"\n💬 Getting sentiment for {ticker}...")
        
        # TODO: Implement actual sentiment analysis
        # For now, return mock data
        response = {
            "ticker": ticker,
            "overall_sentiment": "bullish",
            "sentiment_score": 72,
            "sources": {
                "twitter": {"sentiment": "bullish", "score": 75, "volume": 1250},
                "stocktwits": {"sentiment": "bullish", "score": 68, "volume": 890},
                "reddit": {"sentiment": "neutral", "score": 55, "volume": 340}
            },
            "trending_topics": ["earnings", "growth", "AI"],
            "timestamp": datetime.now().isoformat(),
            "note": "Sentiment analysis feature coming soon - this is mock data"
        }
        
        print(f"✅ Sentiment analysis complete for {ticker}")
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Sentiment analysis error: {e}")
        return jsonify({
            "error": "Sentiment analysis failed",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("\n🚀 Starting TradingAgents API Server...")
    print(f"📍 Server will run on port: {port}")
    print("🔗 C1 Frontend should connect to this URL")
    print("\nAvailable endpoints:")
    print("  GET  /health - Health check")
    print("  POST /analyze - Analyze stock")
    print("  POST /backtest - Run backtest")
    print("  POST /risk - Calculate risk")
    print("  GET  /sentiment/<ticker> - Get sentiment")
    print("\n" + "=" * 60 + "\n")
    
    app.run(host='0.0.0.0', port=port, debug=False)
