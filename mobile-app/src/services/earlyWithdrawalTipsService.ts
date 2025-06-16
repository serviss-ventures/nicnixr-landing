import { NicotineProductType } from './personalizedContentService';

export interface EarlyWithdrawalTip {
  id: string;
  timeframe: string; // e.g., "hour_1", "hour_2-3", "day_1_morning"
  title: string;
  content: string;
  category: 'physical' | 'social' | 'mental' | 'situational';
  urgencyLevel: 'low' | 'medium' | 'high';
  actionableAdvice: string;
  copingStrategy?: string;
  socialTip?: string;
  mentalHealthTip?: string;
  icon: string;
  color: string;
  triggerWarning?: string;
}

export interface WithdrawalTimeline {
  hour: number;
  symptoms: string[];
  intensity: number; // 1-10
  copingStrategies: string[];
}

// Hour-by-hour withdrawal timeline based on research
export const withdrawalTimeline: WithdrawalTimeline[] = [
  {
    hour: 0.5,
    symptoms: ['Mild cravings', 'Slightly empty feeling'],
    intensity: 2,
    copingStrategies: ['Deep breathing', 'Celebrate starting your quit journey'],
  },
  {
    hour: 1,
    symptoms: ['Cravings intensify', 'Irritability begins', 'Heart rate slows'],
    intensity: 3,
    copingStrategies: ['4-7-8 breathing technique', 'Text a supportive friend'],
  },
  {
    hour: 2,
    symptoms: ['Anxiety emerges', 'Difficulty concentrating', '50% nicotine-free'],
    intensity: 4,
    copingStrategies: ['Take a short walk', 'Listen to calming music'],
  },
  {
    hour: 3,
    symptoms: ['Mood swings', 'Increased anxiety', 'Restlessness'],
    intensity: 5,
    copingStrategies: ['Practice mindfulness', 'Engage in a hobby'],
  },
  {
    hour: 6,
    symptoms: ['97% nicotine-free', 'Cravings peak and dip', 'Fatigue'],
    intensity: 5,
    copingStrategies: ['Healthy snack', 'Power nap if possible'],
  },
  {
    hour: 12,
    symptoms: ['Sleep disruption possible', 'Continued cravings', 'Irritability'],
    intensity: 6,
    copingStrategies: ['Evening routine', 'Chamomile tea', 'Journal feelings'],
  },
  {
    hour: 24,
    symptoms: ['Nicotine-free', 'Physical symptoms intensify', 'Mental fog'],
    intensity: 7,
    copingStrategies: ['Celebrate 24 hours', 'Extra self-care', 'Support group'],
  },
  {
    hour: 48,
    symptoms: ['Near peak withdrawal', 'Strong cravings', 'Emotional volatility'],
    intensity: 8,
    copingStrategies: ['Remind yourself: tomorrow is easier', 'Avoid triggers'],
  },
  {
    hour: 72,
    symptoms: ['Peak withdrawal', 'Maximum discomfort', 'But turning point!'],
    intensity: 9,
    copingStrategies: ['You\'re at the summit!', 'It only gets easier from here'],
  },
];

