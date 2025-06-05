import { store } from '../store/store';
import { selectProgressStats, selectHealthMetrics, selectProgress } from '../store/slices/progressSlice';
import { calculateScientificRecovery } from './scientificRecoveryService';

/**
 * Unified Recovery Tracking Service
 * 
 * This service provides a single source of truth for all recovery calculations
 * and ensures consistency across all components in the app.
 */

export interface RecoveryData {
  daysClean: number;
  hoursClean: number;
  minutesClean: number;
  secondsClean: number;
  recoveryPercentage: number;
  healthScore: number;
  moneySaved: number;
  lifeRegained: number;
  unitsAvoided: number;
  personalizedUnitName: string;
  recoveryPhase: RecoveryPhase;
  recoveryMessage: string;
  growthMessage: string;
}

export interface RecoveryPhase {
  id: string;
  name: string;
  description: string;
  timeframe: string;
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
}

export interface RecoveryTimeline {
  milestone: string;
  benefit: string;
  timeframe: string;
  isCompleted: boolean;
  daysRequired: number;
}

/**
 * Get comprehensive recovery data from the centralized store
 */
export const getRecoveryData = (): RecoveryData => {
  const state = store.getState();
  const stats = selectProgressStats(state);
  const healthMetrics = selectHealthMetrics(state);
  const progress = selectProgress(state);
  const userProfile = progress?.userProfile;
  
  // Calculate dopamine pathway recovery percentage
  const recoveryPercentage = calculateDopamineRecovery(stats?.daysClean || 0);
  
  // Get personalized unit name with fallbacks
  const personalizedUnitName = getPersonalizedUnitName(
    userProfile?.category || 'other',
    stats?.unitsAvoided || 0
  );
  
  // Get current recovery phase
  const recoveryPhase = getCurrentRecoveryPhase(stats?.daysClean || 0);
  
  // Get personalized recovery message
  const recoveryMessage = getPersonalizedRecoveryMessage(stats?.daysClean || 0, recoveryPercentage);
  
  // Get growth message
  const growthMessage = getGrowthMessage(stats?.daysClean || 0);
  
  return {
    daysClean: stats?.daysClean || 0,
    hoursClean: stats?.hoursClean || 0,
    minutesClean: stats?.minutesClean || 0,
    secondsClean: stats?.secondsClean || 0,
    recoveryPercentage,
    healthScore: stats?.healthScore || 0,
    moneySaved: stats?.moneySaved || 0,
    lifeRegained: stats?.lifeRegained || 0,
    unitsAvoided: stats?.unitsAvoided || 0,
    personalizedUnitName,
    recoveryPhase,
    recoveryMessage,
    growthMessage,
  };
};

/**
 * Calculate dopamine pathway recovery percentage based on research
 * Scientific basis: Most dopamine receptor recovery occurs within 90 days,
 * but neuroplasticity continues beyond with subtle improvements
 */
export const calculateDopamineRecovery = (daysClean: number): number => {
  // Get current health score to align pathway recovery
  const state = store.getState();
  const stats = selectProgressStats(state);
  const healthScore = stats.healthScore || 0;
  
  let baseRecovery = 0;
  
  if (daysClean === 0) {
    baseRecovery = 0; // Starting recovery
  } else if (daysClean <= 3) {
    // Acute withdrawal phase: rapid initial changes
    baseRecovery = Math.min((daysClean / 3) * 15, 15); // 0-15% in first 3 days
  } else if (daysClean <= 14) {
    // Early recovery: significant receptor upregulation
    baseRecovery = 15 + Math.min(((daysClean - 3) / 11) * 25, 25); // 15-40% in first 2 weeks
  } else if (daysClean <= 30) {
    // Consolidation phase: major improvements
    baseRecovery = 40 + Math.min(((daysClean - 14) / 16) * 25, 25); // 40-65% in first month
  } else if (daysClean <= 90) {
    // Primary recovery phase: most healing occurs here
    baseRecovery = 65 + Math.min(((daysClean - 30) / 60) * 25, 25); // 65-90% by 3 months
  } else if (daysClean <= 180) {
    // Extended recovery: slower but continued improvement
    baseRecovery = 90 + Math.min(((daysClean - 90) / 90) * 5, 5); // 90-95% by 6 months
  } else if (daysClean <= 365) {
    // Long-term recovery: subtle refinements
    baseRecovery = 95 + Math.min(((daysClean - 180) / 185) * 5, 5); // 95-100% by 1 year
  } else {
    // Maintenance phase: full recovery achieved
    baseRecovery = 100; // 100% after 1 year - you've done it!
  }
  
  // Align with health score for better user experience
  // This represents overall health recovery, not just dopamine pathways
  if (healthScore > 90 && baseRecovery < 90 && daysClean >= 60) {
    // If overall health is excellent, dopamine should be close
    baseRecovery = Math.max(baseRecovery, Math.min(healthScore - 5, 90));
  }
  
  return Math.round(baseRecovery);
};

