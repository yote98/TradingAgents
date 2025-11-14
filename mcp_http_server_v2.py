"""
MCP-compliant HTTP/SSE server for TradingAgents
Implements the Model Context Protocol for C1 Playground
"""
import json
import asyncio
from flask import Flask, request, Response
from flask_cors import CORS
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from mcp_server.server import MCPServer
from mcp_server.config.settings import ServerConfig

app = Flask(__name__)
CORS(app)

# Initialize MCP server
config = ServerConfig.from_env()
mcp_server = MCPServer(config)

def create_jsonrpc_response(id, result=None, error=None):
    """Create a JSON-RPC 2.0 response"""
    response = {"jsonrpc": "2.0", "id": id}
    if error:
        response["error"] = error
    else:
        response["result"] = result
    return response

def create_jsonrpc_error(code, message, data=None):
    """Create a JSON-RPC 2.0 error object"""
    error = {"code": code, "message": message}
    if data:
        error["data"] = data
    return error

@app.route('/sse', methods=['GET', 'POST'])
@app.route('/mcp', methods=['GET', 'POST'])
@app.route('/', methods=['GET', 'POST'])
def mcp_endpoint():
    """Main MCP endpoint with SSE support"""
    
    if request.method == 'GET':
        # SSE connection
        def generate():
            # Send initial connection message
            init_msg = create_jsonrpc_response(
                None,
                result={"protocolVersion": "2024-11-05", "serverInfo": {
                    "name": "TradingAgents",
                    "version": "1.0.0"
                }}
            )
            yield f"data: {json.dumps(init_msg)}\n\n"
            
            # Keep connection alive
            import time
            while True:
                yield f": keepalive\n\n"
                time.sleep(30)
        
        return Response(generate(), mimetype='text/event-stream')
    
    # POST request - handle JSON-RPC
    try:
        data = request.json
        method = data.get('method')
        params = data.get('params', {})
        req_id = data.get('id')
        
        if method == 'initialize':
            result = {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {},
                    "resources": {}
                },
                "serverInfo": {
                    "name": "TradingAgents",
                    "version": "1.0.0"
                }
            }
            return create_jsonrpc_response(req_id, result=result)
        
        elif method == 'tools/list':
            tools = [
                {
                    "name": "analyze_stock",
                    "description": "Run comprehensive stock analysis using TradingAgents multi-agent system",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "ticker": {
                                "type": "string",
                                "description": "Stock ticker symbol (e.g., AAPL, TSLA)"
                            },
                            "max_debate_rounds": {
                                "type": "integer",
                                "description": "Number of debate rounds",
                                "default": 1
                            }
                        },
                        "required": ["ticker"]
                    }
                },
                {
                    "name": "backtest_strategy",
                    "description": "Run backtesting on a trading strategy",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "ticker": {"type": "string"},
                            "start_date": {"type": "string"},
                            "end_date": {"type": "string"},
                            "initial_capital": {"type": "number", "default": 100000}
                        },
                        "required": ["ticker", "start_date", "end_date"]
                    }
                },
                {
                    "name": "calculate_risk",
                    "description": "Calculate risk metrics for a position",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "ticker": {"type": "string"},
                            "position_size": {"type": "number"},
                            "entry_price": {"type": "number"}
                        },
                        "required": ["ticker", "position_size", "entry_price"]
                    }
                },
                {
                    "name": "get_sentiment",
                    "description": "Get sentiment analysis from news and social media",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "ticker": {"type": "string"}
                        },
                        "required": ["ticker"]
                    }
                }
            ]
            return create_jsonrpc_response(req_id, result={"tools": tools})
        
        elif method == 'tools/call':
            tool_name = params.get('name')
            arguments = params.get('arguments', {})
            
            # Run the tool
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                result = loop.run_until_complete(
                    mcp_server.call_tool(tool_name, arguments)
                )
                return create_jsonrpc_response(req_id, result={"content": [
                    {"type": "text", "text": json.dumps(result, indent=2)}
                ]})
            finally:
                loop.close()
        
        elif method == 'resources/list':
            resources = [
                {
                    "uri": "coach://plans",
                    "name": "Coach Plans",
                    "description": "Historical coach trading plans from Discord",
                    "mimeType": "application/json"
                }
            ]
            return create_jsonrpc_response(req_id, result={"resources": resources})
        
        elif method == 'resources/read':
            uri = params.get('uri')
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                result = loop.run_until_complete(
                    mcp_server.read_resource(uri)
                )
                return create_jsonrpc_response(req_id, result={"contents": [
                    {"uri": uri, "mimeType": "application/json", "text": json.dumps(result)}
                ]})
            finally:
                loop.close()
        
        else:
            error = create_jsonrpc_error(-32601, f"Method not found: {method}")
            return create_jsonrpc_response(req_id, error=error)
            
    except Exception as e:
        error = create_jsonrpc_error(-32603, "Internal error", str(e))
        return create_jsonrpc_response(req_id, error=error)

if __name__ == '__main__':
    print("=" * 60)
    print("TradingAgents MCP Server (Protocol-Compliant)")
    print("=" * 60)
    print(f"Server running on: http://localhost:8000")
    print()
    print("For C1 Playground, use:")
    print("  URL: http://localhost:8000")
    print("  Transport: SSE")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=8000, debug=False, threaded=True)