// Enhanced early withdrawal tips with social and mental health focus
export const getEarlyWithdrawalTips = (
  hours: number,
  productType: NicotineProductType
): EarlyWithdrawalTip[] => {
  const tips: EarlyWithdrawalTip[] = [];
  
  // Product type will be used for more specific tips in future updates
  // Currently providing universal tips that work for all nicotine products
  
  // First 72 hours - hour by hour support
  if (hours <= 72) {
    // Hour 0-3: Initial withdrawal
    if (hours <= 3) {
      tips.push({
        id: `${productType}_hour_1_physical`,
        timeframe: 'hour_1',
        title: 'Your Body Is Already Healing',
        content: 'That empty feeling is real - and it\'s your first victory. Your heart rate is already normalizing.',
        category: 'physical',
        urgencyLevel: 'medium',
        actionableAdvice: 'Cold water on your face activates your vagus nerve - instant calm. Try it now.',
        copingStrategy: 'Movement helps: Walk to the end of your street and back. Your brain will thank you.',
        icon: 'time',
        color: '#06B6D4',
      });
      
      tips.push({
        id: 'hour_1_social',
        timeframe: 'hour_1',
        title: 'The Social Game Plan',
        content: 'Your friends might not get it yet. That\'s okay - this is your moment.',
        category: 'social',
        urgencyLevel: 'high',
        actionableAdvice: 'Have your response ready: "Taking a break to see how I feel." Simple. No debate needed.',
        socialTip: 'Text one person who\'ll celebrate this with you. Having one ally changes everything.',
        icon: 'people',
        color: '#F59E0B',
      });
      
      tips.push({
        id: 'hour_1_mental',
        timeframe: 'hour_1',
        title: 'Yes, You Feel Different',
        content: 'That edge you\'re feeling? It\'s withdrawal, and it\'s intense. Anyone who says otherwise hasn\'t been there.',
        category: 'mental',
        urgencyLevel: 'medium',
        actionableAdvice: 'Put on your favorite song. Seriously. Music hits different right now - use it.',
        mentalHealthTip: 'You\'re not broken. Your brain is recalibrating. This is the hardest part.',
        icon: 'happy',
        color: '#8B5CF6',
      });
    }
    
    // Hour 4-8: Mood swing zone
    if (hours > 3 && hours <= 8) {
      tips.push({
        id: 'hour_4_8_physical',
        timeframe: 'hour_4-8',
        title: 'The Chemical Storm',
        content: 'Your dopamine is crashing. The mood swings are chemical, not personal failure.',
        category: 'physical',
        urgencyLevel: 'high',
        actionableAdvice: 'Ice water. Drink it slowly. Your nervous system needs the reset.',
        copingStrategy: 'Take a shower. Any temperature. Water grounds you when nothing else will.',
        icon: 'trending-up',
        color: '#10B981',
      });
      
      tips.push({
        id: 'hour_4_8_social',
        timeframe: 'hour_4-8',
        title: 'Lunch Break Victory',
        content: 'Usual vape break time? Create a new ritual!',
        category: 'social',
        urgencyLevel: 'high',
        actionableAdvice: 'Go somewhere new for lunch - new environment, no triggers',
        socialTip: 'If asked to vape: "I\'m good, trying something new today"',
        triggerWarning: 'Bathroom breaks are high-risk - have a plan',
        icon: 'restaurant',
        color: '#F59E0B',
      });
      
      tips.push({
        id: 'hour_4_8_mental',
        timeframe: 'hour_4-8',
        title: 'The Anxiety Wave',
        content: 'If you\'re anxious, you\'re on schedule. Your brain is looking for its fix.',
        category: 'mental',
        urgencyLevel: 'high',
        actionableAdvice: 'Name five things you can see right now. Ground yourself in this exact moment.',
        mentalHealthTip: 'This anxiety has an expiration date. Usually 15-20 minutes per wave.',
        icon: 'time-outline',
        color: '#8B5CF6',
      });
    }
    
    // Hour 9-24: First day completion
    if (hours > 8 && hours <= 24) {
      tips.push({
        id: 'hour_9_24_physical',
        timeframe: 'hour_9-24',
        title: 'Almost Nicotine-Free!',
        content: 'You\'re 97% nicotine-free! Your body is doing amazing work.',
        category: 'physical',
        urgencyLevel: 'medium',
        actionableAdvice: 'Prep for bed: Warm shower, chamomile tea, no screens',
        copingStrategy: 'If you can\'t sleep, celebrate - you\'re healing!',
        icon: 'bedtime',
        color: '#06B6D4',
      });
      
      tips.push({
        id: 'hour_9_24_social',
        timeframe: 'hour_9-24',
        title: 'Evening Challenge Mode',
        content: 'Evening = high trigger time. You\'ve got strategies!',
        category: 'social',
        urgencyLevel: 'high',
        actionableAdvice: 'Plans tonight? Choose smoke-free venues or have an exit strategy',
        socialTip: 'Tell one person about your 24-hour goal - accountability magic',
        icon: 'nightlight',
        color: '#F59E0B',
      });
      
      tips.push({
        id: 'hour_9_24_mental',
        timeframe: 'hour_9-24',
        title: 'Day 1 Victory Lap',
        content: 'You\'re crushing it! Celebrate every small win.',
        category: 'mental',
        urgencyLevel: 'low',
        actionableAdvice: 'Write down 3 things that were easier than expected today',
        mentalHealthTip: 'Can\'t focus? Break tasks into 15-min chunks with rewards',
        icon: 'emoji-events',
        color: '#8B5CF6',
      });
    }
    
    // Day 2 (hours 24-48): Intensity building
    if (hours > 24 && hours <= 48) {
      tips.push({
        id: 'day_2_morning',
        timeframe: 'day_2_morning',
        title: 'Day 2: The Real Challenge',
        content: 'Woke up cranky? Normal! Your brain is recalibrating without its morning nicotine.',
        category: 'physical',
        urgencyLevel: 'high',
        actionableAdvice: 'Cold water on face + 5 deep breaths before anything else',
        copingStrategy: 'Headache? Hydrate! Your body is detoxing',
        icon: 'wb-sunny',
        color: '#F59E0B',
      });
      
      tips.push({
        id: 'day_2_social',
        timeframe: 'day_2_afternoon',
        title: 'Peer Pressure Peak Day',
        content: 'Friends might test your resolve today. Be ready!',
        category: 'social',
        urgencyLevel: 'high',
        actionableAdvice: 'Practice saying: "Nah, I\'m good" + immediate subject change',
        socialTip: 'Share your $ saved already - makes it real for others',
        triggerWarning: 'Avoid usual hangout spots if possible today',
        icon: 'group',
        color: '#EF4444',
      });
      
      tips.push({
        id: 'day_2_mental',
        timeframe: 'day_2_evening',
        title: 'Mood Swings Are Withdrawal',
        content: 'Feeling like a different person? It\'s not you, it\'s nicotine withdrawal.',
        category: 'mental',
        urgencyLevel: 'high',
        actionableAdvice: 'Set phone reminder: "This feeling is temporary and I\'m healing"',
        mentalHealthTip: 'Depression/anxiety peak at day 3 then improve rapidly',
        icon: 'trending-down',
        color: '#8B5CF6',
      });
    }
    
    // Day 3 (hours 48-72): Peak withdrawal
    if (hours > 48 && hours <= 72) {
      tips.push({
        id: 'day_3_morning',
        timeframe: 'day_3_morning',
        title: 'Day 3: The Summit',
        content: 'Statistically, this is peak withdrawal. You\'re not imagining it - this is the hardest day.',
        category: 'physical',
        urgencyLevel: 'high',
        actionableAdvice: 'Clear your schedule if possible. Your only job today is to not use nicotine.',
        copingStrategy: 'Every hour you survive today is a massive win. Set hourly alarms to celebrate.',
        icon: 'flag-outline',
        color: '#EF4444',
      });
      
      tips.push({
        id: 'day_3_social',
        timeframe: 'day_3_afternoon',
        title: 'Social Isolation Shield',
        content: 'It\'s OK to avoid triggers today. Protect your quit!',
        category: 'social',
        urgencyLevel: 'high',
        actionableAdvice: 'Text friends: "Taking a me day, talk tomorrow!"',
        socialTip: 'If you must socialize, have an escape plan ready',
        triggerWarning: 'Peak day = peak vulnerability to peer pressure',
        icon: 'shield',
        color: '#F59E0B',
      });
      
      tips.push({
        id: 'day_3_mental',
        timeframe: 'day_3_evening',
        title: 'The Summit Moment',
        content: 'You\'re at peak withdrawal RIGHT NOW. It\'s all downhill from here!',
        category: 'mental',
        urgencyLevel: 'medium',
        actionableAdvice: 'Visualize tomorrow: Easier breathing, calmer mind, proud feeling',
        mentalHealthTip: 'Brain fog and depression are at maximum - tomorrow improves!',
        icon: 'flag',
        color: '#10B981',
      });
    }
  }
  
  // Days 4-30: The full first month journey
  if (hours > 72 && hours <= 720) { // Up to 30 days
    const dayNumber = Math.floor(hours / 24);
    
    tips.push({
      id: `day_${dayNumber}_physical`,
      timeframe: `day_${dayNumber}`,
      title: `Day ${dayNumber}: ${getDayTitle(dayNumber)}`,
      content: getDayContent(dayNumber),
      category: 'physical',
      urgencyLevel: getDayUrgency(dayNumber),
      actionableAdvice: getDayAdvice(dayNumber),
      copingStrategy: getDayCopingStrategy(dayNumber),
      icon: getDayIcon(dayNumber),
      color: '#10B981',
    });
    
    tips.push({
      id: `day_${dayNumber}_social`,
      timeframe: `day_${dayNumber}`,
      title: getSocialTitle(dayNumber),
      content: getSocialContent(dayNumber),
      category: 'social',
      urgencyLevel: 'medium',
      actionableAdvice: getSocialAdvice(dayNumber),
      socialTip: getSocialTip(dayNumber),
      icon: 'people-outline',
      color: '#F59E0B',
    });
    
    tips.push({
      id: `day_${dayNumber}_mental`,
      timeframe: `day_${dayNumber}`,
      title: getMentalTitle(dayNumber),
      content: getMentalContent(dayNumber),
      category: 'mental',
      urgencyLevel: 'low',
      actionableAdvice: getMentalAdvice(dayNumber),
      mentalHealthTip: getMentalTip(dayNumber),
      icon: 'brain',
      color: '#8B5CF6',
    });
  }
  
  return tips;
};

