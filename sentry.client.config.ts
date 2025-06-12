// This file configures the initialization of Sentry on the client side.
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Adjust this value in production, or use tracesSampleRate in a production environment.
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // This sets the sample rate to be 10%. You may want this to be 100% while in development
    // and then sample at a lower rate in production
    replaysSessionSampleRate: 0.1,
    
    // If the entire session is not sampled, use the below sample rate to sample
    // sessions when an error occurs.
    replaysOnErrorSampleRate: 1.0,
    
    debug: process.env.NODE_ENV === 'development',
    
    integrations: [
      Sentry.replayIntegration({
        // Mask all text content, but keep media and other elements visible
        maskAllText: true,
        blockAllMedia: false,
      }),
    ],
    
    // Performance Monitoring
    tracingOptions: {
      trackComponents: true,
    },
    
    // Environment
    environment: process.env.NODE_ENV || 'development',
    
    // Additional options
    beforeSend(event) {
      // Modify event here before sending
      if (event.exception && process.env.NODE_ENV === 'development') {
        console.error('Sentry captured exception:', event.exception);
      }
      return event;
    },
    
    // Filter out specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Random network errors
      'Network request failed',
      'NetworkError',
      // User cancelled errors
      'AbortError',
    ],
  });
}