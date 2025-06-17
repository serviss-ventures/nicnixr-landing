// Rate Limiting Utility for NixR Admin Dashboard
// Prevents API abuse and ensures fair usage

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @param limit - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if request is allowed, false if rate limited
   */
  check(identifier: string, limit: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const resetTime = now + windowMs;

    if (!this.store[identifier]) {
      this.store[identifier] = { count: 1, resetTime };
      return true;
    }

    const entry = this.store[identifier];

    // Reset if window has passed
    if (now > entry.resetTime) {
      entry.count = 1;
      entry.resetTime = resetTime;
      return true;
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    return entry.count <= limit;
  }

  /**
   * Get remaining requests for an identifier
   * @param identifier - Unique identifier
   * @param limit - Maximum requests allowed
   * @returns Number of remaining requests
   */
  getRemaining(identifier: string, limit: number = 100): number {
    const entry = this.store[identifier];
    if (!entry) return limit;
    
    const now = Date.now();
    if (now > entry.resetTime) return limit;
    
    return Math.max(0, limit - entry.count);
  }

  /**
   * Get reset time for an identifier
   * @param identifier - Unique identifier
   * @returns Reset time in seconds from now
   */
  getResetTime(identifier: string): number {
    const entry = this.store[identifier];
    if (!entry) return 0;
    
    const now = Date.now();
    if (now > entry.resetTime) return 0;
    
    return Math.ceil((entry.resetTime - now) / 1000);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  /**
   * Destroy the rate limiter (clean up interval)
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}

// Create singleton instance
export const rateLimiter = new RateLimiter();

// Rate limit configurations
export const RATE_LIMITS = {
  // API endpoints
  API_DEFAULT: { limit: 100, window: 60000 }, // 100 requests per minute
  API_AUTH: { limit: 5, window: 300000 }, // 5 auth attempts per 5 minutes
  API_WRITE: { limit: 30, window: 60000 }, // 30 write operations per minute
  API_READ: { limit: 200, window: 60000 }, // 200 read operations per minute
  
  // Specific operations
  USER_SEARCH: { limit: 20, window: 60000 }, // 20 searches per minute
  EXPORT_DATA: { limit: 5, window: 3600000 }, // 5 exports per hour
  AI_CHAT: { limit: 50, window: 3600000 }, // 50 AI chats per hour
  FILE_UPLOAD: { limit: 10, window: 600000 }, // 10 uploads per 10 minutes
};

// Helper function for API routes
export function checkRateLimit(
  identifier: string,
  config: { limit: number; window: number } = RATE_LIMITS.API_DEFAULT
): { allowed: boolean; remaining: number; resetIn: number } {
  const allowed = rateLimiter.check(identifier, config.limit, config.window);
  const remaining = rateLimiter.getRemaining(identifier, config.limit);
  const resetIn = rateLimiter.getResetTime(identifier);

  return { allowed, remaining, resetIn };
}

// Middleware for Next.js API routes
export function withRateLimit(
  handler: Function,
  config?: { limit: number; window: number }
) {
  return async (req: any, res: any) => {
    // Get identifier (IP address or user ID)
    const identifier = req.headers['x-forwarded-for'] || 
                     req.connection.remoteAddress || 
                     'unknown';

    const { allowed, remaining, resetIn } = checkRateLimit(identifier, config);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config?.limit || RATE_LIMITS.API_DEFAULT.limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetIn);

    if (!allowed) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: resetIn
      });
    }

    return handler(req, res);
  };
} 