import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated, Pressable } from 'react-native';
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
import * as Haptics from 'expo-haptics';
import { formatCost } from '../../utils/costCalculations';
import { formatUnitsDisplay } from '../../services/productService';
import { differenceInDays, differenceInHours, format } from 'date-fns';
import { useAchievements } from '../../hooks/useAchievements';
import { useAppSelector } from '../../hooks/useAppSelector';
import { selectUser } from '../../store/slices/authSlice';
import StormyRecoveryVisualizer from '../../components/dashboard/StormyRecoveryVisualizer';

// Import debug utilities in development
if (__DEV__) {
  import('../../debug/progressTest');
  import('../../debug/appReset');
}

// Import test function for debugging
import { testSupabaseConnection } from '../../components/SupabaseTest';

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

// Animated metric card component
const AnimatedMetricCard: React.FC<{
  onPress: () => void;
  animationValue: Animated.Value;
  index: number;
  children: React.ReactNode;
  style?: any;
}> = ({ onPress, animationValue, index, children, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 10,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 10,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: animationValue,
          transform: [
            { scale: scaleAnim },
            {
              translateY: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ flex: 1 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
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
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const nameSlideAnim = useRef(new Animated.Value(30)).current;
  const metricAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const separatorAnim = useRef(new Animated.Value(0)).current;
  const toolsSlideAnim = useRef(new Animated.Value(50)).current;
  const tipBadgePulse = useRef(new Animated.Value(1)).current;
  
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
      
      // Start pulse animation if tip not viewed
      if (!viewed) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(tipBadgePulse, {
              toValue: 1.2,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(tipBadgePulse, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      } else {
        tipBadgePulse.setValue(1);
      }
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
    
    // Orchestrated entrance animations
    Animated.sequence([
      // Header fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(nameSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]),
      // Staggered metric cards
      Animated.stagger(80, metricAnimations.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 10,
          tension: 50,
          useNativeDriver: true,
        })
      )),
      // Separator dots
      Animated.timing(separatorAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Tools section
      Animated.spring(toolsSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [dispatch, user?.quitDate]);
  
  // Test Supabase connection in development
  useEffect(() => {
    if (__DEV__) {
      // Run a connection test on mount in development
      testSupabaseConnection();
    }
  }, []);

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

  // Create demo notifications only in development
  useEffect(() => {
    if (__DEV__) {
      // Only create demo notifications once in dev mode
      AsyncStorage.getItem('@demo_notifications_created').then(demoCreated => {
        if (!demoCreated) {
          NotificationService.createDemoNotifications(dispatch);
          AsyncStorage.setItem('@demo_notifications_created', 'true');
        }
      });
    }
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header with Notification Bell */}
          <View style={styles.dashboardHeader}>
            <Animated.View style={[
              styles.headerLeft, 
              { 
                opacity: fadeAnim,
                transform: [{ translateY: nameSlideAnim }]
              }
            ]}>
              <Text style={styles.welcomeSubtext}>Welcome back</Text>
              <Text style={styles.welcomeText}>{user?.displayName || 'NixR'}</Text>
            </Animated.View>
            <Animated.View style={{ opacity: fadeAnim }}>
              <NotificationBell 
                unreadCount={unreadCount}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setNotificationCenterVisible(true);
                }}
              />
            </Animated.View>
          </View>
          
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.content} 
            showsVerticalScrollIndicator={false}
          >
            {/* 
              Recovery Visualizer 
              NOTE: StormyRecoveryVisualizer is temporarily disabled on web due to a Skia/WebGL 
              rendering issue. It can be re-enabled once the web implementation is fixed.
            */}
            <View style={styles.visualizerContainer}>
              {/* <StormyRecoveryVisualizer daysClean={stats.days_clean} /> */}
              <View style={styles.daysCleanContainer}>
                <Text style={styles.daysCleanText}>{stats.days_clean}</Text>
                <Text style={styles.daysCleanLabel}>Days Clean</Text>
              </View>
            </View>

            {/* Metrics Grid */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isFutureQuitDate ? 'Preparing for Recovery' : 'Your Progress'}
              </Text>
            </View>
            <View style={styles.metricsGrid}>
              <View style={styles.metricRow}>
                <AnimatedMetricCard
                  style={styles.metricCard}
                  onPress={() => setHealthInfoVisible(true)}
                  animationValue={metricAnimations[0]}
                  index={0}
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
                          <Animated.Text style={[styles.metricValue, {
                            opacity: metricAnimations[0].interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [0, 0, 1],
                            }),
                          }]} numberOfLines={1}>
                            {isFutureQuitDate ? 0 : Math.round(stats?.healthScore || 0)}
                          </Animated.Text>
                          <Text style={styles.metricUnit}>%</Text>
                        </View>
                        <View style={[styles.metricBar, { marginTop: 8, marginBottom: 2 }]}>
                          <Animated.View
                            style={[
                              styles.metricBarFill, 
                              { 
                                width: isFutureQuitDate ? '0%' : `${stats?.healthScore || 0}%`,
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                opacity: metricAnimations[0],
                              }
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </AnimatedMetricCard>

                <AnimatedMetricCard
                  style={styles.metricCard}
                  onPress={() => setTimeSavedModalVisible(true)}
                  animationValue={metricAnimations[1]}
                  index={1}
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
                          <Animated.Text style={[styles.metricValue, {
                            opacity: metricAnimations[1].interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [0, 0, 1],
                            }),
                          }]} numberOfLines={1}>
                            {isFutureQuitDate ? 0 : Math.round(stats?.lifeRegained || 0)}
                          </Animated.Text>
                          <Text style={styles.metricUnit}>h</Text>
                        </View>
                        <Text style={styles.metricSubtext}>
                          {isFutureQuitDate ? 'to save' : 'saved'}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </AnimatedMetricCard>
              </View>

              <View style={styles.metricRow}>
                <AnimatedMetricCard
                  style={styles.metricCard}
                  onPress={() => setMoneySavedModalVisible(true)}
                  animationValue={metricAnimations[2]}
                  index={2}
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
                          <Animated.Text style={[styles.metricValue, {
                            opacity: metricAnimations[2].interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [0, 0, 1],
                            }),
                          }]} numberOfLines={1}>
                            {isFutureQuitDate 
                              ? '$0'
                              : progressLoading && !stats?.moneySaved
                              ? '--'
                              : formatCost(stats?.moneySaved || 0)
                            }
                          </Animated.Text>
                        </View>
                        <Text style={styles.metricSubtext}>
                          {isFutureQuitDate ? 'to save' : 'saved'}
                        </Text>
                    </View>
                  </View>
                </LinearGradient>
                </AnimatedMetricCard>

                <AnimatedMetricCard
                  style={styles.metricCard}
                  onPress={() => setAvoidedCalculatorVisible(true)}
                  animationValue={metricAnimations[3]}
                  index={3}
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
                          <Animated.Text style={[styles.metricValue, {
                            opacity: metricAnimations[3].interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [0, 0, 1],
                            }),
                          }]} numberOfLines={1}>
                            {isFutureQuitDate ? 0 : avoidedDisplay.value}
                          </Animated.Text>
                        </View>
                        <Text style={styles.metricSubtext}>
                          {isFutureQuitDate ? 'will avoid' : avoidedDisplay.unit}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </AnimatedMetricCard>
              </View>
            </View>

            {/* Subtle Section Separator */}
            <Animated.View style={[styles.sectionSeparator, { opacity: separatorAnim }]}>
              <Animated.View style={[
                styles.separatorDot,
                {
                  opacity: separatorAnim,
                  transform: [{
                    scale: separatorAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  }],
                }
              ]} />
              <Animated.View style={[
                styles.separatorDot,
                {
                  opacity: separatorAnim,
                  transform: [{
                    scale: separatorAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 0, 1],
                    }),
                  }],
                }
              ]} />
              <Animated.View style={[
                styles.separatorDot,
                {
                  opacity: separatorAnim,
                  transform: [{
                    scale: separatorAnim.interpolate({
                      inputRange: [0, 0.8, 1],
                      outputRange: [0, 0, 1],
                    }),
                  }],
                }
              ]} />
            </Animated.View>

            {/* --- Tools Section --- */}
            <Animated.View style={[
              styles.toolsSection,
              {
                opacity: toolsSlideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [1, 0],
                }),
                transform: [{ translateY: toolsSlideAnim }],
              }
            ]}>
              {/* Section Header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.toolsTitle}>Quick Actions</Text>
                <Text style={styles.toolsSubtitle}>Your recovery toolkit</Text>
              </View>
              
              {/* AI Coach - Prominent Card */}
              <Pressable
                style={({ pressed }) => [
                  styles.aiCoachCard,
                  { transform: [{ scale: pressed ? 0.97 : 1 }] }
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('AICoach');
                }}
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
              </Pressable>

              {/* Secondary Tools Row */}
              <View style={styles.secondaryToolsRow}>
                {/* Recovery Journal */}
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryToolCard,
                    { transform: [{ scale: pressed ? 0.96 : 1 }] }
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    handleRecoveryJournal();
                  }}
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
                </Pressable>

                {/* Daily Tip */}
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryToolCard,
                    { transform: [{ scale: pressed ? 0.96 : 1 }] }
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDailyTipVisible(true);
                  }}
                >
                  <View style={styles.secondaryToolContent}>
                    <View style={styles.secondaryToolIconContainer}>
                      <Ionicons name="bulb-outline" size={20} color={COLORS.textSecondary} />
                      {!tipViewed && (
                        <Animated.View style={[
                          styles.tipBadge,
                          {
                            transform: [{
                              scale: tipBadgePulse,
                            }],
                          }
                        ]} />
                      )}
                    </View>
                    <View>
                      <Text style={styles.secondaryToolTitle}>Daily Tip</Text>
                      <Text style={styles.secondaryToolSubtitle}>Motivation</Text>
                    </View>
                  </View>
                </Pressable>
              </View>
            </Animated.View>

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
        onNavigateToInsights={() => {
          setRecoveryJournalVisible(false);
          setTimeout(() => {
            navigation.navigate('Insights');
          }, 300);
        }}
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
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -0.8,
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
  daysCleanContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  daysCleanText: {
    fontSize: 72,
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -2,
  },
  daysCleanLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginTop: -SPACING.xs,
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
    height: 115,
    borderRadius: 20,
    overflow: 'hidden',
  },
  metricCardGradient: {
    flex: 1,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -1.5,
    lineHeight: 36,
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
    borderRadius: 20,
    overflow: 'hidden',
  },
  aiCoachGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md + 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B5CF6',
    borderWidth: 2,
    borderColor: '#000000',
    // Subtle shadow for visibility
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
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