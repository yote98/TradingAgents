# Design Document

## Overview

This design document outlines the architecture and implementation approach for enhancing the Discord webhook integration in TradingAgents. The enhancement focuses on production readiness, reliability, testability, and maintainability while preserving the existing API contracts to ensure backward compatibility.

The design introduces a layered architecture with clear separation of concerns: a persistence layer for data storage, a service layer for business logic, an API layer for external communication, and a testing layer for validation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Discord Platform                         │
│  (Coaches post plans with !plan command + chart images)     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Discord Bot Server (Enhanced)                   │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Discord Bot  │  │ Flask API    │  │ Storage      │     │
│  │ (Receiver)   │─▶│ (Provider)   │◀─│ (SQLite)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────┬───────┴──────────────────┘             │
│                    ▼                                         │
│         ┌──────────────────────┐                           │
│         │  Service Layer       │                           │
│         │  - Plan Management   │                           │
│         │  - Validation        │                           │
│         │  - Error Handling    │                           │
│         └──────────────────────┘                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              TradingAgents System                            │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Webhook Client (Enhanced)                       │      │
│  │  - Fetches plans via HTTP                        │      │
│  │  - Caches results                                │      │
│  │  - Handles errors gracefully                     │      │
│  └──────────────────────────────────────────────────┘      │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Coach Agents                                     │      │
│  │  - Process coach plans                            │      │
│  │  - Generate reports                               │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### 1. Persistence Layer

**Database Schema (SQLite):**

```sql
CREATE TABLE coach_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coach_name TEXT NOT NULL,
    date TEXT NOT NULL,
    plan_text TEXT NOT NULL,
    author TEXT NOT NULL,
    channel TEXT NOT NULL,
    created_at TEXT NOT NULL,
    edited_at TEXT,
    UNIQUE(coach_name, date)
);

CREATE TABLE plan_charts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    chart_url TEXT NOT NULL,
    chart_order INTEGER NOT NULL,
    filename TEXT,
    FOREIGN KEY (plan_id) REFERENCES coach_plans(id) ON DELETE CASCADE
);

CREATE INDEX idx_coach_date ON coach_plans(coach_name, date);
CREATE INDEX idx_plan_charts ON plan_charts(plan_id);
```

**Storage Manager Class:**

```python
class StorageManager:
    """Manages persistent storage of coach plans."""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.conn = None
        
    def initialize(self):
        """Create database and tables if they don't exist."""
        
    def save_plan(self, coach_name: str, date: str, plan_text: str, 
                  author: str, channel: str, chart_urls: List[str]) -> int:
        """Save or update a coach plan with charts."""
        
    def get_plan(self, coach_name: str, date: str) -> Optional[Dict]:
        """Retrieve a coach plan with charts."""
        
    def update_plan(self, plan_id: int, plan_text: str) -> bool:
        """Update an existing plan's text."""
        
    def delete_plan(self, plan_id: int) -> bool:
        """Delete a plan and its associated charts."""
        
    def get_plans_by_date(self, date: str) -> List[Dict]:
        """Get all coach plans for a specific date."""
        
    def close(self):
        """Close database connection."""
```

#### 2. Service Layer

**Plan Service Class:**

```python
class PlanService:
    """Business logic for managing coach plans."""
    
    def __init__(self, storage: StorageManager):
        self.storage = storage
        self.logger = logging.getLogger(__name__)
        
    def process_plan_message(self, coach_name: str, plan_text: str,
                            author: str, channel: str, 
                            attachments: List[discord.Attachment]) -> Dict:
        """Process a plan message from Discord."""
        # 1. Validate coach name
        # 2. Extract and validate chart attachments
        # 3. Save to storage
        # 4. Return confirmation data
        
    def validate_coach_name(self, coach_name: str) -> bool:
        """Validate that coach name is one of: d, i, s, n."""
        
    def extract_chart_urls(self, attachments: List) -> List[str]:
        """Extract image URLs from Discord attachments."""
        
    def get_plan_for_api(self, coach_name: str, date: str) -> Dict:
        """Get plan formatted for API response."""
        
    def edit_plan(self, plan_id: int, new_text: str, author: str) -> bool:
        """Edit a plan if author matches."""
        
    def delete_plan(self, plan_id: int, author: str) -> bool:
        """Delete a plan if author matches."""
```

