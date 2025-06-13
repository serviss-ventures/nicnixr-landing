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
    timeframe: '1-3 Days',
    title: 'Reduced Anxiety & Panic',
    description: 'Nicotine withdrawal peaks but anxiety starts to decrease',
    scientificExplanation: 'Your brain\'s GABA receptors are rebalancing, reducing the anxiety that nicotine both caused and temporarily relieved',
    icon: 'fitness-outline',
    color: '#10B981',
    category: 'shared',
    daysRequired: 3,
  },
  {
    id: 'focus-improvement',
    timeframe: '1 Week',
    title: 'Better Focus & Concentration',
    description: 'Brain fog clears as dopamine receptors heal',
    scientificExplanation: 'Nicotine hijacked your dopamine system. After 7 days, natural dopamine production begins to normalize, improving focus',
    icon: 'bulb-outline',
    color: '#3B82F6',
    category: 'shared',
    daysRequired: 7,
  },
  {
    id: 'sleep-quality',
    timeframe: '2 Weeks',
    title: 'Deeper, More Restful Sleep',
    description: 'REM sleep cycles normalize',
    scientificExplanation: 'Nicotine disrupts sleep architecture. After 2 weeks, you experience 20-30% more restorative deep sleep',
    icon: 'moon-outline',
    color: '#6366F1',
    category: 'shared',
    daysRequired: 14,
  },
  {
    id: 'gum-health',
    timeframe: '2-4 Weeks',
    title: 'Healthier Gums',
    description: 'Gum inflammation reduces significantly',
    scientificExplanation: 'Nicotine restricts blood flow to gums. Improved circulation means healthier, pinker gums and reduced disease risk',
    icon: 'happy-outline',
    color: '#EC4899',
    category: 'shared',
    daysRequired: 21,
  },
  {
    id: 'gut-health',
    timeframe: '4 Weeks',
    title: 'Better Gut Health',
    description: 'Digestive system normalizes',
    scientificExplanation: 'Nicotine disrupts gut bacteria balance. After a month, beneficial bacteria flourish, improving digestion and mood',
    icon: 'nutrition-outline',
    color: '#F59E0B',
    category: 'shared',
    daysRequired: 30,
  },
  {
    id: 'heart-health',
    timeframe: '4-6 Weeks',
    title: 'Stronger Heart',
    description: 'Resting heart rate drops 5-10 bpm',
    scientificExplanation: 'Your heart no longer works overtime. Blood pressure normalizes and cardiac stress markers decrease by 40%',
    icon: 'heart-outline',
    color: '#EF4444',
    category: 'shared',
    daysRequired: 35,
  },
  {
    id: 'immune-boost',
    timeframe: '6-8 Weeks',
    title: 'Stronger Immune System',
    description: 'White blood cell count normalizes',
    scientificExplanation: 'Nicotine suppresses immune function. After 6 weeks, your body fights infections 50% more effectively',
    icon: 'shield-checkmark-outline',
    color: '#10B981',
    category: 'shared',
    daysRequired: 45,
  },
  {
    id: 'energy-restoration',
    timeframe: '8-12 Weeks',
    title: 'Natural Energy Returns',
    description: 'No more energy crashes',
    scientificExplanation: 'Your cells produce energy more efficiently without nicotine\'s interference. Mitochondrial function improves by 25%',
    icon: 'flash-outline',
    color: '#F59E0B',
    category: 'shared',
    daysRequired: 60,
  },
  {
    id: 'addiction-freedom',
    timeframe: '12-26 Weeks',
    title: 'Freedom from Addiction',
    description: 'Cravings become rare',
    scientificExplanation: 'Neural pathways have largely rewired. The psychological addiction weakens as new, healthy habits form',
    icon: 'ribbon-outline',
    color: '#8B5CF6',
    category: 'shared',
    daysRequired: 90,
  },
  {
    id: 'cancer-risk-reduction',
    timeframe: '52 Weeks',
    title: 'Reduced Cancer Risk',
    description: 'Oral cancer risk drops by 50%',
    scientificExplanation: 'After one year, your risk of mouth, throat, and esophageal cancers is half that of a nicotine user',
    icon: 'medical-outline',
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
    timeframe: '52 Weeks',
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
    timeframe: '52 Weeks',
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
    timeframe: '52 Weeks',
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
    description: 'Airways begin to relax',
    scientificExplanation: 'Bronchial tubes relax and open up. Carbon monoxide levels drop by 50% within 8 hours',
    icon: 'cloud-outline',
    color: '#06B6D4',
    category: 'shared',
    daysRequired: 2,
  },
  {
    id: 'taste-smell',
    timeframe: '2-7 Days',
    title: 'Taste & Smell Return',
    description: 'Food tastes amazing again',
    scientificExplanation: 'Nerve endings damaged by smoking begin to regrow. Taste and smell dramatically improve',
    icon: 'restaurant-outline',
    color: '#F59E0B',
    category: 'shared',
    daysRequired: 5,
  },
  {
    id: 'circulation',
    timeframe: '2-12 Weeks',
    title: 'Better Circulation',
    description: 'Hands and feet feel warmer',
    scientificExplanation: 'Blood vessels recover from chronic constriction. Circulation improves throughout your body',
    icon: 'water-outline',
    color: '#3B82F6',
    category: 'shared',
    daysRequired: 14,
  },
  {
    id: 'lung-function',
    timeframe: '4-12 Weeks',
    title: 'Improved Lung Function',
    description: 'Lung capacity increases by 30%',
    scientificExplanation: 'Cilia regrow in lungs, clearing mucus and reducing infection risk. Breathing becomes noticeably easier',
    icon: 'fitness-outline',
    color: '#10B981',
    category: 'shared',
    daysRequired: 30,
  },
  {
    id: 'heart-attack-risk',
    timeframe: '52 Weeks',
    title: '50% Lower Heart Attack Risk',
    description: 'Major cardiovascular improvement',
    scientificExplanation: 'After one year, your excess risk of coronary heart disease is half that of a smoker',
    icon: 'heart-outline',
    color: '#EF4444',
    category: 'shared',
    daysRequired: 365,
  },
  {
    id: 'complete-recovery',
    timeframe: '52 Weeks',
    title: 'Complete Health Transformation',
    description: 'Your body has undergone incredible healing',
    scientificExplanation: 'From improved lung function to reduced cancer risk, your body has transformed. You\'ve added years to your life',
    icon: 'trophy-outline',
    color: '#FFD700',
    category: 'shared',
    daysRequired: 365,
  },
];

