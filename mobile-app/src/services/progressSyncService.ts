import { supabase } from '../lib/supabase';
import { ProgressStats } from '../store/slices/progressSlice';
import { Badge } from '../types';
import { OfflineModeService } from './offlineMode';
import { logger } from './logger';
import { isNetworkError } from '../types/errors';
import { devConfig } from '../config/development';

export class ProgressSyncService {
  /**
   * Sync user stats to Supabase
   * This should be called whenever stats are updated
   */
  static async syncStats(userId: string, stats: ProgressStats) {
    try {
      // Check if analytics is disabled in development
      if (!devConfig.enableAnalytics) {
        logger.debug('Analytics disabled in development - skipping stats sync');
        return;
      }

      // Check if offline mode is enabled
      if (OfflineModeService.isOfflineMode()) {
        logger.debug('Offline mode - skipping stats sync');
        return;
      }

      // Check if we have a valid Supabase client
      if (!supabase) {
        logger.warn('Supabase client not initialized - skipping sync');
        return;
      }

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        logger.warn('User not authenticated or ID mismatch - skipping sync');
        return;
      }

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const { error } = await supabase
        .from('user_stats')
        .upsert({
          user_id: userId,
          date: today,
          money_saved: stats.moneySaved,
          substances_avoided: stats.unitsAvoided,
          health_improvements: {
            health_score: stats.healthScore,
            life_regained: stats.lifeRegained,
            days_clean: stats.daysClean,
            streak_days: stats.streakDays,
            longest_streak: stats.longestStreak,
            recovery_strength: stats.recoveryStrength,
            improvement_trend: stats.improvementTrend
          },
          cravings_resisted: 0 // This can be tracked separately if needed
        })
        .select();

      if (error) {
        // Log error details for debugging
        logger.debug('Stats sync error', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        return;
      }

      logger.debug('Stats synced successfully');
    } catch (error: any) {
      // Network errors are expected in some environments
      if (isNetworkError(error)) {
        logger.debug('Stats sync skipped - offline or network unavailable');
      } else {
        logger.warn('Stats sync failed', error);
      }
    }
  }

  /**
   * Sync achievements to Supabase
   * This should be called when badges are unlocked
   */
  static async syncAchievement(userId: string, badge: Badge) {
    try {
      if (!badge.earnedDate) return; // Only sync earned badges

      // Check if analytics is disabled in development
      if (!devConfig.enableAnalytics) {
        logger.debug('Analytics disabled in development - skipping achievement sync');
        return;
      }

      // Check if offline mode is enabled
      if (OfflineModeService.isOfflineMode()) {
        logger.debug('Offline mode - skipping achievement sync');
        return;
      }

      // Check if we have a valid Supabase client
      if (!supabase) {
        logger.warn('Supabase client not initialized - skipping achievement sync');
        return;
      }

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        logger.warn('User not authenticated or ID mismatch - skipping achievement sync');
        return;
      }

      const { error } = await supabase
        .from('achievements')
        .upsert({
          user_id: userId,
          achievement_type: badge.category,
          achievement_name: badge.title,
          unlocked_at: badge.earnedDate,
          milestone_value: badge.requirement
        })
        .select();

      if (error) {
        logger.debug('Achievement sync error', {
          code: error.code,
          message: error.message,
          badge: badge.title
        });
        return;
      }

      logger.debug(`Achievement ${badge.title} synced successfully`);
    } catch (error: any) {
      if (isNetworkError(error)) {
        logger.debug('Achievement sync skipped - offline or network unavailable');
      } else {
        logger.warn('Achievement sync failed', error);
      }
    }
  }

  /**
   * Load user stats from Supabase
   * This can be used when the app starts to restore cloud data
   */
  static async loadStats(userId: string): Promise<ProgressStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        logger.error('Error loading stats from Supabase', error);
        return null;
      }

      if (data && data.health_improvements) {
        // Convert from database format to app format
        return {
          daysClean: data.health_improvements.days_clean || 0,
          hoursClean: (data.health_improvements.days_clean || 0) * 24,
          minutesClean: (data.health_improvements.days_clean || 0) * 24 * 60,
          secondsClean: (data.health_improvements.days_clean || 0) * 24 * 60 * 60,
          unitsAvoided: data.substances_avoided || 0,
          moneySaved: data.money_saved || 0,
          lifeRegained: data.health_improvements.life_regained || 0,
          healthScore: data.health_improvements.health_score || 0,
          streakDays: data.health_improvements.streak_days || 0,
          longestStreak: data.health_improvements.longest_streak || 0,
          totalRelapses: 0, // Not stored in current schema
          minorSlips: 0, // Not stored in current schema
          recoveryStrength: data.health_improvements.recovery_strength || 100,
          averageStreakLength: 0, // Not stored in current schema
          improvementTrend: data.health_improvements.improvement_trend || 'stable'
        } as ProgressStats;
      }

      return null;
    } catch (error) {
      logger.error('Failed to load stats', error);
      return null;
    }
  }

  /**
   * Load achievements from Supabase
   */
  static async loadAchievements(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('achievement_name')
        .eq('user_id', userId);

      if (error) {
        logger.error('Error loading achievements from Supabase', error);
        return [];
      }

      return data?.map(a => a.achievement_name) || [];
    } catch (error) {
      logger.error('Failed to load achievements', error);
      return [];
    }
  }

  /**
   * Get historical stats for analytics
   */
  static async getHistoricalStats(userId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        logger.error('Error loading historical stats', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to load historical stats', error);
      return [];
    }
  }
} 