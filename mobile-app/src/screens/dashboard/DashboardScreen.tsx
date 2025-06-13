import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
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
            <View style={styles.headerLeft}>
              <Text style={styles.welcomeText}>Welcome back, {user?.displayName || 'NixR'}</Text>
            </View>
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
              <StormyRecoveryVisualizer recoveryDays={stats?.daysClean || 0} />
            </View>

            {/* Metrics Grid */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Progress</Text>
            </View>
            <View style={styles.metricsGrid}>
              <View style={styles.metricRow}>
                <TouchableOpacity 
                  style={styles.metricCard}
                  onPress={() => setHealthInfoVisible(true)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.metricCardGradient}
                  >
                    <View style={styles.metricContent}>
                      <View style={styles.metricIconWrapper}>
                        <Ionicons name="heart" size={18} color="#10B981" />
                      </View>
                      <View style={styles.metricTextContent}>
                        <Text style={styles.metricTitle}>RECOVERY</Text>
                        <View style={styles.metricValueRow}>
                          <Text style={styles.metricValue} numberOfLines={1}>{Math.round(stats?.healthScore || 0)}</Text>
                          <Text style={styles.metricUnit}>%</Text>
                        </View>
                        <View style={[styles.metricBar, { marginTop: 8, marginBottom: 2 }]}>
                          <LinearGradient
                            colors={['#10B981', '#10B981']}
                            style={[styles.metricBarFill, { width: `${stats?.healthScore || 0}%` }]}
                          />
                        </View>
                      </View>
                      <View style={styles.tapIndicator}>
                        <Ionicons name="expand" size={12} color="rgba(255,255,255,0.3)" />
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
                    colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.metricCardGradient}
                  >
                    <View style={styles.metricContent}>
                      <View style={styles.metricIconWrapper}>
                        <Ionicons name="time" size={18} color="#A78BFA" />
                      </View>
                      <View style={styles.metricTextContent}>
                        <Text style={styles.metricTitle}>TIME</Text>
                        <View style={styles.metricValueRow}>
                          <Text style={styles.metricValue} numberOfLines={1}>{Math.round(stats?.lifeRegained || 0)}</Text>
                          <Text style={styles.metricUnit}>h</Text>
                        </View>
                        <Text style={styles.metricSubtext}>saved</Text>
                      </View>
                      <View style={styles.tapIndicator}>
                        <Ionicons name="expand" size={12} color="rgba(255,255,255,0.3)" />
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
                  colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.metricCardGradient}
                >
                  <View style={styles.metricContent}>
                                        <View style={styles.metricIconWrapper}>
                        <Ionicons name="cash" size={18} color="#DB2777" />
                      </View>
                    <View style={styles.metricTextContent}>
                                                                  <Text style={styles.metricTitle}>MONEY</Text>
                        <View style={styles.metricValueRow}>
                          <Text style={styles.metricValue} numberOfLines={1}>
                            {progressLoading && !stats?.moneySaved
                              ? '--'
                              : formatCost(stats?.moneySaved || 0)
                            }
                          </Text>
                        </View>
                        <Text style={styles.metricSubtext}>saved</Text>
                    </View>
                    <View style={styles.tapIndicator}>
                      <Ionicons name="expand" size={12} color="rgba(255,255,255,0.3)" />
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
                    colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.metricCardGradient}
                  >
                    <View style={styles.metricContent}>
                      <View style={styles.metricIconWrapper}>
                        <Ionicons name="shield-checkmark" size={18} color="#EC4899" />
                      </View>
                      <View style={styles.metricTextContent}>
                        <Text style={styles.metricTitle}>AVOIDED</Text>
                        <View style={styles.metricValueRow}>
                          <Text style={styles.metricValue} numberOfLines={1}>{avoidedDisplay.value}</Text>
                        </View>
                        <Text style={styles.metricSubtext}>{avoidedDisplay.unit}</Text>
                      </View>
                      <View style={styles.tapIndicator}>
                        <Ionicons name="expand" size={12} color="rgba(255,255,255,0.3)" />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* --- Tools Section --- */}
            <View style={styles.toolsSection}>
              {/* AI Coach - Prominent Card */}
              <TouchableOpacity
                style={styles.aiCoachCard}
                onPress={() => navigation.navigate('AICoach')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.08)', 'rgba(99, 102, 241, 0.05)']}
                  style={styles.aiCoachGradient}
                >
                  <View style={styles.aiCoachIconContainer}>
                    <Ionicons name="sparkles-outline" size={28} color="#A78BFA" />
                  </View>
                  <View style={styles.aiCoachTextContainer}>
                    <Text style={styles.aiCoachTitle}>AI Recovery Coach</Text>
                    <Text style={styles.aiCoachSubtitle}>Your 24/7 personal support</Text>
                  </View>
                  <Ionicons name="chevron-forward-outline" size={24} color={COLORS.textSecondary} />
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
                      <Ionicons name="create-outline" size={24} color="#A78BFA" />
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
                      <Ionicons name="bulb-outline" size={24} color="#F472B6" />
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
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* --- MODALS --- */}
      {/* Health Info Modal */}
      <HealthInfoModal 
        visible={healthInfoVisible}
        onClose={() => setHealthInfoVisible(false)}
        healthScore={stats?.healthScore || 0}
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
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
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
    marginBottom: SPACING.xl + SPACING.lg,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  metricsGrid: {
    marginBottom: SPACING.xl,
  },
  metricRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  metricCard: {
    flex: 1,
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
  },
  metricCardGradient: {
    flex: 1,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  metricIconWrapper: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 8,
    marginBottom: SPACING.md,
  },
  metricTextContent: {
    flex: 1,
    justifyContent: 'center',
  },
  metricTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: -1,
    lineHeight: 36,
  },
  metricUnit: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.4)',
    marginLeft: 4,
    marginBottom: 2,
  },
  metricSubtext: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
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
    top: SPACING.md,
    right: SPACING.md,
    opacity: 0.3,
  },
  toolsSection: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  aiCoachCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  aiCoachGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    backgroundColor: 'transparent',
  },
  aiCoachIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  aiCoachTextContainer: {
    flex: 1,
  },
  aiCoachTitle: {
    fontSize: 16,
    fontWeight: '500',
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
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  secondaryToolContent: {
    padding: SPACING.md,
    justifyContent: 'space-between',
    height: 140,
  },
  secondaryToolIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
  },
  secondaryToolTitle: {
    fontSize: 15,
    fontWeight: '500',
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
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EC4899',
    borderWidth: 2,
    borderColor: '#0A0F1C',
  },
});

export default DashboardScreen; 