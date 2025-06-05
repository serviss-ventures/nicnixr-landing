/**
 * Scientific Recovery Service
 * 
 * A comprehensive, research-based recovery tracking system that provides
 * accurate, non-linear recovery calculations based on neuroscience and
 * addiction medicine research.
 * 
 * @module scientificRecoveryService
 * @author NixR Team
 * @version 2.0.0
 */

import { UserNicotineProfile } from '../types';

/**
 * Recovery metric configuration with scientific basis
 */
interface RecoveryMetric {
  id: string;
  name: string;
  category: 'neurological' | 'cardiovascular' | 'respiratory' | 'metabolic' | 'sensory';
  weight: number; // Importance weight (0-1)
  maxRecovery: number; // Maximum achievable recovery (typically 95-98%)
  halfLife: number; // Days to reach 50% recovery
  scientificBasis: string;
  description: string;
}

/**
 * Comprehensive recovery calculation result
 */
export interface ScientificRecoveryData {
  overallRecovery: number;
  neurologicalRecovery: number;
  physicalRecovery: number;
  metrics: {
    [key: string]: {
      value: number;
      trend: 'improving' | 'stable' | 'plateau';
      daysToNextMilestone: number;
      description: string;
    };
  };
  phase: RecoveryPhaseData;
  projections: {
    days30: number;
    days90: number;
    days180: number;
    days365: number;
  };
  scientificNote: string;
}

/**
 * Recovery phase with detailed information
 */
interface RecoveryPhaseData {
  name: string;
  description: string;
  startDay: number;
  endDay: number;
  keyProcesses: string[];
  symptoms: string[];
  improvements: string[];
}

/**
 * Core recovery metrics based on scientific literature
 */
const RECOVERY_METRICS: RecoveryMetric[] = [
  {
    id: 'dopamine_receptors',
    name: 'Dopamine Receptor Density',
    category: 'neurological',
    weight: 0.20,
    maxRecovery: 95,
    halfLife: 30,
    scientificBasis: 'Volkow et al. (2001) - D2 receptor recovery in addiction',
    description: 'Recovery of dopamine D2 receptors, crucial for reward processing and motivation'
  },
  {
    id: 'prefrontal_function',
    name: 'Prefrontal Cortex Function',
    category: 'neurological',
    weight: 0.15,
    maxRecovery: 92,
    halfLife: 45,
    scientificBasis: 'Goldstein & Volkow (2011) - Prefrontal dysfunction in addiction',
    description: 'Executive function, decision-making, and impulse control recovery'
  },
  {
    id: 'neurotransmitter_balance',
    name: 'Neurotransmitter Balance',
    category: 'neurological',
    weight: 0.15,
    maxRecovery: 94,
    halfLife: 21,
    scientificBasis: 'Benowitz (2010) - Nicotine addiction mechanisms',
    description: 'Balance of serotonin, norepinephrine, and GABA systems'
  },
  {
    id: 'cardiovascular_function',
    name: 'Cardiovascular Health',
    category: 'cardiovascular',
    weight: 0.10,
    maxRecovery: 96,
    halfLife: 14,
    scientificBasis: 'Ambrose & Barua (2004) - Cardiovascular recovery post-smoking',
    description: 'Heart rate, blood pressure, and circulation normalization'
  },
  {
    id: 'respiratory_function',
    name: 'Respiratory Function',
    category: 'respiratory',
    weight: 0.10,
    maxRecovery: 85,
    halfLife: 60,
    scientificBasis: 'Scanlon et al. (2000) - Lung function recovery timeline',
    description: 'Lung capacity, cilia function, and mucus clearance'
  },
  {
    id: 'metabolic_function',
    name: 'Metabolic Health',
    category: 'metabolic',
    weight: 0.10,
    maxRecovery: 98,
    halfLife: 30,
    scientificBasis: 'Filozof et al. (2004) - Metabolic changes in smoking cessation',
    description: 'Insulin sensitivity, lipid profile, and energy metabolism'
  },
  {
    id: 'inflammatory_markers',
    name: 'Inflammatory Response',
    category: 'metabolic',
    weight: 0.08,
    maxRecovery: 94,
    halfLife: 21,
    scientificBasis: 'McEvoy et al. (2015) - Inflammatory biomarkers in cessation',
    description: 'Reduction in systemic inflammation and oxidative stress'
  },
  {
    id: 'sensory_function',
    name: 'Sensory Recovery',
    category: 'sensory',
    weight: 0.07,
    maxRecovery: 98,
    halfLife: 7,
    scientificBasis: 'Vennemann et al. (2008) - Taste and smell recovery',
    description: 'Taste bud regeneration and olfactory function'
  },
  {
    id: 'sleep_architecture',
    name: 'Sleep Quality',
    category: 'neurological',
    weight: 0.05,
    maxRecovery: 96,
    halfLife: 14,
    scientificBasis: 'Jaehne et al. (2009) - Sleep normalization in cessation',
    description: 'REM sleep, deep sleep phases, and circadian rhythm'
  }
];

