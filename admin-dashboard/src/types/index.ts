// Type definitions for NixR Admin Dashboard

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
  lastActiveAt: string;
  
  // Recovery-specific fields
  sobrietyDate: string;
  daysClean: number;
  primarySubstance: SubstanceType;
  secondarySubstances?: SubstanceType[];
  
  // App engagement
  journalStreak: number;
  lastJournalEntry?: string;
  totalJournalEntries: number;
  communityPosts: number;
  buddyConnections: number;
  
  // Subscription
  tier: UserTier;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  
  // Platform & Status
  platform: Platform;
  appVersion: string;
  status: UserStatus;
  riskLevel: RiskLevel;
  
  // Support
  supportTickets: number;
  flaggedContent: number;
  reports: number;
}

// Enums
export enum SubstanceType {
  CIGARETTES = 'cigarettes',
  VAPE = 'vape',
  NICOTINE_POUCHES = 'nicotine_pouches',
  CHEW_DIP = 'chew_dip',
}

export enum UserTier {
  FREE = 'free',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  TRIAL = 'trial',
}

export enum Platform {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Journal Entry
export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  mood: MoodType;
  triggers: string[];
  cravingLevel: number; // 1-10
  createdAt: string;
  isPrivate: boolean;
  aiInsights?: string;
}

export enum MoodType {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  NEUTRAL = 'neutral',
  STRUGGLING = 'struggling',
  CRISIS = 'crisis',
}

// Community
export interface CommunityPost {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: PostCategory;
  likes: number;
  comments: number;
  isAnonymous: boolean;
  createdAt: string;
  moderationStatus: ModerationStatus;
}

export enum PostCategory {
  SUCCESS_STORY = 'success_story',
  NEED_SUPPORT = 'need_support',
  DAILY_CHECK_IN = 'daily_check_in',
  RESOURCES = 'resources',
  QUESTIONS = 'questions',
}

export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  FLAGGED = 'flagged',
  REMOVED = 'removed',
}

// AI Coach
export interface AICoachSession {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  messages: AIMessage[];
  sentiment: SentimentType;
  helpfulnessRating?: number;
  topicsDiscussed: string[];
  interventionTriggered: boolean;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sentiment?: SentimentType;
}

export enum SentimentType {
  VERY_POSITIVE = 'very_positive',
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  CRISIS = 'crisis',
}

// Support Ticket
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  messages: TicketMessage[];
}

export enum TicketCategory {
  TECHNICAL = 'technical',
  BILLING = 'billing',
  RECOVERY_SUPPORT = 'recovery_support',
  FEATURE_REQUEST = 'feature_request',
  ACCOUNT = 'account',
  OTHER = 'other',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_USER = 'waiting_user',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorType: 'user' | 'support' | 'system';
  content: string;
  createdAt: string;
}

// Analytics
export interface DailyMetrics {
  date: string;
  activeUsers: number;
  newUsers: number;
  journalEntries: number;
  communityPosts: number;
  aiCoachSessions: number;
  relapseReports: number;
  supportTickets: number;
  revenue: number;
}

export interface UserEngagement {
  userId: string;
  date: string;
  appOpens: number;
  sessionDuration: number; // in seconds
  journalsWritten: number;
  postsCreated: number;
  postsLiked: number;
  aiCoachMessages: number;
  buddyInteractions: number;
}

export interface RetentionCohort {
  cohortDate: string;
  totalUsers: number;
  retentionByDay: {
    day: number;
    retainedUsers: number;
    percentage: number;
  }[];
}

// Business Metrics
export interface RevenueMetrics {
  date: string;
  mrr: number;
  arr: number;
  newMrr: number;
  churnedMrr: number;
  expansionMrr: number;
  ltv: number;
  cac: number;
  paybackPeriod: number; // in months
}

export interface SubscriptionMetrics {
  date: string;
  totalSubscribers: number;
  newSubscribers: number;
  cancelledSubscribers: number;
  trialUsers: number;
  trialConversionRate: number;
  churnRate: number;
}

// Feature Flags
export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  environments: Environment[];
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

// A/B Tests
export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: TestStatus;
  startDate: string;
  endDate?: string;
  variants: TestVariant[];
  primaryMetric: string;
  secondaryMetrics: string[];
}

export enum TestStatus {
  DRAFT = 'draft',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

export interface TestVariant {
  id: string;
  name: string;
  allocation: number; // percentage
  participants: number;
  conversions: number;
  conversionRate: number;
  confidence?: number;
}

// System Health
export interface ServiceHealth {
  service: string;
  status: ServiceStatus;
  uptime: number; // percentage
  latency: number; // milliseconds
  errorRate: number; // percentage
  lastChecked: string;
}

export enum ServiceStatus {
  OPERATIONAL = 'operational',
  DEGRADED = 'degraded',
  DOWN = 'down',
}

// Reports
export interface Report {
  id: string;
  name: string;
  type: ReportType;
  frequency?: ReportFrequency;
  recipients: string[];
  lastGenerated?: string;
  nextScheduled?: string;
  status: ReportStatus;
}

export enum ReportType {
  INVESTOR = 'investor',
  OPERATIONS = 'operations',
  FINANCIAL = 'financial',
  USER_ANALYTICS = 'user_analytics',
  CUSTOM = 'custom',
}

export enum ReportFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
}

export enum ReportStatus {
  SCHEDULED = 'scheduled',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
} 