import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, SafeAreaView, Dimensions, Animated, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { selectAuth } from '../../store/slices/authSlice';
import { updateProgress, selectProgressStats, setQuitDate } from '../../store/slices/progressSlice';
import { SafeAreaView as SafeAreaViewCompat } from 'react-native-safe-area-context';
import { recoveryTrackingService } from '../../services/recoveryTrackingService';
import { dailyTipService } from '../../services/dailyTipService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EnhancedNeuralNetwork from '../../components/common/EnhancedNeuralNetwork';
import DailyTipModal from '../../components/common/DailyTipModal';
import AICoachCard from '../../components/common/AICoachCard';
import DateTimePicker from '@react-native-community/datetimepicker';

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

  // Load enabled factors from storage on component mount
  useEffect(() => {
    const loadEnabledFactors = async () => {
      try {
        const stored = await AsyncStorage.getItem('journalEnabledFactors');
        if (stored) {
          const parsedFactors = JSON.parse(stored);
          setEnabledFactors(parsedFactors);
          console.log('📋 Loaded journal customization from storage:', Object.keys(parsedFactors).filter(key => parsedFactors[key]).length, 'enabled factors');
        } else {
          console.log('📋 No stored journal customization found, using defaults');
        }
      } catch (error) {
        console.error('❌ Failed to load journal customization:', error);
      }
    };
    loadEnabledFactors();
  }, []);

  // Save enabled factors to storage whenever they change
  const saveEnabledFactors = async (factors: typeof enabledFactors) => {
    try {
      await AsyncStorage.setItem('journalEnabledFactors', JSON.stringify(factors));
      console.log('💾 Saved journal customization to storage:', Object.keys(factors).filter(key => factors[key]).length, 'enabled factors');
    } catch (error) {
      console.error('❌ Failed to save journal customization:', error);
    }
  };

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
      
      // Save to storage immediately when factor is toggled
      saveEnabledFactors(newState);
      
      console.log(`🔄 Factor toggled: ${factor} = ${newState[factor as keyof typeof newState]}`);
      console.log(`📊 Total enabled factors: ${Object.keys(newState).filter(key => newState[key as keyof typeof newState]).length}/${Object.keys(newState).length}`);
      
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
  }, [dispatch, user?.quitDate, user?.nicotineProduct, user?.dailyCost, user?.packagesPerDay]);

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

  // Health Info Modal Component
  const HealthInfoModal = () => {
    const { recoveryPercentage, daysClean } = recoveryData;
    const healthScore = stats?.healthScore || 0;
    
    return (
      <Modal
        visible={healthInfoVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setHealthInfoVisible(false)}
      >
        <SafeAreaViewCompat style={styles.modalContainer} edges={['top', 'left', 'right', 'bottom']}>
          <LinearGradient
            colors={['#000000', '#0A0F1C', '#0F172A']}
            style={styles.modalGradient}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Health Recovery Score</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setHealthInfoVisible(false)}
                  >
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Current Score */}
              <View style={styles.statusCard}>
                <Text style={styles.statusTitle}>Current Overall Recovery</Text>
                <Text style={styles.statusPercentage}>{Math.round(healthScore)}%</Text>
                <Text style={styles.statusDescription}>
                  Your health score combines multiple recovery factors to show your overall progress toward complete freedom from nicotine.
                      </Text>
                </View>

              {/* What Makes Up the Score */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>What Makes Up Your Score</Text>
                
                <View style={styles.scienceCard}>
                  <Text style={styles.scienceTitle}>🧠 Brain Recovery ({Math.round(recoveryPercentage)}%)</Text>
                  <Text style={styles.scienceText}>
                    Dopamine pathway restoration - how much your brain's reward system has healed from nicotine dependency.
                      </Text>
                    </View>

                <View style={styles.scienceCard}>
                  <Text style={styles.scienceTitle}>⏰ Time Factor ({daysClean} days)</Text>
                  <Text style={styles.scienceText}>
                    Length of your streak - each day clean strengthens your recovery and reduces relapse risk.
                  </Text>
                  </View>

                <View style={styles.scienceCard}>
                  <Text style={styles.scienceTitle}>💪 Physical Health</Text>
                  <Text style={styles.scienceText}>
                    Lung function, circulation, and other body systems healing from nicotine damage.
                      </Text>
                  </View>

                <View style={styles.scienceCard}>
                  <Text style={styles.scienceTitle}>🎯 Consistency</Text>
                  <Text style={styles.scienceText}>
                    Your track record of maintaining progress and building healthy habits.
                      </Text>
                  </View>
                </View>

              {/* Score Ranges */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Understanding Your Score</Text>
                
                <View style={styles.timelineContainer}>
                  <View style={[styles.timelineItem, { opacity: healthScore >= 0 ? 1 : 0.5 }]}>
                    <View style={[styles.timelineIndicator, { backgroundColor: healthScore >= 0 ? '#EF4444' : '#6B7280' }]} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>0-25%: Getting Started</Text>
                      <Text style={styles.timelineText}>Early days - your body is beginning to heal</Text>
                    </View>
                  </View>

                  <View style={[styles.timelineItem, { opacity: healthScore >= 25 ? 1 : 0.5 }]}>
                    <View style={[styles.timelineIndicator, { backgroundColor: healthScore >= 25 ? '#F59E0B' : '#6B7280' }]} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>25-50%: Building Momentum</Text>
                      <Text style={styles.timelineText}>Noticeable improvements in energy and breathing</Text>
                    </View>
                  </View>

                  <View style={[styles.timelineItem, { opacity: healthScore >= 50 ? 1 : 0.5 }]}>
                    <View style={[styles.timelineIndicator, { backgroundColor: healthScore >= 50 ? '#10B981' : '#6B7280' }]} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>50-75%: Strong Progress</Text>
                      <Text style={styles.timelineText}>Major health improvements, cravings decreasing</Text>
                    </View>
                  </View>

                  <View style={[styles.timelineItem, { opacity: healthScore >= 75 ? 1 : 0.5 }]}>
                    <View style={[styles.timelineIndicator, { backgroundColor: healthScore >= 75 ? '#10B981' : '#6B7280' }]} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>75-90%: Nearly There</Text>
                      <Text style={styles.timelineText}>Excellent recovery, rare cravings, feeling great</Text>
                    </View>
                  </View>

                  <View style={[styles.timelineItem, { opacity: healthScore >= 90 ? 1 : 0.5 }]}>
                    <View style={[styles.timelineIndicator, { backgroundColor: healthScore >= 90 ? '#10B981' : '#6B7280' }]} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>90-100%: Freedom Achieved</Text>
                      <Text style={styles.timelineText}>Complete recovery - you're free from nicotine!</Text>
                </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Footer Button */}
            <View style={styles.modalFooter}>
                <TouchableOpacity 
                style={styles.keepGoingButton}
                onPress={() => setHealthInfoVisible(false)}
                >
                  <LinearGradient
                  colors={['#10B981', '#06B6D4']}
                  style={styles.keepGoingGradient}
                  >
                  <Ionicons name="heart" size={20} color="#FFFFFF" />
                  <Text style={styles.keepGoingText}>Keep Building Your Health!</Text>
                  </LinearGradient>
                </TouchableOpacity>
            </View>
          </LinearGradient>
        </SafeAreaViewCompat>
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

    // Load today's journal entry when modal opens
    useEffect(() => {
      const loadTodayJournal = async () => {
        try {
          const today = new Date().toISOString().split('T')[0];
          const savedEntry = await AsyncStorage.getItem(`journal_${today}`);
          if (savedEntry) {
            const parsedEntry = JSON.parse(savedEntry);
            setJournalData(parsedEntry);
            console.log('📖 Loaded today\'s journal entry:', parsedEntry);
          } else {
            console.log('📝 No journal entry found for today, using defaults');
          }
        } catch (error) {
          console.error('❌ Failed to load journal entry:', error);
        }
      };
      loadTodayJournal();
    }, []);

    const updateJournalData = useCallback((key: string, value: any) => {
      setJournalData(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleComplete = useCallback(async () => {
      try {
        // Save journal entry with today's date as key
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const journalEntry = {
          ...journalData,
          date: today,
          timestamp: new Date().toISOString(),
        };
        
        // Save to AsyncStorage
        await AsyncStorage.setItem(`journal_${today}`, JSON.stringify(journalEntry));
        
        console.log('💾 Journal Entry Saved:', journalEntry);
        console.log('🔑 Saved with key:', `journal_${today}`);
        
        setRecoveryJournalVisible(false);
        Alert.alert(
          'Journal Saved! 📊', 
          'Your recovery data has been saved and will be available when you return to the app.',
          [{ text: 'Perfect!', style: 'default' }]
        );
      } catch (error) {
        console.error('❌ Failed to save journal entry:', error);
        Alert.alert('Error', 'Failed to save journal entry. Please try again.');
      }
    }, [journalData]);

    return (
      <Modal
        visible={recoveryJournalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setRecoveryJournalVisible(false)}
      >
        <SafeAreaViewCompat style={styles.journalContainer} edges={['top', 'left', 'right', 'bottom']}>
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
              
              <View style={styles.journalTitleContainer}>
                <Text style={styles.journalTitle}>JOURNAL</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.journalEditButton}
                onPress={() => {
                  setRecoveryJournalVisible(false);
                  setTimeout(() => setCustomizeJournalVisible(true), 100);
                }}
              >
                <Ionicons name="create-outline" size={24} color="#FFFFFF" />
                <View style={styles.factorCountBadge}>
                  <Text style={styles.factorCountText}>
                    {Object.keys(enabledFactors).filter(key => enabledFactors[key as keyof typeof enabledFactors]).length}
                  </Text>
                </View>
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
        </SafeAreaViewCompat>
      </Modal>
    );
  };

  // Optimized CustomizeJournalModal to prevent unnecessary rerenders
  const CustomizeJournalModal = () => {
    const handleSave = useCallback(() => {
      const enabledCount = Object.keys(enabledFactors).filter(key => enabledFactors[key as keyof typeof enabledFactors]).length;
      const totalCount = Object.keys(enabledFactors).length;
      
      setCustomizeJournalVisible(false);
      
      Alert.alert(
        'Journal Customized! 📊', 
        `You have ${enabledCount} of ${totalCount} tracking factors enabled.\n\nThese settings are automatically saved and will be remembered next time you open the app.`,
        [{ text: 'Perfect!', style: 'default' }]
      );
      
      console.log(`📋 Journal customization completed: ${enabledCount}/${totalCount} factors enabled`);
    }, [enabledFactors]);

    return (
      <Modal
        visible={customizeJournalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setCustomizeJournalVisible(false)}
      >
        <SafeAreaViewCompat style={styles.journalContainer} edges={['top', 'left', 'right', 'bottom']}>
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
              
              <View style={styles.journalTitleContainer}>
                <Text style={styles.journalTitle}>CUSTOMIZE TRACKING</Text>
                <Text style={styles.journalSubtitle}>
                  {Object.keys(enabledFactors).filter(key => enabledFactors[key as keyof typeof enabledFactors]).length} of {Object.keys(enabledFactors).length} factors enabled
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.journalSaveButton}
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
                Enable or disable factors for your daily recovery journal. Changes are saved automatically and will be remembered between app sessions. Only enabled factors will appear in your journal.
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
        </SafeAreaViewCompat>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.background}
      >
        <SafeAreaViewCompat style={styles.safeArea} edges={['top']}>
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

            {/* Progress Metrics Grid */}
            <View style={styles.metricsGrid}>
              <TouchableOpacity 
                style={styles.metricCard}
                onPress={() => setHealthInfoVisible(true)}
                activeOpacity={0.8}
              >
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
                style={styles.metricCardGradient}
              >
                <View style={styles.metricContent}>
                  <View style={styles.metricHeader}>
                    <Ionicons name="heart-outline" size={20} color={COLORS.secondary} />
                    <Text style={styles.metricTitle}>Overall Recovery</Text>
                    <Ionicons name="information-circle-outline" size={14} color={COLORS.secondary} style={{ marginLeft: 4 }} />
                  </View>
                  <Text style={styles.metricValue}>{Math.round(stats?.healthScore || 0)}%</Text>
                  <Text style={styles.metricSubtext}>tap for details</Text>
                  <View style={styles.metricBar}>
                    <LinearGradient
                      colors={[COLORS.secondary, COLORS.primary]}
                      style={[styles.metricBarFill, { width: `${stats?.healthScore || 0}%` }]}
                    />
                  </View>
                </View>
              </LinearGradient>
              </TouchableOpacity>

              <LinearGradient
                colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
                style={styles.metricCard}
              >
                <View style={styles.metricContent}>
                  <View style={styles.metricHeader}>
                    <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.metricTitle}>Time Saved</Text>
                  </View>
                  <Text style={styles.metricValue}>{Math.round(stats?.lifeRegained || 0)}h</Text>
                  <Text style={styles.metricSubtext}>of life regained</Text>
                </View>
              </LinearGradient>

              <LinearGradient
                colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
                style={styles.metricCard}
              >
                <View style={styles.metricContent}>
                  <View style={styles.metricHeader}>
                    <Ionicons name="cash-outline" size={20} color={COLORS.secondary} />
                    <Text style={styles.metricTitle}>Money Saved</Text>
                  </View>
                  <Text style={styles.metricValue}>${Math.round(stats?.moneySaved || 0)}</Text>
                  <Text style={styles.metricSubtext}>and counting</Text>
                </View>
              </LinearGradient>

              <LinearGradient
                colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
                style={styles.metricCard}
              >
                <View style={styles.metricContent}>
                  <View style={styles.metricHeader}>
                    <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.metricTitle}>Avoided</Text>
                  </View>
                  <Text style={styles.metricValue}>{stats?.unitsAvoided || 0}</Text>
                  <Text style={styles.metricSubtext}>{personalizedUnitName}</Text>
                </View>
              </LinearGradient>
            </View>

            {/* AI Coach Section */}
            <AICoachCard
              journalData={null}
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
                  colors={['rgba(16, 185, 129, 0.3)', 'rgba(6, 182, 212, 0.3)']}
                  style={styles.primaryActionGradient}
                >
                  <View style={styles.primaryActionContent}>
                    <View style={styles.primaryActionHeader}>
                      <Ionicons name="book-outline" size={24} color={COLORS.primary} />
                      <Text style={styles.primaryActionTitle}>Recovery Journal</Text>
                    </View>
                    <Text style={styles.primaryActionSubtitle}>
                      Quick check-in • Track your recovery factors
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                </LinearGradient>
              </TouchableOpacity>

              {/* Secondary Actions */}
              <View style={styles.secondaryActions}>
                <TouchableOpacity style={styles.secondaryAction} onPress={handleResetProgress}>
                  <LinearGradient
                    colors={['rgba(245, 158, 11, 0.2)', 'rgba(239, 68, 68, 0.2)']}
                    style={styles.secondaryActionGradient}
                  >
                    <Ionicons name="refresh-outline" size={20} color="#F59E0B" />
                    <Text style={styles.secondaryActionText}>Reset Date</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryAction} onPress={() => setDailyTipVisible(true)}>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
                    style={styles.secondaryActionGradient}
                  >
                    <View style={styles.actionIconContainer}>
                    <Ionicons name="bulb-outline" size={20} color={COLORS.primary} />
                      {/* New tip indicator */}
                      <View style={styles.tipBadge} />
                    </View>
                    <Text style={styles.secondaryActionText}>Daily Tip</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaViewCompat>
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
        <SafeAreaViewCompat style={styles.resetModalContainer} edges={['top', 'left', 'right', 'bottom']}>
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
        </SafeAreaViewCompat>
      </Modal>

      {/* Daily Tip Modal */}
      <DailyTipModal 
        visible={dailyTipVisible} 
        onClose={() => setDailyTipVisible(false)} 
      />

      {/* Customize Journal Modal */}
      <CustomizeJournalModal />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  metricCardGradient: {
    flex: 1,
    borderRadius: 16,
  },
  metricContent: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  metricSubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  metricBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  primaryAction: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  primaryActionContent: {
    flex: 1,
  },
  primaryActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  primaryActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  primaryActionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryAction: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  secondaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  actionIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    borderWidth: 1,
    borderColor: '#FFFFFF',
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
  journalSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#10B981',
    letterSpacing: 1,
    marginTop: 2,
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
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  journalMainQuestionText: {
    fontSize: 18,
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
  customizeFactorToggleDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: '#6B7280',
    opacity: 0.5,
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
  journalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  journalFactorBadge: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  journalFactorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  journalFactorButtonContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  journalFactorCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    lineHeight: 18,
  },
  journalFactorLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  journalSettingsIcon: {
    marginLeft: SPACING.sm,
  },
  journalSaveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  factorCountBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10B981',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  factorCountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 14,
  },
});

export default DashboardScreen; 