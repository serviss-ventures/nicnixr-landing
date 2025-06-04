import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  FlatList,
  RefreshControl,
  Share
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';
import Avatar from '../../components/common/Avatar';
import inviteService from '../../services/inviteService';
import FloatingHeart from '../../components/common/FloatingHeart';

// Types
interface Buddy {
  id: string;
  name: string;
  avatar: string;
  daysClean: number;
  product: string;
  timezone: string;
  lastActive: Date;
  matchScore: number;
  status: 'online' | 'offline' | 'in-crisis';
  bio: string;
  supportStyle: 'motivator' | 'listener' | 'tough-love' | 'analytical';
  connectionStatus: 'connected' | 'pending-sent' | 'pending-received' | 'not-connected';
  connectionDate?: Date;
}

interface CommunityPost {
  id: string;
  author: string;
  authorAvatar: string;
  authorDaysClean: number;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  tags: string[];
  type: 'story' | 'question' | 'milestone' | 'crisis';
}

const CommunityScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const stats = useSelector((state: RootState) => state.progress.stats);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [activeTab, setActiveTab] = useState<'feed' | 'buddies'>('feed');
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'story' | 'question' | 'milestone' | 'crisis'>('story');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [commentText, setCommentText] = useState('');
  const [floatingHearts, setFloatingHearts] = useState<{id: string, x: number, y: number}[]>([]);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Check for pending invites on mount
  useEffect(() => {
    checkPendingInvites();
  }, []);
  
  // Mock data - would come from API
  const [buddyMatches, setBuddyMatches] = useState<Buddy[]>([
    {
      id: '1',
      name: 'Sarah M.',
      avatar: '🦸‍♀️',
      daysClean: 12,
      product: 'vaping',
      timezone: 'PST',
      lastActive: new Date(),
      matchScore: 95,
      status: 'online',
      bio: 'Mom of 2, quit vaping for my kids. Love hiking and coffee chats!',
      supportStyle: 'motivator',
      connectionStatus: 'connected',
      connectionDate: new Date(Date.now() - 86400000) // Connected yesterday
    },
    {
      id: '2',
      name: 'Mike R.',
      avatar: '🧙‍♂️',
      daysClean: 8,
      product: 'pouches',
      timezone: 'EST',
      lastActive: new Date(Date.now() - 3600000),
      matchScore: 88,
      status: 'offline',
      bio: 'Software dev, using coding to distract from cravings',
      supportStyle: 'analytical',
      connectionStatus: 'not-connected'
    },
    {
      id: '3',
      name: 'Emma L.',
      avatar: '👩‍🎨',
      daysClean: 15,
      product: 'vaping',
      timezone: 'PST',
      lastActive: new Date(Date.now() - 7200000),
      matchScore: 92,
      status: 'online',
      bio: 'Artist finding new ways to cope. Daily sketching helps!',
      supportStyle: 'listener',
      connectionStatus: 'pending-received'
    },
    {
      id: '4',
      name: 'James K.',
      avatar: '🏃‍♂️',
      daysClean: 10,
      product: 'cigarettes',
      timezone: 'CST',
      lastActive: new Date(Date.now() - 1800000),
      matchScore: 85,
      status: 'online',
      bio: 'Running my way to freedom. 5K goal by day 30!',
      supportStyle: 'motivator',
      connectionStatus: 'pending-sent'
    }
  ]);
  
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      author: 'Jessica K.',
      authorAvatar: '👩',
      authorDaysClean: 30,
      content: "Just hit 30 days! 🎉 The cravings are finally getting easier. To everyone in their first week - IT GETS BETTER! My buddy Tom helped me through some rough nights. Find yourself a quit buddy, it makes all the difference!",
      timestamp: new Date(Date.now() - 3600000),
      likes: 156,
      comments: 23,
      isLiked: true,
      tags: ['milestone', '30-days', 'buddy-success'],
      type: 'milestone'
    },
    {
      id: '2',
      author: 'Anonymous',
      authorAvatar: '🫥',
      authorDaysClean: 5,
      content: "Having a really hard time right now. At a party and everyone's vaping. My hands are literally shaking. Someone please talk me out of this.",
      timestamp: new Date(Date.now() - 300000),
      likes: 45,
      comments: 67,
      isLiked: false,
      tags: ['help', 'craving', 'urgent'],
      type: 'crisis'
    }
  ]);
  
  // Slide in animation
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [activeTab, slideAnim]);
  
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  
  const checkPendingInvites = async () => {
    const pendingInvite = await inviteService.getPendingInvite();
    if (pendingInvite) {
      // Add the inviter as a buddy request
      const inviterBuddy: Buddy = {
        id: pendingInvite.inviterData.inviterId,
        name: pendingInvite.inviterData.inviterName,
        avatar: pendingInvite.inviterData.inviterAvatar,
        daysClean: pendingInvite.inviterData.inviterDaysClean,
        product: 'unknown', // Would be fetched from backend
        timezone: 'PST',
        lastActive: new Date(),
        matchScore: 100, // Perfect match since they invited you!
        status: 'online',
        bio: 'Invited you to be their quit buddy!',
        supportStyle: 'motivator',
        connectionStatus: 'pending-received',
      };
      
      // Check if this buddy request already exists
      setBuddyMatches(prevBuddies => {
        const exists = prevBuddies.some(b => b.id === inviterBuddy.id);
        if (!exists) {
          // Add to the beginning of the list
          return [inviterBuddy, ...prevBuddies];
        }
        return prevBuddies;
      });
      
      // Clear the pending invite
      await inviteService.clearPendingInvite();
      
      // Show a welcome message
      setTimeout(() => {
        Alert.alert(
          'Welcome to NixR! 🎉',
          `${pendingInvite.inviterData.inviterName} invited you to be their quit buddy! Check your buddy requests to connect.`,
          [{ text: 'View Request', onPress: () => setActiveTab('buddies') }]
        );
      }, 1000);
    }
  };
  
  const handleInviteFriend = async () => {
    try {
      // Create invite with user data
      const inviteData = await inviteService.createInvite(
        user?.id || 'user123', // In production, use real user ID
        user?.username || 'Anonymous',
        user?.avatar || '🦸‍♂️',
        stats?.daysClean || 0
      );
      
      const inviteLink = `https://nixr.app/invite/${inviteData.code}`;
      
      const message = `Hey! I'm ${stats?.daysClean || 0} days nicotine-free using NixR. Want to be my quit buddy? 

We can support each other through cravings and celebrate milestones together! 💪

Join me with this link: ${inviteLink}

Your invite code: ${inviteData.code}`;

      const result = await Share.share({
        message,
        title: 'Be My Quit Buddy on NixR',
      });

      if (result.action === Share.sharedAction) {
        Alert.alert(
          'Invite Sent! 🎉',
          'When your friend joins with your code, they\'ll automatically be connected as your buddy.',
          [{ text: 'Awesome!', style: 'default' }]
        );
      }
    } catch {
      Alert.alert('Error', 'Unable to share invite. Please try again.');
    }
  };
  
  const handleAcceptBuddy = async (buddyId: string) => {
    // Haptic feedback for success
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setBuddyMatches(prevBuddies => 
      prevBuddies.map(buddy => 
        buddy.id === buddyId 
          ? { ...buddy, connectionStatus: 'connected' as const, connectionDate: new Date() }
          : buddy
      )
    );
    
    // Find the buddy's name for the alert
    const buddy = buddyMatches.find(b => b.id === buddyId);
    if (buddy) {
      Alert.alert(
        'Buddy Connected! 🎉',
        `You and ${buddy.name} are now recovery buddies! Start chatting to support each other.`,
        [{ text: 'Start Chatting', onPress: () => {
          navigation.navigate('BuddyChat' as never, { 
            buddy: {
              id: buddy.id,
              name: buddy.name,
              avatar: buddy.avatar,
              daysClean: buddy.daysClean,
              status: buddy.status,
            }
          } as never);
        }}]
      );
    }
  };
  
  const handleDeclineBuddy = async (buddyId: string) => {
    // Haptic feedback for warning
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Find the buddy's name for confirmation
    const buddy = buddyMatches.find(b => b.id === buddyId);
    if (buddy) {
      Alert.alert(
        'Decline Buddy Request?',
        `Are you sure you want to decline ${buddy.name}'s buddy request?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Decline', 
            style: 'destructive',
            onPress: async () => {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              setBuddyMatches(prevBuddies => 
                prevBuddies.filter(b => b.id !== buddyId)
              );
            }
          }
        ]
      );
    }
  };

  const handleLikePost = async (postId: string, event: any) => {
    // Capture event coordinates before async operation
    const pageX = event?.nativeEvent?.pageX;
    const pageY = event?.nativeEvent?.pageY;
    
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Update post likes
    setCommunityPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const newIsLiked = !post.isLiked;
          
          // Create multiple floating hearts animation if liking
          if (newIsLiked && pageX && pageY) {
            // Create main hearts with random spread
            const mainHeartCount = Math.floor(Math.random() * 3) + 4; // 4-6 main hearts
            const newHearts: {id: string, x: number, y: number}[] = [];
            
            // Main hearts
            for (let i = 0; i < mainHeartCount; i++) {
              const heartId = `${postId}-${Date.now()}-main-${i}`;
              const angle = (Math.PI * 2 * i) / mainHeartCount; // Spread in circle
              const distance = 30 + Math.random() * 20;
              const offsetX = Math.cos(angle) * distance;
              const offsetY = Math.sin(angle) * distance * 0.5; // Elliptical spread
              
              newHearts.push({
                id: heartId,
                x: pageX - 15 + offsetX,
                y: pageY - 15 + offsetY
              });
            }
            
            // Add some smaller particle hearts
            const particleCount = Math.floor(Math.random() * 4) + 3; // 3-6 particles
            for (let i = 0; i < particleCount; i++) {
              const heartId = `${postId}-${Date.now()}-particle-${i}`;
              const offsetX = (Math.random() - 0.5) * 120;
              const offsetY = (Math.random() - 0.5) * 40;
              
              newHearts.push({
                id: heartId,
                x: pageX - 15 + offsetX,
                y: pageY - 15 + offsetY
              });
            }
            
            setFloatingHearts(prev => [...prev, ...newHearts]);
          }
          
          return {
            ...post,
            isLiked: newIsLiked,
            likes: newIsLiked ? post.likes + 1 : post.likes - 1
          };
        }
        return post;
      })
    );
  };

  const handleCommentPress = (post: CommunityPost) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  };

  const handleSendComment = () => {
    if (!commentText.trim() || !selectedPost) return;
    
    // Update post comments count
    setCommunityPosts(prevPosts =>
      prevPosts.map(post => 
        post.id === selectedPost.id 
          ? { ...post, comments: post.comments + 1 }
          : post
      )
    );
    
    // Close modal and reset
    setShowCommentModal(false);
    setCommentText('');
    setSelectedPost(null);
    
    // Show success feedback
    Alert.alert('Comment Posted! 💬', 'Your support means everything to the community.');
  };
  
  const renderBuddyCard = (buddy: Buddy) => {
    const isConnected = buddy.connectionStatus === 'connected';
    const isPendingReceived = buddy.connectionStatus === 'pending-received';
    
    return (
      <TouchableOpacity 
        style={[
          styles.buddyCard,
          isPendingReceived && styles.buddyRequestCard
        ]} 
        activeOpacity={0.9}
        onPress={() => {
          if (isConnected) {
            navigation.navigate('BuddyChat' as never, { 
              buddy: {
                id: buddy.id,
                name: buddy.name,
                avatar: buddy.avatar,
                daysClean: buddy.daysClean,
                status: buddy.status,
              }
            } as never);
          }
        }}
        onLongPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('BuddyProfile' as never, { 
            buddy: {
              id: buddy.id,
              name: buddy.name,
              avatar: buddy.avatar,
              daysClean: buddy.daysClean,
              status: buddy.status,
              bio: buddy.bio,
              supportStyles: [
                buddy.supportStyle === 'motivator' ? 'Motivator' :
                buddy.supportStyle === 'listener' ? 'Listener' :
                buddy.supportStyle === 'tough-love' ? 'Tough Love' :
                'Analytical'
              ],
            }
          } as never);
        }}
      >
        <LinearGradient
          colors={
            isConnected ? ['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.05)'] :
            isPendingReceived ? ['rgba(245, 158, 11, 0.15)', 'rgba(251, 191, 36, 0.05)'] :
            ['rgba(139, 92, 246, 0.05)', 'rgba(236, 72, 153, 0.02)']
          }
          style={[
            styles.buddyCardGradient,
            isPendingReceived && styles.buddyRequestCardGradient,
            !isConnected && !isPendingReceived && styles.suggestedMatchCardGradient
          ]}
        >
        <View style={styles.buddyHeader}>
          <View style={styles.buddyAvatarContainer}>
            <Avatar 
              emoji={buddy.avatar}
              size="medium"
              rarity={buddy.daysClean > 30 ? 'epic' : buddy.daysClean > 7 ? 'rare' : 'common'}
              badge={buddy.daysClean > 7 ? '🔥' : undefined}
              isOnline={buddy.status === 'online'}
            />
          </View>
          
          <View style={styles.buddyInfo}>
            <View style={styles.buddyNameRow}>
              <Text style={styles.buddyName}>{buddy.name}</Text>
              {isPendingReceived && (
                <View style={styles.wantsToBeBuddyBadge}>
                  <Text style={styles.wantsToBeBuddyText}>wants to connect!</Text>
                </View>
              )}
              {!isConnected && !isPendingReceived && (
                <View style={styles.matchScoreBadge}>
                  <Text style={styles.matchScoreText}>{buddy.matchScore}% match</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.buddyStats}>
              Day {buddy.daysClean} • Quit {buddy.product}
            </Text>
            
            <Text style={styles.buddyBio} numberOfLines={2}>
              {buddy.bio}
            </Text>
            
            <View style={styles.buddySupportStyle}>
              <Ionicons 
                name={
                  buddy.supportStyle === 'motivator' ? 'rocket' :
                  buddy.supportStyle === 'listener' ? 'ear' :
                  buddy.supportStyle === 'tough-love' ? 'barbell' :
                  'analytics'
                } 
                size={14} 
                color="#10B981" 
              />
              <Text style={styles.supportStyleText}>
                {buddy.supportStyle.charAt(0).toUpperCase() + buddy.supportStyle.slice(1).replace('-', ' ')}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.buddyActions}>
          {buddy.connectionStatus === 'connected' ? (
            <>
              <TouchableOpacity 
                style={styles.messageButton}
                onPress={() => navigation.navigate('BuddyChat' as never, { 
                  buddy: {
                    id: buddy.id,
                    name: buddy.name,
                    avatar: buddy.avatar,
                    daysClean: buddy.daysClean,
                    status: buddy.status,
                  }
                } as never)}
              >
                <LinearGradient
                  colors={['#10B981', '#06B6D4']}
                  style={styles.messageButtonGradient}
                >
                  <Ionicons name="chatbubble" size={16} color="#FFFFFF" />
                  <Text style={styles.messageButtonText}>Message</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('BuddyProfile' as never, { 
                    buddy: {
                      id: buddy.id,
                      name: buddy.name,
                      avatar: buddy.avatar,
                      daysClean: buddy.daysClean,
                      status: buddy.status,
                      bio: buddy.bio,
                      supportStyles: [
                        buddy.supportStyle === 'motivator' ? 'Motivator' :
                        buddy.supportStyle === 'listener' ? 'Listener' :
                        buddy.supportStyle === 'tough-love' ? 'Tough Love' :
                        'Analytical'
                      ],
                    }
                  } as never);
                }}
              >
                <Ionicons name="person-outline" size={20} color="#8B5CF6" />
              </TouchableOpacity>
            </>
          ) : buddy.connectionStatus === 'pending-sent' ? (
            <View style={styles.pendingBadge}>
              <Ionicons name="time-outline" size={16} color="#F59E0B" />
              <Text style={styles.pendingText}>Request Sent</Text>
            </View>
          ) : buddy.connectionStatus === 'pending-received' ? (
            <>
              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={() => handleAcceptBuddy(buddy.id)}
              >
                <LinearGradient
                  colors={['#10B981', '#06B6D4']}
                  style={styles.acceptButtonGradient}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.acceptButtonText}>Accept Request</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.declineButton}
                onPress={() => handleDeclineBuddy(buddy.id)}
              >
                <Ionicons name="close-circle" size={22} color="#EF4444" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.connectButton}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                style={styles.connectButtonGradient}
              >
                <Ionicons name="person-add" size={16} color="#FFFFFF" />
                <Text style={styles.connectButtonText}>Send Request</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
    );
  };
  
  const renderPost = (post: CommunityPost) => (
    <View style={styles.postCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
        style={styles.postGradient}
      >
        {post.type === 'crisis' && (
          <View style={styles.crisisHeader}>
            <Ionicons name="heart" size={16} color="#EC4899" />
            <Text style={styles.crisisLabel}>NEEDS SUPPORT</Text>
          </View>
        )}
        
        <View style={styles.postHeader}>
          <Avatar 
            emoji={post.authorAvatar}
            size="medium"
            rarity={post.authorDaysClean > 30 ? 'epic' : post.authorDaysClean > 7 ? 'rare' : 'common'}
            badge={post.authorDaysClean > 7 ? '🔥' : undefined}
          />
          <View style={styles.postAuthorInfo}>
            <Text style={styles.postAuthor}>{post.author}</Text>
            <Text style={styles.postMeta}>
              Day {post.authorDaysClean} • {getTimeAgo(post.timestamp)}
            </Text>
          </View>
          
          {post.type === 'milestone' && (
            <View style={styles.milestoneIcon}>
              <Ionicons name="trophy" size={20} color="#F59E0B" />
            </View>
          )}
        </View>
        
        <Text style={styles.postContent}>{post.content}</Text>
        
        <View style={styles.postTags}>
          {post.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.postAction}
            onPress={(event) => handleLikePost(post.id, event)}
          >
            <Ionicons 
              name={post.isLiked ? "heart" : "heart-outline"} 
              size={20} 
              color={post.isLiked ? "#EF4444" : COLORS.textMuted} 
            />
            <Text style={styles.postActionText}>{post.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.postAction}
            onPress={() => handleCommentPress(post)}
          >
            <Ionicons name="chatbubbles-outline" size={20} color={COLORS.textMuted} />
            <Text style={styles.postActionText}>{post.comments}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.postAction}>
            <Ionicons name="share-outline" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          
          {post.type === 'crisis' && (
            <TouchableOpacity 
              style={styles.helpButton}
              onPress={(event) => handleLikePost(post.id, event)}
            >
              <Text style={styles.helpButtonText}>Send Love</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Community</Text>
              <Text style={styles.subtitle}>
                {stats?.daysClean || 0} days strong • Never alone
              </Text>
            </View>
          </View>
          
          {/* Tab Navigation */}
          <View style={styles.tabWrapper}>
            <View style={styles.tabContainer}>
              {[
                { id: 'feed', label: 'Feed', icon: 'home' },
                { id: 'buddies', label: 'Buddies', icon: 'people' }
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                  onPress={() => setActiveTab(tab.id as any)}
                >
                  <Ionicons 
                    name={tab.icon as any} 
                    size={18} 
                    color={activeTab === tab.id ? '#10B981' : COLORS.textMuted} 
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === tab.id && styles.activeTabText
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Content */}
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: slideAnim,
                transform: [{ 
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }
            ]}
          >
            {activeTab === 'feed' && (
              <FlatList
                data={communityPosts}
                renderItem={({ item }) => renderPost(item)}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                      setRefreshing(true);
                      setTimeout(() => setRefreshing(false), 2000);
                    }}
                    tintColor="#10B981"
                  />
                }
              />
            )}
            
            {activeTab === 'buddies' && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.buddySection}>
                  {/* Primary Action Button */}
                  <TouchableOpacity 
                    style={styles.primaryActionButton}
                    onPress={() => navigation.navigate('BuddyMatching' as never)}
                  >
                    <LinearGradient
                      colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.05)']}
                      style={styles.primaryActionGradient}
                    >
                      <Ionicons name="sparkles" size={20} color="#8B5CF6" />
                      <Text style={styles.primaryActionText}>Find New Buddies</Text>
                      <Ionicons name="arrow-forward" size={20} color="#8B5CF6" />
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  {/* Connected Buddies */}
                  {buddyMatches.filter(b => b.connectionStatus === 'connected').length > 0 && (
                    <>
                      <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                          <Text style={styles.sectionTitle}>Your Buddies</Text>
                          <Text style={styles.sectionCount}>
                            {buddyMatches.filter(b => b.connectionStatus === 'connected').length}
                          </Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.inviteButton}
                          onPress={handleInviteFriend}
                        >
                          <Ionicons name="person-add-outline" size={18} color="#10B981" />
                          <Text style={styles.inviteButtonText}>Invite</Text>
                        </TouchableOpacity>
                      </View>
                      {buddyMatches
                        .filter(b => b.connectionStatus === 'connected')
                        .map((buddy) => (
                          <React.Fragment key={buddy.id}>
                            {renderBuddyCard(buddy)}
                          </React.Fragment>
                        ))}
                    </>
                  )}
                  
                  {/* Pending Requests */}
                  {buddyMatches.filter(b => b.connectionStatus === 'pending-received').length > 0 && (
                    <>
                      <View style={[styles.sectionHeader, styles.requestSectionHeader]}>
                        <View style={styles.requestSectionTitleContainer}>
                          <Ionicons name="notifications" size={20} color="#F59E0B" />
                          <Text style={[styles.sectionTitle, styles.requestSectionTitle]}>Buddy Requests</Text>
                        </View>
                        <View style={styles.requestBadge}>
                          <Text style={styles.requestBadgeText}>
                            {buddyMatches.filter(b => b.connectionStatus === 'pending-received').length} NEW
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.requestSectionDescription}>
                        These people want to be your recovery buddy!
                      </Text>
                      {buddyMatches
                        .filter(b => b.connectionStatus === 'pending-received')
                        .map((buddy) => (
                          <React.Fragment key={buddy.id}>
                            {renderBuddyCard(buddy)}
                          </React.Fragment>
                        ))}
                    </>
                  )}
                  
                  {/* Complete Empty State - No buddies, no requests, no suggestions */}
                  {buddyMatches.length === 0 && (
                    <View style={styles.completeEmptyState}>
                      <LinearGradient
                        colors={['rgba(139, 92, 246, 0.05)', 'rgba(16, 185, 129, 0.03)']}
                        style={styles.emptyStateGradient}
                      >
                        <Text style={styles.emptyStateIcon}>🌟</Text>
                        <Text style={styles.emptyStateTitle}>Welcome to Your Recovery Community!</Text>
                        <Text style={styles.emptyStateText}>
                          Connect with others on the same journey. Having a buddy doubles your chances of success!
                        </Text>
                        
                        <View style={styles.emptyStateActions}>
                          <TouchableOpacity 
                            style={styles.primaryEmptyButton}
                            onPress={() => navigation.navigate('BuddyMatching' as never)}
                          >
                            <LinearGradient
                              colors={['#8B5CF6', '#EC4899']}
                              style={styles.primaryEmptyButtonGradient}
                            >
                              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                              <Text style={styles.primaryEmptyButtonText}>Find Your First Buddy</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={styles.secondaryEmptyButton}
                            onPress={handleInviteFriend}
                          >
                            <Ionicons name="person-add-outline" size={18} color="#10B981" />
                            <Text style={styles.secondaryEmptyButtonText}>Invite Someone You Know</Text>
                          </TouchableOpacity>
                        </View>
                        
                        <View style={styles.emptyStateBenefits}>
                          <Text style={styles.benefitsTitle}>Why have a buddy?</Text>
                          <View style={styles.benefitItem}>
                            <Text style={styles.benefitEmoji}>💪</Text>
                            <Text style={styles.benefitText}>2x more likely to stay quit</Text>
                          </View>
                          <View style={styles.benefitItem}>
                            <Text style={styles.benefitEmoji}>🤝</Text>
                            <Text style={styles.benefitText}>24/7 support when you need it</Text>
                          </View>
                          <View style={styles.benefitItem}>
                            <Text style={styles.benefitEmoji}>🎯</Text>
                            <Text style={styles.benefitText}>Accountability & motivation</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </View>
                  )}
                  
                  {/* Empty State - No Buddies but have requests/suggestions */}
                  {buddyMatches.length > 0 && buddyMatches.filter(b => b.connectionStatus === 'connected').length === 0 && (
                    <View style={styles.emptyBuddiesState}>
                      <Text style={styles.emptyStateIcon}>🤝</Text>
                      <Text style={styles.emptyStateTitle}>No buddies yet</Text>
                      <Text style={styles.emptyStateText}>
                        {buddyMatches.filter(b => b.connectionStatus === 'pending-received').length > 0 
                          ? "Check your buddy requests above!" 
                          : "Check out the suggested matches below!"}
                      </Text>
                      <TouchableOpacity 
                        style={styles.emptyStateInviteButton}
                        onPress={handleInviteFriend}
                      >
                        <Ionicons name="person-add" size={18} color="#10B981" />
                        <Text style={styles.emptyStateInviteText}>Invite a Friend</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Suggested Matches */}
                  {buddyMatches.filter(b => b.connectionStatus === 'not-connected').length > 0 && (
                    <>
                      <View style={[styles.sectionHeader, styles.suggestedSectionHeader]}>
                        <View style={styles.suggestedSectionTitleContainer}>
                          <Ionicons name="sparkles" size={20} color="#8B5CF6" />
                          <Text style={[styles.sectionTitle, styles.suggestedSectionTitle]}>Suggested Matches</Text>
                        </View>
                        <View style={styles.matchCountBadge}>
                          <Text style={styles.matchCountText}>
                            {buddyMatches.filter(b => b.connectionStatus === 'not-connected').length} available
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.sectionDescription}>
                        AI-matched buddies based on your quit date, product, and personality
                      </Text>
                      {buddyMatches
                        .filter(b => b.connectionStatus === 'not-connected')
                        .map((buddy) => (
                          <React.Fragment key={buddy.id}>
                            {renderBuddyCard(buddy)}
                          </React.Fragment>
                        ))}
                    </>
                  )}
                </View>
              </ScrollView>
            )}
          </Animated.View>
          
          {/* Floating Action Button for Creating Posts */}
          {activeTab === 'feed' && (
            <TouchableOpacity 
              style={styles.fab}
              onPress={() => {
                setShowCreatePostModal(true);
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                style={styles.fabGradient}
              >
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          {/* Floating Hearts Animation */}
          {floatingHearts.map((heart) => (
            <FloatingHeart
              key={heart.id}
              x={heart.x}
              y={heart.y}
              onComplete={() => {
                setFloatingHearts(prev => prev.filter(h => h.id !== heart.id));
              }}
            />
          ))}
        </SafeAreaView>
        
        {/* Create Post Modal */}
        <Modal
          visible={showCreatePostModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCreatePostModal(false)}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              style={styles.keyboardAvoidingView}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
              <View style={styles.createPostModal}>
              <LinearGradient
                colors={['#1F2937', '#111827']}
                style={styles.createPostModalGradient}
              >
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => {
                    setShowCreatePostModal(false);
                    setPostContent('');
                    setPostType('story');
                  }}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Create Post</Text>
                  <TouchableOpacity 
                    onPress={() => {
                      if (postContent.trim()) {
                        // Create new post
                        const newPost: CommunityPost = {
                          id: Date.now().toString(),
                          author: user?.username || 'You',
                          authorAvatar: user?.avatar || '🦸‍♂️',
                          authorDaysClean: stats?.daysClean || 0,
                          content: postContent.trim(),
                          timestamp: new Date(),
                          likes: 0,
                          comments: 0,
                          isLiked: false,
                          tags: postType === 'milestone' ? ['milestone', 'celebration'] : 
                                postType === 'crisis' ? ['support', 'help'] :
                                postType === 'question' ? ['question', 'advice'] :
                                ['story', 'journey'],
                          type: postType
                        };
                        
                        // Add to posts array (prepend to show at top)
                        setCommunityPosts([newPost, ...communityPosts]);
                        
                        // Close modal and reset
                        setShowCreatePostModal(false);
                        setPostContent('');
                        setPostType('story');
                        
                        // Show success feedback
                        Alert.alert('Posted! 🎉', 'Your post has been shared with the community.');
                      }
                    }}
                    disabled={!postContent.trim()}
                  >
                    <Text style={[
                      styles.modalPostText,
                      !postContent.trim() && styles.modalPostTextDisabled
                    ]}>Post</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Post Type Selection */}
                <View style={styles.postTypeContainer}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                  >
                    {[
                      { id: 'story', label: 'Share Story', icon: 'book', color: '#10B981' },
                      { id: 'question', label: 'Ask Question', icon: 'help-circle', color: '#3B82F6' },
                      { id: 'milestone', label: 'Milestone', icon: 'trophy', color: '#F59E0B' },
                      { id: 'crisis', label: 'Need Support', icon: 'heart', color: '#EC4899' }
                    ].map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.postTypeButton,
                          postType === type.id && styles.postTypeButtonActive
                        ]}
                        onPress={() => {
                          setPostType(type.id as any);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name={type.icon as any} 
                          size={20} 
                          color={postType === type.id ? type.color : COLORS.textMuted} 
                        />
                        <Text style={[
                          styles.postTypeText,
                          postType === type.id && { color: type.color }
                        ]}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                {/* Post Content Input */}
                <View style={styles.postInputContainer}>
                  <TextInput
                    style={styles.postInput}
                    placeholder={
                      postType === 'story' ? "Share your recovery journey..." :
                      postType === 'question' ? "What would you like to know?" :
                      postType === 'milestone' ? "What milestone did you reach?" :
                      "What kind of support do you need?"
                    }
                    placeholderTextColor={COLORS.textMuted}
                    value={postContent}
                    onChangeText={setPostContent}
                    multiline
                    maxLength={500}
                    autoFocus
                  />
                  <Text style={styles.charCount}>{postContent.length}/500</Text>
                </View>
                
                {/* Post Guidelines */}
                <View style={styles.guidelinesContainer}>
                  <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
                  <Text style={styles.guidelinesText}>
                    • Be supportive and kind to others{'\n'}
                    • Share your authentic experience{'\n'}
                    • No medical advice or product promotion{'\n'}
                    • Keep it recovery-focused
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </KeyboardAvoidingView>
          </View>
        </Modal>
        
        {/* Comment Modal */}
        <Modal
          visible={showCommentModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowCommentModal(false);
            setCommentText('');
          }}
        >
          <KeyboardAvoidingView 
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
          >
            <TouchableOpacity 
              style={styles.modalOverlayTouch} 
              activeOpacity={1}
              onPress={() => {
                setShowCommentModal(false);
                setCommentText('');
              }}
            >
              <View style={styles.commentModal} onStartShouldSetResponder={() => true}>
                <LinearGradient
                  colors={['#1F2937', '#111827']}
                  style={styles.commentModalGradient}
                >
                  {/* Drag Handle */}
                  <View style={styles.dragHandle} />
                  
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => {
                      setShowCommentModal(false);
                      setCommentText('');
                    }}>
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Support {selectedPost?.author || 'Post'}</Text>
                    <TouchableOpacity 
                      onPress={handleSendComment}
                      disabled={!commentText.trim()}
                      style={[
                        styles.sendCommentButton,
                        !commentText.trim() && styles.sendCommentButtonDisabled
                      ]}
                    >
                      <LinearGradient
                        colors={commentText.trim() ? ['#10B981', '#06B6D4'] : ['#374151', '#374151']}
                        style={styles.sendCommentGradient}
                      >
                        <Text style={styles.sendCommentText}>Send</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Compact Post Context */}
                  {selectedPost && (
                    <View style={styles.postContextBar}>
                      <View style={styles.postContextHeader}>
                        <Avatar 
                          emoji={selectedPost.authorAvatar}
                          size="small"
                          rarity={selectedPost.authorDaysClean > 30 ? 'epic' : selectedPost.authorDaysClean > 7 ? 'rare' : 'common'}
                        />
                        <View style={styles.postContextInfo}>
                          <Text style={styles.postContextAuthor}>{selectedPost.author}</Text>
                          <Text style={styles.postContextMeta}>Day {selectedPost.authorDaysClean}</Text>
                        </View>
                      </View>
                      <Text style={styles.postContextContent} numberOfLines={3}>
                        {selectedPost.content}
                      </Text>
                    </View>
                  )}
                  
                  {/* Quick Responses - Moved Above Input */}
                  <View style={styles.quickResponsesContainer}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.quickResponsesScrollContent}
                      keyboardShouldPersistTaps="handled"
                    >
                      {[
                        "You've got this! 💪",
                        "So proud of you! 🎉",
                        "Keep going strong! 🔥",
                        "We're here for you ❤️",
                        "Amazing progress! 🌟",
                        "Stay strong! 💯",
                        "One day at a time 🙏",
                        "Inspiring! ✨"
                      ].map((response, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.quickResponseButton}
                          onPress={() => {
                            setCommentText(response);
                            // Auto-send quick responses
                            setTimeout(() => {
                              handleSendComment();
                            }, 100);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.quickResponseText}>{response}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  
                  {/* Comment Input */}
                  <View style={styles.commentInputContainer}>
                    <View style={styles.commentInputRow}>
                      <TextInput
                        style={styles.commentInput}
                        placeholder="Add a comment..."
                        placeholderTextColor={COLORS.textMuted}
                        value={commentText}
                        onChangeText={setCommentText}
                        multiline
                        maxLength={300}
                        autoFocus={false}
                      />
                      <TouchableOpacity 
                        onPress={handleSendComment}
                        disabled={!commentText.trim()}
                        style={[
                          styles.inlineSendButton,
                          !commentText.trim() && styles.inlineSendButtonDisabled
                        ]}
                      >
                        <Ionicons 
                          name="send" 
                          size={24} 
                          color={commentText.trim() ? '#10B981' : COLORS.textMuted} 
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.charCount}>{commentText.length}/300</Text>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  tabWrapper: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeTab: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: '#10B981',
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  
  // Post Styles
  postCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  postGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  crisisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: SPACING.md,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  crisisLabel: {
    color: '#EC4899',
    fontSize: 12,
    fontWeight: '700',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  postAuthorInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  postMeta: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  milestoneIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postContent: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tag: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xl,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  helpButton: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  helpButtonText: {
    color: '#EC4899',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Buddy Styles
  buddySection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  buddyCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buddyRequestCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    transform: [{ scale: 1.02 }],
  },
  buddyCardGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
  },
  buddyRequestCardGradient: {
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderRadius: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  suggestedMatchCardGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  buddyHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  buddyAvatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  buddyAvatar: {
    fontSize: 40,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000000',
  },
  buddyInfo: {
    flex: 1,
  },
  buddyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  buddyName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  wantsToBeBuddyBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  wantsToBeBuddyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  matchScoreBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  matchScoreText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  buddyStats: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  buddyBio: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  buddySupportStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  supportStyleText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  buddyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  connectButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  connectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  messageButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  messageButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  connectedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  pendingText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  declineButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  primaryActionButton: {
    marginBottom: SPACING.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
  },
  primaryActionText: {
    color: '#8B5CF6',
    fontWeight: '600',
    fontSize: 16,
    flex: 1,
    marginLeft: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  inviteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  sectionCount: {
    fontSize: 14,
    color: COLORS.textMuted,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requestBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  requestBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  requestSectionHeader: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.2)',
  },
  requestSectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestSectionTitle: {
    color: '#F59E0B',
  },
  requestSectionDescription: {
    fontSize: 14,
    color: '#F59E0B',
    marginBottom: SPACING.md,
    opacity: 0.8,
  },
  suggestedSectionHeader: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.15)',
  },
  suggestedSectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestedSectionTitle: {
    color: '#8B5CF6',
  },
  matchCountBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  matchCountText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  emptyBuddiesState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.xl,
  },
  completeEmptyState: {
    marginVertical: SPACING.xl,
    borderRadius: 20,
    overflow: 'hidden',
  },
  emptyStateGradient: {
    padding: SPACING.xl * 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  emptyStateActions: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.xl * 2,
  },
  primaryEmptyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryEmptyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryEmptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryEmptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  secondaryEmptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyStateBenefits: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  benefitEmoji: {
    fontSize: 24,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  emptyStateInviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  emptyStateInviteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalOverlayTouch: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  createPostModal: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  createPostModalGradient: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCancelText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalPostText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  modalPostTextDisabled: {
    color: COLORS.textMuted,
  },
  postTypeContainer: {
    paddingVertical: SPACING.md,
    paddingLeft: SPACING.lg,
  },
  postTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  postTypeButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  postTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  postInputContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  postInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: SPACING.lg,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 150,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  charCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.lg,
  },
  guidelinesContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  guidelinesText: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  
  // Comment Modal Styles
  commentModal: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '50%',
    minHeight: 320,
  },
  commentModalGradient: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  postContextBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  postContextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  postContextAvatar: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  postContextInfo: {
    flex: 1,
  },
  postContextAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  postContextMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  postContextContent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  postContextText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  originalPostPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  postPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  postPreviewAvatar: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  postPreviewInfo: {
    flex: 1,
  },
  postPreviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  postPreviewMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  postPreviewContent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  commentInputContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingLeft: SPACING.md,
    paddingRight: SPACING.sm,
  },
  commentInputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  commentInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingRight: SPACING.sm,
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 100,
    lineHeight: 22,
  },
  inlineSendButton: {
    padding: SPACING.sm,
  },
  inlineSendButtonDisabled: {
    opacity: 0.5,
  },
  commentInputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  clearButton: {
    padding: 4,
  },
  quickResponsesContainer: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickResponsesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  quickResponsesScrollContent: {
    paddingHorizontal: SPACING.lg,
  },
  quickResponseButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  quickResponseText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  sendCommentButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  sendCommentButtonDisabled: {
    opacity: 0.5,
  },
  sendCommentGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  sendCommentText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CommunityScreen; 