import { OnboardingData } from '../types';

export interface AttemptPattern {
  id: string;
  patternType: 'duration' | 'method' | 'challenge' | 'timing';
  description: string;
  insight: string;
  recommendation: string;
  confidenceScore: number; // 0-100
  iconName: string;
  iconColor: string;
}

export interface PastAttemptInsights {
  userType: 'first_timer' | 'returner' | 'experienced' | 'persistent';
  userTypeDescription: string;
  overallPattern: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  successPredictors: AttemptPattern[];
  riskFactors: AttemptPattern[];
  personalizedStrategy: string;
  encouragement: string;
  statisticalContext: {
    averageAttempts: number;
    successRateAfterAttempts: number;
    yourAdvantages: string[];
  };
}

export interface QuitMethodAnalysis {
  methodId: string;
  name: string;
  description: string;
  effectiveness: number; // 0-100
  userTriedBefore: boolean;
  recommendForUser: boolean;
  reasoning: string;
  iconName: string;
  iconColor: string;
}

class PastAttemptsService {
  // Success rates based on research data
  private readonly SUCCESS_RATES = {
    cold_turkey: 3,
    gradual_reduction: 5,
    nicotine_replacement: 15,
    prescription_medication: 20,
    combination_therapy: 25,
    support_groups: 12,
    mobile_apps: 8,
    alternative_methods: 7,
  };

  // Challenge difficulty ratings
  private readonly CHALLENGE_DIFFICULTY = {
    withdrawal_symptoms: 85,
    stress_triggers: 75,
    social_pressure: 60,
    habit_replacement: 70,
    lack_of_motivation: 65,
    weight_gain_fear: 45,
    boredom: 55,
    life_events: 80,
  };

  analyzeUserAttempts(userData: Partial<OnboardingData>): PastAttemptInsights {
    const {
      hasTriedQuittingBefore,
      previousAttempts = 0,
      whatWorkedBefore = [],
      whatMadeItDifficult = [],
      longestQuitPeriod = '',
    } = userData;

    // Determine user type
    const userType = this.determineUserType(hasTriedQuittingBefore, previousAttempts, longestQuitPeriod);
    
    // Analyze patterns
    const patterns = this.identifyPatterns(userData);
    
    // Generate insights
    const insights: PastAttemptInsights = {
      userType,
      userTypeDescription: this.getUserTypeDescription(userType),
      overallPattern: this.getOverallPattern(userData),
      strengths: this.identifyStrengths(userData),
      challenges: this.identifyChallenges(userData),
      recommendations: this.generateRecommendations(userData),
      successPredictors: patterns.filter(p => p.patternType === 'duration' || p.patternType === 'method'),
      riskFactors: patterns.filter(p => p.patternType === 'challenge'),
      personalizedStrategy: this.generatePersonalizedStrategy(userData),
      encouragement: this.generateEncouragement(userData),
      statisticalContext: this.getStatisticalContext(previousAttempts),
    };

    return insights;
  }

  private determineUserType(hasTriedBefore?: boolean, attempts = 0, longestPeriod = ''): 'first_timer' | 'returner' | 'experienced' | 'persistent' {
    if (!hasTriedBefore || attempts === 0) return 'first_timer';
    if (attempts === 1) return 'returner';
    if (attempts <= 3) return 'experienced';
    return 'persistent';
  }

  private getUserTypeDescription(userType: string): string {
    switch (userType) {
      case 'first_timer':
        return 'This is your first serious quit attempt. You have the advantage of approaching this fresh, without any negative associations from past attempts.';
      case 'returner':
        return 'You\'ve tried once before, which means you have valuable experience about what to expect. Most successful quitters need multiple attempts.';
      case 'experienced':
        return 'You\'ve made several attempts, giving you deep insight into your patterns. This experience is a huge advantage - you know what works and what doesn\'t.';
      case 'persistent':
        return 'Your persistence shows incredible determination. Each attempt has taught you something valuable, and persistence is the #1 predictor of eventual success.';
      default:
        return 'Your quit journey is unique, and we\'re here to support you every step of the way.';
    }
  }

