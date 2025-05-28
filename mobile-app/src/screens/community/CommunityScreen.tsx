import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

// Mock data for development
const MOCK_TEAMS = [
  {
    id: 'young_professionals',
    name: 'Young Professionals',
    description: 'Ages 22-35 building careers',
    category: 'age_group',
    memberCount: 2847,
    isRecommended: true,
    isJoined: false,
    icon: 'briefcase',
    color: '#10B981',
  },
  {
    id: 'parents_recovery',
    name: 'Parents in Recovery',
    description: 'Quitting for our kids',
    category: 'lifestyle',
    memberCount: 1923,
    isRecommended: true,
    isJoined: true,
    icon: 'heart',
    color: '#F59E0B',
  },
  {
    id: 'fitness_focused',
    name: 'Fitness Focused',
    description: 'Athletes & gym enthusiasts',
    category: 'interest',
    memberCount: 3421,
    isRecommended: false,
    isJoined: false,
    icon: 'fitness',
    color: '#EF4444',
  },
  {
    id: 'tech_workers',
    name: 'Tech Workers',
    description: 'Software engineers & developers',
    category: 'profession',
    memberCount: 1567,
    isRecommended: true,
    isJoined: false,
    icon: 'laptop',
    color: '#8B5CF6',
  },
];

const MOCK_RANKING = [
  { id: '1', username: 'RecoveryChamp', rank: 1, score: 98, daysClean: 45, isCurrentUser: false },
  { id: '2', username: 'You', rank: 2, score: 94, daysClean: 90, isCurrentUser: true },
  { id: '3', username: 'StrongMind', rank: 3, score: 91, daysClean: 23, isCurrentUser: false },
  { id: '4', username: 'FreedomSeeker', rank: 4, score: 88, daysClean: 67, isCurrentUser: false },
  { id: '5', username: 'NewBeginning', rank: 5, score: 85, daysClean: 12, isCurrentUser: false },
];

const CommunityScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'discover' | 'myteams' | 'rankings'>('myteams');

  const renderTeamCard = ({ item }: { item: typeof MOCK_TEAMS[0] }) => (
    <TouchableOpacity style={styles.teamCard}>
      <LinearGradient
        colors={[item.color + '20', item.color + '10']}
        style={styles.teamCardGradient}
      >
        <View style={styles.teamHeader}>
          <View style={[styles.teamIcon, { backgroundColor: item.color + '30' }]}>
            <Ionicons name={item.icon as any} size={24} color={item.color} />
          </View>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{item.name}</Text>
            <Text style={styles.teamDescription}>{item.description}</Text>
            <Text style={styles.teamMembers}>{item.memberCount.toLocaleString()} members</Text>
          </View>
          {item.isRecommended && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Recommended</Text>
            </View>
          )}
        </View>
        
        <View style={styles.teamActions}>
          {item.isJoined ? (
            <TouchableOpacity style={[styles.actionButton, styles.viewButton]}>
              <Text style={styles.viewButtonText}>View Rankings</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.actionButton, styles.joinButton]}>
              <Text style={styles.joinButtonText}>Join Team</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderRankingItem = ({ item }: { item: typeof MOCK_RANKING[0] }) => (
    <View style={[styles.rankingItem, item.isCurrentUser && styles.currentUserRanking]}>
      <View style={styles.rankingLeft}>
        <Text style={[styles.rankNumber, item.isCurrentUser && styles.currentUserText]}>
          #{item.rank}
        </Text>
        <Text style={[styles.username, item.isCurrentUser && styles.currentUserText]}>
          {item.username}
        </Text>
      </View>
      <View style={styles.rankingRight}>
        <Text style={[styles.scoreText, item.isCurrentUser && styles.currentUserText]}>
          {item.score} pts
        </Text>
        <Text style={styles.daysText}>{item.daysClean} days</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Recovery Teams</Text>
          <Text style={styles.subtitle}>
            Compete, support, and grow together
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'myteams' && styles.activeTab]}
            onPress={() => setActiveTab('myteams')}
          >
            <Text style={[styles.tabText, activeTab === 'myteams' && styles.activeTabText]}>
              My Teams
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
            onPress={() => setActiveTab('discover')}
          >
            <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
              Discover
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'rankings' && styles.activeTab]}
            onPress={() => setActiveTab('rankings')}
          >
            <Text style={[styles.tabText, activeTab === 'rankings' && styles.activeTabText]}>
              Rankings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'myteams' && (
            <View>
              <Text style={styles.sectionTitle}>Your Teams</Text>
              <FlatList
                data={MOCK_TEAMS.filter(team => team.isJoined)}
                renderItem={renderTeamCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
              
              <Text style={styles.sectionTitle}>Recommended for You</Text>
              <FlatList
                data={MOCK_TEAMS.filter(team => team.isRecommended && !team.isJoined)}
                renderItem={renderTeamCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {activeTab === 'discover' && (
            <View>
              <Text style={styles.sectionTitle}>All Teams</Text>
              <FlatList
                data={MOCK_TEAMS}
                renderItem={renderTeamCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {activeTab === 'rankings' && (
            <View>
              <Text style={styles.sectionTitle}>Parents in Recovery - This Week</Text>
              <View style={styles.rankingContainer}>
                <FlatList
                  data={MOCK_RANKING}
                  renderItem={renderRankingItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
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
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  teamCard: {
    marginBottom: SPACING.md,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  teamCardGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SPACING.lg,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  teamIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  teamDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  teamMembers: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  recommendedBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  recommendedText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  teamActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
  },
  joinButtonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  viewButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  viewButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  rankingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.lg,
    padding: SPACING.md,
  },
  rankingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  currentUserRanking: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: SPACING.sm,
    borderBottomColor: 'transparent',
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginRight: SPACING.md,
    minWidth: 30,
  },
  username: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  currentUserText: {
    color: COLORS.primary,
  },
  rankingRight: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  daysText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});

export default CommunityScreen; 