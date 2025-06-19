import { supabase } from '../lib/supabase';
import { logger } from './logger';

interface ProfileUpdateData {
  display_name?: string;
  bio?: string;
  support_styles?: string[];
  avatar_config?: {
    type: string;
    name: string;
    style: string;
  };
  gender?: string;
  age_range?: string;
}

class UserProfileService {
  /**
   * Update user profile in Supabase
   */
  async updateProfile(userId: string, data: ProfileUpdateData) {
    try {
      logger.info('Updating user profile', { userId, data });

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          display_name: data.display_name,
          bio: data.bio,
          support_styles: data.support_styles,
          avatar_config: data.avatar_config,
          gender: data.gender,
          age_range: data.age_range,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update profile', error);
        throw error;
      }

      logger.info('Profile updated successfully', { userId });
      return updatedUser;
    } catch (error) {
      logger.error('Error updating profile', error);
      throw error;
    }
  }

  /**
   * Get user profile from Supabase
   */
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('Failed to fetch profile', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error fetching profile', error);
      throw error;
    }
  }

  /**
   * Check if username exists (for validation)
   */
  async checkUsernameExists(username: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('username', username);

      if (error) {
        logger.error('Failed to check username', error);
        return false;
      }

      return (count || 0) > 0;
    } catch (error) {
      logger.error('Error checking username', error);
      return false;
    }
  }
}

export const userProfileService = new UserProfileService(); 