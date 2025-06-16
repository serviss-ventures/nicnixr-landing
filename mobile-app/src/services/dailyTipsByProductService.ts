import { NicotineProductType } from './personalizedContentService';

export interface DailyProductTip {
  id: string;
  day: number;
  title: string;
  content: string;
  actionableAdvice: string;
  productType: NicotineProductType;
  category: 'physical' | 'mental' | 'social' | 'milestone';
  urgencyLevel: 'low' | 'medium' | 'high';
  icon: string;
}

// Base tips that apply to all product types
const getBaseTips = (productType: NicotineProductType): DailyProductTip[] => {
  const productName = getProductName(productType);
  
  return [
    // Week 1
    {
      id: `${productType}_day_1`,
      day: 1,
      title: 'Day 1: The Beginning',
      content: `Your body is already starting to heal from ${productName}. In just 20 minutes, your heart rate and blood pressure drop to normal levels.`,
      actionableAdvice: 'When cravings hit, try the 4-7-8 breathing technique: Inhale for 4, hold for 7, exhale for 8. It activates your calming response.',
      productType,
      category: 'physical',
      urgencyLevel: 'high',
      icon: 'heart-outline',
    },
    {
      id: `${productType}_day_2`,
      day: 2,
      title: 'Day 2: Peak Challenge',
      content: 'Withdrawal symptoms may feel intense today. This is your brain recalibrating - a sign of healing, not weakness.',
      actionableAdvice: 'Set hourly mini-goals today. Each hour without nicotine is a victory worth celebrating.',
      productType,
      category: 'mental',
      urgencyLevel: 'high',
      icon: 'timer-outline',
    },
    {
      id: `${productType}_day_3`,
      day: 3,
      title: 'Day 3: The Summit',
      content: 'You\'re at peak withdrawal. After today, physical symptoms start decreasing. You\'re almost through the hardest part!',
      actionableAdvice: 'Clear your schedule if possible. Your only job today is to not use nicotine. Rest, hydrate, and be kind to yourself.',
      productType,
      category: 'physical',
      urgencyLevel: 'high',
      icon: 'flag-outline',
    },
    {
      id: `${productType}_day_4`,
      day: 4,
      title: 'Day 4: Turning Point',
      content: 'The worst is behind you! Your body has eliminated most nicotine. What remains are habits and psychological attachments.',
      actionableAdvice: 'Notice one thing that\'s easier today than yesterday. Your body is teaching you that you don\'t need nicotine.',
      productType,
      category: 'physical',
      urgencyLevel: 'medium',
      icon: 'trending-down',
    },
    {
      id: `${productType}_day_5`,
      day: 5,
      title: 'Day 5: New Patterns',
      content: 'Your brain is building new neural pathways. Each craving you overcome strengthens your quit.',
      actionableAdvice: 'Replace your old nicotine ritual with something positive: a walk, a healthy snack, or calling a friend.',
      productType,
      category: 'mental',
      urgencyLevel: 'medium',
      icon: 'swap-horizontal-outline',
    },
    {
      id: `${productType}_day_6`,
      day: 6,
      title: 'Day 6: Weekend Warrior',
      content: 'First weekend without nicotine! Social situations might feel different, but you\'re stronger than any trigger.',
      actionableAdvice: 'Plan smoke-free activities today. Keep busy, stay hydrated, and remember why you quit.',
      productType,
      category: 'social',
      urgencyLevel: 'medium',
      icon: 'people-outline',
    },
    {
      id: `${productType}_day_7`,
      day: 7,
      title: 'One Week Free!',
      content: 'You\'ve broken the physical addiction! Your success rate just increased dramatically. You\'re officially in recovery.',
      actionableAdvice: 'Calculate how much money you\'ve saved this week. Start a "quit jar" for something special.',
      productType,
      category: 'milestone',
      urgencyLevel: 'low',
      icon: 'trophy-outline',
    },
    // Week 2
    {
      id: `${productType}_day_8`,
      day: 8,
      title: 'Week 2 Begins',
      content: 'Energy levels stabilizing. Some people feel more tired, others more energetic. Both are normal healing responses.',
      actionableAdvice: 'Listen to your body. If tired, rest. If energetic, channel it into exercise or a project.',
      productType,
      category: 'physical',
      urgencyLevel: 'low',
      icon: 'battery-charging',
    },
    {
      id: `${productType}_day_9`,
      day: 9,
      title: 'Habit Disruption',
      content: 'You\'re successfully rewiring decades of neural programming. Each day strengthens your new identity as a non-user.',
      actionableAdvice: 'When you think "I need nicotine," correct it to "I\'m having a thought about nicotine." Thoughts pass.',
      productType,
      category: 'mental',
      urgencyLevel: 'low',
      icon: 'bulb-outline',
    },
    {
      id: `${productType}_day_10`,
      day: 10,
      title: 'Double Digits!',
      content: 'You\'ve outlasted 90% of quit attempts. Your brain chemistry is rebalancing beautifully.',
      actionableAdvice: 'Share your success with someone supportive. Your journey might inspire them too.',
      productType,
      category: 'social',
      urgencyLevel: 'low',
      icon: 'share-social',
    },
    {
      id: `${productType}_day_11`,
      day: 11,
      title: 'Breathing Easier',
      content: 'Your lung function is improving daily. Oxygen delivery to all organs is enhanced.',
      actionableAdvice: 'Take 5 deep breaths right now. Notice how much fuller and easier they feel than day 1.',
      productType,
      category: 'physical',
      urgencyLevel: 'low',
      icon: 'fitness',
    },
    {
      id: `${productType}_day_12`,
      day: 12,
      title: 'Mental Clarity',
      content: 'Brain fog lifting. Concentration and memory improving as acetylcholine receptors normalize.',
      actionableAdvice: 'Tackle a task that requires focus. Notice your improved mental stamina.',
      productType,
      category: 'mental',
      urgencyLevel: 'low',
      icon: 'bulb-outline',
    },
    {
      id: `${productType}_day_13`,
      day: 13,
      title: 'Lucky 13',
      content: 'You\'re developing genuine stress management skills. No more chemical crutch needed.',
      actionableAdvice: 'Next stressful moment: pause, breathe, then respond. You\'re learning real resilience.',
      productType,
      category: 'mental',
      urgencyLevel: 'low',
      icon: 'shield-checkmark',
    },
    {
      id: `${productType}_day_14`,
      day: 14,
      title: 'Two Weeks Strong!',
      content: 'Major milestone! Risk of relapse dropping significantly. Your quit is becoming your new normal.',
      actionableAdvice: 'Celebrate meaningfully today. You\'ve earned it! Treat yourself to something special (not nicotine!).',
      productType,
      category: 'milestone',
      urgencyLevel: 'low',
      icon: 'medal-outline',
    },
    // Week 3
    {
      id: `${productType}_day_15`,
      day: 15,
      title: 'Halfway to 30',
      content: 'Your cardiovascular system is thanking you. Blood pressure and circulation significantly improved.',
      actionableAdvice: 'Try physical activity you couldn\'t do while using nicotine. Feel the difference in your endurance.',
      productType,
      category: 'physical',
      urgencyLevel: 'low',
      icon: 'bicycle',
    },
    {
      id: `${productType}_day_21`,
      day: 21,
      title: 'Three Weeks - Habit Broken!',
      content: 'Science says 21 days to break a habit. You did it! Your brain has adapted to life without nicotine.',
      actionableAdvice: 'Reflect on how far you\'ve come. Write down three ways your life has improved.',
      productType,
      category: 'milestone',
      urgencyLevel: 'low',
      icon: 'star-outline',
    },
    {
      id: `${productType}_day_30`,
      day: 30,
      title: 'One Month Champion!',
      content: 'You\'re in the elite 5% who make it to 30 days. Your success is literally rewiring your brain for long-term freedom.',
      actionableAdvice: 'Share your story. Someone needs to hear that quitting is possible. You\'re proof.',
      productType,
      category: 'milestone',
      urgencyLevel: 'low',
      icon: 'ribbon-outline',
    },
  ];
};

