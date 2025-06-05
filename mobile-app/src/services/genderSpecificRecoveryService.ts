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
    id: 'gum-health',
    timeframe: '4-8 Weeks',
    title: 'Healthier Gums',
    description: 'Oral tissue heals from pouch irritation',
    scientificExplanation: 'Nicotine pouches can cause gum recession and irritation. Tissue regeneration begins within weeks',
    icon: 'happy',
    color: '#EC4899',
    category: 'shared',
    daysRequired: 28,
  },
  {
    id: 'energy-levels',
    timeframe: '4-8 Weeks',
    title: 'Natural Energy Returns',
    description: 'No more nicotine crashes',
    scientificExplanation: 'Without nicotine\'s artificial stimulation, your body\'s natural energy regulation improves dramatically',
    icon: 'flash',
    color: '#F59E0B',
    category: 'shared',
    daysRequired: 30,
  },
  {
    id: 'immune-boost',
    timeframe: '8-12 Weeks',
    title: 'Stronger Immune System',
    description: 'Better resistance to illness',
    scientificExplanation: 'Nicotine suppresses immune function. White blood cell counts normalize and immune response improves',
    icon: 'shield',
    color: '#10B981',
    category: 'shared',
    daysRequired: 60,
  },
  {
    id: 'heart-health',
    timeframe: '12 Weeks',
    title: 'Stronger Heart',
    description: 'Cardiovascular system recovers',
    scientificExplanation: 'Heart rate variability improves and blood pressure normalizes as nicotine\'s effects on the cardiovascular system reverse',
    icon: 'heart',
    color: '#EF4444',
    category: 'shared',
    daysRequired: 90,
  },
  {
    id: 'addiction-freedom',
    timeframe: '26 Weeks',
    title: 'Freedom from Addiction',
    description: 'Cravings become rare',
    scientificExplanation: 'Neural pathways have largely rewired. The psychological habit has been broken and physical dependence eliminated',
    icon: 'ribbon',
    color: '#8B5CF6',
    category: 'shared',
    daysRequired: 180,
  },
  {
    id: 'cancer-risk',
    timeframe: '52 Weeks',
    title: 'Reduced Cancer Risk',
    description: 'Oral cancer risk decreases',
    scientificExplanation: 'While pouches are less risky than smoking, they still contain carcinogens. Risk reduction begins immediately and continues',
    icon: 'medical',
    color: '#06B6D4',
    category: 'shared',
    daysRequired: 365,
  },
];

// Male-specific benefits for nicotine pouches
const MALE_POUCH_BENEFITS: Omit<GenderSpecificBenefit, 'achieved'>[] = [
  {
    id: 'testosterone-stabilization',
    timeframe: '8-26 Weeks',
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
    timeframe: '12-26 Weeks',
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
    timeframe: '4-12 Weeks',
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
    timeframe: '12-26 Weeks',
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
    timeframe: '2-3 Weeks',
    title: 'Faster Muscle Recovery',
    description: 'Less soreness and better gains from workouts',
    scientificExplanation: 'Nicotine impairs muscle protein synthesis and recovery. Quitting improves blood flow and nutrient delivery to muscles',
    icon: 'barbell',
    color: '#3B82F6',
    category: 'male',
    daysRequired: 14,
  },
  {
    id: 'prostate-health',
    timeframe: '12-26 Weeks',
    title: 'Improved Prostate Health',
    description: 'Reduced inflammation and healthier prostate function',
    scientificExplanation: 'Nicotine increases prostate inflammation and cell proliferation. Quitting reduces inflammatory markers and prostate cancer risk',
    icon: 'shield-checkmark',
    color: '#059669',
    category: 'male',
    daysRequired: 90,
  },
];

// Female-specific benefits for nicotine pouches
const FEMALE_POUCH_BENEFITS: Omit<GenderSpecificBenefit, 'achieved'>[] = [
  {
    id: 'hormone-balance',
    timeframe: '4-5 Weeks',
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
    timeframe: '8-9 Weeks',
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
    timeframe: '12-26 Weeks',
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
    timeframe: '52+ Weeks',
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
    timeframe: '26-52 Weeks',
    title: 'Stronger Bones',
    description: 'Better calcium absorption and bone density',
    scientificExplanation: 'Nicotine interferes with calcium absorption and bone formation. Bone health improves after quitting',
    icon: 'body',
    color: '#14B8A6',
    category: 'female',
    daysRequired: 180,
  },
];

