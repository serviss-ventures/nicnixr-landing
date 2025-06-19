/**
 * Development Configuration
 * 
 * Control feature flags and settings for development
 */

export const devConfig = {
  // Disable analytics and remote logging to prevent network errors during development
  enableAnalytics: false,
  enableRemoteLogging: false,
  
  // Supabase fallback configuration
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
  },
  
  // AI Coach API
  aiCoachApi: {
    url: process.env.EXPO_PUBLIC_ADMIN_API_URL || 'http://192.168.1.171:3000',
  },
  
  // Feature flags
  features: {
    onboardingAnalytics: false, // Disable to prevent network errors
    remoteErrorLogging: false,
    offlineMode: true,
  }
};

// Helper to check if analytics should be enabled
export const shouldTrackAnalytics = () => {
  return devConfig.enableAnalytics && process.env.EXPO_PUBLIC_SUPABASE_URL;
};

// Development configuration
export const ANALYTICS_ENABLED = false; // Set to true to enable analytics in development
export const REMOTE_LOGGER_ENABLED = false; // Set to true to enable remote logging in development 