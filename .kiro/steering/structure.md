# Project Structure and Conventions

## Architecture Pattern

TradingAgents follows a **multi-agent workflow architecture** using LangGraph:

1. **Analyst Layer**: Parallel data gathering and analysis
2. **Research Layer**: Debate-based decision making (Bull vs Bear)
3. **Trading Layer**: Action proposal based on research
4. **Risk Layer**: Multi-perspective risk evaluation
5. **Portfolio Layer**: Final approval/rejection

## Code Organization

### Core Package (`tradingagents/`)

- **`agents/`**: Individual agent implementations
  - Each agent has specific tools and prompts
  - Agents communicate via shared state objects
  - Memory system for learning from past decisions
  
- **`dataflows/`**: Data abstraction layer
  - Vendor-agnostic data fetching (yfinance, Alpha Vantage, local)
  - Caching to avoid rate limits
  - Abstract methods in `agent_utils.py` route to correct vendor

- **`graph/`**: Workflow orchestration
  - `trading_graph.py`: Main entry point and graph setup
  - `setup.py`: Graph node and edge configuration
  - `conditional_logic.py`: Routing logic between agents
  - `propagation.py`: State initialization and execution
  - `reflection.py`: Post-decision learning
  - `signal_processing.py`: Decision extraction

- **`integrations/`**: External services
  - Discord webhooks for coach communication
  - Extensible for other integrations

### Supporting Directories

- **`cli/`**: Interactive terminal interface with rich UI
- **`examples/`**: Standalone usage examples
- **`docs/`**: Detailed documentation on system components
- **`eval_results/`**: Generated analysis results (gitignored)

## Key Files

- **`main.py`**: Basic usage example
- **`demo_complete_system.py`**: Full system demonstration
- **`default_config.py`**: Central configuration (LLMs, data vendors, debate rounds)
- **`.env`**: API keys and secrets (never commit)

## State Management

Agents communicate through typed state objects:
- **`AgentState`**: Main workflow state with all reports and decisions
- **`InvestDebateState`**: Bull/Bear debate tracking
- **`RiskDebateState`**: Risk team debate tracking

States flow through the graph, accumulating information at each step.

## Naming Conventions

- **Agents**: Descriptive names (e.g., `market_analyst`, `bull_researcher`, `risk_manager`)
- **Reports**: Stored in state as `{agent}_report` (e.g., `market_report`, `fundamentals_report`)
- **Tools**: Prefixed with action (e.g., `get_stock_data`, `get_fundamentals`, `get_news`)
- **Config Keys**: Snake_case (e.g., `deep_think_llm`, `max_debate_rounds`)

## Data Flow Pattern

```
API/Data Source → dataflows/agent_utils.py → Tool Functions → Agent → State → Next Agent
```

All data fetching goes through abstract methods that route to configured vendor.

## Extension Points

- **New Analysts**: Add to `agents/` and register in graph setup
- **New Data Sources**: Implement vendor in `dataflows/` and add to config
- **New LLM Providers**: Add to `trading_graph.py` initialization
- **New Integrations**: Add to `integrations/` and wire into graph

## File Outputs

- **Logs**: `eval_results/{ticker}/TradingAgentsStrategy_logs/full_states_log_{date}.json`
- **Reports**: `results/{ticker}/{date}/reports/*.md` (when using CLI)
- **Cache**: `tradingagents/dataflows/data_cache/` (JSON files)

## Configuration Hierarchy

1. Environment variables (`.env`)
2. `DEFAULT_CONFIG` in `default_config.py`
3. Runtime config overrides (passed to `TradingAgentsGraph`)

## Testing Approach

- Use `debug=True` to see agent reasoning
- Start with cheap models (`gpt-4o-mini`) for testing
- Use `max_debate_rounds=1` to reduce API calls
- Enable data caching to avoid repeated API hits
- Check `eval_results/` for detailed state logs

## Coach System (Optional)

Coaches are **external** to the main agent workflow:
- Post plans to Discord channels
- Bot stores plans with timestamps and images
- System fetches relevant plans during analysis
- Treated as additional context, not required for operation
