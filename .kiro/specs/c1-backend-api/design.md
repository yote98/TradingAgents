# Design Document

## Overview

The C1 Backend API is a Flask-based REST API that serves as the bridge between the C1 frontend application and the TradingAgents system. It provides endpoints for fetching coach plans from the Discord Enhancement system and triggering stock analysis through the TradingAgents multi-agent framework.

The API is designed to be lightweight, easy to deploy, and compatible with the existing TradingAgents architecture. It reuses the Discord Enhancement storage layer and integrates seamlessly with the existing coach system.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  C1 Frontend    │
│  (Next.js)      │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Flask API      │
│  (Port 5000)    │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ Discord │ │ TradingAgents│
│Enhanced │ │   Analysis   │
│ Storage │ │    Engine    │
└─────────┘ └──────────────┘
```

### Component Layers

1. **API Layer**: Flask routes and request handling
2. **Service Layer**: Business logic for coach plans and analysis
3. **Integration Layer**: Interfaces with Discord Enhancement and TradingAgents
4. **Configuration Layer**: Environment-based configuration management

## Components and Interfaces

### 1. Flask Application (`c1_api_server.py`)

Main entry point for the API server.

**Responsibilities:**
- Initialize Flask app with CORS configuration
- Register API routes
- Configure logging
- Start the development server

**Key Methods:**
```python
def create_app(config=None) -> Flask:
    """Create and configure Flask application"""
    
def setup_cors(app: Flask) -> None:
    """Configure CORS for frontend access"""
    
def setup_logging(app: Flask) -> None:
    """Configure application logging"""
```

### 2. API Routes (`routes/`)

#### Coach Plans Routes (`routes/coach_plans.py`)

**Endpoints:**
- `GET /api/coach-plans/all` - Fetch all coach plans
- `GET /api/coach-plans/<coach_id>` - Fetch specific coach plan

**Response Format:**
```json
{
  "coach_d": {
    "plan": "Trading plan text...",
    "created_at": "2024-01-15T10:30:00Z",
    "charts": ["chart1.png"]
  }
}
```

#### Analysis Routes (`routes/analysis.py`)

**Endpoints:**
- `POST /api/analyze` - Run TradingAgents analysis

**Request Format:**
```json
{
  "ticker": "AAPL",
  "config": {
    "deep_think_llm": "gpt-4o-mini",
    "quick_think_llm": "gpt-4o-mini",
    "max_debate_rounds": 1
  }
}
```

**Response Format:**
```json
{
  "ticker": "AAPL",
  "decision": "BUY",
  "confidence": 0.75,
  "reports": {
    "market": "Market analysis...",
    "fundamentals": "Fundamental analysis..."
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### System Routes (`routes/system.py`)

**Endpoints:**
- `GET /health` - Health check
- `GET /metrics` - API metrics

### 3. Service Layer (`services/`)

#### Coach Plans Service (`services/coach_service.py`)

**Responsibilities:**
- Interface with Discord Enhancement storage
- Fetch and format coach plans
- Handle mock mode for testing

**Key Methods:**
```python
def get_all_coach_plans() -> Dict[str, CoachPlan]:
    """Fetch all available coach plans"""
    
def get_coach_plan(coach_id: str) -> CoachPlan:
    """Fetch specific coach plan"""
    
def is_mock_mode() -> bool:
    """Check if running in mock mode"""
```

#### Analysis Service (`services/analysis_service.py`)

**Responsibilities:**
- Initialize TradingAgents graph
- Run stock analysis
- Format analysis results

**Key Methods:**
```python
def run_analysis(ticker: str, config: Dict) -> AnalysisResult:
    """Execute TradingAgents analysis"""
    
def format_analysis_result(state: AgentState) -> Dict:
    """Format analysis state into API response"""
```

### 4. Configuration (`config.py`)

**Configuration Parameters:**
- `API_HOST`: Server host (default: "0.0.0.0")
- `API_PORT`: Server port (default: 5000)
- `DEBUG_MODE`: Enable debug mode (default: False)
- `CORS_ORIGINS`: Allowed CORS origins (default: ["http://localhost:3000"])
- `USE_MOCK_MODE`: Enable mock data (default: False)
- `DISCORD_BOT_TOKEN`: Discord bot token (optional)

### 5. Error Handling

**Error Response Format:**
```json
{
  "error": "Error message",
  "status": 404,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Types:**
- 400: Bad Request (invalid parameters)
- 404: Not Found (coach not found)
- 500: Internal Server Error (analysis failure)

## Data Models

### CoachPlan

```python
@dataclass
class CoachPlan:
    plan: str
    created_at: str
    charts: List[str]
```

### AnalysisRequest

```python
@dataclass
class AnalysisRequest:
    ticker: str
    config: Optional[Dict[str, Any]] = None
```

### AnalysisResult

```python
@dataclass
class AnalysisResult:
    ticker: str
    decision: str
    confidence: float
    reports: Dict[str, str]
    timestamp: str
```

## Error Handling

### Request Validation

- Validate ticker symbols (uppercase letters, 1-5 characters)
- Validate coach IDs (must be in allowed list)
- Validate configuration parameters (valid LLM models, positive integers)

### Error Logging

- Log all errors with full stack trace
- Include request context (endpoint, parameters)
- Use structured logging format

### Error Responses

- Return consistent JSON error format
- Include appropriate HTTP status codes
- Avoid exposing internal system details

## Testing Strategy

### Unit Tests

- Test each service method independently
- Mock external dependencies (storage, TradingAgents)
- Test error handling paths

### Integration Tests

- Test API endpoints end-to-end
- Test with real Discord Enhancement storage
- Test with mock mode enabled

### Manual Testing

- Test with C1 frontend integration
- Test CORS configuration
- Test error scenarios

### Test Files

- `test_coach_service.py` - Coach service tests
- `test_analysis_service.py` - Analysis service tests
- `test_api_routes.py` - API endpoint tests
- `test_integration.py` - End-to-end tests

## Deployment Considerations

### Development

- Run with `python c1_api_server.py`
- Use mock mode for testing without Discord
- Enable debug mode for detailed logging

### Production

- Use production WSGI server (gunicorn, waitress)
- Disable debug mode
- Configure proper CORS origins
- Set up proper logging and monitoring
- Use environment variables for secrets

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional
API_PORT=5000
API_HOST=0.0.0.0
DEBUG_MODE=false
USE_MOCK_MODE=false
DISCORD_BOT_TOKEN=...
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## Security Considerations

- Validate all input parameters
- Sanitize error messages
- Use CORS to restrict origins
- Rate limiting for analysis endpoint (future enhancement)
- API key authentication (future enhancement)

## Performance Considerations

- Cache coach plans for 30 seconds to reduce storage reads
- Run analysis asynchronously for long-running requests (future enhancement)
- Add request timeout for analysis endpoint
- Monitor memory usage during analysis

## Future Enhancements

1. WebSocket support for real-time coach plan updates
2. Authentication and authorization
3. Rate limiting per client
4. Async analysis with job queue
5. Caching layer for frequently requested data
6. API versioning (/api/v1/...)
7. OpenAPI/Swagger documentation
