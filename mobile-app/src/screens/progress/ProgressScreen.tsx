import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import Svg, { 
  Circle, 
  Path, 
  Defs, 
  LinearGradient as SvgLinearGradient, 
  Stop,
  Text as SvgText,
  G,
  Line
} from 'react-native-svg';
import { updateProgress, selectProgressStats } from '../../store/slices/progressSlice';
import { Provider } from 'react-redux';
import { store } from '../../store/store';

const { width, height } = Dimensions.get('window');

interface RecoveryPhase {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  scientificBasis: string;
  benefits: string[];
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
  icon: string;
  color: string;
}

interface BiologicalSystem {
  id: string;
  name: string;
  description: string;
  recoveryStages: {
    stage: string;
    timeframe: string;
    description: string;
    completed: boolean;
  }[];
  overallProgress: number;
  color: string;
  icon: string;
}

// Inner component that uses Redux
const ProgressScreenContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state?.auth);
  const stats = useSelector(selectProgressStats);
  
  const user = authState?.user;
  
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState({
    timeline: false,
    systems: false,
    benefits: false
  });
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;
  const activePhaseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Set up interval to update progress every minute
    const progressInterval = setInterval(() => {
      if (user?.quitDate) {
        dispatch(updateProgress());
      }
    }, 60000); // Update every minute

    // Pulse animation for active phase
    Animated.loop(
      Animated.sequence([
        Animated.timing(activePhaseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(activePhaseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      clearInterval(progressInterval);
    };
  }, [dispatch, user?.quitDate, activePhaseAnim]);

  // Early return if no stats available
  if (!stats) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#0A0F1C', '#0F172A']}
          style={styles.background}
        >
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Recovery Progress</Text>
              <Text style={styles.headerSubtitle}>Loading your progress...</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  // Calculate recovery phases based on user's quit date and product
  const getRecoveryPhases = (): RecoveryPhase[] => {
    const daysClean = stats?.daysClean || 0;
    const hoursClean = stats?.hoursClean || 0;
    const nicotineProduct = user?.nicotineProduct;
    
    // Get product-specific benefits and timelines
    const getProductSpecificPhases = () => {
      switch (nicotineProduct?.category) {
        case 'cigarettes':
          return {
            immediate: {
              benefits: [
                'Nicotine eliminated from bloodstream',
                'Carbon monoxide levels normalize',
                'Heart rate and blood pressure stabilize',
                'Oxygen levels increase'
              ],
              description: 'Nicotine and toxin clearance begins'
            },
            acute: {
              benefits: [
                'Withdrawal symptoms peak and decline',
                'Taste and smell dramatically improve',
                'Circulation begins normalizing',
                'Lung cilia start regenerating'
              ],
              description: 'Withdrawal resolution and sensory restoration'
            },
            restoration: {
              benefits: [
                'Lung function improves significantly',
                'Cilia regrowth in respiratory tract',
                'Tar and toxin clearance accelerates',
                'Immune system strengthens'
              ],
              description: 'Respiratory system repair and detoxification'
            }
          };
        
        case 'vape':
          return {
            immediate: {
              benefits: [
                'Nicotine eliminated from bloodstream',
                'Heart rate and blood pressure stabilize',
                'Lung irritation begins subsiding',
                'Throat irritation reduces'
              ],
              description: 'Nicotine clearance and respiratory relief'
            },
            acute: {
              benefits: [
                'Withdrawal symptoms peak and decline',
                'Lung inflammation reduces',
                'Breathing becomes easier',
                'Throat and lung irritation subsides'
              ],
              description: 'Withdrawal resolution and respiratory healing'
            },
            restoration: {
              benefits: [
                'Lung function improves',
                'Respiratory inflammation resolves',
                'Immune system strengthens',
                'Long-term lung health improves'
              ],
              description: 'Respiratory system recovery and optimization'
            }
          };
        
        case 'chewing':
          return {
            immediate: {
              benefits: [
                'Nicotine eliminated from bloodstream',
                'Heart rate stabilizes',
                'Oral tissue irritation begins healing',
                'Saliva production normalizes'
              ],
              description: 'Nicotine clearance and oral healing begins'
            },
            acute: {
              benefits: [
                'Withdrawal symptoms peak and decline',
                'Oral lesions begin healing',
                'Gum and cheek irritation subsides',
                'Taste sensation improves'
              ],
              description: 'Withdrawal resolution and oral tissue repair'
            },
            restoration: {
              benefits: [
                'Oral tissues completely heal',
                'Reduced risk of oral cancer',
                'Gum health fully restored',
                'Dental health improves significantly'
              ],
              description: 'Complete oral health restoration'
            }
          };
        
        case 'other':
          // Handle nicotine pouches and other products
          if (nicotineProduct?.name?.toLowerCase().includes('pouch')) {
            return {
              immediate: {
                benefits: [
                  'Nicotine eliminated from bloodstream',
                  'Heart rate stabilizes',
                  'Blood pressure normalizes',
                  'Oral tissue irritation begins healing'
                ],
                description: 'Nicotine clearance and oral healing begins'
              },
              acute: {
                benefits: [
                  'Withdrawal symptoms peak and decline',
                  'Oral health improvements visible',
                  'Gum irritation subsides',
                  'Sleep quality improves'
                ],
                description: 'Withdrawal resolution and oral tissue recovery'
              },
              restoration: {
                benefits: [
                  'Oral tissues fully heal',
                  'Gum health returns to normal',
                  'Reduced risk of oral lesions',
                  'Improved dental health'
                ],
                description: 'Complete oral tissue restoration'
              }
            };
          }
          // Default for other products
          return {
            immediate: {
              benefits: [
                'Nicotine eliminated from bloodstream',
                'Heart rate and blood pressure stabilize',
                'Initial healing processes begin',
                'Stress on cardiovascular system reduces'
              ],
              description: 'Nicotine clearance and initial healing'
            },
            acute: {
              benefits: [
                'Withdrawal symptoms peak and decline',
                'Sleep quality improves',
                'Energy levels stabilize',
                'Mental clarity begins returning'
              ],
              description: 'Withdrawal resolution and system stabilization'
            },
            restoration: {
              benefits: [
                'Cardiovascular health improves',
                'Immune system strengthens',
                'Overall health markers improve',
                'Long-term health risks reduce'
              ],
              description: 'System recovery and health optimization'
            }
          };
        
        default:
          return {
            immediate: {
              benefits: [
                'Nicotine eliminated from bloodstream',
                'Heart rate and blood pressure stabilize',
                'Initial healing processes begin',
                'Stress on cardiovascular system reduces'
              ],
              description: 'Nicotine clearance and initial healing'
            },
            acute: {
              benefits: [
                'Withdrawal symptoms peak and decline',
                'Sleep quality improves',
                'Energy levels stabilize',
                'Mental clarity begins returning'
              ],
              description: 'Withdrawal resolution and system stabilization'
            },
            restoration: {
              benefits: [
                'Cardiovascular health improves',
                'Immune system strengthens',
                'Overall health markers improve',
                'Long-term health risks reduce'
              ],
              description: 'System recovery and health optimization'
            }
          };
      }
    };

    const productPhases = getProductSpecificPhases();
    
    const phases: RecoveryPhase[] = [
      {
        id: 'immediate',
        title: 'Immediate Detox',
        description: productPhases.immediate.description,
        timeframe: '0-72 hours',
        scientificBasis: 'Hukkanen et al. (2005) - Pharmacological Reviews',
        benefits: productPhases.immediate.benefits,
        isActive: daysClean >= 0 && daysClean < 3,
        isCompleted: daysClean >= 3,
        progress: daysClean >= 3 ? 100 : Math.min(((hoursClean + (stats?.minutesClean || 0) / 60) / 72) * 100, 100),
        icon: 'flash',
        color: COLORS.primary
      },
      {
        id: 'acute',
        title: 'Acute Recovery',
        description: productPhases.acute.description,
        timeframe: '3-14 days',
        scientificBasis: 'Hughes (2007) - Psychopharmacology',
        benefits: productPhases.acute.benefits,
        isActive: daysClean >= 3 && daysClean < 14,
        isCompleted: daysClean >= 14,
        // Show 1% on day 3 to indicate phase has started, then scale to 100% by day 14
        progress: daysClean >= 14 ? 100 : daysClean < 3 ? 0 : Math.max(1, Math.min(((daysClean - 3) / 11) * 100, 100)),
        icon: 'leaf',
        color: COLORS.secondary
      },
      {
        id: 'restoration',
        title: 'Tissue Restoration',
        description: productPhases.restoration.description,
        timeframe: '2-12 weeks',
        scientificBasis: 'Surgeon General Report (2020)',
        benefits: productPhases.restoration.benefits,
        isActive: daysClean >= 14 && daysClean < 84,
        isCompleted: daysClean >= 84,
        // Show 1% on day 14 to indicate phase has started
        progress: daysClean >= 84 ? 100 : daysClean < 14 ? 0 : Math.max(1, Math.min(((daysClean - 14) / 70) * 100, 100)),
        icon: 'medical',
        color: COLORS.primary
      },
      {
        id: 'neuroplasticity',
        title: 'Neural Rewiring',
        description: 'Brain chemistry rebalancing and addiction pathway healing',
        timeframe: '3-6 months',
        scientificBasis: 'Cosgrove et al. (2014) - Neuropsychopharmacology',
        benefits: [
          'Dopamine receptors normalize',
          'Addiction pathways weaken',
          'Mental clarity improves',
          'Mood stability returns'
        ],
        isActive: daysClean >= 84 && daysClean < 180,
        isCompleted: daysClean >= 180,
        // More accurate progress: minimal until day 21, then accelerates
        progress: daysClean >= 180 ? 100 : 
                  daysClean < 21 ? 0 : // Minimal progress first 3 weeks
                  daysClean < 90 ? Math.min(((daysClean - 21) / 69) * 50, 50) : // 0-50% progress days 21-90
                  Math.min(50 + ((daysClean - 90) / 90) * 50, 100), // 50-100% progress days 90-180
        icon: 'bulb',
        color: COLORS.secondary
      },
      {
        id: 'optimization',
        title: 'System Optimization',
        description: 'Complete physiological recovery and enhancement',
        timeframe: '6+ months',
        scientificBasis: 'Multiple longitudinal studies',
        benefits: [
          'Peak physical performance',
          'Optimal mental clarity',
          'Minimized health risks',
          'Enhanced quality of life'
        ],
        isActive: daysClean >= 180,
        isCompleted: daysClean >= 365, // Complete after 1 year
        progress: daysClean >= 365 ? 100 : Math.min((daysClean / 365) * 100, 100), // Gradual progress from day 1
        icon: 'trophy',
        color: COLORS.primary
      }
    ];

    return phases;
  };

  // Get biological systems recovery data
  const getBiologicalSystems = (): BiologicalSystem[] => {
    const daysClean = stats?.daysClean || 0;
    const nicotineProduct = user?.nicotineProduct;
    
    // Get product-specific biological systems
    const getProductSpecificSystems = () => {
      switch (nicotineProduct?.category) {
        case 'cigarettes':
          return [
            {
              id: 'respiratory',
              name: 'Respiratory System',
              description: 'Lungs, airways, and breathing capacity',
              recoveryStages: [
                {
                  stage: 'Cilia Regeneration',
                  timeframe: '1-9 months',
                  description: 'Tiny hairs in lungs regrow to clear tar and debris',
                  completed: daysClean >= 30
                },
                {
                  stage: 'Lung Capacity Increase',
                  timeframe: '1-3 months',
                  description: 'Breathing capacity improves by up to 30%',
                  completed: daysClean >= 60
                },
                {
                  stage: 'Tar Clearance',
                  timeframe: '1-12 months',
                  description: 'Tar and toxins cleared from lung tissue',
                  completed: daysClean >= 90
                }
              ],
              overallProgress: Math.min((daysClean / 270) * 100, 100),
              color: COLORS.secondary,
              icon: 'fitness'
            },
            {
              id: 'cardiovascular',
              name: 'Cardiovascular System',
              description: 'Heart, blood vessels, and circulation',
              recoveryStages: [
                {
                  stage: 'Carbon Monoxide Clearance',
                  timeframe: '12-24 hours',
                  description: 'Carbon monoxide eliminated, oxygen levels normalize',
                  completed: daysClean >= 1
                },
                {
                  stage: 'Circulation Improvement',
                  timeframe: '2-12 weeks',
                  description: 'Blood flow improves throughout the body',
                  completed: daysClean >= 14
                },
                {
                  stage: 'Heart Disease Risk Reduction',
                  timeframe: '1 year',
                  description: 'Risk of heart disease drops by 50%',
                  completed: daysClean >= 365
                }
              ],
              overallProgress: Math.min((daysClean / 365) * 100, 100),
              color: COLORS.primary,
              icon: 'heart'
            }
          ];
        
        case 'vape':
          return [
            {
              id: 'respiratory',
              name: 'Respiratory System',
              description: 'Lungs, airways, and EVALI risk reduction',
              recoveryStages: [
                {
                  stage: 'EVALI Risk Elimination',
                  timeframe: 'Immediate',
                  description: 'No longer at risk for vaping-associated lung injury',
                  completed: daysClean >= 1
                },
                {
                  stage: 'Lung Irritation Relief',
                  timeframe: '1-2 weeks',
                  description: 'Lung and throat irritation from vapor subsides',
                  completed: daysClean >= 7
                },
                {
                  stage: 'Respiratory Function Recovery',
                  timeframe: '1-3 months',
                  description: 'Breathing capacity and efficiency improve significantly',
                  completed: daysClean >= 30
                },
                {
                  stage: 'Long-term Lung Health',
                  timeframe: '6-12 months',
                  description: 'Optimal lung function restored, reduced inflammation',
                  completed: daysClean >= 180
                }
              ],
              overallProgress: Math.min((daysClean / 365) * 100, 100),
              color: COLORS.secondary,
              icon: 'fitness'
            },
            {
              id: 'cardiovascular',
              name: 'Cardiovascular System',
              description: 'Heart and circulation',
              recoveryStages: [
                {
                  stage: 'Heart Rate Normalization',
                  timeframe: '20 minutes',
                  description: 'Heart rate and blood pressure normalize',
                  completed: daysClean >= 1
                },
                {
                  stage: 'Circulation Improvement',
                  timeframe: '2-12 weeks',
                  description: 'Blood flow improves throughout the body',
                  completed: daysClean >= 14
                },
                {
                  stage: 'Cardiovascular Health Optimization',
                  timeframe: '6 months',
                  description: 'Optimal heart and vascular health',
                  completed: daysClean >= 180
                }
              ],
              overallProgress: Math.min((daysClean / 180) * 100, 100),
              color: COLORS.primary,
              icon: 'heart'
            }
          ];
        
        case 'chewing':
          return [
            {
              id: 'oral',
              name: 'Oral Health System',
              description: 'Mouth, gums, and cancer risk reduction',
              recoveryStages: [
                {
                  stage: 'Immediate Cancer Risk Halt',
                  timeframe: 'Day 1',
                  description: 'No longer exposing mouth to cancer-causing chemicals',
                  completed: daysClean >= 1
                },
                {
                  stage: 'Oral Lesion Healing',
                  timeframe: '1-4 weeks',
                  description: 'Precancerous lesions and sores begin healing',
                  completed: daysClean >= 14
                },
                {
                  stage: 'Gum & Tissue Recovery',
                  timeframe: '1-3 months',
                  description: 'Complete healing of gums and oral tissues',
                  completed: daysClean >= 60
                },
                {
                  stage: 'Long-term Cancer Risk Drop',
                  timeframe: '5+ years',
                  description: 'Risk of oral/throat cancer drops by 50%',
                  completed: daysClean >= 1825
                }
              ],
              overallProgress: Math.min((daysClean / 365) * 100, 100),
              color: COLORS.secondary,
              icon: 'medical'
            },
            {
              id: 'cardiovascular',
              name: 'Cardiovascular System',
              description: 'Heart and blood pressure',
              recoveryStages: [
                {
                  stage: 'Heart Rate Normalization',
                  timeframe: '20 minutes',
                  description: 'Heart rate stabilizes to normal levels',
                  completed: daysClean >= 1
                },
                {
                  stage: 'Blood Pressure Improvement',
                  timeframe: '2-12 weeks',
                  description: 'Blood pressure returns to healthy range',
                  completed: daysClean >= 14
                },
                {
                  stage: 'Heart Disease Risk Reduction',
                  timeframe: '1 year',
                  description: 'Reduced risk of cardiovascular disease',
                  completed: daysClean >= 365
                }
              ],
              overallProgress: Math.min((daysClean / 365) * 100, 100),
              color: COLORS.primary,
              icon: 'heart'
            }
          ];
        
        case 'other':
          // Handle nicotine pouches and other products
          if (nicotineProduct?.name?.toLowerCase().includes('pouch')) {
            return [
              {
                id: 'oral',
                name: 'Oral Health System',
                description: 'Gums, teeth, and oral tissues',
                recoveryStages: [
                  {
                    stage: 'Gum Irritation Relief',
                    timeframe: '1-2 weeks',
                    description: 'Gum irritation and inflammation subsides',
                    completed: daysClean >= 7
                  },
                  {
                    stage: 'Oral Tissue Healing',
                    timeframe: '2-4 weeks',
                    description: 'Oral tissues heal and return to normal',
                    completed: daysClean >= 21
                  },
                  {
                    stage: 'Complete Oral Recovery',
                    timeframe: '1-3 months',
                    description: 'Full oral health restoration achieved',
                    completed: daysClean >= 60
                  }
                ],
                overallProgress: Math.min((daysClean / 90) * 100, 100),
                color: COLORS.secondary,
                icon: 'medical'
              },
              {
                id: 'cardiovascular',
                name: 'Cardiovascular System',
                description: 'Heart rate and blood pressure',
                recoveryStages: [
                  {
                    stage: 'Heart Rate Normalization',
                    timeframe: '20 minutes',
                    description: 'Heart rate drops to normal levels',
                    completed: daysClean >= 1
                  },
                  {
                    stage: 'Blood Pressure Stabilization',
                    timeframe: '2-12 weeks',
                    description: 'Blood pressure returns to healthy range',
                    completed: daysClean >= 14
                  },
                  {
                    stage: 'Cardiovascular Optimization',
                    timeframe: '3-6 months',
                    description: 'Optimal cardiovascular health achieved',
                    completed: daysClean >= 90
                  }
                ],
                overallProgress: Math.min((daysClean / 180) * 100, 100),
                color: COLORS.primary,
                icon: 'heart'
              }
            ];
          }
          // Default for other products
          return [
            {
              id: 'cardiovascular',
              name: 'Cardiovascular System',
              description: 'Heart and circulation',
              recoveryStages: [
                {
                  stage: 'Heart Rate Normalization',
                  timeframe: '20 minutes',
                  description: 'Heart rate and blood pressure normalize',
                  completed: daysClean >= 1
                },
                {
                  stage: 'Circulation Improvement',
                  timeframe: '2-12 weeks',
                  description: 'Blood flow improves throughout the body',
                  completed: daysClean >= 14
                },
                {
                  stage: 'Cardiovascular Health Optimization',
                  timeframe: '6 months',
                  description: 'Optimal cardiovascular health achieved',
                  completed: daysClean >= 180
                }
              ],
              overallProgress: Math.min((daysClean / 180) * 100, 100),
              color: COLORS.primary,
              icon: 'heart'
            }
          ];
        
        default:
          return [
            {
              id: 'cardiovascular',
              name: 'Cardiovascular System',
              description: 'Heart and circulation',
              recoveryStages: [
                {
                  stage: 'Heart Rate Normalization',
                  timeframe: '20 minutes',
                  description: 'Heart rate and blood pressure normalize',
                  completed: daysClean >= 1
                },
                {
                  stage: 'Circulation Improvement',
                  timeframe: '2-12 weeks',
                  description: 'Blood flow improves throughout the body',
                  completed: daysClean >= 14
                },
                {
                  stage: 'Cardiovascular Health Optimization',
                  timeframe: '6 months',
                  description: 'Optimal cardiovascular health achieved',
                  completed: daysClean >= 180
                }
              ],
              overallProgress: Math.min((daysClean / 180) * 100, 100),
              color: COLORS.primary,
              icon: 'heart'
            }
          ];
      }
    };

    const productSystems = getProductSpecificSystems();
    
    // Always include nervous system as it's affected by all nicotine products
    const nervousSystem = {
      id: 'nervous',
      name: 'Nervous System',
      description: 'Brain, nerves, and neurotransmitters',
      recoveryStages: [
        {
          stage: 'Neurotransmitter Rebalancing',
          timeframe: '2-4 weeks',
          description: 'Dopamine and serotonin levels stabilize',
          completed: daysClean >= 21
        },
        {
          stage: 'Cognitive Function Recovery',
          timeframe: '1-3 months',
          description: 'Memory, focus, and mental clarity improve',
          completed: daysClean >= 60
        },
        {
          stage: 'Addiction Pathway Healing',
          timeframe: '3-6 months',
          description: 'Neural addiction pathways weaken significantly',
          completed: daysClean >= 180
        }
      ],
      overallProgress: Math.min((daysClean / 180) * 100, 100),
      color: COLORS.secondary,
      icon: 'bulb'
    };

    return [...productSystems, nervousSystem];
  };

  const daysClean = stats?.daysClean || 0;
  const recoveryPhases = getRecoveryPhases();
  const biologicalSystems = getBiologicalSystems();
  const currentPhase = recoveryPhases.find(phase => phase.isActive) || recoveryPhases[0];

  // Helper to toggle section collapse
  const toggleSection = (section: 'timeline' | 'systems' | 'benefits') => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Render section header with collapse toggle
  const renderSectionHeader = (
    section: 'timeline' | 'systems' | 'benefits',
    title: string,
    subtitle: string,
    icon: string,
    color: string
  ) => (
    <TouchableOpacity 
      style={styles.sectionHeader}
      onPress={() => toggleSection(section)}
      activeOpacity={0.7}
    >
      <View style={styles.sectionHeaderLeft}>
        <View style={[styles.sectionIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Ionicons 
        name={collapsedSections[section] ? "chevron-down" : "chevron-up"} 
        size={20} 
        color={COLORS.textMuted} 
      />
    </TouchableOpacity>
  );

  // Render recovery timeline
  const renderRecoveryTimeline = () => (
    <View style={styles.timelineContainer}>

      {recoveryPhases.map((phase, index) => (
        <TouchableOpacity
          key={phase.id}
          style={[
            styles.phaseCard,
            phase.isActive && styles.phaseCardActive,
            phase.isCompleted && styles.phaseCardCompleted
          ]}
          onPress={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}
        >
          <LinearGradient
            colors={
              phase.isActive 
                ? [phase.color + '20', phase.color + '10']
                : phase.isCompleted
                ? ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)']
                : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
            }
            style={styles.phaseCardGradient}
          >
            <View style={styles.phaseHeader}>
              <View style={[styles.phaseIcon, { backgroundColor: phase.color + '20' }]}>
                <Ionicons 
                  name={phase.icon as any} 
                  size={24} 
                  color={phase.color} 
                />
              </View>
              <View style={styles.phaseInfo}>
                <Text style={styles.phaseTitle}>{phase.title}</Text>
                <Text style={styles.phaseTimeframe}>{phase.timeframe}</Text>
              </View>
              <View style={styles.phaseStatus}>
                {phase.isCompleted ? (
                  <View style={styles.phaseCompleted}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <Text style={styles.phaseCompletedText}>Complete</Text>
                  </View>
                ) : phase.isActive ? (
                  <View style={styles.phaseActive}>
                    <Animated.View 
                      style={[
                        styles.phaseActiveDot, 
                        { 
                          backgroundColor: phase.color,
                          transform: [{ scale: activePhaseAnim }]
                        }
                      ]} 
                    />
                    <Text style={styles.phaseActiveText}>
                      {phase.id === 'acute' && daysClean >= 3 && daysClean < 14 ? 
                        `Day ${daysClean - 2} of 11` :
                       phase.id === 'restoration' && daysClean >= 14 && daysClean < 84 ?
                        `Week ${Math.floor((daysClean - 14) / 7) + 1} of 10` :
                       phase.id === 'neuroplasticity' && daysClean >= 21 && daysClean < 180 ?
                        `Month ${Math.floor((daysClean - 21) / 30) + 1} of 5` :
                       phase.id === 'optimization' && daysClean >= 180 ?
                        `Month ${Math.floor(daysClean / 30)}` :
                        'In Progress'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.phaseUpcoming}>
                    <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
                    <Text style={styles.phaseUpcomingText}>
                      {phase.id === 'acute' && daysClean < 3 ? 
                        `Starts in ${3 - daysClean} day${3 - daysClean === 1 ? '' : 's'}` :
                       phase.id === 'restoration' && daysClean < 14 ?
                        `Starts in ${14 - daysClean} day${14 - daysClean === 1 ? '' : 's'}` :
                       phase.id === 'neuroplasticity' && daysClean < 21 ?
                        `Starts in ${21 - daysClean} day${21 - daysClean === 1 ? '' : 's'}` :
                       phase.id === 'optimization' && daysClean < 180 ?
                        `Starts in ${Math.floor((180 - daysClean) / 30)} months` :
                        'Upcoming'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Show progress bar only for active phases */}
            {phase.isActive && !phase.isCompleted && (
              <View style={styles.phaseProgressContainer}>
                <View style={styles.phaseProgressBar}>
                  <View 
                    style={[
                      styles.phaseProgressFill,
                      { 
                        width: `${phase.progress}%`,
                        backgroundColor: phase.color
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.phaseProgressLabel}>
                  {Math.round(phase.progress)}% complete
                </Text>
              </View>
            )}

            <Text style={styles.phaseDescription}>{phase.description}</Text>

            {selectedPhase === phase.id && (
              <Animated.View style={styles.phaseDetails}>
                <Text style={styles.phaseScience}>
                  Scientific Basis: {phase.scientificBasis}
                </Text>
                <Text style={styles.phaseBenefitsTitle}>Key Benefits:</Text>
                {phase.benefits.map((benefit, idx) => (
                  <View key={idx} style={styles.phaseBenefit}>
                    <View style={[styles.benefitDot, { backgroundColor: phase.color }]} />
                    <Text style={styles.phaseBenefitText}>{benefit}</Text>
                  </View>
                ))}
              </Animated.View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render biological systems
  const renderBiologicalSystems = () => {
    // Helper to determine system status
    const getSystemStatus = (system: BiologicalSystem) => {
      if (system.overallProgress >= 100) {
        return 'complete';
      } else if (system.overallProgress > 0) {
        return 'active';
      }
      return 'upcoming';
    };

    // Helper to get active stage description
    const getActiveStageDescription = (system: BiologicalSystem) => {
      const activeStage = system.recoveryStages.find(stage => !stage.completed);
      const completedCount = system.recoveryStages.filter(stage => stage.completed).length;
      const totalStages = system.recoveryStages.length;
      
      if (completedCount === totalStages) {
        return 'All recovery milestones achieved';
      } else if (activeStage) {
        // Show what's currently happening in a friendly way
        return `In Progress: ${activeStage.stage}`;
      }
      return `${completedCount} of ${totalStages} milestones complete`;
    };

    // Helper to get a simple progress description
    const getProgressDescription = (system: BiologicalSystem) => {
      const completedCount = system.recoveryStages.filter(stage => stage.completed).length;
      const totalStages = system.recoveryStages.length;
      
      if (completedCount === 0) {
        return 'Starting';
      } else if (completedCount === totalStages) {
        return 'Complete';
      } else {
        return `Active`;
      }
    };

    return (
      <View style={styles.systemsContainer}>
        {biologicalSystems.map((system) => {
          const status = getSystemStatus(system);
          const isActive = status === 'active';
          const isComplete = status === 'complete';

          return (
            <TouchableOpacity
              key={system.id}
              style={[
                styles.systemCard,
                isActive && styles.systemCardActive,
                isComplete && styles.systemCardComplete
              ]}
              onPress={() => setSelectedSystem(selectedSystem === system.id ? null : system.id)}
            >
              <LinearGradient
                colors={
                  isActive 
                    ? [system.color + '20', system.color + '10']
                    : isComplete
                    ? ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)']
                    : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
                }
                style={styles.systemCardGradient}
              >
                <View style={styles.systemHeader}>
                  <View style={[styles.systemIcon, { backgroundColor: system.color + '20' }]}>
                    <Ionicons name={system.icon as any} size={28} color={system.color} />
                  </View>
                  <View style={styles.systemInfo}>
                    <Text style={styles.systemName}>{system.name}</Text>
                    <Text style={styles.systemDescription}>{system.description}</Text>
                  </View>
                  <View style={styles.systemStatus}>
                    {isComplete ? (
                      <View style={styles.systemComplete}>
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        <Text style={styles.systemCompleteText}>Recovered</Text>
                      </View>
                    ) : isActive ? (
                      <View style={styles.systemActive}>
                        <Animated.View 
                          style={[
                            styles.systemActiveDot, 
                            { 
                              backgroundColor: system.color,
                              transform: [{ scale: activePhaseAnim }]
                            }
                          ]} 
                        />
                        <Text style={styles.systemActiveText}>{getProgressDescription(system)}</Text>
                      </View>
                    ) : (
                      <View style={styles.systemUpcoming}>
                        <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
                        <Text style={styles.systemUpcomingText}>Upcoming</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Active stage indicator */}
                {isActive && (
                  <View style={styles.systemProgressInfo}>
                    <Text style={styles.systemStageText}>
                      {getActiveStageDescription(system)}
                    </Text>
                    <Text style={styles.systemMilestoneText}>
                      {system.recoveryStages.filter(s => s.completed).length} of {system.recoveryStages.length} milestones complete
                    </Text>
                  </View>
                )}

                {selectedSystem === system.id && (
                  <View style={styles.systemDetails}>
                    {system.recoveryStages.map((stage, idx) => (
                      <View key={idx} style={styles.recoveryStage}>
                        <View style={styles.stageStatusIcon}>
                          {stage.completed ? (
                            <Ionicons name="checkmark-circle" size={16} color={system.color} />
                          ) : (
                            <View style={[
                              styles.stageIndicator,
                              { 
                                backgroundColor: 'transparent',
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.3)'
                              }
                            ]} />
                          )}
                        </View>
                        <View style={styles.stageInfo}>
                          <Text style={[
                            styles.stageName,
                            { 
                              color: stage.completed ? system.color : 'rgba(255, 255, 255, 0.9)',
                              fontWeight: stage.completed ? '600' : '500'
                            }
                          ]}>
                            {stage.stage}
                          </Text>
                          <Text style={[
                            styles.stageTimeframe,
                            { 
                              opacity: stage.completed ? 0.8 : 0.6,
                              fontWeight: stage.completed ? '600' : '400'
                            }
                          ]}>
                            {stage.completed ? `Completed (${stage.timeframe})` : `Timeline: ${stage.timeframe}`}
                          </Text>
                          <Text style={[
                            styles.stageDescription,
                            { opacity: stage.completed ? 0.9 : 0.7 }
                          ]}>
                            {stage.description}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Render practical benefits users will experience
  const renderPracticalBenefits = () => {
    const daysClean = stats?.daysClean || 0;
    const nicotineProduct = user?.nicotineProduct;
    
    // Get product-specific benefits with timelines
    const getBenefitsByProduct = () => {
      const baseBenefits = [
        {
          category: 'Physical Health',
          icon: 'fitness',
          color: COLORS.secondary,
          benefits: [
            { benefit: 'Better sleep quality', timeline: '3-7 days', achieved: daysClean >= 3 },
            { benefit: 'Improved taste and smell', timeline: '2-14 days', achieved: daysClean >= 2 },
            { benefit: 'Increased energy levels', timeline: '1-4 weeks', achieved: daysClean >= 7 },
            { benefit: 'Better circulation', timeline: '2-12 weeks', achieved: daysClean >= 14 },
          ]
        },
        {
          category: 'Mental Clarity',
          icon: 'bulb',
          color: COLORS.primary,
          benefits: [
            { benefit: 'Reduced brain fog', timeline: '1-2 weeks', achieved: daysClean >= 7 },
            { benefit: 'Better focus and concentration', timeline: '2-4 weeks', achieved: daysClean >= 14 },
            { benefit: 'Improved memory', timeline: '1-3 months', achieved: daysClean >= 30 },
            { benefit: 'Enhanced decision making', timeline: '1-6 months', achieved: daysClean >= 60 }, // 2 months minimum
          ]
        },
        {
          category: 'Emotional Wellbeing',
          icon: 'heart',
          color: COLORS.secondary,
          benefits: [
            { benefit: 'Reduced anxiety', timeline: '1-4 weeks', achieved: daysClean >= 7 },
            { benefit: 'Improved mood stability', timeline: '2-8 weeks', achieved: daysClean >= 14 },
            { benefit: 'Better stress management', timeline: '1-3 months', achieved: daysClean >= 30 },
            { benefit: 'Increased self-confidence', timeline: '1-6 months', achieved: daysClean >= 60 }, // 2 months minimum
          ]
        },
        {
          category: 'Life & Freedom',
          icon: 'star',
          color: COLORS.primary,
          benefits: [
            { benefit: 'Significant financial savings', timeline: 'Immediate', achieved: daysClean >= 1 },
            { benefit: 'Freedom from addiction cravings', timeline: '2-4 weeks', achieved: daysClean >= 14 },
            { benefit: 'Pride in overcoming addiction', timeline: 'Progressive', achieved: daysClean >= 7 }
          ]
        }
      ];

      // Add product-specific benefits
      if (nicotineProduct?.category === 'cigarettes') {
        baseBenefits[0].benefits.push(
          { benefit: 'Clearer breathing', timeline: '1-2 weeks', achieved: daysClean >= 7 },
          { benefit: 'Reduced coughing', timeline: '2-4 weeks', achieved: daysClean >= 14 },
          { benefit: 'Whiter teeth', timeline: '1-3 months', achieved: daysClean >= 30 }
        );
        baseBenefits[3].benefits.unshift(
          { benefit: 'No secondhand smoke exposure to loved ones', timeline: 'Immediate', achieved: daysClean >= 1 }
        );
      } else if (nicotineProduct?.category === 'vape') {
        baseBenefits[0].benefits.push(
          { benefit: 'No more throat irritation', timeline: '3-7 days', achieved: daysClean >= 3 },
          { benefit: 'Better hydration', timeline: '1 week', achieved: daysClean >= 7 },
          { benefit: 'No more "vaper\'s tongue"', timeline: '2-4 weeks', achieved: daysClean >= 14 },
          { benefit: 'Reduced EVALI risk', timeline: 'Immediate', achieved: daysClean >= 1 }
        );
        baseBenefits[3].benefits.unshift(
          { benefit: 'No secondhand vapor exposure to loved ones', timeline: 'Immediate', achieved: daysClean >= 1 }
        );
      } else if (nicotineProduct?.category === 'chewing') {
        baseBenefits[0].benefits.push(
          { benefit: 'Jaw tension relief', timeline: '1-2 weeks', achieved: daysClean >= 7 },
          { benefit: 'No more sores/lesions', timeline: '2-4 weeks', achieved: daysClean >= 14 },
          { benefit: 'Whiter teeth', timeline: '1-3 months', achieved: daysClean >= 30 },
          { benefit: 'Reduced oral cancer risk', timeline: 'Long-term', achieved: daysClean >= 180 }
        );
      } else if (nicotineProduct?.category === 'other' && nicotineProduct?.name?.toLowerCase().includes('pouch')) {
        baseBenefits[0].benefits.push(
          { benefit: 'Healthier gums', timeline: '1-2 weeks', achieved: daysClean >= 7 },
          { benefit: 'Reduced mouth irritation', timeline: '3-7 days', achieved: daysClean >= 3 }
        );
      }

      return baseBenefits;
    };

    const benefitCategories = getBenefitsByProduct();

    return (
      <View style={styles.benefitsContainer}>
        {/* Quick Stats */}
        <View style={styles.benefitsQuickStats}>
          <View style={[styles.benefitQuickStat, { backgroundColor: COLORS.secondary + '20' }]}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.secondary} />
            <Text style={styles.benefitQuickStatValue}>
              {benefitCategories.reduce((acc, cat) => acc + cat.benefits.filter(b => b.achieved).length, 0)}
            </Text>
            <Text style={styles.benefitQuickStatLabel}>Benefits Achieved</Text>
          </View>
          <View style={[styles.benefitQuickStat, { backgroundColor: COLORS.primary + '20' }]}>
            <Ionicons name="time-outline" size={24} color={COLORS.primary} />
            <Text style={styles.benefitQuickStatValue}>
              {benefitCategories.reduce((acc, cat) => acc + cat.benefits.filter(b => !b.achieved).length, 0)}
            </Text>
            <Text style={styles.benefitQuickStatLabel}>Coming Soon</Text>
          </View>
        </View>

        {benefitCategories.map((category, categoryIndex) => (
          <View key={category.category} style={styles.benefitCategory}>
            <View style={styles.benefitCategoryHeader}>
              <View style={[styles.benefitCategoryIcon, { backgroundColor: `${category.color}20` }]}>
                <Ionicons name={category.icon as any} size={20} color={category.color} />
              </View>
              <Text style={styles.benefitCategoryTitle}>{category.category}</Text>
            </View>

            {category.benefits.map((item, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={styles.benefitItemLeft}>
                  <View style={[
                    styles.benefitCheckbox,
                    { backgroundColor: item.achieved ? category.color : 'transparent' }
                  ]}>
                    {item.achieved && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <View style={styles.benefitTextContainer}>
                    <Text style={[
                      styles.benefitText,
                      { opacity: item.achieved ? 1 : 0.6 }
                    ]}>
                      {item.benefit}
                    </Text>
                    <Text style={styles.benefitTimeline}>{item.timeline}</Text>
                  </View>
                </View>
                {item.achieved && (
                  <View style={styles.achievedBadge}>
                    <Text style={styles.achievedText}>Achieved!</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}

        {/* Motivational Card with Progress */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.15)', 'rgba(16, 185, 129, 0.15)']}
          style={styles.encouragementCard}
        >
          <View style={styles.encouragementHeader}>
            <View style={[styles.encouragementIcon, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="trophy" size={24} color="#F59E0B" />
            </View>
            <View style={styles.encouragementText}>
              <Text style={styles.encouragementTitle}>You're Doing Amazing!</Text>
              <Text style={styles.encouragementDescription}>
                Day {daysClean} and counting • Your body is healing stronger every day
              </Text>
            </View>
          </View>
          <View style={styles.encouragementProgress}>
            <View style={styles.encouragementProgressBar}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={[
                  styles.encouragementProgressFill,
                  { width: `${Math.min((daysClean / 30) * 100, 100)}%` }
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.encouragementProgressText}>
              {daysClean < 30 ? `${30 - daysClean} days to your first month!` : 'Milestone achieved! 🎉'}
            </Text>
          </View>
        </LinearGradient>

        {/* Medical Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.textMuted} />
          <Text style={styles.disclaimerText}>
            Recovery timelines are based on scientific research and may vary by individual. 
            Consult your healthcare provider for personalized guidance.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Recovery Progress</Text>
            <Text style={styles.headerSubtitle}>
              Day {stats?.daysClean || 0} • {currentPhase.title}
            </Text>
          </View>

          {/* Progress Overview Card */}
          <View style={styles.overviewCard}>
            <LinearGradient
              colors={[currentPhase.color + '20', currentPhase.color + '10']}
              style={styles.overviewGradient}
            >
              <View style={styles.overviewContent}>
                <View style={styles.overviewLeft}>
                  <Text style={styles.overviewLabel}>Current Phase</Text>
                  <Text style={styles.overviewPhase}>{currentPhase.title}</Text>
                  <Text style={styles.overviewTime}>{currentPhase.timeframe}</Text>
                </View>
                <View style={styles.overviewRight}>
                  <View style={[styles.overviewIcon, { backgroundColor: currentPhase.color + '30' }]}>
                    <Ionicons name={currentPhase.icon as any} size={32} color={currentPhase.color} />
                  </View>
                </View>
              </View>
              <View style={styles.overviewStats}>
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewStatValue}>{recoveryPhases.filter(p => p.isCompleted).length}</Text>
                  <Text style={styles.overviewStatLabel}>Phases Complete</Text>
                </View>
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewStatValue}>{biologicalSystems.filter(s => s.recoveryStages.filter(r => r.completed).length > 0).length}</Text>
                  <Text style={styles.overviewStatLabel}>Systems Active</Text>
                </View>
                <View style={styles.overviewStat}>
                  <Text style={styles.overviewStatValue}>{Math.round((recoveryPhases.filter(p => p.isCompleted).length / recoveryPhases.length) * 100)}%</Text>
                  <Text style={styles.overviewStatLabel}>Total Progress</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* All Sections in Single Scroll */}
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {/* Timeline Section */}
            <View style={styles.section}>
              {renderSectionHeader(
                'timeline',
                'Recovery Timeline',
                `${recoveryPhases.filter(p => p.isCompleted).length} of ${recoveryPhases.length} phases complete`,
                'time',
                COLORS.primary
              )}
              {!collapsedSections.timeline && renderRecoveryTimeline()}
            </View>

            {/* Systems Section */}
            <View style={styles.section}>
              {renderSectionHeader(
                'systems',
                'Biological Systems',
                `${biologicalSystems.filter(s => s.recoveryStages.some(r => r.completed)).length} systems recovering`,
                'medical',
                COLORS.secondary
              )}
              {!collapsedSections.systems && renderBiologicalSystems()}
            </View>

            {/* Benefits Section */}
            <View style={styles.section}>
              {renderSectionHeader(
                'benefits',
                'Your Recovery Benefits',
                'Track real improvements to your health',
                'checkmark-circle',
                '#10B981'
              )}
              {!collapsedSections.benefits && renderPracticalBenefits()}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 11,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },

  // Timeline styles
  timelineContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  phaseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  phaseCardActive: {
    borderColor: COLORS.primary + '40',
    backgroundColor: COLORS.primary + '08',
  },
  phaseCardCompleted: {
    borderColor: COLORS.secondary + '40',
    backgroundColor: COLORS.secondary + '08',
  },
  phaseCardGradient: {
    padding: SPACING.lg,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  phaseIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  phaseTimeframe: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  phaseStatus: {
    alignItems: 'flex-end',
  },
  phaseCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phaseCompletedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  phaseActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phaseActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  phaseActiveText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  phaseUpcoming: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phaseUpcomingText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  phaseProgressContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  phaseProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  phaseProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  phaseProgressLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  phaseDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  phaseDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: SPACING.md,
  },
  phaseScience: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  phaseBenefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  phaseBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  benefitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.md,
  },
  phaseBenefitText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },

  // Systems styles
  systemsContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  systemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  systemCardGradient: {
    padding: SPACING.lg,
  },
  systemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  systemDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  systemProgress: {
    alignItems: 'center',
  },
  systemProgressText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  systemCardActive: {
    borderColor: COLORS.primary + '40',
    backgroundColor: COLORS.primary + '08',
  },
  systemCardComplete: {
    borderColor: COLORS.secondary + '40',
    backgroundColor: COLORS.secondary + '08',
  },
  systemStatus: {
    alignItems: 'flex-end',
  },
  systemComplete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  systemCompleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  systemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  systemActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  systemActiveText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  systemUpcoming: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  systemUpcomingText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  systemProgressInfo: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  systemStageText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  systemMilestoneText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  systemProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  systemProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stageStatusIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  systemDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: SPACING.md,
  },
  recoveryStage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  stageIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.md,
    marginTop: 4,
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  stageTimeframe: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  stageDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Benefits styles
  benefitsContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  benefitsSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  benefitCategory: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  benefitCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  benefitCategoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  benefitCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  benefitItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  benefitCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  benefitTextContainer: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 2,
  },
  benefitTimeline: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  achievedBadge: {
    backgroundColor: COLORS.secondary + '20',
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    flexShrink: 0,
    minWidth: 65,
    alignItems: 'center',
  },
  achievedText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  encouragementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  encouragementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  encouragementIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  encouragementText: {
    flex: 1,
  },
  encouragementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  encouragementDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  encouragementProgress: {
    marginTop: SPACING.sm,
  },
  encouragementProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  encouragementProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  encouragementProgressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    flex: 1,
    lineHeight: 16,
  },

  // New unified view styles
  overviewCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  overviewGradient: {
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  overviewContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  overviewLeft: {
    flex: 1,
  },
  overviewLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  overviewPhase: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  overviewTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  overviewRight: {
    justifyContent: 'center',
  },
  overviewIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: SPACING.md,
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  overviewStatLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  sectionHeaderText: {
    flex: 1,
  },
  benefitsQuickStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  benefitQuickStat: {
    flex: 1,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  benefitQuickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginVertical: SPACING.xs,
  },
  benefitQuickStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

// Wrapper component to handle Redux availability
const ProgressScreen: React.FC = () => {
  // Check if we can access Redux
  const [isReduxReady, setIsReduxReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure Redux is initialized
    const timer = setTimeout(() => {
      setIsReduxReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isReduxReady) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#0A0F1C', '#0F172A']}
          style={styles.background}
        >
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Recovery Progress</Text>
              <Text style={styles.headerSubtitle}>Loading your progress...</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return <ProgressScreenContent />;
};

export default ProgressScreen; 