// Helper functions for day-specific content
function getDayTitle(day: number): string {
  const titles: { [key: number]: string } = {
    4: 'The Turn Around',
    5: 'New Patterns',
    6: 'Weekend Warrior',
    7: 'One Week Strong',
    8: 'Second Wind',
    9: 'Neural Rewiring',
    10: 'Double Digits',
    11: 'Steady Progress',
    12: 'Building Strength',
    13: 'Lucky 13',
    14: 'Two Weeks Free',
    15: 'Halfway to 30',
    16: 'Sweet 16',
    17: 'Habit Breaking',
    18: 'New Normal',
    19: 'Almost 20',
    20: 'Major Milestone',
    21: 'Three Weeks',
    22: 'Cruising',
    23: 'Momentum',
    24: 'Strong Foundation',
    25: 'Quarter Century',
    26: 'Almost There',
    27: 'Final Push',
    28: 'Four Weeks',
    29: 'Victory Eve',
    30: 'One Month Free',
  };
  return titles[day] || `Day ${day}`;
}

function getDayContent(day: number): string {
  const content: { [key: number]: string } = {
    4: 'The worst is behind you. Your dopamine receptors are starting to upregulate.',
    5: 'Cravings are becoming psychological, not physical. Big difference.',
    6: 'First weekend clean. Your brain is learning it doesn\'t need nicotine for fun.',
    7: 'Physical addiction: broken. What remains are habits and memories.',
    8: 'Energy surges are normal now. Your body is remembering how to self-regulate.',
    9: 'Neural pathways are literally rewiring. Science says 21 days to break a habit - you\'re almost halfway.',
    10: 'Double digits hit different. You\'ve outlasted 90% of quit attempts.',
    11: 'That random intense craving? It\'s your brain testing you. You passed.',
    12: 'Sleep quality improving dramatically. REM cycles normalizing.',
    13: 'Unlucky? Nah. You\'re crushing what most people can\'t even start.',
    14: 'Two weeks = major brain chemistry shifts. Acetylcholine receptors normalizing.',
    15: 'Halfway to a month. The hardest half is already done.',
    16: 'Taste and smell fully returned. Food hits different now, doesn\'t it?',
    17: 'Old triggers losing power. That morning coffee doesn\'t need nicotine anymore.',
    18: 'Three weeks minus three days. Your new normal is nicotine-free.',
    19: 'Cardiovascular improvements measurable. Heart rate variability improved.',
    20: 'Twenty days of proving you\'re stronger than a chemical.',
    21: 'Three weeks! Official habit-breaking territory. Your brain has adapted.',
    22: 'Cruise control engaged. What felt impossible on day 1 is now routine.',
    23: 'Random cravings are just echoes now. Ghost signals from old patterns.',
    24: 'Your prefrontal cortex has regained full control over impulses.',
    25: '25 days of choosing yourself. That\'s 600 hours of victory.',
    26: 'Four days from a month. You\'re in elite company now.',
    27: 'The final stretch. Your success rate just hit 95%.',
    28: 'Four weeks of freedom. Your risk of relapse just dropped by 80%.',
    29: 'Tomorrow you join the 5% who make it to 30 days. Sleep well, champion.',
    30: 'ONE MONTH. You\'re officially a non-user. This is who you are now.',
  };
  return content[day] || `Day ${day}: Still winning. Still healing.`;
}

