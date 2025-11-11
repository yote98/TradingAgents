"""
Mock mode implementation for testing without Discord.

Provides mock data and simulated Discord bot for testing the
Discord integration without requiring actual Discord credentials.
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime


logger = logging.getLogger(__name__)


class MockDataProvider:
    """Provides realistic mock coach plans for testing."""
    
    def __init__(self):
        """Initialize mock data provider with predefined plans."""
        self.mock_plans = self._generate_mock_plans()
        logger.info("MockDataProvider initialized with mock plans")
    
    def _generate_mock_plans(self) -> Dict[str, Dict[str, Any]]:
        """
        Generate realistic mock plans for all coaches.
        
        Returns:
            Dictionary mapping coach names to their mock plans
        """
        return {
            'd': {
                'plan': (
                    'NVDA showing bullish flag pattern on the daily chart. '
                    'Watch for breakout above $950 with strong volume. '
                    'Entry: $945-950, Target: $1020, Stop: $920. '
                    'Risk/Reward: 1:2.5. Market sentiment is bullish with '
                    'tech sector leading. Consider scaling in on pullbacks.'
                ),
                'charts': [
                    'https://example.com/mock-nvda-daily-chart.png',
                    'https://example.com/mock-nvda-volume-profile.png'
                ],
                'author': 'mock_coach_d',
                'channel': 'day-trading'
            },
            'i': {
                'plan': (
                    'NVDA earnings next week (Nov 15). Expect strong data center '
                    'revenue driven by AI chip demand. Analyst estimates: EPS $4.12, '
                    'Revenue $16.2B. Historical pattern shows 8% average move post-earnings. '
                    'IV at 45%, consider straddle strategy. Watch for guidance on '
                    'next-gen Blackwell chips.'
                ),
                'charts': [
                    'https://example.com/mock-nvda-earnings-history.png'
                ],
                'author': 'mock_coach_i',
                'channel': 'intraday-analysis'
            },
            's': {
                'plan': (
                    'Social media sentiment extremely bullish (8/10 score). '
                    'Reddit WallStreetBets mentions up 150% this week. '
                    'Twitter sentiment: 72% positive, 18% neutral, 10% negative. '
                    'Key influencers bullish on AI sector. Retail interest spiking. '
                    'Caution: High sentiment can signal near-term top.'
                ),
                'charts': [
                    'https://example.com/mock-sentiment-chart.png',
                    'https://example.com/mock-social-volume.png'
                ],
                'author': 'mock_coach_s',
                'channel': 'swing-trading'
            },
            'n': {
                'plan': (
                    'Fed meeting this week (Nov 12-13). Market pricing in 25bps hold. '
                    'Watch for hawkish/dovish signals in Powell press conference. '
                    'Key data: CPI tomorrow (expect 3.3% YoY), jobless claims Thursday. '
                    'Tech sector sensitive to rate outlook. Volatility expected Wed 2PM ET. '
                    'Position accordingly.'
                ),
                'charts': [],
                'author': 'mock_coach_n',
                'channel': 'news-events'
            }
        }
    
    def get_plan(self, coach_name: str, date: str) -> Optional[Dict[str, Any]]:
        """
        Get mock plan for a specific coach and date.
        
        Args:
            coach_name: Coach identifier (d, i, s, n)
            date: Date in YYYY-MM-DD format
            
        Returns:
            Mock plan data or None if coach not found
        """
        # Normalize coach name (remove 'coach_' prefix if present)
        coach_key = coach_name.replace('coach_', '').lower()
        
        if coach_key not in self.mock_plans:
            logger.warning(f"No mock plan for coach: {coach_name}")
            return None
        
        plan_data = self.mock_plans[coach_key].copy()
        plan_data['date'] = date
        plan_data['created_at'] = datetime.now().isoformat()
        
        logger.debug(f"Generated mock plan for {coach_name} on {date}")
        return plan_data
    
    def get_all_plans(self, date: str) -> Dict[str, Dict[str, Any]]:
        """
        Get mock plans for all coaches for a specific date.
        
        Args:
            date: Date in YYYY-MM-DD format
            
        Returns:
            Dictionary mapping coach names to their plans
        """
        all_plans = {}
        for coach_key in self.mock_plans.keys():
            coach_name = f"coach_{coach_key}"
            plan = self.get_plan(coach_name, date)
            if plan:
                all_plans[coach_name] = plan
        
        logger.info(f"Generated {len(all_plans)} mock plans for {date}")
        return all_plans


class MockDiscordBot:
    """Mock Discord bot for testing without actual Discord connection."""
    
    def __init__(self, service, mock_data: Optional[MockDataProvider] = None):
        """
        Initialize mock Discord bot.
        
        Args:
            service: PlanService instance for processing plans
            mock_data: Optional MockDataProvider (creates new if not provided)
        """
        self.service = service
        self.mock_data = mock_data or MockDataProvider()
        self.is_connected = True
        logger.info("MockDiscordBot initialized (no Discord connection required)")
    
    def simulate_plan_post(
        self,
        coach_name: str,
        date: Optional[str] = None
    ) -> tuple[bool, str, Optional[int]]:
        """
        Simulate a coach posting a plan.
        
        Args:
            coach_name: Coach identifier (d, i, s, n)
            date: Date in YYYY-MM-DD format (defaults to today)
            
        Returns:
            Tuple of (success, message, plan_id)
        """
        if not date:
            date = datetime.now().strftime('%Y-%m-%d')
        
        logger.info(f"Simulating plan post for {coach_name} on {date}")
        
        # Get mock plan data
        mock_plan = self.mock_data.get_plan(coach_name, date)
        
        if not mock_plan:
            error_msg = f"No mock data available for coach {coach_name}"
            logger.error(error_msg)
            return False, error_msg, None
        
        # Process through service layer
        success, message, plan_id = self.service.process_plan_message(
            coach_name=coach_name,
            plan_text=mock_plan['plan'],
            author=mock_plan['author'],
            date=date,
            channel=mock_plan.get('channel', 'mock-channel'),
            attachments=None  # Mock attachments handled separately
        )
        
        if success:
            logger.info(f"Mock plan posted successfully: {plan_id}")
        else:
            logger.error(f"Mock plan post failed: {message}")
        
        return success, message, plan_id
    
    def simulate_multiple_posts(
        self,
        date: Optional[str] = None,
        coaches: Optional[List[str]] = None
    ) -> Dict[str, tuple[bool, str, Optional[int]]]:
        """
        Simulate multiple coaches posting plans.
        
        Args:
            date: Date in YYYY-MM-DD format (defaults to today)
            coaches: List of coach names to simulate (defaults to all)
            
        Returns:
            Dictionary mapping coach names to (success, message, plan_id) tuples
        """
        if not date:
            date = datetime.now().strftime('%Y-%m-%d')
        
        if not coaches:
            coaches = ['d', 'i', 's', 'n']
        
        logger.info(f"Simulating {len(coaches)} plan posts for {date}")
        
        results = {}
        for coach in coaches:
            results[coach] = self.simulate_plan_post(coach, date)
        
        successful = sum(1 for success, _, _ in results.values() if success)
        logger.info(f"Simulation complete: {successful}/{len(coaches)} successful")
        
        return results
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get mock bot status.
        
        Returns:
            Dictionary with bot status information
        """
        return {
            'connected': self.is_connected,
            'mode': 'mock',
            'message': 'Mock bot - no Discord connection required'
        }
    
    def disconnect(self):
        """Simulate disconnecting the bot."""
        self.is_connected = False
        logger.info("Mock bot disconnected")
    
    def connect(self):
        """Simulate connecting the bot."""
        self.is_connected = True
        logger.info("Mock bot connected")


def create_mock_system(storage_manager, service):
    """
    Create a complete mock system for testing.
    
    Args:
        storage_manager: StorageManager instance
        service: PlanService instance
        
    Returns:
        Tuple of (MockDataProvider, MockDiscordBot)
    """
    mock_data = MockDataProvider()
    mock_bot = MockDiscordBot(service, mock_data)
    
    logger.info("Mock system created successfully")
    return mock_data, mock_bot


# Convenience function for quick testing
def populate_mock_data(service, date: Optional[str] = None) -> Dict[str, Any]:
    """
    Quickly populate database with mock data for all coaches.
    
    Args:
        service: PlanService instance
        date: Date in YYYY-MM-DD format (defaults to today)
        
    Returns:
        Dictionary with results for each coach
    """
    mock_bot = MockDiscordBot(service)
    results = mock_bot.simulate_multiple_posts(date)
    
    summary = {
        'date': date or datetime.now().strftime('%Y-%m-%d'),
        'total': len(results),
        'successful': sum(1 for success, _, _ in results.values() if success),
        'failed': sum(1 for success, _, _ in results.values() if not success),
        'details': results
    }
    
    logger.info(f"Mock data populated: {summary['successful']}/{summary['total']} successful")
    return summary