**Configuration Manager:**

```python
class ConfigManager:
    """Manages configuration from environment and files."""
    
    def __init__(self, config_file: Optional[str] = None):
        self.config = self._load_config(config_file)
        self._validate_config()
        
    def _load_config(self, config_file: Optional[str]) -> Dict:
        """Load from env vars and optional config file."""
        
    def _validate_config(self):
        """Validate required configuration values."""
        
    def get(self, key: str, default=None):
        """Get configuration value."""
        
    @property
    def discord_token(self) -> str:
        """Get Discord bot token."""
        
    @property
    def database_path(self) -> str:
        """Get database file path."""
        
    @property
    def api_port(self) -> int:
        """Get Flask API port."""
        
    @property
    def log_level(self) -> str:
        """Get logging level."""
```

#### 3. Discord Bot Layer

**Enhanced Bot Implementation:**

```python
class CoachPlanBot(commands.Bot):
    """Enhanced Discord bot for receiving coach plans."""
    
    def __init__(self, config: ConfigManager, service: PlanService):
        super().__init__(command_prefix='!', intents=self._get_intents())
        self.config = config
        self.service = service
        self.logger = logging.getLogger(__name__)
        
    @staticmethod
    def _get_intents():
        """Configure bot intents."""
        intents = discord.Intents.default()
        intents.message_content = True
        return intents
        
    async def on_ready(self):
        """Handle bot ready event."""
        
    async def on_message(self, message):
        """Handle incoming messages."""
        # 1. Ignore bot messages
        # 2. Process commands
        # 3. Parse plan messages
        
    async def on_error(self, event, *args, **kwargs):
        """Handle bot errors with logging."""
        
    @commands.command(name='plan')
    async def post_plan(self, ctx, coach_type: str, *, plan_text: str):
        """Post a coach plan: !plan d: <plan text>"""
        
    @commands.command(name='edit')
    async def edit_plan(self, ctx, plan_id: int, *, new_text: str):
        """Edit a previous plan: !edit <id> <new text>"""
        
    @commands.command(name='delete')
    async def delete_plan(self, ctx, plan_id: int):
        """Delete a previous plan: !delete <id>"""
        
    @commands.command(name='plans')
    async def list_plans(self, ctx, date: str = None):
        """List all plans for a date: !plans [YYYY-MM-DD]"""
        
    @commands.command(name='myplans')
    async def my_plans(self, ctx, date: str = None):
        """List your plans for a date: !myplans [YYYY-MM-DD]"""
```

#### 4. Flask API Layer

**Enhanced API Implementation:**

```python
class PlanAPI:
    """Flask API for serving coach plans."""
    
    def __init__(self, config: ConfigManager, service: PlanService):
        self.app = Flask(__name__)
        self.config = config
        self.service = service
        self.logger = logging.getLogger(__name__)
        self._setup_routes()
        self._setup_error_handlers()
        
    def _setup_routes(self):
        """Register API routes."""
        self.app.route('/health', methods=['GET'])(self.health_check)
        self.app.route('/metrics', methods=['GET'])(self.metrics)
        self.app.route('/api/coach-plans/', methods=['GET'])(self.get_plan)
        self.app.route('/api/coach-plans/all', methods=['GET'])(self.get_all_plans)
        
    def _setup_error_handlers(self):
        """Register error handlers."""
        self.app.errorhandler(400)(self.handle_bad_request)
        self.app.errorhandler(404)(self.handle_not_found)
        self.app.errorhandler(500)(self.handle_server_error)
        
    def health_check(self):
        """GET /health - Health check endpoint."""
        # Return bot status, DB status, plan count
        
    def metrics(self):
        """GET /metrics - Metrics endpoint."""
        # Return request counts, error rates, uptime
        
    def get_plan(self):
        """GET /api/coach-plans/?coach=<name>&date=<date>"""
        # Validate parameters
        # Fetch plan from service
        # Return JSON response
        
    def get_all_plans(self):
        """GET /api/coach-plans/all?date=<date>"""
        # Fetch all plans for date
        # Return JSON response
        
    def handle_bad_request(self, error):
        """Handle 400 errors."""
        
    def handle_not_found(self, error):
        """Handle 404 errors."""
        
    def handle_server_error(self, error):
        """Handle 500 errors."""
```

