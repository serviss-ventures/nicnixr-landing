import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';
import { remoteLogger } from './remoteLogger';
import { devConfig, shouldTrackAnalytics } from '../config/development';

interface OnboardingStep {
  number: number;
  name: string;
  startTime?: number;
}

interface DeviceInfo {
  platform: string;
  os_version: string;
  device_type: string;
  device_model?: string;
  app_version: string;
}

class OnboardingAnalyticsService {
  private sessionId: string;
  private currentStep: OnboardingStep | null = null;
  private stepStartTimes: Map<number, number> = new Map();
  
  constructor() {
    this.sessionId = uuidv4();
  }
  
  // Validate if a string is a valid UUID
  private isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
  
  private getDeviceInfo(): DeviceInfo {
    return {
      platform: Platform.OS,
      os_version: Platform.Version.toString(),
      device_type: Device.deviceType || 'phone',
      device_model: Device.modelName || undefined,
      app_version: '1.0.0', // Get from app.json in real implementation
    };
  }
  
  private async getUTMParams(): Promise<any> {
    // In a real app, these would come from deep links or app install referrer
    const utmSource = await AsyncStorage.getItem('utm_source');
    const utmMedium = await AsyncStorage.getItem('utm_medium');
    const utmCampaign = await AsyncStorage.getItem('utm_campaign');
    
    return {
      source: utmSource || 'organic',
      medium: utmMedium || 'app',
      campaign: utmCampaign || 'none',
    };
  }
  
