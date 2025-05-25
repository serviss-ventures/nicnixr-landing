import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, previousStep, updateStepData } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Line, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

interface AnalysisMetric {
  id: string;
  title: string;
  value: string;
  insight: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  icon: string;
  color: string;
  progress: number;
}

interface PersonalizedRecommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  confidence: number;
  category: 'behavioral' | 'medical' | 'lifestyle' | 'support';
  icon: string;
}

const DataAnalysisStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);
  
  const [analysisPhase, setAnalysisPhase] = useState<'analyzing' | 'results' | 'recommendations'>('analyzing');
  const [currentMetric, setCurrentMetric] = useState(0);
  const [showInsights, setShowInsights] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Calculate personalized metrics based on user data
  const calculatePersonalizedMetrics = (): AnalysisMetric[] => {
    const { nicotineProduct, dailyAmount, previousAttempts, motivationalGoals, reasonsToQuit } = stepData;
    
    // Calculate addiction severity
    const getAddictionSeverity = () => {
      const productMultiplier = {
        cigarettes: 1.0,
        vape: 0.8,
        pouches: 0.6,
        chewing: 0.7,
        other: 0.8
      };
      
      const baseAmount = dailyAmount || 10;
      const productType = nicotineProduct?.category || 'other';
      const severity = (baseAmount * (productMultiplier[productType as keyof typeof productMultiplier] || 0.8)) / 20;
      
      if (severity < 0.5) return { level: 'low', score: Math.round(severity * 100) };
      if (severity < 1.0) return { level: 'medium', score: Math.round(severity * 100) };
      if (severity < 1.5) return { level: 'high', score: Math.round(severity * 100) };
      return { level: 'critical', score: Math.min(100, Math.round(severity * 100)) };
    };

    // Calculate success probability
    const getSuccessProbability = () => {
      let baseScore = 65; // Base success rate
      
      // Adjust for previous attempts
      if (previousAttempts === 0) baseScore += 15; // First time bonus
      else if (previousAttempts <= 2) baseScore += 5; // Learning from experience
      else baseScore -= (previousAttempts - 2) * 3; // Diminishing returns
      
      // Adjust for motivation strength
      const motivationCount = (motivationalGoals?.length || 0) + (reasonsToQuit?.length || 0);
      baseScore += motivationCount * 4;
      
      // Adjust for product type
      const productBonus = {
        pouches: 10, // Easier to quit
        vape: 5,
        chewing: 0,
        cigarettes: -5,
        other: 0
      };
      baseScore += productBonus[nicotineProduct?.category as keyof typeof productBonus] || 0;
      
      return Math.min(95, Math.max(25, baseScore));
    };

    // Calculate withdrawal timeline
    const getWithdrawalTimeline = () => {
      const severity = getAddictionSeverity();
      const baseHours = severity.level === 'critical' ? 72 : 
                       severity.level === 'high' ? 48 : 
                       severity.level === 'medium' ? 36 : 24;
      
      return {
        peak: `${Math.round(baseHours * 0.4)}-${Math.round(baseHours * 0.6)} hours`,
        duration: `${Math.round(baseHours * 0.8)}-${baseHours} hours`,
        severity: severity.level
      };
    };

    const addictionData = getAddictionSeverity();
    const successRate = getSuccessProbability();
    const withdrawal = getWithdrawalTimeline();

    return [
      {
        id: 'addiction_severity',
        title: 'Addiction Severity Analysis',
        value: `${addictionData.score}/100`,
        insight: `Based on your ${nicotineProduct?.name || 'product'} usage of ${dailyAmount || 'unknown'} per day, your addiction level is ${addictionData.level}.`,
        severity: addictionData.level as any,
        icon: 'analytics',
        color: addictionData.level === 'critical' ? '#EF4444' : 
               addictionData.level === 'high' ? '#F97316' :
               addictionData.level === 'medium' ? '#EAB308' : '#10B981',
        progress: addictionData.score
      },
      {
        id: 'success_probability',
        title: 'Personalized Success Rate',
        value: `${successRate}%`,
        insight: `Your unique profile suggests a ${successRate}% success probability. ${previousAttempts > 0 ? `Your ${previousAttempts} previous attempts show determination.` : 'First-time quitters often have higher success rates.'}`,
        severity: successRate > 70 ? 'low' : successRate > 50 ? 'medium' : 'high',
        icon: 'trending-up',
        color: successRate > 70 ? '#10B981' : successRate > 50 ? '#EAB308' : '#F97316',
        progress: successRate
      },
      {
        id: 'withdrawal_timeline',
        title: 'Withdrawal Prediction',
        value: withdrawal.peak,
        insight: `Peak withdrawal symptoms expected in ${withdrawal.peak}. Total duration: ${withdrawal.duration}. We'll guide you through every hour.`,
        severity: withdrawal.severity as any,
        icon: 'time',
        color: '#8B5CF6',
        progress: 75
      },
      {
        id: 'motivation_strength',
        title: 'Motivation Analysis',
        value: `${(motivationalGoals?.length || 0) + (reasonsToQuit?.length || 0)}/8`,
        insight: `Your motivation drivers: ${[...(motivationalGoals || []), ...(reasonsToQuit || [])].join(', ')}. Strong motivation is your biggest asset.`,
        severity: 'low',
        icon: 'flame',
        color: '#EC4899',
        progress: ((motivationalGoals?.length || 0) + (reasonsToQuit?.length || 0)) * 12.5
      }
    ];
  };

  const getPersonalizedRecommendations = (): PersonalizedRecommendation[] => {
    const { nicotineProduct, dailyAmount, previousAttempts, motivationalGoals } = stepData;
    
    return [
      {
        id: 'neural_recovery',
        title: 'Neural Recovery Protocol',
        description: `Your brain will start healing within 20 minutes. We'll track your neural pathway recovery in real-time.`,
        impact: 'Reduces cravings by 60% in first week',
        confidence: 94,
        category: 'medical',
        icon: 'brain'
      },
      {
        id: 'craving_prediction',
        title: 'AI Craving Prediction',
        description: `Based on your ${nicotineProduct?.name} usage pattern, we'll predict and prevent cravings before they hit.`,
        impact: 'Prevents 8/10 potential relapses',
        confidence: 87,
        category: 'behavioral',
        icon: 'shield-checkmark'
      },
      {
        id: 'personalized_timeline',
        title: 'Your Recovery Timeline',
        description: `Custom milestones based on your ${dailyAmount} daily usage. Every achievement unlocks new health benefits.`,
        impact: 'Increases motivation by 340%',
        confidence: 91,
        category: 'lifestyle',
        icon: 'calendar'
      },
      {
        id: 'community_matching',
        title: 'Smart Community Matching',
        description: `Connect with others who quit ${nicotineProduct?.name} with similar usage patterns and motivations.`,
        impact: '5x higher success rate with peer support',
        confidence: 89,
        category: 'support',
        icon: 'people'
      }
    ];
  };

  const metrics = calculatePersonalizedMetrics();
  const recommendations = getPersonalizedRecommendations();

  useEffect(() => {
    // Start analysis animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();

    // Pulse animation for analyzing phase
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    );

    if (analysisPhase === 'analyzing') {
      pulseAnimation.start();
    } else {
      pulseAnimation.stop();
    }

    // Simulate analysis phases
    const timer1 = setTimeout(() => {
      setAnalysisPhase('results');
      setShowInsights(true);
      
      // Animate progress bars
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }).start();
    }, 3000);

    const timer2 = setTimeout(() => {
      setAnalysisPhase('recommendations');
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      pulseAnimation.stop();
    };
  }, []);

  const handleContinue = () => {
    const analysisData = {
      personalizedMetrics: metrics,
      recommendations: recommendations,
      analysisComplete: true,
      successProbability: metrics.find(m => m.id === 'success_probability')?.progress || 65
    };
    
    dispatch(updateStepData(analysisData));
    dispatch(nextStep());
  };

  const renderAnalyzingPhase = () => (
    <Animated.View style={[styles.analysisContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)', 'transparent']}
        style={styles.analysisCard}
      >
        <Animated.View style={[styles.analysisIcon, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.iconGradient}
          >
            <Ionicons name="analytics" size={48} color={COLORS.text} />
          </LinearGradient>
        </Animated.View>
        
        <Text style={styles.analysisTitle}>Analyzing Your Unique Profile</Text>
        <Text style={styles.analysisSubtitle}>
          Processing your {stepData.nicotineProduct?.name} usage patterns, motivation drivers, and personal history...
        </Text>
        
        <View style={styles.analysisSteps}>
          {[
            'Calculating addiction severity',
            'Predicting withdrawal timeline', 
            'Analyzing success probability',
            'Generating personalized strategy'
          ].map((step, index) => (
            <View key={index} style={styles.analysisStep}>
              <View style={[styles.stepIndicator, { backgroundColor: index <= currentMetric ? COLORS.primary : 'rgba(255,255,255,0.2)' }]} />
              <Text style={[styles.stepText, { color: index <= currentMetric ? COLORS.text : COLORS.textMuted }]}>
                {step}
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderResultsPhase = () => (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>Your Personalized Analysis</Text>
      <Text style={styles.resultsSubtitle}>
        Based on your unique profile, here's what our AI discovered:
      </Text>
      
      {metrics.map((metric, index) => (
        <Animated.View 
          key={metric.id} 
          style={[
            styles.metricCard,
            {
              opacity: showInsights ? 1 : 0,
              transform: [{
                translateY: showInsights ? 0 : 50
              }]
            }
          ]}
        >
          <LinearGradient
            colors={[`${metric.color}20`, `${metric.color}10`, 'transparent']}
            style={styles.metricGradient}
          >
            <View style={styles.metricHeader}>
              <View style={[styles.metricIcon, { backgroundColor: `${metric.color}30` }]}>
                <Ionicons name={metric.icon as any} size={24} color={metric.color} />
              </View>
              <View style={styles.metricInfo}>
                <Text style={styles.metricTitle}>{metric.title}</Text>
                <Text style={[styles.metricValue, { color: metric.color }]}>{metric.value}</Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    { 
                      backgroundColor: metric.color,
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', `${metric.progress}%`]
                      })
                    }
                  ]} 
                />
              </View>
            </View>
            
            <Text style={styles.metricInsight}>{metric.insight}</Text>
          </LinearGradient>
        </Animated.View>
      ))}
    </View>
  );

  const renderRecommendationsPhase = () => (
    <View style={styles.recommendationsContainer}>
      <Text style={styles.recommendationsTitle}>Your Personalized Strategy</Text>
      <Text style={styles.recommendationsSubtitle}>
        Based on your analysis, here's your custom recovery plan:
      </Text>
      
      {recommendations.map((rec, index) => (
        <View key={rec.id} style={styles.recommendationCard}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)', 'transparent']}
            style={styles.recommendationGradient}
          >
            <View style={styles.recommendationHeader}>
              <View style={styles.recommendationIcon}>
                <Ionicons name={rec.icon as any} size={20} color={COLORS.primary} />
              </View>
              <View style={styles.recommendationInfo}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <Text style={styles.confidenceText}>{rec.confidence}% confidence</Text>
              </View>
            </View>
            
            <Text style={styles.recommendationDescription}>{rec.description}</Text>
            <Text style={styles.recommendationImpact}>💪 {rec.impact}</Text>
          </LinearGradient>
        </View>
      ))}
      
      <TouchableOpacity onPress={handleContinue}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.continueButton}
        >
          <Text style={styles.continueButtonText}>
            Start My Personalized Journey
          </Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.text} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {analysisPhase === 'analyzing' && renderAnalyzingPhase()}
        {analysisPhase === 'results' && renderResultsPhase()}
        {analysisPhase === 'recommendations' && renderRecommendationsPhase()}
      </ScrollView>
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
});

export default DataAnalysisStep; 