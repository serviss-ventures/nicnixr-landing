import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, SPACING } from '../../constants/theme';

interface ResetProgressModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (resetType: 'relapse' | 'fresh_start' | 'correction', newQuitDate: Date) => void;
}

const ResetProgressModal: React.FC<ResetProgressModalProps> = ({ 
  visible, 
  onClose,
  onConfirm
}) => {
  const [resetType, setResetType] = useState<'relapse' | 'fresh_start' | 'correction'>('relapse');
  const [newQuitDate, setNewQuitDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Reset state when modal opens
  React.useEffect(() => {
    if (visible) {
      const today = new Date();
      setNewQuitDate(today);
      setResetType('relapse');
    }
  }, [visible]);

  const handleRelapseSelect = useCallback(() => setResetType('relapse'), []);
  const handleFreshStartSelect = useCallback(() => setResetType('fresh_start'), []);
  const handleCorrectionSelect = useCallback(() => setResetType('correction'), []);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      setNewQuitDate(selectedDate);
    }
    setShowDatePicker(false);
  };

  const confirmReset = async () => {
    if (newQuitDate > new Date()) {
      Alert.alert('Invalid Date', 'Please select a date in the past.');
      return;
    }

    const resetTypeMessages = {
      relapse: {
        title: 'Continue Recovery?',
        message: `This will start a new streak from ${newQuitDate.toLocaleDateString()}, while preserving your total progress and achievements. Your longest streak will be saved.`,
        confirmText: 'Continue Recovery'
      },
      fresh_start: {
        title: 'Reset All Progress?',
        message: `This will reset ALL progress to zero and start completely over from ${newQuitDate.toLocaleDateString()}. This cannot be undone.`,
        confirmText: 'Reset Everything'
      },
      correction: {
        title: 'Update Quit Date?',
        message: `This will update your quit date to ${newQuitDate.toLocaleDateString()} and recalculate all your progress based on the correct timeline.`,
        confirmText: 'Update Date'
      }
    };

    const config = resetTypeMessages[resetType];

    Alert.alert(
      config.title,
      config.message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: config.confirmText,
          style: resetType === 'fresh_start' ? 'destructive' : 'default',
          onPress: () => {
            onConfirm(resetType, newQuitDate);
            onClose();
          }
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.resetModalContainer} edges={['top', 'left', 'right', 'bottom']}>
        <LinearGradient
          colors={['#000000', '#0A0F1C']}
          style={styles.resetModalGradient}
        >
          {/* Clean Header */}
          <View style={styles.resetModalHeader}>
            <View style={styles.resetModalHeaderContent}>
              <Ionicons name="refresh-circle" size={24} color="#F59E0B" />
              <Text style={styles.resetModalTitle}>Update Progress</Text>
            </View>
            <TouchableOpacity
              style={styles.resetModalCloseButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.resetModalContent}>
            <View>
              {/* Question Section */}
              <Text style={styles.resetQuestion}>What happened?</Text>

              {/* Reset Type Options - Beautiful Cards */}
              <View style={styles.resetTypeSelection}>
                {/* Relapse Option */}
                <TouchableOpacity
                  style={[
                    styles.resetTypeOption,
                    resetType === 'relapse' && styles.resetTypeOptionSelected
                  ]}
                  onPress={handleRelapseSelect}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={resetType === 'relapse' 
                      ? ['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.08)']
                      : ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                    style={styles.resetTypeOptionGradient}
                  >
                    <Ionicons 
                      name="refresh-outline" 
                      size={24} 
                      color={resetType === 'relapse' ? '#F59E0B' : COLORS.textSecondary} 
                    />
                    <View style={styles.resetTypeOptionText}>
                      <Text style={[
                        styles.resetTypeOptionTitle,
                        resetType === 'relapse' && styles.resetTypeOptionTitleSelected
                      ]}>
                        Relapse - Continue Recovery
                      </Text>
                      <Text style={styles.resetTypeOptionSubtitle}>
                        Keep achievements, new streak from recovery date
                      </Text>
                    </View>
                    <View style={[
                      styles.resetTypeRadio,
                      resetType === 'relapse' && styles.resetTypeRadioSelected
                    ]}>
                      {resetType === 'relapse' && (
                        <View style={styles.resetTypeRadioInner} />
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Fresh Start Option */}
                <TouchableOpacity
                  style={[
                    styles.resetTypeOption,
                    resetType === 'fresh_start' && styles.resetTypeOptionSelected
                  ]}
                  onPress={handleFreshStartSelect}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={resetType === 'fresh_start' 
                      ? ['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.08)']
                      : ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                    style={styles.resetTypeOptionGradient}
                  >
                    <Ionicons 
                      name="trash-outline" 
                      size={24} 
                      color={resetType === 'fresh_start' ? '#EF4444' : COLORS.textSecondary} 
                    />
                    <View style={styles.resetTypeOptionText}>
                      <Text style={[
                        styles.resetTypeOptionTitle,
                        resetType === 'fresh_start' && styles.resetTypeOptionTitleSelected
                      ]}>
                        Fresh Start - Reset All
                      </Text>
                      <Text style={styles.resetTypeOptionSubtitle}>
                        Reset everything to zero, start completely over
                      </Text>
                    </View>
                    <View style={[
                      styles.resetTypeRadio,
                      resetType === 'fresh_start' && styles.resetTypeRadioSelected
                    ]}>
                      {resetType === 'fresh_start' && (
                        <View style={[styles.resetTypeRadioInner, { backgroundColor: '#EF4444' }]} />
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Date Correction Option */}
                <TouchableOpacity
                  style={[
                    styles.resetTypeOption,
                    resetType === 'correction' && styles.resetTypeOptionSelected
                  ]}
                  onPress={handleCorrectionSelect}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={resetType === 'correction' 
                      ? ['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.08)']
                      : ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                    style={styles.resetTypeOptionGradient}
                  >
                    <Ionicons 
                      name="create-outline" 
                      size={24} 
                      color={resetType === 'correction' ? '#10B981' : COLORS.textSecondary} 
                    />
                    <View style={styles.resetTypeOptionText}>
                      <Text style={[
                        styles.resetTypeOptionTitle,
                        resetType === 'correction' && styles.resetTypeOptionTitleSelected
                      ]}>
                        Date Correction - Fix Date
                      </Text>
                      <Text style={styles.resetTypeOptionSubtitle}>
                        Correct wrong date, adjust timeline accordingly
                      </Text>
                    </View>
                    <View style={[
                      styles.resetTypeRadio,
                      resetType === 'correction' && styles.resetTypeRadioSelected
                    ]}>
                      {resetType === 'correction' && (
                        <View style={[styles.resetTypeRadioInner, { backgroundColor: '#10B981' }]} />
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Date Selection Section */}
              <View style={styles.resetDateSection}>
                <Text style={styles.resetSectionTitle}>
                  {resetType === 'relapse' ? 'When did you use?' : 
                   resetType === 'correction' ? 'Correct quit date' : 
                   'New start date'}
                </Text>
                
                {/* Beautiful Date Display */}
                <TouchableOpacity 
                  style={styles.resetDateDisplay}
                  onPress={() => setShowDatePicker(!showDatePicker)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(245, 158, 11, 0.1)', 'rgba(245, 158, 11, 0.05)']}
                    style={styles.resetDateDisplayGradient}
                  >
                    <Ionicons name="calendar" size={20} color="#F59E0B" />
                    <Text style={styles.resetDateText}>
                      {newQuitDate.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Quick Date Options */}
                <View style={styles.resetQuickDates}>
                  <TouchableOpacity
                    style={[
                      styles.resetQuickDateButton,
                      newQuitDate.toDateString() === new Date().toDateString() && styles.resetQuickDateButtonActive
                    ]}
                    onPress={() => setNewQuitDate(new Date())}
                  >
                    <Text style={[
                      styles.resetQuickDateText,
                      newQuitDate.toDateString() === new Date().toDateString() && styles.resetQuickDateTextActive
                    ]}>Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.resetQuickDateButton,
                      (() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        return newQuitDate.toDateString() === yesterday.toDateString();
                      })() && styles.resetQuickDateButtonActive
                    ]}
                    onPress={() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      setNewQuitDate(yesterday);
                    }}
                  >
                    <Text style={[
                      styles.resetQuickDateText,
                      (() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        return newQuitDate.toDateString() === yesterday.toDateString();
                      })() && styles.resetQuickDateTextActive
                    ]}>Yesterday</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.resetQuickDateButton,
                      (() => {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return newQuitDate.toDateString() === weekAgo.toDateString();
                      })() && styles.resetQuickDateButtonActive
                    ]}
                    onPress={() => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      setNewQuitDate(weekAgo);
                    }}
                  >
                    <Text style={[
                      styles.resetQuickDateText,
                      (() => {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return newQuitDate.toDateString() === weekAgo.toDateString();
                      })() && styles.resetQuickDateTextActive
                    ]}>1 Week Ago</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Elegant Compact Action Buttons */}
          <View style={styles.resetCompactActions}>
            <TouchableOpacity
              style={styles.resetCompactCancel}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.resetCompactCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.resetCompactConfirm}
              onPress={confirmReset}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={resetType === 'fresh_start' 
                  ? ['#EF4444', '#DC2626']
                  : resetType === 'correction'
                  ? ['#10B981', '#059669']
                  : ['#F59E0B', '#D97706']}
                style={styles.resetCompactConfirmGradient}
              >
                <Ionicons 
                  name={resetType === 'fresh_start' ? 'trash' : 
                        resetType === 'correction' ? 'checkmark-circle' :
                        'refresh'} 
                  size={18} 
                  color="#FFFFFF" 
                />
                <Text style={styles.resetCompactConfirmText}>
                  {resetType === 'relapse' ? 'Continue' : 
                   resetType === 'fresh_start' ? 'Reset All' : 
                   'Update'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Date Picker Modal */}
          {showDatePicker && (
            <Modal
              visible={showDatePicker}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <TouchableOpacity 
                style={styles.datePickerOverlay}
                activeOpacity={1}
                onPress={() => setShowDatePicker(false)}
              >
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.datePickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.datePickerTitle}>Select Date</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.datePickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={newQuitDate}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    textColor={COLORS.text}
                    themeVariant="dark"
                    maximumDate={new Date()}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          )}
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Reset Modal Styles
  resetModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  resetModalGradient: {
    flex: 1,
  },
  resetModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  resetModalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  resetModalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  resetModalContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    justifyContent: 'space-between',
  },
  resetQuestion: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  resetTypeSelection: {
    gap: SPACING.md,
  },
  resetTypeOption: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  resetTypeOptionSelected: {
    transform: [{ scale: 0.98 }],
  },
  resetTypeOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  resetTypeOptionText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  resetTypeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  resetTypeOptionTitleSelected: {
    fontWeight: '700',
  },
  resetTypeOptionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  resetTypeRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.md,
  },
  resetTypeRadioSelected: {
    borderColor: '#F59E0B',
  },
  resetTypeRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
  },
  resetDateSection: {
    marginTop: SPACING.xl,
  },
  resetSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  resetDateDisplay: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  resetDateDisplayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  resetDateText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  resetQuickDates: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  resetQuickDateButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  resetQuickDateButtonActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  resetQuickDateText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  resetQuickDateTextActive: {
    color: '#F59E0B',
    fontWeight: '600',
  },

  // Action Buttons
  resetCompactActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  resetCompactCancel: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetCompactCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  resetCompactConfirm: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  resetCompactConfirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  resetCompactConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Date Picker Styles
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: SPACING.xl,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  datePickerCancel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  datePickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  datePickerDone: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default ResetProgressModal; 