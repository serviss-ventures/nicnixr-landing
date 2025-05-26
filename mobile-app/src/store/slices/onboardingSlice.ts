import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { OnboardingData, OnboardingStepData, QuitBlueprint, NicotineProduct } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/app';

// Initial state
interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  stepData: Partial<OnboardingData>;
  quitBlueprint: QuitBlueprint | null;
  isLoading: boolean;
  error: string | null;
  isGeneratingBlueprint: boolean;
}

const initialOnboardingData: Partial<OnboardingData> = {
  firstName: '',
  lastName: '',
  email: '',
  nicotineProduct: undefined,
  customNicotineProduct: '',
  usageDuration: '',
  dailyAmount: 0, // Ensure this is always a number, not undefined
  packagesPerDay: 0,
  dailyCost: 0,
  reasonsToQuit: [],
  customReasonToQuit: '',
  fearsAboutQuitting: [],
  customFearAboutQuitting: '',
  cravingTriggers: [],
  customCravingTrigger: '',
  highRiskSituations: [],
  currentCopingMechanisms: [],
  hasTriedQuittingBefore: false,
  previousAttempts: 0,
  whatWorkedBefore: [],
  whatMadeItDifficult: [],
  longestQuitPeriod: '',
  quitDate: '',
  quitApproach: 'immediate',
  preparationDays: 0,
  motivationalGoals: [],
  preferredCommunicationStyle: 'encouraging',
  reminderFrequency: 'moderate',
  hasSupportSystem: false,
  supportTypes: [],
  tellOthersAboutQuit: false,
  healthConcerns: [],
  currentHealthIssues: [],
  stressLevel: 3,
  typicalDayStructure: 'routine',
  exerciseFrequency: 'weekly',
  sleepQuality: 'good',
  completedAt: '',
  onboardingVersion: '1.0',
};

const initialState: OnboardingState = {
  currentStep: 1,
  totalSteps: 8,
  isComplete: false,
  stepData: initialOnboardingData,
  quitBlueprint: null,
  isLoading: false,
  error: null,
  isGeneratingBlueprint: false,
};

// Async thunks
export const saveOnboardingProgress = createAsyncThunk(
  'onboarding/saveProgress',
  async (stepData: Partial<OnboardingData>, { rejectWithValue }) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_PROGRESS, JSON.stringify(stepData));
      return stepData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save onboarding progress');
    }
  }
);

export const loadOnboardingProgress = createAsyncThunk(
  'onboarding/loadProgress',
  async (_, { rejectWithValue }) => {
    try {
      const savedProgress = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_PROGRESS);
      if (savedProgress) {
        return JSON.parse(savedProgress);
      }
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load onboarding progress');
    }
  }
);

export const generateQuitBlueprint = createAsyncThunk(
  'onboarding/generateBlueprint',
  async (onboardingData: OnboardingData, { rejectWithValue }) => {
    try {
      // This would typically call an AI service or algorithm to generate personalized recommendations
      // For now, we'll create a basic blueprint based on the onboarding data
      
      const blueprint: QuitBlueprint = {
        id: `blueprint-${Date.now()}`,
        userId: 'current-user', // Would come from auth state
        createdAt: new Date().toISOString(),
        
        // Core Identity
        primaryMotivators: onboardingData.reasonsToQuit,
        identifiedTriggers: onboardingData.cravingTriggers,
        riskSituations: onboardingData.highRiskSituations,
        strengths: onboardingData.whatWorkedBefore,
        
        // Personalized Strategies
        recommendedCopingStrategies: generateCopingStrategies(onboardingData),
        suggestedFirstWeekFocus: generateFirstWeekFocus(onboardingData),
        crisisActionPlan: generateCrisisActionPlan(onboardingData),
        
        // Learning Modules
        recommendedLearningModules: generateLearningModules(onboardingData),
        priorityHealthBenefits: onboardingData.healthConcerns,
        
        // Support Recommendations
        suggestedSupportActivities: generateSupportActivities(onboardingData),
        communityGroupRecommendations: generateCommunityRecommendations(onboardingData),
        
        // Monitoring & Tracking
        keyMetricsToTrack: generateKeyMetrics(onboardingData),
        checkInFrequency: onboardingData.reminderFrequency === 'frequent' ? 'twice-daily' : 'daily',
        
        // Inspiration & Motivation
        personalMantra: generatePersonalMantra(onboardingData),
        celebrationMilestones: generateCelebrationMilestones(onboardingData),
        
        // Emergency Protocols
        cravingEmergencyPlan: generateEmergencyPlan(onboardingData),
        supportContactList: onboardingData.hasSupportSystem ? ['Support Contact 1', 'Support Contact 2'] : [],
      };
      
      // Save blueprint
      await AsyncStorage.setItem(STORAGE_KEYS.QUIT_BLUEPRINT, JSON.stringify(blueprint));
      
      return blueprint;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate quit blueprint');
    }
  }
);

