/**
 * Rate Limiter
 * 
 * Tracks API calls and enforces rate limits to prevent exceeding quotas
 * Implements a sliding window algorithm with request queuing
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface QueuedRequest {
  resolve: (value: void) => void;
  reject: (reason: Error) => void;
  timestamp: number;
}

/**
 * RateLimiter class
 * 
 * Manages API call rate limiting with automatic queuing
 */
export class RateLimiter {
  private requests: number[] = [];
  private queue: QueuedRequest[] = [];
  private processing = false;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if we're approaching the rate limit
   * 
   * @param threshold - Percentage threshold (0-1)
   * @returns True if approaching limit
   */
  isApproachingLimit(threshold: number = 0.8): boolean {
    this.cleanOldRequests();
    const currentCount = this.requests.length;
    const limit = this.config.maxRequests;
    
    return currentCount >= limit * threshold;
  }

  /**
   * Get current request count in the window
   * 
   * @returns Number of requests in current window
   */
  getCurrentCount(): number {
    this.cleanOldRequests();
    return this.requests.length;
  }

  /**
   * Get remaining requests in current window
   * 
   * @returns Number of remaining requests
   */
  getRemainingRequests(): number {
    this.cleanOldRequests();
    return Math.max(0, this.config.maxRequests - this.requests.length);
  }

  /**
   * Get time until next request slot is available (in ms)
   * 
   * @returns Milliseconds until next slot
   */
  getTimeUntilNextSlot(): number {
    this.cleanOldRequests();
    
    if (this.requests.length < this.config.maxRequests) {
      return 0;
    }

    const oldestRequest = this.requests[0];
    const now = Date.now();
    const windowEnd = oldestRequest + this.config.windowMs;
    
    return Math.max(0, windowEnd - now);
  }

  /**
   * Acquire a rate limit slot
   * Will queue the request if limit is reached
   * 
   * @returns Promise that resolves when slot is available
   */
  async acquire(): Promise<void> {
    this.cleanOldRequests();

    // If under limit, grant immediately
    if (this.requests.length < this.config.maxRequests) {
      this.requests.push(Date.now());
      console.log(`[RateLimiter] Request granted (${this.requests.length}/${this.config.maxRequests})`);
      return Promise.resolve();
    }

    // Otherwise, queue the request
    console.log(`[RateLimiter] Rate limit reached, queuing request (queue size: ${this.queue.length + 1})`);
    
    return new Promise<void>((resolve, reject) => {
      this.queue.push({
        resolve,
        reject,
        timestamp: Date.now(),
      });

      // Start processing queue if not already running
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      this.cleanOldRequests();

      // Check if we have capacity
      if (this.requests.length >= this.config.maxRequests) {
        // Wait until next slot is available
        const waitTime = this.getTimeUntilNextSlot();
        
        if (waitTime > 0) {
          console.log(`[RateLimiter] Waiting ${waitTime}ms for next slot`);
          await this.delay(waitTime + 100); // Add small buffer
          continue;
        }
      }

      // Grant next request in queue
      const request = this.queue.shift();
      if (request) {
        this.requests.push(Date.now());
        console.log(`[RateLimiter] Queued request granted (${this.requests.length}/${this.config.maxRequests})`);
        request.resolve();
      }
    }

    this.processing = false;
  }

  /**
   * Clean up old requests outside the time window
   */
  private cleanOldRequests(): void {
    const now = Date.now();
    const cutoff = now - this.config.windowMs;
    
    this.requests = this.requests.filter(timestamp => timestamp > cutoff);
  }

  /**
   * Clear all tracked requests and queue
   */
  reset(): void {
    this.requests = [];
    this.queue = [];
    this.processing = false;
    console.log('[RateLimiter] Reset');
  }

  /**
   * Get queue size
   * 
   * @returns Number of queued requests
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Delay helper
   * 
   * @param ms - Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get rate limit status
   * 
   * @returns Status object with current metrics
   */
  getStatus(): {
    currentCount: number;
    maxRequests: number;
    remaining: number;
    queueSize: number;
    isApproachingLimit: boolean;
    timeUntilNextSlot: number;
  } {
    this.cleanOldRequests();
    
    return {
      currentCount: this.requests.length,
      maxRequests: this.config.maxRequests,
      remaining: this.getRemainingRequests(),
      queueSize: this.queue.length,
      isApproachingLimit: this.isApproachingLimit(),
      timeUntilNextSlot: this.getTimeUntilNextSlot(),
    };
  }
}

// Default rate limiter for Alpha Vantage API
// Free tier: 25 requests per day, ~1 request per minute to be safe
export const alphaVantageRateLimiter = new RateLimiter({
  maxRequests: 5, // Conservative limit
  windowMs: 60 * 1000, // 1 minute window
});
