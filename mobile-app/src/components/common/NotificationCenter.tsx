import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import DicebearAvatar from './DicebearAvatar';
import { getBadgeForDaysClean } from '../../utils/badges';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Notification {
  id: string;
  type: 'buddy-request' | 'buddy-message' | 'milestone' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
  actionType?: 'accept-decline' | 'view' | 'message';
  icon?: string;
  iconColor?: string;
}

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ visible, onClose }) => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.progress);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Generate demo notifications
  useEffect(() => {
    const demoNotifications: Notification[] = [
      {
        id: '1',
        type: 'buddy-request',
        title: 'New Buddy Request',
        message: 'Sarah M. wants to connect with you',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        actionType: 'accept-decline',
        data: {
          buddyId: 'sarah_123',
          buddyName: 'Sarah M.',
          buddyDaysClean: 45,
          buddyAvatar: 'warrior',
          buddyProduct: 'cigarettes',
        }
      },
      {
        id: '2',
        type: 'buddy-message',
        title: 'Mike S.',
        message: 'Hey! How are you holding up today? Remember, we got this! 💪',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        actionType: 'message',
        data: {
          buddyId: 'mike_456',
          buddyName: 'Mike S.',
          buddyDaysClean: 120,
          buddyAvatar: 'hero',
        }
      },
      {
        id: '3',
        type: 'milestone',
        title: 'Milestone Achieved! 🎉',
        message: 'Congratulations! You\'ve been clean for 7 days!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true,
        actionType: 'view',
        icon: 'trophy',
        iconColor: '#FFD700',
        data: {
          milestone: 7,
          badge: 'week-warrior',
        }
      },
    ];

    setNotifications(demoNotifications);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleAcceptBuddyRequest = async (notification: Notification) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Buddy Request Accepted',
      `You are now connected with ${notification.data.buddyName}!`,
      [{ text: 'OK' }]
    );
    markAsRead(notification.id);
  };

  const handleDeclineBuddyRequest = async (notification: Notification) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Decline Request?',
      `Are you sure you want to decline ${notification.data.buddyName}'s buddy request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Decline', 
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
          }
        }
      ]
    );
  };

  const handleMessageTap = async (notification: Notification) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markAsRead(notification.id);
    onClose();
    // Navigate to buddy chat
    navigation.navigate('BuddyChat' as never, { 
      buddy: notification.data 
    } as never);
  };

  const handleMilestoneTap = async (notification: Notification) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markAsRead(notification.id);
    onClose();
    // Navigate to progress screen
    navigation.navigate('Progress' as never);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const renderNotification = (notification: Notification) => {
    switch (notification.type) {
      case 'buddy-request':
        return (
          <TouchableOpacity 
            key={notification.id}
            style={[styles.notificationCard, !notification.read && styles.unreadCard]}
            onPress={() => markAsRead(notification.id)}
            activeOpacity={0.9}
          >
            <View style={styles.notificationContent}>
              <View style={styles.avatarContainer}>
                <DicebearAvatar
                  userId={notification.data.buddyId}
                  size={48}
                  daysClean={notification.data.buddyDaysClean}
                  style={notification.data.buddyAvatar}
                />
                {!notification.read && <View style={styles.unreadDot} />}
              </View>
              
              <View style={styles.notificationText}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <View style={styles.notificationMeta}>
                  <Text style={styles.timestamp}>{formatTimestamp(notification.timestamp)}</Text>
                  <Text style={styles.productTag}>{notification.data.buddyProduct}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.declineButton}
                onPress={() => handleDeclineBuddyRequest(notification)}
              >
                <Ionicons name="close" size={20} color="#EF4444" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleAcceptBuddyRequest(notification)}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.acceptButtonGradient}
                >
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );

      case 'buddy-message':
        return (
          <TouchableOpacity 
            key={notification.id}
            style={[styles.notificationCard, !notification.read && styles.unreadCard]}
            onPress={() => handleMessageTap(notification)}
            activeOpacity={0.9}
          >
            <View style={styles.notificationContent}>
              <View style={styles.avatarContainer}>
                <DicebearAvatar
                  userId={notification.data.buddyId}
                  size={48}
                  daysClean={notification.data.buddyDaysClean}
                  style={notification.data.buddyAvatar}
                />
                {!notification.read && <View style={styles.unreadDot} />}
              </View>
              
              <View style={styles.notificationText}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
                <Text style={styles.timestamp}>{formatTimestamp(notification.timestamp)}</Text>
              </View>
            </View>
            
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        );

      case 'milestone':
        return (
          <TouchableOpacity 
            key={notification.id}
            style={[styles.notificationCard, !notification.read && styles.unreadCard]}
            onPress={() => handleMilestoneTap(notification)}
            activeOpacity={0.9}
          >
            <View style={styles.notificationContent}>
              <View style={[styles.milestoneIcon, { backgroundColor: `${notification.iconColor}20` }]}>
                <Ionicons 
                  name={notification.icon as any} 
                  size={24} 
                  color={notification.iconColor} 
                />
                {!notification.read && <View style={styles.unreadDot} />}
              </View>
              
              <View style={styles.notificationText}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>
                <Text style={styles.timestamp}>{formatTimestamp(notification.timestamp)}</Text>
              </View>
            </View>
            
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#0A0F1C', '#0F172A']}
            style={styles.gradient}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandle} />
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Notifications List */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={COLORS.primary}
                />
              }
            >
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="notifications-off-outline" size={64} color={COLORS.textMuted} />
                  <Text style={styles.emptyTitle}>No notifications yet</Text>
                  <Text style={styles.emptyText}>
                    When you receive buddy requests, messages, or achieve milestones, they'll appear here
                  </Text>
                </View>
              ) : (
                <>
                  {/* Today */}
                  {notifications.filter(n => {
                    const hours = (new Date().getTime() - n.timestamp.getTime()) / 3600000;
                    return hours < 24;
                  }).length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>Today</Text>
                      {notifications.filter(n => {
                        const hours = (new Date().getTime() - n.timestamp.getTime()) / 3600000;
                        return hours < 24;
                      }).map(renderNotification)}
                    </>
                  )}

                  {/* Earlier */}
                  {notifications.filter(n => {
                    const hours = (new Date().getTime() - n.timestamp.getTime()) / 3600000;
                    return hours >= 24;
                  }).length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>Earlier</Text>
                      {notifications.filter(n => {
                        const hours = (new Date().getTime() - n.timestamp.getTime()) / 3600000;
                        return hours >= 24;
                      }).map(renderNotification)}
                    </>
                  )}
                </>
              )}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    height: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  closeButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  unreadCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#000000',
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  productTag: {
    fontSize: 12,
    color: COLORS.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  declineButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  acceptButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    lineHeight: 20,
  },
});

export default NotificationCenter; 