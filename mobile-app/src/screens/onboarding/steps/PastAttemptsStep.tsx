import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  SafeAreaView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

  const handleContinue = async () => {
    if (hasTriedBefore === null) return;
    if (hasTriedBefore && !longestQuitPeriod) return;

    const attemptsData = {
      hasTriedQuittingBefore: hasTriedBefore,
      previousAttempts: hasTriedBefore ? attemptCount : 0,
      longestQuitPeriod: hasTriedBefore ? longestQuitPeriod : '',
      whatWorkedBefore: [], // Simplified - removed methods selection
    };

    dispatch(updateStepData(attemptsData));
    await dispatch(saveOnboardingProgress(attemptsData));
    dispatch(nextStep());
  };

  const handleBack = () => {
    dispatch(previousStep());
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
              onPress={() => setHasTriedBefore(false)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.optionIconContainer,
                hasTriedBefore === false && styles.optionIconContainerSelected
              ]}>
                <Ionicons 
                  name="sparkles" 
                  size={28} 
                  color={hasTriedBefore === false ? COLORS.primary : COLORS.textSecondary} 
                />
              </View>
              <Text style={[
                styles.optionLabel,
                hasTriedBefore === false && styles.optionLabelSelected
              ]}>
                No, first time
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
              onPress={() => setHasTriedBefore(true)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.optionIconContainer,
                hasTriedBefore === true && styles.optionIconContainerSelected
              ]}>
                <Ionicons 
                  name="refresh" 
                  size={28} 
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
                    onPress={() => setAttemptCount(Math.max(1, attemptCount - 1))}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{attemptCount}</Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setAttemptCount(attemptCount + 1)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={20} color={COLORS.textSecondary} />
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
                        onPress={() => setLongestQuitPeriod(duration.id)}
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
                        onPress={() => setLongestQuitPeriod(duration.id)}
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
                <Ionicons name="heart" size={16} color={COLORS.primary} />
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

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleContinue}
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
              size={20} 
              color={!canContinue() ? COLORS.textMuted : '#FFFFFF'} 
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
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '400',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  optionCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionIconContainerSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: COLORS.text,
  },
  optionDescription: {
    fontSize: 13,
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
    marginBottom: 24,
  },
  counterLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  counterValue: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 40,
    textAlign: 'center',
  },
  durationSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  durationGrid: {
    gap: 8,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  durationCard: {
    flex: 1,
    height: 52,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  durationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    numberOfLines: 1,
  },
  durationTextSelected: {
    color: COLORS.text,
  },
  encouragementBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  encouragementText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 32,
    paddingTop: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginLeft: -12,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  continueButtonTextDisabled: {
    color: COLORS.textMuted,
  },
});

export default PastAttemptsStep; 