// Product-specific tips
const getVapingTips = (): DailyProductTip[] => [
  {
    id: 'vape_day_16',
    day: 16,
    title: 'Lung Recovery Accelerating',
    content: 'Without vape aerosols, your lungs are clearing out accumulated particles. Breathing capacity increasing daily.',
    actionableAdvice: 'Do a "lung check": take the deepest breath you can. Compare to two weeks ago. Feel the improvement!',
    productType: 'vape',
    category: 'physical',
    urgencyLevel: 'low',
    icon: 'cloud-offline-outline',
  },
  {
    id: 'vape_day_18',
    day: 18,
    title: 'No More Battery Anxiety',
    content: 'Remember constantly checking battery levels and carrying chargers? You\'re free from device dependence.',
    actionableAdvice: 'List all the hassles you don\'t deal with anymore: charging, leaking, buying pods. Freedom feels good!',
    productType: 'vape',
    category: 'mental',
    urgencyLevel: 'low',
    icon: 'battery-dead-outline',
  },
];

const getCigaretteTips = (): DailyProductTip[] => [
  {
    id: 'cigarettes_day_17',
    day: 17,
    title: 'Taste and Smell Restored',
    content: 'Food tastes incredible now! Your taste buds and smell receptors have regenerated after cigarette damage.',
    actionableAdvice: 'Eat your favorite meal today. Really savor it. This is what food actually tastes like!',
    productType: 'cigarettes',
    category: 'physical',
    urgencyLevel: 'low',
    icon: 'restaurant',
  },
  {
    id: 'cigarettes_day_20',
    day: 20,
    title: 'No More Smoke Breaks',
    content: 'You\'re fully present in life now. No more interrupting activities to go outside for a cigarette.',
    actionableAdvice: 'Notice how you stay engaged in conversations and activities. Presence is a gift of quitting.',
    productType: 'cigarettes',
    category: 'social',
    urgencyLevel: 'low',
    icon: 'time',
  },
];