function getDayAdvice(day: number): string {
  const advice: { [key: number]: string } = {
    4: 'Go for a run or bike ride. Your lungs can actually handle it now.',
    5: 'Replace your vape break with a 2-minute meditation. Same pause, better outcome.',
    6: 'Hit a restaurant you avoided because of no-vaping rules. Enjoy the freedom.',
    7: 'Calculate your savings so far. Transfer it to a "reward yourself" fund.',
    8: 'Deep clean your car/room. Remove all traces of the old you.',
    9: 'Start that workout routine. Your cardiovascular system is ready.',
    10: 'Text everyone who supported you. Share your double-digit victory.',
    11: 'Notice your breathing during stairs. No more winded feeling.',
    12: 'Try a new hobby that requires focus. Your concentration is back.',
    13: 'Document how you feel in a voice memo. You\'ll want to remember this.',
    14: 'Celebrate two weeks with something you couldn\'t afford when buying nicotine.',
    15: 'Take a selfie. Compare it to day 1. Your skin is already clearer.',
    16: 'Cook something aromatic. Your taste buds are fully online now.',
    17: 'Write down your top 3 triggers and how you beat them. Own your strategies.',
    18: 'Join an online community of quitters. Share your wisdom.',
    19: 'Schedule that dental cleaning. Show off your improving oral health.',
    20: 'Buy something with 20 days of savings. Make it meaningful.',
    21: 'Share your story with someone who\'s thinking about quitting.',
    22: 'Notice how you handle stress now. You\'ve built new coping mechanisms.',
    23: 'Plan something for day 30. You\'ve earned a real celebration.',
    24: 'Reflect on your worst day so far. Notice how you survived it.',
    25: 'Calculate 25 days of not poisoning yourself. The numbers are staggering.',
    26: 'Prepare your day 30 announcement. You\'re about to inspire people.',
    27: 'List every positive change you\'ve noticed. It\'s longer than you think.',
    28: 'Four weeks of data: track your improved sleep, mood, and energy.',
    29: 'Write a letter to your day 1 self. Tell them it gets so much better.',
    30: 'Post your success. Celebrate publicly. You\'ve earned the victory lap.',
  };
  return advice[day] || 'Keep building your nicotine-free life. You\'re doing it.';
}

