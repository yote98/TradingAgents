# TradingAgents/graph/setup.py

from typing import Dict, Any
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph, START
from langgraph.prebuilt import ToolNode

from tradingagents.agents import *
from tradingagents.agents.utils.agent_states import AgentState
from tradingagents.risk.risk_node import create_risk_calculator_node
from tradingagents.risk.risk_config import RiskConfig

from .conditional_logic import ConditionalLogic


class GraphSetup:
    """Handles the setup and configuration of the agent graph."""

    def __init__(
        self,
        quick_thinking_llm: ChatOpenAI,
        deep_thinking_llm: ChatOpenAI,
        tool_nodes: Dict[str, ToolNode],
        bull_memory,
        bear_memory,
        trader_memory,
        invest_judge_memory,
        risk_manager_memory,
        conditional_logic: ConditionalLogic,
        risk_config: RiskConfig = None,
    ):
        """Initialize with required components."""
        self.quick_thinking_llm = quick_thinking_llm
        self.deep_thinking_llm = deep_thinking_llm
        self.tool_nodes = tool_nodes
        self.bull_memory = bull_memory
        self.bear_memory = bear_memory
        self.trader_memory = trader_memory
        self.invest_judge_memory = invest_judge_memory
        self.risk_manager_memory = risk_manager_memory
        self.conditional_logic = conditional_logic
        self.risk_config = risk_config or RiskConfig.moderate()

    def setup_graph(
        self, selected_analysts=["market", "social", "news", "fundamentals"],
        selected_coaches=None, enable_coaches=False
    ):
        """Set up and compile the agent workflow graph.

        Args:
            selected_analysts (list): List of analyst types to include. Options are:
                - "market": Market analyst
                - "social": Social media analyst
                - "news": News analyst
                - "fundamentals": Fundamentals analyst
                - "options": Options analyst (options chain, Greeks, strategies)
                - "crypto": Crypto analyst (crypto market context and sentiment)
                - "macro": Macro analyst (economic indicators and market regime)
            selected_coaches (list): List of coach types to include. Options are:
                - "technical": Technical coach
                - "fundamental": Fundamental coach
                - "sentiment": Sentiment coach
                - "macro": Macro coach
            enable_coaches (bool): Whether to enable coach agents
        """
        if len(selected_analysts) == 0:
            raise ValueError("Trading Agents Graph Setup Error: no analysts selected!")
        
        if selected_coaches is None:
            selected_coaches = []

        # Create analyst nodes
        analyst_nodes = {}
        delete_nodes = {}
        tool_nodes = {}

        if "market" in selected_analysts:
            analyst_nodes["market"] = create_market_analyst(
                self.quick_thinking_llm
            )
            delete_nodes["market"] = create_msg_delete()
            tool_nodes["market"] = self.tool_nodes["market"]

        if "social" in selected_analysts:
            analyst_nodes["social"] = create_social_media_analyst(
                self.quick_thinking_llm
            )
            delete_nodes["social"] = create_msg_delete()
            tool_nodes["social"] = self.tool_nodes["social"]

        if "news" in selected_analysts:
            analyst_nodes["news"] = create_news_analyst(
                self.quick_thinking_llm
            )
            delete_nodes["news"] = create_msg_delete()
            tool_nodes["news"] = self.tool_nodes["news"]

        if "fundamentals" in selected_analysts:
            analyst_nodes["fundamentals"] = create_fundamentals_analyst(
                self.quick_thinking_llm
            )
            delete_nodes["fundamentals"] = create_msg_delete()
            tool_nodes["fundamentals"] = self.tool_nodes["fundamentals"]

        if "options" in selected_analysts:
            analyst_nodes["options"] = create_options_analyst(
                self.quick_thinking_llm
            )
            delete_nodes["options"] = create_msg_delete()
            # Options analyst doesn't need tools (uses LLM analysis only)
            tool_nodes["options"] = ToolNode([])

        if "crypto" in selected_analysts:
            analyst_nodes["crypto"] = create_crypto_analyst(
                self.quick_thinking_llm
            )
            delete_nodes["crypto"] = create_msg_delete()
            # Crypto analyst doesn't need tools (uses LLM analysis only)
            tool_nodes["crypto"] = ToolNode([])

        if "macro" in selected_analysts:
            analyst_nodes["macro"] = create_macro_analyst(
                self.quick_thinking_llm
            )
            delete_nodes["macro"] = create_msg_delete()
            # Macro analyst doesn't need tools (uses LLM analysis only)
            tool_nodes["macro"] = ToolNode([])

        # Create coach nodes if enabled
        coach_nodes = {}
        if enable_coaches:
            if "coach_d" in selected_coaches:
                coach_nodes["coach_d"] = create_coach_d(self.quick_thinking_llm)
            if "coach_i" in selected_coaches:
                coach_nodes["coach_i"] = create_coach_i(self.quick_thinking_llm)
            if "coach_s" in selected_coaches:
                coach_nodes["coach_s"] = create_coach_s(self.quick_thinking_llm)
            if "coach_n" in selected_coaches:
                coach_nodes["coach_n"] = create_coach_n(self.quick_thinking_llm)
            # Backward compatibility
            if "technical" in selected_coaches:
                coach_nodes["coach_d"] = create_coach_d(self.quick_thinking_llm)
            if "fundamental" in selected_coaches:
                coach_nodes["coach_i"] = create_coach_i(self.quick_thinking_llm)
            if "sentiment" in selected_coaches:
                coach_nodes["coach_s"] = create_coach_s(self.quick_thinking_llm)
            if "macro" in selected_coaches:
                coach_nodes["coach_n"] = create_coach_n(self.quick_thinking_llm)
        
        # Create researcher and manager nodes
        bull_researcher_node = create_bull_researcher(
            self.quick_thinking_llm, self.bull_memory
        )
        bear_researcher_node = create_bear_researcher(
            self.quick_thinking_llm, self.bear_memory
        )
        research_manager_node = create_research_manager(
            self.deep_thinking_llm, self.invest_judge_memory
        )
        trader_node = create_trader(self.quick_thinking_llm, self.trader_memory)

        # Create risk calculator node
        risk_calculator_node = create_risk_calculator_node(self.risk_config)
        
        # Create risk analysis nodes
        risky_analyst = create_risky_debator(self.quick_thinking_llm)
        neutral_analyst = create_neutral_debator(self.quick_thinking_llm)
        safe_analyst = create_safe_debator(self.quick_thinking_llm)
        risk_manager_node = create_risk_manager(
            self.deep_thinking_llm, self.risk_manager_memory
        )

        # Create workflow
        workflow = StateGraph(AgentState)

        # Add analyst nodes to the graph
        for analyst_type, node in analyst_nodes.items():
            workflow.add_node(f"{analyst_type.capitalize()} Analyst", node)
            workflow.add_node(
                f"Msg Clear {analyst_type.capitalize()}", delete_nodes[analyst_type]
            )
            workflow.add_node(f"tools_{analyst_type}", tool_nodes[analyst_type])

        # Add coach nodes to the graph
        for coach_type, node in coach_nodes.items():
            # Format coach names properly (Coach D, Coach I, etc.)
            if coach_type.startswith("coach_"):
                coach_name = f"Coach {coach_type.split('_')[1].upper()}"
            else:
                coach_name = f"{coach_type.capitalize()} Coach"
            workflow.add_node(coach_name, node)
        
        # Add other nodes
        workflow.add_node("Bull Researcher", bull_researcher_node)
        workflow.add_node("Bear Researcher", bear_researcher_node)
        workflow.add_node("Research Manager", research_manager_node)
        workflow.add_node("Trader", trader_node)
        workflow.add_node("Risk Calculator", risk_calculator_node)
        workflow.add_node("Risky Analyst", risky_analyst)
        workflow.add_node("Neutral Analyst", neutral_analyst)
        workflow.add_node("Safe Analyst", safe_analyst)
        workflow.add_node("Risk Judge", risk_manager_node)

        # Define edges
        # Start with the first analyst
        first_analyst = selected_analysts[0]
        workflow.add_edge(START, f"{first_analyst.capitalize()} Analyst")

        # Connect analysts in sequence
        for i, analyst_type in enumerate(selected_analysts):
            current_analyst = f"{analyst_type.capitalize()} Analyst"
            current_tools = f"tools_{analyst_type}"
            current_clear = f"Msg Clear {analyst_type.capitalize()}"

            # Add conditional edges for current analyst
            workflow.add_conditional_edges(
                current_analyst,
                getattr(self.conditional_logic, f"should_continue_{analyst_type}"),
                [current_tools, current_clear],
            )
            workflow.add_edge(current_tools, current_analyst)

            # Connect to next analyst or to coaches/Bull Researcher if this is the last analyst
            if i < len(selected_analysts) - 1:
                next_analyst = f"{selected_analysts[i+1].capitalize()} Analyst"
                workflow.add_edge(current_clear, next_analyst)
            else:
                # After last analyst, go to coaches if enabled, otherwise to Bull Researcher
                if enable_coaches and len(selected_coaches) > 0:
                    first_coach_type = selected_coaches[0]
                    if first_coach_type.startswith("coach_"):
                        first_coach = f"Coach {first_coach_type.split('_')[1].upper()}"
                    else:
                        first_coach = f"{first_coach_type.capitalize()} Coach"
                    workflow.add_edge(current_clear, first_coach)
                else:
                    workflow.add_edge(current_clear, "Bull Researcher")
        
        # Connect coaches in sequence
        if enable_coaches:
            for i, coach_type in enumerate(selected_coaches):
                if coach_type.startswith("coach_"):
                    current_coach = f"Coach {coach_type.split('_')[1].upper()}"
                else:
                    current_coach = f"{coach_type.capitalize()} Coach"
                
                # Connect to next coach or to Bull Researcher if this is the last coach
                if i < len(selected_coaches) - 1:
                    next_coach_type = selected_coaches[i+1]
                    if next_coach_type.startswith("coach_"):
                        next_coach = f"Coach {next_coach_type.split('_')[1].upper()}"
                    else:
                        next_coach = f"{next_coach_type.capitalize()} Coach"
                    workflow.add_edge(current_coach, next_coach)
                else:
                    workflow.add_edge(current_coach, "Bull Researcher")

        # Add remaining edges
        workflow.add_conditional_edges(
            "Bull Researcher",
            self.conditional_logic.should_continue_debate,
            {
                "Bear Researcher": "Bear Researcher",
                "Research Manager": "Research Manager",
            },
        )
        workflow.add_conditional_edges(
            "Bear Researcher",
            self.conditional_logic.should_continue_debate,
            {
                "Bull Researcher": "Bull Researcher",
                "Research Manager": "Research Manager",
            },
        )
        workflow.add_edge("Research Manager", "Trader")
        workflow.add_edge("Trader", "Risk Calculator")
        workflow.add_edge("Risk Calculator", "Risky Analyst")
        workflow.add_conditional_edges(
            "Risky Analyst",
            self.conditional_logic.should_continue_risk_analysis,
            {
                "Safe Analyst": "Safe Analyst",
                "Risk Judge": "Risk Judge",
            },
        )
        workflow.add_conditional_edges(
            "Safe Analyst",
            self.conditional_logic.should_continue_risk_analysis,
            {
                "Neutral Analyst": "Neutral Analyst",
                "Risk Judge": "Risk Judge",
            },
        )
        workflow.add_conditional_edges(
            "Neutral Analyst",
            self.conditional_logic.should_continue_risk_analysis,
            {
                "Risky Analyst": "Risky Analyst",
                "Risk Judge": "Risk Judge",
            },
        )

        workflow.add_edge("Risk Judge", END)

        # Compile and return
        return workflow.compile()