const getChewingTobaccoTips = (): DailyProductTip[] => [
  {
    id: 'chew_dip_day_19',
    day: 19,
    title: 'Oral Health Improving',
    content: 'Your gums are healing, and oral cancer risk is decreasing daily. Your mouth is thanking you!',
    actionableAdvice: 'Schedule a dental cleaning to celebrate your improving oral health. You\'ve earned a bright smile!',
    productType: 'chew_dip',
    category: 'physical',
    urgencyLevel: 'low',
    icon: 'happy',
  },
];

const getNicotinePouchTips = (): DailyProductTip[] => [
  {
    id: 'nicotine_pouches_day_22',
    day: 22,
    title: 'No More Hidden Use',
    content: 'You\'re free from discretely using pouches. No more hiding your habit or worrying about running out.',
    actionableAdvice: 'Appreciate the mental freedom of not constantly planning when and where to use. You\'re truly free!',
    productType: 'nicotine_pouches',
    category: 'mental',
    urgencyLevel: 'low',
    icon: 'eye-off',
  },
];

// Helper function to get product name
const getProductName = (productType: NicotineProductType): string => {
  const names = {
    vape: 'vaping',
    cigarettes: 'cigarettes',
    chew_dip: 'chewing tobacco',
    nicotine_pouches: 'nicotine pouches',
  };
  return names[productType] || 'nicotine';
};

