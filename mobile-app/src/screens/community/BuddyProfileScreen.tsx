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
import Avatar from '../../components/common/Avatar';
import * as Haptics from 'expo-haptics';

interface RouteParams {
  buddy: {
    id: string;
    name: string;
    avatar: string;
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
              <Avatar
                size="large"
                emoji={profileData.avatar}
                daysClean={profileData.daysClean}
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
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{profileData.daysClean}</Text>
                  <Text style={styles.statLabel}>Current Streak</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{profileData.longestStreak}</Text>
                  <Text style={styles.statLabel}>Longest Streak</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{profileData.totalDaysClean}</Text>
                  <Text style={styles.statLabel}>Total Days Clean</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{formatDate(profileData.quitDate)}</Text>
                  <Text style={styles.statLabel}>Quit Date</Text>
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

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.goBack();
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
    paddingBottom: SPACING.xxl,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
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
  actionButtons: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
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