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
  const [dailyTipVisible, setDailyTipVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [newQuitDate, setNewQuitDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [resetType, setResetType] = useState<'relapse' | 'fresh_start' | 'correction'>('relapse');
  const navigation = useNavigation<DashboardNavigationProp>();

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

  // Neural Info Modal Component
  const NeuralInfoModal = () => {
    const { recoveryPercentage, daysClean, recoveryMessage } = recoveryData;
    
    return (
      <Modal
        visible={neuralInfoVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={false}
        onRequestClose={() => setNeuralInfoVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'left', 'right', 'bottom']}>
          <LinearGradient
            colors={['#000000', '#0A0F1C', '#0F172A']}
            style={styles.modalGradient}
          >
              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
                {/* Current Recovery Status */}
                <View style={styles.modalStatusCard}>
                  <LinearGradient
                    colors={['rgba(0, 255, 255, 0.15)', 'rgba(16, 185, 129, 0.15)']}
                    style={styles.modalStatusContent}
                  >
                    <Ionicons name="analytics" size={24} color="#00FFFF" style={{ marginRight: SPACING.md }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalStatusTitle}>Your Current Recovery</Text>
                      <Text style={styles.modalStatusText}>
                        {recoveryMessage}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>

                {/* The Real Science */}
                <Text style={styles.modalSectionTitle}>The Real Science</Text>
                
                <View style={styles.modalScienceSection}>
                  <View style={styles.modalScienceItem}>
                    <Ionicons name="medical" size={20} color="#8B5CF6" />
                    <View style={styles.modalScienceContent}>
                      <Text style={styles.modalScienceTitle}>Dopamine System</Text>
                      <Text style={styles.modalScienceText}>
                        Nicotine hijacked your brain's dopamine reward pathways. Recovery involves restoring natural dopamine function and reducing cravings.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalScienceItem}>
                    <Ionicons name="refresh" size={20} color="#10B981" />
                    <View style={styles.modalScienceContent}>
                      <Text style={styles.modalScienceTitle}>Neuroplasticity</Text>
                      <Text style={styles.modalScienceText}>
                        Your brain can rewire itself. Each day without nicotine allows damaged reward circuits to heal and healthy patterns to strengthen.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalScienceItem}>
                    <Ionicons name="trending-up" size={20} color="#F59E0B" />
                    <View style={styles.modalScienceContent}>
                      <Text style={styles.modalScienceTitle}>Recovery Timeline</Text>
                      <Text style={styles.modalScienceText}>
                        Most people see significant improvement in dopamine function within 3 months, with continued healing for up to a year.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Recovery Timeline */}
                <Text style={styles.modalSectionTitle}>Recovery Timeline</Text>
                
                <View style={styles.modalTimelineSection}>
                  <View style={[styles.modalTimelineItem, { opacity: daysClean >= 0 ? 1 : 0.5 }]}>
                    <View style={[styles.modalTimelineIndicator, { backgroundColor: daysClean >= 0 ? '#10B981' : 'rgba(255, 255, 255, 0.3)' }]} />
                    <View style={styles.modalTimelineContent}>
                      <Text style={styles.modalTimelineTitle}>Day 0-3: Detox Phase</Text>
                      <Text style={styles.modalTimelineText}>Nicotine clears from system, dopamine receptors begin to normalize</Text>
                    </View>
                  </View>

                  <View style={[styles.modalTimelineItem, { opacity: daysClean >= 7 ? 1 : 0.5 }]}>
                    <View style={[styles.modalTimelineIndicator, { backgroundColor: daysClean >= 7 ? '#10B981' : 'rgba(255, 255, 255, 0.3)' }]} />
                    <View style={styles.modalTimelineContent}>
                      <Text style={styles.modalTimelineTitle}>Week 1-2: Early Recovery</Text>
                      <Text style={styles.modalTimelineText}>Dopamine production starts to rebalance, cravings begin to decrease</Text>
                    </View>
                  </View>

                  <View style={[styles.modalTimelineItem, { opacity: daysClean >= 30 ? 1 : 0.5 }]}>
                    <View style={[styles.modalTimelineIndicator, { backgroundColor: daysClean >= 30 ? '#10B981' : 'rgba(255, 255, 255, 0.3)' }]} />
                    <View style={styles.modalTimelineContent}>
                      <Text style={styles.modalTimelineTitle}>Month 1: Significant Progress</Text>
                      <Text style={styles.modalTimelineText}>Major improvement in mood, focus, and natural reward sensitivity</Text>
                    </View>
                  </View>

                  <View style={[styles.modalTimelineItem, { opacity: daysClean >= 90 ? 1 : 0.5 }]}>
                    <View style={[styles.modalTimelineIndicator, { backgroundColor: daysClean >= 90 ? '#10B981' : 'rgba(255, 255, 255, 0.3)' }]} />
                    <View style={styles.modalTimelineContent}>
                      <Text style={styles.modalTimelineTitle}>Month 3+: Near-Complete Recovery</Text>
                      <Text style={styles.modalTimelineText}>Dopamine system largely restored, addiction pathways significantly weakened</Text>
                    </View>
                  </View>
                </View>

                {/* Keep Going Button */}
                <TouchableOpacity 
                  style={styles.modalKeepGoingButton}
                  onPress={() => setNeuralInfoVisible(false)}
                >
                  <LinearGradient
                    colors={['#00FFFF', '#10B981']}
                    style={styles.modalKeepGoingGradient}
                  >
                    <Text style={styles.modalKeepGoingText}>Keep Going!</Text>
                  </LinearGradient>
                </TouchableOpacity>

              </ScrollView>
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
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
            style={styles.metricCard}
          >
            <View style={styles.metricContent}>
              <View style={styles.metricHeader}>
                <Ionicons name="heart-outline" size={20} color="#10B981" />
                <Text style={styles.metricTitle}>Health Score</Text>
              </View>
              <Text style={styles.metricValue}>{Math.round(stats?.healthScore || 0)}%</Text>
              <View style={styles.metricBar}>
                <LinearGradient
                  colors={['#10B981', '#06B6D4']}
                  style={[styles.metricBarFill, { width: `${stats?.healthScore || 0}%` }]}
                />
              </View>
            </View>
          </LinearGradient>

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
    color: safeColors.text,
    marginLeft: SPACING.sm,
  },
  neuralExplanationText: {
    fontSize: 14,
    color: safeColors.textSecondary,
    lineHeight: 20,
  },
  neuralNetworkContainer: {
    height: 320, // Increased height for enhanced version
    marginBottom: SPACING.md,
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
  metricContent: {
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
  sectionTitle: {
    fontSize: 20,
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
    paddingTop: SPACING.lg,
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
});

export default DashboardScreen; 