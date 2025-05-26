import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { COLORS, SPACING } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

interface BrandSplashProps {
  onComplete: () => void;
}

interface NeuralNode {
  id: string;
  x: number;
  y: number;
  pulseAnim: Animated.Value;
  connections: number[];
}

const BrandSplash: React.FC<BrandSplashProps> = ({ onComplete }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const slashAnim = useRef(new Animated.Value(0)).current;
  const networkAnim = useRef(new Animated.Value(0)).current;
  const particleAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const networkPulse = useRef(new Animated.Value(1)).current;
  const connectionAnim = useRef(new Animated.Value(0)).current;

  // Generate neural network nodes for splash
  const generateSplashNetwork = (): NeuralNode[] => {
    const nodes: NeuralNode[] = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const layers = 4;
    const layerSpacing = 80;

    // Create concentric layers of nodes
    for (let layer = 0; layer < layers; layer++) {
      const nodesInLayer = layer === 0 ? 1 : 6 + layer * 2;
      const radius = layer * layerSpacing;
      
      for (let i = 0; i < nodesInLayer; i++) {
        const angle = (i / nodesInLayer) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        const node: NeuralNode = {
          id: `splash-node-${layer}-${i}`,
          x,
          y,
          pulseAnim: new Animated.Value(1),
          connections: [],
        };
        
        // Connect to center node and some adjacent nodes
        if (layer > 0) {
          node.connections.push(0); // Connect to center
          if (nodes.length > 2) {
            node.connections.push(Math.max(0, nodes.length - 2));
          }
        }
        
        nodes.push(node);
      }
    }
    
    return nodes;
  };

  const neuralNodes = generateSplashNetwork();

  useEffect(() => {
    // Start node pulse animations
    neuralNodes.forEach((node, index) => {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(node.pulseAnim, {
            toValue: 1.3,
            duration: 1500 + index * 100,
            useNativeDriver: true,
          }),
          Animated.timing(node.pulseAnim, {
            toValue: 1,
            duration: 1500 + index * 100,
            useNativeDriver: true,
          }),
        ])
      );
      
      setTimeout(() => pulseAnimation.start(), index * 200);
    });

    // Network-wide pulse
    const networkPulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(networkPulse, {
          toValue: 1.05,
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

    // Main sequence animation
    const sequence = Animated.sequence([
      // 1. Background and network fade in (1s)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(networkAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),

      // 2. Neural connections activate (0.8s)
      Animated.timing(connectionAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),

      // 3. Logo appears with scale (1s)
      Animated.parallel([
        Animated.spring(logoAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),

      // 4. Epic slash through NIX (0.6s)
      Animated.timing(slashAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),

      // 5. Particles and tagline (0.8s)
      Animated.parallel([
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(taglineAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),

      // 6. Hold for impact (1.5s)
      Animated.delay(1500),

      // 7. Exit animation (1s)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]);

    networkPulseAnim.start();
    
    sequence.start(() => {
      networkPulseAnim.stop();
      onComplete();
    });

    return () => {
      networkPulseAnim.stop();
    };
  }, []);

  // Interpolations
  const logoTranslateY = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const slashScale = slashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const slashRotate = slashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-45deg', '-15deg'],
  });

  const taglineTranslateY = taglineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  // Neural Network Component
  const NeuralNetworkBackground = () => (
    <Animated.View 
      style={[
        styles.networkContainer,
        {
          opacity: networkAnim,
          transform: [{ scale: networkPulse }],
        },
      ]}
    >
      <Svg width={width} height={height} style={styles.networkSvg}>
        <Defs>
          <RadialGradient id="nodeGradient" cx="50%" cy="50%">
            <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0.2" />
          </RadialGradient>
          <RadialGradient id="centerNodeGradient" cx="50%" cy="50%">
            <Stop offset="0%" stopColor={COLORS.accent} stopOpacity="1" />
            <Stop offset="100%" stopColor={COLORS.primary} stopOpacity="0.4" />
          </RadialGradient>
        </Defs>
        
        {/* Draw connections */}
        {neuralNodes.map((node, nodeIndex) => (
          <G key={`connections-${node.id}`}>
            {node.connections.map(targetIndex => {
              const targetNode = neuralNodes[targetIndex];
              if (!targetNode) return null;
              
              return (
                <Animated.View key={`line-${node.id}-${targetIndex}`}>
                  <Line
                    x1={node.x}
                    y1={node.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    strokeOpacity={connectionAnim}
                  />
                </Animated.View>
              );
            })}
          </G>
        ))}
        
        {/* Draw nodes */}
        {neuralNodes.map((node, index) => (
          <G key={node.id}>
            {/* Outer glow */}
            <Circle
              cx={node.x}
              cy={node.y}
              r={index === 0 ? 25 : 15}
              fill={COLORS.primary}
              opacity={0.1}
            />
            
            {/* Main node */}
            <Circle
              cx={node.x}
              cy={node.y}
              r={index === 0 ? 12 : 6}
              fill={index === 0 ? "url(#centerNodeGradient)" : "url(#nodeGradient)"}
            />
            
            {/* Inner bright spot */}
            <Circle
              cx={node.x - 2}
              cy={node.y - 2}
              r={index === 0 ? 4 : 2}
              fill={COLORS.text}
              opacity={0.8}
            />
          </G>
        ))}
      </Svg>
      
      {/* Animated node pulses */}
      {neuralNodes.map((node, index) => (
        <Animated.View
          key={`pulse-${node.id}`}
          style={[
            styles.nodePulse,
            {
              left: node.x - 20,
              top: node.y - 20,
              transform: [{ scale: node.pulseAnim }],
              opacity: particleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
              }),
            },
          ]}
        />
      ))}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Scientific Background */}
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A', '#0A0F1C', '#000000']}
        style={styles.background}
      />

      {/* Neural Network Background */}
      <NeuralNetworkBackground />

      {/* Scientific Grid Overlay */}
      <Animated.View 
        style={[
          styles.gridOverlay,
          { opacity: particleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.1] }) }
        ]}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={`grid-h-${i}`} style={[styles.gridLine, { top: i * (height / 20) }]} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={`grid-v-${i}`} style={[styles.gridLineVertical, { left: i * (width / 12) }]} />
        ))}
      </Animated.View>

      {/* Main Brand Container */}
      <Animated.View
        style={[
          styles.brandContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: logoTranslateY },
            ],
          },
        ]}
      >
        {/* Scientific Glow Effect */}
        <Animated.View
          style={[
            styles.scientificGlow,
            {
              opacity: logoAnim,
              transform: [{ scale: networkPulse }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(16, 185, 129, 0.3)',
              'rgba(6, 182, 212, 0.2)',
              'rgba(16, 185, 129, 0.1)',
              'transparent'
            ]}
            style={styles.glowGradient}
          />
        </Animated.View>

        {/* Brand Text Container */}
        <View style={styles.textContainer}>
          {/* NIX with Scientific Slash */}
          <View style={styles.nixContainer}>
            <Animated.Text
              style={[
                styles.nixText,
                {
                  opacity: logoAnim,
                  transform: [{ scale: logoAnim }],
                },
              ]}
            >
              NIX
            </Animated.Text>
          </View>

          {/* Scientific Slash */}
          <Animated.View
            style={[
              styles.scientificSlash,
              {
                opacity: slashAnim,
                transform: [
                  { scale: slashScale },
                  { rotate: slashRotate },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#FF0000', '#FF4444', '#FF6B6B']}
              style={styles.slashGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.slashGlow} />
          </Animated.View>

          {/* R Letter */}
          <Animated.Text
            style={[
              styles.rLetter,
              {
                opacity: logoAnim,
                transform: [{ scale: logoAnim }],
              },
            ]}
          >
            R
          </Animated.Text>
        </View>

        {/* Scientific Tagline */}
        <Animated.Text
          style={[
            styles.scientificTagline,
            {
              opacity: taglineAnim,
              transform: [{ translateY: taglineTranslateY }],
            },
          ]}
        >
          NEURAL RECOVERY TECHNOLOGY
        </Animated.Text>

        {/* Scientific Subtitle */}
        <Animated.Text
          style={[
            styles.scientificSubtitle,
            {
              opacity: taglineAnim,
              transform: [{ translateY: taglineTranslateY }],
            },
          ]}
        >
          Advanced Addiction Intervention System
        </Animated.Text>
      </Animated.View>

      {/* Scientific Accent Elements */}
      <Animated.View 
        style={[
          styles.accentElements,
          { opacity: particleAnim }
        ]}
      >
        <View style={styles.scanLine} />
        <View style={styles.cornerBrackets}>
          <View style={[styles.bracket, styles.topLeft]} />
          <View style={[styles.bracket, styles.topRight]} />
          <View style={[styles.bracket, styles.bottomLeft]} />
          <View style={[styles.bracket, styles.bottomRight]} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#000000',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  networkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  networkSvg: {
    position: 'absolute',
  },
  nodePulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.primary,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: COLORS.primary,
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },
  scientificGlow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -150,
    left: -150,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 200,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  nixContainer: {
    position: 'relative',
  },
  nixText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    textShadowColor: 'rgba(16, 185, 129, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    fontFamily: 'System',
  },
  scientificSlash: {
    position: 'absolute',
    width: 100,
    height: 8,
    left: 5,
    top: '50%',
    marginTop: -4,
    zIndex: 10,
  },
  slashGradient: {
    flex: 1,
    borderRadius: 4,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
  },
  slashGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  rLetter: {
    fontSize: 72,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -2,
    marginLeft: SPACING.lg,
    textShadowColor: 'rgba(16, 185, 129, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
    fontFamily: 'System',
  },
  scientificTagline: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 3,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(16, 185, 129, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scientificSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  accentElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: '10%',
    right: '10%',
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  cornerBrackets: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bracket: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.primary,
    borderWidth: 2,
    opacity: 0.4,
  },
  topLeft: {
    top: '20%',
    left: '10%',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: '20%',
    right: '10%',
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: '20%',
    left: '10%',
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: '20%',
    right: '10%',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
});

export default BrandSplash; 