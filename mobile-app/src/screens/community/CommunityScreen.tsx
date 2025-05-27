import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import HeartAnimation from '../../components/common/HeartAnimation';

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

interface Comment {
  id: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

const CommunityScreen: React.FC = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<{[postId: string]: Comment[]}>({
    '1': [
      {
        id: 'c1',
        username: 'Sarah_Strong',
        avatar: '💪',
        content: 'You got this! The first week is the hardest but it gets so much better!',
        timestamp: '2 hours ago',
        likes: 5
      },
      {
        id: 'c2',
        username: 'Mike_Recovery',
        avatar: '🌟',
        content: 'Day 3 was my turning point. Keep pushing through!',
        timestamp: '1 hour ago',
        likes: 3
      }
    ],
    '2': [
      {
        id: 'c3',
        username: 'Alex_Warrior',
        avatar: '⚡',
        content: 'Amazing progress! Your lungs must feel incredible.',
        timestamp: '30 minutes ago',
        likes: 2
      }
    ]
  });

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

  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [heartAnimations, setHeartAnimations] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const getCategoryColor = (category: CommunityPost['category']) => {
    switch (category) {
      case 'milestone': return '#10B981';
      case 'support': return '#8B5CF6';
      case 'health': return '#06B6D4';
      case 'inspiration': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  // Handle post interactions
  const handleLikePost = (postId: string) => {
    const newLikedPosts = new Set(likedPosts);
    if (likedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
      // Trigger heart animation
      setHeartAnimations(prev => ({ ...prev, [postId]: true }));
      setTimeout(() => {
        setHeartAnimations(prev => ({ ...prev, [postId]: false }));
      }, 1000);
    }
    setLikedPosts(newLikedPosts);
  };

  const handleCommentPost = (post: CommunityPost) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

  const handlePostPress = (post: CommunityPost) => {
    setSelectedPost(post);
    setShowPostDetail(true);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedPost) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      username: `User${Math.floor(Math.random() * 1000)}`,
      avatar: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
      content: newComment.trim(),
      timestamp: 'just now',
      likes: 0
    };
    
    setComments(prev => ({
      ...prev,
      [selectedPost.id]: [...(prev[selectedPost.id] || []), comment]
    }));
    
    setNewComment('');
  };

  const closePostDetail = () => {
    setShowPostDetail(false);
    setSelectedPost(null);
    setNewComment('');
  };

  // Community Post Component
  const renderCommunityPost = (post: CommunityPost) => {
    const isLiked = likedPosts.has(post.id);
    const showHeartAnimation = heartAnimations[post.id];
    
    return (
    <TouchableOpacity key={post.id} style={styles.postCard} onPress={() => handlePostPress(post)}>
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
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleLikePost(post.id)}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={16} 
              color={isLiked ? "#EF4444" : "#EF4444"} 
            />
            <Text style={[styles.actionText, isLiked && { color: '#EF4444' }]}>
              {post.likes + (isLiked ? 1 : 0)}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleCommentPost(post)}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#06B6D4" />
            <Text style={styles.actionText}>{post.comments}</Text>
          </TouchableOpacity>
        </View>

        {/* Heart Animation */}
        <HeartAnimation 
          show={showHeartAnimation} 
          onComplete={() => setHeartAnimations(prev => ({ ...prev, [post.id]: false }))}
        />
      </LinearGradient>
    </TouchableOpacity>
    );
  };

  // Content Renderers
  const renderCommunity = () => (
    <View style={styles.contentContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {communityPosts.map(renderCommunityPost)}
      </ScrollView>
    </View>
  );

  // Post Detail Modal with Comments
  const renderPostDetailModal = () => (
    <Modal
      visible={showPostDetail}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowPostDetail(false)}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#000000', '#0A0F1C', '#1A1A2E', '#16213E']}
          style={styles.modalBackground}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setShowPostDetail(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Post & Comments</Text>
              <View style={{ width: 24 }} />
            </View>

            {selectedPost && (
              <ScrollView style={styles.modalContent}>
                {/* Original Post */}
                <View style={styles.originalPost}>
                  <View style={styles.postHeader}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>{selectedPost.username[0]}</Text>
                    </View>
                    <View style={styles.postInfo}>
                      <Text style={styles.username}>{selectedPost.username}</Text>
                      <Text style={styles.timestamp}>{selectedPost.timestamp}</Text>
                    </View>
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(selectedPost.category) }]}>
                      <Text style={styles.categoryText}>{selectedPost.milestone}</Text>
                    </View>
                  </View>
                  <Text style={styles.postContent}>{selectedPost.content}</Text>
                </View>

                {/* Comments Section */}
                <View style={styles.commentsSection}>
                  <Text style={styles.commentsTitle}>Comments ({comments[selectedPost.id]?.length || 0})</Text>
                  {comments[selectedPost.id]?.map((comment) => (
                    <View key={comment.id} style={styles.commentItem}>
                      <View style={styles.commentHeader}>
                        <View style={styles.commentAvatar}>
                          <Text style={styles.commentAvatarText}>{comment.avatar}</Text>
                        </View>
                        <View style={styles.commentInfo}>
                          <Text style={styles.commentUsername}>{comment.username}</Text>
                          <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
                        </View>
                      </View>
                      <Text style={styles.commentText}>{comment.content}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            {/* Comment Input */}
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a supportive comment..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={handleAddComment}
                blurOnSubmit={false}
              />
              <TouchableOpacity 
                style={[styles.sendButton, { opacity: newComment.trim() ? 1 : 0.5 }]}
                onPress={handleAddComment}
                disabled={!newComment.trim()}
              >
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </Modal>
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
          <Text style={styles.title}>Recovery Community</Text>
          <Text style={styles.subtitle}>
            You&apos;re part of a supportive recovery community
          </Text>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {renderCommunity()}
        </Animated.View>
        </SafeAreaView>

        {/* Post Detail Modal */}
        {renderPostDetailModal()}
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  originalPost: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
  },
  commentsSection: {
    marginTop: SPACING.lg,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: SPACING.md,
  },
  commentCard: {
    marginBottom: SPACING.md,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  commentInfo: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  commentTimestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  commentContent: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 100,
    marginRight: SPACING.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 18,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  categoryBadge: {
    padding: SPACING.xs,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  commentItem: {
    marginBottom: SPACING.md,
  },
  commentText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  closeButton: {
    padding: SPACING.md,
  },
});

export default CommunityScreen; 