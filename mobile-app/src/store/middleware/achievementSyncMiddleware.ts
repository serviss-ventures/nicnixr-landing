import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { ProgressSyncService } from '../../services/progressSyncService';
import { ACHIEVEMENT_BADGES } from '../../constants/app';

export const achievementSyncMiddleware: Middleware<{}, RootState> = 
  (store) => (next) => async (action) => {
    // Let the action proceed first
    const result = next(action);
    
    // Check if this is a progress update action
    if (action.type === 'progress/updateProgress/fulfilled' || 
        action.type === 'progress/initializeProgress/fulfilled') {
      
      const state = store.getState();
      const { user } = state.auth;
      const stats = state.progress.stats;
      const achievements = state.achievements;
      
      if (user?.id && stats) {
        // Check for new badge unlocks based on days clean
        const badgesToCheck = ACHIEVEMENT_BADGES.filter((badge: any) => 
          badge.type === 'days' && badge.category === 'progress'
        );
        
        for (const badge of badgesToCheck) {
          const existingBadge = achievements.badges.find((b: any) => b.id === badge.id);
          
          // Check if badge should be unlocked based on days clean
          let shouldUnlock = false;
          
          if (badge.type === 'days' && badge.requirement <= stats.daysClean) {
            shouldUnlock = true;
          }
          
          // If badge should be unlocked but hasn't been yet
          if (shouldUnlock && existingBadge && !existingBadge.earnedDate) {
            // Dispatch the unlock action
            store.dispatch({
              type: 'achievements/unlockBadge',
              payload: { badgeId: badge.id, userId: user.id }
            });
          }
        }
        
        // Also check for health-based badges
        if (stats.healthScore >= 25) {
          const healthBadge = achievements.badges.find((b: any) => b.id === 'health-warrior');
          if (healthBadge && !healthBadge.earnedDate) {
            store.dispatch({
              type: 'achievements/unlockBadge',
              payload: { badgeId: 'health-warrior', userId: user.id }
            });
          }
        }
        
        // Check for money saved badges
        if (stats.moneySaved >= 100) {
          const moneyBadge = achievements.badges.find((b: any) => b.id === 'money-saver');
          if (moneyBadge && !moneyBadge.earnedDate) {
            store.dispatch({
              type: 'achievements/unlockBadge',
              payload: { badgeId: 'money-saver', userId: user.id }
            });
          }
        }
      }
    }
    
    return result;
  }; 