import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

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
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeekend = new Date(now);
  const daysUntilSaturday = (6 - now.getDay()) % 7;
  nextWeekend.setDate(now.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
  
  const quitOptions: QuitOption[] = [
    {
      id: 'immediate',
      title: 'Right Now',
      subtitle: 'Start your journey today',
      date: now,
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
    <LinearGradient
      colors={['#000000', '#0A0F1C', '#0F172A']}
      style={styles.container}
    >
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(7/9) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Step 7 of 9</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Set Your Freedom Date</Text>
        <Text style={styles.subtitle}>
          When do you want to begin your nicotine-free life?
        </Text>
      </View>

      {/* Options Grid */}
      <View style={styles.content}>
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
                  size={28} 
                  color={selectedOption === option.id ? '#8B5CF6' : 'rgba(255,255,255,0.5)'} 
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

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.continueButton, !selectedOption && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          disabled={!selectedOption}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            Continue
          </Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 40,
  },
  progressContainer: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1.5,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 1.5,
  },
  progressText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontWeight: '500',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -40,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  optionCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    height: 160,
    justifyContent: 'center',
  },
  selectedCard: {
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderColor: '#8B5CF6',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  selectedIconContainer: {
    backgroundColor: 'rgba(139,92,246,0.15)',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  selectedText: {
    color: '#8B5CF6',
  },
  optionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 8,
  },
  optionDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedDate: {
    color: '#8B5CF6',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 40,
    gap: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  continueButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#8B5CF6',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  datePickerContainer: {
    paddingVertical: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
  },
  modalConfirmButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#8B5CF6',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default QuitDateStep; 