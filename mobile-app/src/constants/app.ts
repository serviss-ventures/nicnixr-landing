export const APP_CONFIG = {
  name: 'NicNixr',
  version: '1.0.0',
  buildNumber: 1,
  environment: __DEV__ ? 'development' : 'production',
};

export const STORAGE_KEYS = {
  USER_DATA: '@nicnixr_user_data',
  QUIT_DATE: '@nicnixr_quit_date',
  PROGRESS_DATA: '@nicnixr_progress',
  SETTINGS: '@nicnixr_settings',
  ONBOARDING_COMPLETED: '@nicnixr_onboarding',
  ONBOARDING_PROGRESS: '@nicnixr_onboarding_progress',
  QUIT_BLUEPRINT: '@nicnixr_quit_blueprint',
  SHIELD_MODE_USAGE: '@nicnixr_shield_usage',
  DAILY_CHECK_INS: '@nicnixr_daily_checkins',
};

export const HEALTH_BENEFITS = [
  {
    id: '20_minutes',
    timeframe: '20 minutes',
    title: 'Heart Rate Normalizes',
    description: 'Your heart rate and blood pressure drop back to normal levels.',
    icon: 'heart',
    achieved: false,
  },
  {
    id: '12_hours',
    timeframe: '12 hours',
    title: 'Carbon Monoxide Clears',
    description: 'Carbon monoxide levels in your blood return to normal.',
    icon: 'wind',
    achieved: false,
  },
  {
    id: '2_weeks',
    timeframe: '2 weeks',
    title: 'Circulation Improves',
    description: 'Blood circulation improves and lung function increases.',
    icon: 'activity',
    achieved: false,
  },
  {
    id: '1_month',
    timeframe: '1 month',
    title: 'Coughing Decreases',
    description: 'Coughing and shortness of breath decrease significantly.',
    icon: 'shield',
    achieved: false,
  },
  {
    id: '1_year',
    timeframe: '1 year',
    title: 'Heart Disease Risk Halved',
    description: 'Risk of coronary heart disease is reduced by 50%.',
    icon: 'heart',
    achieved: false,
  },
  {
    id: '5_years',
    timeframe: '5 years',
    title: 'Stroke Risk Normalized',
    description: 'Risk of stroke is reduced to that of a non-smoker.',
    icon: 'brain',
    achieved: false,
  },
];

export const MOTIVATION_QUOTES = [
  "Every moment without nicotine is a victory.",
  "You're stronger than your cravings.",
  "Your body is healing with every breath.",
  "Freedom from addiction is the greatest gift to yourself.",
  "Each day nicotine-free is a day of reclaiming your life.",
  "You've got this. One moment at a time.",
  "Your future self will thank you for not giving up today.",
  "Cravings are temporary, but your strength is permanent.",
  "You're not just quitting nicotine, you're choosing freedom.",
  "Every 'no' to nicotine is a 'yes' to your health.",
];

export const SHIELD_MODE_ACTIVITIES = [
  {
    id: 'breathing',
    title: 'Deep Breathing',
    description: 'Guided breathing exercise to calm cravings',
    duration: 180, // 3 minutes
    type: 'breathing',
    icon: 'wind',
  },
  {
    id: 'meditation',
    title: 'Quick Meditation',
    description: 'Mindfulness meditation to refocus your mind',
    duration: 300, // 5 minutes
    type: 'meditation',
    icon: 'brain',
  },
  {
    id: 'movement',
    title: 'Movement Break',
    description: 'Quick physical exercises to redirect energy',
    duration: 120, // 2 minutes
    type: 'exercise',
    icon: 'activity',
  },
  {
    id: 'cold_water',
    title: 'Cold Water Technique',
    description: 'Drink cold water and focus on the sensation',
    duration: 60, // 1 minute
    type: 'technique',
    icon: 'droplet',
  },
];

export const CRAVING_INTENSITY_LEVELS = [
  { level: 1, label: 'Very Mild', color: '#10B981', description: 'Barely noticeable urge' },
  { level: 2, label: 'Mild', color: '#22C55E', description: 'Slight urge, easily manageable' },
  { level: 3, label: 'Moderate', color: '#EAB308', description: 'Noticeable urge, requires attention' },
  { level: 4, label: 'Strong', color: '#F97316', description: 'Strong urge, challenging to resist' },
  { level: 5, label: 'Very Strong', color: '#EF4444', description: 'Intense urge, very difficult to resist' },
];

