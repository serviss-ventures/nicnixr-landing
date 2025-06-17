import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import ReasonCard from '../../../components/common/ReasonCard';
import FearCard from '../../../components/common/FearCard';
import { useOnboardingTracking } from '../../../hooks/useOnboardingTracking';

const { width, height } = Dimensions.get('window');

/**
 * ReasonsAndFearsStep Component (Redesigned)
 * 
 * Step 4 of the onboarding flow - seamless, scroll-free experience
 * Features clean design with smooth transitions and no scrolling required
 * 
 * Key Features:
 * - 6 core motivations in a fixed 2x3 grid
 * - Smooth animations on selection
 * - Multi-select with visual feedback
 * - Optional custom reason appears inline
 * - No scrolling needed - everything fits perfectly
 * 
 * Design Principles:
 * - Consistent with Step 2 styling
 * - Mobile-optimized with proper spacing
 * - Encouraging, positive-focused messaging
 * - Seamless transitions
 */

interface ReasonOption {
  id: string;
  label: string;
  iconName: string;
  description: string;
}

const QUIT_REASONS: ReasonOption[] = [
  { 
    id: 'health', 
    label: 'Health', 
    iconName: 'heart-outline',
    description: 'Heal my body' 
  },
  { 
    id: 'family', 
    label: 'Family', 
    iconName: 'home-outline',
    description: 'For loved ones' 
  },
  { 
    id: 'money', 
    label: 'Money', 
    iconName: 'wallet-outline',
    description: 'Save thousands' 
  },
  { 
    id: 'freedom', 
    label: 'Freedom', 
    iconName: 'leaf-outline',
    description: 'Break free' 
  },
  { 
    id: 'energy', 
    label: 'Energy', 
    iconName: 'flash-outline',
    description: 'More vitality' 
  },
  { 
    id: 'confidence', 
    label: 'Confidence', 
    iconName: 'trophy-outline',
    description: 'Self-respect' 
  },
];

const ReasonsAndFearsStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);
  const { trackStepCompleted } = useOnboardingTracking();

  const [selectedReasons, setSelectedReasons] = useState<string[]>(stepData.reasonsToQuit || []);
  const [selectedFears, setSelectedFears] = useState<string[]>(stepData.biggestFears || []);
  const [customReason, setCustomReason] = useState<string>(stepData.customReasonToQuit || '');
  const [showFears, setShowFears] = useState<boolean>(false);

  // Animation values for each card
  const cardAnimations = useRef(
    QUIT_REASONS.reduce((acc, reason) => {
      acc[reason.id] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  ).current;

  const handleReasonToggle = (reasonId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const isSelected = selectedReasons.includes(reasonId);
    
    // Animate the card
    Animated.sequence([
      Animated.timing(cardAnimations[reasonId], {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnimations[reasonId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedReasons(prev => {
      const newSelection = isSelected 
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId];
      
      return newSelection;
    });
  };

  const handleTransitionToFears = () => {
    setShowFears(true);
  };

  const handleContinue = async () => {
    if (!showFears) {
      if (selectedReasons.length === 0 && !customReason.trim()) {
        Alert.alert('Select your reasons', 'Choose at least one reason for quitting or write your own.');
        return;
      }
      handleTransitionToFears();
    } else {
      if (selectedFears.length === 0) {
        Alert.alert('Select your fears', 'Being honest about your fears helps us provide better support.');
        return;
      }

      const reasonsAndFearsData = {
        reasonsToQuit: selectedReasons,
        quitReasons: selectedReasons, // For database compatibility
        customReasonToQuit: customReason,
        biggestFears: selectedFears,
        motivationLevel: selectedReasons.length + (customReason ? 1 : 0), // Simple motivation score
      };

      // Track completion with analytics
      await trackStepCompleted(reasonsAndFearsData);

      dispatch(updateStepData(reasonsAndFearsData));
      await dispatch(saveOnboardingProgress(reasonsAndFearsData));
      dispatch(nextStep());
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(previousStep());
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
            <View style={[styles.progressFill, { width: `${(4/9) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Step 4 of 9</Text>
        </View>

        {/* Main Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>What drives your freedom?</Text>
              <Text style={styles.subtitle}>
                Select all that inspire you - these will be your strength
              </Text>
            </View>

            {/* Reasons Grid */}
            <View style={styles.reasonsGrid}>
              {QUIT_REASONS.map((reason) => (
                <Animated.View
                  key={reason.id}
                  style={[
                    styles.reasonCardWrapper,
                    {
                      transform: [{ scale: cardAnimations[reason.id] }],
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.reasonCard,
                      selectedReasons.includes(reason.id) && styles.reasonCardSelected
                    ]}
                    onPress={() => handleReasonToggle(reason.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.reasonIconContainer,
                      selectedReasons.includes(reason.id) && styles.reasonIconContainerSelected
                    ]}>
                      <Ionicons 
                        name={reason.iconName as any} 
                        size={22} 
                        color={selectedReasons.includes(reason.id) ? COLORS.primary : COLORS.textSecondary} 
                      />
                    </View>
                    <Text style={[
                      styles.reasonLabel,
                      selectedReasons.includes(reason.id) && styles.reasonLabelSelected
                    ]}>
                      {reason.label}
                    </Text>
                    <Text style={[
                      styles.reasonDescription,
                      selectedReasons.includes(reason.id) && styles.reasonDescriptionSelected
                    ]}>
                      {reason.description}
                    </Text>
                    {selectedReasons.includes(reason.id) && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={18} color={COLORS.textSecondary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleContinue}
            style={[
              styles.continueButton, 
              selectedReasons.length === 0 && styles.continueButtonDisabled
            ]}
            disabled={selectedReasons.length === 0}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.continueButtonText,
              selectedReasons.length === 0 && styles.continueButtonTextDisabled
            ]}>
              Continue
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={18} 
              color={selectedReasons.length === 0 ? COLORS.textMuted : COLORS.text} 
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
    paddingBottom: SPACING.xl,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl * 1.5,
    paddingTop: SPACING.sm,
  },
  header: {
    marginBottom: SPACING.xl,
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
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  reasonCardWrapper: {
    width: '48.5%',
  },
  reasonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    position: 'relative',
    minHeight: 110,
  },
  reasonCardSelected: {
    borderColor: 'rgba(139, 92, 246, 0.3)',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  reasonIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reasonIconContainerSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  reasonLabel: {
    fontSize: FONTS.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  reasonLabelSelected: {
    color: COLORS.text,
  },
  reasonDescription: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '400',
  },
  reasonDescriptionSelected: {
    color: COLORS.textSecondary,
  },
  checkmark: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
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

export default ReasonsAndFearsStep; 