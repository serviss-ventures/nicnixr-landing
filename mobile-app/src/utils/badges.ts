export interface BadgeInfo {
  icon: string;
  type: 'leaf' | 'trending-up' | 'barbell' | 'shield' | 'star';
  color: string;
}

export const getBadgeForDaysClean = (daysClean: number): BadgeInfo | null => {
  // Calculate approximate health score from days clean
  // This is a rough approximation based on recovery patterns
  let healthScore = 0;
  
  if (daysClean === 0) {
    healthScore = 0;
  } else if (daysClean <= 3) {
    // 0-10% in first 3 days
    healthScore = Math.min((daysClean / 3) * 10, 10);
  } else if (daysClean <= 14) {
    // 10-30% in first 2 weeks
    healthScore = 10 + Math.min(((daysClean - 3) / 11) * 20, 20);
  } else if (daysClean <= 30) {
    // 30-60% in first month
    healthScore = 30 + Math.min(((daysClean - 14) / 16) * 30, 30);
  } else if (daysClean <= 90) {
    // 60-85% by 3 months
    healthScore = 60 + Math.min(((daysClean - 30) / 60) * 25, 25);
  } else {
    // 85%+ after 3 months
    healthScore = 85 + Math.min(((daysClean - 90) / 275) * 15, 15);
  }
  
  // Return badge based on recovery phase (aligned with dashboard phases)
  if (healthScore < 10) {
    // Starting Out - no badge yet
    return null;
  } else if (healthScore < 30) {
    // Early Progress
    return { icon: 'trending-up', type: 'trending-up', color: '#06B6D4' };
  } else if (healthScore < 60) {
    // Building Strength  
    return { icon: 'barbell', type: 'barbell', color: '#8B5CF6' };
  } else if (healthScore < 85) {
    // Major Recovery
    return { icon: 'shield-checkmark', type: 'shield', color: '#F59E0B' };
  } else {
    // Freedom
    return { icon: 'star', type: 'star', color: '#EF4444' };
  }
};

// Helper function to get recovery phase name from health score
export const getRecoveryPhaseFromHealthScore = (healthScore: number): string => {
  if (healthScore < 10) return 'Starting Out';
  if (healthScore < 30) return 'Early Progress';
  if (healthScore < 60) return 'Building Strength';
  if (healthScore < 85) return 'Major Recovery';
  return 'Freedom';
};

// Helper function to get recovery phase from days clean
export const getRecoveryPhaseFromDays = (daysClean: number): string => {
  const badge = getBadgeForDaysClean(daysClean);
  if (!badge) return 'Starting Out';
  
  // Map badge type to phase name
  switch (badge.type) {
    case 'trending-up': return 'Early Progress';
    case 'barbell': return 'Building Strength';
    case 'shield': return 'Major Recovery';
    case 'star': return 'Freedom';
    default: return 'Starting Out';
  }
}; 