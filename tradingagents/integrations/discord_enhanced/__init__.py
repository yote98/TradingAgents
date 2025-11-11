"""
Enhanced Discord Integration for TradingAgents Coach System.

This package provides production-ready Discord integration with:
- Persistent storage (SQLite)
- Comprehensive error handling
- Health monitoring
- Mock mode for testing
- Caching and metrics
"""

from .config import ConfigManager
from .storage import StorageManager
from .service import PlanService
from .bot import CoachPlanBot
from .api import PlanAPI
from .client import EnhancedWebhookClient, create_client

__all__ = [
    'ConfigManager',
    'StorageManager', 
    'PlanService',
    'CoachPlanBot',
    'PlanAPI',
    'EnhancedWebhookClient',
    'create_client'
]