// Male-specific benefits for cigarettes
const MALE_CIGARETTE_BENEFITS: Omit<GenderSpecificBenefit, 'achieved'>[] = [
  {
    id: 'testosterone-smoking',
    timeframe: '4-8 Weeks',
    title: 'Testosterone Increases',
    description: '15% boost in testosterone levels',
    scientificExplanation: 'Smoking suppresses testosterone production. Levels rebound significantly after quitting',
    icon: 'fitness-outline',
    color: '#3B82F6',
    category: 'male',
    daysRequired: 30,
  },
  {
    id: 'erectile-smoking',
    timeframe: '12-26 Weeks',
    title: 'Better Erectile Function',
    description: 'Improved blood flow where it matters',
    scientificExplanation: 'Smoking damages blood vessels. Erectile function improves by 25% within 3-6 months',
    icon: 'heart-outline',
    color: '#EF4444',
    category: 'male',
    daysRequired: 90,
  },
  {
    id: 'sperm-smoking',
    timeframe: '10-16 Weeks',
    title: 'Healthier Sperm',
    description: 'Sperm count and quality improve',
    scientificExplanation: 'Smoking damages sperm DNA. Full sperm cycle renewal takes 3 months for optimal fertility',
    icon: 'trending-up-outline',
    color: '#10B981',
    category: 'male',
    daysRequired: 75,
  },
  {
    id: 'athletic-smoking',
    timeframe: '4-12 Weeks',
    title: 'Enhanced Athletic Performance',
    description: 'VO2 max increases by 10%',
    scientificExplanation: 'Oxygen delivery to muscles improves dramatically. Athletic endurance increases measurably',
    icon: 'barbell-outline',
    color: '#F59E0B',
    category: 'male',
    daysRequired: 30,
  },
  {
    id: 'prostate-smoking',
    timeframe: '26-52 Weeks',
    title: 'Lower Prostate Cancer Risk',
    description: 'Significant risk reduction',
    scientificExplanation: 'Smoking increases prostate cancer risk by 40%. Risk decreases with sustained abstinence',
    icon: 'shield-checkmark-outline',
    color: '#059669',
    category: 'male',
    daysRequired: 180,
  },
  {
    id: 'bladder-health',
    timeframe: '52 Weeks',
    title: 'Better Bladder Health',
    description: '50% lower bladder cancer risk',
    scientificExplanation: 'Smoking is the #1 cause of bladder cancer. Risk drops dramatically after one year',
    icon: 'medical-outline',
    color: '#06B6D4',
    category: 'male',
    daysRequired: 365,
  },
];

