/**
 * Error Types
 * 
 * Centralized error types for consistent error handling
 */

export interface NetworkError extends Error {
  code?: string;
  details?: any;
  isNetworkError: true;
}

export interface SupabaseError extends Error {
  code?: string;
  details?: any;
  hint?: string | null;
}

export interface ValidationError extends Error {
  field?: string;
  value?: any;
}

/**
 * Type guards for error checking
 */
export const isNetworkError = (error: any): error is NetworkError => {
  return error?.message?.includes('Network request failed') || 
         error?.message?.includes('fetch failed') ||
         error?.code === 'NETWORK_ERROR';
};

export const isSupabaseError = (error: any): error is SupabaseError => {
  return error?.code?.startsWith('PGRST') || 
         error?.code?.startsWith('JWT') ||
         error?.hint !== undefined;
};

export const isOfflineError = (error: any): boolean => {
  return isNetworkError(error) || 
         error?.message?.includes('offline') ||
         error?.message?.includes('No internet');
}; 