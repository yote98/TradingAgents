"""
Options Analyst Agent

Analyzes options data including options chains, Greeks, implied volatility,
and identifies potential options trading strategies.
"""
import logging
from typing import Dict, Any
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)


def create_options_analyst(llm: ChatOpenAI):
    """
    Create an Options Analyst agent node.
    
    Args:
        llm: Language model for analysis
    
    Returns:
        Agent node function
    """
    
    def options_analyst_node(state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze options data and generate insights.
        
        Args:
            state: Current agent state
        
        Returns:
            Updated state with options_report
        """
        try:
            ticker = state.get("company_of_interest", "UNKNOWN")
            logger.info(f"Options Analyst analyzing {ticker}")
            
            # Create analysis prompt
            prompt = f"""You are an expert Options Analyst. Analyze options data for {ticker}.

Your analysis should include:
1. **Options Chain Overview**: Summary of available strikes, expiration dates, and liquidity
2. **Implied Volatility Analysis**: Current IV levels, IV percentile, and IV skew
3. **Greeks Analysis**: Key Greeks (Delta, Gamma, Theta, Vega) and their implications
4. **Put/Call Ratio**: Analysis of put/call ratio and market sentiment
5. **Options Strategies**: Potential strategies (covered calls, spreads, straddles, etc.)
6. **Risk Assessment**: Key risks and considerations for options trading

Note: Since we don't have real-time options data in this analysis, provide a framework
for how you would analyze options data if it were available, and what key metrics
you would look for.

Provide a structured, actionable analysis."""
            
            # Get LLM analysis
            messages = [HumanMessage(content=prompt)]
            response = llm.invoke(messages)
            
            report = f"""=== OPTIONS ANALYSIS FOR {ticker} ===

{response.content}

---
Note: This is a framework analysis. In production, this would include:
- Real-time options chain data from Alpha Vantage REALTIME_OPTIONS
- Historical IV data and percentiles
- Greeks calculations for all strikes
- Volume and open interest analysis
- Max pain calculations
"""
            
            logger.info(f"Options Analyst completed analysis for {ticker}")
            
            return {
                "options_report": report,
                "sender": "Options Analyst"
            }
            
        except Exception as e:
            logger.error(f"Error in Options Analyst: {e}", exc_info=True)
            return {
                "options_report": f"Options analysis unavailable: {str(e)}",
                "sender": "Options Analyst"
            }
    
    return options_analyst_node
