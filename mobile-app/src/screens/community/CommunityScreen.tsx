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
  Share,
  Image,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import DicebearAvatar, { AVATAR_STYLES, getAvatarBorderColor } from '../../components/common/DicebearAvatar';
import inviteService from '../../services/inviteService';
import communityService from '../../services/communityService';
import FloatingHeart from '../../components/common/FloatingHeart';
import HeartParticles from '../../components/common/HeartParticles';
import { getBadgeForDaysClean } from '../../utils/badges';
import NotificationService from '../../services/notificationService';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  authorProduct?: string; // What they're quitting
  content: string;
  images?: string[]; // Array of image URIs
  timestamp: Date;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
}

const CommunityScreen: React.FC = () => {
  const navigation = useNavigation() as any;
  const route = useRoute() as any;
  const dispatch = useDispatch<AppDispatch>();
  const stats = useSelector((state: RootState) => state.progress.stats);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [activeTab, setActiveTab] = useState<'feed' | 'buddies'>(route.params?.initialTab || 'feed');
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };
  const [postContent, setPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imagePickerLoading, setImagePickerLoading] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [commentText, setCommentText] = useState('');
  const [floatingHearts, setFloatingHearts] = useState<{id: string, x: number, y: number, color?: string}[]>([]);

  
  // Mention state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const commentInputRef = useRef<TextInput>(null);
  const feedListRef = useRef<FlatList>(null);
  
  // Buddy connection success modal state
  const [showBuddySuccessModal, setShowBuddySuccessModal] = useState(false);
  const [connectedBuddy, setConnectedBuddy] = useState<Buddy | null>(null);
  const buddySuccessAnim = useRef(new Animated.Value(0)).current;
  const buddySuccessScale = useRef(new Animated.Value(0.8)).current;
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0)).current;
  
  // New animation values for premium feel
  const postAnimations = useRef<{[key: string]: {
    scale: Animated.Value;
    opacity: Animated.Value;
    likeScale: Animated.Value;
    likeRotate: Animated.Value;
  }}>({}).current;
  
  const getPostAnimation = (postId: string) => {
    if (!postAnimations[postId]) {
      postAnimations[postId] = {
        scale: new Animated.Value(0.98),
        opacity: new Animated.Value(0),
        likeScale: new Animated.Value(1),
        likeRotate: new Animated.Value(0),
      };
      
      // Simple fade in animation
      setTimeout(() => {
        Animated.timing(postAnimations[postId].opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, 50);
    }
    return postAnimations[postId];
  };
  
  // Fetch posts from Supabase
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const posts = await communityService.getPosts();
      
      // Transform the data and fetch comments for each post
      const transformedPosts: CommunityPost[] = await Promise.all(
        posts.map(async (post) => {
          // Fetch comments for this post
          let comments: Comment[] = [];
          try {
            const postComments = await communityService.getComments(post.id);
            comments = postComments.map(comment => ({
              id: comment.id,
              postId: post.id,
              authorId: comment.user_id,
              author: comment.users?.display_name || comment.users?.username || 'Anonymous',
              authorDaysClean: comment.users?.days_clean || 0,
              content: comment.content,
              timestamp: new Date(comment.created_at),
              likes: 0, // Comment likes not implemented yet
              isLiked: false,
            }));
          } catch (error) {
            console.error('Error fetching comments for post', post.id, error);
          }
          
          return {
            id: post.id,
            authorId: post.user_id || 'anonymous',
            author: post.display_name || post.username || 'Anonymous',
            authorDaysClean: post.days_clean || 0,
            authorProduct: 'nicotine', // This would need to come from user profile
            content: post.content,
            images: [], // Images not implemented in DB yet
            timestamp: new Date(post.created_at),
            likes: post.loves,
            comments,
            isLiked: post.user_loved || false,
          };
        })
      );
      
      setCommunityPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check for pending invites on mount and fetch posts
  useEffect(() => {
    checkPendingInvites();
    fetchPosts();
  }, []);
  
  // Image handling functions
  const pickImage = async () => {
    try {
      setImagePickerLoading(true);
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant access to your photo library to upload images.');
        setImagePickerLoading(false);
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 4, // Max 4 images per post
      });
      
      if (!result.canceled && result.assets) {
        const newImages = await Promise.all(
          result.assets.map(async (asset) => {
            // Compress image to optimize size
            const manipResult = await ImageManipulator.manipulateAsync(
              asset.uri,
              [{ resize: { width: 1080 } }], // Resize to max 1080px width
              { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
            );
            return manipResult.uri;
          })
        );
        
        setSelectedImages(prev => [...prev, ...newImages].slice(0, 4)); // Ensure max 4 images
      }
          } catch {
        Alert.alert('Error', 'Failed to pick image. Please try again.');
      } finally {
      setImagePickerLoading(false);
    }
  };
  
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Update active tab when route params change
  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);
  
  // 🟥 [MOCK] - Buddy data is hardcoded. Connect to buddy_profiles table via buddyService
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
      id: 'buddy-mike-456',  // Changed to match notification demo data
      name: 'Mike S.',      // Changed to match notification demo data
      daysClean: 120,       // Changed to match notification demo data
      product: 'cigarettes',
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
  
  // Initialize with empty array - will be populated from database
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  
  // Handle scrolling to specific post and opening comments
  useEffect(() => {
    if (route.params?.scrollToPostId && activeTab === 'feed') {
      // Find the index of the post
      const postIndex = communityPosts.findIndex(post => post.id === route.params.scrollToPostId);
      
      if (postIndex !== -1) {
        // Small delay to ensure the FlatList is rendered
        setTimeout(() => {
          // Scroll to the post
          feedListRef.current?.scrollToIndex({
            index: postIndex,
            animated: true,
            viewPosition: 0.1 // Show post near top
          });
          
          // If we should open comments, do so after a delay
          if (route.params?.openComments) {
            setTimeout(() => {
              const post = communityPosts[postIndex];
              setSelectedPost(post);
              setShowCommentModal(true);
            }, 500); // Wait for scroll animation to complete
          }
        }, 300); // Wait for component to mount
      }
    }
  }, [route.params?.scrollToPostId, route.params?.openComments, activeTab, communityPosts]);
  
  // Slide in animation
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
    
    // Simple FAB animation
    if (activeTab === 'feed') {
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fabScale, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [activeTab, slideAnim, fabScale]);
  
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
          'Welcome to NixR',
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

