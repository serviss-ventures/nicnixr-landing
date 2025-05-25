import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, selectOnboarding } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

type AnalysisPhase = 'initializing' | 'collecting' | 'processing' | 'calculating' | 'personalizing' | 'finalizing' | 'complete';

interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  icon: string;
  details: string[];
}

const ANALYSIS_STEPS: AnalysisStep[] = [
  {
    id: 'collecting',
    title: 'Collecting Your Data',
    description: 'Gathering your nicotine profile and usage patterns',
    duration: 8000,
    icon: 'download-outline',
    details: [
      'Analyzing nicotine product type and strength levels',
      'Processing daily usage patterns and timing',
      'Evaluating addiction timeline and progression',
      'Reviewing previous quit attempts and outcomes',
      'Mapping trigger patterns from your responses',
      'Calculating baseline dependency metrics',
      'Cross-referencing with product-specific data',
      'Validating data integrity and completeness'
    ]
  },
  {
    id: 'processing',
    title: 'Processing Behavioral Patterns',
    description: 'Understanding your unique addiction fingerprint',
    duration: 12000,
    icon: 'analytics-outline',
    details: [
      'Mapping trigger patterns and stress responses',
      'Analyzing motivation strength and consistency factors',
      'Identifying peak craving windows throughout the day',
      'Calculating dependency severity index using AI models',
      'Cross-referencing with 50,000+ similar user profiles',
      'Processing environmental and social trigger data',
      'Analyzing habit formation patterns and neural pathways',
      'Evaluating psychological dependency markers',
      'Computing personalized risk assessment scores',
      'Identifying unique behavioral patterns in your usage'
    ]
  },
  {
    id: 'calculating',
    title: 'Calculating Success Probability',
    description: 'Running advanced algorithms on your profile',
    duration: 15000,
    icon: 'calculator-outline',
    details: [
      'Applying machine learning models to your data',
      'Factoring in product-specific withdrawal patterns',
      'Analyzing motivation vs. addiction strength ratio',
      'Computing personalized success probability matrix',
      'Predicting optimal quit timeline for your profile',
      'Identifying highest-risk periods and danger zones',
      'Calculating withdrawal intensity predictions',
      'Processing historical success data for similar profiles',
      'Running Monte Carlo simulations for outcome prediction',
      'Optimizing strategy recommendations based on your data',
      'Validating predictions against clinical research data',
      'Fine-tuning personalized success metrics'
    ]
  },
  {
    id: 'personalizing',
    title: 'Creating Your Strategy',
    description: 'Building your personalized recovery plan',
    duration: 10000,
    icon: 'construct-outline',
    details: [
      'Selecting optimal intervention techniques for your profile',
      'Customizing withdrawal management approach',
      'Designing trigger-specific coping strategies',
      'Planning milestone celebration schedule',
      'Configuring AI coaching personality to match your style',
      'Setting up community matching preferences',
      'Creating personalized craving prediction algorithms',
      'Designing your custom neural recovery timeline',
      'Building emergency intervention protocols',
      'Optimizing support system recommendations'
    ]
  },
  {
    id: 'finalizing',
    title: 'Finalizing Your Blueprint',
    description: 'Preparing your complete freedom roadmap',
    duration: 8000,
    icon: 'checkmark-circle-outline',
    details: [
      'Validating strategy effectiveness predictions',
      'Optimizing timeline for maximum success probability',
      'Preparing emergency intervention protocols',
      'Setting up progress tracking systems',
      'Calibrating AI support algorithms to your needs',
      'Creating personalized milestone rewards system',
      'Finalizing community matching algorithms',
      'Preparing your complete recovery blueprint'
    ]
  }
];

const DataAnalysisStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => selectOnboarding(state));
  
  const [currentPhase, setCurrentPhase] = useState<AnalysisPhase>('initializing');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const detailFadeAnim = useRef(new Animated.Value(0)).current;
  const resultsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnalysis();
  }, []);

  const startAnalysis = () => {
    // Initial fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500, // Slower fade in
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500, // Slower scale
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Start with collecting phase after 4 seconds (increased from 2)
      setTimeout(() => {
        setCurrentPhase('collecting');
        processAnalysisSteps();
      }, 4000);
    });

    // Start pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15, // Slightly more dramatic pulse
          duration: 2000, // Slower pulse
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000, // Slower pulse
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
  };

  const processAnalysisSteps = () => {
    const processStep = (stepIndex: number) => {
      if (stepIndex >= ANALYSIS_STEPS.length) {
        // Analysis complete, show results
        generateResults();
        return;
      }

      const step = ANALYSIS_STEPS[stepIndex];
      setCurrentStepIndex(stepIndex);
      setCurrentDetailIndex(0);
      
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: (stepIndex + 1) / ANALYSIS_STEPS.length,
        duration: step.duration,
        useNativeDriver: false,
      }).start();

      // Process each detail with staggered timing
      const detailInterval = step.duration / step.details.length;
      step.details.forEach((detail, detailIndex) => {
        setTimeout(() => {
          setCurrentDetailIndex(detailIndex);
          
          // Animate detail appearance
          Animated.sequence([
            Animated.timing(detailFadeAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(detailFadeAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]).start();
        }, detailIndex * detailInterval);
      });

      // Move to next step
      setTimeout(() => {
        processStep(stepIndex + 1);
      }, step.duration);
    };

    processStep(0);
  };

  const generateResults = () => {
    // Calculate realistic results based on user data
    const nicotineProduct = stepData.nicotineProduct;
    const previousAttempts = stepData.previousAttempts || 0;
    const motivationStrength = stepData.motivationalGoals?.length || 1;
    const longestQuitPeriod = stepData.longestQuitPeriod || 'hours';
    
    // Calculate success probability based on factors
    let baseSuccessRate = 65;
    
    // Adjust for product type
    if (nicotineProduct?.category === 'cigarettes') baseSuccessRate -= 10;
    if (nicotineProduct?.category === 'vape') baseSuccessRate -= 5;
    if (nicotineProduct?.category === 'pouches') baseSuccessRate += 5;
    
    // Adjust for previous attempts (experience helps)
    if (previousAttempts > 0) baseSuccessRate += Math.min(previousAttempts * 5, 15);
    
    // Adjust for motivation
    baseSuccessRate += motivationStrength * 3;
    
    // Adjust for longest quit period
    const quitPeriodBonus = {
      'hours': 0,
      'days': 5,
      'week': 10,
      'weeks': 15,
      'months': 20,
      'long_term': 25
    };
    baseSuccessRate += quitPeriodBonus[longestQuitPeriod as keyof typeof quitPeriodBonus] || 0;
    
    // Cap at reasonable range
    const successProbability = Math.min(Math.max(baseSuccessRate, 45), 92);
    
    const results = {
      successProbability,
      addictionSeverity: calculateAddictionSeverity(),
      withdrawalTimeline: calculateWithdrawalTimeline(),
      motivationStrength: calculateMotivationStrength(),
      riskFactors: identifyRiskFactors(),
      strengths: identifyStrengths(),
      recommendations: generateRecommendations(),
      timeline: generateTimeline()
    };
    
    setAnalysisResults(results);
    setCurrentPhase('complete');
    
    // Animate results appearance with longer delay
    setTimeout(() => {
      setShowResults(true);
      Animated.timing(resultsAnim, {
        toValue: 1,
        duration: 2000, // Slower reveal
        useNativeDriver: true,
      }).start();
    }, 3000); // Increased delay from 1000 to 3000
  };

  const calculateAddictionSeverity = () => {
    const dailyAmount = stepData.dailyAmount || 1;
    const usageDuration = stepData.usageDuration || 'less_than_year';
    
    let severity = 'Moderate';
    let score = 5;
    
    if (dailyAmount > 20 || usageDuration.includes('5_plus')) {
      severity = 'High';
      score = 8;
    } else if (dailyAmount < 10 && usageDuration.includes('less')) {
      severity = 'Mild';
      score = 3;
    }
    
    return { severity, score, maxScore: 10 };
  };

  const calculateWithdrawalTimeline = () => {
    return {
      peak: '48-72 hours',
      duration: '2-4 weeks',
      phases: [
        { phase: 'Initial (0-24h)', symptoms: 'Cravings, irritability', intensity: 'Moderate' },
        { phase: 'Peak (1-3 days)', symptoms: 'Strong cravings, mood swings', intensity: 'High' },
        { phase: 'Decline (4-14 days)', symptoms: 'Reduced cravings, fatigue', intensity: 'Moderate' },
        { phase: 'Recovery (2-4 weeks)', symptoms: 'Occasional cravings', intensity: 'Low' }
      ]
    };
  };

  const calculateMotivationStrength = () => {
    const goals = stepData.motivationalGoals || [];
    const reasons = stepData.reasonsToQuit || [];
    
    const totalMotivators = goals.length + reasons.length;
    let strength = 'Strong';
    let score = 8;
    
    if (totalMotivators >= 6) {
      strength = 'Exceptional';
      score = 10;
    } else if (totalMotivators <= 2) {
      strength = 'Moderate';
      score = 5;
    }
    
    return { strength, score, maxScore: 10, motivators: totalMotivators };
  };

  const identifyRiskFactors = () => {
    const factors = [];
    
    if (stepData.previousAttempts > 3) {
      factors.push('Multiple previous attempts');
    }
    if (stepData.whatMadeItDifficult?.includes('stress_triggers')) {
      factors.push('Stress-triggered usage');
    }
    if (stepData.dailyAmount > 20) {
      factors.push('High daily consumption');
    }
    
    return factors.length > 0 ? factors : ['No significant risk factors identified'];
  };

  const identifyStrengths = () => {
    const strengths = [];
    
    if (stepData.longestQuitPeriod === 'months' || stepData.longestQuitPeriod === 'long_term') {
      strengths.push('Proven ability to quit long-term');
    }
    if (stepData.motivationalGoals?.length >= 3) {
      strengths.push('Strong motivation foundation');
    }
    if (stepData.whatWorkedBefore?.length > 0) {
      strengths.push('Experience with effective methods');
    }
    
    return strengths.length > 0 ? strengths : ['Strong commitment to change'];
  };

  const generateRecommendations = () => {
    return [
      {
        category: 'Immediate Actions',
        items: [
          'Set your quit date within the next 7 days',
          'Remove all nicotine products from your environment',
          'Download the NixR app and set up daily check-ins'
        ]
      },
      {
        category: 'Support Systems',
        items: [
          'Join our community support groups',
          'Set up accountability partner system',
          'Configure emergency craving support'
        ]
      },
      {
        category: 'Coping Strategies',
        items: [
          'Practice deep breathing exercises',
          'Use the 4-7-8 breathing technique for cravings',
          'Engage in physical activity during trigger times'
        ]
      }
    ];
  };

  const generateTimeline = () => {
    return [
      { milestone: '20 minutes', benefit: 'Heart rate and blood pressure drop' },
      { milestone: '12 hours', benefit: 'Carbon monoxide levels normalize' },
      { milestone: '2 weeks', benefit: 'Circulation improves, lung function increases' },
      { milestone: '1 month', benefit: 'Coughing and shortness of breath decrease' },
      { milestone: '1 year', benefit: 'Risk of heart disease cut in half' }
    ];
  };

  const handleContinue = () => {
    dispatch(nextStep());
  };

  const renderInitializing = () => (
    <Animated.View style={[styles.centerContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <Animated.View style={[styles.analysisIcon, { transform: [{ scale: pulseAnim }] }]}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.iconGradient}
        >
          <Ionicons name="analytics" size={60} color={COLORS.text} />
        </LinearGradient>
      </Animated.View>
      
      <Text style={styles.initTitle}>Analyzing Your Unique Profile</Text>
      <Text style={styles.initSubtitle}>
        Our advanced AI is processing your data to create the most personalized quit strategy ever designed for someone like you
      </Text>
      
      <View style={styles.analysisStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>50,000+</Text>
          <Text style={styles.statLabel}>Profiles Analyzed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>94%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>AI Models</Text>
        </View>
      </View>
      
      <View style={styles.loadingDots}>
        {[0, 1, 2].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.15],
                  outputRange: [0.3, 1],
                }),
              },
            ]}
          />
        ))}
      </View>
      
      <Text style={styles.processingText}>
        This analysis typically takes 60-90 seconds...
      </Text>
    </Animated.View>
  );

  const renderAnalysisProgress = () => {
    const currentStep = ANALYSIS_STEPS[currentStepIndex];
    if (!currentStep) return null;

    return (
      <Animated.View style={[styles.analysisContainer, { opacity: fadeAnim }]}>
        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <View style={styles.stepIconContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.stepIcon}
            >
              <Ionicons name={currentStep.icon as any} size={32} color={COLORS.text} />
            </LinearGradient>
          </View>
          
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>{currentStep.title}</Text>
            <Text style={styles.stepDescription}>{currentStep.description}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStepIndex + 1} of {ANALYSIS_STEPS.length}
          </Text>
        </View>

        {/* Current Detail */}
        <Animated.View style={[styles.currentDetail, { opacity: detailFadeAnim }]}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
          <Text style={styles.detailText}>
            {currentStep.details[currentDetailIndex]}
          </Text>
        </Animated.View>

        {/* All Details List */}
        <ScrollView style={styles.detailsList} showsVerticalScrollIndicator={false}>
          {currentStep.details.map((detail, index) => (
            <View
              key={index}
              style={[
                styles.detailItem,
                index <= currentDetailIndex && styles.detailItemCompleted
              ]}
            >
              <Ionicons
                name={index <= currentDetailIndex ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={index <= currentDetailIndex ? COLORS.primary : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.detailItemText,
                  index <= currentDetailIndex && styles.detailItemTextCompleted
                ]}
              >
                {detail}
              </Text>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderResults = () => {
    if (!analysisResults || !showResults) return null;

    return (
      <Animated.ScrollView
        style={[styles.resultsContainer, { opacity: resultsAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Probability */}
        <View style={styles.resultCard}>
          <LinearGradient
            colors={[COLORS.primary + '20', COLORS.secondary + '20']}
            style={styles.resultCardGradient}
          >
            <View style={styles.resultHeader}>
              <Ionicons name="trending-up" size={24} color={COLORS.primary} />
              <Text style={styles.resultTitle}>Success Probability</Text>
            </View>
            <Text style={styles.successPercentage}>{analysisResults.successProbability}%</Text>
            <Text style={styles.resultDescription}>
              Based on your profile, you have an excellent chance of success with the right strategy.
            </Text>
          </LinearGradient>
        </View>

        {/* Addiction Analysis */}
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Ionicons name="analytics" size={24} color={COLORS.secondary} />
            <Text style={styles.resultTitle}>Addiction Analysis</Text>
          </View>
          <View style={styles.severityContainer}>
            <Text style={styles.severityLabel}>Severity: {analysisResults.addictionSeverity.severity}</Text>
            <View style={styles.severityBar}>
              <View
                style={[
                  styles.severityFill,
                  { width: `${(analysisResults.addictionSeverity.score / 10) * 100}%` }
                ]}
              />
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity onPress={handleContinue} style={styles.continueButtonContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>
              View Your Complete Strategy
            </Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.text} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={[styles.progressFill, { width: '77.8%' }]}
          />
        </View>
        <Text style={styles.progressText}>Step 7 of 9</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {currentPhase === 'initializing' && renderInitializing()}
        {(currentPhase === 'collecting' || currentPhase === 'processing' || 
          currentPhase === 'calculating' || currentPhase === 'personalizing' || 
          currentPhase === 'finalizing') && renderAnalysisProgress()}
        {currentPhase === 'complete' && renderResults()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  progressContainer: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  
  // Analyzing Phase
  analysisContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
  },
  analysisCard: {
    width: '100%',
    padding: SPACING['2xl'],
    borderRadius: SPACING['2xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  analysisIcon: {
    marginBottom: SPACING.xl,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  analysisSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING['2xl'],
  },
  analysisSteps: {
    width: '100%',
  },
  analysisStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  stepIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.md,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Results Phase
  resultsContainer: {
    paddingVertical: SPACING.xl,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING['2xl'],
    lineHeight: 22,
  },
  metricCard: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.xl,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: SPACING.xl,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricInsight: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  
  // Recommendations Phase
  recommendationsContainer: {
    paddingVertical: SPACING.xl,
  },
  recommendationsTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  recommendationsSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING['2xl'],
    lineHeight: 22,
  },
  recommendationCard: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  recommendationGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: SPACING.lg,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  recommendationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  confidenceText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  recommendationDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  recommendationImpact: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: SPACING.lg,
    marginTop: SPACING.xl,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  initSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING['2xl'],
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginHorizontal: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  progressBarContainer: {
    marginBottom: SPACING.md,
  },
  currentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailItemCompleted: {
    opacity: 0.5,
  },
  detailItemText: {
    fontSize: 14,
    color: COLORS.text,
  },
  detailItemTextCompleted: {
    opacity: 0.5,
  },
  resultCard: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.xl,
    overflow: 'hidden',
  },
  resultCardGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: SPACING.xl,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: SPACING.md,
  },
  successPercentage: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  resultDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  severityContainer: {
    marginBottom: SPACING.md,
  },
  severityLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  severityBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  severityFill: {
    height: '100%',
    borderRadius: 4,
  },
  continueButtonContainer: {
    alignItems: 'center',
  },
  analysisStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  processingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  detailsList: {
    maxHeight: 200,
    marginTop: SPACING.md,
  },
});

export default DataAnalysisStep; 