  async trackStepStarted(stepNumber: number, stepName: string, userId?: string) {
    try {
      const startTime = Date.now();
      this.stepStartTimes.set(stepNumber, startTime);
      this.currentStep = { number: stepNumber, name: stepName, startTime };
      
      // Check if analytics is enabled
      if (!shouldTrackAnalytics()) {
        logger.debug(`Analytics disabled - Step ${stepNumber} (${stepName}) started`);
        return;
      }
      
      // Only track if we have a valid UUID user ID
      if (!userId || !this.isValidUUID(userId)) {
        logger.debug(`Step ${stepNumber} (${stepName}) started - awaiting valid user ID`);
        remoteLogger.setContext('screen', `Onboarding Step ${stepNumber}`);
        // Don't make network requests without valid user ID
        return;
      }
      
      // Add retry logic with exponential backoff
      let retries = 0;
      const maxRetries = 3;
      const baseDelay = 1000; // 1 second
      
      while (retries < maxRetries) {
        try {
          const { error } = await supabase
            .from('onboarding_analytics')
            .insert({
              user_id: userId,
              session_id: this.sessionId,
              step_number: stepNumber,
              step_name: stepName,
              action: 'started',
              device_info: this.getDeviceInfo(),
              utm_params: await this.getUTMParams(),
            });
            
          if (error) {
            // If it's a network error, retry
            if (error.message?.includes('Network request failed')) {
              throw error;
            }
            // For other errors, log and return
            logger.error('Error tracking step started', {
              message: error.message,
              code: error.code,
              details: error
            });
            return;
          } else {
            logger.debug(`Tracked: Step ${stepNumber} (${stepName}) started for user ${userId}`);
            return; // Success, exit
          }
        } catch (networkError) {
          retries++;
          if (retries >= maxRetries) {
            logger.error('Max retries exceeded for tracking step started', {
              stepNumber,
              stepName,
              userId,
              error: networkError instanceof Error ? networkError.message : String(networkError)
            });
            return;
          }
          // Wait with exponential backoff
          await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, retries - 1)));
        }
      }
    } catch (error) {
      logger.error('Error in trackStepStarted', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }
  
  async trackStepCompleted(stepNumber: number, stepName: string, userId?: string, additionalData?: any) {
    try {
      // Check if analytics is enabled
      if (!shouldTrackAnalytics()) {
        console.log(`📊 Analytics disabled - Step ${stepNumber} (${stepName}) completed`);
        return;
      }
      
      // Only track if we have a valid UUID user ID
      if (!userId || !this.isValidUUID(userId)) {
        console.log(`📊 Step ${stepNumber} (${stepName}) completed - awaiting valid user ID`);
        return;
      }
      
      const startTime = this.stepStartTimes.get(stepNumber);
      const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : null;
      
      const { error } = await supabase
        .from('onboarding_analytics')
        .insert({
          user_id: userId,
          session_id: this.sessionId,
          step_number: stepNumber,
          step_name: stepName,
          action: 'completed',
          time_spent_seconds: timeSpent,
          device_info: this.getDeviceInfo(),
          utm_params: await this.getUTMParams(),
        });
        
      if (error) {
        console.error('Error tracking step completed:', error);
      } else {
        console.log(`📊 Tracked: Step ${stepNumber} (${stepName}) completed in ${timeSpent}s`);
      }
      
      // Track specific data based on step
      if (additionalData) {
        await this.saveOnboardingData(userId, stepNumber, additionalData);
      }
    } catch (error) {
      console.error('Error in trackStepCompleted:', error);
    }
  }
  
  async trackStepAbandoned(stepNumber: number, stepName: string, userId?: string) {
    try {
      // Only track if we have a valid UUID user ID
      if (!userId || !this.isValidUUID(userId)) {
        console.log(`📊 Step ${stepNumber} (${stepName}) abandoned - no valid user ID`);
        return;
      }
      
      const startTime = this.stepStartTimes.get(stepNumber);
      const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : null;
      
      await supabase
        .from('onboarding_analytics')
        .insert({
          user_id: userId,
          session_id: this.sessionId,
          step_number: stepNumber,
          step_name: stepName,
          action: 'abandoned',
          time_spent_seconds: timeSpent,
          device_info: this.getDeviceInfo(),
          utm_params: await this.getUTMParams(),
        });
        
      console.log(`📊 Tracked: Step ${stepNumber} (${stepName}) abandoned`);
    } catch (error) {
      console.error('Error tracking step abandoned:', error);
    }
  }
  
  async trackConversionEvent(userId: string, eventType: string, eventValue?: number) {
    try {
      // Check if analytics is enabled
      if (!shouldTrackAnalytics()) {
        console.log(`🎯 Analytics disabled - Conversion Event: ${eventType}`);
        return;
      }
      
      // Only track if we have a valid UUID user ID
      if (!userId || !this.isValidUUID(userId)) {
        console.log(`🎯 Conversion Event: ${eventType} - awaiting valid user ID`);
        return;
      }
      
      const utm = await this.getUTMParams();
      const device = this.getDeviceInfo();
      
      const { error } = await supabase
        .from('conversion_events')
        .insert({
          user_id: userId,
          event_type: eventType,
          event_value: eventValue,
          attribution_source: utm.source,
          attribution_medium: utm.medium,
          attribution_campaign: utm.campaign,
          device_type: device.platform,
          app_version: device.app_version,
        });
        
      if (error) {
        console.error('Error tracking conversion event:', error);
      } else {
        console.log(`🎯 Conversion Event: ${eventType} tracked for user ${userId}`);
      }
    } catch (error) {
      console.error('Error in trackConversionEvent:', error);
    }
  }
  
  async saveOnboardingData(userId: string, stepNumber: number, data: any) {
    try {
      // Check if analytics is enabled
      if (!shouldTrackAnalytics()) {
        console.log(`💾 Analytics disabled - Onboarding data for step ${stepNumber}`);
        return;
      }
      
      // Only save if we have a valid UUID user ID
      if (!userId || !this.isValidUUID(userId)) {
        console.log(`💾 Onboarding data for step ${stepNumber} - awaiting valid user ID`);
        return;
      }
      
      // Get existing data first
      const { data: existingData } = await supabase
        .from('user_onboarding_data')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      let updateData: any = {};
      
      // Map step data to database fields (updated for new flow)
      switch (stepNumber) {
        case 2: // Demographics (was step 3)
          updateData = {
            age_range: data.ageRange,
            gender: data.gender,
            location_country: data.country,
            location_state: data.state,
          };
          break;
          
        case 3: // Nicotine Profile (was step 4)
          // Map mobile app categories to database substance types
          let substanceType = data.substanceType || data.nicotineProduct?.category;
          if (substanceType === 'chewing' || substanceType === 'chew' || substanceType === 'dip') {
            substanceType = 'chew_dip';
          } else if (substanceType === 'pouches') {
            substanceType = 'nicotine_pouches';
          }
          
          updateData = {
            substance_type: substanceType,
            brand: data.brand,
            daily_usage: data.dailyUsage || data.dailyAmount,
            years_using: data.yearsUsing,
            cost_per_unit: data.costPerUnit || data.dailyCost,
          };
          break;
          
        case 4: // Reasons & Fears (was step 5)
          updateData = {
            quit_reasons: data.quitReasons || data.reasonsToQuit,
            biggest_fears: data.biggestFears,
            motivation_level: data.motivationLevel,
          };
          break;
          
        case 5: // Triggers (was step 6)
          updateData = {
            trigger_situations: data.triggerSituations,
            trigger_emotions: data.triggerEmotions,
            trigger_times: data.triggerTimes,
          };
          break;
          
        case 6: // Past Attempts (was step 7)
          updateData = {
            previous_quit_attempts: data.previousAttempts || data.previousQuitAttempts,
            longest_quit_duration: data.longestDuration || data.longestQuitDuration,
            relapse_reasons: data.relapseReasons,
            successful_strategies: data.successfulStrategies,
          };
          break;
          
        case 7: // Quit Date (was step 8)
          updateData = {
            planned_quit_date: data.quitDate,
            quit_approach: data.quitApproach,
          };
          break;
          
        case 10: // Authentication/Onboarding Complete
          updateData = {
            preferred_support_styles: data.supportStyles,
            buddy_preference: data.buddyPreference,
            onboarding_completed_at: new Date().toISOString(),
          };
          break;
      }
      
      // Only update if we have data to save
      if (Object.keys(updateData).length === 0) {
        console.log(`💾 No data to save for step ${stepNumber}`);
        return;
      }
      
      // Upsert the data
      if (existingData) {
        const { error } = await supabase
          .from('user_onboarding_data')
          .update(updateData)
          .eq('user_id', userId);
          
        if (error) {
          console.error('Error updating onboarding data:', error);
        } else {
          console.log(`💾 Updated onboarding data for step ${stepNumber}:`, updateData);
        }
      } else {
        const { error } = await supabase
          .from('user_onboarding_data')
          .insert({
            user_id: userId,
            ...updateData,
          });
          
        if (error) {
          console.error('Error inserting onboarding data:', error);
        } else {
          console.log(`💾 Saved onboarding data for step ${stepNumber}:`, updateData);
        }
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  }
  
  async trackABTestAssignment(userId: string, testName: string, variant: string) {
    try {
      // Only track if we have a valid UUID user ID
      if (!userId || !this.isValidUUID(userId)) {
        console.log(`🧪 A/B Test: ${testName} - awaiting valid user ID`);
        return;
      }
      
      const { error } = await supabase
        .from('ab_test_assignments')
        .insert({
          user_id: userId,
          test_name: testName,
          variant: variant,
        });
        
      if (error && !error.message.includes('duplicate')) {
        console.error('Error tracking A/B test assignment:', error);
      } else {
        console.log(`🧪 A/B Test: User ${userId} assigned to ${testName}:${variant}`);
      }
    } catch (error) {
      console.error('Error in trackABTestAssignment:', error);
    }
  }
  
  // Calculate and return session metrics
  getSessionMetrics() {
    const metrics = {
      sessionId: this.sessionId,
      totalSteps: this.stepStartTimes.size,
      totalTimeSeconds: 0,
      averageStepTime: 0,
    };
    
    if (this.stepStartTimes.size > 0) {
      const times = Array.from(this.stepStartTimes.values());
      const firstStep = Math.min(...times);
      const lastStep = Math.max(...times);
      metrics.totalTimeSeconds = Math.floor((lastStep - firstStep) / 1000);
      metrics.averageStepTime = Math.floor(metrics.totalTimeSeconds / metrics.totalSteps);
    }
    
    return metrics;
  }
}

// Export a singleton instance
export const onboardingAnalytics = new OnboardingAnalyticsService(); 