function getSocialContent(day: number): string {
  const content: { [key: number]: string } = {
    4: 'People are noticing you\'re different. You\'re more present, less distracted.',
    5: 'That friend who still vapes? You\'re not judging, you\'re just free.',
    6: 'Weekend = social pressure cooker. You\'ve got tools now.',
    7: 'You\'re becoming the friend who proved it\'s possible.',
    8: 'Work breaks feel weird without the vape crew? Normal. It passes.',
    9: 'Your quit is making others question their habit. That\'s powerful.',
    10: 'Double digits makes you credible. People start asking how you did it.',
    11: 'That FOMO about smoke breaks? It\'s fading to JOMO (joy of missing out).',
    12: 'Social anxiety without nicotine is actually lower. Science backs this.',
    13: 'Friday the 13th? More like lucky day 13 of inspiring others.',
    14: 'Two weeks in, your social circle is adjusting to the new you.',
    15: 'Party this weekend? You\'ve handled them before. You\'ve got this.',
    16: 'Dating? You smell better, taste better, and have more confidence.',
    17: 'Your success is making waves. Someone\'s quitting because of you.',
    18: 'Workplace dynamics shifting? You\'re not the "vape break" person anymore.',
    19: 'Social situations are just... situations now. No planning around nicotine.',
    20: 'Your quit story is getting impressive. People want to hear it.',
    21: 'Three weeks of being fully present in conversations. Game changer.',
    22: 'That person who said you\'d never quit? Time for a subtle flex.',
    23: 'Your social energy isn\'t depleted by withdrawal anymore. Feel the difference?',
    24: 'New friends don\'t even know you as someone who used nicotine. Wild.',
    25: 'Quarter-way to 100 days. Your social identity has completely shifted.',
    26: 'Weekend plans don\'t revolve around "can I vape there?" anymore.',
    27: 'People asking for quit tips? You\'re the expert now.',
    28: 'Four weeks of authentic social connections. No chemical buffer needed.',
    29: 'Tomorrow\'s victory will inspire at least one person to start their journey.',
    30: 'You\'re the success story others will reference. Own that impact.',
  };
  return content[day] || 'Every day nicotine-free is a day of authentic connection.';
}

// New helper functions for extended functionality
function getDayUrgency(day: number): 'low' | 'medium' | 'high' {
  if (day <= 7) return 'medium';
  if (day <= 14) return 'low';
  return 'low';
}

function getDayCopingStrategy(day: number): string {
  const strategies: { [key: number]: string } = {
    4: 'Breathing exercises are your superpower now. Use them.',
    5: 'That craving? Time it. Most last under 3 minutes.',
    6: 'Weekend strategy: Stay busy, stay hydrated, stay proud.',
    7: 'Celebrate every small win today. You\'ve earned it.',
    8: 'Energy crashes are normal. Rest without guilt.',
    9: 'Your brain is literally rewiring. Be patient with yourself.',
    10: 'Cravings now are habits, not addiction. Important difference.',
    11: 'Unexpected trigger? You have tools. Use them.',
    12: 'Sleep issues? They\'re temporary. Stick to a routine.',
    13: 'Feel emotions more intensely? You\'re not numbing anymore.',
    14: 'Two weeks = new neural pathways forming. Science is on your side.',
    15: 'Halfway milestone. Whatever you\'re doing is working.',
    16: 'Random nostalgia for nicotine? It\'s just your brain testing.',
    17: 'Each passed craving makes the next one weaker.',
    18: 'You\'re building resilience most people never develop.',
    19: 'Stress without nicotine? You\'re learning real coping.',
    20: 'Your success rate is now statistically significant.',
    21: 'Habit officially broken. Now it\'s just maintenance.',
    22: 'Cruise control doesn\'t mean no vigilance. Stay aware.',
    23: 'Your new normal is everyone else\'s extraordinary.',
    24: 'Trigger moments are rare now. Trust your training.',
    25: 'You\'ve proven you can do hard things. Remember this.',
    26: 'Final stretch mindset: Don\'t fumble at the goal line.',
    27: 'Your quit has momentum. Let it carry you.',
    28: 'Four weeks of data proves: you don\'t need nicotine.',
    29: 'Tomorrow is huge. Rest well, warrior.',
    30: 'You did it. The hard part is officially over.',
  };
  return strategies[day] || 'Trust the process. You\'ve come too far to stop now.';
}

function getDayIcon(day: number): string {
  const icons: { [key: number]: string } = {
    7: 'trophy-outline',
    14: 'medal-outline',
    21: 'star-outline',
    30: 'ribbon-outline',
  };
  if (icons[day]) return icons[day];
  if (day <= 10) return 'trending-up';
  if (day <= 20) return 'pulse-outline';
  return 'checkmark-circle-outline';
}

