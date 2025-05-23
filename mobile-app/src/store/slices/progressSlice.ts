import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProgressState, ProgressStats, DailyCheckIn, HealthMilestone } from '../../types';
import { STORAGE_KEYS, HEALTH_BENEFITS } from '../../constants/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

// Initial state
const initialState: ProgressState = {
  stats: {
    daysClean: 0,
    hoursClean: 0,
    minutesClean: 0,
    secondsClean: 0,
    moneySaved: 0,
    cigarettesAvoided: 0,
    lifeRegained: 0,
    healthScore: 0,
    streakDays: 0,
    longestStreak: 0,
  },
  dailyCheckIns: [],
  healthMilestones: HEALTH_BENEFITS.map(benefit => ({
    ...benefit,
    category: 'cardiovascular' as const,
    achieved: false,
  })),
  weeklyData: [],
  monthlyData: [],
  isLoading: false,
  error: null,
  lastUpdated: new Date().toISOString(),
};

// Async thunks
export const initializeProgress = createAsyncThunk(
  'progress/initialize',
  async (quitDate: string, { rejectWithValue }) => {
    try {
      const now = new Date();
      const quit = new Date(quitDate);
      
      if (quit > now) {
        throw new Error('Quit date cannot be in the future');
      }
      
      const daysClean = differenceInDays(now, quit);
      const hoursClean = differenceInHours(now, quit);
      const minutesClean = differenceInMinutes(now, quit);
      const secondsClean = differenceInSeconds(now, quit);
      
      // Calculate money saved (assuming $15/day average)
      const dailyCost = 15; // This should come from user data
      const moneySaved = daysClean * dailyCost;
      
      // Calculate cigarettes avoided (assuming 20 cigarettes/day)
      const cigarettesPerDay = 20; // This should come from user data
      const cigarettesAvoided = daysClean * cigarettesPerDay;
      
      // Calculate life regained (assuming 11 minutes per cigarette)
      const minutesPerCigarette = 11;
      const lifeRegained = (cigarettesAvoided * minutesPerCigarette) / 60; // in hours
      
      // Calculate health score based on time clean
      let healthScore = Math.min(100, (daysClean / 365) * 100);
      
      const stats: ProgressStats = {
        daysClean,
        hoursClean,
        minutesClean,
        secondsClean,
        moneySaved,
        cigarettesAvoided,
        lifeRegained,
        healthScore,
        streakDays: daysClean,
        longestStreak: daysClean,
      };
      
      // Store progress data
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS_DATA, JSON.stringify(stats));
      await AsyncStorage.setItem(STORAGE_KEYS.QUIT_DATE, quitDate);
      
      return { stats, quitDate };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initialize progress');
    }
  }
);

export const updateProgress = createAsyncThunk(
  'progress/update',
  async (_, { getState, rejectWithValue }) => {
    try {
      const quitDateStr = await AsyncStorage.getItem(STORAGE_KEYS.QUIT_DATE);
      
      if (!quitDateStr) {
        throw new Error('No quit date found');
      }
      
      const now = new Date();
      const quit = new Date(quitDateStr);
      
      const daysClean = differenceInDays(now, quit);
      const hoursClean = differenceInHours(now, quit);
      const minutesClean = differenceInMinutes(now, quit);
      const secondsClean = differenceInSeconds(now, quit);
      
      const dailyCost = 15; // Should come from user data
      const cigarettesPerDay = 20; // Should come from user data
      const minutesPerCigarette = 11;
      
      const moneySaved = daysClean * dailyCost;
      const cigarettesAvoided = daysClean * cigarettesPerDay;
      const lifeRegained = (cigarettesAvoided * minutesPerCigarette) / 60;
      const healthScore = Math.min(100, (daysClean / 365) * 100);
      
      const stats: ProgressStats = {
        daysClean,
        hoursClean,
        minutesClean,
        secondsClean,
        moneySaved,
        cigarettesAvoided,
        lifeRegained,
        healthScore,
        streakDays: daysClean,
        longestStreak: daysClean,
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS_DATA, JSON.stringify(stats));
      
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update progress');
    }
  }
);

export const addDailyCheckIn = createAsyncThunk(
  'progress/addDailyCheckIn',
  async (checkInData: Omit<DailyCheckIn, 'id'>, { getState, rejectWithValue }) => {
    try {
      const checkIn: DailyCheckIn = {
        ...checkInData,
        id: Date.now().toString(),
      };
      
      const state = getState() as { progress: ProgressState };
      const updatedCheckIns = [...state.progress.dailyCheckIns, checkIn];
      
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_CHECK_INS, JSON.stringify(updatedCheckIns));
      
      return checkIn;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add daily check-in');
    }
  }
);

export const loadStoredProgress = createAsyncThunk(
  'progress/loadStored',
  async (_, { rejectWithValue }) => {
    try {
      const [progressData, checkInsData, quitDate] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PROGRESS_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_CHECK_INS),
        AsyncStorage.getItem(STORAGE_KEYS.QUIT_DATE),
      ]);
      
      const stats = progressData ? JSON.parse(progressData) : initialState.stats;
      const checkIns = checkInsData ? JSON.parse(checkInsData) : [];
      
      return { stats, checkIns, quitDate };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load stored progress');
    }
  }
);

// Progress slice
const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateStats: (state, action: PayloadAction<Partial<ProgressStats>>) => {
      state.stats = { ...state.stats, ...action.payload };
      state.lastUpdated = new Date().toISOString();
    },
    achieveHealthMilestone: (state, action: PayloadAction<string>) => {
      const milestone = state.healthMilestones.find(m => m.id === action.payload);
      if (milestone && !milestone.achieved) {
        milestone.achieved = true;
        milestone.achievedDate = new Date().toISOString();
      }
    },
    resetProgress: (state) => {
      state.stats = initialState.stats;
      state.dailyCheckIns = [];
      state.lastUpdated = new Date().toISOString();
    },
    setStreakBroken: (state) => {
      state.stats.streakDays = 0;
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    // Initialize progress
    builder
      .addCase(initializeProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(initializeProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update progress
    builder
      .addCase(updateProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(updateProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add daily check-in
    builder
      .addCase(addDailyCheckIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addDailyCheckIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailyCheckIns.push(action.payload);
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(addDailyCheckIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load stored progress
    builder
      .addCase(loadStoredProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadStoredProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.dailyCheckIns = action.payload.checkIns;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(loadStoredProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { 
  clearError, 
  updateStats, 
  achieveHealthMilestone, 
  resetProgress, 
  setStreakBroken 
} = progressSlice.actions;

// Export reducer
export default progressSlice.reducer;

// Selectors
export const selectProgress = (state: { progress: ProgressState }) => state.progress;
export const selectProgressStats = (state: { progress: ProgressState }) => state.progress.stats;
export const selectDailyCheckIns = (state: { progress: ProgressState }) => state.progress.dailyCheckIns;
export const selectHealthMilestones = (state: { progress: ProgressState }) => state.progress.healthMilestones;
export const selectProgressLoading = (state: { progress: ProgressState }) => state.progress.isLoading;
export const selectProgressError = (state: { progress: ProgressState }) => state.progress.error; 