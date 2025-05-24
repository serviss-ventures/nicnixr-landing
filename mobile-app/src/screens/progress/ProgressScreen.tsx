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
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';
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
}

const ProgressScreen: React.FC = () => {
  const { stats, healthMetrics } = useSelector((state: RootState) => state.progress);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Calculate overall recovery percentage based on days clean
  const calculateRecoveryPercentage = () => {
    // 90 days is considered full recovery for nicotine
    const targetDays = 90;
    const percentage = Math.min((stats.daysClean / targetDays) * 100, 100);
    return Math.round(percentage);
  };

  const recoveryPercentage = calculateRecoveryPercentage();

  // Health metrics with progress
  const metrics: HealthMetric[] = [
    {
      id: 'lungs',
      title: 'Lung Capacity',
      description: 'Breathing easier every day',
      progress: Math.min(stats.daysClean * 3.5, 100),
      icon: 'fitness-outline',
      color: '#10B981',
      details: 'Lung function improves significantly within the first month'
    },
    {
      id: 'heart',
      title: 'Heart Health',
      description: 'Blood pressure normalizing',
      progress: Math.min(stats.daysClean * 5, 100),
      icon: 'heart-outline',
      color: '#EF4444',
      details: 'Heart rate and blood pressure return to normal levels'
    },
    {
      id: 'energy',
      title: 'Energy Levels',
      description: 'Natural energy returning',
      progress: Math.min(stats.daysClean * 7, 100),
      icon: 'flash-outline',
      color: '#F59E0B',
      details: 'No more nicotine crashes, steady energy throughout the day'
    },
    {
      id: 'sleep',
      title: 'Sleep Quality',
      description: 'Deeper, more restful sleep',
      progress: Math.min(stats.daysClean * 4, 100),
      icon: 'moon-outline',
      color: '#8B5CF6',
      details: 'REM sleep improves without nicotine disruption'
    },
    {
      id: 'taste',
      title: 'Taste & Smell',
      description: 'Senses sharpening',
      progress: Math.min(stats.daysClean * 10, 100),
      icon: 'restaurant-outline',
      color: '#06B6D4',
      details: 'Food tastes amazing again as taste buds recover'
    },
    {
      id: 'skin',
      title: 'Skin Health',
      description: 'Clearer, younger looking skin',
      progress: Math.min(stats.daysClean * 2.5, 100),
      icon: 'happy-outline',
      color: '#EC4899',
      details: 'Better blood flow means healthier, glowing skin'
    }
  ];

  useEffect(() => {
    // Pulse animation for the main circle
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  // Circular Progress Component
  const CircularProgress = ({ percentage }: { percentage: number }) => {
    const size = 250;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Center text */}
        <SvgText
          x={size / 2}
          y={size / 2 - 10}
          fontSize="60"
          fontWeight="bold"
          textAnchor="middle"
          fill={COLORS.text}
        >
          {percentage}%
        </SvgText>
        <SvgText
          x={size / 2}
          y={size / 2 + 20}
          fontSize="16"
          textAnchor="middle"
          fill={COLORS.textSecondary}
        >
          RECOVERED
        </SvgText>
      </Svg>
    );
  };

  // Progress chart data for the line chart
  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      data: [20, 45, 65, recoveryPercentage],
      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
      strokeWidth: 3
    }]
  };

  return (
    <LinearGradient
      colors={['#000000', '#0F172A', '#1E293B']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Recovery Progress</Text>
          <Text style={styles.subtitle}>
            {stats.daysClean} days on your journey to freedom
          </Text>
        </View>

        {/* Main Progress Circle */}
        <Animated.View 
          style={[styles.progressCircleContainer, { transform: [{ scale: pulseAnim }] }]}
        >
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
            style={styles.circleBackground}
          >
            <CircularProgress percentage={recoveryPercentage} />
          </LinearGradient>
        </Animated.View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{stats.daysClean}</Text>
            <Text style={styles.quickStatLabel}>Days Free</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>${Math.round(stats.moneySaved)}</Text>
            <Text style={styles.quickStatLabel}>Saved</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{stats.cigarettesAvoided}</Text>
            <Text style={styles.quickStatLabel}>Avoided</Text>
          </View>
        </View>

        {/* Health Metrics Section */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Health Recovery Metrics</Text>
          <Text style={styles.sectionSubtitle}>
            Your body is healing every single day
          </Text>

          {metrics.map((metric, index) => (
            <TouchableOpacity
              key={metric.id}
              style={styles.metricCard}
              onPress={() => setSelectedMetric(metric.id === selectedMetric ? null : metric.id)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[`${metric.color}20`, `${metric.color}10`]}
                style={styles.metricGradient}
              >
                <View style={styles.metricHeader}>
                  <View style={styles.metricIcon}>
                    <Ionicons name={metric.icon} size={24} color={metric.color} />
                  </View>
                  <View style={styles.metricInfo}>
                    <Text style={styles.metricTitle}>{metric.title}</Text>
                    <Text style={styles.metricDescription}>{metric.description}</Text>
                  </View>
                  <Text style={[styles.metricPercentage, { color: metric.color }]}>
                    {Math.round(metric.progress)}%
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <LinearGradient
                      colors={[metric.color, `${metric.color}CC`]}
                      style={[styles.progressBarFill, { width: `${metric.progress}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                </View>

                {/* Expanded Details */}
                {selectedMetric === metric.id && (
                  <View style={styles.metricDetails}>
                    <Text style={styles.metricDetailsText}>{metric.details}</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress Over Time Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Recovery Timeline</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={width - SPACING.xl * 2}
              height={200}
              chartConfig={{
                backgroundColor: COLORS.card,
                backgroundGradientFrom: COLORS.surface,
                backgroundGradientTo: COLORS.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.7})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: COLORS.primary,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Milestones */}
        <View style={styles.milestonesSection}>
          <Text style={styles.sectionTitle}>Recovery Milestones</Text>
          <View style={styles.milestonesList}>
            {[
              { days: 1, title: '24 Hours Free', icon: 'checkmark-circle', unlocked: stats.daysClean >= 1 },
              { days: 7, title: 'One Week Strong', icon: 'medal', unlocked: stats.daysClean >= 7 },
              { days: 30, title: 'Monthly Master', icon: 'trophy', unlocked: stats.daysClean >= 30 },
              { days: 90, title: 'Full Recovery', icon: 'star', unlocked: stats.daysClean >= 90 },
            ].map((milestone, index) => (
              <View key={index} style={[
                styles.milestoneItem,
                milestone.unlocked && styles.milestoneUnlocked
              ]}>
                <Ionicons 
                  name={milestone.icon as any} 
                  size={32} 
                  color={milestone.unlocked ? COLORS.primary : COLORS.textMuted} 
                />
                <Text style={[
                  styles.milestoneTitle,
                  milestone.unlocked && styles.milestoneUnlockedText
                ]}>
                  {milestone.title}
                </Text>
                <Text style={styles.milestoneDays}>{milestone.days} days</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Motivational Quote */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
          style={styles.quoteCard}
        >
          <Ionicons name="bulb-outline" size={24} color={COLORS.accent} />
          <Text style={styles.quoteText}>
            "Every cigarette not smoked is a victory. You're {recoveryPercentage}% recovered and getting stronger every day!"
          </Text>
        </LinearGradient>
      </ScrollView>
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
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  progressCircleContainer: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  circleBackground: {
    padding: SPACING.xl,
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.xl,
    padding: SPACING.lg,
    marginBottom: SPACING['2xl'],
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  quickStatLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.cardBorder,
  },
  metricsSection: {
    marginBottom: SPACING['2xl'],
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  metricCard: {
    marginBottom: SPACING.md,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  metricDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  metricPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginTop: SPACING.sm,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricDetails: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  metricDetailsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  chartSection: {
    marginBottom: SPACING['2xl'],
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
    marginTop: SPACING.md,
  },
  milestonesSection: {
    marginBottom: SPACING['2xl'],
  },
  milestonesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  milestoneItem: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  milestoneUnlocked: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  milestoneUnlockedText: {
    color: COLORS.text,
  },
  milestoneDays: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  quoteCard: {
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginLeft: SPACING.md,
    fontStyle: 'italic',
  },
});

export default ProgressScreen; 