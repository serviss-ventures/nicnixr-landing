import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './middleware/rateLimit';
import { validateApiKey } from './middleware/apiKeyValidation';

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Validate API key for external API routes
    const apiKeyResponse = validateApiKey(request);
    if (apiKeyResponse) {
      return apiKeyResponse;
    }
  }
  
  // Allow access to login page
  if (pathname.startsWith('/login')) {
    return NextResponse.next();
  }
  
  // Check for auth cookie
  const authCookie = request.cookies.get('admin_auth');
  
  if (!authCookie || authCookie.value !== 'true') {
    // Redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Allow access
  return NextResponse.next();
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