import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

interface QuitOption {
  id: 'immediate' | 'tomorrow' | 'weekend' | 'custom';
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  date: Date;
  recommended?: boolean;
}

const QuitDateStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);
  
  const [selectedOption, setSelectedOption] = useState<string>(stepData.quitApproach || '');
  const [customDate, setCustomDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);

  // Calculate quit date options
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeekend = new Date(now);
  const daysUntilSaturday = (6 - now.getDay()) % 7;
  nextWeekend.setDate(now.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
  
  const quitOptions: QuitOption[] = [
    {
      id: 'immediate',
      title: 'Right Now',
      subtitle: 'Start your freedom journey immediately',
      icon: 'flash',
      color: '#10B981',
      date: now,
      recommended: true,
    },
    {
      id: 'tomorrow',
      title: 'Tomorrow Morning',
      subtitle: 'Wake up to your first day of freedom',
      icon: 'sunny',
      color: '#F59E0B',
      date: tomorrow,
    },
    {
      id: 'weekend',
      title: 'This Weekend',
      subtitle: 'Start fresh when you have more time',
      icon: 'calendar',
      color: '#8B5CF6',
      date: nextWeekend,
    },
    {
      id: 'custom',
      title: 'Choose Your Date',
      subtitle: 'Pick the perfect moment for you',
      icon: 'time',
      color: '#06B6D4',
      date: customDate,
    },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    
    // If custom option is selected, show date picker
    if (optionId === 'custom') {
      if (Platform.OS === 'ios') {
        setShowCustomDateModal(true);
      } else {
        setShowDatePicker(true);
      }
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      // Ensure the selected date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        Alert.alert(
          'Invalid Date',
          'Please choose a date that is today or in the future.'
        );
        return;
      }
      
      setCustomDate(selectedDate);
    }
  };

  const handleCustomDateConfirm = () => {
    setShowCustomDateModal(false);
    // Custom date is already set via handleDateChange
  };

  const handleContinue = async () => {
    if (!selectedOption) {
      Alert.alert(
        'Choose Your Freedom Date',
        'Select when you want to begin your journey to freedom.'
      );
      return;
    }

    const selectedQuitOption = quitOptions.find(option => option.id === selectedOption);
    if (!selectedQuitOption) return;

    // Use custom date if custom option is selected
    const finalDate = selectedOption === 'custom' ? customDate : selectedQuitOption.date;

    const quitData = {
      quitDate: finalDate.toISOString(),
      quitApproach: selectedOption as 'immediate' | 'gradual' | 'preparation',
    };

    dispatch(updateStepData(quitData));
    await dispatch(saveOnboardingProgress(quitData));
    dispatch(nextStep());
  };

  const handleBack = () => {
    dispatch(previousStep());
  };

  const renderQuitOption = (option: QuitOption) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.optionCard,
        selectedOption === option.id && styles.selectedOptionCard,
      ]}
      onPress={() => handleOptionSelect(option.id)}
    >
      <LinearGradient
        colors={
          selectedOption === option.id
            ? [`${option.color}30`, `${option.color}20`]
            : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
        }
        style={styles.optionGradient}
      >
        <View style={styles.optionContent}>
          <View style={styles.optionHeader}>
            <View style={[styles.optionIcon, { backgroundColor: `${option.color}20` }]}>
              <Ionicons name={option.icon as any} size={24} color={option.color} />
            </View>
            <View style={styles.optionTextContainer}>
              <View style={styles.optionTitleRow}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                {option.recommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Recommended</Text>
                  </View>
                )}
              </View>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            {selectedOption === option.id && (
              <Ionicons name="checkmark-circle" size={24} color={option.color} />
            )}
          </View>
          
          {/* Date Display */}
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {option.id === 'immediate' ? 'Starting now' : formatDate(option.id === 'custom' ? customDate : option.date)}
            </Text>
            {option.id !== 'immediate' && (
              <Text style={styles.timeText}>
                {formatTime(option.id === 'custom' ? customDate : option.date)}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={[styles.progressFill, { width: '75%' }]}
          />
        </View>
        <Text style={styles.progressText}>Step 6 of 8</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.3)', 'rgba(6, 182, 212, 0.3)']}
            style={styles.headerIcon}
          >
            <Ionicons name="rocket" size={32} color={COLORS.primary} />
          </LinearGradient>
          <Text style={styles.title}>Your Freedom Date</Text>
          <Text style={styles.subtitle}>
            Choose the moment you'll break free from addiction forever. 
            This is your personal liberation day.
          </Text>
        </View>

        {/* Quit Options */}
        <View style={styles.optionsContainer}>
          {quitOptions.map(renderQuitOption)}
        </View>

        {/* Encouragement */}
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.1)', 'rgba(139, 92, 246, 0.1)']}
          style={styles.encouragementCard}
        >
          <Ionicons name="heart" size={24} color="#EC4899" />
          <Text style={styles.encouragementText}>
            Remember: There's no "perfect" time to quit. The best time is when you're ready to commit. 
            Your future self will thank you for choosing freedom today.
          </Text>
        </LinearGradient>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.continueButton, !selectedOption && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          disabled={!selectedOption}
        >
          <LinearGradient
            colors={
              selectedOption 
                ? [COLORS.primary, COLORS.secondary] 
                : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
            }
            style={styles.continueButtonGradient}
          >
            <Text style={[
              styles.continueButtonText,
              !selectedOption && styles.continueButtonTextDisabled
            ]}>
              Set My Freedom Date
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color={selectedOption ? COLORS.text : COLORS.textMuted} 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Android Date Picker */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={customDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* iOS Custom Date Modal */}
      <Modal
        visible={showCustomDateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#1E293B', '#0F172A']}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>Choose Your Freedom Date</Text>
              <Text style={styles.modalSubtitle}>
                Select the date you want to start your journey to freedom
              </Text>
              
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={customDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  textColor={COLORS.text}
                  themeVariant="dark"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowCustomDateModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={handleCustomDateConfirm}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    style={styles.confirmButtonGradient}
                  >
                    <Text style={styles.confirmButtonText}>Confirm Date</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
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
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  optionsContainer: {
    marginBottom: SPACING['2xl'],
  },
  optionCard: {
    marginBottom: SPACING.md,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOptionCard: {
    borderColor: COLORS.primary,
  },
  optionGradient: {
    padding: SPACING.lg,
  },
  optionContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  recommendedBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: SPACING.sm,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  optionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  dateContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.sm,
    padding: SPACING.sm,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  encouragementCard: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  encouragementText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginLeft: SPACING.md,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: SPACING.xl,
    borderRadius: SPACING.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  datePickerContainer: {
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  confirmButton: {
    flex: 1,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default QuitDateStep; 