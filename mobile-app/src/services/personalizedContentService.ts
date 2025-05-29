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

export interface PersonalizedDailyTip {
  id: string;
  title: string;
  content: string;
  scientificBasis: string;
  actionableAdvice: string;
  relevantDays: number[];
  category: 'neuroplasticity' | 'health' | 'psychology' | 'practical' | 'motivation';
  icon: string;
  color: string;
  sources?: string[];
  dayNumber?: number;
  productRelevant: boolean;
}

/**
 * Get the user's personalized content profile based on their onboarding data
 */
export const getUserPersonalizedProfile = (): PersonalizedContent => {
  const state = store.getState();
  const onboarding = selectOnboarding(state);
  const stepData = onboarding.stepData;
  
  const productId = stepData.nicotineProduct?.id || 'other';
  const productCategory = stepData.nicotineProduct?.category || 'other';
  const dailyAmount = stepData.dailyAmount || 1;
  
  console.log('🎯 Getting personalized profile for:', {
    productId,
    productCategory,
    dailyAmount
  });

  // Map product ID to standardized type
  let productType: NicotineProductType = 'other';
  let personalizedUnitName = 'units';
  let relevantHealthBenefits: string[] = [];
  let specificWithdrawalSymptoms: string[] = [];
  let costSavingsMultiplier = 1;

  switch (productId) {
    case 'cigarettes':
      productType = 'cigarettes';
      personalizedUnitName = dailyAmount === 1 ? 'cigarette' : 'cigarettes';
      relevantHealthBenefits = [
        'Lung function improvement',
        'Reduced tar and carbon monoxide',
        'Better circulation',
        'Improved taste and smell',
        'Reduced cancer risk',
        'Better breathing'
      ];
      specificWithdrawalSymptoms = [
        'Lung congestion and coughing',
        'Shortness of breath',
        'Chest tightness',
        'Fatigue from poor oxygen levels'
      ];
      costSavingsMultiplier = 1.5; // Cigarettes are typically most expensive
      break;

    case 'vape':
      productType = 'vape';
      personalizedUnitName = dailyAmount === 1 ? 'pod' : 'pods';
      relevantHealthBenefits = [
        'Lung irritation reduction',
        'Better breathing',
        'Reduced artificial chemical exposure',
        'Improved circulation',
        'Better taste and smell',
        'Reduced dependency on devices'
      ];
      specificWithdrawalSymptoms = [
        'Throat irritation',
        'Mild breathing changes',
        'Habit disruption (hand-to-mouth)',
        'Device dependency anxiety'
      ];
      costSavingsMultiplier = 1.2;
      break;

    case 'zyn':
      productType = 'nicotine_pouches';
      personalizedUnitName = dailyAmount === 1 ? 'pouch' : 'pouches';
      relevantHealthBenefits = [
        'Oral health improvement',
        'Reduced gum irritation',
        'Better taste sensitivity',
        'Elimination of artificial chemicals',
        'Improved oral hygiene',
        'Freedom from constant dosing'
      ];
      specificWithdrawalSymptoms = [
        'Oral fixation habits',
        'Mouth feel changes',
        'Frequent dosing withdrawal',
        'Habit disruption throughout day'
      ];
      costSavingsMultiplier = 1.0;
      break;

    case 'chewing':
      productType = 'chew_dip';
      personalizedUnitName = 'cans per week';
      relevantHealthBenefits = [
        'Oral health improvement',
        'Reduced oral cancer risk',
        'Better gum health',
        'Improved taste',
        'Elimination of spitting',
        'Better dental health'
      ];
      specificWithdrawalSymptoms = [
        'Oral fixation needs',
        'Spitting habit disruption',
        'Mouth feel changes',
        'Jaw tension changes'
      ];
      costSavingsMultiplier = 1.1;
      break;

    default:
      productType = 'other';
      personalizedUnitName = 'units';
      relevantHealthBenefits = [
        'Reduced nicotine dependency',
        'Better overall health',
        'Improved circulation',
        'Enhanced well-being',
        'Freedom from substances'
      ];
      specificWithdrawalSymptoms = [
        'General withdrawal symptoms',
        'Habit disruption',
        'Cravings',
        'Mood changes'
      ];
      costSavingsMultiplier = 1.0;
      break;
  }

  return {
    productType,
    productCategory,
    dailyAmount,
    personalizedUnitName,
    relevantHealthBenefits,
    specificWithdrawalSymptoms,
    costSavingsMultiplier
  };
};

/**
 * Get personalized milestones based on user's nicotine product type
 */
