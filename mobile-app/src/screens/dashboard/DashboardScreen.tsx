import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { updateProgress } from '../../store/slices/progressSlice';
import { COLORS, SPACING } from '../../constants/theme';

// Safety check for COLORS to prevent LinearGradient errors
const safeColors = {
  primary: COLORS?.primary || '#10B981',
  secondary: COLORS?.secondary || '#06B6D4',
  accent: COLORS?.accent || '#8B5CF6',
  text: COLORS?.text || '#FFFFFF',
  textSecondary: COLORS?.textSecondary || '#9CA3AF',
  textMuted: COLORS?.textMuted || '#6B7280',
  cardBorder: COLORS?.cardBorder || 'rgba(255, 255, 255, 0.1)',
};

// Replace COLORS with safeColors for all usage
const SAFE_COLORS = safeColors;
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import DysonShieldMode from '../shield/DysonShieldMode';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { DashboardStackParamList } from '../../types';

// Import debug utilities in development
if (__DEV__) {
  require('../../debug/neuralGrowthTest');
  require('../../debug/appReset');
}

const { width, height } = Dimensions.get('window');

interface NeuralNode {
  id: string;
  x: number;
  y: number;
  active: boolean;
  layer: number;
  connections: string[];
  pulseAnim: Animated.Value;
}

interface Signal {
  id: string;
  from: NeuralNode;
  to: NeuralNode;
  progress: Animated.Value;
}