// Shared benefits for vaping/e-cigarettes
const SHARED_VAPE_BENEFITS: Omit<GenderSpecificBenefit, 'achieved'>[] = [
  {
    id: 'lung-inflammation',
    timeframe: '1-2 Weeks',
    title: 'Lung Inflammation Reduces',
    description: 'Airways begin to heal from vapor damage',
    scientificExplanation: 'Vaping causes significant lung inflammation. Airways begin healing within days, reducing cough and shortness of breath',
    icon: 'fitness',
    color: '#06B6D4',
    category: 'shared',
    daysRequired: 7,
  },
  {
    id: 'popcorn-lung-risk',
    timeframe: '4-8 Weeks',
    title: 'Vaping Lung Injury Risk Gone',
    description: 'No more risk of EVALI (severe lung damage)',
    scientificExplanation: 'EVALI (E-cigarette or Vaping-Associated Lung Injury) is a serious condition that can cause permanent lung damage. Your risk drops to zero and lungs repair chemical damage',
    icon: 'shield',
    color: '#EF4444',
    category: 'shared',
    daysRequired: 30,
  },
  {
    id: 'throat-healing',
    timeframe: '1-2 Weeks',
    title: 'Throat Irritation Heals',
    description: 'No more burning or dry throat',
    scientificExplanation: 'Propylene glycol and vegetable glycerin irritate throat tissues. Healing begins immediately after quitting',
    icon: 'water',
    color: '#14B8A6',
    category: 'shared',
    daysRequired: 7,
  },
  {
    id: 'chemical-detox',
    timeframe: '2-4 Weeks',
    title: 'Chemical Detoxification',
    description: 'Body clears vaping chemicals',
    scientificExplanation: 'Your body eliminates formaldehyde, acrolein, and other toxic chemicals found in vape aerosol',
    icon: 'refresh',
    color: '#10B981',
    category: 'shared',
    daysRequired: 14,
  },
  {
    id: 'lung-capacity',
    timeframe: '4-12 Weeks',
    title: 'Lung Capacity Improves',
    description: 'Breathing becomes easier and deeper',
    scientificExplanation: 'Lung function improves by up to 30% as airways heal from vapor damage and inflammation subsides',
    icon: 'cloud',
    color: '#3B82F6',
    category: 'shared',
    daysRequired: 30,
  },
  {
    id: 'heart-rhythm',
    timeframe: '2-4 Weeks',
    title: 'Heart Rhythm Stabilizes',
    description: 'No more nicotine-induced palpitations',
    scientificExplanation: 'Vaping causes heart arrhythmias. Heart rhythm normalizes as nicotine leaves your system',
    icon: 'heart',
    color: '#EC4899',
    category: 'shared',
    daysRequired: 14,
  },
  {
    id: 'immune-recovery',
    timeframe: '8-12 Weeks',
    title: 'Immune System Rebounds',
    description: 'Better defense against infections',
    scientificExplanation: 'Vaping suppresses immune function. White blood cell count and activity normalize after quitting',
    icon: 'shield-checkmark',
    color: '#8B5CF6',
    category: 'shared',
    daysRequired: 60,
  },
  {
    id: 'oral-health-vape',
    timeframe: '4-8 Weeks',
    title: 'Oral Health Improves',
    description: 'Gums heal from nicotine damage',
    scientificExplanation: 'Vaping causes gum disease and dry mouth. Oral tissues heal and saliva production normalizes',
    icon: 'happy',
    color: '#F59E0B',
    category: 'shared',
    daysRequired: 30,
  },
  {
    id: 'complete-respiratory-recovery',
    timeframe: '52 Weeks',
    title: 'Full Respiratory Recovery',
    description: 'Lungs fully healed from vaping',
    scientificExplanation: 'After one year, your lungs have completely recovered from vaping damage. Breathing capacity is fully restored',
    icon: 'trophy',
    color: '#FFD700',
    category: 'shared',
    daysRequired: 365,
  },
];

