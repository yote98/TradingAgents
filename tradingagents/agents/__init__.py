from .utils.agent_utils import create_msg_delete
from .utils.agent_states import AgentState, InvestDebateState, RiskDebateState
from .utils.memory import FinancialSituationMemory

from .analysts.fundamentals_analyst import create_fundamentals_analyst
from .analysts.market_analyst import create_market_analyst
from .analysts.news_analyst import create_news_analyst
from .analysts.social_media_analyst import create_social_media_analyst
from .analysts.options_analyst import create_options_analyst
from .analysts.crypto_analyst import create_crypto_analyst
from .analysts.macro_analyst import create_macro_analyst

from .coaches.technical_coach import create_coach_d, create_technical_coach
from .coaches.fundamental_coach import create_coach_i, create_fundamental_coach
from .coaches.sentiment_coach import create_coach_s, create_sentiment_coach
from .coaches.macro_coach import create_coach_n, create_macro_coach

from .researchers.bear_researcher import create_bear_researcher
from .researchers.bull_researcher import create_bull_researcher

from .risk_mgmt.aggresive_debator import create_risky_debator
from .risk_mgmt.conservative_debator import create_safe_debator
from .risk_mgmt.neutral_debator import create_neutral_debator

from .managers.research_manager import create_research_manager
from .managers.risk_manager import create_risk_manager

from .trader.trader import create_trader

__all__ = [
    "FinancialSituationMemory",
    "AgentState",
    "create_msg_delete",
    "InvestDebateState",
    "RiskDebateState",
    "create_bear_researcher",
    "create_bull_researcher",
    "create_research_manager",
    "create_fundamentals_analyst",
    "create_market_analyst",
    "create_neutral_debator",
    "create_news_analyst",
    "create_risky_debator",
    "create_risk_manager",
    "create_safe_debator",
    "create_social_media_analyst",
    "create_options_analyst",
    "create_crypto_analyst",
    "create_macro_analyst",
    "create_trader",
    "create_coach_d",
    "create_coach_i",
    "create_coach_s",
    "create_coach_n",
    "create_technical_coach",  # Backward compatibility
    "create_fundamental_coach",  # Backward compatibility
    "create_sentiment_coach",  # Backward compatibility
    "create_macro_coach",  # Backward compatibility
]
