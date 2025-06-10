import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS, HEALTH_BENEFITS } from '../../constants/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { calculateScientificRecovery } from '../../services/scientificRecoveryService';
import { UserNicotineProfile } from '../../types/nicotineProfile';
import NotificationService from '../../services/notificationService';

// Types
interface DailyCheckIn {
  id: string;
  date: string;
  mood: 'great' | 'good' | 'okay' | 'struggling' | 'bad';
  cravingLevel: number; // 1-10
  triggers: string[];
  notes?: string;
  hadRelapse?: boolean;
  relapseDetails?: {
    amount: number;
    duration: string; // '5-minutes', '30-minutes', '1-hour', 'half-day', 'full-day'
    trigger: string;
    emotion: string;
    learnings: string;
  };
}

interface RelapseEvent {
  id: string;
  date: string;
  previousStreakDays: number;
  trigger: string;
  emotion: string;
  amount: number;
  duration: string;
  learnings: string;
  recoveryPlan: string[];
  isMinorSlip: boolean; // vs major relapse
}

interface HealthMilestone {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  category: 'cardiovascular' | 'respiratory' | 'neurological' | 'general' | 'oral' | 'mental';
  achieved: boolean;
  achievedDate?: string;
  daysRequired: number;
  scientificBasis: string;
}

interface ProgressStats {
  daysClean: number;
  hoursClean: number;
  minutesClean: number;
  secondsClean: number;
  unitsAvoided: number; // Generic term for cigarettes/pouches/pods
  moneySaved: number;
  lifeRegained: number; // in hours
  healthScore: number; // 0-100
  streakDays: number;
  longestStreak: number;
  totalRelapses: number;
  minorSlips: number; // Brief lapses vs full relapses
  recoveryStrength: number; // How well they bounce back (0-100)
  lastRelapseDate?: string;
  averageStreakLength: number;
  improvementTrend: 'improving' | 'stable' | 'struggling';
}

