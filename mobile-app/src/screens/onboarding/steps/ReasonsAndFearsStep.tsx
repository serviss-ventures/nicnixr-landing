import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ReasonOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

interface FearOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const QUIT_REASONS: ReasonOption[] = [
  { id: 'health', label: 'Health', icon: '🫀', description: 'Heal my heart and body' },
  { id: 'family', label: 'Family', icon: '🏠', description: 'Protect those I love most' },
  { id: 'money', label: 'Financial Freedom', icon: '🔓', description: 'Unlock thousands in savings' },
  { id: 'freedom', label: 'True Freedom', icon: '🕊️', description: 'Break free from addiction chains' },
  { id: 'smell', label: 'Senses', icon: '🌸', description: 'Rediscover taste and smell' },
  { id: 'energy', label: 'Vitality', icon: '🔋', description: 'Recharge my life force' },
  { id: 'confidence', label: 'Self-Respect', icon: '👑', description: 'Reclaim my throne' },
  { id: 'example', label: 'Legacy', icon: '🌱', description: 'Plant seeds of inspiration' },
  { id: 'breathing', label: 'Clean Lungs', icon: '🫁', description: 'Breathe pure air again' },
  { id: 'appearance', label: 'Glow Up', icon: '🦋', description: 'Transform into my best self' },
];

const QUIT_FEARS: FearOption[] = [
  { id: 'withdrawal', label: 'Withdrawal Hell', icon: '🌪️', description: 'Surviving the physical storm' },
  { id: 'weight_gain', label: 'Weight Changes', icon: '⚖️', description: 'Body composition shifts' },
  { id: 'social_pressure', label: 'Social Isolation', icon: '🏝️', description: 'Losing smoking friends' },
  { id: 'stress_management', label: 'Stress Eruption', icon: '🌋', description: 'Losing my main coping tool' },
  { id: 'boredom', label: 'Empty Void', icon: '🕳️', description: 'Having no ritual to fill time' },
  { id: 'failure', label: 'Another Relapse', icon: '🥀', description: 'Disappointing myself again' },
  { id: 'identity', label: 'Identity Crisis', icon: '🎭', description: 'Who am I without nicotine?' },
  { id: 'routine', label: 'Ritual Destruction', icon: '💥', description: 'Losing familiar comfort habits' },
  { id: 'mood_changes', label: 'Emotional Chaos', icon: '🎢', description: 'Uncontrolled mood swings' },
  { id: 'cravings', label: 'Craving Tsunami', icon: '🌊', description: 'Overwhelming urge waves' },
];

const ReasonsAndFearsStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);

  const [selectedReasons, setSelectedReasons] = useState<string[]>(stepData.reasonsToQuit || []);
  const [customReason, setCustomReason] = useState(stepData.customReasonToQuit || '');
  const [selectedFears, setSelectedFears] = useState<string[]>(stepData.fearsAboutQuitting || []);
  const [customFear, setCustomFear] = useState(stepData.customFearAboutQuitting || '');
  const [showCustomReason, setShowCustomReason] = useState(false);
  const [showCustomFear, setShowCustomFear] = useState(false);

  const handleReasonToggle = (reasonId: string) => {
    setSelectedReasons(prev => 
      prev.includes(reasonId) 
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleFearToggle = (fearId: string) => {
    setSelectedFears(prev => 
      prev.includes(fearId) 
        ? prev.filter(id => id !== fearId)
        : [...prev, fearId]
    );
  };

  const handleContinue = async () => {
    if (selectedReasons.length === 0 && !customReason.trim()) {
      Alert.alert(
        'Tell us why you want to quit', 
        'Understanding your motivation helps us keep you inspired when things get tough.'
      );
      return;
    }

    const reasonsData = {
      reasonsToQuit: selectedReasons,
      customReasonToQuit: customReason.trim(),
      fearsAboutQuitting: selectedFears,
      customFearAboutQuitting: customFear.trim(),
    };

    dispatch(updateStepData(reasonsData));
    await dispatch(saveOnboardingProgress(reasonsData));
    dispatch(nextStep());
  };

  const handleBack = () => {
    dispatch(previousStep());
  };

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={[styles.progressFill, { width: '37.5%' }]}
          />
        </View>
        <Text style={styles.progressText}>Step 3 of 8</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What drives your freedom?</Text>
          <Text style={styles.subtitle}>
            Your reasons matter deeply. The more we understand what motivates you, 
            the better we can support you through tough moments.
          </Text>
        </View>

        {/* Reasons Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What are your primary reasons for quitting?</Text>
          <Text style={styles.helperText}>Select all that apply - your motivations make you stronger</Text>
          
          <View style={styles.optionsGrid}>
            {QUIT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.optionCard,
                  selectedReasons.includes(reason.id) && styles.optionCardSelected
                ]}
                onPress={() => handleReasonToggle(reason.id)}
              >
                <Text style={styles.optionIcon}>{reason.icon}</Text>
                <Text style={styles.optionLabel}>{reason.label}</Text>
                <Text style={styles.optionDescription}>{reason.description}</Text>
                {selectedReasons.includes(reason.id) && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={16} color={COLORS.text} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Reason - Enhanced */}
          <View style={styles.customReasonSection}>
            <TouchableOpacity 
              style={[styles.customTrigger, showCustomReason && styles.customTriggerActive]} 
              onPress={() => setShowCustomReason(!showCustomReason)}
            >
              <View style={styles.customIconContainer}>
                <Ionicons name="add-circle" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.customTextContainer}>
                <Text style={styles.customTriggerTitle}>Your Personal Reason</Text>
                <Text style={styles.customTriggerSubtext}>
                  {showCustomReason ? 'Tap to close' : 'What drives YOU specifically?'}
                </Text>
              </View>
              <Ionicons 
                name={showCustomReason ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={COLORS.textSecondary} 
              />
            </TouchableOpacity>

            {showCustomReason && (
              <View style={styles.customInputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={customReason}
                  onChangeText={setCustomReason}
                  placeholder="Your deepest, most personal reason to quit nicotine..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  autoFocus
                />
                {customReason.trim() && (
                  <View style={styles.customReasonPreview}>
                    <Ionicons name="heart" size={16} color={COLORS.primary} />
                    <Text style={styles.customReasonPreviewText}>
                      This will be saved and used to motivate you during tough moments
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Encouragement */}
        <View style={styles.encouragementContainer}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
            style={styles.encouragementCard}
          >
            <Ionicons name="heart" size={24} color={COLORS.primary} />
            <Text style={styles.encouragementText}>
              Your reasons are powerful. We'll remind you of them when you need it most.
            </Text>
          </LinearGradient>
        </View>

        {/* Fears Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What worries you most about quitting?</Text>
          <Text style={styles.helperText}>
            It's completely normal to have fears. Acknowledging them helps us prepare strategies together.
          </Text>
          
          <View style={styles.optionsGrid}>
            {QUIT_FEARS.map((fear) => (
              <TouchableOpacity
                key={fear.id}
                style={[
                  styles.optionCard,
                  selectedFears.includes(fear.id) && styles.fearCardSelected
                ]}
                onPress={() => handleFearToggle(fear.id)}
              >
                <Text style={styles.optionIcon}>{fear.icon}</Text>
                <Text style={styles.optionLabel}>{fear.label}</Text>
                <Text style={styles.optionDescription}>{fear.description}</Text>
                {selectedFears.includes(fear.id) && (
                  <View style={styles.fearCheckmark}>
                    <Ionicons name="checkmark" size={16} color={COLORS.text} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Fear - Enhanced */}
          <View style={styles.customFearSection}>
            <TouchableOpacity 
              style={[styles.customTrigger, showCustomFear && styles.customTriggerActive]} 
              onPress={() => setShowCustomFear(!showCustomFear)}
            >
              <View style={styles.customIconContainer}>
                <Ionicons name="add-circle" size={24} color={COLORS.secondary} />
              </View>
              <View style={styles.customTextContainer}>
                <Text style={styles.customTriggerTitle}>Your Unique Fear</Text>
                <Text style={styles.customTriggerSubtext}>
                  {showCustomFear ? 'Tap to close' : 'What specifically worries YOU?'}
                </Text>
              </View>
              <Ionicons 
                name={showCustomFear ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={COLORS.textSecondary} 
              />
            </TouchableOpacity>

            {showCustomFear && (
              <View style={styles.customInputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={customFear}
                  onChangeText={setCustomFear}
                  placeholder="Your personal fear about quitting nicotine..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  autoFocus
                />
                {customFear.trim() && (
                  <View style={styles.customFearPreview}>
                    <Ionicons name="shield-checkmark" size={16} color={COLORS.secondary} />
                    <Text style={styles.customFearPreviewText}>
                      We'll create specific strategies to address this concern
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Supportive Message */}
        <View style={styles.supportContainer}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)']}
            style={styles.supportCard}
          >
            <Ionicons name="shield-checkmark" size={24} color="#8B5CF6" />
            <Text style={styles.supportText}>
              Remember: Having fears doesn't make you weak - it makes you human. 
              We'll build specific strategies to address each concern you've shared.
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.text} />
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
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: SPACING['2xl'],
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  section: {
    marginBottom: SPACING['2xl'],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  helperText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  optionCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  fearCardSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  optionIcon: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  optionDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  checkmark: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fearCheckmark: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customReasonSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  customFearSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  customTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  customTriggerActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  customIconContainer: {
    marginRight: SPACING.md,
  },
  customTextContainer: {
    flex: 1,
  },
  customTriggerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  customTriggerSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  customInputContainer: {
    marginTop: SPACING.sm,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  customReasonPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  customReasonPreviewText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
    fontStyle: 'italic',
  },
  customFearPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  customFearPreviewText: {
    fontSize: 12,
    color: COLORS.secondary,
    marginLeft: SPACING.xs,
    fontStyle: 'italic',
  },
  encouragementContainer: {
    marginBottom: SPACING['2xl'],
  },
  encouragementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  encouragementText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.md,
    flex: 1,
    lineHeight: 18,
  },
  supportContainer: {
    marginBottom: SPACING.xl,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  supportText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.md,
    flex: 1,
    lineHeight: 18,
    fontStyle: 'italic',
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
  },
  continueButton: {
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
});

export default ReasonsAndFearsStep; 