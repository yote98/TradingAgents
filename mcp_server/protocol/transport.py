"""
MCP transport layer implementation
"""

import asyncio
import json
import logging
import sys
from typing import Optional, Callable, Dict, Any

logger = logging.getLogger(__name__)


class StdioTransport:
    """
    Standard input/output transport for MCP
    
    This is the primary transport used by C1 and other MCP clients.
    Reads JSON-RPC messages from stdin and writes responses to stdout.
    """
    
    def __init__(self, message_handler: Callable):
        """
        Initialize stdio transport
        
        Args:
            message_handler: Async function to handle incoming messages
        """
        self.message_handler = message_handler
        self._running = False
        logger.info("Stdio transport initialized")
    
    async def start(self) -> None:
        """Start the transport and begin processing messages"""
        self._running = True
        logger.info("Stdio transport started")
        
        try:
            while self._running:
                # Read line from stdin
                line = await asyncio.get_event_loop().run_in_executor(
                    None,
                    sys.stdin.readline
                )
                
                if not line:
                    # EOF reached
                    logger.info("EOF reached, stopping transport")
                    break
                
                line = line.strip()
                if not line:
                    continue
                
                try:
                    # Parse JSON message
                    message = json.loads(line)
                    logger.debug(f"Received message: {message.get('method', 'unknown')}")
                    
                    # Handle message
                    response = await self.message_handler(message)
                    
                    # Send response
                    if response is not None:
                        await self.send_message(response)
                        
                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON received: {e}")
                    # Send parse error response
                    error_response = {
                        "jsonrpc": "2.0",
                        "id": None,
                        "error": {
                            "code": -32700,
                            "message": "Parse error"
                        }
                    }
                    await self.send_message(error_response)
                    
                except Exception as e:
                    logger.error(f"Error handling message: {e}", exc_info=True)
                    # Send internal error response
                    error_response = {
                        "jsonrpc": "2.0",
                        "id": None,
                        "error": {
                            "code": -32603,
                            "message": "Internal error"
                        }
                    }
                    await self.send_message(error_response)
                    
        except KeyboardInterrupt:
            logger.info("Transport interrupted by user")
        except Exception as e:
            logger.error(f"Transport error: {e}", exc_info=True)
        finally:
            await self.stop()
    
    async def send_message(self, message: Dict[str, Any]) -> None:
        """
        Send message to stdout
        
        Args:
            message: Message dictionary to send
        """
        try:
            # Convert to JSON and write to stdout
            json_str = json.dumps(message)
            print(json_str, flush=True)
            logger.debug(f"Sent response for request {message.get('id')}")
        except Exception as e:
            logger.error(f"Error sending message: {e}", exc_info=True)
    
    async def stop(self) -> None:
        """Stop the transport"""
        self._running = False
        logger.info("Stdio transport stopped")


class SSETransport:
    """
    Server-Sent Events transport for MCP
    
    This transport is useful for web-based clients.
    Not implemented in MVP but structure is here for future use.
    """
    
    def __init__(self, message_handler: Callable, host: str = "localhost", port: int = 3000):
        """
        Initialize SSE transport
        
        Args:
            message_handler: Async function to handle incoming messages
            host: Host to bind to
            port: Port to bind to
        """
        self.message_handler = message_handler
        self.host = host
        self.port = port
        self._running = False
        logger.info(f"SSE transport initialized on {host}:{port}")
    
    async def start(self) -> None:
        """Start the SSE transport"""
        # TODO: Implement SSE transport for web clients
        raise NotImplementedError("SSE transport not yet implemented")
    
    async def stop(self) -> None:
        """Stop the SSE transport"""
        self._running = False
        logger.info("SSE transport stopped")
