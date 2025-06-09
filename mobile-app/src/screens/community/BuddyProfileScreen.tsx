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
}

const BuddyProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { buddy } = route.params as RouteParams;
  const [requestSent, setRequestSent] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
    connectionStatus: buddy.connectionStatus || 'not-connected',
  };

  const getRecoveryStage = (days: number) => {
    if (days < 3) return { stage: 'Starting Out', icon: 'leaf', color: '#10B981' };
    if (days < 14) return { stage: 'Early Progress', icon: 'trending-up-outline', color: '#06B6D4' };
    if (days < 30) return { stage: 'Building Strength', icon: 'barbell-outline', color: '#8B5CF6' };
    if (days <= 90) return { stage: 'Major Recovery', icon: 'shield-checkmark-outline', color: '#F59E0B' };
    return { stage: 'Freedom', icon: 'star-outline', color: '#EF4444' };
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) > 1 ? 's' : ''} ago`;
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
                <View style={[styles.badge, { borderColor: recoveryStage.color + '40' }]}>
                  <Ionicons 
                    name={recoveryStage.icon as keyof typeof Ionicons.glyphMap} 
                    size={14} 
                    color={recoveryStage.color} 
                  />
                  <Text style={[styles.badgeText, { color: recoveryStage.color }]}>
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

            {/* Info Cards - Horizontal */}
            <View style={styles.infoRow}>
              <View style={styles.infoCard}>
                <Ionicons name="cube-outline" size={16} color="#8B5CF6" />
                <Text style={styles.infoText}>{profileData.product}</Text>
              </View>
              
              <View style={styles.infoCard}>
                <Ionicons name="calendar-outline" size={16} color="#10B981" />
                <Text style={styles.infoText}>Started {joinedTime}</Text>
              </View>
            </View>

            {/* My Why - Compact */}
            <View style={styles.whySection}>
              <Text style={styles.whyTitle}>My Why</Text>
              <View style={styles.whyTags}>
                {profileData.reasonsToQuit.map((reason, index) => (
                  <View key={index} style={styles.whyTag}>
                    <Text style={styles.whyTagText}>{reason}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Fixed Bottom Button */}
          <View style={styles.buttonContainer}>
            {profileData.connectionStatus === 'connected' ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  (navigation as any).navigate('BuddyChat', { 
                    buddy: {
                      id: profileData.id,
                      name: profileData.name,
                      daysClean: profileData.daysClean,
                      status: profileData.status
                    }
                  });
                }}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="chatbubbles-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Message Buddy</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : profileData.connectionStatus === 'pending-sent' || requestSent ? (
              <View style={styles.pendingButton}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.pendingText}>Request Sent</Text>
              </View>
            ) : profileData.connectionStatus === 'pending-received' ? (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    (navigation as any).goBack();
                  }}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Accept</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    (navigation as any).goBack();
                  }}
                >
                  <Ionicons name="close" size={20} color="#EF4444" />
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
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Send Buddy Request</Text>
                </LinearGradient>
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
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.95)', 'rgba(5, 150, 105, 0.95)']}
              style={styles.successModalGradient}
            >
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>Request Sent!</Text>
              <Text style={styles.successMessage}>
                {profileData.name} will be notified
              </Text>
            </LinearGradient>
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
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
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
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 16,
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
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bioSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
    opacity: 0.85,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  whySection: {
    marginBottom: 20,
  },
  whyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 14,
  },
  whyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  whyTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  whyTagText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pendingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  pendingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
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
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
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
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  successModalGradient: {
    padding: 32,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
});

export default BuddyProfileScreen; 