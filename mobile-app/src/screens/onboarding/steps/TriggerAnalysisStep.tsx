import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const isSelected = selectedTriggers.includes(triggerId);
    
    // Animate the card
    Animated.sequence([
      Animated.timing(cardAnimations.current[triggerId], {
        toValue: 0.97,
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
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
            <View style={[styles.progressFill, { width: `${(5/9) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Step 5 of 9</Text>
        </View>

        {/* Main Content with ScrollView */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
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
                        size={22} 
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
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={18} color={COLORS.textSecondary} />
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
              Continue
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={18} 
              color={selectedTriggers.length > 0 ? COLORS.text : COLORS.textMuted} 
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
    alignItems: 'center',
    marginBottom: SPACING.xl,
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
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },
  triggerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  triggerCardWrapper: {
    width: '48.5%',
  },
  triggerCard: {
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
  triggerCardSelected: {
    borderColor: 'rgba(139, 92, 246, 0.3)',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  triggerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  triggerIconContainerSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  triggerLabel: {
    fontSize: FONTS.sm,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  triggerLabelSelected: {
    color: COLORS.text,
    fontWeight: '500',
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

export default TriggerAnalysisStep; 