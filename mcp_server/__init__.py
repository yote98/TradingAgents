"""
TradingAgents MCP Server

A Model Context Protocol server that exposes TradingAgents multi-agent
analysis capabilities to AI assistants like Thesys C1.
"""

__version__ = "0.1.0"
__author__ = "TradingAgents Team"

from .server import MCPServer

__all__ = ["MCPServer"]