// Maintenance tips for long-term quitters (30+ days)
const getMaintenanceTips = (productType: NicotineProductType): DailyProductTip[] => {
  const productName = getProductName(productType);
  
  // Base maintenance tips for all products
  const baseTips: DailyProductTip[] = [
    {
      id: `${productType}_maintenance_1`,
      day: 1,
      title: 'Your New Normal',
      content: `Life without ${productName} is your reality now. Your brain has fully adapted to producing its own dopamine naturally.`,
      actionableAdvice: 'Notice how you handle stress differently now. You\'ve built real coping skills that last.',
      productType,
      category: 'mental',
      urgencyLevel: 'low',
      icon: 'shield-checkmark',
    },
    {
      id: `${productType}_maintenance_2`,
      day: 2,
      title: 'Financial Freedom Continues',
      content: 'Every month nicotine-free adds up. You\'re building wealth instead of burning it.',
      actionableAdvice: 'Check your quit app savings. Consider investing that money in your future.',
      productType,
      category: 'milestone',
      urgencyLevel: 'low',
      icon: 'wallet',
    },
    {
      id: `${productType}_maintenance_3`,
      day: 3,
      title: 'Inspiration to Others',
      content: 'Your success story matters. Someone in your life is watching and thinking "maybe I can too."',
      actionableAdvice: 'Share a small win from your quit journey today. You never know who needs to hear it.',
      productType,
      category: 'social',
      urgencyLevel: 'low',
      icon: 'heart-circle',
    },
    {
      id: `${productType}_maintenance_4`,
      day: 4,
      title: 'Athletic Performance',
      content: 'Your cardiovascular system is functioning at peak capacity. Oxygen delivery is optimized.',
      actionableAdvice: 'Challenge yourself physically today. Feel the difference in your endurance.',
      productType,
      category: 'physical',
      urgencyLevel: 'low',
      icon: 'barbell',
    },
    {
      id: `${productType}_maintenance_5`,
      day: 5,
      title: 'Mental Clarity Maintained',
      content: 'Your focus and memory continue to outperform your nicotine days. This is permanent with abstinence.',
      actionableAdvice: 'Tackle a complex project today. Appreciate your clear thinking.',
      productType,
      category: 'mental',
      urgencyLevel: 'low',
      icon: 'bulb',
    },
    {
      id: `${productType}_maintenance_6`,
      day: 6,
      title: 'Immune System Strong',
      content: 'Your body fights off illness better without nicotine suppressing your immune system.',
      actionableAdvice: 'Notice how you recover from minor illnesses faster. Your body thanks you daily.',
      productType,
      category: 'physical',
      urgencyLevel: 'low',
      icon: 'shield',
    },
    {
      id: `${productType}_maintenance_7`,
      day: 7,
      title: 'Authentic Connections',
      content: 'Your relationships are deeper without nicotine interruptions. You\'re fully present.',
      actionableAdvice: 'Have a meaningful conversation today without watching the clock for your next break.',
      productType,
      category: 'social',
      urgencyLevel: 'low',
      icon: 'people',
    },
    {
      id: `${productType}_maintenance_8`,
      day: 8,
      title: 'Sleep Quality Wins',
      content: 'Your REM sleep is optimized. Deep, restorative sleep is your new normal.',
      actionableAdvice: 'Notice how you wake up refreshed. This is what real sleep feels like.',
      productType,
      category: 'physical',
      urgencyLevel: 'low',
      icon: 'moon',
    },
    {
      id: `${productType}_maintenance_9`,
      day: 9,
      title: 'Confidence Earned',
      content: 'You did something most people can\'t. That confidence applies to every area of life.',
      actionableAdvice: 'Apply your quit success to another challenge. You\'ve proven you can do hard things.',
      productType,
      category: 'mental',
      urgencyLevel: 'low',
      icon: 'trophy',
    },
    {
      id: `${productType}_maintenance_10`,
      day: 10,
      title: 'Long-Term Health Gains',
      content: 'Your risk of heart disease and stroke continues to decrease. You\'re investing in decades of health.',
      actionableAdvice: 'Schedule a check-up. Share your quit success with your doctor.',
      productType,
      category: 'physical',
      urgencyLevel: 'low',
      icon: 'medical',
    },
  ];
  
  // Add product-specific maintenance tips
  const productSpecificTips = getProductSpecificMaintenanceTips(productType);
  
  return [...baseTips, ...productSpecificTips];
};

