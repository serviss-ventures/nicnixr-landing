import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  TextInput,
  Switch,
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

const { width, height } = Dimensions.get('window');

interface QuitMethod {
  id: string;
  label: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
}

interface Challenge {
  id: string;
  label: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
}

interface RelapseTrigger {
  id: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
}

const QUIT_METHODS: QuitMethod[] = [
  {
    id: 'cold_turkey',
    label: 'Cold Turkey',
    description: 'Stopped completely all at once',
    iconName: 'flash-outline',
    iconColor: '#FF6B6B',
    iconBg: 'rgba(255, 107, 107, 0.15)',
  },
  {
    id: 'gradual_reduction',
    label: 'Gradual Reduction',
    description: 'Slowly cut down over time',
    iconName: 'trending-down-outline',
    iconColor: '#4ECDC4',
    iconBg: 'rgba(78, 205, 196, 0.15)',
  },
  {
    id: 'nicotine_replacement',
    label: 'Nicotine Replacement',
    description: 'Patches, gum, lozenges',
    iconName: 'medical-outline',
    iconColor: '#45B7D1',
    iconBg: 'rgba(69, 183, 209, 0.15)',
  },
  {
    id: 'prescription_medication',
    label: 'Prescription Meds',
    description: 'Chantix, Zyban, etc.',
    iconColor: '#9B59B6',
    iconBg: 'rgba(155, 89, 182, 0.15)',
    iconName: 'medical-outline',
  },
  {
    id: 'vaping_transition',
    label: 'Switched to Vaping',
    description: 'Used vaping as transition',
    iconName: 'cloud-outline',
    iconColor: '#95A5A6',
    iconBg: 'rgba(149, 165, 166, 0.15)',
  },
  {
    id: 'alternative_methods',
    label: 'Alternative Methods',
    description: 'Hypnosis, acupuncture, etc.',
    iconName: 'flower-outline',
    iconColor: '#F39C12',
    iconBg: 'rgba(243, 156, 18, 0.15)',
  },
  {
    id: 'mobile_apps',
    label: 'Mobile Apps',
    description: 'Other quit smoking apps',
    iconName: 'phone-portrait-outline',
    iconColor: '#E74C3C',
    iconBg: 'rgba(231, 76, 60, 0.15)',
  },
  {
    id: 'support_groups',
    label: 'Support Groups',
    description: 'In-person or online groups',
    iconName: 'people-outline',
    iconColor: '#27AE60',
    iconBg: 'rgba(39, 174, 96, 0.15)',
  }
];

const QUIT_CHALLENGES: Challenge[] = [
  {
    id: 'withdrawal_symptoms',
    label: 'Withdrawal Symptoms',
    description: 'Cravings, irritability, anxiety',
    iconName: 'warning-outline',
    iconColor: '#FF6B6B',
    iconBg: 'rgba(255, 107, 107, 0.15)',
  },
  {
    id: 'stress_triggers',
    label: 'Stress & Triggers',
    description: 'High stress situations',
    iconName: 'flash-outline',
    iconColor: '#F39C12',
    iconBg: 'rgba(243, 156, 18, 0.15)',
  },
  {
    id: 'social_pressure',
    label: 'Social Situations',
    description: 'Friends, parties, social pressure',
    iconName: 'people-outline',
    iconColor: '#9B59B6',
    iconBg: 'rgba(155, 89, 182, 0.15)',
  },
  {
    id: 'habit_replacement',
    label: 'Breaking Habits',
    description: 'Hard to replace the routine',
    iconName: 'sync-outline',
    iconColor: '#45B7D1',
    iconBg: 'rgba(69, 183, 209, 0.15)',
  },
  {
    id: 'lack_of_motivation',
    label: 'Lost Motivation',
    description: 'Forgot why I wanted to quit',
    iconName: 'heart-dislike-outline',
    iconColor: '#E74C3C',
    iconBg: 'rgba(231, 76, 60, 0.15)',
  },
  {
    id: 'weight_gain_fear',
    label: 'Weight Concerns',
    description: 'Worried about weight gain',
    iconName: 'fitness-outline',
    iconColor: '#27AE60',
    iconBg: 'rgba(39, 174, 96, 0.15)',
  },
  {
    id: 'boredom',
    label: 'Boredom',
    description: 'Nothing else to do',
    iconName: 'time-outline',
    iconColor: '#95A5A6',
    iconBg: 'rgba(149, 165, 166, 0.15)',
  },
  {
    id: 'life_events',
    label: 'Life Events',
    description: 'Major stress or life changes',
    iconName: 'calendar-outline',
    iconColor: '#34495E',
    iconBg: 'rgba(52, 73, 94, 0.15)',
  }
];

