// Admin Dashboard Constants

// App Info
export const APP_NAME = 'NixR Admin';
export const APP_VERSION = '1.0.0';
export const COMPANY_NAME = 'NixR';

// Navigation
export const SIDEBAR_WIDTH = 256;
export const HEADER_HEIGHT = 64;

// Metrics Thresholds
export const THRESHOLDS = {
  // User Metrics
  userRetention: {
    good: 70,
    warning: 50,
    critical: 30,
  },
  churnRate: {
    good: 5,
    warning: 10,
    critical: 15,
  },
  
  // System Health
  uptime: {
    good: 99.5,
    warning: 99,
    critical: 95,
  },
  responseTime: {
    good: 200,
    warning: 500,
    critical: 1000,
  },
  errorRate: {
    good: 0.1,
    warning: 1,
    critical: 5,
  },
  
  // Business Metrics
  ltvcac: {
    good: 3,
    warning: 2,
    critical: 1.5,
  },
  paybackPeriod: {
    good: 6,
    warning: 12,
    critical: 18,
  },
};

// Chart Colors
export const CHART_COLORS = {
  primary: '#C084FC',
  secondary: '#8B5CF6',
  tertiary: '#6D28D9',
  quaternary: '#5B21B6',
  success: '#22C55E',
  warning: '#F59E0B',
  destructive: '#EF4444',
  neutral: '#6B7280',
};

// Date Formats
export const DATE_FORMATS = {
  short: 'MMM D',
  medium: 'MMM D, YYYY',
  long: 'MMMM D, YYYY',
  time: 'h:mm A',
  datetime: 'MMM D, YYYY h:mm A',
};

// Pagination
export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
};

// Refresh Intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  realtime: 5000, // 5 seconds
  frequent: 30000, // 30 seconds
  normal: 60000, // 1 minute
  slow: 300000, // 5 minutes
};

// Feature Flags
export const FEATURES = {
  exportData: true,
  aiInsights: true,
  advancedAnalytics: true,
  customReports: true,
  apiAccess: true,
};

// Support Categories
export const SUPPORT_CATEGORIES = [
  'Technical Issue',
  'Billing',
  'Feature Request',
  'Recovery Support',
  'Account',
  'Other',
];

// Moderation Severity Levels
export const MODERATION_SEVERITY = {
  low: { label: 'Low', color: 'text-white/60' },
  medium: { label: 'Medium', color: 'text-warning' },
  high: { label: 'High', color: 'text-destructive' },
  critical: { label: 'Critical', color: 'text-destructive' },
};

// User Tiers
export const USER_TIERS = {
  free: { label: 'Free', color: 'text-white/60' },
  premium: { label: 'Premium', color: 'text-primary' },
  enterprise: { label: 'Enterprise', color: 'text-secondary' },
};

// Recovery Milestones (in days)
export const RECOVERY_MILESTONES = [
  { days: 1, label: '24 Hours', color: '#F59E0B' },
  { days: 7, label: '1 Week', color: '#8B5CF6' },
  { days: 30, label: '1 Month', color: '#C084FC' },
  { days: 90, label: '3 Months', color: '#06B6D4' },
  { days: 180, label: '6 Months', color: '#22C55E' },
  { days: 365, label: '1 Year', color: '#FFD700' },
];

// Export Formats
export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'Excel' },
  { value: 'json', label: 'JSON' },
  { value: 'pdf', label: 'PDF' },
];

// Chart Time Ranges
export const TIME_RANGES = [
  { value: '1d', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
]; 