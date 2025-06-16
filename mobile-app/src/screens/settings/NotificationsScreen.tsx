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
import pushNotificationService from '../../services/pushNotificationService';

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
    
    // Update local state
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
    
    // Sync with push notification service
    const newSettings = {
      dailyMotivation: setting === 'dailyMotivation' ? value : dailyMotivation,
      progressUpdates: setting === 'progressUpdates' ? value : progressUpdates,
      healthMilestones: setting === 'healthMilestones' ? value : healthMilestones,
      communityActivity: setting === 'communityActivity' ? value : communityActivity,
    };
    
    await pushNotificationService.updateNotificationSettings(newSettings);
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

          {/* Content Container */}
          <View style={styles.contentContainer}>
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
                        size={18} 
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
                    style={styles.switch}
                  />
                </View>
              ))}
            </View>

            {/* Push Notification Notice */}
            <View style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="information-circle" size={18} color="rgba(147, 197, 253, 0.6)" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Stay on Track</Text>
                <Text style={styles.infoText}>
                  Gentle reminders to support your recovery journey.
                </Text>
              </View>
            </View>
          </View>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.95)',
    flex: 1,
    letterSpacing: -0.3,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  section: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  settingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  settingDescription: {
    fontSize: 12,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 16,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  infoCard: {
    backgroundColor: 'rgba(147, 197, 253, 0.05)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(147, 197, 253, 0.15)',
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(147, 197, 253, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 16,
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