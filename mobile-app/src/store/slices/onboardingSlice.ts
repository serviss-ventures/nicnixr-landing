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
  totalSteps: 9,
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
  
  // Product-specific coping strategies
  if (data.nicotineProduct?.category === 'cigarettes') {
    strategies.push('🚭 Hand-to-mouth replacement activities');
    strategies.push('🫁 Deep breathing exercises for lung recovery');
    strategies.push('🔥 Smoking ritual interruption techniques');
  } else if (data.nicotineProduct?.category === 'vape') {
    strategies.push('💨 Vapor simulation with healthy alternatives');
    strategies.push('📱 Digital detox from vaping apps/communities');
    strategies.push('🧪 Chemical craving management protocols');
  } else if (data.nicotineProduct?.category === 'pouches') {
    strategies.push('👄 Oral fixation replacement therapy');
    strategies.push('🦷 Gum health recovery activities');
    strategies.push('⚡ Quick nicotine clearance advantage techniques');
  } else if (data.nicotineProduct?.category === 'chewing') {
    strategies.push('🦷 Jaw muscle retraining exercises');
    strategies.push('💪 Oral health restoration protocol');
    strategies.push('🎯 Chewing habit interruption system');
  }
  
  // Trigger-specific strategies
  if (data.cravingTriggers.includes('stress')) {
    strategies.push('🧘 Advanced stress management intervention');
    strategies.push('🌊 Progressive muscle relaxation techniques');
  }
  if (data.cravingTriggers.includes('boredom')) {
    strategies.push('🎨 Engaging hobby activation system');
    strategies.push('🏃‍♂️ Physical activity burst protocols');
  }
  if (data.cravingTriggers.includes('social')) {
    strategies.push('👥 Social escape plan development');
    strategies.push('🛡️ Peer pressure immunity training');
  }
  if (data.cravingTriggers.includes('after_meals')) {
    strategies.push('🍽️ Post-meal ritual reconstruction');
    strategies.push('🦷 Oral hygiene replacement habits');
  }
  if (data.cravingTriggers.includes('driving')) {
    strategies.push('🚗 Vehicle-based craving management');
    strategies.push('🎵 Audio distraction protocols');
  }
  if (data.cravingTriggers.includes('work_breaks')) {
    strategies.push('⏰ Healthy break activity alternatives');
    strategies.push('🚶‍♂️ Workplace movement protocols');
  }
  
  // Fear-based strategies
  if (data.fearsAboutQuitting.includes('withdrawal')) {
    strategies.push('⚕️ Medical-grade withdrawal management');
    strategies.push('💊 Natural symptom relief protocols');
  }
  if (data.fearsAboutQuitting.includes('weight_gain')) {
    strategies.push('⚖️ Metabolism optimization protocol');
    strategies.push('🥗 Healthy snacking alternatives');
  }
  if (data.fearsAboutQuitting.includes('failure')) {
    strategies.push('🎯 Confidence building exercises');
    strategies.push('🏆 Small victory celebration system');
  }
  
  // Exercise frequency adaptations
  if (data.exerciseFrequency === 'rarely' || data.exerciseFrequency === 'never') {
    strategies.push('🚶‍♂️ Gentle movement introduction (10-minute walks)');
    strategies.push('🧘‍♀️ Chair-based stretching routines');
  } else if (data.exerciseFrequency === 'daily') {
    strategies.push('💪 Intense workout craving-busting sessions');
    strategies.push('🏃‍♂️ Exercise timing optimization for cravings');
  }
  
  // Previous attempt learning
  if (data.whatWorkedBefore.includes('support_groups')) {
    strategies.push('🤝 Enhanced community engagement protocols');
  }
  if (data.whatWorkedBefore.includes('nicotine_replacement')) {
    strategies.push('🔄 Advanced replacement behavior strategies');
  }
  if (data.whatWorkedBefore.includes('exercise')) {
    strategies.push('🏋️‍♂️ Proven physical activity amplification');
  }
  
  // Always include core strategies
  strategies.push('💧 Hydration therapy (extra water intake)');
  strategies.push('🧠 Mindful distraction techniques');
  strategies.push('📱 Real-time craving tracking');
  
  return strategies.slice(0, 8); // Limit to most relevant
};

