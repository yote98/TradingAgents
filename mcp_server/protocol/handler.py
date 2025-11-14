"""
MCP protocol handler implementation
"""

import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class MCPRequest:
    """MCP request message"""
    jsonrpc: str
    id: Any
    method: str
    params: Dict[str, Any]
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "MCPRequest":
        """Create request from dictionary"""
        return cls(
            jsonrpc=data.get("jsonrpc", "2.0"),
            id=data.get("id"),
            method=data["method"],
            params=data.get("params", {})
        )


@dataclass
class MCPResponse:
    """MCP response message"""
    jsonrpc: str
    id: Any
    result: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert response to dictionary"""
        response = {
            "jsonrpc": self.jsonrpc,
            "id": self.id
        }
        
        if self.error is not None:
            response["error"] = self.error
        else:
            response["result"] = self.result
            
        return response


class MCPProtocolHandler:
    """Handles MCP protocol messages"""
    
    def __init__(self):
        """Initialize protocol handler"""
        self.supported_methods = [
            "initialize",
            "tools/list",
            "tools/call",
            "resources/list",
            "resources/read",
            "ping"
        ]
        logger.info("MCP Protocol Handler initialized")
    
    def validate_request(self, request: MCPRequest) -> Optional[Dict[str, Any]]:
        """
        Validate MCP request
        
        Args:
            request: MCP request to validate
            
        Returns:
            Error dict if invalid, None if valid
        """
        # Check JSON-RPC version
        if request.jsonrpc != "2.0":
            return {
                "code": -32600,
                "message": "Invalid Request: JSON-RPC version must be 2.0"
            }
        
        # Check method is supported
        if request.method not in self.supported_methods:
            return {
                "code": -32601,
                "message": f"Method not found: {request.method}"
            }
        
        return None
    
    def create_success_response(
        self,
        request_id: Any,
        result: Dict[str, Any]
    ) -> MCPResponse:
        """
        Create success response
        
        Args:
            request_id: Request ID
            result: Result data
            
        Returns:
            MCP response
        """
        return MCPResponse(
            jsonrpc="2.0",
            id=request_id,
            result=result
        )
    
    def create_error_response(
        self,
        request_id: Any,
        code: int,
        message: str,
        data: Optional[Dict[str, Any]] = None
    ) -> MCPResponse:
        """
        Create error response
        
        Args:
            request_id: Request ID
            code: Error code
            message: Error message
            data: Optional error data
            
        Returns:
            MCP response
        """
        error = {
            "code": code,
            "message": message
        }
        
        if data is not None:
            error["data"] = data
        
        return MCPResponse(
            jsonrpc="2.0",
            id=request_id,
            error=error
        )
    
    def handle_initialize(self, request: MCPRequest) -> MCPResponse:
        """Handle initialize request"""
        return self.create_success_response(
            request.id,
            {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {},
                    "resources": {}
                },
                "serverInfo": {
                    "name": "tradingagents-mcp-server",
                    "version": "0.1.0"
                }
            }
        )
    
    def handle_ping(self, request: MCPRequest) -> MCPResponse:
        """Handle ping request"""
        return self.create_success_response(
            request.id,
            {}
        )
