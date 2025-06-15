import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { updateNotificationSettings } from '../../store/slices/settingsSlice';
import { COLORS, SPACING } from '../../constants/theme';
import * as Haptics from 'expo-haptics';

const NotificationsScreen: React.FC = () => {
  try {
    const navigation = useNavigation();
    const dispatch = useDispatch<AppDispatch>();
    const settingsState = useSelector((state: RootState) => state?.settings);
    const notifications = settingsState?.notifications;
  
  // Default values if notifications is not loaded yet
  const defaultNotifications = {
    dailyMotivation: true,
    progressUpdates: true,
    healthMilestones: true,
    communityActivity: true,
    quietHours: {
      enabled: false,
      start: '10:00 PM',
      end: '7:00 AM'
    }
  };
  
  const currentNotifications = notifications || defaultNotifications;
  
  // Local state for settings - use optional chaining for safety
  const [dailyMotivation, setDailyMotivation] = useState(currentNotifications?.dailyMotivation ?? true);
  const [progressUpdates, setProgressUpdates] = useState(currentNotifications?.progressUpdates ?? true);
  const [healthMilestones, setHealthMilestones] = useState(currentNotifications?.healthMilestones ?? true);
  const [communityActivity, setCommunityActivity] = useState(currentNotifications?.communityActivity ?? true);

  // Update local state when Redux state changes
  useEffect(() => {
    if (notifications) {
      setDailyMotivation(notifications.dailyMotivation ?? true);
      setProgressUpdates(notifications.progressUpdates ?? true);
      setHealthMilestones(notifications.healthMilestones ?? true);
      setCommunityActivity(notifications.communityActivity ?? true);
    }
  }, [notifications]);

  const handleToggle = async (setting: string, value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (setting) {
      case 'dailyMotivation':
        setDailyMotivation(value);
        dispatch(updateNotificationSettings({ dailyMotivation: value }));
        break;
      case 'progressUpdates':
        setProgressUpdates(value);
        dispatch(updateNotificationSettings({ progressUpdates: value }));
        break;
      case 'healthMilestones':
        setHealthMilestones(value);
        dispatch(updateNotificationSettings({ healthMilestones: value }));
        break;
      case 'communityActivity':
        setCommunityActivity(value);
        dispatch(updateNotificationSettings({ communityActivity: value }));
        break;
    }
  };

  const notificationSettings = [
    {
      id: 'dailyMotivation',
      title: 'Daily Motivation',
      description: 'Get a daily tip or motivational message',
      icon: 'sunny-outline',
      value: dailyMotivation,
      color: 'rgba(251, 191, 36, 0.6)', // Amber
    },
    {
      id: 'progressUpdates',
      title: 'Progress Updates',
      description: 'Reminders about your milestones and achievements',
      icon: 'trending-up-outline',
      value: progressUpdates,
      color: 'rgba(134, 239, 172, 0.6)', // Green
    },
    {
      id: 'healthMilestones',
      title: 'Health Milestones',
      description: 'Notifications when you unlock health benefits',
      icon: 'heart-outline',
      value: healthMilestones,
      color: 'rgba(236, 72, 153, 0.6)', // Pink
    },
    {
      id: 'communityActivity',
      title: 'Community Activity',
      description: 'Buddy requests, messages, and mentions',
      icon: 'people-outline',
      value: communityActivity,
      color: 'rgba(147, 197, 253, 0.6)', // Blue
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>

          {/* Settings List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
          {/* Main Settings */}
          <View style={styles.section}>
            
            {notificationSettings.map((setting) => (
              <View key={setting.id} style={styles.settingCard}>
                <View style={styles.settingContent}>
                  <View style={[
                    styles.iconContainer,
                    setting.value && { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
                  ]}>
                    <Ionicons 
                      name={setting.icon as any} 
                      size={20} 
                      color={setting.value ? setting.color : 'rgba(255, 255, 255, 0.4)'} 
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.settingTitle}>{setting.title}</Text>
                    <Text style={styles.settingDescription}>{setting.description}</Text>
                  </View>
                </View>
                <Switch
                  value={setting.value}
                  onValueChange={(value) => handleToggle(setting.id, value)}
                  trackColor={{ 
                    false: 'rgba(255, 255, 255, 0.1)', 
                    true: 'rgba(134, 239, 172, 0.2)' 
                  }}
                  thumbColor={setting.value ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'}
                  ios_backgroundColor="rgba(255, 255, 255, 0.1)"
                />
              </View>
            ))}
          </View>

          {/* Push Notification Notice */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="information-circle" size={20} color="rgba(147, 197, 253, 0.6)" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Stay on Track</Text>
              <Text style={styles.infoText}>
                We'll send gentle reminders to help your recovery journey. No spam, just support when you need it.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      </LinearGradient>
    </View>
  );
  } catch (error) {
    console.error('NotificationsScreen error:', error);
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#0A0F1C', '#0F172A']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Error Loading Settings</Text>
            </View>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Something went wrong. Please try again.</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.md,
    marginLeft: -SPACING.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: COLORS.text,
    flex: 1,
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '300',
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
    letterSpacing: 0.5,
  },
  settingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  settingDescription: {
    fontSize: 13,
    fontWeight: '300',
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: 'rgba(147, 197, 253, 0.05)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginTop: SPACING.xl * 1.5,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.1)',
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(147, 197, 253, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '300',
    color: COLORS.textSecondary,
    lineHeight: 19,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.textSecondary,
  },
});

export default NotificationsScreen; 