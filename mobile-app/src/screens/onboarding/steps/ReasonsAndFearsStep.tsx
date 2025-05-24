import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * ReasonsAndFearsStep Component (Simplified)
 * 
 * Step 3 of the onboarding flow - consolidated to focus on motivations only.
 * Features clean design matching Step 2 with AI-designed custom iconography.
 * 
 * Key Features:
 * - 6 core motivations with custom branded icons
 * - Clean grid layout with professional styling
 * - Optional custom reason input
 * - Simplified UX - no fears section (moved to later in journey)
 * - Proper spacing to prevent navigation hugging
 * 
 * Design Principles:
 * - Consistent with Step 2 styling
 * - AI-designed iconography instead of emojis
 * - Mobile-optimized spacing and interactions
 * - Encouraging, positive-focused messaging
 */

interface ReasonOption {
  id: string;
  label: string;
  iconName: string;
  iconColor: string;
  iconBg: string;
  description: string;
}

const QUIT_REASONS: ReasonOption[] = [
  { 
    id: 'health', 
    label: 'Health', 
    iconName: 'heart-outline',
    iconColor: '#FF6B6B',
    iconBg: 'rgba(255, 107, 107, 0.15)',
    description: 'Heal my heart and body' 
  },
  { 
    id: 'family', 
    label: 'Family', 
    iconName: 'home-outline',
    iconColor: '#4ECDC4',
    iconBg: 'rgba(78, 205, 196, 0.15)',
    description: 'Protect those I love most' 
  },
  { 
    id: 'money', 
    label: 'Financial Freedom', 
    iconName: 'wallet-outline',
    iconColor: '#FFD93D',
    iconBg: 'rgba(255, 217, 61, 0.15)',
    description: 'Unlock thousands in savings' 
  },
  { 
    id: 'freedom', 
    label: 'True Freedom', 
    iconName: 'leaf-outline',
    iconColor: '#A8E6CF',
    iconBg: 'rgba(168, 230, 207, 0.15)',
    description: 'Break free from addiction' 
  },
  { 
    id: 'energy', 
    label: 'Vitality', 
    iconName: 'flash-outline',
    iconColor: '#DDA0DD',
    iconBg: 'rgba(221, 160, 221, 0.15)',
    description: 'Recharge my life force' 
  },
  { 
    id: 'confidence', 
    label: 'Self-Respect', 
    iconName: 'trophy-outline',
    iconColor: '#FFB347',
    iconBg: 'rgba(255, 179, 71, 0.15)',
    description: 'Reclaim my confidence' 
  },
];

const ReasonsAndFearsStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);

  const [selectedReasons, setSelectedReasons] = useState<string[]>(stepData.reasonsToQuit || []);
  const [customReason, setCustomReason] = useState(stepData.customReasonToQuit || '');

  const handleReasonToggle = (reasonId: string) => {
    setSelectedReasons(prev => 
      prev.includes(reasonId) 
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId]
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

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What drives your freedom?</Text>
          <Text style={styles.subtitle}>
            Your motivations are powerful. The clearer we understand them, 
            the stronger your quit plan will be.
          </Text>
        </View>

        {/* Reasons Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What are your primary reasons for quitting?</Text>
          <Text style={styles.helperText}>Select all that apply - these will be your strength</Text>
          
          <View style={styles.reasonsGrid}>
            {QUIT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonCard,
                  selectedReasons.includes(reason.id) && styles.reasonCardSelected
                ]}
                onPress={() => handleReasonToggle(reason.id)}
              >
                <View style={[styles.reasonIconContainer, { backgroundColor: reason.iconBg }]}>
                  <Ionicons name={reason.iconName as any} size={28} color={reason.iconColor} />
                </View>
                <Text style={styles.reasonLabel}>{reason.label}</Text>
                <Text style={styles.reasonDescription}>{reason.description}</Text>
                {selectedReasons.includes(reason.id) && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={16} color={COLORS.text} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Reason Input */}
          {selectedReasons.length > 0 && (
            <View style={styles.customReasonContainer}>
              <Text style={styles.inputLabel}>Have a personal reason?</Text>
              <TextInput
                style={styles.textInput}
                value={customReason}
                onChangeText={setCustomReason}
                placeholder="Your unique motivation to quit nicotine..."
                placeholderTextColor={COLORS.textMuted}
                multiline
              />
            </View>
          )}
        </View>

        {/* Encouragement - Only show when reasons selected */}
        {selectedReasons.length > 0 && (
          <View style={styles.encouragementContainer}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
              style={styles.encouragementCard}
            >
              <Ionicons name="heart" size={24} color={COLORS.primary} />
              <Text style={styles.encouragementText}>
                Perfect! We'll use these motivations to keep you strong during challenging moments.
              </Text>
            </LinearGradient>
          </View>
        )}
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
  scrollContent: {
    paddingBottom: SPACING['4xl'], // Increased spacing to prevent input hugging navigation
  },
  header: {
    marginBottom: SPACING.xl,
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
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  helperText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reasonCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  reasonCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  reasonIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  reasonDescription: {
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
  customReasonContainer: {
    marginTop: SPACING.md,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: SPACING.xl, // Extra space to ensure it doesn't hug navigation
  },
  encouragementContainer: {
    marginBottom: SPACING.xl,
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
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xl, // More space from content
    paddingBottom: SPACING['2xl'], // More space for safe area
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginTop: SPACING.lg,
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