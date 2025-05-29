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
  
  const [activeTab, setActiveTab] = useState<'myteams' | 'discover'>('myteams');

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
      <LinearGradient
        colors={[item.color + '15', item.color + '08']}
        style={styles.teamCardGradient}
      >
        {/* Recommended Badge */}
        {item.isRecommended && (
          <View style={styles.recommendedBadge}>
            <Ionicons name="star" size={12} color={COLORS.primary} />
            <Text style={styles.recommendedText}>Recommended</Text>
          </View>
        )}

        {/* Team Info */}
        <View style={styles.teamContent}>
          <View style={styles.teamMainInfo}>
            <View style={[styles.teamIcon, { backgroundColor: item.color + '25' }]}>
              <Ionicons name={item.icon as any} size={28} color={item.color} />
            </View>
            <View style={styles.teamDetails}>
              <Text style={styles.teamName}>{item.name}</Text>
              <Text style={styles.teamDescription}>{item.description}</Text>
              <Text style={styles.teamMembers}>
                {item.memberCount.toLocaleString()} members
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.teamActions}>
            {item.isJoined ? (
              <TouchableOpacity 
                style={styles.leaveButton}
                onPress={() => handleLeaveTeam(item.id)}
              >
                <Text style={styles.leaveButtonText}>Leave</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.joinButton}
                onPress={() => handleJoinTeam(item.id)}
                disabled={isLoading}
              >
                <Text style={styles.joinButtonText}>
                  {isLoading ? 'Joining...' : 'Join'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const recommendedTeams = teams.filter(team => team.isRecommended && !team.isJoined);
  const allTeams = teams.filter(team => !team.isJoined);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Recovery Teams</Text>
          <Text style={styles.subtitle}>
            Support and grow together in recovery
          </Text>
          {joinedTeams.length > 0 && (
            <View style={styles.statsContainer}>
              <Ionicons name="people" size={16} color={COLORS.primary} />
              <Text style={styles.statsText}>
                {joinedTeams.length} team{joinedTeams.length !== 1 ? 's' : ''} joined
              </Text>
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
              Discover
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
                    <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
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
                      <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
              
              {recommendedTeams.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recommended for You</Text>
                  {recommendedTeams.map((team) => (
                    <View key={team.id}>
                      {renderTeamCard({ item: team })}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {activeTab === 'discover' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Teams</Text>
              <Text style={styles.sectionSubtitle}>
                Find the perfect community for your recovery journey
              </Text>
              {allTeams.map((team) => (
                <View key={team.id}>
                  {renderTeamCard({ item: team })}
                </View>
              ))}
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
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
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
    marginBottom: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statsText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 18,
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
    paddingBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  teamCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  teamCardGradient: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
    gap: 4,
    zIndex: 1,
  },
  recommendedText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  teamContent: {
    padding: SPACING.lg,
  },
  teamMainInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  teamIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  teamDetails: {
    flex: 1,
    paddingRight: SPACING.md,
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
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  teamMembers: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  teamActions: {
    alignItems: 'flex-end',
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  leaveButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.6)',
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  exploreButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  exploreButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default CommunityScreen; 