import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

/**
 * Analytics Service - The Eyes of Our AI Marketing Brain
 * 
 * This service tracks EVERYTHING to feed our AI brain:
 * - User behavior for optimization
 * - Feature usage for product decisions
 * - Revenue events for LTV calculation
 * - Attribution data for marketing ROI
 */

interface EventProperties {
  [key: string]: any;
}

interface UserProperties {
  [key: string]: any;
}

class AnalyticsService {
  private userId: string | null = null;
  private sessionId: string;
  private eventQueue: any[] = [];
  private isInitialized = false;
  private batchTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async initialize() {
    try {
      // Check if analytics is disabled in development
      const { devConfig } = await import('../config/development');
      if (!devConfig.enableAnalytics) {
        console.log('Analytics disabled in development');
        return;
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        this.userId = user.id;
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        this.userId = session?.user?.id || null;
        if (_event === 'SIGNED_IN') {
          this.track('user_authenticated', {
            method: session?.user?.email ? 'email' : 'anonymous',
          });
        }
      });

      // Get attribution data from storage
      const attribution = await AsyncStorage.getItem('attribution_data');
      if (attribution) {
        this.setUserProperties(JSON.parse(attribution));
      }

      this.isInitialized = true;
      
      // Start batch processing
      this.startBatchProcessing();
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }

  /**
   * Track an event - This is the main method for all tracking
   */
  async track(eventName: string, properties?: EventProperties) {
    if (!this.isInitialized) {
      // Queue events until initialized
      this.eventQueue.push({ eventName, properties, timestamp: new Date() });
      return;
    }

    const event = {
      user_id: this.userId,
      session_id: this.sessionId,
      event_name: eventName,
      properties: {
        ...properties,
        platform: Platform.OS,
        platform_version: Platform.Version,
        timestamp: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    };

    // Add to queue for batch processing
    this.eventQueue.push(event);

    // Log critical events immediately
    if (this.isCriticalEvent(eventName)) {
      await this.flushEvents();
    }
  }

  /**
   * Track screen views for user flow analysis
   */
  trackScreen(screenName: string, properties?: EventProperties) {
    this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Track revenue events for LTV calculation
   */
  trackRevenue(amount: number, currency: string = 'USD', properties?: EventProperties) {
    this.track('revenue', {
      amount,
      currency,
      ...properties,
    });
  }

  /**
   * Track user signup with attribution
   */
  trackSignup(method: string, attribution?: any) {
    this.track('signup', {
      method,
      ...attribution,
    });

    // Set user properties for segmentation
    if (attribution) {
      this.setUserProperties({
        acquisition_channel: attribution.channel,
        acquisition_campaign: attribution.campaign,
        acquisition_source: attribution.source,
      });
    }
  }

  /**
   * Track feature usage for product optimization
   */
  trackFeatureUsage(featureName: string, properties?: EventProperties) {
    this.track('feature_used', {
      feature_name: featureName,
      ...properties,
    });
  }

  /**
   * Track conversion events for funnel analysis
   */
  trackConversion(conversionType: string, value?: number, properties?: EventProperties) {
    this.track('conversion', {
      conversion_type: conversionType,
      value,
      ...properties,
    });
  }

  /**
   * Set user properties for segmentation
   */
  async setUserProperties(properties: UserProperties) {
    if (!this.userId) return;

    try {
      const { error } = await supabase
        .from('user_properties')
        .upsert({
          user_id: this.userId,
          properties,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error setting user properties:', error);
    }
  }

  /**
   * Track app lifecycle events
   */
  trackAppOpen(attribution?: any) {
    this.track('app_open', {
      session_id: this.sessionId,
      ...attribution,
    });
  }

  trackAppBackground() {
    this.track('app_background', {
      session_duration: Date.now() - parseInt(this.sessionId.split('-')[0]),
    });
    this.flushEvents();
  }

  /**
   * Track onboarding progress
   */
  trackOnboardingStep(step: number, stepName: string, properties?: EventProperties) {
    this.track('onboarding_step', {
      step_number: step,
      step_name: stepName,
      ...properties,
    });
  }

  trackOnboardingComplete(duration: number) {
    this.track('onboarding_complete', {
      duration_seconds: duration,
      steps_completed: 10,
    });
    this.trackConversion('onboarding_complete');
  }

  /**
   * Track errors for debugging
   */
  trackError(error: string, context?: any) {
    this.track('error', {
      error_message: error,
      context,
      stack_trace: new Error().stack,
    });
  }

  /**
   * Private methods
   */
  private isCriticalEvent(eventName: string): boolean {
    const criticalEvents = [
      'signup',
      'revenue',
      'conversion',
      'error',
      'app_crash',
    ];
    return criticalEvents.includes(eventName);
  }

  private startBatchProcessing() {
    // Process events every 30 seconds
    this.batchTimer = setInterval(() => {
      this.flushEvents();
    }, 30000);
  }

  private async flushEvents() {
    if (this.eventQueue.length === 0) return;
    
    // Don't flush if not initialized (analytics disabled)
    if (!this.isInitialized) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(eventsToSend);

      if (error) {
        // Re-queue events on failure
        this.eventQueue.unshift(...eventsToSend);
        throw error;
      }

      console.log(`Flushed ${eventsToSend.length} analytics events`);
    } catch (error) {
      console.error('Error flushing analytics events:', error);
    }
  }

  /**
   * Attribution tracking for marketing optimization
   */
  async trackInstallAttribution(attribution: any) {
    // Store attribution for later use
    await AsyncStorage.setItem('attribution_data', JSON.stringify(attribution));
    
    this.track('install_attributed', attribution);
    
    // Set user properties
    this.setUserProperties({
      install_source: attribution.source,
      install_medium: attribution.medium,
      install_campaign: attribution.campaign,
      install_timestamp: new Date().toISOString(),
    });
  }

  /**
   * A/B Testing support
   */
  trackExperiment(experimentName: string, variant: string) {
    this.track('experiment_exposure', {
      experiment_name: experimentName,
      variant,
    });

    // Store for consistent experience
    AsyncStorage.setItem(`experiment_${experimentName}`, variant);
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
    this.flushEvents();
  }
}

// Export singleton instance
export default new AnalyticsService(); 