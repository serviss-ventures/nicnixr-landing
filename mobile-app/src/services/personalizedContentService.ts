import { store } from '../store/store';
import { selectOnboarding } from '../store/slices/onboardingSlice';

export interface PersonalizedContent {
  productType: NicotineProductType;
  productCategory: string;
  dailyAmount: number;
  personalizedUnitName: string;
  relevantHealthBenefits: string[];
  specificWithdrawalSymptoms: string[];
  costSavingsMultiplier: number;
}

export type NicotineProductType = 'cigarettes' | 'vape' | 'nicotine_pouches' | 'chew_dip' | 'other';

export interface PersonalizedDailyTip {
  id: string;
  title: string;
  content: string;
  scientificBasis: string;
  actionableAdvice: string;
  dayNumber: number;
  category: 'neuroplasticity' | 'health' | 'psychology' | 'practical' | 'motivation';
  icon: string;
  color: string;
  sources: string[];
  productRelevant: boolean;
}

export interface PersonalizedMilestone {
  id: string;
  title: string;
  description: string;
  daysRequired: number;
  achieved: boolean;
  icon: string;
  color: string;
  celebrationMessage: string;
  productRelevant: boolean;
}

// Get user's personalized profile from onboarding data
export const getUserPersonalizedProfile = (): PersonalizedContent => {
  const state = store.getState();
  const onboardingData = selectOnboarding(state);
  
  const productType = onboardingData.stepData?.nicotineProduct?.category as NicotineProductType || 'other';
  const dailyAmount = onboardingData.stepData?.dailyAmount || 10;
  
  // Product-specific configurations
  const productConfigs = {
    cigarettes: {
      personalizedUnitName: 'cigarettes',
      relevantHealthBenefits: ['lung_recovery', 'circulation', 'taste_smell', 'cancer_risk'],
      specificWithdrawalSymptoms: ['coughing', 'lung_irritation', 'tar_clearance'],
      costSavingsMultiplier: 1.2,
    },
    vape: {
      personalizedUnitName: 'puffs',
      relevantHealthBenefits: ['lung_recovery', 'chemical_clearance', 'breathing'],
      specificWithdrawalSymptoms: ['throat_irritation', 'chemical_withdrawal'],
      costSavingsMultiplier: 0.8,
    },
    nicotine_pouches: {
      personalizedUnitName: 'pouches',
      relevantHealthBenefits: ['oral_health', 'gum_recovery', 'taste_restoration'],
      specificWithdrawalSymptoms: ['oral_fixation', 'gum_sensitivity'],
      costSavingsMultiplier: 1.0,
    },
    chew_dip: {
      personalizedUnitName: 'portions',
      relevantHealthBenefits: ['oral_health', 'gum_recovery', 'cancer_risk'],
      specificWithdrawalSymptoms: ['oral_fixation', 'jaw_tension', 'gum_healing'],
      costSavingsMultiplier: 1.1,
    },
    other: {
      personalizedUnitName: 'units',
      relevantHealthBenefits: ['general_health', 'energy', 'mood'],
      specificWithdrawalSymptoms: ['general_withdrawal'],
      costSavingsMultiplier: 1.0,
    },
  };

  const config = productConfigs[productType];
  
  return {
    productType,
    productCategory: productType,
    dailyAmount,
    personalizedUnitName: config.personalizedUnitName,
    relevantHealthBenefits: config.relevantHealthBenefits,
    specificWithdrawalSymptoms: config.specificWithdrawalSymptoms,
    costSavingsMultiplier: config.costSavingsMultiplier,
  };
};

// Get personalized unit name for display
export const getPersonalizedUnitName = (amount?: number): string => {
  const profile = getUserPersonalizedProfile();
  const count = amount || profile.dailyAmount;
  return `${count} ${profile.personalizedUnitName}`;
};

