import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  TextInput,
  Switch
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

const PastAttemptsStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);

  const [hasTriedBefore, setHasTriedBefore] = useState<boolean>(stepData.hasTriedQuittingBefore || false);
  const [attemptCount, setAttemptCount] = useState<number>(stepData.previousAttempts || 0);
  const [selectedMethods, setSelectedMethods] = useState<string[]>(stepData.whatWorkedBefore || []);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>(stepData.whatMadeItDifficult || []);
  const [longestQuitPeriod, setLongestQuitPeriod] = useState<string>(stepData.longestQuitPeriod || '');
  const [currentSection, setCurrentSection] = useState<'attempts' | 'methods' | 'challenges'>('attempts');

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

  const handleContinue = async () => {
    // If user has tried before, validate that they've completed the methods and challenges sections
    if (hasTriedBefore) {
      // Validate methods section
      if (selectedMethods.length === 0) {
        Alert.alert(
          'Help us understand your experience',
          'Please tell us what methods you tried before. This helps us create a better plan that builds on your experience.'
        );
        setCurrentSection('methods');
        return;
      }

      // Validate challenges section
      if (selectedChallenges.length === 0) {
        Alert.alert(
          'What made it challenging?',
          'Understanding what made quitting difficult before helps us prepare better strategies this time.'
        );
        setCurrentSection('challenges');
        return;
      }

      // Validate longest quit period
      if (!longestQuitPeriod) {
        Alert.alert(
          'One more detail needed',
          'Please let us know how long you were able to stay quit. This helps us understand your progress patterns.'
        );
        setCurrentSection('attempts');
        return;
      }
    }

    const attemptsData = {
      hasTriedQuittingBefore: hasTriedBefore,
      previousAttempts: hasTriedBefore ? Math.max(1, attemptCount) : 0,
      whatWorkedBefore: hasTriedBefore ? selectedMethods : [],
      whatMadeItDifficult: hasTriedBefore ? selectedChallenges : [],
      longestQuitPeriod: hasTriedBefore ? longestQuitPeriod : '',
    };

    dispatch(updateStepData(attemptsData));
    await dispatch(saveOnboardingProgress(attemptsData));
    dispatch(nextStep());
  };

  const handleBack = () => {
    dispatch(previousStep());
  };

  // Helper functions to check completion status
  const isAttemptsComplete = () => {
    if (!hasTriedBefore) return true; // If they haven't tried before, this section is complete
    return attemptCount > 0 && longestQuitPeriod !== '';
  };

  const isMethodsComplete = () => {
    if (!hasTriedBefore) return true; // Not applicable if they haven't tried before
    return selectedMethods.length > 0;
  };

  const isChallengesComplete = () => {
    if (!hasTriedBefore) return true; // Not applicable if they haven't tried before
    return selectedChallenges.length > 0;
  };

  const isAllSectionsComplete = () => {
    return isAttemptsComplete() && isMethodsComplete() && isChallengesComplete();
  };

  // Get personalized encouragement based on quit duration
  const getPersonalizedEncouragement = (duration: string): string => {
    switch (duration) {
      case 'hours':
        return '💪 Those first hours are the hardest - you\'ve already proven you can start!';
      case 'days':
        return '🌟 Making it through multiple days shows real determination and willpower!';
      case 'week':
        return '🏆 A full week is incredible! You conquered the hardest physical withdrawal period!';
      case 'weeks':
        return '🚀 Weeks of freedom proves you can break the habit - that\'s serious strength!';
      case 'months':
        return '👑 Months clean is amazing! You have all the skills needed for permanent success!';
      case 'long_term':
        return '🌈 You\'re a quit champion! Your experience shows you can absolutely do this again!';
      default:
        return '💝 Every moment of freedom counts - you\'re stronger than you know!';
    }
  };

  const renderMethodOption = (method: QuitMethod) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.optionCard,
        selectedMethods.includes(method.id) && styles.optionCardSelected
      ]}
      onPress={() => handleMethodToggle(method.id)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          selectedMethods.includes(method.id)
            ? [method.iconColor + '40', method.iconColor + '20']
            : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
        }
        style={styles.optionCardGradient}
      >
        <View style={[styles.optionIcon, { backgroundColor: method.iconBg }]}>
          <Ionicons name={method.iconName} size={24} color={method.iconColor} />
        </View>
        <View style={styles.optionContent}>
          <Text style={[
            styles.optionLabel,
            selectedMethods.includes(method.id) && styles.optionLabelSelected
          ]}>
            {method.label}
          </Text>
          <Text style={styles.optionDescription}>{method.description}</Text>
        </View>
        {selectedMethods.includes(method.id) && (
          <Ionicons name="checkmark-circle" size={24} color={method.iconColor} />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderChallengeOption = (challenge: Challenge) => (
    <TouchableOpacity
      key={challenge.id}
      style={[
        styles.optionCard,
        selectedChallenges.includes(challenge.id) && styles.optionCardSelected
      ]}
      onPress={() => handleChallengeToggle(challenge.id)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          selectedChallenges.includes(challenge.id)
            ? [challenge.iconColor + '40', challenge.iconColor + '20']
            : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
        }
        style={styles.optionCardGradient}
      >
        <View style={[styles.optionIcon, { backgroundColor: challenge.iconBg }]}>
          <Ionicons name={challenge.iconName} size={24} color={challenge.iconColor} />
        </View>
        <View style={styles.optionContent}>
          <Text style={[
            styles.optionLabel,
            selectedChallenges.includes(challenge.id) && styles.optionLabelSelected
          ]}>
            {challenge.label}
          </Text>
          <Text style={styles.optionDescription}>{challenge.description}</Text>
        </View>
        {selectedChallenges.includes(challenge.id) && (
          <Ionicons name="checkmark-circle" size={24} color={challenge.iconColor} />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderAttemptsSection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Your Previous Journey</Text>
      <Text style={styles.sectionSubtitle}>
        Every attempt teaches us something valuable. Your experience helps us create a better plan this time.
      </Text>

      {/* Has Tried Before Toggle */}
      <View style={styles.toggleSection}>
        <View style={styles.toggleHeader}>
          <Text style={styles.toggleLabel}>Have you tried quitting before?</Text>
          <Switch
            value={hasTriedBefore}
            onValueChange={setHasTriedBefore}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.primary + '40' }}
            thumbColor={hasTriedBefore ? COLORS.primary : 'rgba(255,255,255,0.3)'}
          />
        </View>
        <Text style={styles.toggleDescription}>
          {hasTriedBefore 
            ? "Every attempt is progress, not failure. Let's learn from your experience."
            : "That's perfectly fine! We'll make this journey as smooth as possible."
          }
        </Text>
      </View>

      {hasTriedBefore && (
        <>
          {/* Attempt Count */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>How many times have you tried to quit?</Text>
            <View style={styles.numberInputContainer}>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => setAttemptCount(Math.max(1, attemptCount - 1))}
              >
                <Ionicons name="remove" size={20} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.numberDisplay}>{attemptCount}</Text>
              <TouchableOpacity
                style={styles.numberButton}
                onPress={() => setAttemptCount(attemptCount + 1)}
              >
                <Ionicons name="add" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputHint}>
              Remember: Each attempt brought you closer to success
            </Text>
          </View>

          {/* Longest Quit Period */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>What's the longest you've gone without nicotine?</Text>
            <View style={styles.durationGrid}>
              {QUIT_DURATION_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.durationOption,
                    longestQuitPeriod === option.value && styles.durationOptionSelected
                  ]}
                  onPress={() => setLongestQuitPeriod(option.value)}
                >
                  <Text style={[
                    styles.durationOptionText,
                    longestQuitPeriod === option.value && styles.durationOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {longestQuitPeriod && (
              <Text style={styles.encouragementText}>
                {getPersonalizedEncouragement(longestQuitPeriod)}
              </Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderMethodsSection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>What methods did you try?</Text>
      <Text style={styles.sectionSubtitle}>
        Understanding what you've tried helps us avoid repeating the same approach. Select all that apply.
      </Text>

      <View style={styles.optionsGrid}>
        {QUIT_METHODS.map(renderMethodOption)}
      </View>

      {selectedMethods.length > 0 && (
        <View style={styles.insightBox}>
          <Ionicons name="bulb-outline" size={24} color={COLORS.primary} />
          <Text style={styles.insightText}>
            Great! We'll build on what worked and address what didn't. Your experience is valuable data.
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderChallengesSection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>What made it challenging?</Text>
      <Text style={styles.sectionSubtitle}>
        Identifying your specific challenges helps us prepare targeted strategies. No judgment here.
      </Text>

      <View style={styles.optionsGrid}>
        {QUIT_CHALLENGES.map(renderChallengeOption)}
      </View>

      {selectedChallenges.length > 0 && (
        <View style={styles.insightBox}>
          <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.secondary} />
          <Text style={styles.insightText}>
            Perfect! Knowing these challenges means we can prepare specific defenses for each one.
          </Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={[styles.progressFill, { width: '62.5%' }]}
          />
        </View>
        <Text style={styles.progressText}>Step 5 of 8 - Learning from Experience</Text>
      </View>

      {/* Section Navigation */}
      <View style={styles.sectionTabs}>
        <TouchableOpacity
          style={[
            styles.sectionTab,
            currentSection === 'attempts' && styles.sectionTabActive,
            isAttemptsComplete() && styles.sectionTabCompleted
          ]}
          onPress={() => setCurrentSection('attempts')}
        >
          <View style={styles.sectionTabContent}>
            <Text style={[
              styles.sectionTabText,
              currentSection === 'attempts' && styles.sectionTabTextActive
            ]}>
              Attempts
            </Text>
            {isAttemptsComplete() && (
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
            )}
          </View>
        </TouchableOpacity>
        {hasTriedBefore && (
          <>
            <TouchableOpacity
              style={[
                styles.sectionTab,
                currentSection === 'methods' && styles.sectionTabActive,
                isMethodsComplete() && styles.sectionTabCompleted
              ]}
              onPress={() => setCurrentSection('methods')}
            >
              <View style={styles.sectionTabContent}>
                <Text style={[
                  styles.sectionTabText,
                  currentSection === 'methods' && styles.sectionTabTextActive
                ]}>
                  Methods
                </Text>
                {isMethodsComplete() && (
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sectionTab,
                currentSection === 'challenges' && styles.sectionTabActive,
                isChallengesComplete() && styles.sectionTabCompleted
              ]}
              onPress={() => setCurrentSection('challenges')}
            >
              <View style={styles.sectionTabContent}>
                <Text style={[
                  styles.sectionTabText,
                  currentSection === 'challenges' && styles.sectionTabTextActive
                ]}>
                  Challenges
                </Text>
                {isChallengesComplete() && (
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                )}
              </View>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Section Content */}
      <View style={styles.content}>
        {currentSection === 'attempts' && renderAttemptsSection()}
        {currentSection === 'methods' && hasTriedBefore && renderMethodsSection()}
        {currentSection === 'challenges' && hasTriedBefore && renderChallengesSection()}
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.continueButton,
            !isAllSectionsComplete() && styles.continueButtonDisabled
          ]} 
          onPress={handleContinue}
        >
          <LinearGradient
            colors={
              isAllSectionsComplete()
                ? [COLORS.primary, COLORS.secondary]
                : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
            }
            style={styles.continueButtonGradient}
          >
            <Text style={[
              styles.continueButtonText,
              !isAllSectionsComplete() && styles.continueButtonTextDisabled
            ]}>
              Continue
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color={isAllSectionsComplete() ? COLORS.text : COLORS.textMuted} 
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
    paddingHorizontal: SPACING.lg,
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
    fontWeight: '500',
  },
  sectionTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.md,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.sm,
    alignItems: 'center',
  },
  sectionTabActive: {
    backgroundColor: COLORS.primary,
  },
  sectionTabCompleted: {
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  sectionTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  sectionTabTextActive: {
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 30,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  toggleSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  toggleDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: SPACING.xl,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  numberButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberDisplay: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: SPACING.xl,
    minWidth: 60,
    textAlign: 'center',
  },
  inputHint: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  durationOption: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  durationOptionSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  durationOptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  durationOptionTextSelected: {
    color: COLORS.text,
  },
  encouragementText: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  optionsGrid: {
    marginBottom: SPACING.xl,
  },
  optionCard: {
    marginBottom: SPACING.md,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  optionCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  optionCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: SPACING.lg,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: COLORS.text,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  insightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.md,
    lineHeight: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
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
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonTextDisabled: {
    color: COLORS.textMuted,
  },
});

export default PastAttemptsStep; 