"""
System API Routes

Provides health check and metrics endpoints for monitoring.
"""

import logging
from flask import Blueprint, jsonify
from datetime import datetime
import time


logger = logging.getLogger(__name__)

# Create Blueprint for system routes
system_bp = Blueprint('system', __name__)

# Track server start time for uptime calculation
_server_start_time = time.time()

# Track metrics
_metrics = {
    'requests': 0,
    'errors': 0,
    'coach_plans_requests': 0,
    'analysis_requests': 0
}


def increment_metric(metric_name: str):
    """Increment a metric counter."""
    if metric_name in _metrics:
        _metrics[metric_name] += 1


@system_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    
    Returns:
        JSON response with health status
        
    Example Response:
        {
            "status": "healthy",
            "timestamp": "2024-01-15T10:30:00Z",
            "uptime_seconds": 3600
        }
    """
    try:
        uptime = time.time() - _server_start_time
        
        response = {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'uptime_seconds': round(uptime, 2)
        }
        
        logger.debug("Health check successful")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Health check failed: {e}", exc_info=True)
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500


@system_bp.route('/metrics', methods=['GET'])
def get_metrics():
    """
    Get API metrics.
    
    Returns:
        JSON response with usage statistics
        
    Example Response:
        {
            "uptime_seconds": 3600,
            "requests": 150,
            "errors": 2,
            "error_rate": 0.013,
            "coach_plans_requests": 120,
            "analysis_requests": 30,
            "timestamp": "2024-01-15T10:30:00Z"
        }
    """
    try:
        uptime = time.time() - _server_start_time
        total_requests = _metrics['requests']
        error_rate = (_metrics['errors'] / total_requests) if total_requests > 0 else 0.0
        
        response = {
            'uptime_seconds': round(uptime, 2),
            'requests': total_requests,
            'errors': _metrics['errors'],
            'error_rate': round(error_rate, 4),
            'coach_plans_requests': _metrics['coach_plans_requests'],
            'analysis_requests': _metrics['analysis_requests'],
            'timestamp': datetime.now().isoformat()
        }
        
        logger.debug("Metrics retrieved successfully")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error retrieving metrics: {e}", exc_info=True)
        return jsonify({
            'error': 'Failed to retrieve metrics',
            'timestamp': datetime.now().isoformat()
        }), 500


@system_bp.before_app_request
def track_request():
    """Track incoming requests for metrics."""
    increment_metric('requests')
    
    # Track specific endpoint types
    from flask import request
    if '/coach-plans' in request.path:
        increment_metric('coach_plans_requests')
    elif '/analyze' in request.path:
        increment_metric('analysis_requests')


@system_bp.after_app_request
def track_errors(response):
    """Track errors for metrics."""
    if response.status_code >= 400:
        increment_metric('errors')
    return response
