"""
Crypto Analyst Agent

Analyzes cryptocurrency markets including price trends, volume patterns,
and digital asset market dynamics.
"""
import logging
from typing import Dict, Any
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)


def create_crypto_analyst(llm: ChatOpenAI):
    """
    Create a Crypto Analyst agent node.
    
    Args:
        llm: Language model for analysis
    
    Returns:
        Agent node function
    """
    
    def crypto_analyst_node(state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze cryptocurrency market data and generate insights.
        
        Args:
            state: Current agent state
        
        Returns:
            Updated state with crypto_report
        """
        try:
            ticker = state.get("company_of_interest", "UNKNOWN")
            logger.info(f"Crypto Analyst analyzing {ticker}")
            
            # Create analysis prompt
            prompt = f"""You are an expert Cryptocurrency Analyst. Analyze the crypto market context for {ticker}.

Your analysis should include:
1. **Crypto Market Overview**: Current state of major cryptocurrencies (BTC, ETH)
2. **Market Sentiment**: Overall crypto market sentiment and risk appetite
3. **Correlation Analysis**: How traditional markets correlate with crypto
4. **Volatility Assessment**: Crypto market volatility and its implications
5. **Regulatory Environment**: Recent regulatory developments affecting crypto
6. **Institutional Activity**: Institutional adoption and investment trends
7. **Impact on Traditional Assets**: How crypto market affects stock trading

Even though {ticker} may not be a cryptocurrency, analyze how the broader crypto
market environment might impact traditional financial markets and this stock.

Provide insights on:
- Whether crypto market trends suggest risk-on or risk-off sentiment
- How crypto volatility might affect traditional market volatility
- Whether institutional money is flowing into or out of crypto vs stocks

Provide a structured, actionable analysis."""
            
            # Get LLM analysis
            messages = [HumanMessage(content=prompt)]
            response = llm.invoke(messages)
            
            report = f"""=== CRYPTO MARKET ANALYSIS (Context for {ticker}) ===

{response.content}

---
Note: This analysis provides crypto market context. In production, this would include:
- Real-time crypto price data from Alpha Vantage CRYPTO_INTRADAY
- Historical crypto data (daily, weekly, monthly)
- Crypto market cap and volume data
- Correlation analysis with traditional markets
- On-chain metrics and indicators
"""
            
            logger.info(f"Crypto Analyst completed analysis for {ticker}")
            
            return {
                "crypto_report": report,
                "sender": "Crypto Analyst"
            }
            
        except Exception as e:
            logger.error(f"Error in Crypto Analyst: {e}", exc_info=True)
            return {
                "crypto_report": f"Crypto analysis unavailable: {str(e)}",
                "sender": "Crypto Analyst"
            }
    
    return crypto_analyst_node
