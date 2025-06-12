interface JournalEntry {
  date: string;
  // Core Mental Health
  moodPositive: boolean | null;
  hadCravings: boolean | null;
  cravingIntensity: number;
  stressHigh: boolean | null;
  anxietyLevel: number;
  
  // Core Physical
  sleepQuality: boolean | null;
  sleepHours: number;
  energyLevel: number;
  
  // Core Behavioral
  triggersEncountered: boolean | null;
  copingStrategiesUsed: boolean | null;
  
  // Additional factors
  usedBreathing: boolean | null;
  meditationMinutes: number;
  moodSwings: boolean | null;
  irritability: boolean | null;
  concentration: number;
  waterGlasses: number;
  exercised: boolean | null;
  exerciseMinutes: number;
  appetite: number;
  headaches: boolean | null;
  socialSupport: boolean | null;
  avoidedTriggers: boolean | null;
  productiveDay: boolean | null;
}

export interface Pattern {
  type: 'positive' | 'challenging';
  factor: string;
  impact: number;
  description: string;
  confidence: number; // 0-100, based on sample size
  trend?: 'improving' | 'declining' | 'stable'; // For long-term users
}

export interface Insight {
  icon: string;
  title: string;
  description: string;
  priority: number; // 1-10, higher = more important
  category: 'correlation' | 'trend' | 'achievement' | 'warning';
}

export interface InsightsData {
  entryCount: number;
  lastUpdated: string;
  positivePatterns: Pattern[];
  challengingPatterns: Pattern[];
  insights: Insight[];
  dataQuality: 'limited' | 'good' | 'excellent'; // Based on entry count
}

export const generateInsights = (entries: { [date: string]: JournalEntry }): InsightsData => {
  const entryArray = Object.entries(entries).map(([date, data]) => ({ ...data, date }));
  const entryCount = entryArray.length;
  
  if (entryCount < 5) {
    return {
      entryCount,
      lastUpdated: 'Never',
      positivePatterns: [],
      challengingPatterns: [],
      insights: [],
      dataQuality: 'limited'
    };
  }

  // Sort entries by date (newest first for last updated)
  entryArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastEntry = entryArray[0];
  
  // Determine data quality
  const dataQuality = entryCount < 30 ? 'limited' : entryCount < 100 ? 'good' : 'excellent';
  
  // For analysis, work with chronological order
  entryArray.reverse();
  
  // Use recent data for patterns (last 30 days) but all data for trends
  const recentEntries = entryArray.slice(-30);
  const patterns = calculatePatterns(recentEntries, entryArray, dataQuality);
  const insights = generatePersonalizedInsights(entryArray, patterns, dataQuality);
  
  return {
    entryCount,
    lastUpdated: formatLastUpdated(lastEntry.date),
    positivePatterns: patterns.positive,
    challengingPatterns: patterns.challenging,
    insights,
    dataQuality
  };
};

