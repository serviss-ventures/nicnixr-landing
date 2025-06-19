import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING } from '../../../constants/theme';
import { AchievementState, ProgressStats, Badge } from '../../../types';
import { achievementService, Achievement } from '../../../services/achievementService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AchievementsTabProps {
  achievements: AchievementState;
  stats: ProgressStats | null;
}

const AchievementsTab: React.FC<AchievementsTabProps> = ({ achievements, stats }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'progress' | 'community' | 'health' | 'resilience'>('all');
  const [dbAchievements, setDbAchievements] = useState<Achievement[]>([]);
  const [nextAchievables, setNextAchievables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Fetch achievements from database
  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const [userAchievements, nextBadges] = await Promise.all([
          achievementService.getUserAchievements(user.id),
          achievementService.getNextAchievableBadges(user.id, 3)
        ]);
        
        setDbAchievements(userAchievements);
        setNextAchievables(nextBadges);
        
        // Check for new achievements
        await achievementService.checkAndUnlockAchievements(user.id);
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAchievements();
  }, [user?.id]);
  
  // Combine local and database achievements
  const combinedBadges = useMemo(() => {
    // Use database achievements if available, otherwise fall back to local
    if (dbAchievements.length > 0) {
      return dbAchievements.map(dbAch => ({
        id: dbAch.badgeId,
        title: dbAch.badgeName,
        description: dbAch.badgeDescription || '',
        icon: dbAch.iconName || '🏆',
        category: dbAch.category,
        type: 'custom' as const,
        requirement: dbAch.milestoneValue || 1,
        progress: dbAch.milestoneValue || 1,
        rarity: dbAch.rarity,
        earnedDate: dbAch.unlockedAt,
      }));
    }
    return achievements.badges;
  }, [achievements.badges, dbAchievements]);
  
  // Filter badges based on category
  const filteredBadges = useMemo(() => {
    if (selectedCategory === 'all') {
      return combinedBadges;
    }
    return combinedBadges.filter(badge => badge.category === selectedCategory);
  }, [combinedBadges, selectedCategory]);
  
  // Calculate stats
  const totalBadges = 16; // Total possible badges from achievement_definitions
  const earnedBadges = dbAchievements.length;
  const progressPercentage = totalBadges > 0 ? (earnedBadges / totalBadges) * 100 : 0;
  
  // Get next badge to earn from database
  const nextBadge = useMemo(() => {
    if (nextAchievables.length > 0) {
      const next = nextAchievables[0];
      const daysClean = stats?.daysClean || 0;
      return {
        id: next.badge_id,
        title: next.badge_name,
        description: next.requirement_description,
        icon: next.icon_name || '🏆',
        category: next.category,
        type: 'days' as const,
        requirement: next.requirement_value,
        progress: next.requirement_type === 'days_clean' ? daysClean : 0,
        rarity: next.rarity,
      };
    }
    return null;
  }, [nextAchievables, stats?.daysClean]);
  
  // Category Selector
  const CategorySelector = () => {
    const categories = [
      { id: 'all', label: 'All', icon: 'grid-outline' },
      { id: 'progress', label: 'Progress', icon: 'trending-up-outline' },
      { id: 'community', label: 'Community', icon: 'people-outline' },
      { id: 'health', label: 'Health', icon: 'heart-outline' },
      { id: 'resilience', label: 'Resilience', icon: 'shield-outline' },
    ];
    
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categorySelector}
        contentContainerStyle={styles.categorySelectorContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id as any)}
          >
            <Ionicons
              name={category.icon as any}
              size={18}
              color={selectedCategory === category.id ? COLORS.text : COLORS.textSecondary}
            />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.id && styles.categoryButtonTextActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  // Progress Overview Card
  const ProgressOverview = () => (
    <Animated.View 
      entering={FadeIn.duration(400)}
      style={styles.overviewCard}
    >
      <LinearGradient
        colors={['rgba(250, 204, 21, 0.08)', 'rgba(250, 204, 21, 0.02)']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={styles.overviewHeader}>
        <View style={styles.overviewIconWrapper}>
          <Ionicons name="trophy" size={24} color="rgba(250, 204, 21, 0.8)" />
        </View>
        <View style={styles.overviewInfo}>
          <Text style={styles.overviewTitle}>Achievement Progress</Text>
          <Text style={styles.overviewSubtitle}>
            {earnedBadges} of {totalBadges} badges earned
          </Text>
        </View>
      </View>
      
      <View style={styles.overviewProgressBar}>
        <View 
          style={[
            styles.overviewProgressFill, 
            { width: `${progressPercentage}%` }
          ]} 
        />
      </View>
      
      <View style={styles.overviewStats}>
        <View style={styles.overviewStat}>
          <Text style={styles.overviewStatValue}>{achievements.points}</Text>
          <Text style={styles.overviewStatLabel}>Total Points</Text>
        </View>
        <View style={styles.overviewStatDivider} />
        <View style={styles.overviewStat}>
          <Text style={styles.overviewStatValue}>{achievements.level}</Text>
          <Text style={styles.overviewStatLabel}>Current Level</Text>
        </View>
        <View style={styles.overviewStatDivider} />
        <View style={styles.overviewStat}>
          <Text style={styles.overviewStatValue}>{Math.round(progressPercentage)}%</Text>
          <Text style={styles.overviewStatLabel}>Complete</Text>
        </View>
      </View>
      
      {nextBadge && (
        <View style={styles.nextBadgeHint}>
          <Text style={styles.nextBadgeLabel}>Next Badge:</Text>
          <Text style={styles.nextBadgeTitle}>{nextBadge.title}</Text>
          <View style={styles.nextBadgeProgress}>
            <View style={styles.nextBadgeProgressBar}>
              <View 
                style={[
                  styles.nextBadgeProgressFill,
                  { width: `${(nextBadge.progress / nextBadge.requirement) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.nextBadgeProgressText}>
              {nextBadge.progress} / {nextBadge.requirement}
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
  
  // Badge Card Component
  const BadgeCard = ({ badge, index }: { badge: Badge; index: number }) => {
    const isEarned = !!badge.earnedDate;
    
    // Get rarity color
    const getRarityColor = () => {
      switch (badge.rarity) {
        case 'legendary': return 'rgba(250, 204, 21, 0.8)'; // Gold
        case 'epic': return 'rgba(192, 132, 252, 0.8)'; // Purple
        case 'rare': return 'rgba(147, 197, 253, 0.8)'; // Blue
        default: return 'rgba(134, 239, 172, 0.8)'; // Green
      }
    };
    
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).duration(400)}
        style={[
          styles.badgeCard,
          !isEarned && styles.badgeCardLocked
        ]}
      >
        {isEarned && (
          <LinearGradient
            colors={[`${getRarityColor()}10`, 'transparent']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        
        <View style={styles.badgeLeft}>
          <View style={[
            styles.badgeIconWrapper,
            isEarned && styles.badgeIconWrapperEarned,
            isEarned && { borderColor: `${getRarityColor()}30` }
          ]}>
            {badge.icon && badge.icon.length > 2 ? (
              <Ionicons 
                name={badge.icon as any} 
                size={24} 
                color={isEarned ? getRarityColor() : COLORS.textMuted} 
              />
            ) : (
              <Text style={styles.badgeIcon}>{badge.icon || '🏆'}</Text>
            )}
          </View>
        </View>
        
        <View style={styles.badgeContent}>
          <View style={styles.badgeHeader}>
            <Text style={[
              styles.badgeTitle,
              !isEarned && styles.badgeTitleLocked
            ]}>
              {badge.title}
            </Text>
            {badge.rarity !== 'common' && (
              <View style={[
                styles.rarityBadge,
                { backgroundColor: `${getRarityColor()}20` }
              ]}>
                <Text style={[
                  styles.rarityText,
                  { color: getRarityColor() }
                ]}>
                  {badge.rarity.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.badgeDescription}>
            {badge.description}
          </Text>
          
          {isEarned ? (
            <View style={styles.badgeEarnedInfo}>
              <Text style={styles.badgeEarnedDate}>
                Earned {new Date(badge.earnedDate).toLocaleDateString()}
              </Text>
            </View>
          ) : (
            <View style={styles.badgeProgress}>
              <View style={styles.badgeProgressBar}>
                <View 
                  style={[
                    styles.badgeProgressFill,
                    { width: `${Math.min((badge.progress / badge.requirement) * 100, 100)}%` }
                  ]}
                />
              </View>
              <Text style={styles.badgeProgressText}>
                {badge.progress} / {badge.requirement} {badge.type === 'days' ? 'days' : badge.type}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <ProgressOverview />
      <CategorySelector />
        
        <View style={styles.badgesContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Badges' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Badges`}
          </Text>
          
          {filteredBadges.length > 0 ? (
            <View style={styles.badgeGrid}>
              {filteredBadges.map((badge, index) => (
                <BadgeCard key={badge.id} badge={badge} index={index} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyStateText}>
                No badges in this category yet
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Keep going! You'll earn them soon.
              </Text>
            </View>
          )}
        </View>
        
        {/* Motivational Section */}
        <View style={styles.motivationalCard}>
          <LinearGradient
            colors={['rgba(192, 132, 252, 0.1)', 'rgba(192, 132, 252, 0.05)']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Ionicons name="sparkles" size={20} color="rgba(192, 132, 252, 0.8)" />
          <Text style={styles.motivationalText}>
            Every badge represents a victory over addiction. You're doing amazing!
          </Text>
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 3,
  },
  
  // Overview Card
  overviewCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    position: 'relative',
    overflow: 'hidden',
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  overviewIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.2)',
  },
  overviewInfo: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 2,
  },
  overviewSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  overviewProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 3,
    marginBottom: SPACING.lg,
  },
  overviewProgressFill: {
    height: '100%',
    backgroundColor: 'rgba(250, 204, 21, 0.5)',
    borderRadius: 3,
  },
  overviewStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewStat: {
    flex: 1,
    alignItems: 'center',
  },
  overviewStatValue: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  overviewStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overviewStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  nextBadgeHint: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  nextBadgeLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  nextBadgeTitle: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '400',
    marginBottom: 8,
  },
  nextBadgeProgress: {
    gap: 4,
  },
  nextBadgeProgressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 1.5,
  },
  nextBadgeProgressFill: {
    height: '100%',
    backgroundColor: 'rgba(250, 204, 21, 0.4)',
    borderRadius: 1.5,
  },
  nextBadgeProgressText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  
  // Category Selector
  categorySelector: {
    marginTop: SPACING.lg,
  },
  categorySelectorContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginRight: SPACING.sm,
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  categoryButtonTextActive: {
    color: COLORS.text,
    fontWeight: '500',
  },
  
  // Badges Section
  badgesContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  badgeGrid: {
    gap: SPACING.md,
  },
  
  // Badge Card
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    position: 'relative',
    overflow: 'hidden',
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeLeft: {
    marginRight: SPACING.md,
  },
  badgeIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeIconWrapperEarned: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
  },
  badgeIcon: {
    fontSize: 28,
  },
  badgeContent: {
    flex: 1,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  badgeTitleLocked: {
    color: COLORS.textSecondary,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  badgeDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '300',
    marginBottom: 8,
  },
  badgeEarnedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeEarnedDate: {
    fontSize: 11,
    color: 'rgba(134, 239, 172, 0.8)',
    fontWeight: '400',
  },
  badgeProgress: {
    gap: 4,
  },
  badgeProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 2,
  },
  badgeProgressFill: {
    height: '100%',
    backgroundColor: 'rgba(147, 197, 253, 0.5)',
    borderRadius: 2,
  },
  badgeProgressText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  
  // Empty State
  emptyState: {
    paddingVertical: SPACING.xl * 3,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '400',
    marginTop: SPACING.md,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '300',
    marginTop: 4,
  },
  
  // Motivational Card
  motivationalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: SPACING.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  motivationalText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '300',
    textAlign: 'center',
  },
  
  // Progress Overview
  progressOverview: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  progressCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    position: 'relative',
    overflow: 'hidden',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.text,
    marginRight: SPACING.md,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progressBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 3,
    marginBottom: SPACING.lg,
  },
  progressBarBg: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'rgba(250, 204, 21, 0.5)',
    borderRadius: 3,
  },
  progressSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 4,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
});

export default AchievementsTab; 