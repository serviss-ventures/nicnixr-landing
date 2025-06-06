// User and Authentication Types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string; // Anonymous display name
  aboutMe?: string; // User bio/about section
  bio?: string; // Short bio for buddy matching
  supportStyles?: string[]; // Support style tags (motivator, listener, etc.)
  firstName: string;
  lastName: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  ageRange?: string;
  dateJoined: string;
  quitDate: string;
  nicotineProduct: NicotineProduct;
  dailyCost: number;
  packagesPerDay: number;
  motivationalGoals: string[];
  reasonsToQuit?: string[]; // Primary reasons for quitting (health, money, family, etc.)
  customReasonToQuit?: string; // User's custom reason if they added one
  avatar?: string;
  purchasedAvatars?: string[]; // List of purchased avatar style keys
  isAnonymous: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Progress and Statistics Types
export interface ProgressStats {
  daysClean: number;
  hoursClean: number;
  minutesClean: number;
  secondsClean: number;
  moneySaved: number;
  cigarettesAvoided: number;
  lifeRegained: number; // in hours
  healthScore: number; // 0-100
  streakDays: number;
  longestStreak: number;
}

export interface DailyCheckIn {
  id: string;
  date: string;
  mood: number; // 1-5 scale
  cravingIntensity: number; // 1-5 scale
  stressLevel: number; // 1-5 scale
  energyLevel: number; // 1-5 scale
  notes?: string;
  triggers: string[];
  cravingsCount: number;
}

export interface HealthMilestone {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  icon: string;
  achieved: boolean;
  achievedDate?: string;
  category: 'cardiovascular' | 'respiratory' | 'neurological' | 'metabolic' | 'appearance';
}

// Community Types - REMOVED (replaced with team-based system)

// Achievement and Badge Types
export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'days' | 'community_helps' | 'check_ins' | 'milestones';
  category: 'progress' | 'community' | 'health' | 'resilience';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedDate?: string;
  progress: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedDate?: string;
  category: 'daily' | 'weekly' | 'monthly' | 'milestone' | 'special';
  requirements: AchievementRequirement[];
}

export interface AchievementRequirement {
  type: 'days_clean' | 'check_ins' | 'community_posts' | 'money_saved';
  value: number;
  description: string;
}

// Nicotine Product Types
export interface NicotineProduct {
  id: string;
  name: string;
  avgCostPerDay: number;
  nicotineContent: number;
  category: 'cigarettes' | 'vape' | 'cigars' | 'chewing' | 'patches' | 'gum' | 'pouches' | 'other';
  harmLevel: number; // 1-10 scale
}

// Navigation Types
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  ProgressDetail: undefined;
  UserProfile: {
    userId: string;
  };
  Settings: undefined;
  HealthMilestones: undefined;
  Achievements: undefined;
  TeamDetail: {
    teamId: string;
  };
};

export type TabParamList = {
  Dashboard: undefined;
  Progress: undefined;
  Community: undefined;
  Profile: undefined;
};

export type DashboardStackParamList = {
  DashboardMain: undefined;
  AICoach: undefined;
  RecoveryPlans: {
    mode?: 'explore' | 'manage';
    activePlanId?: string;
  } | undefined;
  PlanDetail: {
    planId: string;
    planTitle: string;
  };
};

// Redux Store Types - RootState is now derived from the store

export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  stepData: Partial<OnboardingData>;
  quitBlueprint: QuitBlueprint | null;
  isLoading: boolean;
  error: string | null;
  isGeneratingBlueprint: boolean;
}

