import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Dimensions, SafeAreaView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

/**
 * ReasonsAndFearsStep Component (Redesigned)
 * 
 * Step 3 of the onboarding flow - seamless, scroll-free experience
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

  const [selectedReasons, setSelectedReasons] = useState<string[]>(stepData.reasonsToQuit || []);

  // Animation values for each card
  const cardAnimations = useRef(
    QUIT_REASONS.reduce((acc, reason) => {
      acc[reason.id] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  ).current;

  const handleReasonToggle = (reasonId: string) => {
    const isSelected = selectedReasons.includes(reasonId);
    
    // Animate the card
    Animated.sequence([
      Animated.timing(cardAnimations[reasonId], {
        toValue: 0.95,
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

  const handleContinue = async () => {
    if (selectedReasons.length === 0) {
      Alert.alert(
        'Select Your Motivations', 
        'Choose at least one reason that drives your journey to freedom.'
      );
      return;
    }

    const reasonsData = {
      reasonsToQuit: selectedReasons,
      customReasonToQuit: '', // Keep empty for compatibility
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
                      size={24} 
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
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

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
              size={20} 
              color={selectedReasons.length === 0 ? COLORS.textMuted : '#FFFFFF'} 
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
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reasonCardWrapper: {
    width: '48%',
    marginBottom: 12,
    aspectRatio: 1,
  },
  reasonCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  reasonCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  reasonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  reasonIconContainerSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  reasonLabelSelected: {
    color: COLORS.text,
  },
  reasonDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  reasonDescriptionSelected: {
    color: COLORS.textSecondary,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
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

export default ReasonsAndFearsStep; 