import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Linking,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, store } from '../../store/store';
import { logoutUser, updateUserData } from '../../store/slices/authSlice';
import { resetProgress, setQuitDate, updateProgress, setUserProfile, updateStats } from '../../store/slices/progressSlice';
import { resetOnboarding } from '../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from '../../components/common/Avatar';
import DicebearAvatar, { 
  STARTER_AVATARS, 
  PROGRESS_AVATARS, 
  PREMIUM_AVATARS, 
  getDaysUntilRotation,
  getAvatarBorderColor,
  getAvatarBorderColorLight
} from '../../components/common/DicebearAvatar';
import MinimalAchievementBadge from '../../components/common/MinimalAchievementBadge';
import { getBadgeForDaysClean } from '../../utils/badges';
import { AVATAR_BADGES, STORAGE_KEYS } from '../../constants/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { performanceCalculator } from '../../utils/performanceCalculator';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';
import NotificationService from '../../services/notificationService';
import { fetchConnectedBuddies } from '../../store/slices/buddySlice';
import { userProfileService } from '../../services/userProfileService';

interface SupportStyle {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  bgColor?: string;
}

const SUPPORT_STYLES: SupportStyle[] = [
  {
    id: 'motivator',
    name: 'Motivator',
    icon: 'rocket',
    description: 'Cheers others on with enthusiasm',
    color: 'rgba(251, 146, 60, 0.5)', // Soft orange
    bgColor: 'rgba(251, 146, 60, 0.06)',
  },
  {
    id: 'listener',
    name: 'Listener',
    icon: 'ear',
    description: 'Provides empathy and understanding',
    color: 'rgba(147, 197, 253, 0.5)', // Soft blue
    bgColor: 'rgba(147, 197, 253, 0.06)',
  },
  {
    id: 'straight_talker',
    name: 'Straight Talker',
    icon: 'barbell',
    description: 'Gives direct, honest feedback',
    color: 'rgba(239, 68, 68, 0.4)', // Soft red
    bgColor: 'rgba(239, 68, 68, 0.05)',
  },
  {
    id: 'analyst',
    name: 'Analyst',
    icon: 'analytics',
    description: 'Shares data-driven insights',
    color: 'rgba(192, 132, 252, 0.5)', // Soft purple
    bgColor: 'rgba(192, 132, 252, 0.06)',
  },
  {
    id: 'spiritual',
    name: 'Spiritual',
    icon: 'flower',
    description: 'Offers mindfulness and meditation',
    color: 'rgba(134, 239, 172, 0.5)', // Soft green
    bgColor: 'rgba(134, 239, 172, 0.06)',
  },
  {
    id: 'problem_solver',
    name: 'Problem Solver',
    icon: 'build',
    description: 'Focuses on actionable solutions',
    color: 'rgba(251, 191, 36, 0.5)', // Soft amber
    bgColor: 'rgba(251, 191, 36, 0.06)',
  },
  {
    id: 'comedian',
    name: 'Comedian',
    icon: 'happy',
    description: 'Uses humor to lighten the journey',
    color: 'rgba(244, 114, 182, 0.4)', // Soft pink
    bgColor: 'rgba(244, 114, 182, 0.05)',
  },
  {
    id: 'mentor',
    name: 'Mentor',
    icon: 'school',
    description: 'Guides with experience and wisdom',
    color: 'rgba(168, 162, 158, 0.6)', // Soft metallic
    bgColor: 'rgba(168, 162, 158, 0.06)',
  }
];

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.progress);
  const { stepData } = useSelector((state: RootState) => state.onboarding);
  
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarInfoModal, setShowAvatarInfoModal] = useState(false);
  
  // Initialize with the actual user avatar if available, otherwise use a loading state
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.selectedAvatar || null
  );
  const [avatarLoading, setAvatarLoading] = useState(!user?.selectedAvatar);
  
  const [selectedStyles, setSelectedStyles] = useState<string[]>(() => {
    // Debug: log current user supportStyles
    console.log('User supportStyles:', user?.supportStyles);
    // Ensure we only have valid styles and max 3
    const userStyles = user?.supportStyles || [];
    return userStyles.length > 0 ? userStyles.slice(0, 3) : ['motivator'];
  });
  const [displayName, setDisplayName] = useState(user?.displayName || user?.firstName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [connectedBuddiesCount, setConnectedBuddiesCount] = useState(0);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  
  // Add temporary state for editing
  const [tempDisplayName, setTempDisplayName] = useState('');
  const [tempBio, setTempBio] = useState('');
  const [tempSelectedStyles, setTempSelectedStyles] = useState<string[]>([]);
  
  // Add reasons to quit state
  const [selectedReasons, setSelectedReasons] = useState<string[]>(user?.reasonsToQuit || stepData?.reasonsToQuit || []);
  const [customReason, setCustomReason] = useState(user?.customReasonToQuit || stepData?.customReasonToQuit || '');
  
  // Purchase modal state
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPurchaseAvatar, setSelectedPurchaseAvatar] = useState<any>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  
  const daysClean = stats?.daysClean || 0;
  
  // Fetch connected buddies count
  useEffect(() => {
    const fetchBuddiesCount = async () => {
      if (user?.id) {
        const buddies = await BuddyService.getConnectedBuddies(user.id);
        setConnectedBuddiesCount(buddies.length);
      }
    };
    fetchBuddiesCount();
  }, [user?.id]);
  
  // Update selectedStyles when user data changes
  useEffect(() => {
    if (user?.supportStyles && Array.isArray(user.supportStyles)) {
      // Ensure we only set max 3 styles and filter out any invalid ones
      const validStyles = user.supportStyles.filter(style => 
        SUPPORT_STYLES.some(s => s.id === style)
      ).slice(0, 3);
      console.log('Setting selectedStyles from user data:', validStyles);
      setSelectedStyles(validStyles.length > 0 ? validStyles : ['motivator']);
    }
  }, [user?.supportStyles]);
  
  // Update displayName and bio when user data changes
  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
    if (user?.bio) {
      setBio(user.bio);
    }
  }, [user?.displayName, user?.bio]);
  
  // Update selectedAvatar when user data changes
  useEffect(() => {
    if (user?.selectedAvatar) {
      setSelectedAvatar(user.selectedAvatar);
      setAvatarLoading(false);
    }
  }, [user?.selectedAvatar]);
  
  // Load saved avatar on mount
  useEffect(() => {
    const loadSavedAvatar = async () => {
      try {
        // First check AsyncStorage
        const savedAvatar = await AsyncStorage.getItem('selected_avatar');
        if (savedAvatar) {
          const parsedAvatar = JSON.parse(savedAvatar);
          setSelectedAvatar(parsedAvatar);
          setAvatarLoading(false);
          // Sync with Redux if not already synced
          if (!user?.selectedAvatar || user.selectedAvatar.style !== parsedAvatar.style) {
            dispatch(updateUserData({ selectedAvatar: parsedAvatar }));
          }
        } else if (user?.selectedAvatar) {
          // If no saved avatar but user has one in Redux, save it to AsyncStorage
          await AsyncStorage.setItem('selected_avatar', JSON.stringify(user.selectedAvatar));
          setAvatarLoading(false);
        } else {
          // No avatar found anywhere, use default
          const defaultAvatar = { type: 'dicebear', name: 'Night Rider', style: 'hero' };
          setSelectedAvatar(defaultAvatar);
          setAvatarLoading(false);
        }
      } catch (error) {
        console.error('Error loading saved avatar:', error);
        // On error, use default avatar
        const defaultAvatar = { type: 'dicebear', name: 'Night Rider', style: 'hero' };
        setSelectedAvatar(defaultAvatar);
        setAvatarLoading(false);
      }
    };
    
    loadSavedAvatar();
  }, [dispatch]);
  


  
  // Calculate user stats
  const userStats = {
    daysClean: daysClean,
    moneySaved: stats?.moneySaved || 0,
    healthScore: stats?.healthScore || 0,
    buddiesHelped: connectedBuddiesCount, // Use actual connected buddies count
    currentStreak: daysClean,
    longestStreak: Math.max(daysClean, 14), // Mock data
  };
  
  // Handle avatar selection
  const handleAvatarSelect = async (styleKey: string, styleName: string) => {
    const newAvatar = { 
      type: 'dicebear', 
      name: styleName, 
      style: styleKey 
    };
    // Update local state immediately for UI responsiveness
    setSelectedAvatar(newAvatar);
    
    // Update AsyncStorage
    await AsyncStorage.setItem('selected_avatar', JSON.stringify(newAvatar));
    
    // Update Redux state if needed
    dispatch(updateUserData({ selectedAvatar: newAvatar }));
    
    setShowAvatarModal(false);
  };
  
  // Determine avatar rarity based on days clean
  const getAvatarRarity = () => {
    if (daysClean >= 365) return 'legendary';
    if (daysClean >= 90) return 'epic';
    if (daysClean >= 30) return 'rare';
    return 'common';
  };
  
  // Get appropriate badge
  const getBadge = () => {
    if (daysClean >= 100) return AVATAR_BADGES.streak100.emoji;
    if (daysClean >= 30) return AVATAR_BADGES.streak30.emoji;
    if (daysClean >= 7) return AVATAR_BADGES.streak7.emoji;
    return undefined;
  };

  const handleOpenEditModal = () => {
    // Initialize temp state with current values
    setTempDisplayName(displayName);
    setTempBio(bio);
    
    // Check if all styles are selected (which shouldn't happen)
    if (selectedStyles.length >= SUPPORT_STYLES.length) {
      console.warn('All support styles were selected, resetting to default');
      setTempSelectedStyles(['motivator']);
    } else {
      setTempSelectedStyles(selectedStyles);
    }
    
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    // Just close without saving
    setShowEditModal(false);
  };

  const handleSaveProfile = async () => {
    try {
      // Update the actual state from temp state
      setDisplayName(tempDisplayName.trim());
      setBio(tempBio.trim());
      setSelectedStyles(tempSelectedStyles);
      
      // Update Redux state
      dispatch(updateUserData({ 
        displayName: tempDisplayName.trim(),
        supportStyles: tempSelectedStyles,
        bio: tempBio.trim(),
        selectedAvatar: selectedAvatar // Add selected avatar to the update
      }));
      
      // Update AsyncStorage
      if (user) {
        const updatedUser = {
          ...user,
          displayName: tempDisplayName.trim(),
          supportStyles: tempSelectedStyles,
          bio: tempBio.trim(),
          selectedAvatar: selectedAvatar // Add selected avatar to storage
        };
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
        
        // Save to Supabase
        await userProfileService.updateProfile(user.id, {
          display_name: tempDisplayName.trim(),
          bio: tempBio.trim(),
          support_styles: tempSelectedStyles,
          avatar_config: selectedAvatar
        });
      }
      
      setShowEditModal(false);
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => dispatch(logoutUser()) }
      ]
    );
  };

  const handleAppReset = () => {
    Alert.alert(
      'Reset App',
      'This will clear all data and restart onboarding. The app will reload.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Import required modules
              const { resetAppState } = await import('../../utils/resetApp');
              const { persistor } = await import('../../store/store');
              const DevSettings = require('react-native').DevSettings;
              
              // Show loading alert
              Alert.alert('Resetting...', 'Please wait while we reset the app.');
              
              // 1. Clear all AsyncStorage data first (includes signing out from Supabase)
              await resetAppState();
              
              // 2. Clear Redux state
              dispatch(resetProgress());
              dispatch(resetOnboarding());
              dispatch(logoutUser());
              
              // 3. Purge Redux persist to ensure clean state
              await persistor.purge();
              await persistor.flush();
              
              // 4. Small delay to ensure all operations complete
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // 5. Reload the app - this is the most reliable way
              // In development, use DevSettings.reload()
              if (__DEV__ && DevSettings && DevSettings.reload) {
                DevSettings.reload();
              } else {
                // In production, we'll need to use a different approach
                // For now, show a message to manually restart
                Alert.alert(
                  'Reset Complete', 
                  'Please close and reopen the app to complete the reset.',
                  [{ text: 'OK' }]
                );
              }
              
              console.log('App reset completed successfully');
            } catch (error) {
              console.error('Reset failed:', error);
              Alert.alert('Reset Failed', 'Unable to reset app. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleProgressTest = () => {
    Alert.alert(
      'Progress Test - Choose Test Type',
      'Select what you want to test',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Set Recovery Time', 
          onPress: () => {
            Alert.prompt(
              'Set Recovery Time',
              'Enter number of days clean (e.g. 112, 444, 21)',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Set', 
                  onPress: async (inputDays) => {
                    const days = parseInt(inputDays || '0');
                    if (isNaN(days) || days < 0) {
                      Alert.alert('Invalid Input', 'Please enter a valid number of days');
                      return;
                    }
                    
                    const testDate = new Date();
                    testDate.setDate(testDate.getDate() - days);
                    dispatch(setQuitDate(testDate.toISOString()));
                    await dispatch(updateProgress());
                    
                    // Update all related stats
                    const state = store.getState();
                    const profile = state.auth.user?.nicotineProduct || { dailyCost: 15, dailyAmount: 20 };
                    dispatch(updateStats({
                      daysClean: days,
                      hoursClean: days * 24,
                      minutesClean: days * 1440,
                      secondsClean: days * 86400,
                      moneySaved: days * profile.dailyCost,
                      unitsAvoided: days * profile.dailyAmount,
                      streakDays: days,
                      longestStreak: Math.max(state.progress.stats.longestStreak, days)
                    }));
                    
                    Alert.alert('Success', `Recovery time set to ${days} days`);
                  }
                }
              ],
              'plain-text',
              '',
              'numeric'
            );
          }
        },
        {
          text: 'Reset Demo Notifications',
          onPress: async () => {
            await AsyncStorage.removeItem('@demo_notifications_created');
            NotificationService.createDemoNotifications(dispatch);
            Alert.alert('Success', 'Demo notifications have been recreated! Check your notification bell.');
          }
        },
        { 
          text: 'Change Product Type', 
          onPress: () => {
            Alert.alert(
              'Select Product Type',
              'Choose a nicotine product to test',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Cigarettes', 
                  onPress: async () => {
                    const newProfile = {
                      category: 'cigarettes' as const,
                      dailyAmount: 20,
                      dailyCost: 15,
                      nicotineContent: 1.2,
                      harmLevel: 9
                    };
                    
                    // Update auth state with new nicotine product
                    dispatch(updateUserData({
                      nicotineProduct: {
                        id: 'cigarettes',
                        name: 'Cigarettes',
                        category: 'cigarettes',
                        nicotineContent: 1.2,
                        harmLevel: 9
                      },
                      packagesPerDay: 1,
                      dailyCost: 15
                    }));
                    
                    // Update progress state
                    dispatch(setUserProfile(newProfile));
                    await dispatch(updateProgress());
                    
                    // Recalculate all stats with new product
                    const state = store.getState();
                    const daysClean = state.progress.stats.daysClean;
                    dispatch(updateStats({
                      moneySaved: daysClean * newProfile.dailyCost,
                      unitsAvoided: daysClean * newProfile.dailyAmount,
                    }));
                    Alert.alert('Success', 'Product type changed to Cigarettes');
                  }
                },
                { 
                  text: 'Vape/E-cigarette', 
                  onPress: async () => {
                    const newProfile = {
                      category: 'vape' as const,
                      dailyAmount: 1,
                      dailyCost: 10,
                      nicotineContent: 5,
                      harmLevel: 7
                    };
                    
                    // Update auth state with new nicotine product
                    dispatch(updateUserData({
                      nicotineProduct: {
                        id: 'vape',
                        name: 'Vape/E-cigarette',
                        category: 'vape',
                        nicotineContent: 5,
                        harmLevel: 7
                      },
                      podsPerDay: 1,
                      dailyCost: 10
                    }));
                    
                    // Update progress state
                    dispatch(setUserProfile(newProfile));
                    await dispatch(updateProgress());
                    
                    // Recalculate all stats with new product
                    const state = store.getState();
                    const daysClean = state.progress.stats.daysClean;
                    dispatch(updateStats({
                      moneySaved: daysClean * newProfile.dailyCost,
                      unitsAvoided: daysClean * newProfile.dailyAmount,
                    }));
                    Alert.alert('Success', 'Product type changed to Vape');
                  }
                },
                { 
                  text: 'Nicotine Pouches', 
                  onPress: async () => {
                    const newProfile = {
                      category: 'pouches' as const,
                      dailyAmount: 15,
                      dailyCost: 8,
                      nicotineContent: 6,
                      harmLevel: 5
                    };
                    
                    // Update auth state with new nicotine product
                    dispatch(updateUserData({
                      nicotineProduct: {
                        id: 'zyn',
                        name: 'Nicotine Pouches',
                        category: 'pouches',
                        nicotineContent: 6,
                        harmLevel: 5
                      },
                      tinsPerDay: 1,
                      dailyCost: 8
                    }));
                    
                    // Update progress state
                    dispatch(setUserProfile(newProfile));
                    await dispatch(updateProgress());
                    
                    // Recalculate all stats with new product
                    const state = store.getState();
                    const daysClean = state.progress.stats.daysClean;
                    dispatch(updateStats({
                      moneySaved: daysClean * newProfile.dailyCost,
                      unitsAvoided: daysClean * newProfile.dailyAmount,
                    }));
                    Alert.alert('Success', 'Product type changed to Nicotine Pouches');
                  }
                },
                { 
                  text: 'Dip/Chew', 
                  onPress: async () => {
                    const newProfile = {
                      category: 'chewing' as const,
                      dailyAmount: 5,
                      dailyCost: 12,
                      nicotineContent: 8,
                      harmLevel: 8
                    };
                    
                    // Update auth state with new nicotine product
                    dispatch(updateUserData({
                      nicotineProduct: {
                        id: 'dip',
                        name: 'Dip/Chew',
                        category: 'chewing',
                        nicotineContent: 8,
                        harmLevel: 8
                      },
                      tinsPerDay: 1,
                      dailyCost: 12
                    }));
                    
                    // Update progress state
                    dispatch(setUserProfile(newProfile));
                    await dispatch(updateProgress());
                    
                    // Recalculate all stats with new product
                    const state = store.getState();
                    const daysClean = state.progress.stats.daysClean;
                    dispatch(updateStats({
                      moneySaved: daysClean * newProfile.dailyCost,
                      unitsAvoided: daysClean * newProfile.dailyAmount,
                    }));
                    Alert.alert('Success', 'Product type changed to Dip/Chew');
                  }
                },

              ]
            );
          }
        },
        {
          text: 'Change Gender',
          onPress: () => {
            Alert.alert(
              'Select Gender',
              'Choose gender for testing gender-specific benefits',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Male', 
                  onPress: async () => {
                    dispatch(updateUserData({ gender: 'male' }));
                    // Always update in Supabase if user has an ID
                    if (user?.id) {
                      try {
                        await userProfileService.updateProfile(user.id, { gender: 'male' });
                        console.log('Gender updated in Supabase to male');
                      } catch (error) {
                        console.error('Failed to update gender in Supabase:', error);
                      }
                    }
                    Alert.alert('Success', 'Gender changed to Male');
                  }
                },
                { 
                  text: 'Female', 
                  onPress: async () => {
                    dispatch(updateUserData({ gender: 'female' }));
                    // Always update in Supabase if user has an ID
                    if (user?.id) {
                      try {
                        await userProfileService.updateProfile(user.id, { gender: 'female' });
                        console.log('Gender updated in Supabase to female');
                      } catch (error) {
                        console.error('Failed to update gender in Supabase:', error);
                      }
                    }
                    Alert.alert('Success', 'Gender changed to Female');
                  }
                },
                { 
                  text: 'Non-binary', 
                  onPress: async () => {
                    dispatch(updateUserData({ gender: 'non-binary' }));
                    // Always update in Supabase if user has an ID
                    if (user?.id) {
                      try {
                        await userProfileService.updateProfile(user.id, { gender: 'non-binary' });
                        console.log('Gender updated in Supabase to non-binary');
                      } catch (error) {
                        console.error('Failed to update gender in Supabase:', error);
                      }
                    }
                    Alert.alert('Success', 'Gender changed to Non-binary');
                  }
                },
                { 
                  text: 'Prefer not to say', 
                  onPress: async () => {
                    dispatch(updateUserData({ gender: 'prefer-not-to-say' }));
                    // Always update in Supabase if user has an ID
                    if (user?.id) {
                      try {
                        await userProfileService.updateProfile(user.id, { gender: 'prefer-not-to-say' });
                        console.log('Gender updated in Supabase to prefer-not-to-say');
                      } catch (error) {
                        console.error('Failed to update gender in Supabase:', error);
                      }
                    }
                    Alert.alert('Success', 'Gender preference updated');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleStyleToggle = (styleId: string) => {
    if (selectedStyles.includes(styleId)) {
      // Remove if already selected
      setSelectedStyles(selectedStyles.filter(id => id !== styleId));
    } else {
      // Add if not selected (max 3)
      if (selectedStyles.length < 3) {
        setSelectedStyles([...selectedStyles, styleId]);
      } else {
        Alert.alert('Maximum Reached', 'You can select up to 3 support styles');
      }
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
                    <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Modern Profile Header */}
            <LinearGradient
              colors={[
                daysClean >= 90
                  ? 'rgba(134, 239, 172, 0.02)' // Subtle green for long streaks
                  : daysClean >= 30
                  ? 'rgba(147, 197, 253, 0.02)' // Subtle blue for medium
                  : daysClean >= 7
                  ? 'rgba(251, 191, 36, 0.02)' // Subtle amber for early
                  : 'rgba(255, 255, 255, 0.01)',
                'transparent'
              ]}
              style={styles.profileHeaderGradient}
            >
              <View style={styles.profileHeader}>
                {/* Avatar Section - Simplified and Centered */}
                              <View style={styles.avatarSection}>
                <View style={[
                  styles.avatarContainer,
                  daysClean >= 90 && styles.avatarGlowGreen,
                  daysClean >= 30 && daysClean < 90 && styles.avatarGlowBlue,
                  daysClean >= 7 && daysClean < 30 && styles.avatarGlowAmber,
                ]}>
                  <TouchableOpacity 
                    onPress={() => setShowAvatarInfoModal(true)}
                    activeOpacity={0.8}
                  >
                      {avatarLoading || !selectedAvatar ? (
                        // Show a placeholder while loading
                        <View style={{
                          width: 140,
                          height: 140,
                          borderRadius: 70,
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <ActivityIndicator size="large" color="#8B5CF6" />
                        </View>
                      ) : (
                        <DicebearAvatar
                          userId={user?.id || 'default-user'}
                          size={140}
                          daysClean={daysClean}
                          style={selectedAvatar?.style as any}
                          badgeIcon={getBadgeForDaysClean(daysClean)?.icon}
                          badgeColor={getBadgeForDaysClean(daysClean)?.color}
                          borderColor={getAvatarBorderColor(daysClean)}
                        />
                      )}
                    </TouchableOpacity>
                    {/* Integrated Change Avatar Icon */}
                    <TouchableOpacity 
                      style={styles.changeAvatarOverlay}
                      onPress={() => setShowAvatarModal(true)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="camera" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Primary Info Section - Name, Title, Stage */}
                <View style={styles.primaryInfoSection}>
                  <Text style={styles.userName}>
                    {user?.displayName || stepData.firstName || user?.email?.split('@')[0] || 'Warrior'}
                  </Text>
                  
                  {/* Quitting Info */}
                  {user?.nicotineProduct && (
                    <Text style={styles.quittingText}>
                      Quitting {user.nicotineProduct.name || 'Nicotine'}
                    </Text>
                  )}
                </View>
                
                {/* Clean Stats Section - Redesigned */}
                <View style={styles.statsSection}>
                  <View style={[styles.statItem, { 
                    backgroundColor: daysClean >= 30 
                      ? 'rgba(134, 239, 172, 0.04)' // Soft green for 30+ days
                      : daysClean >= 7
                      ? 'rgba(147, 197, 253, 0.04)' // Soft blue for 7+ days
                      : 'rgba(255, 255, 255, 0.03)' 
                  }]}>
                    <Text style={[styles.statValue, {
                      color: daysClean >= 30
                        ? 'rgba(134, 239, 172, 0.9)'
                        : daysClean >= 7
                        ? 'rgba(147, 197, 253, 0.9)'
                        : COLORS.text
                    }]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.7}
                    >
                      {userStats.daysClean}
                    </Text>
                    <Text style={styles.statLabel}>Days Free</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={[styles.statItem, {
                    backgroundColor: userStats.moneySaved >= 100
                      ? 'rgba(251, 191, 36, 0.04)' // Soft amber for $100+
                      : 'rgba(255, 255, 255, 0.03)'
                  }]}>
                    <Text style={[styles.statValue, {
                      color: userStats.moneySaved >= 100
                        ? 'rgba(251, 191, 36, 0.9)'
                        : COLORS.text
                    }]} 
                      numberOfLines={1} 
                      adjustsFontSizeToFit
                      minimumFontScale={0.5}
                    >
                      ${Math.round(userStats.moneySaved).toLocaleString()}
                    </Text>
                    <Text style={styles.statLabel}>Saved</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={[styles.statItem, {
                    backgroundColor: userStats.healthScore >= 80
                      ? 'rgba(134, 239, 172, 0.04)' // Soft green for high health
                      : userStats.healthScore >= 50
                      ? 'rgba(147, 197, 253, 0.04)' // Soft blue for medium
                      : 'rgba(255, 255, 255, 0.03)'
                  }]}>
                    <Text style={[styles.statValue, {
                      color: userStats.healthScore >= 80
                        ? 'rgba(134, 239, 172, 0.9)'
                        : userStats.healthScore >= 50
                        ? 'rgba(147, 197, 253, 0.9)'
                        : COLORS.text
                    }]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.7}
                    >
                      {Math.round(userStats.healthScore)}%
                    </Text>
                    <Text style={styles.statLabel}>Health</Text>
                  </View>
                </View>
                
                {/* Secondary Info Section - Bio & Support Styles */}
                <View style={styles.secondaryInfoSection}>
                  {/* Bio - Cleaner Presentation */}
                  {user?.bio && (
                    <View style={styles.bioContainer}>
                      <Text style={styles.userBio}>{user.bio}</Text>
                    </View>
                  )}
                  
                  {/* Support Styles - Fixed Position, No Scroll */}
                  {selectedStyles.length > 0 && (
                    <View style={styles.supportStylesWrapper}>
                      {selectedStyles.map((styleId) => {
                        const style = SUPPORT_STYLES.find(s => s.id === styleId);
                        if (!style) return null;
                        return (
                          <View key={styleId} style={[styles.supportStyleTag, { backgroundColor: style.color + '15' }]}>
                            <Ionicons name={style.icon as any} size={14} color='rgba(255, 255, 255, 0.9)' />
                            <Text style={[styles.supportStyleText, { color: 'rgba(255, 255, 255, 0.9)' }]}>{style.name}</Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
                
                              {/* Action Buttons Section */}
              <View style={styles.actionButtonsSection}>
                <TouchableOpacity style={styles.editProfileButton} onPress={handleOpenEditModal}>
                  <LinearGradient
                    colors={['rgba(192, 132, 252, 0.08)', 'rgba(192, 132, 252, 0.04)']}
                    style={styles.editButtonGradient}
                  >
                    <Ionicons name="create-outline" size={18} color="rgba(192, 132, 252, 0.8)" />
                    <Text style={[styles.editProfileText, { color: 'rgba(192, 132, 252, 0.9)' }]}>Edit Profile</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
            </LinearGradient>
            

            
                        {/* Clean Journey Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderContent}>
                  <View style={[styles.sectionIconWrapper, { backgroundColor: 'rgba(192, 132, 252, 0.08)' }]}>
                    <Ionicons name="location-outline" size={20} color="rgba(192, 132, 252, 0.7)" />
                  </View>
                  <View style={styles.sectionTextWrapper}>
                    <Text style={styles.sectionTitle}>Your Journey</Text>
                    <Text style={styles.sectionSubtitle}>
                      {daysClean === 0 ? 'Ready to begin' : 
                       daysClean < 7 ? 'Breaking free' :
                       daysClean < 30 ? 'Building strength' :
                       daysClean < 90 ? 'Transforming' :
                       'Living free'}
                    </Text>
                  </View>
                </View>
              </View>
                
                {/* Clean Progress Bar */}
                <View style={styles.cleanProgressContainer}>
                  <View style={styles.cleanProgressBar}>
                    <LinearGradient
                      colors={[
                        daysClean >= 365 
                          ? 'rgba(250, 204, 21, 0.3)' // Gold for 1 year
                          : daysClean >= 90
                          ? 'rgba(134, 239, 172, 0.25)' // Green for 3 months
                          : daysClean >= 30
                          ? 'rgba(147, 197, 253, 0.2)' // Blue for 1 month
                          : daysClean >= 7
                          ? 'rgba(251, 191, 36, 0.2)' // Amber for 1 week
                          : 'rgba(255, 255, 255, 0.15)',
                        daysClean >= 365
                          ? 'rgba(250, 204, 21, 0.15)'
                          : daysClean >= 90
                          ? 'rgba(134, 239, 172, 0.1)'
                          : daysClean >= 30
                          ? 'rgba(147, 197, 253, 0.08)'
                          : daysClean >= 7
                          ? 'rgba(251, 191, 36, 0.08)'
                          : 'rgba(255, 255, 255, 0.05)'
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.cleanProgressFill,
                        { width: `${Math.min((daysClean / 365) * 100, 100)}%` }
                      ]} 
                    />
                  </View>
                  <View style={styles.cleanProgressStats}>
                    <Text style={[styles.cleanProgressPercent, {
                      color: daysClean >= 365
                        ? 'rgba(250, 204, 21, 0.9)'
                        : daysClean >= 90
                        ? 'rgba(134, 239, 172, 0.9)'
                        : daysClean >= 30
                        ? 'rgba(147, 197, 253, 0.9)'
                        : COLORS.text
                    }]}>
                      {Math.round((Math.min(daysClean, 365) / 365) * 100)}%
                    </Text>
                    <Text style={styles.cleanProgressLabel}>Complete</Text>
                  </View>
                </View>
                
                {/* Simplified Achievements Grid */}
                <View style={styles.cleanAchievementsGrid}>
                  {[
                    { days: 1, title: 'First Day', icon: 'checkmark-circle', color: 'rgba(255, 255, 255, 0.9)' },
                    { days: 3, title: '3 Days', icon: 'flash', color: 'rgba(255, 255, 255, 0.9)' },
                    { days: 7, title: '1 Week', icon: 'shield-checkmark', color: 'rgba(251, 191, 36, 0.9)' },
                    { days: 14, title: '2 Weeks', icon: 'trending-up', color: 'rgba(251, 191, 36, 0.9)' },
                    { days: 30, title: '1 Month', icon: 'ribbon', color: 'rgba(147, 197, 253, 0.9)' },
                    { days: 60, title: '2 Months', icon: 'flame', color: 'rgba(147, 197, 253, 0.9)' },
                    { days: 90, title: '3 Months', icon: 'rocket', color: 'rgba(134, 239, 172, 0.9)' },
                    { days: 180, title: '6 Months', icon: 'star', color: 'rgba(134, 239, 172, 0.9)' },
                    { days: 365, title: '1 Year', icon: 'trophy', color: 'rgba(250, 204, 21, 0.9)' },
                    // Epic long-term milestones
                    { days: 730, title: '2 Years', icon: 'diamond', color: 'rgba(192, 132, 252, 0.9)' },
                    { days: 1825, title: '5 Years', icon: 'planet', color: 'rgba(192, 132, 252, 0.9)' },
                    { days: 3650, title: '10 Years', icon: 'infinite', color: 'rgba(250, 204, 21, 1)' },
                  ].map((milestone, index) => {
                    // Use the actual milestone color from the badge definition
                    const milestoneColor = milestone.color;
                    const isUnlocked = daysClean >= milestone.days;
                    const isNext = daysClean < milestone.days && 
                                   (index === 0 || daysClean >= [1, 3, 7, 14, 30, 60, 90, 180, 365, 730, 1825, 3650][index - 1]);
                    
                    return (
                                          <View 
                      key={index}
                      style={[
                        styles.cleanAchievementItem,
                        isNext && styles.cleanAchievementNext,
                        isUnlocked && styles.cleanAchievementUnlocked
                      ]}
                    >
                      <View style={[
                        styles.achievementIconWrapper,
                        isUnlocked && { 
                          backgroundColor: `${milestoneColor.replace('0.9)', '0.15)')}`,
                          borderColor: `${milestoneColor.replace('0.9)', '0.3)')}`
                        }
                      ]}>
                        <MinimalAchievementBadge
                          milestone={{ ...milestone, color: milestoneColor }}
                          size={60}
                          unlocked={isUnlocked}
                        />
                      </View>
                      <Text style={[
                        styles.cleanAchievementTitle,
                        !isUnlocked && styles.cleanAchievementTitleLocked,
                        isUnlocked && { color: milestoneColor }
                      ]}>
                        {milestone.title}
                      </Text>
                      {isNext && (
                        <Text style={styles.cleanAchievementDaysLeft}>
                          {milestone.days - daysClean} {milestone.days - daysClean === 1 ? 'day' : 'days'}
                        </Text>
                      )}
                    </View>
                    );
                  })}
                </View>
              </View>



              {/* Settings */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Settings</Text>
                <View style={styles.settingsCard}>
                  <TouchableOpacity 
                    style={styles.settingItem}
                    onPress={() => navigation.navigate('Notifications')}
                  >
                    <View style={styles.settingLeft}>
                      <View style={[styles.settingIcon, { backgroundColor: 'rgba(147, 197, 253, 0.06)' }]}>
                        <Ionicons name="notifications-outline" size={20} color="rgba(147, 197, 253, 0.6)" />
                      </View>
                      <Text style={styles.settingText}>Notifications</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                      <View style={[styles.settingIcon, { backgroundColor: 'rgba(134, 239, 172, 0.06)' }]}>
                        <Ionicons name="shield-checkmark-outline" size={20} color="rgba(134, 239, 172, 0.6)" />
                      </View>
                      <Text style={styles.settingText}>Privacy</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.settingItem, { borderBottomWidth: 0 }]}>
                    <View style={styles.settingLeft}>
                      <View style={[styles.settingIcon, { backgroundColor: 'rgba(251, 191, 36, 0.06)' }]}>
                        <Ionicons name="help-circle-outline" size={20} color="rgba(251, 191, 36, 0.6)" />
                      </View>
                      <Text style={styles.settingText}>Help & Support</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Developer Tools - Only in Dev Mode */}
              {__DEV__ && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Developer Tools</Text>
                  <View style={styles.settingsCard}>
                    <TouchableOpacity style={styles.settingItem} onPress={handleProgressTest}>
                      <View style={styles.settingLeft}>
                        <View style={[styles.settingIcon, { backgroundColor: 'rgba(192, 132, 252, 0.06)' }]}>
                          <Ionicons name="flash" size={20} color="rgba(192, 132, 252, 0.6)" />
                        </View>
                        <Text style={styles.settingText}>Progress Test</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.settingItem} onPress={() => {
                      navigation.navigate('NotificationTest' as never);
                    }}>
                      <View style={styles.settingLeft}>
                        <View style={[styles.settingIcon, { backgroundColor: 'rgba(147, 197, 253, 0.06)' }]}>
                          <Ionicons name="notifications" size={20} color="rgba(147, 197, 253, 0.6)" />
                        </View>
                        <Text style={styles.settingText}>Notification Test</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.settingItem} onPress={async () => {
                      // Reset support styles to default
                      const defaultStyles = ['motivator'];
                      setSelectedStyles(defaultStyles);
                      dispatch(updateUserData({ supportStyles: defaultStyles }));
                      Alert.alert('Success', 'Support styles reset to default');
                    }}>
                      <View style={styles.settingLeft}>
                        <View style={[styles.settingIcon, { backgroundColor: 'rgba(192, 132, 252, 0.05)' }]}>
                          <Ionicons name="color-wand" size={20} color="rgba(192, 132, 252, 0.5)" />
                        </View>
                        <Text style={styles.settingText}>Reset Vibes</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.settingItem} onPress={async () => {
                      const { runSupabaseDiagnostics } = await import('../../utils/supabaseDiagnostics');
                      await runSupabaseDiagnostics();
                      Alert.alert('Diagnostics', 'Check console for Supabase connection details');
                    }}>
                      <View style={styles.settingLeft}>
                        <View style={[styles.settingIcon, { backgroundColor: 'rgba(134, 239, 172, 0.05)' }]}>
                          <Ionicons name="pulse" size={20} color="rgba(134, 239, 172, 0.5)" />
                        </View>
                        <Text style={styles.settingText}>Supabase Diagnostics</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.settingItem} onPress={async () => {
                      // Test basic network connectivity
                      console.log('🌐 Testing Network Connectivity...\n');
                      
                      try {
                        // Test 1: Basic internet connectivity
                        console.log('1️⃣ Testing basic internet (google.com)...');
                        const googleResponse = await fetch('https://www.google.com', { method: 'HEAD' });
                        console.log('   Google.com:', googleResponse.ok ? '✅ Reachable' : '❌ Not reachable');
                      } catch (error: any) {
                        console.log('   Google.com: ❌ Network error -', error.message);
                      }
                      
                      try {
                        // Test 2: Supabase URL directly
                        console.log('\n2️⃣ Testing Supabase URL...');
                        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
                        if (supabaseUrl) {
                          const supabaseResponse = await fetch(supabaseUrl, { method: 'HEAD' });
                          console.log('   Supabase:', supabaseResponse.ok ? '✅ Reachable' : `❌ Status ${supabaseResponse.status}`);
                        } else {
                          console.log('   Supabase: ❌ No URL configured');
                        }
                      } catch (error: any) {
                        console.log('   Supabase: ❌ Network error -', error.message);
                      }
                      
                      // Test 3: Device info
                      console.log('\n3️⃣ Device Info:');
                      console.log('   Platform:', Platform.OS);
                      console.log('   Dev mode:', __DEV__ ? 'Yes' : 'No');
                      
                      Alert.alert('Network Test', 'Check console for network connectivity results');
                    }}>
                      <View style={styles.settingLeft}>
                        <View style={[styles.settingIcon, { backgroundColor: 'rgba(147, 197, 253, 0.05)' }]}>
                          <Ionicons name="wifi" size={20} color="rgba(147, 197, 253, 0.5)" />
                        </View>
                        <Text style={styles.settingText}>Network Test</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.settingItem} onPress={async () => {
                      const { OfflineModeService } = await import('../../services/offlineMode');
                      const isOffline = await OfflineModeService.toggleOfflineMode();
                      Alert.alert(
                        'Offline Mode',
                        isOffline ? 'Offline mode enabled - Supabase sync disabled' : 'Offline mode disabled - Supabase sync enabled'
                      );
                    }}>
                      <View style={styles.settingLeft}>
                        <View style={[styles.settingIcon, { backgroundColor: 'rgba(251, 191, 36, 0.05)' }]}>
                          <Ionicons name="airplane" size={20} color="rgba(251, 191, 36, 0.5)" />
                        </View>
                        <Text style={styles.settingText}>Toggle Offline Mode</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.settingItem, { borderBottomWidth: 0 }]} onPress={handleAppReset}>
                      <View style={styles.settingLeft}>
                        <View style={[styles.settingIcon, { backgroundColor: 'rgba(239, 68, 68, 0.05)' }]}>
                          <Ionicons name="refresh" size={20} color="rgba(239, 68, 68, 0.5)" />
                        </View>
                        <Text style={styles.settingText}>Reset App</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}



                          {/* Sign Out Button */}
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <View style={styles.signOutGradient}>
                <Ionicons name="log-out-outline" size={20} color="rgba(239, 68, 68, 0.5)" />
                <Text style={[styles.signOutText, { color: 'rgba(239, 68, 68, 0.6)' }]}>Sign Out</Text>
              </View>
            </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>

          <>
          {/* Avatar Selection Modal */}
          <Modal
            visible={showAvatarModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowAvatarModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.avatarModal}>
                <LinearGradient
                  colors={['#000000', '#0A0F1C', '#0F172A']}
                  style={styles.avatarModalGradient}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Choose Your Avatar</Text>
                    <TouchableOpacity onPress={() => setShowAvatarModal(false)}>
                      <Ionicons name="close" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                  >
                    {/* My Collection - Show purchased avatars first */}
                    {user?.purchasedAvatars && user.purchasedAvatars.length > 0 && (
                      <>
                        <View style={styles.myCollectionHeader}>
                          <LinearGradient
                            colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.03)']}
                            style={styles.myCollectionBanner}
                          >
                            <View style={styles.bannerHeader}>
                              <Ionicons name="star" size={20} color="rgba(255, 255, 255, 0.6)" />
                              <Text style={styles.myCollectionTitle}>My Collection</Text>
                            </View>
                            <Text style={styles.myCollectionSubtitle}>Your exclusive avatars</Text>
                          </LinearGradient>
                        </View>
                        <View style={styles.avatarGrid}>
                          {(() => {
                            const allAvatars = { ...PREMIUM_AVATARS };
                            return user.purchasedAvatars.map((styleKey) => {
                              const styleConfig = allAvatars[styleKey];
                              if (!styleConfig) return null;
                              
                              const isSelected = selectedAvatar?.type === 'dicebear' && selectedAvatar?.style === styleKey;
                              
                              return (
                                <TouchableOpacity
                                  key={styleKey}
                                  style={[
                                    styles.avatarOption,
                                    styles.myAvatarOption,
                                    isSelected && styles.avatarOptionSelected
                                  ]}
                                  onPress={async () => {
                                    const newAvatar = { 
                                      type: 'dicebear', 
                                      name: styleConfig.name,
                                      style: styleKey 
                                    };
                                    setSelectedAvatar(newAvatar);
                                    await AsyncStorage.setItem('selected_avatar', JSON.stringify(newAvatar));
                                    setShowAvatarModal(false);
                                  }}
                                >
                                  <View style={styles.myAvatarGlow}>
                                    <DicebearAvatar
                                      userId={user?.id || 'default-user'}
                                      size={80}
                                      daysClean={daysClean}
                                      style={styleKey as any}
                                      showFrame={true}
                                    />
                                  </View>
                                  <Text style={styles.avatarOptionName}>{styleConfig.name}</Text>
                                  <Text style={styles.myAvatarRarity}>
                                    Premium
                                  </Text>
                                </TouchableOpacity>
                              );
                            });
                          })()}
                        </View>
                      </>
                    )}
                    
                    {/* Starter Avatars */}
                    <Text style={[styles.avatarSectionSubtitle, { marginTop: user?.purchasedAvatars?.length > 0 ? SPACING.lg : SPACING.sm }]}>Pick your recovery companion</Text>
                    <View style={styles.avatarGrid}>
                      {Object.entries(STARTER_AVATARS).map(([styleKey, styleConfig]) => {
                        const isSelected = selectedAvatar?.type === 'dicebear' && selectedAvatar?.style === styleKey;
                        
                        return (
                          <TouchableOpacity
                            key={styleKey}
                            style={[
                              styles.avatarOption,
                              isSelected && styles.avatarOptionSelected
                            ]}
                            onPress={async () => {
                              const newAvatar = { 
                                type: 'dicebear', 
                                name: styleConfig.name,
                                style: styleKey 
                              };
                              setSelectedAvatar(newAvatar);
                              await AsyncStorage.setItem('selected_avatar', JSON.stringify(newAvatar));
                              setShowAvatarModal(false);
                            }}
                          >
                            <DicebearAvatar
                              userId={user?.id || 'default-user'}
                              size={80}
                              daysClean={daysClean}
                              style={styleKey as any}
                              showFrame={true}
                            />
                            <Text style={styles.avatarOptionName}>{styleConfig.name}</Text>
                            <Text style={styles.avatarUnlockText}>{styleConfig.description}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Progress Avatars */}
                    <Text style={[styles.avatarSectionTitle, { marginTop: 24 }]}>Progress Unlocks</Text>
                    <Text style={styles.avatarSectionSubtitle}>Earn these by staying clean</Text>
                    <View style={styles.avatarGrid}>
                      {Object.entries(PROGRESS_AVATARS).map(([styleKey, styleConfig]) => {
                        const isUnlocked = daysClean >= styleConfig.unlockDays;
                        const isSelected = selectedAvatar?.type === 'dicebear' && selectedAvatar?.style === styleKey;
                        
                        return (
                          <TouchableOpacity
                            key={styleKey}
                            style={[
                              styles.avatarOption,
                              isSelected && styles.avatarOptionSelected,
                              !isUnlocked && styles.avatarLocked
                            ]}
                            onPress={async () => {
                              if (isUnlocked) {
                                const newAvatar = { 
                                  type: 'dicebear', 
                                  name: styleConfig.name,
                                  style: styleKey 
                                };
                                setSelectedAvatar(newAvatar);
                                await AsyncStorage.setItem('selected_avatar', JSON.stringify(newAvatar));
                                setShowAvatarModal(false);
                              }
                            }}
                            disabled={!isUnlocked}
                          >
                            {!isUnlocked && (
                              <View style={styles.lockedOverlay}>
                                <Ionicons name="lock-closed" size={24} color={COLORS.textMuted} />
                              </View>
                            )}
                            <DicebearAvatar
                              userId={user?.id || 'default-user'}
                              size={80}
                              daysClean={daysClean}
                              style={styleKey as any}
                              showFrame={isUnlocked}
                            />
                            <Text style={[
                              styles.avatarOptionName,
                              !isUnlocked && styles.avatarNameLocked
                            ]}>
                              {styleConfig.name}
                            </Text>
                            <Text style={[
                              styles.avatarUnlockText,
                              !isUnlocked && { color: COLORS.textMuted }
                            ]}>
                              {styleConfig.description}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Premium Collection */}
                    <View style={styles.premiumSection}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.04)']}
                        style={styles.premiumBanner}
                      >
                        <View style={styles.bannerHeader}>
                          <Ionicons name="sparkles" size={20} color="rgba(255, 255, 255, 0.7)" />
                          <Text style={styles.premiumTitle}>Premium Collection</Text>
                        </View>
                        <Text style={styles.premiumSubtitle}>Stand out with exclusive mythic avatars</Text>
                        
                        {/* Rotation Timer */}
                        <View style={styles.rotationTimer}>
                          <Ionicons name="time-outline" size={14} color="rgba(255, 255, 255, 0.5)" />
                          <Text style={styles.rotationTimerText}>
                            New collection in {getDaysUntilRotation()} {getDaysUntilRotation() === 1 ? 'day' : 'days'}
                          </Text>
                        </View>
                      </LinearGradient>
                      
                      <View style={styles.avatarGrid}>
                        {Object.entries(PREMIUM_AVATARS).map(([styleKey, styleConfig]) => {
                          const isSelected = selectedAvatar?.type === 'dicebear' && selectedAvatar?.style === styleKey;
                          const isPurchased = user?.purchasedAvatars?.includes(styleKey) || false;
                          
                          return (
                            <TouchableOpacity
                              key={styleKey}
                              style={[
                                styles.avatarOption,
                                styles.premiumAvatarOption,
                                isSelected && styles.avatarOptionSelected
                              ]}
                              onPress={() => {
                                if (isPurchased) {
                                  // Already purchased, just select it
                                  handleAvatarSelect(styleKey, styleConfig.name);
                                  return;
                                }
                                setSelectedPurchaseAvatar({
                                  ...styleConfig,
                                  styleKey,
                                  type: 'premium'
                                });
                                // Close avatar modal with smooth transition
                                setShowAvatarModal(false);
                                setTimeout(() => {
                                  setShowPurchaseModal(true);
                                }, 150); // Shorter delay for smoother transition
                              }}
                            >
                              <View style={styles.avatarContent}>
                                <View style={styles.avatarTop}>
                                  <View style={styles.premiumGlow}>
                                    <DicebearAvatar
                                      userId={user?.id || 'default-user'}
                                      size={80}
                                      daysClean={daysClean}
                                      style={styleKey as any}
                                      showFrame={true}
                                    />
                                  </View>
                                  <Text style={styles.avatarOptionName}>{styleConfig.name}</Text>
                                </View>
                                <View style={styles.bottomContainer}>
                                  <View style={[styles.priceTag, isPurchased && styles.ownedTag]}>
                                    <Text style={[styles.priceText, isPurchased && styles.ownedText]}>
                                      {isPurchased ? 'Owned' : styleConfig.price}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>




                  </ScrollView>
                </LinearGradient>
                
                {/* Purchase Loading Overlay */}
                {purchaseLoading && (
                  <View style={styles.purchaseLoadingOverlay}>
                    <ActivityIndicator size="large" color="#8B5CF6" />
                    <Text style={styles.purchaseLoadingText}>Processing purchase...</Text>
                  </View>
                )}
              </View>
            </View>
          </Modal>

          {/* Edit Profile Modal - Clean and Focused */}
          <Modal
            visible={showEditModal}
            animationType="slide"
            transparent={true}
            onRequestClose={handleCloseEditModal}
          >
            <View style={styles.fireModalOverlay}>
              <TouchableOpacity 
                style={styles.fireModalBackdrop} 
                activeOpacity={1} 
                onPress={handleCloseEditModal}
              />
              <View style={styles.fireEditModal}>
                            <LinearGradient
                colors={['#000000', '#0A0F1C', '#0F172A']}
                style={styles.fireModalGradient}
              >
                  {/* Drag Handle */}
                  <View style={styles.fireModalHandle} />
                  
                  {/* Header */}
                  <View style={styles.fireModalHeader}>
                    <View>
                      <Text style={styles.fireModalTitle}>Edit Profile</Text>
                      <Text style={styles.fireModalSubtitle}>Make it yours</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.fireCloseButton}
                      onPress={handleCloseEditModal}
                    >
                      <Ionicons name="close" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Content - no scrolling needed */}
                  <View style={styles.fireModalContentWrapper}>
                    <View style={styles.fireModalContent}>
                      {/* Name Input */}
                      <View style={styles.fireInputWrapper}>
                        <View style={styles.fireInputHeader}>
                          <Ionicons name="person" size={16} color="rgba(255, 255, 255, 0.6)" />
                          <Text style={styles.fireInputLabel}>Display Name</Text>
                        </View>
                        <TextInput
                          style={styles.fireInput}
                          value={tempDisplayName}
                          onChangeText={setTempDisplayName}
                          placeholder="How should we call you?"
                          placeholderTextColor="rgba(255, 255, 255, 0.3)"
                          maxLength={30}
                          returnKeyType="done"
                          blurOnSubmit={true}
                          onSubmitEditing={Keyboard.dismiss}
                        />
                        <Text style={styles.fireCharCount}>{tempDisplayName.length}/30</Text>
                        <Text style={styles.fireHelperText}>
                          This is how you'll appear in the community. It will not affect your username.
                        </Text>
                      </View>
                      
                      {/* Bio Input */}
                      <View style={styles.fireInputWrapper}>
                        <View style={styles.fireInputHeader}>
                          <Ionicons name="create" size={16} color="rgba(255, 255, 255, 0.6)" />
                          <Text style={styles.fireInputLabel}>Your Story</Text>
                        </View>
                        <TextInput
                          style={[styles.fireInput, styles.fireBioInput]}
                          value={tempBio}
                          onChangeText={setTempBio}
                          placeholder="Share your journey..."
                          placeholderTextColor="rgba(255, 255, 255, 0.3)"
                          multiline
                          numberOfLines={3}
                          maxLength={150}
                          returnKeyType="done"
                          blurOnSubmit={true}
                          onSubmitEditing={Keyboard.dismiss}
                        />
                        <Text style={styles.fireCharCount}>{tempBio.length}/150</Text>
                      </View>
                      
                      {/* Support Styles */}
                      <View style={styles.fireInputWrapper}>
                        <View style={styles.fireInputHeader}>
                          <Ionicons name="sparkles" size={16} color="rgba(255, 255, 255, 0.6)" />
                          <Text style={styles.fireInputLabel}>Your Vibe</Text>
                          <Text style={styles.fireStyleCount}>{tempSelectedStyles.length}/3</Text>
                        </View>
                        <View style={styles.fireStyleGrid}>
                          {SUPPORT_STYLES.map((style) => {
                            const isSelected = tempSelectedStyles.includes(style.id);
                            
                            return (
                              <TouchableOpacity
                                key={style.id}
                                style={[
                                  styles.fireStylePill,
                                  { 
                                    backgroundColor: isSelected ? style.color + '25' : 'rgba(255, 255, 255, 0.02)',
                                    borderColor: isSelected ? style.color + '60' : 'rgba(255, 255, 255, 0.06)',
                                    borderWidth: isSelected ? 1.5 : 1,
                                    opacity: !isSelected && tempSelectedStyles.length >= 3 ? 0.5 : 1,
                                  }
                                ]}
                                onPress={() => {
                                  if (isSelected) {
                                    setTempSelectedStyles(tempSelectedStyles.filter(id => id !== style.id));
                                  } else if (tempSelectedStyles.length < 3) {
                                    setTempSelectedStyles([...tempSelectedStyles, style.id]);
                                  }
                                }}
                              >
                                <Ionicons 
                                  name={style.icon as any} 
                                  size={14} 
                                  color={isSelected ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.6)'} 
                                />
                                <Text style={[
                                  styles.fireStyleText,
                                  { 
                                    color: isSelected ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.6)', 
                                    fontWeight: isSelected ? '500' : '300' 
                                  }
                                ]}>
                                  {style.name}
                                </Text>
                                {isSelected && (
                                  <Ionicons 
                                    name="checkmark-circle" 
                                    size={14} 
                                    color='rgba(255, 255, 255, 0.9)' 
                                    style={{ marginLeft: 'auto' }}
                                  />
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  {/* Action Buttons - Fixed at bottom */}
                  <View style={styles.fireModalActions}>
                    <TouchableOpacity 
                      style={styles.fireDiscardButton}
                      onPress={handleCloseEditModal}
                    >
                      <Text style={styles.fireDiscardText}>Discard</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.fireSaveButton}
                      onPress={handleSaveProfile}
                    >
                      <View
                        style={[styles.fireSaveGradient, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}
                      >
                        <Text style={[styles.fireSaveText, { color: 'rgba(255, 255, 255, 0.9)' }]}>Save Changes</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            </View>
          </Modal>

          {/* Custom Purchase Modal */}
          <Modal
            visible={showPurchaseModal}
            animationType="fade"
            transparent={true}
            onRequestClose={() => {
              if (!purchaseLoading) {
                setShowPurchaseModal(false);
                setPurchaseSuccess(false);
                // Reopen avatar modal smoothly
                setTimeout(() => {
                  setShowAvatarModal(true);
                }, 150);
              }
            }}
          >
            <View style={styles.purchaseModalOverlay}>
              <View style={styles.purchaseModal}>
                <LinearGradient
                  colors={purchaseSuccess ? ['#000000', '#0A0F1C', '#0F172A'] : ['#000000', '#0A0F1C', '#0F172A']}
                  style={styles.purchaseModalGradient}
                >
                  {purchaseSuccess ? (
                    // Success State
                    <View style={styles.purchaseSuccessContent}>
                      <View style={styles.successIconContainer}>
                        <Ionicons name="checkmark-circle" size={80} color="rgba(255, 255, 255, 0.8)" />
                      </View>
                      <Text style={styles.purchaseSuccessTitle}>Success!</Text>
                      <Text style={styles.purchaseSuccessText}>
                        {selectedPurchaseAvatar?.name} has been unlocked
                      </Text>
                      <TouchableOpacity 
                        style={styles.successButton}
                        onPress={() => {
                          setShowPurchaseModal(false);
                          setPurchaseSuccess(false);
                          if (selectedPurchaseAvatar) {
                            handleAvatarSelect(selectedPurchaseAvatar.styleKey, selectedPurchaseAvatar.name);
                          }
                          // Don't reopen avatar modal - user has selected their avatar
                        }}
                      >
                        <View
                          style={[styles.successButtonGradient, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}
                        >
                          <Text style={styles.successButtonText}>Use Avatar</Text>
                          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                        </View>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    // Purchase State
                    <>
                      <View style={styles.purchaseModalHeader}>
                        <View style={styles.purchaseTypeIndicator}>
                          <Ionicons 
                            name="sparkles"
                            size={16} 
                            color="rgba(255, 255, 255, 0.6)"
                          />
                          <Text style={[
                            styles.purchaseTypeText,
                            { color: 'rgba(255, 255, 255, 0.6)' }
                          ]}>
                            Premium
                          </Text>
                        </View>
                        <TouchableOpacity 
                          onPress={() => {
                            setShowPurchaseModal(false);
                            setPurchaseSuccess(false);
                            // Reopen avatar modal smoothly
                            setTimeout(() => {
                              setShowAvatarModal(true);
                            }, 150);
                          }}
                          disabled={purchaseLoading}
                        >
                          <Ionicons name="close" size={24} color={COLORS.textMuted} />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.purchaseAvatarShowcase}>
                        {selectedPurchaseAvatar && (
                          <DicebearAvatar
                            userId={user?.id || 'default-user'}
                            size={120}
                            daysClean={daysClean}
                            style={selectedPurchaseAvatar.styleKey}
                            showFrame={true}
                          />
                        )}
                      </View>
                      
                      <Text style={styles.purchaseModalTitle}>{selectedPurchaseAvatar?.name}</Text>
                      <Text style={styles.purchaseModalDescription}>{selectedPurchaseAvatar?.description}</Text>
                      

                      
                      <View style={styles.purchaseModalFooter}>
                        <View style={styles.priceContainer}>
                          <Text style={styles.priceLabel}>Price</Text>
                          <Text style={styles.priceValue}>{selectedPurchaseAvatar?.price}</Text>
                        </View>
                        
                        <View style={styles.purchaseButtons}>
                          <TouchableOpacity 
                            style={styles.cancelButton}
                            onPress={() => {
                              setShowPurchaseModal(false);
                              // Reopen avatar modal smoothly
                              setTimeout(() => {
                                setShowAvatarModal(true);
                              }, 150);
                            }}
                            disabled={purchaseLoading}
                          >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={styles.purchaseButton}
                            onPress={async () => {
                              if (purchaseLoading) return;
                              
                              setPurchaseLoading(true);
                              try {
                                await iapService.initialize();
                                const result = await iapService.purchaseAvatar(selectedPurchaseAvatar.styleKey);
                                
                                if (result.success) {
                                  // Update user's purchased avatars
                                  const updatedAvatars = [...(user?.purchasedAvatars || []), selectedPurchaseAvatar.styleKey];
                                  
                                  // Track purchase date
                                  const updatedAvatarData = {
                                    ...(user?.purchasedAvatarData || {}),
                                    [selectedPurchaseAvatar.styleKey]: {
                                      purchaseDate: new Date().toISOString(),
                                      price: selectedPurchaseAvatar.price || '$0.00'
                                    }
                                  };
                                  
                                  dispatch(updateUserData({ 
                                    purchasedAvatars: updatedAvatars,
                                    purchasedAvatarData: updatedAvatarData
                                  }));
                                  
                                  // Update AsyncStorage
                                  if (user) {
                                    const updatedUser = {
                                      ...user,
                                      purchasedAvatars: updatedAvatars,
                                      purchasedAvatarData: updatedAvatarData
                                    };
                                    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
                                  }
                                  
                                  // Show success state
                                  setPurchaseSuccess(true);
                                  
                                  // Select the newly purchased avatar
                                  setSelectedAvatar({ 
                                    type: 'dicebear', 
                                    name: selectedPurchaseAvatar.name, 
                                    style: selectedPurchaseAvatar.styleKey 
                                  });
                                } else {
                                  setShowPurchaseModal(false);
                                  setTimeout(() => {
                                    Alert.alert('Purchase Failed', result.error || 'Unable to complete purchase');
                                  }, 300);
                                }
                              } catch (error) {
                                setShowPurchaseModal(false);
                                setTimeout(() => {
                                  Alert.alert('Error', 'Failed to process purchase');
                                }, 300);
                              } finally {
                                setPurchaseLoading(false);
                              }
                            }}
                            disabled={purchaseLoading}
                          >
                            <View
                              style={[styles.purchaseButtonGradient, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }, purchaseLoading && { opacity: 0.7 }]}
                            >
                              {purchaseLoading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                              ) : (
                                <>
                                  <Ionicons name="cart" size={18} color="#FFFFFF" />
                                  <Text style={styles.purchaseButtonText}>Purchase</Text>
                                </>
                              )}
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </>
                  )}
                </LinearGradient>
              </View>
            </View>
          </Modal>

          {/* Avatar Info Modal */}
          <Modal
            visible={showAvatarInfoModal}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setShowAvatarInfoModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1}
              onPress={() => setShowAvatarInfoModal(false)}
            >
              <View style={styles.avatarInfoModal}>
                <LinearGradient
                  colors={['#000000', '#0A0F1C', '#0F172A']}
                  style={styles.avatarInfoGradient}
                >
                  <View style={styles.avatarInfoHeader}>
                    {selectedAvatar ? (
                      <DicebearAvatar
                        userId={user?.id || 'default-user'}
                        size={100}
                        daysClean={daysClean}
                        style={selectedAvatar?.style as any}
                        badgeIcon={getBadgeForDaysClean(daysClean)?.icon}
                        badgeColor={getBadgeForDaysClean(daysClean)?.color}
                      />
                    ) : (
                      <View style={{
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        backgroundColor: 'rgba(139, 92, 246, 0.1)'
                      }} />
                    )}
                  </View>
                  
                  <Text style={styles.avatarInfoTitle}>{selectedAvatar?.name || 'Loading...'}</Text>
                  
                  <View style={[styles.avatarInfoBadge, { backgroundColor: getAvatarRarity() === 'legendary' ? 'rgba(255, 215, 0, 0.2)' : getAvatarRarity() === 'epic' ? 'rgba(236, 72, 153, 0.2)' : getAvatarRarity() === 'rare' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)' }]}>
                    <Text style={[styles.avatarInfoRarity, { color: getAvatarRarity() === 'legendary' ? '#FFD700' : getAvatarRarity() === 'epic' ? '#EC4899' : getAvatarRarity() === 'rare' ? '#8B5CF6' : '#10B981' }]}>
                      {getAvatarRarity().toUpperCase()}
                    </Text>
                  </View>
                  
                  <Text style={styles.avatarInfoDescription}>
                    {(() => {
                      // Get description based on avatar style
                      const allAvatars = { ...STARTER_AVATARS, ...PROGRESS_AVATARS, ...PREMIUM_AVATARS };
                      return allAvatars[selectedAvatar?.style]?.description || 'Your recovery companion';
                    })()}
                  </Text>
                  
                  {/* Stats about the avatar */}
                  <View style={styles.avatarInfoStats}>
                    <View style={styles.avatarInfoStat}>
                      <Text style={styles.avatarInfoStatValue}>
                        {(() => {
                          const avatarData = { ...PROGRESS_AVATARS, ...PREMIUM_AVATARS }[selectedAvatar?.style];
                          // For purchased avatars, show days since purchase or "New"
                          if (avatarData?.unlockDays && avatarData.unlockDays < 0) {
                            // This is a purchased avatar
                            const purchaseData = user?.purchasedAvatarData?.[selectedAvatar?.style];
                            if (purchaseData?.purchaseDate) {
                              const purchaseDate = new Date(purchaseData.purchaseDate);
                              const today = new Date();
                              const daysSincePurchase = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
                              return daysSincePurchase === 0 ? 'New' : daysSincePurchase;
                            }
                            return 'New';
                          }
                          // For starter/progress avatars, show days clean
                          return daysClean;
                        })()}
                      </Text>
                      <Text style={styles.avatarInfoStatLabel}>
                        {(() => {
                          const avatarData = { ...PROGRESS_AVATARS, ...PREMIUM_AVATARS }[selectedAvatar?.style];
                          // For purchased avatars, show different label
                          if (avatarData?.unlockDays && avatarData.unlockDays < 0) {
                            const purchaseData = user?.purchasedAvatarData?.[selectedAvatar?.style];
                            if (purchaseData?.purchaseDate) {
                              const purchaseDate = new Date(purchaseData.purchaseDate);
                              const today = new Date();
                              const daysSincePurchase = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
                              return daysSincePurchase === 0 ? 'Companion' : 'Days Together';
                            }
                            return 'Companion';
                          }
                          // For other avatars
                          return 'Days Together';
                        })()}
                      </Text>
                    </View>
                    
                    {(() => {
                      const avatarData = { ...PROGRESS_AVATARS, ...PREMIUM_AVATARS }[selectedAvatar?.style];
                      // Only show unlock day for progress avatars, not purchased ones
                      if (avatarData?.unlockDays && avatarData.unlockDays > 0) {
                        return (
                          <View style={styles.avatarInfoStat}>
                            <Text style={styles.avatarInfoStatValue}>Day {avatarData.unlockDays}</Text>
                            <Text style={styles.avatarInfoStatLabel}>Unlocked At</Text>
                          </View>
                        );
                      }
                      // Show purchase date for purchased avatars
                      if (avatarData?.unlockDays && avatarData.unlockDays < 0) {
                        return (
                          <View style={styles.avatarInfoStat}>
                            <Text style={styles.avatarInfoStatValue}>Premium</Text>
                            <Text style={styles.avatarInfoStatLabel}>Collection</Text>
                          </View>
                        );
                      }
                      return null;
                    })()}
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.avatarInfoDismiss}
                    onPress={() => setShowAvatarInfoModal(false)}
                  >
                    <Text style={styles.avatarInfoDismissText}>Tap to dismiss</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </Modal>
          </>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  
  // Header styles with cleaner design
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: -0.5,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100, // Extra padding for navigation bar
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 0,
    marginBottom: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  changeAvatarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryInfoSection: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  userName: {
    fontSize: 24,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  avatarTitle: {
    fontSize: 15,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  stageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stageBadgeText: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  quittingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 90,
    maxWidth: 120,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 0.5,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 8,
  },
  secondaryInfoSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  bioContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  userBio: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  supportStylesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  supportStyleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  supportStyleText: {
    fontSize: 13,
    fontWeight: '400',
  },
  actionButtonsSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },
  editProfileButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  editProfileText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#C084FC',
  },



  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  quickStatLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  achievementScroll: {
    paddingRight: SPACING.lg,
  },
  achievementCard: {
    width: 100,
    height: 100,
    marginRight: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  achievementGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 16,
  },

  achievementName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    paddingHorizontal: 4,
    marginTop: SPACING.xs,
  },
  achievementLocked: {
    opacity: 0.6,
  },

  achievementNameLocked: {
    color: COLORS.textMuted,
  },
  milestonesScroll: {
    paddingRight: SPACING.lg,
  },
  milestoneCard: {
    width: 100,
    height: 120,
    marginRight: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  milestoneGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 16,
    padding: SPACING.sm,
  },
  milestoneLocked: {
    opacity: 0.6,
  },
  milestoneIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  milestoneTitleLocked: {
    color: COLORS.textMuted,
  },
  milestoneDays: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  milestoneDaysLocked: {
    color: COLORS.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statCard: {
    width: '48%',
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  signOutButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  signOutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Dark overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Fire Edit Modal Styles
  fireModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fireModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  fireEditModal: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%', // Increased to give more room
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  fireModalGradient: {
    flex: 1,
    paddingBottom: 20,
  },
  fireModalHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  fireModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 12, // Reduced from 16
  },
  fireModalTitle: {
    fontSize: 22,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  fireModalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  fireCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireModalContentWrapper: {
    flex: 1,
  },
  fireModalContent: {
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  fireInputWrapper: {
    marginBottom: 16, // Reduced from 20
  },
  fireInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  fireInputLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  fireStyleCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '300',
  },
  fireInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12, // Reduced from 14
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  fireBioInput: {
    minHeight: 120, // Increased back to show more text
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  fireCharCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'right',
    marginTop: 6,
    fontWeight: '300',
  },
  fireStyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Proper gap between cards
  },
  fireStylePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    width: '48%', // Two per row with proper spacing
    justifyContent: 'flex-start',
    position: 'relative',
  },
  fireStyleText: {
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  fireModalScrollView: {
    flex: 1,
  },
  fireModalScrollContent: {
    flexGrow: 1,
    paddingBottom: 0, // Removed padding
  },
  fireModalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 30, // Reduced from 50 to save space
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  fireDiscardButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  fireDiscardText: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  fireSaveButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fireSaveGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireSaveText: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  reasonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    minWidth: '31%',
    justifyContent: 'center',
  },
  reasonPillSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  reasonTextSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  customReasonContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  customReasonLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  customReasonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  
  avatarModal: {
    width: '90%',
    maxHeight: '85%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatarModalGradient: {
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: COLORS.text,
  },
  avatarSectionTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  avatarOption: {
    width: '33.33%',
    padding: SPACING.xs,
    alignItems: 'center',
    position: 'relative',
    minHeight: 160,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  avatarOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  avatarLocked: {
    opacity: 0.5,
  },
  avatarOptionName: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.text,
    marginTop: SPACING.xs,
    textAlign: 'center',
    lineHeight: 16,
  },
  avatarUnlockText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
    minHeight: 24,
    paddingHorizontal: 4,
  },
  avatarNameLocked: {
    color: COLORS.textMuted,
  },
  avatarSectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  premiumSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  premiumBanner: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  rotationTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  rotationTimerText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.5,
  },
  myCollectionHeader: {
    marginBottom: SPACING.md,
  },
  myCollectionBanner: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: 16,
  },
  myCollectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  myCollectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  myAvatarOption: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    position: 'relative',
  },
  myAvatarGlow: {
    shadowColor: 'rgba(255, 255, 255, 0.2)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  myAvatarRarity: {
    fontSize: 10,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 2,
  },

  headerCountdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.md,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.25)',
  },
  headerCountdownText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 1,
  },

  premiumAvatarOption: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },

  premiumGlow: {
    shadowColor: 'rgba(255, 255, 255, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  soldOutGlow: {
    shadowOpacity: 0.1,
  },
  priceTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  priceText: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  ownedTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  ownedText: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  editModal: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  editModalGradient: {
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    maxHeight: '100%',
  },
  editModalScrollView: {
    maxHeight: '100%',
  },
  editModalContent: {
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  inputHelper: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  saveButton: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  supportStyleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: SPACING.sm,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  supportStyleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  supportStyleTagText: {
    fontSize: 11,
    fontWeight: '600',
  },

  supportStyleHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'right',
  },
  recoveryDetails: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  detailRow: {
    marginBottom: SPACING.md,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  productBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  productText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  reasonTag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  customReasonTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    maxWidth: '80%',
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
    marginHorizontal: -SPACING.xs / 2,
  },
  reasonOption: {
    flexBasis: '31%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: 6,
    margin: SPACING.xs / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 70,
  },
  reasonOptionSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  reasonOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  reasonOptionTextSelected: {
    color: '#10B981',
  },

  bottomContainer: {
    alignItems: 'center',
    marginTop: 2,
    minHeight: 40,
  },
  avatarContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  avatarTop: {
    alignItems: 'center',
  },
  purchaseLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  purchaseLoadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  urgentBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
    borderWidth: 1,
  },

  
  // Purchase Modal Styles
  purchaseModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensure it appears on top
  },
  purchaseModal: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  purchaseModalGradient: {
    padding: SPACING.xl,
  },
  purchaseModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  purchaseTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  purchaseTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  purchaseAvatarShowcase: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  purchaseModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  purchaseModalDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  countdownContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countdownLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countdownTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  countdownUnit: {
    alignItems: 'center',
    minWidth: 36,
  },
  countdownNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#DC2626',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  countdownUnitText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#DC2626',
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  countdownSeparator: {
    fontSize: 20,
    fontWeight: '700',
    color: '#DC2626',
    marginHorizontal: 2,
    opacity: 0.5,
  },

  purchaseModalFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: SPACING.lg,
    marginTop: SPACING.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  purchaseButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  purchaseButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  purchaseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Success State Styles
  purchaseSuccessContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  successIconContainer: {
    marginBottom: SPACING.lg,
  },
  purchaseSuccessTitle: {
    fontSize: 26,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.sm,
  },
  purchaseSuccessText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  successButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  successButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Avatar Info Modal Styles
  avatarInfoModal: {
    width: '85%',
    maxWidth: 350,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  avatarInfoGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  avatarInfoHeader: {
    marginBottom: SPACING.md,
  },
  avatarInfoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  avatarInfoBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: SPACING.lg,
  },
  avatarInfoRarity: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  avatarInfoDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  avatarInfoStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  avatarInfoStat: {
    alignItems: 'center',
  },
  avatarInfoStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  avatarInfoStatLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  avatarInfoDismiss: {
    marginTop: SPACING.sm,
  },
  avatarInfoDismissText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  
  // Clean Profile Styles
  avatarTouchable: {
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  cleanMilestoneCard: {
    width: 85,
    height: 100,
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanMilestoneLocked: {
    opacity: 0.4,
  },
  cleanMilestoneIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cleanMilestoneTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  cleanMilestoneTitleLocked: {
    color: COLORS.textMuted,
  },
  cleanMilestoneDays: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },
  cleanMilestoneDaysLocked: {
    color: COLORS.textMuted,
  },
  cleanStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  cleanStatCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  cleanStatCardValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.xs,
    marginBottom: 2,
  },
  cleanStatCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Clean Journey Section Styles
  cleanProgressContainer: {
    marginBottom: SPACING.xl,
  },
  cleanProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  cleanProgressFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 3,
  },
  cleanProgressStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  cleanProgressPercent: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cleanProgressLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  cleanAchievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  cleanAchievementItem: {
    width: '33.33%',
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  cleanAchievementNext: {
    transform: [{ scale: 1.05 }],
  },
  cleanAchievementTitle: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.text,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  cleanAchievementTitleLocked: {
    color: COLORS.textMuted,
  },
  cleanAchievementDaysLeft: {
    fontSize: 9,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  fireHelperText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4, // Reduced spacing
    lineHeight: 16,
    fontWeight: '300',
  },

  profileHeaderGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.md,
  },
  
  // Avatar glow effects
  avatarGlowGreen: {
    shadowColor: 'rgba(134, 239, 172, 0.6)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarGlowBlue: {
    shadowColor: 'rgba(147, 197, 253, 0.6)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  avatarGlowAmber: {
    shadowColor: 'rgba(251, 191, 36, 0.6)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  
  // Achievement enhancements
  cleanAchievementUnlocked: {
    transform: [{ scale: 1.02 }],
  },
  achievementIconWrapper: {
    borderRadius: 35,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  // Section header enhancements
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  sectionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.15)',
  },
  sectionTextWrapper: {
    flex: 1,
  },

});

export default ProfileScreen; 