  private identifyPatterns(userData: Partial<OnboardingData>): AttemptPattern[] {
    const patterns: AttemptPattern[] = [];
    const { whatWorkedBefore = [], whatMadeItDifficult = [], longestQuitPeriod = '' } = userData;

    // Duration patterns
    if (longestQuitPeriod) {
      patterns.push(this.analyzeDurationPattern(longestQuitPeriod));
    }

    // Method patterns
    whatWorkedBefore.forEach(method => {
      patterns.push(this.analyzeMethodPattern(method));
    });

    // Challenge patterns
    whatMadeItDifficult.forEach(challenge => {
      patterns.push(this.analyzeChallengePattern(challenge));
    });

    return patterns;
  }

  private analyzeDurationPattern(duration: string): AttemptPattern {
    const durationAnalysis = {
      'hours': {
        insight: 'You got through the initial decision phase but faced early withdrawal.',
        recommendation: 'Focus on preparing for the first 72 hours with specific activities planned.',
        confidence: 70,
      },
      'days': {
        insight: 'You successfully navigated initial withdrawal but hit challenges around day 3-4.',
        recommendation: 'Prepare extra support for days 3-7 when psychological cravings peak.',
        confidence: 75,
      },
      'week': {
        insight: 'You made it through the hardest physical withdrawal period.',
        recommendation: 'Focus on building new habits to replace the psychological aspects of nicotine use.',
        confidence: 80,
      },
      'weeks': {
        insight: 'You\'ve proven you can break the physical addiction and start building new patterns.',
        recommendation: 'Identify what triggered your relapse and build specific defenses for those situations.',
        confidence: 85,
      },
      'months': {
        insight: 'You have strong quit capabilities and can maintain long-term abstinence.',
        recommendation: 'Focus on stress management and maintaining motivation during challenging life events.',
        confidence: 90,
      },
      'long_term': {
        insight: 'You\'ve successfully quit for extended periods, proving you have the skills.',
        recommendation: 'Identify and prepare for major life stressors that may have triggered past relapses.',
        confidence: 95,
      },
    };

    const analysis = durationAnalysis[duration as keyof typeof durationAnalysis] || durationAnalysis.hours;

    return {
      id: `duration_${duration}`,
      patternType: 'duration',
      description: `Previous quit lasted: ${this.formatDuration(duration)}`,
      insight: analysis.insight,
      recommendation: analysis.recommendation,
      confidenceScore: analysis.confidence,
      iconName: 'time-outline',
      iconColor: '#4ECDC4',
    };
  }

  private analyzeMethodPattern(method: string): AttemptPattern {
    const methodAnalysis = {
      cold_turkey: {
        insight: 'You have the willpower for immediate cessation, but may need more support for cravings.',
        recommendation: 'Consider combining cold turkey with behavioral support or NRT for cravings.',
      },
      gradual_reduction: {
        insight: 'You prefer a structured, gradual approach to change.',
        recommendation: 'Try a more aggressive taper schedule or set a firm quit date after reduction.',
      },
      nicotine_replacement: {
        insight: 'NRT helped manage physical withdrawal but may not address psychological aspects.',
        recommendation: 'Combine NRT with behavioral therapy or habit replacement strategies.',
      },
      prescription_medication: {
        insight: 'Medical support was helpful, consider what else was missing.',
        recommendation: 'Discuss different medications or combination approaches with your doctor.',
      },
      support_groups: {
        insight: 'You value community support and shared experiences.',
        recommendation: 'Find more active support communities or try online groups for daily check-ins.',
      },
      mobile_apps: {
        insight: 'You like tracking progress and digital support tools.',
        recommendation: 'Look for apps with more comprehensive features or combine with human support.',
      },
    };

    const analysis = methodAnalysis[method as keyof typeof methodAnalysis] || {
      insight: 'This method provided some benefit in your quit attempt.',
      recommendation: 'Consider what specific aspects helped and how to enhance them.',
    };

    return {
      id: `method_${method}`,
      patternType: 'method',
      description: `Previously tried: ${this.formatMethodName(method)}`,
      insight: analysis.insight,
      recommendation: analysis.recommendation,
      confidenceScore: 75,
      iconName: 'medical-outline',
      iconColor: '#45B7D1',
    };
  }

