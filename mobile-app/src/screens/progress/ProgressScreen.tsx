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
import { getGenderSpecificBenefits, GenderSpecificBenefit, getBenefitExplanation } from '../../services/genderSpecificRecoveryService';
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
  const user = useSelector((state: RootState) => state.auth.user);
  const [recoveryData, setRecoveryData] = useState<ScientificRecoveryData | null>(null);
  const [expandedBenefit, setExpandedBenefit] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'benefits' | 'systems'>('benefits');
  const [genderBenefits, setGenderBenefits] = useState<GenderSpecificBenefit[]>([]);
  
  useEffect(() => {
    if (stats) {
      const data = calculateScientificRecovery(stats.daysClean, userProfile);
      setRecoveryData(data);
      
      // Get gender-specific benefits
      const productType = userProfile?.category || userProfile?.productType || 'cigarettes';
      const gender = user?.gender;
      
      // Debug logging
      console.log('🔍 Progress Screen Debug:');
      console.log('- User:', user);
      console.log('- Gender:', gender);
      console.log('- Product Type:', productType);
      console.log('- Stats:', stats);
      console.log('- Days Clean:', stats.daysClean);
      
      const benefits = getGenderSpecificBenefits(productType, gender, stats);
      console.log('- Benefits count:', benefits.length);
      console.log('- Benefits:', benefits.map(b => ({ 
        title: b.title, 
        category: b.category, 
        daysRequired: b.daysRequired,
        achieved: b.achieved 
      })));
      
      setGenderBenefits(benefits);
    }
  }, [stats, userProfile, user]);
  
  if (!recoveryData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
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
  const BenefitCard = ({ benefit }: { benefit: GenderSpecificBenefit }) => {
    const isExpanded = expandedBenefit === benefit.id;
    const rotation = useSharedValue(0);
    const height = useSharedValue(0);
    const opacity = useSharedValue(0);
    
    useEffect(() => {
      rotation.value = withSpring(isExpanded ? 180 : 0, {
        damping: 15,
        stiffness: 150,
      });
      
      if (isExpanded) {
        // Calculate height based on content - more accurate estimation
        const baseHeight = 80; // Reduced from 100 - Base height for description and scientific text
        const achievedBadgeHeight = benefit.achieved ? 30 : 0; // Reduced from 35
        const extraPadding = 10; // Reduced from 25 to minimize extra space
        const estimatedHeight = baseHeight + achievedBadgeHeight + extraPadding;
        
        height.value = withSpring(estimatedHeight, {
          damping: 15,
          stiffness: 100,
        });
        opacity.value = withTiming(1, { duration: 250 });
      } else {
        opacity.value = withTiming(0, { duration: 150 });
        height.value = withTiming(0, { duration: 200 });
      }
    }, [isExpanded, benefit.achieved]);
    
    const animatedIconStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));
    
    const animatedContentStyle = useAnimatedStyle(() => ({
      height: height.value,
      opacity: opacity.value,
      overflow: 'hidden',
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
            {benefit.category !== 'shared' && (
              <View style={styles.benefitCategoryBadge}>
                <Text style={styles.benefitCategoryText}>
                  {benefit.category === 'male' ? '♂ Male' : '♀ Female'}
                </Text>
              </View>
            )}
          </View>
          <Animated.View style={animatedIconStyle}>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={benefit.achieved ? COLORS.textSecondary : COLORS.textTertiary} 
            />
          </Animated.View>
        </View>
        
        <Animated.View style={animatedContentStyle}>
          <View style={styles.benefitDetails}>
            <Text style={styles.benefitDescription}>{benefit.description}</Text>
            <Text style={styles.benefitScientific}>{getBenefitExplanation(benefit, stats)}</Text>
            {benefit.achieved && (
              <View style={styles.benefitAchievedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                <Text style={styles.benefitAchievedText}>Achieved</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };
  
  // System Recovery Component
  const SystemRecovery = () => {
    // Fix: userProfile uses 'category' not 'productType'
    let productType = userProfile?.category || userProfile?.productType || 'cigarettes';
    
    // Check if this is a nicotine pouch product (handle legacy "other" category)
    const productName = userProfile?.nicotineProduct?.name?.toLowerCase() || '';
    
    // If category is "other" but the product name indicates pouches, update the type
    if (productType === 'other' && productName.includes('pouch')) {
      productType = 'pouches';
    }
    
    // Get product-specific body systems
    const getProductSystems = () => {
      const baseNeurological = {
        name: 'Brain & Nervous System',
        percentage: Math.round(recoveryData.neurologicalRecovery),
        icon: 'bulb',
        color: '#8B5CF6',
      };
      
      const baseCardiovascular = {
        name: 'Heart & Circulation',
        percentage: Math.round(recoveryData.metrics.cardiovascular_function?.value || 0),
        icon: 'heart',
        color: '#EF4444',
      };
      
      switch (productType) {
        case 'cigarettes':
          return [
            baseNeurological,
            baseCardiovascular,
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
          
        case 'vape':
          return [
            baseNeurological,
            baseCardiovascular,
            {
              name: 'Lungs & Airways',
              percentage: Math.round(recoveryData.metrics.respiratory_function?.value || 0),
              icon: 'cloud',
              color: '#06B6D4',
            },
            {
              name: 'Chemical Detox',
              percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
              icon: 'water',
              color: '#14B8A6',
            },
          ];
          
        case 'dip':
        case 'chew_dip':
          return [
            baseNeurological,
            baseCardiovascular,
            {
              name: 'Oral Health',
              percentage: Math.round(recoveryData.metrics.oral_health?.value || 0),
              icon: 'happy',
              color: '#EC4899',
            },
            {
              name: 'Jaw & TMJ',
              percentage: Math.round(recoveryData.metrics.tmj_recovery?.value || 0),
              icon: 'body',
              color: '#F59E0B',
            },
          ];
          
        case 'pouches':
        case 'nicotine_pouches':
          return [
            baseNeurological,
            baseCardiovascular,
            {
              name: 'Gum Health',
              percentage: Math.round(recoveryData.metrics.oral_health?.value || 0),
              icon: 'medical',
              color: '#10B981',
            },
            {
              name: 'Addiction Recovery',
              percentage: Math.round(recoveryData.metrics.addiction_recovery?.value || 0),
              icon: 'refresh',
              color: '#8B5CF6',
            },
          ];
          
        default:
          // Default to basic systems if unknown product type
          return [baseNeurological, baseCardiovascular];
      }
    };
    
    const systems = getProductSystems();
    
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
            <Text style={styles.title}>
              {(() => {
                let productName = '';
                const productType = userProfile?.category || userProfile?.productType || 'cigarettes';
                
                if (productType === 'cigarettes') productName = 'Cigarette';
                else if (productType === 'vape') productName = 'Vape';
                else if (productType === 'pouches' || productType === 'nicotine_pouches' || 
                  (productType === 'other' && userProfile?.nicotineProduct?.name?.toLowerCase().includes('pouch'))) {
                  productName = 'Nicotine Pouch';
                }
                else if (productType === 'chewing' || productType === 'dip' || productType === 'chew_dip') productName = 'Dip/Chew';
                else productName = 'Nicotine';
                
                return productName;
              })()}{' '}Recovery
            </Text>
            {user?.gender === 'male' || user?.gender === 'female' 
              ? <Text style={styles.personalizedText}>Personalized benefits based on your profile</Text>
              : null}
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
                {user?.gender === 'male' || user?.gender === 'female' 
                  ? 'Personalized benefits based on your profile'
                  : 'Your body starts healing immediately'}
              </Text>
              {genderBenefits.map((benefit) => (
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
  personalizedText: {
    fontSize: 14,
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
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  benefitDescription: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  benefitScientific: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  benefitAchievedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  benefitAchievedText: {
    fontSize: 13,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  benefitCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    padding: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  benefitCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
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