import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { COLORS, SPACING } from '../../constants/theme';
import DicebearAvatar from '../../components/common/DicebearAvatar';
import BuddyService, { BuddyProfile } from '../../services/buddyService';
import { getBadgeForDaysClean } from '../../utils/badges';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

const BuddyMatchingScreen: React.FC = () => {
  const navigation = useNavigation();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const swipeAnim = useRef(new Animated.ValueXY()).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const matchFeedbackAnim = useRef(new Animated.Value(0)).current;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<BuddyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
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
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    const toValue = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    
    // Add haptic feedback
    Vibration.vibrate(10);
    
    // Show match feedback animation for right swipe
    if (direction === 'right') {
      Animated.sequence([
        Animated.timing(matchFeedbackAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(matchFeedbackAnim, {
          toValue: 0,
          duration: 200,
          delay: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
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
      // Silently handle match and move to next card
      setTimeout(() => {
        nextCard();
      }, 100);
    });
  };
  
  const nextCard = () => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1);
      swipeAnim.setValue({ x: 0, y: 0 });
      opacityAnim.setValue(1);
      scaleAnim.setValue(0.9);
      setIsTransitioning(false);
    } else {
      // Seamlessly navigate back when done
      navigation.goBack();
    }
  };
  
  const renderSupportStyleIcon = (style: string) => {
    switch (style) {
      case 'motivator':
        return <Ionicons name="rocket" size={14} color="rgba(255, 255, 255, 0.5)" />;
      case 'listener':
        return <Ionicons name="ear" size={14} color="rgba(255, 255, 255, 0.5)" />;
      case 'tough-love':
        return <Ionicons name="barbell" size={14} color="rgba(255, 255, 255, 0.5)" />;
      case 'analytical':
        return <Ionicons name="analytics" size={14} color="rgba(255, 255, 255, 0.5)" />;
      case 'spiritual':
        return <Ionicons name="heart" size={14} color="rgba(255, 255, 255, 0.5)" />;
      case 'practical':
        return <Ionicons name="build" size={14} color="rgba(255, 255, 255, 0.5)" />;
      case 'humorous':
        return <Ionicons name="happy" size={14} color="rgba(255, 255, 255, 0.5)" />;
      case 'mentor':
        return <Ionicons name="school" size={14} color="rgba(255, 255, 255, 0.5)" />;
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
              <View style={styles.cardGradient}>
                {/* Avatar and Basic Info */}
                <View style={styles.profileSection}>
                  <View style={styles.avatarContainer}>
                    <DicebearAvatar
                      userId={currentMatch.id}
                      size="medium"
                      daysClean={currentMatch.daysClean}
                      style="warrior"
                      badge={getBadgeForDaysClean(currentMatch.daysClean)?.icon ? undefined : getBadgeForDaysClean(currentMatch.daysClean)?.emoji}
                      badgeIcon={getBadgeForDaysClean(currentMatch.daysClean)?.icon}
                      badgeColor={getBadgeForDaysClean(currentMatch.daysClean)?.color}
                    />
                  </View>
                  <Text style={styles.name}>{currentMatch.name}</Text>
                  <Text style={styles.lastActive}>{getTimeAgo(currentMatch.lastActive)}</Text>
                  
                  <View style={styles.statsRow}>
                    <Text style={styles.daysClean}>Day {currentMatch.daysClean}</Text>
                    <View style={[
                      styles.productTag,
                      {
                        backgroundColor: getProductTagColor(currentMatch.product).backgroundColor,
                        borderColor: getProductTagColor(currentMatch.product).borderColor,
                      }
                    ]}>
                      <Text style={[
                        styles.productTagText,
                        { color: getProductTagColor(currentMatch.product).textColor }
                      ]}>
                        {currentMatch.product}
                      </Text>
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
              </View>
            </Animated.View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => handleSwipe('left')}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={30} color="rgba(255, 255, 255, 0.4)" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => handleSwipe('right')}
              activeOpacity={0.8}
            >
              <View style={styles.connectButtonGradient}>
                <Ionicons name="heart" size={30} color="rgba(134, 239, 172, 0.9)" />
              </View>
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
          
          {/* Match Feedback */}
          <Animated.View
            style={[
              styles.matchFeedback,
              {
                opacity: matchFeedbackAnim,
                transform: [{
                  scale: matchFeedbackAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1.05],
                  }),
                }],
              },
            ]}
            pointerEvents="none"
          >
            <View style={styles.matchFeedbackContent}>
              <Ionicons name="checkmark-circle" size={40} color="rgba(134, 239, 172, 0.9)" />
              <Text style={styles.matchFeedbackText}>Match Request Sent!</Text>
            </View>
          </Animated.View>
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
    fontWeight: '500',
    color: COLORS.text,
    letterSpacing: 0.3,
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
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
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  lastActive: {
    fontSize: 12,
    fontWeight: '300',
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: SPACING.sm,
  },
  daysClean: {
    fontSize: 13,
    fontWeight: '300',
    color: COLORS.textMuted,
  },
  productTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  productTagText: {
    fontSize: 12,
    fontWeight: '400',
    textTransform: 'lowercase',
  },
  bioSection: {
    marginTop: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
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
    fontWeight: '300',
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
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.15)',
  },
  supportStyleText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(192, 132, 252, 0.7)',
  },
  likeIndicator: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(134, 239, 172, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(134, 239, 172, 0.3)',
    transform: [{ rotate: '-20deg' }],
  },
  likeText: {
    color: 'rgba(134, 239, 172, 0.9)',
    fontWeight: '500',
    fontSize: 20,
    letterSpacing: 1,
  },
  nopeIndicator: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    transform: [{ rotate: '20deg' }],
  },
  nopeText: {
    color: 'rgba(239, 68, 68, 0.7)',
    fontWeight: '500',
    fontSize: 20,
    letterSpacing: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 60,
    paddingVertical: SPACING.xl,
  },
  skipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    transform: [{ scale: 0.95 }],
  },

  connectButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: 'rgba(134, 239, 172, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  connectButtonGradient: {
    flex: 1,
    backgroundColor: 'rgba(134, 239, 172, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(134, 239, 172, 0.2)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressDotActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '300',
    color: COLORS.textMuted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '300',
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
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '300',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  matchFeedback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchFeedbackContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: 'rgba(134, 239, 172, 0.3)',
    marginHorizontal: 40,
  },
  matchFeedbackText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(134, 239, 172, 0.9)',
    marginTop: 8,
    letterSpacing: 0.5,
  },
});

export default BuddyMatchingScreen; 