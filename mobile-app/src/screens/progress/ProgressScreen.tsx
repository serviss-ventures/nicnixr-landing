import React, { useEffect, useState } from 'react';
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
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProgressScreen: React.FC = () => {
  const stats = useSelector((state: RootState) => state.progress.stats);
  const userProfile = useSelector((state: RootState) => state.progress.userProfile);
  const [recoveryData, setRecoveryData] = useState<ScientificRecoveryData | null>(null);
  const [expandedBenefit, setExpandedBenefit] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'benefits' | 'systems'>('benefits');
  
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
  
  // Recovery benefits organized by timeframe
  const recoveryBenefits = [
    {
      id: '20min',
      timeframe: '20 Minutes',
      title: 'Heart Rate Normalizes',
      description: 'Your pulse and blood pressure drop to normal levels',
      icon: 'heart',
      color: '#EF4444',
      achieved: stats.daysClean > 0 || (stats.hoursClean || 0) >= 0.33,
    },
    {
      id: '8hours',
      timeframe: '8 Hours',
      title: 'Oxygen Levels Recover',
      description: 'Carbon monoxide levels drop, oxygen levels normalize',
      icon: 'fitness',
      color: '#F59E0B',
      achieved: stats.daysClean > 0 || (stats.hoursClean || 0) >= 8,
    },
    {
      id: '24hours',
      timeframe: '24 Hours',
      title: 'Heart Attack Risk Decreases',
      description: 'Your risk of heart attack begins to drop',
      icon: 'shield-checkmark',
      color: '#10B981',
      achieved: stats.daysClean >= 1,
    },
    {
      id: '48hours',
      timeframe: '48 Hours',
      title: 'Senses Sharpen',
      description: 'Nerve endings begin to regenerate, taste and smell improve',
      icon: 'sparkles',
      color: '#8B5CF6',
      achieved: stats.daysClean >= 2,
    },
    {
      id: '72hours',
      timeframe: '72 Hours',
      title: 'Breathing Easier',
      description: 'Bronchial tubes relax, lung capacity increases',
      icon: 'cloud',
      color: '#06B6D4',
      achieved: stats.daysClean >= 3,
    },
    {
      id: '1week',
      timeframe: '1 Week',
      title: 'Energy Surge',
      description: 'Circulation improves, physical activity becomes easier',
      icon: 'flash',
      color: '#F59E0B',
      achieved: stats.daysClean >= 7,
    },
    {
      id: '2weeks',
      timeframe: '2 Weeks',
      title: 'Withdrawal Fades',
      description: 'Most physical withdrawal symptoms have peaked and are fading',
      icon: 'trending-up',
      color: '#10B981',
      achieved: stats.daysClean >= 14,
    },
    {
      id: '1month',
      timeframe: '1 Month',
      title: 'Lung Function Improves',
      description: 'Cilia regrow, reducing infection risk and improving breathing',
      icon: 'medical',
      color: '#EF4444',
      achieved: stats.daysClean >= 30,
    },
    {
      id: '3months',
      timeframe: '3 Months',
      title: 'Circulation Optimized',
      description: 'Blood flow to hands and feet improves significantly',
      icon: 'water',
      color: '#8B5CF6',
      achieved: stats.daysClean >= 90,
    },
    {
      id: '6months',
      timeframe: '6 Months',
      title: 'Immune System Stronger',
      description: 'White blood cell count normalizes, illness resistance improves',
      icon: 'shield',
      color: '#06B6D4',
      achieved: stats.daysClean >= 180,
    },
    {
      id: '1year',
      timeframe: '1 Year',
      title: 'Disease Risk Halved',
      description: 'Risk of heart disease is half that of a nicotine user',
      icon: 'heart-circle',
      color: '#10B981',
      achieved: stats.daysClean >= 365,
    },
  ];
  
  // Current Phase Card Component
  const CurrentPhaseCard = () => {
    const phase = recoveryData.phase;
    const progress = (stats.daysClean / phase.endDay) * 100;
    const clampedProgress = Math.min(progress, 100);
    
    return (
      <View style={styles.phaseCard}>
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.05)']}
          style={styles.phaseGradient}
        >
          {/* Phase Header */}
          <View style={styles.phaseHeader}>
            <View style={styles.phaseTopRow}>
              <View style={styles.phaseInfo}>
                <Text style={styles.phaseLabel}>CURRENT PHASE</Text>
                <Text style={styles.phaseName}>{phase.name}</Text>
                <Text style={styles.phaseTimeframe}>
                  Days {phase.startDay}-{phase.endDay === Infinity ? '∞' : phase.endDay}
                </Text>
              </View>
              <View style={styles.phaseScoreContainer}>
                <Text style={styles.phaseScore}>{Math.round(recoveryData.overallRecovery)}</Text>
                <Text style={styles.phaseScoreUnit}>%</Text>
              </View>
            </View>
          </View>
          
          {/* Phase Progress Bar */}
          <View style={styles.phaseProgressContainer}>
            <View style={styles.phaseProgressBar}>
              <Animated.View 
                style={[
                  styles.phaseProgressFill,
                  { width: `${clampedProgress}%` }
                ]}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.phaseProgressGradient}
                />
              </Animated.View>
            </View>
            <Text style={styles.phaseProgressText}>
              Day {stats.daysClean} of {phase.endDay === Infinity ? '∞' : phase.endDay}
            </Text>
          </View>
          
          {/* Phase Description */}
          <Text style={styles.phaseDescription}>{phase.description}</Text>
          
          {/* Key Processes */}
          <View style={styles.phaseProcesses}>
            <Text style={styles.phaseProcessesTitle}>What's happening:</Text>
            {phase.keyProcesses.slice(0, 3).map((process, index) => (
              <View key={index} style={styles.phaseProcess}>
                <View style={styles.phaseProcessDot} />
                <Text style={styles.phaseProcessText}>{process}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>
    );
  };
  
  // Tab Selector Component
  const TabSelector = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'benefits' && styles.tabActive]}
        onPress={() => setSelectedTab('benefits')}
      >
        <Text style={[styles.tabText, selectedTab === 'benefits' && styles.tabTextActive]}>
          Recovery Timeline
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'systems' && styles.tabActive]}
        onPress={() => setSelectedTab('systems')}
      >
        <Text style={[styles.tabText, selectedTab === 'systems' && styles.tabTextActive]}>
          Body Systems
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  // Benefit Card Component
  const BenefitCard = ({ benefit }: { benefit: typeof recoveryBenefits[0] }) => {
    const isExpanded = expandedBenefit === benefit.id;
    const rotation = useSharedValue(0);
    
    useEffect(() => {
      rotation.value = withSpring(isExpanded ? 180 : 0);
    }, [isExpanded]);
    
    const animatedIconStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));
    
    return (
      <TouchableOpacity
        style={[
          styles.benefitCard,
          benefit.achieved && styles.benefitCardAchieved,
          !benefit.achieved && styles.benefitCardLocked,
        ]}
        onPress={() => setExpandedBenefit(isExpanded ? null : benefit.id)}
        activeOpacity={0.7}
      >
        <View style={styles.benefitHeader}>
          <View style={[
            styles.benefitIcon,
            { backgroundColor: benefit.color + '20' },
            !benefit.achieved && styles.benefitIconLocked,
          ]}>
            <Ionicons 
              name={benefit.achieved ? benefit.icon as any : 'lock-closed'} 
              size={24} 
              color={benefit.achieved ? benefit.color : COLORS.textSecondary} 
            />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTimeframe}>{benefit.timeframe}</Text>
            <Text style={[
              styles.benefitTitle,
              !benefit.achieved && styles.benefitTitleLocked,
            ]}>
              {benefit.title}
            </Text>
          </View>
          <Animated.View style={animatedIconStyle}>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={benefit.achieved ? COLORS.textSecondary : COLORS.textTertiary} 
            />
          </Animated.View>
        </View>
        
        {isExpanded && (
          <Animated.View 
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={styles.benefitDetails}
          >
            <Text style={styles.benefitDescription}>{benefit.description}</Text>
            {benefit.achieved && (
              <View style={styles.benefitAchievedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                <Text style={styles.benefitAchievedText}>Achieved</Text>
              </View>
            )}
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };
  
  // System Recovery Component
  const SystemRecovery = () => {
    const systems = [
      {
        name: 'Brain & Nervous System',
        percentage: Math.round(recoveryData.neurologicalRecovery),
        icon: 'bulb',
        color: '#8B5CF6',
      },
      {
        name: 'Heart & Circulation',
        percentage: Math.round(recoveryData.metrics.cardiovascular_function?.value || 0),
        icon: 'heart',
        color: '#EF4444',
      },
      {
        name: 'Lungs & Breathing',
        percentage: Math.round(recoveryData.metrics.respiratory_function?.value || 0),
        icon: 'fitness',
        color: '#06B6D4',
      },
      {
        name: 'Metabolism & Energy',
        percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
        icon: 'flash',
        color: '#F59E0B',
      },
    ];
    
    return (
      <View style={styles.systemsContainer}>
        {systems.map((system, index) => (
          <View key={index} style={styles.systemCard}>
            <View style={[styles.systemIcon, { backgroundColor: system.color + '20' }]}>
              <Ionicons name={system.icon as any} size={24} color={system.color} />
            </View>
            <View style={styles.systemInfo}>
              <Text style={styles.systemName}>{system.name}</Text>
              <View style={styles.systemProgressBar}>
                <View 
                  style={[
                    styles.systemProgressFill,
                    { width: `${system.percentage}%`, backgroundColor: system.color }
                  ]} 
                />
              </View>
            </View>
            <Text style={[styles.systemPercentage, { color: system.color }]}>
              {system.percentage}%
            </Text>
          </View>
        ))}
      </View>
    );
  };
  
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
              {userProfile?.productType === 'cigarettes' && 'Cigarette Recovery'}
              {userProfile?.productType === 'vape' && 'Vape Recovery'}
              {userProfile?.productType === 'pouches' && 'Nicotine Pouch Recovery'}
              {userProfile?.productType === 'dip' && 'Dip/Chew Recovery'}
            </Text>
          </View>
          
          {/* Current Phase Card */}
          <CurrentPhaseCard />
          
          {/* Tab Selector */}
          <TabSelector />
          
          {/* Content based on selected tab */}
          {selectedTab === 'benefits' ? (
            <View style={styles.benefitsContainer}>
              <Text style={styles.sectionTitle}>Recovery Benefits</Text>
              <Text style={styles.sectionSubtitle}>
                Your body starts healing immediately
              </Text>
              {recoveryBenefits.map((benefit) => (
                <BenefitCard key={benefit.id} benefit={benefit} />
              ))}
            </View>
          ) : (
            <View style={styles.benefitsContainer}>
              <Text style={styles.sectionTitle}>System Recovery</Text>
              <Text style={styles.sectionSubtitle}>
                How your body systems are healing
              </Text>
              <SystemRecovery />
            </View>
          )}
          
          {/* Scientific Note */}
          <View style={styles.noteCard}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.noteText}>{recoveryData.scientificNote}</Text>
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
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  
  // Phase Card
  phaseCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: 20,
    overflow: 'hidden',
  },
  phaseGradient: {
    padding: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  phaseHeader: {
    marginBottom: SPACING.lg,
  },
  phaseTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseInfo: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  phaseName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  phaseTimeframe: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  phaseScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  phaseScore: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
    includeFontPadding: false,
  },
  phaseScoreUnit: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 2,
  },
  phaseProgressContainer: {
    marginBottom: SPACING.lg,
  },
  phaseProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  phaseProgressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  phaseProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  phaseProgressGradient: {
    flex: 1,
  },
  phaseDescription: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  phaseProcesses: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: SPACING.md,
  },
  phaseProcessesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  phaseProcess: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  phaseProcessDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  phaseProcessText: {
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
    lineHeight: 18,
  },
  
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  
  // Benefits
  benefitsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  benefitCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  benefitCardAchieved: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  benefitCardLocked: {
    opacity: 0.6,
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  benefitIconLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTimeframe: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 2,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  benefitTitleLocked: {
    color: COLORS.textSecondary,
  },
  benefitDetails: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  benefitDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  benefitAchievedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  benefitAchievedText: {
    fontSize: 13,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  
  // Systems
  systemsContainer: {
    gap: SPACING.md,
  },
  systemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  systemIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  systemInfo: {
    flex: 1,
  },
  systemName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  systemProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  systemProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  systemPercentage: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: SPACING.md,
  },
  
  // Note
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginLeft: SPACING.sm,
  },
});

export default ProgressScreen; 