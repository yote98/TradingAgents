"""
Enhanced Discord Bot Server for Coach Plans

This server runs both the Discord bot and Flask API together with:
- Persistent SQLite storage
- Comprehensive error handling
- Health monitoring
- Graceful shutdown
- Configuration management

Setup:
1. Install dependencies: pip install discord.py flask flask-cors
2. Set environment variables or create config.yaml
3. Run: python examples/discord_bot_server_enhanced.py
"""

import os
import sys
import asyncio
import threading
import logging
import signal
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from tradingagents.integrations.discord_enhanced import (
    ConfigManager,
    StorageManager,
    PlanService,
    CoachPlanBot,
    PlanAPI
)


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class EnhancedDiscordServer:
    """Main server orchestrating Discord bot and Flask API."""
    
    def __init__(self, config_file: str = None):
        """
        Initialize server with configuration.
        
        Args:
            config_file: Optional path to YAML configuration file
        """
        logger.info("Initializing Enhanced Discord Server...")
        
        # Load configuration
        try:
            self.config = ConfigManager(config_file)
            logger.info("Configuration loaded successfully")
        except ValueError as e:
            logger.error(f"Configuration error: {e}")
            raise
        
        # Initialize storage
        self.storage = StorageManager(self.config.database_path)
        logger.info(f"Storage initialized: {self.config.database_path}")
        
        # Initialize service
        self.service = PlanService(self.storage)
        logger.info("Service layer initialized")
        
        # Initialize bot
        self.bot = CoachPlanBot(self.config, self.service)
        logger.info("Discord bot initialized")
        
        # Initialize API
        self.api = PlanAPI(
            self.config,
            self.service,
            self.storage,
            bot_status_callback=lambda: self.bot.is_ready()
        )
        logger.info("Flask API initialized")
        
        # Shutdown flag
        self.shutdown_requested = False
        
        # Setup signal handlers
        self.setup_signal_handlers()
    
    def setup_signal_handlers(self):
        """Setup handlers for graceful shutdown."""
        def signal_handler(signum, frame):
            logger.info(f"Received signal {signum}, initiating shutdown...")
            self.shutdown_requested = True
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    def run_flask_api(self):
        """Run Flask API in a separate thread."""
        logger.info("Starting Flask API server...")
        try:
            self.api.run(debug=False)
        except Exception as e:
            logger.error(f"Flask API error: {e}", exc_info=True)
            self.shutdown_requested = True
    
    async def run_discord_bot(self):
        """Run Discord bot with retry logic."""
        logger.info("Starting Discord bot...")
        
        try:
            token = self.config.discord_bot_token
            await self.bot.start_with_retry(token)
        except Exception as e:
            logger.error(f"Discord bot error: {e}", exc_info=True)
            self.shutdown_requested = True
    
    async def shutdown(self):
        """Gracefully shutdown all components."""
        logger.info("Shutting down server...")
        
        # Close bot connection
        if self.bot and not self.bot.is_closed():
            logger.info("Closing Discord bot...")
            await self.bot.close()
        
        logger.info("Shutdown complete")
    
    def run(self):
        """Run the complete server (bot + API)."""
        logger.info("=" * 60)
        logger.info("Enhanced Discord Bot Server Starting")
        logger.info("=" * 60)
        logger.info(f"Database: {self.config.database_path}")
        logger.info(f"API: http://{self.config.api_host}:{self.config.api_port}")
        logger.info(f"Mock Mode: {self.config.mock_mode}")
        logger.info("=" * 60)
        
        # Validate startup
        if not self.validate_startup():
            logger.error("Startup validation failed")
            return 1
        
        # Start Flask API in a separate thread
        api_thread = threading.Thread(target=self.run_flask_api, daemon=True)
        api_thread.start()
        logger.info("Flask API thread started")
        
        # Give API time to start
        import time
        time.sleep(2)
        
        # Run Discord bot in main thread
        try:
            asyncio.run(self.run_discord_bot())
        except KeyboardInterrupt:
            logger.info("Keyboard interrupt received")
        except Exception as e:
            logger.error(f"Unexpected error: {e}", exc_info=True)
        finally:
            # Cleanup
            asyncio.run(self.shutdown())
        
        logger.info("Server stopped")
        return 0
    
    def validate_startup(self) -> bool:
        """
        Validate that all required components are ready.
        
        Returns:
            True if validation passes, False otherwise
        """
        logger.info("Validating startup...")
        
        # Check database
        try:
            stats = self.storage.get_stats()
            logger.info(f"Database OK: {stats['total_plans']} plans")
        except Exception as e:
            logger.error(f"Database validation failed: {e}")
            return False
        
        # Check configuration
        if not self.config.mock_mode and not self.config.discord_bot_token:
            logger.error("Discord bot token not configured and mock mode disabled")
            return False
        
        logger.info("Startup validation passed")
        return True


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Enhanced Discord Bot Server for Coach Plans'
    )
    parser.add_argument(
        '--config',
        type=str,
        help='Path to YAML configuration file'
    )
    parser.add_argument(
        '--mock',
        action='store_true',
        help='Enable mock mode (no Discord connection required)'
    )
    
    args = parser.parse_args()
    
    # Override mock mode if specified
    if args.mock:
        os.environ['MOCK_MODE'] = 'true'
        logger.info("Mock mode enabled via command line")
    
    try:
        # Create and run server
        server = EnhancedDiscordServer(config_file=args.config)
        return server.run()
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        return 1


if __name__ == '__main__':
    sys.exit(main())
