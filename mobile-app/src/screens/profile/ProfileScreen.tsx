import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
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
import DicebearAvatar, { STARTER_AVATARS, PROGRESS_AVATARS, PREMIUM_AVATARS, LIMITED_DROP_AVATARS, SEASONAL_AVATARS } from '../../components/common/DicebearAvatar';

// Helper function for seasonal avatars
const getCurrentSeason = (): string => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
};
import { AVATAR_BADGES } from '../../constants/avatars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/app';
import BuddyService from '../../services/buddyService';
import iapService from '../../services/iapService';

interface SupportStyle {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const SUPPORT_STYLES: SupportStyle[] = [
  {
    id: 'motivator',
    name: 'Motivator',
    icon: 'rocket',
    description: 'Cheers others on with enthusiasm',
    color: '#10B981'
  },
  {
    id: 'listener',
    name: 'Listener',
    icon: 'ear',
    description: 'Provides empathy and understanding',
    color: '#3B82F6'
  },
  {
    id: 'tough-love',
    name: 'Tough Love',
    icon: 'barbell',
    description: 'Gives direct, honest feedback',
    color: '#EF4444'
  },
  {
    id: 'analytical',
    name: 'Analytical',
    icon: 'analytics',
    description: 'Shares data-driven insights',
    color: '#8B5CF6'
  },
  {
    id: 'spiritual',
    name: 'Spiritual',
    icon: 'flower',
    description: 'Offers mindfulness and meditation',
    color: '#EC4899'
  },
  {
    id: 'practical',
    name: 'Practical',
    icon: 'build',
    description: 'Focuses on actionable solutions',
    color: '#F59E0B'
  },
  {
    id: 'humorous',
    name: 'Humorous',
    icon: 'happy',
    description: 'Uses humor to lighten the journey',
    color: '#06B6D4'
  },
  {
    id: 'mentor',
    name: 'Mentor',
    icon: 'school',
    description: 'Guides with experience and wisdom',
    color: '#10B981'
  }
];

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.progress);
  const { stepData } = useSelector((state: RootState) => state.onboarding);
  
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState({ type: 'dicebear', name: 'Recovery Warrior', style: 'warrior' });
  const [selectedStyles, setSelectedStyles] = useState<string[]>(user?.supportStyles || ['motivator']);
  const [displayName, setDisplayName] = useState(user?.displayName || user?.firstName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [connectedBuddiesCount, setConnectedBuddiesCount] = useState(0);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  
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
  
  // Countdown timer for limited drops
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second
    
    return () => clearInterval(timer);
  }, []);
  
  // Format countdown timer
  const formatCountdown = (endDate: string) => {
    const end = new Date(endDate);
    const now = currentTime;
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, total: diff };
  };
  
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
    await AsyncStorage.setItem('selected_avatar', JSON.stringify(newAvatar));
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

  const handleSaveProfile = async () => {
    try {
      // Update Redux state
      dispatch(updateUserData({ 
        displayName: displayName.trim(),
        supportStyles: selectedStyles,
        bio: bio.trim(),
        reasonsToQuit: selectedReasons,
        customReasonToQuit: customReason.trim()
      }));
      
      // Update AsyncStorage
      if (user) {
        const updatedUser = {
          ...user,
          displayName: displayName.trim(),
          supportStyles: selectedStyles,
          bio: bio.trim(),
          reasonsToQuit: selectedReasons,
          customReasonToQuit: customReason.trim()
        };
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      }
      
      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
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
      'This will clear all data and restart onboarding.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            dispatch(resetProgress());
            dispatch(resetOnboarding());
            dispatch(logoutUser());
          }
        }
      ]
    );
  };

  const handleNeuralTest = () => {
    Alert.alert(
      'Neural Test - Choose Test Type',
      'Select what you want to test',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Set Recovery Time', 
          onPress: () => {
            Alert.alert(
              'Set Recovery Time',
              'Jump to different recovery stages',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Day 1', 
                  onPress: async () => {
                    const testDate = new Date();
                    testDate.setDate(testDate.getDate() - 1);
                    dispatch(setQuitDate(testDate.toISOString()));
                    await dispatch(updateProgress());
                    
                    // Update all related stats
                    const state = store.getState();
                    const daysClean = 1;
                    const profile = state.auth.user?.nicotineProduct || { dailyCost: 15, dailyAmount: 20 };
                    dispatch(updateStats({
                      daysClean,
                      hoursClean: 24,
                      minutesClean: 1440,
                      secondsClean: 86400,
                      moneySaved: daysClean * profile.dailyCost,
                      unitsAvoided: daysClean * profile.dailyAmount,
                      streakDays: daysClean,
                      longestStreak: Math.max(state.progress.stats.longestStreak, daysClean)
                    }));
                    
                    // Plans track progress through completed goals, not time
                  }
                },
                { 
                  text: 'Day 3', 
                  onPress: async () => {
                    const testDate = new Date();
                    testDate.setDate(testDate.getDate() - 3);
                    dispatch(setQuitDate(testDate.toISOString()));
                    await dispatch(updateProgress());
                    
                    // Update all related stats
                    const state = store.getState();
                    const daysClean = 3;
                    const profile = state.auth.user?.nicotineProduct || { dailyCost: 15, dailyAmount: 20 };
                    dispatch(updateStats({
                      daysClean,
                      hoursClean: 72,
                      minutesClean: 4320,
                      secondsClean: 259200,
                      moneySaved: daysClean * profile.dailyCost,
                      unitsAvoided: daysClean * profile.dailyAmount,
                      streakDays: daysClean,
                      longestStreak: Math.max(state.progress.stats.longestStreak, daysClean)
                    }));
                    
                    // Plans track progress through completed goals, not time
                  }
                },
                { 
                  text: 'Week 1', 
                  onPress: async () => {
                    const testDate = new Date();
                    testDate.setDate(testDate.getDate() - 7);
                    dispatch(setQuitDate(testDate.toISOString()));
                    await dispatch(updateProgress());
                    
                    // Update all related stats
                    const state = store.getState();
                    const daysClean = 7;
                    const profile = state.auth.user?.nicotineProduct || { dailyCost: 15, dailyAmount: 20 };
                    dispatch(updateStats({
                      daysClean,
                      hoursClean: 168,
                      minutesClean: 10080,
                      secondsClean: 604800,
                      moneySaved: daysClean * profile.dailyCost,
                      unitsAvoided: daysClean * profile.dailyAmount,
                      streakDays: daysClean,
                      longestStreak: Math.max(state.progress.stats.longestStreak, daysClean)
                    }));
                    
                    // Plans track progress through completed goals, not time
                  }
                },
                { 
                  text: 'Month 1', 
                  onPress: async () => {
                    const testDate = new Date();
                    testDate.setDate(testDate.getDate() - 30);
                    dispatch(setQuitDate(testDate.toISOString()));
                    await dispatch(updateProgress());
                    
                    // Update all related stats
                    const state = store.getState();
                    const daysClean = 30;
                    const profile = state.auth.user?.nicotineProduct || { dailyCost: 15, dailyAmount: 20 };
                    dispatch(updateStats({
                      daysClean,
                      hoursClean: 720,
                      minutesClean: 43200,
                      secondsClean: 2592000,
                      moneySaved: daysClean * profile.dailyCost,
                      unitsAvoided: daysClean * profile.dailyAmount,
                      streakDays: daysClean,
                      longestStreak: Math.max(state.progress.stats.longestStreak, daysClean)
                    }));
                    
                    // Plans track progress through completed goals, not time
                  }
                },
                { 
                  text: 'Month 3', 
                  onPress: async () => {
                    const testDate = new Date();
                    testDate.setDate(testDate.getDate() - 90);
                    dispatch(setQuitDate(testDate.toISOString()));
                    await dispatch(updateProgress());
                    
                    // Update all related stats
                    const state = store.getState();
                    const daysClean = 90;
                    const profile = state.auth.user?.nicotineProduct || { dailyCost: 15, dailyAmount: 20 };
                    dispatch(updateStats({
                      daysClean,
                      hoursClean: 2160,
                      minutesClean: 129600,
                      secondsClean: 7776000,
                      moneySaved: daysClean * profile.dailyCost,
                      unitsAvoided: daysClean * profile.dailyAmount,
                      streakDays: daysClean,
                      longestStreak: Math.max(state.progress.stats.longestStreak, daysClean)
                    }));
                    
                    // Plans track progress through completed goals, not time
                  }
                },
                { 
                  text: 'Day 120', 
                  onPress: async () => {
                    const testDate = new Date();
                    testDate.setDate(testDate.getDate() - 120);
                    dispatch(setQuitDate(testDate.toISOString()));
                    await dispatch(updateProgress());
                    
                    // Update all related stats
                    const state = store.getState();
                    const daysClean = 120;
                    const profile = state.auth.user?.nicotineProduct || { dailyCost: 15, dailyAmount: 20 };
                    dispatch(updateStats({
                      daysClean,
                      hoursClean: 2880,
                      minutesClean: 172800,
                      secondsClean: 10368000,
                      moneySaved: daysClean * profile.dailyCost,
                      unitsAvoided: daysClean * profile.dailyAmount,
                      streakDays: daysClean,
                      longestStreak: Math.max(state.progress.stats.longestStreak, daysClean)
                    }));
                    
                    // Plans track progress through completed goals, not time
                  }
                },
                { 
                  text: 'Year 1', 
                  onPress: async () => {
                    const testDate = new Date();
                    testDate.setDate(testDate.getDate() - 365);
                    dispatch(setQuitDate(testDate.toISOString()));
                    await dispatch(updateProgress());
                    
                    // Update all related stats
                    const state = store.getState();
                    const daysClean = 365;
                    const profile = state.auth.user?.nicotineProduct || { dailyCost: 15, dailyAmount: 20 };
                    dispatch(updateStats({
                      daysClean,
                      hoursClean: 8760,
                      minutesClean: 525600,
                      secondsClean: 31536000,
                      moneySaved: daysClean * profile.dailyCost,
                      unitsAvoided: daysClean * profile.dailyAmount,
                      streakDays: daysClean,
                      longestStreak: Math.max(state.progress.stats.longestStreak, daysClean)
                    }));
                    
                    // Plans track progress through completed goals, not time
                  }
                }
              ]
            );
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
                { 
                  text: 'Other', 
                  onPress: async () => {
                    const newProfile = {
                      category: 'other' as const,
                      dailyAmount: 10,
                      dailyCost: 10,
                      nicotineContent: 5,
                      harmLevel: 5
                    };
                    
                    // Update auth state with new nicotine product
                    dispatch(updateUserData({
                      nicotineProduct: {
                        id: 'other',
                        name: 'Other',
                        category: 'other',
                        nicotineContent: 5,
                        harmLevel: 5
                      },
                      packagesPerDay: 1,
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
                    Alert.alert('Success', 'Product type changed to Other');
                  }
                }
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
                  onPress: () => {
                    dispatch(updateUserData({ gender: 'male' }));
                    Alert.alert('Success', 'Gender changed to Male');
                  }
                },
                { 
                  text: 'Female', 
                  onPress: () => {
                    dispatch(updateUserData({ gender: 'female' }));
                    Alert.alert('Success', 'Gender changed to Female');
                  }
                },
                { 
                  text: 'Non-binary', 
                  onPress: () => {
                    dispatch(updateUserData({ gender: 'non-binary' }));
                    Alert.alert('Success', 'Gender changed to Non-binary');
                  }
                },
                { 
                  text: 'Prefer not to say', 
                  onPress: () => {
                    dispatch(updateUserData({ gender: 'prefer-not-to-say' }));
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
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <TouchableOpacity 
                onPress={() => {
                  console.log('🎯 Avatar button clicked!');
                  console.log('🎯 Current showAvatarModal state:', showAvatarModal);
                  setShowAvatarModal(true);
                  console.log('🎯 Setting showAvatarModal to true');
                }}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View>
                  <DicebearAvatar
                    userId={user?.id || 'default-user'}
                    size={120}
                    daysClean={daysClean}
                    style={selectedAvatar.style as any}
                  />
                  
                  <View style={styles.editAvatarBadge} pointerEvents="none">
                    <Ionicons name="camera" size={14} color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>
              
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>
                  {user?.displayName || stepData.firstName || user?.email?.split('@')[0] || 'Warrior'}
                </Text>
                <Text style={styles.userTitle}>{selectedAvatar.name}</Text>
                
                {/* Support Style Tags */}
                <View style={styles.supportStyleTags}>
                  {selectedStyles.map((styleId) => {
                    const style = SUPPORT_STYLES.find(s => s.id === styleId);
                    if (!style) return null;
                    return (
                      <View key={styleId} style={[styles.supportStyleTag, { backgroundColor: `${style.color}15`, borderColor: `${style.color}30` }]}>
                        <Ionicons name={style.icon as any} size={12} color={style.color} />
                        <Text style={[styles.supportStyleTagText, { color: style.color }]}>{style.name}</Text>
                      </View>
                    );
                  })}
                </View>
                
                {user?.bio && (
                  <Text style={styles.bio}>{user.bio}</Text>
                )}
                
                {/* Recovery Details */}
                <View style={styles.recoveryDetails}>
                  {/* Quitting Product */}
                  {user?.nicotineProduct && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Quitting:</Text>
                      <View style={styles.productBadge}>
                        <Text style={styles.productText}>{user.nicotineProduct.name || 'Nicotine'}</Text>
                      </View>
                    </View>
                  )}
                  
                  {/* Reasons to Quit */}
                  {(user?.reasonsToQuit || stepData?.reasonsToQuit) && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>My Why:</Text>
                      <View style={styles.reasonsContainer}>
                        {(user?.reasonsToQuit || stepData?.reasonsToQuit || []).map((reason) => {
                          const reasonLabels: Record<string, string> = {
                            'health': 'Health',
                            'family': 'Family',
                            'money': 'Money',
                            'freedom': 'Freedom',
                            'energy': 'Energy',
                            'confidence': 'Confidence'
                          };
                          return (
                            <View key={reason} style={styles.reasonTag}>
                              <Text style={styles.reasonText}>{reasonLabels[reason] || reason}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
                
                <TouchableOpacity style={styles.editProfileButton} onPress={() => setShowEditModal(true)}>
                  <Ionicons name="create-outline" size={16} color="#8B5CF6" />
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
              
              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.quickStat}>
                  <Text style={styles.quickStatValue}>{userStats.daysClean}</Text>
                  <Text style={styles.quickStatLabel}>Days Clean</Text>
                </View>
                <View style={styles.quickStatDivider} />
                <View style={styles.quickStat}>
                  <Text style={styles.quickStatValue}>{connectedBuddiesCount}</Text>
                  <Text style={styles.quickStatLabel}>Buddies</Text>
                </View>
                <View style={styles.quickStatDivider} />
                <View style={styles.quickStat}>
                  <Text style={styles.quickStatValue}>{Math.round(userStats.healthScore)}%</Text>
                  <Text style={styles.quickStatLabel}>Health</Text>
                </View>
              </View>
            </View>

            {/* Milestones */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Milestones</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.milestonesScroll}
              >
                {[
                  { days: 1, title: 'First Step', icon: 'footsteps', color: '#10B981', achieved: daysClean >= 1 },
                  { days: 3, title: 'Breaking Free', icon: 'flash', color: '#F59E0B', achieved: daysClean >= 3 },
                  { days: 7, title: 'One Week', icon: 'shield-checkmark', color: '#3B82F6', achieved: daysClean >= 7 },
                  { days: 14, title: 'Two Weeks', icon: 'trending-up', color: '#8B5CF6', achieved: daysClean >= 14 },
                  { days: 30, title: 'One Month', icon: 'medal', color: '#EC4899', achieved: daysClean >= 30 },
                  { days: 60, title: 'Two Months', icon: 'flame', color: '#EF4444', achieved: daysClean >= 60 },
                  { days: 90, title: 'Three Months', icon: 'rocket', color: '#06B6D4', achieved: daysClean >= 90 },
                  { days: 180, title: 'Six Months', icon: 'star', color: '#F59E0B', achieved: daysClean >= 180 },
                  { days: 365, title: 'One Year', icon: 'trophy', color: '#FFD700', achieved: daysClean >= 365 },
                ].map((milestone, index) => (
                  <View key={index} style={[styles.milestoneCard, !milestone.achieved && styles.milestoneLocked]}>
                    <LinearGradient
                      colors={milestone.achieved 
                        ? ['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.05)']
                        : ['rgba(55, 65, 81, 0.3)', 'rgba(31, 41, 55, 0.3)']}
                      style={styles.milestoneGradient}
                    >
                      <View style={[
                        styles.milestoneIconContainer,
                        milestone.achieved && { backgroundColor: `${milestone.color}20` }
                      ]}>
                        <Ionicons 
                          name={milestone.icon as any} 
                          size={28} 
                          color={milestone.achieved ? milestone.color : COLORS.textMuted} 
                        />
                      </View>
                      <Text style={[styles.milestoneTitle, !milestone.achieved && styles.milestoneTitleLocked]}>
                        {milestone.title}
                      </Text>
                      <Text style={[styles.milestoneDays, !milestone.achieved && styles.milestoneDaysLocked]}>
                        Day {milestone.days}
                      </Text>
                    </LinearGradient>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Stats Overview */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Journey</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.05)']}
                    style={styles.statCardGradient}
                  >
                    <Ionicons name="cash-outline" size={24} color="#10B981" />
                    <Text style={styles.statValue}>${userStats.moneySaved}</Text>
                    <Text style={styles.statLabel}>Money Saved</Text>
                  </LinearGradient>
                </View>
                
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.05)']}
                    style={styles.statCardGradient}
                  >
                    <Ionicons name="trophy" size={24} color="#8B5CF6" />
                    <Text style={styles.statValue}>{userStats.longestStreak}</Text>
                    <Text style={styles.statLabel}>Best Streak</Text>
                  </LinearGradient>
                </View>
                
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['rgba(245, 158, 11, 0.1)', 'rgba(239, 68, 68, 0.05)']}
                    style={styles.statCardGradient}
                  >
                    <Ionicons name="time-outline" size={24} color="#F59E0B" />
                    <Text style={styles.statValue}>{Math.round(stats?.lifeRegained || 0)}h</Text>
                    <Text style={styles.statLabel}>Life Regained</Text>
                  </LinearGradient>
                </View>
                
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={['rgba(59, 130, 246, 0.1)', 'rgba(139, 92, 246, 0.05)']}
                    style={styles.statCardGradient}
                  >
                    <Ionicons name="people" size={24} color="#3B82F6" />
                    <Text style={styles.statValue}>{connectedBuddiesCount}</Text>
                    <Text style={styles.statLabel}>Buddies</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>

            {/* Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <View style={styles.settingsCard}>
                <TouchableOpacity style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                      <Ionicons name="notifications-outline" size={20} color="#10B981" />
                    </View>
                    <Text style={styles.settingText}>Notifications</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                      <Ionicons name="shield-checkmark-outline" size={20} color="#8B5CF6" />
                    </View>
                    <Text style={styles.settingText}>Privacy</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.settingItem, { borderBottomWidth: 0 }]}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                      <Ionicons name="help-circle-outline" size={20} color="#3B82F6" />
                    </View>
                    <Text style={styles.settingText}>Help & Support</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Developer Tools */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Developer Tools</Text>
              <View style={styles.settingsCard}>
                <TouchableOpacity style={styles.settingItem} onPress={handleNeuralTest}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                      <Ionicons name="flash" size={20} color="#F59E0B" />
                    </View>
                    <Text style={styles.settingText}>Neural Test</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.settingItem, { borderBottomWidth: 0 }]} onPress={handleAppReset}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                      <Ionicons name="refresh" size={20} color="#EF4444" />
                    </View>
                    <Text style={styles.settingText}>Reset App</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Test Avatar Modal Button */}
            <TouchableOpacity 
              style={[styles.signOutButton, { marginBottom: SPACING.md }]} 
              onPress={() => {
                console.log('🔥 TEST BUTTON: Opening avatar modal');
                setShowAvatarModal(true);
              }}
            >
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)']}
                style={styles.signOutGradient}
              >
                <Ionicons name="color-palette-outline" size={20} color="#8B5CF6" />
                <Text style={[styles.signOutText, { color: '#8B5CF6' }]}>Test Avatar Modal</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Test Purchase Modal Button */}
            <TouchableOpacity 
              style={[styles.signOutButton, { marginBottom: SPACING.md }]} 
              onPress={() => {
                console.log('🔥 TEST BUTTON: Opening purchase modal directly');
                setShowAvatarModal(false); // Close avatar modal first
                setSelectedPurchaseAvatar({
                  name: 'Test Avatar',
                  description: 'Testing the purchase modal',
                  price: '$9.99',
                  styleKey: 'diamondChampion',
                  type: 'premium'
                });
                setShowPurchaseModal(true);
              }}
            >
              <LinearGradient
                colors={['rgba(220, 38, 38, 0.1)', 'rgba(220, 38, 38, 0.05)']}
                style={styles.signOutGradient}
              >
                <Ionicons name="cart-outline" size={20} color="#DC2626" />
                <Text style={[styles.signOutText, { color: '#DC2626' }]}>Test Purchase Modal</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign Out Button */}
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.05)']}
                style={styles.signOutGradient}
              >
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text style={styles.signOutText}>Sign Out</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>

        {/* Avatar Selection Modal */}
        {console.log('🔥 Avatar Modal State:', { showAvatarModal })}
        <Modal
          visible={showAvatarModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAvatarModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.avatarModal}>
              <LinearGradient
                colors={['#1F2937', '#111827']}
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
                  {/* Starter Avatars */}
                  <Text style={styles.avatarSectionTitle}>Choose Your Hero</Text>
                  <Text style={styles.avatarSectionSubtitle}>Pick your recovery companion</Text>
                  <View style={styles.avatarGrid}>
                    {Object.entries(STARTER_AVATARS).map(([styleKey, styleConfig]) => {
                      const isSelected = selectedAvatar.type === 'dicebear' && selectedAvatar.style === styleKey;
                      
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
                      const isSelected = selectedAvatar.type === 'dicebear' && selectedAvatar.style === styleKey;
                      
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
                      colors={['rgba(236, 72, 153, 0.1)', 'rgba(251, 146, 60, 0.1)']}
                      style={styles.premiumBanner}
                    >
                      <View style={styles.bannerHeader}>
                        <Ionicons name="sparkles" size={20} color="#EC4899" />
                        <Text style={styles.premiumTitle}>Premium Collection</Text>
                      </View>
                      <Text style={styles.premiumSubtitle}>Stand out with exclusive mythic avatars</Text>
                    </LinearGradient>
                    
                    <View style={styles.avatarGrid}>
                      {Object.entries(PREMIUM_AVATARS).map(([styleKey, styleConfig]) => {
                        const isSelected = selectedAvatar.type === 'dicebear' && selectedAvatar.style === styleKey;
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
                              setShowAvatarModal(false); // Close avatar modal first
                              setTimeout(() => {
                                setShowPurchaseModal(true);
                              }, 300); // Small delay to ensure proper modal transition
                            }}
                          >
                            <View style={styles.avatarContent}>
                              {styleConfig.icon && (
                                <View style={styles.premiumIcon}>
                                  <Ionicons name={styleConfig.icon as any} size={16} color="#EC4899" />
                                </View>
                              )}
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

                  {/* Limited Drops - 14 Days Only */}
                  <View style={styles.premiumSection}>
                    <LinearGradient
                      colors={['rgba(220, 38, 38, 0.1)', 'rgba(251, 191, 36, 0.1)']}
                      style={styles.premiumBanner}
                    >
                      <View style={styles.bannerHeader}>
                        <Ionicons name="flash" size={20} color="#DC2626" />
                        <Text style={styles.premiumTitle}>Limited Drops</Text>
                      </View>
                      <Text style={styles.premiumSubtitle}>14 days only - once they're gone, they're gone!</Text>
                    </LinearGradient>
                    
                    <View style={styles.avatarGrid}>
                      {Object.entries(LIMITED_DROP_AVATARS).map(([styleKey, styleConfig]) => {
                        const isSelected = selectedAvatar.type === 'dicebear' && selectedAvatar.style === styleKey;
                        const isPurchased = user?.purchasedAvatars?.includes(styleKey) || false;
                        
                        // Check availability
                        const isAvailable = styleConfig.limitedEdition.isAvailable ? styleConfig.limitedEdition.isAvailable() : true;
                        const daysRemaining = styleConfig.limitedEdition.getDaysRemaining ? styleConfig.limitedEdition.getDaysRemaining() : null;
                        
                        // Don't show avatars that aren't currently available (unless purchased)
                        if (!isAvailable && !isPurchased) {
                          return null;
                        }
                        
                        return (
                          <TouchableOpacity
                            key={styleKey}
                            style={[
                              styles.avatarOption,
                              styles.limitedAvatarOption,
                              isSelected && styles.avatarOptionSelected
                            ]}
                            onPress={() => {
                              if (isPurchased) {
                                // Already purchased, just select it
                                handleAvatarSelect(styleKey, styleConfig.name);
                                return;
                              }
                              
                              console.log('🎯 Limited avatar clicked:', styleKey, styleConfig);
                              setSelectedPurchaseAvatar({
                                ...styleConfig,
                                styleKey,
                                daysRemaining,
                                type: 'limited'
                              });
                              console.log('🎯 Setting showPurchaseModal to true');
                              setShowAvatarModal(false); // Close avatar modal first
                              setTimeout(() => {
                                setShowPurchaseModal(true);
                              }, 300); // Small delay to ensure proper modal transition
                            }}
                          >
                            <View style={styles.avatarContent}>
                              {styleConfig.icon && (
                                <View style={styles.limitedIcon}>
                                  <Ionicons name={styleConfig.icon as any} size={16} color="#DC2626" />
                                </View>
                              )}
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
                              <View style={styles.limitedBottomContainer}>
                                {isPurchased ? (
                                  <View style={styles.ownedTag}>
                                    <Text style={styles.ownedText}>Owned</Text>
                                  </View>
                                ) : (
                                  <>
                                    {daysRemaining !== null && (
                                      <View style={[styles.limitedBadge, daysRemaining <= 3 && styles.urgentBadge]}>
                                        <Text style={styles.limitedText}>
                                          {daysRemaining <= 3 ? `${daysRemaining}d left!` : `${daysRemaining} days`}
                                        </Text>
                                      </View>
                                    )}
                                    {styleConfig.limitedEdition.type === 'seasonal' && (
                                      <View style={styles.seasonBadge}>
                                        <Text style={styles.seasonText}>
                                          {styleConfig.limitedEdition.season}
                                        </Text>
                                      </View>
                                    )}
                                    <View style={styles.priceTag}>
                                      <Text style={styles.priceText}>{styleConfig.price}</Text>
                                    </View>
                                  </>
                                )}
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Seasonal Collection - All Year Round */}
                  <View style={styles.premiumSection}>
                    <LinearGradient
                      colors={['rgba(251, 191, 36, 0.1)', 'rgba(16, 185, 129, 0.1)']}
                      style={styles.premiumBanner}
                    >
                      <View style={styles.bannerHeader}>
                        <Ionicons name="leaf" size={20} color="#FCD34D" />
                        <Text style={styles.premiumTitle}>Seasonal Collection</Text>
                      </View>
                      <Text style={styles.premiumSubtitle}>Exclusive seasonal avatars - collect them all!</Text>
                    </LinearGradient>
                    
                    <View style={styles.avatarGrid}>
                      {Object.entries(SEASONAL_AVATARS).filter(([_, styleConfig]) => {
                        const currentSeason = getCurrentSeason();
                        return styleConfig.limitedEdition.season === currentSeason;
                      }).map(([styleKey, styleConfig]) => {
                        const isSelected = selectedAvatar.type === 'dicebear' && selectedAvatar.style === styleKey;
                        const isPurchased = user?.purchasedAvatars?.includes(styleKey) || false;
                        const currentSeason = getCurrentSeason();
                        const isCurrentSeason = styleConfig.limitedEdition.season === currentSeason;
                        
                        return (
                          <TouchableOpacity
                            key={styleKey}
                            style={[
                              styles.avatarOption,
                              styles.limitedAvatarOption,
                              isSelected && styles.avatarOptionSelected
                            ]}
                            onPress={() => {
                              if (isPurchased) {
                                // Already purchased, just select it
                                handleAvatarSelect(styleKey, styleConfig.name);
                                return;
                              }
                              
                              console.log('🎯 Seasonal avatar clicked:', styleKey, styleConfig);
                              setSelectedPurchaseAvatar({
                                ...styleConfig,
                                styleKey,
                                isCurrentSeason,
                                type: 'seasonal'
                              });
                              console.log('🎯 Setting showPurchaseModal to true for seasonal');
                              setShowAvatarModal(false); // Close avatar modal first
                              setTimeout(() => {
                                setShowPurchaseModal(true);
                              }, 300); // Small delay to ensure proper modal transition
                            }}
                          >
                            <View style={styles.avatarContent}>
                              {styleConfig.icon && (
                                <View style={styles.limitedIcon}>
                                  <Ionicons name={styleConfig.icon as any} size={16} color={isCurrentSeason ? '#10B981' : '#FCD34D'} />
                                </View>
                              )}
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
                              <View style={styles.limitedBottomContainer}>
                                {isPurchased ? (
                                  <View style={styles.ownedTag}>
                                    <Text style={styles.ownedText}>Owned</Text>
                                  </View>
                                ) : (
                                  <>
                                    <View style={[styles.seasonBadge, isCurrentSeason && styles.currentSeasonBadge]}>
                                      <Text style={[styles.seasonText, isCurrentSeason && styles.currentSeasonText]}>
                                        {styleConfig.limitedEdition.season}
                                      </Text>
                                    </View>
                                    <View style={styles.priceTag}>
                                      <Text style={styles.priceText}>{styleConfig.price}</Text>
                                    </View>
                                  </>
                                )}
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

        {/* Edit Profile Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEditModal(false)}
        >
          <KeyboardAvoidingView 
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.editModal}>
              <LinearGradient
                colors={['#1F2937', '#111827']}
                style={styles.editModalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Edit Profile</Text>
                  <TouchableOpacity onPress={() => setShowEditModal(false)}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView 
                  style={styles.editModalScrollView}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.editModalContent}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Display Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Choose your anonymous name"
                        placeholderTextColor={COLORS.textMuted}
                        value={displayName}
                        onChangeText={setDisplayName}
                        maxLength={30}
                      />
                      <Text style={styles.inputHelper}>This is how you'll appear to other users</Text>
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Bio</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Ex: Mom of 2, quit vaping for my kids. Love hiking and coffee chats!"
                        placeholderTextColor={COLORS.textMuted}
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        numberOfLines={3}
                        maxLength={150}
                      />
                      <Text style={styles.inputHelper}>{bio.length}/150 characters</Text>
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Support Style</Text>
                      <Text style={styles.inputHelper}>Choose up to 3 styles that describe you</Text>
                      
                      <View style={styles.supportStyleGridCompact}>
                        {SUPPORT_STYLES.map((style) => (
                          <TouchableOpacity
                            key={style.id}
                            style={[
                              styles.supportStyleOptionCompact,
                              selectedStyles.includes(style.id) && [
                                styles.supportStyleOptionCompactSelected,
                                { borderColor: style.color, backgroundColor: `${style.color}10` }
                              ]
                            ]}
                            onPress={() => handleStyleToggle(style.id)}
                          >
                            <Ionicons 
                              name={style.icon as any} 
                              size={20} 
                              color={selectedStyles.includes(style.id) ? style.color : COLORS.textMuted} 
                            />
                            <Text style={[
                              styles.supportStyleNameCompact,
                              selectedStyles.includes(style.id) && { color: style.color }
                            ]}>
                              {style.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <Text style={styles.supportStyleHint}>
                        {selectedStyles.length}/3 selected
                      </Text>
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Reasons to Quit</Text>
                      <Text style={styles.inputHelper}>What drives your recovery journey?</Text>
                      
                      <View style={styles.reasonsGrid}>
                        {[
                          { id: 'health', label: 'Health', icon: 'heart-outline' },
                          { id: 'family', label: 'Family', icon: 'home-outline' },
                          { id: 'money', label: 'Money', icon: 'wallet-outline' },
                          { id: 'freedom', label: 'Freedom', icon: 'leaf-outline' },
                          { id: 'energy', label: 'Energy', icon: 'flash-outline' },
                          { id: 'confidence', label: 'Confidence', icon: 'trophy-outline' }
                        ].map((reason) => (
                          <TouchableOpacity
                            key={reason.id}
                            style={[
                              styles.reasonOption,
                              selectedReasons.includes(reason.id) && styles.reasonOptionSelected
                            ]}
                            onPress={() => {
                              if (selectedReasons.includes(reason.id)) {
                                setSelectedReasons(selectedReasons.filter(r => r !== reason.id));
                              } else {
                                setSelectedReasons([...selectedReasons, reason.id]);
                              }
                            }}
                          >
                            <Ionicons 
                              name={reason.icon as any} 
                              size={20} 
                              color={selectedReasons.includes(reason.id) ? '#10B981' : COLORS.textMuted} 
                            />
                            <Text style={[
                              styles.reasonOptionText,
                              selectedReasons.includes(reason.id) && styles.reasonOptionTextSelected
                            ]}>
                              {reason.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Personal Reason (Optional)</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="What's your unique motivation?"
                        placeholderTextColor={COLORS.textMuted}
                        value={customReason}
                        onChangeText={setCustomReason}
                        multiline
                        numberOfLines={2}
                        maxLength={100}
                      />
                      <Text style={styles.inputHelper}>Private - only visible to you ({customReason.length}/100)</Text>
                    </View>
                  </View>
                </ScrollView>
                
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Custom Purchase Modal */}
        {console.log('🔥 Purchase Modal State:', { showPurchaseModal, selectedPurchaseAvatar })}
        <Modal
          visible={showPurchaseModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => {
            if (!purchaseLoading) {
              setShowPurchaseModal(false);
              setPurchaseSuccess(false);
              // Optionally reopen avatar modal
              setTimeout(() => {
                setShowAvatarModal(true);
              }, 300);
            }
          }}
        >
          <View style={styles.purchaseModalOverlay}>
            <View style={styles.purchaseModal}>
              <LinearGradient
                colors={purchaseSuccess ? ['#065F46', '#064E3B'] : ['#1F2937', '#111827']}
                style={styles.purchaseModalGradient}
              >
                {purchaseSuccess ? (
                  // Success State
                  <View style={styles.purchaseSuccessContent}>
                    <View style={styles.successIconContainer}>
                      <Ionicons name="checkmark-circle" size={80} color="#10B981" />
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
                      }}
                    >
                      <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={styles.successButtonGradient}
                      >
                        <Text style={styles.successButtonText}>Use Avatar</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // Purchase State
                  <>
                    <View style={styles.purchaseModalHeader}>
                      <View style={styles.purchaseTypeIndicator}>
                        <Ionicons 
                          name={
                            selectedPurchaseAvatar?.type === 'limited' ? 'flash' :
                            selectedPurchaseAvatar?.type === 'seasonal' ? 'leaf' :
                            'sparkles'
                          } 
                          size={16} 
                          color={
                            selectedPurchaseAvatar?.type === 'limited' ? '#DC2626' :
                            selectedPurchaseAvatar?.type === 'seasonal' ? '#FCD34D' :
                            '#EC4899'
                          } 
                        />
                        <Text style={[
                          styles.purchaseTypeText,
                          selectedPurchaseAvatar?.type === 'limited' && { color: '#DC2626' },
                          selectedPurchaseAvatar?.type === 'seasonal' && { color: '#FCD34D' },
                          selectedPurchaseAvatar?.type === 'premium' && { color: '#EC4899' }
                        ]}>
                          {selectedPurchaseAvatar?.type === 'limited' ? 'Limited Drop' :
                           selectedPurchaseAvatar?.type === 'seasonal' ? 'Seasonal' :
                           'Premium'}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => {
                          setShowPurchaseModal(false);
                          setPurchaseSuccess(false);
                          // Reopen avatar modal
                          setTimeout(() => {
                            setShowAvatarModal(true);
                          }, 300);
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
                    
                    {/* Limited Drop Timer */}
                    {selectedPurchaseAvatar?.type === 'limited' && selectedPurchaseAvatar?.limitedEdition?.availableUntil && (
                      <View style={styles.countdownContainer}>
                        <Ionicons name="time-outline" size={16} color="#DC2626" />
                        <Text style={styles.countdownLabel}>Ends in:</Text>
                        {(() => {
                          const countdown = formatCountdown(selectedPurchaseAvatar.limitedEdition.availableUntil);
                          return (
                            <View style={styles.countdownTimer}>
                              <View style={styles.countdownUnit}>
                                <Text style={styles.countdownNumber}>{countdown.days}</Text>
                                <Text style={styles.countdownUnitText}>DAYS</Text>
                              </View>
                              <Text style={styles.countdownSeparator}>:</Text>
                              <View style={styles.countdownUnit}>
                                <Text style={styles.countdownNumber}>{String(countdown.hours).padStart(2, '0')}</Text>
                                <Text style={styles.countdownUnitText}>HRS</Text>
                              </View>
                              <Text style={styles.countdownSeparator}>:</Text>
                              <View style={styles.countdownUnit}>
                                <Text style={styles.countdownNumber}>{String(countdown.minutes).padStart(2, '0')}</Text>
                                <Text style={styles.countdownUnitText}>MIN</Text>
                              </View>
                              <Text style={styles.countdownSeparator}>:</Text>
                              <View style={styles.countdownUnit}>
                                <Text style={styles.countdownNumber}>{String(countdown.seconds).padStart(2, '0')}</Text>
                                <Text style={styles.countdownUnitText}>SEC</Text>
                              </View>
                            </View>
                          );
                        })()}
                      </View>
                    )}
                    
                    {/* Seasonal Indicator */}
                    {selectedPurchaseAvatar?.type === 'seasonal' && (
                      <View style={styles.seasonalIndicator}>
                        <Ionicons 
                          name={
                            selectedPurchaseAvatar.limitedEdition?.season === 'winter' ? 'snow' :
                            selectedPurchaseAvatar.limitedEdition?.season === 'spring' ? 'flower' :
                            selectedPurchaseAvatar.limitedEdition?.season === 'summer' ? 'sunny' :
                            'leaf'
                          } 
                          size={16} 
                          color={selectedPurchaseAvatar.isCurrentSeason ? '#10B981' : '#FCD34D'} 
                        />
                        <Text style={[
                          styles.seasonalText,
                          selectedPurchaseAvatar.isCurrentSeason && styles.seasonalTextActive
                        ]}>
                          {selectedPurchaseAvatar.limitedEdition?.season} Exclusive
                          {selectedPurchaseAvatar.isCurrentSeason && ' (Available Now!)'}
                        </Text>
                      </View>
                    )}
                    
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
                            // Reopen avatar modal
                            setTimeout(() => {
                              setShowAvatarModal(true);
                            }, 300);
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
                              console.log('🎯 Initializing IAP service...');
                              await iapService.initialize();
                              console.log('🎯 IAP initialized, attempting purchase...');
                              const result = await iapService.purchaseAvatar(selectedPurchaseAvatar.styleKey);
                              
                              if (result.success) {
                                // Update user's purchased avatars
                                const updatedAvatars = [...(user?.purchasedAvatars || []), selectedPurchaseAvatar.styleKey];
                                dispatch(updateUserData({ purchasedAvatars: updatedAvatars }));
                                
                                // Update AsyncStorage
                                if (user) {
                                  const updatedUser = {
                                    ...user,
                                    purchasedAvatars: updatedAvatars
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
                          <LinearGradient
                            colors={['#8B5CF6', '#7C3AED']}
                            style={[styles.purchaseButtonGradient, purchaseLoading && { opacity: 0.7 }]}
                          >
                            {purchaseLoading ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <>
                                <Ionicons name="cart" size={18} color="#FFFFFF" />
                                <Text style={styles.purchaseButtonText}>Purchase</Text>
                              </>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </LinearGradient>
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
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  editAvatarBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#8B5CF6',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  userTitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    lineHeight: 20,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: SPACING.xs,
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
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  signOutButton: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  signOutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  avatarSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  },
  avatarOptionSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
  },
  avatarLocked: {
    opacity: 0.5,
  },
  avatarOptionName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xs,
    textAlign: 'center',
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
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
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
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  premiumAvatarOption: {
    borderWidth: 2,
    borderColor: 'rgba(236, 72, 153, 0.3)',
    backgroundColor: 'rgba(236, 72, 153, 0.05)',
  },
  limitedAvatarOption: {
    borderWidth: 2,
    borderColor: 'rgba(220, 38, 38, 0.3)',
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
    position: 'relative',
  },
  soldOutOption: {
    opacity: 0.5,
  },
  limitedIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    zIndex: 1,
  },
  premiumIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    zIndex: 1,
  },
  limitedBadge: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  limitedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  premiumGlow: {
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  soldOutGlow: {
    shadowOpacity: 0.1,
  },
  priceTag: {
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  priceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FB923C',
  },
  ownedTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  ownedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
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
  supportStyleGridCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
    marginHorizontal: -3,
  },
  supportStyleOptionCompact: {
    flexBasis: '31%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    margin: 3,
    minHeight: 65,
  },
  supportStyleOptionCompactSelected: {
    borderWidth: 1.5,
  },
  supportStyleNameCompact: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
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
  limitedBottomContainer: {
    alignItems: 'center',
    marginTop: 2,
    minHeight: 40,
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
  seasonBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  seasonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FCD34D',
    textTransform: 'capitalize',
  },
  currentSeasonBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
    borderWidth: 1,
  },
  currentSeasonText: {
    color: '#10B981',
  },
  
  // Purchase Modal Styles
  purchaseModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
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
  seasonalIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  seasonalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FCD34D',
    textTransform: 'capitalize',
  },
  seasonalTextActive: {
    color: '#10B981',
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
    fontSize: 28,
    fontWeight: '700',
    color: '#10B981',
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
});

export default ProfileScreen; 