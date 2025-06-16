/**
 * Date utility functions
 * Clean, focused utilities for date formatting and manipulation
 */

/**
 * Formats a date into a human-readable "time ago" string
 * @param date - The date to format
 * @returns A string like "2 hours ago", "3 days ago", etc.
 */
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
};

/**
 * Formats a date to a standard display format
 * @param date - The date to format
 * @returns A string like "Jan 15, 2025"
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Formats a date to show time
 * @param date - The date to format
 * @returns A string like "2:30 PM"
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Gets days between two dates
 * @param startDate - The start date
 * @param endDate - The end date (defaults to now)
 * @returns Number of days between dates
 */
export const getDaysBetween = (startDate: Date, endDate: Date = new Date()): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor((endDate.getTime() - startDate.getTime()) / oneDay);
};

/**
 * Checks if a date is today
 * @param date - The date to check
 * @returns true if the date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Checks if a date is yesterday
 * @param date - The date to check
 * @returns true if the date is yesterday
 */
export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

/**
 * Formats a date for display in chat/messages
 * Shows "Today", "Yesterday", or the date
 * @param date - The date to format
 * @returns A formatted string
 */
export const formatMessageDate = (date: Date): string => {
  if (isToday(date)) {
    return `Today at ${formatTime(date)}`;
  } else if (isYesterday(date)) {
    return `Yesterday at ${formatTime(date)}`;
  } else {
    return `${formatDate(date)} at ${formatTime(date)}`;
  }
}; 