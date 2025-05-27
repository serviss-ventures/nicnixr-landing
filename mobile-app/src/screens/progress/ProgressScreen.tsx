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
  const [activeTab, setActiveTab] = useState<'timeline' | 'systems' | 'molecular'>('timeline');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Continuous pulse for active elements
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

    // Rotation for molecular visualization
    const rotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    );

    // Particle animations
    const particles = Animated.loop(
      Animated.stagger(300, 
        particleAnims.map(anim => 
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        )
      )
    );

    pulse.start();
    rotation.start();
    particles.start();

    return () => {
      pulse.stop();
      rotation.stop();
      particles.stop();
    };
  }, []);

  // Calculate recovery phases based on user's quit date and product
  const getRecoveryPhases = (): RecoveryPhase[] => {
    const daysClean = stats?.daysClean || 0;
    const hoursClean = stats?.hoursClean || 0;
    const nicotineProduct = user?.nicotineProduct;
    
    const phases: RecoveryPhase[] = [
      {
        id: 'immediate',
        title: 'Immediate Detox',
        description: 'Nicotine clearance and initial healing',
        timeframe: '0-72 hours',
        scientificBasis: 'Hukkanen et al. (2005) - Pharmacological Reviews',
        benefits: [
          'Nicotine eliminated from bloodstream',
          'Carbon monoxide levels normalize',
          'Heart rate and blood pressure stabilize',
          'Oxygen levels increase'
        ],
        isActive: daysClean >= 0 && daysClean < 3,
        isCompleted: daysClean >= 3,
        progress: daysClean >= 3 ? 100 : Math.min((hoursClean / 72) * 100, 100),
        icon: 'flash',
        color: '#00FFFF'
      },
      {
        id: 'acute',
        title: 'Acute Recovery',
        description: 'Withdrawal resolution and sensory restoration',
        timeframe: '3-14 days',
        scientificBasis: 'Hughes (2007) - Psychopharmacology',
        benefits: [
          'Withdrawal symptoms peak and decline',
          'Taste and smell dramatically improve',
          'Circulation begins normalizing',
          'Energy levels stabilize'
        ],
        isActive: daysClean >= 3 && daysClean < 14,
        isCompleted: daysClean >= 14,
        progress: daysClean >= 14 ? 100 : daysClean < 3 ? 0 : Math.min(((daysClean - 3) / 11) * 100, 100),
        icon: 'leaf',
        color: '#10B981'
      },
      {
        id: 'restoration',
        title: 'Tissue Restoration',
        description: 'Cellular repair and function recovery',
        timeframe: '2-12 weeks',
        scientificBasis: 'Surgeon General Report (2020)',
        benefits: [
          'Lung function improves significantly',
          'Cilia regrowth in respiratory tract',
          'Immune system strengthens',
          'Sleep quality normalizes'
        ],
        isActive: daysClean >= 14 && daysClean < 84,
        isCompleted: daysClean >= 84,
        progress: daysClean >= 84 ? 100 : daysClean < 14 ? 0 : Math.min(((daysClean - 14) / 70) * 100, 100),
        icon: 'medical',
        color: '#8B5CF6'
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
        progress: daysClean >= 180 ? 100 : daysClean < 84 ? 0 : Math.min(((daysClean - 84) / 96) * 100, 100),
        icon: 'bulb',
        color: '#F59E0B'
      },
      {
        id: 'optimization',
        title: 'System Optimization',
        description: 'Complete physiological recovery and enhancement',
        timeframe: '6+ months',
        scientificBasis: 'Multiple longitudinal studies',
        benefits: [
          'Full cardiovascular recovery',
          'Optimal lung function restored',
          'Cancer risk significantly reduced',
          'Peak physical and mental performance'
        ],
        isActive: daysClean >= 180,
        isCompleted: false,
        progress: daysClean < 180 ? 0 : Math.min(((daysClean - 180) / 185) * 100, 100),
        icon: 'trophy',
        color: '#EF4444'
      }
    ];

    return phases;
  };

  // Get biological systems recovery data
  const getBiologicalSystems = (): BiologicalSystem[] => {
    const daysClean = stats?.daysClean || 0;
    
    return [
      {
        id: 'respiratory',
        name: 'Respiratory System',
        description: 'Lungs, airways, and breathing capacity',
        recoveryStages: [
          {
            stage: 'Cilia Regeneration',
            timeframe: '1-9 months',
            description: 'Tiny hairs in lungs regrow to clear mucus and debris',
            completed: daysClean >= 30
          },
          {
            stage: 'Lung Capacity Increase',
            timeframe: '1-3 months',
            description: 'Breathing capacity improves by up to 30%',
            completed: daysClean >= 60
          },
          {
            stage: 'Infection Risk Reduction',
            timeframe: '1-12 months',
            description: 'Reduced risk of respiratory infections',
            completed: daysClean >= 90
          }
        ],
        overallProgress: Math.min((daysClean / 270) * 100, 100),
        color: '#10B981',
        icon: 'fitness'
      },
      {
        id: 'cardiovascular',
        name: 'Cardiovascular System',
        description: 'Heart, blood vessels, and circulation',
        recoveryStages: [
          {
            stage: 'Heart Rate Normalization',
            timeframe: '20 minutes',
            description: 'Heart rate and blood pressure drop to normal levels',
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
        color: '#EF4444',
        icon: 'heart'
      },
      {
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
        color: '#8B5CF6',
        icon: 'bulb'
      }
    ];
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

  // Render molecular visualization
  const renderMolecularVisualization = () => (
    <View style={styles.molecularContainer}>
      <Text style={styles.sectionTitle}>Molecular Recovery</Text>
      <Text style={styles.sectionSubtitle}>
        Cellular-level healing and neurotransmitter rebalancing
      </Text>

      <View style={styles.molecularVisualization}>
        <Animated.View
          style={[
            styles.molecularCenter,
            {
              transform: [
                { scale: pulseAnim },
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#00FFFF', '#8B5CF6', '#EF4444']}
            style={styles.molecularCore}
          >
            <Text style={styles.molecularCoreText}>DNA</Text>
            <Text style={styles.molecularCoreSubtext}>Repair</Text>
          </LinearGradient>
        </Animated.View>

        {/* Orbiting particles representing different molecules */}
        {particleAnims.map((anim, index) => {
          const angle = (index * 45) * (Math.PI / 180);
          const radius = 80;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <Animated.View
              key={index}
              style={[
                styles.molecularParticle,
                {
                  left: width / 2 + x - 8,
                  top: 200 + y - 8,
                  opacity: anim,
                  transform: [
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={[
                styles.particleDot,
                { backgroundColor: index % 2 === 0 ? '#00FFFF' : '#8B5CF6' }
              ]} />
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.molecularMetrics}>
        <View style={styles.molecularMetric}>
          <Text style={styles.molecularMetricTitle}>Dopamine Receptors</Text>
          <Text style={styles.molecularMetricValue}>
            {stats?.daysClean >= 21 ? '95%' : `${Math.min((stats?.daysClean || 0) / 21 * 95, 95)}%`}
          </Text>
          <Text style={styles.molecularMetricLabel}>Normalized</Text>
        </View>
        <View style={styles.molecularMetric}>
          <Text style={styles.molecularMetricTitle}>DNA Repair</Text>
          <Text style={styles.molecularMetricValue}>
            {stats?.daysClean >= 30 ? '87%' : `${Math.min((stats?.daysClean || 0) / 30 * 87, 87)}%`}
          </Text>
          <Text style={styles.molecularMetricLabel}>Complete</Text>
        </View>
        <View style={styles.molecularMetric}>
          <Text style={styles.molecularMetricTitle}>Cellular Regeneration</Text>
          <Text style={styles.molecularMetricValue}>
            {stats?.daysClean >= 60 ? '92%' : `${Math.min((stats?.daysClean || 0) / 60 * 92, 92)}%`}
          </Text>
          <Text style={styles.molecularMetricLabel}>Active</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#1A1A2E', '#16213E']}
        style={styles.background}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.headerTitle}>Recovery Progress</Text>
          <Text style={styles.headerSubtitle}>
            Day {stats?.daysClean || 0} • {currentPhase.title}
          </Text>
        </Animated.View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
                  {[
          { id: 'timeline', label: 'Timeline', icon: 'time' },
          { id: 'systems', label: 'Systems', icon: 'medical' },
          { id: 'molecular', label: 'Molecular', icon: 'nuclear' },
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
                size={20} 
                color={activeTab === tab.id ? '#00FFFF' : 'rgba(255, 255, 255, 0.6)'} 
              />
              <Text style={[
                styles.tabLabel,
                { color: activeTab === tab.id ? '#00FFFF' : 'rgba(255, 255, 255, 0.6)' }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <Animated.ScrollView 
          style={[styles.scrollView, { opacity: fadeAnim }]}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'timeline' && renderRecoveryTimeline()}
          {activeTab === 'systems' && renderBiologicalSystems()}
          {activeTab === 'molecular' && renderMolecularVisualization()}
        </Animated.ScrollView>
      </LinearGradient>
    </SafeAreaView>
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
  header: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00FFFF',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: SPACING.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: SPACING.md,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },

  // Timeline styles
  timelineContainer: {
    padding: SPACING.lg,
  },
  phaseCard: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  phaseCardActive: {
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  phaseCardCompleted: {
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
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
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  phaseTimeframe: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  phaseProgress: {
    alignItems: 'flex-end',
  },
  phaseProgressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00FFFF',
    marginBottom: SPACING.xs,
  },
  phaseProgressBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  phaseProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  phaseDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  phaseDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: SPACING.md,
  },
  phaseScience: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  phaseBenefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },

  // Systems styles
  systemsContainer: {
    padding: SPACING.lg,
  },
  systemCard: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.lg,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  systemInfo: {
    flex: 1,
  },
  systemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  systemDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  systemProgress: {
    alignItems: 'center',
  },
  systemProgressText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  systemDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: SPACING.md,
  },
  recoveryStage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  stageIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.md,
    marginTop: 4,
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  stageTimeframe: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: SPACING.xs,
  },
  stageDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },

  // Molecular styles
  molecularContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  molecularVisualization: {
    height: 300,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  molecularCenter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  molecularCore: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  molecularCoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  molecularCoreSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  molecularParticle: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  molecularMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  molecularMetric: {
    alignItems: 'center',
    flex: 1,
  },
  molecularMetricTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  molecularMetricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FFFF',
    marginBottom: SPACING.xs,
  },
  molecularMetricLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});

export default ProgressScreen; 