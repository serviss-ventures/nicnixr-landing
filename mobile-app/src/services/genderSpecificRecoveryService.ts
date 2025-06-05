import { ProgressStats } from '../types';

export interface GenderSpecificBenefit {
  id: string;
  timeframe: string;
  title: string;
  description: string;
  scientificExplanation: string;
  icon: string;
  color: string;
  achieved: boolean;
  category: 'shared' | 'male' | 'female';
  daysRequired: number;
}

// Shared benefits for all users (regardless of gender)
const SHARED_BENEFITS: Omit<GenderSpecificBenefit, 'achieved'>[] = [
  {
    id: 'anxiety-reduction',
    timeframe: '2-4 Weeks',
    title: 'Reduced Anxiety & Panic',
    description: 'Your brain\'s stress response normalizes',
    scientificExplanation: 'Nicotine withdrawal anxiety peaks at 3 days and significantly improves by week 2-4 as GABA receptors rebalance',
    icon: 'happy',
    color: '#10B981',
    category: 'shared',
    daysRequired: 14,
  },
  {
    id: 'focus-improvement',
    timeframe: '1-2 Weeks',
    title: 'Better Focus & Concentration',
    description: 'Mental clarity returns as brain fog lifts',
    scientificExplanation: 'Dopamine receptors begin to normalize, improving cognitive function and attention span',
    icon: 'bulb',
    color: '#3B82F6',
    category: 'shared',
    daysRequired: 7,
  },
  {
    id: 'self-control',
    timeframe: '3-4 Weeks',
    title: 'Improved Self-Control',
    description: 'Breaking the addiction strengthens willpower',
    scientificExplanation: 'Prefrontal cortex function improves, enhancing executive decision-making and impulse control',
    icon: 'shield-checkmark',
    color: '#8B5CF6',
    category: 'shared',
    daysRequired: 21,
  },
  {
    id: 'sleep-quality',
    timeframe: '1-2 Weeks',
    title: 'Deeper, More Restful Sleep',
    description: 'Sleep cycles normalize without nicotine disruption',
    scientificExplanation: 'Nicotine is a stimulant that disrupts REM sleep. Without it, sleep architecture improves within days',
    icon: 'moon',
    color: '#6366F1',
    category: 'shared',
    daysRequired: 7,
  },
  {
    id: 'hypnic-jerks',
    timeframe: '1 Week',
    title: 'Fewer Hypnic Jerks',
    description: 'Those sudden muscle spasms when falling asleep decrease',
    scientificExplanation: 'Nicotine withdrawal can cause temporary muscle tension. This resolves as the nervous system calms',
    icon: 'body',
    color: '#EC4899',
    category: 'shared',
    daysRequired: 7,
  },
  {
    id: 'gut-health',
    timeframe: '2-8 Weeks',
    title: 'Better Gut Health',
    description: 'Digestive system recovers from nicotine\'s effects',
    scientificExplanation: 'Nicotine disrupts gut motility and microbiome. Recovery begins within weeks of cessation',
    icon: 'nutrition',
    color: '#14B8A6',
    category: 'shared',
    daysRequired: 14,
  },
];

// Male-specific benefits for nicotine pouches
const MALE_POUCH_BENEFITS: Omit<GenderSpecificBenefit, 'achieved'>[] = [
  {
    id: 'testosterone-stabilization',
    timeframe: '2-6 Months',
    title: 'Testosterone Levels Stabilize',
    description: 'Hormones return to healthy, natural levels',
    scientificExplanation: 'While nicotine may temporarily elevate testosterone, it disrupts normal hormonal cycles. Cessation allows for healthier, more stable testosterone production',
    icon: 'fitness',
    color: '#F59E0B',
    category: 'male',
    daysRequired: 60,
  },
  {
    id: 'erectile-function',
    timeframe: '3-6 Months',
    title: 'Improved Erectile Function',
    description: 'Better blood flow enhances sexual health',
    scientificExplanation: 'Nicotine constricts blood vessels throughout the body. Improved circulation after quitting enhances erectile function',
    icon: 'heart',
    color: '#EF4444',
    category: 'male',
    daysRequired: 90,
  },
  {
    id: 'sexual-satisfaction',
    timeframe: '1-3 Months',
    title: 'Enhanced Sexual Satisfaction',
    description: 'Increased sensitivity and pleasure',
    scientificExplanation: 'Improved blood flow and nerve function enhance sexual sensation and satisfaction',
    icon: 'star',
    color: '#F97316',
    category: 'male',
    daysRequired: 30,
  },
  {
    id: 'sperm-quality',
    timeframe: '3-6 Months',
    title: 'Better Sperm Quality',
    description: 'Improved fertility and reproductive health',
    scientificExplanation: 'Studies show nicotine users have 24% lower sperm counts. Quality improves significantly after 3-6 months nicotine-free',
    icon: 'trending-up',
    color: '#06B6D4',
    category: 'male',
    daysRequired: 90,
  },
  {
    id: 'muscle-recovery',
    timeframe: '2-4 Weeks',
    title: 'Faster Muscle Recovery',
    description: 'Better oxygen delivery to muscles',
    scientificExplanation: 'Improved circulation and oxygen delivery enhance muscle recovery and athletic performance',
    icon: 'barbell',
    color: '#10B981',
    category: 'male',
    daysRequired: 14,
  },
];

