import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { logoutUser } from '../../store/slices/authSlice';
import { resetProgress } from '../../store/slices/progressSlice';
import { resetOnboarding } from '../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { setQuitDate, updateProgress } from '../../store/slices/progressSlice';
import { getPersonalizedMilestones } from '../../services/personalizedContentService';

interface Milestone {
  id: string;
  title: string;
  description: string;
  daysRequired: number;
  achieved: boolean;
  icon: string;
  color: string;
  celebrationMessage: string;
  productRelevant: boolean;
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

  // Get milestone data with memoization to prevent re-renders
  const milestones = useMemo(() => {
    const daysClean = stats?.daysClean || 0;
    return getPersonalizedMilestones(daysClean);
  }, [stats?.daysClean]);

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

  const handleNeuralTest = () => {
    Alert.alert(
      'Neural Test - Set Recovery Time',
      'Jump to different recovery stages for testing',
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
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>
              {stepData.firstName || user?.email?.split('@')[0] || 'Welcome'}
            </Text>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
              onPress={() => setActiveTab('profile')}
            >
              <Ionicons 
                name="person-outline" 
                size={16} 
                color={activeTab === 'profile' ? '#FFFFFF' : COLORS.textMuted} 
              />
              <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
                Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'milestones' && styles.activeTab]}
              onPress={() => setActiveTab('milestones')}
            >
              <Ionicons 
                name="trophy-outline" 
                size={16} 
                color={activeTab === 'milestones' ? '#FFFFFF' : COLORS.textMuted} 
              />
              <Text style={[styles.tabText, activeTab === 'milestones' && styles.activeTabText]}>
                Milestones
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {/* Tab Content */}
            {activeTab === 'profile' && (
              <View style={styles.profileContent}>
                {/* User Info Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Account</Text>
                  <View style={styles.card}>
                    <TouchableOpacity style={styles.settingItem} onPress={handleUsernameChange}>
                      <View style={styles.settingIconContainer}>
                        <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                      </View>
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingText}>Display Name</Text>
                        <Text style={styles.settingSubtext}>{newUsername}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Settings */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Settings</Text>
                  <View style={styles.card}>
                    <TouchableOpacity style={styles.settingItem} onPress={handleNotificationSettings}>
                      <View style={styles.settingIconContainer}>
                        <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
                      </View>
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingText}>Notifications</Text>
                        <Text style={styles.settingSubtext}>Manage alerts and reminders</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>

                    <View style={styles.settingSeparator} />

                    <TouchableOpacity style={styles.settingItem} onPress={handlePrivacySettings}>
                      <View style={styles.settingIconContainer}>
                        <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
                      </View>
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingText}>Privacy & Security</Text>
                        <Text style={styles.settingSubtext}>Control your data and visibility</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>

                    <View style={styles.settingSeparator} />

                    <TouchableOpacity style={styles.settingItem} onPress={handleHelpSupport}>
                      <View style={styles.settingIconContainer}>
                        <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
                      </View>
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingText}>Help & Support</Text>
                        <Text style={styles.settingSubtext}>Get help and contact support</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Dev Tools */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Development</Text>
                  <View style={styles.card}>
                    <TouchableOpacity style={styles.settingItem} onPress={handleNeuralTest}>
                      <View style={styles.settingIconContainer}>
                        <Ionicons name="flash" size={20} color={COLORS.primary} />
                      </View>
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingText}>Neural Test</Text>
                        <Text style={styles.settingSubtext}>Jump to recovery stage</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>

                    <View style={styles.settingSeparator} />

                    <TouchableOpacity style={styles.settingItem} onPress={handleAppReset}>
                      <View style={styles.settingIconContainer}>
                        <Ionicons name="refresh" size={20} color="#F59E0B" />
                      </View>
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingText}>Reset App</Text>
                        <Text style={styles.settingSubtext}>Clear all data and restart</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>

                    <View style={styles.settingSeparator} />

                    <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
                      <View style={styles.settingIconContainer}>
                        <Ionicons name="log-out" size={20} color="#EF4444" />
                      </View>
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingText}>Sign Out</Text>
                        <Text style={styles.settingSubtext}>Log out of your account</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'milestones' && (
              <View style={styles.milestonesContent}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Achievement Milestones</Text>
                  <Text style={styles.sectionSubtitle}>
                    Celebrate your recovery journey and track your progress
                  </Text>

                  {milestones.map((milestone, index) => (
                    <View key={milestone.id} style={styles.milestoneCard}>
                      <View style={styles.milestoneHeader}>
                        <View style={[
                          styles.milestoneIcon,
                          { 
                            backgroundColor: milestone.achieved ? milestone.color + '20' : 'rgba(255, 255, 255, 0.05)',
                            borderColor: milestone.achieved ? milestone.color + '40' : 'rgba(255, 255, 255, 0.1)'
                          }
                        ]}>
                          <Ionicons 
                            name={milestone.achieved ? 'checkmark' : milestone.icon as any} 
                            size={20} 
                            color={milestone.achieved ? milestone.color : COLORS.textMuted}
                          />
                        </View>
                        <View style={styles.milestoneInfo}>
                          <Text style={[
                            styles.milestoneTitle,
                            { color: milestone.achieved ? COLORS.text : COLORS.textMuted }
                          ]}>
                            {milestone.title}
                          </Text>
                          <Text style={styles.milestoneDescription}>
                            {milestone.description}
                          </Text>
                          <Text style={styles.milestoneTimeframe}>
                            {milestone.daysRequired === 1 ? '1 day' : `${milestone.daysRequired} days`}
                          </Text>
                        </View>
                        {milestone.achieved && (
                          <View style={styles.achievedBadge}>
                            <Ionicons name="checkmark-circle" size={16} color={milestone.color} />
                          </View>
                        )}
                      </View>
                      {milestone.achieved && (
                        <View style={styles.celebrationContainer}>
                          <Text style={[styles.celebrationText, { color: milestone.color }]}>
                            {milestone.celebrationMessage}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}
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
              colors={['#000000', '#0A0F1C', '#0F172A']}
              style={styles.modalBackground}
            >
              <SafeAreaView style={styles.modalSafeArea}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowUsernameModal(false)}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
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
                    placeholderTextColor={COLORS.textMuted}
                  />

                  <Text style={styles.inputLabel}>Community Username (Anonymous)</Text>
                  <View style={styles.communityUsernameContainer}>
                    <TextInput
                      style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
                      value={communityUsername}
                      onChangeText={setCommunityUsername}
                      placeholder="Generate or enter custom name"
                      placeholderTextColor={COLORS.textMuted}
                    />
                    <TouchableOpacity 
                      style={styles.generateButton} 
                      onPress={generateCommunityUsername}
                    >
                      <Ionicons name="refresh" size={20} color={COLORS.primary} />
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
              colors={['#000000', '#0A0F1C', '#0F172A']}
              style={styles.modalBackground}
            >
              <SafeAreaView style={styles.modalSafeArea}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowNotificationSettings(false)}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
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
              colors={['#000000', '#0A0F1C', '#0F172A']}
              style={styles.modalBackground}
            >
              <SafeAreaView style={styles.modalSafeArea}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowPrivacySettings(false)}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
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
                          <Ionicons name="checkmark" size={20} color={COLORS.primary} />
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
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 11,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  profileContent: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  settingSeparator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: SPACING.lg,
  },
  milestonesContent: {
    flex: 1,
  },
  milestoneCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.lg,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  milestoneDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  milestoneTimeframe: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  achievedBadge: {
    marginLeft: SPACING.sm,
  },
  celebrationContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: 0,
  },
  celebrationText: {
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 18,
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
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  textInput: {
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  communityUsernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  generateButton: {
    width: 44,
    height: 44,
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.primary + '20',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  helperText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.lg,
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
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionItemActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary + '40',
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  optionTextActive: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  settingToggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  settingToggleInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});

export default ProfileScreen; 