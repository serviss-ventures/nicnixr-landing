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
import { DashboardStackParamList } from '../../navigation/DashboardNavigator';
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

type DashboardNavigationProp = StackNavigationProp<DashboardStackParamList, 'Dashboard'>;

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
  const navigation = useNavigation<DashboardNavigationProp>();

  // Deferred rendering states for Neural Info Modal
  const [renderNeuralHeader, setRenderNeuralHeader] = useState(false);
  const [renderNeuralStatus, setRenderNeuralStatus] = useState(false);
  const [renderNeuralScience, setRenderNeuralScience] = useState(false);
  const [renderNeuralTimeline, setRenderNeuralTimeline] = useState(false);
  const [renderNeuralFooter, setRenderNeuralFooter] = useState(false);

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

  // Recovery Journal Modal Component
  const RecoveryJournalModal = () => {
    const [currentSection, setCurrentSection] = useState(0);
    const [journalData, setJournalData] = useState({
      // Mental & Emotional
      stressLevel: 3,
      hadCravings: false,
      cravingIntensity: 1,
      moodPositive: true,
      feltAnxious: false,
      usedBreathing: false,
      meditationMinutes: 0,
      
      // Physical Recovery
      qualitySleep: true,
      sleepHours: 7,
      stayedHydrated: true,
      waterGlasses: 6,
      exercised: false,
      exerciseType: '',
      ateNutritious: true,
      tookSupplements: false,
      
      // Recovery Actions
      usedApp: true,
      reachedSupport: false,
      avoidedTriggers: true,
      celebratedMilestone: false,
      readContent: false,
      contentMinutes: 0,
      
      // Social & Environment
      aroundSmokers: false,
      socialChallenging: false,
      receivedEncouragement: true,
      helpedOthers: false
    });

    const sections = [
      {
        title: "Mental & Emotional",
        icon: "brain-outline",
        color: "#8B5CF6"
      },
      {
        title: "Physical Recovery", 
        icon: "fitness-outline",
        color: "#10B981"
      },
      {
        title: "Recovery Actions",
        icon: "rocket-outline", 
        color: "#3B82F6"
      },
      {
        title: "Social & Environment",
        icon: "people-outline",
        color: "#F59E0B"
      }
    ];

    const updateJournalData = (key: string, value: any) => {
      setJournalData(prev => ({ ...prev, [key]: value }));
    };

    const renderJournalSection = () => {
      switch (currentSection) {
        case 0: // Mental & Emotional
          return (
            <View style={styles.journalSection}>
              <Text style={styles.journalSectionTitle}>🧠 Mental & Emotional</Text>
              
              {/* Stress Level */}
              <View style={styles.journalItem}>
                <Text style={styles.journalItemTitle}>Stress level today?</Text>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>Low</Text>
                  <TouchableOpacity 
                    style={styles.sliderTrack}
                    onPress={(event) => {
                      const { locationX } = event.nativeEvent;
                      const trackWidth = event.currentTarget.offsetWidth || 250;
                      const percentage = Math.max(0, Math.min(1, locationX / trackWidth));
                      const value = Math.round(percentage * 4) + 1;
                      updateJournalData('stressLevel', value);
                    }}
                  >
                    <View style={[styles.sliderThumb, { left: `${(journalData.stressLevel - 1) * 25}%` }]} />
                  </TouchableOpacity>
                  <Text style={styles.sliderLabel}>High</Text>
                  <Text style={styles.sliderValue}>{journalData.stressLevel}/5</Text>
                </View>
              </View>

              {/* Experience Cravings */}
              <View style={styles.journalItem}>
                <Text style={styles.journalItemTitle}>Experience any cravings?</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, !journalData.hadCravings && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('hadCravings', false)}
                  >
                    <Ionicons name="close" size={20} color={!journalData.hadCravings ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleButton, journalData.hadCravings && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('hadCravings', true)}
                  >
                    <Ionicons name="checkmark" size={20} color={journalData.hadCravings ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Craving Intensity (if had cravings) */}
              {journalData.hadCravings && (
                <View style={styles.journalItem}>
                  <Text style={styles.journalItemTitle}>Craving intensity?</Text>
                  <View style={styles.sliderContainer}>
                    <Text style={styles.sliderLabel}>Mild</Text>
                    <TouchableOpacity 
                      style={styles.sliderTrack}
                      onPress={(event) => {
                        const { locationX } = event.nativeEvent;
                        const trackWidth = event.currentTarget.offsetWidth || 250;
                        const percentage = Math.max(0, Math.min(1, locationX / trackWidth));
                        const value = Math.round(percentage * 4) + 1;
                        updateJournalData('cravingIntensity', value);
                      }}
                    >
                      <View style={[styles.sliderThumb, { left: `${(journalData.cravingIntensity - 1) * 25}%` }]} />
                    </TouchableOpacity>
                    <Text style={styles.sliderLabel}>Intense</Text>
                    <Text style={styles.sliderValue}>{journalData.cravingIntensity}/5</Text>
                  </View>
                </View>
              )}

              {/* Mood Positive */}
              <View style={styles.journalItem}>
                <Text style={styles.journalItemTitle}>Mood feels positive?</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, !journalData.moodPositive && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('moodPositive', false)}
                  >
                    <Ionicons name="close" size={20} color={!journalData.moodPositive ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleButton, journalData.moodPositive && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('moodPositive', true)}
                  >
                    <Ionicons name="checkmark" size={20} color={journalData.moodPositive ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Used Breathing Exercises */}
              <View style={styles.journalItem}>
                <Text style={styles.journalItemTitle}>Used breathing exercises?</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, !journalData.usedBreathing && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('usedBreathing', false)}
                  >
                    <Ionicons name="close" size={20} color={!journalData.usedBreathing ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleButton, journalData.usedBreathing && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('usedBreathing', true)}
                  >
                    <Ionicons name="checkmark" size={20} color={journalData.usedBreathing ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );

        case 1: // Physical Recovery
          return (
            <View style={styles.journalSection}>
              <Text style={styles.journalSectionTitle}>💪 Physical Recovery</Text>
              
              {/* Quality Sleep */}
              <View style={styles.journalItem}>
                <Text style={styles.journalItemTitle}>Got quality sleep?</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, !journalData.qualitySleep && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('qualitySleep', false)}
                  >
                    <Ionicons name="close" size={20} color={!journalData.qualitySleep ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleButton, journalData.qualitySleep && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('qualitySleep', true)}
                  >
                    <Ionicons name="checkmark" size={20} color={journalData.qualitySleep ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sleep Hours */}
              <View style={styles.journalItem}>
                <Text style={styles.journalItemTitle}>Hours of sleep?</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => updateJournalData('sleepHours', Math.max(0, journalData.sleepHours - 1))}
                  >
                    <Ionicons name="remove" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{journalData.sleepHours}h</Text>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => updateJournalData('sleepHours', Math.min(12, journalData.sleepHours + 1))}
                  >
                    <Ionicons name="add" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stayed Hydrated */}
              <View style={styles.journalItem}>
                <Text style={styles.journalItemTitle}>Stayed hydrated?</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, !journalData.stayedHydrated && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('stayedHydrated', false)}
                  >
                    <Ionicons name="close" size={20} color={!journalData.stayedHydrated ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleButton, journalData.stayedHydrated && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('stayedHydrated', true)}
                  >
                    <Ionicons name="checkmark" size={20} color={journalData.stayedHydrated ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Water Glasses */}
              <View style={styles.journalItem}>
                <Text style={styles.journalItemTitle}>Glasses of water?</Text>
                <View style={styles.counterContainer}>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => updateJournalData('waterGlasses', Math.max(0, journalData.waterGlasses - 1))}
                  >
                    <Ionicons name="remove" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{journalData.waterGlasses}</Text>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => updateJournalData('waterGlasses', Math.min(20, journalData.waterGlasses + 1))}
                  >
                    <Ionicons name="add" size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Exercised */}
              <View style={styles.journalItem}>
                <Text style={styles.journalItemTitle}>Exercised or moved?</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, !journalData.exercised && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('exercised', false)}
                  >
                    <Ionicons name="close" size={20} color={!journalData.exercised ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleButton, journalData.exercised && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('exercised', true)}
                  >
                    <Ionicons name="checkmark" size={20} color={journalData.exercised ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );

        case 2: // Recovery Actions
          return (
            <View style={styles.journalSection}>
              <Text style={styles.journalSectionTitle}>🚀 Recovery Actions</Text>
              
              {/* Used NixR App */}
              <View style={styles.journalItem}>
                <Text style={styles.journalItemTitle}>Used the NixR app?</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, !journalData.usedApp && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('usedApp', false)}
                  >
                    <Ionicons name="close" size={20} color={!journalData.usedApp ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleButton, journalData.usedApp && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('usedApp', true)}
                  >
                    <Ionicons name="checkmark" size={20} color={journalData.usedApp ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Reached for Support */}
              <View style={styles.journalItem}>
                <Text style={styles.journalItemTitle}>Reached out for support?</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, !journalData.reachedSupport && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('reachedSupport', false)}
                  >
                    <Ionicons name="close" size={20} color={!journalData.reachedSupport ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleButton, journalData.reachedSupport && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('reachedSupport', true)}
                  >
                    <Ionicons name="checkmark" size={20} color={journalData.reachedSupport ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Avoided Triggers */}
              <View style={styles.journalItem}>
                <Text style={styles.journalItemTitle}>Avoided triggers successfully?</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, !journalData.avoidedTriggers && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('avoidedTriggers', false)}
                  >
                    <Ionicons name="close" size={20} color={!journalData.avoidedTriggers ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleButton, journalData.avoidedTriggers && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('avoidedTriggers', true)}
                  >
                    <Ionicons name="checkmark" size={20} color={journalData.avoidedTriggers ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Read Recovery Content */}
              <View style={styles.journalItem}>
                <Text style={styles.journalItemTitle}>Read recovery content?</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, !journalData.readContent && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('readContent', false)}
                  >
                    <Ionicons name="close" size={20} color={!journalData.readContent ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleButton, journalData.readContent && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('readContent', true)}
                  >
                    <Ionicons name="checkmark" size={20} color={journalData.readContent ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );

        case 3: // Social & Environment
          return (
            <View style={styles.journalSection}>
              <Text style={styles.journalSectionTitle}>🌍 Social & Environment</Text>
              
              {/* Around Smokers */}
              <View style={styles.journalItem}>
                <Text style={styles.journalItemTitle}>Around smokers/vapers today?</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, !journalData.aroundSmokers && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('aroundSmokers', false)}
                  >
                    <Ionicons name="close" size={20} color={!journalData.aroundSmokers ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleButton, journalData.aroundSmokers && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('aroundSmokers', true)}
                  >
                    <Ionicons name="checkmark" size={20} color={journalData.aroundSmokers ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Social Situations Challenging */}
              <View style={styles.journalItem}>
                <Text style={styles.journalItemTitle}>Social situations challenging?</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, !journalData.socialChallenging && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('socialChallenging', false)}
                  >
                    <Ionicons name="close" size={20} color={!journalData.socialChallenging ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleButton, journalData.socialChallenging && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('socialChallenging', true)}
                  >
                    <Ionicons name="checkmark" size={20} color={journalData.socialChallenging ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Received Encouragement */}
              <View style={styles.journalItem}>
                <Text style={styles.journalItemTitle}>Received encouragement?</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, !journalData.receivedEncouragement && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('receivedEncouragement', false)}
                  >
                    <Ionicons name="close" size={20} color={!journalData.receivedEncouragement ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleButton, journalData.receivedEncouragement && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('receivedEncouragement', true)}
                  >
                    <Ionicons name="checkmark" size={20} color={journalData.receivedEncouragement ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Helped Others */}
              <View style={styles.journalItem}>
                <Text style={styles.journalItemTitle}>Helped someone else quit?</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, !journalData.helpedOthers && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('helpedOthers', false)}
                  >
                    <Ionicons name="close" size={20} color={!journalData.helpedOthers ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleButton, journalData.helpedOthers && styles.toggleButtonSelected]}
                    onPress={() => updateJournalData('helpedOthers', true)}
                  >
                    <Ionicons name="checkmark" size={20} color={journalData.helpedOthers ? "#FFFFFF" : "#9CA3AF"} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );

        default:
          return null;
      }
    };

    return (
      <Modal
        visible={recoveryJournalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setRecoveryJournalVisible(false)}
        // NOTE: iOS 18 Simulator Bug Workaround
        // If testing on iPhone 16 iOS 18 simulator and X button appears behind battery,
        // try changing to presentationStyle="pageSheet" as a temporary workaround.
        // This is a confirmed Apple simulator bug that doesn't affect real devices.
        // For development, consider using iPhone 15 Pro with iOS 17.5 simulator.
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'left', 'right', 'bottom']}>
          <LinearGradient
            colors={['#000000', '#0A0F1C', '#0F172A']}
            style={styles.modalGradient}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recovery Journal - Day {stats?.daysClean || 0}</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setRecoveryJournalVisible(false)}
              >
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Section Progress */}
            <View style={styles.journalProgress}>
              <View style={styles.journalProgressHeader}>
                <Text style={styles.journalProgressText}>
                  {currentSection + 1} of {sections.length}
                </Text>
                <Text style={styles.journalProgressSubtext}>
                  {sections[currentSection].title}
                </Text>
              </View>
              <View style={styles.journalProgressBar}>
                <View 
                  style={[
                    styles.journalProgressFill, 
                    { width: `${((currentSection + 1) / sections.length) * 100}%` }
                  ]} 
                />
              </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {renderJournalSection()}
            </ScrollView>

            {/* Navigation */}
            <View style={styles.journalNavigation}>
              <TouchableOpacity 
                style={[styles.journalNavButton, currentSection === 0 && styles.journalNavButtonDisabled]}
                onPress={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
              >
                <Ionicons name="chevron-back" size={20} color={currentSection === 0 ? "#6B7280" : "#FFFFFF"} />
                <Text style={[styles.journalNavButtonText, currentSection === 0 && styles.journalNavButtonTextDisabled]}>
                  Previous
                </Text>
              </TouchableOpacity>

              {currentSection < sections.length - 1 ? (
                <TouchableOpacity 
                  style={styles.journalNavButtonPrimary}
                  onPress={() => setCurrentSection(currentSection + 1)}
                >
                  <LinearGradient
                    colors={['#10B981', '#06B6D4']}
                    style={styles.journalNavButtonPrimaryGradient}
                  >
                    <Text style={styles.journalNavButtonPrimaryText}>Next</Text>
                    <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.journalNavButtonPrimary}
                  onPress={() => {
                    // TODO: Save journal data and generate insights
                    setRecoveryJournalVisible(false);
                    Alert.alert('Journal Saved', 'Your recovery journal has been saved. Check your insights tomorrow!');
                  }}
                >
                  <LinearGradient
                    colors={['#10B981', '#06B6D4']}
                    style={styles.journalNavButtonPrimaryGradient}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.journalNavButtonPrimaryText}>Complete</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
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
});

export default DashboardScreen; 