export interface ProgressState {
  stats: ProgressStats;
  dailyCheckIns: DailyCheckIn[];
  healthMilestones: HealthMilestone[];
  weeklyData: WeeklyProgressData[];
  monthlyData: MonthlyProgressData[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string;
}

export interface CommunityState {
  teams: RecoveryTeam[];
  joinedTeams: RecoveryTeam[];
  teamRankings: { [teamId: string]: TeamRanking };
  myScores: RecoveryScore[];
  teamActivities: { [teamId: string]: TeamActivity[] };
  isLoading: boolean;
  error: string | null;
  lastUpdated: string;
}

export interface SettingsState {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
  app: AppSettings;
  isLoading: boolean;
  error: string | null;
}

export interface AchievementState {
  badges: Badge[];
  achievements: Achievement[];
  points: number;
  level: number;
  isLoading: boolean;
  error: string | null;
}

// Settings Types
export interface NotificationSettings {
  dailyMotivation: boolean;
  progressUpdates: boolean;
  healthMilestones: boolean;
  communityActivity: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

export interface PrivacySettings {
  shareProgress: boolean;
  allowCommunityMessages: boolean;
  dataCollection: boolean;
  anonymousMode: boolean;
  profileVisibility: 'public' | 'community' | 'private';
}

export interface AccessibilitySettings {
  hapticFeedback: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  voiceGuidance: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  measurementUnit: 'metric' | 'imperial';
  autoBackup: boolean;
  dataSync: boolean;
}

// Chart and Analytics Types
export interface WeeklyProgressData {
  week: string;
  daysClean: number;
  cravingsResisted: number;
  checkInsCompleted: number;
  moneySaved: number;
}

export interface MonthlyProgressData {
  month: string;
  daysClean: number;
  totalCravings: number;
  successRate: number;
  healthScore: number;
  moneySaved: number;
  milestonesAchieved: number;
}

export interface CravingPattern {
  hour: number;
  intensity: number;
  frequency: number;
  triggers: string[];
  successRate: number;
}

// Component Props Types
export interface ProgressCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  onPress?: () => void;
}

export interface HealthBenefitCardProps {
  milestone: HealthMilestone;
  onPress: (milestone: HealthMilestone) => void;
}

export interface TeamCardProps {
  team: RecoveryTeam;
  onJoin: (teamId: string) => void;
  onPress: (teamId: string) => void;
}

export interface TeamMemberCardProps {
  member: TeamMember;
  rank: number;
  isCurrentUser?: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Notification Types
export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
  badge?: number;
  categoryId?: string;
}

// Form Types
export interface OnboardingData {
  // Basic Info (from registration)
  firstName: string;
  lastName: string;
  email: string;
  
  // Demographics
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  ageRange?: string;
  
  // Nicotine Profile - Interactive & Non-Judgmental
  nicotineProduct: NicotineProduct;
  customNicotineProduct?: string; // For "other" option
  usageDuration: string; // How long have you been using
  dailyAmount: number; // How much per day
  packagesPerDay?: number; // For cigarettes/packs
  dailyCost: number;
  
  // Deep Understanding Questions
  reasonsToQuit: string[]; // Primary reasons for quitting (health, money, family, freedom, smell, etc.)
  customReasonToQuit?: string; // Allow custom input
  fearsAboutQuitting: string[]; // Biggest fears (withdrawal, social pressure, losing coping mechanism, failure)
  customFearAboutQuitting?: string;
  
  // Trigger Analysis
  cravingTriggers: string[]; // When do you usually crave (time of day, after meals, with coffee, stress, boredom, social events)
  customCravingTrigger?: string;
  highRiskSituations: string[]; // Specific scenarios that trigger cravings
  currentCopingMechanisms: string[]; // What they currently do when stressed/bored
  
  // Past Attempts (If Any)
  hasTriedQuittingBefore: boolean;
  previousAttempts: number;
  whatWorkedBefore: string[]; // What worked even for a little while
  whatMadeItDifficult: string[]; // What made it difficult to stick with
  longestQuitPeriod?: string; // Longest time they've quit before
  
  // Freedom Date & Approach
  quitDate: string; // Their chosen "Freedom Date"
  quitApproach: 'immediate' | 'gradual' | 'preparation'; // Start now, taper, or prepare
  preparationDays?: number; // If choosing preparation mode
  