const QUIT_DURATION_OPTIONS = [
  { id: 'hours', label: 'A few hours', value: 'hours' },
  { id: 'days', label: '1-3 days', value: 'days' },
  { id: 'week', label: 'About a week', value: 'week' },
  { id: 'weeks', label: '2-4 weeks', value: 'weeks' },
  { id: 'months', label: '1-6 months', value: 'months' },
  { id: 'long_term', label: '6+ months', value: 'long_term' },
];

const RELAPSE_TRIGGERS: RelapseTrigger[] = [
  { id: 'morning', label: 'Morning routine', iconName: 'sunny-outline', color: '#FFD93D' },
  { id: 'stress', label: 'Stressful moment', iconName: 'thunderstorm-outline', color: '#FF6B6B' },
  { id: 'social', label: 'Social event', iconName: 'people-outline', color: '#9B59B6' },
  { id: 'alcohol', label: 'While drinking', iconName: 'wine-outline', color: '#E74C3C' },
  { id: 'driving', label: 'While driving', iconName: 'car-outline', color: '#3498DB' },
  { id: 'break', label: 'Work break', iconName: 'time-outline', color: '#95A5A6' },
  { id: 'meal', label: 'After meals', iconName: 'restaurant-outline', color: '#27AE60' },
  { id: 'night', label: 'Late at night', iconName: 'moon-outline', color: '#34495E' },
];

const INSIGHTS_QUESTIONS = [
  {
    id: 'what_helped',
    question: 'What helped you the most during your longest quit?',
    placeholder: 'e.g., Exercise, meditation, support from friends...',
    iconName: 'heart-outline' as keyof typeof Ionicons.glyphMap,
    color: '#10B981',
  },
  {
    id: 'warning_signs',
    question: 'What warning signs did you notice before relapsing?',
    placeholder: 'e.g., Increased stress, skipping routines, isolation...',
    iconName: 'alert-outline' as keyof typeof Ionicons.glyphMap,
    color: '#F59E0B',
  },
  {
    id: 'lesson_learned',
    question: 'What\'s the most important lesson from your experience?',
    placeholder: 'Share any insight that might help your future self...',
    iconName: 'bulb-outline' as keyof typeof Ionicons.glyphMap,
    color: '#6366F1',
  },
];

const PastAttemptsStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);
  const scrollViewRef = useRef<ScrollView>(null);

  // Core state
  const [hasTriedBefore, setHasTriedBefore] = useState<boolean>(stepData.hasTriedQuittingBefore || false);
  const [attemptCount, setAttemptCount] = useState<number>(stepData.previousAttempts || 1);
  const [selectedMethods, setSelectedMethods] = useState<string[]>(stepData.whatWorkedBefore || []);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(stepData.whatMadeItDifficult || []);
  const [longestQuitPeriod, setLongestQuitPeriod] = useState<string>(stepData.longestQuitPeriod || '');
  const [selectedRelapseTrigger, setSelectedRelapseTrigger] = useState<string>(stepData.relapseTrigger || '');
  
  // New insight fields for AI
  const [insights, setInsights] = useState({
    what_helped: stepData.whatHelped || '',
    warning_signs: stepData.warningSignsBefore || '',
    lesson_learned: stepData.lessonLearned || '',
  });

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    methods: true,
    challenges: false,
    triggers: false,
    insights: false,
  });

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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleMethodToggle = (methodId: string) => {
    setSelectedMethods(prev => 
      prev.includes(methodId) 
        ? prev.filter(id => id !== methodId)
        : [...prev, methodId]
    );
  };

  const handleChallengeToggle = (challengeId: string) => {
    setSelectedChallenges(prev => 
      prev.includes(challengeId) 
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  const handleTriggerSelect = (triggerId: string) => {
    setSelectedRelapseTrigger(triggerId);
  };

  const handleInsightChange = (id: string, value: string) => {
    setInsights(prev => ({ ...prev, [id]: value }));
  };

  const handleContinue = async () => {
    if (hasTriedBefore) {
      const hasBasicInfo = attemptCount > 0 && longestQuitPeriod;
      const hasMethodInfo = selectedMethods.length > 0;
      const hasChallengeInfo = selectedChallenges.length > 0;
      
      if (!hasBasicInfo || !hasMethodInfo || !hasChallengeInfo) {
        // Open the first incomplete section
        if (!hasMethodInfo) {
          setExpandedSections(prev => ({ ...prev, methods: true }));
        } else if (!hasChallengeInfo) {
          setExpandedSections(prev => ({ ...prev, challenges: true }));
        }
        return;
      }
    }

    const attemptsData = {
      hasTriedQuittingBefore: hasTriedBefore,
      previousAttempts: hasTriedBefore ? attemptCount : 0,
      whatWorkedBefore: hasTriedBefore ? selectedMethods : [],
      whatMadeItDifficult: hasTriedBefore ? selectedChallenges : [],
      longestQuitPeriod: hasTriedBefore ? longestQuitPeriod : '',
      relapseTrigger: hasTriedBefore ? selectedRelapseTrigger : '',
      whatHelped: hasTriedBefore ? insights.what_helped : '',
      warningSignsBefore: hasTriedBefore ? insights.warning_signs : '',
      lessonLearned: hasTriedBefore ? insights.lesson_learned : '',
    };

    dispatch(updateStepData(attemptsData));
    await dispatch(saveOnboardingProgress(attemptsData));
    dispatch(nextStep());
  };

  const handleBack = () => {
    dispatch(previousStep());
  };

  const isBasicInfoComplete = () => {
    if (!hasTriedBefore) return true;
    return attemptCount > 0 && longestQuitPeriod !== '';
  };

  const isMethodsComplete = () => {
    if (!hasTriedBefore) return true;
    return selectedMethods.length > 0;
  };

  const isChallengesComplete = () => {
    if (!hasTriedBefore) return true;
    return selectedChallenges.length > 0;
  };

  const canContinue = () => {
    if (!hasTriedBefore) return true;
    return isBasicInfoComplete() && isMethodsComplete() && isChallengesComplete();
  };

  const getPersonalizedEncouragement = (duration: string): string => {
    switch (duration) {
      case 'hours':
        return '💪 Those first hours are the hardest - you\'ve already proven you can start!';
      case 'days':
        return '🌟 Making it through multiple days shows real determination!';
      case 'week':
        return '🏆 A full week is incredible! You conquered the hardest withdrawal period!';
      case 'weeks':
        return '🚀 Weeks of freedom proves you can break the habit!';
      case 'months':
        return '👑 Months clean is amazing! You have all the skills needed!';
      case 'long_term':
        return '🌈 You\'re a quit champion! Your experience shows you can do this!';
      default:
        return '💝 Every moment of freedom counts!';
    }
  };

  // NEW COMPACT RETURN STATEMENT
  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
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
        <Text style={styles.progressText}>Step 5 of 8</Text>
      </Animated.View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Compact Header */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.mainTitle}>Previous Experience</Text>
          <Text style={styles.mainSubtitle}>
            Every attempt teaches us something valuable
          </Text>
        </Animated.View>

        {/* Toggle Card */}
        <Animated.View
          style={[
            styles.toggleCard,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity 
            style={styles.toggleTouchable}
            onPress={() => setHasTriedBefore(!hasTriedBefore)}
            activeOpacity={0.8}
          >
            <View style={styles.toggleContent}>
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleQuestion}>Have you tried quitting before?</Text>
                <Text style={styles.toggleAnswer}>
                  {hasTriedBefore ? "Yes, I have" : "No, first time"}
                </Text>
              </View>
              <View style={[
                styles.toggleButton,
                hasTriedBefore && styles.toggleButtonActive
              ]}>
                <Ionicons 
                  name={hasTriedBefore ? "checkmark" : "close"} 
                  size={20} 
                  color="#FFFFFF"
                />
              </View>
            </View>
          </TouchableOpacity>
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
            {/* Compact Info Section */}
            <View style={styles.compactCard}>
              <View style={styles.compactRow}>
                <View style={styles.compactItem}>
                  <Text style={styles.compactLabel}>Number of attempts</Text>
                  <View style={styles.counterRow}>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => setAttemptCount(Math.max(1, attemptCount - 1))}
                    >
                      <Ionicons name="remove" size={16} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.counterText}>{attemptCount}</Text>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => setAttemptCount(attemptCount + 1)}
                    >
                      <Ionicons name="add" size={16} color={COLORS.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.compactItem}>
                  <Text style={styles.compactLabel}>Longest quit</Text>
                  <TouchableOpacity
                    style={styles.durationSelector}
                    onPress={() => {/* Could open a modal picker */}}
                  >
                    <Text style={styles.durationText}>
                      {longestQuitPeriod 
                        ? QUIT_DURATION_OPTIONS.find(o => o.value === longestQuitPeriod)?.label 
                        : "Select duration"}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Duration Pills - Horizontal Scroll */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.pillsContainer}
              contentContainerStyle={styles.pillsContent}
            >
              {QUIT_DURATION_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.pill,
                    longestQuitPeriod === option.value && styles.pillSelected
                  ]}
                  onPress={() => setLongestQuitPeriod(option.value)}
                >
                  <Text style={[
                    styles.pillText,
                    longestQuitPeriod === option.value && styles.pillTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {longestQuitPeriod && (
              <Animated.View style={styles.encouragementStrip}>
                <Text style={styles.encouragementMini}>
                  {getPersonalizedEncouragement(longestQuitPeriod).split(' ').slice(0, 6).join(' ')}...
                </Text>
              </Animated.View>
            )}

            {/* Methods - Expandable */}
            <TouchableOpacity
              style={styles.expandableCard}
              onPress={() => toggleSection('methods')}
              activeOpacity={0.8}
            >
              <View style={styles.expandableHeader}>
                <View style={styles.expandableTitleRow}>
                  <Text style={styles.expandableTitle}>Methods tried</Text>
                  {selectedMethods.length > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{selectedMethods.length}</Text>
                    </View>
                  )}
                  {isMethodsComplete() && (
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                  )}
                </View>
                <Ionicons 
                  name={expandedSections.methods ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={COLORS.textSecondary} 
                />
              </View>
            </TouchableOpacity>

            {expandedSections.methods && (
              <View style={styles.gridContainer}>
                {QUIT_METHODS.slice(0, 4).map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.gridItem,
                      selectedMethods.includes(method.id) && styles.gridItemSelected
                    ]}
                    onPress={() => handleMethodToggle(method.id)}
                  >
                    <Ionicons 
                      name={method.iconName} 
                      size={24} 
                      color={selectedMethods.includes(method.id) ? COLORS.primary : COLORS.textSecondary} 
                    />
                    <Text style={[
                      styles.gridItemText,
                      selectedMethods.includes(method.id) && styles.gridItemTextSelected
                    ]} numberOfLines={2}>
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
                {QUIT_METHODS.length > 4 && (
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={() => {/* Could expand to show all */}}
                  >
                    <Text style={styles.showMoreText}>+{QUIT_METHODS.length - 4} more</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Challenges - Expandable */}
            <TouchableOpacity
              style={styles.expandableCard}
              onPress={() => toggleSection('challenges')}
              activeOpacity={0.8}
            >
              <View style={styles.expandableHeader}>
                <View style={styles.expandableTitleRow}>
                  <Text style={styles.expandableTitle}>Challenges faced</Text>
                  {selectedChallenges.length > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{selectedChallenges.length}</Text>
                    </View>
                  )}
                  {isChallengesComplete() && (
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                  )}
                </View>
                <Ionicons 
                  name={expandedSections.challenges ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={COLORS.textSecondary} 
                />
              </View>
            </TouchableOpacity>

            {expandedSections.challenges && (
              <View style={styles.gridContainer}>
                {QUIT_CHALLENGES.slice(0, 4).map((challenge) => (
                  <TouchableOpacity
                    key={challenge.id}
                    style={[
                      styles.gridItem,
                      selectedChallenges.includes(challenge.id) && styles.gridItemSelected
                    ]}
                    onPress={() => handleChallengeToggle(challenge.id)}
                  >
                    <Ionicons 
                      name={challenge.iconName} 
                      size={24} 
                      color={selectedChallenges.includes(challenge.id) ? COLORS.primary : COLORS.textSecondary} 
                    />
                    <Text style={[
                      styles.gridItemText,
                      selectedChallenges.includes(challenge.id) && styles.gridItemTextSelected
                    ]} numberOfLines={2}>
                      {challenge.label}
                    </Text>
                  </TouchableOpacity>
                ))}
                {QUIT_CHALLENGES.length > 4 && (
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={() => {/* Could expand to show all */}}
                  >
                    <Text style={styles.showMoreText}>+{QUIT_CHALLENGES.length - 4} more</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Quick Insight (Optional) */}
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Ionicons name="bulb-outline" size={20} color={COLORS.primary} />
                <Text style={styles.insightTitle}>Quick insight (optional)</Text>
              </View>
              <TextInput
                style={styles.insightInput}
                placeholder="One key lesson from your experience..."
                placeholderTextColor={COLORS.textMuted}
                value={insights.lesson_learned}
                onChangeText={(text) => handleInsightChange('lesson_learned', text)}
                multiline
                maxLength={100}
              />
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Compact Bottom Navigation */}
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
    </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  toggleCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toggleTouchable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  toggleAnswer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary + '20',
  },
  compactCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactItem: {
    flex: 1,
    alignItems: 'center',
  },
  compactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: SPACING.lg,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: SPACING.lg,
  },
  durationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  durationText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  pillsContainer: {
    marginBottom: SPACING.lg,
    marginHorizontal: SPACING.lg,
  },
  pillsContent: {
    paddingRight: SPACING.lg,
  },
  pill: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: SPACING.sm,
  },
  pillSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  pillTextSelected: {
    color: COLORS.primary,
  },
  encouragementStrip: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  encouragementMini: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  expandableCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  expandableTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expandableTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  countBadge: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: SPACING.sm,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    paddingTop: 0,
    gap: SPACING.sm,
  },
  gridItem: {
    width: (width - SPACING.lg * 2 - SPACING.md * 2 - SPACING.sm * 3) / 4,
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  gridItemSelected: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary + '40',
  },
  gridItemText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
    fontWeight: '600',
  },
  gridItemTextSelected: {
    color: COLORS.primary,
  },
  showMoreButton: {
    flex: 1,
    padding: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  showMoreText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  insightCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  insightQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },
  insightInput: {
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 20, 30, 0.9)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: Math.max(SPACING.xl, 30),
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