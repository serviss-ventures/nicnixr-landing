import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Animated,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import DysonShieldMode from './DysonShieldMode';

const { width, height } = Dimensions.get('window');

const ShieldScreen: React.FC = () => {
  const [shieldActive, setShieldActive] = useState(false);
  const [shieldModeVisible, setShieldModeVisible] = useState(false);
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const energyAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 12 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Continuous shield pulse animation
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

    // Continuous rotation for energy rings
    const rotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );

    // Energy flow animation
    const energy = Animated.loop(
      Animated.sequence([
        Animated.timing(energyAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(energyAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    // Particle animations
    const particles = Animated.loop(
      Animated.stagger(200, 
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
    energy.start();
    particles.start();

    return () => {
      pulse.stop();
      rotation.stop();
      energy.stop();
      particles.stop();
    };
  }, []);

  const activateShield = () => {
    setShieldModeVisible(true);
  };

  const renderEnergyRing = (size: number, delay: number, color: string) => {
    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [`${delay}deg`, `${360 + delay}deg`],
    });

    return (
      <Animated.View
        style={[
          styles.energyRing,
          {
            width: size,
            height: size,
            borderColor: color,
            transform: [{ rotate }],
          },
        ]}
      />
    );
  };

  const renderParticle = (index: number) => {
    const angle = (index * 30) * (Math.PI / 180);
    const radius = 120;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const opacity = particleAnims[index].interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.3, 1, 0.3],
    });

    const scale = particleAnims[index].interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 1.2, 0.5],
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.energyParticle,
          {
            left: width / 2 + x - 3,
            top: height * 0.35 + y - 3,
            opacity,
            transform: [{ scale }],
          },
        ]}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#1A1A2E', '#16213E']}
        style={styles.background}
      >
        {/* Holographic Grid Background */}
        <View style={styles.gridOverlay}>
          {Array.from({ length: 20 }).map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLine, { top: i * 40 }]} />
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLineVertical, { left: i * 30 }]} />
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>RECOVERY SUPPORT</Text>
            <Text style={styles.headerSubtitle}>Advanced Intervention System</Text>
          </View>

          {/* Main Shield Visualization */}
          <View style={styles.shieldContainer}>
            {/* Energy Rings */}
            {renderEnergyRing(200, 0, '#00FFFF')}
            {renderEnergyRing(160, 120, '#FF0080')}
            {renderEnergyRing(120, 240, '#8000FF')}

            {/* Energy Particles */}
            {Array.from({ length: 12 }).map((_, index) => renderParticle(index))}

            {/* Central Shield Core */}
            <Animated.View
              style={[
                styles.shieldCore,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <LinearGradient
                colors={['#00FFFF', '#FF0080', '#8000FF']}
                style={styles.shieldCoreGradient}
              >
                <View style={styles.shieldIcon}>
                  <Ionicons name="shield-checkmark" size={60} color="white" />
                </View>
              </LinearGradient>

              {/* Energy Flow Lines */}
              <Animated.View
                style={[
                  styles.energyFlow,
                  {
                    opacity: energyAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ]}
              >
                <LinearGradient
                  colors={['transparent', '#00FFFF', 'transparent']}
                  style={styles.energyLine}
                />
              </Animated.View>
            </Animated.View>
          </View>

          {/* Support Status */}
          <View style={styles.statusContainer}>
            <LinearGradient
              colors={['rgba(0, 255, 255, 0.1)', 'rgba(255, 0, 128, 0.1)']}
              style={styles.statusCard}
            >
              <View style={styles.statusHeader}>
                <View style={styles.statusIndicator} />
                <Text style={styles.statusTitle}>SUPPORT STATUS</Text>
              </View>
              <Text style={styles.statusText}>READY TO ASSIST</Text>
              <Text style={styles.statusSubtext}>Clinical-grade intervention available 24/7</Text>
            </LinearGradient>
          </View>

          {/* Activation Button */}
          <TouchableOpacity style={styles.activationButton} onPress={activateShield}>
            <LinearGradient
              colors={['#00FFFF', '#FF0080', '#8000FF']}
              style={styles.activationGradient}
            >
              <View style={styles.activationContent}>
                <Ionicons name="medical" size={32} color="white" />
                <Text style={styles.activationText}>START INTERVENTION</Text>
                <Text style={styles.activationSubtext}>Immediate Recovery Support</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* System Capabilities */}
          <View style={styles.capabilitiesContainer}>
            <Text style={styles.capabilitiesTitle}>INTERVENTION METHODS</Text>
            
            <View style={styles.capabilityRow}>
              <View style={styles.capabilityItem}>
                <LinearGradient
                  colors={['rgba(0, 255, 255, 0.2)', 'rgba(0, 255, 255, 0.05)']}
                  style={styles.capabilityCard}
                >
                  <Ionicons name="pulse" size={24} color="#00FFFF" />
                  <Text style={styles.capabilityTitle}>Mindfulness Therapy</Text>
                  <Text style={styles.capabilityDesc}>Evidence-based breathing techniques</Text>
                </LinearGradient>
              </View>

              <View style={styles.capabilityItem}>
                <LinearGradient
                  colors={['rgba(255, 0, 128, 0.2)', 'rgba(255, 0, 128, 0.05)']}
                  style={styles.capabilityCard}
                >
                  <Ionicons name="bulb-outline" size={24} color="#FF0080" />
                  <Text style={styles.capabilityTitle}>Cognitive Therapy</Text>
                  <Text style={styles.capabilityDesc}>Therapeutic pattern interruption</Text>
                </LinearGradient>
              </View>
            </View>

            <View style={styles.capabilityRow}>
              <View style={styles.capabilityItem}>
                <LinearGradient
                  colors={['rgba(128, 0, 255, 0.2)', 'rgba(128, 0, 255, 0.05)']}
                  style={styles.capabilityCard}
                >
                  <Ionicons name="fitness" size={24} color="#8000FF" />
                  <Text style={styles.capabilityTitle}>Movement Therapy</Text>
                  <Text style={styles.capabilityDesc}>Physical wellness interventions</Text>
                </LinearGradient>
              </View>

              <View style={styles.capabilityItem}>
                <LinearGradient
                  colors={['rgba(0, 255, 255, 0.2)', 'rgba(255, 0, 128, 0.2)']}
                  style={styles.capabilityCard}
                >
                  <Ionicons name="heart" size={24} color="#00FFFF" />
                  <Text style={styles.capabilityTitle}>Crisis Support</Text>
                  <Text style={styles.capabilityDesc}>Compassionate emergency care</Text>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Clinical Excellence */}
          <LinearGradient
            colors={['rgba(0, 255, 255, 0.05)', 'rgba(255, 0, 128, 0.05)']}
            style={styles.statsContainer}
          >
            <Text style={styles.statsTitle}>CLINICAL EXCELLENCE</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>FDA</Text>
                <Text style={styles.statLabel}>Approved Methods</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{'< 60s'}</Text>
                <Text style={styles.statLabel}>Response Time</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>24/7</Text>
                <Text style={styles.statLabel}>Care Available</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    flex: 1,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#00FFFF',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#00FFFF',
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING['4xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00FFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: SPACING.sm,
    letterSpacing: 1,
  },
  shieldContainer: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING['2xl'],
    position: 'relative',
  },
  energyRing: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 1000,
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  energyParticle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FFFF',
  },
  shieldCore: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 255, 0.5)',
  },
  shieldCoreGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyFlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
  },
  energyLine: {
    flex: 1,
    borderRadius: 100,
  },
  statusContainer: {
    marginBottom: SPACING['2xl'],
  },
  statusCard: {
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF00',
    marginRight: SPACING.sm,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00FFFF',
    letterSpacing: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SPACING.xs,
  },
  statusSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activationButton: {
    marginBottom: SPACING['3xl'],
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  activationGradient: {
    padding: SPACING.xl,
  },
  activationContent: {
    alignItems: 'center',
  },
  activationText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.sm,
    letterSpacing: 1,
  },
  activationSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  capabilitiesContainer: {
    marginBottom: SPACING['2xl'],
  },
  capabilitiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FFFF',
    marginBottom: SPACING.lg,
    textAlign: 'center',
    letterSpacing: 1,
  },
  capabilityRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  capabilityItem: {
    flex: 1,
  },
  capabilityCard: {
    padding: SPACING.lg,
    borderRadius: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  capabilityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  capabilityDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  statsContainer: {
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00FFFF',
    marginBottom: SPACING.lg,
    textAlign: 'center',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: SPACING.xs,
  },
});

export default ShieldScreen; 