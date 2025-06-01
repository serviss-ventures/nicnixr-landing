import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Animated,
  Dimensions
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
  { id: 'stress', label: 'Stress', icon: '😤' },
  { id: 'meals', label: 'After meals', icon: '🍽️' },
  { id: 'social', label: 'Social situations', icon: '👥' },
  { id: 'boredom', label: 'Boredom', icon: '😑' },
  { id: 'morning', label: 'Morning routine', icon: '☕' },
  { id: 'other', label: 'Other times', icon: '🔄' },
];

const TriggerAnalysisStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);

  // Simplified state - just track main triggers
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    stepData.simplifiedTriggers || []
  );
  
  // Animation for smooth transitions
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

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

    setSelectedTriggers(prev => 
      prev.includes(triggerId) 
        ? prev.filter(id => id !== triggerId)
        : [...prev, triggerId]
    );
  };

  const handleContinue = async () => {
    // Simplified data - just save the main triggers
    const triggerData = {
      simplifiedTriggers: selectedTriggers,
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
    <View style={styles.container}>
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
              <Text style={styles.triggerEmoji}>{trigger.icon}</Text>
              <Text style={[
                styles.triggerLabel,
                selectedTriggers.includes(trigger.id) && styles.triggerLabelSelected
              ]}>
                {trigger.label}
              </Text>
              {selectedTriggers.includes(trigger.id) && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark" size={16} color="#000" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.encouragement}>
          {selectedTriggers.length === 0 
            ? "Tap any that apply - we'll keep this quick"
            : selectedTriggers.length === 1
            ? "Good start! Add more or continue"
            : "Perfect! That's enough to get started"
          }
        </Text>
      </Animated.View>

      {/* Spacer to push navigation to bottom */}
      <View style={{ flex: 1 }} />

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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  triggerCardSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: COLORS.primary,
  },
  triggerEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  triggerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  triggerLabelSelected: {
    color: COLORS.text,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
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
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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