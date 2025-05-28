import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchTeams, joinTeam, leaveTeam, fetchTeamRankings } from '../../store/slices/communitySlice';
import { COLORS, SPACING } from '../../constants/theme';
import { RecoveryTeam, TeamMember } from '../../types';

const CommunityScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    teams, 
    joinedTeams, 
    teamRankings, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.community);
  
  const [activeTab, setActiveTab] = useState<'discover' | 'myteams' | 'rankings'>('myteams');
  const [selectedTeamForRankings, setSelectedTeamForRankings] = useState<string | null>(null);

  // Load teams on component mount
  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  // Load rankings for joined teams
  useEffect(() => {
    joinedTeams.forEach(team => {
      if (!teamRankings[team.id]) {
        dispatch(fetchTeamRankings(team.id));
      }
    });
  }, [joinedTeams, teamRankings, dispatch]);

  const handleJoinTeam = async (teamId: string) => {
    try {
      await dispatch(joinTeam(teamId)).unwrap();
      // Fetch rankings for the newly joined team
      dispatch(fetchTeamRankings(teamId));
    } catch (error) {
      console.error('Failed to join team:', error);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    try {
      await dispatch(leaveTeam(teamId)).unwrap();
    } catch (error) {
      console.error('Failed to leave team:', error);
    }
  };

  const handleViewRankings = (teamId: string) => {
    setSelectedTeamForRankings(teamId);
    setActiveTab('rankings');
    if (!teamRankings[teamId]) {
      dispatch(fetchTeamRankings(teamId));
    }
  };

  const renderTeamCard = ({ item }: { item: RecoveryTeam }) => (
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
            <View style={styles.joinedActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.viewButton]}
                onPress={() => handleViewRankings(item.id)}
              >
                <Text style={styles.viewButtonText}>View Rankings</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.leaveButton]}
                onPress={() => handleLeaveTeam(item.id)}
              >
                <Text style={styles.leaveButtonText}>Leave</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.actionButton, styles.joinButton]}
              onPress={() => handleJoinTeam(item.id)}
              disabled={isLoading}
            >
              <Text style={styles.joinButtonText}>
                {isLoading ? 'Joining...' : 'Join Team'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderRankingItem = ({ item }: { item: TeamMember }) => {
    const isCurrentUser = item.username === 'You' || item.id === 'current_user_id';
    const rankChange = item.previousRank ? item.currentRank - item.previousRank : 0;
    
    return (
      <View style={[styles.rankingItem, isCurrentUser && styles.currentUserRanking]}>
        <View style={styles.rankingLeft}>
          <View style={styles.rankInfo}>
            <Text style={[styles.rankNumber, isCurrentUser && styles.currentUserText]}>
              #{item.currentRank}
            </Text>
            {rankChange !== 0 && (
              <View style={styles.rankChange}>
                <Ionicons 
                  name={rankChange < 0 ? 'arrow-up' : 'arrow-down'} 
                  size={12} 
                  color={rankChange < 0 ? COLORS.primary : '#EF4444'} 
                />
                <Text style={[
                  styles.rankChangeText,
                  { color: rankChange < 0 ? COLORS.primary : '#EF4444' }
                ]}>
                  {Math.abs(rankChange)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.username, isCurrentUser && styles.currentUserText]}>
              {item.username}
            </Text>
            {item.badges && item.badges.length > 0 && (
              <View style={styles.badges}>
                {item.badges.slice(0, 2).map((badge, index) => (
                  <View key={index} style={styles.badge}>
                    <Text style={styles.badgeText}>{badge.replace('_', ' ')}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        <View style={styles.rankingRight}>
          <Text style={[styles.scoreText, isCurrentUser && styles.currentUserText]}>
            {item.weeklyScore} pts
          </Text>
          <Text style={styles.daysText}>{item.daysClean} days</Text>
        </View>
      </View>
    );
  };

  const getCurrentTeamRankings = () => {
    if (selectedTeamForRankings && teamRankings[selectedTeamForRankings]) {
      return teamRankings[selectedTeamForRankings];
    }
    
    // Default to first joined team's rankings
    const firstJoinedTeam = joinedTeams[0];
    if (firstJoinedTeam && teamRankings[firstJoinedTeam.id]) {
      return teamRankings[firstJoinedTeam.id];
    }
    
    return null;
  };

  const currentRanking = getCurrentTeamRankings();
  const recommendedTeams = teams.filter(team => team.isRecommended && !team.isJoined);
  const allTeams = teams.filter(team => !team.isJoined);

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
          {joinedTeams.length > 0 && (
            <Text style={styles.statsText}>
              You're in {joinedTeams.length} team{joinedTeams.length !== 1 ? 's' : ''}
            </Text>
          )}
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
            {joinedTeams.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{joinedTeams.length}</Text>
              </View>
            )}
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
            disabled={joinedTeams.length === 0}
          >
            <Text style={[
              styles.tabText, 
              activeTab === 'rankings' && styles.activeTabText,
              joinedTeams.length === 0 && styles.disabledTabText
            ]}>
              Rankings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'myteams' && (
            <View>
              {joinedTeams.length > 0 ? (
                <>
                  <Text style={styles.sectionTitle}>Your Teams</Text>
                  <FlatList
                    data={joinedTeams}
                    renderItem={renderTeamCard}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyStateTitle}>No Teams Yet</Text>
                  <Text style={styles.emptyStateText}>
                    Join a team to start competing and supporting each other in recovery!
                  </Text>
                  <TouchableOpacity
                    style={styles.exploreButton}
                    onPress={() => setActiveTab('discover')}
                  >
                    <Text style={styles.exploreButtonText}>Explore Teams</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {recommendedTeams.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Recommended for You</Text>
                  <FlatList
                    data={recommendedTeams}
                    renderItem={renderTeamCard}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                </>
              )}
            </View>
          )}

          {activeTab === 'discover' && (
            <View>
              <Text style={styles.sectionTitle}>All Teams</Text>
              <FlatList
                data={allTeams}
                renderItem={renderTeamCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {activeTab === 'rankings' && (
            <View>
              {currentRanking ? (
                <>
                  <View style={styles.rankingHeader}>
                    <Text style={styles.sectionTitle}>
                      {teams.find(t => t.id === currentRanking.teamId)?.name} - This Week
                    </Text>
                    {currentRanking.myRank && (
                      <Text style={styles.myRankText}>
                        You're #{currentRanking.myRank} of {currentRanking.totalMembers}
                      </Text>
                    )}
                  </View>
                  <View style={styles.rankingContainer}>
                    <FlatList
                      data={currentRanking.rankings}
                      renderItem={renderRankingItem}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                    />
                  </View>
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="trophy-outline" size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyStateTitle}>No Rankings Available</Text>
                  <Text style={styles.emptyStateText}>
                    Join a team to see how you rank against other members!
                  </Text>
                </View>
              )}
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
  joinedActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
  leaveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  leaveButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
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
  rankInfo: {
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
  rankingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  myRankText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  rankChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  rankChangeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm,
    marginTop: SPACING.md,
  },
  exploreButtonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  tabBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  tabBadgeText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 12,
  },
  disabledTabText: {
    color: COLORS.textMuted,
  },
  statsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default CommunityScreen; 