const generateFirstWeekFocus = (data: OnboardingData): string[] => {
  const focus: string[] = [];
  
  // Product-specific first week priorities
  if (data.nicotineProduct?.category === 'cigarettes') {
    focus.push('🚭 Replace smoking rituals with healthy alternatives');
    focus.push('🫁 Focus on lung recovery (deep breathing exercises)');
  } else if (data.nicotineProduct?.category === 'vape') {
    focus.push('💨 Eliminate vaping triggers and environments');
    focus.push('📱 Remove vaping apps and unfollow vape content');
  } else if (data.nicotineProduct?.category === 'pouches') {
    focus.push('👄 Develop new oral habits (sugar-free gum, toothpicks)');
    focus.push('🦷 Begin gum health recovery routine');
  } else if (data.nicotineProduct?.category === 'chewing') {
    focus.push('🦷 Start oral health restoration protocol');
    focus.push('💪 Practice jaw muscle relaxation exercises');
  }
  
  // Personalized based on user profile
  if (data.sleepQuality === 'poor' || data.sleepQuality === 'fair') {
    focus.push('😴 Establish better sleep routine (crucial for recovery)');
  }
  if (data.stressLevel >= 4) {
    focus.push('🧘 Practice daily stress management (your biggest trigger)');
  }
  if (data.cravingTriggers.includes('after_meals')) {
    focus.push('🍽️ Replace after-meal ritual with healthy habit');
  }
  if (data.cravingTriggers.includes('social')) {
    focus.push('👥 Practice social situation strategies');
  }
  if (data.cravingTriggers.includes('work_breaks')) {
    focus.push('⏰ Redesign your work break routine');
  }
  
  // Previous attempt insights
  if (data.whatMadeItDifficult.includes('withdrawal_symptoms')) {
    focus.push('⚕️ Monitor and manage withdrawal symptoms proactively');
  }
  if (data.whatMadeItDifficult.includes('social_pressure')) {
    focus.push('🛡️ Practice saying no to social nicotine offers');
  }
  
  // Usage intensity adjustments
  const productAverages = {
    'cigarettes': 15, 'vape': 200, 'pouches': 8, 'chewing': 6, 'other': 10
  };
  const avgForProduct = productAverages[data.nicotineProduct?.category as keyof typeof productAverages] || 10;
  const usageIntensity = (data.dailyAmount || 10) / avgForProduct;
  
  if (usageIntensity > 1.5) {
    focus.push('💪 Expect stronger cravings - use deep breathing frequently');
  } else if (usageIntensity < 0.7) {
    focus.push('✨ Your light usage gives you an advantage - build on it');
  }
  
  // Always include core focuses
  focus.push('💧 Stay extra hydrated - drink water at every craving');
  focus.push('📱 Use community support at first sign of craving');
  focus.push('📊 Track your progress and celebrate small wins');
  
  return focus.slice(0, 6); // Limit to manageable number
};