#### 5. Webhook Client Layer

**Enhanced Client Implementation:**

```python
class DiscordWebhookClient:
    """Enhanced client for fetching coach plans."""
    
    def __init__(self, webhook_urls: Dict[str, str], 
                 cache_ttl: int = 3600, max_cache_size: int = 100):
        self.webhook_urls = webhook_urls
        self.cache = {}
        self.cache_ttl = cache_ttl
        self.max_cache_size = max_cache_size
        self.logger = logging.getLogger(__name__)
        self.metrics = {
            'cache_hits': 0,
            'cache_misses': 0,
            'api_calls': 0,
            'errors': 0
        }
        
    def fetch_coach_plan(self, coach_name: str, date: str = None) -> Dict:
        """Fetch plan with caching."""
        # 1. Check cache
        # 2. If miss, fetch from API
        # 3. Update cache
        # 4. Return result
        
    def _get_from_cache(self, cache_key: str) -> Optional[Dict]:
        """Get plan from cache if not expired."""
        
    def _put_in_cache(self, cache_key: str, data: Dict):
        """Put plan in cache with eviction if needed."""
        
    def _evict_oldest(self):
        """Evict oldest cache entry."""
        
    def clear_cache(self):
        """Clear all cached plans."""
        
    def get_metrics(self) -> Dict:
        """Get client metrics."""
        
    def _fetch_from_api(self, coach_name: str, date: str) -> Dict:
        """Fetch from Discord Bot Server API with error handling."""
        # 1. Build request URL
        # 2. Make HTTP request with timeout
        # 3. Handle errors gracefully
        # 4. Return formatted result
```

#### 6. Mock Mode Implementation

**Mock Data Provider:**

```python
class MockDataProvider:
    """Provides mock coach plans for testing."""
    
    def __init__(self):
        self.mock_plans = self._generate_mock_plans()
        
    def _generate_mock_plans(self) -> Dict:
        """Generate realistic mock plans for all coaches."""
        return {
            'coach_d': {
                'plan': 'NVDA showing bullish flag pattern. Watch for breakout above $950...',
                'charts': [
                    'https://example.com/mock-chart-1.png',
                    'https://example.com/mock-chart-2.png'
                ]
            },
            'coach_i': {
                'plan': 'NVDA earnings next week. Expect strong data center revenue...',
                'charts': ['https://example.com/mock-chart-3.png']
            },
            'coach_s': {
                'plan': 'Social media sentiment extremely bullish (8/10)...',
                'charts': ['https://example.com/mock-chart-4.png']
            },
            'coach_n': {
                'plan': 'Fed meeting this week. Watch for hawkish/dovish signals...',
                'charts': []
            }
        }
        
    def get_plan(self, coach_name: str, date: str) -> Dict:
        """Get mock plan for coach and date."""
        
class MockDiscordBot:
    """Mock Discord bot for testing."""
    
    def __init__(self, service: PlanService, mock_data: MockDataProvider):
        self.service = service
        self.mock_data = mock_data
        self.logger = logging.getLogger(__name__)
        
    def simulate_plan_post(self, coach_name: str, date: str):
        """Simulate a coach posting a plan."""
        
    def simulate_multiple_posts(self, date: str):
        """Simulate all coaches posting plans."""
```

## Components and Interfaces

### Storage Manager Interface

```python
class IStorageManager(ABC):
    """Interface for storage implementations."""
    
    @abstractmethod
    def save_plan(self, coach_name: str, date: str, plan_text: str,
                  author: str, channel: str, chart_urls: List[str]) -> int:
        pass
        
    @abstractmethod
    def get_plan(self, coach_name: str, date: str) -> Optional[Dict]:
        pass
        
    @abstractmethod
    def update_plan(self, plan_id: int, plan_text: str) -> bool:
        pass
        
    @abstractmethod
    def delete_plan(self, plan_id: int) -> bool:
        pass
```

This allows for different storage implementations (SQLite, PostgreSQL, MongoDB, etc.) without changing the service layer.

### Service Layer Interface

```python
class IPlanService(ABC):
    """Interface for plan service implementations."""
    
    @abstractmethod
    def process_plan_message(self, coach_name: str, plan_text: str,
                            author: str, channel: str,
                            attachments: List) -> Dict:
        pass
        
    @abstractmethod
    def get_plan_for_api(self, coach_name: str, date: str) -> Dict:
        pass
```

