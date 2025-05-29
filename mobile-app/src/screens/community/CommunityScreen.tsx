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
            <TouchableOpacity 
              style={[styles.actionButton, styles.leaveButton]}
              onPress={() => handleLeaveTeam(item.id)}
            >
              <Text style={styles.leaveButtonText}>Leave Team</Text>
            </TouchableOpacity>
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
                  <Ionicons name="people-outline" size={64} color={COLORS.textMuted} />
                  <Text style={styles.emptyStateTitle}>No Teams Yet</Text>
                  <Text style={styles.emptyStateText}>
                    Join a team to start competing and supporting each other in recovery!
                  </Text>
                  <TouchableOpacity
                    style={styles.exploreButton}
                    onPress={() => setActiveTab('discover')}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.secondary]}
                      style={styles.exploreButtonGradient}
                    >
                      <Text style={styles.exploreButtonText}>Explore Teams</Text>
                      <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                    </LinearGradient>
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
              <Text style={styles.sectionTitle}>Discover Teams</Text>
              <Text style={styles.sectionSubtitle}>
                Find communities that match your recovery journey
              </Text>
              <FlatList
                data={allTeams}
                renderItem={renderTeamCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
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
    paddingBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  statsText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.lg,
    marginHorizontal: SPACING.lg,
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginLeft: SPACING.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  teamCard: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  teamCardGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SPACING.xl,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  teamIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  teamDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  teamMembers: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  recommendedBadge: {
    backgroundColor: COLORS.primary + '25',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '50',
  },
  recommendedText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  teamActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.lg,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  leaveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  leaveButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  exploreButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  exploreButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default CommunityScreen; 