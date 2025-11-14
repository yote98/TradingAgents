# Design Document

## Overview

The TradingAgents MCP Server is a Python-based Model Context Protocol server that exposes the TradingAgents multi-agent framework to AI assistants like Thesys C1. The server acts as a bridge between MCP clients and the existing TradingAgents system, translating MCP tool calls into TradingAgents operations and formatting results according to MCP specifications.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Thesys C1     │
│  (MCP Client)   │
└────────┬────────┘
         │ MCP Protocol
         │ (stdio/SSE)
         ▼
┌─────────────────────────────────────┐
│   TradingAgents MCP Server          │
│  ┌──────────────────────────────┐   │
│  │   MCP Protocol Layer         │   │
│  │  - Tool Registration         │   │
│  │  - Request Handling          │   │
│  │  - Response Formatting       │   │
│  └──────────┬───────────────────┘   │
│             │                        │
│  ┌──────────▼───────────────────┐   │
│  │   Tool Handlers              │   │
│  │  - analyze_stock             │   │
│  │  - backtest_strategy         │   │
│  │  - calculate_risk            │   │
│  │  - get_sentiment             │   │
│  └──────────┬───────────────────┘   │
│             │                        │
│  ┌──────────▼───────────────────┐   │
│  │   TradingAgents Adapter      │   │
│  │  - Graph Initialization      │   │
│  │  - State Management          │   │
│  │  - Result Formatting         │   │
│  └──────────┬───────────────────┘   │
└─────────────┼───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   TradingAgents Core System         │
│  - Multi-Agent Graph                │
│  - Analysts (Market, Fund, News)    │
│  - Researchers (Bull/Bear)          │
│  - Risk Management                  │
│  - Backtesting Engine               │
└─────────────────────────────────────┘
```

### Component Architecture

```
mcp_server/
├── server.py              # Main MCP server entry point
├── protocol/
│   ├── handler.py         # MCP protocol implementation
│   ├── schemas.py         # Tool and resource schemas
│   └── transport.py       # stdio/SSE transport layer
├── tools/
│   ├── analyze.py         # Stock analysis tool
│   ├── backtest.py        # Backtesting tool
│   ├── risk.py            # Risk calculation tool
│   └── sentiment.py       # Social sentiment tool
├── resources/
│   └── coach_plans.py     # Coach plans resource
├── adapters/
│   ├── tradingagents.py   # TradingAgents system adapter
│   ├── cache.py           # Result caching layer
│   └── formatter.py       # Response formatting
├── config/
│   ├── settings.py        # Configuration management
│   └── env.py             # Environment variable handling
└── utils/
    ├── logging.py         # Logging configuration
    ├── errors.py          # Error handling
    └── validation.py      # Input validation
```

## Components and Interfaces

### 1. MCP Protocol Layer

**Purpose:** Implements the Model Context Protocol specification for communication with MCP clients.

**Key Classes:**

```python
class MCPServer:
    """Main MCP server implementation"""
    
    def __init__(self, config: ServerConfig):
        self.config = config
        self.tools: Dict[str, Tool] = {}
        self.resources: Dict[str, Resource] = {}
        self.transport: Transport = None
    
    async def start(self) -> None:
        """Start the MCP server"""
        
    async def register_tool(self, tool: Tool) -> None:
        """Register a tool with the server"""
        
    async def register_resource(self, resource: Resource) -> None:
        """Register a resource with the server"""
        
    async def handle_request(self, request: MCPRequest) -> MCPResponse:
        """Handle incoming MCP requests"""

class Tool:
    """MCP tool definition"""
    
    name: str
    description: str
    input_schema: Dict[str, Any]
    handler: Callable
    
class Resource:
    """MCP resource definition"""
    
    uri: str
    name: str
    description: str
    mime_type: str
    handler: Callable
```

**Transport Options:**
- **stdio**: Standard input/output (default for C1 integration)
- **SSE**: Server-Sent Events over HTTP (for web-based clients)

### 2. Tool Handlers

**Purpose:** Implement the business logic for each MCP tool, translating tool calls into TradingAgents operations.

#### analyze_stock Tool

```python
class AnalyzeStockTool:
    """Stock analysis tool handler"""
    
    async def execute(
        self,
        ticker: str,
        analysts: List[str] = ["market", "fundamentals", "news", "social"],
        config: Optional[Dict[str, Any]] = None
    ) -> AnalysisResult:
        """
        Execute multi-agent stock analysis
        
        Args:
            ticker: Stock ticker symbol (e.g., "AAPL")
            analysts: List of analysts to include
            config: Optional configuration overrides
            
        Returns:
            AnalysisResult with reports, debate, and recommendation
        """
