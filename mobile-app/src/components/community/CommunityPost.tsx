import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { formatTimeAgo } from '../../utils/dateHelpers';
import DicebearAvatar from '../common/DicebearAvatar';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface Comment {
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

export interface CommunityPostData {
  id: string;
  authorId: string;
  author: string;
  authorDaysClean: number;
  authorProduct?: string;
  content: string;
  images?: string[];
  timestamp: Date;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
}

interface CommunityPostProps {
  post: CommunityPostData;
  onLike: (postId: string) => void;
  onComment: (post: CommunityPostData) => void;
  onShare: (post: CommunityPostData) => void;
  onProfilePress: (userId: string, userName: string, userDaysClean: number) => void;
  onImagePress?: (images: string[], index: number) => void;
  currentUserId?: string;
}

/**
 * CommunityPost Component
 * 
 * A clean, focused component that displays a single community post.
 * Follows Single Responsibility Principle - only handles post display and interactions.
 */
export const CommunityPost: React.FC<CommunityPostProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onProfilePress,
  onImagePress,
  currentUserId,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const likeScale = useRef(new Animated.Value(1)).current;

  // Entrance animation
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      from: 0.95,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLikePress = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate like button
    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    onLike(post.id);
  };

  const getDaysCleanColor = (days: number): string => {
    if (days >= 365) return COLORS.success;
    if (days >= 90) return COLORS.primary;
    if (days >= 30) return COLORS.warning;
    return COLORS.textSecondary;
  };

  const getProductEmoji = (product?: string): string => {
    switch (product?.toLowerCase()) {
      case 'vaping':
      case 'vape':
        return '💨';
      case 'cigarettes':
        return '🚬';
      case 'pouches':
      case 'nicotine_pouches':
        return '🟦';
      case 'chewing tobacco':
      case 'chew_dip':
        return '🟫';
      default:
        return '';
    }
  };

  const renderImages = () => {
    if (!post.images || post.images.length === 0) return null;

    const imageCount = post.images.length;
    const imageSize = imageCount === 1 ? SCREEN_WIDTH - 32 : (SCREEN_WIDTH - 48) / 2;

    return (
      <View style={styles.imagesContainer}>
        {post.images.slice(0, 4).map((image, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onImagePress?.(post.images!, index)}
            style={[
              styles.imageWrapper,
              {
                width: imageCount === 1 ? '100%' : '49%',
                height: imageSize,
              },
            ]}
          >
            <Image source={{ uri: image }} style={styles.image} />
            {imageCount > 4 && index === 3 && (
              <View style={styles.moreImagesOverlay}>
                <Text style={styles.moreImagesText}>+{imageCount - 4}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      {/* Author Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => onProfilePress(post.authorId, post.author, post.authorDaysClean)}
      >
        <DicebearAvatar
          size={40}
          onPress={() => onProfilePress(post.authorId, post.author, post.authorDaysClean)}
        />
        <View style={styles.headerInfo}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{post.author}</Text>
            {post.authorProduct && (
              <Text style={styles.productEmoji}>{getProductEmoji(post.authorProduct)}</Text>
            )}
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.daysClean, { color: getDaysCleanColor(post.authorDaysClean) }]}>
              {post.authorDaysClean} days
            </Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.timestamp}>{formatTimeAgo(post.timestamp)}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Post Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Images */}
      {renderImages()}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLikePress}>
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <Ionicons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={post.isLiked ? COLORS.destructive : COLORS.textSecondary}
            />
          </Animated.View>
          <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
            {post.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => onComment(post)}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionText}>{post.comments.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => onShare(post)}>
          <Ionicons name="share-outline" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerInfo: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: FONTS.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  productEmoji: {
    fontSize: FONTS.sm,
    marginLeft: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  daysClean: {
    fontSize: FONTS.xs,
    fontWeight: '500',
  },
  separator: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.xs,
  },
  timestamp: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
  },
  content: {
    fontSize: FONTS.sm,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  imageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  moreImagesOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    fontSize: FONTS.xl,
    fontWeight: '600',
    color: COLORS.text,
  },
  actions: {
    flexDirection: 'row',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  actionText: {
    marginLeft: SPACING.xs,
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  likedText: {
    color: COLORS.destructive,
  },
});

export default CommunityPost; 