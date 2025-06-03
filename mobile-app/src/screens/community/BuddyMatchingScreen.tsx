import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

interface BuddyMatch {
  id: string;
  name: string;
  avatar: string;
  daysClean: number;
  product: string;
  timezone: string;
  bio: string;
  supportStyle: 'motivator' | 'listener' | 'tough-love' | 'analytical';
  matchScore: number;
  commonalities: string[];
}

const BuddyMatchingScreen: React.FC = () => {
  const navigation = useNavigation();
  const swipeAnim = useRef(new Animated.ValueXY()).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches] = useState<BuddyMatch[]>([
    {
      id: '1',
      name: 'Sarah M.',
      avatar: '👩‍🦰',
      daysClean: 12,
      product: 'vaping',
      timezone: 'PST',
      bio: 'Mom of 2, quit vaping for my kids. Love hiking and coffee chats! Looking for someone to check in with daily.',
      supportStyle: 'motivator',
      matchScore: 95,
      commonalities: ['Similar quit date', 'Same timezone', 'Parent motivation']
    },
    {
      id: '2',
      name: 'Mike R.',
      avatar: '🧔',
      daysClean: 8,
      product: 'pouches',
      timezone: 'EST',
      bio: 'Software dev, using coding to distract from cravings. Need accountability partner for late night struggles.',
      supportStyle: 'analytical',
      matchScore: 88,
      commonalities: ['Week 2 struggles', 'Night owl', 'Tech background']
    },
    {
      id: '3',
      name: 'Jessica K.',
      avatar: '👩',
      daysClean: 30,
      product: 'vaping',
      timezone: 'CST',
      bio: 'Just hit 30 days! Want to help others through their first month. Daily check-ins are my secret weapon.',
      supportStyle: 'listener',
      matchScore: 82,
      commonalities: ['Vaping background', 'Daily check-ins', 'Mentor mindset']
    }
  ]);
  
  const currentMatch = matches[currentIndex];
  
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
        return <Ionicons name="rocket" size={16} color="#10B981" />;
      case 'listener':
        return <Ionicons name="ear" size={16} color="#10B981" />;
      case 'tough-love':
        return <Ionicons name="barbell" size={16} color="#10B981" />;
      case 'analytical':
        return <Ionicons name="analytics" size={16} color="#10B981" />;
      default:
        return null;
    }
  };
  
  if (!currentMatch) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#0A0F1C', '#0F172A']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <Text style={styles.emptyText}>No more matches right now!</Text>
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
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.05)']}
                style={styles.cardGradient}
              >
                {/* Match Score Badge */}
                <View style={styles.matchBadge}>
                  <LinearGradient
                    colors={['#8B5CF6', '#EC4899']}
                    style={styles.matchBadgeGradient}
                  >
                    <Text style={styles.matchScore}>{currentMatch.matchScore}%</Text>
                    <Text style={styles.matchText}>match</Text>
                  </LinearGradient>
                </View>
                
                {/* Avatar and Basic Info */}
                <View style={styles.profileSection}>
                  <Text style={styles.avatar}>{currentMatch.avatar}</Text>
                  <Text style={styles.name}>{currentMatch.name}</Text>
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
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{currentMatch.timezone}</Text>
                      <Text style={styles.statLabel}>Zone</Text>
                    </View>
                  </View>
                </View>
                
                {/* Bio */}
                <View style={styles.bioSection}>
                  <Text style={styles.bio}>"{currentMatch.bio}"</Text>
                </View>
                
                {/* Support Style */}
                <View style={styles.supportStyleSection}>
                  <View style={styles.supportStyleBadge}>
                    {renderSupportStyleIcon(currentMatch.supportStyle)}
                    <Text style={styles.supportStyleText}>
                      {currentMatch.supportStyle.charAt(0).toUpperCase() + 
                       currentMatch.supportStyle.slice(1).replace('-', ' ')}
                    </Text>
                  </View>
                </View>
                
                {/* Commonalities */}
                <View style={styles.commonalitiesSection}>
                  <Text style={styles.sectionTitle}>What you have in common:</Text>
                  <View style={styles.commonalitiesList}>
                    {currentMatch.commonalities.map((item, index) => (
                      <View key={index} style={styles.commonalityItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        <Text style={styles.commonalityText}>{item}</Text>
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
            >
              <Ionicons name="close" size={30} color="#6B7280" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => handleSwipe('right')}
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
    height: '85%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 24,
  },
  matchBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  matchBadgeGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  matchScore: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  matchText: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  avatar: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: SPACING.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bioSection: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  bio: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  supportStyleSection: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  supportStyleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  supportStyleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  commonalitiesSection: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  commonalitiesList: {
    gap: SPACING.sm,
  },
  commonalityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  commonalityText: {
    fontSize: 14,
    color: COLORS.text,
  },
  likeIndicator: {
    position: 'absolute',
    top: 50,
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
    top: 50,
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
  progressText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default BuddyMatchingScreen; 