### Webhook Client Interface

```python
class IWebhookClient(ABC):
    """Interface for webhook client implementations."""
    
    @abstractmethod
    def fetch_coach_plan(self, coach_name: str, date: str = None) -> Dict:
        pass
        
    @abstractmethod
    def fetch_all_coach_plans(self, date: str = None) -> Dict:
        pass
```

## Data Models

### Coach Plan Model

```python
@dataclass
class CoachPlan:
    """Represents a coach's daily plan."""
    id: Optional[int]
    coach_name: str
    date: str
    plan_text: str
    author: str
    channel: str
    created_at: datetime
    edited_at: Optional[datetime]
    charts: List[ChartAttachment]
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for API responses."""
        
    @classmethod
    def from_db_row(cls, row: Dict) -> 'CoachPlan':
        """Create from database row."""

@dataclass
class ChartAttachment:
    """Represents a chart attachment."""
    id: Optional[int]
    plan_id: int
    chart_url: str
    chart_order: int
    filename: Optional[str]
    
    def to_dict(self) -> Dict:
        """Convert to dictionary."""
```

### API Response Models

```python
@dataclass
class PlanResponse:
    """API response for a single plan."""
    plan: str
    charts: List[str]
    author: str
    timestamp: str
    edited: bool
    
@dataclass
class HealthResponse:
    """API response for health check."""
    status: str
    bot_connected: bool
    database_connected: bool
    plans_count: int
    uptime_seconds: float
    
@dataclass
class MetricsResponse:
    """API response for metrics."""
    total_requests: int
    error_count: int
    cache_hit_rate: float
    average_response_time_ms: float
```

## Error Handling

### Error Hierarchy

```python
class DiscordIntegrationError(Exception):
    """Base exception for Discord integration errors."""
    pass

class StorageError(DiscordIntegrationError):
    """Errors related to data storage."""
    pass

class ValidationError(DiscordIntegrationError):
    """Errors related to data validation."""
    pass

class APIError(DiscordIntegrationError):
    """Errors related to API operations."""
    pass

class DiscordConnectionError(DiscordIntegrationError):
    """Errors related to Discord connection."""
    pass
```

### Error Handling Strategy

1. **Discord Bot Errors:**
   - Log full error context
   - Send user-friendly message to Discord
   - Continue processing other messages
   - Implement exponential backoff for reconnection

2. **Storage Errors:**
   - Log error with stack trace
   - Fall back to in-memory storage if database unavailable
   - Return error response to API caller
   - Attempt to reconnect on next operation

3. **API Errors:**
   - Return appropriate HTTP status code (400, 404, 500)
   - Include error message in response body
   - Log error for monitoring
   - Increment error metrics

4. **Webhook Client Errors:**
   - Log error with request details
   - Return default "plan unavailable" message
   - Increment error metrics
   - Don't crash the TradingAgents workflow

## Testing Strategy

### Unit Tests

**Test Coverage:**
- Storage Manager: 90% coverage
  - Database initialization
  - CRUD operations
  - Error handling
  - Connection management

- Plan Service: 85% coverage
  - Plan processing logic
  - Validation
  - Chart extraction
  - Edit/delete authorization

- Webhook Client: 85% coverage
  - Caching logic
  - API communication
  - Error handling
  - Metrics tracking

**Test Framework:** pytest with pytest-cov for coverage

### Integration Tests

**Test Scenarios:**
1. End-to-end plan posting and retrieval
2. Multiple coaches posting on same date
3. Plan editing and deletion
4. Chart attachment handling
5. Database persistence across restarts
6. API error responses
7. Cache behavior

**Test Framework:** pytest with pytest-flask and pytest-asyncio

### Mock Testing

**Mock Components:**
- Mock Discord bot (no actual Discord connection)
- Mock storage (in-memory)
- Mock HTTP client (no actual API calls)

**Test Scenarios:**
1. Full workflow with mock data
2. Error simulation
3. Performance testing with mock data

### Performance Tests

**Metrics to Test:**
- API response time < 100ms for cached plans
- API response time < 500ms for uncached plans
- Database query time < 50ms
- Bot message processing time < 200ms

## Configuration

### Environment Variables

