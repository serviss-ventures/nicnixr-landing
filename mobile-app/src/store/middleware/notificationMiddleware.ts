import { Middleware } from '@reduxjs/toolkit';
import { updateProgress } from '../slices/progressSlice';
import NotificationService from '../../services/notificationService';
import { AppDispatch, RootState } from '../store';

const notificationMiddleware: Middleware<{}, RootState> = (store) => (next) => async (action) => {
  // For updateProgress.pending, store the current days clean
  let previousDaysClean = 0;
  if (updateProgress.pending.match(action)) {
    const state = store.getState();
    previousDaysClean = state.progress.stats.daysClean;
  }
  
  // Let the action go through
  const result = next(action);
  
  // Then check if we need to create notifications
  if (updateProgress.fulfilled.match(action)) {
    const state = store.getState();
    const dispatch = store.dispatch as AppDispatch;
    
    // Get current days clean from the action payload
    const currentDaysClean = action.payload.stats.daysClean;
    
    // Get the previous days clean from before the update
    const stateBefore = store.getState();
    previousDaysClean = previousDaysClean || 0;
    
    // Only check if days have actually increased
    if (currentDaysClean > previousDaysClean) {
      // Check for milestones
      await NotificationService.checkMilestones(dispatch, currentDaysClean, previousDaysClean);
      
      // Check for health benefits
      await NotificationService.checkHealthBenefits(dispatch, currentDaysClean, previousDaysClean);
    }
  }
  
  return result;
};

export default notificationMiddleware; 