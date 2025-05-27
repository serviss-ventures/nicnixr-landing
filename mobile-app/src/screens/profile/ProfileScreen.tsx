import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { logoutUser } from '../../store/slices/authSlice';
import { resetProgress } from '../../store/slices/progressSlice';
import { resetOnboarding } from '../../store/slices/onboardingSlice';
import { SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Milestone {
  id: string;
  title: string;
  description: string;
  daysRequired: number;
  achieved: boolean;
  icon: string;
  color: string;
  celebrationMessage: string;
}

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.progress);
  const { stepData } = useSelector((state: RootState) => state.onboarding);
  const [activeTab, setActiveTab] = useState<'profile' | 'milestones'>('profile');
  
  // Modal states for different settings
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  
  // Form states
  const [newUsername, setNewUsername] = useState(stepData.firstName || user?.email?.split('@')[0] || '');
  const [communityUsername, setCommunityUsername] = useState('');
  
  // Settings states
  const [notificationSettings, setNotificationSettings] = useState({
    milestoneAlerts: true,
    dailyReminders: true,
    communityUpdates: false,
    emergencySupport: true,
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'friends', // 'public', 'friends', 'private'
    shareProgress: true,
    allowMessages: true,
    showInLeaderboard: false,
  });

  // Get milestone data
  const getMilestones = (): Milestone[] => {
    const daysClean = stats?.daysClean || 0;
    
    return [
      {
        id: '1day',
        title: 'First Day Champion',
        description: 'Nicotine starts leaving your system',
        daysRequired: 1,
        achieved: daysClean >= 1,
        icon: 'time-outline',
        color: '#10B981',
        celebrationMessage: 'Your body begins healing immediately!'
      },
      {
        id: '3days',
        title: 'Nicotine-Free Zone',
        description: '100% nicotine eliminated from body',
        daysRequired: 3,
        achieved: daysClean >= 3,
        icon: 'checkmark-circle',
        color: '#8B5CF6',
        celebrationMessage: 'Your body is completely nicotine-free!'
      },
      {
        id: '1week',
        title: 'Recovery Champion',
        description: 'New neural pathways forming rapidly',
        daysRequired: 7,
        achieved: daysClean >= 7,
        icon: 'pulse-outline',
        color: '#06B6D4',
        celebrationMessage: 'Your brain is rewiring for freedom!'
      },
      {
        id: '1month',
        title: 'Circulation Champion',
        description: 'Blood circulation significantly improved',
        daysRequired: 30,
        achieved: daysClean >= 30,
        icon: 'fitness-outline',
        color: '#F59E0B',
        celebrationMessage: 'Your circulation is supercharged!'
      },
      {
        id: '3months',
        title: 'Lung Recovery Master',
        description: 'Lung function increased by up to 30%',
        daysRequired: 90,
        achieved: daysClean >= 90,
        icon: 'leaf-outline',
        color: '#EF4444',
        celebrationMessage: 'Breathing freely like never before!'
      },
      {
        id: '1year',
        title: 'Freedom Legend',
        description: 'Risk of coronary disease cut in half',
        daysRequired: 365,
        achieved: daysClean >= 365,
        icon: 'trophy-outline',
        color: '#EC4899',
        celebrationMessage: 'You are a true freedom legend!'
      },
    ];
  };

  const milestones = getMilestones();

  // Handler functions for settings
  const handleUsernameChange = () => {
    setShowUsernameModal(true);
  };

  const saveUsername = () => {
    // TODO: Implement username save to backend/store
    Alert.alert('Success', 'Username updated successfully!');
    setShowUsernameModal(false);
  };

  const generateCommunityUsername = () => {
    const adjectives = ['Brave', 'Strong', 'Free', 'Bold', 'Fierce', 'Mighty', 'Noble', 'Wise'];
    const nouns = ['Warrior', 'Champion', 'Fighter', 'Hero', 'Guardian', 'Phoenix', 'Eagle', 'Lion'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 999) + 1;
    setCommunityUsername(`${randomAdj}${randomNoun}${randomNum}`);
  };

  const handleNotificationSettings = () => {
    setShowNotificationSettings(true);
  };

  const handlePrivacySettings = () => {
    setShowPrivacySettings(true);
  };

  const handleAccountSettings = () => {
    setShowAccountSettings(true);
  };

  const handleHelpSupport = () => {
    Alert.alert(
      'Help & Support',
      'Choose an option:',
      [
        { text: 'FAQ', onPress: () => Alert.alert('FAQ', 'Frequently Asked Questions coming soon!') },
        { text: 'Contact Support', onPress: () => Alert.alert('Contact', 'Support contact form coming soon!') },
        { text: 'Report Bug', onPress: () => Alert.alert('Bug Report', 'Bug reporting system coming soon!') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#1A1A2E', '#16213E']}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>
              {stepData.firstName || user?.email?.split('@')[0] || 'Welcome'}
            </Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
                onPress={() => setActiveTab('profile')}
              >
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={activeTab === 'profile' ? '#8B5CF6' : 'rgba(255, 255, 255, 0.6)'} 
                />
                <Text style={[
                  styles.tabLabel,
                  { color: activeTab === 'profile' ? '#8B5CF6' : 'rgba(255, 255, 255, 0.6)' }
                ]}>
                  Profile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'milestones' && styles.tabActive]}
                onPress={() => setActiveTab('milestones')}
              >
                <Ionicons 
                  name="trophy-outline" 
                  size={20} 
                  color={activeTab === 'milestones' ? '#8B5CF6' : 'rgba(255, 255, 255, 0.6)'} 
                />
                <Text style={[
                  styles.tabLabel,
                  { color: activeTab === 'milestones' ? '#8B5CF6' : 'rgba(255, 255, 255, 0.6)' }
                ]}>
                  Milestones
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {activeTab === 'profile' && (
              <View style={styles.profileContent}>
                {/* User Info Section */}
                <View style={styles.userInfoContainer}>
                  <Text style={styles.sectionTitle}>Account</Text>
                  
                  <TouchableOpacity style={styles.settingItem} onPress={handleUsernameChange}>
                    <Ionicons name="person-outline" size={24} color="#8B5CF6" />
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingText}>Display Name</Text>
                      <Text style={styles.settingSubtext}>{newUsername}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.settingItem} onPress={generateCommunityUsername}>
                    <Ionicons name="people-outline" size={24} color="#8B5CF6" />
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingText}>Community Username</Text>
                      <Text style={styles.settingSubtext}>
                        {communityUsername || 'Generate anonymous name'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Settings */}
                <View style={styles.settingsContainer}>
                  <Text style={styles.sectionTitle}>Settings</Text>
                  
                  <TouchableOpacity style={styles.settingItem} onPress={handleNotificationSettings}>
                    <Ionicons name="notifications-outline" size={24} color="#8B5CF6" />
                    <Text style={styles.settingText}>Notifications</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.settingItem} onPress={handlePrivacySettings}>
                    <Ionicons name="shield-checkmark-outline" size={24} color="#8B5CF6" />
                    <Text style={styles.settingText}>Privacy</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.settingItem} onPress={handleHelpSupport}>
                    <Ionicons name="help-circle-outline" size={24} color="#8B5CF6" />
                    <Text style={styles.settingText}>Help & Support</Text>
                    <Ionicons name="chevron-forward" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Dev Tools */}
                <View style={styles.devContainer}>
                  <Text style={styles.devTitle}>Development</Text>
                  
                  <TouchableOpacity style={styles.devButton} onPress={handleAppReset}>
                    <Ionicons name="refresh" size={20} color="#F59E0B" />
                    <Text style={styles.devButtonText}>Reset App</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.devButton} onPress={handleSignOut}>
                    <Ionicons name="log-out" size={20} color="#EF4444" />
                    <Text style={styles.devButtonText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeTab === 'milestones' && (
              <View style={styles.milestonesContent}>
                {/* Milestone Gallery */}
                <View style={styles.milestonesContainer}>
                  <Text style={styles.milestonesTitle}>Achievement Milestones</Text>
                  <Text style={styles.milestonesSubtitle}>
                    Celebrate your recovery journey and track your progress
                  </Text>

                  {milestones.map((milestone, index) => (
                    <View key={milestone.id} style={[
                      styles.milestoneItem,
                      { opacity: milestone.achieved ? 1 : 0.4 }
                    ]}>
                      <LinearGradient
                        colors={milestone.achieved 
                          ? [`${milestone.color}30`, `${milestone.color}10`]
                          : ['rgba(100,100,100,0.2)', 'rgba(50,50,50,0.1)']
                        }
                        style={styles.milestoneCard}
                      >
                        <View style={styles.milestoneHeader}>
                          <View style={[
                            styles.milestoneIcon,
                            { backgroundColor: milestone.achieved ? milestone.color : '#666' }
                          ]}>
                            <Ionicons 
                              name={milestone.achieved ? 'checkmark' : milestone.icon as any} 
                              size={24} 
                              color="#FFFFFF" 
                            />
                          </View>
                          <View style={styles.milestoneInfo}>
                            <Text style={[
                              styles.milestoneTitle,
                              { color: milestone.achieved ? milestone.color : '#999' }
                            ]}>
                              {milestone.title}
                            </Text>
                            <Text style={styles.milestoneDesc}>
                              {milestone.description}
                            </Text>
                            <Text style={styles.milestoneTimeframe}>
                              {milestone.daysRequired === 1 ? '1 day' : `${milestone.daysRequired} days`}
                            </Text>
                          </View>
                          {milestone.achieved && (
                            <View style={styles.achievedBadge}>
                              <Text style={styles.achievedText}>✓</Text>
                            </View>
                          )}
                        </View>
                        {milestone.achieved && (
                          <Text style={[styles.celebrationText, { color: milestone.color }]}>
                            {milestone.celebrationMessage}
                          </Text>
                        )}
                      </LinearGradient>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>NIXR - The Future of Recovery</Text>
            </View>
          </ScrollView>
        </SafeAreaView>

        {/* Username Modal */}
        <Modal
          visible={showUsernameModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#000000', '#0A0F1C', '#1A1A2E', '#16213E']}
              style={styles.modalBackground}
            >
              <SafeAreaView style={styles.modalSafeArea}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowUsernameModal(false)}>
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Edit Display Name</Text>
                  <TouchableOpacity onPress={saveUsername}>
                    <Text style={styles.saveButton}>Save</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalContent}>
                  <Text style={styles.inputLabel}>Display Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newUsername}
                    onChangeText={setNewUsername}
                    placeholder="Enter your display name"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  />

                  <Text style={styles.inputLabel}>Community Username (Anonymous)</Text>
                  <View style={styles.communityUsernameContainer}>
                    <TextInput
                      style={[styles.textInput, { flex: 1 }]}
                      value={communityUsername}
                      onChangeText={setCommunityUsername}
                      placeholder="Generate or enter custom name"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    />
                    <TouchableOpacity 
                      style={styles.generateButton} 
                      onPress={generateCommunityUsername}
                    >
                      <Ionicons name="refresh" size={20} color="#8B5CF6" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.helperText}>
                    This anonymous name will be used in community features to protect your privacy.
                  </Text>
                </View>
              </SafeAreaView>
            </LinearGradient>
          </View>
        </Modal>

        {/* Notification Settings Modal */}
        <Modal
          visible={showNotificationSettings}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#000000', '#0A0F1C', '#1A1A2E', '#16213E']}
              style={styles.modalBackground}
            >
              <SafeAreaView style={styles.modalSafeArea}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowNotificationSettings(false)}>
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Notification Settings</Text>
                  <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.modalContent}>
                  <View style={styles.settingToggleItem}>
                    <View style={styles.settingToggleInfo}>
                      <Text style={styles.settingText}>Milestone Alerts</Text>
                      <Text style={styles.settingSubtext}>Get notified when you reach milestones</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggle, notificationSettings.milestoneAlerts && styles.toggleActive]}
                      onPress={() => setNotificationSettings(prev => ({ ...prev, milestoneAlerts: !prev.milestoneAlerts }))}
                    >
                      <View style={[styles.toggleThumb, notificationSettings.milestoneAlerts && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingToggleItem}>
                    <View style={styles.settingToggleInfo}>
                      <Text style={styles.settingText}>Daily Reminders</Text>
                      <Text style={styles.settingSubtext}>Motivational messages and check-ins</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggle, notificationSettings.dailyReminders && styles.toggleActive]}
                      onPress={() => setNotificationSettings(prev => ({ ...prev, dailyReminders: !prev.dailyReminders }))}
                    >
                      <View style={[styles.toggleThumb, notificationSettings.dailyReminders && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingToggleItem}>
                    <View style={styles.settingToggleInfo}>
                      <Text style={styles.settingText}>Community Updates</Text>
                      <Text style={styles.settingSubtext}>New posts and interactions</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggle, notificationSettings.communityUpdates && styles.toggleActive]}
                      onPress={() => setNotificationSettings(prev => ({ ...prev, communityUpdates: !prev.communityUpdates }))}
                    >
                      <View style={[styles.toggleThumb, notificationSettings.communityUpdates && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingToggleItem}>
                    <View style={styles.settingToggleInfo}>
                      <Text style={styles.settingText}>Emergency Support</Text>
                      <Text style={styles.settingSubtext}>Critical support notifications</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggle, notificationSettings.emergencySupport && styles.toggleActive]}
                      onPress={() => setNotificationSettings(prev => ({ ...prev, emergencySupport: !prev.emergencySupport }))}
                    >
                      <View style={[styles.toggleThumb, notificationSettings.emergencySupport && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </SafeAreaView>
            </LinearGradient>
          </View>
        </Modal>

        {/* Privacy Settings Modal */}
        <Modal
          visible={showPrivacySettings}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#000000', '#0A0F1C', '#1A1A2E', '#16213E']}
              style={styles.modalBackground}
            >
              <SafeAreaView style={styles.modalSafeArea}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowPrivacySettings(false)}>
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Privacy & Security</Text>
                  <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.modalContent}>
                  <Text style={styles.inputLabel}>Profile Visibility</Text>
                  <View style={styles.optionGroup}>
                    {['public', 'friends', 'private'].map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[styles.optionItem, privacySettings.profileVisibility === option && styles.optionItemActive]}
                        onPress={() => setPrivacySettings(prev => ({ ...prev, profileVisibility: option }))}
                      >
                        <Text style={[styles.optionText, privacySettings.profileVisibility === option && styles.optionTextActive]}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </Text>
                        {privacySettings.profileVisibility === option && (
                          <Ionicons name="checkmark" size={20} color="#8B5CF6" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.settingToggleItem}>
                    <View style={styles.settingToggleInfo}>
                      <Text style={styles.settingText}>Share Progress</Text>
                      <Text style={styles.settingSubtext}>Allow others to see your milestones</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggle, privacySettings.shareProgress && styles.toggleActive]}
                      onPress={() => setPrivacySettings(prev => ({ ...prev, shareProgress: !prev.shareProgress }))}
                    >
                      <View style={[styles.toggleThumb, privacySettings.shareProgress && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingToggleItem}>
                    <View style={styles.settingToggleInfo}>
                      <Text style={styles.settingText}>Allow Messages</Text>
                      <Text style={styles.settingSubtext}>Receive messages from other users</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggle, privacySettings.allowMessages && styles.toggleActive]}
                      onPress={() => setPrivacySettings(prev => ({ ...prev, allowMessages: !prev.allowMessages }))}
                    >
                      <View style={[styles.toggleThumb, privacySettings.allowMessages && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingToggleItem}>
                    <View style={styles.settingToggleInfo}>
                      <Text style={styles.settingText}>Show in Leaderboard</Text>
                      <Text style={styles.settingSubtext}>Appear in community rankings</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggle, privacySettings.showInLeaderboard && styles.toggleActive]}
                      onPress={() => setPrivacySettings(prev => ({ ...prev, showInLeaderboard: !prev.showInLeaderboard }))}
                    >
                      <View style={[styles.toggleThumb, privacySettings.showInLeaderboard && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </SafeAreaView>
            </LinearGradient>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  tabActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  profileContent: {
    flex: 1,
  },
  userInfoContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  settingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  settingSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  settingsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  devContainer: {
    marginBottom: SPACING.xl,
  },
  devTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: SPACING.md,
  },
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  devButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  milestonesContainer: {
    marginBottom: SPACING.xl,
  },
  milestonesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: SPACING.md,
  },
  milestonesSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: SPACING.lg,
  },
  milestoneItem: {
    marginBottom: SPACING.md,
  },
  milestoneCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  milestoneDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  milestoneTimeframe: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  achievedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: SPACING.xs,
    marginLeft: SPACING.md,
  },
  achievedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  celebrationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  milestonesContent: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: SPACING.md,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 'auto',
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: SPACING.md,
  },
  communityUsernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  generateButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 8,
  },
  helperText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  textInput: {
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  optionGroup: {
    marginBottom: SPACING.lg,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  optionTextActive: {
    fontWeight: '600',
    color: '#8B5CF6',
  },
  settingToggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  settingToggleInfo: {
    flex: 1,
  },
  toggle: {
    width: 50,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#8B5CF6',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});

export default ProfileScreen; 