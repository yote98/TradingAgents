"""
Analysis API Routes

Provides REST endpoints for running stock analyses using TradingAgents.
"""

import logging
from flask import Blueprint, jsonify, request
from datetime import datetime
from typing import Dict, Any, List
import traceback

logger = logging.getLogger(__name__)

# Create Blueprint for analysis routes
analysis_bp = Blueprint('analysis', __name__, url_prefix='/api')


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


def validate_analysis_request(data: Dict[str, Any]) -> tuple[bool, str]:
    """
    Validate analysis request data.
    
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
    
    # Check analysts field
    if 'analysts' not in data:
        return False, "analysts field is required"
    
    analysts = data['analysts']
    if not isinstance(analysts, list) or len(analysts) == 0:
        return False, "analysts must be a non-empty list"
    
    valid_analysts = ['market', 'fundamentals', 'news', 'social']
    for analyst in analysts:
        if analyst not in valid_analysts:
            return False, f"Invalid analyst: {analyst}. Valid analysts: {', '.join(valid_analysts)}"
    
    # Check config field
    if 'config' not in data:
        return False, "config field is required"
    
    config = data['config']
    if not isinstance(config, dict):
        return False, "config must be an object"
    
    # Validate config fields
    if 'maxDebateRounds' in config:
        rounds = config['maxDebateRounds']
        if not isinstance(rounds, int) or rounds < 1 or rounds > 10:
            return False, "maxDebateRounds must be an integer between 1 and 10"
    
    if 'deepThinkModel' in config:
        model = config['deepThinkModel']
        if not isinstance(model, str) or not model:
            return False, "deepThinkModel must be a non-empty string"
    
    if 'quickThinkModel' in config:
        model = config['quickThinkModel']
        if not isinstance(model, str) or not model:
            return False, "quickThinkModel must be a non-empty string"
    
    return True, ""


def run_trading_agents_analysis(ticker: str, analysts: List[str], config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run TradingAgents analysis.
    
    Args:
        ticker: Stock ticker symbol
        analysts: List of analyst types to use
        config: Analysis configuration
        
    Returns:
        Analysis results dictionary
    """
    try:
        from tradingagents.graph.trading_graph import TradingAgentsGraph
        from tradingagents.default_config import DEFAULT_CONFIG
        
        # Create custom config based on request
        custom_config = DEFAULT_CONFIG.copy()
        custom_config['deep_think_llm'] = config.get('deepThinkModel', 'gpt-4o-mini')
        custom_config['quick_think_llm'] = config.get('quickThinkModel', 'gpt-4o-mini')
        custom_config['max_debate_rounds'] = config.get('maxDebateRounds', 1)
        
        # Initialize TradingAgents graph
        logger.info(f"Initializing TradingAgents for {ticker} with analysts: {analysts}")
        graph = TradingAgentsGraph(
            selected_analysts=analysts,
            debug=False,
            config=custom_config
        )
        
        # Run analysis
        logger.info(f"Running analysis for {ticker}")
        final_state, signal = graph.run(ticker, str(datetime.now().date()))
        
        # Extract results
        results = {
            'ticker': ticker,
            'timestamp': datetime.now().isoformat(),
            'analystReports': {},
            'bullArguments': [],
            'bearArguments': [],
            'finalDecision': 'HOLD',
            'confidence': 0.5,
            'reasoning': ''
        }
        
        # Extract analyst reports
        if 'market' in analysts and final_state.get('market_report'):
            results['analystReports']['market'] = final_state['market_report']
        
        if 'fundamentals' in analysts and final_state.get('fundamentals_report'):
            results['analystReports']['fundamentals'] = final_state['fundamentals_report']
        
        if 'news' in analysts and final_state.get('news_report'):
            results['analystReports']['news'] = final_state['news_report']
        
        if 'social' in analysts and final_state.get('sentiment_report'):
            results['analystReports']['social'] = final_state['sentiment_report']
        
        # Extract debate arguments
        debate_state = final_state.get('investment_debate_state', {})
        if debate_state:
            # Extract bull arguments from bull history
            bull_history = debate_state.get('bull_history', [])
            for entry in bull_history:
                if isinstance(entry, dict) and 'content' in entry:
                    results['bullArguments'].append(entry['content'])
                elif isinstance(entry, str):
                    results['bullArguments'].append(entry)
            
            # Extract bear arguments from bear history
            bear_history = debate_state.get('bear_history', [])
            for entry in bear_history:
                if isinstance(entry, dict) and 'content' in entry:
                    results['bearArguments'].append(entry['content'])
                elif isinstance(entry, str):
                    results['bearArguments'].append(entry)
            
            # Get judge decision
            judge_decision = debate_state.get('judge_decision', '')
            if judge_decision:
                results['reasoning'] = judge_decision
        
        # Extract final decision
        final_decision = final_state.get('final_trade_decision', 'HOLD')
        if signal:
            results['finalDecision'] = signal.upper()
        elif 'BUY' in final_decision.upper():
            results['finalDecision'] = 'BUY'
        elif 'SELL' in final_decision.upper():
            results['finalDecision'] = 'SELL'
        else:
            results['finalDecision'] = 'HOLD'
        
        # Calculate confidence (simplified - could be enhanced)
        if results['finalDecision'] == 'BUY':
            results['confidence'] = 0.7 + (len(results['bullArguments']) * 0.05)
        elif results['finalDecision'] == 'SELL':
            results['confidence'] = 0.7 + (len(results['bearArguments']) * 0.05)
        else:
            results['confidence'] = 0.5
        
        results['confidence'] = min(results['confidence'], 0.95)
        
        # Add investment plan if available
        if final_state.get('investment_plan'):
            if not results['reasoning']:
                results['reasoning'] = final_state['investment_plan']
            else:
                results['reasoning'] += f"\n\nInvestment Plan:\n{final_state['investment_plan']}"
        
        logger.info(f"Analysis completed for {ticker}: {results['finalDecision']}")
        return results
        
    except ImportError as e:
        logger.error(f"Failed to import TradingAgents: {e}")
        raise Exception("TradingAgents system is not available. Please ensure it is properly installed.")
    except Exception as e:
        logger.error(f"Error running TradingAgents analysis: {e}")
        logger.error(traceback.format_exc())
        raise


