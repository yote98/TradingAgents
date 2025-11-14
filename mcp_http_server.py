"""
HTTP/SSE wrapper for TradingAgents MCP Server
Allows C1 Playground to access MCP tools via HTTP
"""
import json
import asyncio
from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from mcp_server.server import MCPServer
from mcp_server.config.settings import ServerConfig

app = Flask(__name__)
CORS(app)  # Enable CORS for C1 Playground

# Initialize MCP server
config = ServerConfig.from_env()
mcp_server = MCPServer(config)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "TradingAgents MCP Server"})

@app.route('/mcp/tools', methods=['GET'])
def list_tools():
    """List available MCP tools"""
    tools = [
        {
            "name": "analyze_stock",
            "description": "Run comprehensive stock analysis using TradingAgents multi-agent system",
            "parameters": {
                "ticker": "Stock ticker symbol (e.g., AAPL, TSLA)",
                "max_debate_rounds": "Number of debate rounds (default: 1)"
            }
        },
        {
            "name": "backtest_strategy",
            "description": "Run backtesting on a trading strategy",
            "parameters": {
                "ticker": "Stock ticker symbol",
                "start_date": "Start date (YYYY-MM-DD)",
                "end_date": "End date (YYYY-MM-DD)",
                "initial_capital": "Starting capital (default: 100000)"
            }
        },
        {
            "name": "calculate_risk",
            "description": "Calculate risk metrics for a position",
            "parameters": {
                "ticker": "Stock ticker symbol",
                "position_size": "Number of shares",
                "entry_price": "Entry price per share"
            }
        },
        {
            "name": "get_sentiment",
            "description": "Get sentiment analysis from news and social media",
            "parameters": {
                "ticker": "Stock ticker symbol"
            }
        }
    ]
    return jsonify({"tools": tools})

@app.route('/mcp/call', methods=['POST'])
def call_tool():
    """Execute an MCP tool"""
    try:
        data = request.json
        tool_name = data.get('tool')
        arguments = data.get('arguments', {})
        
        if not tool_name:
            return jsonify({"error": "Missing 'tool' parameter"}), 400
        
        # Run the tool asynchronously
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(
                mcp_server.call_tool(tool_name, arguments)
            )
            return jsonify({"result": result})
        finally:
            loop.close()
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/mcp/stream', methods=['POST'])
def stream_tool():
    """Execute an MCP tool with SSE streaming"""
    def generate():
        try:
            data = request.json
            tool_name = data.get('tool')
            arguments = data.get('arguments', {})
            
            if not tool_name:
                yield f"data: {json.dumps({'error': 'Missing tool parameter'})}\n\n"
                return
            
            # Send initial message
            yield f"data: {json.dumps({'status': 'started', 'tool': tool_name})}\n\n"
            
            # Run the tool
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                result = loop.run_until_complete(
                    mcp_server.call_tool(tool_name, arguments)
                )
                
                # Send result
                yield f"data: {json.dumps({'status': 'completed', 'result': result})}\n\n"
                
            except Exception as e:
                yield f"data: {json.dumps({'status': 'error', 'error': str(e)})}\n\n"
            finally:
                loop.close()
                
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')

@app.route('/mcp/resources', methods=['GET'])
def list_resources():
    """List available MCP resources"""
    resources = [
        {
            "uri": "coach://plans",
            "name": "Coach Plans",
            "description": "Access historical coach trading plans from Discord"
        }
    ]
    return jsonify({"resources": resources})

@app.route('/mcp/resource', methods=['POST'])
def get_resource():
    """Get an MCP resource"""
    try:
        data = request.json
        uri = data.get('uri')
        
        if not uri:
            return jsonify({"error": "Missing 'uri' parameter"}), 400
        
        # Run the resource fetch asynchronously
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(
                mcp_server.read_resource(uri)
            )
            return jsonify({"result": result})
        finally:
            loop.close()
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("TradingAgents MCP HTTP Server")
    print("=" * 60)
    print(f"Server running on: http://localhost:8000")
    print(f"Health check: http://localhost:8000/health")
    print(f"List tools: http://localhost:8000/mcp/tools")
    print()
    print("For C1 Playground, use:")
    print("  URL: http://localhost:8000/mcp/stream")
    print("  Transport: Streamable HTTP")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=8000, debug=False)