```

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "ticker": {
      "type": "string",
      "description": "Stock ticker symbol",
      "pattern": "^[A-Z]{1,5}$"
    },
    "analysts": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["market", "fundamentals", "news", "social"]
      },
      "default": ["market", "fundamentals", "news", "social"]
    },
    "config": {
      "type": "object",
      "properties": {
        "deep_think_llm": {"type": "string"},
        "quick_think_llm": {"type": "string"},
        "max_debate_rounds": {"type": "integer", "minimum": 1, "maximum": 5}
      }
    }
  },
  "required": ["ticker"]
}
```

**Output Format:**
```json
{
  "ticker": "AAPL",
  "timestamp": "2025-11-11T10:30:00Z",
  "analysts": {
    "market": {
      "summary": "...",
      "key_metrics": {...},
      "sentiment": "bullish"
    },
    "fundamentals": {...},
    "news": {...},
    "social": {...}
  },
  "debate": {
    "bull_case": "...",
    "bear_case": "...",
    "rounds": 2,
    "consensus": "..."
  },
  "recommendation": {
    "action": "BUY",
    "confidence": 0.75,
    "reasoning": "...",
    "price_target": 185.50,
    "stop_loss": 165.00
  },
  "execution_time_seconds": 45.2
}
```

#### backtest_strategy Tool

```python
class BacktestStrategyTool:
    """Backtesting tool handler"""
    
    async def execute(
        self,
        ticker: str,
        start_date: str,
        end_date: str,
        strategy_config: Dict[str, Any]
    ) -> BacktestResult:
        """Execute strategy backtest on historical data"""
```

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "ticker": {"type": "string"},
    "start_date": {"type": "string", "format": "date"},
    "end_date": {"type": "string", "format": "date"},
    "strategy_config": {
      "type": "object",
      "properties": {
        "initial_capital": {"type": "number", "default": 10000},
        "position_size_pct": {"type": "number", "default": 10},
        "stop_loss_pct": {"type": "number", "default": 2},
        "take_profit_pct": {"type": "number", "default": 5}
      }
    }
  },
  "required": ["ticker", "start_date", "end_date"]
}
```

#### calculate_risk Tool

```python
class CalculateRiskTool:
    """Risk calculation tool handler"""
    
    async def execute(
        self,
        ticker: str,
        account_value: float,
        risk_per_trade_pct: float,
        current_price: float,
        stop_loss_price: Optional[float] = None
    ) -> RiskResult:
        """Calculate position sizing and risk metrics"""
```

#### get_sentiment Tool

```python
class GetSentimentTool:
    """Social sentiment tool handler"""
    
    async def execute(
        self,
        ticker: str,
        sources: List[str] = ["twitter", "stocktwits", "reddit"],
        timeframe: str = "24h"
    ) -> SentimentResult:
        """Retrieve social media sentiment"""