```bash
# Required
DISCORD_BOT_TOKEN=your_bot_token_here

# Optional (with defaults)
DATABASE_PATH=./data/coach_plans.db
API_PORT=5000
LOG_LEVEL=INFO
CACHE_TTL_SECONDS=3600
MAX_CACHE_SIZE=100
MOCK_MODE=false

# Discord webhook URLs (for TradingAgents)
DISCORD_COACH_D_WEBHOOK=http://localhost:5000/api/coach-plans/
DISCORD_COACH_I_WEBHOOK=http://localhost:5000/api/coach-plans/
DISCORD_COACH_S_WEBHOOK=http://localhost:5000/api/coach-plans/
DISCORD_COACH_N_WEBHOOK=http://localhost:5000/api/coach-plans/
```

### Configuration File (Optional)

```yaml
# config.yaml
discord:
  bot_token: ${DISCORD_BOT_TOKEN}
  reconnect_attempts: 5
  reconnect_delay_seconds: 5

database:
  path: ./data/coach_plans.db
  connection_timeout: 10
  
api:
  port: 5000
  host: 0.0.0.0
  debug: false
  
logging:
  level: INFO
  file: ./logs/discord_bot.log
  max_size_mb: 10
  backup_count: 5
  
cache:
  ttl_seconds: 3600
  max_size: 100
  
mock:
  enabled: false
```

## Deployment Considerations

### Production Deployment

1. **Process Management:**
   - Use systemd or supervisor to manage the Discord Bot Server process
   - Implement graceful shutdown handling
   - Auto-restart on failure

2. **Database:**
   - Regular backups of SQLite database
   - Consider PostgreSQL for high-volume deployments
   - Implement database migration strategy

3. **Monitoring:**
   - Set up health check monitoring (e.g., with Prometheus)
   - Alert on bot disconnections
   - Monitor API error rates
   - Track database size growth

4. **Security:**
   - Store Discord bot token securely (e.g., AWS Secrets Manager)
   - Implement rate limiting on API endpoints
   - Use HTTPS for API communication
   - Validate all user inputs

5. **Scaling:**
   - Current design supports single-instance deployment
   - For multi-instance: use Redis for caching and PostgreSQL for storage
   - Implement distributed locking for plan updates

### Development Deployment

1. **Local Development:**
   - Use mock mode to avoid Discord setup
   - SQLite database in local directory
   - Debug logging enabled

2. **Testing Environment:**
   - Separate Discord bot for testing
   - Separate database
   - Mock mode available for automated tests

## Migration Strategy

### Backward Compatibility

The enhanced implementation maintains backward compatibility with existing code:

1. **API Endpoints:** Same URLs and response formats
2. **Webhook Client:** Same method signatures
3. **Coach Agents:** No changes required

### Migration Steps

1. **Phase 1:** Deploy enhanced Discord Bot Server alongside existing implementation
2. **Phase 2:** Test with mock mode to verify functionality
3. **Phase 3:** Migrate Discord bot to new server
4. **Phase 4:** Update TradingAgents to use enhanced Webhook Client
5. **Phase 5:** Decommission old implementation

### Data Migration

If migrating from existing in-memory storage:

```python
def migrate_existing_data(old_data: Dict, storage: StorageManager):
    """Migrate data from old in-memory format to new database."""
    for key, value in old_data.items():
        # Parse key: "coach_d_2024-05-10"
        parts = key.split('_')
        coach_name = f"{parts[0]}_{parts[1]}"
        date = parts[2]
        
        # Save to new storage
        storage.save_plan(
            coach_name=coach_name,
            date=date,
            plan_text=value['plan'],
            author=value.get('author', 'unknown'),
            channel=value.get('channel', 'unknown'),
            chart_urls=value.get('charts', [])
        )
```

## Future Enhancements

### Potential Additions

1. **Multi-language Support:** Support coaches posting in different languages
2. **Voice Integration:** Process voice messages from Discord
3. **Image Analysis:** Use computer vision to extract insights from chart images
4. **Historical Analysis:** Analyze coach prediction accuracy over time
5. **Real-time Notifications:** Push notifications when coaches post plans
6. **Web Dashboard:** Web UI for viewing and managing coach plans
7. **Slack/Telegram Integration:** Support additional messaging platforms
8. **AI Coach Suggestions:** Use LLM to suggest improvements to coach plans
