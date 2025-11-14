"""
Server configuration management
"""

import os
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any
from pathlib import Path
import yaml


@dataclass
class ServerConfig:
    """MCP server configuration"""
    
    # Server settings
    host: str = "localhost"
    port: int = 3000
    transport: str = "stdio"
    log_level: str = "INFO"
    version: str = "0.1.0"
    
    # TradingAgents settings
    deep_think_llm: str = "gpt-4o-mini"
    quick_think_llm: str = "gpt-4o-mini"
    max_debate_rounds: int = 1
    
    # API keys
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    alpha_vantage_api_key: Optional[str] = None
    twitter_bearer_token: Optional[str] = None
    
    # Data vendors
    core_stock_apis: List[str] = field(default_factory=lambda: ["yfinance"])
    technical_indicators: List[str] = field(default_factory=lambda: ["yfinance"])
    fundamental_data: List[str] = field(default_factory=lambda: ["yfinance"])
    news_data: List[str] = field(default_factory=lambda: ["yfinance"])
    
    # Caching
    cache_enabled: bool = True
    cache_dir: str = ".cache/mcp"
    cache_ttl_seconds: int = 300
    
    @classmethod
    def from_env(cls) -> "ServerConfig":
        """
        Load configuration from environment variables
        
        Returns:
            ServerConfig instance
        """
        return cls(
            host=os.getenv("MCP_HOST", "localhost"),
            port=int(os.getenv("MCP_PORT", "3000")),
            transport=os.getenv("MCP_TRANSPORT", "stdio"),
            log_level=os.getenv("MCP_LOG_LEVEL", "INFO"),
            
            deep_think_llm=os.getenv("DEEP_THINK_LLM", "gpt-4o-mini"),
            quick_think_llm=os.getenv("QUICK_THINK_LLM", "gpt-4o-mini"),
            max_debate_rounds=int(os.getenv("MAX_DEBATE_ROUNDS", "1")),
            
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
            alpha_vantage_api_key=os.getenv("ALPHA_VANTAGE_API_KEY"),
            twitter_bearer_token=os.getenv("TWITTER_BEARER_TOKEN"),
            
            cache_enabled=os.getenv("CACHE_ENABLED", "true").lower() == "true",
            cache_dir=os.getenv("CACHE_DIR", ".cache/mcp"),
            cache_ttl_seconds=int(os.getenv("CACHE_TTL_SECONDS", "300")),
        )
    
    @classmethod
    def from_file(cls, path: Path) -> "ServerConfig":
        """
        Load configuration from YAML file
        
        Args:
            path: Path to configuration file
            
        Returns:
            ServerConfig instance
        """
        with open(path, 'r') as f:
            data = yaml.safe_load(f)
        
        return cls(**data)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert configuration to dictionary
        
        Returns:
            Configuration as dictionary
        """
        return {
            "host": self.host,
            "port": self.port,
            "transport": self.transport,
            "log_level": self.log_level,
            "version": self.version,
            "deep_think_llm": self.deep_think_llm,
            "quick_think_llm": self.quick_think_llm,
            "max_debate_rounds": self.max_debate_rounds,
            "openai_api_key": self.openai_api_key,
            "anthropic_api_key": self.anthropic_api_key,
            "alpha_vantage_api_key": self.alpha_vantage_api_key,
            "twitter_bearer_token": self.twitter_bearer_token,
            "core_stock_apis": self.core_stock_apis,
            "technical_indicators": self.technical_indicators,
            "fundamental_data": self.fundamental_data,
            "news_data": self.news_data,
            "cache_enabled": self.cache_enabled,
            "cache_dir": self.cache_dir,
            "cache_ttl_seconds": self.cache_ttl_seconds,
        }
