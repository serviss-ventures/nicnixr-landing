import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { COLORS, SPACING } from '../../constants/theme';
import Avatar from '../../components/common/Avatar';
import BuddyService, { BuddyProfile } from '../../services/buddyService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

const BuddyMatchingScreen: React.FC = () => {
  const navigation = useNavigation();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const swipeAnim = useRef(new Animated.ValueXY()).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<BuddyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load potential matches
  useEffect(() => {
    const loadMatches = async () => {
      if (currentUser) {
        try {
          const potentialMatches = await BuddyService.getPotentialMatches(currentUser);
          setMatches(potentialMatches);
        } catch (error) {
          console.error('Error loading matches:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadMatches();
  }, [currentUser]);
  
  const currentMatch = matches[currentIndex];
  
  // Animate card entrance
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 20,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [currentIndex, scaleAnim]);
  
  const rotate = rotateAnim.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
  });
  
  const likeOpacity = swipeAnim.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  const nopeOpacity = swipeAnim.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  const handleSwipe = (direction: 'left' | 'right') => {
    const toValue = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    
    // Add haptic feedback
    Vibration.vibrate(10);
    
    Animated.parallel([
      Animated.timing(swipeAnim.x, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (direction === 'right') {
        // Handle match
        Alert.alert(
          'Match Request Sent! 🎉',
          `We've sent ${currentMatch.name} a buddy request. They'll be notified and can accept to start chatting!`,
          [
            {
              text: 'Continue',
              onPress: () => nextCard(),
            },
          ]
        );
      } else {
        nextCard();
      }
    });
  };
  
  const nextCard = () => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1);
      swipeAnim.setValue({ x: 0, y: 0 });
      opacityAnim.setValue(1);
      scaleAnim.setValue(0.9);
    } else {
      Alert.alert(
        'All Caught Up!',
        "You've seen all potential matches for now. Check back later for more!",
        [
          {
            text: 'Back to Community',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };
  
  const renderSupportStyleIcon = (style: string) => {
    switch (style) {
      case 'motivator':
        return <Ionicons name="rocket" size={14} color="#10B981" />;
      case 'listener':
        return <Ionicons name="ear" size={14} color="#10B981" />;
      case 'tough-love':
        return <Ionicons name="barbell" size={14} color="#10B981" />;
      case 'analytical':
        return <Ionicons name="analytics" size={14} color="#10B981" />;
      case 'spiritual':
        return <Ionicons name="heart" size={14} color="#10B981" />;
      case 'practical':
        return <Ionicons name="build" size={14} color="#10B981" />;
      case 'humorous':
        return <Ionicons name="happy" size={14} color="#10B981" />;
      case 'mentor':
        return <Ionicons name="school" size={14} color="#10B981" />;
      default:
        return null;
    }
  };
  
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Online now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#0A0F1C', '#0F172A']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Finding your perfect buddy matches...</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }
  
  if (!currentMatch) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#0A0F1C', '#0F172A']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Find Your Buddy</Text>
              <View style={{ width: 24 }} />
            </View>
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No more matches right now!</Text>
              <Text style={styles.emptySubtext}>Check back later for more potential buddies</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Find Your Buddy</Text>
            <View style={{ width: 24 }} />
          </View>
          
          {/* Match Card */}
          <View style={styles.cardContainer}>
            <Animated.View
              style={[
                styles.card,
                {
                  opacity: opacityAnim,
                  transform: [
                    { translateX: swipeAnim.x },
                    { translateY: swipeAnim.y },
                    { rotate },
                    { scale: scaleAnim },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.05)']}
                style={styles.cardGradient}
              >
                {/* Avatar and Basic Info */}
                <View style={styles.profileSection}>
                  <View style={styles.avatarContainer}>
                    <Avatar 
                      emoji={currentMatch.avatar}
                      size="medium"
                      rarity={currentMatch.daysClean > 30 ? 'epic' : currentMatch.daysClean > 7 ? 'rare' : 'common'}
                      badge={currentMatch.daysClean > 7 ? '🔥' : undefined}
                      isOnline={currentMatch.lastActive === 'Online now'}
                    />
                  </View>
                  <Text style={styles.name}>{currentMatch.name}</Text>
                  <Text style={styles.lastActive}>{getTimeAgo(currentMatch.lastActive)}</Text>
                  
                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>Day {currentMatch.daysClean}</Text>
                      <Text style={styles.statLabel}>Clean</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{currentMatch.product}</Text>
                      <Text style={styles.statLabel}>Quit</Text>
                    </View>
                  </View>
                </View>
                
                {/* Bio */}
                <View style={styles.bioSection}>
                  <Text style={styles.bio}>
                    "{currentMatch.bio}"
                  </Text>
                </View>
                
                {/* Support Styles */}
                <View style={styles.supportStyleSection}>
                  <View style={styles.supportStylesContainer}>
                    {currentMatch.supportStyles.slice(0, 3).map((style, index) => (
                      <View key={index} style={styles.supportStyleBadge}>
                        {renderSupportStyleIcon(style)}
                        <Text style={styles.supportStyleText}>
                          {style.charAt(0).toUpperCase() + style.slice(1).replace('-', ' ')}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                {/* Swipe Indicators */}
                <Animated.View
                  style={[
                    styles.likeIndicator,
                    { opacity: likeOpacity },
                  ]}
                >
                  <Text style={styles.likeText}>CONNECT</Text>
                </Animated.View>
                
                <Animated.View
                  style={[
                    styles.nopeIndicator,
                    { opacity: nopeOpacity },
                  ]}
                >
                  <Text style={styles.nopeText}>SKIP</Text>
                </Animated.View>
              </LinearGradient>
            </Animated.View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => handleSwipe('left')}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={30} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.superLikeButton}
              onPress={() => {
                Vibration.vibrate(20);
                Alert.alert('Super Like! ⭐', 'This feature is coming soon!');
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="star" size={24} color="#F59E0B" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => handleSwipe('right')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                style={styles.connectButtonGradient}
              >
                <Ionicons name="heart" size={30} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              {matches.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index === currentIndex && styles.progressDotActive,
                    index < currentIndex && styles.progressDotCompleted,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.progressText}>
              {currentIndex + 1} of {matches.length} potential buddies
            </Text>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: '80%',
    maxHeight: 600,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 24,
    justifyContent: 'space-between',
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  lastActive: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    maxWidth: 200,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bioSection: {
    marginTop: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    marginHorizontal: 0,
    minHeight: 120,
    flex: 1,
    justifyContent: 'center',
  },
  bio: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  supportStyleSection: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  supportStylesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  supportStyleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  supportStyleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  likeIndicator: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    transform: [{ rotate: '-20deg' }],
  },
  likeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 24,
  },
  nopeIndicator: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    transform: [{ rotate: '20deg' }],
  },
  nopeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    paddingVertical: SPACING.xl,
  },
  skipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6B7280',
  },
  superLikeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#6B7280',
  },
  connectButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
  },
  connectButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
  },
  progressDotActive: {
    backgroundColor: '#8B5CF6',
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
  },
  progressText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default BuddyMatchingScreen; 