export const ACHIEVEMENT_BADGES = [
  {
    id: 'first_day',
    title: 'First Day Warrior',
    description: 'Completed your first day nicotine-free',
    icon: 'award',
    requirement: 1,
    type: 'days',
  },
  {
    id: 'week_strong',
    title: 'Week Strong',
    description: 'One full week without nicotine',
    icon: 'shield',
    requirement: 7,
    type: 'days',
  },
  {
    id: 'month_master',
    title: 'Month Master',
    description: 'Conquered a full month nicotine-free',
    icon: 'crown',
    requirement: 30,
    type: 'days',
  },
  {
    id: 'shield_defender',
    title: 'Shield Defender',
    description: 'Used Shield Mode 10 times',
    icon: 'shield-check',
    requirement: 10,
    type: 'shield_uses',
  },
  {
    id: 'community_supporter',
    title: 'Community Supporter',
    description: 'Helped 5 community members',
    icon: 'users',
    requirement: 5,
    type: 'community_helps',
  },
];

export const NICOTINE_PRODUCTS = [
  { id: 'cigarettes', name: 'Cigarettes', avgCostPerDay: 15, nicotineContent: 12 },
  { id: 'vape', name: 'Vape/E-cigarettes', avgCostPerDay: 8, nicotineContent: 18 },
  { id: 'cigars', name: 'Cigars', avgCostPerDay: 12, nicotineContent: 15 },
  { id: 'chewing_tobacco', name: 'Chewing Tobacco', avgCostPerDay: 6, nicotineContent: 8 },
  { id: 'snuff', name: 'Snuff', avgCostPerDay: 5, nicotineContent: 6 },
  { id: 'nicotine_gum', name: 'Nicotine Gum', avgCostPerDay: 4, nicotineContent: 2 },
  { id: 'nicotine_patches', name: 'Nicotine Patches', avgCostPerDay: 3, nicotineContent: 1 },
];

export const SUPPORT_CATEGORIES = [
  {
    id: 'emergency',
    title: 'Emergency Support',
    description: 'Immediate help for strong cravings',
    color: '#EF4444',
    icon: 'alert-triangle',
  },
  {
    id: 'motivation',
    title: 'Daily Motivation',
    description: 'Inspiration and encouragement',
    color: '#10B981',
    icon: 'star',
  },
  {
    id: 'tips',
    title: 'Quit Tips',
    description: 'Practical strategies and techniques',
    color: '#3B82F6',
    icon: 'lightbulb',
  },
  {
    id: 'community',
    title: 'Community Stories',
    description: 'Success stories from other users',
    color: '#8B5CF6',
    icon: 'users',
  },
];

export const DEFAULT_SETTINGS = {
  notifications: {
    dailyMotivation: true,
    progressUpdates: true,
    healthMilestones: true,
    communityActivity: false,
    shieldModeReminders: true,
  },
  privacy: {
    shareProgress: false,
    allowCommunityMessages: true,
    dataCollection: false,
  },
  accessibility: {
    hapticFeedback: true,
    reducedMotion: false,
    highContrast: false,
    largeText: false,
  },
  app: {
    theme: 'dark',
    language: 'en',
    currency: 'USD',
    measurementUnit: 'imperial',
  },
};

export const API_ENDPOINTS = {
  BASE_URL: __DEV__ ? 'http://localhost:3000/api' : 'https://api.nicnixr.com',
  AUTH: '/auth',
  USER: '/user',
  PROGRESS: '/progress',
  COMMUNITY: '/community',
  ACHIEVEMENTS: '/achievements',
  SUPPORT: '/support',
};

export default {
  APP_CONFIG,
  STORAGE_KEYS,
  HEALTH_BENEFITS,
  MOTIVATION_QUOTES,
  SHIELD_MODE_ACTIVITIES,
  CRAVING_INTENSITY_LEVELS,
  ACHIEVEMENT_BADGES,
  NICOTINE_PRODUCTS,
  SUPPORT_CATEGORIES,
  DEFAULT_SETTINGS,
  API_ENDPOINTS,
}; 