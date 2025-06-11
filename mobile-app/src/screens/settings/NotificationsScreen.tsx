import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearNotifications } from '../../store/slices/notificationSlice';
import NotificationService from '../../services/notificationService';

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
      iconColor: '#F59E0B',
      value: dailyMotivation,
    },
    {
      id: 'progressUpdates',
      title: 'Progress Updates',
      description: 'Reminders about your milestones and achievements',
      icon: 'trending-up-outline',
      iconColor: '#10B981',
      value: progressUpdates,
    },
    {
      id: 'healthMilestones',
      title: 'Health Milestones',
      description: 'Notifications when you unlock health benefits',
      icon: 'heart-outline',
      iconColor: '#EF4444',
      value: healthMilestones,
    },
    {
      id: 'communityActivity',
      title: 'Community Activity',
      description: 'Buddy requests, messages, and mentions',
      icon: 'people-outline',
      iconColor: '#8B5CF6',
      value: communityActivity,
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
            <Text style={styles.headerTitle}>Notification Settings</Text>
          </View>

          {/* Settings List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Main Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What to notify me about</Text>
              
              {notificationSettings.map((setting) => (
                <View key={setting.id} style={styles.settingCard}>
                  <View style={styles.settingContent}>
                    <View style={[styles.iconContainer, { backgroundColor: `${setting.iconColor}20` }]}>
                      <Ionicons 
                        name={setting.icon as any} 
                        size={22} 
                        color={setting.iconColor} 
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
                    trackColor={{ false: '#767577', true: COLORS.primary }}
                    thumbColor={setting.value ? '#FFFFFF' : '#f4f3f4'}
                  />
                </View>
              ))}
            </View>

            {/* Push Notification Notice */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>
                Push notifications help you stay on track with your recovery journey. 
                We'll never spam you.
              </Text>
            </View>
            
            {/* Developer Options - Only in dev mode */}
            {__DEV__ && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Developer Options</Text>
                <TouchableOpacity 
                  style={styles.developerButton}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert(
                      'Reset Demo Notifications',
                      'This will clear all notifications and create new demo notifications for testing.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Reset',
                          style: 'destructive',
                          onPress: async () => {
                            // Clear existing notifications
                            dispatch(clearNotifications());
                            await AsyncStorage.removeItem('@notifications');
                            await AsyncStorage.removeItem('@demo_notifications_created');
                            
                            // Create new demo notifications
                            NotificationService.createDemoNotifications(dispatch);
                            await AsyncStorage.setItem('@demo_notifications_created', 'true');
                            
                            Alert.alert('Success', 'Demo notifications have been reset!');
                          }
                        }
                      ]
                    );
                  }}
                >
                  <LinearGradient
                    colors={['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.05)']}
                    style={styles.developerButtonGradient}
                  >
                    <Ionicons name="refresh-circle" size={20} color="#EF4444" />
                    <Text style={styles.developerButtonText}>Reset Demo Notifications</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
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
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  infoCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  developerButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  developerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  developerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default NotificationsScreen; 