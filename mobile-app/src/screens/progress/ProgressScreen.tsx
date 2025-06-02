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
import { updateProgress } from '../../store/slices/progressSlice';

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

const ProgressScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.progress);
  
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'systems' | 'benefits'>('timeline');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Set up interval to update progress every minute
    const progressInterval = setInterval(() => {
      if (user?.quitDate) {
        dispatch(updateProgress());
      }
    }, 60000); // Update every minute

    return () => {
      clearInterval(progressInterval);
    };
  }, [dispatch, user?.quitDate]);

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
        progress: daysClean >= 14 ? 100 : daysClean < 3 ? 0 : Math.min(((daysClean - 3) / 11) * 100, 100),
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
        progress: daysClean >= 84 ? 100 : daysClean < 14 ? 0 : Math.min(((daysClean - 14) / 70) * 100, 100),
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
              description: 'Lungs, airways, and breathing',
              recoveryStages: [
                {
                  stage: 'Lung Irritation Relief',
                  timeframe: '1-2 weeks',
                  description: 'Lung and throat irritation subsides',
                  completed: daysClean >= 7
                },
                {
                  stage: 'Respiratory Function Improvement',
                  timeframe: '1-3 months',
                  description: 'Breathing becomes easier and more efficient',
                  completed: daysClean >= 30
                },
                {
                  stage: 'Long-term Lung Health',
                  timeframe: '6-12 months',
                  description: 'Optimal lung function and health restored',
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
              description: 'Mouth, gums, and oral tissues',
              recoveryStages: [
                {
                  stage: 'Oral Lesion Healing',
                  timeframe: '1-4 weeks',
                  description: 'Oral lesions and irritation begin healing',
                  completed: daysClean >= 14
                },
                {
                  stage: 'Gum Health Restoration',
                  timeframe: '1-3 months',
                  description: 'Gum health returns to normal',
                  completed: daysClean >= 60
                },
                {
                  stage: 'Oral Cancer Risk Reduction',
                  timeframe: '5+ years',
                  description: 'Significantly reduced risk of oral cancer',
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

  const recoveryPhases = getRecoveryPhases();
  const biologicalSystems = getBiologicalSystems();
  const currentPhase = recoveryPhases.find(phase => phase.isActive) || recoveryPhases[0];

  // Render recovery timeline
  const renderRecoveryTimeline = () => (
    <View style={styles.timelineContainer}>
      <Text style={styles.sectionTitle}>Recovery Timeline</Text>
      <Text style={styles.sectionSubtitle}>
        Science-based healing progression for your {user?.nicotineProduct?.name || 'nicotine'} recovery
      </Text>

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
              <View style={styles.phaseProgress}>
                <Text style={styles.phaseProgressText}>{Math.round(phase.progress)}%</Text>
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
              </View>
            </View>

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
  const renderBiologicalSystems = () => (
    <View style={styles.systemsContainer}>
      <Text style={styles.sectionTitle}>Biological Systems Recovery</Text>
      <Text style={styles.sectionSubtitle}>
        Real-time healing progress across your body's major systems
      </Text>

      {biologicalSystems.map((system) => (
        <TouchableOpacity
          key={system.id}
          style={styles.systemCard}
          onPress={() => setSelectedSystem(selectedSystem === system.id ? null : system.id)}
        >
          <LinearGradient
            colors={[system.color + '15', system.color + '08']}
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
              <View style={styles.systemProgress}>
                <Text style={[styles.systemProgressText, { color: system.color }]}>
                  {Math.round(system.overallProgress)}%
                </Text>
              </View>
            </View>

            {selectedSystem === system.id && (
              <View style={styles.systemDetails}>
                {system.recoveryStages.map((stage, idx) => (
                  <View key={idx} style={styles.recoveryStage}>
                    <View style={[
                      styles.stageIndicator,
                      { backgroundColor: stage.completed ? system.color : 'rgba(255, 255, 255, 0.2)' }
                    ]} />
                    <View style={styles.stageInfo}>
                      <Text style={[
                        styles.stageName,
                        { color: stage.completed ? system.color : 'rgba(255, 255, 255, 0.7)' }
                      ]}>
                        {stage.stage}
                      </Text>
                      <Text style={styles.stageTimeframe}>{stage.timeframe}</Text>
                      <Text style={styles.stageDescription}>{stage.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );

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
        }
      ];

      // Add product-specific benefits
      if (nicotineProduct?.category === 'cigarettes') {
        baseBenefits[0].benefits.push(
          { benefit: 'Clearer breathing', timeline: '1-2 weeks', achieved: daysClean >= 7 },
          { benefit: 'Reduced coughing', timeline: '2-4 weeks', achieved: daysClean >= 14 },
          { benefit: 'Whiter teeth', timeline: '1-3 months', achieved: daysClean >= 30 }
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
        <Text style={styles.benefitsTitle}>Your Recovery Benefits</Text>
        <Text style={styles.benefitsSubtitle}>
          Real improvements you'll experience as your body heals
        </Text>

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

        {/* Encouragement */}
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.15)', 'rgba(139, 92, 246, 0.15)']}
          style={styles.encouragementCard}
        >
          <Ionicons name="trophy" size={24} color="#F59E0B" />
          <View style={styles.encouragementText}>
            <Text style={styles.encouragementTitle}>Keep Going!</Text>
            <Text style={styles.encouragementDescription}>
              Every day brings new improvements. Your body is healing and getting stronger.
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

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            {[
              { id: 'timeline', label: 'Timeline', icon: 'time' },
              { id: 'systems', label: 'Systems', icon: 'medical' },
              { id: 'benefits', label: 'Benefits', icon: 'checkmark-circle' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && styles.tabActive
                ]}
                onPress={() => setActiveTab(tab.id as any)}
              >
                <Ionicons 
                  name={tab.icon as any} 
                  size={16} 
                  color={activeTab === tab.id ? '#FFFFFF' : COLORS.textMuted} 
                />
                <Text style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.tabLabelActive
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {activeTab === 'timeline' && renderRecoveryTimeline()}
            {activeTab === 'systems' && renderBiologicalSystems()}
            {activeTab === 'benefits' && renderPracticalBenefits()}
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
    paddingHorizontal: SPACING.lg,
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
  phaseProgress: {
    alignItems: 'flex-end',
  },
  phaseProgressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  phaseProgressBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  phaseProgressFill: {
    height: '100%',
    borderRadius: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  encouragementText: {
    flex: 1,
    marginLeft: SPACING.md,
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
});

export default ProgressScreen; 