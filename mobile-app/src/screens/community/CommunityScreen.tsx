import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Animated,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface CelebrationPost {
  id: string;
  username: string;
  milestone: string;
  message: string;
  timestamp: string;
  cheers: number;
  highFives: number;
  userReacted: boolean;
  daysClean: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'mindfulness' | 'physical' | 'replacement' | 'support';
  duration: number; // days
  participants: number;
  joined: boolean;
  progress: number; // percentage
  icon: string;
  color: string;
  startDate: string;
  endDate: string;
}

type TabType = 'celebrations' | 'challenges' | 'support';

const CommunityScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.progress);
  const [activeTab, setActiveTab] = useState<TabType>('celebrations');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [pulseAnim] = useState(new Animated.Value(1));

  // Mock data - in real app this would come from API
  const [celebrations, setCelebrations] = useState<CelebrationPost[]>([
    {
      id: '1',
      username: 'WarriorSarah',
      milestone: '30 Days Free',
      message: 'I can\'t believe I made it to 30 days! The cravings are getting easier and I feel so much more energetic. Thank you all for the support! 💪',
      timestamp: '2 hours ago',
      cheers: 24,
      highFives: 18,
      userReacted: false,
      daysClean: 30
    },
    {
      id: '2',
      username: 'MindfulMike',
      milestone: '7 Days Strong',
      message: 'Week one down! The mindfulness challenge really helped me get through the tough moments. Onto week two!',
      timestamp: '5 hours ago',
      cheers: 15,
      highFives: 12,
      userReacted: true,
      daysClean: 7
    },
    {
      id: '3',
      username: 'FreedomFinn',
      milestone: '100 Days Free',
      message: 'Triple digits! 🎉 To anyone just starting - it gets so much better. Take it one day at a time.',
      timestamp: '1 day ago',
      cheers: 89,
      highFives: 67,
      userReacted: false,
      daysClean: 100
    }
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: '7-Day Mindfulness Challenge',
      description: 'Practice 5 minutes of meditation daily to build mental resilience',
      type: 'mindfulness',
      duration: 7,
      participants: 234,
      joined: true,
      progress: 71, // 5/7 days
      icon: 'leaf-outline',
      color: '#10B981',
      startDate: '2025-01-18',
      endDate: '2025-01-25'
    },
    {
      id: '2',
      title: 'Replace Cravings with Walks',
      description: 'Take a 10-minute walk every time you feel a craving',
      type: 'replacement',
      duration: 14,
      participants: 156,
      joined: false,
      progress: 0,
      icon: 'walk-outline',
      color: '#3B82F6',
      startDate: '2025-01-20',
      endDate: '2025-02-03'
    },
    {
      id: '3',
      title: 'Gratitude Warriors',
      description: 'Share one thing you\'re grateful for in recovery each day',
      type: 'support',
      duration: 21,
      participants: 89,
      joined: true,
      progress: 38, // 8/21 days
      icon: 'heart-outline',
      color: '#EF4444',
      startDate: '2025-01-15',
      endDate: '2025-02-05'
    },
    {
      id: '4',
      title: 'Strength Builder',
      description: '15 minutes of physical activity to boost natural endorphins',
      type: 'physical',
      duration: 10,
      participants: 78,
      joined: false,
      progress: 0,
      icon: 'fitness-outline',
      color: '#F59E0B',
      startDate: '2025-01-22',
      endDate: '2025-02-01'
    }
  ]);

  useEffect(() => {
    // Pulse animation for celebration posts
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleReaction = (postId: string, type: 'cheer' | 'highFive') => {
    setCelebrations(prev => prev.map(post => {
      if (post.id === postId) {
        if (post.userReacted) {
          // User already reacted, remove reaction
          return {
            ...post,
            [type === 'cheer' ? 'cheers' : 'highFives']: post[type === 'cheer' ? 'cheers' : 'highFives'] - 1,
            userReacted: false
          };
        } else {
          // Add reaction
          return {
            ...post,
            [type === 'cheer' ? 'cheers' : 'highFives']: post[type === 'cheer' ? 'cheers' : 'highFives'] + 1,
            userReacted: true
          };
        }
      }
      return post;
    }));
  };

  const joinChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId) {
        return {
          ...challenge,
          joined: !challenge.joined,
          participants: challenge.joined ? challenge.participants - 1 : challenge.participants + 1
        };
      }
      return challenge;
    }));
  };

  const shareMilestone = () => {
    if (!shareMessage.trim()) {
      Alert.alert('Message Required', 'Please add a message to share with the community!');
      return;
    }

    const milestones = [
      { days: 1, text: '24 Hours Free' },
      { days: 3, text: '3 Days Strong' },
      { days: 7, text: '1 Week Warrior' },
      { days: 14, text: '2 Weeks Free' },
      { days: 30, text: '1 Month Champion' },
      { days: 90, text: '3 Months Free' },
      { days: 365, text: '1 Year Smoke-Free' }
    ];

    const currentMilestone = milestones
      .filter(m => stats.daysClean >= m.days)
      .pop() || { days: stats.daysClean, text: `${stats.daysClean} Days Free` };

    const newPost: CelebrationPost = {
      id: Date.now().toString(),
      username: user?.username || 'Anonymous Warrior',
      milestone: currentMilestone.text,
      message: shareMessage,
      timestamp: 'Just now',
      cheers: 0,
      highFives: 0,
      userReacted: false,
      daysClean: stats.daysClean
    };

    setCelebrations(prev => [newPost, ...prev]);
    setShareMessage('');
    setShareModalVisible(false);
    
    Alert.alert('🎉 Shared!', 'Your milestone has been shared with the community!');
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { key: 'celebrations', title: 'Celebrations', icon: 'trophy-outline' },
        { key: 'challenges', title: 'Challenges', icon: 'flag-outline' },
        { key: 'support', title: 'Support', icon: 'people-outline' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => setActiveTab(tab.key as TabType)}
        >
          <Ionicons 
            name={tab.icon as any} 
            size={20} 
            color={activeTab === tab.key ? COLORS.primary : COLORS.textMuted} 
          />
          <Text style={[
            styles.tabText,
            activeTab === tab.key && styles.activeTabText
          ]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCelebrationPost = (post: CelebrationPost) => (
    <View key={post.id} style={styles.celebrationCard}>
      <LinearGradient
        colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.05)']}
        style={styles.celebrationGradient}
      >
        {/* Header */}
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.username}>{post.username}</Text>
              <Text style={styles.timestamp}>{post.timestamp}</Text>
            </View>
          </View>
          <View style={styles.milestoneTag}>
            <Text style={styles.milestoneText}>{post.milestone}</Text>
          </View>
        </View>

        {/* Message */}
        <Text style={styles.postMessage}>{post.message}</Text>

        {/* Reactions */}
        <View style={styles.reactionsContainer}>
          <TouchableOpacity 
            style={[styles.reactionButton, post.userReacted && styles.reactionActive]}
            onPress={() => handleReaction(post.id, 'cheer')}
          >
            <Ionicons name="chevron-up" size={16} color={post.userReacted ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.reactionText, post.userReacted && styles.reactionActiveText]}>
              {post.cheers} Cheers
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.reactionButton, post.userReacted && styles.reactionActive]}
            onPress={() => handleReaction(post.id, 'highFive')}
          >
            <Ionicons name="hand-left" size={16} color={post.userReacted ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.reactionText, post.userReacted && styles.reactionActiveText]}>
              {post.highFives} High-Fives
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderChallenge = (challenge: Challenge) => (
    <View key={challenge.id} style={styles.challengeCard}>
      <LinearGradient
        colors={[`${challenge.color}20`, `${challenge.color}10`]}
        style={styles.challengeGradient}
      >
        {/* Challenge Header */}
        <View style={styles.challengeHeader}>
          <View style={[styles.challengeIcon, { backgroundColor: `${challenge.color}20` }]}>
            <Ionicons name={challenge.icon as any} size={24} color={challenge.color} />
          </View>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
          </View>
        </View>

        {/* Challenge Stats */}
        <View style={styles.challengeStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{challenge.participants}</Text>
            <Text style={styles.statLabel}>Warriors</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{challenge.duration}</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
          {challenge.joined && (
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: challenge.color }]}>{challenge.progress}%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          )}
        </View>

        {/* Progress Bar (if joined) */}
        {challenge.joined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <LinearGradient
                colors={[challenge.color, `${challenge.color}CC`]}
                style={[styles.progressBar, { width: `${challenge.progress}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round((challenge.progress / 100) * challenge.duration)}/{challenge.duration} days
            </Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity 
          style={[
            styles.challengeButton,
            challenge.joined && styles.challengeButtonJoined
          ]}
          onPress={() => joinChallenge(challenge.id)}
        >
          <LinearGradient
            colors={challenge.joined ? 
              ['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)'] :
              [challenge.color, `${challenge.color}CC`]
            }
            style={styles.challengeButtonGradient}
          >
            <Ionicons 
              name={challenge.joined ? 'checkmark-circle' : 'add-circle'} 
              size={20} 
              color={challenge.joined ? COLORS.primary : '#FFFFFF'} 
            />
            <Text style={[
              styles.challengeButtonText,
              challenge.joined && styles.challengeButtonTextJoined
            ]}>
              {challenge.joined ? 'Joined' : 'Join Challenge'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderCelebrations = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Share Your Win Button */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity 
          style={styles.shareWinButton}
          onPress={() => setShareModalVisible(true)}
        >
          <LinearGradient
            colors={['#10B981', '#06B6D4']}
            style={styles.shareWinGradient}
          >
            <Ionicons name="trophy" size={24} color="#FFFFFF" />
            <Text style={styles.shareWinText}>Share Your Win!</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Celebrations Feed */}
      <View style={styles.feedSection}>
        <Text style={styles.sectionTitle}>🎉 Recent Celebrations</Text>
        {celebrations.map(renderCelebrationPost)}
      </View>
    </ScrollView>
  );

  const renderChallenges = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Active Challenges */}
      <View style={styles.feedSection}>
        <Text style={styles.sectionTitle}>🚀 Active Challenges</Text>
        <Text style={styles.sectionSubtitle}>
          Join challenges to build healthy habits and connect with others
        </Text>
        {challenges.map(renderChallenge)}
      </View>
    </ScrollView>
  );

  const renderSupport = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.feedSection}>
        <Text style={styles.sectionTitle}>💬 Support Network</Text>
        <Text style={styles.sectionSubtitle}>
          Coming soon: Anonymous support groups and peer mentoring
        </Text>
        
        <View style={styles.comingSoonCard}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
            style={styles.comingSoonGradient}
          >
            <Ionicons name="people" size={48} color={COLORS.accent} />
            <Text style={styles.comingSoonTitle}>Support Groups</Text>
            <Text style={styles.comingSoonText}>
              Connect with others in your recovery journey through anonymous support groups and peer mentoring.
            </Text>
          </LinearGradient>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Recovery Community</Text>
          <Text style={styles.subtitle}>Celebrate together, grow together</Text>
        </View>

        {/* Tab Bar */}
        {renderTabBar()}

        {/* Tab Content */}
        {activeTab === 'celebrations' && renderCelebrations()}
        {activeTab === 'challenges' && renderChallenges()}
        {activeTab === 'support' && renderSupport()}

        {/* Share Milestone Modal */}
        <Modal
          visible={shareModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setShareModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#1E293B', '#0F172A']}
                style={styles.modalGradient}
              >
                <Text style={styles.modalTitle}>Share Your Milestone! 🎉</Text>
                <Text style={styles.modalSubtitle}>
                  You're {stats.daysClean} days clean - that's amazing!
                </Text>
                
                <TextInput
                  style={styles.shareInput}
                  placeholder="Share your experience with the community..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  value={shareMessage}
                  onChangeText={setShareMessage}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShareModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.shareButton}
                    onPress={shareMilestone}
                  >
                    <LinearGradient
                      colors={['#10B981', '#06B6D4']}
                      style={styles.shareButtonGradient}
                    >
                      <Text style={styles.shareButtonText}>Share</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
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
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: SPACING.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.md,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  shareWinButton: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  shareWinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  shareWinText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: SPACING.md,
  },
  feedSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  celebrationCard: {
    marginBottom: SPACING.md,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  celebrationGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: SPACING.lg,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  milestoneTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.md,
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  postMessage: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  reactionsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  reactionActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  reactionText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
  },
  reactionActiveText: {
    color: COLORS.primary,
  },
  challengeCard: {
    marginBottom: SPACING.md,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  challengeGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: SPACING.lg,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  challengeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  challengeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  challengeButton: {
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  challengeButtonJoined: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  challengeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  challengeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
  },
  challengeButtonTextJoined: {
    color: COLORS.primary,
  },
  comingSoonCard: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  comingSoonGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: SPACING.lg,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  comingSoonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: SPACING.xl,
    borderRadius: SPACING.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  shareInput: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    color: COLORS.text,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: SPACING.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  shareButton: {
    flex: 1,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default CommunityScreen; 