import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CommunityState, RecoveryTeam, TeamMember, TeamRanking, RecoveryScore, TeamActivity } from '../../types';

// Async thunks for team operations
export const fetchTeams = createAsyncThunk(
  'community/fetchTeams',
  async () => {
    // TODO: Replace with actual API call
    const teams: RecoveryTeam[] = [
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
      {
        id: 'healthcare_heroes',
        name: 'Healthcare Heroes',
        description: 'Doctors, nurses & medical staff',
        category: 'profession',
        memberCount: 892,
        isRecommended: false,
        isJoined: false,
        icon: 'medical',
        color: '#06B6D4',
      },
      {
        id: 'college_students',
        name: 'College Students',
        description: 'Students breaking free',
        category: 'age_group',
        memberCount: 1456,
        isRecommended: false,
        isJoined: false,
        icon: 'school',
        color: '#8B5CF6',
      },
      {
        id: 'remote_workers',
        name: 'Remote Workers',
        description: 'Working from home warriors',
        category: 'lifestyle',
        memberCount: 2103,
        isRecommended: true,
        isJoined: false,
        icon: 'home',
        color: '#059669',
      },
      {
        id: 'military_veterans',
        name: 'Military & Veterans',
        description: 'Service members & veterans',
        category: 'lifestyle',
        memberCount: 678,
        isRecommended: false,
        isJoined: false,
        icon: 'shield',
        color: '#DC2626',
      },
      {
        id: 'entrepreneurs',
        name: 'Entrepreneurs',
        description: 'Business owners & founders',
        category: 'profession',
        memberCount: 1234,
        isRecommended: false,
        isJoined: false,
        icon: 'rocket',
        color: '#7C3AED',
      },
      {
        id: 'mindfulness_seekers',
        name: 'Mindfulness Seekers',
        description: 'Meditation & wellness focused',
        category: 'interest',
        memberCount: 987,
        isRecommended: false,
        isJoined: false,
        icon: 'leaf',
        color: '#10B981',
      },
    ];
    return teams;
  }
);

export const joinTeam = createAsyncThunk(
  'community/joinTeam',
  async (teamId: string) => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return teamId;
  }
);

export const leaveTeam = createAsyncThunk(
  'community/leaveTeam',
  async (teamId: string) => {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return teamId;
  }
);

export const fetchTeamRankings = createAsyncThunk(
  'community/fetchTeamRankings',
  async (teamId: string) => {
    // TODO: Replace with actual API call
    const mockRankings: TeamMember[] = [
      { id: '1', username: 'RecoveryChamp', currentRank: 1, previousRank: 2, weeklyScore: 98, daysClean: 45, isAnonymous: false, joinedTeamDate: '2024-01-15', lastActiveDate: '2024-01-30', badges: ['week_warrior', 'consistency_king'] },
      { id: '2', username: 'You', currentRank: 2, previousRank: 3, weeklyScore: 94, daysClean: 90, isAnonymous: false, joinedTeamDate: '2024-01-01', lastActiveDate: '2024-01-30', badges: ['month_master', 'support_hero'] },
      { id: '3', username: 'StrongMind', currentRank: 3, previousRank: 1, weeklyScore: 91, daysClean: 23, isAnonymous: false, joinedTeamDate: '2024-01-20', lastActiveDate: '2024-01-29', badges: ['newcomer_champion'] },
      { id: '4', username: 'FreedomSeeker', currentRank: 4, previousRank: 4, weeklyScore: 88, daysClean: 67, isAnonymous: false, joinedTeamDate: '2024-01-10', lastActiveDate: '2024-01-30', badges: ['consistent_climber'] },
      { id: '5', username: 'NewBeginning', currentRank: 5, previousRank: 6, weeklyScore: 85, daysClean: 12, isAnonymous: false, joinedTeamDate: '2024-01-25', lastActiveDate: '2024-01-30', badges: ['fresh_start'] },
    ];

    const ranking: TeamRanking = {
      teamId,
      period: 'weekly',
      rankings: mockRankings,
      myRank: 2,
      totalMembers: mockRankings.length,
      lastUpdated: new Date().toISOString(),
    };

    return ranking;
  }
);