  private analyzeChallengePattern(challenge: string): AttemptPattern {
    const challengeAnalysis = {
      withdrawal_symptoms: {
        insight: 'Physical withdrawal symptoms were a major barrier.',
        recommendation: 'Consider NRT or prescription medications to manage physical symptoms.',
        risk: 85,
      },
      stress_triggers: {
        insight: 'Stress is a primary trigger for your nicotine use.',
        recommendation: 'Develop stress management techniques like meditation, exercise, or breathing exercises.',
        risk: 75,
      },
      social_pressure: {
        insight: 'Social situations and pressure from others undermined your quit attempt.',
        recommendation: 'Prepare responses for social situations and consider telling supportive people about your quit.',
        risk: 60,
      },
      habit_replacement: {
        insight: 'The habitual aspects of nicotine use were hard to replace.',
        recommendation: 'Identify specific triggers and prepare replacement activities for each situation.',
        risk: 70,
      },
      lack_of_motivation: {
        insight: 'Motivation decreased over time, leading to relapse.',
        recommendation: 'Create a motivation maintenance system with regular reminders of your reasons to quit.',
        risk: 65,
      },
    };

    const analysis = challengeAnalysis[challenge as keyof typeof challengeAnalysis] || {
      insight: 'This challenge contributed to previous relapse.',
      recommendation: 'Develop specific strategies to address this challenge.',
      risk: 60,
    };

    return {
      id: `challenge_${challenge}`,
      patternType: 'challenge',
      description: `Previous challenge: ${this.formatChallengeName(challenge)}`,
      insight: analysis.insight,
      recommendation: analysis.recommendation,
      confidenceScore: analysis.risk,
      iconName: 'warning-outline',
      iconColor: '#FF6B6B',
    };
  }

  private getOverallPattern(userData: Partial<OnboardingData>): string {
    const { previousAttempts = 0, longestQuitPeriod = '', whatMadeItDifficult = [] } = userData;

    if (previousAttempts === 0) {
      return 'First-time quitter with fresh motivation and no negative associations.';
    }

    if (longestQuitPeriod === 'long_term') {
      return 'Capable of long-term success, focus on preventing major life stress triggers.';
    }

    if (longestQuitPeriod === 'months') {
      return 'Strong quit skills, work on identifying and managing relapse triggers.';
    }

    if (whatMadeItDifficult.includes('withdrawal_symptoms')) {
      return 'Physical addiction is strong, consider medical support for withdrawal management.';
    }

    if (whatMadeItDifficult.includes('stress_triggers')) {
      return 'Stress-driven nicotine use, focus on stress management and coping strategies.';
    }

    return 'Learning from each attempt, building stronger quit skills with each try.';
  }

  private identifyStrengths(userData: Partial<OnboardingData>): string[] {
    const strengths: string[] = [];
    const { previousAttempts = 0, longestQuitPeriod = '', whatWorkedBefore = [] } = userData;

    if (previousAttempts > 0) {
      strengths.push('Experience from previous quit attempts');
      strengths.push('Proven commitment to quitting');
    }

    if (longestQuitPeriod === 'long_term' || longestQuitPeriod === 'months') {
      strengths.push('Ability to maintain long-term abstinence');
    }

    if (longestQuitPeriod === 'weeks' || longestQuitPeriod === 'month') {
      strengths.push('Successfully broke physical addiction before');
    }

    if (whatWorkedBefore.length > 0) {
      strengths.push('Knowledge of effective quit methods');
    }

    if (whatWorkedBefore.includes('support_groups')) {
      strengths.push('Values community support');
    }

    if (whatWorkedBefore.includes('cold_turkey')) {
      strengths.push('Strong willpower and determination');
    }

    if (strengths.length === 0) {
      strengths.push('Fresh perspective without negative quit associations');
      strengths.push('Motivated to make a positive life change');
    }

    return strengths;
  }

