import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, setStep, selectOnboarding, updateStepData, completeOnboarding } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const DataAnalysisStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const onboardingState = useSelector((state: RootState) => selectOnboarding(state));
  const { stepData, currentStep, totalSteps } = onboardingState;
  
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const dotScale1 = useRef(new Animated.Value(0)).current;
  const dotScale2 = useRef(new Animated.Value(0)).current;
  const dotScale3 = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const skipOpacity = useRef(new Animated.Value(0)).current;

  // Store timer refs for cleanup
  const phaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const completeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const skipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Analysis phases - more sophisticated messaging
  const ANALYSIS_PHASES = [
    {
      title: "Reading your profile",
      subtitle: "Understanding your journey",
      icon: "person-outline",
    },
    {
      title: "Personalizing approach",
      subtitle: "Tailoring to your needs",
      icon: "sparkles-outline",
    },
    {
      title: "Finalizing blueprint",
      subtitle: "Building your recovery plan",
      icon: "layers-outline",
    },
  ];

  useEffect(() => {
    startAnalysis();

    // Cleanup function
    return () => {
      if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
      if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
      if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
      if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
    };
  }, []);

  const startAnalysis = () => {
    // Initial fade in and scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 10,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    // Start progress bar animation (4.5 seconds total)
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: 4500,
      useNativeDriver: false,
    }).start();

    // Animate dots in sequence
    animateDots();

    // Phase transitions (1.5 seconds each)
    let phase = 0;
    const phaseInterval = setInterval(() => {
      phase++;
      if (phase < ANALYSIS_PHASES.length) {
        setCurrentPhase(phase);
        // Haptic feedback on phase change
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Reset and reanimate dots for each phase
        resetDots();
        setTimeout(() => animateDots(), 100);
      } else {
        clearInterval(phaseInterval);
      }
    }, 1500);

    // Complete after 4.5 seconds
    completeTimeoutRef.current = setTimeout(() => {
      clearInterval(phaseInterval);
      completeAnalysis();
    }, 4500);
    
    // Show skip button after 2 seconds
    skipTimeoutRef.current = setTimeout(() => {
      setShowSkip(true);
      Animated.timing(skipOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 2000);
  };

  const animateDots = () => {
    // Stagger dot animations for loading effect
    Animated.sequence([
      Animated.timing(dotScale1, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(dotScale2, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(dotScale3, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetDots = () => {
    dotScale1.setValue(0);
    dotScale2.setValue(0);
    dotScale3.setValue(0);
  };

  const completeAnalysis = async () => {
    setIsComplete(true);
    
    // Light haptic feedback on completion
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Fade out current content
    Animated.timing(fadeAnim, {
      toValue: 0.3,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Then show checkmark
      Animated.spring(checkmarkScale, {
        toValue: 1,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }).start();
    });
    
    // Calculate success probability
    const successProbability = calculateSuccessProbability();
    
    // Save results
    await dispatch(updateStepData({ 
      successProbability,
      analysisComplete: true
    }));
    
    // Navigate after a brief pause
    navigationTimeoutRef.current = setTimeout(() => {
      navigateToNextStep();
    }, 800);
  };

  const navigateToNextStep = () => {
    try {
      // Force navigation to step 9 regardless of Redux state
      dispatch(setStep(9));
    } catch (error) {
      console.error('DataAnalysisStep: Navigation error:', error);
    }
  };

  const calculateSuccessProbability = () => {
    // Simple calculation based on key factors
    let baseRate = 75;
    
    // Adjust based on previous attempts
    const previousAttempts = stepData?.previousAttempts || 0;
    if (previousAttempts === 0) {
      baseRate += 5;
    } else if (previousAttempts <= 2) {
      baseRate += 10; // Learning from experience
    } else {
      baseRate += 5;
    }
    
    // Adjust based on motivations
    const motivations = stepData?.reasonsToQuit || [];
    baseRate += Math.min(motivations.length * 3, 15);
    
    // Cap at realistic range
    return Math.min(Math.max(baseRate, 60), 95);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Clear all timeouts
    if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
    if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
    if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
    
    // Jump to completion
    completeAnalysis();
  };

  const currentPhaseData = ANALYSIS_PHASES[currentPhase];

  return (
    <View style={styles.container}>
      {/* Gradient background */}
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(8/9) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Step 8 of 9</Text>
        </View>

        <Animated.View style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}>
          {/* Main Icon */}
          {!isComplete ? (
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Ionicons 
                  name={currentPhaseData.icon as any} 
                  size={36} 
                  color={COLORS.primary} 
                />
              </View>
              
              {/* Loading dots */}
              <View style={styles.dotsContainer}>
                <Animated.View style={[
                  styles.dot,
                  { transform: [{ scale: dotScale1 }] }
                ]} />
                <Animated.View style={[
                  styles.dot,
                  styles.dotMiddle,
                  { transform: [{ scale: dotScale2 }] }
                ]} />
                <Animated.View style={[
                  styles.dot,
                  { transform: [{ scale: dotScale3 }] }
                ]} />
              </View>
            </View>
          ) : (
            <Animated.View style={[
              styles.iconContainer,
              { transform: [{ scale: checkmarkScale }] }
            ]}>
              <View style={[styles.iconBackground, styles.completeBackground]}>
                <Ionicons 
                  name="checkmark" 
                  size={40} 
                  color="#10B981" 
                />
              </View>
            </Animated.View>
          )}

          {/* Phase Text */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {isComplete ? "Ready" : currentPhaseData.title}
            </Text>
            <Text style={styles.subtitle}>
              {isComplete ? "Your personalized plan awaits" : currentPhaseData.subtitle}
            </Text>
          </View>

          {/* Progress Line */}
          {!isComplete && (
            <View style={styles.progressLineContainer}>
              <View style={styles.progressLine}>
                <Animated.View 
                  style={[
                    styles.progressLineFill,
                    {
                      width: progressWidth.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      })
                    }
                  ]}
                />
              </View>
            </View>
          )}
        </Animated.View>
        
        {/* Skip button */}
        {showSkip && !isComplete && (
          <Animated.View style={[styles.skipContainer, { opacity: skipOpacity }]}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  progressContainer: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.xl * 2,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 1,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
    borderRadius: 1,
  },
  progressText: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl * 2,
  },
  iconContainer: {
    marginBottom: SPACING.xl * 1.5,
    alignItems: 'center',
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.12)',
  },
  completeBackground: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    height: 6,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  dotMiddle: {
    // Gap handled by container
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 2,
  },
  title: {
    fontSize: FONTS.xl,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 20,
  },
  progressLineContainer: {
    width: 160,
    marginBottom: SPACING.xl * 2,
  },
  progressLine: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 0.5,
    overflow: 'hidden',
  },
  progressLineFill: {
    height: '100%',
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 0.5,
  },
  skipContainer: {
    position: 'absolute',
    bottom: SPACING.xl * 2,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  skipButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  skipText: {
    fontSize: FONTS.sm,
    fontWeight: '400',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default DataAnalysisStep; 