type DashboardNavigationProp = StackNavigationProp<DashboardStackParamList, 'DashboardMain'>;

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.progress);
  const [pulseAnim] = useState(new Animated.Value(0));
  const [signals, setSignals] = useState<Signal[]>([]);
  const [networkPulse] = useState(new Animated.Value(1));
  const [shieldModeVisible, setShieldModeVisible] = useState(false);
  const navigation = useNavigation<DashboardNavigationProp>();

  // Calculate neural network growth based on days clean
  const calculateNetworkGrowth = () => {
    const maxNodes = 50;
    const baseNodes = 5;
    const growthRate = 0.8; // Increased growth rate for more visible progress
    const daysClean = stats?.daysClean || 0;
    const activeNodes = Math.min(baseNodes + Math.floor(daysClean * growthRate), maxNodes);
    
    // Log for debugging in development
    if (__DEV__) {
      console.log(`🧠 Neural Growth: Day ${daysClean} = ${activeNodes} nodes (${Math.round((activeNodes/maxNodes)*100)}% capacity)`);
    }
    
    return activeNodes;
  };

  // Get growth message based on days clean
  const getGrowthMessage = () => {
    const nodes = calculateNetworkGrowth();
    const daysClean = stats?.daysClean || 0;
    let message = "";
    
    if (daysClean === 0) message = "Starting your neural recovery journey";
    else if (daysClean === 1) message = "First healthy pathways forming";
    else if (daysClean < 7) message = "Building stronger connections daily";
    else if (daysClean < 30) message = "Neural network expanding rapidly";
    else if (daysClean < 90) message = "Brain chemistry rebalancing";
    else message = "Neural pathways fully restored";
    
    // Log for debugging in development
    if (__DEV__) {
      console.log(`💭 Growth Message: Day ${daysClean} = "${message}"`);
    }
    
    return message;
  };

  // Generate neural network nodes
  const generateNeuralNetwork = () => {
    const activeNodeCount = calculateNetworkGrowth();
    const nodes: NeuralNode[] = [];
    const layers = Math.min(4 + Math.floor((stats?.daysClean || 0) / 7), 7);
    const centerX = width / 2;
    const centerY = 140; // Adjusted for smaller height
    const layerSpacing = 60;

    // Create nodes for each layer
    for (let layer = 0; layer < layers; layer++) {
      const nodesInLayer = Math.min(3 + Math.floor(layer * 1.5), 8);
      const layerRadius = layer * layerSpacing;
      
      for (let i = 0; i < nodesInLayer; i++) {
        if (nodes.length >= activeNodeCount) break;
        
        const angle = (i / nodesInLayer) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + layerRadius * Math.cos(angle);
        const y = centerY + layerRadius * Math.sin(angle);
        
        const node: NeuralNode = {
          id: `node-${layer}-${i}`,
          x,
          y,
          active: nodes.length < activeNodeCount * 0.7,
          layer,
          connections: [],
          pulseAnim: new Animated.Value(1),
        };
        
        // Connect to nodes in previous layer
        if (layer > 0) {
          const prevLayerNodes = nodes.filter(n => n.layer === layer - 1);
          prevLayerNodes.forEach(prevNode => {
            if (Math.random() > 0.3) {
              node.connections.push(prevNode.id);
            }
          });
        }
        
        nodes.push(node);
      }
    }
    
    return nodes;
  };

  const neuralNodes = generateNeuralNetwork();

  // Create animated signals between nodes
  const createSignals = () => {
    const newSignals: Signal[] = [];
    neuralNodes.forEach((node, index) => {
      if (node.active && node.connections.length > 0) {
        const numSignals = Math.random() > 0.5 ? 2 : 1;
        for (let i = 0; i < numSignals; i++) {
          const targetId = node.connections[Math.floor(Math.random() * node.connections.length)];
          const targetNode = neuralNodes.find(n => n.id === targetId);
          if (targetNode) {
            newSignals.push({
              id: `signal-${node.id}-${targetId}-${i}`,
              from: targetNode,
              to: node,
              progress: new Animated.Value(0),
            });
          }
        }
      }
    });
    return newSignals;
  };

  useEffect(() => {
    // Ensure progress is initialized with user profile
    if (user?.quitDate && user?.nicotineProduct && (!stats || stats.daysClean === undefined)) {
      const userProfile = {
        category: user.nicotineProduct.category || 'cigarettes',
        dailyCost: user.dailyCost || 15,
        dailyAmount: user.packagesPerDay || 10,
      };
      
      // Initialize progress if not already done
      dispatch(updateProgress()).catch(() => {
        // If update fails, try to initialize
        const { initializeProgress } = require('../../store/slices/progressSlice');
        dispatch(initializeProgress({
          quitDate: user.quitDate,
          userProfile
        }));
      });
    }

    // Set up interval to update progress every minute
    const progressInterval = setInterval(() => {
      if (user?.quitDate) {
        dispatch(updateProgress());
      }
    }, 60000); // Update every minute

    // Also update immediately
    if (user?.quitDate) {
      dispatch(updateProgress());
    }
    
    // Network-wide pulse animation
    const networkPulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(networkPulse, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(networkPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    networkPulseAnim.start();

    // Animate individual nodes
    neuralNodes.forEach((node, index) => {
      const animateNode = () => {
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.loop(
            Animated.sequence([
              Animated.timing(node.pulseAnim, {
                toValue: 1.2,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.timing(node.pulseAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
              }),
            ])
          ),
        ]).start();
      };
      animateNode();
    });

    // Create and animate signals
    const signalList = createSignals();
    setSignals(signalList);

    signalList.forEach((signal, index) => {
      const animateSignal = () => {
        signal.progress.setValue(0);
        Animated.sequence([
          Animated.delay(index * 300 + Math.random() * 2000),
          Animated.timing(signal.progress, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
        ]).start(() => {
          setTimeout(animateSignal, Math.random() * 3000);
        });
      };
      animateSignal();
    });

    return () => {
      networkPulseAnim.stop();
      clearInterval(progressInterval);
    };
  }, [dispatch, user?.quitDate]);

  // Neural Network SVG Component
  const NeuralNetworkVisualization = () => {
    return (
      <View>
        <Animated.View style={{ transform: [{ scale: networkPulse }] }}>
          <Svg width={width} height={280} style={styles.neuralNetworkSvg}>
            <Defs>
              <RadialGradient id="nodeGradient" cx="50%" cy="50%">
                <Stop offset="0%" stopColor={safeColors.primary} stopOpacity="1" />
                <Stop offset="100%" stopColor={safeColors.secondary} stopOpacity="0.3" />
              </RadialGradient>
              <RadialGradient id="activeNodeGradient" cx="50%" cy="50%">
                <Stop offset="0%" stopColor={safeColors.accent} stopOpacity="1" />
                <Stop offset="100%" stopColor={safeColors.primary} stopOpacity="0.5" />
              </RadialGradient>
            </Defs>
            
            {/* Draw connections */}
            {neuralNodes.map((node, nodeIndex) => (
              <G key={`connections-${node.id}`}>
                {node.connections.map(targetId => {
                  const targetNode = neuralNodes.find(n => n.id === targetId);
                  if (!targetNode) return null;
                  
                  return (
                    <Line
                      key={`line-${node.id}-${targetId}`}
                      x1={node.x}
                      y1={node.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={node.active ? safeColors.primary : safeColors.cardBorder}
                      strokeWidth={node.active ? 2 : 1}
                      strokeOpacity={node.active ? 0.6 : 0.2}
                    />
                  );
                })}
              </G>
            ))}
            
            {/* Draw nodes */}
            {neuralNodes.map((node, index) => (
              <G key={node.id}>
                {/* Outer glow for active nodes */}
                {node.active && (
                  <Circle
                    cx={node.x}
                    cy={node.y}
                    r={20}
                    fill={safeColors.primary}
                    opacity={0.2}
                  />
                )}
                
                {/* Main node */}
                <Circle
                  cx={node.x}
                  cy={node.y}
                  r={node.active ? 10 : 6}
                  fill={node.active ? "url(#activeNodeGradient)" : "url(#nodeGradient)"}
                />
                
                {/* Inner bright spot */}
                {node.active && (
                  <Circle
                    cx={node.x - 2}
                    cy={node.y - 2}
                    r={3}
                    fill={safeColors.text}
                    opacity={0.8}
                  />
                )}
              </G>
            ))}
            
            {/* Center node (the brain/core) */}
            <G>
              <Circle
                cx={width / 2}
                cy={140}
                r={15}
                fill="url(#activeNodeGradient)"
              />
              <Circle
                cx={width / 2}
                cy={140}
                r={25}
                fill="none"
                stroke={safeColors.primary}
                strokeWidth={2}
                opacity={0.3}
              />
              <Circle
                cx={width / 2 - 3}
                cy={140 - 3}
                r={5}
                                  fill={safeColors.text}
                opacity={0.9}
              />
            </G>
          </Svg>
        </Animated.View>
        
        {/* Animated signals outside SVG */}
        {signals.map(signal => (
          <Animated.View
            key={signal.id}
            style={{
              position: 'absolute',
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: safeColors.primary,
              shadowColor: safeColors.primary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              transform: [
                {
                  translateX: signal.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [signal.from.x - 4, signal.to.x - 4],
                  }),
                },
                {
                  translateY: signal.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [signal.from.y - 4, signal.to.y - 4],
                  }),
                },
              ],
              opacity: signal.progress.interpolate({
                inputRange: [0, 0.1, 0.9, 1],
                outputRange: [0, 1, 1, 0],
              }),
            }}
          />
        ))}
        
        {/* Individual node animations */}
        {neuralNodes.map(node => (
          node.active && (
            <Animated.View
              key={`pulse-${node.id}`}
              style={{
                position: 'absolute',
                left: node.x - 15,
                top: node.y - 15,
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: safeColors.primary,
                opacity: 0.3,
                transform: [{ scale: node.pulseAnim }],
              }}
            />
          )
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Neural Recovery Explanation */}
        <View style={styles.neuralExplanation}>
          <View style={styles.neuralExplanationHeader}>
            <Ionicons name="pulse-outline" size={20} color={safeColors.primary} />
            <Text style={styles.neuralExplanationTitle}>Your Brain Recovery Map</Text>
          </View>
          <Text style={styles.neuralExplanationText}>
            Watch your brain build new healthy pathways. Each day creates stronger connections, 
            breaking nicotine's hold and restoring your natural neural network.
          </Text>
        </View>

        {/* Neural Network Visualization */}
        <View style={styles.neuralNetworkContainer}>
          <NeuralNetworkVisualization />
          
          {/* Central Stats Overlay */}
          <View style={styles.centralStatsOverlay}>
            <Text style={styles.daysCleanNumber}>{stats?.daysClean || 0}</Text>
            <Text style={styles.daysCleanLabel}>Days Free</Text>
            {(stats?.daysClean || 0) < 3 && (
              <Text style={styles.hoursCleanText}>
                {stats?.hoursClean || 0} hours clean
              </Text>
            )}
            <View style={styles.neuralGrowthContainer}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
                style={styles.neuralGrowthBadge}
              >
                <Ionicons name="trending-up" size={16} color={safeColors.primary} />
                <Text style={styles.neuralGrowthText}>
                  {calculateNetworkGrowth()} connections restored
                </Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Progress Metrics Grid */}
        <View style={styles.metricsGrid}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
            style={styles.metricCard}
          >
            <View style={styles.metricContent}>
              <View style={styles.metricHeader}>
                <Ionicons name="heart-outline" size={20} color="#10B981" />
                <Text style={styles.metricTitle}>Health Score</Text>
              </View>
              <Text style={styles.metricValue}>{Math.round(stats?.healthScore || 0)}%</Text>
              <View style={styles.metricBar}>
                <LinearGradient
                  colors={['#10B981', '#06B6D4']}
                  style={[styles.metricBarFill, { width: `${stats?.healthScore || 0}%` }]}
                />
              </View>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)']}
            style={styles.metricCard}
          >
            <View style={styles.metricContent}>
              <View style={styles.metricHeader}>
                <Ionicons name="time-outline" size={20} color="#8B5CF6" />
                <Text style={styles.metricTitle}>Time Saved</Text>
              </View>
              <Text style={styles.metricValue}>{Math.round(stats?.lifeRegained || 0)}h</Text>
              <Text style={styles.metricSubtext}>of life regained</Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(245, 158, 11, 0.15)', 'rgba(239, 68, 68, 0.15)']}
            style={styles.metricCard}
          >
            <View style={styles.metricContent}>
              <View style={styles.metricHeader}>
                <Ionicons name="cash-outline" size={20} color="#F59E0B" />
                <Text style={styles.metricTitle}>Money Saved</Text>
              </View>
              <Text style={styles.metricValue}>${Math.round(stats?.moneySaved || 0)}</Text>
              <Text style={styles.metricSubtext}>and counting</Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(59, 130, 246, 0.15)', 'rgba(16, 185, 129, 0.15)']}
            style={styles.metricCard}
          >
            <View style={styles.metricContent}>
              <View style={styles.metricHeader}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#3B82F6" />
                <Text style={styles.metricTitle}>Units Avoided</Text>
              </View>
              <Text style={styles.metricValue}>{stats?.unitsAvoided || 0}</Text>
              <Text style={styles.metricSubtext}>avoided</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.primaryAction} onPress={() => setShieldModeVisible(true)}>
            <LinearGradient
              colors={['#1E40AF', '#3B82F6', '#06B6D4']}
              style={styles.primaryActionGradient}
            >
              <Ionicons name="shield" size={24} color="#FFFFFF" />
              <View style={styles.actionTextContainer}>
                <Text style={styles.primaryActionText}>Shield Mode</Text>
                <Text style={styles.primaryActionSubtext}>Activate craving defense</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryAction}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
                style={styles.secondaryActionGradient}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                <Text style={styles.secondaryActionText}>Check In</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryAction}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
                style={styles.secondaryActionGradient}
              >
                <Ionicons name="bulb-outline" size={20} color="#8B5CF6" />
                <Text style={styles.secondaryActionText}>Daily Tip</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Neural Growth Insight */}
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.1)', 'rgba(139, 92, 246, 0.1)']}
          style={styles.insightCard}
        >
          <View style={styles.insightContent}>
            <Ionicons name="analytics-outline" size={24} color={safeColors.primary} />
            <View style={styles.insightTextContainer}>
              <Text style={styles.insightTitle}>Today's Neural Progress</Text>
              <Text style={styles.insightText}>
                {getGrowthMessage()}. Your brain now has {calculateNetworkGrowth()} active 
                healthy pathways - each one breaking nicotine's control.
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>

              {/* Dyson Shield Mode Modal */}
        <DysonShieldMode 
          visible={shieldModeVisible} 
          onClose={() => setShieldModeVisible(false)} 
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING['3xl'], // Extra bottom padding to ensure content is visible above tab bar
  },

  neuralExplanation: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  neuralExplanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  neuralExplanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: safeColors.text,
    marginLeft: SPACING.sm,
  },
  neuralExplanationText: {
    fontSize: 14,
    color: safeColors.textSecondary,
    lineHeight: 20,
  },
  neuralNetworkContainer: {
    height: 280, // Reduced from 400 to 280
    marginBottom: SPACING.md, // Reduced margin
    position: 'relative',
  },
  neuralNetworkSvg: {
    position: 'absolute',
    top: 0,
    left: -SPACING.lg,
  },
  centralStatsOverlay: {
    position: 'absolute',
    top: '35%', // Adjusted for smaller height
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  daysCleanNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: safeColors.text,
    textShadowColor: safeColors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  daysCleanLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: safeColors.primary,
    marginTop: -SPACING.sm,
  },
  hoursCleanText: {
    fontSize: 14,
    color: safeColors.textSecondary,
    marginTop: SPACING.sm,
  },
  neuralGrowthContainer: {
    marginTop: SPACING.md,
  },
  neuralGrowthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  neuralGrowthText: {
    fontSize: 13,
    color: safeColors.primary,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING['2xl'],
  },
  metricCard: {
    width: '48%',
    marginBottom: SPACING.md,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: safeColors.cardBorder,
  },
  metricContent: {
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: SPACING.lg,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricTitle: {
    fontSize: 12,
    color: safeColors.textSecondary,
    marginLeft: SPACING.xs,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: safeColors.text,
  },
  metricSubtext: {
    fontSize: 11,
    color: safeColors.textMuted,
    marginTop: 2,
  },
  metricBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  quickActions: {
    marginBottom: SPACING['2xl'],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: safeColors.text,
    marginBottom: SPACING.lg,
  },
  primaryAction: {
    marginBottom: SPACING.md,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: safeColors.text,
  },
  primaryActionSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryAction: {
    width: '48%',
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  secondaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: safeColors.cardBorder,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: safeColors.text,
    marginLeft: SPACING.sm,
  },
  insightCard: {
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: safeColors.cardBorder,
  },
  insightContent: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: SPACING.lg,
  },
  insightTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: safeColors.text,
    marginBottom: SPACING.xs,
  },
  insightText: {
    fontSize: 13,
    color: safeColors.textSecondary,
    lineHeight: 18,
  },
});

export default DashboardScreen; 