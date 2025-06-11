import React, { useState, useRef, useEffect } from 'react';
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
  Platform,
  Keyboard,
  Modal
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
  
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    stepData.simplifiedTriggers || stepData.cravingTriggers || []
  );
  const [customTrigger, setCustomTrigger] = useState(
    stepData.customCravingTrigger || ''
  );
  const [showCustomInput, setShowCustomInput] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Card animations for each trigger
  const cardAnimations = useRef<{[key: string]: {scale: Animated.Value, opacity: Animated.Value}}>({});
  
  // Initialize animations for each trigger
  SIMPLE_TRIGGERS.forEach(trigger => {
    if (!cardAnimations.current[trigger.id]) {
      cardAnimations.current[trigger.id] = {
        scale: new Animated.Value(1),
        opacity: new Animated.Value(1),
      };
    }
  });

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTriggerToggle = (triggerId: string) => {
    const isSelected = selectedTriggers.includes(triggerId);
    
    // Animate the card
    Animated.parallel([
      Animated.spring(cardAnimations.current[triggerId].scale, {
        toValue: isSelected ? 1 : 1.05,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnimations.current[triggerId].opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset scale after animation
      Animated.spring(cardAnimations.current[triggerId].scale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    });

    setSelectedTriggers(prev => {
      if (triggerId === 'other' && !isSelected) {
        // When selecting "other", show the custom input modal
        setShowCustomInput(true);
        return [...prev, triggerId];
      } else if (triggerId === 'other' && isSelected) {
        // When deselecting "other", clear the custom input
        setCustomTrigger('');
        return prev.filter(id => id !== triggerId);
      }
      
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

  const closeCustomInput = () => {
    setShowCustomInput(false);
    // If closing without saving anything, deselect "other"
    if (customTrigger.trim().length === 0) {
      setSelectedTriggers(prev => prev.filter(id => id !== 'other'));
    }
  };

  const saveCustomInput = () => {
    setShowCustomInput(false);
    // Keep "other" selected if there's content
    if (customTrigger.trim().length === 0) {
      setSelectedTriggers(prev => prev.filter(id => id !== 'other'));
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[COLORS.accent, '#EC4899']}
            style={[styles.progressFill, { width: '50%' }]}
          />
        </View>
                      <Text style={styles.progressText}>Step 5 of 9</Text>
      </View>

      {/* Simple Header */}
      <View style={styles.header}>
        <Text style={styles.title}>When do cravings hit hardest?</Text>
        <Text style={styles.subtitle}>
          Select all that apply - knowing helps us support you better
        </Text>
      </View>

      {/* Simplified Grid */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.triggerGrid}>
          {SIMPLE_TRIGGERS.map((trigger) => (
            <Animated.View
              key={trigger.id}
              style={[
                styles.triggerCardWrapper,
                {
                  transform: [{ scale: cardAnimations.current[trigger.id].scale }],
                  opacity: cardAnimations.current[trigger.id].opacity,
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
                <View 
                  style={[
                    styles.triggerIconContainer,
                    { backgroundColor: trigger.iconBg },
                    selectedTriggers.includes(trigger.id) && styles.triggerIconContainerSelected
                  ]}
                >
                  <Ionicons 
                    name={trigger.icon} 
                    size={26} 
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
            </Animated.View>
          ))}
        </View>

        {/* Selection Indicator - matching Step 3 */}
        {selectedTriggers.length > 0 && (
          <View style={styles.selectionIndicator}>
            <Text style={styles.selectionText}>
              {selectedTriggers.length} trigger{selectedTriggers.length > 1 ? 's' : ''} selected
            </Text>
            <View style={styles.selectionDots}>
              {selectedTriggers.map((id) => {
                const trigger = SIMPLE_TRIGGERS.find(t => t.id === id);
                return (
                  <View 
                    key={id} 
                    style={[styles.selectionDot, { backgroundColor: trigger?.iconColor }]} 
                  />
                );
              })}
            </View>
          </View>
        )}

        <Text style={styles.encouragement}>
          {selectedTriggers.length === 0 
            ? "Tap any that apply - we'll keep this quick"
            : selectedTriggers.length === 1
            ? "Good start! Add more or continue when ready"
            : selectedTriggers.length < 4
            ? "Great choices! Feel free to add more"
            : "Perfect! That's plenty to work with"
          }
        </Text>
      </Animated.View>

      {/* Navigation - always visible at bottom */}
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
                ? [COLORS.accent, '#EC4899']
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

      {/* Custom Input Modal */}
      <Modal
        visible={showCustomInput}
        animationType="slide"
        transparent={true}
        onRequestClose={closeCustomInput}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={closeCustomInput}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            <View style={styles.modalContent}>
              <View style={styles.dragIndicator} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tell us about your specific trigger</Text>
                <TouchableOpacity onPress={closeCustomInput} style={styles.modalCloseButton}>
                  <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalSubtitle}>
                What specific situations make you crave nicotine?
              </Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., During phone calls, watching TV, after coffee..."
                placeholderTextColor={COLORS.textMuted}
                value={customTrigger}
                onChangeText={setCustomTrigger}
                multiline
                numberOfLines={4}
                maxLength={100}
                autoFocus
              />
              
              <View style={styles.modalFooter}>
                <Text style={styles.characterCount}>
                  {customTrigger.length}/100 characters
                </Text>
                <TouchableOpacity 
                  style={[
                    styles.modalSaveButton,
                    customTrigger.trim().length === 0 && styles.modalSaveButtonDisabled
                  ]}
                  onPress={saveCustomInput}
                  disabled={customTrigger.trim().length === 0}
                >
                  <Text style={[
                    styles.modalSaveButtonText,
                    customTrigger.trim().length === 0 && styles.modalSaveButtonTextDisabled
                  ]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
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
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  selectionCount: {
    fontSize: 14,
    color: COLORS.accent,
    marginTop: SPACING.sm,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  triggerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  triggerCardWrapper: {
    width: '31%',
    marginBottom: SPACING.md,
  },
  triggerCard: {
    aspectRatio: 0.95,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
    padding: SPACING.sm,
  },
  triggerCardSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: COLORS.accent,
    transform: [{ scale: 1.02 }],
  },
  triggerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  triggerIconContainerSelected: {
    transform: [{ scale: 1.05 }],
  },
  triggerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 2,
  },
  triggerLabelSelected: {
    color: COLORS.accent,
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  selectionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
    fontWeight: '600',
  },
  selectionDots: {
    flexDirection: 'row',
    gap: 4,
  },
  selectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  encouragement: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 20, 30, 0.98)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: Math.max(SPACING.xl, 34),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
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
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl + 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalKeyboardView: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface || '#1f1f1f',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl * 2 : SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalCloseButton: {
    padding: SPACING.md,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: SPACING.lg,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  modalSaveButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: SPACING.lg,
    alignSelf: 'center',
  },
  modalSaveButtonDisabled: {
    opacity: 0.5,
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  modalSaveButtonTextDisabled: {
    color: COLORS.textMuted,
  },
});

export default TriggerAnalysisStep; 