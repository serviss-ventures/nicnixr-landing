import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Animated,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { 
  Circle, 
  Path, 
  Defs, 
  LinearGradient as SvgLinearGradient, 
  Stop,
  Line,
  G,
  Polygon
} from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface RecoveryNode {
  id: string;
  username: string;
  milestone: string;
  message: string;
  timestamp: string;
  connections: number;
  resonance: number; // 0-100
  userConnected: boolean;
  daysClean: number;
  avatar: string;
  neuralStrength: number; // 0-100
  recoveryPhase: 'detox' | 'stabilization' | 'growth' | 'mastery';
  isVerified?: boolean;
}

interface NeuralChallenge {
  id: string;
  title: string;
  description: string;
  type: 'cognitive' | 'physical' | 'social' | 'mindful' | 'creative';
  duration: number;
  participants: number;
  joined: boolean;
  progress: number;
  icon: string;
  color: string;
  difficulty: 'Neural' | 'Synaptic' | 'Quantum';
  neuralReward: string;
  activationEnergy: number; // 0-100
}

interface SynapticMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  resonance: number;
  category: 'support' | 'insight' | 'breakthrough' | 'guidance';
  isAnonymous: boolean;
  neuralPattern: string;
}

type NetworkTab = 'neural-grid' | 'challenges' | 'synaptic-support';

const CommunityScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.progress);
  const [activeTab, setActiveTab] = useState<NetworkTab>('neural-grid');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  
  // Advanced animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const networkAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 12 }, () => new Animated.Value(0))
  ).current;
  const connectionAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    // Network pulse
    const networkPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    // Neural network animation
    const network = Animated.loop(
      Animated.timing(networkAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );

    // Particle system
    const particles = Animated.loop(
      Animated.stagger(200, 
        particleAnims.map(anim => 
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: true,
            }),
          ])
        )
      )
    );

    // Connection animations
    const connections = Animated.loop(
      Animated.stagger(500,
        connectionAnims.map(anim =>
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

    networkPulse.start();
    network.start();
    particles.start();
    connections.start();

    return () => {
      networkPulse.stop();
      network.stop();
      particles.stop();
      connections.stop();
    };
  }, []);

  // Enhanced recovery network data
  const [recoveryNodes, setRecoveryNodes] = useState<RecoveryNode[]>([
    {
      id: '1',
      username: 'QuantumHealer_Sarah',
      milestone: '30 Days Neural Reset',
      message: 'Dopamine pathways stabilizing. Energy levels optimized. Neural plasticity increasing exponentially! 🧠⚡',
      timestamp: '2 hours ago',
      connections: 47,
      resonance: 94,
      userConnected: false,
      daysClean: 30,
      avatar: '🌟',
      neuralStrength: 78,
      recoveryPhase: 'growth',
      isVerified: true
    },
    {
      id: '2',
      username: 'SynapticWarrior_Mike',
      milestone: '7 Days Detox Complete',
      message: 'Neural detox protocol successful. Cognitive clarity increasing. Ready for stabilization phase! 🔬',
      timestamp: '4 hours ago',
      connections: 28,
      resonance: 87,
      userConnected: false,
      daysClean: 7,
      avatar: '🧘',
      neuralStrength: 45,
      recoveryPhase: 'stabilization',
    },
    {
      id: '3',
      username: 'NeuralMaster_Finn',
      milestone: '100 Days Quantum Recovery',
      message: 'Neural architecture fully reconstructed. Addiction pathways deactivated. System operating at peak efficiency! 🚀',
      timestamp: '6 hours ago',
      connections: 156,
      resonance: 98,
      userConnected: false,
      daysClean: 100,
      avatar: '🏆',
      neuralStrength: 95,
      recoveryPhase: 'mastery',
      isVerified: true
    },
    {
      id: '4',
      username: 'BioHacker_Alex',
      milestone: '6 Months Neural Optimization',
      message: 'Cellular regeneration complete. Respiratory efficiency: 97%. Cardiovascular performance: optimal. Living proof of human potential! 🌈',
      timestamp: '8 hours ago',
      connections: 203,
      resonance: 99,
      userConnected: false,
      daysClean: 180,
      avatar: '🌈',
      neuralStrength: 98,
      recoveryPhase: 'mastery',
      isVerified: true
    },
    {
      id: '5',
      username: 'MolecularMom_Jess',
      milestone: '14 Days Cellular Repair',
      message: 'DNA repair mechanisms activated. My children witness the transformation daily. "Mommy, your energy field is brighter!" 💎',
      timestamp: '12 hours ago',
      connections: 89,
      resonance: 91,
      userConnected: false,
      daysClean: 14,
      avatar: '🌸',
      neuralStrength: 62,
      recoveryPhase: 'stabilization',
    },
    {
      id: '6',
      username: 'QuantumAthlete_Tom',
      milestone: '3 Days Neural Activation',
      message: 'Mitochondrial function improving. Oxygen efficiency up 23%. Just completed 5K with enhanced respiratory capacity! 🏃‍♂️⚡',
      timestamp: '1 day ago',
      connections: 34,
      resonance: 83,
      userConnected: false,
      daysClean: 3,
      avatar: '🏃',
      neuralStrength: 38,
      recoveryPhase: 'detox',
    }
  ]);

  const [neuralChallenges, setNeuralChallenges] = useState<NeuralChallenge[]>([
    {
      id: '1',
      title: 'Neural Pathway Reconstruction',
      description: 'Advanced meditation protocols to rebuild healthy neural networks and strengthen cognitive resilience',
      type: 'cognitive',
      duration: 7,
      participants: 347,
      joined: true,
      progress: 71,
      icon: 'bulb-outline',
      color: '#00FFFF',
      difficulty: 'Neural',
      neuralReward: 'Cognitive Enhancement Matrix',
      activationEnergy: 85
    },
    {
      id: '2',
      title: 'Molecular Movement Protocol',
      description: 'Precision movement therapy to optimize neurotransmitter production and cellular regeneration',
      type: 'physical',
      duration: 14,
      participants: 289,
      joined: false,
      progress: 0,
      icon: 'fitness-outline',
      color: '#10B981',
      difficulty: 'Synaptic',
      neuralReward: 'Kinetic Energy Amplifier',
      activationEnergy: 72
    },
    {
      id: '3',
      title: 'Quantum Connection Network',
      description: 'Build meaningful connections to strengthen social neural pathways and community resilience',
      type: 'social',
      duration: 21,
      participants: 156,
      joined: true,
      progress: 38,
      icon: 'people-outline',
      color: '#8B5CF6',
      difficulty: 'Quantum',
      neuralReward: 'Social Resonance Field',
      activationEnergy: 91
    },
    {
      id: '4',
      title: 'Mindful Frequency Tuning',
      description: 'Advanced breathing techniques to regulate brainwave patterns and achieve optimal mental states',
      type: 'mindful',
      duration: 10,
      participants: 198,
      joined: false,
      progress: 0,
      icon: 'leaf-outline',
      color: '#F59E0B',
      difficulty: 'Synaptic',
      neuralReward: 'Consciousness Calibrator',
      activationEnergy: 78
    },
    {
      id: '5',
      title: 'Creative Neural Genesis',
      description: 'Unlock dormant creative pathways through artistic expression and innovative thinking protocols',
      type: 'creative',
      duration: 7,
      participants: 124,
      joined: false,
      progress: 0,
      icon: 'brush-outline',
      color: '#EF4444',
      difficulty: 'Neural',
      neuralReward: 'Innovation Catalyst',
      activationEnergy: 69
    }
  ]);

  const [synapticMessages, setSynapticMessages] = useState<SynapticMessage[]>([
    {
      id: '1',
      username: 'Anonymous_Neural_Node',
      message: 'Day 2 neural storm in progress. Seeking stabilization protocols. Any quantum healing suggestions?',
      timestamp: '30 minutes ago',
      resonance: 8,
      category: 'support',
      isAnonymous: true,
      neuralPattern: 'chaotic'
    },
    {
      id: '2',
      username: 'VeteranHealer_Sam',
      message: 'Neural storms are temporary. Your consciousness is permanent. Channel that energy into growth! ⚡🧠',
      timestamp: '1 hour ago',
      resonance: 23,
      category: 'guidance',
      isAnonymous: false,
      neuralPattern: 'stable'
    },
    {
      id: '3',
      username: 'Anonymous_Quantum_Helper',
      message: 'Breakthrough protocol: Engage tactile neural pathways. Origami activates fine motor cortex and redirects craving signals!',
      timestamp: '3 hours ago',
      resonance: 15,
      category: 'insight',
      isAnonymous: true,
      neuralPattern: 'innovative'
    }
  ]);

  // Auto-engagement system with neural network theme
  useEffect(() => {
    const addNeuralEngagement = () => {
      const neuralUsernames = [
        'QuantumSupporter', 'SynapticCheer', 'NeuralMotivator', 'BioHacker_Helper',
        'MolecularMentor', 'CognitiveCoach', 'ResonanceRanger', 'EnergyAmplifier'
      ];

      const neuralMessages = [
        'Neural resonance amplified! 🧠⚡',
        'Quantum healing energy sent! 🌟',
        'Your recovery field is inspiring! 💎',
        'Synaptic strength increasing! 🚀',
        'Molecular transformation witnessed! ⚛️',
        'Consciousness elevation detected! 🌈',
        'Neural pathway optimization confirmed! 🔬',
        'Quantum recovery protocol successful! ✨'
      ];

      setRecoveryNodes(prev => {
        const updatedNodes = [...prev];
        const randomNodeIndex = Math.floor(Math.random() * updatedNodes.length);
        const randomNode = updatedNodes[randomNodeIndex];
        
        if (randomNode) {
          const increment = Math.floor(Math.random() * 3) + 1;
          updatedNodes[randomNodeIndex] = {
            ...randomNode,
            connections: randomNode.connections + increment,
            resonance: Math.min(randomNode.resonance + Math.floor(Math.random() * 2), 100)
          };

          console.log(`🧠 ${increment} new neural connections on "${randomNode.milestone}" node!`);
        }
        
        return updatedNodes;
      });

      // Add synaptic message occasionally
      if (Math.random() < 0.3) {
        const randomUsername = neuralUsernames[Math.floor(Math.random() * neuralUsernames.length)];
        const randomMessage = neuralMessages[Math.floor(Math.random() * neuralMessages.length)];
        
        setSynapticMessages(prev => [{
          id: `neural_${Date.now()}_${Math.random()}`,
          username: randomUsername,
          message: randomMessage,
          timestamp: 'Just now',
          resonance: Math.floor(Math.random() * 5) + 1,
          category: 'support' as const,
          isAnonymous: false,
          neuralPattern: 'supportive'
        }, ...prev.slice(0, 9)]);
      }
    };

    const engagementInterval = setInterval(addNeuralEngagement, 15000); // Every 15 seconds
    return () => clearInterval(engagementInterval);
  }, []);

  const handleNeuralConnection = (nodeId: string) => {
    setRecoveryNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          userConnected: !node.userConnected,
          connections: node.userConnected ? node.connections - 1 : node.connections + 1,
          resonance: Math.min(node.resonance + (node.userConnected ? -2 : 3), 100)
        };
      }
      return node;
    }));
  };

  const joinNeuralChallenge = (challengeId: string) => {
    setNeuralChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId) {
        return {
          ...challenge,
          joined: !challenge.joined,
          participants: challenge.joined ? challenge.participants - 1 : challenge.participants + 1
        };
      }
      return challenge;
    }));
  };

  const getRecoveryPhaseColor = (phase: string) => {
    switch (phase) {
      case 'detox': return '#EF4444';
      case 'stabilization': return '#F59E0B';
      case 'growth': return '#10B981';
      case 'mastery': return '#00FFFF';
      default: return '#8B5CF6';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Neural': return '#10B981';
      case 'Synaptic': return '#F59E0B';
      case 'Quantum': return '#8B5CF6';
      default: return '#00FFFF';
    }
  };

  // Neural Network Visualization Component
  const NeuralNetworkBackground = () => (
    <Svg height="200" width={width} style={styles.networkBackground}>
      <Defs>
        <SvgLinearGradient id="connectionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00FFFF" stopOpacity="0.8" />
          <Stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6" />
          <Stop offset="100%" stopColor="#10B981" stopOpacity="0.4" />
        </SvgLinearGradient>
      </Defs>
      
      {/* Neural connections */}
      {connectionAnims.map((anim, index) => {
        const startX = (index * width / 8) + 20;
        const endX = ((index + 2) * width / 8) + 20;
        const y = 100 + Math.sin(index) * 30;
        
        return (
          <Animated.View key={index} style={{ opacity: anim }}>
            <Line
              x1={startX}
              y1={y}
              x2={endX}
              y2={y + Math.cos(index) * 20}
              stroke="url(#connectionGrad)"
              strokeWidth="2"
            />
          </Animated.View>
        );
      })}
      
      {/* Neural nodes */}
      {particleAnims.slice(0, 6).map((anim, index) => {
        const x = (index * width / 6) + 30;
        const y = 100 + Math.sin(index * 0.5) * 40;
        
        return (
          <Animated.View key={index} style={{ opacity: anim }}>
            <Circle
              cx={x}
              cy={y}
              r="6"
              fill="#00FFFF"
              opacity="0.8"
            />
            <Circle
              cx={x}
              cy={y}
              r="12"
              fill="none"
              stroke="#00FFFF"
              strokeWidth="1"
              opacity="0.4"
            />
          </Animated.View>
        );
      })}
    </Svg>
  );

  // Tab Navigation
  const renderTabBar = () => (
    <View style={styles.tabContainer}>
      {[
        { id: 'neural-grid', label: 'Neural Grid', icon: 'grid-outline' },
        { id: 'challenges', label: 'Protocols', icon: 'flash-outline' },
        { id: 'synaptic-support', label: 'Synaptic Support', icon: 'pulse-outline' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.tabActive
          ]}
          onPress={() => setActiveTab(tab.id as NetworkTab)}
        >
          <LinearGradient
            colors={
              activeTab === tab.id 
                ? ['rgba(0, 255, 255, 0.2)', 'rgba(139, 92, 246, 0.1)']
                : ['transparent', 'transparent']
            }
            style={styles.tabGradient}
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
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Recovery Node Component
  const renderRecoveryNode = (node: RecoveryNode) => (
    <TouchableOpacity key={node.id} style={styles.nodeCard}>
      <LinearGradient
        colors={[
          `${getRecoveryPhaseColor(node.recoveryPhase)}15`,
          `${getRecoveryPhaseColor(node.recoveryPhase)}08`,
          'rgba(0, 0, 0, 0.3)'
        ]}
        style={styles.nodeGradient}
      >
        {/* Node Header */}
        <View style={styles.nodeHeader}>
          <View style={styles.nodeAvatar}>
            <Text style={styles.nodeAvatarText}>{node.avatar}</Text>
            {node.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#00FFFF" />
              </View>
            )}
          </View>
          <View style={styles.nodeInfo}>
            <Text style={styles.nodeUsername}>{node.username}</Text>
            <Text style={[styles.nodeMilestone, { color: getRecoveryPhaseColor(node.recoveryPhase) }]}>
              {node.milestone}
            </Text>
          </View>
          <View style={styles.nodeMetrics}>
            <Text style={styles.nodeMetricValue}>{node.resonance}%</Text>
            <Text style={styles.nodeMetricLabel}>Resonance</Text>
          </View>
        </View>

        {/* Neural Strength Bar */}
        <View style={styles.neuralStrengthContainer}>
          <Text style={styles.neuralStrengthLabel}>Neural Strength</Text>
          <View style={styles.neuralStrengthBar}>
            <View 
              style={[
                styles.neuralStrengthFill,
                { 
                  width: `${node.neuralStrength}%`,
                  backgroundColor: getRecoveryPhaseColor(node.recoveryPhase)
                }
              ]} 
            />
          </View>
          <Text style={styles.neuralStrengthValue}>{node.neuralStrength}%</Text>
        </View>

        {/* Message */}
        <Text style={styles.nodeMessage}>{node.message}</Text>

        {/* Actions */}
        <View style={styles.nodeActions}>
          <TouchableOpacity 
            style={[
              styles.connectionButton,
              node.userConnected && styles.connectionButtonActive
            ]}
            onPress={() => handleNeuralConnection(node.id)}
          >
            <Ionicons 
              name={node.userConnected ? "link" : "link-outline"} 
              size={16} 
              color={node.userConnected ? "#00FFFF" : "rgba(255, 255, 255, 0.7)"} 
            />
            <Text style={[
              styles.connectionButtonText,
              node.userConnected && styles.connectionButtonTextActive
            ]}>
              {node.connections} Connections
            </Text>
          </TouchableOpacity>
          
          <View style={styles.nodeTimestamp}>
            <Text style={styles.timestampText}>{node.timestamp}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Neural Challenge Component
  const renderNeuralChallenge = (challenge: NeuralChallenge) => (
    <TouchableOpacity key={challenge.id} style={styles.challengeCard}>
      <LinearGradient
        colors={[
          `${challenge.color}20`,
          `${challenge.color}10`,
          'rgba(0, 0, 0, 0.3)'
        ]}
        style={styles.challengeGradient}
      >
        {/* Challenge Header */}
        <View style={styles.challengeHeader}>
          <View style={[styles.challengeIcon, { backgroundColor: `${challenge.color}30` }]}>
            <Ionicons name={challenge.icon as any} size={24} color={challenge.color} />
          </View>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeTitle}>{challenge.title}</Text>
            <Text style={[styles.challengeDifficulty, { color: getDifficultyColor(challenge.difficulty) }]}>
              {challenge.difficulty} Level
            </Text>
          </View>
          <View style={styles.challengeMetrics}>
            <Text style={styles.challengeParticipants}>{challenge.participants}</Text>
            <Text style={styles.challengeParticipantsLabel}>Nodes</Text>
          </View>
        </View>

        {/* Activation Energy */}
        <View style={styles.activationEnergyContainer}>
          <Text style={styles.activationEnergyLabel}>Activation Energy</Text>
          <View style={styles.activationEnergyBar}>
            <View 
              style={[
                styles.activationEnergyFill,
                { 
                  width: `${challenge.activationEnergy}%`,
                  backgroundColor: challenge.color
                }
              ]} 
            />
          </View>
          <Text style={styles.activationEnergyValue}>{challenge.activationEnergy}%</Text>
        </View>

        {/* Description */}
        <Text style={styles.challengeDescription}>{challenge.description}</Text>

        {/* Progress (if joined) */}
        {challenge.joined && (
          <View style={styles.challengeProgress}>
            <Text style={styles.challengeProgressLabel}>Neural Integration: {challenge.progress}%</Text>
            <View style={styles.challengeProgressBar}>
              <View 
                style={[
                  styles.challengeProgressFill,
                  { 
                    width: `${challenge.progress}%`,
                    backgroundColor: challenge.color
                  }
                ]} 
              />
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.challengeActions}>
          <TouchableOpacity 
            style={[
              styles.joinButton,
              challenge.joined && styles.joinButtonActive
            ]}
            onPress={() => joinNeuralChallenge(challenge.id)}
          >
            <LinearGradient
              colors={
                challenge.joined
                  ? [challenge.color, `${challenge.color}80`]
                  : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
              }
              style={styles.joinButtonGradient}
            >
              <Ionicons 
                name={challenge.joined ? "checkmark-circle" : "add-circle-outline"} 
                size={18} 
                color={challenge.joined ? "#FFFFFF" : challenge.color} 
              />
              <Text style={[
                styles.joinButtonText,
                { color: challenge.joined ? "#FFFFFF" : challenge.color }
              ]}>
                {challenge.joined ? 'Integrated' : 'Activate Protocol'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.challengeDuration}>{challenge.duration} days</Text>
        </View>

        {/* Neural Reward */}
        <View style={styles.neuralReward}>
          <Ionicons name="trophy-outline" size={16} color="#F59E0B" />
          <Text style={styles.neuralRewardText}>{challenge.neuralReward}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Synaptic Message Component
  const renderSynapticMessage = (message: SynapticMessage) => (
    <TouchableOpacity key={message.id} style={styles.messageCard}>
      <LinearGradient
        colors={[
          'rgba(139, 92, 246, 0.15)',
          'rgba(139, 92, 246, 0.08)',
          'rgba(0, 0, 0, 0.3)'
        ]}
        style={styles.messageGradient}
      >
        {/* Message Header */}
        <View style={styles.messageHeader}>
          <View style={styles.messageAvatar}>
            <Ionicons 
              name={message.isAnonymous ? "help-circle-outline" : "person-circle-outline"} 
              size={24} 
              color="#8B5CF6" 
            />
          </View>
          <View style={styles.messageInfo}>
            <Text style={styles.messageUsername}>
              {message.isAnonymous ? 'Anonymous Neural Node' : message.username}
            </Text>
            <Text style={styles.messagePattern}>Pattern: {message.neuralPattern}</Text>
          </View>
          <View style={styles.messageResonance}>
            <Text style={styles.messageResonanceValue}>{message.resonance}</Text>
            <Text style={styles.messageResonanceLabel}>Resonance</Text>
          </View>
        </View>

        {/* Message Content */}
        <Text style={styles.messageContent}>{message.message}</Text>

        {/* Message Actions */}
        <View style={styles.messageActions}>
          <TouchableOpacity style={styles.resonanceButton}>
            <Ionicons name="pulse-outline" size={16} color="#8B5CF6" />
            <Text style={styles.resonanceButtonText}>Amplify</Text>
          </TouchableOpacity>
          
          <Text style={styles.messageTimestamp}>{message.timestamp}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Content Renderers
  const renderNeuralGrid = () => (
    <View style={styles.contentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recovery Neural Network</Text>
        <Text style={styles.sectionSubtitle}>
          Connect with fellow recovery warriors in the quantum healing field
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {recoveryNodes.map(renderRecoveryNode)}
      </ScrollView>
    </View>
  );

  const renderChallenges = () => (
    <View style={styles.contentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Neural Enhancement Protocols</Text>
        <Text style={styles.sectionSubtitle}>
          Advanced challenges to accelerate your recovery transformation
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {neuralChallenges.map(renderNeuralChallenge)}
      </ScrollView>
    </View>
  );

  const renderSynapticSupport = () => (
    <View style={styles.contentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Synaptic Support Network</Text>
        <Text style={styles.sectionSubtitle}>
          Real-time neural communication and quantum healing guidance
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {synapticMessages.map(renderSynapticMessage)}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#1A1A2E', '#16213E']}
        style={styles.background}
      >
        {/* Neural Network Background */}
        <NeuralNetworkBackground />

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.headerTitle}>Recovery Network</Text>
          <Text style={styles.headerSubtitle}>
            Neural connections: {recoveryNodes.reduce((sum, node) => sum + node.connections, 0)}
          </Text>
        </Animated.View>

        {/* Tab Navigation */}
        {renderTabBar()}

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {activeTab === 'neural-grid' && renderNeuralGrid()}
          {activeTab === 'challenges' && renderChallenges()}
          {activeTab === 'synaptic-support' && renderSynapticSupport()}
        </Animated.View>

        {/* Floating Share Button */}
        <Animated.View style={[styles.shareButton, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            style={styles.shareButtonInner}
            onPress={() => setShareModalVisible(true)}
          >
            <LinearGradient
              colors={['#00FFFF', '#8B5CF6']}
              style={styles.shareButtonGradient}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Share Modal */}
        <Modal
          visible={shareModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setShareModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#1A1A2E', '#16213E', '#0A0F1C']}
                style={styles.modalGradient}
              >
                <Text style={styles.modalTitle}>Share Neural Breakthrough</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Share your recovery insight with the network..."
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={shareMessage}
                  onChangeText={setShareMessage}
                  multiline
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setShareModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalShareButton}>
                    <LinearGradient
                      colors={['#00FFFF', '#8B5CF6']}
                      style={styles.modalShareGradient}
                    >
                      <Text style={styles.modalShareText}>Transmit</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>
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
  networkBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: 60,
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
    marginHorizontal: SPACING.xs,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  tabActive: {
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
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
    textAlign: 'center',
    lineHeight: 22,
  },

  // Node Styles
  nodeCard: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  nodeGradient: {
    padding: SPACING.lg,
  },
  nodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  nodeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    position: 'relative',
  },
  nodeAvatarText: {
    fontSize: 20,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00FFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeInfo: {
    flex: 1,
  },
  nodeUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  nodeMilestone: {
    fontSize: 14,
    fontWeight: '600',
  },
  nodeMetrics: {
    alignItems: 'flex-end',
  },
  nodeMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FFFF',
  },
  nodeMetricLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  neuralStrengthContainer: {
    marginBottom: SPACING.md,
  },
  neuralStrengthLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: SPACING.xs,
  },
  neuralStrengthBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  neuralStrengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  neuralStrengthValue: {
    fontSize: 12,
    color: '#00FFFF',
    textAlign: 'right',
  },
  nodeMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  nodeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  connectionButtonActive: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
  },
  connectionButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: SPACING.xs,
  },
  connectionButtonTextActive: {
    color: '#00FFFF',
  },
  nodeTimestamp: {
    alignItems: 'flex-end',
  },
  timestampText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },

  // Challenge Styles
  challengeCard: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  challengeGradient: {
    padding: SPACING.lg,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  challengeDifficulty: {
    fontSize: 14,
    fontWeight: '600',
  },
  challengeMetrics: {
    alignItems: 'flex-end',
  },
  challengeParticipants: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FFFF',
  },
  challengeParticipantsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activationEnergyContainer: {
    marginBottom: SPACING.md,
  },
  activationEnergyLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: SPACING.xs,
  },
  activationEnergyBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  activationEnergyFill: {
    height: '100%',
    borderRadius: 3,
  },
  activationEnergyValue: {
    fontSize: 12,
    color: '#00FFFF',
    textAlign: 'right',
  },
  challengeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  challengeProgress: {
    marginBottom: SPACING.md,
  },
  challengeProgressLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: SPACING.xs,
  },
  challengeProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  challengeProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  challengeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  joinButton: {
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  joinButtonActive: {},
  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  challengeDuration: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  neuralReward: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  neuralRewardText: {
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },

  // Message Styles
  messageCard: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  messageGradient: {
    padding: SPACING.lg,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  messageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  messageInfo: {
    flex: 1,
  },
  messageUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  messagePattern: {
    fontSize: 12,
    color: '#8B5CF6',
  },
  messageResonance: {
    alignItems: 'flex-end',
  },
  messageResonanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  messageResonanceLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  messageContent: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resonanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.md,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  resonanceButtonText: {
    fontSize: 12,
    color: '#8B5CF6',
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  messageTimestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },

  // Share Button
  shareButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  shareButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: SPACING.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00FFFF',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: SPACING.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  modalCancelText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  modalShareButton: {
    flex: 1,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  modalShareGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  modalShareText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default CommunityScreen; 