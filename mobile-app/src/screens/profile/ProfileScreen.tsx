import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
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

            {/* Settings */}
            <View style={styles.settingsContainer}>
              <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Notifications', 'Coming soon!')}>
                <Ionicons name="notifications-outline" size={24} color="#8B5CF6" />
                <Text style={styles.settingText}>Notifications</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Privacy', 'Coming soon!')}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#8B5CF6" />
                <Text style={styles.settingText}>Privacy</Text>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Help', 'Coming soon!')}>
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

            <View style={styles.footer}>
              <Text style={styles.footerText}>NIXR - The Future of Recovery</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
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
  settingsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: SPACING.md,
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
});

export default ProfileScreen; 