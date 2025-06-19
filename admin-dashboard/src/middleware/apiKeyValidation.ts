import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Store API keys (in production, use database or environment variables)
const API_KEYS = new Map<string, { name: string; permissions: string[]; createdAt: Date }>();

// Initialize with development keys
if (process.env.NODE_ENV === 'development') {
  API_KEYS.set('dev-mobile-app-key', {
    name: 'Mobile App Development',
    permissions: ['mobile:logs:write', 'mobile:stats:read', 'ai:chat'],
    createdAt: new Date(),
  });
}

// Production API keys from environment
if (process.env.MOBILE_APP_API_KEY) {
  API_KEYS.set(process.env.MOBILE_APP_API_KEY, {
    name: 'Mobile App Production',
    permissions: ['mobile:logs:write', 'mobile:stats:read', 'ai:chat'],
    createdAt: new Date(),
  });
}

if (process.env.MONITORING_API_KEY) {
  API_KEYS.set(process.env.MONITORING_API_KEY, {
    name: 'Monitoring Service',
    permissions: ['monitoring:read', 'monitoring:write', 'webhooks:monitoring'],
    createdAt: new Date(),
  });
}

// Permission requirements for each endpoint
const ENDPOINT_PERMISSIONS: Record<string, string[]> = {
  '/api/mobile/logs': ['mobile:logs:write'],
  '/api/mobile/stats': ['mobile:stats:read'],
  '/api/ai-coach/chat': ['ai:chat'],
  '/api/monitoring': ['monitoring:read'],
  '/api/webhooks/monitoring': ['webhooks:monitoring'],
  '/api/users/stats': ['users:stats:read'],
  '/api/analytics': ['analytics:read'],
};

export function validateApiKey(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  
  // Skip validation for non-API routes
  if (!pathname.startsWith('/api/')) {
    return null;
  }
  
  // Skip validation for health check
  if (pathname === '/api/health') {
    return null;
  }
  
  // Get API key from header
  const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!apiKey) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'API key is required. Please include x-api-key header.',
      },
      { status: 401 }
    );
  }
  
  // Validate API key
  const keyData = API_KEYS.get(apiKey);
  
  if (!keyData) {
    // Log invalid API key attempt
    console.warn(`Invalid API key attempt: ${apiKey.substring(0, 8)}... for ${pathname}`);
    
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Invalid API key',
      },
      { status: 401 }
    );
  }
  
  // Check permissions
  const requiredPermissions = ENDPOINT_PERMISSIONS[pathname] || [];
  const hasPermission = requiredPermissions.every(perm => keyData.permissions.includes(perm));
  
  if (!hasPermission) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: `API key does not have required permissions for ${pathname}`,
        required: requiredPermissions,
        available: keyData.permissions,
      },
      { status: 403 }
    );
  }
  
  // Add API key info to headers for downstream use
  const response = NextResponse.next();
  response.headers.set('x-api-key-name', keyData.name);
  response.headers.set('x-api-key-permissions', keyData.permissions.join(','));
  
  return null; // Allow request
}

// Generate a new API key
export function generateApiKey(prefix: string = 'nixr'): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `${prefix}_${timestamp}_${randomBytes}`;
}

// Add a new API key (for admin use)
export function addApiKey(key: string, name: string, permissions: string[]): void {
  API_KEYS.set(key, {
    name,
    permissions,
    createdAt: new Date(),
  });
}

// Revoke an API key
export function revokeApiKey(key: string): boolean {
  return API_KEYS.delete(key);
}

// List all API keys (for admin dashboard)
export function listApiKeys(): Array<{ key: string; name: string; permissions: string[]; createdAt: Date }> {
  return Array.from(API_KEYS.entries()).map(([key, data]) => ({
    key: `${key.substring(0, 8)}...${key.substring(key.length - 4)}`, // Partially hidden
    ...data,
  }));
} 