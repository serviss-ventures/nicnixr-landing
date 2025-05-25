import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';
import { 
  selectProgressStats, 
  selectHealthMetrics,
  selectRecoveryStrength,
  selectImprovementTrend,
  updateProgress,
} from '../../store/slices/progressSlice';

interface HealthMetric {
  id: string;
  title: string;
  description: string;
  progress: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  details: string;
  category: 'primary' | 'wellness' | 'mental';
  scientificBasis?: string;
  timeframe?: string;
}

const ProgressScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const stats = useSelector(selectProgressStats);
  const healthMetrics = useSelector(selectHealthMetrics);
  const recoveryStrength = useSelector(selectRecoveryStrength);
  const improvementTrend = useSelector(selectImprovementTrend);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Calculate overall recovery percentage based on science-based health metrics
  const calculateRecoveryPercentage = () => {
    if (!healthMetrics) return 0;
    
    const allMetrics = Object.values(healthMetrics);
    const averageProgress = allMetrics.reduce((sum, val) => sum + val, 0) / allMetrics.length;
    return Math.round(averageProgress);
  };

  const recoveryPercentage = calculateRecoveryPercentage();

  // Get science-based health metrics with proper categorization
  const getHealthMetrics = (): HealthMetric[] => {
    if (!healthMetrics || !user?.nicotineProduct) return [];
    
    const nicotineCategory = user.nicotineProduct.category;
    const metrics: HealthMetric[] = [];

    // Primary health metrics (product-specific)
    switch (nicotineCategory) {
      case 'cigarettes':
        metrics.push(
          {
            id: 'lungs',
            title: 'Lung Function',
            description: 'Breathing capacity improving',
            progress: healthMetrics.lungCapacity,
            icon: 'fitness-outline',
            color: '#10B981',
            details: 'Lung function improves significantly within 1-9 months of quitting smoking',
            category: 'primary',
            scientificBasis: 'Anthonisen et al. (2005) - NEJM',
            timeframe: '1-9 months for major improvement'
          },
          {
            id: 'circulation',
            title: 'Blood Circulation',
            description: 'Circulation normalizing',
            progress: healthMetrics.heartHealth,
            icon: 'water-outline',
            color: '#06B6D4',
            details: 'Circulation improves within 2-12 weeks as blood vessels heal',
            category: 'primary',
            scientificBasis: 'Surgeon General Report (2020)',
            timeframe: '2-12 weeks'
          },
          {
            id: 'taste',
            title: 'Taste & Smell',
            description: 'Senses recovering rapidly',
            progress: healthMetrics.tasteSmell,
            icon: 'restaurant-outline',
            color: '#EC4899',
            details: 'Nerve endings regrow, taste and smell return within 48 hours to 2 weeks',
            category: 'wellness',
            scientificBasis: 'Katotomichelakis et al. (2009)',
            timeframe: '48 hours - 2 weeks'
          }
        );
        break;

      case 'vape':
        metrics.push(
          {
            id: 'lungs',
            title: 'Respiratory Health',
            description: 'Lung irritation reducing',
            progress: healthMetrics.lungCapacity,
            icon: 'fitness-outline',
            color: '#10B981',
            details: 'Respiratory symptoms improve within 1-4 weeks of stopping vaping',
            category: 'primary',
            scientificBasis: 'Polosa et al. (2016) - Scientific Reports',
            timeframe: '1-4 weeks'
          },
          {
            id: 'oral',
            title: 'Oral Health',
            description: 'Mouth inflammation healing',
            progress: healthMetrics.oralHealth,
            icon: 'medical-outline',
            color: '#06B6D4',
            details: 'Oral inflammation and irritation reduce within 2 weeks',
            category: 'primary',
            scientificBasis: 'Sundar et al. (2016) - Oncotarget',
            timeframe: '2 weeks'
          }
        );
        break;

      case 'other':
        // Handle pouches and other products under 'other' category
        if (user.nicotineProduct.name?.toLowerCase().includes('pouch') || 
            user.nicotineProduct.name?.toLowerCase().includes('zyn')) {
          metrics.push(
            {
              id: 'oral',
              title: 'Gum Health',
              description: 'Gum tissue healing',
              progress: healthMetrics.oralHealth,
              icon: 'medical-outline',
              color: '#10B981',
              details: 'Gum irritation and lesions heal within 2-4 weeks',
              category: 'primary',
              scientificBasis: 'Lunell & Lunell (2005) - Nicotine Research',
              timeframe: '2-4 weeks'
            },
            {
              id: 'taste',
              title: 'Taste Recovery',
              description: 'Taste sensitivity returning',
              progress: healthMetrics.tasteSmell,
              icon: 'restaurant-outline',
              color: '#06B6D4',
              details: 'Taste improvement occurs within 3 weeks as oral tissues heal',
              category: 'primary',
              scientificBasis: 'Clinical observation studies',
              timeframe: '3 weeks'
            }
          );
        } else {
          metrics.push(
            {
              id: 'addiction',
              title: 'Addiction Recovery',
              description: 'Breaking nicotine dependence',
              progress: healthMetrics.addictionRecovery,
              icon: 'shield-checkmark-outline',
              color: '#10B981',
              details: 'Neural pathways heal and addiction weakens over 3 months',
              category: 'primary',
              scientificBasis: 'Cosgrove et al. (2014) - Neuropsychopharmacology',
              timeframe: '3 months'
            }
          );
        }
        break;

      case 'chewing':
        metrics.push(
          {
            id: 'oral',
            title: 'Oral Tissue Health',
            description: 'Mouth tissues healing',
            progress: healthMetrics.oralHealth,
            icon: 'medical-outline',
            color: '#10B981',
            details: 'Oral lesions and tissue damage begin healing within 3 weeks',
            category: 'primary',
            scientificBasis: 'Greer & Poulson (1983) - Oral Surgery',
            timeframe: '3-6 weeks'
          },
          {
            id: 'taste',
            title: 'Taste Restoration',
            description: 'Taste function improving',
            progress: healthMetrics.tasteSmell,
            icon: 'restaurant-outline',
            color: '#06B6D4',
            details: 'Taste restoration occurs within 1 month as oral health improves',
            category: 'primary',
            timeframe: '1 month'
          }
        );
        break;

      default:
        metrics.push(
          {
            id: 'addiction',
            title: 'Addiction Recovery',
            description: 'Breaking nicotine dependence',
            progress: healthMetrics.addictionRecovery,
            icon: 'shield-checkmark-outline',
            color: '#10B981',
            details: 'Neural pathways heal and addiction weakens over 3 months',
            category: 'primary',
            scientificBasis: 'Cosgrove et al. (2014) - Neuropsychopharmacology',
            timeframe: '3 months'
          }
        );
    }

    // Universal wellness metrics
    metrics.push(
      {
        id: 'energy',
        title: 'Energy Levels',
        description: 'Natural energy stabilizing',
        progress: healthMetrics.energyLevels,
        icon: 'flash-outline',
        color: '#F59E0B',
        details: 'Energy levels stabilize within 2 weeks as nicotine withdrawal ends',
        category: 'wellness',
        scientificBasis: 'Hughes (2007) - Psychopharmacology',
        timeframe: '2 weeks'
      },
      {
        id: 'sleep',
        title: 'Sleep Quality',
        description: 'Sleep patterns normalizing',
        progress: healthMetrics.sleepQuality,
        icon: 'moon-outline',
        color: '#8B5CF6',
        details: 'Sleep quality improves within 3 weeks as nicotine no longer disrupts REM sleep',
        category: 'wellness',
        scientificBasis: 'Jaehne et al. (2009) - Sleep Medicine Reviews',
        timeframe: '3 weeks'
      },
      {
        id: 'heart',
        title: 'Heart Health',
        description: 'Cardiovascular recovery',
        progress: healthMetrics.heartHealth,
        icon: 'heart-outline',
        color: '#EF4444',
        details: 'Heart rate and blood pressure normalize within 1 week',
        category: 'wellness',
        scientificBasis: 'Surgeon General Report (2020)',
        timeframe: '1 week'
      }
    );

    // Mental health metrics
    metrics.push(
      {
        id: 'mental',
        title: 'Mental Clarity',
        description: 'Cognitive function improving',
        progress: healthMetrics.mentalClarity,
        icon: 'bulb-outline',
        color: '#A855F7',
        details: 'Mental fog clears and cognitive function improves within 1 month',
        category: 'mental',
        scientificBasis: 'Mendelsohn et al. (2012) - Neuropsychology',
        timeframe: '1 month'
      },
      {
        id: 'mood',
        title: 'Mood Stability',
        description: 'Emotional balance returning',
        progress: healthMetrics.moodStability,
        icon: 'happy-outline',
        color: '#F97316',
        details: 'Mood stabilizes within 2 months as brain chemistry rebalances',
        category: 'mental',
        scientificBasis: 'Borrelli et al. (2010) - Addiction',
        timeframe: '2 months'
      }
    );

    return metrics;
  };

  const metrics = getHealthMetrics();

  useEffect(() => {
    // Update progress when component mounts
    dispatch(updateProgress());

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
  }, [dispatch]);

  // Enhanced Circular Progress Component with Recovery Strength
  const CircularProgress = ({ percentage }: { percentage: number }) => {
    const size = 280;
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Color based on recovery strength and improvement trend
    const getProgressColor = () => {
      if (improvementTrend === 'improving') return 'rgba(16, 185, 129, 1)';
      if (improvementTrend === 'struggling') return 'rgba(251, 191, 36, 1)';
      return 'rgba(6, 182, 212, 1)';
    };

    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id="progressGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={getProgressColor()} />
            <Stop offset="100%" stopColor="rgba(6, 182, 212, 0.8)" />
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

  // Get recovery status message
  const getRecoveryStatusMessage = () => {
    if (stats.daysClean === 0) return "🌱 Starting Your Journey";
    if (stats.daysClean < 3) return "💪 Withdrawal Phase";
    if (stats.daysClean < 7) return "🌟 Early Recovery";
    if (stats.daysClean < 30) return "🚀 Building Momentum";
    if (stats.daysClean < 90) return "⭐ Major Progress";
    return "🏆 Full Recovery";
  };

  // Get improvement trend message
  const getImprovementMessage = () => {
    switch (improvementTrend) {
      case 'improving':
        return "📈 Your recovery is strengthening with each attempt!";
      case 'struggling':
        return "💙 Recovery is a journey. Each day clean is progress.";
      default:
        return "🎯 You're maintaining steady progress on your journey.";
    }
  };

  // Handle relapse reporting
  const handleRelapseReport = () => {
    Alert.alert(
      "Relapse Support",
      "It's okay - relapses are part of many recovery journeys. Let's learn from this and get back on track.",
      [
        { text: "Not Now", style: "cancel" },
        { text: "Get Support", onPress: () => {} }
      ]
    );
  };

  // Get milestone status
  const getMilestoneStatus = (targetDays: number) => {
    if (stats.daysClean >= targetDays) return 'completed';
    if (stats.daysClean >= targetDays * 0.8) return 'almost';
    return 'locked';
  };

  // Get product-specific unit name
  const getUnitName = () => {
    if (!user?.nicotineProduct) return 'Units';
    
    const category = user.nicotineProduct.category;
    const name = user.nicotineProduct.name?.toLowerCase() || '';
    
    if (category === 'cigarettes') return 'Cigs';
    if (category === 'vape') return 'Pods';
    if (category === 'other' && (name.includes('pouch') || name.includes('zyn'))) return 'Pouches';
    if (category === 'chewing') return 'Portions';
    return 'Units';
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
        {/* Hero Header with Recovery Strength */}
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
              
              {/* Recovery Strength Indicator */}
              {stats.totalRelapses > 0 && (
                <View style={styles.recoveryStrengthContainer}>
                  <Text style={styles.recoveryStrengthLabel}>Recovery Strength</Text>
                  <View style={styles.recoveryStrengthBar}>
                    <LinearGradient
                      colors={['#10B981', '#06B6D4']}
                      style={[styles.recoveryStrengthFill, { width: `${recoveryStrength}%` }]}
                    />
                  </View>
                  <Text style={styles.recoveryStrengthText}>{recoveryStrength}%</Text>
                </View>
              )}
              
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
                  {getRecoveryStatusMessage()}
                </Text>
                <Text style={styles.improvementText}>
                  {getImprovementMessage()}
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
              <Text style={styles.statValue}>{stats.unitsAvoided}</Text>
              <Text style={styles.statLabel}>
                {getUnitName()} Avoided
              </Text>
              <View style={[styles.statIndicator, { backgroundColor: '#EF4444' }]} />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Science-Based Health Recovery Metrics */}
        <View style={styles.metricsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Science-Based Recovery</Text>
            <Text style={styles.sectionSubtitle}>
              Evidence-based healing timeline for your body
            </Text>
          </View>

          {/* Primary Health Metrics */}
          <View style={styles.primaryMetrics}>
            {metrics.filter(m => m.category === 'primary').map((metric) => (
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
                      {metric.timeframe && (
                        <Text style={styles.metricTimeframe}>Timeline: {metric.timeframe}</Text>
                      )}
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

                  {/* Expanded Details with Scientific Basis */}
                  {selectedMetric === metric.id && (
                    <Animated.View style={styles.metricDetails}>
                      <View style={styles.detailsDivider} />
                      <Text style={styles.metricDetailsText}>{metric.details}</Text>
                      {metric.scientificBasis && (
                        <Text style={styles.scientificBasisText}>
                          Research: {metric.scientificBasis}
                        </Text>
                      )}
                    </Animated.View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Secondary Metrics Grid */}
          <View style={styles.secondaryMetrics}>
            {metrics.filter(m => m.category !== 'primary').map((metric) => (
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
                      {metric.scientificBasis && (
                        <Text style={styles.secondaryScientificText}>
                          {metric.scientificBasis}
                        </Text>
                      )}
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recovery Journey Insights */}
        {stats.totalRelapses > 0 && (
          <View style={styles.recoveryInsightsSection}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)']}
              style={styles.recoveryInsightsCard}
            >
              <View style={styles.recoveryInsightsHeader}>
                <Ionicons name="analytics-outline" size={24} color="#8B5CF6" />
                <Text style={styles.recoveryInsightsTitle}>Your Recovery Journey</Text>
              </View>
              <Text style={styles.recoveryInsightsText}>
                You&apos;ve shown incredible resilience with {stats.totalRelapses} learning experiences. 
                Your average streak is {Math.round(stats.averageStreakLength)} days, and you&apos;re {improvementTrend}.
              </Text>
              <Text style={styles.recoveryInsightsSubtext}>
                Recovery strength: {recoveryStrength}% - Every attempt makes you stronger! 💪
              </Text>
            </LinearGradient>
          </View>
        )}

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

        {/* Support Actions */}
        <View style={styles.supportSection}>
          <TouchableOpacity style={styles.supportButton} onPress={handleRelapseReport}>
            <LinearGradient
              colors={['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 127, 0.2)']}
              style={styles.supportButtonGradient}
            >
              <Ionicons name="heart-outline" size={20} color="#EF4444" />
              <Text style={styles.supportButtonText}>Need Support?</Text>
            </LinearGradient>
          </TouchableOpacity>
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
                &ldquo;Your body is healing with scientific precision. Every day clean is measurable progress toward complete recovery!&rdquo;
              </Text>
              <Text style={styles.quoteAuthor}>— Evidence-Based Recovery</Text>
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
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  recoveryStrengthContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  recoveryStrengthLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  recoveryStrengthBar: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  recoveryStrengthFill: {
    height: '100%',
    borderRadius: 4,
  },
  recoveryStrengthText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
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
    alignItems: 'center',
  },
  progressStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  improvementText: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    marginBottom: 2,
  },
  metricTimeframe: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
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
    marginBottom: SPACING.sm,
  },
  scientificBasisText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: 16,
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
    marginBottom: SPACING.xs,
  },
  secondaryScientificText: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Recovery Insights
  recoveryInsightsSection: {
    marginBottom: SPACING['2xl'],
  },
  recoveryInsightsCard: {
    padding: SPACING.xl,
    borderRadius: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  recoveryInsightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  recoveryInsightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  recoveryInsightsText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  recoveryInsightsSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
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

  // Support Section
  supportSection: {
    marginBottom: SPACING['2xl'],
    alignItems: 'center',
  },
  supportButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  supportButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: SPACING.lg,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: SPACING.sm,
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