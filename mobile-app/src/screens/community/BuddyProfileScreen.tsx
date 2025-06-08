import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';
import DicebearAvatar from '../../components/common/DicebearAvatar';
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
  };
}

const BuddyProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { buddy } = route.params as RouteParams;

  // Mock additional data for now
  const profileData = {
    ...buddy,
    bio: buddy.bio || "Hey there! I'm on this journey to quit nicotine and would love to connect with others who understand the struggle. Let's support each other!",
    supportStyles: buddy.supportStyles || ['Motivator', 'Listener', 'Practical'],
    quitDate: buddy.quitDate || new Date(Date.now() - buddy.daysClean * 24 * 60 * 60 * 1000).toISOString(),
    longestStreak: buddy.longestStreak || buddy.daysClean,
    totalDaysClean: buddy.totalDaysClean || buddy.daysClean,
    product: 'Nicotine Pouches',
    reasonsToQuit: ['Better health', 'Save money', 'Family'],
  };

  // Calculate retention-friendly metrics
  const getRecoveryStage = (days: number) => {
    if (days < 7) return { stage: 'Fresh Start', icon: '🌱', color: '#10B981' };
    if (days < 30) return { stage: 'Building Habits', icon: '🛠️', color: '#3B82F6' };
    if (days < 90) return { stage: 'Gaining Momentum', icon: '🚀', color: '#8B5CF6' };
    if (days < 365) return { stage: 'Strong Foundation', icon: '💪', color: '#EC4899' };
    return { stage: 'Recovery Champion', icon: '🏆', color: '#F59E0B' };
  };

  const getMilestone = (days: number) => {
    if (days >= 365) return '1 Year Legend';
    if (days >= 180) return '6 Month Hero';
    if (days >= 90) return '90 Day Warrior';
    if (days >= 30) return '1 Month Champion';
    if (days >= 7) return 'Week Warrior';
    return 'Rising Star';
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
  const milestone = getMilestone(profileData.daysClean);
  const joinedTime = getTimeAgo(profileData.quitDate);

  const supportStyleColors: Record<string, string> = {
    'Motivator': '#10B981',
    'Listener': '#3B82F6',
    'Tough Love': '#EF4444',
    'Analytical': '#8B5CF6',
    'Spiritual': '#EC4899',
    'Practical': '#F59E0B',
    'Humorous': '#14B8A6',
    'Mentor': '#6366F1',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Buddy Profile</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <DicebearAvatar
                userId={profileData.id}
                size="large"
                daysClean={profileData.daysClean}
                style="warrior"
              />
              <Text style={styles.name}>{profileData.name}</Text>
              
            </View>

            {/* Support Styles */}
            {profileData.supportStyles.length > 0 && (
              <View style={styles.supportStylesContainer}>
                <Text style={styles.sectionTitle}>Support Style</Text>
                <View style={styles.supportStyles}>
                  {profileData.supportStyles.map((style, index) => (
                    <View
                      key={index}
                      style={[
                        styles.supportStyleTag,
                        { backgroundColor: `${supportStyleColors[style]}20` }
                      ]}
                    >
                      <Text style={[
                        styles.supportStyleText,
                        { color: supportStyleColors[style] }
                      ]}>
                        {style}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Bio */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bio}>{profileData.bio}</Text>
            </View>

            {/* Recovery Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recovery Journey</Text>
              
              {/* Recovery Stage Card */}
              <LinearGradient
                colors={[`${recoveryStage.color}20`, `${recoveryStage.color}10`]}
                style={styles.stageCard}
              >
                <View style={styles.stageHeader}>
                  <Text style={styles.stageEmoji}>{recoveryStage.icon}</Text>
                  <View style={styles.stageInfo}>
                    <Text style={[styles.stageTitle, { color: recoveryStage.color }]}>
                      {recoveryStage.stage}
                    </Text>
                    <Text style={styles.stageSubtitle}>Recovery Stage</Text>
                  </View>
                </View>
              </LinearGradient>

              <View style={styles.metricsGrid}>
                {/* Milestone Badge */}
                <View style={styles.metricCard}>
                  <LinearGradient
                    colors={['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.05)']}
                    style={styles.metricGradient}
                  >
                    <Ionicons name="trophy" size={24} color="#F59E0B" />
                    <Text style={styles.metricValue}>{milestone}</Text>
                    <Text style={styles.metricLabel}>Achievement</Text>
                  </LinearGradient>
                </View>

                {/* Community Impact */}
                <View style={styles.metricCard}>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']}
                    style={styles.metricGradient}
                  >
                    <Ionicons name="people" size={24} color="#10B981" />
                    <Text style={styles.metricValue}>Supporting 3</Text>
                    <Text style={styles.metricLabel}>Buddies</Text>
                  </LinearGradient>
                </View>

                {/* Activity Level */}
                <View style={styles.metricCard}>
                  <LinearGradient
                    colors={['rgba(59, 130, 246, 0.15)', 'rgba(59, 130, 246, 0.05)']}
                    style={styles.metricGradient}
                  >
                    <Ionicons name="flame" size={24} color="#3B82F6" />
                    <Text style={styles.metricValue}>5 Days</Text>
                    <Text style={styles.metricLabel}>This Week</Text>
                  </LinearGradient>
                </View>

                {/* Journey Started */}
                <View style={styles.metricCard}>
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
                    style={styles.metricGradient}
                  >
                    <Ionicons name="calendar" size={24} color="#8B5CF6" />
                    <Text style={styles.metricValue}>{joinedTime}</Text>
                    <Text style={styles.metricLabel}>Started</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>

            {/* Product Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quitting</Text>
              <View style={styles.productInfo}>
                <Text style={styles.productText}>{profileData.product}</Text>
              </View>
            </View>

            {/* Reasons to Quit */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reasons to Quit</Text>
              <View style={styles.reasonsContainer}>
                {profileData.reasonsToQuit.map((reason, index) => (
                  <View key={index} style={styles.reasonTag}>
                    <Text style={styles.reasonText}>{reason}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Fixed Message Button */}
          <View style={styles.fixedButtonContainer}>
            <TouchableOpacity
              style={styles.messageButton}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Navigate to chat screen with buddy info
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
                style={styles.messageButtonGradient}
              >
                <Ionicons name="chatbubbles-outline" size={20} color="#FFFFFF" />
                <Text style={styles.messageButtonText}>Message Buddy</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Increased from SPACING.xxl to account for fixed button
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  supportStylesContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  supportStyles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  supportStyleTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  supportStyleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
    opacity: 0.9,
  },
  stageCard: {
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  stageEmoji: {
    fontSize: 40,
  },
  stageInfo: {
    flex: 1,
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  stageSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: '48%',
    marginBottom: 2,
  },
  metricGradient: {
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 2,
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  productInfo: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  productText: {
    fontSize: 15,
    color: '#A78BFA',
    fontWeight: '500',
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  reasonTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  reasonText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  messageButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: SPACING.sm,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default BuddyProfileScreen; 