// Female-specific benefits for cigarettes
const FEMALE_CIGARETTE_BENEFITS: Omit<GenderSpecificBenefit, 'achieved'>[] = [
  {
    id: 'hormone-balance-cig',
    timeframe: '4-6 Weeks',
    title: 'Balanced Hormones',
    description: 'Estrogen and progesterone levels normalize',
    scientificExplanation: 'Cigarette smoke severely disrupts estrogen metabolism and hormone production. Quitting allows natural hormone cycles to restore',
    icon: 'sync',
    color: '#EC4899',
    category: 'female',
    daysRequired: 35,
  },
  {
    id: 'easier-periods-cig',
    timeframe: '8-10 Weeks',
    title: 'Easier, More Regular Periods',
    description: 'Less cramping and more predictable cycles',
    scientificExplanation: 'Cigarette smoke constricts blood vessels and increases inflammation, worsening menstrual symptoms. These improve significantly after quitting',
    icon: 'calendar',
    color: '#8B5CF6',
    category: 'female',
    daysRequired: 65,
  },
  {
    id: 'fertility-improvement-cig',
    timeframe: '12-26 Weeks',
    title: 'Improved Fertility',
    description: 'Better egg quality and reproductive health',
    scientificExplanation: 'Cigarette smoke damages eggs and reduces ovarian reserve. Fertility markers improve within 3-6 months of quitting',
    icon: 'flower',
    color: '#10B981',
    category: 'female',
    daysRequired: 90,
  },
  {
    id: 'skin-health-cig',
    timeframe: '4-8 Weeks',
    title: 'Radiant, Healthier Skin',
    description: 'Better collagen production and skin elasticity',
    scientificExplanation: 'Cigarette smoke destroys collagen and reduces skin blood flow. Skin health visibly improves within weeks of quitting',
    icon: 'sparkles',
    color: '#F59E0B',
    category: 'female',
    daysRequired: 35,
  },
  {
    id: 'pregnancy-health',
    timeframe: '12-16 Weeks',
    title: 'Safer Pregnancy Potential',
    description: 'Reduced risk of pregnancy complications',
    scientificExplanation: 'Smoking increases risk of miscarriage, ectopic pregnancy, and birth defects. Risk decreases significantly after 3-4 months smoke-free',
    icon: 'heart',
    color: '#EC4899',
    category: 'female',
    daysRequired: 90,
  },
  {
    id: 'menopause-risk-cig',
    timeframe: '52+ Weeks',
    title: 'Lower Early Menopause Risk',
    description: 'Protects long-term reproductive health',
    scientificExplanation: 'Cigarette smoking causes earlier menopause onset by 1-2 years. Quitting helps preserve ovarian function',
    icon: 'shield',
    color: '#06B6D4',
    category: 'female',
    daysRequired: 365,
  },
  {
    id: 'bone-density-cig',
    timeframe: '26-52 Weeks',
    title: 'Stronger Bones',
    description: 'Better calcium absorption and bone density',
    scientificExplanation: 'Cigarette smoke severely interferes with calcium absorption and bone formation. Bone health improves after quitting',
    icon: 'body',
    color: '#14B8A6',
    category: 'female',
    daysRequired: 180,
  },
  {
    id: 'cervical-health',
    timeframe: '26-52 Weeks',
    title: 'Improved Cervical Health',
    description: 'Lower risk of cervical cancer and HPV complications',
    scientificExplanation: 'Smoking weakens cervical immunity and increases HPV persistence. Quitting improves cervical health and cancer resistance',
    icon: 'shield-checkmark',
    color: '#8B5CF6',
    category: 'female',
    daysRequired: 180,
  },
  {
    id: 'breast-health',
    timeframe: '52+ Weeks',
    title: 'Better Breast Health',
    description: 'Reduced breast cancer risk',
    scientificExplanation: 'Smoking increases breast cancer risk, especially in premenopausal women. Risk decreases with sustained abstinence',
    icon: 'ribbon',
    color: '#EC4899',
    category: 'female',
    daysRequired: 365,
  },
];

