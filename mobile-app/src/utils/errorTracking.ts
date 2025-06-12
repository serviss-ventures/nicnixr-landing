import * as Sentry from '@sentry/react-native';

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
  
  // Also log to console in development
  if (__DEV__) {
    console.error('Tracked error:', errorObj, context);
  }
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
  
  // Also log to console in development
  if (__DEV__) {
    console.log(`[${level.toUpperCase()}]`, message, context);
  }
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
  
  // Also log to console in development
  if (__DEV__) {
    console.error('API Error:', endpoint, error, requestData);
  }
};

/**
 * Track navigation errors
 */
export const trackNavigationError = (
  screen: string,
  error: Error,
  params?: unknown
) => {
  Sentry.withScope((scope) => {
    scope.setTag('navigation.screen', screen);
    scope.setContext('navigation', {
      screen,
      params,
      errorMessage: error.message,
    });
    
    Sentry.captureException(error);
  });
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
  quitDate?: string;
  plan?: string;
}) => {
  Sentry.setUser(user);
};

/**
 * Clear user context (e.g., on logout)
 */
export const clearUserContext = () => {
  Sentry.setUser(null);
};

/**
 * Track app state changes
 */
export const trackAppStateChange = (state: 'active' | 'background' | 'inactive') => {
  addBreadcrumb(`App state changed to ${state}`, 'app.lifecycle', { state });
};

/**
 * Track Redux action errors
 */
export const trackReduxError = (
  actionType: string,
  error: Error,
  payload?: unknown
) => {
  Sentry.withScope((scope) => {
    scope.setTag('redux.action', actionType);
    scope.setContext('redux', {
      actionType,
      payload,
      errorMessage: error.message,
    });
    
    Sentry.captureException(error);
  });
};