const generateCrisisActionPlan = (data: OnboardingData): string[] => {
  const plan: string[] = [
    '🛑 STOP what you\'re doing immediately',
    '🫁 Take 5 deep breaths (count them out loud)',
    '📱 Open the NixR app for support tools',
  ];
  
  // Product-specific crisis interventions
  if (data.nicotineProduct?.category === 'cigarettes') {
    plan.push('🚭 Remove yourself from smoking areas/triggers');
    plan.push('🫁 Do 10 deep breathing exercises for lung health');
  } else if (data.nicotineProduct?.category === 'vape') {
    plan.push('💨 Put your vape device in another room');
    plan.push('📱 Close any vaping-related apps or content');
  } else if (data.nicotineProduct?.category === 'pouches') {
    plan.push('👄 Chew sugar-free gum or use a toothpick');
    plan.push('🦷 Brush your teeth or use mouthwash');
  } else if (data.nicotineProduct?.category === 'chewing') {
    plan.push('🦷 Rinse mouth with water or mouthwash');
    plan.push('💪 Do jaw relaxation exercises');
  }
  
  plan.push('💧 Drink a large glass of water immediately');
  
  // Support system integration
  if (data.hasSupportSystem) {
    plan.push('📞 Call your support person (don\'t hesitate!)');
  } else {
    plan.push('💬 Use the community chat for instant support');
  }
  
  // Personalized motivation reminder
  const primaryReason = data.reasonsToQuit[0] || 'your health';
  plan.push(`❤️ Remember your #1 reason: ${primaryReason.replace('_', ' ')}`);
  
  // Trigger-specific interventions
  if (data.cravingTriggers.includes('stress')) {
    plan.push('🧘 Do 2 minutes of stress-relief breathing');
  }
  if (data.cravingTriggers.includes('boredom')) {
    plan.push('🎯 Engage in your planned boredom-buster activity');
  }
  
  plan.push('⏰ Remind yourself: "This craving will pass in 3-5 minutes"');
  plan.push('🏃‍♂️ Do 2 minutes of physical activity (jumping jacks, walk, stretch)');
  plan.push('🏆 Reward yourself for resisting - you\'re a warrior!');
  
  return plan;
};

const generateLearningModules = (data: OnboardingData): string[] => {
  const modules: string[] = ['🧠 Understanding Nicotine Addiction', '⏰ The Recovery Timeline'];
  
  // Product-specific modules
  if (data.nicotineProduct?.category === 'cigarettes') {
    modules.push('🚭 Cigarette Cessation Mastery');
    modules.push('🫁 Lung Recovery Acceleration');
  } else if (data.nicotineProduct?.category === 'vape') {
    modules.push('💨 Vaping Cessation Strategies');
    modules.push('🧪 Understanding Vape Chemicals');
  } else if (data.nicotineProduct?.category === 'pouches') {
    modules.push('👄 Pouch Cessation Techniques');
    modules.push('🦷 Oral Health Recovery');
  } else if (data.nicotineProduct?.category === 'chewing') {
    modules.push('🦷 Chewing Tobacco Cessation');
    modules.push('💪 Oral Health Restoration');
  }
  
  // Fear-based modules
  if (data.fearsAboutQuitting.includes('withdrawal')) {
    modules.push('⚕️ Managing Withdrawal Symptoms');
  }
  if (data.fearsAboutQuitting.includes('weight_gain')) {
    modules.push('⚖️ Healthy Weight Management During Quit');
  }
  if (data.fearsAboutQuitting.includes('failure')) {
    modules.push('🎯 Building Quit Confidence');
  }
  if (data.fearsAboutQuitting.includes('social_situations')) {
    modules.push('👥 Social Situation Mastery');
  }
  
  // Motivation-based modules
  if (data.reasonsToQuit.includes('health')) {
    modules.push('❤️ Health Benefits of Quitting');
  }
  if (data.reasonsToQuit.includes('money')) {
    modules.push('💰 Financial Benefits Calculator');
  }
  if (data.reasonsToQuit.includes('family')) {
    modules.push('👨‍👩‍👧‍👦 Family Impact and Motivation');
  }
  if (data.reasonsToQuit.includes('pregnancy')) {
    modules.push('🤱 Pregnancy and Nicotine Cessation');
  }
  
  // Trigger-based modules
  if (data.cravingTriggers.includes('stress')) {
    modules.push('🧘 Advanced Stress Management');
  }
  if (data.cravingTriggers.includes('social')) {
    modules.push('👥 Social Pressure Resistance');
  }
  
  // Previous attempt modules
  if (data.previousAttempts > 2) {
    modules.push('🔬 Advanced Relapse Prevention');
  }
  if (data.whatMadeItDifficult.includes('withdrawal_symptoms')) {
    modules.push('💊 Natural Withdrawal Relief');
  }
  
  return modules.slice(0, 8); // Limit to most relevant
};

