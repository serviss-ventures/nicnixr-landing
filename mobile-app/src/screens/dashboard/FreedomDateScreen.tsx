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
  const { completedOnboarding } = useSelector((state: RootState) => state.onboarding);
  
  const [pulseAnim] = useState(new Animated.Value(1));
  const [fadeInAnim] = useState(new Animated.Value(0));
  const [timeUnits, setTimeUnits] = useState<TimeUnit[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Calculate time since quit date
  const quitDate = user?.quitDate ? new Date(user.quitDate) : new Date();
  const timeDiff = currentTime.getTime() - quitDate.getTime();
  const daysClean = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hoursClean = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutesClean = Math.floor(timeDiff / (1000 * 60));
  const secondsClean = Math.floor(timeDiff / 1000);
  
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

  // Achievement calculations
  const achievements: Achievement[] = [
    {
      id: 'money',
      title: 'Money Saved',
      description: 'Financial freedom earned',
      type: 'financial',
      value: Math.round(daysClean * (user?.dailyCost || 15)),
      unit: '$',
      icon: 'cash-outline',
      gradient: ['#10B981', '#059669'],
    },
    {
      id: 'cigarettes',
      title: 'Cigarettes Avoided',
      description: 'Death sticks refused',
      type: 'health',
      value: daysClean * (user?.packagesPerDay || 20),
      unit: '',
      icon: 'close-circle-outline',
      gradient: ['#EF4444', '#DC2626'],
    },
    {
      id: 'time',
      title: 'Life Regained',
      description: 'Hours of life recovered',
      type: 'personal',
      value: Math.round(daysClean * 0.5), // ~30 min per day
      unit: 'hrs',
      icon: 'hourglass-outline',
      gradient: ['#8B5CF6', '#7C3AED'],
    },
    {
      id: 'breaths',
      title: 'Clean Breaths',
      description: 'Pure oxygen cycles',
      type: 'health',
      value: daysClean * 20000, // ~20k breaths per day
      unit: '',
      icon: 'leaf-outline',
      gradient: ['#06B6D4', '#0891B2'],
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
        value: Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365)),
        label: 'Years',
        icon: 'calendar-outline',
        color: '#EC4899'
      },
      {
        value: Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30)),
        label: 'Months',
        icon: 'moon-outline',
        color: '#8B5CF6'
      },
      {
        value: daysClean % 30,
        label: 'Days',
        icon: 'sunny-outline',
        color: '#F59E0B'
      },
      {
        value: Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        label: 'Hours',
        icon: 'time-outline',
        color: '#3B82F6'
      },
      {
        value: Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)),
        label: 'Minutes',
        icon: 'stopwatch-outline',
        color: '#10B981'
      },
      {
        value: Math.floor((timeDiff % (1000 * 60)) / 1000),
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
  }, []);

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
    return Math.min((daysClean / nextMilestone.daysRequired) * 100, 100);
  };

  const formatLargeNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
                      {unit.value.toString().padStart(2, '0')}
                    </Text>
                    <Text style={styles.counterLabel}>{unit.label}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </Animated.View>
        </Animated.View>

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
                  style={[styles.progressFill, { width: `${getMilestoneProgress()}%` }]}
                />
              </View>
              <Text style={styles.progressText}>
                {getMilestoneProgress().toFixed(1)}% Complete
              </Text>
            </View>
            
            <Text style={styles.celebrationMessage}>
              {getNextMilestone().celebrationMessage}
            </Text>
          </LinearGradient>
        </View>

        {/* Achievement Grid */}
        <View style={styles.achievementSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy-outline" size={24} color="#EC4899" />
            <Text style={styles.sectionTitle}>Your Achievements</Text>
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
                    {achievement.unit}{formatLargeNumber(achievement.value)}
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

        {/* Inspiration Quote */}
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.2)', 'rgba(139, 92, 246, 0.2)']}
          style={styles.inspirationCard}
        >
          <Ionicons name="heart" size={32} color="#EC4899" />
          <Text style={styles.inspirationText}>
            "Every moment of freedom is a victory. Every breath is a choice. Every day is proof of your incredible strength."
          </Text>
          <Text style={styles.inspirationAuthor}>— Your Journey of Liberation</Text>
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
  inspirationText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
    marginVertical: SPACING.lg,
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
});

export default FreedomDateScreen; 