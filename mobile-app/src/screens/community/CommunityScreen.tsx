import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchTeams, joinTeam, leaveTeam } from '../../store/slices/communitySlice';
import { COLORS, SPACING } from '../../constants/theme';
import { RecoveryTeam } from '../../types';

const CommunityScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    teams, 
    joinedTeams, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.community);
  
  const [activeTab, setActiveTab] = useState<'myteams' | 'discover'>('discover');

  // Load teams on component mount
  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const handleJoinTeam = async (teamId: string) => {
    try {
      await dispatch(joinTeam(teamId)).unwrap();
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

  const renderTeamCard = ({ item }: { item: RecoveryTeam }) => (
    <View style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <View style={styles.teamIconContainer}>
          <View style={[styles.teamIcon, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon as any} size={24} color={item.color} />
          </View>
          <View style={styles.teamInfo}>
            <View style={styles.teamTitleRow}>
              <Text style={styles.teamName}>{item.name}</Text>
              {item.isRecommended && (
                <View style={styles.recommendedBadge}>
                  <Ionicons name="star" size={10} color={COLORS.primary} />
                  <Text style={styles.recommendedText}>Recommended</Text>
                </View>
              )}
            </View>
            <Text style={styles.teamDescription}>{item.description}</Text>
            <Text style={styles.teamMembers}>
              {item.memberCount.toLocaleString()} members
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.teamFooter}>
        {item.isJoined ? (
          <TouchableOpacity 
            style={styles.leaveButton}
            onPress={() => handleLeaveTeam(item.id)}
          >
            <Text style={styles.leaveButtonText}>Leave Team</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => handleJoinTeam(item.id)}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.joinButtonGradient}
            >
              <Text style={styles.joinButtonText}>
                {isLoading ? 'Joining...' : 'Join Team'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const recommendedTeams = teams.filter(team => team.isRecommended && !team.isJoined);
  const allTeams = teams.filter(team => !team.isJoined);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Recovery Teams</Text>
            <Text style={styles.subtitle}>
              Support and grow together in recovery
            </Text>
            {joinedTeams.length > 0 && (
              <View style={styles.statsContainer}>
                <View style={styles.statsPill}>
                  <Ionicons name="people" size={14} color={COLORS.primary} />
                  <Text style={styles.statsText}>
                    {joinedTeams.length} team{joinedTeams.length !== 1 ? 's' : ''} joined
                  </Text>
                </View>
              </View>
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
                Discover Teams
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {activeTab === 'myteams' && (
              <>
                {joinedTeams.length > 0 ? (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Teams</Text>
                    {joinedTeams.map((team) => (
                      <View key={team.id}>
                        {renderTeamCard({ item: team })}
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIconContainer}>
                      <Ionicons name="people-outline" size={40} color={COLORS.textMuted} />
                    </View>
                    <Text style={styles.emptyStateTitle}>Join Your First Team</Text>
                    <Text style={styles.emptyStateText}>
                      Connect with others on similar recovery journeys for support and motivation.
                    </Text>
                    <TouchableOpacity
                      style={styles.exploreButton}
                      onPress={() => setActiveTab('discover')}
                    >
                      <LinearGradient
                        colors={[COLORS.primary, COLORS.secondary]}
                        style={styles.exploreButtonGradient}
                      >
                        <Text style={styles.exploreButtonText}>Discover Teams</Text>
                        <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {activeTab === 'discover' && (
              <>
                {recommendedTeams.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recommended for You</Text>
                    <Text style={styles.sectionSubtitle}>
                      Teams that match your recovery journey
                    </Text>
                    {recommendedTeams.map((team) => (
                      <View key={team.id}>
                        {renderTeamCard({ item: team })}
                      </View>
                    ))}
                  </View>
                )}
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>All Teams</Text>
                  <Text style={styles.sectionSubtitle}>
                    Explore all available recovery communities
                  </Text>
                  {allTeams.map((team) => (
                    <View key={team.id}>
                      {renderTeamCard({ item: team })}
                    </View>
                  ))}
                </View>
              </>
            )}
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  statsContainer: {
    alignItems: 'flex-start',
  },
  statsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statsText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 11,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  teamCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  teamHeader: {
    padding: SPACING.lg,
  },
  teamIconContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  teamIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  teamInfo: {
    flex: 1,
  },
  teamTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  recommendedText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },
  teamDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.xs,
  },
  teamMembers: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  teamFooter: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  joinButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  joinButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  leaveButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
    paddingHorizontal: SPACING.lg,
  },
  emptyIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  exploreButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  exploreButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default CommunityScreen; 