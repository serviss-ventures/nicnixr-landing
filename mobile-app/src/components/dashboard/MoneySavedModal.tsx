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
  
  useEffect(() => {
    // Reset temp cost when modal opens with the current custom cost
    if (visible) {
      setTempCost((customDailyCost || 14).toString());
    }
  }, [customDailyCost, visible]);
  
  // Get category from user profile - check brand and ID for pouches
  let productCategory = userProfile?.category || 'cigarettes';
  
  // Special handling for pouches - they're saved as 'other' category but ID is 'zyn'
  if (productCategory === 'other' && userProfile?.id === 'zyn') {
    productCategory = 'pouches';
  }
  
  // If category is not specific but brand indicates pouches, set it
  if (userProfile?.brand) {
    const pouchBrands = ['zyn', 'velo', 'rogue', 'on!', 'lucy', 'lyft', 'nordic spirit'];
    if (pouchBrands.some(brand => userProfile.brand?.toLowerCase().includes(brand))) {
      productCategory = 'pouches';
    }
  }
  
  // Get product-specific details
  const getProductDetails = () => {
    switch (productCategory?.toLowerCase()) {
      case 'cigarettes':
      case 'cigarette':
        return {
          unit: 'pack',
          unitPlural: 'packs',
          perUnit: 20,
          unitDescription: 'Pack of 20 cigarettes',
        };
      case 'vaping':
      case 'vape':
      case 'e-cigarette':
        return {
          unit: 'pod',
          unitPlural: 'pods',
          perUnit: 1,
          unitDescription: 'Vape pod',
        };
      case 'pouches':
      case 'nicotine_pouches':
      case 'pouch':
        return {
          unit: 'tin',
          unitPlural: 'tins',
          perUnit: 15,
          unitDescription: 'Tin of 15 pouches',
        };
      case 'other':
        // Special handling for pouches saved as 'other' category
        if (userProfile?.id === 'zyn') {
          return {
            unit: 'tin',
            unitPlural: 'tins',
            perUnit: 15,
            unitDescription: 'Tin of 15 pouches',
          };
        }
        return {
          unit: 'unit',
          unitPlural: 'units',
          perUnit: 1,
          unitDescription: 'Unit',
        };
      case 'chewing':
      case 'chew':
      case 'dip':
      case 'chew_dip':
        return {
          unit: 'tin',
          unitPlural: 'tins',
          perUnit: 7,
          unitDescription: 'Tin of dip/chew',
        };
      default:
        return {
          unit: 'unit',
          unitPlural: 'units',
          perUnit: 1,
          unitDescription: 'Unit',
        };
    }
  };
  
  const productDetails = getProductDetails();
  // Use the appropriate field based on product type
  const dailyAmount = userProfile?.packagesPerDay || userProfile?.dailyAmount || userProfile?.tinsPerDay || userProfile?.podsPerDay || 1;
  
  // Calculate actual money saved based on SAVED custom daily cost (not temp)
  const actualMoneySaved = customDailyCost * (stats?.daysClean || 0);
  
  const handleSave = () => {
    const finalCost = parseFloat(tempCost) || 0;
    onUpdateCost(finalCost);
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
          colors={['#000000', '#0A0F1C', '#0F172A']}
          style={styles.modalGradient}
        >
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          {/* Header */}
          <View style={styles.premiumModalHeader}>
            <TouchableOpacity 
              style={styles.premiumModalBackButton}
              onPress={onClose}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.premiumModalBackGradient}
              >
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.premiumModalTitle}>Money Saved</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <View style={styles.modalContent}>
            {/* Current Savings Display */}
            <View style={styles.moneySavedHeroSection}>
              <View style={styles.moneySavedAmountContainer}>
                <Text style={styles.moneySavedCurrency}>$</Text>
                <Text style={styles.moneySavedAmount}>{Math.round(actualMoneySaved)}</Text>
              </View>
              <Text style={styles.moneySavedSubtitle}>saved in {stats?.daysClean || 0} days</Text>
            </View>

            {/* Daily Cost */}
            <View style={styles.calculationSection}>
              <Text style={styles.premiumSectionTitle}>YOUR DAILY COST</Text>
              <View style={styles.calculationCard}>
                <LinearGradient
                  colors={['rgba(245, 158, 11, 0.1)', 'rgba(16, 185, 129, 0.1)']}
                  style={styles.calculationGradient}
                >
                  <View style={styles.calculationRow}>
                    <View style={styles.calculationIcon}>
                      <Ionicons name="calculator-outline" size={20} color="#F59E0B" />
                    </View>
                    <View style={styles.calculationContent}>
                      <Text style={styles.calculationTitle}>
                        {dailyAmount} {dailyAmount === 1 ? productDetails.unit : productDetails.unitPlural} per day
                      </Text>
                      <Text style={styles.calculationValue} numberOfLines={1} adjustsFontSizeToFit>
                        ${customDailyCost.toFixed(2)}/day × {stats?.daysClean} days = ${Math.round(actualMoneySaved)}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Cost Update */}
            <View style={styles.costCustomizationSection}>
              <Text style={styles.premiumSectionTitle}>UPDATE YOUR COST</Text>
              <View style={styles.customPriceInputRow}>
                <View style={styles.customPriceInputContainer}>
                  <Text style={styles.customPriceCurrency}>$</Text>
                  <TextInput
                    style={styles.customPriceInput}
                    value={tempCost}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9.]/g, '');
                      setTempCost(cleaned);
                    }}
                    keyboardType="decimal-pad"
                    placeholderTextColor={COLORS.textMuted}
                    placeholder="6.00"
                  />
                </View>
                <TouchableOpacity 
                  style={styles.customPriceSaveButton}
                  onPress={handleSave}
                >
                  <LinearGradient
                    colors={showSuccess ? ['#10B981', '#10B981'] : ['#10B981', '#06B6D4']}
                    style={styles.customPriceSaveGradient}
                  >
                    {showSuccess ? (
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.customPriceSaveText}>Update</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Future Savings */}
            <View style={styles.projectionSection}>
              <Text style={styles.premiumSectionTitle}>YOUR FUTURE SAVINGS</Text>
              
              <View style={styles.projectionGrid}>
                <View style={styles.projectionCard}>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.05)']}
                    style={styles.projectionGradient}
                  >
                    <Text style={styles.projectionPeriod}>1 Year</Text>
                    <Text style={styles.projectionAmount}>
                      ${Math.round(customDailyCost * 365).toLocaleString()}
                    </Text>
                  </LinearGradient>
                </View>
                <View style={styles.projectionCard}>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.05)']}
                    style={styles.projectionGradient}
                  >
                    <Text style={styles.projectionPeriod}>5 Years</Text>
                    <Text style={styles.projectionAmount}>
                      ${Math.round(customDailyCost * 365 * 5).toLocaleString()}
                    </Text>
                  </LinearGradient>
                </View>
                <View style={styles.projectionCard}>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.05)']}
                    style={styles.projectionGradient}
                  >
                    <Text style={styles.projectionPeriod}>10 Years</Text>
                    <Text style={styles.projectionAmount}>
                      ${Math.round(customDailyCost * 365 * 10).toLocaleString()}
                    </Text>
                  </LinearGradient>
                </View>
              </View>
            </View>

            {/* Savings Goal Section */}
            <View style={styles.savingsGoalSection}>
              <Text style={styles.premiumSectionTitle}>SAVINGS GOAL</Text>
              
              {savingsGoal ? (
                // Show progress tracker
                <TouchableOpacity 
                  style={styles.savingsGoalCard}
                  onPress={() => setEditingGoal(true)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['rgba(245, 158, 11, 0.1)', 'rgba(16, 185, 129, 0.05)']}
                    style={styles.savingsGoalGradient}
                  >
                    <View style={styles.savingsGoalHeader}>
                      <Ionicons name="wallet" size={24} color="#F59E0B" />
                      <View style={styles.savingsGoalInfo}>
                        <Text style={styles.savingsGoalName}>{savingsGoal}</Text>
                        <Text style={styles.savingsGoalAmount}>
                          ${Math.round(actualMoneySaved)} of ${savingsGoalAmount}
                        </Text>
                      </View>
                      <View style={styles.editGoalButton}>
                        <Ionicons name="create-outline" size={16} color="#F59E0B" />
                      </View>
                    </View>
                    
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBackground}>
                        <View 
                          style={[
                            styles.progressFill,
                            { 
                              width: `${Math.min(100, (actualMoneySaved / savingsGoalAmount) * 100)}%`
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressPercentage}>
                        {Math.round((actualMoneySaved / savingsGoalAmount) * 100)}% complete
                      </Text>
                    </View>
                    
                    {actualMoneySaved < savingsGoalAmount && (
                      <View style={styles.estimatedCompletionContainer}>
                        <Text style={styles.estimatedCompletion} numberOfLines={2}>
                          {Math.ceil((savingsGoalAmount - actualMoneySaved) / customDailyCost)} more {Math.ceil((savingsGoalAmount - actualMoneySaved) / customDailyCost) === 1 ? 'day' : 'days'} to reach your goal!
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                // Show setup button
                <TouchableOpacity 
                  style={styles.setupGoalCard}
                  onPress={() => setEditingGoal(true)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.05)']}
                    style={styles.setupGoalGradient}
                  >
                    <Ionicons name="flag" size={24} color="#10B981" />
                    <View style={styles.setupGoalContent}>
                      <Text style={styles.setupGoalTitle}>Set a Savings Goal</Text>
                      <Text style={styles.setupGoalSubtitle}>
                        Turn your savings into something meaningful
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#10B981" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
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
    backgroundColor: '#0F172A', // Match the gradient end color to hide any gaps
  },
  modalGradient: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40, // Increased from SPACING.lg to ensure no black bar
  },
  modalHeaderSpacer: {
    width: 40,
  },

  // Premium Modal Header
  premiumModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  premiumModalBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumModalBackGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
  },
  premiumModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },

  // Section Titles
  premiumSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: SPACING.sm, // Moderate spacing
    marginTop: SPACING.md, // Moderate spacing between sections
  },

  // Money Saved Hero Section
  moneySavedHeroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.sm, // Further reduced for more space
  },
  moneySavedAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  moneySavedCurrency: {
    fontSize: 24, // Reduced from 28
    fontWeight: '300',
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  moneySavedAmount: {
    fontSize: 42, // Reduced from 48
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -2,
  },
  moneySavedSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Calculation Section
  calculationSection: {
    marginTop: SPACING.md, // Moderate spacing
  },
  calculationCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  calculationGradient: {
    padding: SPACING.md, // Reduced from lg
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 16,
  },
  calculationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calculationIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  calculationContent: {
    flex: 1,
  },
  calculationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  calculationValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Cost Customization
  costCustomizationSection: {
    marginTop: SPACING.md, // Moderate spacing
  },
  customPriceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  customPriceInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  customPriceCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  customPriceInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  customPriceSaveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  customPriceSaveGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  customPriceSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Projection Section
  projectionSection: {
    marginTop: SPACING.md, // Moderate spacing
  },
  projectionGrid: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  projectionCard: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  projectionGradient: {
    paddingVertical: 8, // Very compact padding
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 10,
  },
  projectionPeriod: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  projectionAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },

  // Savings Goal Section
  savingsGoalSection: {
    marginTop: SPACING.md, // Moderate spacing
    marginBottom: SPACING.md, // Moderate bottom margin
  },
  savingsGoalCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  savingsGoalGradient: {
    padding: SPACING.sm, // Further reduced for compact display
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 16,
  },
  savingsGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm, // Reduced from md
  },
  savingsGoalInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  savingsGoalName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  savingsGoalAmount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  editGoalButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    marginTop: SPACING.xs, // Reduced from sm
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: SPACING.xs,
  },
  estimatedCompletionContainer: {
    marginTop: SPACING.xs, // Reduced from sm
    paddingTop: SPACING.xs, // Reduced from sm
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  estimatedCompletion: {
    fontSize: 12, // Reduced from 13
    color: COLORS.textSecondary,
    fontWeight: '500',
    lineHeight: 16, // Reduced from 18
  },

  // Setup Goal Card
  setupGoalCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  setupGoalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md, // Reduced from lg
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
  },
  setupGoalContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  setupGoalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  setupGoalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
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