interface ProgressState {
  stats: ProgressStats;
  healthMetrics: {
    lungCapacity: number;
    heartHealth: number;
    energyLevels: number;
    sleepQuality: number;
    tasteSmell: number;
    skinHealth: number;
    oralHealth: number;
    mentalClarity: number;
    moodStability: number;
    addictionRecovery: number;
  };
  goals: {
    dailyGoal: boolean;
    weeklyGoal: boolean;
    monthlyGoal: boolean;
  };
  milestones: {
    firstDay: boolean;
    firstWeek: boolean;
    firstMonth: boolean;
    threeMonths: boolean;
    sixMonths: boolean;
    oneYear: boolean;
  };
  dailyCheckIns: DailyCheckIn[];
  relapseHistory: RelapseEvent[];
  healthMilestones: HealthMilestone[];
  weeklyData: any[];
  monthlyData: any[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string;
  userProfile?: UserNicotineProfile;
  quitDate: string;
}

// Science-based health recovery timelines (in days)
const RECOVERY_TIMELINES = {
  // Universal timelines (all nicotine products)
  universal: {
    nicotineWithdrawal: { start: 0, peak: 3, end: 14 },
    heartRate: { improvement: 1 }, // Heart rate normalizes within 24 hours
    bloodPressure: { improvement: 7 }, // Blood pressure improves within 1 week
    energyLevels: { improvement: 14 }, // Energy stabilizes within 2 weeks
    sleepQuality: { improvement: 21 }, // Sleep improves within 3 weeks
    mentalClarity: { improvement: 30 }, // Mental fog clears within 1 month
    moodStability: { improvement: 60 }, // Mood stabilizes within 2 months
  },
  
  // Product-specific timelines
  cigarettes: {
    carbonMonoxide: { clearance: 1 }, // CO clears within 24 hours
    circulation: { improvement: 14 }, // Circulation improves 2-12 weeks
    lungFunction: { improvement: 30 }, // Lung function improves 1-9 months
    tasteSmell: { improvement: 7 }, // Taste/smell return 48 hours - 2 weeks
    skinHealth: { improvement: 90 }, // Skin health improves 3+ months
    strokeRisk: { reduction: 365 }, // Stroke risk reduces after 1 year
  },
  
  vape: {
    lungIrritation: { improvement: 7 }, // Lung irritation reduces within 1 week
    oralHealth: { improvement: 14 }, // Oral inflammation reduces 2 weeks
    respiratoryFunction: { improvement: 30 }, // Respiratory function improves 1 month
    chemicalDetox: { completion: 21 }, // Chemical detox within 3 weeks
  },
  
  pouches: {
    oralHealth: { improvement: 14 }, // Gum irritation reduces 2 weeks
    gumHealing: { improvement: 30 }, // Gum tissue healing 1 month
    tasteImprovement: { improvement: 21 }, // Taste improvement 3 weeks
    oralCancerRisk: { reduction: 180 }, // Oral cancer risk starts reducing 6 months
  },
  
  chewing: {
    oralHealth: { improvement: 21 }, // Oral tissue healing 3 weeks
    gumRecovery: { improvement: 45 }, // Gum recovery 6 weeks
    tasteRestoration: { improvement: 30 }, // Taste restoration 1 month
    oralCancerRisk: { reduction: 365 }, // Cancer risk reduction 1 year
  }
};

// Initial state
const initialState: ProgressState = {
  stats: {
    daysClean: 0,
    hoursClean: 0,
    minutesClean: 0,
    secondsClean: 0,
    unitsAvoided: 0,
    moneySaved: 0,
    lifeRegained: 0,
    healthScore: 0,
    streakDays: 0,
    longestStreak: 0,
    totalRelapses: 0,
    minorSlips: 0,
    recoveryStrength: 100,
    averageStreakLength: 0,
    improvementTrend: 'stable',
  },
  healthMetrics: {
    lungCapacity: 0,
    heartHealth: 0,
    energyLevels: 0,
    sleepQuality: 0,
    tasteSmell: 0,
    skinHealth: 0,
    oralHealth: 0,
    mentalClarity: 0,
    moodStability: 0,
    addictionRecovery: 0,
  },
  goals: {
    dailyGoal: false,
    weeklyGoal: false,
    monthlyGoal: false,
  },
  milestones: {
    firstDay: false,
    firstWeek: false,
    firstMonth: false,
    threeMonths: false,
    sixMonths: false,
    oneYear: false,
  },
  dailyCheckIns: [],
  relapseHistory: [],
  healthMilestones: [],
  weeklyData: [],
  monthlyData: [],
  isLoading: false,
  error: null,
  lastUpdated: new Date().toISOString(),
  quitDate: new Date().toISOString(),
};

// Helper function to calculate science-based health metrics
const calculateHealthMetrics = (daysClean: number, userProfile: UserNicotineProfile) => {
  // Safety checks for inputs
  const safeDaysClean = Number(daysClean) || 0;
  const safeProfile = userProfile || { category: 'cigarettes', harmLevel: 5 };
  const category = safeProfile.category || 'cigarettes';
  const timelines = RECOVERY_TIMELINES;
  
  const metrics = {
    lungCapacity: 0,
    heartHealth: 0,
    energyLevels: 0,
    sleepQuality: 0,
    tasteSmell: 0,
    skinHealth: 0,
    oralHealth: 0,
    mentalClarity: 0,
    moodStability: 0,
    addictionRecovery: 0,
  };

  // Safety function for calculations
  const safeCalculate = (calculation: () => number): number => {
    try {
      const result = calculation();
      return (typeof result === 'number' && isFinite(result) && !isNaN(result)) ? Math.max(0, Math.min(100, result)) : 0;
    } catch (error) {
      return 0;
    }
  };

  // Universal improvements (all products)
  metrics.heartHealth = safeCalculate(() => (safeDaysClean / timelines.universal.bloodPressure.improvement) * 100);
  metrics.energyLevels = safeCalculate(() => (safeDaysClean / timelines.universal.energyLevels.improvement) * 100);
  metrics.sleepQuality = safeCalculate(() => (safeDaysClean / timelines.universal.sleepQuality.improvement) * 100);
  metrics.mentalClarity = safeCalculate(() => (safeDaysClean / timelines.universal.mentalClarity.improvement) * 100);
  metrics.moodStability = safeCalculate(() => (safeDaysClean / timelines.universal.moodStability.improvement) * 100);
  
  // Addiction recovery (universal but varies by product harm level)
  const addictionSeverity = (Number(safeProfile.harmLevel) || 5) / 10;
  const recoveryDays = 90 * addictionSeverity; // More harmful = longer recovery
  metrics.addictionRecovery = safeCalculate(() => (safeDaysClean / recoveryDays) * 100);

  // Product-specific improvements
  switch (category) {
    case 'cigarettes':
      metrics.lungCapacity = safeCalculate(() => (safeDaysClean / timelines.cigarettes.lungFunction.improvement) * 100);
      metrics.tasteSmell = safeCalculate(() => (safeDaysClean / timelines.cigarettes.tasteSmell.improvement) * 100);
      metrics.skinHealth = safeCalculate(() => (safeDaysClean / timelines.cigarettes.skinHealth.improvement) * 100);
      metrics.oralHealth = safeCalculate(() => (safeDaysClean / 30) * 100); // General oral improvement
      break;
      
    case 'vape':
      metrics.lungCapacity = safeCalculate(() => (safeDaysClean / timelines.vape.respiratoryFunction.improvement) * 100);
      metrics.oralHealth = safeCalculate(() => (safeDaysClean / timelines.vape.oralHealth.improvement) * 100);
      metrics.tasteSmell = safeCalculate(() => (safeDaysClean / 14) * 100); // Moderate improvement
      metrics.skinHealth = safeCalculate(() => (safeDaysClean / 60) * 100); // Moderate improvement
      break;
      
    case 'pouches':
      metrics.oralHealth = safeCalculate(() => (safeDaysClean / timelines.pouches.oralHealth.improvement) * 100);
      metrics.tasteSmell = safeCalculate(() => (safeDaysClean / timelines.pouches.tasteImprovement.improvement) * 100);
      metrics.lungCapacity = safeCalculate(() => (safeDaysClean / 7) * 100); // Quick lung improvement
      metrics.skinHealth = safeCalculate(() => (safeDaysClean / 45) * 100); // Moderate improvement
      break;
      
    case 'chewing':
      metrics.oralHealth = safeCalculate(() => (safeDaysClean / timelines.chewing.oralHealth.improvement) * 100);
      metrics.tasteSmell = safeCalculate(() => (safeDaysClean / timelines.chewing.tasteRestoration.improvement) * 100);
      metrics.lungCapacity = safeCalculate(() => (safeDaysClean / 7) * 100); // Quick lung improvement
      metrics.skinHealth = safeCalculate(() => (safeDaysClean / 60) * 100); // Moderate improvement
      break;
      
    default: // 'other'
      // Generic improvements for unknown products
      metrics.lungCapacity = safeCalculate(() => (safeDaysClean / 30) * 100);
      metrics.oralHealth = safeCalculate(() => (safeDaysClean / 21) * 100);
      metrics.tasteSmell = safeCalculate(() => (safeDaysClean / 14) * 100);
      metrics.skinHealth = safeCalculate(() => (safeDaysClean / 60) * 100);
  }

  return metrics;
};

// Helper function to calculate recovery strength after relapse
const calculateRecoveryStrength = (relapseHistory: RelapseEvent[], currentStreak: number) => {
  if (relapseHistory.length === 0) return 100;
  
  const recentRelapses = relapseHistory.slice(-3); // Last 3 relapses
  const averageRecoveryTime = recentRelapses.reduce((sum, relapse) => {
    const nextQuitDate = new Date(relapse.date);
    nextQuitDate.setDate(nextQuitDate.getDate() + 1);
    return sum + 1; // Simplified - could be more complex
  }, 0) / recentRelapses.length;
  
  // Higher score for longer current streak and fewer recent relapses
  const streakBonus = Math.min(50, currentStreak * 2);
  const relapsesPenalty = Math.min(30, recentRelapses.length * 10);
  
  return Math.max(20, 100 - relapsesPenalty + streakBonus);
};

// Async thunks
export const initializeProgress = createAsyncThunk(
  'progress/initialize',
  async ({ quitDate, userProfile }: { quitDate: string; userProfile: UserNicotineProfile }, { rejectWithValue }) => {
    try {
      const now = new Date();
      const quit = new Date(quitDate);
      
      if (quit > now) {
        throw new Error('Quit date cannot be in the future');
      }
      
      // Safety function for calculations
      const safeCalculate = (calculation: () => number, fallback: number = 0): number => {
        try {
          const result = calculation();
          return (typeof result === 'number' && isFinite(result) && !isNaN(result)) ? Math.max(0, result) : fallback;
        } catch (error) {
          return fallback;
        }
      };

      const daysClean = safeCalculate(() => differenceInDays(now, quit));
      const hoursClean = safeCalculate(() => differenceInHours(now, quit));
      const minutesClean = safeCalculate(() => differenceInMinutes(now, quit));
      const secondsClean = safeCalculate(() => differenceInSeconds(now, quit));
      
      // Calculate personalized metrics with safety checks
      const safeDailyCost = Number(userProfile.dailyCost) || 15;
      let safeDailyAmount = Number(userProfile.dailyAmount) || 20;
      
      // For chew/dip, dailyAmount is stored as tins per WEEK from onboarding, convert to daily portions
      if (userProfile.category === 'chewing' || userProfile.category === 'chew' || userProfile.category === 'dip' || userProfile.category === 'chew_dip') {
        const tinsPerWeek = safeDailyAmount;
        const tinsPerDay = tinsPerWeek / 7;
        safeDailyAmount = tinsPerDay * 5; // 5 portions per tin
      }
      
      const moneySaved = safeCalculate(() => daysClean * safeDailyCost);
      const unitsAvoided = safeCalculate(() => daysClean * safeDailyAmount);
      
      // Calculate life regained based on product type
      let minutesPerUnit = 11; // Default for cigarettes
      const safeCategory = userProfile.category || 'cigarettes';
      switch (safeCategory) {
        case 'cigarettes': minutesPerUnit = 11; break;
        case 'vape': minutesPerUnit = 5; break; // Less per pod/cartridge
        case 'pouches': minutesPerUnit = 3; break; // Less per pouch
        case 'chewing': minutesPerUnit = 8; break; // Moderate
        default: minutesPerUnit = 7; break;
      }
      
      const lifeRegained = safeCalculate(() => (unitsAvoided * minutesPerUnit) / 60); // in hours
      
      // Calculate science-based health score using the new scientific recovery service
      const scientificRecovery = calculateScientificRecovery(daysClean, userProfile);
      const healthScore = scientificRecovery.overallRecovery;
      
      // Keep the old metrics for backward compatibility but they won't affect the score
      const healthMetrics = calculateHealthMetrics(daysClean, userProfile);
      
      const stats: ProgressStats = {
        daysClean,
        hoursClean,
        minutesClean,
        secondsClean,
        moneySaved,
        unitsAvoided,
        lifeRegained,
        healthScore,
        streakDays: daysClean,
        longestStreak: daysClean,
        totalRelapses: 0,
        minorSlips: 0,
        recoveryStrength: 100,
        averageStreakLength: daysClean,
        improvementTrend: 'stable',
      };
      
      // Check for any milestones already achieved (0 as previous days to check all)
      await NotificationService.checkMilestones(daysClean, 0);
      await NotificationService.checkHealthBenefits(daysClean, 0);
      
      // Store progress data
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS_DATA, JSON.stringify(stats));
      await AsyncStorage.setItem(STORAGE_KEYS.QUIT_DATE, quitDate);
      
      return { stats, healthMetrics, quitDate, userProfile };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initialize progress');
    }
  }
);

