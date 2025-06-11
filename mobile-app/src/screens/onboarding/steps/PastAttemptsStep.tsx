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
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[COLORS.accent, '#EC4899']}
            style={[styles.progressFill, { width: '62.5%' }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <Text style={styles.progressText}>Step 6 of 9</Text>
      </View>

      {/* Content - No ScrollView! */}
      <View style={styles.content}>
        {/* Compact Header */}
        <View style={styles.headerSection}>
          <Text style={styles.stepTitle}>Have you tried quitting before?</Text>
          <Text style={styles.stepSubtitle}>Every attempt teaches valuable lessons</Text>
        </View>

        {/* Toggle Card */}
        <View 
          style={[
            styles.toggleCard,
            { backgroundColor: hasTriedBefore ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.05)' }
          ]}
        >
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>
              {hasTriedBefore ? "Yes, I have experience" : "No, this is my first time"}
            </Text>
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
                        outputRange: [2, 22],
                      }),
                    }],
                  },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {hasTriedBefore && (
          <Animated.View
            style={[
              styles.expandedContent,
              {
                opacity: toggleAnim,
              }
            ]}
          >
            {/* Compact Counter with inline encouragement */}
            <View style={styles.counterSection}>
              <View style={styles.counterLeft}>
                <Text style={styles.counterLabel}>Quit attempts</Text>
                <View style={styles.counterControls}>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setAttemptCount(Math.max(1, attemptCount - 1))}
                  >
                    <Ionicons name="remove" size={18} color={COLORS.text} />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{attemptCount}</Text>
                  <TouchableOpacity
                    style={styles.counterButton}
                    onPress={() => setAttemptCount(attemptCount + 1)}
                  >
                    <Ionicons name="add" size={18} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Inline encouragement */}
              <View style={styles.encouragementInline}>
                <Ionicons name="heart" size={14} color={COLORS.accent} />
                <Text style={styles.encouragementText} numberOfLines={2}>
                  {attemptCount === 1 
                    ? "Great start!"
                    : attemptCount <= 3
                    ? `${attemptCount} attempts show determination!`
                    : `${attemptCount} attempts = persistence!`
                  }
                </Text>
              </View>
            </View>

            {/* Duration Section */}
            <View style={styles.durationSection}>
              <Text style={styles.sectionTitle}>Longest quit duration</Text>
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
              <Text style={styles.sectionTitle}>Methods tried</Text>
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
                        size={18} 
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
      </View>

      {/* Bottom Navigation - Fixed at bottom */}
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
                ? [COLORS.accent, '#EC4899']
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  toggleCard: {
    padding: SPACING.md,
    borderRadius: 14,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  toggleSwitch: {
    width: 48,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 2,
    marginLeft: SPACING.md,
  },
  toggleSwitchActive: {
    backgroundColor: COLORS.accent + '40',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  expandedContent: {
    flex: 1,
  },
  counterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: SPACING.md,
  },
  counterLeft: {
    flexDirection: 'column',
  },
  counterLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    minWidth: 24,
    textAlign: 'center',
  },
  encouragementInline: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: SPACING.md,
    paddingLeft: SPACING.md,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
  },
  encouragementText: {
    fontSize: 12,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
  },
  durationSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  durationCard: {
    width: '31.5%',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationCardSelected: {
    backgroundColor: COLORS.accent + '15',
    borderColor: COLORS.accent + '40',
  },
  durationText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  durationTextSelected: {
    color: COLORS.accent,
  },
  methodsSection: {
    marginBottom: SPACING.sm,
  },
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  methodCard: {
    width: '31.5%',
    padding: SPACING.xs,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
  },
  methodCardSelected: {
    backgroundColor: COLORS.accent + '15',
    borderColor: COLORS.accent + '40',
  },
  methodIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  methodText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 11,
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
    paddingTop: SPACING.md,
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
    shadowColor: COLORS.accent,
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