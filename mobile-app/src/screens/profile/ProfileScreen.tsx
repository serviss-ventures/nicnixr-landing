import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { logoutUser, updateUserData } from '../../store/slices/authSlice';
import { resetProgress, setQuitDate, updateProgress, setUserProfile } from '../../store/slices/progressSlice';
import { resetOnboarding } from '../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from '../../components/common/Avatar';
import CustomAvatar from '../../components/common/CustomAvatar';
import { CHARACTER_AVATARS, AVATAR_BADGES, getUnlockedAvatars } from '../../constants/avatars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/app';
import BuddyService from '../../services/buddyService';

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
  const [selectedAvatar, setSelectedAvatar] = useState({ type: 'ninja', name: 'Shadow Ninja' });
  const [selectedStyles, setSelectedStyles] = useState<string[]>(user?.supportStyles || ['motivator']);
  const [displayName, setDisplayName] = useState(user?.displayName || user?.firstName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [connectedBuddiesCount, setConnectedBuddiesCount] = useState(0);
  
  const daysClean = stats?.daysClean || 0;
  const unlockedAvatars = getUnlockedAvatars(daysClean, 'character');
  
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
  
  // Calculate user stats
  const userStats = {
    daysClean: daysClean,
    moneySaved: stats?.moneySaved || 0,
    healthScore: stats?.healthScore || 0,
    buddiesHelped: connectedBuddiesCount, // Use actual connected buddies count
    currentStreak: daysClean,
    longestStreak: Math.max(daysClean, 14), // Mock data
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
        bio: bio.trim()
      }));
      
      // Update AsyncStorage
      if (user) {
        const updatedUser = {
          ...user,
          displayName: displayName.trim(),
          supportStyles: selectedStyles,
          bio: bio.trim()
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
                  onPress: () => {
                    const testDate = new Date();
                    testDate.setDate(testDate.getDate() - 1);
                    dispatch(setQuitDate(testDate.toISOString()));
                    dispatch(updateProgress());
                  }
                },
                { 
                  text: 'Day 3', 
                  onPress: () => {
                    const testDate = new Date();
                    testDate.setDate(testDate.getDate() - 3);
                    dispatch(setQuitDate(testDate.toISOString()));
                    dispatch(updateProgress());
                  }
                },
                { 
                  text: 'Week 1', 
                  onPress: () => {
                    const testDate = new Date();
                    testDate.setDate(testDate.getDate() - 7);
                    dispatch(setQuitDate(testDate.toISOString()));
                    dispatch(updateProgress());
                  }
                },
                { 
                  text: 'Month 1', 
                  onPress: () => {
                    const testDate = new Date();
                    testDate.setDate(testDate.getDate() - 30);
                    dispatch(setQuitDate(testDate.toISOString()));
                    dispatch(updateProgress());
                  }
                },
                { 
                  text: 'Month 3', 
                  onPress: () => {
                    const testDate = new Date();
                    testDate.setDate(testDate.getDate() - 90);
                    dispatch(setQuitDate(testDate.toISOString()));
                    dispatch(updateProgress());
                  }
                },
                { 
                  text: 'Day 120', 
                  onPress: () => {
                    const testDate = new Date();
                    testDate.setDate(testDate.getDate() - 120);
                    dispatch(setQuitDate(testDate.toISOString()));
                    dispatch(updateProgress());
                  }
                },
                { 
                  text: 'Year 1', 
                  onPress: () => {
                    const testDate = new Date();
                    testDate.setDate(testDate.getDate() - 365);
                    dispatch(setQuitDate(testDate.toISOString()));
                    dispatch(updateProgress());
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
                  onPress: () => {
                    dispatch(setUserProfile({
                      category: 'cigarettes',
                      dailyAmount: 20,
                      dailyCost: 15,
                      nicotineContent: 1.2,
                      harmLevel: 9
                    }));
                    dispatch(updateProgress());
                    Alert.alert('Success', 'Product type changed to Cigarettes');
                  }
                },
                { 
                  text: 'Vape/E-cigarette', 
                  onPress: () => {
                    dispatch(setUserProfile({
                      category: 'vape',
                      dailyAmount: 1,
                      dailyCost: 10,
                      nicotineContent: 5,
                      harmLevel: 7
                    }));
                    dispatch(updateProgress());
                    Alert.alert('Success', 'Product type changed to Vape');
                  }
                },
                { 
                  text: 'Nicotine Pouches', 
                  onPress: () => {
                    dispatch(setUserProfile({
                      category: 'pouches',
                      dailyAmount: 15,
                      dailyCost: 8,
                      nicotineContent: 6,
                      harmLevel: 5
                    }));
                    dispatch(updateProgress());
                    Alert.alert('Success', 'Product type changed to Nicotine Pouches');
                  }
                },
                { 
                  text: 'Dip/Chew', 
                  onPress: () => {
                    dispatch(setUserProfile({
                      category: 'chewing',
                      dailyAmount: 5,
                      dailyCost: 12,
                      nicotineContent: 8,
                      harmLevel: 8
                    }));
                    dispatch(updateProgress());
                    Alert.alert('Success', 'Product type changed to Dip/Chew');
                  }
                },
                { 
                  text: 'Other', 
                  onPress: () => {
                    dispatch(setUserProfile({
                      category: 'other',
                      dailyAmount: 10,
                      dailyCost: 10,
                      nicotineContent: 5,
                      harmLevel: 5
                    }));
                    dispatch(updateProgress());
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
              <TouchableOpacity onPress={() => setShowAvatarModal(true)}>
                <CustomAvatar
                  type={selectedAvatar.type as any}
                  size={120}
                  unlocked={true}
                />
                <View style={styles.editAvatarBadge}>
                  <Ionicons name="pencil" size={12} color="#FFFFFF" />
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
                    <Text style={styles.statLabel}>Buddies Connected</Text>
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
                
                <ScrollView showsVerticalScrollIndicator={false}>
                  {(() => {
                    const allAvatars = [
                      { type: 'ninja', name: 'Shadow Ninja', unlocked: true, requirement: 'Available from start' },
                      { type: 'wizard', name: 'Wise Wizard', unlocked: daysClean >= 30, requirement: '30 days clean' },
                      { type: 'king', name: 'Recovery King', unlocked: daysClean >= 100, requirement: '100 days clean' },
                      { type: 'hero', name: 'Hero Helper', unlocked: userStats.buddiesHelped >= 5, requirement: 'Help 5 buddies' },
                      { type: 'ascended', name: 'Ascended Master', unlocked: daysClean >= 365, requirement: '365 days clean' },
                    ];
                    
                    const unlockedAvatars = allAvatars.filter(a => a.unlocked);
                    const lockedAvatars = allAvatars.filter(a => !a.unlocked);
                    
                    return (
                      <>
                        {unlockedAvatars.length > 0 && (
                          <>
                            <Text style={styles.avatarSectionTitle}>Unlocked Avatars</Text>
                            <View style={styles.avatarGrid}>
                              {unlockedAvatars.map((avatar) => (
                                <TouchableOpacity
                                  key={avatar.type}
                                  style={[
                                    styles.avatarOption,
                                    selectedAvatar.type === avatar.type && styles.avatarOptionSelected
                                  ]}
                                  onPress={() => {
                                    setSelectedAvatar(avatar);
                                    setShowAvatarModal(false);
                                  }}
                                >
                                  <CustomAvatar
                                    type={avatar.type as any}
                                    size={80}
                                    unlocked={true}
                                  />
                                  <Text style={styles.avatarOptionName}>{avatar.name}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </>
                        )}
                        
                        {lockedAvatars.length > 0 && (
                          <>
                            <Text style={styles.avatarSectionTitle}>Locked Avatars</Text>
                            <View style={styles.avatarGrid}>
                              {lockedAvatars.map((avatar) => (
                                <View key={avatar.type} style={[styles.avatarOption, styles.avatarLocked]}>
                                  <View style={styles.lockedOverlay}>
                                    <Ionicons name="lock-closed" size={24} color={COLORS.textMuted} />
                                  </View>
                                  <CustomAvatar
                                    type={avatar.type as any}
                                    size={80}
                                    unlocked={false}
                                  />
                                  <Text style={styles.avatarOptionName}>{avatar.name}</Text>
                                  <Text style={styles.avatarUnlockText}>{avatar.requirement}</Text>
                                </View>
                              ))}
                            </View>
                          </>
                        )}
                      </>
                    );
                  })()}
                </ScrollView>
              </LinearGradient>
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
                              size={16} 
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
    bottom: 0,
    right: 0,
    backgroundColor: '#8B5CF6',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#0F172A',
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
    maxHeight: '80%',
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
    marginHorizontal: -SPACING.xs,
  },
  avatarOption: {
    width: '33.33%',
    padding: SPACING.xs,
    alignItems: 'center',
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
  supportStyleGrid: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  supportStyleOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  supportStyleOptionSelected: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  supportStyleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  supportStyleName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  supportStyleDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  supportStyleCheck: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  supportStyleGridCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: SPACING.md,
  },
  supportStyleOptionCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 5,
    marginBottom: 2,
  },
  supportStyleOptionCompactSelected: {
    borderWidth: 1.5,
  },
  supportStyleNameCompact: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  supportStyleHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'right',
  },
});

export default ProfileScreen; 