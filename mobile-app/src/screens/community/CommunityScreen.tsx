import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { 
  Circle, 
  Line,
  Defs, 
  LinearGradient as SvgLinearGradient, 
  Stop 
} from 'react-native-svg';

const { width } = Dimensions.get('window');

interface CommunityPost {
  id: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  milestone: string;
  category: 'milestone' | 'support' | 'health' | 'inspiration';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  reward: string;
  duration: number;
  joined: boolean;
  progress: number;
  icon: string;
  color: string;
}

interface SupportMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  reactions: number;
  isAnonymous?: boolean;
}

type CommunityTab = 'community' | 'challenges' | 'support';

const CommunityScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.progress);
  const [activeTab, setActiveTab] = useState<CommunityTab>('community');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  const [communityPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      username: 'Sarah_M',
      avatar: '👩‍⚕️',
      content: 'Just hit 30 days! Feeling stronger every day. This community has been amazing! 💪',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
      milestone: '30 Days Strong',
      category: 'milestone'
    },
    {
      id: '2',
      username: 'Mike_Recovery',
      avatar: '🧑‍💼',
      content: 'Week 2 was tough, but I made it through. Thanks for all the support yesterday! 🙏',
      timestamp: '4 hours ago',
      likes: 18,
      comments: 12,
      milestone: '14 Days Free',
      category: 'support'
    },
    {
      id: '3',
      username: 'Jennifer_Hope',
      avatar: '👩‍🎓',
      content: 'Celebrating 100 days today! Never thought I could do it. You all made this possible! ✨',
      timestamp: '6 hours ago',
      likes: 45,
      comments: 23,
      milestone: '100 Days Free',
      category: 'milestone'
    },
    {
      id: '4',
      username: 'Tom_Fitness',
      avatar: '🏃‍♂️',
      content: 'Started running again after quitting. My lungs feel amazing! Who wants to join a virtual 5K? 🏃‍♂️',
      timestamp: '8 hours ago',
      likes: 31,
      comments: 15,
      milestone: '60 Days Clean',
      category: 'health'
    }
  ]);

  const [challenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Daily Check-in Challenge',
      description: 'Share one positive thing from your day for 7 days straight',
      participants: 234,
      difficulty: 'Beginner',
      reward: '7-Day Streak Badge',
      duration: 7,
      joined: false,
      progress: 0,
      icon: 'calendar-outline',
      color: '#10B981'
    },
    {
      id: '2',
      title: 'Healthy Habit Builder',
      description: 'Replace one old habit with a healthy new one this week',
      participants: 156,
      difficulty: 'Intermediate',
      reward: 'Habit Master Badge',
      duration: 14,
      joined: false,
      progress: 0,
      icon: 'fitness-outline',
      color: '#F59E0B'
    },
    {
      id: '3',
      title: 'Support Network Challenge',
      description: 'Help 5 community members with encouragement and advice',
      participants: 89,
      difficulty: 'Advanced',
      reward: 'Community Helper Badge',
      duration: 30,
      joined: false,
      progress: 0,
      icon: 'heart-outline',
      color: '#8B5CF6'
    },
    {
      id: '4',
      title: 'Mindfulness Journey',
      description: 'Practice 10 minutes of mindfulness daily for 2 weeks',
      participants: 178,
      difficulty: 'Intermediate',
      reward: 'Mindful Warrior Badge',
      duration: 14,
      joined: false,
      progress: 0,
      icon: 'leaf-outline',
      color: '#06B6D4'
    }
  ]);

  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([
    {
      id: '1',
      username: 'Alex_Support',
      message: 'Day 2 is really tough for me. Having strong cravings. Could use some encouragement right now.',
      timestamp: '5 minutes ago',
      reactions: 8
    },
    {
      id: '2',
      username: 'Maria_Helper',
      message: 'You\'ve got this! Day 2 is one of the hardest, but it gets easier. Take it one hour at a time! 💪',
      timestamp: '3 minutes ago',
      reactions: 12
    },
    {
      id: '3',
      username: 'Anonymous_Friend',
      message: 'Remember why you started. You\'re stronger than any craving. We\'re all here for you! ❤️',
      timestamp: '1 minute ago',
      reactions: 15,
      isAnonymous: true
    }
  ]);

  const supportResponses = [
    'You\'ve got this! 💪',
    'Sending positive vibes your way! ✨',
    'One day at a time, you\'re doing great! 🌟',
    'Stay strong, we believe in you! ❤️',
    'You\'re not alone in this journey! 🤝',
    'Keep going, you\'re amazing! 🎉'
  ];

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Pulse animation for floating elements
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

  useEffect(() => {
    // Add encouraging messages occasionally
    const addEncouragement = () => {
      if (Math.random() < 0.3) {
        const randomResponse = supportResponses[Math.floor(Math.random() * supportResponses.length)];
        const randomUser = `Friend_${Math.floor(Math.random() * 1000)}`;
        
        setSupportMessages(prev => [{
          id: Date.now().toString(),
          username: randomUser,
          message: randomResponse,
          timestamp: 'just now',
          reactions: Math.floor(Math.random() * 5) + 1
        }, ...prev.slice(0, 9)]);
      }
    };

    const encouragementInterval = setInterval(addEncouragement, 15000);
    return () => clearInterval(encouragementInterval);
  }, []);

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getCategoryColor = (category: CommunityPost['category']) => {
    switch (category) {
      case 'milestone': return '#10B981';
      case 'support': return '#8B5CF6';
      case 'health': return '#06B6D4';
      case 'inspiration': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  // Tab Navigation
  const renderTabBar = () => (
    <View style={styles.tabContainer}>
      {[
        { id: 'community', label: 'Community', icon: 'people-outline' },
        { id: 'challenges', label: 'Challenges', icon: 'trophy-outline' },
        { id: 'support', label: 'Support Chat', icon: 'chatbubbles-outline' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.tabActive
          ]}
          onPress={() => setActiveTab(tab.id as CommunityTab)}
        >
          <LinearGradient
            colors={
              activeTab === tab.id 
                ? ['rgba(16, 185, 129, 0.2)', 'rgba(139, 92, 246, 0.1)']
                : ['transparent', 'transparent']
            }
            style={styles.tabGradient}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.id ? '#10B981' : 'rgba(255, 255, 255, 0.6)'} 
            />
            <Text style={[
              styles.tabLabel,
              { color: activeTab === tab.id ? '#10B981' : 'rgba(255, 255, 255, 0.6)' }
            ]}>
              {tab.label}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Community Post Component
  const renderCommunityPost = (post: CommunityPost) => (
    <TouchableOpacity key={post.id} style={styles.postCard}>
      <LinearGradient
        colors={[
          `${getCategoryColor(post.category)}15`,
          `${getCategoryColor(post.category)}08`,
          'rgba(0, 0, 0, 0.3)'
        ]}
        style={styles.postGradient}
      >
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.postAvatar}>
            <Text style={styles.postAvatarText}>{post.avatar}</Text>
          </View>
          <View style={styles.postInfo}>
            <Text style={styles.postUsername}>{post.username}</Text>
            <Text style={[styles.postMilestone, { color: getCategoryColor(post.category) }]}>
              {post.milestone}
            </Text>
          </View>
          <View style={styles.postTimestamp}>
            <Text style={styles.timestampText}>{post.timestamp}</Text>
          </View>
        </View>

        {/* Post Content */}
        <Text style={styles.postContent}>{post.content}</Text>

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={16} color="#EF4444" />
            <Text style={styles.actionText}>{post.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={16} color="#06B6D4" />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={16} color="#10B981" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Challenge Component
  const renderChallenge = (challenge: Challenge) => (
    <TouchableOpacity key={challenge.id} style={styles.challengeCard}>
      <LinearGradient
        colors={[
          `${challenge.color}20`,
          `${challenge.color}10`,
          'rgba(0, 0, 0, 0.3)'
        ]}
        style={styles.challengeGradient}
      >
        {/* Challenge Header */}
        <View style={styles.challengeHeader}>
          <View style={[styles.challengeIcon, { backgroundColor: `${challenge.color}30` }]}>
            <Ionicons name={challenge.icon as any} size={24} color={challenge.color} />
          </View>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={[styles.challengeDifficulty, { color: getDifficultyColor(challenge.difficulty) }]}>
              {challenge.difficulty} • {challenge.duration} days
            </Text>
          </View>
          <View style={styles.challengeMetrics}>
            <Text style={styles.challengeParticipants}>{challenge.participants}</Text>
            <Text style={styles.challengeParticipantsLabel}>people</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.challengeDescription}>{challenge.description}</Text>

        {/* Progress (if joined) */}
        {challenge.joined && (
          <View style={styles.challengeProgress}>
            <Text style={styles.challengeProgressLabel}>Progress: {challenge.progress}%</Text>
            <View style={styles.challengeProgressBar}>
              <View 
                style={[
                  styles.challengeProgressFill,
                  { 
                    width: `${challenge.progress}%`,
                    backgroundColor: challenge.color
                  }
                ]} 
              />
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.challengeActions}>
          <TouchableOpacity 
            style={[
              styles.joinButton,
              challenge.joined && styles.joinButtonActive
            ]}
          >
            <LinearGradient
              colors={
                challenge.joined
                  ? [challenge.color, `${challenge.color}80`]
                  : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
              }
              style={styles.joinButtonGradient}
            >
              <Ionicons 
                name={challenge.joined ? "checkmark-circle" : "add-circle-outline"} 
                size={18} 
                color={challenge.joined ? "#FFFFFF" : challenge.color} 
              />
              <Text style={[
                styles.joinButtonText,
                { color: challenge.joined ? "#FFFFFF" : challenge.color }
              ]}>
                {challenge.joined ? 'Joined' : 'Join Challenge'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Reward */}
        <View style={styles.challengeReward}>
          <Ionicons name="trophy-outline" size={16} color="#F59E0B" />
          <Text style={styles.challengeRewardText}>{challenge.reward}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Support Message Component
  const renderSupportMessage = (message: SupportMessage) => (
    <TouchableOpacity key={message.id} style={styles.messageCard}>
      <LinearGradient
        colors={[
          'rgba(139, 92, 246, 0.15)',
          'rgba(139, 92, 246, 0.08)',
          'rgba(0, 0, 0, 0.3)'
        ]}
        style={styles.messageGradient}
      >
        {/* Message Header */}
        <View style={styles.messageHeader}>
          <View style={styles.messageAvatar}>
            <Ionicons 
              name={message.isAnonymous ? "help-circle-outline" : "person-circle-outline"} 
              size={24} 
              color="#8B5CF6" 
            />
          </View>
          <View style={styles.messageInfo}>
            <Text style={styles.messageUsername}>
              {message.isAnonymous ? 'Anonymous Friend' : message.username}
            </Text>
            <Text style={styles.messageTimestamp}>{message.timestamp}</Text>
          </View>
          <View style={styles.messageReactions}>
            <Text style={styles.messageReactionsValue}>{message.reactions}</Text>
            <Text style={styles.messageReactionsLabel}>❤️</Text>
          </View>
        </View>

        {/* Message Content */}
        <Text style={styles.messageContent}>{message.message}</Text>

        {/* Message Actions */}
        <View style={styles.messageActions}>
          <TouchableOpacity style={styles.supportButton}>
            <Ionicons name="heart-outline" size={16} color="#EF4444" />
            <Text style={styles.supportButtonText}>Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.replyButton}>
            <Ionicons name="chatbubble-outline" size={16} color="#06B6D4" />
            <Text style={styles.replyButtonText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Content Renderers
  const renderCommunity = () => (
    <View style={styles.contentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recovery Community</Text>
        <Text style={styles.sectionSubtitle}>
          Connect with others on the same journey
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {communityPosts.map(renderCommunityPost)}
      </ScrollView>
    </View>
  );

  const renderChallenges = () => (
    <View style={styles.contentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Community Challenges</Text>
        <Text style={styles.sectionSubtitle}>
          Join others in building healthy habits together
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {challenges.map(renderChallenge)}
      </ScrollView>
    </View>
  );

  const renderSupport = () => (
    <View style={styles.contentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Live Support Chat</Text>
        <Text style={styles.sectionSubtitle}>
          Real-time encouragement and support from the community
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {supportMessages.map(renderSupportMessage)}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#1A1A2E', '#16213E']}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.headerTitle}>Recovery Community</Text>
          <Text style={styles.headerSubtitle}>
            You're part of a supportive community of {communityPosts.reduce((sum, post) => sum + post.likes, 0)} people
          </Text>
        </Animated.View>

        {/* Tab Navigation */}
        {renderTabBar()}

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {activeTab === 'community' && renderCommunity()}
          {activeTab === 'challenges' && renderChallenges()}
          {activeTab === 'support' && renderSupport()}
        </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  tabActive: {
    // Active tab styling handled by gradient
  },
  tabGradient: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    borderRadius: SPACING.md,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  postCard: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  postGradient: {
    padding: SPACING.lg,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  postAvatarText: {
    fontSize: 18,
  },
  postInfo: {
    flex: 1,
  },
  postUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  postMilestone: {
    fontSize: 12,
    fontWeight: '500',
  },
  postTimestamp: {
    alignItems: 'flex-end',
  },
  timestampText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  postContent: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  actionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: SPACING.xs,
  },
  challengeCard: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  challengeGradient: {
    padding: SPACING.lg,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  challengeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  challengeDifficulty: {
    fontSize: 12,
    fontWeight: '500',
  },
  challengeMetrics: {
    alignItems: 'flex-end',
  },
  challengeParticipants: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  challengeParticipantsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  challengeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  challengeProgress: {
    marginBottom: SPACING.md,
  },
  challengeProgressLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: SPACING.xs,
  },
  challengeProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  challengeProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  challengeActions: {
    marginBottom: SPACING.md,
  },
  joinButton: {
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  joinButtonActive: {
    // Active styling handled by gradient
  },
  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeRewardText: {
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: SPACING.xs,
  },
  messageCard: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  messageGradient: {
    padding: SPACING.lg,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  messageAvatar: {
    marginRight: SPACING.md,
  },
  messageInfo: {
    flex: 1,
  },
  messageUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageTimestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  messageReactions: {
    alignItems: 'flex-end',
  },
  messageReactionsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageReactionsLabel: {
    fontSize: 12,
  },
  messageContent: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  supportButtonText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: SPACING.xs,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyButtonText: {
    fontSize: 12,
    color: '#06B6D4',
    marginLeft: SPACING.xs,
  },
});

export default CommunityScreen; 