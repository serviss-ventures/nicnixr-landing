// User and Authentication Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  dateJoined: string;
  quitDate: string;
  nicotineProduct: NicotineProduct;
  dailyCost: number;
  packagesPerDay: number;
  motivationalGoals: string[];
  avatar?: string;
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
  shieldModeUsed: boolean;
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

// Shield Mode Types
export interface ShieldModeSession {
  id: string;
  startTime: string;
  endTime?: string;
  activityType: 'breathing' | 'meditation' | 'exercise' | 'technique';
  cravingIntensityBefore: number;
  cravingIntensityAfter?: number;
  completed: boolean;
  duration: number; // in seconds
  effectiveness?: number; // 1-5 scale
}

export interface ShieldModeActivity {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'breathing' | 'meditation' | 'exercise' | 'technique';
  icon: string;
  instructions: string[];
  audioFile?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Community Types
export interface CommunityPost {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  category: 'motivation' | 'milestone' | 'question' | 'struggle' | 'success';
  daysClean?: number;
  isAnonymous: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  isAnonymous: boolean;
}

export interface CommunityUser {
  id: string;
  username: string;
  avatar?: string;
  daysClean: number;
  joinDate: string;
  supportGiven: number;
  supportReceived: number;
  badgesEarned: Badge[];
  isOnline: boolean;
  lastSeen: string;
}

// Achievement and Badge Types
export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'days' | 'shield_uses' | 'community_helps' | 'check_ins' | 'milestones';
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
  type: 'days_clean' | 'check_ins' | 'shield_uses' | 'community_posts' | 'money_saved';
  value: number;
  description: string;
}

// Nicotine Product Types
export interface NicotineProduct {
  id: string;
  name: string;
  avgCostPerDay: number;
  nicotineContent: number;
  category: 'cigarettes' | 'vape' | 'cigars' | 'chewing' | 'patches' | 'gum' | 'other';
  harmLevel: number; // 1-10 scale
}

// Navigation Types
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  ShieldMode: {
    activityId?: string;
    cravingIntensity: number;
  };
  ProgressDetail: undefined;
  CommunityPost: {
    postId: string;
  };
  UserProfile: {
    userId: string;
  };
  Settings: undefined;
  HealthMilestones: undefined;
  Achievements: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Progress: undefined;
  Community: undefined;
  Shield: undefined;
  Profile: undefined;
};

// Redux Store Types
export interface RootState {
  auth: AuthState;
  progress: ProgressState;
  community: CommunityState;
  shield: ShieldState;
  settings: SettingsState;
  achievements: AchievementState;
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
  posts: CommunityPost[];
  users: CommunityUser[];
  myPosts: CommunityPost[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  hasMorePosts: boolean;
}

export interface ShieldState {
  sessions: ShieldModeSession[];
  availableActivities: ShieldModeActivity[];
  currentSession: ShieldModeSession | null;
  isActive: boolean;
  stats: ShieldModeStats;
  isLoading: boolean;
  error: string | null;
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
  shieldModeReminders: boolean;
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
  shieldModeUses: number;
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

export interface ShieldModeStats {
  totalUses: number;
  totalDuration: number; // in minutes
  averageEffectiveness: number;
  mostUsedActivity: string;
  streakDays: number;
  successRate: number;
  weeklyUsage: number[];
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

export interface ShieldButtonProps {
  onPress: () => void;
  isActive: boolean;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export interface CommunityPostCardProps {
  post: CommunityPost;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onPress: (postId: string) => void;
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
  details?: any;
  timestamp: string;
}

// Notification Types
export interface NotificationPayload {
  title: string;
  body: string;
  data?: any;
  sound?: string;
  badge?: number;
  categoryId?: string;
}

// Form Types
export interface OnboardingData {
  firstName: string;
  lastName: string;
  email: string;
  quitDate: string;
  nicotineProduct: NicotineProduct;
  dailyCost: number;
  packagesPerDay: number;
  motivationalGoals: string[];
  previousAttempts: number;
  reasonsToQuit: string[];
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

// Export all types for easy importing
export type {
  User,
  ProgressStats,
  DailyCheckIn,
  HealthMilestone,
  ShieldModeSession,
  CommunityPost,
  Badge,
  Achievement,
  NicotineProduct,
}; 