// Shared benefits for cigarettes (more comprehensive than pouches)
const SHARED_CIGARETTE_BENEFITS: Omit<GenderSpecificBenefit, 'achieved'>[] = [
  {
    id: 'breathing-easier',
    timeframe: '1-3 Days',
    title: 'Easier Breathing',
    description: 'Airways relax and open up',
    scientificExplanation: 'Carbon monoxide levels drop and oxygen levels normalize within 72 hours of quitting',
    icon: 'wind',
    color: '#06B6D4',
    category: 'shared',
    daysRequired: 2,
  },
  {
    id: 'taste-smell',
    timeframe: '2-7 Days',
    title: 'Taste & Smell Return',
    description: 'Nerve endings begin healing',
    scientificExplanation: 'Cigarette smoke damages taste buds and olfactory nerves. These regenerate quickly after quitting',
    icon: 'restaurant',
    color: '#F59E0B',
    category: 'shared',
    daysRequired: 5,
  },
  {
    id: 'circulation-improves',
    timeframe: '2-12 Weeks',
    title: 'Better Circulation',
    description: 'Hands and feet feel warmer',
    scientificExplanation: 'Blood vessels recover from chronic constriction. Peripheral circulation improves dramatically',
    icon: 'water',
    color: '#EF4444',
    category: 'shared',
    daysRequired: 14,
  },
  {
    id: 'lung-function',
    timeframe: '1-9 Weeks',
    title: 'Improved Lung Function',
    description: 'Coughing and shortness of breath decrease',
    scientificExplanation: 'Cilia regrow in lungs, clearing mucus and reducing infection risk. Lung capacity increases up to 30%',
    icon: 'fitness',
    color: '#10B981',
    category: 'shared',
    daysRequired: 30,
  },
  {
    id: 'heart-attack-risk',
    timeframe: '52 Weeks',
    title: '50% Lower Heart Attack Risk',
    description: 'Cardiovascular system recovers',
    scientificExplanation: 'After one year smoke-free, excess risk of coronary heart disease is half that of a smoker',
    icon: 'heart',
    color: '#EF4444',
    category: 'shared',
    daysRequired: 365,
  },
  {
    id: 'stroke-risk',
    timeframe: '2-5 Years',
    title: 'Normalized Stroke Risk',
    description: 'Risk drops to that of non-smoker',
    scientificExplanation: 'Blood vessel damage reverses and clotting normalizes, reducing stroke risk to baseline',
    icon: 'shield',
    color: '#8B5CF6',
    category: 'shared',
    daysRequired: 730,
  },
  {
    id: 'cancer-risk-reduction',
    timeframe: '5-10 Years',
    title: '50% Lower Lung Cancer Risk',
    description: 'Cellular repair continues',
    scientificExplanation: 'Risk of lung, throat, and other smoking-related cancers drops dramatically with sustained abstinence',
    icon: 'medical',
    color: '#06B6D4',
    category: 'shared',
    daysRequired: 1825,
  },
];

