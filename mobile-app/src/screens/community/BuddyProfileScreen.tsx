import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';
import DicebearAvatar from '../../components/common/DicebearAvatar';
import { getBadgeForDaysClean } from '../../utils/badges';
import * as Haptics from 'expo-haptics';

interface RouteParams {
  buddy: {
    id: string;
    name: string;
    daysClean: number;
    status: 'online' | 'offline';
    bio?: string;
    supportStyles?: string[];
    quitDate?: string;
    longestStreak?: number;
    totalDaysClean?: number;
    connectionStatus?: 'connected' | 'pending-sent' | 'pending-received' | 'not-connected';
    product?: string;
  };
  onAccept?: () => void;
  onDecline?: () => void;
  onEndConnection?: () => void;
}

const BuddyProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { buddy, onAccept, onDecline, onEndConnection } = route.params as RouteParams;
  const [requestSent, setRequestSent] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(buddy.connectionStatus);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Mock additional data for now
  const profileData = {
    ...buddy,
    bio: buddy.bio || "Hey there! I'm on this journey to quit nicotine and would love to connect with others who understand the struggle. Let's support each other!",
    supportStyles: buddy.supportStyles || ['Motivator', 'Listener', 'Practical'],
    quitDate: buddy.quitDate || new Date(Date.now() - buddy.daysClean * 24 * 60 * 60 * 1000).toISOString(),
    longestStreak: buddy.longestStreak || buddy.daysClean,
    totalDaysClean: buddy.totalDaysClean || buddy.daysClean,
    product: buddy.product || 'Nicotine Pouches',
    reasonsToQuit: ['Better health', 'Save money', 'Family'],
    connectionStatus: connectionStatus || 'not-connected',
  };

  const getRecoveryStage = (days: number) => {
    if (days < 3) return { stage: 'Starting Out', icon: 'leaf', color: 'rgba(255, 255, 255, 0.5)' };
    if (days < 14) return { stage: 'Early Progress', icon: 'trending-up-outline', color: 'rgba(255, 255, 255, 0.5)' };
    if (days < 30) return { stage: 'Building Strength', icon: 'barbell-outline', color: 'rgba(255, 255, 255, 0.5)' };
    if (days <= 90) return { stage: 'Major Recovery', icon: 'shield-checkmark-outline', color: 'rgba(255, 255, 255, 0.5)' };
    return { stage: 'Freedom', icon: 'star-outline', color: 'rgba(255, 255, 255, 0.5)' };
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const weeks = Math.floor(diffInDays / 7);
    if (diffInDays < 30) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    
    const months = Math.floor(diffInDays / 30);
    if (diffInDays < 365) return `${months} month${months === 1 ? '' : 's'} ago`;
    
    const years = Math.floor(diffInDays / 365);
    return `${years} year${years === 1 ? '' : 's'} ago`;
  };

  const recoveryStage = getRecoveryStage(profileData.daysClean);
  const joinedTime = getTimeAgo(profileData.quitDate);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Buddy Profile</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar and Name */}
            <View style={styles.profileHeader}>
              <DicebearAvatar
                userId={profileData.id}
                size="large"
                daysClean={profileData.daysClean}
                style="warrior"
                badgeIcon={getBadgeForDaysClean(profileData.daysClean)?.icon}
                badgeColor={getBadgeForDaysClean(profileData.daysClean)?.color}
              />
              <Text style={styles.name}>{profileData.name}</Text>
              
              {/* Recovery Stage Badge */}
              <View style={styles.recoveryBadge}>
                <View style={styles.badge}>
                  <Ionicons 
                    name={recoveryStage.icon as keyof typeof Ionicons.glyphMap} 
                    size={14} 
                    color={recoveryStage.color} 
                  />
                  <Text style={styles.badgeText}>
                    {recoveryStage.stage}
                  </Text>
                </View>
              </View>
            </View>

            {/* Bio - Full text */}
            <View style={styles.bioSection}>
              <Text style={styles.bio}>
                {profileData.bio}
              </Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsSection}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Quit</Text>
                <Text style={styles.statValue}>{profileData.product}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Started</Text>
                <Text style={styles.statValue}>{joinedTime}</Text>
              </View>
            </View>

            {/* Support Style - Vibe */}
            <View style={styles.vibeSection}>
              <Text style={styles.vibeTitle}>Vibe</Text>
              <View style={styles.vibeTags}>
                {profileData.supportStyles.map((style, index) => (
                  <View key={index} style={styles.vibeTag}>
                    <Text style={styles.vibeTagText}>{style}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Fixed Bottom Button */}
          <View style={styles.buttonContainer}>
            {profileData.connectionStatus === 'connected' ? (
              <View style={styles.connectedActions}>
                <TouchableOpacity
                  style={styles.messageButtonConnected}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    (navigation as any).navigate('BuddyChat', { 
                      buddy: {
                        id: profileData.id,
                        name: profileData.name,
                        daysClean: profileData.daysClean,
                        status: profileData.status
                      },
                      onEndConnection: onEndConnection
                    });
                  }}
                >
                  <View style={styles.buttonGradient}>
                    <Ionicons name="chatbubbles-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Message</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.endConnectionButton}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Alert.alert(
                      'End Buddy Connection?',
                      `Are you sure you want to disconnect from ${profileData.name}? You can always reconnect later.`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'End Connection', 
                          style: 'destructive',
                          onPress: () => {
                            if (onEndConnection) {
                              onEndConnection();
                              // Update local state and navigate back
                              setConnectionStatus('not-connected');
                              navigation.goBack();
                            }
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255, 255, 255, 0.4)" />
                </TouchableOpacity>
              </View>
            ) : profileData.connectionStatus === 'pending-sent' || requestSent ? (
              <View style={styles.pendingButton}>
                <Ionicons name="checkmark-circle" size={20} color="rgba(255, 255, 255, 0.6)" />
                <Text style={styles.pendingText}>Request Sent</Text>
              </View>
            ) : profileData.connectionStatus === 'pending-received' ? (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Success);
                    // Call the accept function passed from CommunityScreen
                    if (onAccept) {
                      onAccept();
                    }
                    // Update local state to show connected status
                    setConnectionStatus('connected');
                  }}
                >
                  <View style={styles.buttonGradient}>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Accept</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    // Call the decline function passed from CommunityScreen
                    if (onDecline) {
                      onDecline();
                    }
                    // Navigate back after declining
                    (navigation as any).goBack();
                  }}
                >
                  <Ionicons name="close" size={20} color="rgba(255, 255, 255, 0.4)" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setRequestSent(true);
                  
                  // Show custom success modal
                  setShowSuccessModal(true);
                  Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                  }).start();
                  
                  // Auto-hide after 2 seconds
                  setTimeout(() => {
                    Animated.timing(fadeAnim, {
                      toValue: 0,
                      duration: 300,
                      useNativeDriver: true,
                    }).start(() => {
                      setShowSuccessModal(false);
                    });
                  }, 2000);
                }}
              >
                <View style={styles.buttonGradient}>
                  <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Send Buddy Request</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
      
      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.successModal,
              {
                opacity: fadeAnim,
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                }],
              },
            ]}
          >
            <View style={styles.successModalGradient}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>Request Sent!</Text>
              <Text style={styles.successMessage}>
                {profileData.name} will be notified
              </Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  recoveryBadge: {
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  bioSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  bio: {
    fontSize: 15,
    fontWeight: '300',
    lineHeight: 22,
    color: COLORS.text,
    opacity: 0.85,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '300',
    color: COLORS.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '400',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: 20,
  },
  vibeSection: {
    marginBottom: 20,
  },
  vibeTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  vibeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  vibeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  vibeTagText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  actionButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 15,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  pendingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pendingText: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  declineButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    borderRadius: 20,
    overflow: 'hidden',
    minWidth: 280,
  },
  successModalGradient: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 32,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  successMessage: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  connectedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  messageButtonConnected: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  endConnectionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
});

export default BuddyProfileScreen; 