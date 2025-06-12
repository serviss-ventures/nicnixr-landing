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
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationScale] = useState(new Animated.Value(0));
  const [confettiOpacity] = useState(new Animated.Value(0));
  
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
      // Check if goal was just reached
      if (goalReached && !showCelebration) {
        setTimeout(() => {
          setShowCelebration(true);
          triggerCelebration();
        }, 500);
      }
    } else {
      // Reset celebration when modal closes
      setShowCelebration(false);
      celebrationScale.setValue(0);
      confettiOpacity.setValue(0);
    }
  }, [visible, costPerPackage, goalReached]);
  
  const triggerCelebration = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Animate celebration
    Animated.parallel([
      Animated.spring(celebrationScale, {
        toValue: 1,
        tension: 8,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(confettiOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Fade out confetti after 3 seconds
    setTimeout(() => {
      Animated.timing(confettiOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 3000);
  };
  
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
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
      setShowCelebration(false); // Reset celebration state
    }
  };

  const handleNewGoal = () => {
    setShowCelebration(false);
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
    setShowCelebration(false);
    celebrationScale.setValue(0);
    confettiOpacity.setValue(0);
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
          colors={['#0F172A', '#0A0F1C', '#000000']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Money Saved</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close-circle" size={28} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Hero Amount */}
              <View style={styles.heroSection}>
                <View style={styles.heroIcon}>
                  <Ionicons name="cash" size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.heroAmount}>
                  ${Math.round(actualMoneySaved).toLocaleString()}
                </Text>
                <Text style={styles.heroSubtitle}>
                  saved in {stats?.daysClean || 0} days
                </Text>
              </View>

              {/* Celebration Overlay */}
              {showCelebration && (
                <Animated.View 
                  style={[
                    styles.celebrationOverlay,
                    {
                      transform: [{ scale: celebrationScale }],
                      opacity: confettiOpacity
                    }
                  ]}
                  pointerEvents="box-none"
                >
                  <View style={styles.celebrationBackdrop}>
                    <View style={styles.celebrationCard}>
                      <Ionicons name="trophy" size={48} color={COLORS.warning} />
                      <Text style={styles.celebrationTitle}>Goal Achieved! 🎉</Text>
                      <Text style={styles.celebrationText}>
                        You saved {formatCost(savingsGoalAmount)} for your {savingsGoal}!
                      </Text>
                      <TouchableOpacity 
                        style={styles.newGoalButton}
                        onPress={handleNewGoal}
                      >
                        <Text style={styles.newGoalButtonText}>Set New Goal</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              )}

              {/* Cost Per Package */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Cost per {productInfo.packageName}</Text>
                </View>
                <View style={styles.costSection}>
                  <View style={styles.costInputWrapper}>
                    <View style={styles.costInputContainer}>
                      <Text style={styles.currencySymbol}>$</Text>
                      <TextInput
                        style={styles.costInput}
                        value={tempCost}
                        onChangeText={(text) => setTempCost(text.replace(/[^0-9.]/g, ''))}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
                        returnKeyType="done"
                        onSubmitEditing={handleSave}
                        blurOnSubmit={true}
                      />
                    </View>
                    <TouchableOpacity 
                      style={[styles.saveButton, showSuccess && styles.saveButtonSuccess]}
                      onPress={handleSave}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      activeOpacity={0.7}
                    >
                      {showSuccess ? (
                        <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                      ) : (
                        <Ionicons name="save" size={22} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                  <View style={styles.successContainer}>
                    {showSuccess && (
                      <Animated.Text style={[styles.successText, { opacity: confettiOpacity }]}>
                        Saved!
                      </Animated.Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Future Savings */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>FUTURE SAVINGS</Text>
                <View style={styles.projectionGrid}>
                  <View style={styles.projectionCard}>
                    <Text style={styles.projectionAmount}>
                      {formatCost(calculateCostProjections(realDailyCost).yearly)}
                    </Text>
                    <Text style={styles.projectionLabel}>1 Year</Text>
                  </View>
                  <View style={styles.projectionCard}>
                    <Text style={styles.projectionAmount}>
                      {formatCost(calculateCostProjections(realDailyCost).fiveYears)}
                    </Text>
                    <Text style={styles.projectionLabel}>5 Years</Text>
                  </View>
                </View>
              </View>

              {/* Savings Goal */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SAVINGS GOAL</Text>
                {savingsGoal && !showCelebration ? (
                  <TouchableOpacity 
                    style={[styles.goalCard, goalReached && styles.goalCardCompleted]}
                    onPress={handleOpenGoalModal}
                    activeOpacity={0.7}
                  >
                    <View style={styles.goalHeader}>
                      <View style={styles.goalInfo}>
                        <Ionicons 
                          name={goalReached ? "checkmark-circle" : "flag"} 
                          size={20} 
                          color={goalReached ? COLORS.success : COLORS.primary} 
                        />
                        <Text style={styles.goalName}>{savingsGoal}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                    </View>
                    <View style={styles.goalProgressContainer}>
                      <View style={styles.goalProgressBar}>
                        <View 
                          style={[
                            styles.goalProgressFill, 
                            { width: `${goalProgress}%` },
                            goalReached && styles.goalProgressFillCompleted
                          ]} 
                        />
                      </View>
                      <Text style={styles.goalProgressText}>
                        {formatCost(actualMoneySaved)} of {formatCost(savingsGoalAmount)}
                        {goalReached && " ✓"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : !showCelebration ? (
                  <TouchableOpacity 
                    style={styles.addGoalCard}
                    onPress={handleOpenGoalModal}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.addGoalText}>Set a savings goal</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </ScrollView>
          </SafeAreaView>

          {/* Goal Edit Modal */}
          <Modal 
            visible={editingGoal} 
            animationType="slide" 
            presentationStyle="pageSheet" 
            onRequestClose={handleCloseGoalModal}
          >
            <View style={styles.goalModalContainer}>
              <LinearGradient 
                colors={['#0F172A', '#0A0F1C', '#000000']} 
                style={styles.gradient}
              >
                <SafeAreaView style={styles.safeArea}>
                  <View style={styles.goalModalHeader}>
                    <TouchableOpacity onPress={handleCloseGoalModal}>
                      <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.goalModalTitle}>Savings Goal</Text>
                    <TouchableOpacity onPress={handleSaveGoal}>
                      <Text style={styles.doneButton}>Done</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.goalModalContent}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>What are you saving for?</Text>
                      <TextInput
                        style={styles.textInput}
                        value={tempGoalName}
                        onChangeText={setTempGoalName}
                        placeholder="e.g., Weekend getaway"
                        placeholderTextColor={COLORS.textMuted}
                        autoFocus
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>How much do you need?</Text>
                      <View style={styles.amountInputContainer}>
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
                        <Ionicons name="flag" size={24} color={COLORS.primary} />
                        <Text style={styles.goalPreviewText}>
                          You'll reach your {tempGoalName} goal in approximately{' '}
                          {Math.ceil((parseFloat(tempGoalAmount) - actualMoneySaved) / realDailyCost)} days
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
    position: 'relative',
  },
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  closeButton: {
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroAmount: {
    fontSize: FONTS['5xl'],
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -2,
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    fontSize: FONTS.base,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Celebration
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  celebrationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.warning,
    shadowColor: COLORS.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    width: '100%',
    maxWidth: 320,
  },
  celebrationTitle: {
    fontSize: FONTS['2xl'],
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  celebrationText: {
    fontSize: FONTS.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  newGoalButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  newGoalButtonText: {
    fontSize: FONTS.base,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Card Styles
  card: {
    backgroundColor: COLORS.glassMorphism,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONTS.base,
    fontWeight: '600',
    color: COLORS.text,
  },
  costSection: {
    gap: SPACING.xs,
  },
  costInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  costInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  currencySymbol: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  costInput: {
    flex: 1,
    fontSize: FONTS.lg,
    fontWeight: '700',
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },
  saveButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonSuccess: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
  },
  successContainer: {
    height: 20, // Fixed height to prevent jumping
    justifyContent: 'center',
  },
  successText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.success,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Section Styles
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },

  // Projection Grid
  projectionGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  projectionCard: {
    flex: 1,
    backgroundColor: COLORS.glassMorphism,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
  },
  projectionAmount: {
    fontSize: FONTS['2xl'],
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  projectionLabel: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Goal Card
  goalCard: {
    backgroundColor: COLORS.glassMorphism,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  goalCardCompleted: {
    borderColor: COLORS.success,
    backgroundColor: `${COLORS.success}10`,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  goalName: {
    fontSize: FONTS.base,
    fontWeight: '700',
    color: COLORS.text,
  },
  goalProgressContainer: {
    gap: SPACING.sm,
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  goalProgressFillCompleted: {
    backgroundColor: COLORS.success,
  },
  goalProgressText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Add Goal Card
  addGoalCard: {
    backgroundColor: COLORS.glassMorphism,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  addGoalText: {
    fontSize: FONTS.base,
    fontWeight: '600',
    color: COLORS.primary,
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
    borderBottomColor: COLORS.cardBorder,
  },
  goalModalTitle: {
    fontSize: FONTS.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  cancelButton: {
    fontSize: FONTS.base,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  doneButton: {
    fontSize: FONTS.base,
    color: COLORS.primary,
    fontWeight: '700',
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
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  textInput: {
    backgroundColor: COLORS.glassMorphism,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.base,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassMorphism,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  amountSymbol: {
    fontSize: FONTS.xl,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: FONTS.xl,
    fontWeight: '700',
    color: COLORS.text,
    paddingVertical: SPACING.md,
  },
  goalPreview: {
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  goalPreviewText: {
    flex: 1,
    fontSize: FONTS.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
});

export default MoneySavedModal; 