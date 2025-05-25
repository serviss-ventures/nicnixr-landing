import React, { useState, useEffect, useRef } from 'react';
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
import { CelebrationBurst, HighFiveCelebration } from '../../components/common/CelebrationAnimations';

const { width } = Dimensions.get('window');

interface CelebrationPost {
  id: string;
  username: string;
  milestone: string;
  message: string;
  timestamp: string;
  cheers: number;
  highFives: number;
  userReactedCheer: boolean;
  userReactedHighFive: boolean;
  daysClean: number;
  avatar: string;
  isVerified?: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'mindfulness' | 'physical' | 'replacement' | 'support' | 'social' | 'creative';
  duration: number; // days
  participants: number;
  joined: boolean;
  progress: number; // percentage
  icon: string;
  color: string;
  startDate: string;
  endDate: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  reward?: string;
}

interface SupportPost {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  replies: number;
  hearts: number;
  category: 'encouragement' | 'advice' | 'question' | 'celebration';
  isAnonymous: boolean;
}

type TabType = 'celebrations' | 'challenges' | 'support';

const CommunityScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.progress);
  const [activeTab, setActiveTab] = useState<TabType>('celebrations');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [pulseAnim] = useState(new Animated.Value(1));
  
  // Celebration animation state
  const [celebrationTrigger, setCelebrationTrigger] = useState(false);
  const [highFiveTrigger, setHighFiveTrigger] = useState(false);
  const [animationPosition, setAnimationPosition] = useState({ x: width / 2, y: 300 });
  const reactionButtonRefs = useRef<{ [key: string]: View | null }>({});

  // Enhanced mock data with much more vibrant community content
  const [celebrations, setCelebrations] = useState<CelebrationPost[]>([
    {
      id: '1',
      username: 'WarriorSarah',
      milestone: '30 Days Free',
      message: 'I can\'t believe I made it to 30 days! The cravings are getting easier and I feel so much more energetic. Thank you all for the support! 💪',
      timestamp: '2 hours ago',
      cheers: 47,
      highFives: 32,
      userReactedCheer: false,
      userReactedHighFive: false,
      daysClean: 30,
      avatar: '🌟',
      isVerified: true
    },
    {
      id: '2',
      username: 'MindfulMike',
      milestone: '7 Days Strong',
      message: 'Week one down! The mindfulness challenge really helped me get through the tough moments. Onto week two! 🧘‍♂️',
      timestamp: '4 hours ago',
      cheers: 28,
      highFives: 19,
      userReactedCheer: false,
      userReactedHighFive: false,
      daysClean: 7,
      avatar: '🧘',
    },
    {
      id: '3',
      username: 'FreedomFinn',
      milestone: '100 Days Free',
      message: 'Triple digits! 🎉 To anyone just starting - it gets so much better. Take it one day at a time. The first week was hell, but now I feel like a completely different person!',
      timestamp: '6 hours ago',
      cheers: 156,
      highFives: 89,
      userReactedCheer: false,
      userReactedHighFive: false,
      daysClean: 100,
      avatar: '🏆',
      isVerified: true
    },
    {
      id: '4',
      username: 'ZenMaster_Alex',
      milestone: '6 Months Clean',
      message: 'Half a year without nicotine! 🌈 My taste buds are back, my breathing is amazing, and I\'ve saved over $900. To everyone struggling - you\'ve got this!',
      timestamp: '8 hours ago',
      cheers: 203,
      highFives: 127,
      userReactedCheer: false,
      userReactedHighFive: false,
      daysClean: 180,
      avatar: '🌈',
      isVerified: true
    },
    {
      id: '5',
      username: 'StrongMama_Jess',
      milestone: '14 Days Free',
      message: 'Two weeks! My kids are so proud of me. Yesterday my 5-year-old said "Mommy, you smell like flowers now!" 😭❤️ That\'s all the motivation I need.',
      timestamp: '12 hours ago',
      cheers: 89,
      highFives: 67,
      userReactedCheer: false,
      userReactedHighFive: false,
      daysClean: 14,
      avatar: '🌸',
    },
    {
      id: '6',
      username: 'FitnessWarrior_Tom',
      milestone: '3 Days Strong',
      message: 'Day 3 and I just crushed a 5K run! 🏃‍♂️ Never thought I\'d be able to breathe this well. The physical challenges are helping me stay focused.',
      timestamp: '1 day ago',
      cheers: 34,
      highFives: 28,
      userReactedCheer: false,
      userReactedHighFive: false,
      daysClean: 3,
      avatar: '🏃',
    },
    {
      id: '7',
      username: 'CreativeSpirit_Luna',
      milestone: '21 Days Free',
      message: 'Three weeks and I\'ve started painting again! 🎨 Nicotine was stealing my creativity. Now I have so much energy for the things I love.',
      timestamp: '1 day ago',
      cheers: 52,
      highFives: 41,
      userReactedCheer: false,
      userReactedHighFive: false,
      daysClean: 21,
      avatar: '🎨',
    },
    {
      id: '8',
      username: 'NightShift_Nurse',
      milestone: '72 Hours Free',
      message: 'Made it through my first nicotine-free night shift! 🌙 The hardest part was the 3am craving, but I did jumping jacks instead. My patients are going to get the best care from a healthier me!',
      timestamp: '2 days ago',
      cheers: 67,
      highFives: 45,
      userReactedCheer: false,
      userReactedHighFive: false,
      daysClean: 3,
      avatar: '🌙',
    }
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: '7-Day Mindfulness Challenge',
      description: 'Practice 5 minutes of meditation daily to build mental resilience and reduce cravings',
      type: 'mindfulness',
      duration: 7,
      participants: 347,
      joined: true,
      progress: 71, // 5/7 days
      icon: 'leaf-outline',
      color: '#10B981',
      startDate: '2025-01-18',
      endDate: '2025-01-25',
      difficulty: 'Beginner',
      reward: 'Zen Master Badge'
    },
    {
      id: '2',
      title: 'Replace Cravings with Walks',
      description: 'Take a 10-minute walk every time you feel a craving. Fresh air beats nicotine!',
      type: 'replacement',
      duration: 14,
      participants: 289,
      joined: false,
      progress: 0,
      icon: 'walk-outline',
      color: '#3B82F6',
      startDate: '2025-01-20',
      endDate: '2025-02-03',
      difficulty: 'Beginner'
    },
    {
      id: '3',
      title: 'Gratitude Warriors',
      description: 'Share one thing you\'re grateful for in recovery each day. Positivity is powerful!',
      type: 'support',
      duration: 21,
      participants: 156,
      joined: true,
      progress: 38, // 8/21 days
      icon: 'heart-outline',
      color: '#EF4444',
      startDate: '2025-01-15',
      endDate: '2025-02-05',
      difficulty: 'Beginner',
      reward: 'Gratitude Champion Badge'
    },
    {
      id: '4',
      title: 'Strength Builder Challenge',
      description: '15 minutes of physical activity daily to boost natural endorphins and energy',
      type: 'physical',
      duration: 10,
      participants: 198,
      joined: false,
      progress: 0,
      icon: 'fitness-outline',
      color: '#F59E0B',
      startDate: '2025-01-22',
      endDate: '2025-02-01',
      difficulty: 'Intermediate'
    },
    {
      id: '5',
      title: 'Creative Expression Week',
      description: 'Channel your energy into art, music, writing, or any creative outlet for 7 days',
      type: 'creative',
      duration: 7,
      participants: 124,
      joined: false,
      progress: 0,
      icon: 'brush-outline',
      color: '#8B5CF6',
      startDate: '2025-01-25',
      endDate: '2025-02-01',
      difficulty: 'Beginner',
      reward: 'Creative Soul Badge'
    },
    {
      id: '6',
      title: 'Social Connection Challenge',
      description: 'Reach out to a friend or family member daily. Rebuild relationships nicotine may have affected',
      type: 'social',
      duration: 14,
      participants: 87,
      joined: true,
      progress: 21, // 3/14 days
      icon: 'people-outline',
      color: '#06B6D4',
      startDate: '2025-01-20',
      endDate: '2025-02-03',
      difficulty: 'Intermediate',
      reward: 'Connection Master Badge'
    },
    {
      id: '7',
      title: 'Deep Breathing Mastery',
      description: 'Master the 4-7-8 breathing technique. Practice 3 times daily for ultimate craving control',
      type: 'mindfulness',
      duration: 21,
      participants: 267,
      joined: false,
      progress: 0,
      icon: 'cloud-outline',
      color: '#10B981',
      startDate: '2025-01-23',
      endDate: '2025-02-13',
      difficulty: 'Advanced',
      reward: 'Breath Master Badge'
    },
    {
      id: '8',
      title: 'Healthy Habit Stack',
      description: 'Build 3 new healthy habits: drink water, stretch, and take vitamins daily',
      type: 'physical',
      duration: 30,
      participants: 203,
      joined: false,
      progress: 0,
      icon: 'checkmark-circle-outline',
      color: '#F59E0B',
      startDate: '2025-01-26',
      endDate: '2025-02-25',
      difficulty: 'Advanced',
      reward: 'Habit Master Badge'
    }
  ]);

  const [supportPosts, setSupportPosts] = useState<SupportPost[]>([
    {
      id: '1',
      username: 'Anonymous_Warrior',
      message: 'Day 2 and the cravings are intense. Any tips for getting through the next few hours?',
      timestamp: '30 minutes ago',
      replies: 12,
      hearts: 8,
      category: 'question',
      isAnonymous: true
    },
    {
      id: '2',
      username: 'VeteranQuitter_Sam',
      message: 'Remember: cravings are temporary, but your strength is permanent. You\'ve got this! 💪',
      timestamp: '1 hour ago',
      replies: 5,
      hearts: 23,
      category: 'encouragement',
      isAnonymous: false
    },
    {
      id: '3',
      username: 'Anonymous_Helper',
      message: 'Pro tip: Keep your hands busy! I started learning origami and it\'s been a game-changer for those fidgety moments.',
      timestamp: '3 hours ago',
      replies: 8,
      hearts: 15,
      category: 'advice',
      isAnonymous: true
    }
  ]);

  // Automatic engagement system
  useEffect(() => {
    // Initial engagement burst (3-8 seconds after component mounts)
    const initialEngagementTimer = setTimeout(() => {
      addRandomEngagement('initial');
    }, Math.random() * 5000 + 3000);

    // Medium-term engagement (8-12 minutes)
    const mediumEngagementTimer = setTimeout(() => {
      addRandomEngagement('medium');
    }, Math.random() * 240000 + 480000); // 8-12 minutes

    // Long-term engagement (18-22 minutes)
    const longEngagementTimer = setTimeout(() => {
      addRandomEngagement('long');
    }, Math.random() * 240000 + 1080000); // 18-22 minutes

    return () => {
      clearTimeout(initialEngagementTimer);
      clearTimeout(mediumEngagementTimer);
      clearTimeout(longEngagementTimer);
    };
  }, []);

  const addRandomEngagement = (phase: 'initial' | 'medium' | 'long') => {
    const encouragingUsernames = [
      'SupportiveSteve', 'CheerleaderChris', 'MotivationalMia', 'EncouragingElla',
      'PositivePaul', 'UpliftingUma', 'InspiringIan', 'HopefulHannah',
      'StrengthSally', 'CourageousCarl', 'BraveBarb', 'FearlessFrank',
      'DeterminedDana', 'ResilientRay', 'PowerfulPam', 'MightyMark'
    ];

    const engagementMessages = [
      'You\'re doing amazing! Keep it up! 💪',
      'So proud of your progress! 🌟',
      'You\'re an inspiration to us all! ✨',
      'Keep fighting the good fight! 🔥',
      'Your strength is incredible! 💎',
      'Every day you\'re getting stronger! 🚀',
      'You\'ve got this, warrior! ⚡',
      'Sending you positive vibes! 🌈'
    ];

    // Determine engagement intensity based on phase
    let engagementCount = 1;
    if (phase === 'initial') {
      engagementCount = Math.floor(Math.random() * 3) + 2; // 2-4 engagements
    } else if (phase === 'medium') {
      engagementCount = Math.floor(Math.random() * 2) + 1; // 1-2 engagements
    } else {
      engagementCount = 1; // 1 engagement
    }

    for (let i = 0; i < engagementCount; i++) {
      setTimeout(() => {
        // Add random reactions to existing posts
        setCelebrations(prev => {
          const updatedPosts = [...prev];
          const randomPostIndex = Math.floor(Math.random() * updatedPosts.length);
          const randomPost = updatedPosts[randomPostIndex];
          
          if (randomPost) {
            const reactionType = Math.random() > 0.5 ? 'cheers' : 'highFives';
            const increment = Math.floor(Math.random() * 3) + 1; // 1-3 reactions
            
            updatedPosts[randomPostIndex] = {
              ...randomPost,
              [reactionType]: randomPost[reactionType] + increment
            };

            // Show a subtle notification
            console.log(`🎉 ${increment} new ${reactionType} on "${randomPost.milestone}" post!`);
          }
          
          return updatedPosts;
        });

        // Occasionally add a supportive comment (20% chance)
        if (Math.random() < 0.2) {
          const randomUsername = encouragingUsernames[Math.floor(Math.random() * encouragingUsernames.length)];
          const randomMessage = engagementMessages[Math.floor(Math.random() * engagementMessages.length)];
          
          setSupportPosts(prev => [{
            id: `auto_${Date.now()}_${Math.random()}`,
            username: randomUsername,
            message: randomMessage,
            timestamp: 'Just now',
            replies: 0,
            hearts: Math.floor(Math.random() * 5) + 1,
            category: 'encouragement' as const,
            isAnonymous: false
          }, ...prev.slice(0, 9)]); // Keep only 10 most recent
        }
      }, i * (Math.random() * 2000 + 1000)); // Stagger engagements 1-3 seconds apart
    }
  };

  useEffect(() => {
    // Subtle pulse animation for share button
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleReaction = (postId: string, type: 'cheer' | 'highFive', buttonRef?: View) => {
    // Get button position for animation
    if (buttonRef) {
      buttonRef.measure((x, y, width, height, pageX, pageY) => {
        setAnimationPosition({ 
          x: pageX + width / 2, 
          y: pageY + height / 2 
        });
        
        // Trigger appropriate animation
        if (type === 'cheer') {
          setCelebrationTrigger(prev => !prev);
        } else {
          setHighFiveTrigger(prev => !prev);
        }
      });
    } else {
      // Fallback position
      if (type === 'cheer') {
        setCelebrationTrigger(prev => !prev);
      } else {
        setHighFiveTrigger(prev => !prev);
      }
    }

    setCelebrations(prev => prev.map(post => {
      if (post.id === postId) {
        if (type === 'cheer') {
          if (post.userReactedCheer) {
            // User already reacted with cheer, remove reaction
            return {
              ...post,
              cheers: Math.max(0, post.cheers - 1), // Prevent negative counts
              userReactedCheer: false
            };
          } else {
            // Add cheer reaction
            return {
              ...post,
              cheers: post.cheers + 1,
              userReactedCheer: true
            };
          }
        } else { // highFive
          if (post.userReactedHighFive) {
            // User already reacted with high-five, remove reaction
            return {
              ...post,
              highFives: Math.max(0, post.highFives - 1), // Prevent negative counts
              userReactedHighFive: false
            };
          } else {
            // Add high-five reaction
            return {
              ...post,
              highFives: post.highFives + 1,
              userReactedHighFive: true
            };
          }
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
      userReactedCheer: false,
      userReactedHighFive: false,
      daysClean: stats.daysClean,
      avatar: '🎯'
    };

    setCelebrations(prev => [newPost, ...prev]);
    setShareMessage('');
    setShareModalVisible(false);
    
    // Trigger celebration animation for sharing milestone
    setAnimationPosition({ x: width / 2, y: 400 });
    setTimeout(() => {
      setCelebrationTrigger(prev => !prev);
    }, 500);
    
    // Special engagement boost for user's own post
    setTimeout(() => {
      addSpecialEngagementBoost(newPost.id);
    }, 2000); // Wait 2 seconds then start the boost
    
    Alert.alert('🎉 Shared!', 'Your milestone has been shared with the community!');
  };

  const addSpecialEngagementBoost = (postId: string) => {
    const supportiveUsernames = [
      'CommunityChampion', 'ProudSupporter', 'MotivationalMentor', 'CheerleaderChief',
      'EncouragingEagle', 'SupportSquad', 'VictoryVoice', 'TriumphTroop',
      'WinningWisdom', 'SuccessSupport', 'AchievementAlly', 'MilestoneManager'
    ];

    const celebrationMessages = [
      'Incredible achievement! You\'re an inspiration! 🌟',
      'So proud of your progress! Keep shining! ✨',
      'What an amazing milestone! You\'re crushing it! 🔥',
      'Your dedication is truly inspiring! 💪',
      'Celebrating your victory with you! 🎉',
      'You\'re proof that anything is possible! 🚀',
      'Your strength gives others hope! 💎',
      'What a warrior! Keep up the amazing work! ⚡'
    ];

    // Add 3-6 reactions over 30 seconds
    const reactionCount = Math.floor(Math.random() * 4) + 3;
    
    for (let i = 0; i < reactionCount; i++) {
      setTimeout(() => {
        setCelebrations(prev => prev.map(post => {
          if (post.id === postId) {
            const reactionType = Math.random() > 0.4 ? 'cheers' : 'highFives'; // Slightly favor cheers
            const increment = Math.floor(Math.random() * 2) + 1; // 1-2 reactions
            
            return {
              ...post,
              [reactionType]: post[reactionType] + increment
            };
          }
          return post;
        }));
      }, i * (Math.random() * 8000 + 2000)); // Spread over 2-10 seconds each
    }

    // Add 1-2 supportive comments
    const commentCount = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < commentCount; i++) {
      setTimeout(() => {
        const randomUsername = supportiveUsernames[Math.floor(Math.random() * supportiveUsernames.length)];
        const randomMessage = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
        
        setSupportPosts(prev => [{
          id: `boost_${Date.now()}_${Math.random()}`,
          username: randomUsername,
          message: randomMessage,
          timestamp: 'Just now',
          replies: 0,
          hearts: Math.floor(Math.random() * 8) + 3, // 3-10 hearts
          category: 'celebration' as const,
          isAnonymous: false
        }, ...prev.slice(0, 9)]);
      }, (i + 1) * (Math.random() * 15000 + 5000)); // 5-20 seconds apart
    }
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
              <Text style={styles.avatarEmoji}>{post.avatar}</Text>
            </View>
            <View style={styles.userDetails}>
              <View style={styles.usernameRow}>
                <Text style={styles.username}>{post.username}</Text>
                {post.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} style={styles.verifiedIcon} />
                )}
              </View>
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
            style={[styles.reactionButton, post.userReactedCheer && styles.reactionActive]}
            onPress={(event) => handleReaction(post.id, 'cheer', event.currentTarget)}
          >
            <Ionicons name="chevron-up" size={16} color={post.userReactedCheer ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.reactionText, post.userReactedCheer && styles.reactionActiveText]}>
              {post.cheers} Cheers
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.reactionButton, post.userReactedHighFive && styles.reactionActive]}
            onPress={(event) => handleReaction(post.id, 'highFive', event.currentTarget)}
          >
            <Ionicons name="hand-left" size={16} color={post.userReactedHighFive ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.reactionText, post.userReactedHighFive && styles.reactionActiveText]}>
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
            <View style={styles.challengeTitleRow}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <View style={[styles.difficultyBadge, { backgroundColor: `${challenge.color}30` }]}>
                <Text style={[styles.difficultyText, { color: challenge.color }]}>{challenge.difficulty}</Text>
              </View>
            </View>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
            {challenge.reward && (
              <Text style={styles.challengeReward}>🏆 Reward: {challenge.reward}</Text>
            )}
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

  const renderSupportPost = (post: SupportPost) => (
    <View key={post.id} style={styles.supportCard}>
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.05)']}
        style={styles.supportGradient}
      >
        <View style={styles.supportHeader}>
          <View style={styles.supportUserInfo}>
            <View style={styles.supportAvatar}>
              <Ionicons 
                name={post.isAnonymous ? 'help-circle' : 'person'} 
                size={20} 
                color={COLORS.accent} 
              />
            </View>
            <View>
              <Text style={styles.supportUsername}>{post.username}</Text>
              <Text style={styles.supportTimestamp}>{post.timestamp}</Text>
            </View>
          </View>
          <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(post.category) }]}>
            <Text style={styles.categoryText}>{post.category}</Text>
          </View>
        </View>
        
        <Text style={styles.supportMessage}>{post.message}</Text>
        
        <View style={styles.supportActions}>
          <TouchableOpacity 
            style={styles.supportAction}
            onPress={(event) => {
              // Trigger heart animation
              if (event.currentTarget) {
                event.currentTarget.measure((x, y, width, height, pageX, pageY) => {
                  setAnimationPosition({ 
                    x: pageX + width / 2, 
                    y: pageY + height / 2 
                  });
                  setCelebrationTrigger(prev => !prev);
                });
              }
            }}
          >
            <Ionicons name="heart-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.supportActionText}>{post.hearts} Hearts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportAction}>
            <Ionicons name="chatbubbles-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.supportActionText}>{post.replies} Replies</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'encouragement': return 'rgba(16, 185, 129, 0.3)';
      case 'advice': return 'rgba(59, 130, 246, 0.3)';
      case 'question': return 'rgba(245, 158, 11, 0.3)';
      case 'celebration': return 'rgba(239, 68, 68, 0.3)';
      default: return 'rgba(139, 92, 246, 0.3)';
    }
  };

  const renderCelebrations = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Community Stats */}
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
          style={styles.statsGradient}
        >
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>2,847</Text>
              <Text style={styles.statLabel}>Active Warriors</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>156</Text>
              <Text style={styles.statLabel}>Celebrations Today</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>89%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

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
        <Text style={styles.sectionSubtitle}>
          Amazing warriors sharing their victories - you're next!
        </Text>
        {celebrations.map(renderCelebrationPost)}
      </View>
    </ScrollView>
  );

  const renderChallenges = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Challenge Stats */}
      <View style={styles.challengeStatsContainer}>
        <LinearGradient
          colors={['rgba(245, 158, 11, 0.2)', 'rgba(239, 68, 68, 0.2)']}
          style={styles.challengeStatsGradient}
        >
          <Text style={styles.challengeStatsTitle}>🏆 Challenge Arena</Text>
          <Text style={styles.challengeStatsText}>
            Join challenges to build healthy habits and earn badges!
          </Text>
          <View style={styles.challengeStatsRow}>
            <View style={styles.challengeStatItem}>
              <Text style={styles.challengeStatNumber}>8</Text>
              <Text style={styles.challengeStatLabel}>Active Challenges</Text>
            </View>
            <View style={styles.challengeStatItem}>
              <Text style={styles.challengeStatNumber}>1,234</Text>
              <Text style={styles.challengeStatLabel}>Participants</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Active Challenges */}
      <View style={styles.feedSection}>
        <Text style={styles.sectionTitle}>🚀 Active Challenges</Text>
        <Text style={styles.sectionSubtitle}>
          Build healthy habits and connect with fellow warriors
        </Text>
        {challenges.map(renderChallenge)}
      </View>
    </ScrollView>
  );

  const renderSupport = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Support Header */}
      <View style={styles.supportHeaderContainer}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
          style={styles.supportHeaderGradient}
        >
          <Ionicons name="heart" size={32} color={COLORS.accent} />
          <Text style={styles.supportHeaderTitle}>Support Network</Text>
          <Text style={styles.supportHeaderText}>
            Anonymous support, real encouragement. We're here for each other.
          </Text>
        </LinearGradient>
      </View>

      {/* Support Feed */}
      <View style={styles.feedSection}>
        <Text style={styles.sectionTitle}>💬 Community Support</Text>
        <Text style={styles.sectionSubtitle}>
          Ask questions, share advice, and support fellow warriors
        </Text>
        {supportPosts.map(renderSupportPost)}
        
        {/* Coming Soon Features */}
        <View style={styles.comingSoonCard}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
            style={styles.comingSoonGradient}
          >
            <Ionicons name="people" size={48} color={COLORS.accent} />
            <Text style={styles.comingSoonTitle}>More Support Features Coming Soon!</Text>
            <Text style={styles.comingSoonText}>
              • Anonymous support groups{'\n'}
              • Peer mentoring program{'\n'}
              • Crisis support hotline{'\n'}
              • Expert Q&A sessions
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

        {/* Celebration Animations */}
        <CelebrationBurst
          trigger={celebrationTrigger}
          sourcePosition={animationPosition}
          onComplete={() => console.log('🎉 Celebration animation completed!')}
        />
        
        <HighFiveCelebration
          trigger={highFiveTrigger}
          sourcePosition={animationPosition}
          onComplete={() => console.log('🙌 High-five animation completed!')}
        />
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
  
  // Stats Container
  statsContainer: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
    lineHeight: 20,
  },
  
  // Celebration Posts
  celebrationCard: {
    marginBottom: SPACING.lg,
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
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  userDetails: {
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  verifiedIcon: {
    marginLeft: SPACING.xs,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  milestoneTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.md,
    marginLeft: SPACING.sm,
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  postMessage: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
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

  // Challenge Stats
  challengeStatsContainer: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  challengeStatsGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: SPACING.lg,
    alignItems: 'center',
  },
  challengeStatsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  challengeStatsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  challengeStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  challengeStatItem: {
    alignItems: 'center',
  },
  challengeStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: SPACING.xs,
  },
  challengeStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Challenges
  challengeCard: {
    marginBottom: SPACING.lg,
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
    alignItems: 'flex-start',
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
  challengeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: SPACING.sm,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  challengeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  challengeReward: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
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

  // Support Section
  supportHeaderContainer: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  supportHeaderGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: SPACING.lg,
    alignItems: 'center',
  },
  supportHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  supportHeaderText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  supportCard: {
    marginBottom: SPACING.md,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  supportGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: SPACING.lg,
  },
  supportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  supportUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  supportAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  supportUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  supportTimestamp: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  categoryTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: SPACING.sm,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  supportMessage: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  supportActions: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  supportAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportActionText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
  },

  comingSoonCard: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    marginTop: SPACING.lg,
  },
  comingSoonGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: SPACING.lg,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Modal
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