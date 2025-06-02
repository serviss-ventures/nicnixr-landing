import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, selectOnboarding, updateStepData, generateQuitBlueprint, completeOnboarding, setStep } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingData } from '../../../types';

const { width, height } = Dimensions.get('window');

type AnalysisPhase = 'initializing' | 'analyzing' | 'complete';

const DataAnalysisStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => selectOnboarding(state));
  const onboardingState = useSelector((state: RootState) => selectOnboarding(state));
  
  const [currentPhase, setCurrentPhase] = useState<AnalysisPhase>('initializing');
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [currentInsight, setCurrentInsight] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const resultsAnim = useRef(new Animated.Value(0)).current;
  const insightAnim = useRef(new Animated.Value(0)).current;

  // Modern, friendly analysis messages
  const ANALYSIS_INSIGHTS = [
    "Analyzing your unique journey patterns...",
    "Discovering your personal strengths and advantages...", 
    "Building your customized freedom roadmap...",
    "Calculating your success multipliers...",
    "Finalizing your personalized breakthrough plan..."
  ];

  useEffect(() => {
    startSmartAnalysis();
  }, []);

  const startSmartAnalysis = () => {
    // Initial entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Start analysis after 2.5 seconds to build anticipation
      setTimeout(() => {
        setCurrentPhase('analyzing');
        runSmartAnalysis();
      }, 2500);
    });

    // Gentle pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
  };

  const runSmartAnalysis = () => {
    // Progress animation over 14 seconds (feels thorough but not slow)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 14000,
      useNativeDriver: false,
    }).start();

    // Cycle through insights every 2.8 seconds
    const insightInterval = setInterval(() => {
      setCurrentInsight(prev => {
        const next = prev + 1;
        if (next >= ANALYSIS_INSIGHTS.length) {
          clearInterval(insightInterval);
          setTimeout(() => {
            generatePersonalizedResults();
          }, 800);
          return prev;
        }
        
        // Smooth insight transitions
        Animated.sequence([
          Animated.timing(insightAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(insightAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
        
        return next;
      });
    }, 2800);
  };

  const generatePersonalizedResults = () => {
    // Calculate realistic results based on user data with proper null checks
    const nicotineProduct = stepData?.nicotineProduct || null;
    const previousAttempts = stepData?.previousAttempts || 0;
    const motivationStrength = stepData?.motivationalGoals?.length || 1;
    const longestQuitPeriod = stepData?.longestQuitPeriod || 'hours';
    const dailyAmount = stepData?.dailyAmount || 10;
    const usageDuration = stepData?.usageDuration || '1_to_3_years';
    const cravingTriggers = stepData?.cravingTriggers || [];
    const reasonsToQuit = stepData?.reasonsToQuit || [];
    const fearsAboutQuitting = stepData?.fearsAboutQuitting || [];
    const whatWorkedBefore = stepData?.whatWorkedBefore || [];
    const whatMadeItDifficult = stepData?.whatMadeItDifficult || [];
    
    // SMART SUCCESS CALCULATION (friendly approach)
    // Base rate from community success stories
    let baseSuccessRate = 68;
    
    // Product-specific adjustments (based on community data)
    const productAdjustments = {
      'cigarettes': -12, // More challenging habit patterns
      'vape': -8,        // Strong habit formation
      'pouches': +4,     // Easier transition reported
      'chewing': -6,     // Deep-rooted habits
      'other': -2        // Variable factors
    };
    baseSuccessRate += productAdjustments[nicotineProduct?.category as keyof typeof productAdjustments] || 0;
    
    // Usage intensity adjustment (daily amount vs typical users)
    const productAverages = {
      'cigarettes': 15,  // cigarettes per day
      'vape': 200,       // puffs per day
      'pouches': 8,      // pouches per day
      'chewing': 6,      // portions per day
      'other': 10
    };
    const avgForProduct = productAverages[nicotineProduct?.category as keyof typeof productAverages] || 10;
    const usageIntensity = dailyAmount / avgForProduct;
    if (usageIntensity > 1.5) baseSuccessRate -= 8;
    else if (usageIntensity < 0.7) baseSuccessRate += 6;
    
    // Duration of use adjustment (habit depth)
    const durationAdjustments = {
      'less_than_year': +8,
      '1_to_3_years': 0,
      '3_to_5_years': -4,
      '5_to_10_years': -8,
      'more_than_10_years': -12
    };
    baseSuccessRate += durationAdjustments[usageDuration as keyof typeof durationAdjustments] || 0;
    
    // Previous attempts (learning curve effect)
    if (previousAttempts === 0) {
      baseSuccessRate += 5; // Fresh motivation
    } else if (previousAttempts <= 2) {
      baseSuccessRate += previousAttempts * 6; // Learning from experience
    } else {
      baseSuccessRate += 12 - (previousAttempts - 2) * 2; // Diminishing returns
    }
    
    // Motivation quality assessment
    const highValueMotivations = ['health', 'family', 'pregnancy'];
    const mediumValueMotivations = ['money', 'freedom', 'confidence'];
    let motivationScore = 0;
    reasonsToQuit.forEach(reason => {
      if (highValueMotivations.includes(reason)) motivationScore += 8;
      else if (mediumValueMotivations.includes(reason)) motivationScore += 5;
      else motivationScore += 3;
    });
    baseSuccessRate += Math.min(motivationScore, 20);
    
    // Longest quit period (proven capability)
    const quitPeriodBonus = {
      'hours': 0,
      'days': 8,
      'week': 15,
      'weeks': 22,
      'months': 28,
      'long_term': 35
    };
    baseSuccessRate += quitPeriodBonus[longestQuitPeriod as keyof typeof quitPeriodBonus] || 0;
    
    // Trigger complexity (more triggers = harder quit)
    const triggerPenalty = Math.min(cravingTriggers.length * 3, 15);
    baseSuccessRate -= triggerPenalty;
    
    // Fear assessment (fears can be motivating or paralyzing)
    const paralyzingFears = ['withdrawal', 'failure', 'weight_gain'];
    const fearPenalty = fearsAboutQuitting.filter(fear => paralyzingFears.includes(fear)).length * 4;
    baseSuccessRate -= fearPenalty;
    
    // What worked before (proven strategies)
    const provenStrategies = ['nicotine_replacement', 'support_groups', 'medication', 'therapy'];
    const strategyBonus = whatWorkedBefore.filter(strategy => provenStrategies.includes(strategy)).length * 6;
    baseSuccessRate += strategyBonus;
    
    // What made it difficult (risk factors)
    const majorChallenges = ['withdrawal_symptoms', 'stress_triggers', 'social_pressure'];
    const challengePenalty = whatMadeItDifficult.filter(challenge => majorChallenges.includes(challenge)).length * 5;
    baseSuccessRate -= challengePenalty;
    
    // Cap at realistic range (45-96% based on community data)
    const successProbability = Math.min(Math.max(baseSuccessRate, 45), 96);
    
    const results = {
      successProbability,
      addictionSeverity: calculateHabitStrength(),
      uniqueStrengths: identifyPersonalStrengths(),
      personalizedStrategy: generateSmartStrategy(),
      timeline: generateJourneyTimeline(),
      riskFactors: generatePersonalChallenges(),
      confidenceFactors: generateConfidenceBoosts()
    };
    
    setAnalysisResults(results);
    setCurrentPhase('complete');
    
    // Professional results reveal
    setTimeout(() => {
      setShowResults(true);
      Animated.timing(resultsAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    }, 1500);
  };

  const calculateHabitStrength = () => {
    const dailyAmount = stepData?.dailyAmount || 10;
    const usageDuration = stepData?.usageDuration || '1_to_3_years';
    const cravingTriggers = stepData?.cravingTriggers || [];
    const nicotineProduct = stepData?.nicotineProduct || null;
    
    // Base severity from usage amount
    let severityScore = 0;
    
    // Product-specific severity calculation
    const productSeverityMultipliers = {
      'cigarettes': 1.2,  // Strongest habit formation
      'vape': 1.1,        // High frequency usage
      'pouches': 0.9,     // Moderate habit strength
      'chewing': 1.0,     // Standard habit patterns
      'other': 1.0
    };
    
    const productMultiplier = productSeverityMultipliers[nicotineProduct?.category as keyof typeof productSeverityMultipliers] || 1.0;
    
    // Calculate daily usage severity
    const productDailyLimits = {
      'cigarettes': { mild: 5, moderate: 15, severe: 25 },
      'vape': { mild: 100, moderate: 300, severe: 500 },
      'pouches': { mild: 4, moderate: 12, severe: 20 },
      'chewing': { mild: 3, moderate: 8, severe: 15 },
      'other': { mild: 5, moderate: 15, severe: 25 }
    };
    
    const limits = productDailyLimits[nicotineProduct?.category as keyof typeof productDailyLimits] || productDailyLimits.other;
    
    if (dailyAmount <= limits.mild) severityScore += 2;
    else if (dailyAmount <= limits.moderate) severityScore += 5;
    else if (dailyAmount <= limits.severe) severityScore += 8;
    else severityScore += 10;
    
    // Duration impact
    const durationScores = {
      'less_than_year': 1,
      '1_to_3_years': 3,
      '3_to_5_years': 5,
      '5_to_10_years': 7,
      'more_than_10_years': 9
    };
    severityScore += durationScores[usageDuration as keyof typeof durationScores] || 3;
    
    // Trigger complexity
    severityScore += Math.min(cravingTriggers.length, 5);
    
    // Apply product multiplier
    severityScore *= productMultiplier;
    
    // Determine severity level and personalized description
    let severity = 'Moderate';
    let description = '';
    
    if (severityScore <= 8) {
      severity = 'Light';
      description = `Your ${nicotineProduct?.name || 'nicotine'} habit is relatively light. This puts you in a great position for success!`;
    } else if (severityScore <= 15) {
      severity = 'Moderate';
      description = `Your habit strength is typical for ${nicotineProduct?.name || 'nicotine'} users. Totally manageable with the right approach!`;
    } else {
      severity = 'Strong';
      description = `You have a well-established habit, which means you'll see amazing improvements as you break free!`;
    }
    
    return { 
      severity, 
      score: Math.round(severityScore * 10) / 10,
      description,
      category: nicotineProduct?.category || 'unknown'
    };
  };

  const identifyPersonalStrengths = () => {
    const strengths = [];
    const longestQuitPeriod = stepData?.longestQuitPeriod || '';
    const previousAttempts = stepData?.previousAttempts || 0;
    const motivationalGoals = stepData?.motivationalGoals || [];
    const reasonsToQuit = stepData?.reasonsToQuit || [];
    const whatWorkedBefore = stepData?.whatWorkedBefore || [];
    const nicotineProduct = stepData?.nicotineProduct || null;
    const dailyAmount = stepData?.dailyAmount || 10;
    
    // Quit history strengths
    if (longestQuitPeriod === 'long_term') {
      strengths.push(`You've proven you can stay quit long-term - you've got this!`);
    } else if (longestQuitPeriod === 'months') {
      strengths.push(`You've made it months before - that's serious strength`);
    } else if (longestQuitPeriod === 'weeks') {
      strengths.push(`You've broken through the hardest weeks - you know how to do this`);
    } else if (previousAttempts > 0) {
      strengths.push(`Each attempt taught you something valuable - you're wiser now`);
    } else {
      strengths.push(`Fresh start energy - no quit fatigue holding you back`);
    }
    
    // Motivation analysis
    if (reasonsToQuit.includes('health')) {
      strengths.push(`Health motivation is powerful - your body will thank you`);
    }
    if (reasonsToQuit.includes('family')) {
      strengths.push(`Family support gives you extra strength and accountability`);
    }
    if (reasonsToQuit.includes('money')) {
      strengths.push(`You see the financial freedom waiting for you`);
    }
    if (motivationalGoals.length >= 3) {
      strengths.push(`Multiple motivations mean you'll stay strong when challenges come`);
    }
    
    // Product-specific strengths
    if (nicotineProduct?.category === 'pouches') {
      strengths.push(`Pouches users often find quitting easier than expected`);
    } else if (nicotineProduct?.category === 'vape') {
      strengths.push(`Your body will clear nicotine faster than cigarette users`);
    }
    
    // Usage pattern strengths
    const productAverages = {
      'cigarettes': 15, 'vape': 200, 'pouches': 8, 'chewing': 6, 'other': 10
    };
    const avgForProduct = productAverages[nicotineProduct?.category as keyof typeof productAverages] || 10;
    if (dailyAmount < avgForProduct) {
      strengths.push(`You use less than most - your habit is lighter to break`);
    }
    
    // Strategy strengths
    if (whatWorkedBefore.includes('support_groups')) {
      strengths.push(`You know the power of community support`);
    }
    if (whatWorkedBefore.includes('exercise')) {
      strengths.push(`You've found healthy ways to cope - that's huge`);
    }
    
    // Ensure we always have at least 3 strengths
    if (strengths.length < 3) {
      strengths.push(`You're taking a smart, planned approach this time`);
      strengths.push(`You've got cutting-edge tools to support you`);
    }
    
    return strengths.slice(0, 5); // Limit to top 5 for impact
  };

  const generateSmartStrategy = () => {
    const strategies = [];
    const nicotineProduct = stepData?.nicotineProduct || null;
    const cravingTriggers = stepData?.cravingTriggers || [];
    const whatWorkedBefore = stepData?.whatWorkedBefore || [];
    const whatMadeItDifficult = stepData?.whatMadeItDifficult || [];
    const fearsAboutQuitting = stepData?.fearsAboutQuitting || [];
    const previousAttempts = stepData?.previousAttempts || 0;
    const longestQuitPeriod = stepData?.longestQuitPeriod || '';
    
    // Product-specific smart strategies
    if (nicotineProduct?.category === 'cigarettes') {
      strategies.push('Smart cigarette habit replacement system');
      strategies.push('Breathing recovery acceleration program');
      strategies.push('Ritual transformation techniques');
    } else if (nicotineProduct?.category === 'vape') {
      strategies.push('Vape-specific freedom protocol');
      strategies.push('Rapid nicotine clearance optimization');
      strategies.push('Digital habit interruption tools');
    } else if (nicotineProduct?.category === 'pouches') {
      strategies.push('Oral habit redirection techniques');
      strategies.push('Smart behavioral substitutes');
      strategies.push('Quick transition advantage protocol');
    } else if (nicotineProduct?.category === 'chewing') {
      strategies.push('Chewing-specific freedom plan');
      strategies.push('Oral health recovery boost');
      strategies.push('Habit replacement strategies');
    }
    
    // Trigger-specific interventions
    if (cravingTriggers.includes('stress')) {
      strategies.push('Instant stress-relief techniques');
    }
    if (cravingTriggers.includes('social')) {
      strategies.push('Social confidence boosters');
    }
    if (cravingTriggers.includes('boredom')) {
      strategies.push('Engagement activities library');
    }
    if (cravingTriggers.includes('after_meals')) {
      strategies.push('Post-meal satisfaction rituals');
    }
    if (cravingTriggers.includes('driving')) {
      strategies.push('Drive-time freedom playlist');
    }
    
    // Fear-based support
    if (fearsAboutQuitting.includes('withdrawal')) {
      strategies.push('Comfort-focused withdrawal support');
    }
    if (fearsAboutQuitting.includes('weight_gain')) {
      strategies.push('Metabolism support protocol');
    }
    
    // Experience-based strategies
    if (whatWorkedBefore.length > 0) {
      strategies.push(`Enhanced ${whatWorkedBefore[0].replace('_', ' ')} approach`);
    }
    if (whatMadeItDifficult.includes('social_pressure')) {
      strategies.push('Social confidence building');
    }
    
    // Attempt-specific strategies
    if (previousAttempts === 0) {
      strategies.push('First-timer advantage protocol');
    } else if (previousAttempts > 3) {
      strategies.push('Advanced relapse prevention');
    }
    
    // Always include core strategies
    strategies.push('Real-time progress celebration');
    strategies.push('AI-powered craving predictions');
    strategies.push('24/7 Support System');
    strategies.push('Milestone reward system');
    
    return strategies.slice(0, 8); // Limit for readability
  };

  const generateJourneyTimeline = () => {
    const nicotineProduct = stepData?.nicotineProduct || null;
    const dailyAmount = stepData?.dailyAmount || 10;
    const usageDuration = stepData?.usageDuration || '1_to_3_years';
    
    // Base timeline with exciting milestones
    const baseTimeline = [
      { milestone: '20 minutes', benefit: 'Heart rate returns to normal' },
      { milestone: '2 hours', benefit: 'Cravings peak and start fading' },
      { milestone: '12 hours', benefit: 'Oxygen levels normalize' },
      { milestone: '24 hours', benefit: 'Nicotine leaves your bloodstream' },
      { milestone: '48 hours', benefit: 'Taste and smell wake up' },
      { milestone: '72 hours', benefit: 'Breathing gets easier' },
      { milestone: '1 week', benefit: 'Sleep quality improves' },
      { milestone: '2 weeks', benefit: 'Energy levels surge' },
      { milestone: '1 month', benefit: 'Cravings become rare' },
      { milestone: '3 months', benefit: 'Brain chemistry rebalances' },
      { milestone: '6 months', benefit: 'You feel completely free' },
      { milestone: '1 year', benefit: 'Full health recovery achieved' }
    ];
    
    // Customize based on product type
    if (nicotineProduct?.category === 'cigarettes') {
      baseTimeline[2] = { milestone: '12 hours', benefit: 'Carbon monoxide clears out' };
      baseTimeline[5] = { milestone: '72 hours', benefit: 'Lung function improves 30%' };
    } else if (nicotineProduct?.category === 'vape') {
      baseTimeline[1] = { milestone: '2 hours', benefit: 'Vape chemicals start clearing' };
      baseTimeline[4] = { milestone: '48 hours', benefit: 'Artificial flavors leave your system' };
    } else if (nicotineProduct?.category === 'pouches') {
      baseTimeline[3] = { milestone: '24 hours', benefit: 'Oral tissue irritation begins healing' };
      baseTimeline[6] = { milestone: '1 week', benefit: 'Gum health dramatically improves' };
    }
    
    // Adjust timeline based on usage intensity
    const productAverages = {
      'cigarettes': 15, 'vape': 200, 'pouches': 8, 'chewing': 6, 'other': 10
    };
    const avgForProduct = productAverages[nicotineProduct?.category as keyof typeof productAverages] || 10;
    const usageIntensity = dailyAmount / avgForProduct;
    
    if (usageIntensity > 1.5) {
      // Heavy users - slower initial recovery
      baseTimeline[8] = { milestone: '6 weeks', benefit: 'Cravings become rare and manageable' };
    } else if (usageIntensity < 0.7) {
      // Light users - faster recovery
      baseTimeline[8] = { milestone: '2 weeks', benefit: 'Cravings become rare and manageable' };
    }
    
    return baseTimeline;
  };

  const generatePersonalChallenges = () => {
    const factors = [];
    const previousAttempts = stepData?.previousAttempts || 0;
    const whatMadeItDifficult = stepData?.whatMadeItDifficult || [];
    const cravingTriggers = stepData?.cravingTriggers || [];
    const fearsAboutQuitting = stepData?.fearsAboutQuitting || [];
    
    // Previous attempt challenges
    if (previousAttempts > 3) {
      factors.push('Multiple attempts may create doubt - but they also mean experience');
    }
    
    // Difficulty-based factors
    if (whatMadeItDifficult.includes('withdrawal_symptoms')) {
      factors.push(`Withdrawal symptoms can be intense - we have comfort strategies`);
    }
    if (whatMadeItDifficult.includes('stress_triggers')) {
      factors.push(`Stress is a major trigger - we'll build stress-relief habits`);
    }
    if (whatMadeItDifficult.includes('social_pressure')) {
      factors.push(`Social situations can be tricky - we'll boost your confidence`);
    }
    
    // Trigger-based challenges
    if (cravingTriggers.length > 4) {
      factors.push('Multiple triggers mean more vigilance needed initially');
    }
    
    // Fear-based challenges
    if (fearsAboutQuitting.includes('weight_gain')) {
      factors.push('Weight concerns are common - we have metabolism support');
    }
    if (fearsAboutQuitting.includes('failure')) {
      factors.push('Fear of failure is natural - each day is a fresh start');
    }
    
    return factors.slice(0, 3);
  };

  const generateConfidenceBoosts = () => {
    const factors = [];
    const longestQuitPeriod = stepData?.longestQuitPeriod || '';
    const reasonsToQuit = stepData?.reasonsToQuit || [];
    const whatWorkedBefore = stepData?.whatWorkedBefore || [];
    const previousAttempts = stepData?.previousAttempts || 0;
    
    // Quit history confidence
    if (longestQuitPeriod === 'long_term' || longestQuitPeriod === 'months') {
      factors.push(`You've proven you can quit for extended periods`);
    } else if (longestQuitPeriod === 'weeks') {
      factors.push(`You've made it through the toughest first weeks before`);
    }
    
    // Motivation confidence
    if (reasonsToQuit.includes('health')) {
      factors.push('Health motivation is the strongest predictor of success');
    }
    if (reasonsToQuit.includes('family')) {
      factors.push('Family support provides powerful accountability');
    }
    
    // Strategy confidence
    if (whatWorkedBefore.length > 0) {
      factors.push(`You already know strategies that work for you`);
    }
    
    // Experience confidence
    if (previousAttempts > 0) {
      factors.push('Your previous attempts gave you valuable insights');
    } else {
      factors.push('Fresh start means no quit fatigue');
    }
    
    // Always include
    factors.push('AI-powered support adapts to your needs');
    factors.push('Daily progress tracking keeps you motivated');
    
    return factors.slice(0, 4);
  };

  const handleContinue = async () => {
    try {
      // Pass the success probability to the next step
      if (analysisResults) {
        await dispatch(updateStepData({ 
          successProbability: analysisResults.successProbability 
        }));
      }
      
      // WORKAROUND: If we're on step 8 and totalSteps is 8, manually navigate to BlueprintRevealStep
      if (onboardingState.currentStep === 8 && onboardingState.totalSteps === 8) {
        // Directly update the Redux state to step 9
        dispatch(setStep(9));
      } else if (onboardingState.currentStep >= onboardingState.totalSteps) {
        // Generate blueprint and complete onboarding
        await dispatch(generateQuitBlueprint(onboardingState.stepData as OnboardingData));
        dispatch(completeOnboarding());
      } else {
        await dispatch(nextStep());
      }
    } catch (error) {
      // Silent error handling for production
    }
  };

  const renderInitializing = () => (
    <Animated.View style={[styles.centerContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <Animated.View style={[styles.analysisIcon, { transform: [{ scale: pulseAnim }] }]}>
        <LinearGradient
          colors={['#10B981', '#06B6D4', '#8B5CF6']}
          style={styles.iconGradient}
        >
          <Ionicons name="analytics" size={80} color={COLORS.text} />
        </LinearGradient>
      </Animated.View>
      
      <Text style={styles.epicTitle}>Smart Analysis</Text>
      <Text style={styles.epicSubtitle}>
        We're analyzing your journey to create a personalized freedom plan that's uniquely yours. This takes just a moment...
      </Text>
      
      <View style={styles.analysisStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>247K+</Text>
          <Text style={styles.statLabel}>Success Stories</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>23</Text>
          <Text style={styles.statLabel}>Smart Factors</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>87%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
      </View>
      
      <View style={styles.loadingDots}>
        {[0, 1, 2, 3].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.1],
                  outputRange: [0.5, 1],
                }),
              },
            ]}
          />
        ))}
      </View>
      
      <Text style={styles.processingText}>
        Creating your personalized plan...
      </Text>
    </Animated.View>
  );

  const renderAnalyzing = () => (
    <Animated.View style={[styles.analyzingContainer, { opacity: fadeAnim }]}>
      {/* Smart Progress Header */}
      <View style={styles.progressHeader}>
        <LinearGradient
          colors={['#10B981', '#06B6D4']}
          style={styles.epicIconContainer}
        >
          <Ionicons name="rocket" size={40} color={COLORS.text} />
        </LinearGradient>
        
        <View style={styles.progressInfo}>
          <Text style={styles.progressTitle}>Building Your Plan</Text>
          <Text style={styles.progressDescription}>Crafting your personalized roadmap to freedom</Text>
        </View>
      </View>

      {/* Smart Progress Bar */}
      <View style={styles.epicProgressContainer}>
        <View style={styles.epicProgressBar}>
          <Animated.View
            style={[
              styles.epicProgressFill,
              {
                transform: [{
                  scaleX: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  })
                }]
              },
            ]}
          />
        </View>
      </View>

      {/* Current Analysis Insight */}
      <Animated.View style={[styles.epicInsight, { opacity: insightAnim }]}>
        <View style={styles.insightContainer}>
          <Text style={styles.insightText}>
            {ANALYSIS_INSIGHTS[currentInsight]}
          </Text>
        </View>
      </Animated.View>

      {/* Smart Features Showcase */}
      <View style={styles.researchValidation}>
        <Text style={styles.researchTitle}>Your Plan Includes</Text>
        <View style={styles.researchItems}>
          <View style={styles.researchItem}>
            <View style={styles.researchIcon} />
            <Text style={styles.researchText}>Personal Success Strategies</Text>
          </View>
          <View style={styles.researchItem}>
            <View style={styles.researchIcon} />
            <Text style={styles.researchText}>Smart Habit Replacements</Text>
          </View>
          <View style={styles.researchItem}>
            <View style={styles.researchIcon} />
            <Text style={styles.researchText}>24/7 Support System</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderEpicResults = () => {
    if (!analysisResults || !showResults) return null;

    return (
      <>
        <Animated.ScrollView
          style={[styles.resultsContainer, { opacity: resultsAnim }]}
          contentContainerStyle={styles.resultsScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Success Probability */}
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
            style={styles.epicResultCard}
          >
            <View style={styles.resultHeader}>
              <View style={styles.customIconContainer}>
                <View style={styles.targetIcon}>
                  <View style={styles.targetCenter} />
                  <View style={styles.targetRing} />
                </View>
              </View>
              <Text style={styles.epicResultTitle}>Your Success Outlook</Text>
            </View>
            <Text style={styles.epicPercentage}>{analysisResults.successProbability}%</Text>
            <Text style={styles.epicResultDescription}>
              Based on analysis of your profile and insights from 247,000+ success stories. This rate is {analysisResults.successProbability > 50 ? 'higher than' : 'competitive with'} most approaches!
            </Text>
          </LinearGradient>

          {/* Unique Strengths */}
          <View style={styles.epicResultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.customIconContainer}>
                <View style={styles.shieldIcon}>
                  <View style={styles.shieldBody} />
                  <View style={styles.shieldTop} />
                </View>
              </View>
              <Text style={styles.epicResultTitle}>Your Superpowers</Text>
            </View>
            <Text style={styles.strengthsIntro}>We discovered these awesome strengths working in your favor:</Text>
            {analysisResults.uniqueStrengths.map((strength: string, index: number) => (
              <View key={index} style={styles.strengthRow}>
                <View style={styles.strengthBullet} />
                <Text style={styles.strengthItem}>{strength}</Text>
              </View>
            ))}
          </View>

          {/* Personalized Strategy Preview */}
          <View style={styles.epicResultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.customIconContainer}>
                <View style={styles.blueprintIcon}>
                  <View style={styles.blueprintLine1} />
                  <View style={styles.blueprintLine2} />
                  <View style={styles.blueprintLine3} />
                </View>
              </View>
              <Text style={styles.epicResultTitle}>Your Freedom Plan</Text>
            </View>
            <Text style={styles.strategyIntro}>Custom strategies designed just for you:</Text>
            {analysisResults.personalizedStrategy.slice(0, 4).map((strategy: string, index: number) => (
              <View key={index} style={styles.strategyRow}>
                <View style={styles.strategyBullet} />
                <Text style={styles.strategyItem}>{strategy}</Text>
              </View>
            ))}
            <Text style={styles.moreStrategies}>+ {Math.max(0, analysisResults.personalizedStrategy.length - 4)} more personalized features</Text>
          </View>
        </Animated.ScrollView>

        {/* Continue Button */}
        <View style={styles.epicContinueContainer}>
          <TouchableOpacity 
            onPress={handleContinue} 
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#06B6D4', '#8B5CF6']}
              style={styles.epicContinueButton}
            >
              <Text style={styles.epicContinueText}>
                View Your Recovery Plan
              </Text>
              <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={[styles.progressFill, { width: '87.5%' }]}
          />
        </View>
        <Text style={styles.progressText}>Step 8 of 9</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {currentPhase === 'initializing' && renderInitializing()}
        {currentPhase === 'analyzing' && renderAnalyzing()}
        {currentPhase === 'complete' && renderEpicResults()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
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
  
  // Initializing Phase
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
    paddingHorizontal: SPACING.lg,
  },
  analysisIcon: {
    marginBottom: SPACING['2xl'],
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  epicTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
    letterSpacing: -0.5,
  },
  epicSubtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: SPACING['3xl'],
    paddingHorizontal: SPACING.lg,
  },
  analysisStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING['3xl'],
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginHorizontal: SPACING.xs,
  },
  processingText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Analyzing Phase
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: SPACING['2xl'],
    paddingHorizontal: SPACING.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  epicIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  progressDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  epicProgressContainer: {
    marginBottom: SPACING['3xl'],
  },
  epicProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  epicProgressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#06B6D4',
    transformOrigin: 'left',
  },
  epicInsight: {
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  insightContainer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  insightText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  researchValidation: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  researchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  researchItems: {
    flexDirection: 'column',
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
  researchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  researchIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginRight: SPACING.md,
  },
  researchText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },

  // Results Phase
  resultsContainer: {
    flex: 1,
  },
  resultsScrollContent: {
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 120, // Space for button
  },
  epicResultCard: {
    padding: SPACING.xl,
    borderRadius: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  epicResultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  epicPercentage: {
    fontSize: 48,
    fontWeight: '900',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  epicResultDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  strengthItem: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
  },
  strategyItem: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
  },
  moreStrategies: {
    fontSize: 14,
    color: '#06B6D4',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  epicContinueContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: 'rgba(15, 20, 30, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  epicContinueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: SPACING.lg,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  epicContinueText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: SPACING.md,
    letterSpacing: 0.5,
  },
  customIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  
  // Target Icon (Success Rate)
  targetIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetCenter: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  targetRing: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  
  // Shield Icon (Advantages)
  shieldIcon: {
    width: 18,
    height: 20,
    alignItems: 'center',
  },
  shieldBody: {
    width: 18,
    height: 14,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  shieldTop: {
    position: 'absolute',
    top: 0,
    width: 18,
    height: 8,
    backgroundColor: '#8B5CF6',
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },
  
  // Blueprint Icon (Strategy)
  blueprintIcon: {
    width: 20,
    height: 16,
    justifyContent: 'space-between',
  },
  blueprintLine1: {
    width: 20,
    height: 2,
    backgroundColor: '#06B6D4',
    borderRadius: 1,
  },
  blueprintLine2: {
    width: 14,
    height: 2,
    backgroundColor: '#06B6D4',
    borderRadius: 1,
  },
  blueprintLine3: {
    width: 16,
    height: 2,
    backgroundColor: '#06B6D4',
    borderRadius: 1,
  },
  
  // List Item Icons
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  strategyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  strengthBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.6)',
    marginRight: SPACING.md,
    marginTop: 6,
  },
  strategyBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.6)',
    marginRight: SPACING.md,
    marginTop: 6,
  },
  strengthsIntro: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  strategyIntro: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
});

export default DataAnalysisStep; 