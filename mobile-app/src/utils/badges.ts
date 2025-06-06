export interface BadgeInfo {
  icon: string;
  type: 'flame' | 'lightning' | 'crown';
  color: string;
}

export const getBadgeForDaysClean = (daysClean: number): BadgeInfo | null => {
  if (daysClean >= 100) {
    return { icon: 'trophy', type: 'crown', color: '#F59E0B' };
  } else if (daysClean >= 30) {
    return { icon: 'flash', type: 'lightning', color: '#3B82F6' };
  } else if (daysClean >= 7) {
    return { icon: 'flame', type: 'flame', color: '#EF4444' };
  }
  return null;
}; 