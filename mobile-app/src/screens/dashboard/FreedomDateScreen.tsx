import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, G, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface TimeUnit {
  value: number;
  label: string;
  icon: string;
  color: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  daysRequired: number;
  achieved: boolean;
  icon: string;
  color: string;
  celebrationMessage: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'health' | 'financial' | 'social' | 'personal';
  value: number;
  unit: string;
  icon: string;
  gradient: string[];
}

const FreedomDateScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { isComplete: completedOnboarding } = useSelector((state: RootState) => state.onboarding);
  const { stats } = useSelector((state: RootState) => state.progress);
  
  const [pulseAnim] = useState(new Animated.Value(1));
  const [fadeInAnim] = useState(new Animated.Value(0));
  const [scrollIndicatorAnim] = useState(new Animated.Value(0));
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [timeUnits, setTimeUnits] = useState<TimeUnit[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollViewRef = React.useRef<ScrollView>(null);
  
  // Get user data with safe fallbacks
  const userDailyCost = user?.dailyCost || 15;
  const userPackagesPerDay = user?.packagesPerDay || 20;
  const userQuitDate = user?.quitDate;
  
  // Calculate time since quit date
  const quitDate = userQuitDate ? new Date(userQuitDate) : new Date();
  const timeDiff = Math.max(0, currentTime.getTime() - quitDate.getTime());
  const daysClean = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
  const hoursClean = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60)));
  const minutesClean = Math.max(0, Math.floor(timeDiff / (1000 * 60)));
  const secondsClean = Math.max(0, Math.floor(timeDiff / 1000));
  
  // Milestone definitions
  const milestones: Milestone[] = [
    {
      id: '1hour',
      title: 'First Hour of Freedom',
      description: 'Nicotine starts leaving your system',
      daysRequired: 0.042, // 1 hour
      achieved: hoursClean >= 1,
      icon: 'time-outline',
      color: '#10B981',
      celebrationMessage: 'Your body begins healing immediately!'
    },
    {
      id: '24hours',
      title: 'Full Day Champion',
      description: 'Risk of heart attack begins to decrease',
      daysRequired: 1,
      achieved: daysClean >= 1,
      icon: 'heart-outline',
      color: '#3B82F6',
      celebrationMessage: 'Your heart thanks you already!'
    },
    {
      id: '72hours',
      title: 'Nicotine-Free Zone',
      description: '100% nicotine eliminated from body',
      daysRequired: 3,
      achieved: daysClean >= 3,
      icon: 'checkmark-circle',
      color: '#8B5CF6',
      celebrationMessage: 'Your body is completely nicotine-free!'
    },
    {
      id: '1week',
      title: 'Neural Network Warrior',
      description: 'New neural pathways forming rapidly',
      daysRequired: 7,
      achieved: daysClean >= 7,
      icon: 'pulse-outline',
      color: '#06B6D4',
      celebrationMessage: 'Your brain is rewiring for freedom!'
    },
    {
      id: '1month',
      title: 'Circulation Champion',
      description: 'Blood circulation significantly improved',
      daysRequired: 30,
      achieved: daysClean >= 30,
      icon: 'fitness-outline',
      color: '#F59E0B',
      celebrationMessage: 'Your circulation is supercharged!'
    },
    {
      id: '3months',
      title: 'Lung Recovery Master',
      description: 'Lung function increased by up to 30%',
      daysRequired: 90,
      achieved: daysClean >= 90,
      icon: 'leaf-outline',
      color: '#EF4444',
      celebrationMessage: 'Breathing freely like never before!'
    },
    {
      id: '1year',
      title: 'Freedom Legend',
      description: 'Risk of coronary disease cut in half',
      daysRequired: 365,
      achieved: daysClean >= 365,
      icon: 'trophy-outline',
      color: '#EC4899',
      celebrationMessage: 'You are a true freedom legend!'
    },
  ];

  // Achievement calculations with safe fallbacks
  const achievements: Achievement[] = [
    {
      id: 'money',
      title: 'Money Saved',
      description: 'Back in your pocket',
      type: 'financial',
      value: Math.round(daysClean * userDailyCost),
      unit: '$',
      icon: 'cash-outline',
      gradient: ['#10B981', '#059669'],
    },
    {
      id: 'cigarettes',
      title: 'Nicotine Avoided',
      description: 'Poison rejected',
      type: 'health',
      value: daysClean * userPackagesPerDay,
      unit: '',
      icon: 'close-circle-outline',
      gradient: ['#EF4444', '#DC2626'],
    },
    {
      id: 'time',
      title: 'Time Reclaimed',
      description: 'Hours for what matters',
      type: 'personal',
      value: Math.round(daysClean * 0.5), // ~30 min per day
      unit: ' hrs',
      icon: 'time-outline',
      gradient: ['#8B5CF6', '#7C3AED'],
    },
    {
      id: 'breaths',
      title: 'Clean Breaths',
      description: 'Pure oxygen enjoyed',
      type: 'health',
      value: daysClean * 20000, // ~20k breaths per day
      unit: '',
      icon: 'leaf-outline',
      gradient: ['#06B6D4', '#0891B2'],
    },
    {
      id: 'heartbeats',
      title: 'Stronger Heartbeats',
      description: 'Healthier circulation',
      type: 'health',
      value: daysClean * 100000, // ~100k beats per day
      unit: '',
      icon: 'heart-outline',
      gradient: ['#EC4899', '#DB2777'],
    },
    {
      id: 'healing',
      title: 'Body Healing',
      description: 'Cells regenerating',
      type: 'health',
      value: Math.min(100, Math.round((daysClean / 90) * 100)) || 0, // % to 90 days
      unit: '%',
      icon: 'fitness-outline',
      gradient: ['#F59E0B', '#D97706'],
    },
    {
      id: 'confidence',
      title: 'Confidence Level',
      description: 'Self-belief growing',
      type: 'personal',
      value: Math.min(100, Math.round((daysClean / 30) * 100)) || 0, // % to 30 days
      unit: '%',
      icon: 'star-outline',
      gradient: ['#14B8A6', '#0D9488'],
    },
    {
      id: 'freedom',
      title: 'Freedom Score',
      description: 'Liberation achieved',
      type: 'personal',
      value: Math.min(100, Math.round((daysClean / 7) * 100)) || 0, // % to 7 days
      unit: '%',
      icon: 'rocket-outline',
      gradient: ['#A855F7', '#9333EA'],
    },
  ];

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Calculate real-time units
    const newTimeUnits: TimeUnit[] = [
      {
        value: Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365))),
        label: 'Years',
        icon: 'calendar-outline',
        color: '#EC4899'
      },
      {
        value: Math.max(0, Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30))),
        label: 'Months',
        icon: 'moon-outline',
        color: '#8B5CF6'
      },
      {
        value: Math.max(0, daysClean % 30),
        label: 'Days',
        icon: 'sunny-outline',
        color: '#F59E0B'
      },
      {
        value: Math.max(0, Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
        label: 'Hours',
        icon: 'time-outline',
        color: '#3B82F6'
      },
      {
        value: Math.max(0, Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))),
        label: 'Minutes',
        icon: 'stopwatch-outline',
        color: '#10B981'
      },
      {
        value: Math.max(0, Math.floor((timeDiff % (1000 * 60)) / 1000)),
        label: 'Seconds',
        icon: 'flash-outline',
        color: '#06B6D4'
      },
    ];

    setTimeUnits(newTimeUnits);

    return () => clearInterval(timer);
  }, [currentTime, timeDiff, daysClean]);

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle initial pulse animation (only once)
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Scroll indicator animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scrollIndicatorAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scrollIndicatorAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    // Hide scroll indicator after user starts scrolling
    if (scrollY > 50 && showScrollIndicator) {
      setShowScrollIndicator(false);
    }
  };

  const getQuitDateString = () => {
    return quitDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextMilestone = () => {
    return milestones.find(m => !m.achieved) || milestones[milestones.length - 1];
  };

  const getMilestoneProgress = () => {
    const nextMilestone = getNextMilestone();
    if (nextMilestone.achieved) return 100;
    const progress = (daysClean / nextMilestone.daysRequired) * 100;
    return Math.min(progress || 0, 100);
  };

  const formatLargeNumber = (num: number): string => {
    const safeNum = Number(num) || 0;
    if (isNaN(safeNum)) return '0';
    if (safeNum >= 1000000) return `${(safeNum / 1000000).toFixed(1)}M`;
    if (safeNum >= 1000) return `${(safeNum / 1000).toFixed(1)}K`;
    return safeNum.toString();
  };

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container} 
      contentContainerStyle={styles.content} 
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#1E1B4B', '#312E81']}
        style={styles.gradientBackground}
      >
        {/* Hero Section */}
        <Animated.View style={[styles.heroSection, { opacity: fadeInAnim }]}>
          <View style={styles.heroHeader}>
            <LinearGradient
              colors={['rgba(236, 72, 153, 0.3)', 'rgba(139, 92, 246, 0.3)']}
              style={styles.heroIconContainer}
            >
              <Ionicons name="rocket-outline" size={48} color="#EC4899" />
            </LinearGradient>
            <Text style={styles.heroTitle}>Your Freedom Date</Text>
            <Text style={styles.heroSubtitle}>The Day You Chose Life</Text>
          </View>

          <View style={styles.quitDateContainer}>
            <Text style={styles.quitDateLabel}>Liberation Began:</Text>
            <Text style={styles.quitDate}>{getQuitDateString()}</Text>
          </View>

          {/* Real-time Counter */}
          <Animated.View style={[styles.counterContainer, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.counterGrid}>
              {timeUnits.map((unit, index) => (
                <View key={unit.label} style={styles.counterItem}>
                  <LinearGradient
                    colors={[`${unit.color}20`, `${unit.color}10`]}
                    style={styles.counterCard}
                  >
                    <Ionicons name={unit.icon as any} size={20} color={unit.color} />
                    <Text style={[styles.counterValue, { color: unit.color }]}>
                      {(unit.value || 0).toString().padStart(2, '0')}
                    </Text>
                    <Text style={styles.counterLabel}>{unit.label}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </Animated.View>
        </Animated.View>

        {/* Animated Scroll Indicator */}
        {showScrollIndicator && (
          <Animated.View 
            style={[
              styles.scrollIndicatorContainer,
              {
                opacity: scrollIndicatorAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
                transform: [
                  {
                    translateY: scrollIndicatorAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 8],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                scrollViewRef.current?.scrollTo({
                  y: height * 0.65,
                  animated: true,
                });
                setTimeout(() => setShowScrollIndicator(false), 500);
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(236, 72, 153, 0.9)', 'rgba(139, 92, 246, 0.9)']}
                style={styles.scrollIndicatorGradient}
              >
                <View style={styles.scrollIndicatorContent}>
                  <Text style={styles.scrollIndicatorText}>Discover Your Achievements</Text>
                  <View style={styles.scrollIndicatorArrows}>
                    <Ionicons name="chevron-down" size={20} color="#FFFFFF" style={{ opacity: 0.6 }} />
                    <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
                    <Ionicons name="chevron-down" size={20} color="#FFFFFF" style={{ opacity: 0.6 }} />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Next Milestone Progress */}
        <View style={styles.milestoneSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flag-outline" size={24} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Next Milestone</Text>
          </View>
          
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.15)', 'rgba(239, 68, 68, 0.15)']}
            style={styles.milestoneCard}
          >
            <View style={styles.milestoneHeader}>
              <Ionicons name={getNextMilestone().icon as any} size={32} color={getNextMilestone().color} />
              <View style={styles.milestoneInfo}>
                <Text style={styles.milestoneTitle}>{getNextMilestone().title}</Text>
                <Text style={styles.milestoneDescription}>{getNextMilestone().description}</Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[getNextMilestone().color, `${getNextMilestone().color}80`]}
                  style={[styles.progressFill, { width: `${getMilestoneProgress() || 0}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {(getMilestoneProgress() || 0).toFixed(1)}% Complete
              </Text>
            </View>
            
            <Text style={styles.celebrationMessage}>
              {getNextMilestone().celebrationMessage}
            </Text>
          </LinearGradient>
        </View>

        {/* Motivational Progress Section */}
        <View style={styles.motivationalSection}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
            style={styles.motivationalCard}
          >
            <View style={styles.motivationalHeader}>
              <Ionicons name="sparkles" size={32} color="#10B981" />
              <Text style={styles.motivationalTitle}>Your Journey Status</Text>
            </View>
            <Text style={styles.motivationalText}>
              {daysClean === 0 
                ? "Welcome to your freedom journey! Every second counts."
                : daysClean === 1 
                ? "24 hours of pure strength! You're already healing."
                : daysClean < 7 
                ? "Your body is thanking you with every breath. Keep going!"
                : daysClean < 30 
                ? "You're building unstoppable momentum. This is your power!"
                : daysClean < 90 
                ? "You're inspiring others with your incredible journey!"
                : "You're a living legend of freedom and strength!"
              }
            </Text>
            <View style={styles.streakContainer}>
              <Ionicons name="flame" size={24} color="#F59E0B" />
              <Text style={styles.streakText}>{daysClean} Day Streak</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Achievement Grid */}
        <View style={styles.achievementSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy-outline" size={24} color="#EC4899" />
            <Text style={styles.sectionTitle}>Your Victory Stats</Text>
          </View>
          
          <View style={styles.achievementGrid}>
            {achievements.map((achievement, index) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <LinearGradient
                  colors={[`${achievement.gradient[0]}20`, `${achievement.gradient[1]}20`]}
                  style={styles.achievementContent}
                >
                  <Ionicons name={achievement.icon as any} size={28} color={achievement.gradient[0]} />
                  <Text style={[styles.achievementValue, { color: achievement.gradient[0] }]}>
                    {formatLargeNumber(achievement.value || 0)}{achievement.unit}
                  </Text>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>
        </View>

        {/* Milestone Gallery */}
        <View style={styles.milestoneGallery}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medal-outline" size={24} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Milestone Gallery</Text>
          </View>
          
          {milestones.map((milestone, index) => (
            <View key={milestone.id} style={[
              styles.milestoneGalleryItem,
              { opacity: milestone.achieved ? 1 : 0.4 }
            ]}>
              <LinearGradient
                colors={milestone.achieved 
                  ? [`${milestone.color}30`, `${milestone.color}10`]
                  : ['rgba(100,100,100,0.2)', 'rgba(50,50,50,0.1)']
                }
                style={styles.milestoneGalleryCard}
              >
                <View style={styles.milestoneGalleryHeader}>
                  <View style={[
                    styles.milestoneGalleryIcon,
                    { backgroundColor: milestone.achieved ? milestone.color : '#666' }
                  ]}>
                    <Ionicons 
                      name={milestone.achieved ? 'checkmark' : milestone.icon as any} 
                      size={24} 
                      color="#FFFFFF" 
                    />
                  </View>
                  <View style={styles.milestoneGalleryInfo}>
                    <Text style={[
                      styles.milestoneGalleryTitle,
                      { color: milestone.achieved ? milestone.color : '#999' }
                    ]}>
                      {milestone.title}
                    </Text>
                    <Text style={styles.milestoneGalleryDesc}>
                      {milestone.description}
                    </Text>
                  </View>
                  {milestone.achieved && (
                    <View style={styles.achievedBadge}>
                      <Text style={styles.achievedText}>✓</Text>
                    </View>
                  )}
                </View>
                {milestone.achieved && (
                  <Text style={[styles.celebrationText, { color: milestone.color }]}>
                    {milestone.celebrationMessage}
                  </Text>
                )}
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Daily Inspiration */}
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.2)', 'rgba(139, 92, 246, 0.2)']}
          style={styles.inspirationCard}
        >
          <Ionicons name="heart" size={32} color="#EC4899" />
          <Text style={styles.dailyQuoteLabel}>Today's Power Thought</Text>
          <Text style={styles.inspirationText}>
            {daysClean % 7 === 0 
              ? "You're not just quitting nicotine. You're choosing life, love, and limitless possibilities."
              : daysClean % 7 === 1
              ? "Your strength today becomes your superpower tomorrow. Keep building your legend."
              : daysClean % 7 === 2
              ? "Every craving you defeat makes you exponentially stronger. You're unstoppable."
              : daysClean % 7 === 3
              ? "Your body is celebrating your courage with every heartbeat. Listen to its gratitude."
              : daysClean % 7 === 4
              ? "You're writing a story of triumph that will inspire generations. Keep writing."
              : daysClean % 7 === 5
              ? "The person you're becoming is worth every moment of this journey. Trust the process."
              : "Your freedom is the greatest gift you can give yourself and those who love you."
            }
          </Text>
          <Text style={styles.inspirationAuthor}>— Day {daysClean} Wisdom</Text>
        </LinearGradient>

        {/* Share Achievement Button */}
        <TouchableOpacity style={styles.shareButton}>
          <LinearGradient
            colors={['#EC4899', '#8B5CF6', '#06B6D4']}
            style={styles.shareButtonGradient}
          >
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Share Your Victory</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    minHeight: height,
  },
  gradientBackground: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  heroHeader: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  heroIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#EC4899',
    textAlign: 'center',
    fontWeight: '600',
  },
  quitDateContainer: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  quitDateLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  quitDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  counterContainer: {
    width: '100%',
  },
  counterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  counterItem: {
    width: '30%',
    marginBottom: SPACING.md,
  },
  counterCard: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  counterValue: {
    fontSize: 24,
    fontWeight: '900',
    marginVertical: SPACING.xs,
  },
  counterLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  milestoneSection: {
    marginVertical: SPACING['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  milestoneCard: {
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  milestoneInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  milestoneDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  celebrationMessage: {
    fontSize: 14,
    color: '#F59E0B',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  achievementSection: {
    marginVertical: SPACING['2xl'],
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    marginBottom: SPACING.lg,
  },
  achievementContent: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  achievementValue: {
    fontSize: 28,
    fontWeight: '900',
    marginVertical: SPACING.sm,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  milestoneGallery: {
    marginVertical: SPACING['2xl'],
  },
  milestoneGalleryItem: {
    marginBottom: SPACING.md,
  },
  milestoneGalleryCard: {
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  milestoneGalleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  milestoneGalleryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneGalleryInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  milestoneGalleryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  milestoneGalleryDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  achievedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  celebrationText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  inspirationCard: {
    alignItems: 'center',
    padding: SPACING['2xl'],
    borderRadius: SPACING.lg,
    marginVertical: SPACING['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  dailyQuoteLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inspirationText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 26,
    fontStyle: 'italic',
    marginVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  inspirationAuthor: {
    fontSize: 14,
    color: '#EC4899',
    fontWeight: '600',
  },
  shareButton: {
    marginVertical: SPACING['2xl'],
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
  },
  scrollIndicatorContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    zIndex: 10,
  },
  scrollIndicatorGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING['2xl'],
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollIndicatorContent: {
    alignItems: 'center',
  },
  scrollIndicatorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
  },
  scrollIndicatorArrows: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: -4,
  },
  motivationalSection: {
    marginVertical: SPACING['2xl'],
  },
  motivationalCard: {
    padding: SPACING['2xl'],
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  motivationalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  motivationalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  motivationalText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 30,
    alignSelf: 'center',
  },
  streakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginLeft: SPACING.sm,
  },
});

export default FreedomDateScreen; 