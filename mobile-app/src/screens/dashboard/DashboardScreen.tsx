import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Modal } from 'react-native';
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
import recoveryTrackingService from '../../services/recoveryTrackingService';

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
  const [neuralInfoVisible, setNeuralInfoVisible] = useState(false);
  const navigation = useNavigation<DashboardNavigationProp>();

  // Get unified recovery data from tracking service
  const getRecoveryData = () => {
    try {
      const data = recoveryTrackingService.getRecoveryData();
      
      // Log for debugging in development
      if (__DEV__) {
        recoveryTrackingService.logRecoveryData('Dashboard');
      }
      
      return {
        recoveryPercentage: data.recoveryPercentage,
        isStarting: data.daysClean === 0,
        daysClean: data.daysClean,
        recoveryMessage: data.recoveryMessage,
        neuralBadgeMessage: data.neuralBadgeMessage,
        growthMessage: data.growthMessage,
        personalizedUnitName: data.personalizedUnitName,
      };
    } catch (error) {
      // Fallback to basic calculation if service fails
      const daysClean = stats?.daysClean || 0;
      const recoveryPercentage = recoveryTrackingService.calculateDopamineRecovery(daysClean);
      
      if (__DEV__) {
        console.warn('⚠️ Recovery service failed, using fallback:', error);
      }
      
      return {
        recoveryPercentage: Math.round(recoveryPercentage),
        isStarting: daysClean === 0,
        daysClean,
        recoveryMessage: "Recovery data temporarily unavailable",
        neuralBadgeMessage: "Recovery in progress",
        growthMessage: "Your brain is healing",
        personalizedUnitName: "units avoided",
      };
    }
  };

  // Get current recovery data
  const recoveryData = getRecoveryData();

  // Generate neural network nodes using useMemo to ensure it's available during render
  const neuralNodes = useMemo(() => {
    try {
      const { recoveryPercentage } = recoveryData;
      const nodes: NeuralNode[] = [];
      const layers = 5; // Fixed number of layers representing brain regions
      const centerX = width / 2;
      const centerY = 140;
      const layerSpacing = 50;

      // Create nodes for each layer (representing different brain regions)
      for (let layer = 0; layer < layers; layer++) {
        const nodesInLayer = 6; // Fixed nodes per layer
        const layerRadius = layer * layerSpacing;
        
        for (let i = 0; i < nodesInLayer; i++) {
          const angle = (i / nodesInLayer) * 2 * Math.PI - Math.PI / 2;
          const x = centerX + layerRadius * Math.cos(angle);
          const y = centerY + layerRadius * Math.sin(angle);
          
          // Node is "active" (healthy) based on recovery percentage
          // Inner layers recover first, outer layers later
          const layerRecoveryThreshold = (layer / (layers - 1)) * 100;
          const nodeRecoveryThreshold = layerRecoveryThreshold + (i / nodesInLayer) * 20;
          
          const node: NeuralNode = {
            id: `node-${layer}-${i}`,
            x,
            y,
            active: recoveryPercentage >= nodeRecoveryThreshold,
            layer,
            connections: [],
            pulseAnim: new Animated.Value(1),
          };
          
          // Connect to nodes in previous layer
          if (layer > 0) {
            const prevLayerNodes = nodes.filter(n => n.layer === layer - 1);
            prevLayerNodes.forEach(prevNode => {
              if (Math.random() > 0.4) {
                node.connections.push(prevNode.id);
              }
            });
          }
          
          nodes.push(node);
        }
      }
      
      return nodes;
    } catch (error) {
      console.error('Error generating neural network:', error);
      // Return a minimal fallback network to prevent crashes
      return [
        {
          id: 'fallback-1',
          x: width / 2,
          y: 140,
          active: true,
          layer: 0,
          connections: [],
          pulseAnim: new Animated.Value(1),
        }
      ];
    }
  }, [recoveryData, width]);

  // Create animated signals between nodes - with safety check
  const createSignals = () => {
    if (!neuralNodes || !Array.isArray(neuralNodes) || neuralNodes.length === 0) {
      return [];
    }
    
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

  // Get personalized unit name from recovery data
  const personalizedUnitName = recoveryData.personalizedUnitName;

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

    // Animate individual nodes - with safety check
    if (neuralNodes && Array.isArray(neuralNodes) && neuralNodes.length > 0) {
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
    }

    // Create and animate signals - with safety check
    const signalList = createSignals();
    setSignals(signalList);

    if (signalList && signalList.length > 0) {
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
    }

    return () => {
      networkPulseAnim.stop();
      clearInterval(progressInterval);
    };
  }, [dispatch, user?.quitDate]);

  // Neural Network SVG Component with Beautiful Animations
  const NeuralNetworkVisualization = () => {
    // Only render if neuralNodes is available and is an array
    if (!neuralNodes || !Array.isArray(neuralNodes) || neuralNodes.length === 0) {
      return (
        <View style={{ height: 280, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: safeColors.textSecondary }}>Loading neural network...</Text>
        </View>
      );
    }

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
                {node.connections && node.connections.map(targetId => {
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
        {signals && signals.map(signal => (
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

  // Neural Info Modal Component
  const NeuralInfoModal = () => {
    const { recoveryPercentage, daysClean, recoveryMessage } = recoveryData;
    
    return (
      <Modal
        visible={neuralInfoVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={false}
        onRequestClose={() => setNeuralInfoVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'left', 'right', 'bottom']}>
          <LinearGradient
            colors={['#000000', '#0A0F1C', '#0F172A']}
            style={styles.modalGradient}
          >
              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
                {/* Current Recovery Status */}
                <View style={styles.modalStatusCard}>
                  <LinearGradient
                    colors={['rgba(0, 255, 255, 0.15)', 'rgba(16, 185, 129, 0.15)']}
                    style={styles.modalStatusContent}
                  >
                    <Ionicons name="analytics" size={24} color="#00FFFF" style={{ marginRight: SPACING.md }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalStatusTitle}>Your Current Recovery</Text>
                      <Text style={styles.modalStatusText}>
                        {recoveryMessage}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>

                {/* The Real Science */}
                <Text style={styles.modalSectionTitle}>The Real Science</Text>
                
                <View style={styles.modalScienceSection}>
                  <View style={styles.modalScienceItem}>
                    <Ionicons name="medical" size={20} color="#8B5CF6" />
                    <View style={styles.modalScienceContent}>
                      <Text style={styles.modalScienceTitle}>Dopamine System</Text>
                      <Text style={styles.modalScienceText}>
                        Nicotine hijacked your brain's dopamine reward pathways. Recovery involves restoring natural dopamine function and reducing cravings.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalScienceItem}>
                    <Ionicons name="refresh" size={20} color="#10B981" />
                    <View style={styles.modalScienceContent}>
                      <Text style={styles.modalScienceTitle}>Neuroplasticity</Text>
                      <Text style={styles.modalScienceText}>
                        Your brain can rewire itself. Each day without nicotine allows damaged reward circuits to heal and healthy patterns to strengthen.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalScienceItem}>
                    <Ionicons name="trending-up" size={20} color="#F59E0B" />
                    <View style={styles.modalScienceContent}>
                      <Text style={styles.modalScienceTitle}>Recovery Timeline</Text>
                      <Text style={styles.modalScienceText}>
                        Most people see significant improvement in dopamine function within 3 months, with continued healing for up to a year.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Recovery Timeline */}
                <Text style={styles.modalSectionTitle}>Recovery Timeline</Text>
                
                <View style={styles.modalTimelineSection}>
                  <View style={[styles.modalTimelineItem, { opacity: daysClean >= 0 ? 1 : 0.5 }]}>
                    <View style={[styles.modalTimelineIndicator, { backgroundColor: daysClean >= 0 ? '#10B981' : 'rgba(255, 255, 255, 0.3)' }]} />
                    <View style={styles.modalTimelineContent}>
                      <Text style={styles.modalTimelineTitle}>Day 0-3: Detox Phase</Text>
                      <Text style={styles.modalTimelineText}>Nicotine clears from system, dopamine receptors begin to normalize</Text>
                    </View>
                  </View>

                  <View style={[styles.modalTimelineItem, { opacity: daysClean >= 7 ? 1 : 0.5 }]}>
                    <View style={[styles.modalTimelineIndicator, { backgroundColor: daysClean >= 7 ? '#10B981' : 'rgba(255, 255, 255, 0.3)' }]} />
                    <View style={styles.modalTimelineContent}>
                      <Text style={styles.modalTimelineTitle}>Week 1-2: Early Recovery</Text>
                      <Text style={styles.modalTimelineText}>Dopamine production starts to rebalance, cravings begin to decrease</Text>
                    </View>
                  </View>

                  <View style={[styles.modalTimelineItem, { opacity: daysClean >= 30 ? 1 : 0.5 }]}>
                    <View style={[styles.modalTimelineIndicator, { backgroundColor: daysClean >= 30 ? '#10B981' : 'rgba(255, 255, 255, 0.3)' }]} />
                    <View style={styles.modalTimelineContent}>
                      <Text style={styles.modalTimelineTitle}>Month 1: Significant Progress</Text>
                      <Text style={styles.modalTimelineText}>Major improvement in mood, focus, and natural reward sensitivity</Text>
                    </View>
                  </View>

                  <View style={[styles.modalTimelineItem, { opacity: daysClean >= 90 ? 1 : 0.5 }]}>
                    <View style={[styles.modalTimelineIndicator, { backgroundColor: daysClean >= 90 ? '#10B981' : 'rgba(255, 255, 255, 0.3)' }]} />
                    <View style={styles.modalTimelineContent}>
                      <Text style={styles.modalTimelineTitle}>Month 3+: Near-Complete Recovery</Text>
                      <Text style={styles.modalTimelineText}>Dopamine system largely restored, addiction pathways significantly weakened</Text>
                    </View>
                  </View>
                </View>

                {/* Keep Going Button */}
                <TouchableOpacity 
                  style={styles.modalKeepGoingButton}
                  onPress={() => setNeuralInfoVisible(false)}
                >
                  <LinearGradient
                    colors={['#00FFFF', '#10B981']}
                    style={styles.modalKeepGoingGradient}
                  >
                    <Text style={styles.modalKeepGoingText}>Keep Going!</Text>
                  </LinearGradient>
                </TouchableOpacity>

              </ScrollView>
          </LinearGradient>
        </SafeAreaView>
      </Modal>
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
              <TouchableOpacity onPress={() => setNeuralInfoVisible(true)}>
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
                  style={styles.neuralGrowthBadge}
                >
                  <Ionicons name="trending-up" size={16} color={safeColors.primary} />
                  <Text style={styles.neuralGrowthText}>
                    {recoveryData.neuralBadgeMessage}
                  </Text>
                  <Ionicons name="information-circle-outline" size={14} color={safeColors.primary} style={{ marginLeft: 4 }} />
                </LinearGradient>
              </TouchableOpacity>
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
                <Text style={styles.metricTitle}>Avoided</Text>
              </View>
              <Text style={styles.metricValue}>{stats?.unitsAvoided || 0}</Text>
              <Text style={styles.metricSubtext}>{personalizedUnitName}</Text>
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
      </ScrollView>

              {/* Dyson Shield Mode Modal */}
        <DysonShieldMode 
          visible={shieldModeVisible} 
          onClose={() => setShieldModeVisible(false)} 
        />
      </LinearGradient>

      {/* Neural Info Modal */}
      <NeuralInfoModal />
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalGradient: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: safeColors.text,
    marginRight: SPACING.md,
  },
  modalCloseButton: {
    padding: SPACING.sm,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  modalStatusCard: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  modalStatusContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalStatusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: safeColors.text,
    marginBottom: SPACING.sm,
  },
  modalStatusText: {
    fontSize: 14,
    color: safeColors.textSecondary,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: safeColors.text,
    marginBottom: SPACING.sm,
  },
  modalScienceSection: {
    marginBottom: SPACING.xl,
  },
  modalScienceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  modalScienceContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  modalScienceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: safeColors.text,
    marginBottom: SPACING.sm,
  },
  modalScienceText: {
    fontSize: 14,
    color: safeColors.textSecondary,
  },
  modalTimelineSection: {
    marginBottom: SPACING.xl,
  },
  modalTimelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  modalTimelineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.md,
    marginTop: 4,
  },
  modalTimelineContent: {
    flex: 1,
  },
  modalTimelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: safeColors.text,
    marginBottom: SPACING.sm,
  },
  modalTimelineText: {
    fontSize: 14,
    color: safeColors.textSecondary,
  },
  modalKeepGoingButton: {
    marginTop: SPACING.md,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  modalKeepGoingGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalKeepGoingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: safeColors.text,
  },
});

export default DashboardScreen; 