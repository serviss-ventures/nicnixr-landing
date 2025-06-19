/**
 * API Metrics Middleware
 * Automatically tracks metrics for all API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiMetrics } from '@/lib/apiMetrics';

export async function trackApiMetrics(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const endpoint = request.nextUrl.pathname;
  const method = request.method;

  try {
    // Execute the actual handler
    const response = await handler();
    
    // Track the metric
    await apiMetrics.trackRequest({
      endpoint,
      method,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      statusCode: response.status,
      userId: request.headers.get('x-user-id') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      requestSize: parseInt(request.headers.get('content-length') || '0'),
      responseSize: parseInt(response.headers.get('content-length') || '0'),
    });

    return response;
  } catch (error) {
    // Track error metric
    await apiMetrics.trackRequest({
      endpoint,
      method,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      statusCode: 500,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      userId: request.headers.get('x-user-id') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      requestSize: parseInt(request.headers.get('content-length') || '0'),
    });

    throw error;
  }
}

/**
 * Wrap an API route handler with metrics tracking
 */
export function withMetrics<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (request: NextRequest, ...args: any[]) => {
    return trackApiMetrics(request, () => handler(request, ...args));
  }) as T;
} 