// Get personalized daily tips based on user's product type
export const getPersonalizedDailyTips = (dayNumber: number): PersonalizedDailyTip[] => {
  const profile = getUserPersonalizedProfile();
  
  // Product-specific tip collections
  const tipsByProduct = {
    cigarettes: [
      {
        id: 'cig_day1',
        title: 'Your Lungs Are Already Healing',
        content: 'Within 12 hours, carbon monoxide levels in your blood drop to normal. Your lungs are beginning their remarkable recovery process.',
        scientificBasis: 'Anthonisen et al. (2005) - Effects of smoking cessation intervention',
        actionableAdvice: 'Take deep breaths throughout the day and notice how your breathing feels clearer.',
        dayNumber: 1,
        category: 'health' as const,
        icon: 'fitness',
        color: '#10B981',
        sources: ['American Lung Association', 'CDC Smoking Cessation Guidelines'],
        productRelevant: true,
      },
      {
        id: 'cig_day4',
        title: 'Cilia Recovery is Accelerating',
        content: 'The tiny hair-like structures in your lungs (cilia) are rapidly regenerating, improving your ability to clear mucus and debris.',
        scientificBasis: 'Tamashiro et al. (2009) - Cigarette smoke exposure and respiratory cilia recovery',
        actionableAdvice: 'You might experience some coughing as your lungs clear out tar and toxins - this is a good sign!',
        dayNumber: 4,
        category: 'health' as const,
        icon: 'fitness',
        color: '#10B981',
        sources: ['Journal of Respiratory Medicine', 'Lung Health Foundation'],
        productRelevant: true,
      },
    ],
    vape: [
      {
        id: 'vape_day1',
        title: 'Chemical Clearance Begins',
        content: 'Your body is starting to eliminate the complex chemicals from vaping. Your lung tissues begin healing from inflammation.',
        scientificBasis: 'Bhatta & Glantz (2020) - Association of e-cigarette use with respiratory disease',
        actionableAdvice: 'Stay hydrated to help your body flush out chemicals more effectively.',
        dayNumber: 1,
        category: 'health' as const,
        icon: 'water',
        color: '#06B6D4',
        sources: ['American Heart Association', 'Respiratory Health Journal'],
        productRelevant: true,
      },
      {
        id: 'vape_day4',
        title: 'Throat and Lung Irritation Decreasing',
        content: 'The propylene glycol and vegetable glycerin that caused throat irritation are clearing from your system.',
        scientificBasis: 'Gotts et al. (2019) - What are the respiratory effects of e-cigarettes?',
        actionableAdvice: 'Notice how your throat feels less dry and irritated, especially in the morning.',
        dayNumber: 4,
        category: 'health' as const,
        icon: 'medical',
        color: '#8B5CF6',
        sources: ['BMJ Respiratory Research', 'Toxicology Studies Institute'],
        productRelevant: true,
      },
    ],
    nicotine_pouches: [
      {
        id: 'pouch_day1',
        title: 'Oral Tissue Recovery Starts',
        content: 'Your gums and oral tissues are beginning to heal from nicotine irritation. Blood flow to your mouth is improving.',
        scientificBasis: 'Hellqvist et al. (2021) - Oral health effects of Swedish snus and nicotine pouches',
        actionableAdvice: 'Rinse with warm salt water to support healing and reduce any lingering irritation.',
        dayNumber: 1,
        category: 'health' as const,
        icon: 'medical',
        color: '#10B981',
        sources: ['Swedish Dental Journal', 'Oral Health Foundation'],
        productRelevant: true,
      },
      {
        id: 'pouch_day4',
        title: 'Gum Sensitivity Improving',
        content: 'The constant nicotine exposure that caused gum sensitivity is ending. Your oral pH is normalizing.',
        scientificBasis: 'Carlsson et al. (2017) - Oral mucosal changes in users of Swedish snus',
        actionableAdvice: 'You should notice less gum sensitivity when eating or drinking. Your taste buds are also recovering!',
        dayNumber: 4,
        category: 'health' as const,
        icon: 'happy',
        color: '#F59E0B',
        sources: ['Nordic Dental Research', 'International Oral Health Journal'],
        productRelevant: true,
      },
    ],
    chew_dip: [
      {
        id: 'chew_day1',
        title: 'Oral Cancer Risk Reduction Begins',
        content: 'Every hour without tobacco in your mouth reduces your oral cancer risk. Your mouth tissues start healing immediately.',
        scientificBasis: 'Wyss et al. (2016) - Smokeless tobacco use and oral cancer risk',
        actionableAdvice: 'Check your mouth regularly and celebrate that you\'re reducing your cancer risk with every passing hour.',
        dayNumber: 1,
        category: 'health' as const,
        icon: 'shield',
        color: '#EF4444',
        sources: ['Cancer Prevention Research', 'American Cancer Society'],
        productRelevant: true,
      },
      {
        id: 'chew_day4',
        title: 'Jaw Muscle Tension Releasing',
        content: 'The constant chewing motion that created jaw tension is ending. Your facial muscles are beginning to relax.',
        scientificBasis: 'TMJ Association research on tobacco cessation effects',
        actionableAdvice: 'Try gentle jaw massages and notice how your face feels more relaxed without constant chewing.',
        dayNumber: 4,
        category: 'health' as const,
        icon: 'happy',
        color: '#10B981',
        sources: ['TMJ Research Foundation', 'Oral Motor Function Studies'],
        productRelevant: true,
      },
    ],
    other: [
      {
        id: 'other_day1',
        title: 'Nicotine Clearance in Progress',
        content: 'Your body is actively eliminating nicotine from your system. Brain chemistry is beginning to rebalance.',
        scientificBasis: 'Hukkanen et al. (2005) - Metabolism and disposition kinetics of nicotine',
        actionableAdvice: 'Focus on staying hydrated and getting good sleep to support your body\'s natural detox process.',
        dayNumber: 1,
        category: 'health' as const,
        icon: 'water',
        color: '#06B6D4',
        sources: ['Pharmacological Reviews', 'Addiction Medicine Journal'],
        productRelevant: true,
      },
      {
        id: 'other_day4',
        title: 'Energy Levels Stabilizing',
        content: 'As nicotine withdrawal peaks and begins to subside, your natural energy levels are starting to emerge.',
        scientificBasis: 'Hughes (2007) - Effects of abstinence from tobacco',
        actionableAdvice: 'Notice your energy patterns throughout the day - they should be becoming more stable.',
        dayNumber: 4,
        category: 'health' as const,
        icon: 'flash',
        color: '#F59E0B',
        sources: ['Behavioral Medicine Research', 'Energy & Metabolism Journal'],
        productRelevant: true,
      },
    ],
  };

  const productTips = tipsByProduct[profile.productType] || tipsByProduct.other;
  
  // Find tips relevant to the current day or closest day
  const relevantTips = productTips.filter(tip => 
    tip.dayNumber <= dayNumber && tip.dayNumber >= dayNumber - 2
  );
  
  if (relevantTips.length === 0) {
    // Return the most recent tip if no exact match
    return productTips.slice(-1);
  }
  
  return relevantTips;
};