```

### 3. TradingAgents Adapter

**Purpose:** Provides a clean interface between the MCP server and the TradingAgents core system.

```python
class TradingAgentsAdapter:
    """Adapter for TradingAgents system"""
    
    def __init__(self, config: TradingAgentsConfig):
        self.config = config
        self.graph: Optional[TradingAgentsGraph] = None
        self._initialized = False
    
    async def initialize(self) -> None:
        """Initialize TradingAgents graph"""
        if not self._initialized:
            self.graph = TradingAgentsGraph(
                deep_think_llm=self.config.deep_think_llm,
                quick_think_llm=self.config.quick_think_llm,
                config=self.config.to_dict()
            )
            self._initialized = True
    
    async def run_analysis(
        self,
        ticker: str,
        analysts: List[str],
        config_overrides: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Run multi-agent analysis"""
        await self.initialize()
        
        # Create initial state
        state = AgentState(
            ticker=ticker,
            enabled_analysts=analysts,
            **config_overrides or {}
        )
        
        # Execute graph
        result = await self.graph.ainvoke(state)
        
        return self._format_analysis_result(result)
    
    async def run_backtest(
        self,
        ticker: str,
        start_date: str,
        end_date: str,
        strategy_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Run backtest"""
        from tradingagents.backtesting import BacktestEngine
        
        engine = BacktestEngine(
            ticker=ticker,
            start_date=start_date,
            end_date=end_date,
            **strategy_config
        )
        
        result = await engine.run()
        return self._format_backtest_result(result)
    
    def _format_analysis_result(self, state: AgentState) -> Dict[str, Any]:
        """Format analysis result for MCP response"""
        return {
            "ticker": state.ticker,
            "timestamp": datetime.utcnow().isoformat(),
            "analysts": self._extract_analyst_reports(state),
            "debate": self._extract_debate_summary(state),
            "recommendation": self._extract_recommendation(state),
            "execution_time_seconds": state.execution_time
        }
```

### 4. Caching Layer

**Purpose:** Cache expensive operations to improve response times and reduce API costs.

```python
class CacheManager:
    """Manages caching for tool results"""
    
    def __init__(self, cache_dir: Path, ttl_seconds: int = 300):
        self.cache_dir = cache_dir
        self.ttl_seconds = ttl_seconds
        self._cache: Dict[str, CacheEntry] = {}
    
    async def get(self, key: str) -> Optional[Any]:
        """Get cached result"""
        
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Cache result"""
        
    def _generate_cache_key(self, tool_name: str, params: Dict) -> str:
        """Generate cache key from tool name and parameters"""
        param_str = json.dumps(params, sort_keys=True)
        return f"{tool_name}:{hashlib.md5(param_str.encode()).hexdigest()}"
```

**Caching Strategy:**
- **Stock Analysis**: Cache for 5 minutes (market data changes frequently)
- **Sentiment Data**: Cache for 5 minutes (social data is real-time)
- **Backtest Results**: Cache for 24 hours (historical data doesn't change)
- **Risk Calculations**: No caching (depends on current price)
- **Coach Plans**: Cache for 10 minutes (updated infrequently)

### 5. Configuration Management

**Purpose:** Manage server configuration from environment variables and config files.

```python
class ServerConfig:
    """MCP server configuration"""
    
    # Server settings
    host: str = "localhost"
    port: int = 3000
    transport: str = "stdio"  # or "sse"
    log_level: str = "INFO"
    
    # TradingAgents settings
    deep_think_llm: str = "gpt-4o-mini"
    quick_think_llm: str = "gpt-4o-mini"
    max_debate_rounds: int = 1
    
    # API keys
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    alpha_vantage_api_key: Optional[str] = None
    twitter_bearer_token: Optional[str] = None
    
    # Data vendors
    core_stock_apis: List[str] = ["yfinance"]
    technical_indicators: List[str] = ["yfinance"]
    fundamental_data: List[str] = ["yfinance"]
    news_data: List[str] = ["yfinance"]
    
    # Caching
    cache_enabled: bool = True
    cache_dir: str = ".cache/mcp"
    cache_ttl_seconds: int = 300
    
    @classmethod
    def from_env(cls) -> "ServerConfig":
        """Load configuration from environment variables"""
        return cls(
            host=os.getenv("MCP_HOST", "localhost"),
            port=int(os.getenv("MCP_PORT", "3000")),
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            # ... load other env vars
        )
```

**Environment Variables:**
```bash
# Server
MCP_HOST=localhost
MCP_PORT=3000
MCP_TRANSPORT=stdio
MCP_LOG_LEVEL=INFO

# LLM Configuration
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEEP_THINK_LLM=gpt-4o-mini
QUICK_THINK_LLM=gpt-4o-mini
MAX_DEBATE_ROUNDS=1

# Data APIs
ALPHA_VANTAGE_API_KEY=...
TWITTER_BEARER_TOKEN=...

# Caching
CACHE_ENABLED=true
CACHE_DIR=.cache/mcp
CACHE_TTL_SECONDS=300
```

## Data Models

### Analysis Result

```python
@dataclass
class AnalysisResult:
    ticker: str
    timestamp: datetime
    analysts: Dict[str, AnalystReport]
    debate: DebateSummary
    recommendation: TradingRecommendation
    execution_time_seconds: float
    
@dataclass
class AnalystReport:
    analyst_type: str  # "market", "fundamentals", "news", "social"
    summary: str
    key_metrics: Dict[str, Any]
    sentiment: str  # "bullish", "bearish", "neutral"
    confidence: float
    
@dataclass
class DebateSummary:
    bull_case: str
    bear_case: str
    rounds: int
    consensus: str
    key_points: List[str]
    
@dataclass
class TradingRecommendation:
    action: str  # "BUY", "SELL", "HOLD"
    confidence: float
    reasoning: str
    price_target: Optional[float]
    stop_loss: Optional[float]
    position_size_pct: Optional[float]
```

### Backtest Result

```python
@dataclass
class BacktestResult:
    ticker: str
    start_date: date
    end_date: date
    strategy_config: Dict[str, Any]
    performance: PerformanceMetrics
    trades: List[Trade]
    equity_curve: List[EquityPoint]
    
@dataclass
class PerformanceMetrics:
    total_return_pct: float
    annualized_return_pct: float
    sharpe_ratio: float
    max_drawdown_pct: float
    win_rate_pct: float
    total_trades: int
    avg_trade_return_pct: float
```

### Risk Result

```python
@dataclass
class RiskResult:
    ticker: str
    account_value: float
    risk_per_trade_pct: float
    current_price: float
    recommended_position_size: int
    position_value: float
    stop_loss_price: float
    risk_amount: float
    risk_reward_ratio: float
```

### Sentiment Result

```python
@dataclass
class SentimentResult:
    ticker: str
    timestamp: datetime
    overall_sentiment: float  # -1.0 to 1.0
    sentiment_label: str  # "very_bearish", "bearish", "neutral", "bullish", "very_bullish"
    volume_metrics: VolumeMetrics
    sources: Dict[str, SourceSentiment]
    trending_topics: List[str]
    
@dataclass
class SourceSentiment:
    source: str  # "twitter", "stocktwits", "reddit"
    sentiment_score: float
    post_count: int
    engagement: int
    top_posts: List[str]
```

## Error Handling

### Error Types

```python
class MCPError(Exception):
    """Base MCP error"""
    code: int
    message: str
    
class InvalidParameterError(MCPError):
    """Invalid tool parameter"""
    code = 400
    
class RateLimitError(MCPError):
    """API rate limit exceeded"""
    code = 429
    
class TimeoutError(MCPError):
    """Operation timeout"""
    code = 504
    
class InternalError(MCPError):
    """Internal server error"""
    code = 500
```

### Error Response Format

```json
{
  "error": {
    "code": 400,
    "message": "Invalid parameter: ticker must be 1-5 uppercase letters",
    "details": {
      "parameter": "ticker",
      "value": "apple",
      "expected": "^[A-Z]{1,5}$"
    }
  }
}
```

### Error Handling Strategy

1. **Input Validation**: Validate all parameters before execution
2. **Timeout Handling**: Set timeouts for all async operations
3. **Rate Limit Handling**: Implement exponential backoff for API calls
4. **Graceful Degradation**: Return partial results when possible
5. **Error Logging**: Log all errors with context for debugging

## Testing Strategy

### Unit Tests

- Test each tool handler independently
- Mock TradingAgents system responses
- Test input validation
- Test error handling
- Test caching logic

### Integration Tests

- Test MCP protocol compliance
- Test end-to-end tool execution
- Test with real TradingAgents system
- Test timeout handling
- Test concurrent requests

### MCP Client Tests

- Test with C1 MCP client
- Test tool discovery
- Test tool execution
- Test resource access
- Test error scenarios

### Performance Tests

- Measure tool execution times
- Test caching effectiveness
- Test concurrent request handling
- Measure memory usage

## Deployment

### Installation

```bash
# Install from PyPI
pip install tradingagents-mcp-server

# Or install from source
git clone https://github.com/yourusername/tradingagents-mcp-server
cd tradingagents-mcp-server
pip install -e .
```

### Running the Server

```bash
# Start with default config
tradingagents-mcp start

# Start with custom config
tradingagents-mcp start --config config.yaml

# Start with environment variables
export OPENAI_API_KEY=sk-...
tradingagents-mcp start
```

### C1 Integration

Add to C1's MCP configuration file:

```json
{
  "mcpServers": {
    "tradingagents": {
      "command": "tradingagents-mcp",
      "args": ["start"],
      "env": {
        "OPENAI_API_KEY": "sk-...",
        "ALPHA_VANTAGE_API_KEY": "...",
        "DEEP_THINK_LLM": "gpt-4o-mini",
        "MAX_DEBATE_ROUNDS": "1"
      }
    }
  }
}
```

### Docker Deployment

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
RUN pip install -e .

CMD ["tradingagents-mcp", "start"]
```

## Security Considerations

1. **API Key Management**: Never log or expose API keys
2. **Input Sanitization**: Validate and sanitize all user inputs
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Access Control**: Consider adding authentication for production use
5. **Data Privacy**: Don't log sensitive trading data

## Performance Optimization

1. **Caching**: Cache expensive operations (analysis, sentiment)
2. **Async Operations**: Use async/await for all I/O operations
3. **Connection Pooling**: Reuse HTTP connections for API calls
4. **Lazy Loading**: Initialize TradingAgents graph only when needed
5. **Result Streaming**: Stream large results instead of buffering

## Monitoring and Observability

1. **Metrics**: Track tool execution times, error rates, cache hit rates
2. **Logging**: Structured logging with correlation IDs
3. **Health Checks**: Expose health check endpoint
4. **Tracing**: Add distributed tracing for debugging
5. **Alerts**: Alert on high error rates or slow responses
