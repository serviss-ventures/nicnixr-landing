export interface BadgeInfo {
  icon: string;
  type: string;
  color: string;
  milestone?: string;
}

// Journey milestones with epic long-term badges
const JOURNEY_MILESTONES = [
  { days: 1, title: 'First Day', icon: 'checkmark-circle', color: '#10B981' },
  { days: 3, title: '3 Days', icon: 'flash', color: '#F59E0B' },
  { days: 7, title: '1 Week', icon: 'shield-checkmark', color: '#3B82F6' },
  { days: 14, title: '2 Weeks', icon: 'trending-up', color: '#8B5CF6' },
  { days: 30, title: '1 Month', icon: 'medal', color: '#EC4899' },
  { days: 60, title: '2 Months', icon: 'flame', color: '#EF4444' },
  { days: 90, title: '3 Months', icon: 'rocket', color: '#06B6D4' },
  { days: 180, title: '6 Months', icon: 'star', color: '#F59E0B' },
  { days: 365, title: '1 Year', icon: 'trophy', color: '#FFD700' },
  // Epic long-term badges
  { days: 730, title: '2 Years', icon: 'diamond', color: '#10F4B1' },
  { days: 1825, title: '5 Years', icon: 'planet', color: '#B464FF' },
  { days: 3650, title: '10 Years', icon: 'infinite', color: '#FF0080' },
];

export const getBadgeForDaysClean = (daysClean: number): BadgeInfo | null => {
  // Find the highest milestone achieved
  let achievedMilestone = null;
  
  for (const milestone of JOURNEY_MILESTONES) {
    if (daysClean >= milestone.days) {
      achievedMilestone = milestone;
    } else {
      break; // Milestones are ordered, so we can stop here
    }
  }
  
  if (!achievedMilestone) {
    return null;
  }
  
  return {
    icon: achievedMilestone.icon,
    type: achievedMilestone.icon, // Using icon name as type for flexibility
    color: achievedMilestone.color,
    milestone: achievedMilestone.title
  };
};

// Helper function to get recovery phase name from health score
export const getRecoveryPhaseFromHealthScore = (healthScore: number): string => {
  if (healthScore < 10) return 'Starting Out';
  if (healthScore < 30) return 'Early Progress';
  if (healthScore < 60) return 'Building Strength';
  if (healthScore < 85) return 'Major Recovery';
  return 'Freedom';
};

// Helper function to get recovery phase from days clean using milestones
export const getRecoveryPhaseFromDays = (daysClean: number): string => {
  if (daysClean < 1) return 'Starting Out';
  if (daysClean < 7) return 'Early Progress';
  if (daysClean < 30) return 'Building Strength';
  if (daysClean <= 90) return 'Major Recovery';  // Changed to <= to include day 90
  if (daysClean < 365) return 'Freedom';
  if (daysClean < 730) return 'Mastery';
  if (daysClean < 1825) return 'Legend';
  return 'Immortal';
};

// Export journey milestones for consistency across the app
export const JOURNEY_MILESTONES_EXPORT = JOURNEY_MILESTONES; 