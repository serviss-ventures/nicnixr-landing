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
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { 
  getProductInfo,
  getDailyPackages,
  getCostPerPackage
} from '../../services/productService';
import { calculateCostProjections, formatCost } from '../../utils/costCalculations';

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
  
  // Get latest user data from Redux (most up-to-date)
  const reduxUser = useSelector(selectUser);
  
  // Use Redux user data if available, otherwise fall back to props
  const currentUserProfile = reduxUser || userProfile;
  
  // Get product info from our service
  const productInfo = getProductInfo(currentUserProfile);
  
  // Get daily amount in packages (packs/tins/pods) from our service
  const dailyPackages = getDailyPackages(currentUserProfile);
  
  // Use the actual money saved from stats instead of calculating
  const actualMoneySaved = stats?.moneySaved || 0;
  
  // Calculate the daily cost from the money saved and days clean
  const realDailyCost = (stats?.daysClean || 0) > 0 ? actualMoneySaved / (stats?.daysClean || 1) : customDailyCost;
  
  // Calculate cost per package for display
  const costPerPackage = getCostPerPackage(realDailyCost, currentUserProfile);
  
  useEffect(() => {
    // Reset temp cost when modal opens with the cost per package
    if (visible) {
      setTempCost(costPerPackage.toFixed(2));
    }
  }, [visible, costPerPackage]);
  
  const handleSave = () => {
    const enteredCostPerPackage = parseFloat(tempCost) || 0;
    // Calculate daily cost from package cost
    const finalDailyCost = enteredCostPerPackage * dailyPackages;
    
    onUpdateCost(finalDailyCost);
    // Dismiss keyboard
    Keyboard.dismiss();
    // Show success feedback
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'formSheet' : 'pageSheet'}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#0A0F1C', '#000000']}
          style={styles.modalGradient}
        >
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Money Saved</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.content}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.heroIconWrapper}>
                <Ionicons name="cash-outline" size={28} color="#DB2777" />
              </View>
              <View style={styles.heroAmountContainer}>
                <Text style={styles.heroCurrency}>$</Text>
                <Text style={styles.heroAmount}>{Math.round(actualMoneySaved).toLocaleString()}</Text>
              </View>
              <Text style={styles.heroLabel}>saved in {stats?.daysClean || 0} days</Text>
            </View>

            {/* Daily Cost Card */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DAILY COST</Text>
              <View style={styles.dailyCostCard}>
                <View style={styles.dailyCostRow}>
                  <Text style={styles.dailyCostLabel}>Update cost per {productInfo.packageName}</Text>
                  <View style={styles.costInputRow}>
                    <Text style={styles.costInputCurrency}>$</Text>
                    <TextInput
                      style={styles.costInput}
                      value={tempCost}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/[^0-9.]/g, '');
                        setTempCost(cleaned);
                      }}
                      keyboardType="decimal-pad"
                      placeholderTextColor={COLORS.textMuted}
                      placeholder="0.00"
                    />
                    <TouchableOpacity 
                      style={[styles.updateButton, showSuccess && styles.updateButtonSuccess]}
                      onPress={handleSave}
                    >
                      {showSuccess ? (
                        <Ionicons name="checkmark" size={18} color="#10B981" />
                      ) : (
                        <Ionicons name="save-outline" size={18} color="#A78BFA" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Future Savings & Savings Goal */}
            <View style={styles.doubleSection}>
              <View style={[styles.section, {flex:1}]}>
                <Text style={styles.sectionTitle}>FUTURE SAVINGS</Text>
                <View style={styles.projectionGrid}>
                  <View style={styles.projectionCard}>
                    <Text style={styles.projectionAmount}>
                      {formatCost(calculateCostProjections(realDailyCost).yearly)}
                    </Text>
                    <Text style={styles.projectionPeriod}>1 Year</Text>
                  </View>
                  <View style={styles.projectionCard}>
                    <Text style={styles.projectionAmount}>
                      {formatCost(calculateCostProjections(realDailyCost).fiveYears)}
                    </Text>
                    <Text style={styles.projectionPeriod}>5 Years</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.section, {flex:1}]}>
                <Text style={styles.sectionTitle}>SAVINGS GOAL</Text>
                {savingsGoal ? (
                  <TouchableOpacity 
                    style={styles.goalCard}
                    onPress={() => setEditingGoal(true)}
                  >
                    <Ionicons name="flag" size={20} color="#A78BFA" style={styles.goalIcon} />
                    <Text style={styles.goalName}>{savingsGoal}</Text>
                    <Text style={styles.goalProgress}>
                      {formatCost(actualMoneySaved)} of {formatCost(savingsGoalAmount)}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.setupGoalCard}
                    onPress={() => setEditingGoal(true)}
                  >
                    <Ionicons name="flag-outline" size={20} color="#A78BFA" />
                    <Text style={styles.setupGoalText}>Set Goal</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* What You Could Buy */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>WHAT YOU COULD BUY</Text>
              <View style={styles.purchasesList}>
                {actualMoneySaved >= 5 && (
                  <View style={styles.purchaseItem}>
                    <Text style={styles.purchaseEmoji}>☕</Text>
                    <Text style={styles.purchaseText}>
                      {Math.floor(actualMoneySaved / 5)} coffee{Math.floor(actualMoneySaved / 5) > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
                {actualMoneySaved >= 15 && (
                  <View style={styles.purchaseItem}>
                    <Text style={styles.purchaseEmoji}>🍕</Text>
                    <Text style={styles.purchaseText}>
                      {Math.floor(actualMoneySaved / 15)} pizza{Math.floor(actualMoneySaved / 15) > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
                {actualMoneySaved >= 50 && (
                  <View style={styles.purchaseItem}>
                    <Text style={styles.purchaseEmoji}>🎮</Text>
                    <Text style={styles.purchaseText}>
                      {Math.floor(actualMoneySaved / 50)} video game{Math.floor(actualMoneySaved / 50) > 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          </SafeAreaView>

          {/* Goal Setup Modal */}
          <Modal
            visible={editingGoal}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setEditingGoal(false)}
          >
            <SafeAreaView style={styles.goalModalContainer}>
              <LinearGradient
                colors={['#000000', '#0A0F1C', '#0F172A']}
                style={styles.goalModalGradient}
              >
                <View style={styles.goalModalHeader}>
                  <TouchableOpacity onPress={() => setEditingGoal(false)}>
                    <Text style={styles.goalModalCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.goalModalTitle}>Savings Goal</Text>
                  <TouchableOpacity onPress={() => {
                    setEditingGoal(false);
                    if (!savingsGoal) {
                      Alert.alert('Goal Set!', 'Your savings goal has been created. Watch your progress grow!');
                    }
                  }}>
                    <Text style={styles.goalModalSave}>Save</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.goalModalContent} showsVerticalScrollIndicator={false}>
                  <View style={styles.goalInputSection}>
                    <Text style={styles.goalInputLabel}>What are you saving for?</Text>
                    <TextInput
                      style={styles.goalInput}
                      value={savingsGoal}
                      onChangeText={setSavingsGoal}
                      placeholder="e.g., Weekend trip, New laptop"
                      placeholderTextColor={COLORS.textMuted}
                    />
                  </View>

                  <View style={styles.goalInputSection}>
                    <Text style={styles.goalInputLabel}>How much do you need?</Text>
                    <View style={styles.amountInputContainer}>
                      <Text style={styles.currencySymbol}>$</Text>
                      <TextInput
                        style={styles.amountInput}
                        value={savingsGoalAmount.toString()}
                        onChangeText={(text) => {
                          const amount = parseInt(text.replace(/[^0-9]/g, '')) || 0;
                          setSavingsGoalAmount(amount);
                        }}
                        keyboardType="numeric"
                        placeholder="500"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    </View>
                  </View>

                  <View style={styles.goalSuggestionsSection}>
                    <Text style={styles.goalSuggestionsTitle}>Popular Goals</Text>
                    <View style={styles.goalSuggestionsList}>
                      {[
                        { name: 'Weekend getaway', amount: 400 },
                        { name: 'New laptop', amount: 800 },
                        { name: 'Emergency fund', amount: 1000 },
                        { name: 'Home improvement', amount: 600 },
                        { name: 'New phone', amount: 700 },
                        { name: 'Fitness equipment', amount: 300 },
                      ].map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.goalSuggestion}
                          onPress={() => {
                            setSavingsGoal(suggestion.name);
                            setSavingsGoalAmount(suggestion.amount);
                          }}
                        >
                          <LinearGradient
                            colors={['rgba(16, 185, 129, 0.05)', 'rgba(6, 182, 212, 0.03)']}
                            style={styles.suggestionGradient}
                          >
                            <Text style={styles.suggestionName}>{suggestion.name}</Text>
                            <Text style={styles.suggestionAmount}>${suggestion.amount}</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </ScrollView>
              </LinearGradient>
            </SafeAreaView>
          </Modal>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal Container
  modalContainer: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  modalGradient: {
    flex: 1,
  },
  
  // Header - Clean design
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  heroIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(219, 39, 119, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  heroAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  heroCurrency: {
    fontSize: 32,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.6)',
    marginRight: 2,
  },
  heroAmount: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -2,
  },
  heroLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    marginTop: 2,
  },
  
  // Sections
  section: {
    marginBottom: SPACING.lg,
  },
  doubleSection: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  
  // Daily Cost Card
  dailyCostCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dailyCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyCostLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  costInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    paddingLeft: SPACING.sm,
  },
  costInputCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginRight: 2,
  },
  costInput: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    width: 55,
    textAlign: 'center',
    paddingVertical: 6,
  },
  updateButton: {
    padding: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 6,
    marginLeft: SPACING.xs,
  },
  updateButtonSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  
  // Projection Grid
  projectionGrid: {
    flexDirection: 'column',
    gap: SPACING.sm,
  },
  projectionCard: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  projectionAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  projectionPeriod: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  
  // Goal Card
  goalCard: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalIcon: {
    marginBottom: SPACING.xs,
  },
  goalName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  goalProgress: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    marginTop: 2,
  },

  // Setup Goal
  setupGoalCard: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupGoalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
    marginTop: 4,
  },
  
  // Purchases List
  purchasesList: {
    flexDirection: 'column',
    gap: SPACING.sm,
  },
  purchaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: 10,
    gap: SPACING.sm,
  },
  purchaseEmoji: {
    fontSize: 16,
  },
  purchaseText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  // Goal Modal
  goalModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  goalModalGradient: {
    flex: 1,
  },
  goalModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  goalModalCancel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  goalModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  goalModalSave: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '700',
  },
  goalModalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  goalInputSection: {
    marginBottom: SPACING.xl,
  },
  goalInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  goalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.md,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    paddingVertical: SPACING.md,
  },
  goalSuggestionsSection: {
    marginTop: SPACING.md, // Reduced from SPACING.xl to move it up
  },
  goalSuggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  goalSuggestionsList: {
    gap: SPACING.sm,
  },
  goalSuggestion: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  suggestionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  suggestionAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
  },
});

export default MoneySavedModal; 