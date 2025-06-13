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
  withSequence,
  FadeIn,
  FadeOut,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const nicotinePouchMilestones = [
  { day: 1, title: "The Fog Lifts Soon", description: "Brain fog is common as your dopamine levels begin to reset. This is a sign of healing. Stay hydrated and be patient with yourself.", icon: 'brain', iconSet: 'MaterialCommunityIcons' },
  { day: 3, title: "Peak Withdrawal", description: "Headaches and dizziness are normal as your body clears out the last of the nicotine. Your circulation is already improving.", icon: 'head-alert-outline', iconSet: 'MaterialCommunityIcons' },
  // ... keep other milestones
]

const ProgressScreen: React.FC = () => {
  const stats = useSelector((state: RootState) => state.progress.stats);
  const userProfile = useSelector((state: RootState) => state.progress.userProfile);
  const user = useSelector((state: RootState) => state.auth.user);
  const [recoveryData, setRecoveryData] = useState<ScientificRecoveryData | null>(null);
  const [expandedBenefit, setExpandedBenefit] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'benefits' | 'systems'>('benefits');
  const [genderBenefits, setGenderBenefits] = useState<GenderSpecificBenefit[]>([]);
  const [expandedSystem, setExpandedSystem] = useState<string | null>(null);
  
  const getPhase = (score: number) => {
    if (score < 15) return { name: 'Initial Healing', color: '#34D399', icon: 'leaf-outline' as const };
    if (score < 50) return { name: 'System Recovery', color: '#60A5FA', icon: 'shield-checkmark-outline' as const };
    if (score < 90) return { name: 'Risk Reduction', color: '#F472B6', icon: 'fitness-outline' as const };
    return { name: 'Full Recovery', color: '#A78BFA', icon: 'star-outline' as const };
  };

  const currentPhase = getPhase(recoveryData?.overallRecovery || 0);

  useEffect(() => {
    if (stats) {
      const data = calculateScientificRecovery(stats.daysClean, userProfile);
      setRecoveryData(data);
      
      const productType = userProfile?.category || userProfile?.productType || 'cigarettes';
      let customMilestones: GenderSpecificBenefit[] = [];

      if (productType === 'pouches') {
        customMilestones = [
          { day: 1, title: "The Fog Will Lift", description: "Brain fog is your dopamine levels resetting. It's a sign of healing. Stay hydrated and be patient with yourself.", icon: 'cloudy-outline', color: '#818CF8' },
          { day: 3, title: "Your Brain is Rewiring", description: "Headaches and irritability are signs your brain is building new, healthy pathways. The worst is almost over.", icon: 'git-network-outline', color: '#818CF8' },
        ].map(m => ({ ...m, id: `pouch-${m.day}`, timeframe: `Day ${m.day}`, achieved: stats.daysClean >= m.day, category: 'shared', iconSet: 'Ionicons', daysRequired: m.day }));
      
      } else if (productType === 'chewing' || productType === 'dip' || productType === 'chew_dip') {
        customMilestones = [
          { day: 1, title: "Oral Fixation is Real", description: "The need to have something in your mouth is strong. Try sunflower seeds or sugar-free gum.", icon: 'nutrition-outline', color: '#10B981' },
          { day: 3, title: "Your Mouth is Healing", description: "Soreness in your gums is a sign that blood flow is returning to damaged tissues. This is recovery.", icon: 'medkit-outline', color: '#10B981' },
        ].map(m => ({ ...m, id: `chew-${m.day}`, timeframe: `Day ${m.day}`, achieved: stats.daysClean >= m.day, category: 'shared', iconSet: 'Ionicons', daysRequired: m.day }));

      } else if (productType === 'vape' || productType === 'vaping') {
        customMilestones = [
          { day: 1, title: "Your Lungs are Calling for Air", description: "Chest tightness and coughing is your body starting its deep cleaning process. It gets better.", icon: 'cloud-outline', color: '#60A5FA' },
          { day: 3, title: "The 'Vaper's Flu' is Temporary", description: "Feeling irritable or like you have a cold is a normal part of your body expelling toxins.", icon: 'thermometer-outline', color: '#60A5FA' },
        ].map(m => ({ ...m, id: `vape-${m.day}`, timeframe: `Day ${m.day}`, achieved: stats.daysClean >= m.day, category: 'shared', iconSet: 'Ionicons', daysRequired: m.day }));
      }
      
      let benefits = getGenderSpecificBenefits(productType, user?.gender, stats);
      const existingIds = new Set(benefits.map(b => b.timeframe));
      const newBenefits = customMilestones.filter(m => !existingIds.has(m.timeframe));
      benefits = [...newBenefits, ...benefits];
      
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
          colors={['rgba(99, 102, 241, 0.08)', 'rgba(139, 92, 246, 0.04)']}
          style={styles.phaseGradient}
        >
          {/* Phase Header */}
          <View style={styles.phaseHeader}>
            <View style={styles.phaseTopRow}>
              <View style={styles.phaseInfo}>
                <View style={styles.phaseLabelRow}>
                  <Ionicons name={currentPhase.icon} size={16} color={currentPhase.color} />
                  <Text style={styles.phaseLabel}>CURRENT PHASE</Text>
                </View>
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
    
    React.useEffect(() => {
      rotation.value = withSpring(isExpanded ? 180 : 0, {
        damping: 15,
        stiffness: 150,
      });
      
      if (isExpanded) {
        height.value = withSpring(150, {
          damping: 15,
          stiffness: 100,
        });
        opacity.value = withTiming(1, { duration: 250 });
      } else {
        opacity.value = withTiming(0, { duration: 150 });
        height.value = withTiming(0, { duration: 200 });
      }
    }, [isExpanded]);
    
    const animatedIconStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));
    
    const animatedContentStyle = useAnimatedStyle(() => ({
      height: height.value,
      opacity: opacity.value,
      marginTop: interpolate(height.value, [0, 150], [0, 12]),
      overflow: 'hidden',
    }));
    
    return (
      <TouchableOpacity 
        style={[
          styles.benefitCard,
          benefit.achieved && styles.benefitCardAchieved,
          !benefit.achieved && styles.benefitCardLocked,
        ]}
        onPress={() => benefit.achieved && setExpandedBenefit(isExpanded ? null : benefit.id)}
        activeOpacity={benefit.achieved ? 0.7 : 1}
        disabled={!benefit.achieved}
      >
        <View style={styles.benefitHeader}>
          <View style={[
            styles.benefitIcon,
            { backgroundColor: benefit.color + '20' },
            !benefit.achieved && styles.benefitIconLocked,
          ]}>
            <Ionicons 
              name={benefit.icon as any}
              size={24} 
              color={benefit.achieved ? benefit.color : COLORS.textSecondary} 
            />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTimeframe}>{benefit.timeframe}</Text>
            <Text 
              style={[
                styles.benefitTitle,
                !benefit.achieved && styles.benefitTitleLocked,
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.9}
            >
              {benefit.title}
            </Text>
            {benefit.category !== 'shared' && (
              <View style={styles.benefitCategoryBadge}>
                <Ionicons 
                  name={benefit.category === 'male' ? 'male' : 'female'} 
                  size={10} 
                  color={COLORS.secondary} 
                />
                <Text style={styles.benefitCategoryText}>
                  {benefit.category === 'male' ? 'Male' : 'Female'}
                </Text>
              </View>
            )}
          </View>
          {benefit.achieved && (
            <Animated.View style={[animatedIconStyle, styles.benefitChevron]}>
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={COLORS.textSecondary} 
              />
            </Animated.View>
          )}
        </View>
        
        {isExpanded && benefit.achieved && (
          <Animated.View style={animatedContentStyle}>
            <View style={styles.benefitDetails}>
              <Text style={styles.benefitDescription}>{benefit.description}</Text>
              <Text style={styles.benefitScientific}>{getBenefitExplanation(benefit, stats)}</Text>
              <View style={styles.benefitAchievedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.benefitAchievedText}>Achieved</Text>
              </View>
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };
  
  // System Recovery Component
  const SystemRecovery = () => {
    // Define the system interface
    interface SystemData {
      name: string;
      percentage: number;
      icon: string;
      color: string;
    }
    
    const getSystemDescription = (systemName: string): string => {
      switch (systemName) {
        case 'Neurological Recovery':
          return 'Your brain\'s reward system is healing from nicotine dependence. This includes dopamine receptors, neural pathways, and overall brain chemistry.';
        case 'Cardiovascular Health':
          return 'Your heart and blood vessels are recovering. Blood pressure normalizes, circulation improves, and heart disease risk decreases.';
        case 'Respiratory Function':
          return 'Your lungs are clearing out toxins and healing. Breathing becomes easier, lung capacity increases, and cilia regrow.';
        case 'Chemical Detox':
          return 'Your body is eliminating nicotine and other harmful chemicals. Liver function improves and toxins are flushed from your system.';
        case 'Gum Health':
          return 'Your gums and oral tissues are healing from nicotine damage. Blood flow improves, inflammation reduces, and tissue regenerates.';
        case 'Immune System':
          return 'Your immune system is strengthening. White blood cell counts normalize and your body becomes better at fighting infections.';
        case 'Energy & Metabolism':
          return 'Your energy production and metabolism are stabilizing. Fatigue decreases as your cells become more efficient without nicotine.';
        case 'Digestive Health':
          return 'Your digestive system is healing. Gut bacteria rebalance, nutrient absorption improves, and digestive discomfort decreases.';
        default:
          return '';
      }
    };
    
    const SystemCard = ({ system, index }: { system: SystemData; index: number }) => {
      const isExpanded = expandedSystem === system.name;
      const rotation = useSharedValue(0);
      const height = useSharedValue(0);
      const opacity = useSharedValue(0);
      
      React.useEffect(() => {
        rotation.value = withSpring(isExpanded ? 180 : 0, {
          damping: 15,
          stiffness: 150,
        });
        
        if (isExpanded) {
          // Increase height to accommodate full description text
          height.value = withSpring(120, {
            damping: 15,
            stiffness: 100,
          });
          opacity.value = withTiming(1, { duration: 250 });
        } else {
          opacity.value = withTiming(0, { duration: 150 });
          height.value = withTiming(0, { duration: 200 });
        }
      }, [isExpanded]);
      
      const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
      }));
      
      const animatedContentStyle = useAnimatedStyle(() => ({
        height: height.value,
        opacity: opacity.value,
        marginTop: interpolate(height.value, [0, 120], [0, 8]),
        overflow: 'hidden',
      }));
      
      const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
      }));
      
      return (
        <TouchableOpacity 
          style={styles.systemCard}
          onPress={() => setExpandedSystem(expandedSystem === system.name ? null : system.name)}
          activeOpacity={0.7}
        >
          <View style={styles.systemHeader}>
            <View style={styles.systemInfo}>
              <Ionicons name={system.icon as any} size={24} color={system.color} />
              <Text style={styles.systemName}>{system.name}</Text>
            </View>
            <View style={styles.systemRight}>
              <Text style={[styles.systemPercentage, { color: system.color }]}>{system.percentage}%</Text>
              <Animated.View style={animatedStyle}>
                <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
              </Animated.View>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${system.percentage}%`,
                    backgroundColor: system.color,
                  }
                ]} 
              />
            </View>
          </View>
          
          <Animated.View style={animatedContentStyle}>
            <View style={styles.systemDetails}>
              <Text style={styles.systemDescription}>
                {getSystemDescription(system.name)}
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      );
    };
    
    const getProductSystems = () => {
      const baseNeurological = {
        name: 'Neurological Recovery',
        percentage: Math.round(recoveryData.neurologicalRecovery || 0),
        icon: 'bulb-outline',
        color: '#6366F1',
      };
      
      const baseCardiovascular = {
        name: 'Cardiovascular Health',
        percentage: Math.round(recoveryData.metrics.cardiovascular_function?.value || 0),
        icon: 'heart-outline',
        color: '#EF4444',
      };
      
      const productType = userProfile?.category || userProfile?.productType || 'cigarettes';
      
      switch (productType) {
        case 'cigarettes':
          return [
            baseNeurological,
            baseCardiovascular,
            {
              name: 'Respiratory Function',
              percentage: Math.round(recoveryData.metrics.respiratory_function?.value || 0),
              icon: 'cloud-outline',
              color: '#06B6D4',
            },
            {
              name: 'Chemical Detox',
              percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
              icon: 'water-outline',
              color: '#10B981',
            },
            {
              name: 'Immune System',
              percentage: Math.round(recoveryData.metrics.inflammatory_markers?.value || 0),
              icon: 'shield-checkmark-outline',
              color: '#8B5CF6',
            },
          ];
          
        case 'vape':
          return [
            baseNeurological,
            baseCardiovascular,
            {
              name: 'Respiratory Function',
              percentage: Math.round(recoveryData.metrics.respiratory_function?.value || 0),
              icon: 'cloud-outline',
              color: '#06B6D4',
            },
            {
              name: 'Chemical Detox',
              percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
              icon: 'water-outline',
              color: '#10B981',
            },
            {
              name: 'Energy & Metabolism',
              percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
              icon: 'flash-outline',
              color: '#F59E0B',
            },
          ];
          
        case 'chewing':
        case 'dip':
        case 'chew_dip':
          return [
            baseNeurological,
            baseCardiovascular,
            {
              name: 'Gum Health',
              percentage: Math.round(recoveryData.metrics.oral_health?.value || 0),
              icon: 'medical-outline',
              color: '#10B981',
            },
            {
              name: 'Chemical Detox',
              percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
              icon: 'water-outline',
              color: '#06B6D4',
            },
            {
              name: 'Digestive Health',
              percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
              icon: 'nutrition-outline',
              color: '#8B5CF6',
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
              icon: 'medical-outline',
              color: '#10B981',
            },
            {
              name: 'Energy & Metabolism',
              percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
              icon: 'flash-outline',
              color: '#F59E0B',
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
          <SystemCard key={index} system={system} index={index} />
        ))}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#0A0F1C', '#000000']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="pulse-outline" size={28} color={COLORS.primary} />
              <Text style={styles.title}>Recovery Progress</Text>
            </View>
            {user?.gender !== 'other' && (
              <View style={styles.personalizedBadge}>
                <Ionicons name="person-circle-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.personalizedText}>Personalized for you</Text>
              </View>
            )}
          </View>
          
          {/* Current Phase Card */}
          <CurrentPhaseCard />
          
          {/* Tab Selector */}
          <TabSelector />
          
          {/* Content based on selected tab */}
          {selectedTab === 'benefits' ? (
            <View style={styles.contentContainer}>
              <Text style={styles.sectionTitle}>Recovery Timeline</Text>
              <Text style={styles.sectionSubtitle}>Key health milestones on your journey.</Text>
              {genderBenefits.map((benefit) => (
                <BenefitCard key={benefit.id} benefit={benefit} />
              ))}
            </View>
          ) : (
            <View style={styles.contentContainer}>
              <Text style={styles.sectionTitle}>Body System Recovery</Text>
              <Text style={styles.sectionSubtitle}>How your systems are healing over time.</Text>
              <SystemRecovery />
            </View>
          )}
          
          {/* Scientific Note */}
          <View style={styles.noteCard}>
            <View style={styles.noteIcon}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} />
            </View>
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
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0F1C',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 3,
  },
  
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  personalizedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
    gap: 4,
  },
  personalizedText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  
  phaseCard: {
    margin: SPACING.lg,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  phaseGradient: {
    padding: SPACING.lg,
  },
  phaseHeader: {
    marginBottom: SPACING.lg,
  },
  phaseTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  phaseInfo: {
    flex: 1,
  },
  phaseLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginLeft: 6,
  },
  phaseName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  phaseTimeframe: {
    fontSize: 14,
    color: COLORS.textSecondary,
    opacity: 0.7,
  },
  phaseScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  phaseScore: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.text,
  },
  phaseScoreUnit: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  phaseProgressContainer: {
    marginBottom: SPACING.lg,
  },
  phaseProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  phaseProgressFill: {
    height: '100%',
  },
  phaseProgressGradient: {
    flex: 1,
  },
  phaseProgressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  phaseDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  phaseProcesses: {
    marginTop: SPACING.sm,
  },
  phaseProcessesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  phaseProcess: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  phaseProcessDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 7,
    marginRight: SPACING.sm,
  },
  phaseProcessText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFF',
  },
  
  contentContainer: {
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
    opacity: 0.8,
  },
  benefitCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  benefitCardAchieved: {
    borderColor: 'rgba(99, 102, 241, 0.3)',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  benefitCardLocked: {
    opacity: 0.5,
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  benefitIconLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  benefitContent: {
    flex: 1,
    marginRight: SPACING.sm,
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
    lineHeight: 20,
  },
  benefitTitleLocked: {
    color: COLORS.textSecondary,
  },
  benefitChevron: {
    padding: 4,
  },
  benefitDetails: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
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
    fontStyle: 'italic',
    opacity: 0.8,
  },
  benefitAchievedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  benefitAchievedText: {
    fontSize: 13,
    color: "#10B981",
    marginLeft: 4,
    fontWeight: '600',
  },
  benefitCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 4,
  },
  benefitCategoryText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  
  systemsContainer: {
    gap: SPACING.sm,
  },
  systemCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  systemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  systemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  systemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  systemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  systemPercentage: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBarContainer: {
    marginTop: SPACING.md,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  systemDetails: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  systemDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  noteIcon: {
    marginRight: SPACING.sm,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
});

export default ProgressScreen; 