export const handleRelapse = createAsyncThunk(
  'progress/handleRelapse',
  async (relapseData: Omit<RelapseEvent, 'id' | 'previousStreakDays'>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { progress: ProgressState };
      const currentStats = state.progress.stats;
      
      const relapseEvent: RelapseEvent = {
        ...relapseData,
        id: Date.now().toString(),
        previousStreakDays: currentStats.streakDays,
      };
      
      // Determine if it's a minor slip or major relapse
      const isMinorSlip = relapseData.duration === '5-minutes' || relapseData.duration === '30-minutes';
      relapseEvent.isMinorSlip = isMinorSlip;
      
      // Update stats
      const updatedRelapseHistory = [...state.progress.relapseHistory, relapseEvent];
      const totalRelapses = isMinorSlip ? currentStats.totalRelapses : currentStats.totalRelapses + 1;
      const minorSlips = isMinorSlip ? currentStats.minorSlips + 1 : currentStats.minorSlips;
      
      // Calculate new recovery strength
      const recoveryStrength = calculateRecoveryStrength(updatedRelapseHistory, 0);
      
      // Calculate average streak length
      const allStreaks = updatedRelapseHistory.map(r => r.previousStreakDays).concat([currentStats.streakDays]);
      const averageStreakLength = allStreaks.reduce((sum, streak) => sum + streak, 0) / allStreaks.length;
      
      // Determine improvement trend
      const recentStreaks = allStreaks.slice(-3);
      const isImproving = recentStreaks.length >= 2 && 
        recentStreaks[recentStreaks.length - 1] > recentStreaks[recentStreaks.length - 2];
      const improvementTrend = isImproving ? 'improving' : 
        (averageStreakLength > 7 ? 'stable' : 'struggling');
      
      const updatedStats: ProgressStats = {
        ...currentStats,
        streakDays: 0, // Reset current streak
        totalRelapses,
        minorSlips,
        recoveryStrength,
        lastRelapseDate: relapseData.date,
        averageStreakLength,
        improvementTrend,
      };
      
      // Store updated data
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS_DATA, JSON.stringify(updatedStats));
      await AsyncStorage.setItem('relapse_history', JSON.stringify(updatedRelapseHistory));
      
      return { stats: updatedStats, relapseEvent, relapseHistory: updatedRelapseHistory };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to handle relapse');
    }
  }
);

