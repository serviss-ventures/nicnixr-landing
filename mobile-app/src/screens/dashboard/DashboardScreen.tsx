import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { updateProgress, selectProgressStats, setQuitDate } from '../../store/slices/progressSlice';
import { COLORS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import EnhancedNeuralNetwork from '../../components/common/EnhancedNeuralNetwork';
import recoveryTrackingService from '../../services/recoveryTrackingService';
import DailyTipModal from '../../components/common/DailyTipModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import AICoachCard from '../../components/common/AICoachCard';
import RecoveryPlanCard from '../../components/common/RecoveryPlanCard';
import RecoveryJournal from '../../components/dashboard/RecoveryJournal';

// Import debug utilities in development
if (__DEV__) {
  import('../../debug/neuralGrowthTest');
  import('../../debug/appReset');
}

// Dimensions available if needed
// const { width, height } = Dimensions.get('window');

// Safety check for COLORS to prevent LinearGradient errors
const safeColors = {
  primary: COLORS?.primary || '#10B981',
  secondary: COLORS?.secondary || '#06B6D4',
  accent: COLORS?.accent || '#8B5CF6',
  text: COLORS?.text || '#FFFFFF',
  textSecondary: COLORS?.textSecondary || '#9CA3AF',
  textMuted: COLORS?.textMuted || '#6B7280',
  cardBorder: COLORS?.cardBorder || 'rgba(255, 255, 255, 0.1)',
};

// Money Saved Modal - Outside component to prevent re-renders
const MoneySavedModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  stats: any; // TODO: Type properly
  userProfile: any; // TODO: Type properly
  customDailyCost: number;
  onUpdateCost: (cost: number) => void;
  savingsGoal: string;
  savingsGoalAmount: number;
  editingGoal: boolean;
  setSavingsGoal: (goal: string) => void;
  setSavingsGoalAmount: (amount: number) => void;
  setEditingGoal: (editing: boolean) => void;
}> = ({ 
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
  const [tempCost, setTempCost] = useState(customDailyCost.toString());
  
  useEffect(() => {
    setTempCost(customDailyCost.toString());
  }, [customDailyCost, visible]);
  
  // Debug log to see what data we're receiving
  if (__DEV__ && visible) {
    console.log('MoneySavedModal userProfile:', userProfile);
  }
  
  // Get category from user profile - check brand and ID for pouches
  let productCategory = userProfile?.category || 'cigarettes';
  
  // Special handling for pouches - they're saved as 'other' category but ID is 'zyn'
  if (productCategory === 'other' && userProfile?.id === 'zyn') {
    productCategory = 'pouches';
  }
  
  // If category is not specific but brand indicates pouches, set it
  if (userProfile?.brand) {
    const pouchBrands = ['zyn', 'velo', 'rogue', 'on!', 'lucy', 'lyft', 'nordic spirit'];
    if (pouchBrands.some(brand => userProfile.brand.toLowerCase().includes(brand))) {
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
  const displayCost = parseFloat(tempCost || '0');
  
  const handleSave = () => {
    const finalCost = parseFloat(tempCost) || 0;
    onUpdateCost(finalCost);
    // Dismiss keyboard before showing alert to prevent flash
    if (Platform.OS === 'ios') {
      setTimeout(() => {
        Alert.alert(
          'Cost Updated',
          `Your daily cost has been updated to $${finalCost.toFixed(2)}`,
          [{ text: 'OK', onPress: onClose }]
        );
      }, 100);
    } else {
      Alert.alert(
        'Cost Updated',
        `Your daily cost has been updated to $${finalCost.toFixed(2)}`,
        [{ text: 'OK', onPress: onClose }]
      );
    }
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'formSheet' : 'pageSheet'}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer} edges={['top', 'left', 'right', 'bottom']}>
        <LinearGradient
          colors={['#000000', '#0A0F1C', '#0F172A']}
          style={styles.modalGradient}
        >
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
                <Text style={styles.moneySavedAmount}>{Math.round(stats?.moneySaved || 0)}</Text>
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
                      <Text style={styles.calculationValue}>
                        ${displayCost.toFixed(2)}/day × {stats?.daysClean} days = ${Math.round(displayCost * (stats?.daysClean || 0))}
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
                  onPress={() => {
                    // Blur the input first to dismiss keyboard smoothly
                    if (Platform.OS === 'ios') {
                      setTimeout(() => handleSave(), 50);
                    } else {
                      handleSave();
                    }
                  }}
                >
                  <LinearGradient
                    colors={['#10B981', '#06B6D4']}
                    style={styles.customPriceSaveGradient}
                  >
                    <Text style={styles.customPriceSaveText}>Update</Text>
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
                      ${Math.round(displayCost * 365).toLocaleString()}
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
                      ${Math.round(displayCost * 365 * 5).toLocaleString()}
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
                      ${Math.round(displayCost * 365 * 10).toLocaleString()}
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
                          ${Math.round(stats?.moneySaved || 0)} of ${savingsGoalAmount}
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
                              width: `${Math.min(100, ((stats?.moneySaved || 0) / savingsGoalAmount) * 100)}%`
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressPercentage}>
                        {Math.round(((stats?.moneySaved || 0) / savingsGoalAmount) * 100)}% complete
                      </Text>
                    </View>
                    
                    {(stats?.moneySaved || 0) < savingsGoalAmount && (
                      <Text style={styles.estimatedCompletion}>
                        {Math.ceil((savingsGoalAmount - (stats?.moneySaved || 0)) / displayCost)} more days to reach your goal!
                      </Text>
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
        </SafeAreaView>
    </Modal>
  );
};

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const stats = useSelector(selectProgressStats);
  const [neuralInfoVisible, setNeuralInfoVisible] = useState(false);
  const [healthInfoVisible, setHealthInfoVisible] = useState(false);
  const [dailyTipVisible, setDailyTipVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [newQuitDate, setNewQuitDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [resetType, setResetType] = useState<'relapse' | 'fresh_start' | 'correction'>('relapse');
  const [recoveryJournalVisible, setRecoveryJournalVisible] = useState(false);
  // Customize journal modal is now handled inside RecoveryJournal component
  const [moneySavedModalVisible, setMoneySavedModalVisible] = useState(false);
  const [customDailyCost, setCustomDailyCost] = useState(user?.dailyCost || 14);
  const [savingsGoal, setSavingsGoal] = useState('');
  const [savingsGoalAmount, setSavingsGoalAmount] = useState(500);
  const [editingGoal, setEditingGoal] = useState(false);
  // const navigation = useNavigation<DashboardNavigationProp>();

  // Neural Info Modal is currently disabled

  // Journal Enabled Factors State has been moved to RecoveryJournal component

  // Neural Info Modal deferred rendering disabled for now

  // Get unified recovery data from tracking service
  const getRecoveryData = () => {
    try {
      const data = recoveryTrackingService.getRecoveryData();
      
      // Log for debugging in development
      if (__DEV__) {
        recoveryTrackingService.logRecoveryData('Dashboard');
      }
      
      return {
        recoveryPercentage: data.recoveryPercentage,
        isStarting: data.daysClean === 0,
        daysClean: data.daysClean,
        recoveryMessage: data.recoveryMessage,
        neuralBadgeMessage: data.neuralBadgeMessage,
        growthMessage: data.growthMessage,
        personalizedUnitName: data.personalizedUnitName,
      };
    } catch (error) {
      // Fallback to basic calculation if service fails - avoid calling service again
      const daysClean = stats?.daysClean || 0;
      
      // Simple fallback recovery calculation
      let recoveryPercentage = 0;
      if (daysClean === 0) {
        recoveryPercentage = 0;
      } else if (daysClean <= 3) {
        recoveryPercentage = Math.min((daysClean / 3) * 15, 15);
      } else if (daysClean <= 14) {
        recoveryPercentage = 15 + Math.min(((daysClean - 3) / 11) * 25, 25);
      } else if (daysClean <= 30) {
        recoveryPercentage = 40 + Math.min(((daysClean - 14) / 16) * 30, 30);
      } else if (daysClean <= 90) {
        recoveryPercentage = 70 + Math.min(((daysClean - 30) / 60) * 25, 25);
      } else {
        recoveryPercentage = Math.min(95 + ((daysClean - 90) / 90) * 5, 100);
      }
      
      if (__DEV__) {
        console.warn('⚠️ Recovery service failed, using fallback:', error);
      }
      
      return {
        recoveryPercentage: Math.round(recoveryPercentage),
        isStarting: daysClean === 0,
        daysClean,
        recoveryMessage: "Recovery data temporarily unavailable",
        neuralBadgeMessage: "Recovery in progress",
        growthMessage: "Your brain is healing",
        personalizedUnitName: "units avoided",
      };
    }
  };

  // Get current recovery data
  const recoveryData = getRecoveryData();

  // Get personalized unit name from recovery data
  const personalizedUnitName = recoveryData.personalizedUnitName;
  
  // Calculate proper avoided display value
  const getAvoidedDisplay = () => {
    const unitsAvoided = stats?.unitsAvoided || 0;
    const userProfile = user?.nicotineProduct;
    
    if (!userProfile) return { value: unitsAvoided, unit: 'units avoided' };
    
    // Get category from user profile
    const category = userProfile.category || 'other';
    const productId = userProfile.id || '';
    
    // Debug log in development
    if (__DEV__) {
      console.log('Avoided display - userProfile:', userProfile);
      console.log('Avoided display - detected category:', category);
      console.log('Avoided display - product ID:', productId);
    }
    
    // Check for pouches first (they're saved as 'other' category with 'zyn' id)
    if (category === 'other' && productId === 'zyn') {
      const tins = unitsAvoided / 15;
      if (tins >= 1 && tins % 1 === 0) {
        return { value: tins, unit: tins === 1 ? 'tin avoided' : 'tins avoided' };
      } else {
        return { value: unitsAvoided, unit: unitsAvoided === 1 ? 'pouch avoided' : 'pouches avoided' };
      }
    }
    
    switch (category.toLowerCase()) {
      case 'cigarettes':
      case 'cigarette':
        const packs = unitsAvoided / 20;
        if (packs >= 1) {
          const roundedPacks = Math.round(packs * 10) / 10;
          if (roundedPacks === 1) {
            return { value: 1, unit: 'pack avoided' };
          } else if (roundedPacks % 1 === 0) {
            return { value: Math.round(roundedPacks), unit: 'packs avoided' };
          } else {
            return { value: roundedPacks, unit: 'packs avoided' };
          }
        } else {
          return { value: unitsAvoided, unit: unitsAvoided === 1 ? 'cigarette avoided' : 'cigarettes avoided' };
        }
      
      case 'pouches':
      case 'nicotine_pouches':
      case 'pouch':
        const tins = unitsAvoided / 15;
        if (tins >= 1 && tins % 1 === 0) {
          return { value: tins, unit: tins === 1 ? 'tin avoided' : 'tins avoided' };
        } else {
          return { value: unitsAvoided, unit: unitsAvoided === 1 ? 'pouch avoided' : 'pouches avoided' };
        }
      
      case 'chewing':
      case 'chew':
      case 'dip':
      case 'chew_dip':
        if (unitsAvoided >= 7 && unitsAvoided % 7 === 0) {
          const cans = unitsAvoided / 7;
          return { value: cans, unit: cans === 1 ? 'tin avoided' : 'tins avoided' };
        } else {
          return { value: unitsAvoided, unit: unitsAvoided === 1 ? 'portion avoided' : 'portions avoided' };
        }
        
      case 'vape':
      case 'vaping':
      case 'e-cigarette':
        return { value: unitsAvoided, unit: unitsAvoided === 1 ? 'pod avoided' : 'pods avoided' };
        
      default:
        return { value: unitsAvoided, unit: unitsAvoided === 1 ? 'unit avoided' : 'units avoided' };
    }
  };
  
  const avoidedDisplay = getAvoidedDisplay();

  // Reset Progress Functions
  const handleResetProgress = () => {
    const today = new Date();
    setNewQuitDate(today); // Explicitly set to today
    setResetType('relapse'); // Reset to default
    setResetModalVisible(true);
  };

  // Optimized handlers to prevent re-renders
  const handleRelapseSelect = useCallback(() => setResetType('relapse'), []);
  const handleFreshStartSelect = useCallback(() => setResetType('fresh_start'), []);
  const handleCorrectionSelect = useCallback(() => setResetType('correction'), []);

  const handleRecoveryJournal = useCallback(() => setRecoveryJournalVisible(true), []);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
      setNewQuitDate(selectedDate);
      console.log('Date updated to:', selectedDate.toLocaleDateString());
    }
  };

  const confirmReset = async () => {
    try {
      const resetTypeMessages = {
        relapse: {
          title: 'Continue Your Recovery Journey',
          message: `This will start a new streak from ${newQuitDate.toLocaleDateString()}, while preserving your total progress and achievements. Your longest streak will be saved.`,
          buttonText: 'Continue Recovery'
        },
        fresh_start: {
          title: 'Complete Fresh Start',
          message: `This will reset ALL progress to zero and start completely over from ${newQuitDate.toLocaleDateString()}. This cannot be undone.`,
          buttonText: 'Start Fresh'
        },
        correction: {
          title: 'Correct Your Quit Date',
          message: `This will update your quit date to ${newQuitDate.toLocaleDateString()} and recalculate all your progress based on the correct timeline.`,
          buttonText: 'Update Date'
        }
      };

      const config = resetTypeMessages[resetType];

      Alert.alert(
        config.title,
        config.message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: config.buttonText,
            style: resetType === 'fresh_start' ? 'destructive' : 'default',
            onPress: async () => {
              // TODO: Implement different reset logic based on resetType
              // For now, just update the quit date - we'll need to enhance the progress slice
              dispatch(setQuitDate(newQuitDate.toISOString()));
              await dispatch(updateProgress());
              setResetModalVisible(false);
              
              const successMessages = {
                relapse: 'Your recovery journey continues! New streak started.',
                fresh_start: 'Fresh start complete! Your journey begins now.',
                correction: 'Quit date corrected! Progress has been recalculated.'
              };
              
              Alert.alert('Success', successMessages[resetType]);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update progress. Please try again.');
    }
  };

  useEffect(() => {
    // Initialize progress tracking
    if (user?.quitDate) {
      const progressData = {
          quitDate: user.quitDate,
        nicotineProduct: user.nicotineProduct,
        dailyCost: user.dailyCost,
        packagesPerDay: user.packagesPerDay || 1,
      };
      dispatch(updateProgress(progressData));
    }

    // Initialize date picker with current date
    setNewQuitDate(new Date());

    // Set up progress update interval
    const progressInterval = setInterval(() => {
      if (user?.quitDate) {
        const progressData = {
          quitDate: user.quitDate,
          nicotineProduct: user.nicotineProduct,
          dailyCost: user.dailyCost,
          packagesPerDay: user.packagesPerDay || 1,
        };
        dispatch(updateProgress(progressData));
      }
    }, 60000); // Update every minute

    return () => {
      clearInterval(progressInterval);
    };
  }, [dispatch, user?.quitDate]);

  // Neural Network Visualization - Enhanced Version
  const NeuralNetworkVisualization = () => {
    const { recoveryPercentage, daysClean, neuralBadgeMessage } = recoveryData;

    return (
      <View style={styles.enhancedNeuralContainer}>
        <EnhancedNeuralNetwork
          daysClean={daysClean}
          recoveryPercentage={recoveryPercentage}
          centerText={daysClean.toString()}
          centerSubtext="Days Free"
          size={280}
          showStats={true}
        />
        
        {/* Enhanced stats overlay */}
        <View style={styles.enhancedStatsOverlay}>
          {(stats?.daysClean || 0) < 3 && (
            <Text style={styles.hoursCleanText}>
              {stats?.hoursClean || 0} hours clean
            </Text>
          )}
          <View style={styles.neuralGrowthContainer}>
            <TouchableOpacity onPress={() => {
              console.log('🔍 Neural badge clicked! Setting neuralInfoVisible to true');
              setNeuralInfoVisible(true);
            }}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
                style={styles.neuralGrowthBadge}
              >
                <Ionicons name="trending-up" size={16} color={safeColors.primary} />
                <Text style={styles.neuralGrowthText}>
                  {neuralBadgeMessage}
                </Text>
                <Ionicons name="information-circle-outline" size={14} color={safeColors.primary} style={{ marginLeft: 4 }} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Neural Info Modal Component - TEMPORARILY DISABLED
  const NeuralInfoModal = () => {
    // Temporarily disabled to prevent crashes - will rebuild properly later
    return null;
  };

  // Health Info Modal Component - EPIC RECOVERY OVERVIEW
  const HealthInfoModal = () => {
    const { recoveryPercentage, daysClean } = recoveryData;
    const healthScore = Math.round(stats?.healthScore || 0); // Round to whole number
    const moneySaved = stats?.moneySaved || 0;
    const unitsAvoided = stats?.unitsAvoided || 0;
    
    // Get current phase info
    const getCurrentPhase = () => {
      if (healthScore < 10) return { name: 'Starting Out', color: '#10B981', icon: 'leaf-outline', next: 10 };
      if (healthScore < 30) return { name: 'Early Progress', color: '#06B6D4', icon: 'trending-up-outline', next: 30 };
      if (healthScore < 60) return { name: 'Building Strength', color: '#8B5CF6', icon: 'barbell-outline', next: 60 };
      if (healthScore < 85) return { name: 'Major Recovery', color: '#F59E0B', icon: 'shield-checkmark-outline', next: 85 };
      return { name: 'Freedom', color: '#EF4444', icon: 'star-outline', next: 100 };
    };
    
    const phase = getCurrentPhase();
    const progressToNext = phase.next === 100 ? 100 : Math.round(((healthScore - (phase.next - 30)) / 30) * 100);
    
    return (
      <Modal
        visible={healthInfoVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setHealthInfoVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'left', 'right', 'bottom']}>
          <LinearGradient
            colors={['#000000', '#0A0F1C', '#0F172A']}
            style={styles.modalGradient}
          >
            {/* Premium Header */}
            <View style={styles.premiumModalHeader}>
              <TouchableOpacity 
                style={styles.premiumModalBackButton}
                onPress={() => setHealthInfoVisible(false)}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.premiumModalBackGradient}
                >
                  <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.premiumModalTitle}>Recovery Overview</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

                        {/* Content - Optimized Single Page Design */}
            <View style={styles.optimizedContent}>
              {/* Optimized Hero Section */}
              <View style={styles.optimizedHero}>
                {/* Progress Circle and Info Side by Side */}
                <View style={styles.optimizedTopRow}>
                  {/* Progress Ring */}
                  <View style={styles.optimizedProgressRing}>
                    <View style={styles.optimizedRingBackground} />
                    <View 
                      style={[
                        styles.optimizedRingProgress,
                        { 
                          transform: [
                            { rotate: '-90deg' },
                            { translateX: 0 },
                            { translateY: 0 },
                            { rotate: `${(healthScore / 100) * 360}deg` }
                          ]
                        }
                      ]}
                    >
                      <View style={[styles.optimizedRingFill, { backgroundColor: phase.color }]} />
                    </View>
                    <View style={styles.optimizedRingInner}>
                      <Text style={[styles.optimizedScoreText, { color: '#FFFFFF' }]}>{healthScore || '0'}</Text>
                      <Text style={styles.optimizedScoreLabel}>SCORE</Text>
                    </View>
                  </View>
                  
                  {/* Phase Info */}
                  <View style={styles.optimizedPhaseInfo}>
                    <View style={[styles.optimizedPhaseBadge, { backgroundColor: `${phase.color}15` }]}>
                      <Ionicons name={phase.icon as any} size={16} color={phase.color} />
                      <Text style={[styles.optimizedPhaseText, { color: phase.color }]}>{phase.name}</Text>
                    </View>
                    <Text style={styles.optimizedPhaseDescription}>
                      {phase.name === 'Starting Out' ? 'First steps taken' :
                       phase.name === 'Early Progress' ? 'Body adapting' :
                       phase.name === 'Building Strength' ? 'Habits forming' :
                       phase.name === 'Major Recovery' ? 'Life transformed' :
                       'Living free'}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.optimizedProgressBar}>
                  <View style={styles.optimizedProgressTrack}>
                    <View 
                      style={[
                        styles.optimizedProgressFill,
                        { 
                          width: `${healthScore}%`,
                          backgroundColor: phase.color 
                        }
                      ]} 
                    />
                  </View>
                  <View style={styles.optimizedMilestones}>
                    {[10, 30, 60, 85].map((milestone) => (
                      <View 
                        key={milestone}
                        style={[
                          styles.optimizedMilestone,
                          { left: `${milestone}%` }
                        ]}
                      >
                        <View style={[
                          styles.optimizedMilestoneDot,
                          healthScore >= milestone && { backgroundColor: phase.color }
                        ]} />
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Journey Phases */}
              <View style={styles.optimizedJourney}>
                <Text style={styles.optimizedSectionTitle}>YOUR JOURNEY</Text>
                
                <View style={styles.optimizedPhasesList}>
                  {[
                    { name: 'Starting Out', score: 10, icon: 'leaf-outline' },
                    { name: 'Early Progress', score: 30, icon: 'trending-up-outline' },
                    { name: 'Building Strength', score: 60, icon: 'barbell-outline' },
                    { name: 'Major Recovery', score: 85, icon: 'shield-checkmark-outline' },
                    { name: 'Freedom', score: 100, icon: 'star-outline' }
                  ].map((p, index) => {
                    const isActive = healthScore >= (index === 0 ? 0 : [10, 30, 60, 85][index - 1]) && 
                                   healthScore < [10, 30, 60, 85, 101][index];
                    const isComplete = healthScore >= [10, 30, 60, 85, 100][index];
                    
                    return (
                      <View 
                        key={index} 
                        style={[
                          styles.optimizedPhaseItem,
                          isActive && styles.optimizedPhaseItemActive,
                          isComplete && styles.optimizedPhaseItemComplete
                        ]}
                      >
                        <View style={[
                          styles.optimizedPhaseIcon,
                          isActive && { backgroundColor: `${phase.color}20` },
                          isComplete && { backgroundColor: 'rgba(16, 185, 129, 0.2)' }
                        ]}>
                          <Ionicons 
                            name={isComplete ? 'checkmark-circle' : p.icon as any} 
                            size={16} 
                            color={isComplete ? '#10B981' : isActive ? phase.color : '#6B7280'} 
                          />
                        </View>
                        <View style={styles.optimizedPhaseTextContainer}>
                          <Text style={[
                            styles.optimizedPhaseName,
                            (isActive || isComplete) && styles.optimizedPhaseNameActive
                          ]}>
                            {p.name}
                          </Text>
                          <Text style={styles.optimizedPhaseScore}>
                            {isComplete ? 'Complete' : `${p.score}%`}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Next Goal */}
              {healthScore < 100 && (
                <View style={styles.optimizedNextGoal}>
                  <View style={[styles.optimizedNextGoalBar, { backgroundColor: `${phase.color}15` }]}>
                    <Ionicons name="flag" size={16} color={phase.color} />
                    <Text style={styles.optimizedNextGoalText}>
                      Next: {phase.name === 'Starting Out' ? '10%' :
                             phase.name === 'Early Progress' ? '30%' :
                             phase.name === 'Building Strength' ? '60%' :
                             phase.name === 'Major Recovery' ? '85%' : '100%'} • {Math.max(0, (phase.name === 'Starting Out' ? 10 :
                                     phase.name === 'Early Progress' ? 30 :
                                     phase.name === 'Building Strength' ? 60 :
                                     phase.name === 'Major Recovery' ? 85 : 100) - healthScore)}% to go
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Glassmorphism Footer */}
            <View style={styles.glassmorphismFooter}>
              <TouchableOpacity 
                style={styles.glassmorphismActionButton}
                onPress={() => setHealthInfoVisible(false)}
              >
                <LinearGradient
                  colors={[phase.color, `${phase.color}CC`]}
                  style={styles.glassmorphismActionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.glassmorphismActionText}>Got It!</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </SafeAreaView>
      </Modal>
    );
  };



  // Journal modal components have been moved to components/dashboard/RecoveryJournal.tsx

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.content} 
            showsVerticalScrollIndicator={false}
          >
            {/* Neural Recovery Explanation */}
            <View style={styles.neuralExplanation}>
              <View style={styles.neuralExplanationHeader}>
                <Ionicons name="pulse-outline" size={20} color={COLORS.primary} />
                <Text style={styles.neuralExplanationTitle}>Your Brain Recovery Map</Text>
              </View>
              <Text style={styles.neuralExplanationText}>
                Watch your brain build new healthy pathways. Each day creates stronger connections, 
                breaking nicotine's hold and restoring your natural neural network.
              </Text>
            </View>

            {/* Neural Network Visualization */}
            <View style={styles.neuralNetworkContainer}>
              <NeuralNetworkVisualization />
            </View>

            {/* Metrics Grid */}
            <View style={styles.metricsGrid}>
              <TouchableOpacity 
                style={styles.metricCard}
                onPress={() => setHealthInfoVisible(true)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.08)', 'rgba(6, 182, 212, 0.05)', 'rgba(99, 102, 241, 0.03)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.metricCardGradient}
                >
                  <View style={styles.metricContent}>
                    <View style={styles.metricIconWrapper}>
                      <LinearGradient
                        colors={[COLORS.secondary + '20', COLORS.primary + '20']}
                        style={styles.metricIconGradient}
                      >
                        <Ionicons name="heart" size={18} color={COLORS.secondary} />
                      </LinearGradient>
                    </View>
                    <View style={styles.metricTextContent}>
                      <Text style={styles.metricTitle}>Overall Recovery</Text>
                      <View style={styles.metricValueRow}>
                        <Text style={styles.metricValue}>{Math.round(stats?.healthScore || 0)}</Text>
                        <Text style={styles.metricUnit}>%</Text>
                      </View>
                      <Text style={styles.metricSubtext}>tap for details</Text>
                      <View style={styles.metricBar}>
                        <LinearGradient
                          colors={[COLORS.secondary, COLORS.primary]}
                          style={[styles.metricBarFill, { width: `${stats?.healthScore || 0}%` }]}
                        />
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.metricCard}>
                <LinearGradient
                  colors={['rgba(6, 182, 212, 0.08)', 'rgba(16, 185, 129, 0.05)', 'rgba(99, 102, 241, 0.03)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.metricCardGradient}
                >
                  <View style={styles.metricContent}>
                    <View style={styles.metricIconWrapper}>
                      <LinearGradient
                        colors={[COLORS.primary + '20', COLORS.secondary + '20']}
                        style={styles.metricIconGradient}
                      >
                        <Ionicons name="time" size={18} color={COLORS.primary} />
                      </LinearGradient>
                    </View>
                    <View style={styles.metricTextContent}>
                      <Text style={styles.metricTitle}>Time Saved</Text>
                      <View style={styles.metricValueRow}>
                        <Text style={styles.metricValue}>{Math.round(stats?.lifeRegained || 0)}</Text>
                        <Text style={styles.metricUnit}>h</Text>
                      </View>
                      <Text style={styles.metricSubtext}>of life regained</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <TouchableOpacity 
                style={styles.metricCard}
                onPress={() => setMoneySavedModalVisible(true)}
                activeOpacity={0.85}
              >
              <LinearGradient
                colors={['rgba(245, 158, 11, 0.08)', 'rgba(16, 185, 129, 0.05)', 'rgba(6, 182, 212, 0.03)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.metricCardGradient}
              >
                <View style={styles.metricContent}>
                  <View style={styles.metricIconWrapper}>
                    <LinearGradient
                      colors={['#F59E0B20', '#10B98120']}
                      style={styles.metricIconGradient}
                    >
                      <Ionicons name="cash" size={18} color="#F59E0B" />
                    </LinearGradient>
                  </View>
                  <View style={styles.metricTextContent}>
                    <Text style={styles.metricTitle}>Money Saved</Text>
                    <View style={styles.metricValueRow}>
                      <Text style={[styles.metricUnit, { marginRight: 2 }]}>$</Text>
                      <Text style={styles.metricValue}>{Math.round(stats?.moneySaved || 0)}</Text>
                    </View>
                    <Text style={styles.metricSubtext}>tap to customize</Text>
                  </View>
                </View>
              </LinearGradient>
              </TouchableOpacity>

              <View style={styles.metricCard}>
                <LinearGradient
                  colors={['rgba(99, 102, 241, 0.08)', 'rgba(16, 185, 129, 0.05)', 'rgba(6, 182, 212, 0.03)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.metricCardGradient}
                >
                  <View style={styles.metricContent}>
                    <View style={styles.metricIconWrapper}>
                      <LinearGradient
                        colors={['#6366F120', '#10B98120']}
                        style={styles.metricIconGradient}
                      >
                        <Ionicons name="shield-checkmark" size={18} color="#6366F1" />
                      </LinearGradient>
                    </View>
                    <View style={styles.metricTextContent}>
                      <Text style={styles.metricTitle}>Avoided</Text>
                      <View style={styles.metricValueRow}>
                        <Text style={styles.metricValue}>{avoidedDisplay.value}</Text>
                      </View>
                      <Text style={styles.metricSubtext}>{avoidedDisplay.unit}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* AI Coach Section */}
            <AICoachCard
              journalData={null}
              daysClean={recoveryData.daysClean}
            />

            {/* Recovery Plans Section */}
            <RecoveryPlanCard
              daysClean={recoveryData.daysClean}
            />

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>

              {/* Primary Action - Recovery Journal */}
              <TouchableOpacity 
                style={styles.primaryAction} 
                onPress={handleRecoveryJournal}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.1)', 'rgba(99, 102, 241, 0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryActionGradient}
                >
                  <View style={styles.primaryActionContent}>
                    <View style={styles.primaryActionHeader}>
                      <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                        <Ionicons name="book-outline" size={24} color={COLORS.primary} />
                      </View>
                      <Text style={styles.primaryActionTitle}>Recovery Journal</Text>
                    </View>
                    <Text style={styles.primaryActionSubtitle}>
                      Quick check-in • Track your recovery factors
                    </Text>
                  </View>
                  <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Secondary Actions */}
              <View style={styles.secondaryActions}>
                <TouchableOpacity style={styles.secondaryAction} onPress={handleResetProgress}>
                  <LinearGradient
                    colors={['rgba(245, 158, 11, 0.12)', 'rgba(239, 68, 68, 0.08)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.secondaryActionGradient}
                  >
                    <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.25)' }]}>
                      <Ionicons name="refresh-outline" size={22} color="#F59E0B" />
                    </View>
                    <Text style={styles.secondaryActionText}>Reset Date</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryAction} onPress={() => setDailyTipVisible(true)}>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.12)', 'rgba(6, 182, 212, 0.08)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.secondaryActionGradient}
                  >
                    <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.25)' }]}>
                      <Ionicons name="bulb-outline" size={22} color={COLORS.primary} />
                      {/* New tip indicator */}
                      <View style={styles.tipBadge} />
                    </View>
                    <Text style={styles.secondaryActionText}>Daily Tip</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Neural Info Modal */}
      <NeuralInfoModal />

      {/* Health Info Modal */}
      <HealthInfoModal />



      {/* Recovery Journal Modal */}
      <RecoveryJournal 
        visible={recoveryJournalVisible}
        onClose={() => setRecoveryJournalVisible(false)}
        daysClean={stats.daysClean}
      />

      {/* Compact Reset Progress Modal */}
      <Modal
        visible={resetModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <SafeAreaView style={styles.compactResetModalContainer} edges={['top', 'left', 'right', 'bottom']}>
          <LinearGradient
            colors={['#000000', '#111827', '#1F2937']}
            style={styles.compactResetModalGradient}
          >
            {/* Compact Header */}
            <View style={styles.compactResetModalHeader}>
              <View style={styles.compactResetModalHeaderContent}>
                <Ionicons name="refresh-circle" size={22} color="#F59E0B" />
                <Text style={styles.compactResetModalTitle}>Update Progress</Text>
              </View>
              <TouchableOpacity 
                style={styles.compactResetModalCloseButton}
                onPress={() => setResetModalVisible(false)}
              >
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Compact Content - No ScrollView */}
            <View style={styles.compactResetModalContent}>
              {/* Compact Reset Type Selection */}
              <View style={styles.compactResetTypeSelection}>
                <Text style={styles.compactResetSectionTitle}>What happened?</Text>
                
                <TouchableOpacity 
                  style={[styles.compactResetTypeOption, resetType === 'relapse' && styles.compactResetTypeOptionSelected]}
                  onPress={handleRelapseSelect}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.compactResetTypeOptionContent,
                    resetType === 'relapse' && styles.compactResetTypeOptionContentSelected
                  ]}>
                    <Ionicons name="refresh-circle" size={18} color={resetType === 'relapse' ? "#F59E0B" : "#9CA3AF"} />
                    <View style={styles.compactResetTypeOptionText}>
                      <Text style={[styles.compactResetTypeOptionTitle, resetType === 'relapse' && styles.compactResetTypeOptionTitleSelected]}>
                        Relapse - Continue Recovery
                      </Text>
                      <Text style={styles.compactResetTypeOptionSubtitle}>
                        Keep achievements, new streak from recovery date
                      </Text>
                    </View>
                    <View style={[styles.compactResetTypeRadio, resetType === 'relapse' && styles.compactResetTypeRadioSelected]}>
                      {resetType === 'relapse' && <View style={styles.compactResetTypeRadioInner} />}
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.compactResetTypeOption, resetType === 'fresh_start' && styles.compactResetTypeOptionSelected]}
                  onPress={handleFreshStartSelect}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.compactResetTypeOptionContent,
                    resetType === 'fresh_start' && styles.compactResetTypeOptionContentSelected
                  ]}>
                    <Ionicons name="trash" size={18} color={resetType === 'fresh_start' ? "#EF4444" : "#9CA3AF"} />
                    <View style={styles.compactResetTypeOptionText}>
                      <Text style={[styles.compactResetTypeOptionTitle, resetType === 'fresh_start' && styles.compactResetTypeOptionTitleSelected]}>
                        Fresh Start - Reset All
                      </Text>
                      <Text style={styles.compactResetTypeOptionSubtitle}>
                        Reset everything to zero, start completely over
                      </Text>
                    </View>
                    <View style={[styles.compactResetTypeRadio, resetType === 'fresh_start' && styles.compactResetTypeRadioSelected]}>
                      {resetType === 'fresh_start' && <View style={styles.compactResetTypeRadioInner} />}
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.compactResetTypeOption, resetType === 'correction' && styles.compactResetTypeOptionSelected]}
                  onPress={handleCorrectionSelect}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.compactResetTypeOptionContent,
                    resetType === 'correction' && styles.compactResetTypeOptionContentSelected
                  ]}>
                    <Ionicons name="create" size={18} color={resetType === 'correction' ? "#10B981" : "#9CA3AF"} />
                    <View style={styles.compactResetTypeOptionText}>
                      <Text style={[styles.compactResetTypeOptionTitle, resetType === 'correction' && styles.compactResetTypeOptionTitleSelected]}>
                        Date Correction - Fix Date
                      </Text>
                      <Text style={styles.compactResetTypeOptionSubtitle}>
                        Correct wrong date, adjust timeline accordingly
                      </Text>
                    </View>
                    <View style={[styles.compactResetTypeRadio, resetType === 'correction' && styles.compactResetTypeRadioSelected]}>
                      {resetType === 'correction' && <View style={styles.compactResetTypeRadioInner} />}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Compact Date Selection & Quick Options Combined */}
              <View style={styles.compactDateSection}>
                <Text style={styles.compactResetSectionTitle}>
                  {resetType === 'relapse' ? 'Recovery Date' : 
                   resetType === 'correction' ? 'Correct Date' : 
                   'Start Date'}
                </Text>
                
                {/* Date Button */}
                <TouchableOpacity 
                  style={styles.compactDateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.compactDateButtonContent}>
                    <Ionicons name="calendar" size={16} color="#10B981" />
                    <Text style={styles.compactDateButtonText}>
                      {newQuitDate && newQuitDate instanceof Date && !isNaN(newQuitDate.getTime()) ? 
                        newQuitDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 
                        new Date().toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      }
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Compact Quick Options */}
                <View style={styles.compactQuickOptionsGrid}>
                  <TouchableOpacity 
                    style={styles.compactQuickButton}
                    onPress={() => setNewQuitDate(new Date())}
                  >
                    <Text style={styles.compactQuickButtonText}>Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.compactQuickButton}
                    onPress={() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      setNewQuitDate(yesterday);
                    }}
                  >
                    <Text style={styles.compactQuickButtonText}>Yesterday</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.compactQuickButton}
                    onPress={() => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      setNewQuitDate(weekAgo);
                    }}
                  >
                    <Text style={styles.compactQuickButtonText}>1 Week</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Compact Info Banner */}
              <View style={styles.compactInfoBanner}>
                <Ionicons name="information-circle" size={16} color="#3B82F6" />
                <Text style={styles.compactInfoText}>
                  {resetType === 'relapse' ? 'Achievements preserved, new streak starts' :
                   resetType === 'fresh_start' ? 'All progress will be reset to zero' :
                   'Timeline adjusted, no progress lost'}
                </Text>
              </View>
            </View>

            {/* Compact Action Buttons */}
            <View style={styles.compactResetModalActions}>
              <TouchableOpacity 
                style={styles.compactResetCancelButton}
                onPress={() => setResetModalVisible(false)}
              >
                <Text style={styles.compactResetCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.compactResetConfirmButton}
                onPress={confirmReset}
              >
                <LinearGradient
                  colors={['#F59E0B', '#EF4444']}
                  style={styles.compactResetConfirmButtonGradient}
                >
                  <Ionicons name="refresh" size={16} color="#FFFFFF" />
                  <Text style={styles.compactResetConfirmButtonText}>
                    {resetType === 'relapse' ? 'Continue' : 
                     resetType === 'fresh_start' ? 'Reset All' : 
                     'Update'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Date Picker */}
            {showDatePicker && (
              <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <View style={styles.datePickerOverlay}>
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
                    />
                  </View>
                </View>
              </Modal>
            )}
          </LinearGradient>
        </SafeAreaView>
      </Modal>

      {/* Daily Tip Modal */}
      <DailyTipModal 
        visible={dailyTipVisible} 
        onClose={() => setDailyTipVisible(false)} 
      />

      {/* Customize Journal Modal - Now handled inside RecoveryJournal component */}
      
      {/* Money Saved Modal */}
      <MoneySavedModal 
        visible={moneySavedModalVisible}
        onClose={() => setMoneySavedModalVisible(false)}
        stats={stats}
        userProfile={user?.nicotineProduct}
        customDailyCost={customDailyCost}
        onUpdateCost={setCustomDailyCost}
        savingsGoal={savingsGoal}
        savingsGoalAmount={savingsGoalAmount}
        editingGoal={editingGoal}
        setSavingsGoal={setSavingsGoal}
        setSavingsGoalAmount={setSavingsGoalAmount}
        setEditingGoal={setEditingGoal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING['3xl'], // Extra bottom padding to ensure content is visible above tab bar
  },

  neuralExplanation: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  neuralExplanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  neuralExplanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  neuralExplanationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  neuralNetworkContainer: {
    height: 300,
    marginBottom: SPACING.lg,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enhancedNeuralContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  enhancedStatsOverlay: {
    position: 'absolute',
    bottom: -10,
    alignItems: 'center',
  },
  hoursCleanText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  neuralGrowthContainer: {
    marginTop: SPACING.md,
  },
  neuralGrowthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    backgroundColor: COLORS.primary + '10',
  },
  neuralGrowthText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  metricCard: {
    width: '48%',
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  metricCardGradient: {
    borderRadius: 12,
    padding: 1,
  },
  metricContent: {
    flexDirection: 'column',
    padding: SPACING.sm + 2,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 100,
    justifyContent: 'space-between',
  },
  metricIconWrapper: {
    width: 32,
    height: 32,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  metricIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricTextContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 4,
  },
  metricTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  metricSubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  metricBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  quickActions: {
    marginBottom: SPACING.xl,
  },
  sectionContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    letterSpacing: -0.3,
  },
  primaryAction: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  primaryActionContent: {
    flex: 1,
  },
  primaryActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  primaryActionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.md,
    letterSpacing: -0.2,
  },
  primaryActionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontWeight: '500',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  secondaryAction: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryActionGradient: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    minHeight: 80,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.sm,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tipBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4444',
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#FF4444',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 4,
  },

  // Keep all existing modal styles exactly the same - they're working fine
  resetModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  resetModalGradient: {
    flex: 1,
    backgroundColor: '#000000',
  },
  resetModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetModalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  resetModalCloseButton: {
    padding: SPACING.sm,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetModalContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  resetTypeSelection: {
    marginBottom: SPACING.lg,
  },
  resetTypeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  resetTypeOption: {
    marginBottom: SPACING.md,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetTypeOptionSelected: {
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  resetTypeOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.lg,
  },
  resetTypeOptionGradientSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
    borderWidth: 1,
  },
  resetTypeOptionText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  resetTypeOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  resetTypeOptionTitleSelected: {
    color: '#F59E0B',
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
    marginLeft: SPACING.sm,
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
  resetWhatHappens: {
    marginBottom: SPACING.lg,
  },
  resetWhatHappensCard: {
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    overflow: 'hidden',
  },
  resetWhatHappensContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  resetWhatHappensText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  resetWhatHappensTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  resetWhatHappensDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  resetSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  resetDateSelection: {
    marginBottom: SPACING.lg,
  },
  resetDateButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  resetDateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  resetDateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  resetQuickOptions: {
    marginBottom: SPACING.lg,
  },
  resetQuickButtonsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  resetQuickButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetQuickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  resetModalActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  resetCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resetCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  resetConfirmButton: {
    flex: 1,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  resetConfirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  resetConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: '#1A1A2E',
    borderRadius: SPACING.xl,
    padding: SPACING.xl,
    marginHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.lg,
  },
  datePickerCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  datePickerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalGradient: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalCloseButton: {
    padding: SPACING.sm,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  statusPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  statusDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  scienceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  scienceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  scienceText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  timelineContainer: {
    marginTop: SPACING.md,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  timelineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.md,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  timelineText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  modalFooter: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  keepGoingButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  keepGoingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  keepGoingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
  },

  // Keep all existing journal styles exactly the same
  journalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  journalGradient: {
    flex: 1,
  },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  journalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  journalEditButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalDateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    position: 'relative',
  },
  journalNavArrow: {
    padding: SPACING.sm,
  },
  journalDateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: SPACING.lg,
  },
  journalInsightsSpacing: {
    position: 'absolute',
    right: SPACING.lg,
  },
  journalInsightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  journalInsightsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10B981',
    marginLeft: 4,
  },
  journalMainQuestion: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  journalMainQuestionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  journalContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  journalCompactSection: {
    marginBottom: SPACING.md,
  },
  journalCompactSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
    paddingLeft: 2,
  },
  journalCompactQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  journalCompactQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
    marginRight: SPACING.md,
  },
  journalCompactToggleContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  journalCompactToggle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  journalCompactToggleActive: {
    backgroundColor: '#10B981',
  },
  journalCompactToggleInactive: {
    backgroundColor: '#6B7280',
  },
  journalCompactInputButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    minWidth: 50,
    alignItems: 'center',
  },
  journalCompactInputButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  journalCompactSaveContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  journalCompactSaveButton: {
    width: '100%',
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: safeColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalCompactSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Input Modal Styles  
  inputModalContainer: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    padding: SPACING.lg,
  },
  inputModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  inputModalCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: safeColors.textSecondary,
  },
  inputModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: safeColors.text,
  },
  inputModalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  inputModalContent: {
    flex: 1,
    marginTop: SPACING.lg,
  },
  inputModalPlaceholder: {
    fontSize: 14,
    color: safeColors.textSecondary,
    lineHeight: 20,
  },
  // Scale Styles
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  scaleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleButtonActive: {
    backgroundColor: safeColors.primary,
    borderColor: safeColors.primary,
  },
  scaleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: safeColors.text,
  },
  scaleButtonTextActive: {
    color: '#FFFFFF',
  },
  // Customize Modal Styles
  customizeInfoSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  customizeInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  customizeInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: safeColors.text,
    marginLeft: SPACING.sm,
  },
  customizeInfoText: {
    fontSize: 14,
    color: safeColors.textSecondary,
    lineHeight: 20,
  },
  customizeFactorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  customizeFactorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customizeFactorTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: safeColors.text,
    marginLeft: SPACING.md,
  },
  customizeFactorTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  customizeFactorDescription: {
    fontSize: 12,
    color: safeColors.textSecondary,
    lineHeight: 16,
  },
  customizeFactorToggle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  customizeFactorToggleDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderColor: '#6B7280',
  },
  customizeFooterInfo: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  customizeFooterInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customizeFooterInfoText: {
    fontSize: 12,
    color: safeColors.textSecondary,
    marginLeft: SPACING.sm,
    textAlign: 'center',
  },
  journalCompactInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  journalCompactCounterButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalCompactCounterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Counter Question Styles - New Clear Layout
  journalCounterQuestion: {
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  journalCounterQuestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  // Smooth Counter Styles - Updated
  journalSmoothCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  journalCounterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  journalCounterValue: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    minHeight: 44,
  },
  journalCounterValueText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  journalCounterUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customizeFactorToggleActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  customizeFactorTitleDisabled: {
    color: '#6B7280',
    opacity: 0.7,
  },

  // Journal Section Styles
  journalSection: {
    marginBottom: SPACING.xl,
  },
  journalSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
    letterSpacing: 1.2,
    marginBottom: SPACING.lg,
    paddingLeft: 2,
  },
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  premiumModalBackGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  premiumModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  modalHeaderSpacer: {
    width: 40,
  },
  scoreHeroSection: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
    paddingHorizontal: SPACING.lg,
  },
  scoreGlowContainer: {
    position: 'relative',
    marginBottom: SPACING.xl,
  },
  scoreGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 80,
    opacity: 0.4,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  scorePercentage: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  scorePercentageSymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: -10,
  },
  scoreTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
    letterSpacing: -0.5,
  },
  scoreSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.xl,
  },
  premiumSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  premiumScoreCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  premiumScoreCardGradient: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  scoreCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  scoreCardIconGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCardContent: {
    flex: 1,
  },
  scoreCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scoreCardValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  scoreCardDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  scoreCardProgress: {
    marginTop: SPACING.xs,
  },
  scoreCardProgressBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreCardProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  premiumTimeline: {
    marginTop: SPACING.sm,
  },
  milestoneItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  milestoneLeft: {
    width: 40,
    alignItems: 'center',
  },
  milestoneDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  milestoneLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  milestoneContent: {
    flex: 1,
    marginLeft: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  milestoneContentActive: {
    transform: [{ scale: 1.02 }],
  },
  milestoneGradient: {
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  milestoneRange: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  milestoneTitleActive: {
    color: '#FFFFFF',
  },
  milestoneDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  milestoneDescActive: {
    color: COLORS.textSecondary,
  },
  premiumModalFooter: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  premiumActionButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  premiumActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  premiumActionText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
    letterSpacing: -0.2,
  },
  elegantScoreSection: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
    paddingHorizontal: SPACING.lg,
  },
  elegantScoreLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  elegantScoreContainer: {
    position: 'relative',
    marginBottom: SPACING.xl,
  },
  elegantScoreGradient: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  elegantScoreContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  elegantScoreValue: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  elegantScorePercent: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.8,
    marginLeft: 4,
  },
  elegantScoreSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.xl,
  },
  elegantScoreDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  recoveryComponentsSection: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  recoveryComponentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  recoveryComponentCard: {
    width: '48%',
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    height: 140,
  },
  recoveryComponentGradient: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    justifyContent: 'space-between',
  },
  recoveryComponentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  recoveryComponentValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    height: 32,
    lineHeight: 32,
    textAlign: 'center',
  },
  recoveryComponentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  miniProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 'auto',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  recoveryJourneySection: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  recoveryPhases: {
    width: '100%',
  },
  recoveryPhaseCard: {
    width: '100%',
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  recoveryPhaseGradient: {
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  recoveryPhaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recoveryPhaseIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  recoveryPhaseRange: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recoveryPhaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  recoveryPhaseTitleActive: {
    color: '#FFFFFF',
  },
  recoveryPhaseDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  recoveryPhaseDescActive: {
    color: COLORS.textSecondary,
  },
  understandingSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  understandingCard: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  understandingGradient: {
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  understandingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  understandingText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginLeft: SPACING.md,
    flex: 1,
  },
  understandingDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.lg,
  },
  
  // Money Saved Modal Styles
  moneySavedHeroSection: {
    alignItems: 'center',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  compactMoneySavedHero: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  moneySavedAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  moneySavedCurrency: {
    fontSize: 30,
    fontWeight: '600',
    color: '#F59E0B',
    marginRight: 4,
  },
  moneySavedAmount: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  moneySavedSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  
  // Fixed Hero Section Styles
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  currency: {
    fontSize: 28,
    fontWeight: '600',
    color: '#F59E0B',
    marginRight: 4,
  },
  amount: {
    fontSize: 52,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  // Compact Money Saved Styles
  compactHeroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  compactAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  compactCurrency: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F59E0B',
    marginRight: 4,
  },
  compactAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.5,
  },
  compactSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  calculationSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  calculationCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  calculationGradient: {
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  calculationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  calculationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  calculationContent: {
    flex: 1,
  },
  calculationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  calculationValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 4,
  },
  calculationDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  costCustomizationSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  costCustomizationDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  customPriceContainer: {
    marginBottom: SPACING.md,
  },
  customPriceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
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
    height: 50,
  },
  customPriceCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F59E0B',
    marginRight: 4,
  },
  customPriceInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    padding: 0,
  },
  customPriceSaveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  customPriceSaveGradient: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customPriceSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  presetsContainer: {
    marginTop: SPACING.md,
  },
  presetsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  presetsScroll: {
    maxHeight: 300,
  },
  presetsGrid: {
    flexDirection: 'column',
    gap: SPACING.sm,
  },
  presetButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  presetButtonActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  presetCity: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  presetCityActive: {
    color: '#FFFFFF',
  },
  presetPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  presetPriceActive: {
    color: '#F59E0B',
  },
  projectionSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  projectionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  projectionCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 100,
  },
  motivationCard: {
    marginTop: SPACING.md,
  },
  motivationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  motivationText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  projectionGradient: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
  },
  projectionPeriod: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  projectionAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
    minWidth: '100%',
  },
  
  // BIG Future Savings Styles - Conversion Focused
  bigProjectionSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  bigSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1.2,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  bigProjectionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  bigProjectionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  bigProjectionGradient: {
    flex: 1,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 16,
  },
  bigProjectionPeriod: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  bigProjectionAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10B981',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  bigProjectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  conversionMessage: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  conversionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
    lineHeight: 20,
  },
  moneySavedInfoSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  moneySavedInfoGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  moneySavedInfoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginLeft: SPACING.md,
  },
  
  // Epic Recovery Overview Styles
  epicHeroSection: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
    paddingHorizontal: SPACING.lg,
  },
  epicScoreContainer: {
    marginBottom: SPACING.xl,
  },
  epicScoreGradient: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
    paddingHorizontal: SPACING['3xl'],
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  epicScoreRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  epicScoreInnerGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  epicScoreValue: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  epicScorePercent: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: -8,
  },
  epicPhaseBadge: {
    position: 'absolute',
    bottom: -12,
  },
  epicPhaseBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  epicPhaseText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: SPACING.sm,
    letterSpacing: 0.5,
  },
  epicMotivationalText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: SPACING.xl,
  },
  epicQuickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  epicQuickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  epicQuickStatValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginVertical: 4,
  },
  epicQuickStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  epicQuickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: SPACING.md,
  },
  epicTimelineSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  epicTimeline: {
    gap: SPACING.md,
  },
  epicCurrentMilestone: {
    marginBottom: SPACING.md,
  },
  epicMilestoneCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  epicMilestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  epicMilestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  epicMilestoneContent: {
    flex: 1,
  },
  epicMilestoneTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  epicMilestoneName: {
    fontSize: 18,
    fontWeight: '700',
  },
  epicNextPhaseProgress: {
    marginTop: SPACING.md,
  },
  epicNextPhaseText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  epicProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  epicProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  epicNextPhasePercent: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  epicBenefitsCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  epicBenefitsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  epicBenefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  epicBenefitText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 20,
  },
  epicBreakdownSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  epicBreakdownCards: {
    gap: SPACING.md,
  },
  epicBreakdownCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  epicBreakdownGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  epicBreakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  epicBreakdownIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  epicBreakdownInfo: {
    flex: 1,
  },
  epicBreakdownLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  epicBreakdownValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  epicBreakdownBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  epicBreakdownBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  epicBreakdownDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  epicMilestonesSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  epicMilestonesList: {
    gap: SPACING.md,
  },
  epicNextMilestone: {
    marginBottom: SPACING.md,
  },
  epicNextMilestoneGradient: {
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  epicMilestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  epicMilestoneIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  epicMilestoneDetails: {
    flex: 1,
  },
  epicMilestoneDay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 2,
  },
  epicMilestoneWhat: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  epicMilestoneDaysLeft: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  epicSmallMilestones: {
    gap: SPACING.sm,
  },
  epicSmallMilestone: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  epicSmallMilestoneText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  epicProTipsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  epicProTipsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  epicProTipsGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  epicProTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  epicProTipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: SPACING.md,
  },
  epicProTipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  epicModalFooter: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  epicActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  epicActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  epicActionText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
    letterSpacing: -0.2,
  },
  
  // Journey-focused styles
  epicJourneyContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  epicJourneyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.lg,
  },
  epicPhaseDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  epicPhaseGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  epicPhaseInfo: {
    flex: 1,
  },
  epicPhaseName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  epicPhaseDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  epicProgressRing: {
    width: 160,
    height: 160,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  epicRingOuter: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  epicRingProgress: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 12,
    borderColor: 'transparent',
    borderTopColor: 'currentColor',
    borderRightColor: 'currentColor',
  },
  epicRingCenter: {
    alignItems: 'center',
  },
  epicRingPercent: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  epicRingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  epicPhasesSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  epicSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.lg,
  },
  epicPhasesList: {
    position: 'relative',
  },
  epicPhaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  epicPhaseIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginRight: SPACING.md,
  },
  epicPhaseContent: {
    flex: 1,
  },
  epicPhaseListName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  epicPhaseRange: {
    fontSize: 13,
    fontWeight: '500',
  },
  epicPhaseConnector: {
    position: 'absolute',
    left: 20,
    top: 40,
    width: 2,
    height: SPACING.lg + 20,
  },
  epicNextSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  epicNextCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  epicNextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 16,
  },
  epicNextContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  epicNextTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  epicNextDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },

  // Clean Recovery Overview Styles
  cleanRecoveryContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  cleanHeroSection: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING['2xl'],
    alignItems: 'center',
  },
  cleanProgressContainer: {
    alignItems: 'center',
  },
  cleanProgressRing: {
    width: 180,
    height: 180,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  cleanRingBackground: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 16,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cleanRingProgress: {
    position: 'absolute',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanRingFill: {
    position: 'absolute',
    width: 164,
    height: 164,
    borderRadius: 82,
    borderWidth: 16,
    borderColor: 'transparent',
    borderTopColor: 'currentColor',
    borderRightColor: 'currentColor',
  },
  cleanRingInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanScoreText: {
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
  },
  cleanScoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  cleanPhaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 100,
    marginBottom: SPACING.lg,
  },
  cleanPhaseText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: SPACING.sm,
    letterSpacing: -0.2,
  },
  cleanProgressBar: {
    width: '100%',
    height: 32,
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  cleanProgressTrack: {
    position: 'absolute',
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    top: 12,
  },
  cleanProgressFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: 4,
    shadowColor: 'currentColor',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cleanMilestones: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cleanMilestone: {
    position: 'absolute',
    top: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -8 }],
  },
  cleanMilestoneDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 3,
    borderColor: '#000000',
  },
  cleanMilestoneActive: {
    zIndex: 1,
  },
  cleanPhaseDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.xl,
  },
  cleanRoadmapSection: {
    marginBottom: SPACING['2xl'],
  },
  cleanSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.lg,
  },
  cleanPhaseCards: {
    gap: SPACING.sm,
  },
  cleanPhaseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cleanPhaseCardActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cleanPhaseCardComplete: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  cleanPhaseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  cleanPhaseCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  cleanPhaseCardNameActive: {
    color: COLORS.text,
  },
  cleanPhaseCardScore: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cleanPhaseCardScoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cleanPhaseCardBenefit: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  cleanPhaseCardBenefitActive: {
    color: COLORS.textSecondary,
  },
  cleanNextGoal: {
    marginBottom: SPACING.xl,
  },
  cleanNextGoalGradient: {
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'currentColor',
  },
  cleanNextGoalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cleanNextGoalText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  cleanNextGoalTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cleanNextGoalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  cleanNextGoalPercent: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  // Compact Recovery Overview Styles
  cleanRecoveryScrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.md,
  },
  compactTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  compactProgressRing: {
    width: 100,
    height: 100,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  compactRingBackground: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  compactRingProgress: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactRingFill: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 10,
    borderColor: 'transparent',
    borderTopColor: 'currentColor',
    borderRightColor: 'currentColor',
  },
  compactRingInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactScoreText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  compactScoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginTop: 2,
    opacity: 0.8,
  },
  compactPhaseInfo: {
    flex: 1,
  },
  compactPhaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: SPACING.xs,
  },
  compactPhaseText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: -0.2,
  },
  compactPhaseDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  compactProgressBar: {
    width: '100%',
    height: 20,
    position: 'relative',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  compactProgressTrack: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    top: 8,
  },
  compactProgressFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: 2,
  },
  compactMilestones: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    height: '100%',
  },
  compactMilestone: {
    position: 'absolute',
    top: 4,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -6 }],
  },
  compactMilestoneDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#000000',
  },
  compactRoadmapSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  compactSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  compactPhaseGrid: {
    gap: SPACING.xs,
  },
  compactPhaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  compactPhaseItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  compactPhaseItemComplete: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  compactPhaseIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  compactPhaseTextContainer: {
    flex: 1,
  },
  compactPhaseName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  compactPhaseNameActive: {
    color: COLORS.text,
  },
  compactPhaseScore: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  compactNextGoal: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  compactNextGoalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'currentColor',
  },
  compactNextGoalText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },

  // Glassmorphism Footer Styles
  glassmorphismFooter: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  glassmorphismActionButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  glassmorphismActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  glassmorphismActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
    letterSpacing: -0.2,
  },

  // Improved Roadmap Styles
  improvedRoadmapSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  improvedSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  improvedPhaseGrid: {
    gap: SPACING.sm,
  },
  improvedPhaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 2,
  },
  improvedPhaseItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    transform: [{ scale: 1.01 }],
  },
  improvedPhaseItemComplete: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  improvedPhaseIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  improvedPhaseTextContainer: {
    flex: 1,
  },
  improvedPhaseName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  improvedPhaseNameActive: {
    color: COLORS.text,
  },
  improvedPhaseScore: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },

  // Optimized Recovery Overview Styles - Balanced Single Page Design
  optimizedContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    justifyContent: 'space-between',
  },
  optimizedHero: {
    paddingBottom: SPACING.sm,
  },
  optimizedTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  optimizedProgressRing: {
    width: 90,
    height: 90,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  optimizedRingBackground: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 9,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optimizedRingProgress: {
    position: 'absolute',
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optimizedRingFill: {
    position: 'absolute',
    width: 81,
    height: 81,
    borderRadius: 40.5,
    borderWidth: 9,
    borderColor: 'transparent',
    borderTopColor: 'currentColor',
    borderRightColor: 'currentColor',
  },
  optimizedRingInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optimizedScoreText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  optimizedScoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginTop: 2,
    opacity: 0.8,
  },
  optimizedPhaseInfo: {
    flex: 1,
  },
  optimizedPhaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 6,
  },
  optimizedPhaseText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: -0.2,
  },
  optimizedPhaseDescription: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  optimizedProgressBar: {
    width: '100%',
    height: 18,
    position: 'relative',
    marginBottom: SPACING.xs,
  },
  optimizedProgressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    top: 7,
  },
  optimizedProgressFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: 2,
  },
  optimizedMilestones: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '100%',
  },
  optimizedMilestone: {
    position: 'absolute',
    top: 3,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -6 }],
  },
  optimizedMilestoneDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#000000',
  },
  optimizedJourney: {
    marginBottom: SPACING.sm,
  },
  optimizedSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  optimizedPhasesList: {
    gap: 8,
  },
  optimizedPhaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  optimizedPhaseItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  optimizedPhaseItemComplete: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  optimizedPhaseIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  optimizedPhaseTextContainer: {
    flex: 1,
  },
  optimizedPhaseName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 3,
  },
  optimizedPhaseNameActive: {
    color: COLORS.text,
  },
  optimizedPhaseScore: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  optimizedNextGoal: {
    marginTop: 'auto',
    paddingTop: SPACING.xs,
  },
  optimizedNextGoalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'currentColor',
  },
  optimizedNextGoalText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },

  // Compact Reset Modal Styles
  compactResetModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  compactResetModalGradient: {
    flex: 1,
  },
  compactResetModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.3)',
  },
  compactResetModalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactResetModalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 10,
  },
  compactResetModalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  compactResetModalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  compactResetTypeSelection: {
    marginBottom: 20,
  },
  compactResetSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  compactResetTypeOption: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  compactResetTypeOptionSelected: {
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  compactResetTypeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.4)',
  },
  compactResetTypeOptionContentSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  compactResetTypeOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  compactResetTypeOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  compactResetTypeOptionTitleSelected: {
    color: '#F59E0B',
  },
  compactResetTypeOptionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  compactResetTypeRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(156, 163, 175, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  compactResetTypeRadioSelected: {
    borderColor: '#F59E0B',
  },
  compactResetTypeRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  compactDateSection: {
    marginBottom: 16,
  },
  compactDateButton: {
    marginBottom: 12,
  },
  compactDateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  compactDateButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: 8,
  },
  compactQuickOptionsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  compactQuickButton: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.4)',
  },
  compactQuickButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
  },
  compactInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  compactInfoText: {
    fontSize: 12,
    color: '#93C5FD',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  compactResetModalActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(55, 65, 81, 0.3)',
    gap: 12,
  },
  compactResetCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  compactResetCancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  compactResetConfirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  compactResetConfirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  compactResetConfirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },

  // Beautiful Savings Goal Styles
  savingsGoalSection: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  savingsGoalCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  savingsGoalGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  savingsGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  savingsGoalInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  savingsGoalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  savingsGoalName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  savingsGoalAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  editGoalButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  piggyBankContainer: {
    alignItems: 'center',
  },
  piggyBankProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressContainer: {
    flex: 1,
    marginTop: SPACING.sm,
  },
  progressBackground: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#F59E0B',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
  },
  goalAmount: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  estimatedCompletion: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Setup Goal Card
  setupGoalCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  setupGoalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  setupGoalContent: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.md,
  },
  setupGoalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  setupGoalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Goal Setup Modal
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
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    fontWeight: '600',
  },
  goalModalContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  goalInputSection: {
    marginBottom: SPACING.xl,
  },
  goalInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  goalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  goalSuggestionsSection: {
    marginBottom: SPACING.xl,
  },
  goalSuggestionsTitle: {
    fontSize: 16,
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
  },
  suggestionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  suggestionAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
});

export default DashboardScreen; 