/**
 * Get personalized unit name based on product category
 */
export const getPersonalizedUnitName = (category: string, amount: number): string => {
  // Handle null/undefined inputs
  if (!category || typeof amount !== 'number' || amount < 0) {
    return 'units avoided';
  }

  switch (category.toLowerCase()) {
    case 'cigarettes':
    case 'cigarette':
      // Convert cigarettes to packs (20 cigarettes per pack)
      const packs = amount / 20;
      if (packs >= 1) {
        // Show as packs if it's 1 or more packs
        const roundedPacks = Math.round(packs * 10) / 10; // Round to 1 decimal
        if (roundedPacks === 1) {
          return 'pack avoided';
        } else if (roundedPacks % 1 === 0) {
          // Whole number of packs
          return `${Math.round(roundedPacks)} packs avoided`;
        } else {
          // Decimal packs
          return `${roundedPacks} packs avoided`;
        }
      } else {
        // Less than a pack, show as cigarettes
        return amount === 1 ? 'cigarette avoided' : `${amount} cigarettes avoided`;
      }
    case 'vape':
    case 'vaping':
    case 'e-cigarette':
      return amount === 1 ? 'pod avoided' : `${amount} pods avoided`;
    case 'pouches':
    case 'nicotine_pouches':
    case 'pouch':
      // Convert pouches to tins (assuming 15 pouches per tin)
      const tins = amount / 15;
      if (tins >= 1 && tins % 1 === 0) {
        // Whole number of tins
        return tins === 1 ? 'tin avoided' : `${tins} tins avoided`;
      } else if (tins >= 1) {
        // More than 1 tin but not a whole number, show as pouches
        return `${amount} pouches avoided`;
      } else {
        // Less than a tin
        return amount === 1 ? 'pouch avoided' : `${amount} pouches avoided`;
      }
    case 'chewing':
    case 'chew':
    case 'dip':
    case 'chew_dip':
      // For dip/chew, assume 1 can per day for heavy users
      // If they use 1 per day, show as cans
      // Otherwise show as portions
      if (amount >= 7 && amount % 7 === 0) {
        // Weekly cans
        const cans = amount / 7;
        return cans === 1 ? 'tin avoided' : `${cans} tins avoided`;
      } else {
        return amount === 1 ? 'portion avoided' : `${amount} portions avoided`;
      }
    case 'cigars':
    case 'cigar':
      return amount === 1 ? 'cigar avoided' : `${amount} cigars avoided`;
    case 'other':
    default:
      return amount === 1 ? 'unit avoided' : `${amount} units avoided`;
  }
};

/**
 * Get current recovery phase based on days clean
 */
export const getCurrentRecoveryPhase = (daysClean: number): RecoveryPhase => {
  const phases = [
    {
      id: 'detox',
      name: 'Detox Phase',
      description: 'Nicotine clearance and initial withdrawal',
      timeframe: '0-3 days',
      minDays: 0,
      maxDays: 3,
    },
    {
      id: 'acute',
      name: 'Acute Recovery',
      description: 'Withdrawal resolution and early healing',
      timeframe: '3-14 days',
      minDays: 3,
      maxDays: 14,
    },
    {
      id: 'restoration',
      name: 'Tissue Restoration',
      description: 'Physical healing and function improvement',
      timeframe: '2-12 weeks',
      minDays: 14,
      maxDays: 84,
    },
    {
      id: 'neuroplasticity',
      name: 'Neural Rewiring',
      description: 'Brain chemistry rebalancing',
      timeframe: '3-6 months',
      minDays: 84,
      maxDays: 180,
    },
    {
      id: 'optimization',
      name: 'System Optimization',
      description: 'Complete recovery and enhancement',
      timeframe: '6+ months',
      minDays: 180,
      maxDays: Infinity,
    },
  ];
  
  for (const phase of phases) {
    if (daysClean >= phase.minDays && daysClean < phase.maxDays) {
      const progress = phase.maxDays === Infinity 
        ? Math.min(((daysClean - phase.minDays) / 185) * 100, 100)
        : ((daysClean - phase.minDays) / (phase.maxDays - phase.minDays)) * 100;
      
      return {
        id: phase.id,
        name: phase.name,
        description: phase.description,
        timeframe: phase.timeframe,
        isActive: true,
        isCompleted: false,
        progress: Math.min(progress, 100),
      };
    }
  }
  
  // If we get here, they're in the final phase
  const finalPhase = phases[phases.length - 1];
  return {
    id: finalPhase.id,
    name: finalPhase.name,
    description: finalPhase.description,
    timeframe: finalPhase.timeframe,
    isActive: true,
    isCompleted: false,
    progress: Math.min(((daysClean - 180) / 185) * 100, 100),
  };
};

