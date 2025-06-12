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

          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <LinearGradient
                colors={['rgba(219, 39, 119, 0.15)', 'rgba(139, 92, 246, 0.1)']}
                style={styles.heroCard}
              >
                <View style={styles.heroIconWrapper}>
                  <Ionicons name="cash" size={24} color="#DB2777" />
                </View>
                <View style={styles.heroAmountContainer}>
                  <Text style={styles.heroCurrency}>$</Text>
                  <Text style={styles.heroAmount}>{Math.round(actualMoneySaved)}</Text>
                </View>
                <Text style={styles.heroLabel}>saved in {stats?.daysClean || 0} days</Text>
              </LinearGradient>
            </View>

            {/* Daily Cost Card */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DAILY COST</Text>
              <View style={styles.dailyCostCard}>
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.08)', 'rgba(167, 139, 250, 0.05)']}
                  style={styles.cardGradient}
                >
                  <View style={styles.dailyCostRow}>
                    <View style={styles.dailyCostInfo}>
                      <Text style={styles.dailyCostValue}>${realDailyCost.toFixed(2)}/day</Text>
                      <Text style={styles.dailyCostLabel}>
                        {dailyPackages < 1 ? dailyPackages.toFixed(2) : dailyPackages % 1 === 0 ? dailyPackages.toFixed(0) : dailyPackages.toFixed(1)} {dailyPackages === 1 ? productInfo.packageName : productInfo.packageNamePlural}
                      </Text>
                    </View>
                    <View style={styles.costUpdateContainer}>
                      <Text style={styles.costUpdateLabel}>per {productInfo.packageName}</Text>
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
                          style={styles.updateButton}
                          onPress={handleSave}
                        >
                          {showSuccess ? (
                            <Ionicons name="checkmark" size={16} color="#10B981" />
                          ) : (
                            <Ionicons name="refresh" size={16} color="#A78BFA" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Future Savings - Compact Grid */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>FUTURE SAVINGS</Text>
              <View style={styles.projectionGrid}>
                <View style={styles.projectionCard}>
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.1)']}
                    style={styles.projectionGradient}
                  >
                    <Text style={styles.projectionAmount}>
                      {formatCost(calculateCostProjections(realDailyCost).yearly)}
                    </Text>
                    <Text style={styles.projectionPeriod}>1 Year</Text>
                  </LinearGradient>
                </View>
                <View style={styles.projectionCard}>
                  <LinearGradient
                    colors={['rgba(167, 139, 250, 0.15)', 'rgba(236, 72, 153, 0.1)']}
                    style={styles.projectionGradient}
                  >
                    <Text style={styles.projectionAmount}>
                      {formatCost(calculateCostProjections(realDailyCost).fiveYears)}
                    </Text>
                    <Text style={styles.projectionPeriod}>5 Years</Text>
                  </LinearGradient>
                </View>
                <View style={styles.projectionCard}>
                  <LinearGradient
                    colors={['rgba(236, 72, 153, 0.15)', 'rgba(139, 92, 246, 0.1)']}
                    style={styles.projectionGradient}
                  >
                    <Text style={styles.projectionAmount}>
                      {formatCost(calculateCostProjections(realDailyCost).tenYears)}
                    </Text>
                    <Text style={styles.projectionPeriod}>10 Years</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>

            {/* Savings Goal Section - Simplified */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SAVINGS GOAL</Text>
              
              {savingsGoal ? (
                <TouchableOpacity 
                  style={styles.goalCard}
                  onPress={() => setEditingGoal(true)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                    style={styles.goalGradient}
                  >
                    <View style={styles.goalHeader}>
                      <View style={styles.goalIconWrapper}>
                        <Ionicons name="flag" size={20} color="#A78BFA" />
                      </View>
                      <View style={styles.goalInfo}>
                        <Text style={styles.goalName}>{savingsGoal}</Text>
                        <Text style={styles.goalProgress}>
                          ${Math.round(actualMoneySaved)} of ${savingsGoalAmount}
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.editButton}>
                        <Ionicons name="create-outline" size={16} color="rgba(255,255,255,0.5)" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { width: `${Math.min(100, (actualMoneySaved / savingsGoalAmount) * 100)}%` }
                        ]} 
                      />
                    </View>
                    
                    <Text style={styles.goalStatus}>
                      {actualMoneySaved >= savingsGoalAmount 
                        ? '🎉 Goal achieved!' 
                        : `${Math.ceil((savingsGoalAmount - actualMoneySaved) / realDailyCost)} days to go`
                      }
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.setupGoalCard}
                  onPress={() => setEditingGoal(true)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.08)', 'rgba(167, 139, 250, 0.05)']}
                    style={styles.setupGoalGradient}
                  >
                    <Ionicons name="flag" size={20} color="#A78BFA" />
                    <Text style={styles.setupGoalText}>Set a savings goal</Text>
                    <Ionicons name="chevron-forward" size={20} color="#A78BFA" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            {/* What You Could Buy - Fun Section */}
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
                {actualMoneySaved >= 200 && (
                  <View style={styles.purchaseItem}>
                    <Text style={styles.purchaseEmoji}>👟</Text>
                    <Text style={styles.purchaseText}>
                      {Math.floor(actualMoneySaved / 200)} pair{Math.floor(actualMoneySaved / 200) > 1 ? 's' : ''} of shoes
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
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
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  
  // Hero Section
  heroSection: {
    marginBottom: SPACING.md,
  },
  heroCard: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  heroAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  heroCurrency: {
    fontSize: 24,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.6)',
    marginRight: 4,
  },
  heroAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
  },
  heroLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  
  // Sections
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  
  // Daily Cost Card
  dailyCostCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  dailyCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyCostInfo: {
    flex: 1,
  },
  dailyCostValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  dailyCostLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  costUpdateContainer: {
    alignItems: 'flex-end',
  },
  costUpdateLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '600',
    marginBottom: 4,
  },
  costInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  costInputCurrency: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  costInput: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    width: 50,
    textAlign: 'center',
  },
  updateButton: {
    marginLeft: SPACING.xs,
    padding: 4,
  },
  
  // Projection Grid
  projectionGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  projectionCard: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
  },
  projectionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  projectionAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 2,
  },
  projectionPeriod: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  
  // Goal Card
  goalCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  goalGradient: {
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  goalIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 1,
  },
  goalProgress: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  editButton: {
    padding: SPACING.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A78BFA',
    borderRadius: 3,
  },
  goalStatus: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  
  // Setup Goal
  setupGoalCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  setupGoalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
  },
  setupGoalText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginLeft: SPACING.sm,
  },
  
  // Purchases List
  purchasesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  purchaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  purchaseEmoji: {
    fontSize: 16,
  },
  purchaseText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
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

  // New styles for the compact layout
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  heroSection: {
    marginBottom: SPACING.md,
  },
  heroCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroIconWrapper: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  heroCurrency: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  heroAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -2,
  },
  heroLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
  },
  dailyCostCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SPACING.md,
  },
  dailyCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dailyCostInfo: {
    flex: 1,
  },
  dailyCostValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  dailyCostLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  costUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  costUpdateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  costInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  costInputCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  costInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  updateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  goalCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  goalGradient: {
    padding: SPACING.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  goalIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  goalProgress: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalStatus: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: SPACING.xs,
  },
  setupGoalCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  setupGoalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
  },
  setupGoalText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  purchasesList: {
    gap: SPACING.sm,
  },
  purchaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  purchaseEmoji: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  purchaseText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default MoneySavedModal; 