// Helper functions for blueprint generation
const generateCopingStrategies = (data: OnboardingData): string[] => {
  const strategies: string[] = [];
  
  if (data.cravingTriggers.includes('stress')) {
    strategies.push('Deep breathing exercises', 'Progressive muscle relaxation');
  }
  if (data.cravingTriggers.includes('boredom')) {
    strategies.push('Engaging hobby activities', 'Physical exercise');
  }
  if (data.cravingTriggers.includes('social events')) {
    strategies.push('Social escape plan', 'Non-alcoholic drink alternatives');
  }
  if (data.exerciseFrequency === 'rarely' || data.exerciseFrequency === 'never') {
    strategies.push('Start with 10-minute walks', 'Gentle yoga routines');
  }
  
  strategies.push('Hydration therapy', 'Mindful distraction techniques');
  return strategies;
};

const generateFirstWeekFocus = (data: OnboardingData): string[] => {
  const focus: string[] = ['Stay hydrated - drink extra water'];
  
  if (data.sleepQuality === 'poor' || data.sleepQuality === 'fair') {
    focus.push('Establish better sleep routine');
  }
  if (data.stressLevel >= 4) {
    focus.push('Practice daily stress management');
  }
  if (data.cravingTriggers.includes('after meals')) {
    focus.push('Replace after-meal ritual with healthy habit');
  }
  
  focus.push('Use Shield Mode at first craving', 'Complete daily check-ins');
  return focus;
};

const generateCrisisActionPlan = (data: OnboardingData): string[] => {
  const plan: string[] = [
    'Take 5 deep breaths immediately',
    'Activate Shield Mode in the app',
    'Drink a large glass of water',
  ];
  
  if (data.hasSupportSystem) {
    plan.push('Call your support person');
  }
  
  plan.push(
    'Remember your #1 reason to quit: ' + (data.reasonsToQuit[0] || 'Your health'),
    'Remind yourself: This craving will pass in 3-5 minutes',
    'Engage in physical activity for 2 minutes'
  );
  
  return plan;
};

const generateLearningModules = (data: OnboardingData): string[] => {
  const modules: string[] = ['Understanding Nicotine Addiction', 'The Recovery Timeline'];
  
  if (data.fearsAboutQuitting.includes('withdrawal')) {
    modules.push('Managing Withdrawal Symptoms');
  }
  if (data.fearsAboutQuitting.includes('weight gain')) {
    modules.push('Healthy Weight Management During Quit');
  }
  if (data.reasonsToQuit.includes('health')) {
    modules.push('Health Benefits of Quitting');
  }
  if (data.reasonsToQuit.includes('money')) {
    modules.push('Financial Benefits Calculator');
  }
  
  return modules;
};

const generateSupportActivities = (data: OnboardingData): string[] => {
  const activities: string[] = ['Join daily motivation group', 'Share progress celebrations'];
  
  if (data.hasTriedQuittingBefore) {
    activities.push('Connect with "Quit Veterans" group');
  }
  if (data.preferredCommunicationStyle === 'encouraging') {
    activities.push('Positive affirmation exchanges');
  }
  
  return activities;
};

const generateCommunityRecommendations = (data: OnboardingData): string[] => {
  const recommendations: string[] = ['New Quitters Support Circle'];
  
  if (data.nicotineProduct?.category === 'vape') {
    recommendations.push('Vape-to-Freedom Group');
  } else if (data.nicotineProduct?.category === 'cigarettes') {
    recommendations.push('Smoke-Free Champions');
  }
  
  if (data.reasonsToQuit.includes('family')) {
    recommendations.push('Family-Focused Quitters');
  }
  
  return recommendations;
};

