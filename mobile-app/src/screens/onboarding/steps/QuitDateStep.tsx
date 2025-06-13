import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Platform, SafeAreaView, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../../constants/theme';
import * as Haptics from 'expo-haptics';

interface QuitOption {
  id: 'immediate' | 'tomorrow' | 'weekend' | 'custom';
  title: string;
  subtitle: string;
  date: Date;
  icon: string;
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
  
  // Set to start of today (midnight) for "Right Now"
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Tomorrow at midnight
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Next Saturday
  const nextWeekend = new Date(today);
  const currentDay = today.getDay();
  const daysUntilSaturday = currentDay === 6 ? 7 : (6 - currentDay); // If today is Saturday, get next Saturday
  nextWeekend.setDate(today.getDate() + daysUntilSaturday);
  
  const quitOptions: QuitOption[] = [
    {
      id: 'immediate',
      title: 'Today',
      subtitle: 'Start your journey now',
      date: today,
      icon: 'flash',
    },
    {
      id: 'tomorrow',
      title: 'Tomorrow',
      subtitle: 'One more day to prepare',
      date: tomorrow,
      icon: 'sunny',
    },
    {
      id: 'weekend',
      title: 'This Weekend',
      subtitle: 'Begin with less stress',
      date: nextWeekend,
      icon: 'calendar',
    },
    {
      id: 'custom',
      title: 'Choose Date',
      subtitle: 'Pick your perfect day',
      date: customDate,
      icon: 'time',
    },
  ];

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleOptionSelect = (optionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOption(optionId);
    
    if (optionId === 'custom') {
      if (Platform.OS === 'ios') {
        setShowCustomDateModal(true);
      } else {
        setShowDatePicker(true);
      }
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        Alert.alert('Invalid Date', 'Please choose today or a future date.');
        return;
      }
      
      setCustomDate(selectedDate);
    }
  };

  const handleCustomDateConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCustomDateModal(false);
  };

  const handleContinue = async () => {
    if (!selectedOption) {
      Alert.alert('Choose Your Date', 'Please select when you want to start.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const selectedQuitOption = quitOptions.find(option => option.id === selectedOption);
    if (!selectedQuitOption) return;

    const finalDate = selectedOption === 'custom' ? customDate : selectedQuitOption.date;
    
    // Ensure date is set to start of day for consistency
    finalDate.setHours(0, 0, 0, 0);

    // Map the selection to a quit approach type for backward compatibility
    let quitApproach: 'immediate' | 'gradual' | 'preparation';
    if (selectedOption === 'immediate') {
      quitApproach = 'immediate';
    } else if (selectedOption === 'tomorrow') {
      quitApproach = 'preparation';
    } else {
      quitApproach = 'gradual';
    }

    const quitData = {
      quitDate: finalDate.toISOString(),
      quitApproach,
      quitDateSelection: selectedOption, // Store the original selection
      quitDateFormatted: formatDate(finalDate), // Store formatted date for display
    };

    dispatch(updateStepData(quitData));
    await dispatch(saveOnboardingProgress(quitData));
    dispatch(nextStep());
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(previousStep());
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(7/9) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Step 7 of 9</Text>
        </View>

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Set Your Freedom Date</Text>
            <Text style={styles.subtitle}>
              When do you want to begin your nicotine-free life?
            </Text>
          </View>

          {/* Options Grid */}
          <View style={styles.optionsContainer}>
            <View style={styles.optionsGrid}>
              {quitOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    selectedOption === option.id && styles.selectedCard,
                  ]}
                  onPress={() => handleOptionSelect(option.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.iconContainer,
                    selectedOption === option.id && styles.selectedIconContainer
                  ]}>
                    <Ionicons 
                      name={option.icon as any} 
                      size={22} 
                      color={selectedOption === option.id ? COLORS.primary : COLORS.textSecondary} 
                    />
                  </View>
                  <Text style={[
                    styles.optionTitle,
                    selectedOption === option.id && styles.selectedText
                  ]}>
                    {option.title}
                  </Text>
                  <Text style={styles.optionSubtitle}>
                    {option.subtitle}
                  </Text>
                  {option.id !== 'custom' && (
                    <Text style={[
                      styles.optionDate,
                      selectedOption === option.id && styles.selectedDate
                    ]}>
                      {formatDate(option.date)}
                    </Text>
                  )}
                  {option.id === 'custom' && selectedOption === 'custom' && (
                    <Text style={[styles.optionDate, styles.selectedDate]}>
                      {formatDate(customDate)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={18} color={COLORS.textSecondary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.continueButton, !selectedOption && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!selectedOption}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.continueButtonText,
              !selectedOption && styles.continueButtonTextDisabled
            ]}>
              Continue
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={18} 
              color={selectedOption ? COLORS.text : COLORS.textMuted} 
            />
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
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose Your Date</Text>
              </View>
              
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={customDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  textColor="#FFFFFF"
                  themeVariant="dark"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowCustomDateModal(false);
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalConfirmButton}
                  onPress={handleCustomDateConfirm}
                >
                  <Text style={styles.modalConfirmText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl * 1.5,
  },
  header: {
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: FONTS['2xl'],
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },
  optionsContainer: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    minHeight: 115,
    justifyContent: 'center',
  },
  selectedCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  selectedIconContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  optionTitle: {
    fontSize: FONTS.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
    textAlign: 'center',
  },
  selectedText: {
    color: COLORS.primary,
  },
  optionSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    fontWeight: '400',
  },
  optionDate: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedDate: {
    color: COLORS.primary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingBottom: SPACING.xl * 2,
  },
  modalHeader: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalTitle: {
    fontSize: FONTS.lg,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  datePickerContainer: {
    paddingVertical: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  modalCancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalCancelText: {
    fontSize: FONTS.base,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  modalConfirmButton: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalConfirmText: {
    fontSize: FONTS.base,
    fontWeight: '500',
    color: COLORS.text,
  },
});

export default QuitDateStep; 