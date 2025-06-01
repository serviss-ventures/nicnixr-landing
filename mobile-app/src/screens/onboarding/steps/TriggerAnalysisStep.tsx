import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Animated,
  Dimensions,
  TextInput,
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

// Simplified options - just the essentials
const SIMPLE_TRIGGERS = [
  { 
    id: 'stress', 
    label: 'Stress',
    icon: 'flash-outline' as keyof typeof Ionicons.glyphMap,
    iconColor: '#FF4500',
    iconBg: 'rgba(255, 69, 0, 0.15)'
  },
  { 
    id: 'meals', 
    label: 'After meals',
    icon: 'restaurant-outline' as keyof typeof Ionicons.glyphMap,
    iconColor: '#FF6B6B',
    iconBg: 'rgba(255, 107, 107, 0.15)'
  },
  { 
    id: 'social', 
    label: 'Social situations',
    icon: 'people-outline' as keyof typeof Ionicons.glyphMap,
    iconColor: '#32CD32',
    iconBg: 'rgba(50, 205, 50, 0.15)'
  },
  { 
    id: 'boredom', 
    label: 'Boredom',
    icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
    iconColor: '#808080',
    iconBg: 'rgba(128, 128, 128, 0.15)'
  },
  { 
    id: 'morning', 
    label: 'Morning routine',
    icon: 'sunny-outline' as keyof typeof Ionicons.glyphMap,
    iconColor: '#FFD700',
    iconBg: 'rgba(255, 215, 0, 0.15)'
  },
  { 
    id: 'other', 
    label: 'Other times',
    icon: 'refresh-outline' as keyof typeof Ionicons.glyphMap,
    iconColor: '#9370DB',
    iconBg: 'rgba(147, 112, 219, 0.15)'
  },
];

const TriggerAnalysisStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);

  // Simplified state - just track main triggers
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    stepData.simplifiedTriggers || []
  );
  
  // Add state for custom trigger text
  const [customTrigger, setCustomTrigger] = useState(stepData.customCravingTrigger || '');
  
  // Animation for smooth transitions
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const customInputAnim = React.useRef(new Animated.Value(0)).current;

  const handleTriggerToggle = (triggerId: string) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedTriggers(prev => {
      const newSelection = prev.includes(triggerId) 
        ? prev.filter(id => id !== triggerId)
        : [...prev, triggerId];
      
      // Animate custom input based on "other" selection
      if (triggerId === 'other') {
        Animated.timing(customInputAnim, {
          toValue: newSelection.includes('other') ? 1 : 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
      
      return newSelection;
    });
  };

  const handleContinue = async () => {
    // Simplified data - just save the main triggers
    const triggerData = {
      simplifiedTriggers: selectedTriggers,
      customCravingTrigger: selectedTriggers.includes('other') ? customTrigger.trim() : '',
      // Map to old format for compatibility
      cravingTriggers: selectedTriggers,
      highRiskSituations: selectedTriggers.includes('stress') ? ['stress_situations'] : [],
      currentCopingMechanisms: ['awareness'], // Default value
    };

    dispatch(updateStepData(triggerData));
    await dispatch(saveOnboardingProgress(triggerData));
    dispatch(nextStep());
  };

  const handleBack = () => {
    dispatch(previousStep());
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={[styles.progressFill, { width: '50%' }]}
            />
          </View>
          <Text style={styles.progressText}>Step 4 of 8</Text>
        </View>

        {/* Simple Header */}
        <View style={styles.header}>
          <Text style={styles.title}>When do cravings hit hardest?</Text>
          <Text style={styles.subtitle}>
            Quick check - select your main triggers
          </Text>
          {selectedTriggers.length > 0 && (
            <Text style={styles.selectionCount}>
              {selectedTriggers.length} selected
            </Text>
          )}
        </View>

        {/* Simplified Grid */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.triggerGrid}>
            {SIMPLE_TRIGGERS.map((trigger) => (
              <TouchableOpacity
                key={trigger.id}
                style={[
                  styles.triggerCard,
                  selectedTriggers.includes(trigger.id) && styles.triggerCardSelected
                ]}
                onPress={() => handleTriggerToggle(trigger.id)}
                activeOpacity={0.7}
              >
                <View 
                  style={[
                    styles.triggerIconContainer,
                    { backgroundColor: trigger.iconBg },
                    selectedTriggers.includes(trigger.id) && styles.triggerIconContainerSelected
                  ]}
                >
                  <Ionicons 
                    name={trigger.icon} 
                    size={24} 
                    color={trigger.iconColor} 
                  />
                </View>
                <Text style={[
                  styles.triggerLabel,
                  selectedTriggers.includes(trigger.id) && styles.triggerLabelSelected
                ]}>
                  {trigger.label}
                </Text>
                {selectedTriggers.includes(trigger.id) && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={14} color="#000" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom trigger input - only shows when "other" is selected */}
          <Animated.View style={[
            styles.customInputContainer,
            {
              maxHeight: customInputAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 120]
              }),
              opacity: customInputAnim,
              marginTop: customInputAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, SPACING.md]
              })
            }
          ]}>
            <View style={styles.customInputWrapper}>
              <Text style={styles.customInputLabel}>Tell us about your specific trigger:</Text>
              <TextInput
                style={styles.customInput}
                placeholder="e.g., During phone calls, watching TV..."
                placeholderTextColor={COLORS.textMuted}
                value={customTrigger}
                onChangeText={setCustomTrigger}
                multiline
                numberOfLines={2}
                maxLength={100}
              />
            </View>
          </Animated.View>

          <Text style={styles.encouragement}>
            {selectedTriggers.length === 0 
              ? "Tap any that apply - we'll keep this quick"
              : selectedTriggers.length === 1
              ? "Good start! Add more or continue"
              : "Perfect! That's enough to get started"
            }
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.continueButton,
            selectedTriggers.length === 0 && styles.continueButtonDisabled
          ]} 
          onPress={handleContinue}
          disabled={selectedTriggers.length === 0}
        >
          <LinearGradient
            colors={
              selectedTriggers.length > 0
                ? [COLORS.primary, COLORS.secondary]
                : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
            }
            style={styles.continueButtonGradient}
          >
            <Text style={[
              styles.continueButtonText,
              selectedTriggers.length === 0 && styles.continueButtonTextDisabled
            ]}>
              {selectedTriggers.length === 0 ? 'Select at least one' : 'Continue'}
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color={selectedTriggers.length > 0 ? COLORS.text : COLORS.textMuted} 
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100, // Space for navigation buttons
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
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  selectionCount: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: SPACING.sm,
    fontWeight: '600',
  },
  content: {
    alignItems: 'center',
  },
  triggerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.xl,
  },
  triggerCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
    padding: SPACING.sm,
  },
  triggerCardSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: COLORS.primary,
    transform: [{ scale: 1.02 }],
  },
  triggerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  triggerIconContainerSelected: {
    transform: [{ scale: 1.1 }],
  },
  triggerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  triggerLabelSelected: {
    color: COLORS.text,
    fontWeight: '700',
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  encouragement: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  customInputContainer: {
    overflow: 'hidden',
    width: '100%',
  },
  customInputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  customInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  customInput: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 14,
    color: COLORS.text,
    textAlignVertical: 'top',
    minHeight: 50,
    lineHeight: 20,
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    paddingBottom: SPACING['2xl'],
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
  continueButtonDisabled: {
    opacity: 0.6,
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
  continueButtonTextDisabled: {
    color: COLORS.textMuted,
  },
});

export default TriggerAnalysisStep; 