"""
Backtest API Routes

Provides REST endpoints for running backtests using TradingAgents backtesting framework.
"""

import logging
from flask import Blueprint, jsonify, request
from datetime import datetime
from typing import Dict, Any
import traceback

logger = logging.getLogger(__name__)

# Create Blueprint for backtest routes
backtest_bp = Blueprint('backtest', __name__, url_prefix='/api')


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
        'success': False,
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
    response = {
        'success': True,
        'timestamp': datetime.now().isoformat()
    }
    response.update(data)
    return jsonify(response), status_code


def validate_backtest_request(data: Dict[str, Any]) -> tuple[bool, str]:
    """
    Validate backtest request data.
    
    Args:
        data: Request data
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Check required fields
    if not data:
        return False, "Request body is required"
    
    if 'ticker' not in data:
        return False, "ticker field is required"
    
    ticker = data['ticker']
    if not ticker or not isinstance(ticker, str):
        return False, "ticker must be a non-empty string"
    
    # Validate ticker format (1-5 uppercase letters)
    if not ticker.isupper() or len(ticker) < 1 or len(ticker) > 5:
        return False, "ticker must be 1-5 uppercase letters (e.g., AAPL, MSFT)"
    
    # Check date fields
    if 'startDate' not in data:
        return False, "startDate field is required"
    
    if 'endDate' not in data:
        return False, "endDate field is required"
    
    start_date = data['startDate']
    end_date = data['endDate']
    
    if not start_date or not isinstance(start_date, str):
        return False, "startDate must be a non-empty string"
    
    if not end_date or not isinstance(end_date, str):
        return False, "endDate must be a non-empty string"
    
    # Validate date format and range
    try:
        from datetime import datetime
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        if start >= end:
            return False, "endDate must be after startDate"
        
        if end > datetime.now():
            return False, "endDate cannot be in the future"
        
        # Check minimum date range (at least 7 days)
        days_diff = (end - start).days
        if days_diff < 7:
            return False, "Date range must be at least 7 days"
            
    except (ValueError, AttributeError) as e:
        return False, f"Invalid date format: {str(e)}"
    
    # Check config field
    if 'config' not in data:
        return False, "config field is required"
    
    config = data['config']
    if not isinstance(config, dict):
        return False, "config must be an object"
    
    # Validate config fields
    if 'initialBalance' in config:
        balance = config['initialBalance']
        if not isinstance(balance, (int, float)) or balance < 1000:
            return False, "initialBalance must be at least 1000"
    
    if 'commissionRate' in config:
        rate = config['commissionRate']
        if not isinstance(rate, (int, float)) or rate < 0 or rate > 0.1:
            return False, "commissionRate must be between 0 and 0.1 (10%)"
    
    if 'slippage' in config:
        slippage = config['slippage']
        if not isinstance(slippage, (int, float)) or slippage < 0 or slippage > 0.1:
            return False, "slippage must be between 0 and 0.1 (10%)"
    
    if 'riskPerTradePct' in config:
        risk = config['riskPerTradePct']
        if not isinstance(risk, (int, float)) or risk <= 0 or risk > 100:
            return False, "riskPerTradePct must be between 0 and 100"
    
    if 'maxPositionSizePct' in config:
        max_pos = config['maxPositionSizePct']
        if not isinstance(max_pos, (int, float)) or max_pos <= 0 or max_pos > 100:
            return False, "maxPositionSizePct must be between 0 and 100"
    
    return True, ""


def run_backtest_engine(ticker: str, start_date: str, end_date: str, config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run backtest using TradingAgents backtesting framework.
    
    Args:
        ticker: Stock ticker symbol
        start_date: Start date (ISO format)
        end_date: End date (ISO format)
        config: Backtest configuration
        
    Returns:
        Backtest results dictionary
    """
    try:
        from tradingagents.backtesting import BacktestConfig, BacktestEngine
        
        # Create backtest configuration
        backtest_config = BacktestConfig(
            initial_balance=config.get('initialBalance', 10000.0),
            commission_rate=config.get('commissionRate', 0.001),
            slippage=config.get('slippage', 0.001),
            risk_per_trade_pct=config.get('riskPerTradePct', 2.0),
            max_position_size_pct=config.get('maxPositionSizePct', 20.0),
            start_date=start_date,
            end_date=end_date,
            data_interval='daily'
        )
        
        logger.info(f"Initializing backtest engine for {ticker} from {start_date} to {end_date}")
        
        # Initialize backtest engine (without TradingAgents graph for now)
        engine = BacktestEngine(
            config=backtest_config,
            trading_graph=None  # Can integrate TradingAgentsGraph later
        )
        
        # Run backtest
        logger.info(f"Running backtest for {ticker}")
        backtest_results = engine.run_backtest(ticker)
        
        # Format results for API response
        results = {
            'ticker': ticker,
            'period': {
                'start': start_date,
                'end': end_date
            },
            'totalReturn': backtest_results.total_return_pct,
            'winRate': backtest_results.win_rate,
            'sharpeRatio': backtest_results.sharpe_ratio,
            'maxDrawdown': backtest_results.max_drawdown,
            'trades': [],
            'equityCurve': []
        }
        
        # Convert trades to API format
        for trade in backtest_results.trades:
            results['trades'].append({
                'date': trade.get('date', ''),
                'action': trade.get('action', 'HOLD'),
                'price': trade.get('price', 0.0),
                'quantity': trade.get('quantity', 0),
                'pnl': trade.get('pnl', 0.0)
            })
        
        # Convert equity history to API format
        for point in backtest_results.equity_history:
            if isinstance(point, dict):
                results['equityCurve'].append({
                    'date': point.get('date', ''),
                    'value': point.get('total_equity', 0.0)
                })
        
        logger.info(f"Backtest completed for {ticker}: {results['totalReturn']:.2f}% return")
        return results
        
    except ImportError as e:
        logger.error(f"Failed to import backtesting framework: {e}")
        raise Exception("Backtesting framework is not available. Please ensure it is properly installed.")
    except Exception as e:
        logger.error(f"Error running backtest: {e}")
        logger.error(traceback.format_exc())
        raise


