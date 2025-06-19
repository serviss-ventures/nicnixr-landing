import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
}

// Different rate limits for different endpoints
const rateLimitConfigs: Record<string, RateLimitConfig> = {
  '/api/ai-coach/chat': {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 10,      // 10 requests per minute
  },
  '/api/monitoring': {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 60,      // 60 requests per minute
  },
  '/api/mobile/logs': {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 100,     // 100 requests per minute
  },
  '/api/users': {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 30,      // 30 requests per minute
  },
  'default': {
    windowMs: 60 * 1000,  // 1 minute
    maxRequests: 60,      // 60 requests per minute (default)
  }
};

export function rateLimit(request: NextRequest): NextResponse | null {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  const pathname = request.nextUrl.pathname;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const apiKey = request.headers.get('x-api-key');
  
  // Create a unique identifier for rate limiting
  const identifier = apiKey ? `api:${apiKey}` : `ip:${ip}`;
  const key = `${identifier}:${pathname}`;
  
  // Get the appropriate rate limit config
  const config = rateLimitConfigs[pathname] || rateLimitConfigs.default;
  
  // Get current timestamp
  const now = Date.now();
  
  // Get or create rate limit entry
  const rateLimitEntry = rateLimitMap.get(key);
  
  if (!rateLimitEntry || now > rateLimitEntry.resetTime) {
    // Create new entry or reset existing one
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      cleanupOldEntries();
    }
    
    return null; // Allow request
  }
  
  // Check if limit exceeded
  if (rateLimitEntry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((rateLimitEntry.resetTime - now) / 1000);
    
    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitEntry.resetTime).toISOString()
        }
      }
    );
  }
  
  // Increment count
  rateLimitEntry.count++;
  rateLimitMap.set(key, rateLimitEntry);
  
  return null; // Allow request
}

// Clean up expired entries to prevent memory leak
function cleanupOldEntries() {
  const now = Date.now();
  const entriesToDelete: string[] = [];
  
  rateLimitMap.forEach((entry, key) => {
    if (now > entry.resetTime + 60000) { // 1 minute after reset time
      entriesToDelete.push(key);
    }
  });
  
  entriesToDelete.forEach(key => rateLimitMap.delete(key));
}

// Export for testing
export function resetRateLimits() {
  rateLimitMap.clear();
}

// Get rate limit status for monitoring
export function getRateLimitStatus() {
  const status: Record<string, any> = {};
  const now = Date.now();
  
  rateLimitMap.forEach((entry, key) => {
    if (now <= entry.resetTime) {
      status[key] = {
        count: entry.count,
        resetTime: new Date(entry.resetTime).toISOString(),
        remaining: (rateLimitConfigs[key.split(':').pop() || ''] || rateLimitConfigs.default).maxRequests - entry.count
      };
    }
  });
  
  return status;
} 