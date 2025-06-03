import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RecoveryPlan {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradientColors: string[];
  duration: string;
  goals: string[];
  nicotineSpecific?: {
    cigarettes?: string[];
    vape?: string[];
    chewing?: string[];
    cigars?: string[];
    other?: string[];
  };
}

export interface ActivePlan extends RecoveryPlan {
  startDate: string;
  weekNumber: number;
  completedGoals: string[];
  progress: number;
}

interface PlanState {
  activePlan: ActivePlan | null;
  selectedPlanId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PlanState = {
  activePlan: null,
  selectedPlanId: null,
  isLoading: false,
  error: null,
};

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    selectPlan: (state, action: PayloadAction<string>) => {
      state.selectedPlanId = action.payload;
    },
    startPlan: (state, action: PayloadAction<RecoveryPlan>) => {
      const plan = action.payload;
      state.activePlan = {
        ...plan,
        startDate: new Date().toISOString(),
        weekNumber: 1,
        completedGoals: [],
        progress: 0,
      };
      state.selectedPlanId = null;
    },
    updatePlanProgress: (state, action: PayloadAction<{ goalId: string; completed: boolean }>) => {
      if (!state.activePlan) return;
      
      const { goalId, completed } = action.payload;
      if (completed && !state.activePlan.completedGoals.includes(goalId)) {
        state.activePlan.completedGoals.push(goalId);
      } else if (!completed) {
        state.activePlan.completedGoals = state.activePlan.completedGoals.filter(id => id !== goalId);
      }
      
      // Calculate progress percentage
      state.activePlan.progress = Math.round(
        (state.activePlan.completedGoals.length / state.activePlan.goals.length) * 100
      );
    },
    advanceWeek: (state) => {
      if (!state.activePlan) return;
      state.activePlan.weekNumber += 1;
      // Reset weekly goals for next week
      state.activePlan.completedGoals = [];
      state.activePlan.progress = 0;
    },
    completePlan: (state) => {
      if (!state.activePlan) return;
      state.activePlan.progress = 100;
    },
    clearActivePlan: (state) => {
      state.activePlan = null;
      state.selectedPlanId = null;
    },
    loadPlanFromStorage: (state, action: PayloadAction<ActivePlan | null>) => {
      state.activePlan = action.payload;
    },
    migrateActivePlanGoals: (state, action: PayloadAction<string[]>) => {
      if (!state.activePlan) return;
      
      const newGoals = action.payload;
      const oldCompletedGoals = state.activePlan.completedGoals;
      
      // Map old goals to new goals by index (preserve completion status)
      const newCompletedGoals: string[] = [];
      oldCompletedGoals.forEach((oldGoal, index) => {
        if (index < newGoals.length) {
          newCompletedGoals.push(newGoals[index]);
        }
      });
      
      // Update the plan with new goals
      state.activePlan.goals = newGoals;
      state.activePlan.completedGoals = newCompletedGoals;
      
      // Recalculate progress
      state.activePlan.progress = Math.round(
        (state.activePlan.completedGoals.length / state.activePlan.goals.length) * 100
      );
    },
  },
});

export const {
  setLoading,
  setError,
  selectPlan,
  startPlan,
  updatePlanProgress,
  advanceWeek,
  completePlan,
  clearActivePlan,
  loadPlanFromStorage,
  migrateActivePlanGoals,
} = planSlice.actions;

// Async thunks for persistence
export const savePlanToStorage = (plan: ActivePlan | null) => async () => {
  try {
    if (plan) {
      await AsyncStorage.setItem('activePlan', JSON.stringify(plan));
      console.log('💾 Plan saved to storage:', plan.title);
    } else {
      await AsyncStorage.removeItem('activePlan');
      console.log('🗑️ Plan removed from storage');
    }
  } catch (error) {
    console.error('❌ Failed to save plan to storage:', error);
  }
};

export const loadPlanFromStorageAsync = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    const stored = await AsyncStorage.getItem('activePlan');
    if (stored) {
      const plan: ActivePlan = JSON.parse(stored);
      dispatch(loadPlanFromStorage(plan));
      console.log('📱 Plan loaded from storage:', plan.title);
    } else {
      dispatch(loadPlanFromStorage(null));
      console.log('📱 No stored plan found');
    }
  } catch (error) {
    console.error('❌ Failed to load plan from storage:', error);
    dispatch(setError('Failed to load plan'));
    dispatch(loadPlanFromStorage(null));
  } finally {
    dispatch(setLoading(false));
  }
};

export const cancelActivePlan = () => async (dispatch: any) => {
  try {
    // Clear from state immediately for instant UI update
    dispatch(clearActivePlan());
    
    // Remove from storage in the background (don't await)
    AsyncStorage.removeItem('activePlan')
      .then(() => console.log('🗑️ Active plan removed from storage'))
      .catch((error) => console.error('❌ Failed to remove plan from storage:', error));
    
    console.log('✅ Active plan cancelled');
    
    // Return success to satisfy the unwrap() call
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to cancel active plan:', error);
    dispatch(setError('Failed to cancel plan'));
    throw error;
  }
};

export const migrateActivePlanGoalsAsync = (newGoals: string[]) => async (dispatch: any, getState: any) => {
  try {
    const { plan } = getState();
    if (!plan.activePlan) return;
    
    // Update goals in state
    dispatch(migrateActivePlanGoals(newGoals));
    
    // Save updated plan to storage
    const updatedState = getState();
    const updatedPlan = updatedState.plan.activePlan;
    if (updatedPlan) {
      await AsyncStorage.setItem('activePlan', JSON.stringify(updatedPlan));
      console.log('📱 Migrated active plan goals:', updatedPlan.title);
      console.log('🎯 New goals:', newGoals);
    }
  } catch (error) {
    console.error('❌ Failed to migrate plan goals:', error);
  }
};

export default planSlice.reducer; 