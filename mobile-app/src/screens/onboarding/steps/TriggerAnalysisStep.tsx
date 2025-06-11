import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Simplified options - just the essentials
const SIMPLE_TRIGGERS = [
  { 
    id: 'stress', 
    label: 'Stress',
    icon: 'flash-outline' as keyof typeof Ionicons.glyphMap,
  },
  { 
    id: 'meals', 
    label: 'After meals',
    icon: 'restaurant-outline' as keyof typeof Ionicons.glyphMap,
  },
  { 
    id: 'social', 
    label: 'Social situations',
    icon: 'people-outline' as keyof typeof Ionicons.glyphMap,
  },
  { 
    id: 'boredom', 
    label: 'Boredom',
    icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
  },
  { 
    id: 'morning', 
    label: 'Morning routine',
    icon: 'sunny-outline' as keyof typeof Ionicons.glyphMap,
  },
  { 
    id: 'driving', 
    label: 'Driving',
    icon: 'car-outline' as keyof typeof Ionicons.glyphMap,
  },
];

const TriggerAnalysisStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);
  
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    stepData.simplifiedTriggers || stepData.cravingTriggers || []
  );
  
  // Card animations for each trigger
  const cardAnimations = useRef<{[key: string]: Animated.Value}>({});
  
  // Initialize animations for each trigger
  SIMPLE_TRIGGERS.forEach(trigger => {
    if (!cardAnimations.current[trigger.id]) {
      cardAnimations.current[trigger.id] = new Animated.Value(1);
    }
  });

  const handleTriggerToggle = (triggerId: string) => {
    const isSelected = selectedTriggers.includes(triggerId);
    
    // Animate the card
    Animated.sequence([
      Animated.timing(cardAnimations.current[triggerId], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnimations.current[triggerId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedTriggers(prev => {
      const newSelection = isSelected 
        ? prev.filter(id => id !== triggerId)
        : [...prev, triggerId];
      
      return newSelection;
    });
  };

  const handleContinue = async () => {
    // Simplified data - just save the main triggers
    const triggerData = {
      simplifiedTriggers: selectedTriggers,
      customCravingTrigger: '',
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
      {/* Gradient background */}
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(5/9) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Step 5 of 9</Text>
        </View>

        {/* Main Content - No ScrollView */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>When do cravings hit hardest?</Text>
            <Text style={styles.subtitle}>
              Select all that apply - knowing helps us support you better
            </Text>
          </View>

          {/* Triggers Grid */}
          <View style={styles.triggerGrid}>
            {SIMPLE_TRIGGERS.map((trigger) => (
              <Animated.View
                key={trigger.id}
                style={[
                  styles.triggerCardWrapper,
                  {
                    transform: [{ scale: cardAnimations.current[trigger.id] }],
                  }
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.triggerCard,
                    selectedTriggers.includes(trigger.id) && styles.triggerCardSelected
                  ]}
                  onPress={() => handleTriggerToggle(trigger.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.triggerIconContainer,
                    selectedTriggers.includes(trigger.id) && styles.triggerIconContainerSelected
                  ]}>
                    <Ionicons 
                      name={trigger.icon} 
                      size={24} 
                      color={selectedTriggers.includes(trigger.id) ? COLORS.primary : COLORS.textSecondary} 
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
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
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
            activeOpacity={0.7}
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
              color={selectedTriggers.length > 0 ? '#FFFFFF' : COLORS.textMuted} 
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
    alignItems: 'center',
    marginBottom: 24,
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
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },
  triggerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  triggerCardWrapper: {
    width: '48%',
    marginBottom: 12,
    aspectRatio: 1,
  },
  triggerCard: {
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
  triggerCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  triggerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  triggerIconContainerSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  triggerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
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

export default TriggerAnalysisStep; 