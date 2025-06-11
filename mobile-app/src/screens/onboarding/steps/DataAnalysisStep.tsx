import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, setStep, selectOnboarding, updateStepData, completeOnboarding } from '../../../store/slices/onboardingSlice';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DataAnalysisStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const onboardingState = useSelector((state: RootState) => selectOnboarding(state));
  const { stepData, currentStep, totalSteps } = onboardingState;
  
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const dotScale1 = useRef(new Animated.Value(0)).current;
  const dotScale2 = useRef(new Animated.Value(0)).current;
  const dotScale3 = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  // Store timer refs for cleanup
  const phaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const completeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Analysis phases - more sophisticated messaging
  const ANALYSIS_PHASES = [
    {
      title: "Analyzing your profile",
      subtitle: "Understanding your unique journey",
      icon: "person-circle-outline",
    },
    {
      title: "Calculating success factors",
      subtitle: "Personalizing your approach",
      icon: "analytics-outline",
    },
    {
      title: "Building your blueprint",
      subtitle: "Creating your custom plan",
      icon: "construct-outline",
    },
  ];

  // Debug logging
  useEffect(() => {
    console.log('DataAnalysisStep: Current step from Redux:', currentStep);
    console.log('DataAnalysisStep: Total steps from Redux:', totalSteps);
  }, [currentStep, totalSteps]);

  useEffect(() => {
    startAnalysis();

    // Cleanup function
    return () => {
      if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
      if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
      if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
    };
  }, []);

  const startAnalysis = () => {
    // Initial fade in and scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Start progress bar animation (6 seconds total)
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: 6000,
      useNativeDriver: false,
    }).start();

    // Animate dots in sequence
    animateDots();

    // Phase transitions (2 seconds each)
    let phase = 0;
    const phaseInterval = setInterval(() => {
      phase++;
      if (phase < ANALYSIS_PHASES.length) {
        setCurrentPhase(phase);
        // Reset and reanimate dots for each phase
        resetDots();
        setTimeout(() => animateDots(), 100);
      } else {
        clearInterval(phaseInterval);
      }
    }, 2000);

    // Complete after 6 seconds
    completeTimeoutRef.current = setTimeout(() => {
      clearInterval(phaseInterval);
      completeAnalysis();
    }, 6000);
  };

  const animateDots = () => {
    // Stagger dot animations for loading effect
    Animated.sequence([
      Animated.timing(dotScale1, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(dotScale2, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(dotScale3, {
        toValue: 1,
        duration: 300,
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
    
    // Fade out current content
    Animated.timing(fadeAnim, {
      toValue: 0.3,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Then show checkmark
      Animated.spring(checkmarkScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    });
    
    // Calculate success probability
    const successProbability = calculateSuccessProbability();
    
    // Save results
    console.log('DataAnalysisStep: Saving results...');
    await dispatch(updateStepData({ 
      successProbability,
      analysisComplete: true
    }));
    
    console.log('DataAnalysisStep: Results saved, navigating in 1s...');
    
    // Navigate after a brief pause
    navigationTimeoutRef.current = setTimeout(() => {
      navigateToNextStep();
    }, 1000);
  };

  const navigateToNextStep = () => {
    try {
      console.log('DataAnalysisStep: Attempting to navigate to next step...');
      console.log('DataAnalysisStep: Current step before navigation:', currentStep);
      
      // Force navigation to step 9 regardless of Redux state
      dispatch(setStep(9));
      console.log('DataAnalysisStep: Navigation dispatched successfully');
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
                  size={48} 
                  color="#8B5CF6" 
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
                  size={48} 
                  color="#FFFFFF" 
                />
              </View>
            </Animated.View>
          )}

          {/* Phase Text */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {isComplete ? "Analysis Complete" : currentPhaseData.title}
            </Text>
            <Text style={styles.subtitle}>
              {isComplete ? "Your personalized plan is ready" : currentPhaseData.subtitle}
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 40,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1.5,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 1.5,
  },
  progressText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  iconBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(139,92,246,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
  },
  completeBackground: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    height: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  dotMiddle: {
    marginHorizontal: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  progressLineContainer: {
    width: 200,
    marginBottom: 40,
  },
  progressLine: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressLineFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 1,
  },
});

export default DataAnalysisStep; 