const generateSupportActivities = (data: OnboardingData): string[] => {
  const activities: string[] = [];
  
  // Product-specific support groups
  if (data.nicotineProduct?.category === 'cigarettes') {
    activities.push('🚭 Smoke-Free Champions Circle');
  } else if (data.nicotineProduct?.category === 'vape') {
    activities.push('💨 Vape-to-Freedom Support Group');
  } else if (data.nicotineProduct?.category === 'pouches') {
    activities.push('👄 Pouch-Free Warriors');
  } else if (data.nicotineProduct?.category === 'chewing') {
    activities.push('🦷 Chew-Free Champions');
  }
  
  // Experience-based activities
  if (data.hasTriedQuittingBefore) {
    activities.push('🎯 Quit Veterans Mentorship Circle');
  } else {
    activities.push('🌟 First-Time Quitters Support Group');
  }
  
  // Motivation-based activities
  if (data.reasonsToQuit.includes('family')) {
    activities.push('👨‍👩‍👧‍👦 Family-Focused Quitters');
  }
  if (data.reasonsToQuit.includes('health')) {
    activities.push('❤️ Health Warriors Community');
  }
  if (data.reasonsToQuit.includes('pregnancy')) {
    activities.push('🤱 Pregnancy Quit Support');
  }
  
  // Communication style activities
  if (data.preferredCommunicationStyle === 'encouraging') {
    activities.push('🌟 Positive Affirmation Exchanges');
    activities.push('🏆 Daily Victory Celebrations');
  } else if (data.preferredCommunicationStyle === 'direct') {
    activities.push('🎯 Accountability Partner Matching');
    activities.push('📊 Progress Challenge Groups');
  }
  
  // Trigger-based activities
  if (data.cravingTriggers.includes('stress')) {
    activities.push('🧘 Stress Management Support Circle');
  }
  if (data.cravingTriggers.includes('social')) {
    activities.push('👥 Social Situation Strategy Sharing');
  }
  
  // Always include core activities
  activities.push('📊 Daily motivation group check-ins');
  activities.push('🎉 Milestone celebration community');
  
  return activities.slice(0, 6);
};

const generateCommunityRecommendations = (data: OnboardingData): string[] => {
  const recommendations: string[] = [];
  
  // Product-specific communities
  if (data.nicotineProduct?.category === 'vape') {
    recommendations.push('💨 Vape-to-Freedom Success Stories');
  } else if (data.nicotineProduct?.category === 'cigarettes') {
    recommendations.push('🚭 Smoke-Free Champions Network');
  } else if (data.nicotineProduct?.category === 'pouches') {
    recommendations.push('👄 Pouch-Free Victory Circle');
  } else if (data.nicotineProduct?.category === 'chewing') {
    recommendations.push('🦷 Chew-Free Warriors Community');
  }
  
  // Experience-based recommendations
  if (data.previousAttempts === 0) {
    recommendations.push('🌟 New Quitters Welcome Circle');
  } else if (data.previousAttempts > 3) {
    recommendations.push('🎯 Persistent Quitters Support Network');
  }
  
  // Motivation-based recommendations
  if (data.reasonsToQuit.includes('family')) {
    recommendations.push('👨‍👩‍👧‍👦 Family-Motivated Quitters');
  }
  if (data.reasonsToQuit.includes('health')) {
    recommendations.push('❤️ Health-First Community');
  }
  if (data.reasonsToQuit.includes('money')) {
    recommendations.push('💰 Financial Freedom Quitters');
  }
  
  // Age/demographic recommendations (if available)
  if (data.reasonsToQuit.includes('pregnancy')) {
    recommendations.push('🤱 Expecting Mothers Quit Support');
  }
  
  // Challenge-based recommendations
  if (data.whatMadeItDifficult.includes('social_pressure')) {
    recommendations.push('🛡️ Social Pressure Resistance Group');
  }
  if (data.whatMadeItDifficult.includes('stress_triggers')) {
    recommendations.push('🧘 Stress-Free Quitters Circle');
  }
  
  // Always include
  recommendations.push('🏆 Daily Victory Celebration Hub');
  
  return recommendations.slice(0, 5);
};