  // Personalization Preferences
  motivationalGoals: string[]; // What keeps them motivated
  preferredCommunicationStyle: 'encouraging' | 'direct' | 'scientific' | 'spiritual';
  reminderFrequency: 'minimal' | 'moderate' | 'frequent';
  
  // Support System
  hasSupportSystem: boolean;
  supportTypes: string[]; // Family, friends, healthcare provider, online community
  tellOthersAboutQuit: boolean;
  
  // Health Priorities
  healthConcerns: string[]; // What health improvements they're most excited about
  currentHealthIssues: string[]; // Any current nicotine-related health problems
  
  // Lifestyle Information
  stressLevel: number; // 1-5 scale
  typicalDayStructure: 'routine' | 'varied' | 'unpredictable';
  exerciseFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never';
  sleepQuality: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Completion Data
  completedAt: string;
  onboardingVersion: string; // To track changes over time
}

// New comprehensive onboarding step data
export interface OnboardingStepData {
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  stepData: Partial<OnboardingData>;
}

// Personalized Quit Blueprint generated from onboarding
export interface QuitBlueprint {
  id: string;
  userId: string;
  createdAt: string;
  
  // Core Identity
  primaryMotivators: string[];
  identifiedTriggers: string[];
  riskSituations: string[];
  strengths: string[]; // Based on past successes
  
  // Personalized Strategies
  recommendedCopingStrategies: string[];
  suggestedFirstWeekFocus: string[];
  crisisActionPlan: string[];
  
  // Learning Modules
  recommendedLearningModules: string[];
  priorityHealthBenefits: string[];
  
  // Support Recommendations
  suggestedSupportActivities: string[];
  communityGroupRecommendations: string[];
  
  // Monitoring & Tracking
  keyMetricsToTrack: string[];
  checkInFrequency: 'daily' | 'twice-daily' | 'custom';
  
  // Inspiration & Motivation
  personalMantra: string;
  celebrationMilestones: string[];
  
  // Emergency Protocols
  cravingEmergencyPlan: string[];
  supportContactList: string[];
}

export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  firstName: string;
  lastName: string;
  agreeToTerms: boolean;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export type Theme = 'light' | 'dark';

export type SortOrder = 'asc' | 'desc';

export type FilterPeriod = 'today' | 'week' | 'month' | 'year' | 'all';

export type ChartType = 'line' | 'bar' | 'pie' | 'area';

// Team-Based Recovery Community Types
export interface RecoveryTeam {
  id: string;
  name: string;
  description: string;
  category: 'age_group' | 'lifestyle' | 'profession' | 'interest' | 'location' | 'support_level';
  memberCount: number;
  isRecommended: boolean;
  isJoined: boolean;
  icon: string;
  color: string;
  requirements?: {
    minAge?: number;
    maxAge?: number;
    location?: string;
    interests?: string[];
  };
}

export interface TeamMember {
  id: string;
  username: string;
  avatar?: string;
  daysClean: number;
  currentRank: number;
  previousRank?: number;
  weeklyScore: number;
  isAnonymous: boolean;
  joinedTeamDate: string;
  lastActiveDate: string;
  badges: string[];
}

export interface TeamRanking {
  teamId: string;
  period: 'daily' | 'weekly' | 'monthly';
  rankings: TeamMember[];
  myRank?: number;
  totalMembers: number;
  lastUpdated: string;
}

export interface RecoveryScore {
  userId: string;
  date: string;
  dailyScore: number;
  weeklyScore: number;
  monthlyScore: number;
  factors: {
    daysClean: number;
    checkInCompleted: boolean;
    cravingsResisted: number;
    supportGiven: number;
    milestonesHit: number;
  };
}

export interface TeamActivity {
  id: string;
  teamId: string;
  userId: string;
  username: string;
  type: 'milestone' | 'support' | 'achievement' | 'check_in' | 'rank_change';
  description: string;
  timestamp: string;
  isAnonymous: boolean;
  metadata?: {
    daysClean?: number;
    rankChange?: number;
    achievementId?: string;
  };
} 