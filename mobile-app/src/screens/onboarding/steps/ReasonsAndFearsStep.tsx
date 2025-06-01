import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Animated, Dimensions, KeyboardAvoidingView, Platform, Keyboard, ScrollView, SafeAreaView } from 'react-native';
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
    description: 'Heal my body' 
  },
  { 
    id: 'family', 
    label: 'Family', 
    iconName: 'home-outline',
    iconColor: '#4ECDC4',
    iconBg: 'rgba(78, 205, 196, 0.15)',
    description: 'For loved ones' 
  },
  { 
    id: 'money', 
    label: 'Money', 
    iconName: 'wallet-outline',
    iconColor: '#FFD93D',
    iconBg: 'rgba(255, 217, 61, 0.15)',
    description: 'Save thousands' 
  },
  { 
    id: 'freedom', 
    label: 'Freedom', 
    iconName: 'leaf-outline',
    iconColor: '#A8E6CF',
    iconBg: 'rgba(168, 230, 207, 0.15)',
    description: 'Break free' 
  },
  { 
    id: 'energy', 
    label: 'Energy', 
    iconName: 'flash-outline',
    iconColor: '#DDA0DD',
    iconBg: 'rgba(221, 160, 221, 0.15)',
    description: 'More vitality' 
  },
  { 
    id: 'confidence', 
    label: 'Confidence', 
    iconName: 'trophy-outline',
    iconColor: '#FFB347',
    iconBg: 'rgba(255, 179, 71, 0.15)',
    description: 'Self-respect' 
  },
];

const ReasonsAndFearsStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);

  const [selectedReasons, setSelectedReasons] = useState<string[]>(stepData.reasonsToQuit || []);
  const [customReason, setCustomReason] = useState(stepData.customReasonToQuit || '');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Refs for scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  // Animation values for each card
  const cardAnimations = useRef(
    QUIT_REASONS.reduce((acc, reason) => {
      acc[reason.id] = {
        scale: new Animated.Value(1),
        opacity: new Animated.Value(1),
      };
      return acc;
    }, {} as Record<string, { scale: Animated.Value; opacity: Animated.Value }>)
  ).current;

  // Animation for custom input
  const customInputAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleInputFocus = () => {
    // Ensure the input is visible by scrolling to the right position
    setTimeout(() => {
      if (scrollViewRef.current) {
        // Calculate the position to scroll to
        // This will scroll the view so the input is visible above the keyboard
        const scrollPosition = 400; // Approximate position of custom input
        scrollViewRef.current.scrollTo({ 
          y: scrollPosition, 
          animated: true 
        });
      }
    }, 100);
  };

  const handleReasonToggle = (reasonId: string) => {
    const isSelected = selectedReasons.includes(reasonId);
    
    // Animate the card
    Animated.parallel([
      Animated.spring(cardAnimations[reasonId].scale, {
        toValue: isSelected ? 1 : 1.05,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnimations[reasonId].opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset scale after animation
      Animated.spring(cardAnimations[reasonId].scale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    });

    setSelectedReasons(prev => {
      const newSelection = isSelected 
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId];
      
      // Show custom input when at least one reason is selected
      if (newSelection.length > 0 && !showCustomInput) {
        // Don't automatically show custom input
      } else if (newSelection.length === 0 && showCustomInput && customReason.trim().length === 0) {
        // Only hide if there's no custom text
        Animated.timing(customInputAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setShowCustomInput(false));
      }
      
      return newSelection;
    });
  };

  const handleShowCustomInput = () => {
    setShowCustomInput(true);
    Animated.timing(customInputAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Focus input after animation
      textInputRef.current?.focus();
    });
  };

  const handleHideCustomInput = () => {
    Keyboard.dismiss();
    Animated.timing(customInputAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowCustomInput(false);
    });
  };

  const handleContinue = async () => {
    if (selectedReasons.length === 0 && !customReason.trim()) {
      Alert.alert(
        'Select Your Motivations', 
        'Choose at least one reason that drives your journey to freedom.'
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Progress Indicator - Always at top */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={[styles.progressFill, { width: '37.5%' }]}
            />
          </View>
          <Text style={styles.progressText}>Step 3 of 8</Text>
        </View>

        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
          {/* Main Content - Scrollable */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              keyboardHeight > 0 && { paddingBottom: 20 }
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>What drives your freedom?</Text>
              <Text style={styles.subtitle}>
                Select all that inspire you - these will be your strength
              </Text>
            </View>

            {/* Reasons Grid - Fixed 2x3 layout */}
            <View style={styles.reasonsGrid}>
              {QUIT_REASONS.map((reason) => (
                <Animated.View
                  key={reason.id}
                  style={[
                    styles.reasonCardWrapper,
                    {
                      transform: [{ scale: cardAnimations[reason.id].scale }],
                      opacity: cardAnimations[reason.id].opacity,
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
                    <View style={[styles.reasonIconContainer, { backgroundColor: reason.iconBg }]}>
                      <Ionicons name={reason.iconName as any} size={28} color={reason.iconColor} />
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
                        <Ionicons name="checkmark" size={14} color="#000" />
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            {/* Add Personal Reason Button */}
            {!showCustomInput && (
              <TouchableOpacity 
                style={styles.addReasonButton}
                onPress={handleShowCustomInput}
              >
                <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.addReasonButtonText}>Add personal reason (optional)</Text>
              </TouchableOpacity>
            )}

            {/* Custom Reason Input - Animated */}
            {showCustomInput && (
              <Animated.View 
                style={[
                  styles.customReasonContainer,
                  {
                    opacity: customInputAnimation,
                    transform: [{
                      translateY: customInputAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    }],
                  }
                ]}
              >
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>Your personal reason</Text>
                  <TouchableOpacity onPress={handleHideCustomInput}>
                    <Ionicons name="close" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      ref={textInputRef}
                      style={styles.textInput}
                      value={customReason}
                      onChangeText={setCustomReason}
                      placeholder="What else motivates you?"
                      placeholderTextColor={COLORS.textMuted}
                      multiline
                      numberOfLines={2}
                      maxLength={100}
                      returnKeyType="done"
                      blurOnSubmit={true}
                      onSubmitEditing={() => Keyboard.dismiss()}
                      onFocus={handleInputFocus}
                    />
                    {customReason.length > 0 && (
                      <TouchableOpacity 
                        style={styles.clearButton}
                        onPress={() => setCustomReason('')}
                      >
                        <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.characterCount}>{customReason.length}/100</Text>
                </View>
              </Animated.View>
            )}

            {/* Selected Count Indicator */}
            {selectedReasons.length > 0 && (
              <View style={styles.selectionIndicator}>
                <Text style={styles.selectionText}>
                  {selectedReasons.length} motivation{selectedReasons.length > 1 ? 's' : ''} selected
                </Text>
                <View style={styles.selectionDots}>
                  {selectedReasons.map((id) => {
                    const reason = QUIT_REASONS.find(r => r.id === id);
                    return (
                      <View 
                        key={id} 
                        style={[styles.selectionDot, { backgroundColor: reason?.iconColor }]} 
                      />
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Navigation */}
          <View style={[
            styles.navigationContainer,
            { paddingBottom: keyboardHeight > 0 ? SPACING.xl : SPACING.lg }
          ]}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleContinue}
              style={[
                styles.continueButton, 
                (selectedReasons.length === 0 && !customReason.trim()) && styles.continueButtonDisabled
              ]}
              disabled={selectedReasons.length === 0 && customReason.trim().length === 0}
            >
              <LinearGradient
                colors={
                  selectedReasons.length > 0 || customReason.trim()
                    ? [COLORS.primary, COLORS.secondary]
                    : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                }
                style={styles.continueButtonGradient}
              >
                <Text style={[
                  styles.continueButtonText,
                  (selectedReasons.length === 0 && !customReason.trim()) && styles.continueButtonTextDisabled
                ]}>
                  Continue
                </Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={20} 
                  color={
                    selectedReasons.length > 0 || customReason.trim()
                      ? COLORS.text
                      : COLORS.textMuted
                  } 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 32,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  reasonCardWrapper: {
    width: '31%',
    marginBottom: SPACING.md,
  },
  reasonCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    height: 115,
    position: 'relative',
    justifyContent: 'center',
  },
  reasonCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    transform: [{ scale: 1.02 }],
  },
  reasonIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  reasonLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  reasonLabelSelected: {
    color: COLORS.primary,
  },
  reasonDescription: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 12,
  },
  reasonDescriptionSelected: {
    color: COLORS.textSecondary,
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addReasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  addReasonButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  customReasonContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  inputContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textInput: {
    flex: 1,
    padding: SPACING.md,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  clearButton: {
    padding: SPACING.md,
    alignSelf: 'flex-start',
  },
  selectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  selectionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  selectionDots: {
    flexDirection: 'row',
    gap: 4,
  },
  selectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
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
  continueButtonDisabled: {
    opacity: 0.5,
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
  continueButtonTextDisabled: {
    color: COLORS.textMuted,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    alignSelf: 'flex-end',
  },
});

export default ReasonsAndFearsStep; 