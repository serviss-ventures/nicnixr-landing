import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const QUIT_METHODS = [
  { id: 'cold_turkey', label: 'Cold Turkey', icon: 'flash-outline', color: '#FF6B6B' },
  { id: 'gradual', label: 'Gradual Reduction', icon: 'trending-down-outline', color: '#4ECDC4' },
  { id: 'replacement', label: 'Nicotine Replacement (Patches/Gum)', icon: 'medical-outline', color: '#45B7D1' },
  { id: 'medication', label: 'Prescription Meds', icon: 'medkit-outline', color: '#9B59B6' },
  { id: 'vaping', label: 'Switched to Vaping', icon: 'cloud-outline', color: '#95A5A6' },
  { id: 'other', label: 'Other Methods', icon: 'options-outline', color: '#F39C12' },
];

const QUIT_DURATIONS = [
  { id: 'hours', label: 'A few hours' },
  { id: 'days', label: '1-3 days' },
  { id: 'week', label: 'About a week' },
  { id: 'weeks', label: '2-4 weeks' },
  { id: 'months', label: '1-6 months' },
  { id: 'long', label: '6+ months' },
];

const PastAttemptsStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);

  // State
  const [hasTriedBefore, setHasTriedBefore] = useState<boolean>(stepData.hasTriedQuittingBefore || false);
  const [attemptCount, setAttemptCount] = useState<number>(stepData.previousAttempts || 1);
  const [selectedMethods, setSelectedMethods] = useState<string[]>(stepData.whatWorkedBefore || []);
  const [longestQuitPeriod, setLongestQuitPeriod] = useState<string>(stepData.longestQuitPeriod || '');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const toggleAnim = useRef(new Animated.Value(0)).current;

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animate toggle
  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: hasTriedBefore ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [hasTriedBefore]);

  const handleMethodToggle = (methodId: string) => {
    setSelectedMethods(prev => 
      prev.includes(methodId) 
        ? prev.filter(id => id !== methodId)
        : [...prev, methodId]
    );
  };

  const handleContinue = async () => {
    if (hasTriedBefore && (!longestQuitPeriod || selectedMethods.length === 0)) {
      return;
    }

    const attemptsData = {
      hasTriedQuittingBefore: hasTriedBefore,
      previousAttempts: hasTriedBefore ? attemptCount : 0,
      whatWorkedBefore: hasTriedBefore ? selectedMethods : [],
      longestQuitPeriod: hasTriedBefore ? longestQuitPeriod : '',
    };

    dispatch(updateStepData(attemptsData));
    await dispatch(saveOnboardingProgress(attemptsData));
    dispatch(nextStep());
  };

  const handleBack = () => {
    dispatch(previousStep());
  };

  const canContinue = () => {
    if (!hasTriedBefore) return true;
    return longestQuitPeriod && selectedMethods.length > 0;
  };

  const getEncouragement = () => {
    if (!hasTriedBefore) return '';
    
    if (attemptCount === 1) {
      return "Great! Your experience is incredibly valuable. Let's build on what you've learned.";
    } else if (attemptCount <= 3) {
      return `${attemptCount} attempts show real determination. Each one taught you something important.`;
    } else {
      return `${attemptCount} attempts prove you never give up. Your persistence will pay off!`;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Progress Bar */}
      <Animated.View 
        style={[
          styles.progressContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={[styles.progressFill, { width: '62.5%' }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
                      <Text style={styles.progressText}>Step 6 of 9</Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.stepTitle}>Past Experience</Text>
          <Text style={styles.stepSubtitle}>Every attempt teaches valuable lessons</Text>
        </Animated.View>

        {/* Toggle Card */}
        <Animated.View
          style={[
            styles.toggleCard,
            {
              opacity: fadeAnim,
              backgroundColor: hasTriedBefore ? 'rgba(52, 211, 153, 0.08)' : 'rgba(255,255,255,0.05)',
            },
          ]}
        >
          <View style={styles.toggleHeader}>
            <View style={styles.toggleTextWrapper}>
              <Text style={styles.toggleQuestion}>Have you tried quitting before?</Text>
              {hasTriedBefore && (
                <Animated.Text 
                  style={[
                    styles.toggleStatus,
                    {
                      opacity: toggleAnim,
                    },
                  ]}
                >
                  Yes, I have experience
                </Animated.Text>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.toggleSwitch,
                hasTriedBefore && styles.toggleSwitchActive
              ]}
              onPress={() => setHasTriedBefore(!hasTriedBefore)}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.toggleThumb,
                  {
                    transform: [{
                      translateX: toggleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [2, 26],
                      }),
                    }],
                  },
                ]}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {hasTriedBefore && (
          <Animated.View
            style={{
              opacity: toggleAnim,
              transform: [{
                translateY: toggleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              }],
            }}
          >
            {/* Encouragement Card */}
            {getEncouragement() && (
              <LinearGradient
                colors={['rgba(52, 211, 153, 0.1)', 'rgba(110, 231, 183, 0.05)']}
                style={styles.encouragementCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="heart-outline" size={24} color={COLORS.primary} style={styles.encouragementIcon} />
                <Text style={styles.encouragementText}>{getEncouragement()}</Text>
              </LinearGradient>
            )}

            {/* Attempt Counter */}
            <View style={styles.counterCard}>
              <Text style={styles.counterLabel}>Number of quit attempts</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setAttemptCount(Math.max(1, attemptCount - 1))}
                >
                  <Ionicons name="remove" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <View style={styles.counterValueContainer}>
                  <Text style={styles.counterValue}>{attemptCount}</Text>
                  <Text style={styles.counterHint}>attempts</Text>
                </View>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => setAttemptCount(attemptCount + 1)}
                >
                  <Ionicons name="add" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Duration Section */}
            <View style={styles.durationSection}>
              <Text style={styles.sectionTitle}>Longest Quit Duration</Text>
              <Text style={styles.sectionHint}>How long did you stay nicotine-free?</Text>
              <View style={styles.durationGrid}>
                {QUIT_DURATIONS.map((duration) => (
                  <TouchableOpacity
                    key={duration.id}
                    style={[
                      styles.durationCard,
                      longestQuitPeriod === duration.id && styles.durationCardSelected
                    ]}
                    onPress={() => setLongestQuitPeriod(duration.id)}
                  >
                    <Text style={[
                      styles.durationText,
                      longestQuitPeriod === duration.id && styles.durationTextSelected
                    ]}>
                      {duration.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Methods Section */}
            <View style={styles.methodsSection}>
              <Text style={styles.sectionTitle}>Methods You've Tried</Text>
              <Text style={styles.sectionHint}>Select all that apply</Text>
              <View style={styles.methodsGrid}>
                {QUIT_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.methodCard,
                      selectedMethods.includes(method.id) && styles.methodCardSelected
                    ]}
                    onPress={() => handleMethodToggle(method.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.methodIconContainer,
                      selectedMethods.includes(method.id) && { backgroundColor: method.color + '20' }
                    ]}>
                      <Ionicons 
                        name={method.icon} 
                        size={24} 
                        color={selectedMethods.includes(method.id) ? method.color : COLORS.textSecondary} 
                      />
                    </View>
                    <Text style={[
                      styles.methodText,
                      selectedMethods.includes(method.id) && { color: COLORS.text }
                    ]} numberOfLines={2}>
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.continueButton,
            !canContinue() && styles.continueButtonDisabled
          ]} 
          onPress={handleContinue}
          disabled={!canContinue()}
        >
          <LinearGradient
            colors={
              canContinue()
                ? [COLORS.primary, COLORS.secondary]
                : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
            }
            style={styles.continueButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
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
              color={canContinue() ? '#FFFFFF' : COLORS.textMuted} 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.lg,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  stepSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  toggleCard: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: 24,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTextWrapper: {
    flex: 1,
  },
  toggleQuestion: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  toggleStatus: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  toggleSwitch: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: COLORS.primary + '40',
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  encouragementCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  encouragementIcon: {
    marginRight: SPACING.md,
  },
  encouragementText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    fontWeight: '500',
  },
  counterCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  counterLabel: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    fontWeight: '600',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValueContainer: {
    alignItems: 'center',
    marginHorizontal: SPACING['2xl'],
  },
  counterValue: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.text,
  },
  counterHint: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: -4,
  },
  durationSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  durationCard: {
    width: '31%',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    minHeight: 56,
    justifyContent: 'center',
  },
  durationCardSelected: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary + '40',
  },
  durationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  durationTextSelected: {
    color: COLORS.primary,
  },
  methodsSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  methodCard: {
    width: '31%',
    padding: SPACING.md,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    minHeight: 100,
    justifyContent: 'center',
  },
  methodCardSelected: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary + '40',
  },
  methodIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  methodText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 14,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 20, 30, 0.98)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: Math.max(SPACING.xl, 34),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  continueButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl + 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: SPACING.sm,
  },
  continueButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  continueButtonTextDisabled: {
    color: COLORS.textMuted,
  },
});

export default PastAttemptsStep; 