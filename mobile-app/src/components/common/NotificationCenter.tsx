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
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import DicebearAvatar from './DicebearAvatar';
import { getBadgeForDaysClean } from '../../utils/badges';
import * as Haptics from 'expo-haptics';
import { 
  markAsRead, 
  loadNotifications,
  saveNotifications,
  Notification
} from '../../store/slices/notificationSlice';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ visible, onClose }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.progress);
  const { notifications, unreadCount } = useSelector((state: RootState) => state.notifications);
  const [refreshing, setRefreshing] = useState(false);

  // Load notifications on mount
  useEffect(() => {
    dispatch(loadNotifications());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await dispatch(loadNotifications());
    setRefreshing(false);
  }, [dispatch]);



  const handleMessageTap = async (notification: Notification) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(markAsRead(notification.id));
    dispatch(saveNotifications());
    onClose();
    
    // Small delay to ensure modal closes before navigation
    setTimeout(() => {
      // First navigate to Community tab with buddies selected
      navigation.navigate('Community' as never, {
        screen: 'CommunityMain',
        params: {
          initialTab: 'buddies'
        }
      } as never);
      
      // Then navigate to BuddyChat after a slight delay
      setTimeout(() => {
        navigation.navigate('BuddyChat' as never, {
          buddy: {
            id: notification.data.buddyId,
            name: notification.data.buddyName,
            daysClean: notification.data.buddyDaysClean,
            status: 'online', // Default to online for now
          }
        } as never);
      }, 150);
    }, 100);
  };

  const handleMilestoneTap = async (notification: Notification) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(markAsRead(notification.id));
    dispatch(saveNotifications());
    onClose();
    // Navigate to progress screen
    navigation.navigate('Progress' as never);
  };

  const markAsReadHandler = (notificationId: string) => {
    dispatch(markAsRead(notificationId));
    dispatch(saveNotifications());
  };

  const formatTimestamp = (date: Date | string) => {
    const timestamp = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
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
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              markAsReadHandler(notification.id);
              onClose();
              
              // Small delay to ensure modal closes before navigation
              setTimeout(() => {
                // Navigate to Community tab > Buddies section
                navigation.navigate('Community' as never, {
                  screen: 'CommunityMain',
                  params: {
                    initialTab: 'buddies'
                  }
                } as never);
              }, 100);
            }}
            activeOpacity={0.9}
          >
            <View style={styles.notificationContent}>
              <View style={styles.avatarContainer}>
                <DicebearAvatar
                  userId={notification.data.buddyId}
                  size={48}
                  daysClean={notification.data.buddyDaysClean}
                  style={notification.data.buddyAvatar || 'warrior'}
                />
                {!notification.read && <View style={styles.unreadDot} />}
              </View>
              
              <View style={styles.notificationText}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <View style={styles.notificationMeta}>
                  <Text style={styles.timestamp}>{formatTimestamp(notification.timestamp)}</Text>
                  <Text style={styles.productTag}>Quit {notification.data.buddyProduct}</Text>
                </View>
              </View>
            </View>
            
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
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

      case 'mention':
        return (
          <TouchableOpacity 
            key={notification.id}
            style={[styles.notificationCard, !notification.read && styles.unreadCard]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              markAsReadHandler(notification.id);
              onClose();
              
              // Small delay to ensure modal closes before navigation
              setTimeout(() => {
                // Navigate to Community feed tab with the specific post
                navigation.navigate('Community' as never, {
                  screen: 'CommunityMain',
                  params: {
                    initialTab: 'feed',
                    scrollToPostId: notification.data.postId,
                    openComments: notification.data.contextType === 'comment'
                  }
                } as never);
              }, 100);
            }}
            activeOpacity={0.9}
          >
            <View style={styles.notificationContent}>
              <View style={styles.avatarContainer}>
                <DicebearAvatar
                  userId={notification.data.mentionedById}
                  size={48}
                  daysClean={notification.data.mentionedByDaysClean}
                  style="warrior"
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
              
              <View style={[styles.milestoneIcon, { backgroundColor: `${notification.iconColor}20` }]}>
                <Ionicons 
                  name={notification.icon as any} 
                  size={20} 
                  color={notification.iconColor} 
                />
              </View>
            </View>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

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
                    When you receive buddy requests, messages, mentions, or achieve milestones, they'll appear here
                  </Text>
                </View>
              ) : (
                <>
                  {/* Today */}
                  {notifications.filter(n => {
                    const timestamp = n.timestamp instanceof Date ? n.timestamp : new Date(n.timestamp);
                    const hours = (new Date().getTime() - timestamp.getTime()) / 3600000;
                    return hours < 24;
                  }).length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>Today</Text>
                      {notifications.filter(n => {
                        const timestamp = n.timestamp instanceof Date ? n.timestamp : new Date(n.timestamp);
                        const hours = (new Date().getTime() - timestamp.getTime()) / 3600000;
                        return hours < 24;
                      }).map(renderNotification)}
                    </>
                  )}

                  {/* Earlier */}
                  {notifications.filter(n => {
                    const timestamp = n.timestamp instanceof Date ? n.timestamp : new Date(n.timestamp);
                    const hours = (new Date().getTime() - timestamp.getTime()) / 3600000;
                    return hours >= 24;
                  }).length > 0 && (
                    <>
                      <Text style={styles.sectionTitle}>Earlier</Text>
                      {notifications.filter(n => {
                        const timestamp = n.timestamp instanceof Date ? n.timestamp : new Date(n.timestamp);
                        const hours = (new Date().getTime() - timestamp.getTime()) / 3600000;
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