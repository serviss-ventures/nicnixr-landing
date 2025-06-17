import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useOnboardingTracking } from '../../../hooks/useOnboardingTracking';

const QUIT_DURATIONS = [
  { id: 'hours', label: 'A few hours' },
  { id: 'days', label: '1-3 days' },
  { id: 'week', label: '1 week' },
  { id: 'weeks', label: '2-4 weeks' },
  { id: 'months', label: '1-6 months' },
  { id: 'long', label: '6+ months' },
];

const PastAttemptsStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);
  const { trackStepCompleted } = useOnboardingTracking();

  // State
  const [hasTriedBefore, setHasTriedBefore] = useState<boolean | null>(
    stepData.hasTriedQuittingBefore !== undefined ? stepData.hasTriedQuittingBefore : null
  );
  const [attemptCount, setAttemptCount] = useState<number>(stepData.previousAttempts || 1);
  const [longestQuitPeriod, setLongestQuitPeriod] = useState<string>(stepData.longestQuitPeriod || '');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  // Initialize animations
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Animate expansion when "Yes" is selected
  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: hasTriedBefore === true ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [hasTriedBefore]);

  const handleResponse = async (hasAttempted: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const pastAttemptsData = {
      hasPreviousAttempts: hasAttempted,
      previousQuitAttempts: hasAttempted ? 1 : 0, // Default value for database
      previousAttempts: hasAttempted ? 1 : 0,
      longestQuitDuration: hasAttempted ? '1-7 days' : 'Never quit',
      relapseReasons: hasAttempted ? ['stress', 'cravings'] : [], // Default reasons
      successfulStrategies: [], // Will be populated if they had attempts
    };

    // Track completion with analytics
    await trackStepCompleted(pastAttemptsData);
    
    dispatch(updateStepData(pastAttemptsData));
    await dispatch(saveOnboardingProgress(pastAttemptsData));
    dispatch(nextStep());
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(previousStep());
  };

  const handleOptionSelect = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasTriedBefore(value);
  };

  const handleCounterChange = (increment: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (increment) {
      setAttemptCount(attemptCount + 1);
    } else {
      setAttemptCount(Math.max(1, attemptCount - 1));
    }
  };

  const handleDurationSelect = (duration: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLongestQuitPeriod(duration);
  };

  const canContinue = () => {
    if (hasTriedBefore === null) return false;
    if (!hasTriedBefore) return true;
    return longestQuitPeriod !== '';
  };

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
            <View style={[styles.progressFill, { width: `${(6/9) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Step 6 of 9</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Have you tried quitting before?</Text>
              <Text style={styles.subtitle}>
                Every attempt teaches valuable lessons
              </Text>
            </View>

            {/* Yes/No Selection */}
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  hasTriedBefore === false && styles.optionCardSelected
                ]}
                onPress={() => handleOptionSelect(false)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.optionIconContainer,
                  hasTriedBefore === false && styles.optionIconContainerSelected
                ]}>
                  <Ionicons 
                    name="sparkles" 
                    size={26} 
                    color={hasTriedBefore === false ? COLORS.primary : COLORS.textSecondary} 
                  />
                </View>
                <Text style={[
                  styles.optionLabel,
                  hasTriedBefore === false && styles.optionLabelSelected
                ]}>
                  First time
                </Text>
                <Text style={[
                  styles.optionDescription,
                  hasTriedBefore === false && styles.optionDescriptionSelected
                ]}>
                  Fresh start energy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionCard,
                  hasTriedBefore === true && styles.optionCardSelected
                ]}
                onPress={() => handleOptionSelect(true)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.optionIconContainer,
                  hasTriedBefore === true && styles.optionIconContainerSelected
                ]}>
                  <Ionicons 
                    name="refresh" 
                    size={26} 
                    color={hasTriedBefore === true ? COLORS.primary : COLORS.textSecondary} 
                  />
                </View>
                <Text style={[
                  styles.optionLabel,
                  hasTriedBefore === true && styles.optionLabelSelected
                ]}>
                  Yes, I have
                </Text>
                <Text style={[
                  styles.optionDescription,
                  hasTriedBefore === true && styles.optionDescriptionSelected
                ]}>
                  Experienced warrior
                </Text>
              </TouchableOpacity>
            </View>

            {/* Expanded Content for "Yes" */}
            {hasTriedBefore && (
              <Animated.View
                style={[
                  styles.expandedContent,
                  {
                    opacity: expandAnim,
                    transform: [{
                      translateY: expandAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    }],
                  }
                ]}
              >
                {/* Attempt Counter */}
                <View style={styles.counterSection}>
                  <Text style={styles.counterLabel}>How many quit attempts?</Text>
                  <View style={styles.counterControls}>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => handleCounterChange(false)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="remove" size={18} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{attemptCount}</Text>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => handleCounterChange(true)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={18} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Duration Selection */}
                <View style={styles.durationSection}>
                  <Text style={styles.sectionTitle}>Longest quit duration</Text>
                  <View style={styles.durationGrid}>
                    <View style={styles.durationRow}>
                      {QUIT_DURATIONS.slice(0, 3).map((duration) => (
                        <TouchableOpacity
                          key={duration.id}
                          style={[
                            styles.durationCard,
                            longestQuitPeriod === duration.id && styles.durationCardSelected
                          ]}
                          onPress={() => handleDurationSelect(duration.id)}
                          activeOpacity={0.7}
                        >
                          <Text 
                            style={[
                              styles.durationText,
                              longestQuitPeriod === duration.id && styles.durationTextSelected
                            ]}
                            numberOfLines={1}
                          >
                            {duration.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.durationRow}>
                      {QUIT_DURATIONS.slice(3, 6).map((duration) => (
                        <TouchableOpacity
                          key={duration.id}
                          style={[
                            styles.durationCard,
                            longestQuitPeriod === duration.id && styles.durationCardSelected
                          ]}
                          onPress={() => handleDurationSelect(duration.id)}
                          activeOpacity={0.7}
                        >
                          <Text 
                            style={[
                              styles.durationText,
                              longestQuitPeriod === duration.id && styles.durationTextSelected
                            ]}
                            numberOfLines={1}
                          >
                            {duration.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Encouragement Message */}
                <View style={styles.encouragementBox}>
                  <Ionicons name="heart" size={14} color={COLORS.primary} />
                  <Text style={styles.encouragementText}>
                    {attemptCount === 1 
                      ? "Your experience is incredibly valuable"
                      : attemptCount <= 3
                      ? `${attemptCount} attempts show real determination`
                      : `${attemptCount} attempts prove you never give up`
                    }
                  </Text>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={18} color={COLORS.textSecondary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => handleResponse(hasTriedBefore === true)}
            style={[
              styles.continueButton, 
              !canContinue() && styles.continueButtonDisabled
            ]}
            disabled={!canContinue()}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.continueButtonText,
              !canContinue() && styles.continueButtonTextDisabled
            ]}>
              Continue
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={18} 
              color={!canContinue() ? COLORS.textMuted : COLORS.text} 
            />
          </TouchableOpacity>
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl * 1.5,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl * 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  header: {
    marginBottom: SPACING.xl * 1.5,
    alignItems: 'center',
  },
  title: {
    fontSize: FONTS['2xl'],
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '400',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  optionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  optionCardSelected: {
    borderColor: 'rgba(139, 92, 246, 0.3)',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  optionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  optionIconContainerSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  optionLabel: {
    fontSize: FONTS.base,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: COLORS.text,
  },
  optionDescription: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  optionDescriptionSelected: {
    color: COLORS.textSecondary,
  },
  expandedContent: {
    flex: 1,
  },
  counterSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  counterLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    fontWeight: '400',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  counterButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  counterValue: {
    fontSize: FONTS['2xl'],
    fontWeight: '300',
    color: COLORS.text,
    minWidth: 40,
    textAlign: 'center',
  },
  durationSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  durationGrid: {
    gap: SPACING.sm,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  durationCard: {
    flex: 1,
    height: 48,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationCardSelected: {
    borderColor: 'rgba(139, 92, 246, 0.3)',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  durationText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
  },
  durationTextSelected: {
    color: COLORS.text,
    fontWeight: '500',
  },
  encouragementBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  encouragementText: {
    fontSize: FONTS.sm,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '400',
    flex: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl * 1.5,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    marginLeft: -SPACING.sm,
  },
  backButtonText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    fontWeight: '400',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  continueButtonText: {
    fontSize: FONTS.base,
    fontWeight: '500',
    color: COLORS.text,
  },
  continueButtonTextDisabled: {
    color: COLORS.textMuted,
  },
});

export default PastAttemptsStep; 