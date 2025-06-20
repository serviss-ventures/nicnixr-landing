import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { COLORS, SPACING } from '../../../constants/theme';
import { ProgressStats, User } from '../../../types';
import { calculateScientificRecovery, ScientificRecoveryData } from '../../../services/scientificRecoveryService';
import { getGenderSpecificBenefits, GenderSpecificBenefit, getBenefitExplanation } from '../../../services/genderSpecificRecoveryService';
import { achievementService, ProgressMilestone } from '../../../services/achievementService';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

interface JourneyTabProps {
  stats: ProgressStats | null;
  user: User | null;
}

const JourneyTab: React.FC<JourneyTabProps> = ({ stats, user }) => {
  const navigation = useNavigation<any>();
  
  // Initialize with default values to prevent flash
  const [recoveryData, setRecoveryData] = useState<ScientificRecoveryData>(() => {
    const userProfile = {
      category: user?.nicotineProduct?.category || 'cigarettes',
      productType: user?.nicotineProduct?.category || 'cigarettes',
    };
    return calculateScientificRecovery(stats?.daysClean || 0, userProfile);
  });
  const [genderBenefits, setGenderBenefits] = useState<GenderSpecificBenefit[]>(() => {
    if (!stats || !user) return [];
    return getGenderSpecificBenefits(
      user?.nicotineProduct?.category || 'cigarettes',
      user?.gender,
      stats
    );
  });
  const [dbMilestones, setDbMilestones] = useState<ProgressMilestone[]>([]);
  const [selectedSection, setSelectedSection] = useState<'timeline' | 'systems'>('timeline');
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(true);
  
  // Get current milestone - the most recently achieved benefit
  const currentMilestone = genderBenefits
    .filter(b => b.achieved)
    .sort((a, b) => {
      // Sort by daysRequired to get the most recent achievement
      // Higher daysRequired = more recent achievement
      return b.daysRequired - a.daysRequired;
    })[0];
  
  // Fetch milestones from database
  useEffect(() => {
    const fetchMilestones = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoadingMilestones(true);
        
        // Initialize milestones if needed
        await achievementService.initializeUserMilestones(
          user.id,
          user.gender || 'prefer-not-to-say',
          user.nicotineProduct?.category || 'cigarettes'
        );
        
        // Fetch user milestones
        const milestones = await achievementService.getUserMilestones(user.id);
        setDbMilestones(milestones);
        
        // Update milestones based on current progress
        await achievementService.updateProgressMilestones(user.id);
      } catch (error) {
        console.error('Failed to fetch milestones:', error);
      } finally {
        setIsLoadingMilestones(false);
      }
    };
    
    fetchMilestones();
  }, [user?.id, user?.gender, user?.nicotineProduct?.category]);
  
  // Calculate recovery data when stats change
  useEffect(() => {
    if (stats && user) {
      // Get user profile data (nicotine type, etc.)
      const userProfile = {
        category: user.nicotineProduct?.category || 'cigarettes',
        productType: user.nicotineProduct?.category || 'cigarettes',
      };
      
      // Calculate scientific recovery
      const data = calculateScientificRecovery(stats.daysClean, userProfile);
      setRecoveryData(data);
      
      // Get gender-specific benefits
      const benefits = getGenderSpecificBenefits(
        userProfile.category,
        user.gender,
        stats
      );
      setGenderBenefits(benefits);
    }
  }, [stats, user]);
  
  // No need for loading state since we initialize with values
  
  // Section Selector
  const SectionSelector = () => (
    <View style={styles.sectionSelector}>
      <TouchableOpacity
        style={[
          styles.sectionButton,
          selectedSection === 'timeline' && styles.sectionButtonActive
        ]}
        onPress={() => setSelectedSection('timeline')}
      >
        <Ionicons 
          name="time-outline" 
          size={18} 
          color={selectedSection === 'timeline' ? COLORS.text : COLORS.textSecondary} 
        />
        <Text style={[
          styles.sectionButtonText,
          selectedSection === 'timeline' && styles.sectionButtonTextActive
        ]}>
          Timeline
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.sectionButton,
          selectedSection === 'systems' && styles.sectionButtonActive
        ]}
        onPress={() => setSelectedSection('systems')}
      >
        <Ionicons 
          name="body-outline" 
          size={18} 
          color={selectedSection === 'systems' ? COLORS.text : COLORS.textSecondary} 
        />
        <Text style={[
          styles.sectionButtonText,
          selectedSection === 'systems' && styles.sectionButtonTextActive
        ]}>
          Body Systems
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  // Current Phase Card
  const CurrentPhaseCard = () => {
    const phase = recoveryData.phase;
    const progress = Math.min((stats.daysClean / phase.endDay) * 100, 100);
    
    return (
      <View style={styles.phaseCard}>
        <View style={styles.phaseHeader}>
          <View>
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
        
        <View style={styles.phaseProgressBar}>
          <View style={[styles.phaseProgressFill, { width: `${progress}%` }]} />
        </View>
        
        <Text style={styles.phaseDescription}>{phase.description}</Text>
      </View>
    );
  };
  
  // AI Coach Button Component
  const AICoachButton = ({ benefit, isVisible }: { benefit: GenderSpecificBenefit; isVisible: boolean }) => {
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: withTiming(isVisible ? 1 : 0, { duration: 200 }),
    }));
    
    const handlePress = () => {
      // Navigate to the Dashboard tab, then to AICoach screen
      navigation.navigate('DashboardTab', {
        screen: 'AICoach',
        params: {
          context: 'milestone',
          milestone: {
            title: benefit.title,
            timeframe: benefit.timeframe,
            description: benefit.description,
            scientificExplanation: benefit.scientificExplanation,
            daysRequired: benefit.daysRequired,
            achieved: benefit.achieved,
          }
        }
      });
    };
    
    if (!isVisible) return null;
    
    return (
      <Animated.View style={[styles.aiCoachButtonContainer, animatedStyle]}>
        <TouchableOpacity
          style={styles.aiCoachButton}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(192, 132, 252, 0.15)', 'rgba(192, 132, 252, 0.05)']}
            style={styles.aiCoachGradient}
          >
            <View style={styles.aiCoachIconWrapper}>
              <Ionicons name="sparkles" size={14} color="rgba(192, 132, 252, 0.8)" />
            </View>
            <Text style={styles.aiCoachText}>Learn More</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  // Timeline Milestone Card
  const TimelineMilestone = ({ benefit, index }: { benefit: GenderSpecificBenefit; index: number }) => {
    const isAchieved = benefit.achieved;
    const [isExpanded, setIsExpanded] = useState(false);
    
    const chevronStyle = useAnimatedStyle(() => ({
      transform: [{ 
        rotate: withTiming(`${isExpanded ? 180 : 0}deg`, { duration: 200 }) 
      }],
    }));
    
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).duration(400)}
        style={styles.timelineItem}
      >
        {/* Timeline connector */}
        {index < genderBenefits.length - 1 && (
          <View style={[
            styles.timelineConnector,
            isAchieved && styles.timelineConnectorActive
          ]} />
        )}
        
        {/* Milestone dot */}
        <View style={[
          styles.timelineDot,
          isAchieved && styles.timelineDotActive,
          !isAchieved && styles.timelineDotFuture,
        ]}>
          {isAchieved && (
            <Ionicons name="checkmark" size={12} color="#000" />
          )}
        </View>
        
        {/* Milestone content */}
        <View style={[
          styles.timelineContentWrapper,
          isAchieved && styles.timelineContentWrapperActive,
          !isAchieved && styles.timelineContentWrapperFuture,
        ]}>
          <TouchableOpacity
            style={styles.timelineContent}
            onPress={() => {
              if (isAchieved) {
                setIsExpanded(!isExpanded);
              }
            }}
            activeOpacity={isAchieved ? 0.7 : 1}
            disabled={!isAchieved}
          >
            <View style={styles.timelineHeader}>
              <View style={styles.timelineInfo}>
                <Text style={[
                  styles.timelineTime,
                  !isAchieved && styles.timelineTimeFuture
                ]}>
                  {benefit.timeframe}
                </Text>
                <Text style={[
                  styles.timelineTitle,
                  !isAchieved && styles.timelineTitleFuture
                ]}>
                  {benefit.title}
                </Text>
                {benefit.category !== 'shared' && (
                  <View style={[
                    styles.genderBadge,
                    { backgroundColor: benefit.category === 'male' 
                      ? 'rgba(147, 197, 253, 0.08)' // Much softer blue
                      : 'rgba(244, 114, 182, 0.08)' // Much softer pink
                    }
                  ]}>
                    <Ionicons 
                      name={benefit.category === 'male' ? 'male' : 'female'} 
                      size={10} 
                      color={benefit.category === 'male' 
                        ? 'rgba(147, 197, 253, 0.6)' // Softer icon color
                        : 'rgba(244, 114, 182, 0.6)'
                      } 
                    />
                  </View>
                )}
              </View>
              {isAchieved && (
                <Animated.View style={chevronStyle}>
                  <Ionicons 
                    name="chevron-down" 
                    size={16} 
                    color={COLORS.textSecondary} 
                  />
                </Animated.View>
              )}
            </View>
          </TouchableOpacity>
          
          {/* Collapsible content */}
          {isAchieved && isExpanded && (
            <Animated.View 
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              style={styles.timelineCollapsible}
            >
              <Text style={styles.timelineDescription}>{benefit.description}</Text>
              {getAdditionalContext(benefit) && (
                <Text style={styles.timelineContext}>
                  {getAdditionalContext(benefit)}
                </Text>
              )}
              <AICoachButton benefit={benefit} isVisible={isExpanded} />
            </Animated.View>
          )}
        </View>
      </Animated.View>
    );
  };
  
  // Add comprehensive explanation function
  const getComprehensiveExplanation = (benefit: GenderSpecificBenefit, stats: ProgressStats): string => {
    // Use the existing getBenefitExplanation from the service
    const explanation = getBenefitExplanation(benefit, stats);
    
    // Add more context based on the benefit type
    const additionalContext = getAdditionalContext(benefit);
    
    return explanation + (additionalContext ? '\n\n' + additionalContext : '');
  };
  
  // Get additional context for benefits
  const getAdditionalContext = (benefit: GenderSpecificBenefit): string => {
    const timeframe = benefit.timeframe.toLowerCase();
    const daysClean = stats?.daysClean || 0;
    
    if (timeframe.includes('20 minutes')) {
      return 'Your heart rate is already dropping back to normal.';
    } else if (timeframe.includes('2 hours')) {
      return 'Nicotine is leaving your bloodstream. Freedom begins.';
    } else if (timeframe.includes('8 hours')) {
      return 'Oxygen levels normalizing. Your cells are celebrating.';
    } else if (timeframe.includes('12 hours')) {
      return 'Carbon monoxide cleared. Pure oxygen flows again.';
    } else if (timeframe.includes('24 hours') || timeframe.includes('day 1')) {
      return 'The chemical chains are breaking. Your courage is remarkable.';
    } else if (timeframe.includes('48 hours') || timeframe.includes('day 2')) {
      return 'Nerve endings awakening. Taste and smell returning.';
    } else if (timeframe.includes('72 hours') || timeframe.includes('day 3')) {
      return 'The storm is passing. Your strength got you here.';
    } else if (timeframe.includes('week 1')) {
      return 'Brain fog lifting. Mental clarity emerging from the haze.';
    } else if (timeframe.includes('week 2')) {
      return 'Circulation improving dramatically. Energy surging back.';
    } else if (timeframe.includes('week 3')) {
      return 'Lung function increasing. Each breath comes easier.';
    } else if (timeframe.includes('week 4') || timeframe.includes('month 1')) {
      return 'Cilia regenerating. Your body\'s cleaning crew is back.';
    } else if (timeframe.includes('month 2')) {
      return 'Blood flow restored. Healing accelerates everywhere.';
    } else if (timeframe.includes('month 3')) {
      return 'Fertility improving. Life force strengthening within.';
    } else if (timeframe.includes('month 6')) {
      return 'Airways clearing. Breathing feels effortless now.';
    } else if (timeframe.includes('year')) {
      return 'Disease risk halved. You\'ve reclaimed your health.';
    } else if (timeframe.includes('month')) {
      // Generic month fallback
      const months = parseInt(timeframe.match(/\d+/)?.[0] || '1');
      if (months >= 9) {
        return 'Deep cellular repair. Your DNA is thanking you.';
      } else if (months >= 6) {
        return 'Immune system thriving. Resilience building daily.';
      } else if (months >= 4) {
        return 'Energy stabilizing. Natural rhythms returning.';
      }
      return 'Transformation deepening. Keep going.';
    }
    
    return 'Every moment without nicotine heals you further.';
  };
  
  // Timeline Section
  const TimelineSection = () => (
    <View style={styles.timelineContainer}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionIcon}>
          <Ionicons name="time-outline" size={20} color="rgba(147, 197, 253, 0.7)" />
        </View>
        <View>
          <Text style={styles.sectionTitle}>Recovery Milestones</Text>
          <Text style={styles.sectionSubtitle}>
            Your personalized journey to freedom
          </Text>
        </View>
      </View>
      
      <View style={styles.timeline}>
        {genderBenefits.map((benefit, index) => (
          <TimelineMilestone key={benefit.id} benefit={benefit} index={index} />
        ))}
      </View>
    </View>
  );
  
  // Body System Card
  const BodySystemCard = ({ system, index }: { system: any; index: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const animatedChevronStyle = useAnimatedStyle(() => ({
      transform: [{ 
        rotate: withTiming(`${isExpanded ? 180 : 0}deg`, { duration: 200 }) 
      }],
    }));
    
    // Get progress color based on percentage
    const getProgressColor = (percentage: number) => {
      if (percentage >= 80) return 'rgba(134, 239, 172, 0.6)'; // Green
      if (percentage >= 60) return 'rgba(147, 197, 253, 0.6)'; // Blue
      if (percentage >= 40) return 'rgba(251, 191, 36, 0.6)'; // Amber
      if (percentage >= 20) return 'rgba(248, 113, 113, 0.6)'; // Soft red
      return 'rgba(255, 255, 255, 0.4)'; // Default
    };
    
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).duration(400)}
        style={styles.systemCard}
      >
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.systemHeader}>
            <View style={styles.systemLeft}>
              <View style={[
                styles.systemIconWrapper,
                { backgroundColor: `${getProgressColor(system.percentage)}15` }
              ]}>
                <Ionicons 
                  name={system.icon as any} 
                  size={24} 
                  color={getProgressColor(system.percentage)} 
                />
              </View>
              <View>
                <Text style={styles.systemName}>{system.name}</Text>
                <Text style={styles.systemProgress}>{system.percentage}% recovered</Text>
              </View>
            </View>
            <Animated.View style={animatedChevronStyle}>
              <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
            </Animated.View>
          </View>
          
          {/* Progress Ring */}
          <View style={styles.progressRing}>
            <View style={styles.progressRingBackground} />
            <View 
              style={[
                styles.progressRingFill,
                { 
                  width: `${system.percentage}%`,
                  backgroundColor: getProgressColor(system.percentage)
                }
              ]} 
            />
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <Animated.View 
            entering={FadeIn.duration(200)}
            style={styles.systemDetails}
          >
            <Text style={styles.systemDescription}>
              {getSystemDescription(system.name, system.percentage)}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    );
  };
  
  // Get system description with progress-based messaging
  const getSystemDescription = (systemName: string, percentage: number): string => {
    const daysClean = stats?.daysClean || 0;
    
    switch (systemName) {
      case 'Neurological Recovery':
        if (percentage < 30) return 'Early stages: Dopamine receptors beginning to heal. Mood swings and cravings are normal as your brain adjusts.';
        if (percentage < 60) return 'Making progress: Neural pathways strengthening. Focus improving, cravings becoming less frequent.';
        if (percentage < 80) return 'Major improvements: Executive function restored. Natural pleasure response returning to normal.';
        return 'Nearly complete: Brain function optimized. Addiction pathways significantly weakened.';
        
      case 'Cardiovascular Health':
        if (daysClean < 1) return 'Just started: Heart rate and blood pressure beginning to normalize.';
        if (daysClean < 7) return 'First week: Blood oxygen levels improved. Heart working more efficiently.';
        if (daysClean < 30) return 'First month: Circulation significantly improved. Risk of heart attack dropping.';
        if (daysClean < 90) return 'Three months: Blood vessels more flexible. Cardiovascular fitness improving.';
        if (daysClean < 365) return 'Ongoing healing: Heart disease risk cut in half. Exercise capacity greatly improved.';
        return 'One year+: Cardiovascular system fully recovered. Heart disease risk same as non-smoker.';
        
      case 'Respiratory Function':
        if (daysClean < 3) return 'First days: Airways starting to relax. Breathing already becoming easier.';
        if (daysClean < 14) return 'Two weeks: Lung function improving. Coughing decreasing as cilia regrow.';
        if (daysClean < 30) return 'One month: Lung capacity up 10%. Less shortness of breath during activity.';
        if (daysClean < 90) return 'Three months: Significant lung healing. Exercise endurance noticeably better.';
        return 'Long-term: Lung function greatly restored. Risk of lung disease dramatically reduced.';
        
      case 'Chemical Detox':
        if (percentage < 40) return 'Active detox: Nicotine and toxins leaving your system. Metabolism adjusting.';
        if (percentage < 70) return 'Cleansing phase: Inflammatory markers decreasing. Cells repairing damage.';
        return 'Nearly clear: Most chemicals eliminated. Body\'s natural detox systems restored.';
        
      case 'Oral Health':
        if (percentage < 30) return 'Initial healing: Gum inflammation reducing. Blood flow to oral tissues improving.';
        if (percentage < 60) return 'Visible progress: Gums regaining healthy color. Oral sores healing.';
        return 'Major recovery: Oral cancer risk significantly reduced. Gum disease reversing.';
        
      case 'Energy & Metabolism':
        if (percentage < 50) return 'Stabilizing: Energy levels fluctuating as metabolism adjusts. Natural energy returning.';
        return 'Optimizing: Stable energy throughout the day. No more nicotine crashes.';
        
      default:
        return 'This system is recovering and healing from the effects of nicotine use.';
    }
  };
  
  // Get body systems based on product type
  const getBodySystems = () => {
    const productType = user?.nicotineProduct?.category || 'cigarettes';
    
    // Calculate aggregate scores for each system category
    const calculateCategoryScore = (category: string) => {
      const categoryMetrics = Object.entries(recoveryData.metrics)
        .filter(([key, metric]) => {
          // Map metric IDs to categories
          if (category === 'neurological') {
            return ['dopamine_receptors', 'prefrontal_function', 'neurotransmitter_balance', 'sleep_architecture', 'addiction_recovery'].includes(key);
          } else if (category === 'cardiovascular') {
            return ['cardiovascular_function'].includes(key);
          } else if (category === 'respiratory') {
            return ['respiratory_function'].includes(key);
          } else if (category === 'metabolic') {
            return ['metabolic_function', 'inflammatory_markers'].includes(key);
          } else if (category === 'oral') {
            return ['oral_health', 'tmj_recovery'].includes(key);
          }
          return false;
        });
      
      if (categoryMetrics.length === 0) return 0;
      
      const sum = categoryMetrics.reduce((acc, [_, metric]) => acc + metric.value, 0);
      return Math.round(sum / categoryMetrics.length);
    };
    
    const baseCardio = {
      name: 'Cardiovascular Health',
      percentage: Math.round(recoveryData.metrics.cardiovascular_function?.value || 0),
      icon: 'heart-outline',
    };
    
    const baseNeuro = {
      name: 'Neurological Recovery',
      percentage: calculateCategoryScore('neurological'),
      icon: 'flash-outline',
    };
    
    switch (productType) {
      case 'cigarettes':
      case 'vape':
        return [
          baseNeuro,
          baseCardio,
          {
            name: 'Respiratory Function',
            percentage: Math.round(recoveryData.metrics.respiratory_function?.value || 0),
            icon: 'cloud-outline',
          },
          {
            name: 'Chemical Detox',
            percentage: calculateCategoryScore('metabolic'),
            icon: 'water-outline',
          },
        ];
      
      case 'pouches':
      case 'nicotine_pouches':
      case 'chewing':
      case 'dip':
      case 'chew_dip':
        return [
          baseNeuro,
          baseCardio,
          {
            name: 'Oral Health',
            percentage: calculateCategoryScore('oral'),
            icon: 'medical-outline',
          },
          {
            name: 'Energy & Metabolism',
            percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
            icon: 'flash-outline',
          },
        ];
        
      default:
        return [baseNeuro, baseCardio];
    }
  };
  
  // Body Systems Section
  const BodySystemsSection = () => {
    const systems = getBodySystems();
    
    return (
      <View style={styles.systemsContainer}>
        <View style={styles.sectionHeaderRow}>
          <View style={[styles.sectionIcon, { backgroundColor: 'rgba(134, 239, 172, 0.08)' }]}>
            <Ionicons name="body-outline" size={20} color="rgba(134, 239, 172, 0.7)" />
          </View>
          <View>
            <Text style={styles.sectionTitle}>System Recovery</Text>
            <Text style={styles.sectionSubtitle}>
              How your body is healing over time
            </Text>
          </View>
        </View>
        
        <View style={styles.systemsList}>
          {systems.map((system, index) => (
            <BodySystemCard key={system.name} system={system} index={index} />
          ))}
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroDay}>Day {stats?.daysClean || 0}</Text>
          <Text style={styles.heroTitle}>
            {currentMilestone ? currentMilestone.title : 'Your Journey Begins'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {currentMilestone ? currentMilestone.description : 'Every moment is a victory'}
          </Text>
        </View>
      </View>

      <CurrentPhaseCard />
      <SectionSelector />
      
      {selectedSection === 'timeline' ? (
        <TimelineSection />
      ) : (
        <BodySystemsSection />
      )}
      
      {/* Scientific Note */}
      <View style={styles.noteCard}>
        <Ionicons name="information-circle-outline" size={18} color={COLORS.textSecondary} />
        <Text style={styles.noteText}>{recoveryData.scientificNote}</Text>
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Allow gradient to show through
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  
  // Phase Card
  phaseCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  phaseLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  phaseName: {
    fontSize: 20,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 4,
  },
  phaseTimeframe: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  phaseScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  phaseScore: {
    fontSize: 36,
    fontWeight: '300',
    color: COLORS.text,
  },
  phaseScoreUnit: {
    fontSize: 18,
    fontWeight: '300',
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  phaseProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 2,
    marginBottom: SPACING.md,
  },
  phaseProgressFill: {
    height: '100%',
    backgroundColor: 'rgba(147, 197, 253, 0.5)',
    borderRadius: 2,
  },
  phaseDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontWeight: '300',
  },
  
  // Section Selector
  sectionSelector: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  sectionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  sectionButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionButtonText: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  sectionButtonTextActive: {
    color: COLORS.text,
    fontWeight: '500',
  },
  
  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(147, 197, 253, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.15)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  
  // Timeline
  timelineContainer: {
    padding: SPACING.lg,
  },
  timeline: {
    position: 'relative',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  timelineConnector: {
    position: 'absolute',
    left: 11,
    top: 24,
    bottom: -SPACING.lg,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  timelineConnectorActive: {
    backgroundColor: 'rgba(147, 197, 253, 0.3)',
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timelineDotActive: {
    backgroundColor: 'rgba(134, 239, 172, 0.8)',
    borderColor: 'rgba(134, 239, 172, 0.2)',
  },
  timelineDotFuture: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  timelineContentWrapper: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  timelineContent: {
    padding: SPACING.md,
  },
  timelineContentWrapperActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timelineContentWrapperFuture: {
    opacity: 0.5,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  timelineInfo: {
    flex: 1,
  },
  timelineTime: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(147, 197, 253, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timelineTimeFuture: {
    color: COLORS.textSecondary,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 4,
  },
  timelineTitleFuture: {
    color: COLORS.textSecondary,
  },
  timelineCollapsible: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.sm,
  },
  timelineDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontWeight: '300',
    marginBottom: SPACING.sm,
  },
  timelineContext: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    fontWeight: '300',
    fontStyle: 'italic',
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  
  // Body Systems
  systemsContainer: {
    padding: SPACING.lg,
  },
  systemsList: {
    gap: SPACING.md,
  },
  systemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  systemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  systemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  systemIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  systemName: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 2,
  },
  systemProgress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  progressRing: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 3,
    marginTop: SPACING.md,
    overflow: 'hidden',
  },
  progressRingBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  progressRingFill: {
    height: '100%',
    borderRadius: 3,
  },
  systemDetails: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  systemDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontWeight: '300',
  },
  
  // Note Card
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: SPACING.sm,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    fontWeight: '300',
  },
  
  // AI Coach Button
  aiCoachButtonContainer: {
    marginTop: SPACING.md,
    alignSelf: 'flex-start',
  },
  aiCoachButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  aiCoachGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  aiCoachIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiCoachText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(192, 132, 252, 0.9)',
    letterSpacing: 0.3,
  },
  
  // Hero Section
  heroSection: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroDay: {
    fontSize: 48,
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -1,
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: COLORS.text,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '300',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default JourneyTab; 