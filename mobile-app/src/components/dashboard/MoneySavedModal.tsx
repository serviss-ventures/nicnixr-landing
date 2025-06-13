import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  TextInput,
  Keyboard,
  Alert,
  ScrollView,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../constants/theme';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { 
  getProductInfo,
  getDailyPackages,
  getCostPerPackage
} from '../../services/productService';
import { calculateCostProjections, formatCost } from '../../utils/costCalculations';
import * as Haptics from 'expo-haptics';

interface MoneySavedModalProps {
  visible: boolean;
  onClose: () => void;
  stats: { 
    moneySaved?: number; 
    daysClean?: number 
  };
  userProfile: { 
    category?: string; 
    id?: string; 
    brand?: string; 
    packagesPerDay?: number; 
    dailyAmount?: number; 
    tinsPerDay?: number; 
    podsPerDay?: number;
    nicotineProduct?: {
      category?: string;
      id?: string;
      brand?: string;
    };
  };
  customDailyCost: number;
  onUpdateCost: (cost: number) => void;
  savingsGoal: string;
  savingsGoalAmount: number;
  editingGoal: boolean;
  setSavingsGoal: (goal: string) => void;
  setSavingsGoalAmount: (amount: number) => void;
  setEditingGoal: (editing: boolean) => void;
}

