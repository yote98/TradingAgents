# Twitter Dashboard Integration - Design Document

## Overview

This design integrates Twitter/X social sentiment into the C1 Chat dashboard by creating a new Twitter feed component, backend API endpoints, and real-time update mechanisms. The system leverages the existing Python Twitter monitor and presents data through a modern React UI with sentiment visualization, account management, and ticker filtering.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     C1 Dashboard (Next.js)                   │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ TwitterFeed      │  │ SentimentGauge   │                │
│  │ Component        │  │ Component        │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                     │                            │
│           └─────────┬───────────┘                            │
│                     │                                        │
│           ┌─────────▼──────────┐                            │
│           │ Twitter API Client │                            │
│           └─────────┬──────────┘                            │
└─────────────────────┼────────────────────────────────────────┘
                      │ HTTP/REST
┌─────────────────────▼────────────────────────────────────────┐
│                  C1 API (Flask Backend)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          /api/twitter/sentiment                       │   │
│  │          /api/twitter/accounts                        │   │
│  │          /api/twitter/stocktwits                      │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                       │
│           ┌───────────▼──────────┐                           │
│           │ Twitter Service      │                           │
│           │ (Caching Layer)      │                           │
│           └───────────┬──────────┘                           │
└───────────────────────┼────────────────────────────────────────┘
                        │
┌───────────────────────▼────────────────────────────────────────┐
│              TradingAgents Python Backend                      │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  TwitterSocialMonitor                                 │    │
│  │  ├─ NitterFetcher (RSS scraping)                     │    │
│  │  ├─ StockwitsFetcher (API)                           │    │
│  │  ├─ SentimentAnalyzer (LLM)                          │    │
│  │  └─ Cache Manager                                     │    │
│  └──────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Dashboard → C1 API**: User requests Twitter sentiment for a ticker
2. **C1 API → Twitter Service**: Service checks cache, calls Python backend if needed
3. **Python Backend**: Fetches tweets via Nitter RSS, analyzes with LLM
4. **Response Flow**: Data flows back through layers with caching at each level
5. **Auto-refresh**: Dashboard polls every 5 minutes for updates

## Components and Interfaces

### Frontend Components

#### 1. TwitterFeedPanel Component

**Location**: `aiapp/src/components/TwitterFeedPanel.tsx`

**Purpose**: Main container for Twitter sentiment display

**Props**:
```typescript
interface TwitterFeedPanelProps {
  ticker?: string;              // Optional ticker to filter tweets
  autoRefresh?: boolean;        // Enable auto-refresh (default: true)
  refreshInterval?: number;     // Refresh interval in ms (default: 300000)
  maxTweets?: number;          // Max tweets to display (default: 50)
}
```

**State**:
```typescript
interface TwitterFeedState {
  tweets: Tweet[];
  sentiment: SentimentData;
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
  accounts: string[];
  filter: string;
}
```

**Features**:
- Virtual scrolling for performance
- Auto-refresh with pause on scroll
- Ticker filtering
- Account management modal
- Sentiment gauge visualization

#### 2. TweetCard Component

**Location**: `aiapp/src/components/TweetCard.tsx`

**Purpose**: Display individual tweet with metadata

**Props**:
```typescript
interface TweetCardProps {
  tweet: Tweet;
  onTickerClick?: (ticker: string) => void;
  compact?: boolean;
}
```

**Features**:
- Syntax highlighting for tickers ($AAPL)
- Relative timestamps
- Sentiment indicator badge
- Account avatar and name
- Link to original tweet

#### 3. SentimentGauge Component

**Location**: `aiapp/src/components/SentimentGauge.tsx`

**Purpose**: Visual representation of overall sentiment

**Props**:
```typescript
interface SentimentGaugeProps {
  score: number;                // -1.0 to 1.0
  bullishArgs: string[];
  bearishArgs: string[];
  themes: string[];
  size?: 'small' | 'medium' | 'large';
}
```

**Features**:
- Animated gauge with color gradient
- Bullish/bearish argument lists
- Key themes display
- Responsive sizing

#### 4. AccountManager Component

