import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, selectOnboarding } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

type AnalysisPhase = 'initializing' | 'analyzing' | 'complete';

const DataAnalysisStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => selectOnboarding(state));
  
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

  // Professional Analysis Insights
  const ANALYSIS_INSIGHTS = [
    "Analyzing neurochemical dependency patterns...",
    "Mapping behavioral trigger networks across 47 data points...", 
    "Calculating success probability using proprietary algorithms...",
    "Designing neural pathway recovery strategy...",
    "Building personalized intervention framework...",
    "Crafting evidence-based recovery timeline...",
    "Generating custom cessation protocol...",
    "Optimizing behavioral modification strategies...",
    "Finalizing personalized treatment approach..."
  ];

  useEffect(() => {
    startEpicAnalysis();
  }, []);

  const startEpicAnalysis = () => {
    // Initial dramatic entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Start the epic analysis after 3 seconds
      setTimeout(() => {
        setCurrentPhase('analyzing');
        runEpicAnalysis();
      }, 3000);
    });

    // Continuous pulse animation
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
  };

  const runEpicAnalysis = () => {
    // Animate progress bar over 25 seconds (optimal engagement time)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 25000,
      useNativeDriver: false,
    }).start();

    // Cycle through insights every 3.5 seconds
    const insightInterval = setInterval(() => {
      setCurrentInsight(prev => {
        const next = prev + 1;
        if (next >= ANALYSIS_INSIGHTS.length) {
          clearInterval(insightInterval);
          // Analysis complete - generate results
          setTimeout(() => {
            generateEpicResults();
          }, 1000);
          return prev;
        }
        
        // Animate insight change
        Animated.sequence([
          Animated.timing(insightAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(insightAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
        
        return next;
      });
    }, 3500);
  };

  const generateEpicResults = () => {
    // Calculate realistic results based on user data with proper null checks
    const nicotineProduct = stepData?.nicotineProduct || null;
    const previousAttempts = stepData?.previousAttempts || 0;
    const motivationStrength = stepData?.motivationalGoals?.length || 1;
    const longestQuitPeriod = stepData?.longestQuitPeriod || 'hours';
    
    // Calculate success probability based on factors
    let baseSuccessRate = 72;
    
    // Adjust for product type
    if (nicotineProduct?.category === 'cigarettes') baseSuccessRate -= 8;
    if (nicotineProduct?.category === 'vape') baseSuccessRate -= 4;
    if (nicotineProduct?.category === 'pouches') baseSuccessRate += 6;
    
    // Adjust for previous attempts (experience helps)
    if (previousAttempts > 0) baseSuccessRate += Math.min(previousAttempts * 4, 12);
    
    // Adjust for motivation
    baseSuccessRate += motivationStrength * 3;
    
    // Adjust for longest quit period
    const quitPeriodBonus = {
      'hours': 0,
      'days': 6,
      'week': 12,
      'weeks': 18,
      'months': 24,
      'long_term': 30
    };
    baseSuccessRate += quitPeriodBonus[longestQuitPeriod as keyof typeof quitPeriodBonus] || 0;
    
    // Cap at realistic range
    const successProbability = Math.min(Math.max(baseSuccessRate, 52), 94);
    
    const results = {
      successProbability,
      addictionSeverity: calculateAddictionSeverity(),
      uniqueStrengths: identifyUniqueStrengths(),
      personalizedStrategy: generatePersonalizedStrategy(),
      timeline: generateTimeline(),
      riskFactors: identifyRiskFactors()
    };
    
    setAnalysisResults(results);
    setCurrentPhase('complete');
    
    // Dramatic results reveal
    setTimeout(() => {
      setShowResults(true);
      Animated.timing(resultsAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      }).start();
    }, 2000);
  };

  const calculateAddictionSeverity = () => {
    const dailyAmount = stepData?.dailyAmount || 10;
    const yearsUsing = stepData?.yearsUsing || 1;
    
    let score = Math.min((dailyAmount / 5) + (yearsUsing / 2), 10);
    
    let severity = 'Moderate';
    if (score <= 3) severity = 'Mild';
    else if (score >= 7) severity = 'Severe';
    
    return { severity, score: Math.round(score * 10) / 10 };
  };

  const identifyUniqueStrengths = () => {
    const strengths = [];
    
    if (stepData?.longestQuitPeriod === 'months' || stepData?.longestQuitPeriod === 'long_term') {
      strengths.push('Proven long-term cessation capability');
    }
    if (stepData?.motivationalGoals?.length >= 3) {
      strengths.push('Multi-dimensional motivation profile');
    }
    if ((stepData?.previousAttempts || 0) > 2) {
      strengths.push('Experienced with cessation attempts');
    }
    if (stepData?.reasonsToQuit?.includes('health')) {
      strengths.push('Health-focused motivation');
    }
    
    return strengths.length > 0 ? strengths : ['Strong determination indicators'];
  };

  const generatePersonalizedStrategy = () => {
    const strategies = [];
    
    // Based on nicotine product - specialized protocols
    if (stepData?.nicotineProduct?.category === 'cigarettes') {
      strategies.push('Gradual reduction protocol');
      strategies.push('Respiratory recovery program');
    } else if (stepData?.nicotineProduct?.category === 'vape') {
      strategies.push('Vapor cessation transition');
      strategies.push('Chemical dependency detox');
    } else if (stepData?.nicotineProduct?.category === 'pouches') {
      strategies.push('Oral habit modification');
      strategies.push('Behavioral replacement therapy');
    } else if (stepData?.nicotineProduct?.category === 'chewing') {
      strategies.push('Chewing cessation protocol');
      strategies.push('Oral health recovery');
    }
    
    // Based on triggers - targeted interventions
    if (stepData?.cravingTriggers?.includes('stress')) {
      strategies.push('Stress management intervention');
    }
    if (stepData?.cravingTriggers?.includes('social')) {
      strategies.push('Social situation protocols');
    }
    
    strategies.push('Progress tracking system');
    strategies.push('Predictive craving analysis');
    strategies.push('Emergency intervention mode');
    
    return strategies;
  };

  const generateTimeline = () => {
    return [
      { milestone: '20 minutes', benefit: 'Heart rate normalizes' },
      { milestone: '24 hours', benefit: 'Nicotine fully cleared' },
      { milestone: '3 days', benefit: 'Breathing improves dramatically' },
      { milestone: '2 weeks', benefit: 'Circulation fully restored' },
      { milestone: '1 month', benefit: 'Cravings become rare' },
      { milestone: '3 months', benefit: 'Neural pathways rewired' },
      { milestone: '1 year', benefit: 'Addiction completely conquered' }
    ];
  };

  const identifyRiskFactors = () => {
    const factors = [];
    
    if ((stepData?.previousAttempts || 0) > 3) {
      factors.push('Multiple previous attempts');
    }
    if (stepData?.cravingTriggers?.includes('stress')) {
      factors.push('Stress-triggered usage');
    }
    if ((stepData?.dailyAmount || 0) > 20) {
      factors.push('High daily consumption');
    }
    
    return factors.length > 0 ? factors : ['No significant risk factors identified'];
  };

  const handleContinue = () => {
    dispatch(nextStep());
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
      
      <Text style={styles.epicTitle}>Advanced Behavioral Analysis</Text>
      <Text style={styles.epicSubtitle}>
        Our clinical-grade algorithms are analyzing your unique dependency profile to create a personalized cessation strategy based on evidence-based methodologies.
      </Text>
      
      <View style={styles.analysisStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>247,000+</Text>
          <Text style={styles.statLabel}>Users Analyzed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>97.3%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>23</Text>
          <Text style={styles.statLabel}>Data Models</Text>
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
                  inputRange: [1, 1.2],
                  outputRange: [0.4, 1],
                }),
              },
            ]}
          />
        ))}
      </View>
      
      <Text style={styles.processingText}>
        Comprehensive analysis in progress...
      </Text>
    </Animated.View>
  );

  const renderAnalyzing = () => (
    <Animated.View style={[styles.analyzingContainer, { opacity: fadeAnim }]}>
      {/* Epic Progress Header */}
      <View style={styles.progressHeader}>
        <LinearGradient
          colors={['#10B981', '#06B6D4']}
          style={styles.epicIconContainer}
        >
          <Ionicons name="flash" size={40} color={COLORS.text} />
        </LinearGradient>
        
        <View style={styles.progressInfo}>
          <Text style={styles.progressTitle}>Analysis Engine Active</Text>
          <Text style={styles.progressDescription}>Processing behavioral patterns and dependency markers</Text>
        </View>
      </View>

      {/* Epic Progress Bar */}
      <View style={styles.epicProgressContainer}>
        <View style={styles.epicProgressBar}>
          <Animated.View
            style={[
              styles.epicProgressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* Current Epic Insight */}
      <Animated.View style={[styles.epicInsight, { opacity: insightAnim }]}>
        <Text style={styles.insightText}>
          {ANALYSIS_INSIGHTS[currentInsight]}
        </Text>
      </Animated.View>

      {/* Neural Network Visualization */}
      <View style={styles.neuralNetwork}>
        <Text style={styles.neuralTitle}>Neural Processing</Text>
        <View style={styles.neuralNodes}>
          {[0, 1, 2, 3, 4].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.neuralNode,
                {
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.2],
                    outputRange: [0.3, 1],
                  }),
                  transform: [{
                    scale: pulseAnim.interpolate({
                      inputRange: [1, 1.2],
                      outputRange: [0.8, 1.1],
                    })
                  }]
                },
              ]}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );

  const renderEpicResults = () => {
    if (!analysisResults || !showResults) return null;

    return (
      <Animated.ScrollView
        style={[styles.resultsContainer, { opacity: resultsAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Epic Success Probability */}
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
          style={styles.epicResultCard}
        >
          <View style={styles.resultHeader}>
            <View style={styles.customIcon}>
              <View style={styles.iconDot} />
            </View>
            <Text style={styles.epicResultTitle}>Success Probability</Text>
          </View>
          <Text style={styles.epicPercentage}>{analysisResults.successProbability}%</Text>
          <Text style={styles.epicResultDescription}>
            Based on comprehensive analysis of your dependency profile, behavioral patterns, and historical data from similar cases.
          </Text>
        </LinearGradient>

        {/* Unique Strengths */}
        <View style={styles.epicResultCard}>
          <View style={styles.resultHeader}>
            <View style={styles.customIcon}>
              <View style={styles.iconSquare} />
            </View>
            <Text style={styles.epicResultTitle}>Identified Strengths</Text>
          </View>
          {analysisResults.uniqueStrengths.map((strength: string, index: number) => (
            <Text key={index} style={styles.strengthItem}>{strength}</Text>
          ))}
        </View>

        {/* Personalized Strategy Preview */}
        <View style={styles.epicResultCard}>
          <View style={styles.resultHeader}>
            <View style={styles.customIcon}>
              <View style={styles.iconTriangle} />
            </View>
            <Text style={styles.epicResultTitle}>Treatment Protocol</Text>
          </View>
          {analysisResults.personalizedStrategy.slice(0, 3).map((strategy: string, index: number) => (
            <Text key={index} style={styles.strategyItem}>{strategy}</Text>
          ))}
          <Text style={styles.moreStrategies}>+ {analysisResults.personalizedStrategy.length - 3} additional interventions</Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity onPress={handleContinue} style={styles.epicContinueContainer}>
          <LinearGradient
            colors={['#10B981', '#06B6D4', '#8B5CF6']}
            style={styles.epicContinueButton}
          >
            <Text style={styles.epicContinueText}>
              View Complete Analysis
            </Text>
            <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
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
            style={[styles.progressFill, { width: '87.5%' }]}
          />
        </View>
        <Text style={styles.progressText}>Step 7 of 8</Text>
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
  
  // Initializing Phase
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
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
  },
  epicProgressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  epicInsight: {
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  insightText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  neuralNetwork: {
    alignItems: 'center',
  },
  neuralTitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  neuralNodes: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  neuralNode: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#06B6D4',
    marginHorizontal: SPACING.sm,
  },

  // Results Phase
  resultsContainer: {
    paddingVertical: SPACING.xl,
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
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.md,
  },
  strategyItem: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.md,
  },
  moreStrategies: {
    fontSize: 14,
    color: '#06B6D4',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  epicContinueContainer: {
    marginTop: SPACING.xl,
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
  customIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  iconDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  iconSquare: {
    width: 12,
    height: 12,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  iconTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#06B6D4',
  },
});

export default DataAnalysisStep; 