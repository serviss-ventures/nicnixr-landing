// This file configures the initialization of Sentry on the server side.
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Adjust this value in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    debug: process.env.NODE_ENV === 'development',
    
    // Environment
    environment: process.env.NODE_ENV || 'development',
    
    // Capture unhandled promise rejections
    integrations: [
      Sentry.captureConsoleIntegration({
        levels: ['error', 'warn'],
      }),
    ],
    
    // Additional options
    beforeSend(event) {
      // Modify event here before sending
      if (event.exception && process.env.NODE_ENV === 'development') {
        console.error('Sentry captured server exception:', event.exception);
      }
      return event;
    },
    
    // Filter out specific errors
    ignoreErrors: [
      // Common server errors to ignore
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'EPIPE',
    ],
  });
}