/**
 * Get personalized recovery message based on progress
 */
export const getPersonalizedRecoveryMessage = (daysClean: number, recoveryPercentage: number): string => {
  if (daysClean === 0) {
    return "You're at the beginning of your recovery journey. Your brain is preparing to heal from nicotine addiction.";
  } else if (daysClean === 1) {
    return `Amazing! You've completed your first day. Your dopamine pathways are ${Math.round(recoveryPercentage)}% recovered and nicotine is already clearing from your system.`;
  } else if (daysClean <= 3) {
    return `You're in the crucial detox phase! ${daysClean} days strong. Your dopamine pathways are ${Math.round(recoveryPercentage)}% recovered as your brain begins to rebalance.`;
  } else if (daysClean <= 7) {
    return `Incredible progress! You've made it ${daysClean} days. Your dopamine pathways are ${Math.round(recoveryPercentage)}% recovered and cravings are starting to decrease.`;
  } else if (daysClean <= 14) {
    return `You're in early recovery - ${daysClean} days clean! Your dopamine pathways are ${Math.round(recoveryPercentage)}% recovered. The hardest part is behind you.`;
  } else if (daysClean <= 21) {
    return `Three weeks of freedom! Your dopamine pathways are ${Math.round(recoveryPercentage)}% recovered. You're building powerful new neural patterns.`;
  } else if (daysClean <= 30) {
    return `Nearly a month clean - incredible! Your dopamine pathways are ${Math.round(recoveryPercentage)}% recovered. Major brain healing is happening.`;
  } else if (daysClean <= 60) {
    return `Over a month of recovery! Your dopamine pathways are ${Math.round(recoveryPercentage)}% recovered. You're experiencing significant improvements in mood and focus.`;
  } else if (daysClean <= 90) {
    return `Two months plus of freedom! Your dopamine pathways are ${Math.round(recoveryPercentage)}% recovered. Your brain is healing beautifully.`;
  } else if (daysClean <= 180) {
    return `Three months of recovery - a major milestone! Your dopamine pathways are ${Math.round(recoveryPercentage)}% recovered. Most of your brain's reward system has healed.`;
  } else if (daysClean <= 365) {
    return `Six months plus of freedom! Your dopamine pathways are ${Math.round(recoveryPercentage)}% recovered. You've achieved remarkable neural healing.`;
  } else if (recoveryPercentage >= 100) {
    return `🎉 INCREDIBLE! You've achieved 100% recovery! After ${daysClean} days, your brain has fully healed from nicotine addiction. You're living proof that complete recovery is possible!`;
  } else {
    return `Over a year clean - you're a recovery champion! Your dopamine pathways are ${Math.round(recoveryPercentage)}% recovered. Your brain has largely restored its natural function.`;
  }
};

/**
 * Get growth message for dashboard
 */
export const getGrowthMessage = (daysClean: number): string => {
  if (daysClean === 0) return "Your brain is ready to begin healing";
  else if (daysClean === 1) return "Dopamine pathways starting to rebalance";
  else if (daysClean < 7) return "Reward circuits strengthening daily";
  else if (daysClean < 30) return "Neural pathways rapidly recovering";
  else if (daysClean < 90) return "Brain chemistry rebalancing significantly";
  else return "Dopamine system largely restored";
};

/**
 * Get recovery timeline with milestones
 */
