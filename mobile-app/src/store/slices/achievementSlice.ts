import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AchievementState, Badge, Achievement } from '../../types';
import { ACHIEVEMENT_BADGES } from '../../constants/app';
import { ProgressSyncService } from '../../services/progressSyncService';

const initialState: AchievementState = {
  badges: ACHIEVEMENT_BADGES.map(badge => ({ ...badge, progress: 0 })),
  achievements: [],
  points: 0,
  level: 1,
  isLoading: false,
  error: null,
};

const achievementSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    unlockBadge: (state, action: PayloadAction<{ badgeId: string; userId?: string }>) => {
      const badge = state.badges.find(b => b.id === action.payload.badgeId);
      if (badge && !badge.earnedDate) {
        badge.earnedDate = new Date().toISOString();
        badge.progress = badge.requirement;
        state.points += 100; // Award points for badge
        
        // Sync to Supabase if userId is provided
        if (action.payload.userId) {
          ProgressSyncService.syncAchievement(action.payload.userId, badge);
        }
      }
    },
    updateBadgeProgress: (state, action: PayloadAction<{ badgeId: string; progress: number; userId?: string }>) => {
      const badge = state.badges.find(b => b.id === action.payload.badgeId);
      if (badge) {
        badge.progress = Math.min(action.payload.progress, badge.requirement);
        if (badge.progress >= badge.requirement && !badge.earnedDate) {
          badge.earnedDate = new Date().toISOString();
          state.points += 100;
          
          // Sync to Supabase if userId is provided
          if (action.payload.userId) {
            ProgressSyncService.syncAchievement(action.payload.userId, badge);
          }
        }
      }
    },
    addPoints: (state, action: PayloadAction<number>) => {
      state.points += action.payload;
      state.level = Math.floor(state.points / 1000) + 1; // Level up every 1000 points
    },
  },
});

export const { clearError, unlockBadge, updateBadgeProgress, addPoints } = achievementSlice.actions;
export default achievementSlice.reducer; 