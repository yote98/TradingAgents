"""
Coach Plans Service Layer

Provides business logic for fetching and managing coach plans.
Integrates with Discord Enhancement storage and supports mock mode.
"""

import logging
from typing import Dict, Optional, Any
from datetime import datetime
from dataclasses import dataclass, asdict
from pathlib import Path

from c1_api.config import Config

# Import Discord Enhancement components
try:
    from tradingagents.integrations.discord_enhanced.storage import StorageManager
    from tradingagents.integrations.discord_enhanced.mock import MockDataProvider
    DISCORD_ENHANCED_AVAILABLE = True
except ImportError:
    DISCORD_ENHANCED_AVAILABLE = False
    logging.warning("Discord Enhancement modules not available")


logger = logging.getLogger(__name__)


@dataclass
class CoachPlan:
    """Data model for a coach plan."""
    plan: str
    created_at: str
    charts: list[str]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return asdict(self)


class CoachService:
    """Service for managing coach plans."""
    
    # Valid coach identifiers
    VALID_COACHES = ['coach_d', 'coach_i', 'coach_s', 'coach_n']
    
    def __init__(self):
        """Initialize coach service."""
        self.use_mock_mode = Config.USE_MOCK_MODE
        self.storage_manager: Optional[StorageManager] = None
        self.mock_provider: Optional[MockDataProvider] = None
        
        self._initialize_storage()
        
        logger.info(f"CoachService initialized (mock_mode={self.use_mock_mode})")
    
    def _initialize_storage(self):
        """Initialize storage layer based on configuration."""
        if not DISCORD_ENHANCED_AVAILABLE:
            logger.warning("Discord Enhancement not available, forcing mock mode")
            self.use_mock_mode = True
        
        if self.use_mock_mode:
            # Initialize mock data provider
            self.mock_provider = MockDataProvider()
            logger.info("Using mock data provider")
        else:
            # Initialize real storage
            try:
                db_path = Path("tradingagents/integrations/discord_enhanced/coach_plans.db")
                self.storage_manager = StorageManager(str(db_path))
                logger.info(f"Connected to storage at {db_path}")
            except Exception as e:
                logger.error(f"Failed to initialize storage: {e}")
                logger.warning("Falling back to mock mode")
                self.use_mock_mode = True
                self.mock_provider = MockDataProvider()
    
    def is_mock_mode(self) -> bool:
        """
        Check if service is running in mock mode.
        
        Returns:
            True if using mock data, False if using real storage
        """
        return self.use_mock_mode
    
    def validate_coach_id(self, coach_id: str) -> bool:
        """
        Validate coach identifier.
        
        Args:
            coach_id: Coach identifier to validate
            
        Returns:
            True if valid, False otherwise
        """
        return coach_id in self.VALID_COACHES
    
    def get_all_coach_plans(self, date: Optional[str] = None) -> Dict[str, CoachPlan]:
        """
        Fetch all available coach plans.
        
        Args:
            date: Optional date in YYYY-MM-DD format (defaults to today)
            
        Returns:
            Dictionary mapping coach IDs to CoachPlan objects
        """
        if not date:
            date = datetime.now().strftime('%Y-%m-%d')
        
        logger.info(f"Fetching all coach plans for {date}")
        
        try:
            if self.use_mock_mode:
                return self._get_mock_plans(date)
            else:
                return self._get_real_plans(date)
        except Exception as e:
            logger.error(f"Error fetching coach plans: {e}")
            return {}
    
    def get_coach_plan(self, coach_id: str, date: Optional[str] = None) -> Optional[CoachPlan]:
        """
        Fetch a specific coach's plan.
        
        Args:
            coach_id: Coach identifier (e.g., 'coach_d')
            date: Optional date in YYYY-MM-DD format (defaults to today)
            
        Returns:
            CoachPlan object or None if not found
        """
        if not self.validate_coach_id(coach_id):
            logger.warning(f"Invalid coach ID: {coach_id}")
            return None
        
        if not date:
            date = datetime.now().strftime('%Y-%m-%d')
        
        logger.info(f"Fetching plan for {coach_id} on {date}")
        
        try:
            if self.use_mock_mode:
                return self._get_mock_plan(coach_id, date)
            else:
                return self._get_real_plan(coach_id, date)
        except Exception as e:
            logger.error(f"Error fetching coach plan: {e}")
            return None
    
    def _get_mock_plans(self, date: str) -> Dict[str, CoachPlan]:
        """
        Get mock plans for all coaches.
        
        Args:
            date: Date in YYYY-MM-DD format
            
        Returns:
            Dictionary of coach plans
        """
        if not self.mock_provider:
            logger.error("Mock provider not initialized")
            return {}
        
        mock_plans = self.mock_provider.get_all_plans(date)
        result = {}
        
        for coach_id, plan_data in mock_plans.items():
            result[coach_id] = CoachPlan(
                plan=plan_data['plan'],
                created_at=plan_data['created_at'],
                charts=plan_data.get('charts', [])
            )
        
        logger.debug(f"Retrieved {len(result)} mock plans")
        return result
    
    def _get_mock_plan(self, coach_id: str, date: str) -> Optional[CoachPlan]:
        """
        Get mock plan for a specific coach.
        
        Args:
            coach_id: Coach identifier
            date: Date in YYYY-MM-DD format
            
        Returns:
            CoachPlan or None
        """
        if not self.mock_provider:
            logger.error("Mock provider not initialized")
            return None
        
        plan_data = self.mock_provider.get_plan(coach_id, date)
        
        if not plan_data:
            logger.debug(f"No mock plan found for {coach_id}")
            return None
        
        return CoachPlan(
            plan=plan_data['plan'],
            created_at=plan_data['created_at'],
            charts=plan_data.get('charts', [])
        )
    
    def _get_real_plans(self, date: str) -> Dict[str, CoachPlan]:
        """
        Get real plans from storage for all coaches.
        
        Args:
            date: Date in YYYY-MM-DD format
            
        Returns:
            Dictionary of coach plans
        """
        if not self.storage_manager:
            logger.error("Storage manager not initialized")
            return {}
        
        plans_data = self.storage_manager.get_plans_by_date(date)
        result = {}
        
        for coach_id, plan_data in plans_data.items():
            result[coach_id] = CoachPlan(
                plan=plan_data['plan'],
                created_at=plan_data['created_at'],
                charts=plan_data.get('charts', [])
            )
        
        logger.debug(f"Retrieved {len(result)} real plans from storage")
        return result
    
    def _get_real_plan(self, coach_id: str, date: str) -> Optional[CoachPlan]:
        """
        Get real plan from storage for a specific coach.
        
        Args:
            coach_id: Coach identifier
            date: Date in YYYY-MM-DD format
            
        Returns:
            CoachPlan or None
        """
        if not self.storage_manager:
            logger.error("Storage manager not initialized")
            return None
        
        plan_data = self.storage_manager.get_plan(coach_id, date)
        
        if not plan_data:
            logger.debug(f"No plan found for {coach_id} on {date}")
            return None
        
        return CoachPlan(
            plan=plan_data['plan'],
            created_at=plan_data['created_at'],
            charts=plan_data.get('charts', [])
        )
    
    def get_service_info(self) -> Dict[str, Any]:
        """
        Get service information and status.
        
        Returns:
            Dictionary with service info
        """
        info = {
            'mode': 'mock' if self.use_mock_mode else 'real',
            'valid_coaches': self.VALID_COACHES,
            'storage_available': self.storage_manager is not None,
            'mock_provider_available': self.mock_provider is not None
        }
        
        # Add storage stats if available
        if self.storage_manager:
            try:
                info['storage_stats'] = self.storage_manager.get_stats()
            except Exception as e:
                logger.error(f"Failed to get storage stats: {e}")
        
        return info


# Singleton instance
_coach_service_instance: Optional[CoachService] = None


def get_coach_service() -> CoachService:
    """
    Get singleton instance of CoachService.
    
    Returns:
        CoachService instance
    """
    global _coach_service_instance
    
    if _coach_service_instance is None:
        _coach_service_instance = CoachService()
    
    return _coach_service_instance