  private identifyChallenges(userData: Partial<OnboardingData>): string[] {
    const { whatMadeItDifficult = [] } = userData;
    
    return whatMadeItDifficult.map(challenge => {
      const challengeNames = {
        withdrawal_symptoms: 'Physical withdrawal symptoms',
        stress_triggers: 'Stress-triggered cravings',
        social_pressure: 'Social situations and pressure',
        habit_replacement: 'Breaking ingrained habits',
        lack_of_motivation: 'Maintaining long-term motivation',
        weight_gain_fear: 'Concerns about weight gain',
        boredom: 'Boredom-triggered cravings',
        life_events: 'Major life changes or stress',
      };
      
      return challengeNames[challenge as keyof typeof challengeNames] || challenge;
    });
  }

  private generateRecommendations(userData: Partial<OnboardingData>): string[] {
    const recommendations: string[] = [];
    const { whatMadeItDifficult = [], whatWorkedBefore = [], longestQuitPeriod = '' } = userData;

    // Based on previous challenges
    if (whatMadeItDifficult.includes('withdrawal_symptoms')) {
      recommendations.push('Consider nicotine replacement therapy or prescription medications');
    }

    if (whatMadeItDifficult.includes('stress_triggers')) {
      recommendations.push('Develop comprehensive stress management techniques');
    }

    if (whatMadeItDifficult.includes('social_pressure')) {
      recommendations.push('Create a support network and practice saying no');
    }

    if (whatMadeItDifficult.includes('habit_replacement')) {
      recommendations.push('Plan specific replacement activities for each nicotine trigger');
    }

    // Based on what worked before
    if (whatWorkedBefore.includes('support_groups')) {
      recommendations.push('Join active online or in-person support communities');
    }

    if (whatWorkedBefore.includes('mobile_apps')) {
      recommendations.push('Use comprehensive tracking and support apps like NicNixr');
    }

    // Based on duration success
    if (longestQuitPeriod === 'months' || longestQuitPeriod === 'long_term') {
      recommendations.push('Identify and prepare for major life stressors');
      recommendations.push('Maintain motivation with regular reminder systems');
    }

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push('Start with a comprehensive quit plan');
      recommendations.push('Build a strong support system');
      recommendations.push('Use evidence-based quit methods');
    }