const generateKeyMetrics = (data: OnboardingData): string[] => {
  const metrics: string[] = ['📅 Days clean', '💰 Money saved', '🛡️ Cravings resisted'];
  
  // Product-specific metrics
  if (data.nicotineProduct?.category === 'cigarettes') {
    metrics.push('🫁 Lung capacity improvement');
    metrics.push('🚭 Cigarettes not smoked');
  } else if (data.nicotineProduct?.category === 'vape') {
    metrics.push('💨 Puffs avoided');
    metrics.push('🧪 Chemicals avoided');
  } else if (data.nicotineProduct?.category === 'pouches') {
    metrics.push('👄 Pouches not used');
    metrics.push('🦷 Oral health improvement');
  } else if (data.nicotineProduct?.category === 'chewing') {
    metrics.push('🦷 Oral health recovery');
    metrics.push('💪 Jaw muscle health');
  }
  
  // Health-focused metrics
  if (data.healthConcerns.includes('breathing')) {
    metrics.push('🫁 Breathing improvement score');
  }
  if (data.healthConcerns.includes('energy')) {
    metrics.push('⚡ Energy level tracking');
  }
  if (data.healthConcerns.includes('sleep')) {
    metrics.push('😴 Sleep quality improvement');
  }
  if (data.healthConcerns.includes('taste_smell')) {
    metrics.push('👃 Taste and smell recovery');
  }
  
  // Exercise integration
  if (data.exerciseFrequency !== 'never') {
    metrics.push('🏃‍♂️ Exercise performance improvement');
  }
  
  // Motivation-specific metrics
  if (data.reasonsToQuit.includes('family')) {
    metrics.push('👨‍👩‍👧‍👦 Family time quality');
  }
  
  return metrics.slice(0, 8);
};

const generatePersonalMantra = (data: OnboardingData): string => {
  const primaryReason = data.reasonsToQuit[0];
  const productName = data.nicotineProduct?.name || 'nicotine';
  
  // Product and motivation specific mantras
  if (primaryReason === 'health') {
    if (data.nicotineProduct?.category === 'cigarettes') {
      return "Every breath I take without cigarettes makes my lungs stronger";
    } else if (data.nicotineProduct?.category === 'vape') {
      return "Every breath I take without vaping clears my lungs of chemicals";
    } else if (data.nicotineProduct?.category === 'pouches') {
      return "Every moment without pouches heals my mouth and strengthens my body";
    } else {
      return `Every breath I take without ${productName} makes me healthier`;
    }
  } else if (primaryReason === 'family') {
    return `I choose my family's future over ${productName}'s grip on my past`;
  } else if (primaryReason === 'freedom') {
    return `I am breaking free from ${productName}'s control over my life`;
  } else if (primaryReason === 'money') {
    return `Every dollar I don't spend on ${productName} builds my future`;
  } else if (primaryReason === 'pregnancy') {
    return "I am protecting my baby's future with every nicotine-free breath";
  } else if (primaryReason === 'confidence') {
    return `I am stronger than any craving ${productName} can create`;
  }
  
  // Fallback based on previous attempts
  if (data.previousAttempts > 0) {
    return `I've learned from the past - this time I'm unstoppable`;
  }
  
  return "I am stronger than my cravings";
};