/**
 * Recovery phases based on addiction medicine research
 */
const RECOVERY_PHASES: RecoveryPhaseData[] = [
  {
    name: 'Acute Withdrawal',
    description: 'Initial nicotine clearance and receptor adjustment',
    startDay: 0,
    endDay: 3,
    keyProcesses: [
      'Nicotine elimination from bloodstream',
      'Acetylcholine receptor upregulation begins',
      'Acute withdrawal symptoms peak'
    ],
    symptoms: [
      'Intense cravings',
      'Irritability and anxiety',
      'Difficulty concentrating',
      'Sleep disturbances'
    ],
    improvements: [
      'Carbon monoxide levels normalize',
      'Heart rate begins to stabilize',
      'Oxygen levels improve'
    ]
  },
  {
    name: 'Early Recovery',
    description: 'Neurochemical rebalancing and symptom resolution',
    startDay: 4,
    endDay: 14,
    keyProcesses: [
      'Dopamine receptor density increasing',
      'Neurotransmitter production stabilizing',
      'Withdrawal symptoms diminishing'
    ],
    symptoms: [
      'Moderate cravings',
      'Mood fluctuations',
      'Fatigue',
      'Increased appetite'
    ],
    improvements: [
      'Circulation improvement',
      'Taste and smell returning',
      'Energy levels stabilizing',
      'Sleep quality improving'
    ]
  },
  {
    name: 'Neural Adaptation',
    description: 'Brain plasticity and reward system recalibration',
    startDay: 15,
    endDay: 90,
    keyProcesses: [
      'Prefrontal cortex strengthening',
      'Dopamine sensitivity improving',
      'New neural pathways forming',
      'Inflammatory markers decreasing'
    ],
    symptoms: [
      'Occasional cravings',
      'Mild mood variations',
      'Concentration challenges'
    ],
    improvements: [
      'Executive function enhancement',
      'Emotional regulation improvement',
      'Physical stamina increasing',
      'Immune function strengthening'
    ]
  },
  {
    name: 'Consolidation',
    description: 'Stabilization of neurological and physical improvements',
    startDay: 91,
    endDay: 180,
    keyProcesses: [
      'Synaptic pruning of addiction pathways',
      'Long-term potentiation of healthy circuits',
      'Metabolic normalization'
    ],
    symptoms: [
      'Rare situational cravings',
      'Minimal physical symptoms'
    ],
    improvements: [
      'Sustained mood stability',
      'Cognitive performance optimization',
      'Cardiovascular health gains',
      'Reduced disease risk markers'
    ]
  },
  {
    name: 'Long-term Recovery',
    description: 'Ongoing optimization and maintenance',
    startDay: 181,
    endDay: 365,
    keyProcesses: [
      'Continued neuroplasticity',
      'Epigenetic modifications',
      'Cellular repair processes'
    ],
    symptoms: [
      'Negligible withdrawal effects',
      'Psychological habituation fading'
    ],
    improvements: [
      'Near-baseline neurotransmitter function',
      'Optimized cardiovascular health',
      'Enhanced stress resilience',
      'Improved longevity markers'
    ]
  },
  {
    name: 'Sustained Remission',
    description: 'Maintenance of recovery with ongoing benefits',
    startDay: 366,
    endDay: Infinity,
    keyProcesses: [
      'Stable neurochemistry',
      'Maintained structural brain changes',
      'Ongoing cellular regeneration'
    ],
    symptoms: [],
    improvements: [
      'Sustained recovery benefits',
      'Reduced relapse vulnerability',
      'Enhanced quality of life',
      'Normalized mortality risk'
    ]
  }
];