const calculatePatterns = (
  recentEntries: JournalEntry[], 
  allEntries: JournalEntry[],
  dataQuality: 'limited' | 'good' | 'excellent'
): { positive: Pattern[], challenging: Pattern[] } => {
  const patterns: { positive: Pattern[], challenging: Pattern[] } = {
    positive: [],
    challenging: []
  };

  // Calculate confidence based on sample size
  const getConfidence = (sampleSize: number): number => {
    if (sampleSize < 5) return 30;
    if (sampleSize < 10) return 50;
    if (sampleSize < 20) return 70;
    if (sampleSize < 50) return 85;
    return 95;
  };

  // Sleep Quality Impact
  const goodSleepDays = recentEntries.filter(e => e.sleepQuality === true);
  const poorSleepDays = recentEntries.filter(e => e.sleepQuality === false);
  
  if (goodSleepDays.length >= 1 && poorSleepDays.length >= 1) {
    const goodSleepCravings = goodSleepDays.filter(e => e.hadCravings).length / goodSleepDays.length;
    const poorSleepCravings = poorSleepDays.filter(e => e.hadCravings).length / poorSleepDays.length;
    
    if (poorSleepCravings > goodSleepCravings) {
      const impact = Math.round((poorSleepCravings - goodSleepCravings) * 100);
      patterns.positive.push({
        type: 'positive',
        factor: 'Good sleep quality',
        impact,
        description: 'Reduces craving likelihood',
        confidence: getConfidence(goodSleepDays.length + poorSleepDays.length)
      });
    }
  }

  // Exercise Impact on Multiple Factors
  const exerciseDays = recentEntries.filter(e => e.exercised === true);
  const noExerciseDays = recentEntries.filter(e => e.exercised === false);
  
  if (exerciseDays.length >= 2 && noExerciseDays.length >= 2) {
    // Energy impact
    const exerciseEnergy = average(exerciseDays.map(e => e.energyLevel));
    const noExerciseEnergy = average(noExerciseDays.map(e => e.energyLevel));
    
    if (exerciseEnergy > noExerciseEnergy) {
      const impact = Math.round(((exerciseEnergy - noExerciseEnergy) / noExerciseEnergy) * 100);
      patterns.positive.push({
        type: 'positive',
        factor: 'Regular exercise',
        impact,
        description: 'Boosts energy levels',
        confidence: getConfidence(exerciseDays.length + noExerciseDays.length)
      });
    }
    
    // Mood impact
    const exerciseMood = exerciseDays.filter(e => e.moodPositive).length / exerciseDays.length;
    const noExerciseMood = noExerciseDays.filter(e => e.moodPositive).length / noExerciseDays.length;
    
    if (exerciseMood > noExerciseMood && (exerciseMood - noExerciseMood) > 0.1) {
      const impact = Math.round((exerciseMood - noExerciseMood) * 100);
      patterns.positive.push({
        type: 'positive',
        factor: 'Physical activity',
        impact,
        description: 'Improves mood',
        confidence: getConfidence(exerciseDays.length + noExerciseDays.length)
      });
    }
  }

  // Advanced Pattern: Sleep Duration Sweet Spot
  if (dataQuality !== 'limited') {
    const sleepGroups = {
      short: recentEntries.filter(e => e.sleepHours < 6),
      optimal: recentEntries.filter(e => e.sleepHours >= 7 && e.sleepHours <= 9),
      long: recentEntries.filter(e => e.sleepHours > 9)
    };
    
    if (sleepGroups.optimal.length >= 5) {
      const optimalSleepEnergy = average(sleepGroups.optimal.map(e => e.energyLevel));
      const suboptimalSleepEnergy = average([...sleepGroups.short, ...sleepGroups.long].map(e => e.energyLevel));
      
      if (optimalSleepEnergy > suboptimalSleepEnergy) {
        const impact = Math.round(((optimalSleepEnergy - suboptimalSleepEnergy) / suboptimalSleepEnergy) * 100);
        patterns.positive.push({
          type: 'positive',
          factor: '7-9 hours of sleep',
          impact,
          description: 'Optimal for recovery',
          confidence: getConfidence(recentEntries.length)
        });
      }
    }
  }

  // Compound Patterns (for experienced users)
  if (dataQuality === 'excellent') {
    // Morning routine impact
    const morningExerciseDays = recentEntries.filter(e => 
      e.exercised && e.meditationMinutes > 0 && e.sleepQuality
    );
    
    if (morningExerciseDays.length >= 5) {
      const routineDays = morningExerciseDays.filter(e => !e.hadCravings).length / morningExerciseDays.length;
      const nonRoutineDays = recentEntries.filter(e => 
        !(e.exercised && e.meditationMinutes > 0 && e.sleepQuality) && e.hadCravings
      ).length / recentEntries.filter(e => 
        !(e.exercised && e.meditationMinutes > 0 && e.sleepQuality)
      ).length;
      
      if (routineDays < nonRoutineDays) {
        const impact = Math.round((nonRoutineDays - routineDays) * 100);
        patterns.positive.push({
          type: 'positive',
          factor: 'Complete morning routine',
          impact,
          description: 'Sleep + exercise + meditation combo',
          confidence: 90
        });
      }
    }
  }

  // Challenging Patterns with Nuance
  
  // Stress Cascade Effect
  const highStressDays = recentEntries.filter(e => e.stressHigh === true);
  if (highStressDays.length >= 2) {
    const stressEffects = {
      cravings: highStressDays.filter(e => e.hadCravings).length / highStressDays.length,
      poorSleep: highStressDays.filter(e => e.sleepQuality === false).length / highStressDays.length,
      lowEnergy: average(highStressDays.map(e => e.energyLevel))
    };
    
    const normalDays = recentEntries.filter(e => e.stressHigh === false);
    const normalEffects = {
      cravings: normalDays.filter(e => e.hadCravings).length / normalDays.length,
      poorSleep: normalDays.filter(e => e.sleepQuality === false).length / normalDays.length,
      lowEnergy: average(normalDays.map(e => e.energyLevel))
    };
    
    if (stressEffects.cravings > normalEffects.cravings) {
      const impact = Math.round((stressEffects.cravings - normalEffects.cravings) * 100);
      patterns.challenging.push({
        type: 'challenging',
        factor: 'High stress days',
        impact: -impact,
        description: 'Triggers multiple challenges',
        confidence: getConfidence(highStressDays.length)
      });
    }
  }

  // Social Isolation Pattern
  const isolatedDays = recentEntries.filter(e => e.socialSupport === false);
  const socialDays = recentEntries.filter(e => e.socialSupport === true);
  
  if (isolatedDays.length >= 2 && socialDays.length >= 2) {
    const isolatedMood = isolatedDays.filter(e => e.moodPositive).length / isolatedDays.length;
    const socialMood = socialDays.filter(e => e.moodPositive).length / socialDays.length;
    
    if (socialMood > isolatedMood) {
      const impact = Math.round((socialMood - isolatedMood) * 100);
      patterns.challenging.push({
        type: 'challenging',
        factor: 'Limited social support',
        impact: -impact,
        description: 'Affects mood and recovery',
        confidence: getConfidence(isolatedDays.length + socialDays.length)
      });
    }
  }

  // Sort by impact magnitude and confidence
  patterns.positive.sort((a, b) => (b.impact * b.confidence) - (a.impact * a.confidence));
  patterns.challenging.sort((a, b) => (a.impact * a.confidence) - (b.impact * b.confidence));

  // Dynamic limits based on data quality
  const limits = {
    limited: { positive: 3, challenging: 2 },
    good: { positive: 4, challenging: 3 },
    excellent: { positive: 5, challenging: 4 }
  };

  patterns.positive = patterns.positive.slice(0, limits[dataQuality].positive);
  patterns.challenging = patterns.challenging.slice(0, limits[dataQuality].challenging);

  return patterns;
};