const generateCelebrationMilestones = (data: OnboardingData): string[] => {
  const milestones: string[] = [
    '🎯 24 hours nicotine-free',
    '🏆 1 week of freedom',
    '💪 1 month milestone',
    '🌟 100 days clean',
    '👑 1 year anniversary'
  ];
  
  // Product-specific milestones
  if (data.nicotineProduct?.category === 'cigarettes') {
    milestones.splice(1, 0, '🫁 72 hours - lung function improving');
    milestones.splice(3, 0, '🚭 2 weeks - circulation restored');
  } else if (data.nicotineProduct?.category === 'vape') {
    milestones.splice(1, 0, '💨 48 hours - vape chemicals clearing');
    milestones.splice(3, 0, '🧪 2 weeks - chemical dependency broken');
  } else if (data.nicotineProduct?.category === 'pouches') {
    milestones.splice(1, 0, '👄 48 hours - oral tissue healing');
    milestones.splice(3, 0, '🦷 2 weeks - gum health improving');
  }
  
  // Money-focused milestones
  if (data.reasonsToQuit.includes('money')) {
    const dailyCost = data.dailyCost || 10;
    const firstHundred = Math.ceil(100 / dailyCost);
    milestones.splice(2, 0, `💰 ${firstHundred} days - First $100 saved`);
  }
  
  // Health-focused milestones
  if (data.reasonsToQuit.includes('health')) {
    milestones.splice(4, 0, '❤️ 6 months - heart disease risk halved');
  }
  
  // Family-focused milestones
  if (data.reasonsToQuit.includes('family')) {
    milestones.splice(3, 0, '👨‍👩‍👧‍👦 1 month - family celebration time');
  }
  
  return milestones.slice(0, 8);
};

const generateEmergencyPlan = (data: OnboardingData): string[] => {
  const emergencyPlan: string[] = [
    '🛑 STOP what you\'re doing immediately',
    '🫁 Take 5 deep breaths (count them out loud)',
    '📱 Open NixR app for craving support tools',
    '⏰ Remind yourself: "This will pass in 3-5 minutes"'
  ];
  
  // Product-specific emergency actions
  if (data.nicotineProduct?.category === 'cigarettes') {
    emergencyPlan.push('🚭 Remove yourself from smoking areas');
    emergencyPlan.push('🫁 Do lung-healing breathing exercises');
  } else if (data.nicotineProduct?.category === 'vape') {
    emergencyPlan.push('💨 Put vape device in another room');
    emergencyPlan.push('📱 Close vaping apps/content');
  } else if (data.nicotineProduct?.category === 'pouches') {
    emergencyPlan.push('👄 Chew sugar-free gum instead');
    emergencyPlan.push('🦷 Brush teeth or use mouthwash');
  } else if (data.nicotineProduct?.category === 'chewing') {
    emergencyPlan.push('🦷 Rinse mouth with water');
    emergencyPlan.push('💪 Do jaw relaxation exercises');
  }
  
  // Coping mechanism integration
  if (data.currentCopingMechanisms.includes('exercise')) {
    emergencyPlan.push('🏃‍♂️ Do 20 jumping jacks or push-ups');
  } else {
    emergencyPlan.push('🚶‍♂️ Walk around the block or do stretches');
  }
  
  // Support system integration
  if (data.hasSupportSystem) {
    emergencyPlan.push('📞 Call your support person immediately');
  } else {
    emergencyPlan.push('💬 Use community chat for instant support');
  }
  
  // Motivation reminder
  const primaryReason = data.reasonsToQuit[0] || 'your health';
  emergencyPlan.push(`❤️ Remember why you're doing this: ${primaryReason.replace('_', ' ')}`);
  
  emergencyPlan.push('🏆 Reward yourself for resisting - you\'re a warrior!');
  
  return emergencyPlan;
};

// Onboarding slice
const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    nextStep: (state) => {
      // Fix for Redux persist issue where totalSteps might be 8
      if (state.totalSteps < 9) {
        state.totalSteps = 9;
      }
      
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1;
      }
    },
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    setStep: (state, action: PayloadAction<number>) => {
      // Ensure totalSteps is correct when setting step
      if (state.totalSteps < 9) {
        state.totalSteps = 9;
      }
      state.currentStep = action.payload;
    },
    updateStepData: (state, action: PayloadAction<Partial<OnboardingData>>) => {
      state.stepData = { ...state.stepData, ...action.payload };
    },
    resetOnboarding: (state) => {
      state.currentStep = 1;
      state.totalSteps = 9; // Ensure it's set correctly on reset
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
        // Ensure totalSteps is correct after loading
        if (state.totalSteps < 9) {
          state.totalSteps = 9;
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
  setStep,
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