We can support each other through cravings and celebrate milestones together!

Join me with this link: ${inviteLink}

Your invite code: ${inviteData.code}`;

      const result = await Share.share({
        message,
        title: 'Be My Quit Buddy on NixR',
      });

      if (result.action === Share.sharedAction) {
        Alert.alert(
          'Invite Sent',
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
    // Get tap coordinates BEFORE any async operations
    const { pageX = 0, pageY = 0 } = event.nativeEvent;
    
    // Get post animation
    const anim = getPostAnimation(postId);
    
    // Subtle haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Find if we're liking or unliking
    const currentPost = communityPosts.find(p => p.id === postId);
    if (!currentPost) return;
    
    // Simple scale animation for the like button
    Animated.sequence([
      Animated.timing(anim.likeScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(anim.likeScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Update post state optimistically
    setCommunityPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const newIsLiked = !post.isLiked;
          
          // Create subtle floating heart when liking
          if (newIsLiked && pageX && pageY) {
            // Get color based on user's days clean
            const getDaysCleanColor = (days: number) => {
              if (days >= 365) return 'rgba(250, 204, 21, 0.6)'; // Gold
              if (days >= 90) return 'rgba(134, 239, 172, 0.6)'; // Green
              if (days >= 30) return 'rgba(147, 197, 253, 0.6)'; // Blue
              if (days >= 7) return 'rgba(251, 191, 36, 0.5)'; // Amber
              return 'rgba(255, 255, 255, 0.4)'; // White for early days
            };
            
            const userDaysClean = stats?.daysClean || 0;
            const heartColor = getDaysCleanColor(userDaysClean);
            
            // Create single floating heart
            setTimeout(() => {
              const heartId = `${postId}-${Date.now()}`;
              setFloatingHearts(prev => [...prev, {
                id: heartId,
                x: pageX,
                y: pageY,
                color: heartColor
              }]);
            }, 0);
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
    
    // Save to Supabase in the background
    try {
      await communityService.toggleLove(postId);
    } catch (error) {
      console.error('Error toggling love:', error);
      // Revert on error
      setCommunityPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            };
          }
          return post;
        })
      );
    }
  };

  const handleCommentPress = (post: CommunityPost) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    
    try {
      // Save to Supabase community_posts table
      const savedPost = await communityService.createPost(
        postContent.trim(),
        stats.daysClean >= 30 ? 'days_clean' : undefined,
        stats.daysClean >= 30 ? stats.daysClean : undefined
      );
      
      // Create local post object for immediate UI update
      const newPost: CommunityPost = {
        id: savedPost.id,
        authorId: user?.id || 'anonymous',
        author: user?.username || 'Anonymous',
        authorDaysClean: stats.daysClean,
        authorProduct: user?.productType || 'nicotine',
        content: savedPost.content,
        images: selectedImages, // Note: Image upload to Supabase storage not implemented yet
        timestamp: new Date(savedPost.created_at),
        likes: savedPost.loves,
        comments: [],
        isLiked: false,
      };
      
      setCommunityPosts([newPost, ...communityPosts]);
      setPostContent('');
      setSelectedImages([]);
      setShowCreatePostModal(false);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Optionally refresh posts from server
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !selectedPost) return;
    
    try {
      // Save comment to Supabase
      const savedComment = await communityService.addComment(selectedPost.id, commentText.trim());
      
      // Create new comment with proper user data for local state
      const authorName = user?.displayName || user?.username || 
                       `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 
                       'Anonymous';
      const authorId = user?.id || `user_${Date.now()}`;
      
      const newComment: Comment = {
        id: savedComment.id,
        postId: selectedPost.id,
        authorId: authorId,
        author: authorName,
        authorDaysClean: stats?.daysClean || 0,
        content: savedComment.content,
        timestamp: new Date(savedComment.created_at),
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
      // Find the updated post from the communityPosts to ensure we have the latest data
      const updatedPost = communityPosts.find(p => p.id === selectedPost.id);
      if (updatedPost) {
        setSelectedPost({ ...updatedPost, comments: [...updatedPost.comments, newComment] });
      }
      
      // Check for mentions and create notifications
      const mentionedUserIds = extractMentions(commentText.trim());
      for (const mentionedUserId of mentionedUserIds) {
        const mentionedUser = getAllUsers().find(u => u.id === mentionedUserId);
        if (mentionedUser) {
          await NotificationService.createMentionNotification(
            dispatch,
            {
              id: authorId,
              name: authorName,
              daysClean: stats?.daysClean || 0,
            },
            {
              type: 'comment',
              postId: selectedPost.id,
              postAuthor: selectedPost.author,
              content: commentText.trim(),
            }
          );
        }
      }
      
      // Clear input but keep modal open
      setCommentText('');
      
      // Haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Refresh the post to get all comments from database
      // This ensures comments persist across app refreshes
      setTimeout(() => {
        fetchPosts();
      }, 500);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    }
  };
  
  const handleProfileNavigation = (userId: string, userName: string, userDaysClean: number) => {
    // Check if this is the current user
    const isCurrentUser = userId === user?.id;
    
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
    
    // Get support styles/vibes
    let supportStyles: string[] = [];
    if (isCurrentUser) {
      // Use current user's actual support styles
      supportStyles = user?.supportStyles || [];
    } else if (existingBuddy) {
      // Use existing buddy's support style
      supportStyles = [
        existingBuddy.supportStyle === 'motivator' ? 'Motivator' :
        existingBuddy.supportStyle === 'listener' ? 'Listener' :
        existingBuddy.supportStyle === 'tough-love' ? 'Tough Love' :
        'Analytical'
      ];
    }
    // Note: For non-buddies (strangers), we leave supportStyles empty
    // In a real app with backend, every user would have their own profile data
    
    // For demo purposes, generate product if not available for navigation
    if (!product && !isCurrentUser) {
      // This is only for demo - in production, every user would have their product stored
      const productOptions = ['vaping', 'cigarettes', 'pouches', 'dip/chew'];
      const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const productIndex = (hash + 1) % productOptions.length;
      product = productOptions[productIndex];
    }
    
    // For demo purposes, generate bio if not available
    if (!bio && !isCurrentUser) {
      bio = "Member of the NixR community";
    }
    
    // Navigate to buddy profile
    navigation.navigate('BuddyProfile' as never, {
      buddy: {
        id: userId,
        name: userName,
        daysClean: userDaysClean,
        status: 'online' as const,
        bio,
        supportStyles,
        connectionStatus,
        product
      }
    } as never);
  };
  
  const handleSharePost = async (post: CommunityPost) => {
    try {
      // Create share message
      const postPreview = post.content.length > 100 
        ? post.content.substring(0, 100) + '...' 
        : post.content;
      
      const shareMessage = `From ${post.author} (Day ${post.authorDaysClean}):\n\n"${postPreview}"\n\nJoin me on my nicotine-free journey with NixR!\n\nDownload: https://nixrapp.com`;
      
      const result = await Share.share({
        message: shareMessage,
        title: 'Share Recovery Journey',
      });
      
      if (result.action === Share.sharedAction) {
        // Track share analytics if needed
        
        // Show subtle feedback
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      Alert.alert('Unable to Share', 'Please try again later.');
    }
  };
  
  const handleDeletePost = (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              
              // Delete from Supabase first
              await communityService.deletePost(postId);
              
              // Then remove from local state
              setCommunityPosts(prev => prev.filter(p => p.id !== postId));
              
              // Show success feedback
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  const handleDeleteComment = (postId: string, commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              
              // Delete from Supabase first
              await communityService.deleteComment(commentId);
              
              // Update the post's comments in local state
              setCommunityPosts(prev => prev.map(post => {
                if (post.id === postId) {
                  return {
                    ...post,
                    comments: post.comments.filter(c => c.id !== commentId)
                  };
                }
                return post;
              }));
              
              // Update selected post if in comment modal
              if (selectedPost && selectedPost.id === postId) {
                setSelectedPost(prev => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    comments: prev.comments.filter(c => c.id !== commentId)
                  };
                });
              }
              
              // Show success feedback
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', 'Failed to delete comment. Please try again.');
            }
          }
        }
      ]
    );
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
      const userName = user.displayName || user.username || 
                     `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
                     'Anonymous';
      users.set(user.id, {
        id: user.id,
        name: userName,
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
  
  // Extract mentions from text and return user IDs
  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@([A-Za-z]+(?:\s+[A-Za-z]\.?)?)/g;
    const mentionedUserIds: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      const mentionedName = match[1];
      const mentionedUser = getAllUsers().find(u => u.name === mentionedName);
      
      if (mentionedUser && mentionedUser.id !== user?.id) {
        // Don't notify users about mentioning themselves
        mentionedUserIds.push(mentionedUser.id);
      }
    }
    
    // Remove duplicates
    return [...new Set(mentionedUserIds)];
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
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)']}
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
                borderColor={getAvatarBorderColor(buddy.daysClean)}
              />
              
              {/* Info */}
              <View style={styles.compactBuddyInfo}>
                <View style={styles.compactNameRow}>
                  <Text style={styles.compactBuddyName}>{buddy.name}</Text>
                  <View style={styles.compactWantsBadge}>
                    <Text style={styles.compactWantsText}>wants to connect!</Text>
                  </View>
                </View>
                <View style={styles.compactBuddyStatsRow}>
                  <Text style={styles.compactBuddyStats}>
                    Day {buddy.daysClean}
                  </Text>
                  <View style={[
                    styles.buddyProductTag,
                    {
                      backgroundColor: getProductTagColor(buddy.product).backgroundColor,
                      borderColor: getProductTagColor(buddy.product).borderColor,
                    }
                  ]}>
                    <Text style={[
                      styles.buddyProductText,
                      { color: getProductTagColor(buddy.product).textColor }
                    ]}>
                      {buddy.product}
                    </Text>
                  </View>
                </View>
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
                  <Ionicons name="checkmark-circle" size={28} color="rgba(255, 255, 255, 0.7)" />
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
              borderColor={getAvatarBorderColor(buddy.daysClean)}
            />
            
            {/* Info */}
            <View style={styles.connectedBuddyInfo}>
              <View style={styles.connectedNameRow}>
                <Text style={styles.connectedBuddyName}>{buddy.name}</Text>
              </View>
              <View style={styles.connectedBuddyStatsRow}>
                <Text style={styles.connectedBuddyStats}>
                  Day {buddy.daysClean}
                </Text>
                <View style={[
                  styles.buddyProductTag,
                  {
                    backgroundColor: getProductTagColor(buddy.product).backgroundColor,
                    borderColor: getProductTagColor(buddy.product).borderColor,
                  }
                ]}>
                  <Text style={[
                    styles.buddyProductText,
                    { color: getProductTagColor(buddy.product).textColor }
                  ]}>
                    {buddy.product}
                  </Text>
                </View>
              </View>
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
              <Ionicons name="chatbubble" size={22} color="rgba(255, 255, 255, 0.6)" />
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
          colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
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
                borderColor={getAvatarBorderColor(buddy.daysClean)}
              />
            </View>
            
            <View style={styles.buddyInfo}>
              <View style={styles.buddyNameRow}>
                <Text style={styles.buddyName}>{buddy.name}</Text>
                {buddy.connectionStatus === 'pending-sent' && (
                  <View style={styles.pendingBadge}>
                    <Ionicons name="time-outline" size={14} color="rgba(255, 255, 255, 0.5)" />
                    <Text style={styles.pendingText}>Pending</Text>
                  </View>
                )}
                {!isConnected && buddy.connectionStatus !== 'pending-sent' && (
                  <View style={styles.matchScoreBadge}>
                    <Text style={styles.matchScoreText}>{buddy.matchScore}% match</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.buddyStatsRow}>
                <Text style={styles.buddyStats}>
                  Day {buddy.daysClean}
                </Text>
                <View style={[
                  styles.buddyProductTag,
                  {
                    backgroundColor: getProductTagColor(buddy.product).backgroundColor,
                    borderColor: getProductTagColor(buddy.product).borderColor,
                  }
                ]}>
                  <Text style={[
                    styles.buddyProductText,
                    { color: getProductTagColor(buddy.product).textColor }
                  ]}>
                    {buddy.product}
                  </Text>
                </View>
              </View>
              
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
                  color="rgba(255, 255, 255, 0.5)" 
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
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
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
  
  const getProductTagColor = (product: string) => {
    switch(product?.toLowerCase()) {
      case 'vaping':
        return {
          backgroundColor: 'rgba(147, 197, 253, 0.15)', // Soft blue
          borderColor: 'rgba(147, 197, 253, 0.3)',
          textColor: 'rgba(147, 197, 253, 0.9)'
        };
      case 'cigarettes':
        return {
          backgroundColor: 'rgba(251, 191, 36, 0.15)', // Soft amber
          borderColor: 'rgba(251, 191, 36, 0.3)',
          textColor: 'rgba(251, 191, 36, 0.9)'
        };
      case 'pouches':
        return {
          backgroundColor: 'rgba(134, 239, 172, 0.15)', // Soft green
          borderColor: 'rgba(134, 239, 172, 0.3)',
          textColor: 'rgba(134, 239, 172, 0.9)'
        };
      case 'chewing tobacco':
        return {
          backgroundColor: 'rgba(192, 132, 252, 0.15)', // Soft purple
          borderColor: 'rgba(192, 132, 252, 0.3)',
          textColor: 'rgba(192, 132, 252, 0.9)'
        };
      default:
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          textColor: '#9CA3AF'
        };
    }
  };

  const renderPost = (post: CommunityPost) => {
    const anim = getPostAnimation(post.id);
    
    // Use helper function for consistent colors
    const accentColor = getAvatarBorderColor(post.authorDaysClean);
    
    return (
    <Animated.View
      style={[
        {
          opacity: anim.opacity,
        }
      ]}
    >
    <TouchableOpacity 
      style={styles.postCard}
      activeOpacity={0.95}
      onPress={() => {
        handleCommentPress(post);
      }}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
        style={[styles.postCardGradient, {
          borderColor: 'rgba(255, 255, 255, 0.06)',
          borderWidth: 1,
        }]}
      >
        <View style={styles.postHeader}>
          <TouchableOpacity
            onPress={() => handleProfileNavigation(post.authorId, post.author, post.authorDaysClean)}
            activeOpacity={0.7}
          >
            <DicebearAvatar 
              userId={post.authorId}
              size="small"
              daysClean={post.authorDaysClean}
              style={post.authorId === user?.id && user?.selectedAvatar?.style ? user.selectedAvatar.style as keyof typeof AVATAR_STYLES : 'warrior'}
              badgeIcon={getBadgeForDaysClean(post.authorDaysClean)?.icon}
              badgeColor={getBadgeForDaysClean(post.authorDaysClean)?.color}
              borderColor={accentColor}
            />
          </TouchableOpacity>
          <View style={styles.postAuthorInfo}>
            <View style={styles.postAuthorRow}>
              <Text style={styles.postAuthor}>{post.author}</Text>
            </View>
            <View style={styles.postMetaRow}>
              {post.authorProduct && (
                <View style={[
                  styles.postProductTag,
                  {
                    backgroundColor: getProductTagColor(post.authorProduct).backgroundColor,
                    borderColor: getProductTagColor(post.authorProduct).borderColor,
                  }
                ]}>
                  <Text style={[
                    styles.postProductText,
                    { color: getProductTagColor(post.authorProduct).textColor }
                  ]}>
                    {post.authorProduct}
                  </Text>
                </View>
              )}
              <Text style={styles.postMeta}>
                Day {post.authorDaysClean} • {getTimeAgo(post.timestamp)}
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.postContent}>{renderCommentContent(post.content)}</Text>
        
        {/* Image Gallery */}
        {post.images && post.images.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.postImagesContainer}
            contentContainerStyle={styles.postImagesContent}
          >
            {post.images.map((imageUri, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.postImageWrapper,
                  post.images!.length === 1 && styles.singleImageWrapper
                ]}
                activeOpacity={0.9}
                onPress={(event) => {
                  event.stopPropagation();
                  // TODO: Open image in full screen viewer
                }}
              >
                <Image 
                  source={{ uri: imageUri }} 
                  style={[
                    styles.postImage,
                    post.images!.length === 1 && styles.singleImage
                  ]}
                  resizeMode={post.images!.length === 1 ? "cover" : "cover"}
                />
                {post.images!.length > 1 && (
                  <View style={styles.imageCounter}>
                    <Text style={styles.imageCounterText}>{index + 1}/{post.images!.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.postAction}
            onPress={(event) => {
              event.stopPropagation();
              handleLikePost(post.id, event);
            }}
          >
            <Animated.View
              style={{
                transform: [{ scale: anim.likeScale }]
              }}
            >
              <Ionicons 
                name={post.isLiked ? "heart" : "heart-outline"} 
                size={20} 
                color={post.isLiked ? accentColor : 'rgba(255, 255, 255, 0.5)'} 
              />
            </Animated.View>
            <Text style={[styles.postActionText, post.isLiked && { color: accentColor }]}>
              {post.likes}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.postAction}
            onPress={(event) => {
              event.stopPropagation();
              handleCommentPress(post);
            }}
          >
            <Ionicons 
              name="chatbubbles-outline" 
              size={18} 
              color='rgba(255, 255, 255, 0.5)' 
            />
            <Text style={styles.postActionText}>{post.comments.length}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.postAction}
            onPress={async (event) => {
              event.stopPropagation();
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await handleSharePost(post);
            }}
          >
            <Ionicons 
              name="share-outline" 
              size={18} 
              color='rgba(255, 255, 255, 0.5)' 
            />
          </TouchableOpacity>
          
          {/* Show delete option only for user's own posts */}
          {post.authorId === user?.id && (
            <TouchableOpacity 
              style={[styles.postAction, styles.postActionDelete]}
              onPress={(event) => {
                event.stopPropagation();
                handleDeletePost(post.id);
              }}
            >
              <Ionicons name="trash-outline" size={18} color="rgba(239, 68, 68, 0.7)" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
    </Animated.View>
    );
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Clean Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Community</Text>
            <Text style={styles.headerSubtitle}>
              {activeTab === 'feed' ? 'Share your journey' : 'Your support network'}
            </Text>
          </View>
          
          {/* Refined Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
              onPress={() => setActiveTab('feed')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="chatbubbles-outline" 
                size={18} 
                color={activeTab === 'feed' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)'} 
              />
              <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>
                Feed
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'buddies' && styles.activeTab]}
              onPress={() => setActiveTab('buddies')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="people-outline" 
                size={18} 
                color={activeTab === 'buddies' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)'} 
              />
              <Text style={[styles.tabText, activeTab === 'buddies' && styles.activeTabText]}>
                Buddies
              </Text>
              {buddyMatches.filter(b => b.connectionStatus === 'pending-received').length > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {buddyMatches.filter(b => b.connectionStatus === 'pending-received').length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
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
              <>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Loading posts...</Text>
                  </View>
                ) : (
                  <FlatList
                    ref={feedListRef}
                    data={communityPosts}
                    renderItem={({ item }) => renderPost(item)}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                getItemLayout={(data, index) => ({
                  length: 150, // Approximate height of each post
                  offset: 150 * index,
                  index,
                })}
                onScrollToIndexFailed={(info) => {
                  // Fallback for when scrollToIndex fails
                  const wait = new Promise(resolve => setTimeout(resolve, 500));
                  wait.then(() => {
                    feedListRef.current?.scrollToIndex({ index: info.index, animated: true });
                  });
                }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="rgba(255, 255, 255, 0.3)"
                  />
                }
              />
                )}
              </>
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
                    tintColor="rgba(255, 255, 255, 0.3)"
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
                          <Ionicons name="notifications" size={18} color="rgba(255, 255, 255, 0.7)" />
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
                          <Ionicons name="person-add-outline" size={18} color="rgba(255, 255, 255, 0.6)" />
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
                        colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                        style={styles.emptyStateGradient}
                      >

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
                              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
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
                            <Ionicons name="person-add-outline" size={18} color="rgba(255, 255, 255, 0.6)" />
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
                      <Ionicons name="sparkles" size={18} color="rgba(255, 255, 255, 0.6)" />
                      <Text style={styles.findMoreBuddiesText}>Find More Buddies</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </Animated.View>
          
          {/* Floating Action Button for Creating Posts */}
          {activeTab === 'feed' && (
            <Animated.View
              style={[
                styles.fab,
                {
                  transform: [{ scale: fabScale }],
                  opacity: fabScale,
                },
              ]}
            >
              <TouchableOpacity 
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowCreatePostModal(true);
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.08)']}
                  style={styles.fabGradient}
                >
                  <Ionicons name="add" size={26} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {/* Floating Hearts Animation */}
          {floatingHearts.map((heart) => (
            <React.Fragment key={heart.id}>
              <FloatingHeart
                x={heart.x}
                y={heart.y}
                color={heart.color}
                onComplete={() => {
                  setFloatingHearts(prev => prev.filter(h => h.id !== heart.id));
                }}
              />
              <HeartParticles
                x={heart.x}
                y={heart.y}
                onComplete={() => {
                  // Particles complete independently
                }}
              />
            </React.Fragment>
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
                    setSelectedImages([]);
                  }}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Create Post</Text>
                  <TouchableOpacity 
                    onPress={handleCreatePost}
                    disabled={!postContent.trim() && selectedImages.length === 0}
                  >
                    <Text style={[
                      styles.modalPostText,
                      (!postContent.trim() && selectedImages.length === 0) && styles.modalPostTextDisabled
                    ]}>Post</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Post Content Input */}
                <View style={styles.postInputContainer}>
                  <TextInput
                    style={styles.postInput}
                    placeholder="Share your thoughts with the community..."
                    placeholderTextColor={COLORS.textMuted}
                    value={postContent}
                    onChangeText={setPostContent}
                    multiline
                    maxLength={500}
                    autoFocus={selectedImages.length === 0}
                  />
                  
                  {/* Image Preview Section */}
                  {selectedImages.length > 0 && (
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      style={styles.imagePreviewContainer}
                      contentContainerStyle={styles.imagePreviewContent}
                    >
                      {selectedImages.map((imageUri, index) => (
                        <View key={index} style={styles.imagePreviewItem}>
                          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                          <TouchableOpacity 
                            style={styles.removeImageButton}
                            onPress={() => removeImage(index)}
                          >
                            <LinearGradient
                              colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.9)']}
                              style={styles.removeImageGradient}
                            >
                              <Ionicons name="close" size={16} color="#FFFFFF" />
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>
                      ))}
                      {selectedImages.length < 4 && (
                        <TouchableOpacity 
                          style={styles.addMoreImagesButton}
                          onPress={pickImage}
                          disabled={imagePickerLoading}
                        >
                          <Ionicons name="add" size={24} color={COLORS.textMuted} />
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  )}
                  
                  {/* Bottom Actions */}
                  <View style={styles.postInputActions}>
                    <View style={styles.postInputActionsLeft}>
                      {/* Image Upload Button */}
                      <TouchableOpacity 
                        style={styles.mediaButton}
                        onPress={pickImage}
                        disabled={imagePickerLoading || selectedImages.length >= 4}
                      >
                        {imagePickerLoading ? (
                          <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                          <>
                            <Ionicons 
                              name="image-outline" 
                              size={20} 
                              color={selectedImages.length >= 4 ? COLORS.textMuted : COLORS.primary} 
                            />
                            {selectedImages.length > 0 && (
                              <View style={styles.imageCountBadge}>
                                <Text style={styles.imageCountText}>{selectedImages.length}</Text>
                              </View>
                            )}
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.charCount}>{postContent.length}/500</Text>
                  </View>
                </View>
                
                {/* Post Guidelines - More compact */}
                <View style={styles.guidelinesContainer}>
                  <Text style={styles.guidelinesText}>
                    Be supportive • Share authentically • Stay recovery-focused
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </KeyboardAvoidingView>
          </View>
        </Modal>
        
        {/* Comment Modal */}
        <Modal
          key={selectedPost?.id || 'comment-modal'}
          visible={showCommentModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowCommentModal(false);
            setCommentText('');
            setSelectedPost(null);
          }}
        >
          <View style={styles.commentModalOverlay}>
            <TouchableOpacity 
              style={styles.commentModalBackdrop} 
              activeOpacity={1}
              onPress={() => {
                setShowCommentModal(false);
                setCommentText('');
                setSelectedPost(null);
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
                        setSelectedPost(null);
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
                            style={selectedPost.authorId === user?.id && user?.selectedAvatar?.style ? user.selectedAvatar.style as keyof typeof AVATAR_STYLES : 'warrior'}
                            badgeIcon={getBadgeForDaysClean(selectedPost.authorDaysClean)?.icon}
                            badgeColor={getBadgeForDaysClean(selectedPost.authorDaysClean)?.color}
                          />
                        </TouchableOpacity>
                        <View style={styles.originalPostInfo}>
                          <Text style={styles.originalPostAuthor}>{selectedPost.author}</Text>
                          <View style={styles.originalPostMetaRow}>
                            {selectedPost.authorProduct && (
                              <View style={styles.originalPostProductTag}>
                                <Text style={styles.originalPostProductText}>{selectedPost.authorProduct}</Text>
                              </View>
                            )}
                            <Text style={styles.originalPostMeta}>
                              Day {selectedPost.authorDaysClean} • {getTimeAgo(selectedPost.timestamp)}
                            </Text>
                          </View>
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
                                  style={comment.authorId === user?.id && user?.selectedAvatar?.style ? user.selectedAvatar.style as keyof typeof AVATAR_STYLES : 'warrior'}
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
                                <View style={styles.commentActions}>
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
                                  
                                  {/* Show delete option only for user's own comments */}
                                  {comment.authorId === user?.id && (
                                    <TouchableOpacity 
                                      style={styles.commentDeleteButton}
                                      onPress={() => handleDeleteComment(selectedPost.id, comment.id)}
                                    >
                                      <Ionicons 
                                        name="trash-outline" 
                                        size={14} 
                                        color="#EF4444" 
                                      />
                                    </TouchableOpacity>
                                  )}
                                </View>
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
                        style={user?.selectedAvatar?.style as keyof typeof AVATAR_STYLES || 'warrior'}
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
                    colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                    style={styles.buddySuccessIconBg}
                  >
                    <Ionicons name="people" size={48} color="rgba(255, 255, 255, 0.8)" />
                  </LinearGradient>
                </View>
                
                {/* Avatars */}
                <View style={styles.buddySuccessAvatars}>
                  <View style={styles.buddySuccessAvatarWrapper}>
                    <DicebearAvatar
                      userId={user?.id || 'default-user'}
                      size="large"
                      daysClean={stats?.daysClean || 0}
                      style={user?.selectedAvatar?.style as keyof typeof AVATAR_STYLES || 'warrior'}
                      badgeIcon={getBadgeForDaysClean(stats?.daysClean || 0)?.icon}
                      badgeColor={getBadgeForDaysClean(stats?.daysClean || 0)?.color}
                    />
                  </View>
                  
                  <View style={styles.buddySuccessHeart}>
                    <Ionicons name="heart" size={24} color="rgba(255, 255, 255, 0.8)" />
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
                <Text style={styles.buddySuccessTitle}>Buddy Connected</Text>
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
                      colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
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
                  Supporting each other doubles your chances of success!
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tabWrapper: {
    paddingHorizontal: SPACING.lg,
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    gap: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  activeTabText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  tabBadge: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(192, 132, 252, 0.9)',
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 12,
  },
  
  // Filter Strip
  filterStrip: {
    height: 48,
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  filterStripContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterChipIcon: {
    fontSize: 14,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
  filterChipTextActive: {
    color: COLORS.text,
    fontWeight: '500',
  },
  
  // Post Styles
  postCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  postGradient: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
  },
  postCardGradient: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
  daysCleanBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  daysCleanText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postCategoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  postCategoryText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  postProductTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  postProductText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '400',
    textTransform: 'lowercase',
  },
  postMeta: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  postContent: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
    marginBottom: 12,
    fontWeight: '300',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 4,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '300',
  },
  postActionDelete: {
    marginLeft: 'auto',
  },
  
  // Post Image Styles
  postImagesContainer: {
    marginBottom: SPACING.md,
    marginHorizontal: -SPACING.md,
  },
  postImagesContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  postImageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  singleImageWrapper: {
    width: SCREEN_WIDTH - (SPACING.lg * 2) - 32,
    maxHeight: 400,
  },
  postImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  singleImage: {
    width: '100%',
    height: 250,
    maxHeight: 400,
  },
  imageCounter: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  sectionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 16,
    fontWeight: '300',
  },
  buddyCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buddyRequestCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buddyCardGradient: {
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
  },
  buddyRequestCardGradient: {
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(192, 132, 252, 0.2)',
    borderRadius: 16,
    backgroundColor: 'rgba(192, 132, 252, 0.03)',
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
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  wantsToBeBuddyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  wantsToBeBuddyText: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.text,
  },
  matchScoreBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  matchScoreText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  buddyStats: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  buddyStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  buddyProductTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  buddyProductText: {
    fontSize: 11,
    fontWeight: '400',
    textTransform: 'lowercase',
  },
  buddyBio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '300',
  },
  buddySupportStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  supportStyleText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '400',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    color: '#9CA3AF',
    fontWeight: '400',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pendingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
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
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
  },
  primaryActionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
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
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inviteButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.text,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  requestBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  requestSectionHeader: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  requestSectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestSectionTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  requestSectionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: SPACING.md,
    opacity: 0.8,
  },
  suggestedSectionHeader: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  suggestedSectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestedSectionTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  matchCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  matchCountText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  },
  emptyBuddiesState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.xl,
  },
  completeEmptyState: {
    marginVertical: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  emptyStateGradient: {
    padding: 32,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontWeight: '300',
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
    fontWeight: '500',
  },
  secondaryEmptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  secondaryEmptyButtonText: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyStateInviteText: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  createPostModalGradient: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalCancelText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '300',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  modalPostText: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(192, 132, 252, 0.9)',
  },
  modalPostTextDisabled: {
    color: COLORS.textMuted,
  },

  postInputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  postInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    minHeight: 150,
    textAlignVertical: 'top',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    fontWeight: '300',
  },
  charCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  guidelinesContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '300',
  },
  
  // Image upload styles
  imagePreviewContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  imagePreviewContent: {
    gap: SPACING.sm,
  },
  imagePreviewItem: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  removeImageGradient: {
    padding: 4,
  },
  addMoreImagesButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postInputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  postInputActionsLeft: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    position: 'relative',
  },
  imageCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  imageCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
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
    backgroundColor: '#0F172A',
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  commentModalTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  originalPostMeta: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  originalPostContent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  originalPostProductTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  originalPostProductText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  originalPostMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  authorBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
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
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  commentDeleteButton: {
    padding: 4,
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
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    fontWeight: '500',
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
    fontWeight: '500',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickResponseText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '400',
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
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  findMoreBuddiesText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '400',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  searchPlaceholder: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
    flex: 1,
    fontWeight: '300',
  },
  buddyContent: {
    flex: 1,
  },
  
  // Mention styles
  mentionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  mentionSuggestionsContainer: {
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: SPACING.sm,
  },
  mentionSuggestionsContent: {
    paddingHorizontal: SPACING.md,
  },
  mentionSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: SPACING.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  mentionSuggestionText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '400',
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
    fontSize: 22,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  buddySuccessMessage: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '300',
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
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  buddySuccessSecondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  buddySuccessSecondaryText: {
    fontSize: 14,
    fontWeight: '400',
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
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  compactWantsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  compactWantsText: {
    fontSize: 10,
    fontWeight: '400',
    color: COLORS.text,
  },
  compactBuddyStats: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  compactBuddyStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },

  connectedBuddyStats: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  connectedBuddyStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  connectedBuddyBio: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  quickMessageButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  compactRequestBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  compactRequestBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.text,
  },
  compactRequestDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 24,
  },
});

export default CommunityScreen; 