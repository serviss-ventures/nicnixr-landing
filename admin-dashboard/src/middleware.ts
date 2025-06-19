import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './middleware/rateLimit';
import { validateApiKey } from './middleware/apiKeyValidation';
import { simpleAdminAuth } from './lib/simpleAdminAuth';

export async function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Skip auth validation for auth endpoints
    if (pathname.startsWith('/api/auth/')) {
      return NextResponse.next();
    }
    
    // Validate API key for external API routes
    const apiKeyResponse = validateApiKey(request);
    if (apiKeyResponse) {
      return apiKeyResponse;
    }
  }
  
  // Allow access to login page and auth API
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }
  
  // Check for admin token
  const token = request.cookies.get('admin_token')?.value;
  
  if (!token) {
    // Redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Verify session
  const user = await simpleAdminAuth.verifySession(token);
  
  if (!user) {
    // Invalid or expired session - clear cookie and redirect
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('admin_token');
    return response;
  }
  
  // Add user info to headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-admin-user-id', user.id);
  requestHeaders.set('x-admin-user-email', user.email);
  requestHeaders.set('x-admin-user-role', user.role);
  
  // Allow access with updated headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 