// Female-specific benefits for nicotine pouches
const FEMALE_POUCH_BENEFITS: Omit<GenderSpecificBenefit, 'achieved'>[] = [
  {
    id: 'hormone-balance',
    timeframe: '1-3 Cycles',
    title: 'Balanced Hormones',
    description: 'Estrogen and progesterone levels normalize',
    scientificExplanation: 'Nicotine disrupts estrogen metabolism and hormone production. Quitting allows natural hormone cycles to restore',
    icon: 'sync',
    color: '#EC4899',
    category: 'female',
    daysRequired: 30,
  },
  {
    id: 'easier-periods',
    timeframe: '2-4 Cycles',
    title: 'Easier, More Regular Periods',
    description: 'Less cramping and more predictable cycles',
    scientificExplanation: 'Nicotine constricts blood vessels and increases inflammation, worsening menstrual symptoms. These improve after quitting',
    icon: 'calendar',
    color: '#8B5CF6',
    category: 'female',
    daysRequired: 60,
  },
  {
    id: 'fertility-improvement',
    timeframe: '3-6 Months',
    title: 'Improved Fertility',
    description: 'Better egg quality and reproductive health',
    scientificExplanation: 'Nicotine reduces ovarian reserve and egg quality. Fertility markers improve within 3-6 months of quitting',
    icon: 'flower',
    color: '#10B981',
    category: 'female',
    daysRequired: 90,
  },
  {
    id: 'skin-health',
    timeframe: '4-12 Weeks',
    title: 'Radiant, Healthier Skin',
    description: 'Better collagen production and skin elasticity',
    scientificExplanation: 'Nicotine reduces collagen production and skin blood flow. Skin health visibly improves within weeks of quitting',
    icon: 'sparkles',
    color: '#F59E0B',
    category: 'female',
    daysRequired: 28,
  },
  {
    id: 'menopause-risk',
    timeframe: 'Long-term',
    title: 'Lower Early Menopause Risk',
    description: 'Protects long-term reproductive health',
    scientificExplanation: 'Nicotine use is associated with earlier menopause onset. Quitting helps preserve ovarian function',
    icon: 'shield',
    color: '#06B6D4',
    category: 'female',
    daysRequired: 365,
  },
  {
    id: 'bone-density',
    timeframe: '6-12 Months',
    title: 'Stronger Bones',
    description: 'Better calcium absorption and bone density',
    scientificExplanation: 'Nicotine interferes with calcium absorption and bone formation. Bone health improves after quitting',
    icon: 'body',
    color: '#14B8A6',
    category: 'female',
    daysRequired: 180,
  },
];

export function getGenderSpecificBenefits(
  productType: string,
  gender: string | undefined,
  stats: ProgressStats
): GenderSpecificBenefit[] {
  const benefits: GenderSpecificBenefit[] = [];
  
  console.log('🔍 Gender-Specific Benefits Debug:');
  console.log('- Product Type:', productType);
  console.log('- Gender:', gender);
  console.log('- Days Clean:', stats.daysClean);
  
  // Add shared benefits for all users
  SHARED_BENEFITS.forEach(benefit => {
    benefits.push({
      ...benefit,
      achieved: stats.daysClean >= benefit.daysRequired,
    });
  });
  
  console.log('- Shared benefits added:', SHARED_BENEFITS.length);
  
  // Add gender-specific benefits for nicotine pouches
  if (productType === 'pouches' || productType === 'nicotine_pouches') {
    console.log('- Product is pouches, checking gender...');
    if (gender === 'male') {
      console.log('- Adding male-specific benefits');
      MALE_POUCH_BENEFITS.forEach(benefit => {
        benefits.push({
          ...benefit,
          achieved: stats.daysClean >= benefit.daysRequired,
        });
      });
    } else if (gender === 'female') {
      console.log('- Adding female-specific benefits');
      FEMALE_POUCH_BENEFITS.forEach(benefit => {
        benefits.push({
          ...benefit,
          achieved: stats.daysClean >= benefit.daysRequired,
        });
      });
    } else {
      console.log('- Gender is neither male nor female:', gender);
    }
  } else {
    console.log('- Product type is not pouches:', productType);
  }
  
  console.log('- Total benefits:', benefits.length);
  
  // Sort benefits by days required (achieved first, then by timeline)
  return benefits.sort((a, b) => {
    if (a.achieved && !b.achieved) return -1;
    if (!a.achieved && b.achieved) return 1;
    return a.daysRequired - b.daysRequired;
  });
}

// Helper function to get a user-friendly explanation of benefits
export function getBenefitExplanation(benefit: GenderSpecificBenefit, stats: ProgressStats): string {
  if (benefit.achieved) {
    return `✓ ${benefit.scientificExplanation}`;
  }
  
  const daysRemaining = benefit.daysRequired - stats.daysClean;
  
  if (daysRemaining <= 7) {
    return `Coming soon! ${benefit.scientificExplanation}`;
  } else if (daysRemaining <= 30) {
    return `In ${Math.ceil(daysRemaining / 7)} weeks: ${benefit.scientificExplanation}`;
  } else {
    return `In ${Math.ceil(daysRemaining / 30)} months: ${benefit.scientificExplanation}`;
  }
} 