"""
Enhanced Flask API for coach plan retrieval.

Provides REST endpoints for health monitoring, metrics, and plan access
with comprehensive error handling and CORS support.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime
from typing import Optional
import time

from .service import PlanService
from .storage import StorageManager
from .config import ConfigManager


logger = logging.getLogger(__name__)


class PlanAPI:
    """Flask API for coach plan management."""
    
    def __init__(
        self,
        config: ConfigManager,
        service: PlanService,
        storage: StorageManager,
        bot_status_callback: Optional[callable] = None
    ):
        """
        Initialize API with configuration and dependencies.
        
        Args:
            config: Configuration manager
            service: Plan service for business logic
            storage: Storage manager for database access
            bot_status_callback: Optional callback to check bot status
        """
        self.config = config
        self.service = service
        self.storage = storage
        self.bot_status_callback = bot_status_callback
        
        # Initialize Flask app
        self.app = Flask(__name__)
        
        # Enable CORS for web dashboard access
        CORS(self.app)
        
        # Metrics tracking
        self.metrics = {
            'requests_total': 0,
            'requests_success': 0,
            'requests_error': 0,
            'start_time': datetime.now().isoformat()
        }
        
        # Setup routes and error handlers
        self.setup_routes()
        self.setup_error_handlers()
        self.setup_middleware()
        
        logger.info("PlanAPI initialized")
    
    def setup_middleware(self):
        """Set up request/response middleware."""
        
        @self.app.before_request
        def before_request():
            """Log incoming requests."""
            request.start_time = time.time()
            self.metrics['requests_total'] += 1
            logger.info(f"{request.method} {request.path} from {request.remote_addr}")
        
        @self.app.after_request
        def after_request(response):
            """Log response and track metrics."""
            duration = time.time() - request.start_time
            
            if response.status_code < 400:
                self.metrics['requests_success'] += 1
            else:
                self.metrics['requests_error'] += 1
            
            logger.info(
                f"{request.method} {request.path} "
                f"-> {response.status_code} ({duration:.3f}s)"
            )
            
            return response
    
    def setup_error_handlers(self):
        """Set up custom error handlers."""
        
        @self.app.errorhandler(400)
        def bad_request(error):
            """Handle 400 Bad Request errors."""
            logger.warning(f"Bad request: {error}")
            return jsonify({
                'error': 'Bad Request',
                'message': str(error)
            }), 400
        
        @self.app.errorhandler(404)
        def not_found(error):
            """Handle 404 Not Found errors."""
            logger.warning(f"Not found: {request.path}")
            return jsonify({
                'error': 'Not Found',
                'message': f'Endpoint {request.path} not found'
            }), 404
        
        @self.app.errorhandler(500)
        def internal_error(error):
            """Handle 500 Internal Server Error."""
            logger.error(f"Internal error: {error}", exc_info=True)
            return jsonify({
                'error': 'Internal Server Error',
                'message': 'An unexpected error occurred'
            }), 500
        
        @self.app.errorhandler(Exception)
        def handle_exception(error):
            """Handle uncaught exceptions."""
            logger.error(f"Unhandled exception: {error}", exc_info=True)
            return jsonify({
                'error': 'Internal Server Error',
                'message': 'An unexpected error occurred'
            }), 500
    
    def setup_routes(self):
        """Set up API routes."""
        
        @self.app.route('/health', methods=['GET'])
        def health_check():
            """
            Health check endpoint.
            
            Returns bot status, database status, and plan count.
            """
            try:
                # Check bot status
                bot_connected = False
                if self.bot_status_callback:
                    try:
                        bot_connected = self.bot_status_callback()
                    except Exception as e:
                        logger.warning(f"Error checking bot status: {e}")
                
                # Check database status
                db_healthy = False
                try:
                    stats = self.storage.get_stats()
                    db_healthy = True
                    plan_count = stats.get('total_plans', 0)
                except Exception as e:
                    logger.error(f"Database health check failed: {e}")
                    plan_count = 0
                
                # Overall health
                healthy = db_healthy  # Bot is optional
                
                return jsonify({
                    'status': 'healthy' if healthy else 'unhealthy',
                    'timestamp': datetime.now().isoformat(),
                    'components': {
                        'database': {
                            'status': 'up' if db_healthy else 'down',
                            'plan_count': plan_count
                        },
                        'discord_bot': {
                            'status': 'connected' if bot_connected else 'disconnected'
                        }
                    }
                }), 200 if healthy else 503
                
            except Exception as e:
                logger.error(f"Health check error: {e}", exc_info=True)
                return jsonify({
                    'status': 'unhealthy',
                    'error': str(e)
                }), 503
        
        @self.app.route('/metrics', methods=['GET'])
        def get_metrics():
            """
            Metrics endpoint.
            
            Returns request counts, error rates, and system metrics.
            """
            try:
                # Calculate uptime
                start_time = datetime.fromisoformat(self.metrics['start_time'])
                uptime_seconds = (datetime.now() - start_time).total_seconds()
                
                # Calculate error rate
                total = self.metrics['requests_total']
                errors = self.metrics['requests_error']
                error_rate = (errors / total * 100) if total > 0 else 0
                
                # Get database stats
                db_stats = self.storage.get_stats()
                
                return jsonify({
                    'timestamp': datetime.now().isoformat(),
                    'uptime_seconds': uptime_seconds,
                    'requests': {
                        'total': total,
                        'success': self.metrics['requests_success'],
                        'error': errors,
                        'error_rate_percent': round(error_rate, 2)
                    },
                    'database': {
                        'total_plans': db_stats.get('total_plans', 0),
                        'total_charts': db_stats.get('total_charts', 0),
                        'total_edits': db_stats.get('total_edits', 0),
                        'latest_plan': db_stats.get('latest_plan')
                    }
                })
                
            except Exception as e:
                logger.error(f"Metrics error: {e}", exc_info=True)
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/api/coach-plans/', methods=['GET'])
        def get_coach_plan():
            """
            Get coach plan for a specific coach and date.
            
            Query params:
            - coach: Coach name (d, i, s, n) - required
            - date: Date in YYYY-MM-DD format (defaults to today)
            
            Returns:
            - plan: Plan text
            - charts: List of chart URLs
            - author: Plan author
            - created_at: Creation timestamp
            - edited_at: Last edit timestamp (if edited)
            """
            try:
                # Get and validate parameters
                coach = request.args.get('coach', '').strip()
                date = request.args.get('date', '').strip()
                
                if not coach:
                    return jsonify({
                        'error': 'Missing required parameter: coach'
                    }), 400
                
                # Validate coach name
                is_valid, error_msg = self.service.validate_coach_name(coach)
                if not is_valid:
                    return jsonify({'error': error_msg}), 400
                
                # Get plan
                plan_data = self.service.get_plan_for_api(coach, date or None)
                
                return jsonify(plan_data)
                
            except Exception as e:
                logger.error(f"Error getting coach plan: {e}", exc_info=True)
                return jsonify({
                    'error': 'Failed to retrieve plan',
                    'message': str(e)
                }), 500
        
        @self.app.route('/api/coach-plans/all', methods=['GET'])
        def get_all_plans():
            """
            Get all coach plans for a specific date.
            
            Query params:
            - date: Date in YYYY-MM-DD format (defaults to today)
            
            Returns:
            Dictionary mapping coach names to their plan data.
            """
            try:
                # Get date parameter
                date = request.args.get('date', '').strip()
                
                # Get all plans
                plans = self.service.get_all_plans_for_api(date or None)
                
                return jsonify(plans)
                
            except Exception as e:
                logger.error(f"Error getting all plans: {e}", exc_info=True)
                return jsonify({
                    'error': 'Failed to retrieve plans',
                    'message': str(e)
                }), 500
        
        @self.app.route('/api/coach-plans/history', methods=['GET'])
        def get_plan_history():
            """
            Get edit history for a plan.
            
            Query params:
            - coach: Coach name (d, i, s, n) - required
            - date: Date in YYYY-MM-DD format (defaults to today)
            
            Returns:
            List of historical versions with timestamps and authors.
            """
            try:
                # Get and validate parameters
                coach = request.args.get('coach', '').strip()
                date = request.args.get('date', '').strip()
                
                if not coach:
                    return jsonify({
                        'error': 'Missing required parameter: coach'
                    }), 400
                
                # Validate coach name
                is_valid, error_msg = self.service.validate_coach_name(coach)
                if not is_valid:
                    return jsonify({'error': error_msg}), 400
                
                # Get history
                success, result = self.service.get_plan_history(coach, date or None)
                
                if not success:
                    return jsonify({'error': result}), 500
                
                return jsonify({'history': result})
                
            except Exception as e:
                logger.error(f"Error getting plan history: {e}", exc_info=True)
                return jsonify({
                    'error': 'Failed to retrieve history',
                    'message': str(e)
                }), 500
        
        @self.app.route('/', methods=['GET'])
        def index():
            """Root endpoint with API information."""
            return jsonify({
                'name': 'TradingAgents Coach Plan API',
                'version': '1.0.0',
                'endpoints': {
                    'health': '/health',
                    'metrics': '/metrics',
                    'get_plan': '/api/coach-plans/?coach=<coach>&date=<date>',
                    'get_all_plans': '/api/coach-plans/all?date=<date>',
                    'get_history': '/api/coach-plans/history?coach=<coach>&date=<date>'
                },
                'documentation': 'See README.md for full API documentation'
            })
    
    def run(self, host: Optional[str] = None, port: Optional[int] = None, debug: bool = False):
        """
        Run the Flask API server.
        
        Args:
            host: Host to bind to (defaults to config value)
            port: Port to bind to (defaults to config value)
            debug: Enable debug mode
        """
        host = host or self.config.api_host
        port = port or self.config.api_port
        
        logger.info(f"Starting Flask API on {host}:{port}")
        
        try:
            self.app.run(host=host, port=port, debug=debug)
        except Exception as e:
            logger.error(f"Failed to start Flask API: {e}", exc_info=True)
            raise