// Get personalized milestones based on user's product type
export const getPersonalizedMilestones = (daysClean: number): PersonalizedMilestone[] => {
  const profile = getUserPersonalizedProfile();
  
  const baseMilestones = [
    {
      id: 'first_day',
      title: 'First Day Champion',
      description: `24 hours without ${profile.personalizedUnitName}`,
      daysRequired: 1,
      achieved: daysClean >= 1,
      icon: 'trophy',
      color: '#F59E0B',
      celebrationMessage: 'You did it! The first day is often the hardest.',
      productRelevant: true,
    },
    {
      id: 'first_week',
      title: 'Weekly Warrior',
      description: `One full week ${profile.personalizedUnitName}-free`,
      daysRequired: 7,
      achieved: daysClean >= 7,
      icon: 'star',
      color: '#10B981',
      celebrationMessage: 'A week of freedom! You\'re building incredible strength.',
      productRelevant: true,
    },
    {
      id: 'first_month',
      title: 'Monthly Master',
      description: `30 days of ${profile.personalizedUnitName} freedom`,
      daysRequired: 30,
      achieved: daysClean >= 30,
      icon: 'medal',
      color: '#8B5CF6',
      celebrationMessage: 'One month! Your body has made remarkable progress.',
      productRelevant: true,
    },
  ];

  // Add product-specific milestones
  const productSpecificMilestones = {
    cigarettes: [
      {
        id: 'lung_recovery',
        title: 'Lung Recovery Milestone',
        description: 'Significant improvement in lung function',
        daysRequired: 14,
        achieved: daysClean >= 14,
        icon: 'fitness',
        color: '#06B6D4',
        celebrationMessage: 'Your lungs are noticeably healthier!',
        productRelevant: true,
      },
    ],
    nicotine_pouches: [
      {
        id: 'oral_health',
        title: 'Oral Health Victory',
        description: 'Gums and oral tissues fully healed',
        daysRequired: 21,
        achieved: daysClean >= 21,
        icon: 'happy',
        color: '#10B981',
        celebrationMessage: 'Your oral health is restored!',
        productRelevant: true,
      },
    ],
    vape: [
      {
        id: 'chemical_free',
        title: 'Chemical-Free Achievement',
        description: 'Vaping chemicals cleared from system',
        daysRequired: 10,
        achieved: daysClean >= 10,
        icon: 'shield',
        color: '#8B5CF6',
        celebrationMessage: 'Your body is free from vaping chemicals!',
        productRelevant: true,
      },
    ],
    chew_dip: [
      {
        id: 'cancer_risk',
        title: 'Cancer Risk Reduction',
        description: 'Significant reduction in oral cancer risk',
        daysRequired: 30,
        achieved: daysClean >= 30,
        icon: 'shield',
        color: '#EF4444',
        celebrationMessage: 'You\'ve dramatically reduced your cancer risk!',
        productRelevant: true,
      },
    ],
    other: [],
  };

  const productMilestones = productSpecificMilestones[profile.productType] || [];
  
  return [...baseMilestones, ...productMilestones].sort((a, b) => a.daysRequired - b.daysRequired);
}; 