import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions,
  TouchableOpacity,
  Animated
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { COLORS, SPACING, FONTS, SHADOWS } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, G, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';
import { LineChart, ProgressChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface HealthMetric {
  id: string;
  title: string;
  description: string;
  progress: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  details: string;
  category: 'primary' | 'wellness' | 'mental';
}

const ProgressScreen: React.FC = () => {
  const { stats, healthMetrics } = useSelector((state: RootState) => state.progress);
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Calculate overall recovery percentage based on days clean
  const calculateRecoveryPercentage = () => {
    const targetDays = 90;
    const percentage = Math.min((stats.daysClean / targetDays) * 100, 100);
    return Math.round(percentage);
  };

  const recoveryPercentage = calculateRecoveryPercentage();

  // Get health metrics based on user's nicotine product
  const getHealthMetrics = (): HealthMetric[] => {
    const nicotineCategory = user?.nicotineProduct?.category || 'other';
    
    // Common wellness metrics for all types
    const commonMetrics: HealthMetric[] = [
      {
        id: 'energy',
        title: 'Energy Levels',
        description: 'Natural energy returning',
        progress: Math.min(stats.daysClean * 7, 100),
        icon: 'flash-outline',
        color: '#F59E0B',
        details: 'No more nicotine crashes, steady energy throughout the day',
        category: 'wellness'
      },
      {
        id: 'sleep',
        title: 'Sleep Quality',
        description: 'Deeper, more restful sleep',
        progress: Math.min(stats.daysClean * 4, 100),
        icon: 'moon-outline',
        color: '#8B5CF6',
        details: 'REM sleep improves without nicotine disruption',
        category: 'wellness'
      },
      {
        id: 'heart',
        title: 'Heart Health',
        description: 'Blood pressure normalizing',
        progress: Math.min(stats.daysClean * 5, 100),
        icon: 'heart-outline',
        color: '#EF4444',
        details: 'Heart rate and blood pressure return to normal levels',
        category: 'primary'
      }
    ];

    // Category-specific primary metrics
    let primaryMetrics: HealthMetric[] = [];
    
    switch (nicotineCategory) {
      case 'cigarettes':
        primaryMetrics = [
          {
            id: 'lungs',
            title: 'Lung Capacity',
            description: 'Breathing easier every day',
            progress: Math.min(stats.daysClean * 3.5, 100),
            icon: 'fitness-outline',
            color: '#10B981',
            details: 'Lung function improves significantly within the first month of quitting smoking',
            category: 'primary'
          },
          {
            id: 'circulation',
            title: 'Blood Circulation',
            description: 'Better circulation throughout body',
            progress: Math.min(stats.daysClean * 6, 100),
            icon: 'water-outline',
            color: '#06B6D4',
            details: 'Circulation improves within 2-12 weeks of quitting smoking',
            category: 'primary'
          },
          {
            id: 'taste',
            title: 'Taste & Smell',
            description: 'Senses recovering rapidly',
            progress: Math.min(stats.daysClean * 10, 100),
            icon: 'restaurant-outline',
            color: '#EC4899',
            details: 'Nerve endings regrow, taste and smell return within days',
            category: 'wellness'
          }
        ];
        break;

      case 'vape':
        primaryMetrics = [
          {
            id: 'lungs',
            title: 'Lung Function',
            description: 'Respiratory system healing',
            progress: Math.min(stats.daysClean * 4, 100),
            icon: 'fitness-outline',
            color: '#10B981',
            details: 'Lung irritation decreases, breathing becomes easier',
            category: 'primary'
          },
          {
            id: 'oral',
            title: 'Oral Health',
            description: 'Mouth and throat healing',
            progress: Math.min(stats.daysClean * 8, 100),
            icon: 'medical-outline',
            color: '#06B6D4',
            details: 'Reduced inflammation in mouth and throat tissues',
            category: 'primary'
          }
        ];
        break;

      case 'pouches':
        primaryMetrics = [
          {
            id: 'oral',
            title: 'Oral Health',
            description: 'Gums and mouth healing',
            progress: Math.min(stats.daysClean * 8, 100),
            icon: 'medical-outline',
            color: '#10B981',
            details: 'Gum irritation reduces, oral tissues begin healing',
            category: 'primary'
          },
          {
            id: 'gums',
            title: 'Gum Health',
            description: 'Reduced inflammation',
            progress: Math.min(stats.daysClean * 6, 100),
            icon: 'fitness-outline',
            color: '#06B6D4',
            details: 'Chronic irritation from pouches decreases significantly',
            category: 'primary'
          }
        ];
        break;

      default:
        primaryMetrics = [
          {
            id: 'addiction',
            title: 'Addiction Recovery',
            description: 'Breaking nicotine dependence',
            progress: Math.min(stats.daysClean * 3, 100),
            icon: 'shield-checkmark-outline',
            color: '#10B981',
            details: 'Neural pathways healing, addiction weakening every day',
            category: 'primary'
          }
        ];
    }

    // Mental health metrics
    const mentalMetrics: HealthMetric[] = [
      {
        id: 'mental',
        title: 'Mental Clarity',
        description: 'Clearer thinking',
        progress: Math.min(stats.daysClean * 6, 100),
        icon: 'bulb-outline',
        color: '#A855F7',
        details: 'Mental fog lifting, cognitive function improving',
        category: 'mental'
      },
      {
        id: 'mood',
        title: 'Mood Stability',
        description: 'Emotional balance returning',
        progress: Math.min(stats.daysClean * 4.5, 100),
        icon: 'happy-outline',
        color: '#F97316',
        details: 'Natural mood regulation without nicotine dependence',
        category: 'mental'
      }
    ];

    return [...primaryMetrics, ...commonMetrics, ...mentalMetrics];
  };

  const metrics = getHealthMetrics();

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // Pulse animation for the main circle
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  // Enhanced Circular Progress Component
  const CircularProgress = ({ percentage }: { percentage: number }) => {
    const size = 280;
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id="progressGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="rgba(16, 185, 129, 0.8)" />
            <Stop offset="100%" stopColor="rgba(6, 182, 212, 1)" />
          </RadialGradient>
        </Defs>
        
        {/* Outer glow circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 8}
          stroke="rgba(16, 185, 129, 0.1)"
          strokeWidth={2}
          fill="none"
        />
        
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        
        {/* Center content */}
        <SvgText
          x={size / 2}
          y={size / 2 - 15}
          fontSize="64"
          fontWeight="700"
          textAnchor="middle"
          fill={COLORS.text}
        >
          {percentage}%
        </SvgText>
        <SvgText
          x={size / 2}
          y={size / 2 + 25}
          fontSize="18"
          fontWeight="500"
          textAnchor="middle"
          fill={COLORS.primary}
          letterSpacing="2"
        >
          RECOVERED
        </SvgText>
      </Svg>
    );
  };

  // Get milestone status
  const getMilestoneStatus = (targetDays: number) => {
    if (stats.daysClean >= targetDays) return 'completed';
    if (stats.daysClean >= targetDays * 0.8) return 'almost';
    return 'locked';
  };

  return (
    <LinearGradient
      colors={['#000000', '#0F172A', '#1E293B', '#0F172A']}
      style={styles.container}
    >
      <Animated.ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* Hero Header */}
        <Animated.View 
          style={[
            styles.heroSection,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)', 'transparent']}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Recovery Progress</Text>
              <Text style={styles.heroSubtitle}>
                {stats.daysClean} days on your journey to freedom
              </Text>
              
              {/* Main Progress Circle */}
              <Animated.View 
                style={[
                  styles.progressCircleContainer, 
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <View style={styles.circleGlowContainer}>
                  <CircularProgress percentage={recoveryPercentage} />
                </View>
              </Animated.View>

              {/* Progress Status Text */}
              <View style={styles.progressStatus}>
                <Text style={styles.progressStatusText}>
                  {recoveryPercentage < 25 ? "🌱 Early Recovery" :
                   recoveryPercentage < 50 ? "💪 Building Strength" :
                   recoveryPercentage < 75 ? "🚀 Major Progress" : "⭐ Full Recovery"}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Enhanced Quick Stats */}
        <Animated.View 
          style={[
            styles.statsContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
            style={styles.statsGradient}
          >
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.daysClean}</Text>
              <Text style={styles.statLabel}>Days Free</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#10B981' }]} />
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${Math.round(stats.moneySaved)}</Text>
              <Text style={styles.statLabel}>Saved</Text>
              <View style={[styles.statIndicator, { backgroundColor: '#F59E0B' }]} />
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.cigarettesAvoided}</Text>
              <Text style={styles.statLabel}>
                {user?.nicotineProduct?.category === 'cigarettes' ? 'Cigs' : 
                 user?.nicotineProduct?.category === 'pouches' ? 'Pouches' :
                 user?.nicotineProduct?.category === 'vape' ? 'Pods' : 'Units'} Avoided
              </Text>
              <View style={[styles.statIndicator, { backgroundColor: '#EF4444' }]} />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Health Recovery Metrics */}
        <View style={styles.metricsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Recovery</Text>
            <Text style={styles.sectionSubtitle}>
              Your body is healing every single day
            </Text>
          </View>

          {/* Primary Health Metrics */}
          <View style={styles.primaryMetrics}>
            {metrics.filter(m => m.category === 'primary').map((metric, index) => (
              <TouchableOpacity
                key={metric.id}
                style={styles.primaryMetricCard}
                onPress={() => setSelectedMetric(metric.id === selectedMetric ? null : metric.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[
                    `${metric.color}25`,
                    `${metric.color}15`,
                    `${metric.color}05`
                  ]}
                  style={styles.primaryMetricGradient}
                >
                  <View style={styles.metricHeader}>
                    <LinearGradient
                      colors={[`${metric.color}40`, `${metric.color}20`]}
                      style={styles.metricIconContainer}
                    >
                      <Ionicons name={metric.icon} size={28} color={metric.color} />
                    </LinearGradient>
                    
                    <View style={styles.metricInfo}>
                      <Text style={styles.metricTitle}>{metric.title}</Text>
                      <Text style={styles.metricDescription}>{metric.description}</Text>
                    </View>
                    
                    <View style={styles.metricProgressContainer}>
                      <Text style={[styles.metricPercentage, { color: metric.color }]}>
                        {Math.round(metric.progress)}%
                      </Text>
                    </View>
                  </View>

                  {/* Enhanced Progress Bar */}
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <LinearGradient
                        colors={[metric.color, `${metric.color}CC`, `${metric.color}88`]}
                        style={[
                          styles.progressBarFill, 
                          { width: `${Math.min(metric.progress, 100)}%` }
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                  </View>

                  {/* Expanded Details */}
                  {selectedMetric === metric.id && (
                    <Animated.View style={styles.metricDetails}>
                      <View style={styles.detailsDivider} />
                      <Text style={styles.metricDetailsText}>{metric.details}</Text>
                    </Animated.View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Secondary Metrics Grid */}
          <View style={styles.secondaryMetrics}>
            {metrics.filter(m => m.category !== 'primary').map((metric, index) => (
              <TouchableOpacity
                key={metric.id}
                style={styles.secondaryMetricCard}
                onPress={() => setSelectedMetric(metric.id === selectedMetric ? null : metric.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[
                    `${metric.color}20`,
                    `${metric.color}10`,
                    'transparent'
                  ]}
                  style={styles.secondaryMetricGradient}
                >
                  <LinearGradient
                    colors={[`${metric.color}30`, `${metric.color}15`]}
                    style={styles.secondaryMetricIcon}
                  >
                    <Ionicons name={metric.icon} size={24} color={metric.color} />
                  </LinearGradient>
                  
                  <Text style={styles.secondaryMetricTitle}>{metric.title}</Text>
                  <Text style={[styles.secondaryMetricProgress, { color: metric.color }]}>
                    {Math.round(metric.progress)}%
                  </Text>
                  
                  {/* Mini Progress Bar */}
                  <View style={styles.miniProgressBar}>
                    <LinearGradient
                      colors={[metric.color, `${metric.color}80`]}
                      style={[
                        styles.miniProgressFill,
                        { width: `${Math.min(metric.progress, 100)}%` }
                      ]}
                    />
                  </View>

                  {selectedMetric === metric.id && (
                    <View style={styles.secondaryDetails}>
                      <Text style={styles.secondaryDetailsText}>{metric.details}</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Achievement Milestones */}
        <View style={styles.milestonesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recovery Milestones</Text>
            <Text style={styles.sectionSubtitle}>
              Celebrating your journey to freedom
            </Text>
          </View>

          <View style={styles.milestonesGrid}>
            {[
              { days: 1, title: '24 Hours', subtitle: 'First Victory', icon: 'checkmark-circle', emoji: '🌟' },
              { days: 7, title: 'One Week', subtitle: 'Building Momentum', icon: 'medal', emoji: '💪' },
              { days: 30, title: 'One Month', subtitle: 'Major Milestone', icon: 'trophy', emoji: '🏆' },
              { days: 90, title: 'Full Recovery', subtitle: 'Neural Restoration', icon: 'star', emoji: '⭐' },
            ].map((milestone, index) => {
              const status = getMilestoneStatus(milestone.days);
              const isUnlocked = status === 'completed';
              const isAlmost = status === 'almost';
              
              return (
                <LinearGradient
                  key={index}
                  colors={
                    isUnlocked ? ['rgba(16, 185, 129, 0.25)', 'rgba(16, 185, 129, 0.1)'] :
                    isAlmost ? ['rgba(251, 191, 36, 0.25)', 'rgba(251, 191, 36, 0.1)'] :
                    ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
                  }
                  style={[
                    styles.milestoneCard,
                    isUnlocked && styles.milestoneUnlocked,
                    isAlmost && styles.milestoneAlmost
                  ]}
                >
                  <View style={styles.milestoneContent}>
                    <Text style={styles.milestoneEmoji}>{milestone.emoji}</Text>
                    <Text style={[
                      styles.milestoneTitle,
                      isUnlocked && styles.milestoneUnlockedText
                    ]}>
                      {milestone.title}
                    </Text>
                    <Text style={[
                      styles.milestoneSubtitle,
                      isUnlocked && styles.milestoneUnlockedSubtext
                    ]}>
                      {milestone.subtitle}
                    </Text>
                    <Text style={styles.milestoneDays}>{milestone.days} days</Text>
                    
                    {isAlmost && (
                      <Text style={styles.milestoneAlmostText}>
                        Almost there! 
                      </Text>
                    )}
                  </View>
                </LinearGradient>
              );
            })}
          </View>
        </View>

        {/* Motivational Quote */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)', 'transparent']}
          style={styles.motivationCard}
        >
          <View style={styles.motivationContent}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.3)', 'rgba(236, 72, 153, 0.3)']}
              style={styles.motivationIcon}
            >
              <Ionicons name="bulb-outline" size={32} color={COLORS.accent} />
            </LinearGradient>
            
            <View style={styles.motivationText}>
              <Text style={styles.quoteText}>
                "Every day without nicotine is a victory. You're {recoveryPercentage}% recovered and your brain is getting stronger every single day!"
              </Text>
              <Text style={styles.quoteAuthor}>— Your Recovery Journey</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </Animated.ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  
  // Hero Section
  heroSection: {
    marginTop: SPACING['2xl'],
    marginBottom: SPACING['2xl'],
  },
  heroGradient: {
    borderRadius: SPACING['2xl'],
    overflow: 'hidden',
  },
  heroContent: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
    paddingHorizontal: SPACING.lg,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
    lineHeight: 24,
  },
  progressCircleContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  circleGlowContainer: {
    padding: SPACING.lg,
    borderRadius: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  progressStatus: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },

  // Enhanced Stats
  statsContainer: {
    marginBottom: SPACING['2xl'],
  },
  statsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SPACING.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    ...SHADOWS.medium,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
  statIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: SPACING.md,
  },

  // Metrics Section
  metricsSection: {
    marginBottom: SPACING['2xl'],
  },
  sectionHeader: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // Primary Metrics (Large Cards)
  primaryMetrics: {
    marginBottom: SPACING.xl,
  },
  primaryMetricCard: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.xl,
    overflow: 'hidden',
  },
  primaryMetricGradient: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: SPACING.xl,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  metricIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  metricProgressContainer: {
    alignItems: 'flex-end',
  },
  metricPercentage: {
    fontSize: 24,
    fontWeight: '800',
  },
  progressBarContainer: {
    marginTop: SPACING.sm,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  metricDetails: {
    marginTop: SPACING.lg,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.md,
  },
  metricDetailsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Secondary Metrics (Grid Cards)
  secondaryMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  secondaryMetricCard: {
    width: '48%',
    marginBottom: SPACING.md,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  secondaryMetricGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.lg,
    minHeight: 140,
  },
  secondaryMetricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  secondaryMetricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  secondaryMetricProgress: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  miniProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  secondaryDetails: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryDetailsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Milestones
  milestonesSection: {
    marginBottom: SPACING['2xl'],
  },
  milestonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  milestoneCard: {
    width: '48%',
    borderRadius: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  milestoneUnlocked: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  milestoneAlmost: {
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  milestoneContent: {
    padding: SPACING.lg,
    alignItems: 'center',
    minHeight: 120,
  },
  milestoneEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
    textAlign: 'center',
  },
  milestoneUnlockedText: {
    color: COLORS.text,
  },
  milestoneSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  milestoneUnlockedSubtext: {
    color: COLORS.textSecondary,
  },
  milestoneDays: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  milestoneAlmostText: {
    fontSize: 10,
    color: '#FBB928',
    fontWeight: '600',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  // Motivation Card
  motivationCard: {
    borderRadius: SPACING.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  motivationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  motivationIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  motivationText: {
    flex: 1,
  },
  quoteText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  quoteAuthor: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  bottomPadding: {
    height: SPACING['3xl'],
  },
});

export default ProgressScreen; 