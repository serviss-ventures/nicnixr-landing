import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ShieldState, ShieldModeSession, ShieldModeActivity } from '../../types';
import { SHIELD_MODE_ACTIVITIES } from '../../constants/app';

const initialState: ShieldState = {
  sessions: [],
  availableActivities: SHIELD_MODE_ACTIVITIES,
  currentSession: null,
  isActive: false,
  stats: {
    totalUses: 0,
    totalDuration: 0,
    averageEffectiveness: 0,
    mostUsedActivity: 'breathing',
    streakDays: 0,
    successRate: 0,
    weeklyUsage: [0, 0, 0, 0, 0, 0, 0],
  },
  isLoading: false,
  error: null,
};

export const startShieldSession = createAsyncThunk(
  'shield/startSession',
  async (data: { activityType: string; cravingIntensity: number }, { rejectWithValue }) => {
    try {
      const session: ShieldModeSession = {
        id: Date.now().toString(),
        startTime: new Date().toISOString(),
        activityType: data.activityType as any,
        cravingIntensityBefore: data.cravingIntensity,
        completed: false,
        duration: 0,
      };
      
      return session;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const completeShieldSession = createAsyncThunk(
  'shield/completeSession',
  async (data: { cravingIntensityAfter: number; effectiveness: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { shield: ShieldState };
      const currentSession = state.shield.currentSession;
      
      if (!currentSession) {
        throw new Error('No active session');
      }
      
      const endTime = new Date().toISOString();
      const duration = Math.floor((new Date(endTime).getTime() - new Date(currentSession.startTime).getTime()) / 1000);
      
      const completedSession: ShieldModeSession = {
        ...currentSession,
        endTime,
        duration,
        cravingIntensityAfter: data.cravingIntensityAfter,
        effectiveness: data.effectiveness,
        completed: true,
      };
      
      return completedSession;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const shieldSlice = createSlice({
  name: 'shield',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setActive: (state, action: PayloadAction<boolean>) => {
      state.isActive = action.payload;
    },
    cancelSession: (state) => {
      state.currentSession = null;
      state.isActive = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startShieldSession.fulfilled, (state, action) => {
        state.currentSession = action.payload;
        state.isActive = true;
        state.error = null;
      })
      .addCase(startShieldSession.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(completeShieldSession.fulfilled, (state, action) => {
        state.sessions.push(action.payload);
        state.currentSession = null;
        state.isActive = false;
        state.stats.totalUses += 1;
        state.stats.totalDuration += action.payload.duration / 60; // convert to minutes
        state.error = null;
      })
      .addCase(completeShieldSession.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setActive, cancelSession } = shieldSlice.actions;
export default shieldSlice.reducer; 