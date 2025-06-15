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
    if (score < 15) return { name: 'Initial Healing', color: 'rgba(255, 255, 255, 0.6)', icon: 'leaf-outline' as const };
    if (score < 50) return { name: 'System Recovery', color: 'rgba(255, 255, 255, 0.7)', icon: 'shield-checkmark-outline' as const };
    if (score < 90) return { name: 'Risk Reduction', color: 'rgba(255, 255, 255, 0.8)', icon: 'fitness-outline' as const };
    return { name: 'Full Recovery', color: 'rgba(255, 255, 255, 0.95)', icon: 'star-outline' as const };
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
          { day: 1, title: "The Fog Will Lift", description: "Brain fog is your dopamine levels resetting. It's a sign of healing. Stay hydrated and be patient with yourself.", icon: 'cloudy-outline', color: '#9CA3AF' },
          { day: 3, title: "Your Brain is Rewiring", description: "Headaches and irritability are signs your brain is building new, healthy pathways. The worst is almost over.", icon: 'git-network-outline', color: '#9CA3AF' },
        ].map(m => ({ ...m, id: `pouch-${m.day}`, timeframe: `Day ${m.day}`, achieved: stats.daysClean >= m.day, category: 'shared', iconSet: 'Ionicons', daysRequired: m.day }));
      
      } else if (productType === 'chewing' || productType === 'dip' || productType === 'chew_dip') {
        customMilestones = [
          { day: 1, title: "Oral Fixation is Real", description: "The need to have something in your mouth is strong. Try sunflower seeds or sugar-free gum.", icon: 'nutrition-outline', color: '#9CA3AF' },
          { day: 3, title: "Your Mouth is Healing", description: "Soreness in your gums is a sign that blood flow is returning to damaged tissues. This is recovery.", icon: 'medkit-outline', color: '#9CA3AF' },
        ].map(m => ({ ...m, id: `chew-${m.day}`, timeframe: `Day ${m.day}`, achieved: stats.daysClean >= m.day, category: 'shared', iconSet: 'Ionicons', daysRequired: m.day }));

      } else if (productType === 'vape' || productType === 'vaping') {
        customMilestones = [
          { day: 1, title: "Your Lungs are Calling for Air", description: "Chest tightness and coughing is your body starting its deep cleaning process. It gets better.", icon: 'cloud-outline', color: '#9CA3AF' },
          { day: 3, title: "The 'Vaper's Flu' is Temporary", description: "Feeling irritable or like you have a cold is a normal part of your body expelling toxins.", icon: 'thermometer-outline', color: '#9CA3AF' },
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
        <ActivityIndicator size="large" color="#9CA3AF" />
      </View>
    );
  }
  
  // Current Phase Card Component
  const CurrentPhaseCard = () => {
    const phase = recoveryData.phase;
    const progress = (stats.daysClean / phase.endDay) * 100;
    const clampedProgress = Math.min(progress, 100);
    
    // Calculate subtle gradient colors based on progress
    const getProgressGradient = () => {
      if (clampedProgress >= 75) {
        // High progress - soft green gradient
        return [
          'rgba(134, 239, 172, 0.25)',
          'rgba(134, 239, 172, 0.15)'
        ];
      } else if (clampedProgress >= 50) {
        // Medium progress - soft blue gradient
        return [
          'rgba(147, 197, 253, 0.2)',
          'rgba(147, 197, 253, 0.12)'
        ];
      } else if (clampedProgress >= 25) {
        // Early progress - soft amber gradient
        return [
          'rgba(251, 191, 36, 0.2)',
          'rgba(251, 191, 36, 0.12)'
        ];
      } else {
        // Very early - subtle white
        const opacity = 0.15 + (clampedProgress / 100) * 0.1;
        return [
          `rgba(255, 255, 255, ${opacity})`,
          `rgba(255, 255, 255, ${opacity * 0.6})`
        ];
      }
    };
    
          return (
        <View style={[
          styles.phaseCard,
          {
            borderColor: clampedProgress >= 75
              ? 'rgba(134, 239, 172, 0.1)'
              : clampedProgress >= 50
              ? 'rgba(147, 197, 253, 0.08)'
              : clampedProgress >= 25
              ? 'rgba(251, 191, 36, 0.08)'
              : 'rgba(255, 255, 255, 0.06)'
          }
        ]}>
          <LinearGradient
            colors={[
              clampedProgress >= 75 
                ? 'rgba(134, 239, 172, 0.04)' // Soft green for high progress
                : clampedProgress >= 50
                ? 'rgba(147, 197, 253, 0.04)' // Soft blue for medium
                : clampedProgress >= 25
                ? 'rgba(251, 191, 36, 0.04)' // Soft amber for early
                : 'rgba(255, 255, 255, 0.03)',
              'rgba(255, 255, 255, 0.01)'
            ]}
            style={styles.phaseGradient}
          >
          {/* Phase Header */}
          <View style={styles.phaseHeader}>
            <View style={styles.phaseTopRow}>
              <View style={styles.phaseInfo}>
                <View style={styles.phaseLabelRow}>
                  <View style={[
                    styles.phaseIconWrapper, 
                    { 
                      backgroundColor: clampedProgress >= 75 
                        ? 'rgba(134, 239, 172, 0.1)' // Soft green for high progress
                        : clampedProgress >= 50
                        ? 'rgba(147, 197, 253, 0.08)' // Soft blue for medium
                        : clampedProgress >= 25
                        ? 'rgba(251, 191, 36, 0.08)' // Soft amber for early
                        : `rgba(255, 255, 255, ${0.05 + (clampedProgress / 100) * 0.03})`,
                      borderColor: clampedProgress >= 75
                        ? 'rgba(134, 239, 172, 0.2)'
                        : clampedProgress >= 50
                        ? 'rgba(147, 197, 253, 0.15)'
                        : clampedProgress >= 25
                        ? 'rgba(251, 191, 36, 0.15)'
                        : 'rgba(255, 255, 255, 0.06)'
                    }
                  ]}>
                    <Ionicons name={currentPhase.icon} size={16} color={currentPhase.color} />
                  </View>
                  <Text style={styles.phaseLabel}>CURRENT PHASE</Text>
                </View>
                <Text style={styles.phaseName}>{phase.name}</Text>
                <Text style={styles.phaseTimeframe}>
                  Days {phase.startDay}-{phase.endDay === Infinity ? '∞' : phase.endDay}
                </Text>
              </View>
              <View style={styles.phaseScoreContainer}>
                <Text style={[
                  styles.phaseScore,
                  {
                    color: clampedProgress >= 75
                      ? 'rgba(134, 239, 172, 0.95)' // Soft green
                      : clampedProgress >= 50
                      ? 'rgba(147, 197, 253, 0.95)' // Soft blue
                      : clampedProgress >= 25
                      ? 'rgba(251, 191, 36, 0.95)' // Soft amber
                      : COLORS.text
                  }
                ]}>{Math.round(recoveryData.overallRecovery)}</Text>
                <Text style={[
                  styles.phaseScoreUnit,
                  {
                    color: clampedProgress >= 75
                      ? 'rgba(134, 239, 172, 0.7)'
                      : clampedProgress >= 50
                      ? 'rgba(147, 197, 253, 0.7)'
                      : clampedProgress >= 25
                      ? 'rgba(251, 191, 36, 0.7)'
                      : COLORS.textSecondary
                  }
                ]}>%</Text>
                {clampedProgress >= 100 && (
                  <View style={styles.phaseCompleteBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="rgba(134, 239, 172, 0.9)" />
                  </View>
                )}
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
                  colors={getProgressGradient()}
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
                <View style={[styles.phaseProcessDot, { opacity: 0.3 + (index * 0.2) }]} />
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
        <View style={styles.tabContent}>
          <Ionicons 
            name="trending-up" 
            size={16} 
            color={selectedTab === 'benefits' ? 'rgba(147, 197, 253, 0.9)' : COLORS.textSecondary} 
          />
          <Text style={[styles.tabText, selectedTab === 'benefits' && styles.tabTextActive]}>
            Recovery Timeline
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedTab === 'systems' && styles.tabActive]}
        onPress={() => setSelectedTab('systems')}
      >
        <View style={styles.tabContent}>
          <Ionicons 
            name="body" 
            size={16} 
            color={selectedTab === 'systems' ? 'rgba(134, 239, 172, 0.9)' : COLORS.textSecondary} 
          />
          <Text style={[styles.tabText, selectedTab === 'systems' && styles.tabTextActive]}>
            Body Systems
          </Text>
        </View>
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
        {benefit.achieved && (
          <LinearGradient
            colors={[
              'rgba(134, 239, 172, 0.03)', // Soft green tint
              'rgba(134, 239, 172, 0.01)'
            ]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        <View style={styles.benefitHeader}>
          <View style={[
            styles.benefitIcon,
            { 
              backgroundColor: benefit.achieved 
                ? benefit.daysRequired <= 7 
                  ? 'rgba(147, 197, 253, 0.08)' // Early recovery - soft blue
                  : benefit.daysRequired <= 30
                  ? 'rgba(134, 239, 172, 0.08)' // Mid recovery - soft green  
                  : benefit.daysRequired <= 90
                  ? 'rgba(251, 191, 36, 0.08)' // Later recovery - soft amber
                  : 'rgba(192, 132, 252, 0.08)' // Long term - soft purple
                : 'rgba(255, 255, 255, 0.03)',
              borderColor: benefit.achieved
                ? benefit.daysRequired <= 7
                  ? 'rgba(147, 197, 253, 0.15)'
                  : benefit.daysRequired <= 30
                  ? 'rgba(134, 239, 172, 0.15)'
                  : benefit.daysRequired <= 90
                  ? 'rgba(251, 191, 36, 0.15)'
                  : 'rgba(192, 132, 252, 0.15)'
                : 'rgba(255, 255, 255, 0.06)'
            },
            !benefit.achieved && styles.benefitIconLocked,
          ]}>
            <Ionicons 
              name={benefit.icon as any}
              size={22} 
              color={
                benefit.achieved 
                  ? benefit.daysRequired <= 7
                    ? 'rgba(147, 197, 253, 0.8)' // Soft blue
                    : benefit.daysRequired <= 30
                    ? 'rgba(134, 239, 172, 0.8)' // Soft green
                    : benefit.daysRequired <= 90
                    ? 'rgba(251, 191, 36, 0.8)' // Soft amber
                    : 'rgba(192, 132, 252, 0.8)' // Soft purple
                  : COLORS.textSecondary
              } 
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
            >
              {benefit.title}
            </Text>
            {benefit.category !== 'shared' && (
              <View style={[
                styles.benefitCategoryBadge, 
                benefit.achieved && { 
                  backgroundColor: benefit.category === 'male' 
                    ? 'rgba(147, 197, 253, 0.15)' // Soft blue for male
                    : 'rgba(244, 114, 182, 0.15)', // Soft pink for female
                  borderWidth: 1,
                  borderColor: benefit.category === 'male'
                    ? 'rgba(147, 197, 253, 0.3)'
                    : 'rgba(244, 114, 182, 0.3)'
                }
              ]}>
                <Ionicons 
                  name={benefit.category === 'male' ? 'male' : 'female'} 
                  size={10} 
                  color={
                    benefit.achieved 
                      ? (benefit.category === 'male' ? 'rgba(147, 197, 253, 0.9)' : 'rgba(244, 114, 182, 0.9)')
                      : '#9CA3AF'
                  } 
                />
                <Text style={[
                  styles.benefitCategoryText, 
                  benefit.achieved && { 
                    color: benefit.category === 'male' 
                      ? 'rgba(147, 197, 253, 0.9)' 
                      : 'rgba(244, 114, 182, 0.9)' 
                  }
                ]}>
                  {benefit.category === 'male' ? 'Male' : 'Female'}
                </Text>
              </View>
            )}
          </View>
          {benefit.achieved && (
            <Animated.View style={[animatedIconStyle, styles.benefitChevron]}>
              <Ionicons 
                name="chevron-down" 
                size={18} 
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
                <View style={[styles.achievedIconWrapper, { backgroundColor: 'rgba(134, 239, 172, 0.15)' }]}>
                  <Ionicons name="checkmark-circle" size={16} color="rgba(134, 239, 172, 0.8)" />
                </View>
                <Text style={[styles.benefitAchievedText, { color: 'rgba(134, 239, 172, 0.9)' }]}>Achieved</Text>
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
      
      // Calculate gradient opacity based on percentage
      const getSystemGradient = () => {
        if (system.percentage >= 80) {
          // High recovery - soft green
          return [
            'rgba(134, 239, 172, 0.2)',
            'rgba(134, 239, 172, 0.1)'
          ];
        } else if (system.percentage >= 60) {
          // Good recovery - soft blue
          return [
            'rgba(147, 197, 253, 0.15)',
            'rgba(147, 197, 253, 0.08)'
          ];
        } else if (system.percentage >= 40) {
          // Moderate recovery - soft amber
          return [
            'rgba(251, 191, 36, 0.15)',
            'rgba(251, 191, 36, 0.08)'
          ];
        } else {
          // Early recovery - subtle white
          const baseOpacity = 0.15 + (system.percentage / 100) * 0.1;
          return [
            `rgba(255, 255, 255, ${baseOpacity})`,
            `rgba(255, 255, 255, ${baseOpacity * 0.7})`
          ];
        }
      };
      
      // Get system icon color based on percentage
      const getSystemIconColor = () => {
        if (system.percentage >= 80) return 'rgba(134, 239, 172, 0.8)'; // Soft green
        if (system.percentage >= 60) return 'rgba(147, 197, 253, 0.8)'; // Soft blue
        if (system.percentage >= 40) return 'rgba(251, 191, 36, 0.8)'; // Soft amber
        return `rgba(255, 255, 255, ${0.6 + (system.percentage / 100) * 0.3})`;
      };
      
      return (
        <TouchableOpacity 
          style={styles.systemCard}
          onPress={() => setExpandedSystem(expandedSystem === system.name ? null : system.name)}
          activeOpacity={0.7}
        >
          <View style={styles.systemHeader}>
            <View style={styles.systemInfo}>
              <View style={[styles.systemIconWrapper, { backgroundColor: `rgba(255, 255, 255, ${0.03 + (system.percentage / 100) * 0.05})` }]}>
                <Ionicons name={system.icon as any} size={22} color={getSystemIconColor()} />
              </View>
              <Text style={styles.systemName}>{system.name}</Text>
            </View>
            <View style={styles.systemRight}>
              <Text style={[styles.systemPercentage, { color: getSystemIconColor() }]}>
                {system.percentage}%
              </Text>
              <Animated.View style={animatedStyle}>
                <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
              </Animated.View>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${system.percentage}%` }
                ]} 
              >
                <LinearGradient
                  colors={getSystemGradient()}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
              </View>
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
        color: '#9CA3AF',
      };
      
      const baseCardiovascular = {
        name: 'Cardiovascular Health',
        percentage: Math.round(recoveryData.metrics.cardiovascular_function?.value || 0),
        icon: 'heart-outline',
        color: '#9CA3AF',
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
              color: '#9CA3AF',
            },
            {
              name: 'Chemical Detox',
              percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
              icon: 'water-outline',
              color: '#9CA3AF',
            },
            {
              name: 'Immune System',
              percentage: Math.round(recoveryData.metrics.inflammatory_markers?.value || 0),
              icon: 'shield-checkmark-outline',
              color: '#9CA3AF',
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
              color: '#9CA3AF',
            },
            {
              name: 'Chemical Detox',
              percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
              icon: 'water-outline',
              color: '#9CA3AF',
            },
            {
              name: 'Energy & Metabolism',
              percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
              icon: 'flash-outline',
              color: '#9CA3AF',
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
              color: '#9CA3AF',
            },
            {
              name: 'Digestive Health',
              percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
              icon: 'nutrition-outline',
              color: '#9CA3AF',
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
              color: '#9CA3AF',
            },
            {
              name: 'Energy & Metabolism',
              percentage: Math.round(recoveryData.metrics.metabolic_function?.value || 0),
              icon: 'flash-outline',
              color: '#9CA3AF',
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
            <View style={styles.headerContent}>
              <View style={styles.headerIconWrapper}>
                <Ionicons name="pulse-outline" size={24} color="rgba(192, 132, 252, 0.8)" />
              </View>
              <Text style={styles.title}>Recovery Progress</Text>
            </View>
            {user?.gender !== 'other' && (
              <View style={styles.personalizedBadge}>
                <Ionicons name="person-circle-outline" size={12} color="rgba(192, 132, 252, 0.6)" />
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
              <View style={styles.sectionHeaderWithIcon}>
                <View style={styles.sectionIconWrapper}>
                  <Ionicons name="trending-up" size={20} color="rgba(147, 197, 253, 0.7)" />
                </View>
                <View style={styles.sectionTextWrapper}>
                  <Text style={styles.sectionTitle}>Recovery Timeline</Text>
                  <Text style={styles.sectionSubtitle}>Key health milestones on your journey.</Text>
                </View>
              </View>
              {genderBenefits.map((benefit) => (
                <BenefitCard key={benefit.id} benefit={benefit} />
              ))}
            </View>
          ) : (
            <View style={styles.contentContainer}>
              <View style={styles.sectionHeaderWithIcon}>
                <View style={[styles.sectionIconWrapper, { backgroundColor: 'rgba(134, 239, 172, 0.08)' }]}>
                  <Ionicons name="body" size={20} color="rgba(134, 239, 172, 0.7)" />
                </View>
                <View style={styles.sectionTextWrapper}>
                  <Text style={styles.sectionTitle}>Body System Recovery</Text>
                  <Text style={styles.sectionSubtitle}>How your systems are healing over time.</Text>
                </View>
              </View>
              <SystemRecovery />
            </View>
          )}
          
          {/* Full Recovery Celebration */}
          {recoveryData.overallRecovery >= 100 && (
            <View style={styles.fullRecoveryContainer}>
              <LinearGradient
                colors={[
                  'rgba(134, 239, 172, 0.08)',
                  'rgba(134, 239, 172, 0.03)',
                  'transparent'
                ]}
                style={styles.fullRecoveryGradient}
              >
                <View style={styles.fullRecoveryContent}>
                  <View style={styles.fullRecoveryIconWrapper}>
                    <Ionicons name="trophy" size={32} color="rgba(250, 204, 21, 0.8)" />
                  </View>
                  <Text style={styles.fullRecoveryTitle}>Full Recovery Achieved</Text>
                  <Text style={styles.fullRecoverySubtitle}>
                    Your body has completed its healing journey
                  </Text>
                  <View style={styles.fullRecoveryStats}>
                    <View style={styles.fullRecoveryStat}>
                      <Text style={styles.fullRecoveryStatValue}>{stats.daysClean}</Text>
                      <Text style={styles.fullRecoveryStatLabel}>Days</Text>
                    </View>
                    <View style={styles.fullRecoveryDivider} />
                    <View style={styles.fullRecoveryStat}>
                      <Text style={styles.fullRecoveryStatValue}>100%</Text>
                      <Text style={styles.fullRecoveryStatLabel}>Healed</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}
          
          {/* Scientific Note */}
          <View style={styles.noteCard}>
            <View style={[styles.noteIcon, { backgroundColor: 'rgba(251, 191, 36, 0.08)' }]}>
              <Ionicons name="information-circle-outline" size={18} color="rgba(251, 191, 36, 0.7)" />
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
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  headerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.15)',
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  personalizedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
    gap: 4,
  },
  personalizedText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  
  phaseCard: {
    margin: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  phaseGradient: {
    padding: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  phaseHeader: {
    marginBottom: SPACING.lg,
  },
  phaseTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    overflow: 'visible',
  },
  phaseInfo: {
    flex: 1,
  },
  phaseLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  phaseIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  phaseLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginLeft: 0,
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
    position: 'relative',
    overflow: 'visible',
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
  phaseProgressContainer: {
    marginBottom: SPACING.lg,
  },
  phaseProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 2,
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
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
  phaseDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.lg,
    fontWeight: '300',
  },
  phaseProcesses: {
    marginTop: SPACING.sm,
  },
  phaseProcessesTitle: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  phaseProcess: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  phaseProcessDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginTop: 7,
    marginRight: SPACING.sm,
  },
  phaseProcessText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
    fontWeight: '300',
  },
  
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  
  contentContainer: {
    paddingHorizontal: SPACING.lg,
  },
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    paddingHorizontal: 0,
  },
  sectionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(147, 197, 253, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(147, 197, 253, 0.15)',
    flexShrink: 0,
  },
  sectionTextWrapper: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.text,
    marginBottom: 4,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 0,
    fontWeight: '300',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  benefitCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  benefitCardAchieved: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'transparent',
  },
  benefitCardLocked: {
    opacity: 0.5,
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  benefitIconLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  benefitContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  benefitTimeframe: {
    fontSize: 10,
    fontWeight: '400',
    color: '#9CA3AF',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
    lineHeight: 18,
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
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  benefitDescription: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: SPACING.sm,
    fontWeight: '300',
  },
  benefitScientific: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    fontStyle: 'italic',
    fontWeight: '300',
  },
  benefitAchievedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: 6,
  },
  achievedIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(134, 239, 172, 0.2)',
  },
  benefitAchievedText: {
    fontSize: 12,
    fontWeight: '400',
  },
  benefitCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 4,
  },
  benefitCategoryText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '400',
  },
  
  systemsContainer: {
    gap: SPACING.sm,
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  systemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 0,
  },
  systemIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  systemName: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
    marginLeft: 0,
  },
  systemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  systemPercentage: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  progressBarContainer: {
    marginTop: SPACING.md,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  systemDetails: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  systemDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    fontWeight: '300',
  },
  
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
  },
  noteIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    fontWeight: '300',
  },
  phaseCompleteBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(134, 239, 172, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(134, 239, 172, 0.2)',
  },
  
  // Full Recovery Styles
  fullRecoveryContainer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fullRecoveryGradient: {
    borderWidth: 1,
    borderColor: 'rgba(134, 239, 172, 0.15)',
    borderRadius: 16,
  },
  fullRecoveryContent: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  fullRecoveryIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.2)',
  },
  fullRecoveryTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: 'rgba(134, 239, 172, 0.95)',
    marginBottom: SPACING.xs,
    letterSpacing: -0.3,
  },
  fullRecoverySubtitle: {
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: SPACING.xl,
  },
  fullRecoveryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xl,
  },
  fullRecoveryStat: {
    alignItems: 'center',
  },
  fullRecoveryStatValue: {
    fontSize: 28,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: -0.5,
  },
  fullRecoveryStatLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fullRecoveryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default ProgressScreen; 