const generateKeyMetrics = (data: OnboardingData): string[] => {
  const metrics: string[] = ['Days clean', 'Money saved', 'Cravings resisted'];
  
  if (data.healthConcerns.includes('lung capacity')) {
    metrics.push('Breathing improvement');
  }
  if (data.healthConcerns.includes('energy')) {
    metrics.push('Energy levels');
  }
  if (data.exerciseFrequency !== 'never') {
    metrics.push('Exercise performance');
  }
  
  return metrics;
};

const generatePersonalMantra = (data: OnboardingData): string => {
  const primaryReason = data.reasonsToQuit[0];
  
  if (primaryReason === 'health') {
    return "Every breath I take without nicotine makes me stronger";
  } else if (primaryReason === 'family') {
    return "I choose my family's future over nicotine's past";
  } else if (primaryReason === 'freedom') {
    return "I am breaking free from nicotine's control";
  } else if (primaryReason === 'money') {
    return "Every dollar saved is a victory for my future";
  }
  
  return "I am stronger than my cravings";
};

const generateCelebrationMilestones = (data: OnboardingData): string[] => {
  const milestones: string[] = [
    '24 hours nicotine-free',
    '1 week of freedom',
    '1 month milestone',
    '100 days clean',
    '1 year anniversary'
  ];
  
  if (data.reasonsToQuit.includes('money')) {
    milestones.splice(2, 0, 'First $100 saved');
  }
  
  return milestones;
};

const generateEmergencyPlan = (data: OnboardingData): string[] => {
  const emergencyPlan: string[] = [
    'STOP what you\'re doing',
    'Take 5 deep breaths',
    'Open NIXR Shield Mode',
    'Remind yourself: "This will pass in 3-5 minutes"'
  ];
  
  if (data.currentCopingMechanisms.includes('exercise')) {
    emergencyPlan.push('Do 20 jumping jacks or push-ups');
  } else {
    emergencyPlan.push('Walk around the block or do stretches');
  }
  
  emergencyPlan.push('Reward yourself for resisting - you\'re a warrior!');
  
  return emergencyPlan;
};

// Onboarding slice
const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1;
      }
    },
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    updateStepData: (state, action: PayloadAction<Partial<OnboardingData>>) => {
      state.stepData = { ...state.stepData, ...action.payload };
    },
    resetOnboarding: (state) => {
      state.currentStep = 1;
      state.isComplete = false;
      state.stepData = initialOnboardingData;
      state.quitBlueprint = null;
      state.error = null;
    },
    completeOnboarding: (state) => {
      state.isComplete = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Save onboarding progress
    builder
      .addCase(saveOnboardingProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveOnboardingProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stepData = { ...state.stepData, ...action.payload };
      })
      .addCase(saveOnboardingProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load onboarding progress
    builder
      .addCase(loadOnboardingProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadOnboardingProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.stepData = { ...state.stepData, ...action.payload };
        }
      })
      .addCase(loadOnboardingProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Generate quit blueprint
    builder
      .addCase(generateQuitBlueprint.pending, (state) => {
        state.isGeneratingBlueprint = true;
        state.error = null;
      })
      .addCase(generateQuitBlueprint.fulfilled, (state, action) => {
        state.isGeneratingBlueprint = false;
        state.quitBlueprint = action.payload;
        state.isComplete = true;
      })
      .addCase(generateQuitBlueprint.rejected, (state, action) => {
        state.isGeneratingBlueprint = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { 
  nextStep, 
  previousStep, 
  updateStepData, 
  resetOnboarding, 
  completeOnboarding, 
  clearError 
} = onboardingSlice.actions;

// Export reducer
export default onboardingSlice.reducer;

// Selectors - Using any to avoid circular dependencies
export const selectOnboarding = (state: any) => state.onboarding;
export const selectOnboardingStep = (state: any) => state.onboarding.currentStep;
export const selectOnboardingData = (state: any) => state.onboarding.stepData;
export const selectQuitBlueprint = (state: any) => state.onboarding.quitBlueprint;
export const selectOnboardingLoading = (state: any) => state.onboarding.isLoading;
export const selectOnboardingError = (state: any) => state.onboarding.error; 