@backtest_bp.route('/backtest', methods=['POST'])
def backtest():
    """
    Run a backtest on historical data.
    
    Request Body:
        {
            "ticker": "AAPL",
            "startDate": "2023-01-01",
            "endDate": "2023-06-30",
            "config": {
                "initialBalance": 10000,
                "commissionRate": 0.001,
                "slippage": 0.001,
                "riskPerTradePct": 2.0,
                "maxPositionSizePct": 20.0
            }
        }
    
    Returns:
        JSON response with backtest results
        
    Example Response:
        {
            "success": true,
            "results": {
                "ticker": "AAPL",
                "period": {
                    "start": "2023-01-01",
                    "end": "2023-06-30"
                },
                "totalReturn": 15.5,
                "winRate": 65.0,
                "sharpeRatio": 1.2,
                "maxDrawdown": -8.5,
                "trades": [...],
                "equityCurve": [...]
            }
        }
    """
    try:
        # Get request data
        data = request.get_json()
        
        # Validate request
        is_valid, error_message = validate_backtest_request(data)
        if not is_valid:
            logger.warning(f"Invalid backtest request: {error_message}")
            return create_error_response(error_message, 400)
        
        ticker = data['ticker']
        start_date = data['startDate']
        end_date = data['endDate']
        config = data['config']
        
        logger.info(f"Received backtest request for {ticker} from {start_date} to {end_date}")
        
        # Run backtest
        try:
            results = run_backtest_engine(ticker, start_date, end_date, config)
            logger.info(f"Backtest completed successfully for {ticker}")
            return create_success_response({'results': results})
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Backtest failed for {ticker}: {error_msg}")
            return create_error_response(
                f"Backtest failed: {error_msg}",
                500
            )
        
    except Exception as e:
        logger.error(f"Unexpected error in backtest endpoint: {e}", exc_info=True)
        return create_error_response(
            'Internal server error while processing backtest request',
            500
        )


@backtest_bp.route('/backtest/validate', methods=['POST'])
def validate_backtest_request_endpoint():
    """
    Validate a backtest request without running it.
    
    Request Body: Same as /backtest endpoint
    
    Returns:
        JSON response indicating if request is valid
        
    Example Response:
        {
            "success": true,
            "valid": true,
            "estimatedDuration": 120
        }
    """
    try:
        data = request.get_json()
        
        is_valid, error_message = validate_backtest_request(data)
        
        if not is_valid:
            return create_success_response({
                'valid': False,
                'error': error_message
            })
        
        # Estimate duration based on date range
        from datetime import datetime
        start = datetime.fromisoformat(data['startDate'].replace('Z', '+00:00'))
        end = datetime.fromisoformat(data['endDate'].replace('Z', '+00:00'))
        days_diff = (end - start).days
        
        # Rough estimate: ~0.5 seconds per trading day
        estimated_duration = max(int(days_diff * 0.5), 10)
        
        return create_success_response({
            'valid': True,
            'estimatedDuration': estimated_duration
        })
        
    except Exception as e:
        logger.error(f"Error validating backtest request: {e}", exc_info=True)
        return create_error_response(
            'Internal server error while validating request',
            500
        )


# Error handlers for this blueprint
@backtest_bp.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return create_error_response('Endpoint not found', 404)


@backtest_bp.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {error}", exc_info=True)
    return create_error_response('Internal server error', 500)
