import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { calculateScientificRecovery, ScientificRecoveryData } from '../../services/scientificRecoveryService';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  interpolate,
  Extrapolate,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProgressScreen: React.FC = () => {
  const stats = useSelector((state: RootState) => state.progress.stats);
  const userProfile = useSelector((state: RootState) => state.progress.userProfile);
  const [recoveryData, setRecoveryData] = useState<ScientificRecoveryData | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  
  useEffect(() => {
    if (stats) {
      const data = calculateScientificRecovery(stats.daysClean, userProfile);
      setRecoveryData(data);
    }
  }, [stats, userProfile]);
  
  if (!recoveryData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  // Simple progress ring component
  const ProgressRing = ({ progress, size = 200 }: { progress: number; size?: number }) => {
    const animatedProgress = useSharedValue(0);
    
    useEffect(() => {
      animatedProgress.value = withDelay(300, withTiming(progress / 100, { duration: 1500 }));
    }, [progress]);
    
    const animatedStyle = useAnimatedStyle(() => {
      const rotation = interpolate(
        animatedProgress.value,
        [0, 1],
        [0, 360],
        Extrapolate.CLAMP
      );
      return {
        transform: [{ rotate: `${rotation}deg` }],
      };
    });
    
    return (
      <View style={[styles.progressRingContainer, { width: size, height: size }]}>
        <View style={[styles.progressRingBackground, { width: size, height: size }]} />
        <Animated.View style={[styles.progressRingForeground, animatedStyle, { width: size, height: size }]}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={[styles.progressRingGradient, { width: size, height: size }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
        <View style={styles.progressRingCenter}>
          <Text style={styles.progressRingValue}>{Math.round(progress)}</Text>
          <Text style={styles.progressRingLabel}>%</Text>
        </View>
      </View>
    );
  };
  
  // Simplified metric card
  const SimpleMetricCard = ({ 
    icon, 
    title, 
    value, 
    subtitle, 
    color = COLORS.primary,
    onPress 
  }: { 
    icon: string; 
    title: string; 
    value: string | number; 
    subtitle: string;
    color?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={styles.simpleMetricCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.simpleMetricIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.simpleMetricContent}>
        <Text style={styles.simpleMetricTitle}>{title}</Text>
        <Text style={styles.simpleMetricValue}>{value}%</Text>
        <Text style={styles.simpleMetricSubtitle}>{subtitle}</Text>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      )}
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Clean Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Recovery Progress</Text>
            <Text style={styles.subtitle}>
              Day {stats.daysClean} • {recoveryData.phase.name}
            </Text>
          </View>
          
          {/* Main Progress Ring - Big and Clear */}
          <View style={styles.mainProgressSection}>
            <ProgressRing progress={recoveryData.overallRecovery} />
            <Text style={styles.mainProgressLabel}>Overall Recovery</Text>
            <Text style={styles.mainProgressNote}>
              {recoveryData.scientificNote}
            </Text>
          </View>
          
          {/* Three Key Metrics - Simple Cards */}
          <View style={styles.keyMetricsSection}>
            <SimpleMetricCard
              icon="brain"
              title="Brain Recovery"
              value={Math.round(recoveryData.neurologicalRecovery)}
              subtitle="Neural pathways healing"
              color={COLORS.secondary}
            />
            
            <SimpleMetricCard
              icon="heart"
              title="Body Recovery"
              value={Math.round(recoveryData.physicalRecovery)}
              subtitle="Physical systems improving"
              color="#EF4444"
            />
            
            <SimpleMetricCard
              icon="trending-up"
              title="Next Milestone"
              value={
                recoveryData.projections.days30 > recoveryData.overallRecovery 
                  ? recoveryData.projections.days30 
                  : recoveryData.projections.days90
              }
              subtitle={
                recoveryData.projections.days30 > recoveryData.overallRecovery 
                  ? "At 30 days" 
                  : "At 90 days"
              }
              color="#F59E0B"
            />
          </View>
          
          {/* Current Phase - Expandable */}
          <TouchableOpacity
            style={styles.phaseCard}
            onPress={() => setExpandedSection(expandedSection === 'phase' ? null : 'phase')}
            activeOpacity={0.8}
          >
            <View style={styles.phaseHeader}>
              <View style={styles.phaseHeaderLeft}>
                <View style={[styles.phaseIcon, { backgroundColor: `${COLORS.primary}15` }]}>
                  <Ionicons name="flag" size={20} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.phaseTitle}>{recoveryData.phase.name}</Text>
                  <Text style={styles.phaseSubtitle}>{recoveryData.phase.description}</Text>
                </View>
              </View>
              <Ionicons 
                name={expandedSection === 'phase' ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={COLORS.textSecondary} 
              />
            </View>
            
            {expandedSection === 'phase' && (
              <Animated.View style={styles.phaseContent}>
                {/* What's Happening */}
                <View style={styles.phaseSection}>
                  <Text style={styles.phaseSectionTitle}>What's Happening</Text>
                  {recoveryData.phase.keyProcesses.map((process, index) => (
                    <View key={index} style={styles.phaseItem}>
                      <View style={styles.phaseItemDot} />
                      <Text style={styles.phaseItemText}>{process}</Text>
                    </View>
                  ))}
                </View>
                
                {/* What You Might Feel */}
                {recoveryData.phase.symptoms.length > 0 && (
                  <View style={styles.phaseSection}>
                    <Text style={styles.phaseSectionTitle}>What You Might Feel</Text>
                    {recoveryData.phase.symptoms.map((symptom, index) => (
                      <View key={index} style={styles.phaseItem}>
                        <View style={[styles.phaseItemDot, { backgroundColor: '#F59E0B' }]} />
                        <Text style={styles.phaseItemText}>{symptom}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {/* The Good News */}
                <View style={styles.phaseSection}>
                  <Text style={styles.phaseSectionTitle}>The Good News</Text>
                  {recoveryData.phase.improvements.map((improvement, index) => (
                    <View key={index} style={styles.phaseItem}>
                      <View style={[styles.phaseItemDot, { backgroundColor: COLORS.primary }]} />
                      <Text style={styles.phaseItemText}>{improvement}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}
          </TouchableOpacity>
          
          {/* Deep Dive Section - For the Curious */}
          <TouchableOpacity
            style={styles.deepDiveCard}
            onPress={() => setExpandedSection(expandedSection === 'metrics' ? null : 'metrics')}
            activeOpacity={0.8}
          >
            <View style={styles.deepDiveHeader}>
              <View style={styles.deepDiveHeaderLeft}>
                <View style={[styles.deepDiveIcon, { backgroundColor: `${COLORS.secondary}15` }]}>
                  <Ionicons name="analytics" size={20} color={COLORS.secondary} />
                </View>
                <View>
                  <Text style={styles.deepDiveTitle}>Deep Dive</Text>
                  <Text style={styles.deepDiveSubtitle}>See all 9 recovery metrics</Text>
                </View>
              </View>
              <Ionicons 
                name={expandedSection === 'metrics' ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={COLORS.textSecondary} 
              />
            </View>
            
            {expandedSection === 'metrics' && (
              <Animated.View style={styles.deepDiveContent}>
                {Object.entries(recoveryData.metrics).map(([id, metric]) => (
                  <TouchableOpacity
                    key={id}
                    style={[
                      styles.metricRow,
                      selectedMetric === id && styles.metricRowSelected
                    ]}
                    onPress={() => setSelectedMetric(selectedMetric === id ? null : id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.metricRowHeader}>
                      <Text style={styles.metricRowTitle}>
                        {id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                      <View style={styles.metricRowRight}>
                        <Text style={styles.metricRowValue}>{metric.value}%</Text>
                        <Ionicons 
                          name={metric.trend === 'improving' ? 'trending-up' : 
                                metric.trend === 'stable' ? 'remove' : 'trending-down'} 
                          size={16} 
                          color={metric.trend === 'improving' ? COLORS.primary : COLORS.textSecondary} 
                        />
                      </View>
                    </View>
                    
                    {selectedMetric === id && (
                      <View style={styles.metricRowDetails}>
                        <Text style={styles.metricRowDescription}>{metric.description}</Text>
                        {metric.daysToNextMilestone > 0 && (
                          <Text style={styles.metricRowMilestone}>
                            Next milestone in {metric.daysToNextMilestone} days
                          </Text>
                        )}
                      </View>
                    )}
                    
                    <View style={styles.metricRowProgress}>
                      <View style={styles.metricRowProgressBar}>
                        <View 
                          style={[
                            styles.metricRowProgressFill,
                            { width: `${metric.value}%` }
                          ]} 
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </TouchableOpacity>
          
          {/* Future Outlook - Simple Timeline */}
          <View style={styles.futureSection}>
            <Text style={styles.futureSectionTitle}>Your Recovery Timeline</Text>
            <View style={styles.timeline}>
              {[
                { days: 30, value: recoveryData.projections.days30 },
                { days: 90, value: recoveryData.projections.days90 },
                { days: 180, value: recoveryData.projections.days180 },
                { days: 365, value: recoveryData.projections.days365 },
              ].map((projection, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={[
                    styles.timelineDot,
                    stats.daysClean >= projection.days && styles.timelineDotComplete
                  ]} />
                  <Text style={styles.timelineLabel}>
                    {projection.days < 365 ? `${projection.days} days` : '1 year'}
                  </Text>
                  <Text style={[
                    styles.timelineValue,
                    stats.daysClean >= projection.days && styles.timelineValueComplete
                  ]}>
                    {projection.value}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 2,
  },
  
  // Header
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  
  // Main Progress
  mainProgressSection: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  progressRingContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingBackground: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 12,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressRingForeground: {
    position: 'absolute',
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressRingGradient: {
    borderRadius: 100,
    borderWidth: 12,
    borderColor: 'transparent',
  },
  progressRingCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingValue: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.text,
  },
  progressRingLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: -8,
  },
  mainProgressLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  mainProgressNote: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl * 2,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  
  // Key Metrics
  keyMetricsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  simpleMetricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  simpleMetricIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  simpleMetricContent: {
    flex: 1,
  },
  simpleMetricTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  simpleMetricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  simpleMetricSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  
  // Phase Card
  phaseCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  phaseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phaseIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  phaseSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  phaseContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  phaseSection: {
    marginBottom: SPACING.lg,
  },
  phaseSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  phaseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  phaseItemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textSecondary,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  phaseItemText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  
  // Deep Dive
  deepDiveCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  deepDiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  deepDiveHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deepDiveIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  deepDiveTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  deepDiveSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  deepDiveContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  metricRow: {
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  metricRowSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  metricRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  metricRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metricRowValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  metricRowDetails: {
    marginBottom: SPACING.sm,
  },
  metricRowDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: SPACING.xs,
  },
  metricRowMilestone: {
    fontSize: 11,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  metricRowProgress: {
    marginTop: SPACING.xs,
  },
  metricRowProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  metricRowProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  
  // Timeline
  futureSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  futureSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  timelineItem: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: SPACING.xs,
  },
  timelineDotComplete: {
    backgroundColor: COLORS.primary,
  },
  timelineLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  timelineValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  timelineValueComplete: {
    color: COLORS.primary,
  },
});

export default ProgressScreen; 