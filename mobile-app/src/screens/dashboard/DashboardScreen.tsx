import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Modal, Alert, Platform } from 'react-native';
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
  // const navigation = useNavigation<DashboardNavigationProp>();

  // Deferred rendering states for Neural Info Modal
  const [renderNeuralHeader, setRenderNeuralHeader] = useState(false);
  const [renderNeuralStatus, setRenderNeuralStatus] = useState(false);
  const [renderNeuralScience, setRenderNeuralScience] = useState(false);
  const [renderNeuralTimeline, setRenderNeuralTimeline] = useState(false);
  const [renderNeuralFooter, setRenderNeuralFooter] = useState(false);

  // Journal Enabled Factors State - Shared between modals
  const [enabledFactors, setEnabledFactors] = useState({
    // Mental Health
    moodRating: true,
    usedBreathing: true,
    stressLevel: false,
    anxietyLevel: false,
    cravingIntensity: false,
    
    // Physical Recovery
    sleepQuality: true,
    sleepHours: true,
    waterIntake: true,
    energyLevel: true,
    physicalActivity: true,
    
    // Wellness
    caffeineIntake: true,
    socialSupport: true,
    stressfulSituations: true,
    vitaminsSupplements: false,
    exerciseDuration: false,
  });

  const toggleFactor = (factor: string) => {
    setEnabledFactors(prev => ({
      ...prev,
      [factor]: !prev[factor as keyof typeof prev]
    }));
  };

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
      // Fallback to basic calculation if service fails
      const daysClean = stats?.daysClean || 0;
      const recoveryPercentage = recoveryTrackingService.calculateDopamineRecovery(daysClean);
      
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
            <TouchableOpacity onPress={() => setNeuralInfoVisible(true)}>
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

  // Neural Info Modal Component - REBUILT FROM SCRATCH
  const NeuralInfoModal = () => {
    const { recoveryPercentage, daysClean, recoveryMessage } = recoveryData;
                  
                  return (
      <Modal
        visible={neuralInfoVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setNeuralInfoVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'left', 'right', 'bottom']}>
          <LinearGradient
            colors={['#000000', '#0A0F1C', '#0F172A']}
            style={styles.modalGradient}
          >
            {/* Header */}
            {renderNeuralHeader && (
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Your Brain Recovery</Text>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setNeuralInfoVisible(false)}
                >
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
                )}
                
            {/* Content */}
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Current Status */}
              {renderNeuralStatus && (
                <View style={styles.statusCard}>
                  <Text style={styles.statusTitle}>Day {daysClean} Recovery</Text>
                  <Text style={styles.statusPercentage}>{recoveryPercentage}% dopamine restoration</Text>
                  <Text style={styles.statusDescription}>{recoveryMessage}</Text>
                </View>
              )}

              {/* Science Section */}
              {renderNeuralScience && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>The Science</Text>
                  
                  <View style={styles.scienceCard}>
                    <Text style={styles.scienceTitle}>Dopamine System</Text>
                    <Text style={styles.scienceText}>
                      Nicotine hijacked your brain's reward pathways. Recovery restores natural dopamine function.
                    </Text>
                  </View>

                  <View style={styles.scienceCard}>
                    <Text style={styles.scienceTitle}>Neuroplasticity</Text>
                    <Text style={styles.scienceText}>
                      Your brain rewires itself. Each day heals damaged circuits and strengthens healthy patterns.
                    </Text>
                  </View>

                  <View style={styles.scienceCard}>
                    <Text style={styles.scienceTitle}>Recovery Timeline</Text>
                    <Text style={styles.scienceText}>
                      Significant improvement in 3 months, with continued healing for up to a year.
                    </Text>
                  </View>
                </View>
              )}
        
              {/* Recovery Timeline */}
              {renderNeuralTimeline && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Your Recovery Journey</Text>
                  
                  <View style={styles.timelineContainer}>
                    <View style={[styles.timelineItem, { opacity: daysClean >= 0 ? 1 : 0.5 }]}>
                      <View style={[styles.timelineIndicator, { backgroundColor: daysClean >= 0 ? '#10B981' : '#6B7280' }]} />
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>Day 0-3: Detox Phase</Text>
                        <Text style={styles.timelineText}>Nicotine clears, dopamine receptors begin normalizing</Text>
                      </View>
                    </View>

                    <View style={[styles.timelineItem, { opacity: daysClean >= 7 ? 1 : 0.5 }]}>
                      <View style={[styles.timelineIndicator, { backgroundColor: daysClean >= 7 ? '#10B981' : '#6B7280' }]} />
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>Week 1-2: Early Recovery</Text>
                        <Text style={styles.timelineText}>Dopamine rebalances, cravings start decreasing</Text>
      </View>
                    </View>

                    <View style={[styles.timelineItem, { opacity: daysClean >= 30 ? 1 : 0.5 }]}>
                      <View style={[styles.timelineIndicator, { backgroundColor: daysClean >= 30 ? '#10B981' : '#6B7280' }]} />
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>Month 1: Major Progress</Text>
                        <Text style={styles.timelineText}>Significant mood and focus improvement</Text>
                      </View>
                    </View>

                    <View style={[styles.timelineItem, { opacity: daysClean >= 90 ? 1 : 0.5 }]}>
                      <View style={[styles.timelineIndicator, { backgroundColor: daysClean >= 90 ? '#10B981' : '#6B7280' }]} />
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>Month 3+: Near-Complete</Text>
                        <Text style={styles.timelineText}>Dopamine system largely restored</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Footer Button */}
            {renderNeuralFooter && (
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.keepGoingButton}
                  onPress={() => setNeuralInfoVisible(false)}
                >
                  <LinearGradient
                    colors={['#10B981', '#06B6D4']}
                    style={styles.keepGoingGradient}
                  >
                    <Ionicons name="rocket" size={20} color="#FFFFFF" />
                    <Text style={styles.keepGoingText}>Keep Going!</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </SafeAreaView>
      </Modal>
    );
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
        <SafeAreaView style={styles.modalContainer} edges={['top', 'left', 'right', 'bottom']}>
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
                <Text style={styles.statusPercentage}>{Math.round(healthScore)}% Complete</Text>
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
        </SafeAreaView>
      </Modal>
    );
  };

  // Recovery Journal Modal Component - CLEAN VERSION
  const RecoveryJournalModal = () => {
    const [journalData, setJournalData] = useState({
      // Mental Health & Cravings
      stressLevel: null as boolean | null,
      cravingIntensity: null as boolean | null,
      anxietyLevel: null as boolean | null,
      moodRating: null as boolean | null,
      usedBreathing: null as boolean | null,
      
      // Physical Recovery
      sleepQuality: null as boolean | null,
      sleepHours: 7.5,
      energyLevel: null as boolean | null,
      physicalActivity: null as boolean | null,
      
      // Health & Wellness
      waterIntake: 6,
      caffeineIntake: null as boolean | null,
      socialSupport: null as boolean | null,
      stressfulSituations: null as boolean | null,
    });

    const updateJournalData = (key: string, value: any) => {
      setJournalData(prev => ({ ...prev, [key]: value }));
    };

    const handleComplete = () => {
      setRecoveryJournalVisible(false);
      Alert.alert('Journal Saved', 'Your recovery journal has been saved successfully!');
    };

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
                {enabledFactors.moodRating && (
                  <View style={styles.journalCompactQuestion}>
                    <Text style={styles.journalCompactQuestionText}>Feeling positive today?</Text>
                    <View style={styles.journalCompactToggleContainer}>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.moodRating === false && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('moodRating', false)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.moodRating === true && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('moodRating', true)}
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
                        style={[styles.journalCompactToggle, journalData.stressLevel === false && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('stressLevel', false)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.stressLevel === true && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('stressLevel', true)}
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
                        style={[styles.journalCompactToggle, journalData.anxietyLevel === false && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('anxietyLevel', false)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.anxietyLevel === true && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('anxietyLevel', true)}
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
                        style={[styles.journalCompactToggle, journalData.cravingIntensity === false && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('cravingIntensity', false)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.cravingIntensity === true && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('cravingIntensity', true)}
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
                        style={[styles.journalCompactToggle, journalData.sleepQuality === false && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('sleepQuality', false)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.sleepQuality === true && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('sleepQuality', true)}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Sleep Hours - Conditionally rendered */}
                {enabledFactors.sleepHours && (
                  <View style={styles.journalCounterQuestion}>
                    <Text style={styles.journalCounterQuestionTitle}>Sleep Duration</Text>
                    <View style={styles.journalSmoothCounter}>
                      <TouchableOpacity 
                        style={styles.journalCounterButton}
                        onPress={() => updateJournalData('sleepHours', Math.max(0, journalData.sleepHours - 0.5))}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="remove" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                      <View style={styles.journalCounterValue}>
                        <Text style={styles.journalCounterValueText}>{journalData.sleepHours}</Text>
                        <Text style={styles.journalCounterUnit}>hours</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.journalCounterButton}
                        onPress={() => updateJournalData('sleepHours', journalData.sleepHours + 0.5)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Water Intake - Conditionally rendered */}
                {enabledFactors.waterIntake && (
                  <View style={styles.journalCounterQuestion}>
                    <Text style={styles.journalCounterQuestionTitle}>Water Intake</Text>
                    <View style={styles.journalSmoothCounter}>
                      <TouchableOpacity 
                        style={styles.journalCounterButton}
                        onPress={() => updateJournalData('waterIntake', Math.max(0, journalData.waterIntake - 1))}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="remove" size={20} color="#FFFFFF" />
                      </TouchableOpacity>
                      <View style={styles.journalCounterValue}>
                        <Text style={styles.journalCounterValueText}>{journalData.waterIntake}</Text>
                        <Text style={styles.journalCounterUnit}>8oz servings</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.journalCounterButton}
                        onPress={() => updateJournalData('waterIntake', journalData.waterIntake + 1)}
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
                        style={[styles.journalCompactToggle, journalData.energyLevel === false && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('energyLevel', false)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.energyLevel === true && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('energyLevel', true)}
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
                        style={[styles.journalCompactToggle, journalData.physicalActivity === false && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('physicalActivity', false)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.physicalActivity === true && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('physicalActivity', true)}
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
                        style={[styles.journalCompactToggle, journalData.caffeineIntake === false && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('caffeineIntake', false)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.caffeineIntake === true && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('caffeineIntake', true)}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Social Support - Conditionally rendered */}
                {enabledFactors.socialSupport && (
                  <View style={styles.journalCompactQuestion}>
                    <Text style={styles.journalCompactQuestionText}>Social support today?</Text>
                    <View style={styles.journalCompactToggleContainer}>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.socialSupport === false && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('socialSupport', false)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.socialSupport === true && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('socialSupport', true)}
                      >
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Handle Stress - Conditionally rendered */}
                {enabledFactors.stressfulSituations && (
                  <View style={styles.journalCompactQuestion}>
                    <Text style={styles.journalCompactQuestionText}>Handle stress well?</Text>
                    <View style={styles.journalCompactToggleContainer}>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.stressfulSituations === false && styles.journalCompactToggleInactive]}
                        onPress={() => updateJournalData('stressfulSituations', false)}
                      >
                        <Ionicons name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.journalCompactToggle, journalData.stressfulSituations === true && styles.journalCompactToggleActive]}
                        onPress={() => updateJournalData('stressfulSituations', true)}
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

  // Customize Journal Modal - FULL FEATURED VERSION
  const CustomizeJournalModal = () => {
    const handleSave = () => {
      setCustomizeJournalVisible(false);
      Alert.alert('Journal Updated', 'Your tracking preferences have been saved!');
    };

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
                Enable or disable factors that appear in your daily recovery journal. Focus on what matters most to your journey.
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
                    style={[styles.customizeFactorToggle, enabledFactors.moodRating && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('moodRating')}
                  >
                    <Ionicons 
                      name={enabledFactors.moodRating ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.moodRating ? "#10B981" : "#6B7280"} 
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
                    style={[styles.customizeFactorToggle, enabledFactors.sleepHours && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('sleepHours')}
                  >
                    <Ionicons 
                      name={enabledFactors.sleepHours ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.sleepHours ? "#10B981" : "#6B7280"} 
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
                    style={[styles.customizeFactorToggle, enabledFactors.waterIntake && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('waterIntake')}
                  >
                    <Ionicons 
                      name={enabledFactors.waterIntake ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.waterIntake ? "#10B981" : "#6B7280"} 
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
                    style={[styles.customizeFactorToggle, enabledFactors.socialSupport && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('socialSupport')}
                  >
                    <Ionicons 
                      name={enabledFactors.socialSupport ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.socialSupport ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Stress Management */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={styles.customizeFactorTitle}>Stress Management</Text>
                      <Text style={styles.customizeFactorDescription}>Handle stressful situations well?</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.stressfulSituations && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('stressfulSituations')}
                  >
                    <Ionicons 
                      name={enabledFactors.stressfulSituations ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.stressfulSituations ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Vitamins/Supplements - Optional */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="medical-outline" size={20} color={enabledFactors.vitaminsSupplements ? "#10B981" : "#6B7280"} />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={[styles.customizeFactorTitle, !enabledFactors.vitaminsSupplements && styles.customizeFactorTitleDisabled]}>
                        Vitamins & Supplements
                      </Text>
                      <Text style={[styles.customizeFactorDescription, !enabledFactors.vitaminsSupplements && styles.customizeFactorTitleDisabled]}>
                        Take vitamins or supplements?
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.vitaminsSupplements && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('vitaminsSupplements')}
                  >
                    <Ionicons 
                      name={enabledFactors.vitaminsSupplements ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.vitaminsSupplements ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Exercise Duration - Optional */}
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="stopwatch-outline" size={20} color={enabledFactors.exerciseDuration ? "#10B981" : "#6B7280"} />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={[styles.customizeFactorTitle, !enabledFactors.exerciseDuration && styles.customizeFactorTitleDisabled]}>
                        Exercise Duration
                      </Text>
                      <Text style={[styles.customizeFactorDescription, !enabledFactors.exerciseDuration && styles.customizeFactorTitleDisabled]}>
                        Track duration of exercise activities?
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.customizeFactorToggle, enabledFactors.exerciseDuration && styles.customizeFactorToggleActive]}
                    onPress={() => toggleFactor('exerciseDuration')}
                  >
                    <Ionicons 
                      name={enabledFactors.exerciseDuration ? "checkmark" : "close"} 
                      size={16} 
                      color={enabledFactors.exerciseDuration ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Coming Soon Section */}
              <View style={styles.journalSection}>
                <Text style={styles.journalSectionTitle}>COMING SOON</Text>
                
                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="add-circle-outline" size={20} color="#6B7280" />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={[styles.customizeFactorTitle, styles.customizeFactorTitleDisabled]}>
                        Add custom tracking factors
                      </Text>
                      <Text style={[styles.customizeFactorDescription, styles.customizeFactorTitleDisabled]}>
                        Add any additional factors you want to track
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.customizeFactorToggle, styles.customizeFactorToggleDisabled]}>
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                  </View>
                </View>

                <View style={styles.customizeFactorItem}>
                  <View style={styles.customizeFactorContent}>
                    <Ionicons name="analytics-outline" size={20} color="#6B7280" />
                    <View style={styles.customizeFactorTextContainer}>
                      <Text style={[styles.customizeFactorTitle, styles.customizeFactorTitleDisabled]}>
                        Advanced analytics & insights
                      </Text>
                      <Text style={[styles.customizeFactorDescription, styles.customizeFactorTitleDisabled]}>
                        View detailed reports and insights about your recovery
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.customizeFactorToggle, styles.customizeFactorToggleDisabled]}>
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.customizeFooterInfo}>
              <View style={styles.customizeFooterInfoContent}>
                <Ionicons name="information-circle-outline" size={16} color="#10B981" />
                <Text style={styles.customizeFooterInfoText}>
                  Changes take effect immediately in your next journal entry
                </Text>
              </View>
            </View>
          </LinearGradient>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Neural Recovery Explanation */}
        <View style={styles.neuralExplanation}>
          <View style={styles.neuralExplanationHeader}>
            <Ionicons name="pulse-outline" size={20} color={safeColors.primary} />
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
                <Ionicons name="heart-outline" size={20} color="#10B981" />
                  <Text style={styles.metricTitle}>Overall Recovery</Text>
                  <Ionicons name="information-circle-outline" size={14} color="#10B981" style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.metricValue}>{Math.round(stats?.healthScore || 0)}%</Text>
                <Text style={styles.metricSubtext}>tap for details</Text>
              <View style={styles.metricBar}>
                <LinearGradient
                  colors={['#10B981', '#06B6D4']}
                  style={[styles.metricBarFill, { width: `${stats?.healthScore || 0}%` }]}
                />
              </View>
            </View>
          </LinearGradient>
          </TouchableOpacity>

          <LinearGradient
            colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)']}
            style={styles.metricCard}
          >
            <View style={styles.metricContent}>
              <View style={styles.metricHeader}>
                <Ionicons name="time-outline" size={20} color="#8B5CF6" />
                <Text style={styles.metricTitle}>Time Saved</Text>
              </View>
              <Text style={styles.metricValue}>{Math.round(stats?.lifeRegained || 0)}h</Text>
              <Text style={styles.metricSubtext}>of life regained</Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(245, 158, 11, 0.15)', 'rgba(239, 68, 68, 0.15)']}
            style={styles.metricCard}
          >
            <View style={styles.metricContent}>
              <View style={styles.metricHeader}>
                <Ionicons name="cash-outline" size={20} color="#F59E0B" />
                <Text style={styles.metricTitle}>Money Saved</Text>
              </View>
              <Text style={styles.metricValue}>${Math.round(stats?.moneySaved || 0)}</Text>
              <Text style={styles.metricSubtext}>and counting</Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(59, 130, 246, 0.15)', 'rgba(16, 185, 129, 0.15)']}
            style={styles.metricCard}
          >
            <View style={styles.metricContent}>
              <View style={styles.metricHeader}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#3B82F6" />
                <Text style={styles.metricTitle}>Avoided</Text>
              </View>
              <Text style={styles.metricValue}>{stats?.unitsAvoided || 0}</Text>
              <Text style={styles.metricSubtext}>{personalizedUnitName}</Text>
            </View>
          </LinearGradient>
        </View>

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
                  <Ionicons name="book-outline" size={24} color="#10B981" />
                  <Text style={styles.primaryActionTitle}>Recovery Journal</Text>
                </View>
                <Text style={styles.primaryActionSubtitle}>
                  Quick check-in • Track your recovery factors
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#10B981" />
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
                colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
                style={styles.secondaryActionGradient}
              >
                <View style={styles.actionIconContainer}>
                <Ionicons name="bulb-outline" size={20} color="#8B5CF6" />
                  {/* New tip indicator */}
                  <View style={styles.tipBadge} />
                </View>
                <Text style={styles.secondaryActionText}>Daily Tip</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
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
    marginBottom: SPACING.sm,
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
    color: safeColors.text,
    marginLeft: SPACING.sm,
  },
  neuralExplanationText: {
    fontSize: 14,
    color: safeColors.textSecondary,
    lineHeight: 20,
  },
  neuralNetworkContainer: {
    height: 300,
    marginBottom: SPACING.sm,
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
    color: safeColors.textSecondary,
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
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  neuralGrowthText: {
    fontSize: 12,
    fontWeight: '600',
    color: safeColors.primary,
    marginLeft: SPACING.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING['2xl'],
  },
  metricCard: {
    width: '48%',
    marginBottom: SPACING.md,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: safeColors.cardBorder,
  },
  metricCardGradient: {
    flex: 1,
    borderRadius: SPACING.lg,
  },
  metricContent: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: SPACING.lg,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricTitle: {
    fontSize: 12,
    color: safeColors.textSecondary,
    marginLeft: SPACING.xs,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: safeColors.text,
  },
  metricSubtext: {
    fontSize: 11,
    color: safeColors.textMuted,
    marginTop: 2,
  },
  metricBar: {
    height: 4,
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
    marginBottom: SPACING['2xl'],
  },
  sectionContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: safeColors.text,
    marginBottom: SPACING.lg,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryAction: {
    width: '48%',
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  secondaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: safeColors.cardBorder,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: safeColors.text,
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
    color: safeColors.text,
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
    color: safeColors.textSecondary,
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
    color: safeColors.text,
    marginBottom: SPACING.xs,
  },
  resetTypeOptionTitleSelected: {
    color: '#F59E0B',
  },
  resetTypeOptionSubtitle: {
    fontSize: 13,
    color: safeColors.textSecondary,
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
    color: safeColors.text,
    marginBottom: SPACING.sm,
  },
  resetWhatHappensDescription: {
    fontSize: 14,
    color: safeColors.textSecondary,
    lineHeight: 20,
  },
  resetSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: safeColors.text,
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
    color: safeColors.text,
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
    color: safeColors.text,
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
    color: safeColors.textSecondary,
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
    color: safeColors.textSecondary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: safeColors.text,
  },
  datePickerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
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
    color: safeColors.text,
  },
  modalCloseButton: {
    padding: SPACING.sm,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  statusCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: safeColors.text,
    marginBottom: SPACING.sm,
  },
  statusPercentage: {
    fontSize: 16,
    color: '#00FFFF',
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  statusDescription: {
    fontSize: 14,
    color: safeColors.textSecondary,
    lineHeight: 20,
  },
  scienceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scienceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: safeColors.text,
    marginBottom: SPACING.sm,
  },
  scienceText: {
    fontSize: 14,
    color: safeColors.textSecondary,
    lineHeight: 18,
  },
  timelineContainer: {
    marginBottom: SPACING.md,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: safeColors.text,
    marginBottom: SPACING.sm,
  },
  timelineText: {
    fontSize: 14,
    color: safeColors.textSecondary,
    lineHeight: 18,
  },
  modalFooter: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  keepGoingButton: {
    borderRadius: SPACING.lg,
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
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
  },
  primaryAction: {
    width: '100%',
    borderRadius: SPACING.md,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: safeColors.text,
    marginLeft: SPACING.sm,
  },
  primaryActionSubtitle: {
    fontSize: 14,
    color: safeColors.textSecondary,
    lineHeight: 18,
  },
  // Journal Modal Styles
  journalProgress: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  journalProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  journalProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: safeColors.primary,
  },
  journalProgressSubtext: {
    fontSize: 16,
    fontWeight: 'bold',
    color: safeColors.text,
  },
  journalProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  journalProgressFill: {
    height: '100%',
    backgroundColor: safeColors.primary,
    borderRadius: 2,
  },
  journalSection: {
    paddingVertical: SPACING.lg,
  },
  journalSectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: safeColors.text,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  journalItem: {
    marginBottom: SPACING.xl,
  },
  journalItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: safeColors.text,
    marginBottom: SPACING.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  toggleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonSelected: {
    backgroundColor: safeColors.primary,
    borderColor: safeColors.primary,
  },
  sliderContainer: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sliderTrack: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    position: 'relative',
    marginVertical: SPACING.sm,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: safeColors.primary,
    top: -7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  sliderLabel: {
    fontSize: 12,
    color: safeColors.textMuted,
    position: 'absolute',
    left: 0,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: safeColors.primary,
    marginTop: SPACING.sm,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: safeColors.text,
    minWidth: 60,
    textAlign: 'center',
  },
  journalNavigation: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  journalNavButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  journalNavButtonDisabled: {
    opacity: 0.5,
  },
  journalNavButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: safeColors.text,
    marginLeft: SPACING.xs,
  },
  journalNavButtonTextDisabled: {
    color: safeColors.textMuted,
  },
  journalNavButtonPrimary: {
    flex: 1,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  journalNavButtonPrimaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
  },
  journalNavButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
    padding: SPACING.sm,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  journalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: safeColors.text,
  },
  journalEditButton: {
    padding: SPACING.sm,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  journalDateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  journalNavArrow: {
    padding: SPACING.sm,
    borderRadius: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journalDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: safeColors.text,
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  journalInsightsSpacing: {
    marginLeft: SPACING.md,
  },
  journalInsightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  journalInsightsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  journalMainQuestion: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  journalMainQuestionText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 20,
    textAlign: 'center',
  },
  // Journal Modal Styles
  journalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  journalGradient: {
    flex: 1,
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
});

export default DashboardScreen; 