// Male-specific benefits for vaping
const MALE_VAPE_BENEFITS: Omit<GenderSpecificBenefit, 'achieved'>[] = [
  {
    id: 'testosterone-vape',
    timeframe: '4-8 Weeks',
    title: 'Testosterone Increases',
    description: 'Hormone levels normalize',
    scientificExplanation: 'Vaping nicotine suppresses testosterone production. Levels rebound within 1-2 months of quitting',
    icon: 'fitness',
    color: '#F59E0B',
    category: 'male',
    daysRequired: 30,
  },
  {
    id: 'athletic-performance-vape',
    timeframe: '2-4 Weeks',
    title: 'Athletic Performance Boost',
    description: 'Better endurance and recovery',
    scientificExplanation: 'Vaping reduces oxygen uptake by 20%. Athletic performance improves rapidly as lungs heal',
    icon: 'bicycle',
    color: '#10B981',
    category: 'male',
    daysRequired: 14,
  },
  {
    id: 'sperm-quality-vape',
    timeframe: '10-12 Weeks',
    title: 'Sperm Health Improves',
    description: 'Better count and motility',
    scientificExplanation: 'Vaping damages sperm DNA and reduces count. Full recovery takes about 3 months',
    icon: 'trending-up',
    color: '#06B6D4',
    category: 'male',
    daysRequired: 75,
  },
  {
    id: 'erectile-function-vape',
    timeframe: '4-8 Weeks',
    title: 'Better Erectile Function',
    description: 'Improved blood flow',
    scientificExplanation: 'Nicotine constricts blood vessels. Erectile function improves as circulation normalizes',
    icon: 'heart',
    color: '#EF4444',
    category: 'male',
    daysRequired: 30,
  },
  {
    id: 'muscle-growth-vape',
    timeframe: '8-12 Weeks',
    title: 'Enhanced Muscle Growth',
    description: 'Better protein synthesis',
    scientificExplanation: 'Vaping impairs muscle protein synthesis. Muscle growth and recovery improve after quitting',
    icon: 'barbell',
    color: '#8B5CF6',
    category: 'male',
    daysRequired: 60,
  },
  {
    id: 'cardiovascular-endurance',
    timeframe: '12-26 Weeks',
    title: 'Peak Cardiovascular Fitness',
    description: 'VO2 max significantly improves',
    scientificExplanation: 'Cardiovascular capacity increases by 25-30% as lungs heal and oxygen delivery improves',
    icon: 'pulse',
    color: '#059669',
    category: 'male',
    daysRequired: 90,
  },
];

// Female-specific benefits for vaping
const FEMALE_VAPE_BENEFITS: Omit<GenderSpecificBenefit, 'achieved'>[] = [
  {
    id: 'menstrual-regulation',
    timeframe: '4-8 Weeks',
    title: 'Regular Menstrual Cycles',
    description: 'Hormones rebalance naturally',
    scientificExplanation: 'Vaping disrupts estrogen and progesterone. Cycles normalize within 1-2 months of quitting',
    icon: 'calendar',
    color: '#EC4899',
    category: 'female',
    daysRequired: 30,
  },
  {
    id: 'skin-healing-vape',
    timeframe: '2-4 Weeks',
    title: 'Clearer, Hydrated Skin',
    description: 'No more vaping-induced dryness',
    scientificExplanation: 'Vaping dehydrates skin and reduces collagen. Skin elasticity and hydration improve rapidly',
    icon: 'sparkles',
    color: '#F59E0B',
    category: 'female',
    daysRequired: 14,
  },
  {
    id: 'hair-health',
    timeframe: '8-12 Weeks',
    title: 'Healthier, Stronger Hair',
    description: 'Better growth and less breakage',
    scientificExplanation: 'Vaping reduces blood flow to hair follicles. Hair health improves as circulation normalizes',
    icon: 'color-palette',
    color: '#8B5CF6',
    category: 'female',
    daysRequired: 60,
  },
  {
    id: 'fertility-vape',
    timeframe: '12-16 Weeks',
    title: 'Fertility Enhancement',
    description: 'Better egg quality',
    scientificExplanation: 'Vaping affects egg quality and ovulation. Fertility improves within 3-4 months',
    icon: 'flower',
    color: '#10B981',
    category: 'female',
    daysRequired: 90,
  },
  {
    id: 'pregnancy-health-vape',
    timeframe: '12-16 Weeks',
    title: 'Safer Pregnancy Potential',
    description: 'Reduced risk of complications',
    scientificExplanation: 'Vaping increases miscarriage and birth defect risk. Body becomes pregnancy-ready after 3-4 months',
    icon: 'heart',
    color: '#EC4899',
    category: 'female',
    daysRequired: 90,
  },
  {
    id: 'bone-density-vape',
    timeframe: '26-52 Weeks',
    title: 'Stronger Bone Density',
    description: 'Better calcium retention',
    scientificExplanation: 'Nicotine accelerates bone loss. Bone density improves with sustained abstinence',
    icon: 'body',
    color: '#14B8A6',
    category: 'female',
    daysRequired: 180,
  },
];