export const getRecoveryTimeline = (daysClean: number): RecoveryTimeline[] => {
  const state = store.getState();
  const progress = selectProgress(state);
  const userProfile = progress.userProfile;
  
  const baseTimeline: RecoveryTimeline[] = [
    {
      milestone: '20 minutes',
      benefit: 'Heart rate and blood pressure normalize',
      timeframe: '20 minutes',
      isCompleted: daysClean >= 1,
      daysRequired: 0,
    },
    {
      milestone: '12 hours',
      benefit: 'Nicotine completely eliminated from bloodstream',
      timeframe: '12 hours',
      isCompleted: daysClean >= 1,
      daysRequired: 0,
    },
    {
      milestone: '24 hours',
      benefit: 'Carbon monoxide levels normalize',
      timeframe: '24 hours',
      isCompleted: daysClean >= 1,
      daysRequired: 1,
    },
    {
      milestone: '48 hours',
      benefit: 'Taste and smell dramatically improve',
      timeframe: '48 hours',
      isCompleted: daysClean >= 2,
      daysRequired: 2,
    },
    {
      milestone: '72 hours',
      benefit: 'Withdrawal symptoms peak and begin declining',
      timeframe: '72 hours',
      isCompleted: daysClean >= 3,
      daysRequired: 3,
    },
    {
      milestone: '1 week',
      benefit: 'Circulation improves, energy levels stabilize',
      timeframe: '1 week',
      isCompleted: daysClean >= 7,
      daysRequired: 7,
    },
    {
      milestone: '2 weeks',
      benefit: 'Sleep quality improves, mental clarity returns',
      timeframe: '2 weeks',
      isCompleted: daysClean >= 14,
      daysRequired: 14,
    },
    {
      milestone: '1 month',
      benefit: 'Lung function improves, mood stabilizes',
      timeframe: '1 month',
      isCompleted: daysClean >= 30,
      daysRequired: 30,
    },
    {
      milestone: '3 months',
      benefit: 'Brain chemistry largely rebalanced',
      timeframe: '3 months',
      isCompleted: daysClean >= 90,
      daysRequired: 90,
    },
    {
      milestone: '6 months',
      benefit: 'Complete neural pathway recovery',
      timeframe: '6 months',
      isCompleted: daysClean >= 180,
      daysRequired: 180,
    },
    {
      milestone: '1 year',
      benefit: 'Optimal health and addiction resistance',
      timeframe: '1 year',
      isCompleted: daysClean >= 365,
      daysRequired: 365,
    },
  ];
  
  // Customize based on product type
  if (userProfile?.category === 'cigarettes') {
    baseTimeline[2] = { 
      ...baseTimeline[2], 
      benefit: 'Carbon monoxide completely eliminated' 
    };
    baseTimeline[4] = { 
      ...baseTimeline[4], 
      benefit: 'Lung function improves by 30%' 
    };
  } else if (userProfile?.category === 'vape') {
    baseTimeline[1] = { 
      ...baseTimeline[1], 
      benefit: 'Vape chemicals begin clearing from lungs' 
    };
    baseTimeline[3] = { 
      ...baseTimeline[3], 
      benefit: 'Artificial flavoring residue eliminated' 
    };
  } else if (userProfile?.category === 'pouches') {
    baseTimeline[2] = { 
      ...baseTimeline[2], 
      benefit: 'Oral tissue irritation begins healing' 
    };
    baseTimeline[5] = { 
      ...baseTimeline[5], 
      benefit: 'Gum health dramatically improves' 
    };
  }
  
  return baseTimeline;
};

/**
 * Log recovery data for debugging (development only)
 */
export const logRecoveryData = (context: string = 'Recovery Tracking') => {
  if (__DEV__) {
    const data = getRecoveryData();
    console.log(`🧠 ${context}: Day ${data.daysClean} = ${data.recoveryPercentage}% dopamine pathway recovery`);
    console.log(`💭 Growth Message: "${data.growthMessage}"`);
    console.log(`📊 Health Score: ${Math.round(data.healthScore)}%`);
    console.log(`💰 Money Saved: $${Math.round(data.moneySaved)}`);
    console.log(`⏰ Life Regained: ${Math.round(data.lifeRegained * 10) / 10} hours`);
    console.log(`🚫 ${data.personalizedUnitName}: ${data.unitsAvoided}`);
  }
};

/**
 * Validate recovery data consistency
 */
export const validateRecoveryData = (): boolean => {
  try {
    const data = getRecoveryData();
    
    // Check for valid numbers
    const isValidNumber = (value: number) => 
      typeof value === 'number' && isFinite(value) && !isNaN(value);
    
    const validations = [
      isValidNumber(data.daysClean) && data.daysClean >= 0,
      isValidNumber(data.recoveryPercentage) && data.recoveryPercentage >= 0 && data.recoveryPercentage <= 100,
      isValidNumber(data.healthScore) && data.healthScore >= 0 && data.healthScore <= 100,
      isValidNumber(data.moneySaved) && data.moneySaved >= 0,
      isValidNumber(data.lifeRegained) && data.lifeRegained >= 0,
      isValidNumber(data.unitsAvoided) && data.unitsAvoided >= 0,
      typeof data.personalizedUnitName === 'string' && data.personalizedUnitName.length > 0,
      typeof data.recoveryMessage === 'string' && data.recoveryMessage.length > 0,
      typeof data.recoveryPhase === 'object' && data.recoveryPhase.id.length > 0,
    ];
    
    const isValid = validations.every(Boolean);
    
    if (!isValid && __DEV__) {
      console.warn('⚠️ Recovery data validation failed:', {
        daysClean: data.daysClean,
        recoveryPercentage: data.recoveryPercentage,
        healthScore: data.healthScore,
        validations,
      });
    }
    
    return isValid;
  } catch (error) {
    if (__DEV__) {
      console.error('❌ Recovery data validation error:', error);
    }
    return false;
  }
};

export default {
  getRecoveryData,
  calculateDopamineRecovery,
  getPersonalizedUnitName,
  getCurrentRecoveryPhase,
  getPersonalizedRecoveryMessage,
  getGrowthMessage,
  getRecoveryTimeline,
  logRecoveryData,
  validateRecoveryData,
}; 