export const getPersonalizedMilestones = (daysClean: number): PersonalizedMilestone[] => {
  const profile = getUserPersonalizedProfile();
  const { productType } = profile;

  console.log('🏆 Getting personalized milestones for:', productType);

  const baseMilestones: PersonalizedMilestone[] = [
    {
      id: '1day',
      title: 'First Day Champion',
      description: 'Nicotine starts leaving your system',
      daysRequired: 1,
      achieved: daysClean >= 1,
      icon: 'time-outline',
      color: '#10B981',
      celebrationMessage: 'Your body begins healing immediately!',
      productRelevant: true
    },
    {
      id: '3days',
      title: 'Nicotine-Free Zone',
      description: '100% nicotine eliminated from body',
      daysRequired: 3,
      achieved: daysClean >= 3,
      icon: 'checkmark-circle',
      color: '#06B6D4',
      celebrationMessage: 'Your body is completely nicotine-free!',
      productRelevant: true
    },
    {
      id: '1week',
      title: 'Recovery Champion',
      description: 'New neural pathways forming rapidly',
      daysRequired: 7,
      achieved: daysClean >= 7,
      icon: 'pulse-outline',
      color: '#10B981',
      celebrationMessage: 'Your brain is rewiring for freedom!',
      productRelevant: true
    }
  ];

  // Add product-specific milestones
  switch (productType) {
    case 'cigarettes':
      baseMilestones.push(
        {
          id: '2weeks_lungs',
          title: 'Breathing Champion',
          description: 'Lung function dramatically improved',
          daysRequired: 14,
          achieved: daysClean >= 14,
          icon: 'leaf-outline',
          color: '#10B981',
          celebrationMessage: 'Your lungs are clearing and healing!',
          productRelevant: true
        },
        {
          id: '1month_circulation',
          title: 'Circulation Master',
          description: 'Heart disease risk already declining',
          daysRequired: 30,
          achieved: daysClean >= 30,
          icon: 'heart-outline',
          color: '#EF4444',
          celebrationMessage: 'Your heart is thanking you!',
          productRelevant: true
        },
        {
          id: '3months_lung_recovery',
          title: 'Lung Recovery Master',
          description: 'Lung function increased by up to 30%',
          daysRequired: 90,
          achieved: daysClean >= 90,
          icon: 'fitness-outline',
          color: '#10B981',
          celebrationMessage: 'Breathing freely like never before!',
          productRelevant: true
        },
        {
          id: '1year_heart_health',
          title: 'Heart Health Hero',
          description: 'Heart disease risk cut in half',
          daysRequired: 365,
          achieved: daysClean >= 365,
          icon: 'trophy-outline',
          color: '#F59E0B',
          celebrationMessage: 'Your heart health is restored!',
          productRelevant: true
        }
      );
      break;

    case 'vape':
      baseMilestones.push(
        {
          id: '2weeks_breathing',
          title: 'Clear Airways Champion',
          description: 'Reduced lung irritation and better breathing',
          daysRequired: 14,
          achieved: daysClean >= 14,
          icon: 'leaf-outline',
          color: '#10B981',
          celebrationMessage: 'Your airways are clear and healthy!',
          productRelevant: true
        },
        {
          id: '1month_chemical_free',
          title: 'Chemical-Free Champion',
          description: 'All artificial vaping chemicals eliminated',
          daysRequired: 30,
          achieved: daysClean >= 30,
          icon: 'shield-checkmark-outline',
          color: '#06B6D4',
          celebrationMessage: 'Your body is free from artificial chemicals!',
          productRelevant: true
        },
        {
          id: '3months_lung_repair',
          title: 'Lung Repair Master',
          description: 'Lung irritation completely healed',
          daysRequired: 90,
          achieved: daysClean >= 90,
          icon: 'fitness-outline',
          color: '#10B981',
          celebrationMessage: 'Your lungs have fully recovered!',
          productRelevant: true
        },
        {
          id: '1year_device_free',
          title: 'Freedom Legend',
          description: 'Complete independence from vaping devices',
          daysRequired: 365,
          achieved: daysClean >= 365,
          icon: 'trophy-outline',
          color: '#F59E0B',
          celebrationMessage: 'You are completely device-free!',
          productRelevant: true
        }
      );
      break;

    case 'nicotine_pouches':
      baseMilestones.push(
        {
          id: '2weeks_oral_health',
          title: 'Oral Health Champion',
          description: 'Gum irritation completely healed',
          daysRequired: 14,
          achieved: daysClean >= 14,
          icon: 'happy-outline',
          color: '#10B981',
          celebrationMessage: 'Your mouth feels fresh and healthy!',
          productRelevant: true
        },
        {
          id: '1month_taste_master',
          title: 'Taste Sensation Master',
          description: 'Full taste sensitivity restored',
          daysRequired: 30,
          achieved: daysClean >= 30,
          icon: 'restaurant-outline',
          color: '#F59E0B',
          celebrationMessage: 'Food tastes amazing again!',
          productRelevant: true
        },
        {
          id: '3months_habit_breaker',
          title: 'Habit Freedom Master',
          description: 'Complete freedom from frequent dosing',
          daysRequired: 90,
          achieved: daysClean >= 90,
          icon: 'checkmark-done-outline',
          color: '#06B6D4',
          celebrationMessage: 'You\'ve broken the constant dosing cycle!',
          productRelevant: true
        },
        {
          id: '1year_oral_legend',
          title: 'Oral Health Legend',
          description: 'Optimal oral health fully restored',
          daysRequired: 365,
          achieved: daysClean >= 365,
          icon: 'trophy-outline',
          color: '#F59E0B',
          celebrationMessage: 'Your oral health is perfect!',
          productRelevant: true
        }
      );
      break;

    case 'chew_dip':
      baseMilestones.push(
        {
          id: '2weeks_gum_health',
          title: 'Gum Health Champion',
          description: 'Gum inflammation significantly reduced',
          daysRequired: 14,
          achieved: daysClean >= 14,
          icon: 'happy-outline',
          color: '#10B981',
          celebrationMessage: 'Your gums are healing beautifully!',
          productRelevant: true
        },
        {
          id: '1month_oral_recovery',
          title: 'Oral Recovery Master',
          description: 'Oral tissues completely healed',
          daysRequired: 30,
          achieved: daysClean >= 30,
          icon: 'shield-checkmark-outline',
          color: '#06B6D4',
          celebrationMessage: 'Your mouth is completely healthy!',
          productRelevant: true
        },
        {
          id: '3months_cancer_risk',
          title: 'Cancer Risk Reducer',
          description: 'Oral cancer risk significantly decreased',
          daysRequired: 90,
          achieved: daysClean >= 90,
          icon: 'shield-outline',
          color: '#EF4444',
          celebrationMessage: 'You\'ve dramatically reduced your cancer risk!',
          productRelevant: true
        },
        {
          id: '1year_dental_legend',
          title: 'Dental Health Legend',
          description: 'Optimal dental and oral health achieved',
          daysRequired: 365,
          achieved: daysClean >= 365,
          icon: 'trophy-outline',
          color: '#F59E0B',
          celebrationMessage: 'Your dental health is amazing!',
          productRelevant: true
        }
      );
      break;

    default:
      baseMilestones.push(
        {
          id: '1month_general',
          title: 'Recovery Master',
          description: 'Significant health improvements achieved',
          daysRequired: 30,
          achieved: daysClean >= 30,
          icon: 'fitness-outline',
          color: '#06B6D4',
          celebrationMessage: 'Your health is dramatically improved!',
          productRelevant: true
        },
        {
          id: '3months_freedom',
          title: 'Freedom Champion',
          description: 'Complete independence from nicotine',
          daysRequired: 90,
          achieved: daysClean >= 90,
          icon: 'checkmark-done-outline',
          color: '#10B981',
          celebrationMessage: 'You are completely free!',
          productRelevant: true
        },
        {
          id: '1year_legend',
          title: 'Freedom Legend',
          description: 'One year of complete freedom',
          daysRequired: 365,
          achieved: daysClean >= 365,
          icon: 'trophy-outline',
          color: '#F59E0B',
          celebrationMessage: 'You are a true freedom legend!',
          productRelevant: true
        }
      );
      break;
  }

  return baseMilestones.sort((a, b) => a.daysRequired - b.daysRequired);
};

/**
 * Get the personalized unit name for displaying progress
 */
export const getPersonalizedUnitName = (amount?: number): string => {
  const profile = getUserPersonalizedProfile();
  const actualAmount = amount || profile.dailyAmount;
  
  if (actualAmount === 1) {
    switch (profile.productType) {
      case 'cigarettes': return 'cigarette';
      case 'vape': return 'pod';
      case 'nicotine_pouches': return 'pouch';
      default: return 'unit';
    }
  } else {
    switch (profile.productType) {
      case 'cigarettes': return 'cigarettes';
      case 'vape': return 'pods';
      case 'nicotine_pouches': return 'pouches';
      case 'chew_dip': return 'cans/week';
      default: return 'units';
    }
  }
};

/**
 * Check if user has completed onboarding and has product data
 */
export const hasPersonalizedData = (): boolean => {
  const state = store.getState();
  const onboarding = selectOnboarding(state);
  return !!(onboarding.stepData.nicotineProduct && onboarding.stepData.dailyAmount);
};

export default {
  getUserPersonalizedProfile,
  getPersonalizedMilestones,
  getPersonalizedUnitName,
  hasPersonalizedData
}; 