// Shared benefits for dip/chew
const SHARED_DIP_BENEFITS: Omit<GenderSpecificBenefit, 'achieved'>[] = [
  {
    id: 'mouth-sores',
    timeframe: '1-2 Weeks',
    title: 'Mouth Sores Heal',
    description: 'White patches and sores disappear',
    scientificExplanation: 'Leukoplakia (white patches) from tobacco begin healing immediately. Complete healing within 2 weeks',
    icon: 'happy-outline',
    color: '#10B981',
    category: 'shared',
    daysRequired: 7,
  },
  {
    id: 'gum-recovery',
    timeframe: '2-4 Weeks',
    title: 'Gum Tissue Recovers',
    description: 'Gums regain healthy pink color',
    scientificExplanation: 'Smokeless tobacco causes severe gum recession. Tissue begins regenerating within days of quitting',
    icon: 'happy-outline',
    color: '#EC4899',
    category: 'shared',
    daysRequired: 14,
  },
  {
    id: 'taste-improvement',
    timeframe: '1-2 Weeks',
    title: 'Taste Buds Regenerate',
    description: 'Food tastes amazing again',
    scientificExplanation: 'Smokeless tobacco numbs taste buds. They regenerate quickly, revealing flavors you\'ve been missing',
    icon: 'restaurant-outline',
    color: '#F59E0B',
    category: 'shared',
    daysRequired: 7,
  },
  {
    id: 'oral-cancer-risk',
    timeframe: '52 Weeks',
    title: '50% Lower Oral Cancer Risk',
    description: 'Mouth, throat, and esophageal cancer risk drops',
    scientificExplanation: 'Smokeless tobacco users have 50x higher oral cancer risk. Risk drops by half within a year of quitting',
    icon: 'medical-outline',
    color: '#06B6D4',
    category: 'shared',
    daysRequired: 365,
  },
  {
    id: 'tooth-health',
    timeframe: '4-8 Weeks',
    title: 'Stronger, Whiter Teeth',
    description: 'No more staining or enamel damage',
    scientificExplanation: 'Tobacco acids erode enamel and cause severe staining. Teeth strengthen and naturally whiten after quitting',
    icon: 'happy-outline',
    color: '#3B82F6',
    category: 'shared',
    daysRequired: 30,
  },
  {
    id: 'blood-pressure',
    timeframe: '2-4 Weeks',
    title: 'Blood Pressure Normalizes',
    description: 'Cardiovascular strain reduces',
    scientificExplanation: 'Nicotine causes immediate blood pressure spikes. BP normalizes within weeks of quitting',
    icon: 'heart-outline',
    color: '#EF4444',
    category: 'shared',
    daysRequired: 14,
  },
  {
    id: 'pancreatic-health',
    timeframe: '26-52 Weeks',
    title: 'Pancreatic Cancer Risk Drops',
    description: 'Major reduction in pancreatic cancer risk',
    scientificExplanation: 'Smokeless tobacco significantly increases pancreatic cancer risk. Risk decreases substantially after quitting',
    icon: 'shield-outline',
    color: '#8B5CF6',
    category: 'shared',
    daysRequired: 180,
  },
  {
    id: 'stroke-risk',
    timeframe: '52 Weeks',
    title: 'Lower Stroke Risk',
    description: 'Brain blood vessel health improves',
    scientificExplanation: 'Nicotine damages blood vessels in the brain. Stroke risk decreases significantly within a year',
    icon: 'pulse-outline',
    color: '#06B6D4',
    category: 'shared',
    daysRequired: 365,
  },
  {
    id: 'complete-oral-recovery',
    timeframe: '52 Weeks',
    title: 'Complete Oral Recovery',
    description: 'Your mouth has fully healed',
    scientificExplanation: 'After one year, your oral cavity has completely recovered. Cancer risk continues to decrease with sustained abstinence',
    icon: 'trophy-outline',
    color: '#FFD700',
    category: 'shared',
    daysRequired: 365,
  },
];