/**
 * Calculate recovery using a modified Michaelis-Menten kinetics model
 * This provides a more realistic, non-linear recovery curve
 * 
 * @param days - Days since cessation
 * @param halfLife - Days to reach 50% recovery
 * @param maxRecovery - Maximum achievable recovery percentage
 * @param steepness - Curve steepness factor (default 1.2)
 * @returns Recovery percentage
 */
function calculateNonLinearRecovery(
  days: number, 
  halfLife: number, 
  maxRecovery: number, 
  steepness: number = 1.2
): number {
  if (days <= 0) return 0;
  
  // Modified Michaelis-Menten equation for biological recovery
  const recovery = (maxRecovery * Math.pow(days, steepness)) / 
                  (Math.pow(halfLife, steepness) + Math.pow(days, steepness));
  
  return Math.round(recovery * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate recovery trend based on rate of change
 * 
 * @param days - Current days clean
 * @param metric - Recovery metric configuration
 * @returns Trend indicator
 */
function calculateTrend(days: number, metric: RecoveryMetric): 'improving' | 'stable' | 'plateau' {
  const current = calculateNonLinearRecovery(days, metric.halfLife, metric.maxRecovery);
  const future = calculateNonLinearRecovery(days + 7, metric.halfLife, metric.maxRecovery);
  const changeRate = future - current;
  
  if (changeRate > 1) return 'improving';
  if (changeRate > 0.1) return 'stable';
  return 'plateau';
}

/**
 * Calculate days to next significant milestone (5% improvement)
 * 
 * @param days - Current days clean
 * @param metric - Recovery metric configuration
 * @returns Days to next 5% improvement or -1 if plateaued
 */
function daysToNextMilestone(days: number, metric: RecoveryMetric): number {
  const current = calculateNonLinearRecovery(days, metric.halfLife, metric.maxRecovery);
  const target = Math.min(current + 5, metric.maxRecovery);
  
  if (current >= metric.maxRecovery - 1) return -1; // Already at max
  
  // Binary search for days to reach target
  let low = days;
  let high = days + 365;
  
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    const midValue = calculateNonLinearRecovery(mid, metric.halfLife, metric.maxRecovery);
    
    if (midValue < target) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  return high - days;
}

/**
 * Get current recovery phase based on days clean
 * 
 * @param days - Days since cessation
 * @returns Current recovery phase data
 */
function getCurrentPhase(days: number): RecoveryPhaseData {
  return RECOVERY_PHASES.find(phase => 
    days >= phase.startDay && days <= phase.endDay
  ) || RECOVERY_PHASES[RECOVERY_PHASES.length - 1];
}

/**
 * Generate scientific note based on recovery status
 * 
 * @param days - Days clean
 * @param overallRecovery - Overall recovery percentage
 * @returns Contextual scientific note
 */
function generateScientificNote(days: number, overallRecovery: number): string {
  if (days === 0) {
    return "Recovery begins immediately. Within 20 minutes, heart rate and blood pressure start normalizing.";
  } else if (days <= 3) {
    return "Nicotine is clearing from your system. Acetylcholine receptors are beginning to normalize, causing temporary discomfort.";
  } else if (days <= 14) {
    return "Your brain is actively rebalancing neurotransmitter systems. Dopamine receptors are upregulating to restore natural reward sensitivity.";
  } else if (days <= 30) {
    return "Neuroplasticity is accelerating. New neural pathways are forming while addiction circuits begin to weaken through synaptic pruning.";
  } else if (days <= 90) {
    return `At ${overallRecovery}% overall recovery, your prefrontal cortex is strengthening, improving executive function and decision-making.`;
  } else if (days <= 180) {
    return "Major neurological recovery is complete. Continued improvements in cognitive function and emotional regulation are ongoing.";
  } else if (days <= 365) {
    return "Your brain has largely adapted to functioning without nicotine. Risk of relapse continues to decrease as new patterns solidify.";
  } else {
    return "You've achieved sustained remission. Ongoing neuroplasticity maintains your recovery while cellular regeneration continues.";
  }
}

/**
 * Calculate comprehensive scientific recovery data
 * 
 * @param daysClean - Days since cessation
 * @param userProfile - User's nicotine use profile
 * @returns Complete recovery analysis
 */
export function calculateScientificRecovery(
  daysClean: number,
  userProfile?: UserNicotineProfile
): ScientificRecoveryData {
  // Calculate individual metric recoveries
  const metricResults: ScientificRecoveryData['metrics'] = {};
  let weightedSum = 0;
  let totalWeight = 0;
  let neurologicalSum = 0;
  let neurologicalWeight = 0;
  let physicalSum = 0;
  let physicalWeight = 0;
  
  for (const metric of RECOVERY_METRICS) {
    const value = calculateNonLinearRecovery(daysClean, metric.halfLife, metric.maxRecovery);
    const trend = calculateTrend(daysClean, metric);
    const daysToNext = daysToNextMilestone(daysClean, metric);
    
    metricResults[metric.id] = {
      value,
      trend,
      daysToNextMilestone: daysToNext,
      description: metric.description
    };
    
    // Add to weighted calculations
    weightedSum += value * metric.weight;
    totalWeight += metric.weight;
    
    // Separate neurological vs physical
    if (metric.category === 'neurological') {
      neurologicalSum += value * metric.weight;
      neurologicalWeight += metric.weight;
    } else {
      physicalSum += value * metric.weight;
      physicalWeight += metric.weight;
    }
  }
  
  // Calculate overall scores
  const overallRecovery = Math.round((weightedSum / totalWeight) * 10) / 10;
  const neurologicalRecovery = Math.round((neurologicalSum / neurologicalWeight) * 10) / 10;
  const physicalRecovery = Math.round((physicalSum / physicalWeight) * 10) / 10;
  
  // Get current phase
  const phase = getCurrentPhase(daysClean);
  
  // Calculate projections
  const projections = {
    days30: Math.round((calculateProjectedRecovery(30, RECOVERY_METRICS) / totalWeight) * 10) / 10,
    days90: Math.round((calculateProjectedRecovery(90, RECOVERY_METRICS) / totalWeight) * 10) / 10,
    days180: Math.round((calculateProjectedRecovery(180, RECOVERY_METRICS) / totalWeight) * 10) / 10,
    days365: Math.round((calculateProjectedRecovery(365, RECOVERY_METRICS) / totalWeight) * 10) / 10,
  };
  
  // Generate scientific note
  const scientificNote = generateScientificNote(daysClean, overallRecovery);
  
  return {
    overallRecovery,
    neurologicalRecovery,
    physicalRecovery,
    metrics: metricResults,
    phase,
    projections,
    scientificNote
  };
}

/**
 * Calculate projected recovery for a future date
 * 
 * @param days - Days in the future
 * @param metrics - Recovery metrics to calculate
 * @returns Weighted sum of projected recoveries
 */
function calculateProjectedRecovery(days: number, metrics: RecoveryMetric[]): number {
  return metrics.reduce((sum, metric) => {
    const recovery = calculateNonLinearRecovery(days, metric.halfLife, metric.maxRecovery);
    return sum + (recovery * metric.weight);
  }, 0);
}

/**
 * Get detailed metric information
 * 
 * @param metricId - Metric identifier
 * @returns Detailed metric configuration or undefined
 */
export function getMetricDetails(metricId: string): RecoveryMetric | undefined {
  return RECOVERY_METRICS.find(m => m.id === metricId);
}

/**
 * Get all recovery phases
 * 
 * @returns Array of all recovery phases
 */
export function getRecoveryPhases(): RecoveryPhaseData[] {
  return RECOVERY_PHASES;
}

/**
 * Validate recovery data for consistency
 * 
 * @param data - Recovery data to validate
 * @returns Boolean indicating if data is valid
 */
export function validateRecoveryData(data: ScientificRecoveryData): boolean {
  return (
    data.overallRecovery >= 0 && data.overallRecovery <= 100 &&
    data.neurologicalRecovery >= 0 && data.neurologicalRecovery <= 100 &&
    data.physicalRecovery >= 0 && data.physicalRecovery <= 100 &&
    Object.keys(data.metrics).length > 0 &&
    data.phase !== undefined &&
    data.projections !== undefined
  );
}

export default {
  calculateScientificRecovery,
  getMetricDetails,
  getRecoveryPhases,
  validateRecoveryData,
  RECOVERY_METRICS,
  RECOVERY_PHASES
}; 