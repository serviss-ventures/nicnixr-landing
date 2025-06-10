import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../../store/store';
import { updateProgress, selectProgressStats, setQuitDate, updateStats, resetProgress } from '../../store/slices/progressSlice';
import { loadPlanFromStorageAsync } from '../../store/slices/planSlice';
import { COLORS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import EnhancedNeuralNetwork from '../../components/common/EnhancedNeuralNetwork';
import recoveryTrackingService from '../../services/recoveryTrackingService';
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

// Import debug utilities in development
if (__DEV__) {
  import('../../debug/neuralGrowthTest');
  import('../../debug/appReset');
}



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
  
  const updateCustomDailyCost = async (cost: number) => {
    setCustomDailyCost(cost);
    await AsyncStorage.setItem('@custom_daily_cost', cost.toString());
  };
  const [savingsGoal, setSavingsGoal] = useState('');
  const [savingsGoalAmount, setSavingsGoalAmount] = useState(500);
  const [editingGoal, setEditingGoal] = useState(false);
  const [tipViewed, setTipViewed] = useState(true); // Default to true to avoid flash
  const [notificationCenterVisible, setNotificationCenterVisible] = useState(false);
  
  // Load savings goal from storage
  useEffect(() => {
    const loadSavingsGoal = async () => {
      try {
        const savedGoal = await AsyncStorage.getItem('@savings_goal');
        const savedAmount = await AsyncStorage.getItem('@savings_goal_amount');
        
        if (savedGoal) {
          setSavingsGoal(savedGoal);
        }
        if (savedAmount) {
          setSavingsGoalAmount(parseInt(savedAmount) || 500);
        }
      } catch (error) {
        console.error('Error loading savings goal:', error);
      }
    };
    
    loadSavingsGoal();
  }, []);
  
  // Save savings goal when it changes
  useEffect(() => {
    const saveSavingsGoal = async () => {
      try {
        if (savingsGoal) {
          await AsyncStorage.setItem('@savings_goal', savingsGoal);
          await AsyncStorage.setItem('@savings_goal_amount', savingsGoalAmount.toString());
        } else {
          // Clear if no goal
          await AsyncStorage.removeItem('@savings_goal');
          await AsyncStorage.removeItem('@savings_goal_amount');
        }
      } catch (error) {
        console.error('Error saving savings goal:', error);
      }
    };
    
    saveSavingsGoal();
  }, [savingsGoal, savingsGoalAmount]);
  
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
  
  const navigation = useNavigation();

  // Get unified recovery data from tracking service
  const getRecoveryData = () => {
    try {
      const data = recoveryTrackingService.getRecoveryData();
      
      // Log for debugging in development - commented out to reduce console noise
      // if (__DEV__) {
      //   recoveryTrackingService.logRecoveryData('Dashboard');
      // }
      
      return {
        recoveryPercentage: data.recoveryPercentage || 0,
        isStarting: data.daysClean === 0,
        daysClean: data.daysClean || 0,
        recoveryMessage: data.recoveryMessage || "Starting recovery",
        growthMessage: data.growthMessage || "Your brain is healing",
        personalizedUnitName: data.personalizedUnitName || "units avoided",
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
        growthMessage: "Your brain is healing",
        personalizedUnitName: "units avoided",
      };
    }
  };

  // Get current recovery data
  const recoveryData = getRecoveryData();
  
  // Calculate proper avoided display value
  const getAvoidedDisplay = () => {
    const unitsAvoided = stats?.unitsAvoided || 0;
    const userProfile = user?.nicotineProduct;
    
    if (!userProfile) return { value: unitsAvoided, unit: 'units' };
    
    // Get category from user profile
    const category = userProfile.category || 'other';
    const productId = userProfile.id || '';
    
    // Debug log in development - commented out to reduce console noise
    // if (__DEV__) {

    // }
    
    // Check for pouches first (they're saved as 'other' category with 'zyn' id)
    if (category === 'other' && productId === 'zyn') {
      const tins = unitsAvoided / 15;
      if (tins >= 1) {
        const roundedTins = Math.round(tins);
        return { value: roundedTins, unit: roundedTins === 1 ? 'tin' : 'tins' };
      } else {
        return { value: Math.round(unitsAvoided), unit: Math.round(unitsAvoided) === 1 ? 'pouch' : 'pouches' };
      }
    }
    
    switch (category.toLowerCase()) {
      case 'cigarettes':
      case 'cigarette':
        const packs = unitsAvoided / 20;
        if (packs >= 1) {
          const roundedPacks = Math.round(packs);
          return { value: roundedPacks, unit: roundedPacks === 1 ? 'pack' : 'packs' };
        } else {
          return { value: Math.round(unitsAvoided), unit: Math.round(unitsAvoided) === 1 ? 'cigarette' : 'cigarettes' };
        }
      
      case 'pouches':
      case 'nicotine_pouches':
      case 'pouch':
        const tins = unitsAvoided / 15;
        if (tins >= 1) {
          const roundedTins = Math.round(tins);
          return { value: roundedTins, unit: roundedTins === 1 ? 'tin' : 'tins' };
        } else {
          return { value: Math.round(unitsAvoided), unit: Math.round(unitsAvoided) === 1 ? 'pouch' : 'pouches' };
        }
      
      case 'chewing':
      case 'chew':
      case 'dip':
      case 'chew_dip':
      case 'dip_chew':
      case 'smokeless':
        // For dip/chew, unitsAvoided is based on daily portions
        // But onboarding collects tins per WEEK
        const tinsAvoided = unitsAvoided / 5; // 5 portions per tin
        const roundedTins = Math.round(tinsAvoided); // Round to whole number
        if (roundedTins === 1) {
          return { value: roundedTins, unit: 'tin' };
        } else {
          return { value: roundedTins, unit: 'tins' };
        }
        
      case 'vape':
      case 'vaping':
      case 'e-cigarette':
        const roundedPods = Math.round(unitsAvoided);
        return { value: roundedPods, unit: roundedPods === 1 ? 'pod' : 'pods' };
        
      default:
        const roundedUnits = Math.round(unitsAvoided);
        return { value: roundedUnits, unit: roundedUnits === 1 ? 'unit' : 'units' };
    }
  };
  
  const avoidedDisplay = getAvoidedDisplay();

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
                const currentMoneySaved = stats?.moneySaved || 0;
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

  useEffect(() => {
    // Initialize progress tracking
    if (user?.quitDate) {
      dispatch(updateProgress());
    }

    // Load active plan from storage
    dispatch(loadPlanFromStorageAsync());

    // Load notifications
    dispatch(loadNotifications());



    // Create demo notifications for testing (remove in production)
    if (__DEV__ && user) {
      // Only create demo notifications once
      AsyncStorage.getItem('@demo_notifications_created').then(demoCreated => {
        if (!demoCreated) {
          NotificationService.createDemoNotifications();
          AsyncStorage.setItem('@demo_notifications_created', 'true');
        }
      });
    }

    // Set up progress update interval
    const progressInterval = setInterval(() => {
      if (user?.quitDate) {
        dispatch(updateProgress());
      }
    }, 60000); // Update every minute

    return () => {
      clearInterval(progressInterval);
    };
  }, [dispatch, user?.quitDate]);

  // Neural Network Visualization - Enhanced Version
  const NeuralNetworkVisualization = () => {
    const { recoveryPercentage, daysClean } = recoveryData;

    return (
      <View style={styles.enhancedNeuralContainer}>
        <EnhancedNeuralNetwork
          daysClean={daysClean}
          recoveryPercentage={recoveryPercentage}
          centerText={(daysClean || 0).toString()}
          centerSubtext={daysClean === 1 ? "Day Free" : "Days Free"}
          size={200}
          showStats={true}
        />
        
        {/* Enhanced stats overlay */}
        <View style={styles.enhancedStatsOverlay}>
          {(stats?.daysClean || 0) < 3 && (
            <Text style={styles.hoursCleanText}>
              {stats?.hoursClean || 0} hours clean
            </Text>
          )}
        </View>
      </View>
    );
  };



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
            {/* Neural Recovery Explanation */}
            <View style={styles.neuralExplanation}>
              <View style={styles.neuralExplanationHeader}>
                <Ionicons name="pulse-outline" size={20} color={COLORS.primary} />
                <Text style={styles.neuralExplanationTitle}>Your Brain Recovery Map</Text>
              </View>
              <Text style={styles.neuralExplanationText}>
                Neural pathways rebuilding • Growing stronger{'\n'}
                Watch your mind reclaim its freedom
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
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.1)']}
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
                          colors={['#10B981', '#06B6D4']}
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
                  colors={['rgba(6, 182, 212, 0.15)', 'rgba(16, 185, 129, 0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.metricCardGradient}
                >
                  <View style={styles.metricContent}>
                    <View style={styles.metricIconWrapper}>
                      <Ionicons name="time" size={18} color="#06B6D4" />
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

              <TouchableOpacity 
                style={styles.metricCard}
                onPress={() => setMoneySavedModalVisible(true)}
                activeOpacity={0.7}
              >
              <LinearGradient
                colors={['rgba(245, 158, 11, 0.15)', 'rgba(16, 185, 129, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.metricCardGradient}
              >
                <View style={styles.metricContent}>
                                      <View style={styles.metricIconWrapper}>
                      <Ionicons name="cash" size={18} color="#F59E0B" />
                    </View>
                  <View style={styles.metricTextContent}>
                                                                <Text style={styles.metricTitle}>MONEY</Text>
                      <View style={styles.metricValueRow}>
                        <Text style={[styles.metricValue, { fontSize: 18 }]} numberOfLines={1}>
                          {stats?.moneySaved >= 10000 
                            ? `$${Math.round(stats.moneySaved / 1000)}k`
                            : stats?.moneySaved >= 1000
                            ? `$${(stats.moneySaved / 1000).toFixed(1)}k`
                            : `$${Math.round(stats?.moneySaved || 0)}`
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
                  colors={['rgba(99, 102, 241, 0.15)', 'rgba(16, 185, 129, 0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.metricCardGradient}
                >
                  <View style={styles.metricContent}>
                    <View style={styles.metricIconWrapper}>
                      <Ionicons name="shield-checkmark" size={18} color="#6366F1" />
                    </View>
                    <View style={styles.metricTextContent}>
                      <Text style={styles.metricTitle}>AVOIDED</Text>
                      <View style={styles.metricValueRow}>
                        <Text style={styles.metricValue} numberOfLines={1}>{avoidedDisplay.value}</Text>
                        <Text style={[styles.metricUnit, { opacity: 0 }]}>_</Text>
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

            {/* Today's Recovery Tools */}
            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Today&apos;s Recovery Tools</Text>

              {/* Recovery Journal - Primary CTA */}
              <TouchableOpacity 
                style={styles.primaryAction} 
                onPress={handleRecoveryJournal}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.1)']}
                  style={styles.primaryActionGradient}
                >
                  <View style={styles.primaryActionIcon}>
                    <Ionicons name="create" size={28} color="#10B981" />
                  </View>
                  <View style={styles.primaryActionContent}>
                    <Text style={styles.primaryActionTitle}>Recovery Journal</Text>
                    <Text style={styles.primaryActionSubtitle}>
                      2 min • Reflect on your journey
                    </Text>
                  </View>
                  <View style={styles.primaryActionChevron}>
                    <Ionicons name="chevron-forward" size={24} color="#10B981" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* My Plan Section - Show active plan or prompt to start */}
              {activePlan ? (
                <TouchableOpacity 
                  style={styles.activePlanCard}
                  onPress={() => {
                    (navigation.navigate as (screen: string, params?: object) => void)('RecoveryPlans', { mode: 'manage' });
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.15)', 'rgba(99, 102, 241, 0.1)']}
                    style={styles.activePlanGradient}
                  >
                    <View style={styles.activePlanHeader}>
                      <View style={styles.activePlanIcon}>
                        <Ionicons name="flag" size={24} color="#8B5CF6" />
                      </View>
                      <View style={styles.activePlanContent}>
                        <Text style={styles.activePlanLabel}>MY ACTIVE PLAN</Text>
                        <Text style={styles.activePlanTitle}>{activePlan.title}</Text>
                        <Text style={styles.activePlanProgress}>
                          Week {activePlan.weekNumber} • {activePlan.completedGoals.length}/{activePlan.goals.length} goals
                        </Text>
                      </View>
                      <View style={styles.activePlanStats}>
                        <Text style={styles.activePlanPercentage}>{activePlan.progress}%</Text>
                        <Text style={styles.activePlanPercentageLabel}>Complete</Text>
                      </View>
                    </View>
                    <View style={styles.activePlanProgressBar}>
                      <View style={[styles.activePlanProgressFill, { width: `${activePlan.progress}%` }]} />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.startPlanCard}
                  onPress={() => navigation.navigate('RecoveryPlans' as never)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(55, 65, 81, 0.4)', 'rgba(75, 85, 99, 0.3)']}
                    style={styles.startPlanGradient}
                  >
                    <View style={styles.startPlanIcon}>
                      <Ionicons name="map-outline" size={24} color="#9CA3AF" />
                    </View>
                    <View style={styles.startPlanContent}>
                      <Text style={styles.startPlanTitle}>Start Your Recovery Plan</Text>
                      <Text style={styles.startPlanSubtitle}>
                        Choose a structured path to guide your journey
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Support Tools */}
              <View style={styles.supportToolsContainer}>
                {/* Recovery Coach */}
                <TouchableOpacity 
                  style={styles.supportTool}
                  onPress={() => navigation.navigate('AICoach' as never)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(245, 158, 11, 0.12)', 'rgba(251, 191, 36, 0.08)']}
                    style={styles.supportToolGradient}
                  >
                    <View style={styles.supportToolHeader}>
                      <View style={styles.supportToolIcon}>
                        <Ionicons name="sparkles" size={18} color="#F59E0B" />
                      </View>
                    </View>
                    <Text style={styles.supportToolTitle}>Recovery Coach</Text>
                    <Text style={styles.supportToolSubtitle}>Personal support 24/7</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Today's Tip */}
                <TouchableOpacity 
                  style={styles.supportTool}
                  onPress={() => setDailyTipVisible(true)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(59, 130, 246, 0.12)', 'rgba(99, 102, 241, 0.08)']}
                    style={styles.supportToolGradient}
                  >
                    <View style={styles.supportToolHeader}>
                      <View style={styles.supportToolIcon}>
                        <Ionicons name="bulb" size={18} color="#3B82F6" />
                      </View>
                      {!tipViewed && <View style={styles.tipBadge} />}
                    </View>
                    <Text style={styles.supportToolTitle}>Today&apos;s Tip</Text>
                    <Text style={styles.supportToolSubtitle}>Quick motivation</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Settings Link */}
              <TouchableOpacity 
                style={styles.settingsLink}
                onPress={handleResetProgress}
                activeOpacity={0.7}
              >
                <Ionicons name="settings-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.settingsLinkText}>Need to update your quit date?</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>



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
          setTipViewed(true); // Immediately hide the badge
        }} 
      />
      
      {/* Money Saved Modal */}
      <MoneySavedModal 
        visible={moneySavedModalVisible}
        onClose={() => setMoneySavedModalVisible(false)}
        stats={stats}
        userProfile={user?.nicotineProduct || {}}
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
        userProfile={user?.nicotineProduct || {}}
      />
      
      {/* Time Saved Modal */}
      <TimeSavedModal 
        visible={timeSavedModalVisible}
        onClose={() => setTimeSavedModalVisible(false)}
        stats={stats}
        userProfile={user?.nicotineProduct || {}}
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
    paddingTop: SPACING.sm, // Reduced top padding
    paddingBottom: SPACING.xl,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  neuralExplanation: {
    marginBottom: SPACING.sm, // Reduced spacing
    paddingHorizontal: SPACING.sm,
  },
  neuralExplanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  neuralExplanationTitle: {
    fontSize: 15, // Slightly smaller
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  neuralExplanationText: {
    fontSize: 12, // Smaller text
    color: COLORS.textSecondary,
    lineHeight: 18, // Tighter line height
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  neuralNetworkContainer: {
    height: 220, // Even smaller to make room
    marginBottom: SPACING.sm, // Minimal spacing
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
  metricsGrid: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
    gap: 6,
  },
  metricCard: {
    flex: 1,
    height: 120, // Increased to show all content without cutoff
    borderRadius: 16,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricCardGradient: {
    borderRadius: 16,
    padding: 1,
    height: '100%',
    overflow: 'hidden', // Keep gradient clipped
  },
  metricContent: {
    flexDirection: 'column',
    padding: 10,
    paddingBottom: 14, // More bottom padding
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    height: '100%',
    position: 'relative',
  },
  metricIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTextContent: {
    flex: 1,
    paddingTop: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 4,
  },
  metricTitle: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'nowrap',
    marginBottom: 3,
  },
  metricValue: {
    fontSize: 22, // Back to larger size
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  metricUnit: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  metricSubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    opacity: 0.7,
  },
  metricBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 1.5,
    marginTop: 4,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  tapIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    opacity: 0.25,
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
  // Top action row styles
  topActionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  topActionCard: {
    flex: 1,
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
  topActionGradient: {
    padding: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 120,
    justifyContent: 'space-between',
  },
  topActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  topActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  topActionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  topActionArrow: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Top tools row styles (Recovery Journal and Active Plan)
  topToolsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  topToolCard: {
    flex: 1,
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
  topToolGradient: {
    padding: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 120,
    justifyContent: 'space-between',
  },
  topToolIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  topToolTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  topToolSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },

  // Primary action styles (keeping for backwards compatibility)
  primaryAction: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  primaryActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  primaryActionContent: {
    flex: 1,
  },
  primaryActionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: -0.2,
  },
  primaryActionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontWeight: '500',
  },
  primaryActionChevron: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Active Plan styles
  activePlanCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  activePlanGradient: {
    padding: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  activePlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  activePlanIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  activePlanContent: {
    flex: 1,
  },
  activePlanLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B5CF6',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  activePlanTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  activePlanProgress: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activePlanStats: {
    alignItems: 'flex-end',
  },
  activePlanPercentage: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8B5CF6',
    letterSpacing: -0.5,
  },
  activePlanPercentageLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activePlanProgressBar: {
    height: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  activePlanProgressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },

  // Start Plan styles
  startPlanCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  startPlanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.3)',
  },
  startPlanIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  startPlanContent: {
    flex: 1,
  },
  startPlanTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  startPlanSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Support tools styles
  supportToolsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  supportTool: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  supportToolGradient: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: 150,
    justifyContent: 'space-between',
  },
  supportToolHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
    minHeight: 32,
    position: 'relative',
  },
  supportToolIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportToolBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 6,
  },
  supportToolBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  supportToolTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  supportToolSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    lineHeight: 16,
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
  },
  settingsLinkText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Bottom action row styles (keeping for backwards compatibility)
  bottomActionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  bottomActionCard: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomActionGradient: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    minHeight: 90,
  },
  bottomActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  bottomActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
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
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#0A0F1C',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 5,
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
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
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
    paddingRight: SPACING.sm,
  },
  calculationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 4,
    flexWrap: 'nowrap',
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
    minHeight: 140,
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
  estimatedCompletionContainer: {
    marginTop: 8,
    paddingHorizontal: 8,
  },
  estimatedCompletion: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
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