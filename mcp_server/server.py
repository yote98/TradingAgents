"""
Main MCP Server implementation
"""

import asyncio
import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
import sys
import json

from .protocol.handler import MCPProtocolHandler, MCPRequest, MCPResponse
from .protocol.transport import StdioTransport, SSETransport

logger = logging.getLogger(__name__)


@dataclass
class Tool:
    """MCP tool definition"""
    name: str
    description: str
    input_schema: Dict[str, Any]
    handler: Any  # Callable


@dataclass
class Resource:
    """MCP resource definition"""
    uri_template: str
    name: str
    description: str
    mime_type: str
    handler: Any  # Callable


class MCPServer:
    """Main MCP server implementation"""
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize MCP server
        
        Args:
            config: Server configuration dictionary
        """
        self.config = config or {}
        self.tools: Dict[str, Tool] = {}
        self.resources: Dict[str, Resource] = {}
        self._running = False
        self.protocol_handler = MCPProtocolHandler()
        self.transport = None
        
        logger.info("MCP Server initialized")
    
    async def register_tool(self, tool: Tool) -> None:
        """
        Register a tool with the server
        
        Args:
            tool: Tool to register
        """
        self.tools[tool.name] = tool
        logger.info(f"Registered tool: {tool.name}")
    
    async def register_resource(self, resource: Resource) -> None:
        """
        Register a resource with the server
        
        Args:
            resource: Resource to register
        """
        self.resources[resource.name] = resource
        logger.info(f"Registered resource: {resource.name} ({resource.uri_template})")
    
    async def handle_request(self, request_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle incoming MCP request
        
        Args:
            request_dict: MCP request message dictionary
            
        Returns:
            MCP response message dictionary
        """
        try:
            # Parse request
            request = MCPRequest.from_dict(request_dict)
            
            # Validate request
            error = self.protocol_handler.validate_request(request)
            if error:
                response = self.protocol_handler.create_error_response(
                    request.id,
                    error["code"],
                    error["message"]
                )
                return response.to_dict()
            
            # Handle different methods
            if request.method == "initialize":
                response = self.protocol_handler.handle_initialize(request)
            elif request.method == "ping":
                response = self.protocol_handler.handle_ping(request)
            elif request.method == "tools/list":
                response = await self._handle_list_tools(request)
            elif request.method == "tools/call":
                response = await self._handle_call_tool(request)
            elif request.method == "resources/list":
                response = await self._handle_list_resources(request)
            elif request.method == "resources/read":
                response = await self._handle_read_resource(request)
            else:
                response = self.protocol_handler.create_error_response(
                    request.id,
                    -32601,
                    f"Method not found: {request.method}"
                )
            
            return response.to_dict()
            
        except Exception as e:
            logger.error(f"Error handling request: {e}", exc_info=True)
            response = self.protocol_handler.create_error_response(
                request_dict.get("id"),
                -32603,
                "Internal error"
            )
            return response.to_dict()
    
    async def _handle_list_tools(self, request: MCPRequest) -> MCPResponse:
        """Handle tools/list request"""
        tools_list = [
            {
                "name": tool.name,
                "description": tool.description,
                "inputSchema": tool.input_schema
            }
            for tool in self.tools.values()
        ]
        
        return self.protocol_handler.create_success_response(
            request.id,
            {"tools": tools_list}
        )
    
    async def _handle_call_tool(self, request: MCPRequest) -> MCPResponse:
        """Handle tools/call request"""
        tool_name = request.params.get("name")
        arguments = request.params.get("arguments", {})
        
        if tool_name not in self.tools:
            return self.protocol_handler.create_error_response(
                request.id,
                -32602,
                f"Tool not found: {tool_name}"
            )
        
        tool = self.tools[tool_name]
        
        try:
            # Call the tool handler
            result = await tool.handler(**arguments)
            
            # Handle ToolResult objects
            if hasattr(result, 'success'):
                if result.success:
                    return self.protocol_handler.create_success_response(
                        request.id,
                        {
                            "content": [
                                {
                                    "type": "text",
                                    "text": json.dumps(result.data, indent=2)
                                }
                            ]
                        }
                    )
                else:
                    error = result.error or {}
                    return self.protocol_handler.create_error_response(
                        request.id,
                        error.get("code", -32603),
                        error.get("message", "Tool execution failed")
                    )
            else:
                # Handle plain dict results
                return self.protocol_handler.create_success_response(
                    request.id,
                    {
                        "content": [
                            {
                                "type": "text",
                                "text": json.dumps(result, indent=2)
                            }
                        ]
                    }
                )
        except Exception as e:
            logger.error(f"Error calling tool {tool_name}: {e}", exc_info=True)
            return self.protocol_handler.create_error_response(
                request.id,
                -32603,
                str(e)
            )
    
    async def _handle_list_resources(self, request: MCPRequest) -> MCPResponse:
        """Handle resources/list request"""
        resources_list = [
            {
                "uriTemplate": resource.uri_template,
                "name": resource.name,
                "description": resource.description,
                "mimeType": resource.mime_type
            }
            for resource in self.resources.values()
        ]
        
        return self.protocol_handler.create_success_response(
            request.id,
            {"resources": resources_list}
        )
    
    async def _handle_read_resource(self, request: MCPRequest) -> MCPResponse:
        """Handle resources/read request"""
        uri = request.params.get("uri")
        
        # Extract resource name from URI (e.g., "coach://plans/AAPL" -> "coach_plans")
        resource_name = None
        for name, resource in self.resources.items():
            # Simple matching - check if URI starts with template prefix
            template_prefix = resource.uri_template.split("{")[0]
            if uri.startswith(template_prefix):
                resource_name = name
                break
        
        if not resource_name or resource_name not in self.resources:
            return self.protocol_handler.create_error_response(
                request.id,
                -32602,
                f"Resource not found: {uri}"
            )
        
        resource = self.resources[resource_name]
        
        try:
            # Extract parameters from URI (e.g., ticker from "coach://plans/AAPL")
            params = {}
            if "{ticker}" in resource.uri_template:
                # Extract ticker from URI
                parts = uri.split("/")
                if len(parts) > 2:
                    params["ticker"] = parts[-1]
            
            # Call the resource handler
            result = await resource.handler(**params)
            
            # Handle ResourceResult objects
            if hasattr(result, 'success'):
                if result.success:
                    return self.protocol_handler.create_success_response(
                        request.id,
                        {
                            "contents": [
                                {
                                    "uri": uri,
                                    "mimeType": resource.mime_type,
                                    "text": json.dumps(result.data, indent=2)
                                }
                            ]
                        }
                    )
                else:
                    error = result.error or {}
                    return self.protocol_handler.create_error_response(
                        request.id,
                        error.get("code", -32603),
                        error.get("message", "Resource read failed")
                    )
            else:
                # Handle plain dict results
                return self.protocol_handler.create_success_response(
                    request.id,
                    {
                        "contents": [
                            {
                                "uri": uri,
                                "mimeType": resource.mime_type,
                                "text": json.dumps(result, indent=2)
                            }
                        ]
                    }
                )
        except Exception as e:
            logger.error(f"Error reading resource {uri}: {e}", exc_info=True)
            return self.protocol_handler.create_error_response(
                request.id,
                -32603,
                str(e)
            )
    
    async def start(self) -> None:
        """Start the MCP server"""
        self._running = True
        transport_type = self.config.get("transport", "stdio")
        
        logger.info(f"MCP Server starting with {transport_type} transport")
        
        # Print server info to stderr (stdout is for MCP protocol)
        print(f"TradingAgents MCP Server v{self.config.get('version', '0.1.0')}", file=sys.stderr)
        print(f"Registered {len(self.tools)} tools", file=sys.stderr)
        print(f"Registered {len(self.resources)} resources", file=sys.stderr)
        print("Server ready", file=sys.stderr)
        
        # Create and start transport
        if transport_type == "stdio":
            self.transport = StdioTransport(self.handle_request)
        elif transport_type == "sse":
            host = self.config.get("host", "localhost")
            port = self.config.get("port", 3000)
            self.transport = SSETransport(self.handle_request, host, port)
        else:
            raise ValueError(f"Unknown transport type: {transport_type}")
        
        await self.transport.start()
    
    async def stop(self) -> None:
        """Stop the MCP server"""
        self._running = False
        if self.transport:
            await self.transport.stop()
        logger.info("MCP Server stopped")
