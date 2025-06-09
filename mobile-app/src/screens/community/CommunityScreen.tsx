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
import DicebearAvatar from '../../components/common/DicebearAvatar';
import inviteService from '../../services/inviteService';
import FloatingHeart from '../../components/common/FloatingHeart';
import { getBadgeForDaysClean } from '../../utils/badges';

// Types
interface Buddy {
  id: string;
  name: string;
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

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: string;
  authorDaysClean: number;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
}

interface CommunityPost {
  id: string;
  authorId: string;
  author: string;
  authorDaysClean: number;
  content: string;
  timestamp: Date;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
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
  
  // Mention state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const commentInputRef = useRef<TextInput>(null);
  
  // Buddy connection success modal state
  const [showBuddySuccessModal, setShowBuddySuccessModal] = useState(false);
  const [connectedBuddy, setConnectedBuddy] = useState<Buddy | null>(null);
  const buddySuccessAnim = useRef(new Animated.Value(0)).current;
  const buddySuccessScale = useRef(new Animated.Value(0.8)).current;
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Check for pending invites on mount
  useEffect(() => {
    checkPendingInvites();
  }, []);
  
  // Mock data - would come from API
  const [buddyMatches, setBuddyMatches] = useState<Buddy[]>([
    {
      id: 'user-sarah-m',  // Changed from '1' to match posts/comments
      name: 'Sarah M.',
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
      id: 'user-mike-r',  // Changed from '2' to match posts/comments
      name: 'Mike R.',
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
      id: 'user-emma-l',  // Changed from '3' to match posts/comments
      name: 'Emma L.',
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
      id: 'user-james-k',  // Changed from '4' to keep consistent pattern
      name: 'James K.',
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
      authorId: 'user-jessica-k',
      author: 'Jessica K.',
      authorDaysClean: 30,
      content: "Just hit 30 days! 🎉 The cravings are finally getting easier. To everyone in their first week - IT GETS BETTER! My buddy Tom helped me through some rough nights. Find yourself a quit buddy, it makes all the difference!",
      timestamp: new Date(Date.now() - 3600000),
      likes: 156,
      comments: [
        {
          id: 'c1',
          postId: '1',
          authorId: 'user-sarah-m',
          author: 'Sarah M.',
          authorDaysClean: 12,
          content: "Congrats! I'm on day 12 and this gives me hope! 💪",
          timestamp: new Date(Date.now() - 3000000),
          likes: 8,
          isLiked: false
        },
        {
          id: 'c2',
          postId: '1',
          authorId: 'user-mike-r',
          author: 'Mike R.',
          authorDaysClean: 8,
          content: "Amazing milestone! Can't wait to hit 30 days myself",
          timestamp: new Date(Date.now() - 2400000),
          likes: 5,
          isLiked: true
        },
        {
          id: 'c3',
          postId: '1',
          authorId: 'user-jessica-k',
          author: 'Jessica K.',
          authorDaysClean: 30,
          content: "Thank you both! The support from this community means everything. If you're struggling, just remember - one day at a time. You've got this! 💚",
          timestamp: new Date(Date.now() - 1800000),
          likes: 12,
          isLiked: false
        }
      ],
      isLiked: true,
      type: 'milestone'
    },
    {
      id: '2',
      authorId: 'user-anonymous-5',
      author: 'Anonymous',
      authorDaysClean: 5,
      content: "Having a really hard time right now. At a party and everyone's vaping. My hands are literally shaking. Someone please talk me out of this.",
      timestamp: new Date(Date.now() - 300000),
      likes: 45,
      comments: [
        {
          id: 'c4',
          postId: '2',
          authorId: 'user-emma-l',
          author: 'Emma L.',
          authorDaysClean: 15,
          content: "Get out of there! Go outside, take deep breaths. You've made it 5 days - don't throw that away! We're here for you 💙",
          timestamp: new Date(Date.now() - 280000),
          likes: 12,
          isLiked: false
        },
        {
          id: 'c5',
          postId: '2',
          authorId: 'user-sarah-m',
          author: 'Sarah M.',
          authorDaysClean: 12,
          content: "@Emma L. is right! I was at a similar party last week. Step outside and call someone. @Anonymous you've got this! The community is here for you 24/7",
          timestamp: new Date(Date.now() - 240000),
          likes: 8,
          isLiked: true
        },
        {
          id: 'c6',
          postId: '2',
          authorId: 'user-anonymous-5',
          author: 'Anonymous',
          authorDaysClean: 5,
          content: "Thank you @Sarah M. and @Emma L. - I stepped outside and called my sponsor. Still here, still strong. Day 5 continues! 💪",
          timestamp: new Date(Date.now() - 180000),
          likes: 15,
          isLiked: false
        }
      ],
      isLiked: false,
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
        '', // Avatar will be generated from user ID
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
  
  const closeBuddySuccessModal = () => {
    // Animate modal out
    Animated.parallel([
      Animated.timing(buddySuccessAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(buddySuccessScale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowBuddySuccessModal(false);
      setConnectedBuddy(null);
    });
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
    
    // Find the buddy for the modal
    const buddy = buddyMatches.find(b => b.id === buddyId);
    if (buddy) {
      setConnectedBuddy(buddy);
      setShowBuddySuccessModal(true);
      
      // Animate modal in
      Animated.parallel([
        Animated.timing(buddySuccessAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(buddySuccessScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
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
  
  const handleEndConnection = async (buddyId: string) => {
    // Haptic feedback for warning
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Find the buddy's name for confirmation
    const buddy = buddyMatches.find(b => b.id === buddyId);
    if (buddy) {
      Alert.alert(
        'End Buddy Connection?',
        `Are you sure you want to end your connection with ${buddy.name}? You can always reconnect later.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'End Connection', 
            style: 'destructive',
            onPress: async () => {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              // Update the buddy's connection status to 'not-connected'
              setBuddyMatches(prevBuddies => 
                prevBuddies.map(b => 
                  b.id === buddyId 
                    ? { ...b, connectionStatus: 'not-connected' as const, connectionDate: undefined }
                    : b
                )
              );
            }
          }
        ]
      );
    }
  };

  const handleLikePost = async (postId: string, event: { nativeEvent: { pageX?: number; pageY?: number } }) => {
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
    
    // Create new comment
    const newComment: Comment = {
      id: `c${Date.now()}`,
      postId: selectedPost.id,
      authorId: user?.id || user?.email || 'demo_user',
      author: user?.username || user?.displayName || 'You',
      authorDaysClean: stats?.daysClean || 0,
      content: commentText.trim(),
      timestamp: new Date(),
      likes: 0,
      isLiked: false
    };
    
    // Add comment to post
    setCommunityPosts(prevPosts =>
      prevPosts.map(post => 
        post.id === selectedPost.id 
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
    
    // Update selected post to show new comment immediately
    setSelectedPost(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
    
    // Clear input but keep modal open
    setCommentText('');
    
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  const handleProfileNavigation = (userId: string, userName: string, userDaysClean: number) => {
    // Check if this is the current user
    const isCurrentUser = userId === user?.id || userId === user?.email || userId === 'demo_user';
    
    // Check if this user is a buddy
    const existingBuddy = buddyMatches.find(b => b.id === userId);
    const connectionStatus = isCurrentUser ? 'connected' : (existingBuddy?.connectionStatus || 'not-connected');
    
    // Get product - if it's the current user, use their actual product
    let product = existingBuddy?.product;
    if (isCurrentUser) {
      product = user?.nicotineProduct?.name || 'Nicotine';
    }
    
    // Get bio - if it's the current user, use their actual bio
    let bio = existingBuddy?.bio || '';
    if (isCurrentUser) {
      bio = user?.bio || "Hey there! I'm on this journey to quit nicotine.";
    }
    
    // Navigate to buddy profile
    navigation.navigate('BuddyProfile' as never, {
      buddy: {
        id: userId,
        name: userName,
        daysClean: userDaysClean,
        status: 'online' as const,
        bio,
        supportStyles: existingBuddy ? [
          existingBuddy.supportStyle === 'motivator' ? 'Motivator' :
          existingBuddy.supportStyle === 'listener' ? 'Listener' :
          existingBuddy.supportStyle === 'tough-love' ? 'Tough Love' :
          'Analytical'
        ] : [],
        connectionStatus,
        product
      }
    } as never);
  };
  
  const handleLikeComment = async (postId: string, commentId: string) => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Update comment likes
    setCommunityPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.map(comment => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  isLiked: !comment.isLiked,
                  likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
                };
              }
              return comment;
            })
          };
        }
        return post;
      })
    );
    
    // Update selected post to reflect changes in modal
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(prev => {
        if (!prev) return null;
        return {
          ...prev,
          comments: prev.comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                isLiked: !comment.isLiked,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
              };
            }
            return comment;
          })
        };
      });
    }
  };
  
  // Get all unique users from posts and comments for mentions
  const getAllUsers = () => {
    const users = new Map();
    
    // Add current user
    if (user) {
      users.set(user.id, {
        id: user.id,
        name: user.username || 'You',
        daysClean: stats?.daysClean || 0
      });
    }
    
    // Add post authors and comment authors
    communityPosts.forEach(post => {
      users.set(post.authorId, {
        id: post.authorId,
        name: post.author,
        daysClean: post.authorDaysClean
      });
      
      post.comments.forEach(comment => {
        users.set(comment.authorId, {
          id: comment.authorId,
          name: comment.author,
          daysClean: comment.authorDaysClean
        });
      });
    });
    
    // Add buddies
    buddyMatches.forEach(buddy => {
      users.set(buddy.id, {
        id: buddy.id,
        name: buddy.name,
        daysClean: buddy.daysClean
      });
    });
    
    return Array.from(users.values());
  };
  
  // Handle comment text changes and detect mentions
  const handleCommentTextChange = (text: string) => {
    setCommentText(text);
    
    // Check for @ symbol
    const lastAtIndex = text.lastIndexOf('@');
    
    if (lastAtIndex >= 0) {
      const afterAt = text.substring(lastAtIndex + 1);
      const spaceIndex = afterAt.indexOf(' ');
      
      if (spaceIndex === -1) {
        // Currently typing a mention
        setMentionStartIndex(lastAtIndex);
        setMentionSearch(afterAt.toLowerCase());
        setShowMentions(true);
      } else {
        // Finished typing mention
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };
  
  // Handle mention selection
  const selectMention = (selectedUser: { id: string, name: string }) => {
    if (mentionStartIndex >= 0) {
      const beforeMention = commentText.substring(0, mentionStartIndex);
      const afterMention = commentText.substring(mentionStartIndex + mentionSearch.length + 1);
      const newText = `${beforeMention}@${selectedUser.name} ${afterMention}`;
      
      setCommentText(newText);
      setShowMentions(false);
      setMentionSearch('');
      setMentionStartIndex(-1);
      
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Parse and render comment with mentions
  const renderCommentContent = (content: string) => {
    // More robust regex to match @mentions - handles various name formats
    const mentionRegex = /@([A-Za-z]+(?:\s+[A-Za-z]\.?)?)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    
    // Find all matches first
    const matches = [];
    while ((match = mentionRegex.exec(content)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        username: match[1]
      });
    }
    
    // Build the parts array
    matches.forEach((match) => {
      // Add text before this match
      if (match.start > lastIndex) {
        const textBefore = content.substring(lastIndex, match.start);
        if (textBefore) {
          parts.push(textBefore);
        }
      }
      
      // Add the mention as a clickable element
      const mentionedUser = getAllUsers().find(u => u.name === match.username);
      parts.push(
        <Text 
          key={`mention-${match.start}`} 
          style={styles.mentionText}
          onPress={() => {
            if (mentionedUser) {
              handleProfileNavigation(
                mentionedUser.id, 
                mentionedUser.name, 
                mentionedUser.daysClean
              );
            }
          }}
        >
          {match.text}
        </Text>
      );
      
      lastIndex = match.end;
    });
    
    // Add any remaining text after the last match
    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      if (remainingText) {
        parts.push(remainingText);
      }
    }
    
    // If no matches, return the original content
    if (parts.length === 0) {
      return content;
    }
    
    return parts;
  };
  
  const renderBuddyCard = (buddy: Buddy) => {
    const isConnected = buddy.connectionStatus === 'connected';
    const isPendingReceived = buddy.connectionStatus === 'pending-received';
    
    // Compact design for buddy requests
    if (isPendingReceived) {
      return (
        <TouchableOpacity 
          style={styles.compactBuddyRequest}
          activeOpacity={0.95}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('BuddyProfile' as never, { 
              buddy: {
                id: buddy.id,
                name: buddy.name,
                daysClean: buddy.daysClean,
                status: buddy.status,
                bio: buddy.bio,
                supportStyles: [
                  buddy.supportStyle === 'motivator' ? 'Motivator' :
                  buddy.supportStyle === 'listener' ? 'Listener' :
                  buddy.supportStyle === 'tough-love' ? 'Tough Love' :
                  'Analytical'
                ],
                connectionStatus: buddy.connectionStatus,
                product: buddy.product
              },
              onAccept: buddy.connectionStatus === 'pending-received' ? () => handleAcceptBuddy(buddy.id) : undefined,
              onDecline: buddy.connectionStatus === 'pending-received' ? () => handleDeclineBuddy(buddy.id) : undefined,
              onEndConnection: buddy.connectionStatus === 'connected' ? () => handleEndConnection(buddy.id) : undefined
            } as never);
          }}
        >
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.08)', 'rgba(245, 158, 11, 0.03)']}
            style={styles.compactBuddyRequestGradient}
          >
            <View style={styles.compactBuddyRow}>
              {/* Avatar */}
              <DicebearAvatar
                userId={buddy.id}
                size={48}
                daysClean={buddy.daysClean}
                style="warrior"
                badgeIcon={getBadgeForDaysClean(buddy.daysClean)?.icon}
                badgeColor={getBadgeForDaysClean(buddy.daysClean)?.color}
              />
              
              {/* Info */}
              <View style={styles.compactBuddyInfo}>
                <View style={styles.compactNameRow}>
                  <Text style={styles.compactBuddyName}>{buddy.name}</Text>
                  <View style={styles.compactWantsBadge}>
                    <Text style={styles.compactWantsText}>wants to connect!</Text>
                  </View>
                </View>
                <Text style={styles.compactBuddyStats}>
                  Day {buddy.daysClean} • Quit {buddy.product}
                </Text>
                <Text style={styles.compactBuddyBio} numberOfLines={1}>
                  {buddy.bio}
                </Text>
              </View>
              
              {/* Action Buttons */}
              <View style={styles.compactBuddyActions}>
                <TouchableOpacity 
                  style={styles.compactAcceptButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleAcceptBuddy(buddy.id);
                  }}
                >
                  <Ionicons name="checkmark-circle" size={28} color="#10B981" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.compactDeclineButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeclineBuddy(buddy.id);
                  }}
                >
                  <Ionicons name="close-circle" size={28} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    
    // Clean design for connected buddies
    if (isConnected) {
      return (
        <TouchableOpacity 
          style={styles.connectedBuddyCard}
          activeOpacity={0.9}
          onPress={() => {
            navigation.navigate('BuddyChat' as never, { 
              buddy: {
                id: buddy.id,
                name: buddy.name,
                daysClean: buddy.daysClean,
                status: buddy.status,
                product: buddy.product
              },
              onEndConnection: () => handleEndConnection(buddy.id)
            } as never);
          }}
          onLongPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('BuddyProfile' as never, { 
              buddy: {
                id: buddy.id,
                name: buddy.name,
                daysClean: buddy.daysClean,
                status: buddy.status,
                bio: buddy.bio,
                supportStyles: [
                  buddy.supportStyle === 'motivator' ? 'Motivator' :
                  buddy.supportStyle === 'listener' ? 'Listener' :
                  buddy.supportStyle === 'tough-love' ? 'Tough Love' :
                  'Analytical'
                ],
                connectionStatus: buddy.connectionStatus,
                product: buddy.product
              },
              onAccept: undefined,
              onDecline: undefined,
              onEndConnection: buddy.connectionStatus === 'connected' ? () => handleEndConnection(buddy.id) : undefined
            } as never);
          }}
        >
          <View style={styles.connectedBuddyContent}>
            {/* Avatar */}
            <DicebearAvatar
              userId={buddy.id}
              size={48}
              daysClean={buddy.daysClean}
              style="warrior"
              badgeIcon={getBadgeForDaysClean(buddy.daysClean)?.icon}
              badgeColor={getBadgeForDaysClean(buddy.daysClean)?.color}
            />
            
            {/* Info */}
            <View style={styles.connectedBuddyInfo}>
              <View style={styles.connectedNameRow}>
                <Text style={styles.connectedBuddyName}>{buddy.name}</Text>
              </View>
              <Text style={styles.connectedBuddyStats}>
                Day {buddy.daysClean} • Quit {buddy.product}
              </Text>
              <Text style={styles.connectedBuddyBio} numberOfLines={1}>
                {buddy.bio}
              </Text>
            </View>
            
            {/* Quick Actions */}
            <TouchableOpacity 
              style={styles.quickMessageButton}
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('BuddyChat' as never, { 
                  buddy: {
                    id: buddy.id,
                    name: buddy.name,
                    daysClean: buddy.daysClean,
                    status: buddy.status,
                    product: buddy.product
                  },
                  onEndConnection: () => handleEndConnection(buddy.id)
                } as never);
              }}
            >
              <Ionicons name="chatbubble" size={22} color="#10B981" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    }
    
    // Original design for other states (pending-sent, not-connected)
    return (
      <TouchableOpacity 
        style={styles.buddyCard}
        activeOpacity={0.9}
        onLongPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate('BuddyProfile' as never, { 
            buddy: {
              id: buddy.id,
              name: buddy.name,
              daysClean: buddy.daysClean,
              status: buddy.status,
              bio: buddy.bio,
              supportStyles: [
                buddy.supportStyle === 'motivator' ? 'Motivator' :
                buddy.supportStyle === 'listener' ? 'Listener' :
                buddy.supportStyle === 'tough-love' ? 'Tough Love' :
                'Analytical'
              ],
              connectionStatus: buddy.connectionStatus,
              product: buddy.product
            },
            onAccept: undefined,
            onDecline: undefined
          } as never);
        }}
      >
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.05)', 'rgba(236, 72, 153, 0.02)']}
          style={styles.buddyCardGradient}
        >
          <View style={styles.buddyHeader}>
            <View style={styles.buddyAvatarContainer}>
              <DicebearAvatar
                userId={buddy.id}
                size="medium"
                daysClean={buddy.daysClean}
                style="warrior"
                badgeIcon={getBadgeForDaysClean(buddy.daysClean)?.icon}
                badgeColor={getBadgeForDaysClean(buddy.daysClean)?.color}
              />
            </View>
            
            <View style={styles.buddyInfo}>
              <View style={styles.buddyNameRow}>
                <Text style={styles.buddyName}>{buddy.name}</Text>
                {buddy.connectionStatus === 'pending-sent' && (
                  <View style={styles.pendingBadge}>
                    <Ionicons name="time-outline" size={14} color="#F59E0B" />
                    <Text style={styles.pendingText}>Pending</Text>
                  </View>
                )}
                {!isConnected && buddy.connectionStatus !== 'pending-sent' && (
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
          
          {buddy.connectionStatus !== 'pending-sent' && (
            <View style={styles.buddyActions}>
              <TouchableOpacity style={styles.connectButton}>
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  style={styles.connectButtonGradient}
                >
                  <Ionicons name="person-add" size={16} color="#FFFFFF" />
                  <Text style={styles.connectButtonText}>Send Request</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };
  
  const renderPost = (post: CommunityPost) => {
    // Adjust padding based on content length
    const isShortPost = post.content.length < 50;
    const paddingStyle = isShortPost ? { paddingVertical: 8 } : {};
    
    return (
      <TouchableOpacity 
        style={styles.postCard}
        activeOpacity={0.95}
        onPress={() => handleCommentPress(post)}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
          style={[styles.postGradient, paddingStyle]}
        >
        {post.type === 'crisis' && (
          <View style={styles.crisisHeader}>
            <Ionicons name="heart" size={16} color="#EC4899" />
            <Text style={styles.crisisLabel}>NEEDS SUPPORT</Text>
          </View>
        )}
        
        <View style={styles.postHeader}>
          <TouchableOpacity
            onPress={(event) => {
              event.stopPropagation();
              handleProfileNavigation(post.authorId, post.author, post.authorDaysClean);
            }}
            activeOpacity={0.7}
          >
            <DicebearAvatar
              userId={post.authorId}
              size="small"
              daysClean={post.authorDaysClean}
              style="warrior"
              badgeIcon={getBadgeForDaysClean(post.authorDaysClean)?.icon}
              badgeColor={getBadgeForDaysClean(post.authorDaysClean)?.color}
            />
          </TouchableOpacity>
          <View style={styles.postAuthorInfo}>
            <Text style={styles.postAuthor}>{post.author}</Text>
            <Text style={styles.postMeta}>
              Day {post.authorDaysClean} • {getTimeAgo(post.timestamp)}
            </Text>
          </View>
          
          {post.type === 'milestone' && (
            <View style={styles.milestoneIcon}>
              <Ionicons name="trophy" size={18} color="#F59E0B" />
            </View>
          )}
        </View>
        
        <Text style={styles.postContent}>{post.content}</Text>
        
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.postAction}
            onPress={(event) => {
              event.stopPropagation();
              handleLikePost(post.id, event);
            }}
          >
            <Ionicons 
              name={post.isLiked ? "heart" : "heart-outline"} 
              size={18} 
              color={post.isLiked ? "#EF4444" : COLORS.textMuted} 
            />
            <Text style={styles.postActionText}>{post.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.postAction}
            onPress={(event) => {
              event.stopPropagation();
              handleCommentPress(post);
            }}
          >
            <Ionicons name="chatbubbles-outline" size={18} color={COLORS.textMuted} />
            <Text style={styles.postActionText}>{post.comments.length}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.postAction}
            onPress={(event) => {
              event.stopPropagation();
            }}
          >
            <Ionicons name="share-outline" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          
          {post.type === 'crisis' && (
            <TouchableOpacity 
              style={styles.helpButton}
              onPress={(event) => {
                event.stopPropagation();
                handleLikePost(post.id, event);
              }}
            >
              <Text style={styles.helpButtonText}>Send Love</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
    );
  };
  
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
                  onPress={() => setActiveTab(tab.id as 'feed' | 'buddies')}
                >
                  <Ionicons 
                    name={tab.icon as keyof typeof Ionicons.glyphMap} 
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
              <ScrollView 
                style={styles.content}
                contentContainerStyle={styles.buddySection}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                      setRefreshing(true);
                      setTimeout(() => setRefreshing(false), 1000);
                    }}
                    tintColor="#10B981"
                  />
                }
              >
                <View style={styles.buddyContent}>
                  {/* Search Bar */}
                  <TouchableOpacity 
                    style={styles.searchBar}
                    onPress={() => navigation.navigate('BuddySearch' as never)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="search" size={20} color={COLORS.textMuted} />
                    <Text style={styles.searchPlaceholder}>Search for buddies...</Text>
                  </TouchableOpacity>

                  {/* Priority 1: Show Buddy Requests if any */}
                  {buddyMatches.filter(b => b.connectionStatus === 'pending-received').length > 0 && (
                    <>
                      <View style={styles.compactRequestHeader}>
                        <View style={styles.compactRequestTitleRow}>
                          <Ionicons name="notifications" size={18} color="#F59E0B" />
                          <Text style={styles.compactRequestTitle}>Buddy Requests</Text>
                          <View style={styles.compactRequestBadge}>
                            <Text style={styles.compactRequestBadgeText}>
                              {buddyMatches.filter(b => b.connectionStatus === 'pending-received').length} NEW
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.compactRequestDescription}>
                          People who want to connect with you
                        </Text>
                      </View>
                      {buddyMatches
                        .filter(b => b.connectionStatus === 'pending-received')
                        .map((buddy) => (
                          <React.Fragment key={buddy.id}>
                            {renderBuddyCard(buddy)}
                          </React.Fragment>
                        ))}
                      
                      {/* Divider if we have connected buddies to show below */}
                      {buddyMatches.filter(b => b.connectionStatus === 'connected').length > 0 && (
                        <View style={styles.sectionDivider} />
                      )}
                    </>
                  )}
                  
                  {/* Priority 2: Show Connected Buddies */}
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
                  
                  {/* Priority 3: Empty State - No buddies at all */}
                  {buddyMatches.filter(b => b.connectionStatus === 'connected').length === 0 && 
                   buddyMatches.filter(b => b.connectionStatus === 'pending-received').length === 0 && (
                    <View style={styles.completeEmptyState}>
                      <LinearGradient
                        colors={['rgba(139, 92, 246, 0.05)', 'rgba(16, 185, 129, 0.03)']}
                        style={styles.emptyStateGradient}
                      >
                        <Text style={styles.emptyStateIcon}>🤝</Text>
                        <Text style={styles.emptyStateTitle}>Find Your Recovery Buddy</Text>
                        <Text style={styles.emptyStateText}>
                          Having a buddy doubles your chances of staying quit. Connect with someone on the same journey!
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
                              <Text style={styles.primaryEmptyButtonText}>Find Buddies</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={styles.secondaryEmptyButton}
                            onPress={handleInviteFriend}
                          >
                            <Ionicons name="person-add-outline" size={18} color="#10B981" />
                            <Text style={styles.secondaryEmptyButtonText}>Invite a Friend</Text>
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    </View>
                  )}
                  
                  {/* Bottom Action: Find More Buddies (only if user has buddies) */}
                  {buddyMatches.filter(b => b.connectionStatus === 'connected').length > 0 && (
                    <TouchableOpacity 
                      style={styles.findMoreBuddiesButton}
                      onPress={() => navigation.navigate('BuddyMatching' as never)}
                    >
                      <Ionicons name="sparkles" size={18} color="#8B5CF6" />
                      <Text style={styles.findMoreBuddiesText}>Find More Buddies</Text>
                    </TouchableOpacity>
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
                          authorId: user?.id || user?.email || 'demo_user',
                          author: user?.username || user?.displayName || 'You',
                          authorDaysClean: stats?.daysClean || 0,
                          content: postContent.trim(),
                          timestamp: new Date(),
                          likes: 0,
                          comments: [],
                          isLiked: false,
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
                          setPostType(type.id as 'story' | 'question' | 'milestone' | 'crisis');
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name={type.icon as keyof typeof Ionicons.glyphMap} 
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
          <View style={styles.commentModalOverlay}>
            <TouchableOpacity 
              style={styles.commentModalBackdrop} 
              activeOpacity={1}
              onPress={() => {
                setShowCommentModal(false);
                setCommentText('');
              }}
            />
            
            <KeyboardAvoidingView 
              style={styles.commentModalKeyboardView}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={0}
            >
              <View style={styles.commentModalContainer}>
                <LinearGradient
                  colors={['#1F2937', '#111827']}
                  style={styles.commentModalContent}
                >
                  {/* Header */}
                  <View style={styles.commentModalHeader}>
                    <Text style={styles.commentModalTitle}>Comments</Text>
                    <TouchableOpacity 
                      onPress={() => {
                        setShowCommentModal(false);
                        setCommentText('');
                      }}
                      style={styles.commentModalCloseButton}
                    >
                      <Ionicons name="close" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Original Post */}
                  {selectedPost && (
                    <View style={styles.originalPostContainer}>
                      <View style={styles.originalPostHeader}>
                        <TouchableOpacity 
                          onPress={() => handleProfileNavigation(selectedPost.authorId, selectedPost.author, selectedPost.authorDaysClean)}
                          activeOpacity={0.7}
                        >
                          <DicebearAvatar
                            userId={selectedPost.authorId}
                            size={40}
                            daysClean={selectedPost.authorDaysClean}
                            style="warrior"
                            badgeIcon={getBadgeForDaysClean(selectedPost.authorDaysClean)?.icon}
                            badgeColor={getBadgeForDaysClean(selectedPost.authorDaysClean)?.color}
                          />
                        </TouchableOpacity>
                        <View style={styles.originalPostInfo}>
                          <Text style={styles.originalPostAuthor}>{selectedPost.author}</Text>
                          <Text style={styles.originalPostMeta}>
                            Day {selectedPost.authorDaysClean} • {getTimeAgo(selectedPost.timestamp)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.originalPostContent} numberOfLines={2}>
                        {selectedPost.content}
                      </Text>
                    </View>
                  )}
                  
                  {/* Comments List */}
                  <View style={styles.commentsListContainer}>
                    <ScrollView 
                      style={styles.commentsList}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.commentsListContent}
                      keyboardShouldPersistTaps="handled"
                    >
                      {selectedPost?.comments.length === 0 ? (
                        <View style={styles.noCommentsContainer}>
                          <Text style={styles.noCommentsIcon}>💬</Text>
                          <Text style={styles.noCommentsText}>No comments yet</Text>
                          <Text style={styles.noCommentsSubtext}>Be the first to show support!</Text>
                        </View>
                      ) : (
                        selectedPost?.comments.map((comment) => (
                          <View key={comment.id} style={styles.commentItem}>
                            <View style={styles.commentLayout}>
                              <TouchableOpacity 
                                onPress={() => handleProfileNavigation(comment.authorId, comment.author, comment.authorDaysClean)}
                                activeOpacity={0.7}
                              >
                                <DicebearAvatar
                                  userId={comment.authorId}
                                  size={36}
                                  daysClean={comment.authorDaysClean}
                                  style="warrior"
                                  badgeIcon={getBadgeForDaysClean(comment.authorDaysClean)?.icon}
                                  badgeColor={getBadgeForDaysClean(comment.authorDaysClean)?.color}
                                />
                              </TouchableOpacity>
                              <View style={styles.commentBody}>
                                <View style={styles.commentHeader}>
                                  <View style={styles.commentAuthorRow}>
                                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                                    {comment.authorId === selectedPost.authorId && (
                                      <View style={styles.authorBadge}>
                                        <Text style={styles.authorBadgeText}>Author</Text>
                                      </View>
                                    )}
                                  </View>
                                  <Text style={styles.commentMeta}>
                                    Day {comment.authorDaysClean} • {getTimeAgo(comment.timestamp)}
                                  </Text>
                                </View>
                                <Text style={styles.commentContent}>
                                  {renderCommentContent(comment.content)}
                                </Text>
                                <TouchableOpacity 
                                  style={styles.commentLikeButton}
                                  onPress={() => handleLikeComment(selectedPost.id, comment.id)}
                                >
                                  <Ionicons 
                                    name={comment.isLiked ? "heart" : "heart-outline"} 
                                    size={14} 
                                    color={comment.isLiked ? "#EF4444" : COLORS.textMuted} 
                                  />
                                  {comment.likes > 0 && (
                                    <Text style={styles.commentLikeCount}>{comment.likes}</Text>
                                  )}
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        ))
                      )}
                    </ScrollView>
                  </View>
                  
                  {/* Mention Suggestions */}
                  {showMentions && (
                    <View style={styles.mentionSuggestionsContainer}>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyboardShouldPersistTaps="always"
                        contentContainerStyle={styles.mentionSuggestionsContent}
                      >
                        {getAllUsers()
                          .filter(user => 
                            user.name.toLowerCase().includes(mentionSearch) ||
                            mentionSearch === ''
                          )
                          .slice(0, 5)
                          .map(user => (
                            <TouchableOpacity
                              key={user.id}
                              style={styles.mentionSuggestion}
                              onPress={() => selectMention(user)}
                            >
                              <DicebearAvatar
                                userId={user.id}
                                size={24}
                                daysClean={user.daysClean}
                                style="warrior"
                              />
                              <Text style={styles.mentionSuggestionText}>
                                {user.name}
                              </Text>
                            </TouchableOpacity>
                          ))
                        }
                      </ScrollView>
                    </View>
                  )}
                  
                  {/* Comment Input - Fixed at bottom */}
                  <View style={styles.commentInputWrapper}>
                    <View style={styles.commentInputContainer}>
                      <DicebearAvatar
                        userId={user?.id || 'default-user'}
                        size={36}
                        daysClean={stats?.daysClean || 0}
                        style="warrior"
                      />
                      <View style={styles.commentInputField}>
                        <TextInput
                          ref={commentInputRef}
                          style={styles.commentInput}
                          placeholder="Add a supportive comment..."
                          placeholderTextColor="#6B7280"
                          value={commentText}
                          onChangeText={handleCommentTextChange}
                          multiline
                          maxLength={300}
                          returnKeyType="send"
                          blurOnSubmit={true}
                          onSubmitEditing={handleSendComment}
                        />
                      </View>
                      <TouchableOpacity 
                        onPress={handleSendComment}
                        disabled={!commentText.trim()}
                        style={[
                          styles.sendButton,
                          !commentText.trim() && styles.sendButtonDisabled
                        ]}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name="arrow-up" 
                          size={22} 
                          color={commentText.trim() ? '#FFFFFF' : '#6B7280'} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
        
        {/* Buddy Connection Success Modal */}
        <Modal
          visible={showBuddySuccessModal}
          transparent={true}
          animationType="none"
          statusBarTranslucent={true}
        >
          <View style={styles.buddySuccessOverlay}>
            <Animated.View 
              style={[
                styles.buddySuccessModal,
                {
                  opacity: buddySuccessAnim,
                  transform: [{ scale: buddySuccessScale }],
                },
              ]}
            >
              <LinearGradient
                colors={['#1F2937', '#111827']}
                style={styles.buddySuccessGradient}
              >
                {/* Success Animation */}
                <View style={styles.buddySuccessAnimation}>
                  <LinearGradient
                    colors={['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']}
                    style={styles.buddySuccessIconBg}
                  >
                    <Ionicons name="people" size={48} color="#10B981" />
                  </LinearGradient>
                </View>
                
                {/* Avatars */}
                <View style={styles.buddySuccessAvatars}>
                  <View style={styles.buddySuccessAvatarWrapper}>
                    <DicebearAvatar
                      userId={user?.id || 'default-user'}
                      size="large"
                      daysClean={stats?.daysClean || 0}
                      style="warrior"
                      badgeIcon={getBadgeForDaysClean(stats?.daysClean || 0)?.icon}
                      badgeColor={getBadgeForDaysClean(stats?.daysClean || 0)?.color}
                    />
                  </View>
                  
                  <View style={styles.buddySuccessHeart}>
                    <Ionicons name="heart" size={24} color="#EC4899" />
                  </View>
                  
                  <View style={styles.buddySuccessAvatarWrapper}>
                    {connectedBuddy && (
                      <DicebearAvatar
                        userId={connectedBuddy.id}
                        size="large"
                        daysClean={connectedBuddy.daysClean}
                        style="warrior"
                        badgeIcon={getBadgeForDaysClean(connectedBuddy.daysClean)?.icon}
                        badgeColor={getBadgeForDaysClean(connectedBuddy.daysClean)?.color}
                      />
                    )}
                  </View>
                </View>
                
                {/* Success Message */}
                <Text style={styles.buddySuccessTitle}>Buddy Connected! 🎉</Text>
                <Text style={styles.buddySuccessMessage}>
                  You and {connectedBuddy?.name} are now recovery buddies
                </Text>
                
                {/* Action Buttons */}
                <View style={styles.buddySuccessActions}>
                  <TouchableOpacity
                    style={styles.buddySuccessButton}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      closeBuddySuccessModal();
                      // Give animation time to complete before navigating
                      setTimeout(() => {
                        if (connectedBuddy) {
                          navigation.navigate('BuddyChat' as never, { 
                            buddy: {
                              id: connectedBuddy.id,
                              name: connectedBuddy.name,
                              daysClean: connectedBuddy.daysClean,
                              status: connectedBuddy.status,
                              product: connectedBuddy.product
                            },
                            onEndConnection: () => handleEndConnection(connectedBuddy.id)
                          } as never);
                        }
                      }, 350);
                    }}
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={styles.buddySuccessButtonGradient}
                    >
                      <Ionicons name="chatbubbles-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.buddySuccessButtonText}>Start Chatting</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.buddySuccessSecondaryButton}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      closeBuddySuccessModal();
                    }}
                  >
                    <Text style={styles.buddySuccessSecondaryText}>Later</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Encouragement Text */}
                <Text style={styles.buddySuccessEncouragement}>
                  Supporting each other doubles your chances of success! 💪
                </Text>
              </LinearGradient>
            </Animated.View>
          </View>
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
    paddingTop: SPACING.sm,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tabWrapper: {
    paddingHorizontal: SPACING.lg,
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeTab: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  tabText: {
    fontSize: 12,
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
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  
  // Post Styles
  postCard: {
    marginBottom: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  postGradient: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
  },
  crisisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  crisisLabel: {
    color: '#EC4899',
    fontSize: 11,
    fontWeight: '700',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  postAuthorInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 18,
  },
  postMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 14,
  },
  milestoneIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postContent: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postActionText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  helpButton: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  helpButtonText: {
    color: '#EC4899',
    fontSize: 12,
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
  commentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  commentModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  commentModalKeyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  commentModalContainer: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    height: '75%',
  },
  commentModalContent: {
    flex: 1,
  },
  commentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  commentModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  commentModalCloseButton: {
    padding: 4,
  },
  originalPostContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  originalPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  originalPostInfo: {
    marginLeft: SPACING.sm,
  },
  originalPostAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  originalPostMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  originalPostContent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  commentsListContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  commentsList: {
    flex: 1,
  },
  commentsListContent: {
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  noCommentsContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 3,
  },
  noCommentsIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  noCommentsText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  commentItem: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  commentLayout: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    marginBottom: SPACING.xs,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  authorBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  commentMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  commentContent: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentLikeCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  commentInputWrapper: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: '#0F1419',
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? 24 : SPACING.md,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    gap: 10,
  },
  commentInputField: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 2,
    minHeight: 44,
    maxHeight: 100,
    justifyContent: 'center',
  },
  commentInput: {
    fontSize: 15,
    color: COLORS.text,
    minHeight: Platform.OS === 'ios' ? 24 : 40,
    maxHeight: 80,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  sendButtonDisabled: {
    opacity: 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: SPACING.md,
  },
  findMoreBuddiesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 16,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  findMoreBuddiesText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  searchPlaceholder: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  buddyContent: {
    flex: 1,
  },
  
  // Mention styles
  mentionText: {
    color: '#8B5CF6',
    fontWeight: '600',
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(139, 92, 246, 0.3)',
  },
  mentionSuggestionsContainer: {
    backgroundColor: '#1F2937',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: SPACING.sm,
  },
  mentionSuggestionsContent: {
    paddingHorizontal: SPACING.md,
  },
  mentionSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: SPACING.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  mentionSuggestionText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  
  // Buddy Success Modal Styles
  buddySuccessOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  buddySuccessModal: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  buddySuccessGradient: {
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 24,
  },
  buddySuccessAnimation: {
    marginBottom: 24,
  },
  buddySuccessIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  buddySuccessAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 24,
  },
  buddySuccessAvatarWrapper: {
    // Simple wrapper for avatars
  },
  buddySuccessHeart: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  buddySuccessTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  buddySuccessMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  buddySuccessActions: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  buddySuccessButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buddySuccessButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buddySuccessButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  buddySuccessSecondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  buddySuccessSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  buddySuccessEncouragement: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  
  // Compact Buddy Request Styles
  compactBuddyRequest: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  compactBuddyRequestGradient: {
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 12,
  },
  compactBuddyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactBuddyInfo: {
    flex: 1,
  },
  compactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  compactBuddyName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  compactWantsBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  compactWantsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  compactBuddyStats: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  compactBuddyBio: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  compactBuddyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  compactAcceptButton: {
    padding: 4,
  },
  compactDeclineButton: {
    padding: 4,
  },
  
  // Connected Buddy Styles
  connectedBuddyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  connectedBuddyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  connectedBuddyInfo: {
    flex: 1,
  },
  connectedNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  connectedBuddyName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },

  connectedBuddyStats: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  connectedBuddyBio: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  quickMessageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  
  // Compact Request Header Styles
  compactRequestHeader: {
    marginBottom: 12,
  },
  compactRequestTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  compactRequestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  compactRequestBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  compactRequestBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
  compactRequestDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 24,
  },
});

export default CommunityScreen; 