    return recommendations.slice(0, 4); // Limit to top 4 recommendations
  }

  private generatePersonalizedStrategy(userData: Partial<OnboardingData>): string {
    const { previousAttempts = 0, longestQuitPeriod = '', whatMadeItDifficult = [] } = userData;

    if (previousAttempts === 0) {
      return 'Start with a comprehensive approach combining behavioral support, trigger identification, and community engagement. Your fresh perspective is an advantage.';
    }

    if (longestQuitPeriod === 'long_term') {
      return 'Focus on stress management and life balance. You\'ve proven you can quit long-term, now protect against major life disruptions.';
    }

    if (whatMadeItDifficult.includes('withdrawal_symptoms')) {
      return 'Address physical addiction first with medical support, then focus on behavioral and psychological aspects.';
    }

    if (whatMadeItDifficult.includes('stress_triggers')) {
      return 'Build a strong stress management foundation before quitting, then maintain these skills throughout your quit journey.';
    }

    return 'Combine the methods that worked before with targeted solutions for your specific challenges. Each attempt has prepared you for success.';
  }

  private generateEncouragement(userData: Partial<OnboardingData>): string {
    const { previousAttempts = 0, longestQuitPeriod = '' } = userData;

    if (previousAttempts === 0) {
      return 'You\'re starting with a clean slate and fresh motivation. Many people succeed on their first serious attempt when they have the right plan and support.';
    }

    if (previousAttempts >= 5) {
      return 'Your persistence is extraordinary and is the strongest predictor of eventual success. Every attempt has taught you valuable lessons that increase your chances this time.';
    }

    if (longestQuitPeriod === 'long_term') {
      return 'You\'ve already proven you can live nicotine-free for extended periods. You have all the skills needed - now it\'s about applying them consistently.';
    }

    return 'Most successful quitters try multiple times before succeeding. Your previous attempts weren\'t failures - they were training for this successful quit.';
  }

  private getStatisticalContext(attempts: number): { averageAttempts: number; successRateAfterAttempts: number; yourAdvantages: string[] } {
    // Based on research data
    const averageAttempts = 6.2;
    const successRates = {
      1: 15,
      2: 25,
      3: 35,
      4: 45,
      5: 55,
      6: 65,
    };

    const successRate = successRates[Math.min(attempts + 1, 6) as keyof typeof successRates] || 70;

    const advantages = [
      'Using a comprehensive quit app with personalized support',
      'Having detailed trigger and challenge analysis',
      'Access to immediate craving support through Shield Mode',
      'Community support and shared experiences',
      'Science-based progress tracking and motivation',
    ];

    return {
      averageAttempts,
      successRateAfterAttempts: successRate,
      yourAdvantages: advantages,
    };
  }

  private formatDuration(duration: string): string {
    const durations = {
      hours: 'A few hours',
      days: '1-3 days',
      week: 'About a week',
      weeks: '2-4 weeks',
      months: '1-6 months',
      long_term: '6+ months',
    };
    return durations[duration as keyof typeof durations] || duration;
  }

  private formatMethodName(method: string): string {
    const methods = {
      cold_turkey: 'Cold Turkey',
      gradual_reduction: 'Gradual Reduction',
      nicotine_replacement: 'Nicotine Replacement',
      prescription_medication: 'Prescription Medication',
      vaping_transition: 'Vaping Transition',
      alternative_methods: 'Alternative Methods',
      mobile_apps: 'Mobile Apps',
      support_groups: 'Support Groups',
    };
    return methods[method as keyof typeof methods] || method;
  }

  private formatChallengeName(challenge: string): string {
    const challenges = {
      withdrawal_symptoms: 'Withdrawal Symptoms',
      stress_triggers: 'Stress Triggers',
      social_pressure: 'Social Pressure',
      habit_replacement: 'Habit Replacement',
      lack_of_motivation: 'Lack of Motivation',
      weight_gain_fear: 'Weight Gain Concerns',
      boredom: 'Boredom',
      life_events: 'Life Events',
    };
    return challenges[challenge as keyof typeof challenges] || challenge;
  }

  // Method to analyze all available quit methods for the user
  analyzeQuitMethods(userData: Partial<OnboardingData>): QuitMethodAnalysis[] {
    const { whatWorkedBefore = [], whatMadeItDifficult = [] } = userData;

    const methods = [
      {
        methodId: 'cold_turkey',
        name: 'Cold Turkey',
        description: 'Stop completely all at once',
        iconName: 'flash-outline',
        iconColor: '#FF6B6B',
      },
      {
        methodId: 'nicotine_replacement',
        name: 'Nicotine Replacement',
        description: 'Patches, gum, lozenges',
        iconName: 'medical-outline',
        iconColor: '#45B7D1',
      },
      {
        methodId: 'prescription_medication',
        name: 'Prescription Medication',
        description: 'Chantix, Zyban, etc.',
        iconName: 'medical-outline',
        iconColor: '#9B59B6',
      },
      {
        methodId: 'gradual_reduction',
        name: 'Gradual Reduction',
        description: 'Slowly reduce over time',
        iconName: 'trending-down-outline',
        iconColor: '#4ECDC4',
      },
      {
        methodId: 'support_groups',
        name: 'Support Groups',
        description: 'Community support',
        iconName: 'people-outline',
        iconColor: '#27AE60',
      },
      {
        methodId: 'mobile_apps',
        name: 'Comprehensive Apps',
        description: 'Like NicNixr with full support',
        iconName: 'phone-portrait-outline',
        iconColor: '#E74C3C',
      },
    ];

    return methods.map(method => {
      const userTriedBefore = whatWorkedBefore.includes(method.methodId);
      const effectiveness = this.calculateMethodEffectiveness(method.methodId, userData);
      const recommendForUser = this.shouldRecommendMethod(method.methodId, userData);
      const reasoning = this.getMethodReasoning(method.methodId, userData);

      return {
        ...method,
        effectiveness,
        userTriedBefore,
        recommendForUser,
        reasoning,
      };
    });
  }

  private calculateMethodEffectiveness(methodId: string, userData: Partial<OnboardingData>): number {
    const baseEffectiveness = this.SUCCESS_RATES[methodId as keyof typeof this.SUCCESS_RATES] || 10;
    const { whatMadeItDifficult = [] } = userData;

    // Adjust based on user's specific challenges
    let adjustedEffectiveness = baseEffectiveness;

    if (methodId === 'nicotine_replacement' && whatMadeItDifficult.includes('withdrawal_symptoms')) {
      adjustedEffectiveness += 20;
    }

    if (methodId === 'support_groups' && whatMadeItDifficult.includes('social_pressure')) {
      adjustedEffectiveness += 15;
    }

    if (methodId === 'prescription_medication' && whatMadeItDifficult.includes('withdrawal_symptoms')) {
      adjustedEffectiveness += 25;
    }

    return Math.min(adjustedEffectiveness, 100);
  }

  private shouldRecommendMethod(methodId: string, userData: Partial<OnboardingData>): boolean {
    const { whatWorkedBefore = [], whatMadeItDifficult = [] } = userData;

    // Don't recommend if they tried it before and it didn't work long-term
    if (whatWorkedBefore.includes(methodId) && userData.longestQuitPeriod !== 'long_term') {
      return false;
    }

    // Recommend based on specific challenges
    if (methodId === 'nicotine_replacement' && whatMadeItDifficult.includes('withdrawal_symptoms')) {
      return true;
    }

    if (methodId === 'support_groups' && whatMadeItDifficult.includes('lack_of_motivation')) {
      return true;
    }

    if (methodId === 'mobile_apps') {
      return true; // Always recommend comprehensive app support
    }

    return this.calculateMethodEffectiveness(methodId, userData) > 15;
  }

  private getMethodReasoning(methodId: string, userData: Partial<OnboardingData>): string {
    const { whatMadeItDifficult = [], whatWorkedBefore = [] } = userData;

    if (whatWorkedBefore.includes(methodId)) {
      return 'You\'ve had some success with this method before. Consider combining it with additional support.';
    }

    switch (methodId) {
      case 'nicotine_replacement':
        if (whatMadeItDifficult.includes('withdrawal_symptoms')) {
          return 'Highly recommended for managing your withdrawal symptoms and physical cravings.';
        }
        return 'Can help manage physical withdrawal while you focus on breaking habits.';

      case 'prescription_medication':
        if (whatMadeItDifficult.includes('withdrawal_symptoms')) {
          return 'Most effective option for severe withdrawal symptoms. Consult your doctor.';
        }
        return 'Consider if other methods haven\'t provided enough support for physical symptoms.';

      case 'support_groups':
        if (whatMadeItDifficult.includes('lack_of_motivation')) {
          return 'Perfect for maintaining motivation and accountability throughout your quit journey.';
        }
        return 'Provides encouragement, shared experiences, and practical tips from others.';

      case 'mobile_apps':
        return 'NicNixr provides comprehensive support combining tracking, community, and emergency help.';

      default:
        return 'This method may be effective based on your quit profile and past experiences.';
    }
  }
}

export const pastAttemptsService = new PastAttemptsService(); 