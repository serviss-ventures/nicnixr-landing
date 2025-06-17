import { supabase } from '../lib/supabase';
import { ProgressStats } from '../store/slices/progressSlice';
import { Badge } from '../types';

export class ProgressSyncService {
  /**
   * Sync user stats to Supabase
   * This should be called whenever stats are updated
   */
  static async syncStats(userId: string, stats: ProgressStats) {
    try {
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
        console.error('Error syncing stats to Supabase:', error);
        throw error;
      }

      console.log('Stats synced successfully');
    } catch (error) {
      console.error('Failed to sync stats:', error);
      // Don't throw - we don't want to break the app if sync fails
    }
  }

  /**
   * Sync achievements to Supabase
   * This should be called when badges are unlocked
   */
  static async syncAchievement(userId: string, badge: Badge) {
    try {
      if (!badge.earnedDate) return; // Only sync earned badges

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
        console.error('Error syncing achievement to Supabase:', error);
        throw error;
      }

      console.log(`Achievement ${badge.title} synced successfully`);
    } catch (error) {
      console.error('Failed to sync achievement:', error);
      // Don't throw - we don't want to break the app if sync fails
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
        console.error('Error loading stats from Supabase:', error);
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
      console.error('Failed to load stats:', error);
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
        console.error('Error loading achievements from Supabase:', error);
        return [];
      }

      return data?.map(a => a.achievement_name) || [];
    } catch (error) {
      console.error('Failed to load achievements:', error);
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
        console.error('Error loading historical stats:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to load historical stats:', error);
      return [];
    }
  }
} 