// Male-specific benefits for dip/chew
const MALE_DIP_BENEFITS: Omit<GenderSpecificBenefit, 'achieved'>[] = [
  {
    id: 'testosterone-recovery-dip',
    timeframe: '6-12 Weeks',
    title: 'Testosterone Rebounds',
    description: 'Natural hormone production restored',
    scientificExplanation: 'Smokeless tobacco suppresses testosterone more than cigarettes. Levels rebound significantly after quitting',
    icon: 'fitness-outline',
    color: '#F59E0B',
    category: 'male',
    daysRequired: 45,
  },
  {
    id: 'jaw-strength',
    timeframe: '4-8 Weeks',
    title: 'Jaw & Facial Structure',
    description: 'No more TMJ pain or jaw deterioration',
    scientificExplanation: 'Constant chewing and tobacco acids damage jaw joints and bone. Structure strengthens after quitting',
    icon: 'fitness-outline',
    color: '#3B82F6',
    category: 'male',
    daysRequired: 30,
  },
  {
    id: 'athletic-endurance-dip',
    timeframe: '2-4 Weeks',
    title: 'Better Athletic Endurance',
    description: 'Oxygen delivery improves dramatically',
    scientificExplanation: 'Despite no smoke, dip still impairs oxygen transport. Athletic performance improves rapidly after quitting',
    icon: 'fitness-outline',
    color: '#10B981',
    category: 'male',
    daysRequired: 14,
  },
  {
    id: 'sperm-health-dip',
    timeframe: '10-16 Weeks',
    title: 'Healthier Sperm',
    description: 'Count and motility improve',
    scientificExplanation: 'Smokeless tobacco reduces sperm count by 30%. Full recovery takes 3-4 months',
    icon: 'trending-up-outline',
    color: '#06B6D4',
    category: 'male',
    daysRequired: 75,
  },
  {
    id: 'sexual-function-dip',
    timeframe: '4-8 Weeks',
    title: 'Improved Sexual Function',
    description: 'Better blood flow and sensitivity',
    scientificExplanation: 'Nicotine constricts blood vessels affecting sexual function. Improvement begins within weeks',
    icon: 'heart-outline',
    color: '#EF4444',
    category: 'male',
    daysRequired: 30,
  },
  {
    id: 'prostate-protection-dip',
    timeframe: '26-52 Weeks',
    title: 'Prostate Protection',
    description: 'Lower inflammation and cancer risk',
    scientificExplanation: 'Smokeless tobacco increases prostate cancer risk. Risk decreases with sustained abstinence',
    icon: 'shield-checkmark-outline',
    color: '#059669',
    category: 'male',
    daysRequired: 180,
  },
];

// Female-specific benefits for dip/chew
const FEMALE_DIP_BENEFITS: Omit<GenderSpecificBenefit, 'achieved'>[] = [
  {
    id: 'hormone-balance-dip',
    timeframe: '4-6 Weeks',
    title: 'Hormones Rebalance',
    description: 'Estrogen levels normalize',
    scientificExplanation: 'Smokeless tobacco disrupts estrogen metabolism. Hormone balance restores within 4-6 weeks',
    icon: 'sync-outline',
    color: '#EC4899',
    category: 'female',
    daysRequired: 30,
  },
  {
    id: 'skin-clarity-dip',
    timeframe: '4-8 Weeks',
    title: 'Clearer, Brighter Skin',
    description: 'Better complexion and glow',
    scientificExplanation: 'Nicotine constricts facial blood vessels. Skin tone and texture improve dramatically after quitting',
    icon: 'sparkles-outline',
    color: '#F59E0B',
    category: 'female',
    daysRequired: 30,
  },
  {
    id: 'pregnancy-safety-dip',
    timeframe: '12-16 Weeks',
    title: 'Safer for Pregnancy',
    description: 'Reduced risk of complications',
    scientificExplanation: 'Smokeless tobacco increases miscarriage and birth defect risk. Body becomes pregnancy-ready after 3-4 months',
    icon: 'heart-outline',
    color: '#EC4899',
    category: 'female',
    daysRequired: 90,
  },
  {
    id: 'bone-strength-dip',
    timeframe: '26-52 Weeks',
    title: 'Stronger Bones',
    description: 'Better calcium absorption',
    scientificExplanation: 'Nicotine interferes with calcium metabolism. Bone density improves with sustained abstinence',
    icon: 'fitness-outline',
    color: '#14B8A6',
    category: 'female',
    daysRequired: 180,
  },
  {
    id: 'fertility-boost-dip',
    timeframe: '12-26 Weeks',
    title: 'Fertility Boost',
    description: 'Improved reproductive health',
    scientificExplanation: 'Smokeless tobacco affects egg quality and implantation. Fertility improves within 3-6 months',
    icon: 'flower-outline',
    color: '#10B981',
    category: 'female',
    daysRequired: 90,
  },
];

