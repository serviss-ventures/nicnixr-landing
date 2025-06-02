import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Modal, Alert, Platform, TextInput, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { updateProgress, selectProgressStats, setQuitDate } from '../../store/slices/progressSlice';
import { COLORS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
// import { DashboardStackParamList } from '../../navigation/DashboardNavigator';
import EnhancedNeuralNetwork from '../../components/common/EnhancedNeuralNetwork';
import recoveryTrackingService from '../../services/recoveryTrackingService';
import DailyTipModal from '../../components/common/DailyTipModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getPersonalizedUnitName } from '../../services/personalizedContentService';
import AICoachCard from '../../components/common/AICoachCard';
import RecoveryPlanCard from '../../components/common/RecoveryPlanCard';

// Import debug utilities in development
if (__DEV__) {
  require('../../debug/neuralGrowthTest');
  require('../../debug/appReset');
}

const { width, height } = Dimensions.get('window');

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

// type DashboardNavigationProp = StackNavigationProp<DashboardStackParamList, 'Dashboard'>;

// Money Saved Modal - Outside component to prevent re-renders
const MoneySavedModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  stats: any;
  userProfile: any;
  customDailyCost: number;
  onUpdateCost: (cost: number) => void;
}> = ({ visible, onClose, stats, userProfile, customDailyCost, onUpdateCost }) => {
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
    Alert.alert(
      'Cost Updated',
      `Your daily cost has been updated to $${finalCost.toFixed(2)}`,
      [{ text: 'OK', onPress: onClose }]
    );
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'formSheet' : 'pageSheet'}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
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

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Current Savings Display */}
            <View style={[styles.moneySavedHeroSection, { paddingVertical: SPACING.lg, paddingTop: SPACING.xl }]}>
              <View style={styles.moneySavedAmountContainer}>
                <Text style={styles.moneySavedCurrency}>$</Text>
                <Text style={styles.moneySavedAmount}>{Math.round(stats?.moneySaved || 0)}</Text>
              </View>
              <Text style={styles.moneySavedSubtitle}>saved in {stats?.daysClean || 0} days</Text>
            </View>

            {/* Calculation Breakdown */}
            <View style={styles.calculationSection}>
              <Text style={styles.premiumSectionTitle}>Your Daily Cost</Text>
              
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
                          {stats?.daysClean === 0 
                            ? `$${displayCost.toFixed(2)} per day`
                            : `$${displayCost.toFixed(2)}/day × ${stats?.daysClean} days = $${Math.round(displayCost * (stats?.daysClean || 0))}`
                          }
                        </Text>
                      </View>
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Cost Input - Simplified */}
            <View style={styles.costCustomizationSection}>
              <Text style={styles.premiumSectionTitle}>Update Your Cost</Text>
              
              <View style={styles.customPriceContainer}>
                <Text style={styles.customPriceLabel}>
                  Cost per {productDetails.unit}
                </Text>
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
                      placeholder="0.00"
                    />
                  </View>
                  <TouchableOpacity 
                    style={styles.customPriceSaveButton}
                    onPress={handleSave}
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
            </View>

            {/* Future Savings - Simplified */}
            <View style={styles.projectionSection}>
              <Text style={styles.premiumSectionTitle}>Your Future Savings</Text>
              
              <View style={styles.projectionGrid}>
                <View style={styles.projectionCard}>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.05)']}
                    style={styles.projectionGradient}
                  >
                    <Text style={styles.projectionPeriod}>1 Year</Text>
                    <Text style={styles.projectionAmount} numberOfLines={1} adjustsFontSizeToFit={true}>
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
                    <Text style={styles.projectionAmount} numberOfLines={1} adjustsFontSizeToFit={true}>
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
                    <Text style={styles.projectionAmount} numberOfLines={1} adjustsFontSizeToFit={true}>
                      ${Math.round(displayCost * 365 * 10).toLocaleString()}
                    </Text>
                  </LinearGradient>
                </View>
              </View>
              
              {/* Motivation message */}
              <View style={styles.motivationCard}>
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.08)', 'rgba(6, 182, 212, 0.05)']}
                  style={styles.motivationGradient}
                >
                  <Ionicons name="trending-up" size={20} color="#10B981" />
                  <Text style={styles.motivationText}>
                    That's enough for a {displayCost * 365 > 10000 ? 'new car' : displayCost * 365 > 5000 ? 'dream vacation' : displayCost * 365 > 1000 ? 'nice laptop' : 'weekend getaway'}!
                  </Text>
                </LinearGradient>
              </View>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
      </KeyboardAvoidingView>
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
  const [customizeJournalVisible, setCustomizeJournalVisible] = useState(false);
  const [moneySavedModalVisible, setMoneySavedModalVisible] = useState(false);
  const [customDailyCost, setCustomDailyCost] = useState(user?.dailyCost || 14);
  // const navigation = useNavigation<DashboardNavigationProp>();

  // Deferred rendering states for Neural Info Modal
  const [renderNeuralHeader, setRenderNeuralHeader] = useState(false);
  const [renderNeuralStatus, setRenderNeuralStatus] = useState(false);
  const [renderNeuralScience, setRenderNeuralScience] = useState(false);
  const [renderNeuralTimeline, setRenderNeuralTimeline] = useState(false);
  const [renderNeuralFooter, setRenderNeuralFooter] = useState(false);

  // Journal Enabled Factors State - WORLD-CLASS TRACKING FOR INSIGHTS
  const [enabledFactors, setEnabledFactors] = useState({
    // === MENTAL HEALTH & PSYCHOLOGY ===
    moodState: true,              // 1-10 scale mood tracking
    stressLevel: true,            // 1-10 scale stress tracking  
    anxietyLevel: false,          // 1-10 scale anxiety tracking
    cravingIntensity: true,       // 1-10 scale craving intensity + frequency
    cognitiveClarity: false,      // Mental focus and clarity tracking
    emotionalRegulation: false,   // How well managing emotions
    motivationLevel: true,        // Daily motivation assessment
    confidenceLevel: false,       // Confidence in recovery journey
    
    // === PHYSICAL RECOVERY ===
    sleepQuality: true,           // 1-10 scale + actual hours
    sleepDuration: true,          // Precise sleep duration tracking
    energyLevel: true,            // 1-10 scale energy throughout day
    physicalActivity: true,       // Type, duration, intensity tracking
    heartRateVariability: false, // HRV if available from wearables
    appetiteChanges: false,       // Appetite and eating pattern changes
    withdrawalSymptoms: true,     // Physical withdrawal symptom tracking
    breathingExercises: true,     // Mindfulness and breathing practice
    
    // === LIFESTYLE & ENVIRONMENT ===
    hydrationLevel: true,         // Precise water intake tracking
    caffeineIntake: true,         // Amount, timing, type of caffeine
    alcoholConsumption: false,    // Alcohol intake tracking
    socialInteractions: true,     // Quality and quantity of social support
    environmentalTriggers: true,  // Trigger exposure and response
    routineAdherence: false,      // How well following daily routine
    screenTime: false,            // Digital wellness tracking
    sunlightExposure: false,      // Natural light exposure for circadian rhythm
    
    // === BEHAVIORAL PATTERNS ===
    copingStrategies: true,       // Which coping strategies used
    impulsiveUrges: true,         // Tracking impulsive behavior patterns
    decisionMaking: false,        // Quality of daily decisions
    timeManagement: false,        // How productive and organized
    selfCareActivities: true,     // Self-care practices engaged in
    creativeActivities: false,    // Creative outlets and expression
    learningActivities: false,    // New skills or knowledge gained
    
    // === RECOVERY-SPECIFIC ===
    recoveryAffirmations: false,  // Positive self-talk and affirmations
    milestoneProgress: true,      // Progress toward specific goals
    challengesSurmounted: true,   // Daily challenges overcome
    gratitudePractice: false,     // Gratitude journaling integration
    recoveryReflection: false,    // End-of-day recovery reflection
    supportGroupActivity: false, // Recovery community engagement
    
    // === ADVANCED TRACKING ===
    biometricData: false,         // Integration with health devices
    weatherImpact: false,         // Weather correlation with mood/cravings
    lunarCycleCorrelation: false, // For pattern analysis
    workStressLevel: false,       // Work-related stress tracking
    financialStress: false,       // Financial worry impact
    relationshipQuality: false,   // Relationship satisfaction tracking
  });

  const toggleFactor = useCallback((factor: string) => {
    setEnabledFactors(prev => {
      const newState = {
        ...prev,
        [factor]: !prev[factor as keyof typeof prev]
      };
      
      // Prevent unnecessary rerenders by avoiding state change if no actual change
      if (newState[factor as keyof typeof newState] === prev[factor as keyof typeof prev]) {
        return prev;
      }
      
      console.log(`✅ Factor toggled: ${factor} = ${newState[factor as keyof typeof newState]}`);
      return newState;
    });
  }, []);

  // Reset deferred rendering states when modal opens
  useEffect(() => {
    if (neuralInfoVisible) {
      // Reset all states first
      setRenderNeuralHeader(false);
      setRenderNeuralStatus(false);
      setRenderNeuralScience(false);
      setRenderNeuralTimeline(false);
      setRenderNeuralFooter(false);

      // Then stagger the rendering to prevent frame drops
      setTimeout(() => setRenderNeuralHeader(true), 0);
      setTimeout(() => setRenderNeuralStatus(true), 50);
      setTimeout(() => setRenderNeuralScience(true), 100);
      setTimeout(() => setRenderNeuralTimeline(true), 150);
      setTimeout(() => setRenderNeuralFooter(true), 200);
    }
  }, [neuralInfoVisible]);

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

            {/* Content - Compact Single Page Design */}
            <ScrollView 
              style={styles.cleanRecoveryContent}
              contentContainerStyle={styles.cleanRecoveryScrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Compact Hero Section */}
              <View style={styles.compactHeroSection}>
                {/* Progress Circle and Info Side by Side */}
                <View style={styles.compactTopRow}>
                  {/* Smaller Progress Ring */}
                  <View style={styles.compactProgressRing}>
                    <View style={styles.compactRingBackground} />
                    <View 
                      style={[
                        styles.compactRingProgress,
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
                      <View style={[styles.compactRingFill, { backgroundColor: phase.color }]} />
                    </View>
                    <View style={styles.compactRingInner}>
                      <Text style={[styles.compactScoreText, { color: phase.color }]}>{healthScore}</Text>
                      <Text style={styles.compactScoreLabel}>SCORE</Text>
                    </View>
                  </View>
                  
                  {/* Phase Info */}
                  <View style={styles.compactPhaseInfo}>
                    <View style={[styles.compactPhaseBadge, { backgroundColor: `${phase.color}15` }]}>
                      <Ionicons name={phase.icon as any} size={16} color={phase.color} />
                      <Text style={[styles.compactPhaseText, { color: phase.color }]}>{phase.name}</Text>
                    </View>
                    <Text style={styles.compactPhaseDescription}>
                      {phase.name === 'Starting Out' ? 'First steps taken' :
                       phase.name === 'Early Progress' ? 'Body adapting' :
                       phase.name === 'Building Strength' ? 'Habits forming' :
                       phase.name === 'Major Recovery' ? 'Life transformed' :
                       'Living free'}
                    </Text>
                  </View>
                </View>

                {/* Slim Progress Bar */}
                <View style={styles.compactProgressBar}>
                  <View style={styles.compactProgressTrack}>
                    <View 
                      style={[
                        styles.compactProgressFill,
                        { 
                          width: `${healthScore}%`,
                          backgroundColor: phase.color 
                        }
                      ]} 
                    />
                  </View>
                  <View style={styles.compactMilestones}>
                    {[10, 30, 60, 85].map((milestone) => (
                      <View 
                        key={milestone}
                        style={[
                          styles.compactMilestone,
                          { left: `${milestone}%` }
                        ]}
                      >
                        <View style={[
                          styles.compactMilestoneDot,
                          healthScore >= milestone && { backgroundColor: phase.color }
                        ]} />
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Compact Roadmap */}
              <View style={styles.compactRoadmapSection}>
                <Text style={styles.compactSectionTitle}>YOUR JOURNEY</Text>
                
                {/* Two Column Layout for Phases */}
                <View style={styles.compactPhaseGrid}>
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
                          styles.compactPhaseItem,
                          isActive && styles.compactPhaseItemActive,
                          isComplete && styles.compactPhaseItemComplete
                        ]}
                      >
                        <View style={[
                          styles.compactPhaseIcon,
                          isActive && { backgroundColor: `${phase.color}20` },
                          isComplete && { backgroundColor: 'rgba(16, 185, 129, 0.2)' }
                        ]}>
                          <Ionicons 
                            name={isComplete ? 'checkmark-circle' : p.icon as any} 
                            size={20} 
                            color={isComplete ? '#10B981' : isActive ? phase.color : '#6B7280'} 
                          />
                        </View>
                        <View style={styles.compactPhaseTextContainer}>
                          <Text style={[
                            styles.compactPhaseName,
                            (isActive || isComplete) && styles.compactPhaseNameActive
                          ]}>
                            {p.name}
                          </Text>
                          <Text style={styles.compactPhaseScore}>
                            {isComplete ? 'Complete' : `${p.score}%`}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Compact Next Goal */}
              {healthScore < 100 && (
                <View style={styles.compactNextGoal}>
                  <View style={[styles.compactNextGoalBar, { backgroundColor: `${phase.color}15` }]}>
                    <Ionicons name="flag" size={16} color={phase.color} />
                    <Text style={styles.compactNextGoalText}>
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
            </ScrollView>

            {/* Epic Footer with Action */}
            <View style={styles.epicModalFooter}>
              <TouchableOpacity 
                style={styles.epicActionButton}
                onPress={() => setHealthInfoVisible(false)}
              >
                <LinearGradient
                  colors={[phase.color, `${phase.color}CC`]}
                  style={styles.epicActionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.epicActionText}>Got It!</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </SafeAreaView>
      </Modal>
    );
  };

  // Recovery Journal Modal Component - WORLD-CLASS DATA TRACKING
  const RecoveryJournalModal = () => {
    const [journalData, setJournalData] = useState({
      // === MENTAL HEALTH & PSYCHOLOGY (1-10 scales + additional data) ===
      moodState: 5,                    // 1-10 scale
      stressLevel: 5,                  // 1-10 scale
      anxietyLevel: 5,                 // 1-10 scale
      cravingIntensity: 0,             // 1-10 scale
      cravingFrequency: 0,             // Number of cravings today
      cognitiveClarity: 5,             // 1-10 scale
      emotionalRegulation: 5,          // 1-10 scale
      motivationLevel: 5,              // 1-10 scale
      confidenceLevel: 5,              // 1-10 scale
      
      // === PHYSICAL RECOVERY ===
      sleepQuality: 5,                 // 1-10 scale
      sleepDuration: 7.5,              // Hours (precise)
      energyLevel: 5,                  // 1-10 scale
      physicalActivityType: '',        // Text input
      physicalActivityDuration: 0,     // Minutes
      physicalActivityIntensity: 3,    // 1-5 scale
      withdrawalSymptoms: [],          // Array of symptoms
      breathingExerciseMinutes: 0,     // Minutes practiced
      
      // === LIFESTYLE & ENVIRONMENT ===
      hydrationLevel: 6,               // 8oz glasses
      caffeineAmount: 0,               // mg of caffeine
      caffeineTime: '',                // Time of consumption
      alcoholUnits: 0,                 // Standard drink units
      socialInteractionQuality: 5,     // 1-10 scale
      socialInteractionQuantity: 3,    // Number of meaningful interactions
      environmentalTriggers: [],       // Array of triggers encountered
      triggerResponse: '',             // How they handled triggers
      
      // === BEHAVIORAL PATTERNS ===
      copingStrategiesUsed: [],        // Array of strategies
      impulsiveUrges: 0,               // 1-10 scale
      decisionMakingQuality: 5,        // 1-10 scale
      selfCareActivities: [],          // Array of activities
      productivityLevel: 5,            // 1-10 scale
      
      // === RECOVERY-SPECIFIC ===
      milestoneProgress: 5,            // 1-10 progress toward goals
      challengesSurmounted: [],        // Array of challenges overcome
      recoveryReflection: '',          // Text reflection
      gratitudeItems: [],              // Array of gratitude items
      
      // === CONTEXT DATA FOR INSIGHTS ===
      dayOfWeek: new Date().getDay(),
      timeOfEntry: new Date().toISOString(),
      weatherCondition: '',            // Optional weather tracking
      locationContext: '',             // Home, work, travel, etc.
      overallDayRating: 5,            // 1-10 overall day assessment
    });

    const updateJournalData = useCallback((key: string, value: any) => {
      setJournalData(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleComplete = useCallback(() => {
      // TODO: Save to analytics database for insights generation
      console.log('💾 Journal Data for Insights:', journalData);
      setRecoveryJournalVisible(false);
      Alert.alert('Journal Saved', 'Your recovery data has been saved for analysis and insights!');
    }, [journalData]);

    return (
      <Modal
        visible={recoveryJournalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setRecoveryJournalVisible(false)}
      >
        <SafeAreaView style={styles.journalContainer} edges={['top', 'left', 'right', 'bottom']}>
          <LinearGradient
            colors={['#000000', '#0A0F1C', '#0F172A']}
            style={styles.journalGradient}
          >
            {/* Professional Header */}
            <View style={styles.journalHeader}>
              <TouchableOpacity 
                style={styles.journalCloseButton}
                onPress={() => setRecoveryJournalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <Text style={styles.journalTitle}>JOURNAL</Text>
              
              <TouchableOpacity 
                style={styles.journalEditButton}
                onPress={() => {
                  setRecoveryJournalVisible(false);
                  setTimeout(() => setCustomizeJournalVisible(true), 100);
                }}
              >
                <Ionicons name="create-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Date Navigation */}
            <View style={styles.journalDateNav}>
              <TouchableOpacity style={styles.journalNavArrow}>
                <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
              </TouchableOpacity>
              
              <Text style={styles.journalDateText}>TODAY</Text>
              
              <TouchableOpacity style={styles.journalNavArrow}>
                <Ionicons name="chevron-forward" size={18} color="#6B7280" />
              </TouchableOpacity>
              
              <View style={styles.journalInsightsSpacing}>
                <TouchableOpacity 
                  style={styles.journalInsightsButton}
                  onPress={() => {
                    Alert.alert(
                      'Journal Insights',
                      'Coming soon! View patterns and insights from your daily recovery tracking.',
                      [{ text: 'Got it', style: 'default' }]
                    );
                  }}
                >
                  <Ionicons name="analytics-outline" size={14} color="#10B981" />
                  <Text style={styles.journalInsightsText}>INSIGHTS</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Main Question */}
            <View style={styles.journalMainQuestion}>
              <Text style={styles.journalMainQuestionText}>
                How's your recovery today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}?
              </Text>
            </View>

            {/* Journal Content */}
            <ScrollView style={styles.journalContent} showsVerticalScrollIndicator={false}>
              
              {/* Mental Health */}
              <View style={styles.journalCompactSection}>
                <Text style={styles.journalCompactSectionTitle}>MENTAL HEALTH</Text>
                
                {/* Feeling positive - Conditionally rendered */}
                {enabledFactors.moodState && (
                  <View style={styles.journalCompactQuestion}>
                    <Text style={styles.journalCompactQuestionText}>Feeling positive today?</Text>
                    <View style={styles.journalCompactToggleContainer}>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.moodState === 1 && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('moodState', 1)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.moodState === 10 && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('moodState', 10)}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Breathing exercises - Conditionally rendered */}
                {enabledFactors.usedBreathing && (
                  <View style={styles.journalCompactQuestion}>
                    <Text style={styles.journalCompactQuestionText}>Use breathing exercises?</Text>
                    <View style={styles.journalCompactToggleContainer}>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.usedBreathing === false && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('usedBreathing', false)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.usedBreathing === true && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('usedBreathing', true)}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Stress Level - Optional and Conditionally rendered */}
                {enabledFactors.stressLevel && (
                  <View style={styles.journalCompactQuestion}>
                    <Text style={styles.journalCompactQuestionText}>Stress level above normal?</Text>
                    <View style={styles.journalCompactToggleContainer}>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.stressLevel === 1 && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('stressLevel', 1)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.stressLevel === 10 && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('stressLevel', 10)}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Anxiety Level - Optional and Conditionally rendered */}
                {enabledFactors.anxietyLevel && (
                  <View style={styles.journalCompactQuestion}>
                    <Text style={styles.journalCompactQuestionText}>Experience elevated anxiety?</Text>
                    <View style={styles.journalCompactToggleContainer}>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.anxietyLevel === 1 && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('anxietyLevel', 1)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.anxietyLevel === 10 && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('anxietyLevel', 10)}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Craving Intensity - Optional and Conditionally rendered */}
                {enabledFactors.cravingIntensity && (
                  <View style={styles.journalCompactQuestion}>
                    <Text style={styles.journalCompactQuestionText}>Experience nicotine cravings?</Text>
                    <View style={styles.journalCompactToggleContainer}>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.cravingIntensity === 0 && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('cravingIntensity', 0)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.cravingIntensity === 10 && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('cravingIntensity', 10)}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* Physical Recovery */}
              <View style={styles.journalCompactSection}>
                <Text style={styles.journalCompactSectionTitle}>PHYSICAL RECOVERY</Text>
                
                {/* Sleep Quality - Conditionally rendered */}
                {enabledFactors.sleepQuality && (
                  <View style={styles.journalCompactQuestion}>
                    <Text style={styles.journalCompactQuestionText}>Good sleep quality?</Text>
                    <View style={styles.journalCompactToggleContainer}>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.sleepQuality === 1 && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('sleepQuality', 1)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.sleepQuality === 10 && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('sleepQuality', 10)}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Sleep Hours - Conditionally rendered */}
                {enabledFactors.sleepDuration && (
                  <View style={styles.journalCounterQuestion}>
                    <Text style={styles.journalCounterQuestionTitle}>Sleep Duration</Text>
                    <View style={styles.journalSmoothCounter}>
                      <TouchableOpacity 
                        style={styles.journalCounterButton}
                        onPress={() => updateJournalData('sleepDuration', Math.max(0, journalData.sleepDuration - 0.5))}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="remove" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                      <View style={styles.journalCounterValue}>
                        <Text style={styles.journalCounterValueText}>{journalData.sleepDuration}</Text>
                        <Text style={styles.journalCounterUnit}>hours</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.journalCounterButton}
                        onPress={() => updateJournalData('sleepDuration', journalData.sleepDuration + 0.5)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Water Intake - Conditionally rendered */}
                {enabledFactors.hydrationLevel && (
                  <View style={styles.journalCounterQuestion}>
                    <Text style={styles.journalCounterQuestionTitle}>Water Intake</Text>
                    <View style={styles.journalSmoothCounter}>
                      <TouchableOpacity 
                        style={styles.journalCounterButton}
                        onPress={() => updateJournalData('hydrationLevel', Math.max(0, journalData.hydrationLevel - 1))}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="remove" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                      <View style={styles.journalCounterValue}>
                        <Text style={styles.journalCounterValueText}>{journalData.hydrationLevel}</Text>
                        <Text style={styles.journalCounterUnit}>8oz servings</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.journalCounterButton}
                        onPress={() => updateJournalData('hydrationLevel', journalData.hydrationLevel + 1)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Energy Level - Conditionally rendered */}
                {enabledFactors.energyLevel && (
                  <View style={styles.journalCompactQuestion}>
                    <Text style={styles.journalCompactQuestionText}>High energy today?</Text>
                    <View style={styles.journalCompactToggleContainer}>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.energyLevel === 1 && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('energyLevel', 1)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.energyLevel === 10 && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('energyLevel', 10)}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Physical Activity - Conditionally rendered */}
                {enabledFactors.physicalActivity && (
                  <View style={styles.journalCompactQuestion}>
                    <Text style={styles.journalCompactQuestionText}>Physical activity today?</Text>
                    <View style={styles.journalCompactToggleContainer}>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.physicalActivityDuration === 0 && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('physicalActivityDuration', 0)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.physicalActivityDuration > 0 && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('physicalActivityDuration', 30)}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* Wellness */}
              <View style={styles.journalCompactSection}>
                <Text style={styles.journalCompactSectionTitle}>WELLNESS</Text>
                
                {/* Caffeine Intake - Conditionally rendered */}
                {enabledFactors.caffeineIntake && (
                  <View style={styles.journalCompactQuestion}>
                    <Text style={styles.journalCompactQuestionText}>Consume caffeine?</Text>
                    <View style={styles.journalCompactToggleContainer}>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.caffeineAmount === 0 && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('caffeineAmount', 0)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.caffeineAmount > 0 && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('caffeineAmount', 100)}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Social Support - Conditionally rendered */}
                {enabledFactors.socialInteractions && (
                  <View style={styles.journalCompactQuestion}>
                    <Text style={styles.journalCompactQuestionText}>Social support today?</Text>
                    <View style={styles.journalCompactToggleContainer}>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.socialInteractionQuality === 1 && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('socialInteractionQuality', 1)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.socialInteractionQuality === 10 && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('socialInteractionQuality', 10)}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Handle Stress - Conditionally rendered */}
                {enabledFactors.environmentalTriggers && (
                  <View style={styles.journalCompactQuestion}>
                    <Text style={styles.journalCompactQuestionText}>Handle stress well?</Text>
                    <View style={styles.journalCompactToggleContainer}>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.triggerResponse === '' && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('triggerResponse', '')}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.triggerResponse !== '' && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('triggerResponse', 'handled well')}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Breathing Exercises - Conditionally rendered */}
                {enabledFactors.breathingExercises && (
                  <View style={styles.journalCompactQuestion}>
                    <Text style={styles.journalCompactQuestionText}>Use breathing exercises?</Text>
                    <View style={styles.journalCompactToggleContainer}>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.breathingExerciseMinutes === 0 && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('breathingExerciseMinutes', 0)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.breathingExerciseMinutes > 0 && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('breathingExerciseMinutes', 5)}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Save Button */}
            <View style={styles.journalCompactSaveContainer}>
              <TouchableOpacity style={styles.journalCompactSaveButton} onPress={handleComplete}>
                <Text style={styles.journalCompactSaveButtonText}>SAVE JOURNAL</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </SafeAreaView>
      </Modal>
    );
  };

  // Optimized CustomizeJournalModal to prevent unnecessary rerenders
  const CustomizeJournalModal = () => {
    const handleSave = useCallback(() => {
      setCustomizeJournalVisible(false);
      // Don't show alert on every toggle - just on explicit save
      Alert.alert('Settings Saved', 'Your tracking preferences have been updated!');
    }, []);

    return (
      <Modal
        visible={customizeJournalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setCustomizeJournalVisible(false)}
      >
        <SafeAreaView style={styles.journalContainer} edges={['top', 'left', 'right', 'bottom']}>
          <LinearGradient
            colors={['#000000', '#0A0F1C', '#0F172A']}
            style={styles.journalGradient}
          >
            {/* Header */}
            <View style={styles.journalHeader}>
              <TouchableOpacity 
                style={styles.journalCloseButton}
                onPress={() => setCustomizeJournalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <Text style={styles.journalTitle}>CUSTOMIZE JOURNAL</Text>
              
              <TouchableOpacity 
                style={styles.journalEditButton}
                onPress={handleSave}
              >
                <Ionicons name="checkmark" size={24} color="#10B981" />
              </TouchableOpacity>
            </View>

            {/* Info Section */}
            <View style={styles.customizeInfoSection}>
              <View style={styles.customizeInfoHeader}>
                <Ionicons name="settings-outline" size={20} color="#10B981" />
                <Text style={styles.customizeInfoTitle}>Tracking Factors</Text>
              </View>
              <Text style={styles.customizeInfoText}>
                Enable or disable factors for your daily recovery journal. Changes are saved automatically.
              </Text>
            </View>

            {/* Tracking Factors */}
            <ScrollView style={styles.journalContent} showsVerticalScrollIndicator={false}>
              
              {/* Mental Health Section */}
              <View style={styles.journalSection}>
                <Text style={styles.journalSectionTitle}>MENTAL HEALTH</Text>
                
                {/* Feeling Positive */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="happy-outline" size={20} color="#10B981" />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={styles.customizeFactorTitle}>Mood Rating</Text>
                      <Text style={styles.customizeFactorDescription}>Feeling positive today?</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.moodState && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('moodState')}
                  >
                    <Ionicons 
                      name={enabledFactors.moodState ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.moodState ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Breathing Exercises */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="leaf-outline" size={20} color="#10B981" />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={styles.customizeFactorTitle}>Breathing Exercises</Text>
                      <Text style={styles.customizeFactorDescription}>Use breathing exercises for relaxation?</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.usedBreathing && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('usedBreathing')}
                  >
                    <Ionicons 
                      name={enabledFactors.usedBreathing ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.usedBreathing ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Stress Level - Optional */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="trending-up-outline" size={20} color={enabledFactors.stressLevel ? "#10B981" : "#6B7280"} />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={[styles.customizeFactorTitle, !enabledFactors.stressLevel && styles.customizeFactorTitleDisabled]}>
                        Stress Level Rating
                      </Text>
                      <Text style={[styles.customizeFactorDescription, !enabledFactors.stressLevel && styles.customizeFactorTitleDisabled]}>
                        Rate your stress level above normal?
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.stressLevel && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('stressLevel')}
                  >
                    <Ionicons 
                      name={enabledFactors.stressLevel ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.stressLevel ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Anxiety Level - Optional */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="pulse-outline" size={20} color={enabledFactors.anxietyLevel ? "#10B981" : "#6B7280"} />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={[styles.customizeFactorTitle, !enabledFactors.anxietyLevel && styles.customizeFactorTitleDisabled]}>
                        Anxiety Level
                      </Text>
                      <Text style={[styles.customizeFactorDescription, !enabledFactors.anxietyLevel && styles.customizeFactorTitleDisabled]}>
                        Experience elevated anxiety levels?
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.anxietyLevel && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('anxietyLevel')}
                  >
                    <Ionicons 
                      name={enabledFactors.anxietyLevel ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.anxietyLevel ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Craving Intensity - Optional */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="flash-outline" size={20} color={enabledFactors.cravingIntensity ? "#10B981" : "#6B7280"} />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={[styles.customizeFactorTitle, !enabledFactors.cravingIntensity && styles.customizeFactorTitleDisabled]}>
                        Nicotine Cravings
                      </Text>
                      <Text style={[styles.customizeFactorDescription, !enabledFactors.cravingIntensity && styles.customizeFactorTitleDisabled]}>
                        Experience nicotine cravings today?
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.cravingIntensity && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('cravingIntensity')}
                  >
                    <Ionicons 
                      name={enabledFactors.cravingIntensity ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.cravingIntensity ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Physical Recovery Section */}
              <View style={styles.journalSection}>
                <Text style={styles.journalSectionTitle}>PHYSICAL RECOVERY</Text>
                
                {/* Sleep Quality */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="moon-outline" size={20} color="#10B981" />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={styles.customizeFactorTitle}>Sleep Quality</Text>
                      <Text style={styles.customizeFactorDescription}>Rate your sleep quality today?</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.sleepQuality && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('sleepQuality')}
                  >
                    <Ionicons 
                      name={enabledFactors.sleepQuality ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.sleepQuality ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Sleep Duration */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="time-outline" size={20} color="#10B981" />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={styles.customizeFactorTitle}>Sleep Duration</Text>
                      <Text style={styles.customizeFactorDescription}>Track hours of sleep last night?</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.sleepDuration && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('sleepDuration')}
                  >
                    <Ionicons 
                      name={enabledFactors.sleepDuration ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.sleepDuration ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Water Intake */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="water-outline" size={20} color="#10B981" />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={styles.customizeFactorTitle}>Water Intake</Text>
                      <Text style={styles.customizeFactorDescription}>Track water consumption (8oz servings)?</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.hydrationLevel && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('hydrationLevel')}
                  >
                    <Ionicons 
                      name={enabledFactors.hydrationLevel ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.hydrationLevel ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Energy Level */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="battery-charging-outline" size={20} color="#10B981" />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={styles.customizeFactorTitle}>Energy Level</Text>
                      <Text style={styles.customizeFactorDescription}>Feel high energy today?</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.energyLevel && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('energyLevel')}
                  >
                    <Ionicons 
                      name={enabledFactors.energyLevel ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.energyLevel ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Physical Activity */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="fitness-outline" size={20} color="#10B981" />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={styles.customizeFactorTitle}>Physical Activity</Text>
                      <Text style={styles.customizeFactorDescription}>Engage in physical activity today?</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.physicalActivity && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('physicalActivity')}
                  >
                    <Ionicons 
                      name={enabledFactors.physicalActivity ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.physicalActivity ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Wellness Section */}
              <View style={styles.journalSection}>
                <Text style={styles.journalSectionTitle}>WELLNESS</Text>
                
                {/* Caffeine Intake */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="cafe-outline" size={20} color="#10B981" />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={styles.customizeFactorTitle}>Caffeine Consumption</Text>
                      <Text style={styles.customizeFactorDescription}>Consume caffeine today?</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.caffeineIntake && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('caffeineIntake')}
                  >
                    <Ionicons 
                      name={enabledFactors.caffeineIntake ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.caffeineIntake ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Social Support */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="people-outline" size={20} color="#10B981" />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={styles.customizeFactorTitle}>Social Support</Text>
                      <Text style={styles.customizeFactorDescription}>Receive social support today?</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.socialInteractions && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('socialInteractions')}
                  >
                    <Ionicons 
                      name={enabledFactors.socialInteractions ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.socialInteractions ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Stress Management */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={styles.customizeFactorTitle}>Environmental Triggers</Text>
                      <Text style={styles.customizeFactorDescription}>Track trigger exposure and responses?</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.environmentalTriggers && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('environmentalTriggers')}
                  >
                    <Ionicons 
                      name={enabledFactors.environmentalTriggers ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.environmentalTriggers ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Coping Strategies - Optional */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="shield-outline" size={20} color={enabledFactors.copingStrategies ? "#10B981" : "#6B7280"} />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={[styles.customizeFactorTitle, !enabledFactors.copingStrategies && styles.customizeFactorTitleDisabled]}>
                        Coping Strategies
                      </Text>
                      <Text style={[styles.customizeFactorDescription, !enabledFactors.copingStrategies && styles.customizeFactorTitleDisabled]}>
                        Track which coping strategies you used?
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.copingStrategies && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('copingStrategies')}
                  >
                    <Ionicons 
                      name={enabledFactors.copingStrategies ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.copingStrategies ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Vitamins/Supplements - Optional */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="medical-outline" size={20} color={enabledFactors.selfCareActivities ? "#10B981" : "#6B7280"} />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={[styles.customizeFactorTitle, !enabledFactors.selfCareActivities && styles.customizeFactorTitleDisabled]}>
                        Self-Care Activities
                      </Text>
                      <Text style={[styles.customizeFactorDescription, !enabledFactors.selfCareActivities && styles.customizeFactorTitleDisabled]}>
                        Track self-care practices and wellness activities?
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.selfCareActivities && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('selfCareActivities')}
                  >
                    <Ionicons 
                      name={enabledFactors.selfCareActivities ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.selfCareActivities ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Motivation Level - Optional */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="rocket-outline" size={20} color={enabledFactors.motivationLevel ? "#10B981" : "#6B7280"} />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={[styles.customizeFactorTitle, !enabledFactors.motivationLevel && styles.customizeFactorTitleDisabled]}>
                        Motivation Level
                      </Text>
                      <Text style={[styles.customizeFactorDescription, !enabledFactors.motivationLevel && styles.customizeFactorTitleDisabled]}>
                        Daily motivation and commitment assessment?
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.motivationLevel && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('motivationLevel')}
                  >
                    <Ionicons 
                      name={enabledFactors.motivationLevel ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.motivationLevel ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Advanced Recovery Section */}
              <View style={styles.journalSection}>
                <Text style={styles.journalSectionTitle}>RECOVERY INSIGHTS</Text>
                
                {/* Milestone Progress */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="trophy-outline" size={20} color="#10B981" />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={styles.customizeFactorTitle}>Milestone Progress</Text>
                      <Text style={styles.customizeFactorDescription}>Track progress toward recovery goals?</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.milestoneProgress && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('milestoneProgress')}
                  >
                    <Ionicons 
                      name={enabledFactors.milestoneProgress ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.milestoneProgress ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Challenges Surmounted */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={styles.customizeFactorTitle}>Daily Challenges</Text>
                      <Text style={styles.customizeFactorDescription}>Track challenges overcome today?</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.challengesSurmounted && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('challengesSurmounted')}
                  >
                    <Ionicons 
                      name={enabledFactors.challengesSurmounted ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.challengesSurmounted ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Withdrawal Symptoms */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="pulse-outline" size={20} color="#10B981" />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={styles.customizeFactorTitle}>Withdrawal Symptoms</Text>
                      <Text style={styles.customizeFactorDescription}>Track physical withdrawal symptoms?</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.withdrawalSymptoms && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('withdrawalSymptoms')}
                  >
                    <Ionicons 
                      name={enabledFactors.withdrawalSymptoms ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.withdrawalSymptoms ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Impulsive Urges - Optional */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="flash-outline" size={20} color={enabledFactors.impulsiveUrges ? "#10B981" : "#6B7280"} />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={[styles.customizeFactorTitle, !enabledFactors.impulsiveUrges && styles.customizeFactorTitleDisabled]}>
                        Impulsive Urges
                      </Text>
                      <Text style={[styles.customizeFactorDescription, !enabledFactors.impulsiveUrges && styles.customizeFactorTitleDisabled]}>
                        Track impulsive behavior patterns?
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.impulsiveUrges && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('impulsiveUrges')}
                  >
                    <Ionicons 
                      name={enabledFactors.impulsiveUrges ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.impulsiveUrges ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Cognitive Clarity - Optional */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="eye-outline" size={20} color={enabledFactors.cognitiveClarity ? "#10B981" : "#6B7280"} />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={[styles.customizeFactorTitle, !enabledFactors.cognitiveClarity && styles.customizeFactorTitleDisabled]}>
                        Mental Clarity
                      </Text>
                      <Text style={[styles.customizeFactorDescription, !enabledFactors.cognitiveClarity && styles.customizeFactorTitleDisabled]}>
                        Track mental focus and cognitive clarity?
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.cognitiveClarity && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('cognitiveClarity')}
                  >
                    <Ionicons 
                      name={enabledFactors.cognitiveClarity ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.cognitiveClarity ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Coming Soon Section - REMOVED per user request */}
            </ScrollView>

            {/* Footer */}
            <View style={styles.customizeFooterInfo}>
              <View style={styles.customizeFooterInfoContent}>
                <Ionicons name="information-circle-outline" size={16} color="#10B981" />
                <Text style={styles.customizeFooterInfoText}>
                  Your data powers world-class insights • Changes apply immediately • Privacy protected
                </Text>
              </View>
            </View>
          </LinearGradient>
        </SafeAreaView>
      </Modal>
    );
  };

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
      <RecoveryJournalModal />

      {/* Reset Progress Modal */}
      <Modal
        visible={resetModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <SafeAreaView style={styles.resetModalContainer} edges={['top', 'left', 'right', 'bottom']}>
          <LinearGradient
            colors={['#000000', '#0A0F1C', '#0F172A']}
            style={styles.resetModalGradient}
          >
            {/* Header */}
            <View style={styles.resetModalHeader}>
              <View style={styles.resetModalHeaderContent}>
                <Ionicons name="refresh-circle" size={24} color="#F59E0B" />
                <Text style={styles.resetModalTitle}>Update Your Progress</Text>
              </View>
              <TouchableOpacity 
                style={styles.resetModalCloseButton}
                onPress={() => setResetModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.resetModalContent} showsVerticalScrollIndicator={false}>
              {/* Reset Type Selection */}
              <View style={styles.resetTypeSelection}>
                <Text style={styles.resetSectionTitle}>What happened?</Text>
                <Text style={styles.resetTypeDescription}>
                  Choose the option that best describes your situation:
                </Text>
                
                <TouchableOpacity 
                  style={[styles.resetTypeOption, resetType === 'relapse' && styles.resetTypeOptionSelected]}
                  onPress={handleRelapseSelect}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.resetTypeOptionGradient,
                    resetType === 'relapse' && styles.resetTypeOptionGradientSelected
                  ]}>
                    <Ionicons name="refresh-circle" size={24} color={resetType === 'relapse' ? "#F59E0B" : "#9CA3AF"} />
                    <View style={styles.resetTypeOptionText}>
                      <Text style={[styles.resetTypeOptionTitle, resetType === 'relapse' && styles.resetTypeOptionTitleSelected]}>
                        I had a relapse
                      </Text>
                      <Text style={styles.resetTypeOptionSubtitle}>
                        Keep your achievements, start a new streak from when you got back on track
                      </Text>
                    </View>
                    <View style={[styles.resetTypeRadio, resetType === 'relapse' && styles.resetTypeRadioSelected]}>
                      {resetType === 'relapse' && <View style={[styles.resetTypeRadioInner, { backgroundColor: '#F59E0B' }]} />}
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.resetTypeOption, resetType === 'fresh_start' && styles.resetTypeOptionSelected]}
                  onPress={handleFreshStartSelect}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.resetTypeOptionGradient,
                    resetType === 'fresh_start' && styles.resetTypeOptionGradientSelected
                  ]}>
                    <Ionicons name="trash" size={24} color={resetType === 'fresh_start' ? "#EF4444" : "#9CA3AF"} />
                    <View style={styles.resetTypeOptionText}>
                      <Text style={[styles.resetTypeOptionTitle, resetType === 'fresh_start' && styles.resetTypeOptionTitleSelected]}>
                        Complete fresh start
                      </Text>
                      <Text style={styles.resetTypeOptionSubtitle}>
                        Reset everything to zero and start completely over
                      </Text>
                    </View>
                    <View style={[styles.resetTypeRadio, resetType === 'fresh_start' && styles.resetTypeRadioSelected]}>
                      {resetType === 'fresh_start' && <View style={[styles.resetTypeRadioInner, { backgroundColor: '#F59E0B' }]} />}
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.resetTypeOption, resetType === 'correction' && styles.resetTypeOptionSelected]}
                  onPress={handleCorrectionSelect}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.resetTypeOptionGradient,
                    resetType === 'correction' && styles.resetTypeOptionGradientSelected
                  ]}>
                    <Ionicons name="create" size={24} color={resetType === 'correction' ? "#10B981" : "#9CA3AF"} />
                    <View style={styles.resetTypeOptionText}>
                      <Text style={[styles.resetTypeOptionTitle, resetType === 'correction' && styles.resetTypeOptionTitleSelected]}>
                        Fix my quit date
                      </Text>
                      <Text style={styles.resetTypeOptionSubtitle}>
                        I set the wrong date initially, just need to correct it
                      </Text>
                    </View>
                    <View style={[styles.resetTypeRadio, resetType === 'correction' && styles.resetTypeRadioSelected]}>
                      {resetType === 'correction' && <View style={[styles.resetTypeRadioInner, { backgroundColor: '#F59E0B' }]} />}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* What Will Happen */}
              <View style={styles.resetWhatHappens}>
                <Text style={styles.resetSectionTitle}>What will happen:</Text>
                <View style={styles.resetWhatHappensCard}>
                  <LinearGradient
                    colors={['rgba(59, 130, 246, 0.15)', 'rgba(16, 185, 129, 0.15)']}
                    style={styles.resetWhatHappensContent}
                  >
                    <Ionicons name="information-circle" size={20} color="#3B82F6" />
                    <View style={styles.resetWhatHappensText}>
                      {resetType === 'relapse' && (
                        <>
                          <Text style={styles.resetWhatHappensTitle}>Relapse Recovery Mode</Text>
                          <Text style={styles.resetWhatHappensDescription}>
                            • Your total money saved and units avoided will be preserved{'\n'}
                            • Current streak resets to 0, but longest streak is saved{'\n'}
                            • Health recovery starts fresh from your new quit date{'\n'}
                            • You keep all your achievements and milestones
                          </Text>
                        </>
                      )}
                      {resetType === 'fresh_start' && (
                        <>
                          <Text style={styles.resetWhatHappensTitle}>Complete Reset</Text>
                          <Text style={styles.resetWhatHappensDescription}>
                            • All progress metrics reset to zero{'\n'}
                            • Money saved, units avoided, streaks all start over{'\n'}
                            • Health recovery starts from day 0{'\n'}
                            • Previous achievements are cleared
                          </Text>
                        </>
                      )}
                      {resetType === 'correction' && (
                        <>
                          <Text style={styles.resetWhatHappensTitle}>Date Correction</Text>
                          <Text style={styles.resetWhatHappensDescription}>
                            • All metrics recalculated based on correct quit date{'\n'}
                            • No progress is lost, just adjusted to accurate timeline{'\n'}
                            • Health recovery timeline updated to match real date{'\n'}
                            • Achievements adjusted if needed
                          </Text>
                        </>
                      )}
                    </View>
                  </LinearGradient>
                </View>
              </View>

              {/* Date Selection */}
              <View style={styles.resetDateSelection}>
                <Text style={styles.resetSectionTitle}>
                  {resetType === 'relapse' ? 'When did you get back on track?' : 
                   resetType === 'correction' ? 'What is your correct quit date?' : 
                   'When do you want to start fresh?'}
                </Text>
                <TouchableOpacity 
                  style={styles.resetDateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
                    style={styles.resetDateButtonGradient}
                  >
                    <Ionicons name="calendar" size={20} color="#10B981" />
                    <Text style={styles.resetDateButtonText}>
                      {newQuitDate && newQuitDate instanceof Date && !isNaN(newQuitDate.getTime()) ? 
                        newQuitDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 
                        new Date().toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      }
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Quick Options */}
              <View style={styles.resetQuickOptions}>
                <Text style={styles.resetSectionTitle}>Quick Options</Text>
                <View style={styles.resetQuickButtonsGrid}>
                  <TouchableOpacity 
                    style={styles.resetQuickButton}
                    onPress={() => setNewQuitDate(new Date())}
                  >
                    <Text style={styles.resetQuickButtonText}>Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.resetQuickButton}
                    onPress={() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      setNewQuitDate(yesterday);
                    }}
                  >
                    <Text style={styles.resetQuickButtonText}>Yesterday</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.resetQuickButton}
                    onPress={() => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      setNewQuitDate(weekAgo);
                    }}
                  >
                    <Text style={styles.resetQuickButtonText}>1 Week Ago</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.resetModalActions}>
              <TouchableOpacity 
                style={styles.resetCancelButton}
                onPress={() => setResetModalVisible(false)}
              >
                <Text style={styles.resetCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.resetConfirmButton}
                onPress={confirmReset}
              >
                <LinearGradient
                  colors={['#F59E0B', '#EF4444']}
                  style={styles.resetConfirmButtonGradient}
                >
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                  <Text style={styles.resetConfirmButtonText}>
                    {resetType === 'relapse' ? 'Continue Recovery' : 
                     resetType === 'fresh_start' ? 'Start Fresh' : 
                     'Update Date'}
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

      {/* Customize Journal Modal */}
      <CustomizeJournalModal />
      
      {/* Money Saved Modal */}
      <MoneySavedModal 
        visible={moneySavedModalVisible}
        onClose={() => setMoneySavedModalVisible(false)}
        stats={stats}
        userProfile={user?.nicotineProduct}
        customDailyCost={customDailyCost}
        onUpdateCost={setCustomDailyCost}
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
    marginBottom: SPACING.md,
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
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  moneySavedAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  moneySavedCurrency: {
    fontSize: 32,
    fontWeight: '600',
    color: '#F59E0B',
    marginRight: 4,
  },
  moneySavedAmount: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  moneySavedSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  calculationSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  calculationCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  calculationGradient: {
    padding: SPACING.lg,
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
    marginBottom: SPACING.lg,
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
    paddingVertical: SPACING.md,
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
  presetsScroll: {
    maxHeight: 200, // Adjust as needed
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
  compactHeroSection: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
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
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginTop: 2,
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
});

export default DashboardScreen; 