@analysis_bp.route('/analyze', methods=['POST'])
def analyze():
    """
    Run stock analysis using TradingAgents.
    
    Request Body:
        {
            "ticker": "AAPL",
            "analysts": ["market", "fundamentals", "news", "social"],
            "config": {
                "maxDebateRounds": 1,
                "deepThinkModel": "gpt-4o-mini",
                "quickThinkModel": "gpt-4o-mini"
            }
        }
    
    Returns:
        JSON response with analysis results
        
    Example Response:
        {
            "success": true,
            "results": {
                "ticker": "AAPL",
                "timestamp": "2024-01-15T10:30:00Z",
                "analystReports": {
                    "market": "Market analysis...",
                    "fundamentals": "Fundamental analysis..."
                },
                "bullArguments": ["Argument 1", "Argument 2"],
                "bearArguments": ["Argument 1", "Argument 2"],
                "finalDecision": "BUY",
                "confidence": 0.75,
                "reasoning": "Detailed reasoning..."
            }
        }
    """
    try:
        # Get request data
        data = request.get_json()
        
        # Validate request
        is_valid, error_message = validate_analysis_request(data)
        if not is_valid:
            logger.warning(f"Invalid analysis request: {error_message}")
            return create_error_response(error_message, 400)
        
        ticker = data['ticker']
        analysts = data['analysts']
        config = data['config']
        
        logger.info(f"Received analysis request for {ticker} with analysts: {analysts}")
        
        # Run analysis
        try:
            results = run_trading_agents_analysis(ticker, analysts, config)
            logger.info(f"Analysis completed successfully for {ticker}")
            return create_success_response({'results': results})
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Analysis failed for {ticker}: {error_msg}")
            return create_error_response(
                f"Analysis failed: {error_msg}",
                500
            )
        
    except Exception as e:
        logger.error(f"Unexpected error in analyze endpoint: {e}", exc_info=True)
        return create_error_response(
            'Internal server error while processing analysis request',
            500
        )


@analysis_bp.route('/analyze/validate', methods=['POST'])
def validate_analyze_request():
    """
    Validate an analysis request without running it.
    
    Request Body: Same as /analyze endpoint
    
    Returns:
        JSON response indicating if request is valid
        
    Example Response:
        {
            "success": true,
            "valid": true,
            "estimatedCost": 0.15
        }
    """
    try:
        data = request.get_json()
        
        is_valid, error_message = validate_analysis_request(data)
        
        if not is_valid:
            return create_success_response({
                'valid': False,
                'error': error_message
            })
        
        # Estimate cost (simplified)
        analysts = data['analysts']
        config = data['config']
        rounds = config.get('maxDebateRounds', 1)
        
        base_cost = len(analysts) * 0.05
        model_multiplier = 1.0
        if 'gpt-4' in config.get('deepThinkModel', ''):
            model_multiplier = 3.0
        
        estimated_cost = base_cost * model_multiplier * (1 + (rounds - 1) * 0.5)
        
        return create_success_response({
            'valid': True,
            'estimatedCost': round(estimated_cost, 2)
        })
        
    except Exception as e:
        logger.error(f"Error validating analysis request: {e}", exc_info=True)
        return create_error_response(
            'Internal server error while validating request',
            500
        )


# Error handlers for this blueprint
@analysis_bp.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return create_error_response('Endpoint not found', 404)


@analysis_bp.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {error}", exc_info=True)
    return create_error_response('Internal server error', 500)
