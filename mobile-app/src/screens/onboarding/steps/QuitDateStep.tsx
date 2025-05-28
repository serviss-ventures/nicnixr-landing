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
      subtitle: 'Begin automatic tracking immediately',
      date: now,
      recommended: true,
    },
    {
      id: 'tomorrow',
      title: 'Tomorrow',
      subtitle: 'Start tracking with your first day',
      date: tomorrow,
    },
    {
      id: 'weekend',
      title: 'This Weekend',
      subtitle: 'Begin when you have time to focus',
      date: nextWeekend,
    },
    {
      id: 'custom',
      title: 'Choose Date',
      subtitle: 'Set your perfect tracking start',
      date: customDate,
    },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    
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
    setShowCustomDateModal(false);
  };

  const handleContinue = async () => {
    if (!selectedOption) {
      Alert.alert('Choose Your Date', 'Please select when you want to start.');
      return;
    }

    const selectedQuitOption = quitOptions.find(option => option.id === selectedOption);
    if (!selectedQuitOption) return;

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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#1A1A2E', '#16213E']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Set Your Freedom Date</Text>
          <Text style={styles.subtitle}>
            Choose when your automatic recovery tracking begins. We'll monitor your progress 24/7 from this moment forward.
          </Text>
          <View style={styles.trackingBadge}>
            <Ionicons name="pulse" size={16} color="#10B981" />
            <Text style={styles.trackingText}>Automatic Progress Tracking</Text>
          </View>
        </View>

        {/* Options */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.optionsContainer}>
            {quitOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  selectedOption === option.id && styles.selectedCard,
                ]}
                onPress={() => handleOptionSelect(option.id)}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionLeft}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                    {option.id !== 'immediate' && (
                      <Text style={styles.optionDate}>
                        {formatDate(option.id === 'custom' ? customDate : option.date)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.optionRight}>
                    {option.recommended && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>Recommended</Text>
                      </View>
                    )}
                    <View style={[
                      styles.radioButton,
                      selectedOption === option.id && styles.radioButtonSelected
                    ]}>
                      {selectedOption === option.id && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Automatic Tracking Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What We'll Track Automatically</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="time" size={16} color="#10B981" />
                <Text style={styles.featureText}>Days, hours, minutes clean</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="heart" size={16} color="#10B981" />
                <Text style={styles.featureText}>Health recovery progress</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="cash" size={16} color="#10B981" />
                <Text style={styles.featureText}>Money saved & life regained</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="trending-up" size={16} color="#10B981" />
                <Text style={styles.featureText}>Recovery milestones & insights</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.continueButton, !selectedOption && styles.continueButtonDisabled]} 
            onPress={handleContinue}
            disabled={!selectedOption}
          >
            <LinearGradient
              colors={selectedOption ? ['#10B981', '#059669'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.continueButtonGradient}
            >
              <Ionicons name="pulse" size={20} color={selectedOption ? "#FFFFFF" : "rgba(255,255,255,0.4)"} />
              <Text style={[
                styles.continueButtonText,
                !selectedOption && styles.continueButtonTextDisabled
              ]}>
                Start Automatic Tracking
              </Text>
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
              <Text style={styles.modalTitle}>Choose Your Date</Text>
              
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
                  style={styles.modalCancelButton}
                  onPress={() => setShowCustomDateModal(false)}
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
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    paddingTop: SPACING['3xl'],
    paddingBottom: SPACING['2xl'],
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  optionsContainer: {
    paddingBottom: SPACING.xl,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  optionLeft: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  optionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  optionDate: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  optionRight: {
    alignItems: 'flex-end',
  },
  recommendedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#10B981',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  continueButton: {
    flex: 1,
    height: 56,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
  },
  continueButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: SPACING.xl,
    borderTopRightRadius: SPACING.xl,
    padding: SPACING.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  datePickerContainer: {
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalCancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  modalConfirmButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#10B981',
    borderRadius: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trackingBadge: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.lg,
    marginTop: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  trackingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: SPACING.xs,
  },
  featuresContainer: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  featuresList: {
    gap: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
});

export default QuitDateStep; 