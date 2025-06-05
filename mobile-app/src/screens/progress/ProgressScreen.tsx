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
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MetricCardProps {
  metric: {
    id: string;
    name: string;
    value: number;
    trend: 'improving' | 'stable' | 'plateau';
    daysToNextMilestone: number;
    description: string;
  };
  category: string;
  delay: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric, category, delay }) => {
  const animatedValue = useSharedValue(0);
  
  useEffect(() => {
    setTimeout(() => {
      animatedValue.value = withSpring(metric.value / 100, {
        damping: 15,
        stiffness: 100,
      });
    }, delay);
  }, [metric.value, delay]);
  
  const animatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      animatedValue.value,
      [0, 1],
      [0, 100],
      Extrapolate.CLAMP
    );
    
    return {
      width: `${width}%`,
    };
  });
  
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'improving':
        return 'trending-up';
      case 'stable':
        return 'remove';
      case 'plateau':
        return 'trending-down';
    }
  };
  
  const getTrendColor = () => {
    switch (metric.trend) {
      case 'improving':
        return COLORS.primary;
      case 'stable':
        return COLORS.secondary;
      case 'plateau':
        return COLORS.textSecondary;
    }
  };
  
  const getCategoryIcon = () => {
    switch (category) {
      case 'neurological':
        return 'brain';
      case 'cardiovascular':
        return 'heart';
      case 'respiratory':
        return 'fitness';
      case 'metabolic':
        return 'nutrition';
      case 'sensory':
        return 'eye';
      default:
        return 'medical';
    }
  };
  
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={styles.metricIconContainer}>
          <Ionicons name={getCategoryIcon() as any} size={20} color={COLORS.primary} />
        </View>
        <View style={styles.metricInfo}>
          <Text style={styles.metricName}>{metric.name}</Text>
          <Text style={styles.metricDescription} numberOfLines={1}>
            {metric.description}
          </Text>
        </View>
        <View style={styles.metricTrend}>
          <Ionicons 
            name={getTrendIcon() as any} 
            size={16} 
            color={getTrendColor()} 
          />
        </View>
      </View>
      
      <View style={styles.metricProgress}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, animatedStyle]}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            />
          </Animated.View>
        </View>
        <Text style={styles.metricValue}>{metric.value}%</Text>
      </View>
      
      {metric.daysToNextMilestone > 0 && (
        <Text style={styles.metricMilestone}>
          Next milestone in {metric.daysToNextMilestone} days
        </Text>
      )}
    </View>
  );
};

