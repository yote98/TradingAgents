"""
Configuration management for Discord integration.

Loads configuration from environment variables and optional YAML file.
"""

import os
import yaml
import logging
from typing import Dict, Optional, Any
from pathlib import Path


logger = logging.getLogger(__name__)


class ConfigManager:
    """Manages configuration from environment and files."""
    
    # Required configuration keys
    REQUIRED_KEYS = ['discord_bot_token']
    
    # Default values
    DEFAULTS = {
        'database_path': './data/coach_plans.db',
        'api_port': 5000,
        'api_host': '0.0.0.0',
        'log_level': 'INFO',
        'log_file': './logs/discord_bot.log',
        'log_max_size_mb': 10,
        'log_backup_count': 5,
        'cache_ttl_seconds': 3600,
        'max_cache_size': 100,
        'mock_mode': False,
        'reconnect_attempts': 5,
        'reconnect_delay_seconds': 5,
        'connection_timeout': 10,
        'max_chart_attachments': 10,
    }
    
    def __init__(self, config_file: Optional[str] = None):
        """
        Initialize configuration manager.
        
        Args:
            config_file: Optional path to YAML configuration file
        """
        self.config = self._load_config(config_file)
        self._validate_config()
        self._setup_directories()
        
    def _load_config(self, config_file: Optional[str]) -> Dict[str, Any]:
        """
        Load configuration from environment variables and optional file.
        
        Priority: Environment variables > Config file > Defaults
        
        Args:
            config_file: Optional path to YAML configuration file
            
        Returns:
            Dictionary of configuration values
        """
        config = self.DEFAULTS.copy()
        
        # Load from config file if provided
        if config_file and os.path.exists(config_file):
            try:
                with open(config_file, 'r') as f:
                    file_config = yaml.safe_load(f)
                    if file_config:
                        config.update(self._flatten_config(file_config))
                logger.info(f"Loaded configuration from {config_file}")
            except Exception as e:
                logger.warning(f"Failed to load config file {config_file}: {e}")
        
        # Override with environment variables
        env_mappings = {
            'DISCORD_BOT_TOKEN': 'discord_bot_token',
            'DATABASE_PATH': 'database_path',
            'API_PORT': 'api_port',
            'API_HOST': 'api_host',
            'LOG_LEVEL': 'log_level',
            'LOG_FILE': 'log_file',
            'LOG_MAX_SIZE_MB': 'log_max_size_mb',
            'LOG_BACKUP_COUNT': 'log_backup_count',
            'CACHE_TTL_SECONDS': 'cache_ttl_seconds',
            'MAX_CACHE_SIZE': 'max_cache_size',
            'MOCK_MODE': 'mock_mode',
            'RECONNECT_ATTEMPTS': 'reconnect_attempts',
            'RECONNECT_DELAY_SECONDS': 'reconnect_delay_seconds',
            'CONNECTION_TIMEOUT': 'connection_timeout',
            'MAX_CHART_ATTACHMENTS': 'max_chart_attachments',
        }
        
        for env_key, config_key in env_mappings.items():
            env_value = os.getenv(env_key)
            if env_value is not None:
                # Type conversion
                if config_key in ['api_port', 'log_max_size_mb', 'log_backup_count', 
                                 'cache_ttl_seconds', 'max_cache_size', 'reconnect_attempts',
                                 'reconnect_delay_seconds', 'connection_timeout', 'max_chart_attachments']:
                    config[config_key] = int(env_value)
                elif config_key == 'mock_mode':
                    config[config_key] = env_value.lower() in ('true', '1', 'yes')
                else:
                    config[config_key] = env_value
        
        return config
    
    def _flatten_config(self, config: Dict, prefix: str = '') -> Dict[str, Any]:
        """
        Flatten nested configuration dictionary.
        
        Example: {'discord': {'bot_token': 'xxx'}} -> {'discord_bot_token': 'xxx'}
        
        Args:
            config: Nested configuration dictionary
            prefix: Current prefix for keys
            
        Returns:
            Flattened dictionary
        """
        result = {}
        for key, value in config.items():
            full_key = f"{prefix}_{key}" if prefix else key
            if isinstance(value, dict):
                result.update(self._flatten_config(value, full_key))
            else:
                result[full_key] = value
        return result
    
    def _validate_config(self):
        """
        Validate that all required configuration values are present.
        
        Raises:
            ValueError: If required configuration is missing
        """
        missing_keys = []
        
        for key in self.REQUIRED_KEYS:
            # Skip validation in mock mode
            if self.config.get('mock_mode', False) and key == 'discord_bot_token':
                continue
                
            if not self.config.get(key):
                missing_keys.append(key)
        
        if missing_keys:
            error_msg = (
                f"Missing required configuration: {', '.join(missing_keys)}\n"
                f"Please set the following environment variables:\n"
            )
            for key in missing_keys:
                env_key = key.upper()
                error_msg += f"  - {env_key}\n"
            
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        logger.info("Configuration validation passed")
    
    def _setup_directories(self):
        """Create necessary directories if they don't exist."""
        # Create database directory
        db_path = Path(self.config['database_path'])
        db_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Create log directory
        log_path = Path(self.config['log_file'])
        log_path.parent.mkdir(parents=True, exist_ok=True)
        
        logger.info("Created necessary directories")
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Get configuration value.
        
        Args:
            key: Configuration key
            default: Default value if key not found
            
        Returns:
            Configuration value
        """
        return self.config.get(key, default)
    
    @property
    def discord_bot_token(self) -> str:
        """Get Discord bot token."""
        return self.config['discord_bot_token']
    
    @property
    def database_path(self) -> str:
        """Get database file path."""
        return self.config['database_path']
    
    @property
    def api_port(self) -> int:
        """Get Flask API port."""
        return self.config['api_port']
    
    @property
    def api_host(self) -> str:
        """Get Flask API host."""
        return self.config['api_host']
    
    @property
    def log_level(self) -> str:
        """Get logging level."""
        return self.config['log_level']
    
    @property
    def log_file(self) -> str:
        """Get log file path."""
        return self.config['log_file']
    
    @property
    def log_max_size_mb(self) -> int:
        """Get log file max size in MB."""
        return self.config['log_max_size_mb']
    
    @property
    def log_backup_count(self) -> int:
        """Get number of log file backups."""
        return self.config['log_backup_count']
    
    @property
    def cache_ttl_seconds(self) -> int:
        """Get cache TTL in seconds."""
        return self.config['cache_ttl_seconds']
    
    @property
    def max_cache_size(self) -> int:
        """Get maximum cache size."""
        return self.config['max_cache_size']
    
    @property
    def mock_mode(self) -> bool:
        """Check if mock mode is enabled."""
        return self.config['mock_mode']
    
    @property
    def reconnect_attempts(self) -> int:
        """Get number of reconnection attempts."""
        return self.config['reconnect_attempts']
    
    @property
    def reconnect_delay_seconds(self) -> int:
        """Get delay between reconnection attempts."""
        return self.config['reconnect_delay_seconds']
    
    @property
    def connection_timeout(self) -> int:
        """Get connection timeout in seconds."""
        return self.config['connection_timeout']
    
    @property
    def max_chart_attachments(self) -> int:
        """Get maximum number of chart attachments per plan."""
        return self.config['max_chart_attachments']
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Get all configuration as dictionary.
        
        Returns:
            Configuration dictionary (with sensitive values masked)
        """
        config_copy = self.config.copy()
        # Mask sensitive values
        if 'discord_bot_token' in config_copy:
            token = config_copy['discord_bot_token']
            if token:
                config_copy['discord_bot_token'] = f"{token[:8]}...{token[-4:]}" if len(token) > 12 else "***"
        return config_copy