export const calculateDailyScore = createAsyncThunk(
  'community/calculateDailyScore',
  async (userId: string, { getState }) => {
    // TODO: Replace with actual calculation based on user's daily activities
    const baseScore = Math.floor(Math.random() * 40) + 60; // 60-100 base score
    
    const score: RecoveryScore = {
      userId,
      date: new Date().toISOString().split('T')[0],
      dailyScore: baseScore,
      weeklyScore: baseScore, // Simplified for now
      monthlyScore: baseScore, // Simplified for now
      factors: {
        daysClean: 90, // From user's progress
        checkInCompleted: Math.random() > 0.3,
        cravingsResisted: Math.floor(Math.random() * 5),
        supportGiven: Math.floor(Math.random() * 3),
        milestonesHit: Math.floor(Math.random() * 2),
      },
    };

    return score;
  }
);

// Initial state
const initialState: CommunityState = {
  teams: [],
  joinedTeams: [],
  teamRankings: {},
  myScores: [],
  teamActivities: {},
  isLoading: false,
  error: null,
  lastUpdated: '',
};

// Community slice
const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addTeamActivity: (state, action: PayloadAction<TeamActivity>) => {
      const { teamId } = action.payload;
      if (!state.teamActivities[teamId]) {
        state.teamActivities[teamId] = [];
      }
      state.teamActivities[teamId].unshift(action.payload);
      
      // Keep only the last 50 activities per team
      if (state.teamActivities[teamId].length > 50) {
        state.teamActivities[teamId] = state.teamActivities[teamId].slice(0, 50);
      }
    },
    updateUserRank: (state, action: PayloadAction<{ teamId: string; userId: string; newRank: number; oldRank: number }>) => {
      const { teamId, userId, newRank, oldRank } = action.payload;
      const ranking = state.teamRankings[teamId];
      
      if (ranking) {
        const member = ranking.rankings.find(m => m.id === userId);
        if (member) {
          member.previousRank = member.currentRank;
          member.currentRank = newRank;
          member.lastActiveDate = new Date().toISOString();
        }
        
        // Update my rank if it's the current user
        if (userId === 'current_user_id') { // TODO: Get actual user ID
          ranking.myRank = newRank;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch teams
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teams = action.payload;
        state.joinedTeams = action.payload.filter(team => team.isJoined);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch teams';
      });

    // Join team
    builder
      .addCase(joinTeam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        const teamId = action.payload;
        
        // Update team as joined
        const team = state.teams.find(t => t.id === teamId);
        if (team) {
          team.isJoined = true;
          team.memberCount += 1;
          state.joinedTeams.push(team);
        }
        
        // Add join activity
        const joinActivity: TeamActivity = {
          id: `join_${teamId}_${Date.now()}`,
          teamId,
          userId: 'current_user_id', // TODO: Get actual user ID
          username: 'You',
          type: 'check_in',
          description: 'Joined the team',
          timestamp: new Date().toISOString(),
          isAnonymous: false,
        };
        
        if (!state.teamActivities[teamId]) {
          state.teamActivities[teamId] = [];
        }
        state.teamActivities[teamId].unshift(joinActivity);
      })
      .addCase(joinTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to join team';
      });

    // Leave team
    builder
      .addCase(leaveTeam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(leaveTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        const teamId = action.payload;
        
        // Update team as not joined
        const team = state.teams.find(t => t.id === teamId);
        if (team) {
          team.isJoined = false;
          team.memberCount = Math.max(0, team.memberCount - 1);
        }
        
        // Remove from joined teams
        state.joinedTeams = state.joinedTeams.filter(t => t.id !== teamId);
        
        // Remove team ranking data
        delete state.teamRankings[teamId];
        delete state.teamActivities[teamId];
      })
      .addCase(leaveTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to leave team';
      });

    // Fetch team rankings
    builder
      .addCase(fetchTeamRankings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeamRankings.fulfilled, (state, action) => {
        state.isLoading = false;
        const ranking = action.payload;
        state.teamRankings[ranking.teamId] = ranking;
      })
      .addCase(fetchTeamRankings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch team rankings';
      });

    // Calculate daily score
    builder
      .addCase(calculateDailyScore.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(calculateDailyScore.fulfilled, (state, action) => {
        state.isLoading = false;
        const score = action.payload;
        
        // Add or update score for today
        const existingScoreIndex = state.myScores.findIndex(
          s => s.date === score.date
        );
        
        if (existingScoreIndex >= 0) {
          state.myScores[existingScoreIndex] = score;
        } else {
          state.myScores.push(score);
        }
        
        // Keep only the last 30 days of scores
        state.myScores.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (state.myScores.length > 30) {
          state.myScores = state.myScores.slice(0, 30);
        }
      })
      .addCase(calculateDailyScore.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to calculate daily score';
      });
  },
});

export const { clearError, addTeamActivity, updateUserRank } = communitySlice.actions;
export default communitySlice.reducer; 