export const updateProgress = createAsyncThunk(
  'progress/update',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { progress: ProgressState; auth: { user: any } };
      const quitDateStr = state.progress.quitDate || state.auth.user?.quitDate;
      const userProfile = state.progress.userProfile || (state.auth.user?.nicotineProduct ? {
        category: state.auth.user.nicotineProduct.category || 'cigarettes',
        dailyCost: state.auth.user.dailyCost || 15,
        dailyAmount: state.auth.user.packagesPerDay || 10,
        nicotineContent: state.auth.user.nicotineProduct.nicotineContent || 1.2,
        harmLevel: state.auth.user.nicotineProduct.harmLevel || 5,
      } : null);
      
      if (!quitDateStr) {
        throw new Error('Missing quit date');
      }
      
      if (!userProfile) {
        throw new Error('Missing user profile - please complete onboarding first');
      }
      
      const now = new Date();
      const quit = new Date(quitDateStr);
      
      // Safety function for calculations
      const safeCalculate = (calculation: () => number, fallback: number = 0): number => {
        try {
          const result = calculation();
          return (typeof result === 'number' && isFinite(result) && !isNaN(result)) ? Math.max(0, result) : fallback;
        } catch (error) {
          return fallback;
        }
      };

      // Get previous days clean for milestone checking
      const previousDaysClean = state.progress.stats.daysClean;
      
      const daysClean = safeCalculate(() => differenceInDays(now, quit));
      const hoursClean = safeCalculate(() => differenceInHours(now, quit));
      const minutesClean = safeCalculate(() => differenceInMinutes(now, quit));
      const secondsClean = safeCalculate(() => differenceInSeconds(now, quit));
      
      const safeDailyCost = Number(userProfile.dailyCost) || 15;
      let safeDailyAmount = Number(userProfile.dailyAmount) || 20;
      
      // For chew/dip, dailyAmount is stored as tins per WEEK from onboarding, convert to daily portions
      if (userProfile.category === 'chewing' || userProfile.category === 'chew' || userProfile.category === 'dip' || userProfile.category === 'chew_dip') {
        const tinsPerWeek = safeDailyAmount;
        const tinsPerDay = tinsPerWeek / 7;
        safeDailyAmount = tinsPerDay * 5; // 5 portions per tin
      }
      
      const moneySaved = safeCalculate(() => daysClean * safeDailyCost);
      const unitsAvoided = safeCalculate(() => daysClean * safeDailyAmount);
      
      let minutesPerUnit = 7;
      const safeCategory = userProfile.category || 'cigarettes';
      switch (safeCategory) {
        case 'cigarettes': minutesPerUnit = 11; break;
        case 'vape': minutesPerUnit = 5; break;
        case 'pouches': minutesPerUnit = 3; break;
        case 'chewing': minutesPerUnit = 8; break;
      }
      
      const lifeRegained = safeCalculate(() => (unitsAvoided * minutesPerUnit) / 60);
      
      // Calculate science-based health score using the new scientific recovery service
      const scientificRecovery = calculateScientificRecovery(daysClean, userProfile);
      const healthScore = scientificRecovery.overallRecovery;
      
      // Keep the old metrics for backward compatibility
      const healthMetrics = calculateHealthMetrics(daysClean, userProfile);
      
      const currentStats = state.progress.stats;
      const stats: ProgressStats = {
        ...currentStats,
        daysClean,
        hoursClean,
        minutesClean,
        secondsClean,
        moneySaved,
        unitsAvoided,
        lifeRegained,
        healthScore,
        streakDays: daysClean,
        longestStreak: safeCalculate(() => Math.max(Number(currentStats.longestStreak) || 0, daysClean)),
      };
      
      // Check for milestones and create notifications
      await NotificationService.checkMilestones(daysClean, previousDaysClean);
      await NotificationService.checkHealthBenefits(daysClean, previousDaysClean);
      
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS_DATA, JSON.stringify(stats));
      
      return { stats, healthMetrics };
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
    setUserProfile: (state, action: PayloadAction<UserNicotineProfile>) => {
      state.userProfile = action.payload;
    },
    setQuitDate: (state, action: PayloadAction<string>) => {
      state.quitDate = action.payload;
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
      state.relapseHistory = [];
      state.lastUpdated = new Date().toISOString();
    },
    setStreakBroken: (state) => {
      state.stats.streakDays = 0;
      state.lastUpdated = new Date().toISOString();
    },
    addMotivationalNote: (state, action: PayloadAction<{ date: string; note: string }>) => {
      // Add motivational notes for difficult days
      const checkIn = state.dailyCheckIns.find(c => c.date === action.payload.date);
      if (checkIn) {
        checkIn.notes = action.payload.note;
      }
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
        state.healthMetrics = action.payload.healthMetrics;
        state.quitDate = action.payload.quitDate;
        state.userProfile = action.payload.userProfile;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(initializeProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Handle relapse
    builder
      .addCase(handleRelapse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handleRelapse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.relapseHistory = action.payload.relapseHistory;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(handleRelapse.rejected, (state, action) => {
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
        state.stats = action.payload.stats;
        state.healthMetrics = action.payload.healthMetrics;
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
  setUserProfile,
  setQuitDate,
  achieveHealthMilestone, 
  resetProgress, 
  setStreakBroken,
  addMotivationalNote,
} = progressSlice.actions;

// Export reducer
export default progressSlice.reducer;

// Enhanced selectors
export const selectProgress = (state: { progress: ProgressState }) => state.progress;
export const selectProgressStats = (state: { progress: ProgressState }) => state.progress.stats;
export const selectHealthMetrics = (state: { progress: ProgressState }) => state.progress.healthMetrics;
export const selectRelapseHistory = (state: { progress: ProgressState }) => state.progress.relapseHistory;
export const selectRecoveryStrength = (state: { progress: ProgressState }) => state.progress.stats.recoveryStrength;
export const selectImprovementTrend = (state: { progress: ProgressState }) => state.progress.stats.improvementTrend;
export const selectDailyCheckIns = (state: { progress: ProgressState }) => state.progress.dailyCheckIns;
export const selectHealthMilestones = (state: { progress: ProgressState }) => state.progress.healthMilestones;
export const selectProgressLoading = (state: { progress: ProgressState }) => state.progress.isLoading;
export const selectProgressError = (state: { progress: ProgressState }) => state.progress.error; 