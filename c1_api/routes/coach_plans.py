"""
Coach Plans API Routes

Provides REST endpoints for fetching coach trading plans.
"""

import logging
from flask import Blueprint, jsonify, request
from datetime import datetime
from typing import Dict, Any

from c1_api.services.coach_service import get_coach_service


logger = logging.getLogger(__name__)

# Create Blueprint for coach plans routes
coach_plans_bp = Blueprint('coach_plans', __name__, url_prefix='/api/coach-plans')


def create_error_response(message: str, status_code: int) -> tuple:
    """
    Create standardized error response.
    
    Args:
        message: Error message
        status_code: HTTP status code
        
    Returns:
        Tuple of (response_dict, status_code)
    """
    return jsonify({
        'error': message,
        'status': status_code,
        'timestamp': datetime.now().isoformat()
    }), status_code


def create_success_response(data: Any, status_code: int = 200) -> tuple:
    """
    Create standardized success response.
    
    Args:
        data: Response data
        status_code: HTTP status code
        
    Returns:
        Tuple of (response_dict, status_code)
    """
    return jsonify(data), status_code


@coach_plans_bp.route('/all', methods=['GET'])
def get_all_coach_plans():
    """
    Get all coach plans.
    
    Query Parameters:
        date (optional): Date in YYYY-MM-DD format (defaults to today)
    
    Returns:
        JSON response with all coach plans
        
    Example Response:
        {
            "coach_d": {
                "plan": "Trading plan text...",
                "created_at": "2024-01-15T10:30:00Z",
                "charts": ["chart1.png"]
            },
            "coach_i": { ... }
        }
    """
    try:
        # Get optional date parameter
        date = request.args.get('date')
        
        # Validate date format if provided
        if date:
            try:
                datetime.strptime(date, '%Y-%m-%d')
            except ValueError:
                logger.warning(f"Invalid date format: {date}")
                return create_error_response(
                    'Invalid date format. Use YYYY-MM-DD',
                    400
                )
        
        logger.info(f"Fetching all coach plans for date: {date or 'today'}")
        
        # Get coach service
        coach_service = get_coach_service()
        
        # Fetch all plans
        plans = coach_service.get_all_coach_plans(date)
        
        # Convert CoachPlan objects to dictionaries
        plans_dict = {
            coach_id: plan.to_dict()
            for coach_id, plan in plans.items()
        }
        
        logger.info(f"Successfully fetched {len(plans_dict)} coach plans")
        return create_success_response(plans_dict)
        
    except Exception as e:
        logger.error(f"Error fetching all coach plans: {e}", exc_info=True)
        return create_error_response(
            'Internal server error while fetching coach plans',
            500
        )


@coach_plans_bp.route('/<coach_id>', methods=['GET'])
def get_coach_plan(coach_id: str):
    """
    Get a specific coach's plan.
    
    Path Parameters:
        coach_id: Coach identifier (coach_d, coach_i, coach_s, coach_n)
    
    Query Parameters:
        date (optional): Date in YYYY-MM-DD format (defaults to today)
    
    Returns:
        JSON response with coach plan
        
    Example Response:
        {
            "plan": "Trading plan text...",
            "created_at": "2024-01-15T10:30:00Z",
            "charts": ["chart1.png"]
        }
    """
    try:
        # Get optional date parameter
        date = request.args.get('date')
        
        # Validate date format if provided
        if date:
            try:
                datetime.strptime(date, '%Y-%m-%d')
            except ValueError:
                logger.warning(f"Invalid date format: {date}")
                return create_error_response(
                    'Invalid date format. Use YYYY-MM-DD',
                    400
                )
        
        logger.info(f"Fetching plan for {coach_id} on date: {date or 'today'}")
        
        # Get coach service
        coach_service = get_coach_service()
        
        # Validate coach ID
        if not coach_service.validate_coach_id(coach_id):
            logger.warning(f"Invalid coach ID: {coach_id}")
            return create_error_response(
                f'Invalid coach ID. Valid IDs: {", ".join(coach_service.VALID_COACHES)}',
                400
            )
        
        # Fetch plan
        plan = coach_service.get_coach_plan(coach_id, date)
        
        if plan is None:
            logger.info(f"No plan found for {coach_id}")
            return create_error_response(
                f'No plan found for coach {coach_id}',
                404
            )
        
        logger.info(f"Successfully fetched plan for {coach_id}")
        return create_success_response(plan.to_dict())
        
    except Exception as e:
        logger.error(f"Error fetching coach plan: {e}", exc_info=True)
        return create_error_response(
            'Internal server error while fetching coach plan',
            500
        )


@coach_plans_bp.route('/info', methods=['GET'])
def get_service_info():
    """
    Get service information and status.
    
    Returns:
        JSON response with service info
        
    Example Response:
        {
            "mode": "mock",
            "valid_coaches": ["coach_d", "coach_i", "coach_s", "coach_n"],
            "storage_available": false,
            "mock_provider_available": true
        }
    """
    try:
        logger.info("Fetching service info")
        
        # Get coach service
        coach_service = get_coach_service()
        
        # Get service info
        info = coach_service.get_service_info()
        
        logger.info("Successfully fetched service info")
        return create_success_response(info)
        
    except Exception as e:
        logger.error(f"Error fetching service info: {e}", exc_info=True)
        return create_error_response(
            'Internal server error while fetching service info',
            500
        )


# Error handlers for this blueprint
@coach_plans_bp.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return create_error_response('Resource not found', 404)


@coach_plans_bp.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {error}", exc_info=True)
    return create_error_response('Internal server error', 500)