function getSocialTitle(day: number): string {
  const titles: { [key: number]: string } = {
    4: 'The Social Shift',
    5: 'New Dynamics',
    6: 'Weekend Warrior',
    7: 'Inspiration Mode',
    10: 'Double Digit Influence',
    14: 'Social Identity 2.0',
    21: 'Three Week Trendsetter',
    30: 'The Success Story',
  };
  return titles[day] || 'Social Evolution';
}

function getMentalTitle(day: number): string {
  const titles: { [key: number]: string } = {
    4: 'Mental Clarity',
    5: 'Emotional Reset',
    7: 'Psychological Freedom',
    10: 'Mind Over Matter',
    14: 'Neural Victory',
    21: 'Mental Mastery',
    30: 'Complete Transformation',
  };
  return titles[day] || 'Mental Strength';
}

function getSocialAdvice(day: number): string {
  const advice: { [key: number]: string } = {
    4: 'Drop a casual "I don\'t vape anymore" in conversation. Watch reactions.',
    5: 'Decline a vape offer with confidence: "I\'m good, thanks."',
    6: 'Choose the non-smoking section everywhere. You belong there now.',
    7: 'Post that one-week milestone. Someone needs to see it\'s possible.',
    8: 'Suggest active hangouts instead of usual static vape sessions.',
    9: 'When work stress hits, walk to a colleague instead of the vape spot.',
    10: 'Host a smoke-free gathering. Set the new standard.',
    11: 'If someone doubts your quit, smile. You know the truth.',
    12: 'Replace "smoke break" with "fresh air break" in your vocabulary.',
    13: 'Be the friend who suggests the non-vaping venue. Lead the way.',
    14: 'Two weeks deserves recognition. Let people congratulate you.',
    15: 'That group chat about vaping? Time to mute or exit.',
    16: 'Plan a date without worrying about vape breaks. Freedom.',
    17: 'When stressed at social events, step outside for air, not nicotine.',
    18: 'Start introducing yourself as a non-smoker. It\'s true now.',
    19: 'Offer support to someone trying to quit. Pay it forward.',
    20: 'Celebrate 20 days with people who supported your journey.',
    21: 'Share specific benefits you\'ve noticed. Make it real for others.',
    22: 'Handle social stress with your new tools. Show them it works.',
    23: 'Be vocal about feeling better. Your energy is contagious.',
    24: 'When old vape buddies meet up, go and show them it\'s possible.',
    25: 'Your quit might be the sign someone was waiting for. Be visible.',
    26: 'Plan your 30-day announcement. Make it memorable.',
    27: 'Connect with other quitters online. Share strength.',
    28: 'Your social circle has evolved. Notice who truly supports you.',
    29: 'Prepare to inspire. Your story matters more than you know.',
    30: 'Change your social profiles. "Ex-smoker" or "Nicotine-free since..."',
  };
  return advice[day] || 'Every interaction nicotine-free builds your new identity.';
}

function getSocialTip(day: number): string {
  const tips: { [key: number]: string } = {
    4: 'Your quit is making others think. That\'s powerful.',
    5: 'Identity shift: "I don\'t vape" not "I\'m trying to quit"',
    6: 'True friends adapt to the new you. Notice who does.',
    7: 'Someone will quit because you proved it\'s possible.',
    8: 'Your energy shift is noticeable. People will comment.',
    9: 'Work relationships improving without vape break divisions.',
    10: 'You\'re becoming the success story others reference.',
    11: 'Social confidence without chemical support = real confidence.',
    12: 'Notice who\'s threatened by your success. That\'s about them.',
    13: 'Your quit journey is inspiring even if no one says it.',
    14: 'Two weeks makes you a credible quitting mentor.',
    15: 'Social anxiety was partly nicotine-induced. Feel the difference.',
    16: 'Dating/relationships improve without nicotine interruptions.',
    17: 'You\'re changing your social circle\'s dynamic. Lead on.',
    18: 'People trust advice from someone who\'s done it. That\'s you.',
    19: 'Your social energy isn\'t depleted by withdrawal anymore.',
    20: 'Twenty days of authentic interactions. No chemical mask.',
    21: 'You\'re proof that change is possible. Someone needed to see that.',
    22: 'Social pressure has no power over someone 22 days strong.',
    23: 'Your presence is different now. Calmer. Stronger.',
    24: 'New acquaintances only know the nicotine-free you. Wild.',
    25: 'You\'ve redefined fun without nicotine. Others are watching.',
    26: 'Your quit has ripple effects you\'ll never fully know.',
    27: 'Social situations are easier when you\'re not planning vape breaks.',
    28: 'Four weeks of showing it\'s possible. That\'s leadership.',
    29: 'Tomorrow you become a one-month inspiration. Own it.',
    30: 'You\'re the friend who did the impossible. Be proud.',
  };
  return tips[day] || 'Your journey inspires more people than you know.';
}

