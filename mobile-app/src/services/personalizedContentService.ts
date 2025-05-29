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
  
  // Product-specific tip collections - extensive library for each product
  const tipsByProduct = {
    cigarettes: [
      // Week 1 tips
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
        id: 'cig_day3',
        title: 'Circulation is Rapidly Improving',
        content: 'Your heart rate and blood pressure are dropping to normal levels. Blood circulation to hands and feet is improving dramatically.',
        scientificBasis: 'Within 72 hours of quitting, nicotine is completely eliminated and circulation begins rapid improvement.',
        actionableAdvice: 'Notice warmth returning to your fingers and toes. Take a short walk to celebrate your improving circulation.',
        dayNumber: 3,
        category: 'health' as const,
        icon: 'heart',
        color: '#EF4444',
        sources: ['American Heart Association', 'Circulation Research Journal'],
        productRelevant: true,
      },
      {
        id: 'cig_day7',
        title: 'Cilia Recovery is Accelerating',
        content: 'The tiny hair-like structures in your lungs (cilia) are rapidly regenerating, improving your ability to clear mucus and debris.',
        scientificBasis: 'Tamashiro et al. (2009) - Cigarette smoke exposure and respiratory cilia recovery',
        actionableAdvice: 'You might experience some coughing as your lungs clear out tar and toxins - this is a good sign!',
        dayNumber: 7,
        category: 'health' as const,
        icon: 'fitness',
        color: '#10B981',
        sources: ['Journal of Respiratory Medicine', 'Lung Health Foundation'],
        productRelevant: true,
      },
      // Week 2-3 tips
      {
        id: 'cig_day14',
        title: 'Taste and Smell Fully Restored',
        content: 'Your taste buds and smell receptors have completely regenerated. Food tastes amazing and scents are vivid again.',
        scientificBasis: 'Sensory recovery typically completes within 2 weeks of smoking cessation.',
        actionableAdvice: 'Try a favorite meal today and savor how much better it tastes compared to when you smoked.',
        dayNumber: 14,
        category: 'health' as const,
        icon: 'restaurant',
        color: '#F59E0B',
        sources: ['Taste and Smell Clinic Research', 'Sensory Recovery Studies'],
        productRelevant: true,
      },
      {
        id: 'cig_day21',
        title: 'Lung Function Dramatically Improved',
        content: 'Your lung capacity has increased by up to 30%. Breathing is easier and you have more energy for physical activities.',
        scientificBasis: 'Significant lung function improvements occur within 2-4 weeks of smoking cessation.',
        actionableAdvice: 'Challenge yourself with stairs or a brisk walk. Notice how much easier breathing has become.',
        dayNumber: 21,
        category: 'health' as const,
        icon: 'fitness',
        color: '#10B981',
        sources: ['Pulmonary Function Research', 'Respiratory Recovery Studies'],
        productRelevant: true,
      },
      // Month+ tips
      {
        id: 'cig_day30',
        title: 'Heart Disease Risk Plummeting',
        content: 'Your risk of heart attack has already dropped significantly. Your cardiovascular system is healing rapidly.',
        scientificBasis: 'Heart disease risk begins dropping within 1 month and continues declining for years.',
        actionableAdvice: 'Celebrate this major health milestone! Your heart is thanking you every day.',
        dayNumber: 30,
        category: 'health' as const,
        icon: 'heart',
        color: '#EF4444',
        sources: ['Cardiology Research', 'Heart Disease Prevention Studies'],
        productRelevant: true,
      },
      {
        id: 'cig_day45',
        title: 'Immune System Supercharged',
        content: 'Your immune system is significantly stronger. You\'ll get sick less often and recover faster when you do.',
        scientificBasis: 'Immune function continues improving for months after smoking cessation.',
        actionableAdvice: 'Notice how you feel more resilient and energetic. Your body is protecting itself better.',
        dayNumber: 45,
        category: 'health' as const,
        icon: 'shield-checkmark',
        color: '#10B981',
        sources: ['Immunology Research', 'Public Health Studies'],
        productRelevant: true,
      },
      {
        id: 'cig_day60',
        title: 'Skin Glowing with Health',
        content: 'Improved blood flow and oxygen delivery have given your skin a healthy, vibrant appearance. Wrinkles are less pronounced.',
        scientificBasis: 'Skin health improvements from increased circulation and collagen production.',
        actionableAdvice: 'Look in the mirror and appreciate your healthier, more radiant complexion.',
        dayNumber: 60,
        category: 'health' as const,
        icon: 'sunny',
        color: '#F59E0B',
        sources: ['Dermatology Research', 'Skin Health Studies'],
        productRelevant: true,
      },
      {
        id: 'cig_day90',
        title: 'Cancer Risk Dramatically Reduced',
        content: 'Your risk of lung cancer and other smoking-related cancers has already decreased significantly and continues dropping.',
        scientificBasis: 'Cancer risk reduction begins early and accelerates over time after smoking cessation.',
        actionableAdvice: 'Take pride in this major health achievement. Every day smoke-free reduces your cancer risk further.',
        dayNumber: 90,
        category: 'health' as const,
        icon: 'shield',
        color: '#10B981',
        sources: ['Cancer Prevention Research', 'Oncology Studies'],
        productRelevant: true,
      },
    ],
    
    vape: [
      // Week 1 tips
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
        id: 'vape_day3',
        title: 'Nicotine Completely Gone',
        content: 'All nicotine has been eliminated from your system. Your brain is beginning to rebalance its natural chemistry.',
        scientificBasis: 'Nicotine elimination occurs within 72 hours, allowing natural neurotransmitter recovery.',
        actionableAdvice: 'Notice improved sleep quality and more stable energy levels throughout the day.',
        dayNumber: 3,
        category: 'neuroplasticity' as const,
        icon: 'flash',
        color: '#8B5CF6',
        sources: ['Neuroscience Research', 'Addiction Medicine'],
        productRelevant: true,
      },
      {
        id: 'vape_day7',
        title: 'Throat and Lung Irritation Decreasing',
        content: 'The propylene glycol and vegetable glycerin that caused throat irritation are clearing from your system.',
        scientificBasis: 'Gotts et al. (2019) - What are the respiratory effects of e-cigarettes?',
        actionableAdvice: 'Notice how your throat feels less dry and irritated, especially in the morning.',
        dayNumber: 7,
        category: 'health' as const,
        icon: 'medical',
        color: '#8B5CF6',
        sources: ['BMJ Respiratory Research', 'Toxicology Studies Institute'],
        productRelevant: true,
      },
      // Week 2-3 tips
      {
        id: 'vape_day14',
        title: 'Lung Inflammation Resolving',
        content: 'Inflammatory markers in your lungs are returning to normal. Your respiratory system is healing from chemical exposure.',
        scientificBasis: 'Lung inflammation from vaping chemicals resolves within 2-3 weeks of cessation.',
        actionableAdvice: 'Take deeper breaths and notice improved lung capacity and comfort.',
        dayNumber: 14,
        category: 'health' as const,
        icon: 'fitness',
        color: '#10B981',
        sources: ['Pulmonary Research', 'Inflammation Studies'],
        productRelevant: true,
      },
      {
        id: 'vape_day21',
        title: 'Brain Fog Lifting',
        content: 'Mental clarity is improving as your brain adapts to functioning without artificial stimulation from nicotine.',
        scientificBasis: 'Cognitive function improves as the brain recovers from chronic nicotine exposure.',
        actionableAdvice: 'Notice improved focus, memory, and decision-making abilities.',
        dayNumber: 21,
        category: 'neuroplasticity' as const,
        icon: 'bulb',
        color: '#8B5CF6',
        sources: ['Cognitive Research', 'Neuroplasticity Studies'],
        productRelevant: true,
      },
      // Month+ tips
      {
        id: 'vape_day30',
        title: 'Respiratory Recovery Complete',
        content: 'Your lungs have cleared most vaping chemicals and respiratory function has largely normalized.',
        scientificBasis: 'Most respiratory recovery from vaping occurs within the first month.',
        actionableAdvice: 'Celebrate your breathing being easier and more comfortable than in months.',
        dayNumber: 30,
        category: 'health' as const,
        icon: 'fitness',
        color: '#10B981',
        sources: ['Respiratory Medicine', 'Vaping Recovery Research'],
        productRelevant: true,
      },
      {
        id: 'vape_day45',
        title: 'Cardiovascular Health Restored',
        content: 'Your heart rate variability and blood pressure have normalized. Cardiovascular stress from vaping has resolved.',
        scientificBasis: 'Cardiovascular effects of vaping resolve within 6-8 weeks of cessation.',
        actionableAdvice: 'Notice improved energy levels and exercise tolerance.',
        dayNumber: 45,
        category: 'health' as const,
        icon: 'heart',
        color: '#EF4444',
        sources: ['Cardiology Research', 'Vaping Health Studies'],
        productRelevant: true,
      },
      {
        id: 'vape_day60',
        title: 'Sleep Quality Optimized',
        content: 'Without nicotine disruption, your sleep cycles have fully normalized. REM sleep and deep sleep are optimal.',
        scientificBasis: 'Sleep architecture fully recovers within 2 months of nicotine cessation.',
        actionableAdvice: 'Appreciate waking up more refreshed and having consistent energy all day.',
        dayNumber: 60,
        category: 'health' as const,
        icon: 'moon',
        color: '#06B6D4',
        sources: ['Sleep Medicine', 'Circadian Rhythm Research'],
        productRelevant: true,
      },
      {
        id: 'vape_day90',
        title: 'Addiction Pathways Rewired',
        content: 'Your brain has formed new, healthy neural pathways. The old addiction circuits are weakened and dormant.',
        scientificBasis: 'Neuroplasticity allows complete rewiring of addiction pathways over 3 months.',
        actionableAdvice: 'Recognize how much stronger and more resilient you\'ve become mentally.',
        dayNumber: 90,
        category: 'neuroplasticity' as const,
        icon: 'flash',
        color: '#8B5CF6',
        sources: ['Neuroscience Research', 'Addiction Recovery Studies'],
        productRelevant: true,
      },
    ],
    
    nicotine_pouches: [
      // Week 1 tips
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
        id: 'pouch_day3',
        title: 'Gum Sensitivity Decreasing',
        content: 'The irritation and sensitivity in your gums from constant nicotine exposure is already improving.',
        scientificBasis: 'Oral tissue recovery begins within 72 hours of nicotine pouch cessation.',
        actionableAdvice: 'Notice less discomfort when eating or drinking hot/cold items.',
        dayNumber: 3,
        category: 'health' as const,
        icon: 'happy',
        color: '#F59E0B',
        sources: ['Dental Research', 'Oral Medicine Studies'],
        productRelevant: true,
      },
      {
        id: 'pouch_day7',
        title: 'Oral pH Normalizing',
        content: 'The constant nicotine exposure that disrupted your mouth\'s pH balance is ending. Your oral environment is stabilizing.',
        scientificBasis: 'Carlsson et al. (2017) - Oral mucosal changes in users of Swedish snus',
        actionableAdvice: 'Your taste buds are recovering! Try foods that taste better than they have in months.',
        dayNumber: 7,
        category: 'health' as const,
        icon: 'happy',
        color: '#F59E0B',
        sources: ['Nordic Dental Research', 'International Oral Health Journal'],
        productRelevant: true,
      },
      // Week 2-3 tips
      {
        id: 'pouch_day14',
        title: 'Taste Sensation Fully Restored',
        content: 'Your taste buds have completely recovered from nicotine suppression. Food tastes vibrant and complex again.',
        scientificBasis: 'Taste bud recovery occurs within 2 weeks of stopping nicotine pouches.',
        actionableAdvice: 'Explore new flavors and enjoy how much better your favorite foods taste.',
        dayNumber: 14,
        category: 'health' as const,
        icon: 'restaurant',
        color: '#F59E0B',
        sources: ['Taste Research Institute', 'Sensory Recovery Studies'],
        productRelevant: true,
      },
      {
        id: 'pouch_day21',
        title: 'Gum Health Fully Restored',
        content: 'Your gums have healed completely. They\'re pinker, healthier, and no longer irritated from nicotine exposure.',
        scientificBasis: 'Complete gum tissue recovery typically occurs within 3 weeks.',
        actionableAdvice: 'Smile in the mirror and appreciate your healthier, more vibrant gums.',
        dayNumber: 21,
        category: 'health' as const,
        icon: 'happy',
        color: '#10B981',
        sources: ['Periodontal Research', 'Gum Health Studies'],
        productRelevant: true,
      },
      // Month+ tips
      {
        id: 'pouch_day30',
        title: 'Oral Cancer Risk Eliminated',
        content: 'Your risk of oral cancers from nicotine pouch use has dropped dramatically and continues decreasing.',
        scientificBasis: 'Oral cancer risk reduces rapidly after stopping all nicotine products.',
        actionableAdvice: 'Celebrate protecting your long-term oral health with this important decision.',
        dayNumber: 30,
        category: 'health' as const,
        icon: 'shield',
        color: '#10B981',
        sources: ['Cancer Prevention Research', 'Oral Cancer Studies'],
        productRelevant: true,
      },
      {
        id: 'pouch_day45',
        title: 'Oral Microbiome Balanced',
        content: 'The healthy bacteria in your mouth have rebalanced, improving overall oral health and fresh breath.',
        scientificBasis: 'Oral microbiome recovery occurs 6-8 weeks after stopping nicotine products.',
        actionableAdvice: 'Notice fresher breath and overall improved oral comfort throughout the day.',
        dayNumber: 45,
        category: 'health' as const,
        icon: 'happy',
        color: '#10B981',
        sources: ['Microbiome Research', 'Oral Health Studies'],
        productRelevant: true,
      },
      {
        id: 'pouch_day60',
        title: 'Jaw Tension Completely Released',
        content: 'Your jaw muscles have relaxed from the constant positioning required for pouch use. Facial tension is gone.',
        scientificBasis: 'Muscular tension patterns resolve within 2 months of habit cessation.',
        actionableAdvice: 'Notice how much more relaxed your face and jaw feel throughout the day.',
        dayNumber: 60,
        category: 'health' as const,
        icon: 'happy',
        color: '#10B981',
        sources: ['TMJ Research', 'Muscular Recovery Studies'],
        productRelevant: true,
      },
      {
        id: 'pouch_day90',
        title: 'Oral Health Optimized',
        content: 'Your entire oral cavity is healthier than it\'s been in years. Teeth, gums, and tissues are in optimal condition.',
        scientificBasis: 'Complete oral health recovery occurs within 3 months of nicotine cessation.',
        actionableAdvice: 'Your dentist will notice the dramatic improvement in your oral health!',
        dayNumber: 90,
        category: 'health' as const,
        icon: 'happy',
        color: '#10B981',
        sources: ['Dental Health Research', 'Long-term Recovery Studies'],
        productRelevant: true,
      },
    ],
    
    chew_dip: [
      // Week 1 tips
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
        id: 'chew_day3',
        title: 'Mouth Sores Beginning to Heal',
        content: 'Any irritation or sores in your mouth from tobacco use are starting to heal and feel more comfortable.',
        scientificBasis: 'Oral tissue healing begins within 72 hours of stopping tobacco use.',
        actionableAdvice: 'Rinse with salt water to support healing and notice reduced discomfort when eating.',
        dayNumber: 3,
        category: 'health' as const,
        icon: 'medical',
        color: '#10B981',
        sources: ['Oral Medicine Research', 'Tissue Healing Studies'],
        productRelevant: true,
      },
      {
        id: 'chew_day7',
        title: 'Jaw Muscle Tension Releasing',
        content: 'The constant chewing motion that created jaw tension is ending. Your facial muscles are beginning to relax.',
        scientificBasis: 'TMJ Association research on tobacco cessation effects',
        actionableAdvice: 'Try gentle jaw massages and notice how your face feels more relaxed without constant chewing.',
        dayNumber: 7,
        category: 'health' as const,
        icon: 'happy',
        color: '#10B981',
        sources: ['TMJ Research Foundation', 'Oral Motor Function Studies'],
        productRelevant: true,
      },
      // Week 2-3 tips
      {
        id: 'chew_day14',
        title: 'Taste Buds Recovering',
        content: 'Your taste buds, dulled by constant tobacco exposure, are regenerating and becoming more sensitive.',
        scientificBasis: 'Taste recovery occurs within 2 weeks of stopping smokeless tobacco.',
        actionableAdvice: 'Try your favorite foods again and notice how much better they taste.',
        dayNumber: 14,
        category: 'health' as const,
        icon: 'restaurant',
        color: '#F59E0B',
        sources: ['Sensory Research', 'Taste Recovery Studies'],
        productRelevant: true,
      },
      {
        id: 'chew_day21',
        title: 'Gum Recession Stabilizing',
        content: 'Gum recession from tobacco use has stopped progressing. Your gums are beginning to heal and strengthen.',
        scientificBasis: 'Periodontal healing begins within 3 weeks of tobacco cessation.',
        actionableAdvice: 'Maintain excellent oral hygiene to support your gums\' healing process.',
        dayNumber: 21,
        category: 'health' as const,
        icon: 'happy',
        color: '#10B981',
        sources: ['Periodontal Research', 'Gum Health Studies'],
        productRelevant: true,
      },
      // Month+ tips
      {
        id: 'chew_day30',
        title: 'Oral Cancer Risk Dramatically Reduced',
        content: 'Your risk of oral, throat, and esophageal cancers has already decreased significantly.',
        scientificBasis: 'Cancer risk reduction accelerates after the first month of tobacco cessation.',
        actionableAdvice: 'Celebrate this major health milestone - you\'ve dramatically improved your long-term health outlook.',
        dayNumber: 30,
        category: 'health' as const,
        icon: 'shield',
        color: '#10B981',
        sources: ['Cancer Prevention Research', 'Long-term Health Studies'],
        productRelevant: true,
      },
      {
        id: 'chew_day45',
        title: 'Teeth Staining Fading',
        content: 'The brown staining on your teeth from tobacco is beginning to fade. Your smile is becoming brighter.',
        scientificBasis: 'Tobacco staining gradually fades with good oral hygiene after cessation.',
        actionableAdvice: 'Consider professional dental cleaning to accelerate the whitening process.',
        dayNumber: 45,
        category: 'health' as const,
        icon: 'happy',
        color: '#F59E0B',
        sources: ['Dental Cosmetics Research', 'Oral Health Studies'],
        productRelevant: true,
      },
      {
        id: 'chew_day60',
        title: 'Bad Breath Eliminated',
        content: 'The persistent bad breath from tobacco use is completely gone. Your breath is fresh and clean.',
        scientificBasis: 'Halitosis from tobacco resolves completely within 2 months of cessation.',
        actionableAdvice: 'Enjoy confidence in close conversations without worrying about tobacco breath.',
        dayNumber: 60,
        category: 'health' as const,
        icon: 'happy',
        color: '#10B981',
        sources: ['Oral Health Research', 'Halitosis Studies'],
        productRelevant: true,
      },
      {
        id: 'chew_day90',
        title: 'Oral Health Transformation Complete',
        content: 'Your mouth is healthier than it\'s been in years. Gums, teeth, and tissues have recovered remarkably.',
        scientificBasis: 'Complete oral health recovery typically occurs within 3 months.',
        actionableAdvice: 'Schedule a dental checkup to document your amazing oral health transformation.',
        dayNumber: 90,
        category: 'health' as const,
        icon: 'happy',
        color: '#10B981',
        sources: ['Comprehensive Oral Health Studies', 'Recovery Research'],
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
        id: 'other_day7',
        title: 'Energy Levels Stabilizing',
        content: 'As nicotine withdrawal peaks and begins to subside, your natural energy levels are starting to emerge.',
        scientificBasis: 'Hughes (2007) - Effects of abstinence from tobacco',
        actionableAdvice: 'Notice your energy patterns throughout the day - they should be becoming more stable.',
        dayNumber: 7,
        category: 'health' as const,
        icon: 'flash',
        color: '#F59E0B',
        sources: ['Behavioral Medicine Research', 'Energy & Metabolism Journal'],
        productRelevant: true,
      },
      {
        id: 'other_day30',
        title: 'Brain Chemistry Rebalanced',
        content: 'Your brain has adapted to functioning without nicotine. Natural neurotransmitter production is optimized.',
        scientificBasis: 'Neuroplasticity allows complete brain chemistry rebalancing within a month.',
        actionableAdvice: 'Notice improved mood stability, focus, and overall mental clarity.',
        dayNumber: 30,
        category: 'neuroplasticity' as const,
        icon: 'flash',
        color: '#8B5CF6',
        sources: ['Neuroscience Research', 'Brain Recovery Studies'],
        productRelevant: true,
      },
    ],
  };

  const productTips = tipsByProduct[profile.productType] || tipsByProduct.other;
  
  // Smart tip selection algorithm
  if (dayNumber <= 90) {
    // For the first 90 days, find the most appropriate tip for current stage
    const exactMatch = productTips.find(tip => tip.dayNumber === dayNumber);
    if (exactMatch) return [exactMatch];
    
    // Find the closest previous tip (within reasonable range)
    const applicableTips = productTips.filter(tip => 
      tip.dayNumber <= dayNumber && tip.dayNumber >= Math.max(1, dayNumber - 7)
    );
    
    if (applicableTips.length > 0) {
      // Return the most recent applicable tip
      const sortedTips = applicableTips.sort((a, b) => b.dayNumber - a.dayNumber);
      return [sortedTips[0]];
    }
    
    // If no recent tip, find the most appropriate tip for this stage
    if (dayNumber <= 7) {
      return productTips.filter(tip => tip.dayNumber <= 7).slice(-1);
    } else if (dayNumber <= 30) {
      return productTips.filter(tip => tip.dayNumber <= 30).slice(-1);
    } else {
      return productTips.filter(tip => tip.dayNumber <= 90).slice(-1);
    }
  } else {
    // For long-term users (90+ days), create a smart rotation system
    // Use all available tips in a varied pattern to prevent repetition
    const allTips = productTips;
    
    // Create a deterministic but varied selection based on day number
    // This ensures users don't get the same tip every day, but it's consistent
    const rotationIndex = (dayNumber - 91) % allTips.length;
    
    // Add some variation by shifting the index based on week
    const weekNumber = Math.floor((dayNumber - 91) / 7);
    const adjustedIndex = (rotationIndex + weekNumber * 3) % allTips.length;
    
    const selectedTip = { ...allTips[adjustedIndex] };
    
    // Update the tip to reflect long-term recovery
    selectedTip.title = `${selectedTip.title} - Long-term Benefits`;
    selectedTip.content = `Continuing your journey: ${selectedTip.content} These benefits are now permanent parts of your healthy lifestyle.`;
    selectedTip.dayNumber = dayNumber;
    
    return [selectedTip];
  }
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