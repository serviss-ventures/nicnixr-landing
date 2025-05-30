import AsyncStorage from '@react-native-async-storage/async-storage';

export interface JournalAnalysis {
  averageCravingIntensity: number;
  averageStressLevel: number;
  copingStrategiesUsage: number;
  sleepQuality: number;
  energyLevel: number;
  breathingExerciseUsage: number;
  totalEntries: number;
  daysAnalyzed: number;
}

export interface PlanRecommendation {
  planId: string;
  planTitle: string;
  confidence: number; // 0-100%
  reasons: string[];
  primaryFactor: string;
}

class PlanRecommendationService {
  
  /**
   * Analyzes the last 7 days of journal entries to recommend the best plan
   */
  async getRecommendedPlan(nicotineCategory: string = 'cigarettes'): Promise<PlanRecommendation | null> {
    try {
      const analysis = await this.analyzeRecentJournalData();
      
      if (analysis.totalEntries === 0) {
        // No journal data - recommend based on nicotine type
        return this.getDefaultRecommendation(nicotineCategory);
      }

      return this.calculateBestPlan(analysis, nicotineCategory);
    } catch (error) {
      console.error('❌ Failed to get plan recommendation:', error);
      return this.getDefaultRecommendation(nicotineCategory);
    }
  }

  /**
   * Analyzes the last 7 days of journal entries
   */
  private async analyzeRecentJournalData(): Promise<JournalAnalysis> {
    const last7Days = this.getLast7Days();
    let totalCravingIntensity = 0;
    let totalStressLevel = 0;
    let totalCopingStrategies = 0;
    let totalSleepQuality = 0;
    let totalEnergyLevel = 0;
    let totalBreathingMinutes = 0;
    let validEntries = 0;

    for (const date of last7Days) {
      try {
        const journalData = await AsyncStorage.getItem(`journal_${date}`);
        if (journalData) {
          const entry = JSON.parse(journalData);
          
          totalCravingIntensity += entry.cravingIntensity || 0;
          totalStressLevel += entry.stressLevel || 0;
          totalCopingStrategies += (entry.copingStrategiesUsed?.length || 0);
          totalSleepQuality += entry.sleepQuality || 0;
          totalEnergyLevel += entry.energyLevel || 0;
          totalBreathingMinutes += entry.breathingExerciseMinutes || 0;
          validEntries++;
        }
      } catch (error) {
        console.warn(`⚠️ Failed to parse journal entry for ${date}:`, error);
      }
    }

    return {
      averageCravingIntensity: validEntries > 0 ? totalCravingIntensity / validEntries : 0,
      averageStressLevel: validEntries > 0 ? totalStressLevel / validEntries : 0,
      copingStrategiesUsage: validEntries > 0 ? totalCopingStrategies / validEntries : 0,
      sleepQuality: validEntries > 0 ? totalSleepQuality / validEntries : 0,
      energyLevel: validEntries > 0 ? totalEnergyLevel / validEntries : 0,
      breathingExerciseUsage: validEntries > 0 ? totalBreathingMinutes / validEntries : 0,
      totalEntries: validEntries,
      daysAnalyzed: 7
    };
  }

  /**
   * Calculates the best plan based on journal analysis
   */
  private calculateBestPlan(analysis: JournalAnalysis, nicotineCategory: string): PlanRecommendation {
    const recommendations: PlanRecommendation[] = [];

    // Craving Control Plan Analysis
    let cravingControlScore = 0;
    const cravingControlReasons: string[] = [];

    if (analysis.averageCravingIntensity >= 7) {
      cravingControlScore += 40;
      cravingControlReasons.push('High craving intensity detected');
    }
    if (analysis.averageStressLevel >= 7) {
      cravingControlScore += 30;
      cravingControlReasons.push('High stress levels affecting recovery');
    }
    if (analysis.copingStrategiesUsage < 2) {
      cravingControlScore += 25;
      cravingControlReasons.push('Limited coping strategies in use');
    }
    if (analysis.breathingExerciseUsage === 0) {
      cravingControlScore += 15;
      cravingControlReasons.push('No breathing exercises practiced');
    }

    // Adjust for nicotine type
    if (nicotineCategory === 'cigarettes' || nicotineCategory === 'vape') {
      cravingControlScore += 10; // These types benefit more from craving control
    }

    recommendations.push({
      planId: 'craving-control',
      planTitle: 'Craving Control',
      confidence: Math.min(cravingControlScore, 100),
      reasons: cravingControlReasons,
      primaryFactor: 'High cravings and stress management needs'
    });

    // Energy Rebuild Plan Analysis
    let energyRebuildScore = 0;
    const energyRebuildReasons: string[] = [];

    if (analysis.energyLevel <= 4) {
      energyRebuildScore += 40;
      energyRebuildReasons.push('Low energy levels detected');
    }
    if (analysis.sleepQuality <= 5) {
      energyRebuildScore += 30;
      energyRebuildReasons.push('Poor sleep quality affecting recovery');
    }
    if (analysis.averageCravingIntensity <= 4) {
      energyRebuildScore += 20; // If cravings are manageable, focus on energy
      energyRebuildReasons.push('Cravings under control, time to rebuild');
    }

    // Adjust for nicotine type
    if (nicotineCategory === 'cigarettes') {
      energyRebuildScore += 15; // Cigarettes heavily impact lung/energy recovery
    }

    recommendations.push({
      planId: 'energy-rebuild',
      planTitle: 'Energy Rebuild',
      confidence: Math.min(energyRebuildScore, 100),
      reasons: energyRebuildReasons,
      primaryFactor: 'Energy and physical recovery focus needed'
    });

    // Return the highest confidence recommendation
    const bestRecommendation = recommendations.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    console.log('🎯 Plan Recommendation Analysis:', {
      analysis,
      recommendations,
      selected: bestRecommendation
    });

    return bestRecommendation;
  }

  /**
   * Default recommendation when no journal data is available
   */
  private getDefaultRecommendation(nicotineCategory: string): PlanRecommendation {
    // Most people starting out benefit from craving control
    return {
      planId: 'craving-control',
      planTitle: 'Craving Control',
      confidence: 75,
      reasons: ['Great starting point for most people', 'Builds essential coping skills'],
      primaryFactor: 'Ideal foundation plan for recovery'
    };
  }

  /**
   * Gets the last 7 days in YYYY-MM-DD format
   */
  private getLast7Days(): string[] {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }

  /**
   * Gets a detailed explanation of why this plan was recommended
   */
  getRecommendationExplanation(recommendation: PlanRecommendation): string {
    const reasonText = recommendation.reasons.join(', ').toLowerCase();
    
    if (recommendation.planId === 'craving-control') {
      return `Based on your recent patterns (${reasonText}), the Craving Control plan will help you build essential coping skills and manage triggers more effectively.`;
    } else if (recommendation.planId === 'energy-rebuild') {
      return `Your journal shows (${reasonText}), making the Energy Rebuild plan ideal for restoring your natural vitality and physical recovery.`;
    }
    
    return `This plan matches your recovery needs based on your recent patterns.`;
  }
}

export const planRecommendationService = new PlanRecommendationService(); 