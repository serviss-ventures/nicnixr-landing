import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../constants/theme';

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
          colors={['#000000', '#000000']}
          style={styles.resetModalGradient}
        >
          {/* Clean Header */}
          <View style={styles.resetModalHeader}>
            <View style={styles.resetModalHeaderContent}>
              <Ionicons name="settings-outline" size={20} color={COLORS.textSecondary} />
              <Text style={styles.resetModalTitle}>Manage Progress</Text>
            </View>
            <TouchableOpacity
              style={styles.resetModalCloseButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.resetModalContent}
            contentContainerStyle={styles.resetModalContentContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
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
                      ? ['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.03)']
                      : ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                    style={styles.resetTypeOptionGradient}
                  >
                    <Ionicons 
                      name="refresh-outline" 
                      size={20} 
                      color={resetType === 'relapse' ? COLORS.textSecondary : COLORS.textMuted} 
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
                        <View style={[styles.resetTypeRadioInner, { backgroundColor: 'rgba(245, 158, 11, 0.6)' }]} />
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
                      ? ['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.03)']
                      : ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                    style={styles.resetTypeOptionGradient}
                  >
                    <Ionicons 
                      name="trash-outline" 
                      size={20} 
                      color={resetType === 'fresh_start' ? COLORS.textSecondary : COLORS.textMuted} 
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
                        <View style={[styles.resetTypeRadioInner, { backgroundColor: 'rgba(239, 68, 68, 0.6)' }]} />
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
                      ? ['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.03)']
                      : ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                    style={styles.resetTypeOptionGradient}
                  >
                    <Ionicons 
                      name="create-outline" 
                      size={20} 
                      color={resetType === 'correction' ? COLORS.textSecondary : COLORS.textMuted} 
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
                        <View style={[styles.resetTypeRadioInner, { backgroundColor: 'rgba(16, 185, 129, 0.6)' }]} />
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
                    colors={['rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.02)']}
                    style={styles.resetDateDisplayGradient}
                  >
                    <Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} />
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
                  ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.08)']
                  : resetType === 'correction'
                  ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.08)']
                  : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.08)']}
                style={styles.resetCompactConfirmGradient}
              >
                <Ionicons 
                  name={resetType === 'fresh_start' ? 'trash-outline' : 
                        resetType === 'correction' ? 'checkmark-circle-outline' :
                        'refresh-outline'} 
                  size={18} 
                  color={COLORS.text} 
                />
                <Text style={styles.resetCompactConfirmText}>
                  {resetType === 'relapse' ? 'Continue' : 
                   resetType === 'fresh_start' ? 'Reset All' : 
                   'Update'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          </ScrollView>

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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  resetModalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetModalTitle: {
    fontSize: FONTS.lg,
    fontWeight: '400',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  resetModalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  resetModalContent: {
    flex: 1,
  },
  resetModalContentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  resetQuestion: {
    fontSize: 20,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  resetTypeSelection: {
    gap: SPACING.sm,
  },
  resetTypeOption: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  resetTypeOptionSelected: {
    // No transform, just color changes
  },
  resetTypeOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BORDER_RADIUS.lg,
  },
  resetTypeOptionText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  resetTypeOptionTitle: {
    fontSize: FONTS.base,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 4,
  },
  resetTypeOptionTitleSelected: {
    fontWeight: '500',
  },
  resetTypeOptionSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
    lineHeight: 16,
    fontWeight: '400',
  },
  resetTypeRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  resetTypeRadioSelected: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  resetTypeRadioInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  resetDateSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  resetSectionTitle: {
    fontSize: FONTS.base,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  resetDateDisplay: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  resetDateDisplayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  resetDateText: {
    fontSize: FONTS.base,
    fontWeight: '400',
    color: COLORS.text,
    flex: 1,
  },
  resetQuickDates: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  resetQuickDateButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  resetQuickDateButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetQuickDateText: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
  resetQuickDateTextActive: {
    color: COLORS.text,
    fontWeight: '500',
  },

  // Action Buttons
  resetCompactActions: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  resetCompactCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  resetCompactCancelText: {
    fontSize: FONTS.base,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  resetCompactConfirm: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  resetCompactConfirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: SPACING.xs,
  },
  resetCompactConfirmText: {
    fontSize: FONTS.base,
    fontWeight: '500',
    color: COLORS.text,
  },

  // Date Picker Styles
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#0A0F1C',
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
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  datePickerCancel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  datePickerTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: COLORS.text,
  },
  datePickerDone: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default ResetProgressModal; 