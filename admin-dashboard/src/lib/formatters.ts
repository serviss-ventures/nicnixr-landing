// Data formatting utilities for the admin dashboard

// Number formatting
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

export const formatPercentage = (num: number, decimals: number = 1): string => {
  return `${num.toFixed(decimals)}%`;
};

export const formatChange = (num: number, includeSign: boolean = true): string => {
  const formatted = formatPercentage(Math.abs(num));
  if (!includeSign) return formatted;
  return num >= 0 ? `+${formatted}` : `-${formatted}`;
};

// Currency formatting
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  compact: boolean = false
): string => {
  if (compact && amount >= 1000) {
    return `$${formatNumber(amount)}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Date formatting
export const formatDate = (date: Date | string, format: 'short' | 'medium' | 'long' = 'medium'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'long':
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    default:
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export const formatDateTime = (date: Date | string): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
};

// Duration formatting
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

export const formatDaysClean = (days: number): string => {
  if (days === 0) return 'New';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  const years = Math.floor(days / 365);
  const remainingMonths = Math.floor((days % 365) / 30);
  if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
  return `${years}y ${remainingMonths}m`;
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Metric formatting
export const formatMetric = (value: number, type: 'time' | 'percentage' | 'number' | 'currency' = 'number'): string => {
  switch (type) {
    case 'time':
      return `${value}ms`;
    case 'percentage':
      return formatPercentage(value);
    case 'currency':
      return formatCurrency(value, 'USD', true);
    default:
      return formatNumber(value);
  }
};

// Status formatting
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    active: 'text-success',
    inactive: 'text-white/60',
    pending: 'text-warning',
    error: 'text-destructive',
    success: 'text-success',
    warning: 'text-warning',
    critical: 'text-destructive',
    operational: 'text-success',
    degraded: 'text-warning',
    down: 'text-destructive',
  };
  return statusColors[status.toLowerCase()] || 'text-white/60';
};

// User tier formatting
export const getUserTierColor = (tier: string): string => {
  const tierColors: Record<string, string> = {
    free: 'text-white/60',
    premium: 'text-primary',
    enterprise: 'text-secondary',
  };
  return tierColors[tier.toLowerCase()] || 'text-white/60';
};

// Platform formatting
export const formatPlatform = (platform: string): string => {
  const platforms: Record<string, string> = {
    ios: 'iOS',
    android: 'Android',
    web: 'Web',
  };
  return platforms[platform.toLowerCase()] || platform;
};

// Chart data formatting
export const formatChartValue = (value: number, dataKey: string): string => {
  // Add custom formatting based on the data key
  if (dataKey.includes('revenue') || dataKey.includes('cost')) {
    return formatCurrency(value, 'USD', true);
  }
  if (dataKey.includes('rate') || dataKey.includes('percentage')) {
    return formatPercentage(value);
  }
  if (dataKey.includes('time')) {
    return `${value}ms`;
  }
  return formatNumber(value);
};

// Truncate text
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

// Pluralize
export const pluralize = (count: number, singular: string, plural?: string): string => {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || `${singular}s`}`;
}; 