export function getGenderSpecificBenefits(
  productType: string,
  gender: string | undefined,
  stats: ProgressStats
): GenderSpecificBenefit[] {
  const benefits: GenderSpecificBenefit[] = [];
  
  // Determine which shared benefits to use based on product type
  let sharedBenefits: Omit<GenderSpecificBenefit, 'achieved'>[] = [];
  
  if (productType === 'cigarettes' || productType === 'cigarette') {
    sharedBenefits = SHARED_CIGARETTE_BENEFITS;
  } else if (productType === 'vape' || productType === 'vaping' || productType === 'e-cigarette' || productType === 'ecig') {
    sharedBenefits = SHARED_VAPE_BENEFITS;
  } else if (productType === 'dip' || productType === 'chew' || productType === 'smokeless' || productType === 'dip_chew' || productType === 'chewing') {
    sharedBenefits = SHARED_DIP_BENEFITS;
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
  
  // Add gender-specific benefits based on product type
  if (productType === 'cigarettes' || productType === 'cigarette') {
    if (gender === 'male') {
      MALE_CIGARETTE_BENEFITS.forEach(benefit => {
        benefits.push({
          ...benefit,
          achieved: stats.daysClean >= benefit.daysRequired,
        });
      });
    } else if (gender === 'female') {
      FEMALE_CIGARETTE_BENEFITS.forEach(benefit => {
        benefits.push({
          ...benefit,
          achieved: stats.daysClean >= benefit.daysRequired,
        });
      });
    }
  } else if (productType === 'vape' || productType === 'vaping' || productType === 'e-cigarette' || productType === 'ecig') {
    if (gender === 'male') {
      MALE_VAPE_BENEFITS.forEach(benefit => {
        benefits.push({
          ...benefit,
          achieved: stats.daysClean >= benefit.daysRequired,
        });
      });
    } else if (gender === 'female') {
      FEMALE_VAPE_BENEFITS.forEach(benefit => {
        benefits.push({
          ...benefit,
          achieved: stats.daysClean >= benefit.daysRequired,
        });
      });
    }
  } else if (productType === 'pouches' || productType === 'nicotine_pouches') {
    if (gender === 'male') {
      MALE_POUCH_BENEFITS.forEach(benefit => {
        benefits.push({
          ...benefit,
          achieved: stats.daysClean >= benefit.daysRequired,
        });
      });
    } else if (gender === 'female') {
      FEMALE_POUCH_BENEFITS.forEach(benefit => {
        benefits.push({
          ...benefit,
          achieved: stats.daysClean >= benefit.daysRequired,
        });
      });
    }
  } else if (productType === 'dip' || productType === 'chew' || productType === 'smokeless' || productType === 'dip_chew' || productType === 'chewing') {
    if (gender === 'male') {
      MALE_DIP_BENEFITS.forEach(benefit => {
        benefits.push({
          ...benefit,
          achieved: stats.daysClean >= benefit.daysRequired,
        });
      });
    } else if (gender === 'female') {
      FEMALE_DIP_BENEFITS.forEach(benefit => {
        benefits.push({
          ...benefit,
          achieved: stats.daysClean >= benefit.daysRequired,
        });
      });
    }
  }
  
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
        return 'Your brain\'s control center has strengthened. You have better impulse control and decision-making abilities.';
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
        return 'Your brain\'s reward system has rebalanced. You\'re experiencing more natural pleasure and connection.';
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
      case 'Complete Health Transformation':
        return 'Congratulations on one year smoke-free! Your body has undergone incredible healing - from your lungs to your heart, brain to blood vessels. You\'ve proven you can live nicotine-free!';
      // Dip/Chew specific benefits
      case 'Mouth Sores Heal':
        return 'Those painful white patches and sores have completely healed. Your mouth is healthy again!';
      case 'Gum Tissue Recovers':
        return 'Your gums have regained their healthy pink color. No more recession or bleeding from tobacco damage.';
      case 'Taste Buds Regenerate':
        return 'Your taste buds have fully regenerated! Food has never tasted this good.';
      case '50% Lower Oral Cancer Risk':
        return 'Your oral cancer risk has dropped by half! Continued abstinence further reduces your risk.';
      case 'Stronger, Whiter Teeth':
        return 'Your teeth are stronger and naturally whiter. No more tobacco stains or enamel damage.';
      case 'Blood Pressure Normalizes':
        return 'Your blood pressure has returned to healthy levels. Your heart thanks you!';
      case 'Pancreatic Cancer Risk Drops':
        return 'Your pancreatic cancer risk has decreased significantly. Your body continues to heal.';
      case 'Lower Stroke Risk':
        return 'Your stroke risk has decreased dramatically. Blood vessels in your brain are healthier.';
      case 'Complete Oral Recovery':
        return 'Your mouth has completely healed from tobacco damage. You\'ve eliminated a major cancer risk!';
      case 'Testosterone Rebounds':
        return 'Your testosterone has rebounded to healthy levels. Natural hormone production is restored.';
      case 'Jaw & Facial Structure':
        return 'Your jaw joints have healed. No more TMJ pain or facial discomfort from constant chewing.';
      case 'Better Athletic Endurance':
        return 'Your athletic performance has improved dramatically. Oxygen delivery is optimized.';
      case 'Healthier Sperm':
        return 'Your sperm count and quality have significantly improved. Fertility is restored.';
      case 'Improved Sexual Function':
        return 'Blood flow has improved throughout your body. Sexual function is enhanced.';
      case 'Prostate Protection':
        return 'Your prostate cancer risk has decreased. Inflammation is reduced.';
      case 'Hormones Rebalance':
        return 'Your hormones have rebalanced naturally. Estrogen levels are healthy again.';

      case 'Clearer, Brighter Skin':
        return 'Your skin is glowing! Better blood flow has improved your complexion dramatically.';
      case 'Safer for Pregnancy':
        return 'Your body is now ready for a healthy pregnancy. Tobacco-related risks have decreased.';
      case 'Fertility Boost':
        return 'Your fertility has improved significantly. Reproductive health is restored.';
      // Vape-specific benefits
      case 'Lung Inflammation Reduces':
        return 'Your airways have healed from vapor damage. Breathing is easier and coughing has stopped.';
      case 'Vaping Lung Injury Risk Gone':
        return 'You\'re no longer at risk for EVALI - a serious lung condition from vaping that sent thousands to hospitals. Your lungs are healing from the chemical damage!';
      case 'Throat Irritation Heals':
        return 'Your throat has healed completely. No more burning, dryness, or irritation from vaping.';
      case 'Chemical Detoxification':
        return 'Your body has cleared out formaldehyde, acrolein, and other toxic vaping chemicals. You\'re detoxified!';
      case 'Lung Capacity Improves':
        return 'Your lung function has improved by up to 30%! Breathing is deeper and easier than ever.';
      case 'Heart Rhythm Stabilizes':
        return 'Your heart rhythm is normal again. No more palpitations or irregular beats from nicotine.';
      case 'Immune System Rebounds':
        return 'Your immune system is strong again. White blood cells are functioning optimally to protect you.';
      case 'Oral Health Improves':
        return 'Your gums have healed and saliva production is normal. No more dry mouth or gum disease risk.';
      case 'Full Respiratory Recovery':
        return 'Congratulations! Your lungs have completely recovered from vaping. Breathing capacity is 100% restored!';
      case 'Testosterone Increases':
        return 'Your testosterone levels have normalized. Energy, mood, and physical performance are optimized.';
      case 'Athletic Performance Boost':
        return 'Your athletic performance has improved dramatically. Oxygen uptake is 20% better than when vaping.';
      case 'Sperm Health Improves':
        return 'Your sperm count and quality have recovered. DNA damage from vaping has been repaired.';
      case 'Better Erectile Function':
        return 'Blood flow has normalized throughout your body. Erectile function is fully restored.';
      case 'Enhanced Muscle Growth':
        return 'Your muscles are growing and recovering properly. Protein synthesis is no longer impaired.';
      case 'Peak Cardiovascular Fitness':
        return 'Your cardiovascular fitness has peaked! VO2 max has increased by 25-30% since quitting.';
      case 'Regular Menstrual Cycles':
        return 'Your menstrual cycles have normalized. Hormones are balanced and predictable again.';
      case 'Clearer, Hydrated Skin':
        return 'Your skin is glowing with health! Hydration and elasticity have been restored.';
      case 'Healthier, Stronger Hair':
        return 'Your hair is healthier than ever. Better blood flow means stronger growth and less breakage.';
      case 'Fertility Enhancement':
        return 'Your fertility has improved significantly. Egg quality and ovulation are optimized.';
      case 'Safer Pregnancy Potential':
        return 'Your body is ready for a healthy pregnancy. Vaping-related risks have been eliminated.';
      case 'Stronger Bone Density':
        return 'Your bones are getting stronger. Calcium retention has improved significantly.';
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
    } else if (daysRemaining <= 365) {
      const weeks = Math.ceil(daysRemaining / 7);
      if (weeks <= 8) {
        return `${weeks} more weeks`;
      } else {
        const months = Math.round(daysRemaining / 30.44); // More accurate month calculation
        return months === 1 ? '1 more month' : `${months} more months`;
      }
    } else {
      const years = Math.round(daysRemaining / 365.25 * 10) / 10; // Round to 1 decimal
      if (isNaN(years) || years < 0.1) {
        // If years is too small or NaN, show months instead
        const months = Math.round(daysRemaining / 30.44);
        return months === 1 ? '1 more month' : `${months} more months`;
      }
      return years === 1 ? '1 more year' : `${years} more years`;
    }
  }
}; 