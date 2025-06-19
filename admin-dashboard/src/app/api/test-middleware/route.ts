import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get headers set by middleware
  const apiKeyName = request.headers.get('x-api-key-name');
  const apiKeyPermissions = request.headers.get('x-api-key-permissions');
  
  return NextResponse.json({
    message: 'Middleware test successful!',
    timestamp: new Date().toISOString(),
    middleware: {
      rateLimit: 'Passed',
      apiKeyValidation: 'Passed',
      apiKeyInfo: {
        name: apiKeyName || 'No API key',
        permissions: apiKeyPermissions?.split(',') || [],
      },
    },
    headers: {
      'x-api-key': request.headers.get('x-api-key') ? 'Present (hidden)' : 'Not present',
      'user-agent': request.headers.get('user-agent'),
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      message: 'POST request successful',
      echo: body,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }
} 