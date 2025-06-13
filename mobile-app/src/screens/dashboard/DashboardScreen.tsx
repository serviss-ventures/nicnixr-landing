import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DashboardStackParamList } from '../../types';
import { RootState, AppDispatch } from '../../store/store';
import { updateProgress, selectProgressStats, setQuitDate, updateStats, resetProgress, loadStoredProgress, updateUserProfile } from '../../store/slices/progressSlice';
import { updateUserData } from '../../store/slices/authSlice';
import { loadPlanFromStorageAsync } from '../../store/slices/planSlice';
import { COLORS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DailyTipModal from '../../components/common/DailyTipModal';
import { hasViewedTodaysTip } from '../../services/dailyTipService';
import RecoveryJournal from '../../components/dashboard/RecoveryJournal';
import MoneySavedModal from '../../components/dashboard/MoneySavedModal';
import HealthInfoModal from '../../components/dashboard/HealthInfoModal';
import ResetProgressModal from '../../components/dashboard/ResetProgressModal';
import AvoidedCalculatorModal from '../../components/dashboard/AvoidedCalculatorModal';
import TimeSavedModal from '../../components/dashboard/TimeSavedModal';
import NotificationBell from '../../components/common/NotificationBell';
import NotificationCenter from '../../components/common/NotificationCenter';
import { loadNotifications } from '../../store/slices/notificationSlice';
import NotificationService from '../../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatCost } from '../../utils/costCalculations';
import { formatUnitsDisplay } from '../../services/productService';
import StormyRecoveryVisualizer from '../../components/dashboard/StormyRecoveryVisualizer';
import { differenceInDays, differenceInHours, format } from 'date-fns';
// import TestVisualizer from '../../components/dashboard/TestVisualizer';

// Import debug utilities in development
if (__DEV__) {
  import('../../debug/progressTest');
  import('../../debug/appReset');
}

// Safety check for COLORS to prevent LinearGradient errors
const safeColors = {
  primary: COLORS?.primary || '#8B5CF6',
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
  const { isLoading: progressLoading } = useSelector((state: RootState) => state.progress);
  const progressLastUpdated = useSelector((state: RootState) => state.progress.lastUpdated);
  const { activePlan } = useSelector((state: RootState) => state.plan);
  const { notifications: allNotifications } = useSelector((state: RootState) => state.notifications);
  const { notifications: notificationSettings } = useSelector((state: RootState) => state.settings);
  
  // Check if quit date is in the future
  const quitDate = user?.quitDate ? new Date(user.quitDate) : null;
  const now = new Date();
  const isFutureQuitDate = quitDate && quitDate > now;
  const daysUntilQuit = isFutureQuitDate ? differenceInDays(quitDate, now) : 0;
  const hoursUntilQuit = isFutureQuitDate ? differenceInHours(quitDate, now) % 24 : 0;
  
  // Format the quit date for display
  const quitDateFormatted = quitDate ? format(quitDate, 'EEEE, MMM d') : '';
  
  // Calculate filtered unread count based on settings
  const unreadCount = allNotifications.filter(notification => {
    if (notification.read) return false;
    
    switch (notification.type) {
      case 'buddy-request':
      case 'buddy-message':
      case 'mention':
        return notificationSettings.communityActivity;
      case 'milestone':
        return notificationSettings.healthMilestones;
      default:
        return true;
    }
  }).length;

  const [healthInfoVisible, setHealthInfoVisible] = useState(false);
  const [dailyTipVisible, setDailyTipVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [recoveryJournalVisible, setRecoveryJournalVisible] = useState(false);
  const [moneySavedModalVisible, setMoneySavedModalVisible] = useState(false);
  const [avoidedCalculatorVisible, setAvoidedCalculatorVisible] = useState(false);
  const [timeSavedModalVisible, setTimeSavedModalVisible] = useState(false);
  const [customDailyCost, setCustomDailyCost] = useState((user?.dailyCost || 14) as number);
  
  // Load and save custom daily cost
  useEffect(() => {
    AsyncStorage.getItem('@custom_daily_cost').then(savedCost => {
      if (savedCost) {
        setCustomDailyCost(parseFloat(savedCost));
      }
    });
  }, []);
  
  // Force re-render when progress is updated
  useEffect(() => {
    // This will trigger a re-render whenever lastUpdated changes
    if (progressLastUpdated) {
      // Progress update tracked silently
    }
  }, [progressLastUpdated]);
  
  const updateCustomDailyCost = async (cost: number) => {
    setCustomDailyCost(cost);
    await AsyncStorage.setItem('@custom_daily_cost', cost.toString());
    
    // Update auth slice (user data)
    dispatch(updateUserData({
      dailyCost: cost
    }));
    
    // Immediately update progress slice with new cost
    const category = user?.nicotineProduct?.category || 'cigarettes';
    const validCategory = ['pouches', 'cigarettes', 'vape', 'chewing'].includes(category) 
      ? category as 'pouches' | 'cigarettes' | 'vape' | 'chewing'
      : 'pouches';
    
    dispatch(updateUserProfile({
      dailyCost: cost,
      category: validCategory
    }));
  };
  const [savingsGoal, setSavingsGoal] = useState('');
  const [savingsGoalAmount, setSavingsGoalAmount] = useState(500);
  const [editingGoal, setEditingGoal] = useState(false);
  const [tipViewed, setTipViewed] = useState(true); // Default to true to avoid flash
  const [notificationCenterVisible, setNotificationCenterVisible] = useState(false);
  const [savingsGoalLoaded, setSavingsGoalLoaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Load savings goal from storage
  useEffect(() => {
    const loadSavingsGoal = async () => {
      try {
        const [savedGoal, savedAmount] = await Promise.all([
          AsyncStorage.getItem('@savings_goal'),
          AsyncStorage.getItem('@savings_goal_amount')
        ]);
        
        if (savedGoal !== null) {
          setSavingsGoal(savedGoal);
        }
        if (savedAmount !== null) {
          setSavingsGoalAmount(parseInt(savedAmount) || 500);
        }
        setSavingsGoalLoaded(true);
      } catch (error) {
        console.error('Error loading savings goal:', error);
        setSavingsGoalLoaded(true);
      }
    };
    
    loadSavingsGoal();
  }, []);
  
  // Save savings goal when it changes (only after initial load)
  useEffect(() => {
    if (!savingsGoalLoaded) return;
    
    const saveSavingsGoal = async () => {
      try {
        if (savingsGoal) {
          await Promise.all([
            AsyncStorage.setItem('@savings_goal', savingsGoal),
            AsyncStorage.setItem('@savings_goal_amount', savingsGoalAmount.toString())
          ]);
        } else {
          // Clear if no goal
          await Promise.all([
            AsyncStorage.removeItem('@savings_goal'),
            AsyncStorage.removeItem('@savings_goal_amount')
          ]);
        }
      } catch (error) {
        console.error('Error saving savings goal:', error);
      }
    };
    
    saveSavingsGoal();
  }, [savingsGoal, savingsGoalAmount, savingsGoalLoaded]);
  
  // Check if today's tip has been viewed
  useEffect(() => {
    // Check on mount and when returning to the dashboard
    const checkTipStatus = async () => {
      const viewed = await hasViewedTodaysTip();
      setTipViewed(viewed);
    };
    
    checkTipStatus();
    
    // Check again when app comes to foreground (for new day)
    const interval = setInterval(checkTipStatus, 60000); // Check every minute for new day
    
    return () => clearInterval(interval);
  }, []); // Only run on mount
  
  const navigation = useNavigation<StackNavigationProp<DashboardStackParamList>>();


  
  // Use centralized calculation
  const avoidedDisplay = stats?.unitsAvoided 
    ? { 
        value: formatUnitsDisplay(stats.unitsAvoided, user).split(' ')[0], 
        unit: formatUnitsDisplay(stats.unitsAvoided, user).split(' ').slice(1).join(' ') 
      }
    : { value: 0, unit: 'units' };

  // Reset Progress Functions
  const handleResetProgress = () => {
    setResetModalVisible(true);
  };

  const handleRecoveryJournal = useCallback(() => setRecoveryJournalVisible(true), []);

  const confirmReset = async (resetType: 'relapse' | 'fresh_start' | 'correction', newQuitDate: Date) => {
    try {
      // Validate that the date is not in the future
      if (newQuitDate > new Date()) {
        Alert.alert('Invalid Date', 'You cannot select a future date.');
        return;
      }
      
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
              if (resetType === 'relapse') {
                // Relapse: Keep money saved and other cumulative stats, just reset the streak
                // Use custom daily cost for real-time calculation if stats haven't loaded yet
  const currentMoneySaved = stats?.moneySaved || (stats?.daysClean ? stats.daysClean * customDailyCost : 0);
                const currentUnitsAvoided = stats?.unitsAvoided || 0;
                const currentLifeRegained = stats?.lifeRegained || 0;
                
                // For relapse, we need to handle it differently
                // We'll update the quit date and then manually preserve the cumulative stats
                dispatch(setQuitDate(newQuitDate.toISOString()));
                await dispatch(updateProgress());
                
                // After updating, restore the cumulative stats
                dispatch(updateStats({
                  moneySaved: currentMoneySaved,
                  unitsAvoided: currentUnitsAvoided,
                  lifeRegained: currentLifeRegained,
                }));
              } else if (resetType === 'fresh_start') {
                // Fresh start: Reset everything to zero
                dispatch(resetProgress());
                dispatch(setQuitDate(newQuitDate.toISOString()));
                await dispatch(updateProgress());
              } else {
                // Date correction: Just update the date and recalculate
                dispatch(setQuitDate(newQuitDate.toISOString()));
                await dispatch(updateProgress());
              }
              
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
    } catch {
      Alert.alert('Error', 'Failed to update progress. Please try again.');
    }
  };

  // Progress updates are handled by Redux, no need for local state management

  // Initialize all data in a single effect to prevent race conditions
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load stored progress first
        await dispatch(loadStoredProgress());
        
        // Then update progress if we have a quit date
        if (user?.quitDate) {
          await dispatch(updateProgress());
        }
        
        // Load other data
        await Promise.all([
          dispatch(loadPlanFromStorageAsync()),
          dispatch(loadNotifications())
        ]);
      } catch (error) {
        console.error('Error initializing dashboard data:', error);
      }
    };
    
    initializeData();
    
    // Fade in header animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [dispatch, user?.quitDate]);
  
  // Run migrations if needed
  useEffect(() => {
    const runMigration = async () => {
      // Run vape migration
      const { runVapeMigration } = await import('../../utils/vapeMigration');
      await runVapeMigration();
      
      // Run vape pods fix migration
      const { runVapePodsFixMigration } = await import('../../utils/vapePodsFixMigration');
      await runVapePodsFixMigration();
      
      // Run pouches fix migration
      const { runPouchesFixMigration } = await import('../../utils/pouchesFixMigration');
      await runPouchesFixMigration();
      
      const { migrateChewDipToDaily, isChewDipMigrationComplete } = await import('../../utils/chewDipMigration');
      
      // Run normal migration if needed
      const migrationComplete = await isChewDipMigrationComplete();
      if (!migrationComplete && user?.nicotineProduct) {
        const migrated = await migrateChewDipToDaily();
        if (migrated) {
          // Reload progress with new data
          dispatch(updateProgress());
        }
      }
    };
    runMigration();
  }, [dispatch, user?.quitDate, user?.nicotineProduct, user?.dailyCost]);

  // Create demo notifications for testing (remove in production)
  useEffect(() => {
    // Only create demo notifications once
    AsyncStorage.getItem('@demo_notifications_created').then(demoCreated => {
      if (!demoCreated) {
        NotificationService.createDemoNotifications(dispatch);
        AsyncStorage.setItem('@demo_notifications_created', 'true');
      }
    });
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header with Notification Bell */}
          <View style={styles.dashboardHeader}>
            <Animated.View style={[styles.headerLeft, { opacity: fadeAnim }]}>
              <Text style={styles.welcomeSubtext}>Welcome back</Text>
              <Text style={styles.welcomeText}>{user?.displayName || 'NixR'}</Text>
            </Animated.View>
            <NotificationBell 
              unreadCount={unreadCount}
              onPress={() => setNotificationCenterVisible(true)}
            />
          </View>
          
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.content} 
            showsVerticalScrollIndicator={false}
          >
            {/* Stormy Recovery Visualizer */}
            <View style={styles.visualizerContainer}>
              {isFutureQuitDate ? (
                // Future quit date countdown
                <View style={styles.countdownContainer}>
                  <View style={styles.countdownCircle}>
                    <Text style={styles.countdownNumber}>{daysUntilQuit}</Text>
                    <Text style={styles.countdownLabel}>
                      {daysUntilQuit === 1 ? 'day' : 'days'} until
                    </Text>
                    <Text style={styles.countdownSubLabel}>freedom</Text>
                  </View>
                  <Text style={styles.countdownDate}>Starting {quitDateFormatted}</Text>
                  {daysUntilQuit === 0 && hoursUntilQuit > 0 && (
                    <Text style={styles.countdownHours}>
                      {hoursUntilQuit} {hoursUntilQuit === 1 ? 'hour' : 'hours'} to go
                    </Text>
                  )}
                </View>
              ) : (
                // Regular recovery visualizer
                <StormyRecoveryVisualizer recoveryDays={stats?.daysClean || 0} />
              )}
            </View>

            {/* Metrics Grid */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isFutureQuitDate ? 'Preparing for Recovery' : 'Your Progress'}
              </Text>
            </View>
            <View style={styles.metricsGrid}>
              <View style={styles.metricRow}>
                <TouchableOpacity 
                  style={styles.metricCard}
                  onPress={() => setHealthInfoVisible(true)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.03)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.metricCardGradient}
                  >
                    <View style={styles.metricContent}>
                      <View style={styles.metricIconWrapper}>
                        <Ionicons name="heart-outline" size={16} color={COLORS.textSecondary} />
                      </View>
                      <View style={styles.metricTextContent}>
                        <Text style={styles.metricTitle}>RECOVERY</Text>
                        <View style={styles.metricValueRow}>
                          <Text style={styles.metricValue} numberOfLines={1}>
                            {isFutureQuitDate ? 0 : Math.round(stats?.healthScore || 0)}
                          </Text>
                          <Text style={styles.metricUnit}>%</Text>
                        </View>
                        <View style={[styles.metricBar, { marginTop: 8, marginBottom: 2 }]}>
                          <View
                            style={[
                              styles.metricBarFill, 
                              { 
                                width: isFutureQuitDate ? '0%' : `${stats?.healthScore || 0}%`,
                                backgroundColor: 'rgba(255, 255, 255, 0.3)'
                              }
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.metricCard}
                  onPress={() => setTimeSavedModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.03)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.metricCardGradient}
                  >
                    <View style={styles.metricContent}>
                      <View style={styles.metricIconWrapper}>
                        <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                      </View>
                      <View style={styles.metricTextContent}>
                        <Text style={styles.metricTitle}>TIME</Text>
                        <View style={styles.metricValueRow}>
                          <Text style={styles.metricValue} numberOfLines={1}>
                            {isFutureQuitDate ? 0 : Math.round(stats?.lifeRegained || 0)}
                          </Text>
                          <Text style={styles.metricUnit}>h</Text>
                        </View>
                        <Text style={styles.metricSubtext}>
                          {isFutureQuitDate ? 'to save' : 'saved'}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.metricRow}>
                <TouchableOpacity 
                  style={styles.metricCard}
                  onPress={() => setMoneySavedModalVisible(true)}
                  activeOpacity={0.7}
                >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.03)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.metricCardGradient}
                >
                  <View style={styles.metricContent}>
                                        <View style={styles.metricIconWrapper}>
                        <Ionicons name="cash-outline" size={16} color={COLORS.textSecondary} />
                      </View>
                    <View style={styles.metricTextContent}>
                                                                  <Text style={styles.metricTitle}>MONEY</Text>
                        <View style={styles.metricValueRow}>
                          <Text style={styles.metricValue} numberOfLines={1}>
                            {isFutureQuitDate 
                              ? '$0'
                              : progressLoading && !stats?.moneySaved
                              ? '--'
                              : formatCost(stats?.moneySaved || 0)
                            }
                          </Text>
                        </View>
                        <Text style={styles.metricSubtext}>
                          {isFutureQuitDate ? 'to save' : 'saved'}
                        </Text>
                    </View>
                  </View>
                </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.metricCard}
                  onPress={() => setAvoidedCalculatorVisible(true)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.03)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.metricCardGradient}
                  >
                    <View style={styles.metricContent}>
                      <View style={styles.metricIconWrapper}>
                        <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.textSecondary} />
                      </View>
                      <View style={styles.metricTextContent}>
                        <Text style={styles.metricTitle}>AVOIDED</Text>
                        <View style={styles.metricValueRow}>
                          <Text style={styles.metricValue} numberOfLines={1}>
                            {isFutureQuitDate ? 0 : avoidedDisplay.value}
                          </Text>
                        </View>
                        <Text style={styles.metricSubtext}>
                          {isFutureQuitDate ? 'will avoid' : avoidedDisplay.unit}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Subtle Section Separator */}
            <View style={styles.sectionSeparator}>
              <View style={styles.separatorDot} />
              <View style={styles.separatorDot} />
              <View style={styles.separatorDot} />
            </View>

            {/* --- Tools Section --- */}
            <View style={styles.toolsSection}>
              {/* Section Header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.toolsTitle}>Quick Actions</Text>
                <Text style={styles.toolsSubtitle}>Your recovery toolkit</Text>
              </View>
              
              {/* AI Coach - Prominent Card */}
              <TouchableOpacity
                style={styles.aiCoachCard}
                onPress={() => navigation.navigate('AICoach')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.03)']}
                  style={styles.aiCoachGradient}
                >
                  <View style={styles.aiCoachIconContainer}>
                    <Ionicons name="sparkles-outline" size={22} color={COLORS.textSecondary} />
                  </View>
                  <View style={styles.aiCoachTextContainer}>
                    <Text style={styles.aiCoachTitle}>AI Recovery Coach</Text>
                    <Text style={styles.aiCoachSubtitle}>Your 24/7 personal support</Text>
                  </View>
                  <Ionicons name="chevron-forward-outline" size={20} color={COLORS.textMuted} />
                </LinearGradient>
              </TouchableOpacity>

              {/* Secondary Tools Row */}
              <View style={styles.secondaryToolsRow}>
                {/* Recovery Journal */}
                <TouchableOpacity
                  style={styles.secondaryToolCard}
                  onPress={handleRecoveryJournal}
                  activeOpacity={0.8}
                >
                  <View style={styles.secondaryToolContent}>
                    <View style={styles.secondaryToolIconContainer}>
                      <Ionicons name="create-outline" size={20} color={COLORS.textSecondary} />
                    </View>
                    <View>
                      <Text style={styles.secondaryToolTitle}>Journal</Text>
                      <Text style={styles.secondaryToolSubtitle}>Reflect</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Daily Tip */}
                <TouchableOpacity
                  style={styles.secondaryToolCard}
                  onPress={() => setDailyTipVisible(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.secondaryToolContent}>
                    <View style={styles.secondaryToolIconContainer}>
                      <Ionicons name="bulb-outline" size={20} color={COLORS.textSecondary} />
                      {!tipViewed && <View style={styles.tipBadge} />}
                    </View>
                    <View>
                      <Text style={styles.secondaryToolTitle}>Daily Tip</Text>
                      <Text style={styles.secondaryToolSubtitle}>Motivation</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Manage Progress Section */}
            <View style={styles.manageProgressSection}>
              <TouchableOpacity
                style={styles.manageProgressButton}
                onPress={handleResetProgress}
                activeOpacity={0.7}
              >
                <View style={styles.manageProgressContent}>
                  <Ionicons name="settings-outline" size={18} color={COLORS.textMuted} />
                  <Text style={styles.manageProgressText}>Manage Progress</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* --- MODALS --- */}
      {/* Health Info Modal */}
      <HealthInfoModal 
        visible={healthInfoVisible}
        onClose={() => setHealthInfoVisible(false)}
        healthScore={stats?.healthScore || 0}
        productType={user?.nicotineProduct?.category || 'cigarettes'}
      />
      {/* Recovery Journal Modal */}
      <RecoveryJournal 
        visible={recoveryJournalVisible}
        onClose={() => setRecoveryJournalVisible(false)}
        daysClean={stats.daysClean}
      />
      {/* Reset Progress Modal */}
      <ResetProgressModal 
        visible={resetModalVisible}
        onClose={() => setResetModalVisible(false)}
        onConfirm={confirmReset}
      />
      {/* Daily Tip Modal */}
      <DailyTipModal 
        visible={dailyTipVisible} 
        onClose={() => {
          setDailyTipVisible(false);
          setTipViewed(true);
        }} 
      />
      {/* Money Saved Modal */}
      <MoneySavedModal 
        visible={moneySavedModalVisible}
        onClose={() => setMoneySavedModalVisible(false)}
        stats={stats}
        userProfile={user || {}}
        customDailyCost={customDailyCost}
        onUpdateCost={updateCustomDailyCost}
        savingsGoal={savingsGoal}
        savingsGoalAmount={savingsGoalAmount}
        editingGoal={editingGoal}
        setSavingsGoal={setSavingsGoal}
        setSavingsGoalAmount={setSavingsGoalAmount}
        setEditingGoal={setEditingGoal}
      />
      {/* Avoided Calculator Modal */}
      <AvoidedCalculatorModal 
        visible={avoidedCalculatorVisible}
        onClose={() => setAvoidedCalculatorVisible(false)}
        stats={stats}
        userProfile={user || {}}
      />
      {/* Time Saved Modal */}
      <TimeSavedModal 
        visible={timeSavedModalVisible}
        onClose={() => setTimeSavedModalVisible(false)}
        stats={stats}
        userProfile={user || {}}
      />
      {/* Notification Center */}
      <NotificationCenter 
        visible={notificationCenterVisible}
        onClose={() => setNotificationCenterVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0F1C',
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  visualizerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  countdownContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  countdownCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  countdownNumber: {
    fontSize: 72,
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -2,
  },
  countdownLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginTop: -SPACING.xs,
  },
  countdownSubLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  countdownDate: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  countdownHours: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  metricsGrid: {
    marginBottom: SPACING.md,
  },
  metricRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  metricCard: {
    flex: 1,
    height: 120,
    borderRadius: 18,
    overflow: 'hidden',
  },
  metricCardGradient: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metricIconWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    padding: 6,
    marginRight: 10,
    alignSelf: 'flex-start',
  },
  metricTextContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: -1,
    lineHeight: 32,
  },
  metricUnit: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 3,
    marginBottom: 2,
  },
  metricSubtext: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 0,
  },
  metricBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 2,
    marginTop: SPACING.sm,
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  tapIndicator: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    opacity: 0.3,
  },
  sectionSeparator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  separatorDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  toolsSection: {
    marginTop: 0,
    gap: SPACING.sm,
  },
  aiCoachCard: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  aiCoachGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'transparent',
  },
  aiCoachIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  aiCoachTextContainer: {
    flex: 1,
  },
  aiCoachTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
  },
  aiCoachSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '400',
  },
  secondaryToolsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  secondaryToolCard: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  secondaryToolContent: {
    padding: SPACING.md,
    justifyContent: 'space-between',
    height: 110,
  },
  secondaryToolIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
  },
  secondaryToolTitle: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.text,
  },
  secondaryToolSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '400',
  },
  tipBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1.5,
    borderColor: '#0A0F1C',
  },
  toolsTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  toolsSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  manageProgressSection: {
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  manageProgressButton: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  manageProgressContent: {
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageProgressText: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
});

export default DashboardScreen; 