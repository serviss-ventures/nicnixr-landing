// API Endpoints
export const endpoints = {
  // Auth endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
  },
  
  // User endpoints
  user: {
    profile: '/user/profile',
    updateProfile: '/user/profile',
    uploadAvatar: '/user/avatar',
    deleteAccount: '/user/delete',
    preferences: '/user/preferences',
    changePassword: '/user/change-password',
  },
  
  // Recovery endpoints
  recovery: {
    journey: '/recovery/journey',
    stats: '/recovery/stats',
    milestones: '/recovery/milestones',
    streak: '/recovery/streak',
    progress: '/recovery/progress',
    checkin: '/recovery/checkin',
  },
  
  // Teams endpoints
  teams: {
    list: '/teams',
    create: '/teams',
    join: '/teams/join',
    leave: (teamId: string) => `/teams/${teamId}/leave`,
    details: (teamId: string) => `/teams/${teamId}`,
    members: (teamId: string) => `/teams/${teamId}/members`,
    invite: (teamId: string) => `/teams/${teamId}/invite`,
  },
  
  // Posts endpoints
  posts: {
    list: '/posts',
    create: '/posts',
    get: (postId: string) => `/posts/${postId}`,
    update: (postId: string) => `/posts/${postId}`,
    delete: (postId: string) => `/posts/${postId}`,
    like: (postId: string) => `/posts/${postId}/like`,
    unlike: (postId: string) => `/posts/${postId}/unlike`,
    report: (postId: string) => `/posts/${postId}/report`,
  },
  
  // Comments endpoints
  comments: {
    list: (postId: string) => `/posts/${postId}/comments`,
    create: (postId: string) => `/posts/${postId}/comments`,
    update: (postId: string, commentId: string) => `/posts/${postId}/comments/${commentId}`,
    delete: (postId: string, commentId: string) => `/posts/${postId}/comments/${commentId}`,
    like: (postId: string, commentId: string) => `/posts/${postId}/comments/${commentId}/like`,
  },
  
  // Journal endpoints
  journal: {
    entries: '/journal/entries',
    create: '/journal/entries',
    get: (entryId: string) => `/journal/entries/${entryId}`,
    update: (entryId: string) => `/journal/entries/${entryId}`,
    delete: (entryId: string) => `/journal/entries/${entryId}`,
    search: '/journal/search',
  },
  
  // Notifications endpoints
  notifications: {
    list: '/notifications',
    markRead: (notificationId: string) => `/notifications/${notificationId}/read`,
    markAllRead: '/notifications/read-all',
    settings: '/notifications/settings',
    updateSettings: '/notifications/settings',
  },
  
  // Analytics endpoints
  analytics: {
    track: '/analytics/track',
    events: '/analytics/events',
    userMetrics: '/analytics/user-metrics',
  },
  
  // IAP (In-App Purchase) endpoints
  iap: {
    products: '/iap/products',
    verify: '/iap/verify',
    restore: '/iap/restore',
    subscription: '/iap/subscription',
  },
  
  // Buddies endpoints
  buddies: {
    list: '/buddies',
    request: '/buddies/request',
    accept: (buddyId: string) => `/buddies/${buddyId}/accept`,
    reject: (buddyId: string) => `/buddies/${buddyId}/reject`,
    remove: (buddyId: string) => `/buddies/${buddyId}/remove`,
    block: (userId: string) => `/buddies/block/${userId}`,
    unblock: (userId: string) => `/buddies/unblock/${userId}`,
  },
  
  // Support endpoints
  support: {
    contact: '/support/contact',
    faqs: '/support/faqs',
    reportBug: '/support/report-bug',
    feedback: '/support/feedback',
  },
};

// TypeScript Types

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  productType?: 'cigarettes' | 'vape' | 'both';
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  productType: 'cigarettes' | 'vape' | 'both';
  quitDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  notifications: boolean;
  emailUpdates: boolean;
  dailyReminders: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

// Recovery types
export interface RecoveryStats {
  daysQuit: number;
  moneySaved: number;
  productsAvoided: number;
  healthImprovements: HealthImprovement[];
}

export interface HealthImprovement {
  name: string;
  progress: number;
  description: string;
  unlockedAt?: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  daysRequired: number;
  unlockedAt?: string;
  icon: string;
}

// Team types
export interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  isPrivate: boolean;
  inviteCode?: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  user: User;
}

// Post types
export interface Post {
  id: string;
  userId: string;
  teamId?: string;
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface CreatePostRequest {
  content: string;
  teamId?: string;
  images?: string[];
}

// Comment types
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
}

// Journal types
export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood?: 'happy' | 'neutral' | 'sad' | 'anxious' | 'excited';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'milestone' | 'reminder';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  likes: boolean;
  comments: boolean;
  follows: boolean;
  milestones: boolean;
  dailyReminders: boolean;
  reminderTime?: string;
}

// IAP types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'subscription' | 'consumable';
  features?: string[];
}

export interface PurchaseVerification {
  receipt: string;
  productId: string;
  platform: 'ios' | 'android';
}

// Buddy types
export interface Buddy {
  id: string;
  userId: string;
  buddyId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
  buddy: User;
}

export interface BuddyRequest {
  userId: string;
  message?: string;
}

// Support types
export interface SupportTicket {
  subject: string;
  message: string;
  category: 'bug' | 'feature' | 'question' | 'other';
  attachments?: string[];
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}