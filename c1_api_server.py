"""
C1 Backend API Server

Flask-based REST API for TradingAgents integration with C1 frontend.
Provides endpoints for coach plans and stock analysis.
"""

import logging
from flask import Flask
from flask_cors import CORS

from c1_api.config import Config
from c1_api.routes.coach_plans import coach_plans_bp
from c1_api.routes.system import system_bp
from c1_api.routes.twitter import twitter_bp
from c1_api.routes.analysis import analysis_bp
from c1_api.routes.backtest import backtest_bp


def create_app(config=None) -> Flask:
    """
    Create and configure Flask application.
    
    Args:
        config: Optional configuration dictionary
        
    Returns:
        Configured Flask application
    """
    app = Flask(__name__)
    
    # Load configuration
    if config:
        app.config.update(config)
    
    # Setup logging
    setup_logging(app)
    
    # Setup CORS
    setup_cors(app)
    
    # Register blueprints
    register_blueprints(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    # Log startup info
    logger = logging.getLogger(__name__)
    logger.info("=" * 60)
    logger.info("C1 Backend API Server Starting")
    logger.info("=" * 60)
    logger.info(f"Mode: {'Mock' if Config.USE_MOCK_MODE else 'Real'}")
    logger.info(f"Debug: {Config.DEBUG_MODE}")
    logger.info(f"CORS Origins: {Config.CORS_ORIGINS}")
    logger.info("=" * 60)
    
    # Validate configuration
    Config.validate()
    
    return app


def setup_logging(app: Flask) -> None:
    """
    Configure application logging.
    
    Args:
        app: Flask application
    """
    # Set log level based on debug mode
    log_level = logging.DEBUG if Config.DEBUG_MODE else logging.INFO
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Set Flask logger level
    app.logger.setLevel(log_level)
    
    # Reduce noise from some libraries
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    
    app.logger.info("Logging configured")


def setup_cors(app: Flask) -> None:
    """
    Configure CORS for frontend access.
    
    Args:
        app: Flask application
    """
    CORS(
        app,
        origins=Config.CORS_ORIGINS,
        methods=['GET', 'POST', 'OPTIONS'],
        allow_headers=['Content-Type', 'Authorization'],
        supports_credentials=True
    )
    
    app.logger.info(f"CORS configured for origins: {Config.CORS_ORIGINS}")


def register_blueprints(app: Flask) -> None:
    """
    Register API route blueprints.
    
    Args:
        app: Flask application
    """
    # Register coach plans routes
    app.register_blueprint(coach_plans_bp)
    app.logger.info("Registered coach plans routes")
    
    # Register system routes
    app.register_blueprint(system_bp)
    app.logger.info("Registered system routes")
    
    # Register Twitter routes
    app.register_blueprint(twitter_bp)
    app.logger.info("Registered Twitter routes")
    
    # Register analysis routes
    app.register_blueprint(analysis_bp)
    app.logger.info("Registered analysis routes")
    
    # Register backtest routes
    app.register_blueprint(backtest_bp)
    app.logger.info("Registered backtest routes")


def register_error_handlers(app: Flask) -> None:
    """
    Register global error handlers.
    
    Args:
        app: Flask application
    """
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 errors."""
        return {
            'error': 'Resource not found',
            'status': 404
        }, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 errors."""
        app.logger.error(f"Internal server error: {error}", exc_info=True)
        return {
            'error': 'Internal server error',
            'status': 500
        }, 500
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        """Handle uncaught exceptions."""
        app.logger.error(f"Unhandled exception: {error}", exc_info=True)
        return {
            'error': 'An unexpected error occurred',
            'status': 500
        }, 500
    
    app.logger.info("Error handlers registered")


# Create Flask app
app = create_app()


if __name__ == '__main__':
    # Run development server
    logger = logging.getLogger(__name__)
    
    logger.info("Starting development server...")
    logger.info(f"Server will be available at http://{Config.API_HOST}:{Config.API_PORT}")
    logger.info("Press CTRL+C to stop")
    
    app.run(
        host=Config.API_HOST,
        port=Config.API_PORT,
        debug=Config.DEBUG_MODE
    )