**Location**: `aiapp/src/components/AccountManager.tsx`

**Purpose**: Modal for managing monitored accounts

**Props**:
```typescript
interface AccountManagerProps {
  accounts: string[];
  onSave: (accounts: string[]) => void;
  onClose: () => void;
}
```

**Features**:
- Add/remove accounts
- Account validation
- Default account suggestions
- Drag-to-reorder accounts

### Backend API Endpoints

#### 1. GET /api/twitter/sentiment

**Purpose**: Fetch tweets and sentiment analysis

**Query Parameters**:
- `ticker` (optional): Stock ticker to filter tweets
- `accounts` (optional): Comma-separated list of accounts
- `limit` (optional): Max tweets to return (default: 50)

**Response**:
```json
{
  "tweets": [
    {
      "id": "string",
      "account": "ChartChampions",
      "text": "Tweet content...",
      "timestamp": "2025-11-11T10:30:00Z",
      "sentiment": 0.75,
      "tickers": ["AAPL", "MSFT"],
      "url": "https://twitter.com/..."
    }
  ],
  "sentiment": {
    "overall_score": 0.65,
    "bullish_args": ["Strong technical setup", "..."],
    "bearish_args": ["Overbought RSI", "..."],
    "themes": ["Tech rally", "Fed policy", "..."],
    "account_influence": {
      "ChartChampions": 0.85,
      "unusual_whales": 0.72
    }
  },
  "metadata": {
    "total_tweets": 150,
    "filtered_tweets": 25,
    "last_updated": "2025-11-11T10:35:00Z",
    "cache_hit": true
  }
}
```

**Caching**: 5 minutes

#### 2. GET /api/twitter/stocktwits

**Purpose**: Fetch Stocktwits messages for a ticker

**Query Parameters**:
- `ticker` (required): Stock ticker symbol
- `limit` (optional): Max messages (default: 30)

**Response**:
```json
{
  "messages": [
    {
      "id": "string",
      "user": "username",
      "text": "Message content...",
      "timestamp": "2025-11-11T10:30:00Z",
      "sentiment": "bullish",
      "likes": 15
    }
  ],
  "sentiment_ratio": {
    "bullish": 65,
    "bearish": 35
  }
}
```

#### 3. POST /api/twitter/accounts

**Purpose**: Update monitored accounts list

**Request Body**:
```json
{
  "accounts": ["ChartChampions", "unusual_whales", "..."]
}
```

**Response**:
```json
{
  "success": true,
  "accounts": ["ChartChampions", "unusual_whales", "..."],
  "validated": true
}
```

### Backend Service Layer

#### TwitterService Class

**Location**: `c1_api/services/twitter_service.py`

**Purpose**: Bridge between Flask API and Python Twitter monitor

**Methods**:
```python
class TwitterService:
    def get_sentiment(
        self, 
        ticker: Optional[str] = None,
        accounts: Optional[List[str]] = None,
        limit: int = 50
    ) -> Dict[str, Any]:
        """Fetch tweets and sentiment analysis"""
        
    def get_stocktwits(
        self, 
        ticker: str,
        limit: int = 30
    ) -> Dict[str, Any]:
        """Fetch Stocktwits messages"""
        
    def validate_accounts(
        self, 
        accounts: List[str]
    ) -> Dict[str, bool]:
        """Validate Twitter account existence"""
        
    def update_config(
        self, 
        accounts: List[str]
    ) -> bool:
        """Update monitored accounts in config"""
```

**Caching Strategy**:
- In-memory cache with 5-minute TTL
- Cache key: `twitter:{ticker}:{accounts_hash}`
- Separate cache for Stocktwits data

## Data Models

### Tweet Model

```typescript
interface Tweet {
  id: string;
  account: string;
  accountAvatar?: string;
  text: string;
  timestamp: Date;
  sentiment: number;          // -1.0 to 1.0
  tickers: string[];
  url: string;
  engagement?: {
    likes: number;
    retweets: number;
  };
}
```

### SentimentData Model