const MoneySavedModal: React.FC<MoneySavedModalProps> = ({ 
  visible, 
  onClose, 
  stats, 
  userProfile, 
  customDailyCost, 
  onUpdateCost,
  savingsGoal,
  savingsGoalAmount,
  editingGoal,
  setSavingsGoal,
  setSavingsGoalAmount,
  setEditingGoal
}) => {
  const [tempCost, setTempCost] = useState((customDailyCost || 14).toString());
  const [showSuccess, setShowSuccess] = useState(false);
  const [tempGoalName, setTempGoalName] = useState(savingsGoal);
  const [tempGoalAmount, setTempGoalAmount] = useState(savingsGoalAmount.toString());
  const [goalAchievedAnimation] = useState(new Animated.Value(0));
  const [goalReachedAcknowledged, setGoalReachedAcknowledged] = useState(false);
  
  const reduxUser = useSelector(selectUser);
  const currentUserProfile = reduxUser || userProfile;
  const productInfo = getProductInfo(currentUserProfile);
  const dailyPackages = getDailyPackages(currentUserProfile);
  const actualMoneySaved = stats?.moneySaved || 0;
  const realDailyCost = (stats?.daysClean || 0) > 0 ? actualMoneySaved / (stats?.daysClean || 1) : customDailyCost;
  const costPerPackage = getCostPerPackage(realDailyCost, currentUserProfile);
  
  const goalProgress = savingsGoalAmount > 0 ? Math.min((actualMoneySaved / savingsGoalAmount) * 100, 100) : 0;
  const goalReached = savingsGoal && goalProgress >= 100;
  
  useEffect(() => {
    if (visible) {
      setTempCost(costPerPackage.toFixed(2));
      // Check if goal was just reached and not yet acknowledged
      if (goalReached && !goalReachedAcknowledged) {
        // Subtle animation for goal reached
        Animated.spring(goalAchievedAnimation, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }).start();
        
        // Subtle haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } else {
      // Reset animation when modal closes
      goalAchievedAnimation.setValue(0);
    }
  }, [visible, costPerPackage, goalReached, goalReachedAcknowledged]);
  
  const handleSave = () => {
    // Validate input
    const enteredCostPerPackage = parseFloat(tempCost);
    if (isNaN(enteredCostPerPackage) || enteredCostPerPackage <= 0) {
      // If invalid, reset to current value
      setTempCost(costPerPackage.toFixed(2));
      return;
    }
    
    // Calculate and save
    const finalDailyCost = enteredCostPerPackage * dailyPackages;
    onUpdateCost(finalDailyCost);
    
    // Show success feedback
    setShowSuccess(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Dismiss keyboard smoothly
    Keyboard.dismiss();
    
    // Hide success after delay
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const handleSaveGoal = () => {
    const goalName = tempGoalName.trim();
    const goalAmount = parseFloat(tempGoalAmount) || 0;
    
    if (goalName && goalAmount > 0) {
      setSavingsGoal(goalName);
      setSavingsGoalAmount(goalAmount);
      setEditingGoal(false);
      // Reset acknowledged state when a new goal is set
      setGoalReachedAcknowledged(false);
    }
  };

  const handleNewGoal = () => {
    setGoalReachedAcknowledged(true);
    setTempGoalName('');
    setTempGoalAmount('');
    setEditingGoal(true);
  };

  const handleCloseGoalModal = () => {
    // If closing without saving a new goal, restore the previous goal values
    setTempGoalName(savingsGoal);
    setTempGoalAmount(savingsGoalAmount.toString());
    setEditingGoal(false);
  };

  const handleOpenGoalModal = () => {
    // Initialize temp values with current goal when opening
    setTempGoalName(savingsGoal);
    setTempGoalAmount(savingsGoalAmount.toString());
    setEditingGoal(true);
  };

  const handleClose = () => {
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'formSheet' : 'pageSheet'}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#0A0F1C']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Minimal Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Hero Amount - Simplified */}
              <View style={styles.heroSection}>
                <Text style={styles.heroLabel}>Total Saved</Text>
                <Text style={styles.heroAmount}>
                  ${Math.round(actualMoneySaved).toLocaleString()}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {stats?.daysClean || 0} days • ${(realDailyCost || 0).toFixed(2)}/day
                </Text>
              </View>

              {/* Cost Per Package - Minimalist */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Cost per {productInfo.packageName}</Text>
                <View style={styles.costInputRow}>
                  <View style={styles.costInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.costInput}
                      value={tempCost}
                      onChangeText={(text) => setTempCost(text.replace(/[^0-9.]/g, ''))}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor="rgba(255, 255, 255, 0.2)"
                      returnKeyType="done"
                      onSubmitEditing={handleSave}
                      blurOnSubmit={true}
                    />
                  </View>
                  <TouchableOpacity 
                    style={[styles.saveButton, showSuccess && styles.saveButtonSuccess]}
                    onPress={handleSave}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.saveButtonText}>
                      {showSuccess ? 'Saved' : 'Update'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Future Projections - Clean Grid */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Projections</Text>
                <View style={styles.projectionGrid}>
                  <View style={styles.projectionItem}>
                    <Text style={styles.projectionValue}>
                      {formatCost(calculateCostProjections(realDailyCost).yearly)}
                    </Text>
                    <Text style={styles.projectionLabel}>1 Year</Text>
                  </View>
                  <View style={styles.projectionDivider} />
                  <View style={styles.projectionItem}>
                    <Text style={styles.projectionValue}>
                      {formatCost(calculateCostProjections(realDailyCost).fiveYears)}
                    </Text>
                    <Text style={styles.projectionLabel}>5 Years</Text>
                  </View>
                </View>
              </View>

              {/* Savings Goal - Always Visible */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Savings Goal</Text>
                {savingsGoal ? (
                  <TouchableOpacity 
                    style={styles.goalCard}
                    onPress={handleOpenGoalModal}
                    activeOpacity={0.7}
                  >
                    <View style={styles.goalContent}>
                      <View style={styles.goalHeader}>
                        <Text style={styles.goalName}>{savingsGoal}</Text>
                        <Text style={[
                          styles.goalAmount,
                          goalReached && styles.goalAmountReached
                        ]}>
                          {formatCost(savingsGoalAmount)}
                        </Text>
                      </View>
                      
                      {/* Progress Bar */}
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <Animated.View 
                            style={[
                              styles.progressFill,
                              { 
                                width: `${goalProgress}%`,
                                transform: [{
                                  scaleX: goalReached ? goalAchievedAnimation : 1
                                }]
                              },
                              goalReached && styles.progressFillComplete
                            ]} 
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {goalProgress.toFixed(0)}%
                        </Text>
                      </View>
                      
                      {/* Goal Status */}
                      {goalReached ? (
                        <Animated.View style={[
                          styles.goalStatus,
                          {
                            opacity: goalAchievedAnimation,
                            transform: [{
                              translateY: goalAchievedAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [10, 0]
                              })
                            }]
                          }
                        ]}>
                          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                          <Text style={styles.goalStatusText}>Goal Achieved</Text>
                          {!goalReachedAcknowledged && (
                            <TouchableOpacity
                              style={styles.newGoalButton}
                              onPress={handleNewGoal}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.newGoalButtonText}>New Goal</Text>
                            </TouchableOpacity>
                          )}
                        </Animated.View>
                      ) : (
                        <View style={styles.goalTimeRemaining}>
                          <Text style={styles.goalTimeText}>
                            ~{Math.ceil((savingsGoalAmount - actualMoneySaved) / realDailyCost)} days to go
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.addGoalButton}
                    onPress={handleOpenGoalModal}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={COLORS.textMuted} />
                    <Text style={styles.addGoalText}>Set a savings goal</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>

          {/* Goal Edit Modal - Minimalist */}
          <Modal 
            visible={editingGoal} 
            animationType="slide" 
            presentationStyle="pageSheet" 
            onRequestClose={handleCloseGoalModal}
          >
            <View style={styles.goalModalContainer}>
              <LinearGradient 
                colors={['#000000', '#0A0F1C']} 
                style={styles.gradient}
              >
                <SafeAreaView style={styles.safeArea}>
                  <View style={styles.goalModalHeader}>
                    <TouchableOpacity onPress={handleCloseGoalModal} style={styles.modalHeaderButton}>
                      <Text style={styles.modalHeaderButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.goalModalTitle}>Savings Goal</Text>
                    <TouchableOpacity onPress={handleSaveGoal} style={styles.modalHeaderButton}>
                      <Text style={[styles.modalHeaderButtonText, styles.modalHeaderButtonPrimary]}>Save</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.goalModalContent}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>What are you saving for?</Text>
                      <TextInput
                        style={styles.textInput}
                        value={tempGoalName}
                        onChangeText={setTempGoalName}
                        placeholder="e.g., New laptop"
                        placeholderTextColor={COLORS.textMuted}
                        autoFocus
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Target amount</Text>
                      <View style={styles.amountInputWrapper}>
                        <Text style={styles.amountSymbol}>$</Text>
                        <TextInput
                          style={styles.amountInput}
                          value={tempGoalAmount}
                          onChangeText={(text) => setTempGoalAmount(text.replace(/[^0-9.]/g, ''))}
                          keyboardType="decimal-pad"
                          placeholder="0"
                          placeholderTextColor={COLORS.textMuted}
                        />
                      </View>
                    </View>

                    {tempGoalName && parseFloat(tempGoalAmount) > 0 && (
                      <View style={styles.goalPreview}>
                        <Text style={styles.goalPreviewText}>
                          You'll save {formatCost(parseFloat(tempGoalAmount))} in approximately{' '}
                          <Text style={styles.goalPreviewHighlight}>
                            {Math.ceil((parseFloat(tempGoalAmount) - actualMoneySaved) / realDailyCost)} days
                          </Text>
                        </Text>
                      </View>
                    )}
                  </View>
                </SafeAreaView>
              </LinearGradient>
            </View>
          </Modal>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: SPACING.md,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: 0,
    paddingBottom: SPACING.xl * 2,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 2,
    paddingTop: SPACING.lg,
  },
  heroLabel: {
    fontSize: FONTS.sm,
    fontWeight: '500',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  heroAmount: {
    fontSize: FONTS['5xl'],
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -2,
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    fontSize: FONTS.base,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },

  // Section Styles
  section: {
    marginBottom: SPACING.xl * 1.5,
  },
  sectionLabel: {
    fontSize: FONTS.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },

  // Cost Input
  costInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  costInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  currencySymbol: {
    fontSize: FONTS.lg,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  costInput: {
    flex: 1,
    fontSize: FONTS.lg,
    fontWeight: '400',
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },
  saveButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  saveButtonSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  saveButtonText: {
    fontSize: FONTS.sm,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Projection Grid
  projectionGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  projectionItem: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  projectionDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  projectionValue: {
    fontSize: FONTS['2xl'],
    fontWeight: '300',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  projectionLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },

  // Goal Card
  goalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  goalContent: {
    gap: SPACING.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  goalName: {
    fontSize: FONTS.base,
    fontWeight: '600',
    color: COLORS.text,
  },
  goalAmount: {
    fontSize: FONTS.base,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  goalAmountReached: {
    color: COLORS.success,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressFillComplete: {
    backgroundColor: COLORS.success,
  },
  progressText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'right',
  },
  goalTimeRemaining: {
    marginTop: SPACING.xs,
  },
  goalTimeText: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  goalStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  goalStatusText: {
    fontSize: FONTS.sm,
    color: COLORS.success,
    fontWeight: '500',
  },
  newGoalButton: {
    marginLeft: 'auto',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: BORDER_RADIUS.full,
  },
  newGoalButtonText: {
    fontSize: FONTS.xs,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Add Goal Button
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderStyle: 'dashed',
  },
  addGoalText: {
    fontSize: FONTS.base,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },

  // Goal Modal
  goalModalContainer: {
    flex: 1,
  },
  goalModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  goalModalTitle: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  modalHeaderButton: {
    padding: SPACING.xs,
  },
  modalHeaderButtonText: {
    fontSize: FONTS.base,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  modalHeaderButtonPrimary: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  goalModalContent: {
    padding: SPACING.lg,
    gap: SPACING.xl,
  },
  inputGroup: {
    gap: SPACING.sm,
  },
  inputLabel: {
    fontSize: FONTS.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.base,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    fontWeight: '400',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  amountSymbol: {
    fontSize: FONTS.xl,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: FONTS.xl,
    fontWeight: '400',
    color: COLORS.text,
    paddingVertical: SPACING.md,
  },
  goalPreview: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  goalPreviewText: {
    fontSize: FONTS.sm,
    color: COLORS.text,
    lineHeight: 20,
    textAlign: 'center',
  },
  goalPreviewHighlight: {
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default MoneySavedModal; 