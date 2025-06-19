import { supabase } from '../lib/supabase';
import { logger } from './logger';

export interface Achievement {
  id?: string;
  userId: string;
  badgeId: string;
  badgeName: string;
  badgeDescription?: string;
  category: 'progress' | 'community' | 'health' | 'resilience';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  iconName?: string;
  color?: string;
  milestoneValue?: number;
  unlockedAt: string;
  viewed: boolean;
}

export interface ProgressMilestone {
  id?: string;
  userId: string;
  milestoneDay: number;
  milestoneTitle: string;
  milestoneDescription?: string;
  isAchieved: boolean;
  achievedAt?: string;
  genderSpecificContent?: any;
  nicotineTypeContent?: any;
}

class AchievementService {
  /**
   * Get all achievements for a user
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapAchievementFromDb);
    } catch (error) {
      logger.error('Failed to fetch achievements', error);
      return [];
    }
  }

  /**
   * Get achievements by category
   */
  async getAchievementsByCategory(userId: string, category: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapAchievementFromDb);
    } catch (error) {
      logger.error('Failed to fetch achievements by category', error);
      return [];
    }
  }

  /**
   * Mark achievement as viewed
   */
  async markAchievementViewed(userId: string, badgeId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('achievements')
        .update({ viewed: true })
        .eq('user_id', userId)
        .eq('badge_id', badgeId);

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to mark achievement as viewed', error);
    }
  }

  /**
   * Check and unlock new achievements
   */
  async checkAndUnlockAchievements(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .rpc('check_and_unlock_achievements', { p_user_id: userId });

      if (error) throw error;

      // Return array of newly unlocked badge IDs
      return (data || []).map((item: any) => item.unlocked_badge_id);
    } catch (error) {
      logger.error('Failed to check achievements', error);
      return [];
    }
  }

  /**
   * Get user's progress milestones
   */
  async getUserMilestones(userId: string): Promise<ProgressMilestone[]> {
    try {
      const { data, error } = await supabase
        .from('progress_milestones')
        .select('*')
        .eq('user_id', userId)
        .order('milestone_day', { ascending: true });

      if (error) throw error;

      return (data || []).map(this.mapMilestoneFromDb);
    } catch (error) {
      logger.error('Failed to fetch milestones', error);
      return [];
    }
  }

  /**
   * Initialize milestones for a new user
   */
  async initializeUserMilestones(userId: string, gender: string, nicotineType: string): Promise<void> {
    try {
      // Define all milestones
      const milestones = [
        { day: 1, title: 'First Day Free', description: 'Your journey begins' },
        { day: 3, title: '72 Hour Warrior', description: 'The hardest part is behind you' },
        { day: 7, title: 'One Week Strong', description: 'A full week of freedom' },
        { day: 14, title: 'Two Week Champion', description: 'Building new habits' },
        { day: 21, title: 'Three Week Victor', description: 'New neural pathways forming' },
        { day: 30, title: 'One Month Master', description: 'A major milestone achieved' },
        { day: 60, title: 'Two Month Titan', description: 'Transformation in progress' },
        { day: 90, title: 'Quarter Conqueror', description: 'Three months of success' },
        { day: 120, title: 'Four Month Fighter', description: 'Stronger every day' },
        { day: 180, title: 'Half Year Hero', description: 'Six months of freedom' },
        { day: 365, title: 'One Year Legend', description: 'A full year nicotine-free' },
        { day: 730, title: 'Two Year Master', description: 'Long-term success achieved' },
      ];

      // Insert milestones
      const { error } = await supabase
        .from('progress_milestones')
        .insert(
          milestones.map(m => ({
            user_id: userId,
            milestone_day: m.day,
            milestone_title: m.title,
            milestone_description: m.description,
            is_achieved: false,
            gender_specific_content: this.getGenderSpecificContent(m.day, gender),
            nicotine_type_content: this.getNicotineSpecificContent(m.day, nicotineType)
          }))
        );

      if (error && error.code !== '23505') { // Ignore unique constraint violations
        throw error;
      }
    } catch (error) {
      logger.error('Failed to initialize milestones', error);
    }
  }

  /**
   * Update progress milestones based on current progress
   */
  async updateProgressMilestones(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('update_progress_milestones', { p_user_id: userId });

      if (error) throw error;
    } catch (error) {
      logger.error('Failed to update milestones', error);
    }
  }

  /**
   * Get achievement statistics
   */
  async getAchievementStats(userId: string): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byRarity: Record<string, number>;
  }> {
    try {
      const achievements = await this.getUserAchievements(userId);
      
      const stats = {
        total: achievements.length,
        byCategory: {} as Record<string, number>,
        byRarity: {} as Record<string, number>,
      };

      achievements.forEach(achievement => {
        // Count by category
        stats.byCategory[achievement.category] = (stats.byCategory[achievement.category] || 0) + 1;
        
        // Count by rarity
        stats.byRarity[achievement.rarity] = (stats.byRarity[achievement.rarity] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('Failed to get achievement stats', error);
      return {
        total: 0,
        byCategory: {},
        byRarity: {},
      };
    }
  }

  /**
   * Get next achievable badges
   */
  async getNextAchievableBadges(userId: string, limit: number = 3): Promise<any[]> {
    try {
      // Get user's current stats
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('quit_date')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const daysClean = userData?.quit_date 
        ? Math.floor((Date.now() - new Date(userData.quit_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Get all achievement definitions
      const { data: definitions, error: defError } = await supabase
        .from('achievement_definitions')
        .select('*')
        .eq('is_active', true)
        .order('requirement_value', { ascending: true });

      if (defError) throw defError;

      // Get user's unlocked achievements
      const { data: unlocked, error: unlockError } = await supabase
        .from('achievements')
        .select('badge_id')
        .eq('user_id', userId);

      if (unlockError) throw unlockError;

      const unlockedIds = new Set(unlocked?.map(a => a.badge_id) || []);

      // Filter to get next achievable
      const nextAchievable = definitions
        ?.filter(def => !unlockedIds.has(def.badge_id))
        .filter(def => {
          // For progress achievements, check if they're within reach
          if (def.requirement_type === 'days_clean') {
            return def.requirement_value > daysClean && def.requirement_value <= daysClean + 30;
          }
          return true;
        })
        .slice(0, limit);

      return nextAchievable || [];
    } catch (error) {
      logger.error('Failed to get next achievable badges', error);
      return [];
    }
  }

  // Helper methods
  private mapAchievementFromDb(dbAchievement: any): Achievement {
    return {
      id: dbAchievement.id,
      userId: dbAchievement.user_id,
      badgeId: dbAchievement.badge_id,
      badgeName: dbAchievement.badge_name,
      badgeDescription: dbAchievement.badge_description,
      category: dbAchievement.category,
      rarity: dbAchievement.rarity,
      iconName: dbAchievement.icon_name,
      color: dbAchievement.color,
      milestoneValue: dbAchievement.milestone_value,
      unlockedAt: dbAchievement.unlocked_at,
      viewed: dbAchievement.viewed,
    };
  }

  private mapMilestoneFromDb(dbMilestone: any): ProgressMilestone {
    return {
      id: dbMilestone.id,
      userId: dbMilestone.user_id,
      milestoneDay: dbMilestone.milestone_day,
      milestoneTitle: dbMilestone.milestone_title,
      milestoneDescription: dbMilestone.milestone_description,
      isAchieved: dbMilestone.is_achieved,
      achievedAt: dbMilestone.achieved_at,
      genderSpecificContent: dbMilestone.gender_specific_content,
      nicotineTypeContent: dbMilestone.nicotine_type_content,
    };
  }

  private getGenderSpecificContent(day: number, gender: string): any {
    // Add gender-specific milestone messages
    const content: any = {};
    
    if (day === 7 && gender === 'male') {
      content.message = 'Testosterone levels beginning to normalize';
    } else if (day === 7 && gender === 'female') {
      content.message = 'Hormonal balance improving';
    }
    
    return content;
  }

  private getNicotineSpecificContent(day: number, nicotineType: string): any {
    // Add nicotine-type specific messages
    const content: any = {};
    
    if (day === 3 && nicotineType === 'cigarettes') {
      content.message = 'Lung cilia beginning to recover';
    } else if (day === 3 && nicotineType === 'vape') {
      content.message = 'Lung irritation decreasing';
    }
    
    return content;
  }
}

export const achievementService = new AchievementService(); 