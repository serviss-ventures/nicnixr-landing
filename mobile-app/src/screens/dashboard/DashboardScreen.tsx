import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { updateProgress } from '../../store/slices/progressSlice';
import { COLORS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, G, Defs, RadialGradient, Stop } from 'react-native-svg';

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

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.progress);
  const [pulseAnim] = useState(new Animated.Value(0));
  const [signals, setSignals] = useState<Signal[]>([]);
  const [networkPulse] = useState(new Animated.Value(1));

  // Calculate neural network growth based on days clean
  const calculateNetworkGrowth = () => {
    const maxNodes = 50;
    const baseNodes = 5;
    const growthRate = 0.5;
    const activeNodes = Math.min(baseNodes + Math.floor(stats.daysClean * growthRate), maxNodes);
    return activeNodes;
  };

  // Generate neural network nodes
  const generateNeuralNetwork = () => {
    const activeNodeCount = calculateNetworkGrowth();
    const nodes: NeuralNode[] = [];
    const layers = Math.min(4 + Math.floor(stats.daysClean / 7), 7);
    const centerX = width / 2;
    const centerY = 200;
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
    dispatch(updateProgress());
    
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
    };
  }, [dispatch, stats.daysClean]);

  // Neural Network SVG Component
  const NeuralNetworkVisualization = () => {
    return (
      <View>
        <Animated.View style={{ transform: [{ scale: networkPulse }] }}>
          <Svg width={width} height={400} style={styles.neuralNetworkSvg}>
            <Defs>
              <RadialGradient id="nodeGradient" cx="50%" cy="50%">
                <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="1" />
                <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0.3" />
              </RadialGradient>
              <RadialGradient id="activeNodeGradient" cx="50%" cy="50%">
                <Stop offset="0%" stopColor={COLORS.accent} stopOpacity="1" />
                <Stop offset="100%" stopColor={COLORS.primary} stopOpacity="0.5" />
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
                      stroke={node.active ? COLORS.primary : COLORS.cardBorder}
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
                    fill={COLORS.primary}
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
                    fill={COLORS.text}
                    opacity={0.8}
                  />
                )}
              </G>
            ))}
            
            {/* Center node (the brain/core) */}
            <G>
              <Circle
                cx={width / 2}
                cy={200}
                r={15}
                fill="url(#activeNodeGradient)"
              />
              <Circle
                cx={width / 2}
                cy={200}
                r={25}
                fill="none"
                stroke={COLORS.primary}
                strokeWidth={2}
                opacity={0.3}
              />
              <Circle
                cx={width / 2 - 3}
                cy={200 - 3}
                r={5}
                fill={COLORS.text}
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
              backgroundColor: COLORS.primary,
              shadowColor: COLORS.primary,
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
                backgroundColor: COLORS.primary,
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
    <LinearGradient
      colors={['#000000', '#0A0F1C', '#0F172A']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back, {user?.username || 'Warrior'}</Text>
          <Text style={styles.tagline}>Your neural pathways are healing</Text>
        </View>

        {/* Neural Network Visualization */}
        <View style={styles.neuralNetworkContainer}>
          <NeuralNetworkVisualization />
          
          {/* Central Stats Overlay */}
          <View style={styles.centralStatsOverlay}>
            <Text style={styles.daysCleanNumber}>{stats.daysClean}</Text>
            <Text style={styles.daysCleanLabel}>Days Free</Text>
            <Text style={styles.neuralGrowthText}>
              {calculateNetworkGrowth()} neural connections restored
            </Text>
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
              <Text style={styles.metricValue}>{Math.round(stats.healthScore)}%</Text>
              <View style={styles.metricBar}>
                <LinearGradient
                  colors={['#10B981', '#06B6D4']}
                  style={[styles.metricBarFill, { width: `${stats.healthScore}%` }]}
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
              <Text style={styles.metricValue}>{Math.round(stats.lifeRegained)}h</Text>
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
              <Text style={styles.metricValue}>${Math.round(stats.moneySaved)}</Text>
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
                <Text style={styles.metricTitle}>Cigarettes</Text>
              </View>
              <Text style={styles.metricValue}>{stats.cigarettesAvoided}</Text>
              <Text style={styles.metricSubtext}>avoided</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.primaryAction}>
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
            <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
            <View style={styles.insightTextContainer}>
              <Text style={styles.insightTitle}>Neural Recovery Insight</Text>
              <Text style={styles.insightText}>
                Your brain is forming {calculateNetworkGrowth()} new healthy neural pathways. 
                Each day strengthens your freedom from nicotine's control.
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING['3xl'],
    paddingBottom: SPACING['3xl'],
  },
  header: {
    marginBottom: SPACING.xl,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  neuralNetworkContainer: {
    height: 400,
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  neuralNetworkSvg: {
    position: 'absolute',
    top: 0,
    left: -SPACING.lg,
  },
  centralStatsOverlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  daysCleanNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: COLORS.text,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  daysCleanLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: -SPACING.sm,
  },
  neuralGrowthText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
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
    borderColor: COLORS.cardBorder,
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
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  metricSubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
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
    color: COLORS.text,
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
    color: COLORS.text,
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
    borderColor: COLORS.cardBorder,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  insightCard: {
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
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
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  insightText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default DashboardScreen; 