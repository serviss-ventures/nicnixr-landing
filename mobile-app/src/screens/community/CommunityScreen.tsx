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
    <TouchableOpacity style={styles.teamCard} activeOpacity={0.8}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.08)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.teamCardGradient}
      >
        <View style={styles.teamHeader}>
          <View style={styles.teamIconContainer}>
            <LinearGradient
              colors={[item.color + '40', item.color + '20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.teamIcon}
            >
              <Ionicons name={item.icon as any} size={26} color={item.color} />
              <View style={[styles.teamIconGlow, { backgroundColor: item.color + '20' }]} />
            </LinearGradient>

            <View style={styles.teamInfo}>
              <View style={styles.teamTitleRow}>
                <Text style={styles.teamName}>{item.name}</Text>
                {item.isRecommended && (
                  <LinearGradient
                    colors={[COLORS.primary + '30', COLORS.primary + '20']}
                    style={styles.recommendedBadge}
                  >
                    <Ionicons name="star" size={11} color={COLORS.primary} />
                    <Text style={styles.recommendedText}>Recommended</Text>
                  </LinearGradient>
                )}
              </View>
              
              <Text style={styles.teamDescription}>{item.description}</Text>
              
              <View style={styles.teamStatsRow}>
                <View style={styles.memberStats}>
                  <Ionicons name="people" size={14} color={COLORS.textMuted} />
                  <Text style={styles.teamMembers}>
                    {item.memberCount.toLocaleString()} members
                  </Text>
                </View>
                
                <View style={styles.activityIndicator}>
                  <View style={styles.activityDot} />
                  <Text style={styles.activityText}>Active today</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.teamFooter}>
          {item.isJoined ? (
            <View style={styles.joinedIndicator}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.08)']}
                style={styles.joinedIndicatorGradient}
              >
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                <Text style={styles.joinedText}>Joined</Text>
              </LinearGradient>
              
              <TouchableOpacity 
                style={styles.leaveButton}
                onPress={() => handleLeaveTeam(item.id)}
              >
                <Text style={styles.leaveButtonText}>Leave</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.joinButton}
              onPress={() => handleJoinTeam(item.id)}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, '#0891B2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.joinButtonGradient}
              >
                <Ionicons name="add-circle" size={16} color="#FFFFFF" />
                <Text style={styles.joinButtonText}>
                  {isLoading ? 'Joining...' : 'Join Team'}
                </Text>
                <View style={styles.joinButtonGlow} />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
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
          {/* Enhanced Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Recovery Teams</Text>
              <Text style={styles.subtitle}>
                Connect, support, and grow together on your recovery journey
              </Text>
            </View>
            
            {joinedTeams.length > 0 && (
              <View style={styles.statsContainer}>
                <LinearGradient
                  colors={[COLORS.primary + '20', COLORS.primary + '10']}
                  style={styles.statsPill}
                >
                  <View style={styles.statsIcon}>
                    <Ionicons name="people" size={16} color={COLORS.primary} />
                  </View>
                  <Text style={styles.statsText}>
                    {joinedTeams.length} team{joinedTeams.length !== 1 ? 's' : ''} joined
                  </Text>
                  <View style={styles.statsGlow} />
                </LinearGradient>
              </View>
            )}
          </View>

          {/* Enhanced Tab Navigation */}
          <View style={styles.tabContainer}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)']}
              style={styles.tabBackground}
            >
              <TouchableOpacity
                style={[styles.tab, activeTab === 'myteams' && styles.activeTab]}
                onPress={() => setActiveTab('myteams')}
                activeOpacity={0.8}
              >
                {activeTab === 'myteams' && (
                  <LinearGradient
                    colors={[COLORS.primary, '#0891B2']}
                    style={styles.activeTabGradient}
                  />
                )}
                <Ionicons 
                  name={activeTab === 'myteams' ? 'people' : 'people-outline'} 
                  size={16} 
                  color={activeTab === 'myteams' ? '#FFFFFF' : COLORS.textMuted} 
                />
                <Text style={[styles.tabText, activeTab === 'myteams' && styles.activeTabText]}>
                  My Teams
                </Text>
                {joinedTeams.length > 0 && (
                  <View style={[styles.tabBadge, activeTab === 'myteams' && styles.activeTabBadge]}>
                    <Text style={styles.tabBadgeText}>{joinedTeams.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
                onPress={() => setActiveTab('discover')}
                activeOpacity={0.8}
              >
                {activeTab === 'discover' && (
                  <LinearGradient
                    colors={[COLORS.primary, '#0891B2']}
                    style={styles.activeTabGradient}
                  />
                )}
                <Ionicons 
                  name={activeTab === 'discover' ? 'compass' : 'compass-outline'} 
                  size={16} 
                  color={activeTab === 'discover' ? '#FFFFFF' : COLORS.textMuted} 
                />
                <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
                  Discover
                </Text>
              </TouchableOpacity>
            </LinearGradient>
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
  headerContent: {
    alignItems: 'flex-start',
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
  statsIcon: {
    marginRight: SPACING.sm,
  },
  statsText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statsGlow: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabContainer: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING['2xl'],
    borderRadius: 16,
    padding: 3,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBackground: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
  },
  activeTab: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  activeTabGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 13,
    top: 0,
    left: 0,
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
  activeTabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
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
    paddingTop: SPACING.md,
    paddingBottom: 100,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: 20,
    fontWeight: '500',
  },
  teamCard: {
    marginBottom: SPACING.md,
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  teamCardGradient: {
    flex: 1,
    borderRadius: 18,
  },
  teamHeader: {
    padding: SPACING.xl,
  },
  teamIconContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  teamIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  teamIconGlow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 16,
    top: 0,
    left: 0,
  },
  teamInfo: {
    flex: 1,
  },
  teamTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
    letterSpacing: -0.3,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  recommendedText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  teamDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
    fontWeight: '500',
  },
  teamStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  teamMembers: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  activityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  activityText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  teamFooter: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  joinedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  joinedIndicatorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    gap: SPACING.xs,
  },
  joinedText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  leaveButton: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  leaveButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 13,
  },
  joinButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: SPACING.xs,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  joinButtonGlow: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    top: -8,
    right: -8,
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