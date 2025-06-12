import * as Sentry from '@sentry/nextjs';

/**
 * Custom error tracking utilities for consistent error reporting
 */

export interface ErrorContext {
  userId?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Track a custom error with context
 */
export const trackError = (error: Error | string, context?: ErrorContext) => {
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  
  Sentry.withScope((scope) => {
    if (context?.userId) {
      scope.setUser({ id: context.userId });
    }
    
    if (context?.action) {
      scope.setTag('action', context.action);
    }
    
    if (context?.metadata) {
      scope.setContext('metadata', context.metadata);
    }
    
    Sentry.captureException(errorObj);
  });
};

/**
 * Track a custom message/event
 */
export const trackEvent = (
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  context?: ErrorContext
) => {
  Sentry.withScope((scope) => {
    if (context?.userId) {
      scope.setUser({ id: context.userId });
    }
    
    if (context?.action) {
      scope.setTag('action', context.action);
    }
    
    if (context?.metadata) {
      scope.setContext('metadata', context.metadata);
    }
    
    Sentry.captureMessage(message, level);
  });
};

/**
 * Track API errors with additional context
 */
export const trackApiError = (
  endpoint: string,
  error: Error & { response?: { data?: unknown; status?: number } },
  requestData?: unknown
) => {
  Sentry.withScope((scope) => {
    scope.setTag('api.endpoint', endpoint);
    scope.setContext('api', {
      endpoint,
      requestData: requestData || {},
      errorResponse: error.response?.data || error.message,
      statusCode: error.response?.status,
    });
    
    Sentry.captureException(error);
  });
};

/**
 * Track performance metrics
 */
export const trackPerformance = (
  metricName: string,
  value: number,
  unit: 'milliseconds' | 'seconds' | 'bytes' | 'percent' = 'milliseconds'
) => {
  // Performance tracking is handled automatically by Sentry's performance monitoring
  // This is a placeholder for custom metrics if needed
  Sentry.setMeasurement(metricName, value, unit);
};

/**
 * Add breadcrumb for user actions
 */
export const addBreadcrumb = (
  message: string,
  category: string,
  data?: Record<string, unknown>
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Set user context for all subsequent errors
 */
export const setUserContext = (user: {
  id: string;
  email?: string;
  username?: string;
}) => {
  Sentry.setUser(user);
};

/**
 * Clear user context (e.g., on logout)
 */
export const clearUserContext = () => {
  Sentry.setUser(null);
};