const ProgressScreen: React.FC = () => {
  const stats = useSelector((state: RootState) => state.progress.stats);
  const userProfile = useSelector((state: RootState) => state.progress.userProfile);
  const [recoveryData, setRecoveryData] = useState<ScientificRecoveryData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  useEffect(() => {
    if (stats) {
      const data = calculateScientificRecovery(stats.daysClean, userProfile);
      setRecoveryData(data);
    }
  }, [stats, userProfile]);
  
  const getFilteredMetrics = useCallback(() => {
    if (!recoveryData) return [];
    
    const metrics = Object.entries(recoveryData.metrics).map(([id, data]) => ({
      id,
      ...data,
    }));
    
    if (selectedCategory === 'all') return metrics;
    
    // Filter by category based on metric ID patterns
    return metrics.filter(metric => {
      if (selectedCategory === 'neurological') {
        return ['dopamine_receptors', 'prefrontal_function', 'neurotransmitter_balance', 'sleep_architecture'].includes(metric.id);
      }
      if (selectedCategory === 'physical') {
        return ['cardiovascular_function', 'respiratory_function', 'metabolic_function', 'inflammatory_markers', 'sensory_function'].includes(metric.id);
      }
      return true;
    });
  }, [recoveryData, selectedCategory]);
  
  if (!recoveryData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  const filteredMetrics = getFilteredMetrics();
  
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Recovery Progress</Text>
            <Text style={styles.subtitle}>
              Scientific tracking of your healing journey
            </Text>
          </View>
          
          {/* Overall Recovery Card */}
          <View style={styles.overallCard}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.05)']}
              style={styles.overallGradient}
            >
              <View style={styles.overallHeader}>
                <Text style={styles.overallTitle}>Overall Recovery</Text>
                <View style={styles.overallBadge}>
                  <Text style={styles.overallBadgeText}>
                    {recoveryData.phase.name}
                  </Text>
                </View>
              </View>
              
              <View style={styles.overallStats}>
                <View style={styles.overallStatItem}>
                  <Text style={styles.overallStatValue}>
                    {recoveryData.overallRecovery}%
                  </Text>
                  <Text style={styles.overallStatLabel}>Total</Text>
                </View>
                
                <View style={styles.overallStatDivider} />
                
                <View style={styles.overallStatItem}>
                  <Text style={styles.overallStatValue}>
                    {recoveryData.neurologicalRecovery}%
                  </Text>
                  <Text style={styles.overallStatLabel}>Neurological</Text>
                </View>
                
                <View style={styles.overallStatDivider} />
                
                <View style={styles.overallStatItem}>
                  <Text style={styles.overallStatValue}>
                    {recoveryData.physicalRecovery}%
                  </Text>
                  <Text style={styles.overallStatLabel}>Physical</Text>
                </View>
              </View>
              
              <Text style={styles.scientificNote}>
                {recoveryData.scientificNote}
              </Text>
            </LinearGradient>
          </View>
          
          {/* Phase Information */}
          <View style={styles.phaseCard}>
            <Text style={styles.phaseTitle}>Current Phase: {recoveryData.phase.name}</Text>
            <Text style={styles.phaseDescription}>{recoveryData.phase.description}</Text>
            
            <View style={styles.phaseSection}>
              <Text style={styles.phaseSectionTitle}>Key Processes</Text>
              {recoveryData.phase.keyProcesses.map((process, index) => (
                <View key={index} style={styles.phaseItem}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                  <Text style={styles.phaseItemText}>{process}</Text>
                </View>
              ))}
            </View>
            
            {recoveryData.phase.symptoms.length > 0 && (
              <View style={styles.phaseSection}>
                <Text style={styles.phaseSectionTitle}>Common Symptoms</Text>
                {recoveryData.phase.symptoms.map((symptom, index) => (
                  <View key={index} style={styles.phaseItem}>
                    <Ionicons name="information-circle" size={16} color={COLORS.secondary} />
                    <Text style={styles.phaseItemText}>{symptom}</Text>
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.phaseSection}>
              <Text style={styles.phaseSectionTitle}>Improvements</Text>
              {recoveryData.phase.improvements.map((improvement, index) => (
                <View key={index} style={styles.phaseItem}>
                  <Ionicons name="trending-up" size={16} color={COLORS.primary} />
                  <Text style={styles.phaseItemText}>{improvement}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Category Filter */}
          <View style={styles.filterContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedCategory === 'all' && styles.filterButtonActive
                ]}
                onPress={() => setSelectedCategory('all')}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedCategory === 'all' && styles.filterButtonTextActive
                ]}>
                  All Systems
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedCategory === 'neurological' && styles.filterButtonActive
                ]}
                onPress={() => setSelectedCategory('neurological')}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedCategory === 'neurological' && styles.filterButtonTextActive
                ]}>
                  Neurological
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedCategory === 'physical' && styles.filterButtonActive
                ]}
                onPress={() => setSelectedCategory('physical')}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedCategory === 'physical' && styles.filterButtonTextActive
                ]}>
                  Physical
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          
          {/* Detailed Metrics */}
          <View style={styles.metricsContainer}>
            <Text style={styles.metricsTitle}>Detailed Recovery Metrics</Text>
            {filteredMetrics.map((metric, index) => (
              <MetricCard
                key={metric.id}
                metric={metric}
                category={metric.id.includes('dopamine') || metric.id.includes('prefrontal') || metric.id.includes('neurotransmitter') || metric.id.includes('sleep') ? 'neurological' :
                        metric.id.includes('cardiovascular') ? 'cardiovascular' :
                        metric.id.includes('respiratory') ? 'respiratory' :
                        metric.id.includes('metabolic') || metric.id.includes('inflammatory') ? 'metabolic' :
                        'sensory'}
                delay={index * 100}
              />
            ))}
          </View>
          
          {/* Future Projections */}
          <View style={styles.projectionsCard}>
            <Text style={styles.projectionsTitle}>Recovery Projections</Text>
            <Text style={styles.projectionsSubtitle}>
              Expected recovery percentages at future milestones
            </Text>
            
            <View style={styles.projectionsList}>
              <View style={styles.projectionItem}>
                <Text style={styles.projectionLabel}>30 Days</Text>
                <Text style={styles.projectionValue}>{recoveryData.projections.days30}%</Text>
              </View>
              
              <View style={styles.projectionItem}>
                <Text style={styles.projectionLabel}>90 Days</Text>
                <Text style={styles.projectionValue}>{recoveryData.projections.days90}%</Text>
              </View>
              
              <View style={styles.projectionItem}>
                <Text style={styles.projectionLabel}>6 Months</Text>
                <Text style={styles.projectionValue}>{recoveryData.projections.days180}%</Text>
              </View>
              
              <View style={styles.projectionItem}>
                <Text style={styles.projectionLabel}>1 Year</Text>
                <Text style={styles.projectionValue}>{recoveryData.projections.days365}%</Text>
              </View>
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
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  
  // Overall Recovery Card
  overallCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: 20,
    overflow: 'hidden',
  },
  overallGradient: {
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  overallTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  overallBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  overallBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  overallStatItem: {
    alignItems: 'center',
  },
  overallStatValue: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  overallStatLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  overallStatDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  scientificNote: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  
  // Phase Card
  phaseCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  phaseDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  phaseSection: {
    marginBottom: SPACING.lg,
  },
  phaseSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  phaseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  phaseItemText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 20,
  },
  
  // Filter
  filterContainer: {
    marginBottom: SPACING.lg,
  },
  filterScroll: {
    paddingHorizontal: SPACING.lg,
  },
  filterButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  
  // Metrics
  metricsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  metricsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  metricDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  metricTrend: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  progressFill: {
    height: '100%',
  },
  progressGradient: {
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    minWidth: 45,
    textAlign: 'right',
  },
  metricMilestone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  
  // Projections
  projectionsCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  projectionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  projectionsSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  projectionsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projectionItem: {
    alignItems: 'center',
  },
  projectionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  projectionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366F1',
  },
});

export default ProgressScreen; 