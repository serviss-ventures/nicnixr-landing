import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import * as Haptics from 'expo-haptics';
import pushNotificationService from '../../services/pushNotificationService';
import NotificationService from '../../services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationTestScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const { stats } = useSelector((state: RootState) => state.progress);

  useEffect(() => {
    loadScheduledNotifications();
    loadPushToken();
  }, []);

  const loadScheduledNotifications = async () => {
    const notifications = await pushNotificationService.getScheduledNotifications();
    setScheduledNotifications(notifications);
  };

  const loadPushToken = async () => {
    const token = await AsyncStorage.getItem('@push_token');
    setPushToken(token);
  };

  const testImmediateNotification = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await pushNotificationService.sendImmediateNotification(
      'NixR System Test',
      'Notification system operational. Test complete.'
    );
    Alert.alert('Success', 'Test notification sent!');
  };

  const testMilestoneNotification = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await NotificationService.createMilestoneNotification(
      dispatch,
      7,
      '7 Day Milestone! 🎉'
    );
    Alert.alert('Success', 'Milestone notification created!');
  };

  const testBuddyNotification = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await NotificationService.createBuddyRequestNotification(dispatch, {
      id: 'test-buddy',
      name: 'Test Buddy',
      daysClean: 30,
      avatar: 'warrior',
      product: 'vaping',
      bio: 'This is a test buddy request notification',
      supportStyles: ['Motivator'],
      status: 'online',
    });
    Alert.alert('Success', 'Buddy request notification created!');
  };

  const testScheduledNotifications = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await pushNotificationService.scheduleDailyMotivation();
    await pushNotificationService.scheduleProgressReminders();
    
    if (stats?.quitDate) {
      const quitDate = new Date(stats.quitDate);
      await pushNotificationService.scheduleMilestoneNotifications(quitDate);
    }
    
    await loadScheduledNotifications();
    Alert.alert('Success', 'Scheduled notifications set up!');
  };

  const clearAllNotifications = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Clear All Notifications',
      'This will cancel all scheduled push notifications. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await pushNotificationService.cancelAllNotifications();
            await loadScheduledNotifications();
            Alert.alert('Success', 'All notifications cleared!');
          },
        },
      ]
    );
  };

  const formatTrigger = (trigger: any) => {
    if (!trigger) return 'Immediate';
    if (trigger.type === 'timeInterval') return `In ${trigger.seconds}s`;
    if (trigger.type === 'daily') return `Daily at ${trigger.hour}:${String(trigger.minute).padStart(2, '0')}`;
    if (trigger.type === 'date') return new Date(trigger.date).toLocaleString();
    return JSON.stringify(trigger);
  };

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
            <Text style={styles.headerTitle}>Notification Testing</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Push Token Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Push Token</Text>
              <Text style={styles.infoText}>
                {pushToken ? `${pushToken.substring(0, 20)}...` : 'No push token available'}
              </Text>
            </View>

            {/* Test Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TEST NOTIFICATIONS</Text>
              
              <TouchableOpacity
                style={styles.testButton}
                onPress={testImmediateNotification}
              >
                <Ionicons name="notifications" size={20} color="#FFF" />
                <Text style={styles.testButtonText}>Send Test Push Notification</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testButton}
                onPress={testMilestoneNotification}
              >
                <Ionicons name="trophy" size={20} color="#FFD700" />
                <Text style={styles.testButtonText}>Create Milestone Notification</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testButton}
                onPress={testBuddyNotification}
              >
                <Ionicons name="people" size={20} color="#8B5CF6" />
                <Text style={styles.testButtonText}>Create Buddy Request</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testButton}
                onPress={testScheduledNotifications}
              >
                <Ionicons name="calendar" size={20} color="#10B981" />
                <Text style={styles.testButtonText}>Schedule All Notifications</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.testButton, styles.dangerButton]}
                onPress={clearAllNotifications}
              >
                <Ionicons name="trash" size={20} color="#FF7575" />
                <Text style={[styles.testButtonText, styles.dangerText]}>
                  Clear All Scheduled
                </Text>
              </TouchableOpacity>
            </View>

            {/* Scheduled Notifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                SCHEDULED NOTIFICATIONS ({scheduledNotifications.length})
              </Text>
              
              {scheduledNotifications.length === 0 ? (
                <Text style={styles.emptyText}>No scheduled notifications</Text>
              ) : (
                scheduledNotifications.map((notif, index) => (
                  <View key={index} style={styles.notificationCard}>
                    <Text style={styles.notifTitle}>{notif.content.title}</Text>
                    <Text style={styles.notifBody}>{notif.content.body}</Text>
                    <Text style={styles.notifTrigger}>
                      {formatTrigger(notif.trigger)}
                    </Text>
                    {notif.identifier && (
                      <Text style={styles.notifId}>ID: {notif.identifier}</Text>
                    )}
                  </View>
                ))
              )}
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: 'rgba(147, 197, 253, 0.05)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.1)',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '300',
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '300',
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  testButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  testButtonText: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.text,
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 117, 117, 0.05)',
    borderColor: 'rgba(255, 117, 117, 0.1)',
  },
  dangerText: {
    color: '#FF7575',
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  notifBody: {
    fontSize: 13,
    fontWeight: '300',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  notifTrigger: {
    fontSize: 12,
    fontWeight: '300',
    color: COLORS.textMuted,
  },
  notifId: {
    fontSize: 11,
    fontWeight: '300',
    color: COLORS.textMuted,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
});

export default NotificationTestScreen; 