const generatePersonalizedInsights = (
  entries: JournalEntry[], 
  patterns: { positive: Pattern[], challenging: Pattern[] },
  dataQuality: 'limited' | 'good' | 'excellent'
): Insight[] => {
  const insights: Insight[] = [];
  
  // Recent entries for current state
  const recentEntries = entries.slice(-30);
  
  // Time-based analysis for trends
  if (entries.length >= 30) {
    const firstMonth = entries.slice(0, 30);
    const lastMonth = entries.slice(-30);
    
    // Recovery Progress Insight
    const firstMonthCravings = firstMonth.filter(e => e.hadCravings).length / firstMonth.length;
    const lastMonthCravings = lastMonth.filter(e => e.hadCravings).length / lastMonth.length;
    
    if (firstMonthCravings > lastMonthCravings) {
      const improvement = Math.round((firstMonthCravings - lastMonthCravings) * 100);
      insights.push({
        icon: 'trending-down',
        title: 'Craving Reduction',
        description: `Your cravings decreased by ${improvement}% compared to your first month.`,
        priority: 9,
        category: 'achievement'
      });
    }
  }

  // Correlation Insights
  const correlationInsights = findCorrelations(recentEntries);
  insights.push(...correlationInsights);

  // Pattern-based insights
  if (patterns.positive.length > 0) {
    const topPattern = patterns.positive[0];
    if (topPattern.confidence >= 70) {
      insights.push({
        icon: 'star',
        title: 'Your Success Factor',
        description: `${topPattern.factor} shows the strongest positive impact (${topPattern.impact}%) on your recovery.`,
        priority: 8,
        category: 'correlation'
      });
    }
  }

  // Warning insights for concerning patterns
  const consecutivePoorDays = findConsecutivePoorDays(recentEntries);
  if (consecutivePoorDays >= 3) {
    insights.push({
      icon: 'alert-circle',
      title: 'Recovery Alert',
      description: `You've had ${consecutivePoorDays} challenging days in a row. Consider using your coping strategies.`,
      priority: 10,
      category: 'warning'
    });
  }
  
  // Basic insights for limited data
  if (dataQuality === 'limited' && insights.length === 0) {
    // Calculate basic stats
    const cravingDays = recentEntries.filter(e => e.hadCravings).length;
    const goodMoodDays = recentEntries.filter(e => e.moodPositive).length;
    const exerciseDays = recentEntries.filter(e => e.exercised).length;
    
    if (cravingDays < recentEntries.length / 2) {
      insights.push({
        icon: 'shield-checkmark',
        title: 'Craving Control',
        description: `You managed cravings on ${recentEntries.length - cravingDays} out of ${recentEntries.length} days. Keep tracking - more data reveals deeper patterns!`,
        priority: 7,
        category: 'achievement'
      });
    }
    
    if (goodMoodDays > recentEntries.length / 2) {
      insights.push({
        icon: 'happy',
        title: 'Positive Momentum',
        description: `${goodMoodDays} positive mood days! With ${30 - entries.length} more entries, we'll uncover what drives your best days.`,
        priority: 6,
        category: 'trend'
      });
    }
    
    if (exerciseDays >= 3) {
      insights.push({
        icon: 'fitness',
        title: 'Active Recovery',
        description: `${exerciseDays} exercise days this week. Physical activity supports your recovery journey.`,
        priority: 5,
        category: 'achievement'
      });
    }
  }

  // Long-term milestone insights
  if (entries.length >= 100) {
    const consistencyRate = calculateConsistencyRate(entries);
    if (consistencyRate >= 80) {
      insights.push({
        icon: 'trophy',
        title: 'Consistency Champion',
        description: `You've maintained ${consistencyRate}% journal consistency. This dedication drives recovery success.`,
        priority: 7,
        category: 'achievement'
      });
    }
  }

  // Sort by priority and limit based on data quality
  insights.sort((a, b) => b.priority - a.priority);
  
  const insightLimits = {
    limited: 3,
    good: 4,
    excellent: 5
  };
  
  // If we still have no insights, add a starter insight
  if (insights.length === 0) {
    insights.push({
      icon: 'analytics',
      title: 'Building Your Profile',
      description: `${entries.length} days tracked! Every entry improves accuracy. At 30 days, we'll reveal hidden connections in your recovery.`,
      priority: 5,
      category: 'trend'
    });
  }
  
  return insights.slice(0, insightLimits[dataQuality]);
};