function getMentalContent(day: number): string {
  const content: { [key: number]: string } = {
    4: 'Brain fog lifting. Your thoughts are sharper, clearer, yours again.',
    5: 'Emotional roller coaster slowing down. You\'re finding your baseline.',
    6: 'Anxiety spikes are fewer. Your nervous system is recalibrating.',
    7: 'One week of proving your mind is stronger than any substance.',
    8: 'Depression lifting? That\'s dopamine receptors healing. Real science.',
    9: 'Concentration improving daily. Tasks feel less overwhelming now.',
    10: 'Mental victories compound. Each day builds on the last.',
    11: 'Emotional regulation returning. You\'re not at nicotine\'s mercy.',
    12: 'Clarity in decision-making. No more nicotine-clouded judgment.',
    13: 'Feeling emotions fully again. Even the hard ones. That\'s growth.',
    14: 'Two weeks of mental freedom. Your thoughts are truly yours.',
    15: 'Stress response normalizing. You don\'t need chemicals to cope.',
    16: 'Memory improving. Brain fog was real, and now it\'s lifting.',
    17: 'Confidence isn\'t forced anymore. It\'s earned and authentic.',
    18: 'Mental stamina increasing. You can focus longer, deeper.',
    19: 'Anxiety is manageable without nicotine. You\'ve proven it.',
    20: 'Twenty days of choosing mental health over temporary relief.',
    21: 'Neuroplasticity in action. Your brain has literally changed.',
    22: 'Emotional intelligence rising. You read situations better now.',
    23: 'Mental resilience is your new superpower. You\'ve earned it.',
    24: 'Stress doesn\'t trigger cravings anymore. New neural pathways.',
    25: 'Your mental health toolkit is complete. And it works.',
    26: 'Clarity, calmness, control. All without nicotine.',
    27: 'Mental victories are permanent. Physical cravings are temporary.',
    28: 'Four weeks of proving you\'re mentally unstoppable.',
    29: 'Your mind tomorrow will thank your mind today. Almost there.',
    30: 'Mental transformation complete. This clarity is your new normal.',
  };
  return content[day] || 'Every nicotine-free day strengthens your mental fortress.';
}

function getMentalAdvice(day: number): string {
  const advice: { [key: number]: string } = {
    4: 'Write three differences you notice from day 1. They\'re real.',
    5: 'Set a complex task for today. Notice your improved focus.',
    6: 'Track your anxiety levels. Compare to day 1-3. See the drop?',
    7: 'List what you\'ve proven to yourself this week. Read it twice.',
    8: 'When mood dips hit, remember: healing isn\'t linear.',
    9: 'Practice sitting with difficult emotions for 60 seconds. Just sit.',
    10: 'Celebrate mental wins as much as physical ones. They matter more.',
    11: 'Notice your self-talk changing? Document the shift.',
    12: 'Do something that required too much focus before. Enjoy it.',
    13: 'Feel proud. Seriously. Let yourself feel genuinely proud.',
    14: 'Your mental health is worth more than any temporary relief.',
    15: 'Check in with your anxiety. It\'s different now, isn\'t it?',
    16: 'Trust your emotional responses. They\'re not filtered anymore.',
    17: 'Challenge yourself mentally today. You have capacity now.',
    18: 'Appreciate the mental space not thinking about nicotine creates.',
    19: 'Stress test your new coping skills. They work.',
    20: 'Recognize that you\'ve rewired your stress response. Huge.',
    21: 'Your brain is officially different. Neuroplasticity is real.',
    22: 'Notice how much mental energy you have without withdrawal.',
    23: 'Confidence comes from keeping promises to yourself. You did.',
    24: 'Mental clarity is your new baseline. Protect it.',
    25: 'You\'ve built mental muscles most people never develop.',
    26: 'Four more days of cementing your new neural pathways.',
    27: 'Your future self is already thanking present you.',
    28: 'Mental freedom was the real goal. You achieved it.',
    29: 'Reflect on your mental journey. You climbed a mountain.',
    30: 'You chose mental health 30 days in a row. That\'s who you are.',
  };
  return advice[day] || 'Your mind is your greatest asset. You\'ve proven it.';
}