```typescript
interface SentimentData {
  overall_score: number;      // -1.0 to 1.0
  bullish_args: string[];
  bearish_args: string[];
  themes: string[];
  account_influence: Record<string, number>;
  confidence: number;         // 0.0 to 1.0
}
```

### StocktwitsMessage Model

```typescript
interface StocktwitsMessage {
  id: string;
  user: string;
  userAvatar?: string;
  text: string;
  timestamp: Date;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  likes: number;
}
```

## Error Handling

### Frontend Error Handling

1. **Network Errors**:
   - Display toast notification
   - Show last cached data with staleness indicator
   - Provide manual refresh button

2. **API Errors**:
   - Parse error messages from backend
   - Display user-friendly error messages
   - Log detailed errors to console

3. **Validation Errors**:
   - Inline validation for account names
   - Prevent invalid data submission
   - Clear error messages

### Backend Error Handling

1. **Twitter Monitor Failures**:
   - Graceful degradation (return partial data)
   - Retry with exponential backoff
   - Log errors for monitoring

2. **Cache Failures**:
   - Fall back to direct API calls
   - Continue operation without cache

3. **Rate Limiting**:
   - Implement request throttling
   - Return 429 status with retry-after header
   - Queue requests when rate limited

## Testing Strategy

### Unit Tests

1. **Frontend Components**:
   - TweetCard rendering with various props
   - SentimentGauge score calculations
   - AccountManager add/remove logic
   - TwitterFeedPanel state management

2. **Backend Services**:
   - TwitterService caching logic
   - Account validation
   - Data transformation
   - Error handling

### Integration Tests

1. **API Endpoints**:
   - GET /api/twitter/sentiment with various parameters
   - POST /api/twitter/accounts validation
   - Cache behavior verification
   - Error response formats

2. **End-to-End**:
   - Full flow from dashboard to Python backend
   - Auto-refresh functionality
   - Account management workflow
   - Ticker filtering

### Performance Tests

1. **Load Testing**:
   - 100 concurrent users
   - Response time < 500ms (cached)
   - Response time < 3s (uncached)

2. **Frontend Performance**:
   - Virtual scrolling with 1000+ tweets
   - Memory usage monitoring
   - Render time optimization

## Security Considerations

1. **Input Validation**:
   - Sanitize ticker symbols (alphanumeric only)
   - Validate account names (Twitter username format)
   - Limit request sizes

2. **Rate Limiting**:
   - 60 requests per minute per IP
   - 10 account updates per hour per user

3. **Data Sanitization**:
   - Escape HTML in tweet text
   - Prevent XSS attacks
   - Validate URLs

4. **API Security**:
   - CORS configuration
   - Request authentication (if needed)
   - Error message sanitization

## Performance Optimizations

1. **Frontend**:
   - Virtual scrolling for large lists
   - Lazy loading of images
   - Debounced search/filter
   - Memoized components
   - Service worker caching

2. **Backend**:
   - Multi-level caching (memory + Redis optional)
   - Batch processing of tweets
   - Connection pooling
   - Async/await for I/O operations

3. **Network**:
   - Gzip compression
   - CDN for static assets
   - HTTP/2 multiplexing
   - Prefetch critical data

## Deployment Considerations

1. **Environment Variables**:
   ```
   TWITTER_CACHE_DURATION=300
   TWITTER_MAX_TWEETS=100
   STOCKTWITS_API_TOKEN=optional
   TWITTER_RATE_LIMIT=60
   ```

2. **Monitoring**:
   - API response times
   - Cache hit rates
   - Error rates
   - Twitter monitor success rates

3. **Scaling**:
   - Horizontal scaling of C1 API
   - Redis for distributed caching
   - CDN for static assets
   - Load balancer configuration

## Future Enhancements

1. **Advanced Features**:
   - Tweet sentiment trends over time
   - Account comparison charts
   - Custom alert rules
   - Export sentiment reports

2. **Additional Data Sources**:
   - Reddit r/wallstreetbets
   - Discord trading servers
   - Telegram channels
   - News aggregators

3. **AI Enhancements**:
   - Predictive sentiment analysis
   - Anomaly detection
   - Influencer identification
   - Fake news detection