// Helper functions
const average = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
};

const findCorrelations = (entries: JournalEntry[]): Insight[] => {
  const insights: Insight[] = [];
  
  // Sleep-Craving correlation
  const sleepCravingData = entries.filter(e => e.sleepQuality !== null && e.hadCravings !== null);
  if (sleepCravingData.length >= 10) {
    const goodSleepNoCravings = sleepCravingData.filter(e => e.sleepQuality && !e.hadCravings).length;
    const poorSleepCravings = sleepCravingData.filter(e => !e.sleepQuality && e.hadCravings).length;
    const correlation = (goodSleepNoCravings + poorSleepCravings) / sleepCravingData.length;
    
    if (correlation > 0.6) {
      insights.push({
        icon: 'moon',
        title: 'Sleep-Craving Connection',
        description: `${Math.round(correlation * 100)}% of the time, your sleep quality predicts next-day cravings.`,
        priority: 8,
        category: 'correlation'
      });
    }
  }
  
  // Exercise-Mood correlation
  const exerciseMoodData = entries.filter(e => e.exercised !== null && e.moodPositive !== null);
  if (exerciseMoodData.length >= 10) {
    const exerciseGoodMood = exerciseMoodData.filter(e => e.exercised && e.moodPositive).length;
    const noExercisePoorMood = exerciseMoodData.filter(e => !e.exercised && !e.moodPositive).length;
    const correlation = (exerciseGoodMood + noExercisePoorMood) / exerciseMoodData.length;
    
    if (correlation > 0.5) {
      insights.push({
        icon: 'fitness',
        title: 'Movement = Mood',
        description: `Exercise days show ${Math.round(exerciseGoodMood / exerciseMoodData.filter(e => e.exercised).length * 100)}% positive mood rate.`,
        priority: 7,
        category: 'correlation'
      });
    }
  }
  
  return insights;
};

const findConsecutivePoorDays = (entries: JournalEntry[]): number => {
  let consecutive = 0;
  let maxConsecutive = 0;
  
  // Check last 7 days
  const recent = entries.slice(-7);
  
  for (const entry of recent) {
    // A day is only "poor" if it has multiple negative factors
    let negativeFactors = 0;
    if (entry.hadCravings) negativeFactors++;
    if (entry.stressHigh) negativeFactors++;
    if (entry.moodPositive === false) negativeFactors++;
    if (entry.sleepQuality === false) negativeFactors++;
    if (entry.energyLevel <= 3) negativeFactors++;
    
    // Only count as poor day if 3+ negative factors
    const isPoorDay = negativeFactors >= 3;
    
    if (isPoorDay) {
      consecutive++;
      maxConsecutive = Math.max(maxConsecutive, consecutive);
    } else {
      consecutive = 0;
    }
  }
  
  return maxConsecutive;
};

const calculateConsistencyRate = (entries: JournalEntry[]): number => {
  // Check how many days have complete core data
  const completeEntries = entries.filter(e => 
    e.moodPositive !== null &&
    e.hadCravings !== null &&
    e.sleepQuality !== null &&
    e.energyLevel > 0
  );
  
  return Math.round((completeEntries.length / entries.length) * 100);
};

const formatLastUpdated = (dateString: string): string => {
  // Parse the date string properly
  const dateParts = dateString.split('-');
  const date = new Date(
    parseInt(dateParts[0]), 
    parseInt(dateParts[1]) - 1, 
    parseInt(dateParts[2])
  );
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const entryDate = new Date(date);
  entryDate.setHours(0, 0, 0, 0);
  
  if (entryDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (entryDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    const days = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 7) {
      return `${days} days ago`;
    } else if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(days / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  }
}; 