function getMentalTip(day: number): string {
  const tips: { [key: number]: string } = {
    4: 'Chemical anxiety is fading. What remains is manageable.',
    5: 'Dopamine receptors: 30% recovered. Feel the difference.',
    6: 'Deep sleep returning. Your brain is repairing at night.',
    7: 'You survived peak withdrawal. Everything else is easier.',
    8: 'Serotonin levels stabilizing. Natural mood balance returning.',
    9: 'Executive function improving. Decisions feel clearer.',
    10: 'Emotional numbness lifting. You\'re feeling life fully.',
    11: 'Stress hormones normalizing. Cortisol levels dropping.',
    12: 'Mental fog: 90% cleared. Welcome back to clarity.',
    13: 'Endorphin production increasing naturally. No shortcuts needed.',
    14: 'Two weeks = measurable brain structure changes. MRI-proven.',
    15: 'Anxiety baseline resetting. This calm is your new normal.',
    16: 'Cognitive function: fully restored. Some report it\'s better.',
    17: 'Depression lifting isn\'t placebo. It\'s brain chemistry.',
    18: 'Mental resilience isn\'t just psychological. It\'s neurological.',
    19: 'Prefrontal cortex fully online. Impulse control restored.',
    20: 'Neurogenesis accelerating. New brain cells, new you.',
    21: '21 days = new neural pathways established. Science wins.',
    22: 'Mental energy isn\'t borrowed anymore. It\'s generated.',
    23: 'Emotional regulation is now hardware, not software.',
    24: 'Your brain has physically changed. Scans would prove it.',
    25: 'Mental clarity at 25 days exceeds pre-nicotine levels.',
    26: 'Cognitive reserve building. Protecting future you.',
    27: 'Neuroplasticity peaked. Your brain adapted completely.',
    28: 'Mental health gains are now permanent with maintenance.',
    29: 'Tomorrow your brain celebrates a full recovery cycle.',
    30: 'Neurotransmitter balance: restored. This is your brain winning.',
  };
  return tips[day] || 'Your brain is performing at its natural best.';
}

// Situational tips for common triggers
export const getSituationalTips = (situation: string): EarlyWithdrawalTip[] => {
  const situationalTips: { [key: string]: EarlyWithdrawalTip[] } = {
    school: [
      {
        id: 'school_bathroom',
        timeframe: 'anytime',
        title: 'Bathroom Break Strategy',
        content: 'School bathrooms = vape central. Have a plan!',
        category: 'situational',
        urgencyLevel: 'high',
        actionableAdvice: 'Use a different floor\'s bathroom or wait for class change',
        socialTip: 'If caught in there: wash hands, leave immediately',
        icon: 'school',
        color: '#F59E0B',
        triggerWarning: 'Highest risk location in school',
      },
      {
        id: 'school_stress',
        timeframe: 'anytime',
        title: 'Test Stress Without Nicotine',
        content: 'Big test? Your brain works BETTER without nicotine interruption.',
        category: 'situational',
        urgencyLevel: 'medium',
        actionableAdvice: 'Before test: 5 deep breaths, positive self-talk, hydrate',
        mentalHealthTip: 'Nicotine actually increased your stress - you\'re calmer now',
        icon: 'assignment',
        color: '#8B5CF6',
      },
    ],
    social: [
      {
        id: 'party_pressure',
        timeframe: 'anytime',
        title: 'Party Survival Guide',
        content: 'Parties are trigger central. Go in with a game plan.',
        category: 'situational',
        urgencyLevel: 'high',
        actionableAdvice: 'Bring a quit buddy or schedule check-in texts',
        socialTip: 'Hold a drink/snack - keeps hands busy, looks natural',
        icon: 'celebration',
        color: '#EF4444',
        triggerWarning: 'Alcohol lowers quit resistance - be extra careful',
      },
      {
        id: 'dating_confidence',
        timeframe: 'anytime',
        title: 'Dating Without Nicotine',
        content: 'Quitting = self-control = attractive quality!',
        category: 'situational',
        urgencyLevel: 'low',
        actionableAdvice: 'Focus on: fresher breath, no vape interruptions, saving money',
        socialTip: 'If they vape/smoke and judge you for quitting - red flag!',
        icon: 'favorite',
        color: '#EC4899',
      },
    ],
    work: [
      {
        id: 'work_breaks',
        timeframe: 'anytime',
        title: 'Break Time Reimagined',
        content: 'Smoke breaks were stress breaks. Find new ritual!',
        category: 'situational',
        urgencyLevel: 'medium',
        actionableAdvice: 'Take walking breaks, coffee runs, or meditation moments',
        copingStrategy: 'Set hourly stretch reminders to replace vape breaks',
        icon: 'work',
        color: '#06B6D4',
      },
    ],
  };
  
  return situationalTips[situation] || [];
};

// Get tips based on current withdrawal phase
export const getCurrentWithdrawalPhase = (hours: number): string => {
  if (hours <= 3) return 'initial';
  if (hours <= 8) return 'early';
  if (hours <= 24) return 'firstDay';
  if (hours <= 48) return 'building';
  if (hours <= 72) return 'peak';
  if (hours <= 168) return 'recovery';
  return 'maintenance';
};

// Get intensity level for current withdrawal phase
export const getWithdrawalIntensity = (hours: number): number => {
  const timeline = withdrawalTimeline.find(t => t.hour >= hours);
  return timeline?.intensity || 1;
}; 