// Product-specific maintenance tips
const getProductSpecificMaintenanceTips = (productType: NicotineProductType): DailyProductTip[] => {
  switch (productType) {
    case 'vape':
      return [
        {
          id: 'vape_maintenance_special_1',
          day: 11,
          title: 'No More Device Anxiety',
          content: 'Remember constantly worrying about battery life and leaking pods? That stress is gone forever.',
          actionableAdvice: 'Appreciate the mental freedom of not managing a device. Your mind has more space for what matters.',
          productType: 'vape',
          category: 'mental',
          urgencyLevel: 'low',
          icon: 'battery-full-outline',
        },
        {
          id: 'vape_maintenance_special_2',
          day: 12,
          title: 'Lung Recovery Complete',
          content: 'Your lungs have cleared the accumulated vaping residue. Breathing capacity is fully restored.',
          actionableAdvice: 'Take a deep breath. This is what healthy lungs feel like.',
          productType: 'vape',
          category: 'physical',
          urgencyLevel: 'low',
          icon: 'fitness',
        },
        {
          id: 'vape_maintenance_special_3',
          day: 13,
          title: 'Social Freedom',
          content: 'No more stepping outside to vape or finding "vape-friendly" places. You belong everywhere.',
          actionableAdvice: 'Enjoy an indoor event fully. No more missing moments to go vape.',
          productType: 'vape',
          category: 'social',
          urgencyLevel: 'low',
          icon: 'location',
        },
      ];
      
    case 'cigarettes':
      return [
        {
          id: 'cigarettes_maintenance_special_1',
          day: 11,
          title: 'Smell and Taste Perfected',
          content: 'Your senses are permanently enhanced. Food, flowers, fresh air - everything is richer.',
          actionableAdvice: 'Cook your favorite meal. Savor every flavor you couldn\'t fully taste before.',
          productType: 'cigarettes',
          category: 'physical',
          urgencyLevel: 'low',
          icon: 'restaurant',
        },
        {
          id: 'cigarettes_maintenance_special_2',
          day: 12,
          title: 'No More Smoke Breaks',
          content: 'Your day flows naturally without cigarette interruptions. Productivity is effortless.',
          actionableAdvice: 'Notice how you complete tasks without "smoke break" interruptions. Time is yours.',
          productType: 'cigarettes',
          category: 'mental',
          urgencyLevel: 'low',
          icon: 'time',
        },
        {
          id: 'cigarettes_maintenance_special_3',
          day: 13,
          title: 'Clean Image',
          content: 'No smoke smell on clothes, hair, or breath. You always make a fresh impression.',
          actionableAdvice: 'Enjoy close conversations without worrying about cigarette breath. Confidence is natural.',
          productType: 'cigarettes',
          category: 'social',
          urgencyLevel: 'low',
          icon: 'sparkles',
        },
      ];
      
    case 'chew_dip':
      return [
        {
          id: 'chew_dip_maintenance_special_1',
          day: 11,
          title: 'Oral Health Restored',
          content: 'Your gums are healthy, teeth stronger. Oral cancer risk dropping daily.',
          actionableAdvice: 'Smile confidently. Your oral health improvement is visible.',
          productType: 'chew_dip',
          category: 'physical',
          urgencyLevel: 'low',
          icon: 'happy',
        },
        {
          id: 'chew_dip_maintenance_special_2',
          day: 12,
          title: 'No More Concealment',
          content: 'No more spitting, hiding cups, or being self-conscious. Full social freedom.',
          actionableAdvice: 'Engage in conversations without planning your next spit. Freedom feels good.',
          productType: 'chew_dip',
          category: 'social',
          urgencyLevel: 'low',
          icon: 'chatbubbles',
        },
      ];
      
    case 'nicotine_pouches':
      return [
        {
          id: 'nicotine_pouches_maintenance_special_1',
          day: 11,
          title: 'No More Hidden Habit',
          content: 'Your secret is gone because there\'s nothing to hide. Authentic living.',
          actionableAdvice: 'Enjoy the freedom of not constantly managing pouches. Simplicity is powerful.',
          productType: 'nicotine_pouches',
          category: 'mental',
          urgencyLevel: 'low',
          icon: 'eye',
        },
        {
          id: 'nicotine_pouches_maintenance_special_2',
          day: 12,
          title: 'Gum Health Improved',
          content: 'Your gums have healed from constant pouch irritation. Oral health is optimal.',
          actionableAdvice: 'Notice how your gums feel healthier. No more irritation or recession.',
          productType: 'nicotine_pouches',
          category: 'physical',
          urgencyLevel: 'low',
          icon: 'medical',
        },
      ];
      
    default:
      return [];
  }
};

// Main function to get daily tip
export const getDailyTipByProduct = (
  dayNumber: number,
  productType: NicotineProductType
): DailyProductTip | null => {
  // For days 1-30, use the early recovery tips
  if (dayNumber <= 30) {
    const allTips = getBaseTips(productType);
    
    // Add product-specific tips for early recovery
    switch (productType) {
      case 'vape':
        allTips.push(...getVapingTips());
        break;
      case 'cigarettes':
        allTips.push(...getCigaretteTips());
        break;
      case 'chew_dip':
        allTips.push(...getChewingTobaccoTips());
        break;
      case 'nicotine_pouches':
        allTips.push(...getNicotinePouchTips());
        break;
    }
    
    // Find tip for specific day
    const exactTip = allTips.find(tip => tip.day === dayNumber);
    if (exactTip) return exactTip;
    
    // For days without specific tips, find the closest previous day
    const previousTips = allTips.filter(tip => tip.day < dayNumber);
    if (previousTips.length > 0) {
      return previousTips[previousTips.length - 1];
    }
    
    // Default to day 1
    return allTips.find(tip => tip.day === 1) || null;
  }
  
  // For days 31+, use maintenance tips
  const maintenanceTips = getMaintenanceTips(productType);
  const tipIndex = (dayNumber - 31) % maintenanceTips.length;
  return maintenanceTips[tipIndex];
};

// Function to get tip for today
export const getTodaysProductTip = (
  daysClean: number,
  productType: NicotineProductType
): DailyProductTip | null => {
  // Day 0 should show day 1 tip
  const effectiveDay = daysClean === 0 ? 1 : daysClean;
  return getDailyTipByProduct(effectiveDay, productType);
}; 