// Male-specific benefits for cigarettes
const MALE_CIGARETTE_BENEFITS: Omit<GenderSpecificBenefit, 'achieved'>[] = [
  {
    id: 'testosterone-stabilization-cig',
    timeframe: '8-12 Weeks',
    title: 'Testosterone Levels Stabilize',
    description: 'Hormones return to healthy, natural levels',
    scientificExplanation: 'Cigarette smoking severely disrupts testosterone production. Cessation allows for healthier, more stable hormone levels',
    icon: 'fitness',
    color: '#F59E0B',
    category: 'male',
    daysRequired: 65,
  },
  {
    id: 'erectile-function-cig',
    timeframe: '2-12 Weeks',
    title: 'Improved Erectile Function',
    description: 'Better blood flow enhances sexual health',
    scientificExplanation: 'Cigarette smoke severely constricts blood vessels. Improved circulation after quitting rapidly enhances erectile function',
    icon: 'heart',
    color: '#EF4444',
    category: 'male',
    daysRequired: 30,
  },
  {
    id: 'sexual-satisfaction-cig',
    timeframe: '2-8 Weeks',
    title: 'Enhanced Sexual Satisfaction',
    description: 'Increased sensitivity and pleasure',
    scientificExplanation: 'Improved blood flow and nerve function enhance sexual sensation and satisfaction',
    icon: 'star',
    color: '#F97316',
    category: 'male',
    daysRequired: 21,
  },
  {
    id: 'sperm-quality-cig',
    timeframe: '10-16 Weeks',
    title: 'Better Sperm Quality',
    description: 'Improved fertility and reproductive health',
    scientificExplanation: 'Cigarette smoke damages sperm DNA and reduces count by up to 23%. Quality improves significantly after 3-4 months smoke-free',
    icon: 'trending-up',
    color: '#06B6D4',
    category: 'male',
    daysRequired: 75,
  },
  {
    id: 'muscle-recovery-cig',
    timeframe: '2-4 Weeks',
    title: 'Faster Muscle Recovery',
    description: 'Less soreness and better gains from workouts',
    scientificExplanation: 'Cigarette smoke severely impairs muscle protein synthesis and oxygen delivery. Quitting improves athletic performance',
    icon: 'barbell',
    color: '#3B82F6',
    category: 'male',
    daysRequired: 14,
  },
  {
    id: 'prostate-health-cig',
    timeframe: '26-52 Weeks',
    title: 'Improved Prostate Health',
    description: 'Reduced inflammation and cancer risk',
    scientificExplanation: 'Cigarette smoking increases prostate inflammation and cancer risk. Quitting reduces these risks significantly',
    icon: 'shield-checkmark',
    color: '#059669',
    category: 'male',
    daysRequired: 180,
  },
  {
    id: 'bladder-health',
    timeframe: '26-52 Weeks',
    title: 'Better Bladder Health',
    description: 'Reduced bladder cancer risk',
    scientificExplanation: 'Smoking is the leading cause of bladder cancer in men. Risk decreases by 50% within a few years of quitting',
    icon: 'medical',
    color: '#06B6D4',
    category: 'male',
    daysRequired: 180,
  },
  {
    id: 'cardiovascular-fitness',
    timeframe: '2-12 Weeks',
    title: 'Enhanced Athletic Performance',
    description: 'Better endurance and stamina',
    scientificExplanation: 'Oxygen delivery to muscles improves dramatically. VO2 max increases by up to 30% after quitting',
    icon: 'fitness',
    color: '#10B981',
    category: 'male',
    daysRequired: 30,
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
  
  // Determine which shared benefits to use based on product type
  let sharedBenefits: Omit<GenderSpecificBenefit, 'achieved'>[] = [];
  
  if (productType === 'cigarettes' || productType === 'cigarette') {
    sharedBenefits = SHARED_CIGARETTE_BENEFITS;
  } else {
    sharedBenefits = SHARED_BENEFITS;
  }
  
  // Add shared benefits for all users
  sharedBenefits.forEach(benefit => {
    benefits.push({
      ...benefit,
      achieved: stats.daysClean >= benefit.daysRequired,
    });
  });
  
  console.log('- Shared benefits added:', sharedBenefits.length);
  
  // Add gender-specific benefits based on product type
  if (productType === 'cigarettes' || productType === 'cigarette') {
    console.log('- Product is cigarettes, checking gender...');
    if (gender === 'male') {
      console.log('- Adding male-specific cigarette benefits');
      MALE_CIGARETTE_BENEFITS.forEach(benefit => {
        benefits.push({
          ...benefit,
          achieved: stats.daysClean >= benefit.daysRequired,
        });
      });
    } else if (gender === 'female') {
      console.log('- Adding female-specific cigarette benefits');
      FEMALE_CIGARETTE_BENEFITS.forEach(benefit => {
        benefits.push({
          ...benefit,
          achieved: stats.daysClean >= benefit.daysRequired,
        });
      });
    } else {
      console.log('- Gender is neither male nor female:', gender);
    }
  } else if (productType === 'pouches' || productType === 'nicotine_pouches') {
    console.log('- Product is pouches, checking gender...');
    if (gender === 'male') {
      console.log('- Adding male-specific pouch benefits');
      MALE_POUCH_BENEFITS.forEach(benefit => {
        benefits.push({
          ...benefit,
          achieved: stats.daysClean >= benefit.daysRequired,
        });
      });
    } else if (gender === 'female') {
      console.log('- Adding female-specific pouch benefits');
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
    console.log('- Product type is not cigarettes or pouches:', productType);
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
export const getBenefitExplanation = (benefit: GenderSpecificBenefit, stats: ProgressStats): string => {
  const daysRemaining = benefit.daysRequired - stats.daysClean;
  
  if (daysRemaining <= 0) {
    // Benefit achieved
    switch (benefit.title) {
      case 'Reduced Anxiety & Panic':
        return 'Your brain\'s stress response has normalized. You\'re experiencing calmer, more balanced emotions throughout the day.';
      case 'Better Focus & Concentration':
        return 'Your concentration has significantly improved. Mental fog has lifted and you can focus on tasks more easily.';
      case 'Improved Self-Control':
        return 'Your prefrontal cortex has strengthened. You have better impulse control and decision-making abilities.';
      case 'Deeper, More Restful Sleep':
        return 'Your sleep cycles have normalized. You\'re experiencing more restorative deep sleep and waking up refreshed.';
      case 'Fewer Hypnic Jerks':
        return 'Those sudden muscle spasms when falling asleep have decreased. Your nervous system is more relaxed.';
      case 'Better Gut Health':
        return 'Your digestive system has healed. Reduced inflammation and improved gut bacteria balance.';
      case 'Healthier Gums':
        return 'Your gum tissue has regenerated. No more irritation or recession from nicotine pouches.';
      case 'Stronger Heart':
        return 'Your cardiovascular system has recovered. Heart rate is steady and blood pressure has normalized.';
      case 'Stronger Immune System':
        return 'Your immune system is functioning optimally. You\'re better protected against infections and illness.';
      case 'Natural Energy Returns':
        return 'Your energy levels are stable throughout the day. No more nicotine crashes or artificial stimulation needed.';
      case 'Freedom from Addiction':
        return 'You\'ve broken free from nicotine addiction. Cravings are rare and you\'re in control of your choices.';
      case 'Reduced Cancer Risk':
        return 'Your oral cancer risk has significantly decreased. Continued abstinence further reduces all cancer risks.';
      case 'Testosterone Levels Stabilize':
        return 'Your testosterone levels have normalized. This supports better energy, mood, and physical performance.';
      case 'Improved Erectile Function':
        return 'Blood flow and nerve sensitivity have significantly improved. Your body\'s natural responses have been restored.';
      case 'Enhanced Sexual Satisfaction':
        return 'Dopamine receptors have rebalanced. You\'re experiencing more natural pleasure and connection.';
      case 'Better Sperm Quality':
        return 'Sperm count, motility, and DNA integrity have improved. Your reproductive health has been restored.';
      case 'Faster Muscle Recovery':
        return 'Your muscles are recovering faster from exercise. Better blood flow and oxygen delivery mean less soreness and improved performance.';
      case 'Improved Prostate Health':
        return 'Your prostate health has significantly improved. Reduced inflammation and normalized cell growth lower your risk of prostate issues.';
      case 'Radiant, Healthier Skin':
        return 'Your skin is glowing with health. Better blood flow and collagen production have improved elasticity and reduced signs of aging.';
      case 'Lower Early Menopause Risk':
        return 'You\'ve significantly reduced your risk of early menopause by protecting your ovarian health.';
      case 'Stronger Bones':
        return 'Your bone density is improving. Better calcium absorption and hormone balance protect against osteoporosis.';
      case 'Balanced Hormones':
        return 'Your estrogen and progesterone levels have stabilized. This supports regular cycles and reduced PMS symptoms.';
      case 'Easier, More Regular Periods':
        return 'Reduced inflammation and better hormone balance lead to less painful, more manageable periods.';
      case 'Improved Fertility':
        return 'Your reproductive system has healed. Egg quality and hormonal balance support natural fertility.';
      case 'Safer Pregnancy Potential':
        return 'Your body is now much better prepared for a healthy pregnancy. Risk of complications has decreased significantly.';
      case 'Improved Cervical Health':
        return 'Your cervical immunity has strengthened. You\'re better protected against HPV and cervical abnormalities.';
      case 'Better Breast Health':
        return 'Your breast cancer risk has decreased. Continued abstinence provides ongoing protection.';
      case 'Better Bladder Health':
        return 'Your bladder cancer risk has dropped significantly. The bladder lining has healed from smoke damage.';
      case 'Enhanced Athletic Performance':
        return 'Your cardiovascular fitness has improved dramatically. You can exercise longer and recover faster.';
      case 'Easier Breathing':
        return 'Your airways have opened up. Breathing is noticeably easier and more comfortable.';
      case 'Taste & Smell Return':
        return 'Your senses have awakened! Food tastes better and you can smell things you\'ve been missing.';
      case 'Better Circulation':
        return 'Blood flow has improved throughout your body. Your hands and feet feel warmer.';
      case 'Improved Lung Function':
        return 'Your lungs have cleared out mucus and tar. Breathing capacity has increased significantly.';
      case '50% Lower Heart Attack Risk':
        return 'Your heart disease risk is now half that of a smoker. Your cardiovascular system has healed remarkably.';
      case 'Normalized Stroke Risk':
        return 'Your stroke risk has dropped to that of someone who never smoked. Blood vessels have fully recovered.';
      case '50% Lower Lung Cancer Risk':
        return 'Your lung cancer risk is now half that of a smoker. Cellular repair continues with each smoke-free day.';
      default:
        return 'You\'ve achieved this recovery milestone!';
    }
  } else {
    // Still in progress
    if (daysRemaining === 1) {
      return 'Just 1 more day!';
    } else if (daysRemaining <= 7) {
      return `${daysRemaining} more days`;
    } else if (daysRemaining <= 30) {
      const weeks = Math.ceil(daysRemaining / 7);
      return weeks === 1 ? '1 more week' : `${weeks} more weeks`;
    } else {
      const months = Math.ceil(daysRemaining / 30);
      return months === 1 ? '1 more month' : `${months} more months`;
    }
  }
}; 