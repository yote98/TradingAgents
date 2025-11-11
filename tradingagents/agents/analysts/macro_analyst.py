"""
Macro Analyst Agent

Analyzes macroeconomic indicators, economic cycles, monetary policy,
and their implications for financial markets.
"""
import logging
from typing import Dict, Any
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)


def create_macro_analyst(llm: ChatOpenAI):
    """
    Create a Macro Analyst agent node.
    
    Args:
        llm: Language model for analysis
    
    Returns:
        Agent node function
    """
    
    def macro_analyst_node(state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze macroeconomic indicators and generate insights.
        
        Args:
            state: Current agent state
        
        Returns:
            Updated state with macro_report
        """
        try:
            ticker = state.get("company_of_interest", "UNKNOWN")
            trade_date = state.get("trade_date", "today")
            logger.info(f"Macro Analyst analyzing economic environment for {ticker}")
            
            # Create analysis prompt
            prompt = f"""You are an expert Macroeconomic Analyst. Analyze the current macroeconomic environment and its implications for {ticker} as of {trade_date}.

Your analysis should include:

1. **Economic Cycle Assessment**:
   - Current phase of the economic cycle (expansion, peak, contraction, trough)
   - Leading indicators and their trends
   - Economic growth outlook (GDP trends)

2. **Monetary Policy Analysis**:
   - Federal Reserve policy stance (hawkish/dovish)
   - Interest rate environment and trajectory
   - Yield curve analysis (normal, flat, inverted)
   - Implications for equity valuations

3. **Inflation Environment**:
   - Current inflation levels (CPI trends)
   - Inflation expectations
   - Impact on corporate margins and consumer spending

4. **Employment & Consumer Health**:
   - Unemployment trends
   - Labor market tightness
   - Consumer confidence and spending power

5. **Market Regime**:
   - Risk-on vs risk-off environment
   - Sector rotation implications
   - Asset allocation considerations

6. **Sector-Specific Impact**:
   - How current macro conditions affect {ticker}'s sector
   - Cyclical vs defensive positioning
   - Interest rate sensitivity

7. **Key Risks & Opportunities**:
   - Macro risks to monitor
   - Potential catalysts from economic data
   - Timing considerations for entry/exit

Provide a structured analysis with clear implications for trading {ticker}."""
            
            # Get LLM analysis
            messages = [HumanMessage(content=prompt)]
            response = llm.invoke(messages)
            
            report = f"""=== MACROECONOMIC ANALYSIS FOR {ticker} ===
Date: {trade_date}

{response.content}

---
Note: This analysis provides macro context. In production, this would include:
- Real-time economic data from Alpha Vantage:
  * REAL_GDP - Economic growth trends
  * UNEMPLOYMENT - Labor market conditions
  * CPI - Inflation levels
  * INFLATION - Inflation rates
  * FEDERAL_FUNDS_RATE - Monetary policy stance
  * TREASURY_YIELD - Yield curve analysis
- Historical economic indicator trends
- Correlation analysis with market performance
- Quantitative macro regime indicators
"""
            
            logger.info(f"Macro Analyst completed analysis for {ticker}")
            
            return {
                "macro_report": report,
                "sender": "Macro Analyst"
            }
            
        except Exception as e:
            logger.error(f"Error in Macro Analyst: {e}", exc_info=True)
            return {
                "macro_report": f"Macro analysis unavailable: {str(e)}",
                "sender": "Macro Analyst"
            }
    
    return macro_analyst_node
