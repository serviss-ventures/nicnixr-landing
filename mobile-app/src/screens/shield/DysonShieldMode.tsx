import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Animated, 
  Modal,
  ScrollView,
  Vibration,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface DysonShieldModeProps {
  visible: boolean;
  onClose: () => void;
}

type ShieldPhase = 'activation' | 'assessment' | 'intervention' | 'stabilization' | 'victory';

const DysonShieldMode: React.FC<DysonShieldModeProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [currentPhase, setCurrentPhase] = useState<ShieldPhase>('activation');
  const [cravingIntensity, setCravingIntensity] = useState<number>(8);
  const [sessionTimer, setSessionTimer] = useState<number>(0);
  const [selectedIntervention, setSelectedIntervention] = useState<string | null>(null);
  const [breathingCount, setBreathingCount] = useState<number>(0);
  const [isBreathing, setIsBreathing] = useState<boolean>(false);
  
  // Advanced animations
  const shieldActivationAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const energyFieldAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      // Immediate haptic feedback
      Vibration.vibrate([0, 100, 50, 100]);
      
      // Start session timer
      timerRef.current = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
      
      // Shield activation sequence
      startActivationSequence();
    } else {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      resetShieldState();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [visible]);

  const resetShieldState = () => {
    setCurrentPhase('activation');
    setSessionTimer(0);
    setSelectedIntervention(null);
    setBreathingCount(0);
    setIsBreathing(false);
    setCravingIntensity(8);
  };

  const startActivationSequence = () => {
    // Shield deployment animation
    Animated.sequence([
      Animated.timing(shieldActivationAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.delay(500),
    ]).start(() => {
      setCurrentPhase('assessment');
    });

    // Continuous animations
    startContinuousAnimations();
  };

  const startContinuousAnimations = () => {
    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation
    const rotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      })
    );

    // Energy field animation
    const energyField = Animated.loop(
      Animated.sequence([
        Animated.timing(energyFieldAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(energyFieldAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Scan line animation
    const scanLine = Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    pulse.start();
    rotation.start();
    energyField.start();
    scanLine.start();
  };

  const startBreathingProtocol = () => {
    setSelectedIntervention('breathing');
    setCurrentPhase('intervention');
    setIsBreathing(true);
    setBreathingCount(0);

    const breathingCycle = () => {
      // Inhale (4 seconds)
      Animated.timing(breatheAnim, {
        toValue: 1.4,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        // Hold (7 seconds) - no animation change
        setTimeout(() => {
          // Exhale (8 seconds)
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }).start(() => {
            setBreathingCount(prev => {
              const newCount = prev + 1;
              if (newCount < 4) {
                breathingCycle();
              } else {
                setIsBreathing(false);
                setCurrentPhase('stabilization');
              }
              return newCount;
            });
          });
        }, 7000);
      });
    };

    breathingCycle();
  };

  const startPhysicalIntervention = () => {
    setSelectedIntervention('physical');
    setCurrentPhase('intervention');
    
    // Auto-advance after 30 seconds
    setTimeout(() => {
      setCurrentPhase('stabilization');
    }, 30000);
  };

  const startCognitiveRedirect = () => {
    setSelectedIntervention('cognitive');
    setCurrentPhase('intervention');
    
    // Auto-advance after 45 seconds
    setTimeout(() => {
      setCurrentPhase('stabilization');
    }, 45000);
  };

  const completeShieldSession = () => {
    setCurrentPhase('victory');
    Vibration.vibrate([0, 200, 100, 200]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderActivationPhase = () => (
    <View style={styles.activationContainer}>
      <Animated.View
        style={[
          styles.shieldDeployment,
          {
            opacity: shieldActivationAnim,
            transform: [
              {
                scale: shieldActivationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#00FFFF', '#FF0080', '#8000FF']}
          style={styles.shieldCore}
        >
          <Ionicons name="shield-checkmark" size={80} color="white" />
        </LinearGradient>
      </Animated.View>

      <Animated.Text
        style={[
          styles.activationText,
          { opacity: shieldActivationAnim },
        ]}
      >
        SUPPORT ACTIVATING
      </Animated.Text>

      <Animated.Text
        style={[
          styles.activationSubtext,
          { opacity: shieldActivationAnim },
        ]}
      >
        Therapeutic systems initializing
      </Animated.Text>

      {/* Deployment progress */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              transform: [{
                scaleX: shieldActivationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                })
              }]
            },
          ]}
        />
      </View>
    </View>
  );

  const renderAssessmentPhase = () => (
    <ScrollView contentContainerStyle={styles.assessmentContainer}>
      <View style={styles.scannerContainer}>
        <Animated.View
          style={[
            styles.shieldVisualization,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <LinearGradient
            colors={['#00FFFF', '#FF0080', '#8000FF']}
            style={styles.shieldGradient}
          >
            <Ionicons name="shield-checkmark" size={60} color="white" />
          </LinearGradient>

          {/* Rotating energy rings */}
          <Animated.View
            style={[
              styles.energyRing,
              {
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* Scan line */}
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [{
                  translateY: scanLineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 120],
                  })
                }],
                opacity: scanLineAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0],
                }),
              },
            ]}
          />
        </Animated.View>
      </View>

      <Text style={styles.phaseTitle}>WELLNESS CHECK</Text>
      <Text style={styles.phaseSubtitle}>
        How are you feeling right now? Let's assess your current state.
      </Text>

      <View style={styles.intensityContainer}>
        <Text style={styles.intensityLabel}>Craving Intensity Level</Text>
        <View style={styles.intensityScale}>
          {Array.from({ length: 10 }).map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.intensityDot,
                index < cravingIntensity && styles.intensityDotActive,
                index >= 7 && styles.intensityDotHigh,
              ]}
              onPress={() => setCravingIntensity(index + 1)}
            />
          ))}
        </View>
        <Text style={styles.intensityValue}>{cravingIntensity}/10</Text>
      </View>

      <TouchableOpacity
        style={styles.proceedButton}
        onPress={() => setCurrentPhase('intervention')}
      >
        <LinearGradient
          colors={['#00FFFF', '#FF0080']}
          style={styles.proceedGradient}
        >
          <Text style={styles.proceedText}>BEGIN INTERVENTION</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderInterventionPhase = () => {
    if (selectedIntervention === 'breathing') {
      return renderBreathingIntervention();
    } else if (selectedIntervention === 'physical') {
      return renderPhysicalIntervention();
    } else if (selectedIntervention === 'cognitive') {
      return renderCognitiveIntervention();
    }

    return (
      <ScrollView contentContainerStyle={styles.interventionContainer}>
        <Text style={styles.phaseTitle}>CHOOSE YOUR SUPPORT</Text>
        <Text style={styles.phaseSubtitle}>
          Select the therapeutic approach that feels right for you
        </Text>

        <View style={styles.interventionGrid}>
          <TouchableOpacity
            style={styles.interventionCard}
            onPress={startBreathingProtocol}
          >
            <LinearGradient
              colors={['rgba(0, 255, 255, 0.2)', 'rgba(0, 255, 255, 0.05)']}
              style={styles.interventionGradient}
            >
              <Ionicons name="pulse" size={40} color="#00FFFF" />
              <Text style={styles.interventionTitle}>Mindful Breathing</Text>
              <Text style={styles.interventionDesc}>Therapeutic 4-7-8 breathing technique</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.interventionCard}
            onPress={startPhysicalIntervention}
          >
            <LinearGradient
              colors={['rgba(255, 0, 128, 0.2)', 'rgba(255, 0, 128, 0.05)']}
              style={styles.interventionGradient}
            >
              <Ionicons name="fitness" size={40} color="#FF0080" />
              <Text style={styles.interventionTitle}>Movement Therapy</Text>
              <Text style={styles.interventionDesc}>Physical wellness activities</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.interventionCard}
            onPress={startCognitiveRedirect}
          >
            <LinearGradient
              colors={['rgba(128, 0, 255, 0.2)', 'rgba(128, 0, 255, 0.05)']}
              style={styles.interventionGradient}
            >
              <Ionicons name="bulb-outline" size={40} color="#8000FF" />
              <Text style={styles.interventionTitle}>Mindfulness Practice</Text>
              <Text style={styles.interventionDesc}>Gentle cognitive techniques</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderBreathingIntervention = () => (
    <View style={styles.breathingContainer}>
      <Text style={styles.phaseTitle}>MINDFUL BREATHING</Text>
      <Text style={styles.phaseSubtitle}>
        Let's breathe together. Follow the gentle rhythm.
      </Text>

      <Animated.View
        style={[
          styles.breathingOrb,
          {
            transform: [{ scale: breatheAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#00FFFF', '#FF0080', '#8000FF']}
          style={styles.breathingOrbGradient}
        >
          <Text style={styles.breathingCount}>{breathingCount + 1}/4</Text>
        </LinearGradient>
      </Animated.View>

      <Text style={styles.breathingInstruction}>
        {isBreathing ? 'Inhale 4s → Hold 7s → Exhale 8s' : 'Breathing complete'}
      </Text>

      {!isBreathing && (
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => setCurrentPhase('stabilization')}
        >
          <LinearGradient
            colors={['#00FFFF', '#FF0080']}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>CONTINUE</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPhysicalIntervention = () => (
    <ScrollView contentContainerStyle={styles.physicalContainer}>
      <Text style={styles.phaseTitle}>MOVEMENT THERAPY</Text>
      <Text style={styles.phaseSubtitle}>
        Gentle physical activities to help you feel better
      </Text>

      <View style={styles.physicalActions}>
        <View style={styles.physicalAction}>
          <LinearGradient
            colors={['rgba(255, 0, 128, 0.2)', 'rgba(255, 0, 128, 0.05)']}
            style={styles.physicalActionCard}
          >
            <Ionicons name="water" size={32} color="#FF0080" />
            <Text style={styles.physicalActionTitle}>Cooling Technique</Text>
            <Text style={styles.physicalActionDesc}>
              Splash cool water on your face or hold an ice cube to reset your nervous system
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.physicalAction}>
          <LinearGradient
            colors={['rgba(255, 0, 128, 0.2)', 'rgba(255, 0, 128, 0.05)']}
            style={styles.physicalActionCard}
          >
            <Ionicons name="fitness" size={32} color="#FF0080" />
            <Text style={styles.physicalActionTitle}>Gentle Movement</Text>
            <Text style={styles.physicalActionDesc}>
              Take a short walk or do some light stretching to help your body feel better
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.physicalAction}>
          <LinearGradient
            colors={['rgba(255, 0, 128, 0.2)', 'rgba(255, 0, 128, 0.05)']}
            style={styles.physicalActionCard}
          >
            <Ionicons name="hand-left" size={32} color="#FF0080" />
            <Text style={styles.physicalActionTitle}>Comfort Activities</Text>
            <Text style={styles.physicalActionDesc}>
              Try chewing gum, using a stress ball, or keeping your hands busy with something soothing
            </Text>
          </LinearGradient>
        </View>
      </View>

      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => setCurrentPhase('stabilization')}
      >
        <LinearGradient
          colors={['#FF0080', '#8000FF']}
          style={styles.completeGradient}
        >
          <Text style={styles.completeText}>FEELING BETTER</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCognitiveIntervention = () => (
    <ScrollView contentContainerStyle={styles.cognitiveContainer}>
      <Text style={styles.phaseTitle}>MINDFULNESS PRACTICE</Text>
      <Text style={styles.phaseSubtitle}>
        Gentle techniques to help you feel grounded and present
      </Text>

      <View style={styles.cognitiveExercises}>
        <LinearGradient
          colors={['rgba(128, 0, 255, 0.2)', 'rgba(128, 0, 255, 0.05)']}
          style={styles.cognitiveCard}
        >
          <Ionicons name="eye" size={32} color="#8000FF" />
          <Text style={styles.cognitiveTitle}>5-4-3-2-1 Grounding</Text>
          <Text style={styles.cognitiveDesc}>
            • 5 things you can see{'\n'}
            • 4 things you can touch{'\n'}
            • 3 things you can hear{'\n'}
            • 2 things you can smell{'\n'}
            • 1 thing you can taste
          </Text>
        </LinearGradient>

        <LinearGradient
          colors={['rgba(128, 0, 255, 0.2)', 'rgba(128, 0, 255, 0.05)']}
          style={styles.cognitiveCard}
        >
          <Ionicons name="checkmark-circle" size={32} color="#8000FF" />
          <Text style={styles.cognitiveTitle}>Gentle Reminder</Text>
          <Text style={styles.cognitiveDesc}>
            This feeling is temporary and will pass. You've shown incredible strength for {user?.stats?.daysClean || 0} days. 
            You have everything you need to get through this moment.
          </Text>
        </LinearGradient>

        <LinearGradient
          colors={['rgba(128, 0, 255, 0.2)', 'rgba(128, 0, 255, 0.05)']}
          style={styles.cognitiveCard}
        >
          <Ionicons name="time" size={32} color="#8000FF" />
          <Text style={styles.cognitiveTitle}>Hopeful Visualization</Text>
          <Text style={styles.cognitiveDesc}>
            Imagine yourself in an hour, feeling proud and peaceful. 
            You'll be so grateful you chose to take care of yourself in this moment.
          </Text>
        </LinearGradient>
      </View>

      <TouchableOpacity
        style={styles.completeButton}
        onPress={() => setCurrentPhase('stabilization')}
      >
        <LinearGradient
          colors={['#8000FF', '#00FFFF']}
          style={styles.completeGradient}
        >
          <Text style={styles.completeText}>FEELING CENTERED</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderStabilizationPhase = () => (
    <View style={styles.stabilizationContainer}>
      <Animated.View
        style={[
          styles.stabilizationOrb,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <LinearGradient
          colors={['#00FF00', '#00FFFF', '#0080FF']}
          style={styles.stabilizationGradient}
        >
          <Ionicons name="heart" size={60} color="white" />
        </LinearGradient>
      </Animated.View>

      <Text style={styles.phaseTitle}>FEELING BETTER</Text>
      <Text style={styles.phaseSubtitle}>
        You're doing great. Let's take a moment to appreciate your strength.
      </Text>

      <View style={styles.stabilizationProgress}>
        <Text style={styles.progressLabel}>Wellness Recovery</Text>
        <Animated.View
          style={[
            styles.stabilizationBar,
            {
              transform: [{
                scaleX: energyFieldAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                })
              }]
            },
          ]}
        />
      </View>

      <TouchableOpacity
        style={styles.victoryButton}
        onPress={completeShieldSession}
      >
        <LinearGradient
          colors={['#00FF00', '#00FFFF']}
          style={styles.victoryGradient}
        >
          <Text style={styles.victoryText}>I'M FEELING STRONGER</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderVictoryPhase = () => (
    <View style={styles.victoryContainer}>
      <Animated.View
        style={[
          styles.victoryOrb,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <LinearGradient
          colors={['#00FF00', '#00FFFF', '#FFD700']}
          style={styles.victoryOrbGradient}
        >
          <Ionicons name="trophy" size={80} color="white" />
        </LinearGradient>
      </Animated.View>

      <Text style={styles.victoryTitle}>YOU DID IT!</Text>
      <Text style={styles.victorySubtitle}>
        You chose your wellbeing and that takes real courage
      </Text>

      <LinearGradient
        colors={['rgba(0, 255, 0, 0.2)', 'rgba(0, 255, 255, 0.2)']}
        style={styles.victoryStats}
      >
        <View style={styles.victoryStat}>
          <Text style={styles.victoryStatValue}>{formatTime(sessionTimer)}</Text>
          <Text style={styles.victoryStatLabel}>Session Duration</Text>
        </View>
        <View style={styles.victoryStat}>
          <Text style={styles.victoryStatValue}>{cravingIntensity}/10</Text>
          <Text style={styles.victoryStatLabel}>Initial Intensity</Text>
        </View>
        <View style={styles.victoryStat}>
          <Text style={styles.victoryStatValue}>💪</Text>
          <Text style={styles.victoryStatLabel}>Strength Shown</Text>
        </View>
      </LinearGradient>

      <Text style={styles.victoryMessage}>
        Every time you choose recovery, you're building a stronger, healthier you. 
        This moment of self-care is something to be proud of.
      </Text>

      <TouchableOpacity style={styles.returnButton} onPress={onClose}>
        <LinearGradient
          colors={['#00FFFF', '#FF0080']}
          style={styles.returnGradient}
        >
          <Text style={styles.returnText}>CONTINUE YOUR JOURNEY</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 'activation':
        return renderActivationPhase();
      case 'assessment':
        return renderAssessmentPhase();
      case 'intervention':
        return renderInterventionPhase();
      case 'stabilization':
        return renderStabilizationPhase();
      case 'victory':
        return renderVictoryPhase();
      default:
        return renderActivationPhase();
    }
  };

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" statusBarTranslucent={true}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#1A1A2E', '#16213E']}
        style={styles.fullScreenContainer}
      >
        <SafeAreaView style={styles.safeArea} edges={[]}>
          <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>RECOVERY SUPPORT</Text>
            <Text style={styles.headerTimer}>{formatTime(sessionTimer)}</Text>
          </View>

          <TouchableOpacity 
            onPress={() => Alert.alert('Emergency', 'Crisis support activated')} 
            style={styles.emergencyButton}
          >
            <Ionicons name="warning" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        {/* Phase Indicator */}
        <View style={styles.phaseIndicator}>
          <View style={styles.phaseProgress}>
            {['activation', 'assessment', 'intervention', 'stabilization', 'victory'].map((phase, index) => (
              <View
                key={phase}
                style={[
                  styles.phaseProgressDot,
                  currentPhase === phase && styles.phaseProgressDotActive,
                ]}
              />
            ))}
          </View>
        </View>

            {/* Main Content */}
            <View style={styles.content}>
              {renderCurrentPhase()}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    backgroundColor: 'transparent',
  },
  closeButton: {
    padding: SPACING.sm,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FFFF',
    letterSpacing: 1,
  },
  headerTimer: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  emergencyButton: {
    padding: SPACING.sm,
  },
  phaseIndicator: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  phaseProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  phaseProgressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  phaseProgressDotActive: {
    backgroundColor: '#00FFFF',
    borderWidth: 1,
    borderColor: '#00FFFF',
  },
  content: {
    flex: 1,
  },
  
  // Activation Phase
  activationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  shieldDeployment: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: SPACING['2xl'],
  },
  shieldCore: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 75,
  },
  activationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FFFF',
    marginBottom: SPACING.sm,
    letterSpacing: 2,
  },
  activationSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: SPACING['2xl'],
  },
  progressContainer: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00FFFF',
    borderRadius: 2,
    transformOrigin: 'left',
  },

  // Assessment Phase
  assessmentContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  scannerContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING['2xl'],
  },
  shieldVisualization: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  shieldGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60,
  },
  energyRing: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderWidth: 2,
    borderColor: '#00FFFF',
    borderRadius: 80,
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FF0080',
    borderRadius: 1,
  },
  phaseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FFFF',
    marginBottom: SPACING.sm,
    textAlign: 'center',
    letterSpacing: 1,
  },
  phaseSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: SPACING['2xl'],
    textAlign: 'center',
  },
  intensityContainer: {
    width: '100%',
    marginBottom: SPACING['2xl'],
  },
  intensityLabel: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  intensityScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  intensityDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  intensityDotActive: {
    backgroundColor: '#00FFFF',
    borderColor: '#00FFFF',
    borderWidth: 2,
  },
  intensityDotHigh: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  intensityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FFFF',
    textAlign: 'center',
  },
  proceedButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  proceedGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  proceedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },

  // Intervention Phase
  interventionContainer: {
    padding: SPACING.lg,
  },
  interventionGrid: {
    gap: SPACING.lg,
  },
  interventionCard: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  interventionGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  interventionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  interventionDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },

  // Breathing Intervention
  breathingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  breathingOrb: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: SPACING['2xl'],
  },
  breathingOrbGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  breathingCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  breathingInstruction: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
  },
  continueButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  continueGradient: {
    padding: SPACING.lg,
    paddingHorizontal: SPACING['2xl'],
  },
  continueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },

  // Physical Intervention
  physicalContainer: {
    padding: SPACING.lg,
  },
  physicalActions: {
    gap: SPACING.lg,
    marginBottom: SPACING['2xl'],
  },
  physicalAction: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  physicalActionCard: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  physicalActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  physicalActionDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  completeButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  completeGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  completeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },

  // Cognitive Intervention
  cognitiveContainer: {
    padding: SPACING.lg,
  },
  cognitiveExercises: {
    gap: SPACING.lg,
    marginBottom: SPACING['2xl'],
  },
  cognitiveCard: {
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cognitiveTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  cognitiveDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },

  // Stabilization Phase
  stabilizationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  stabilizationOrb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: SPACING['2xl'],
  },
  stabilizationGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60,
  },
  stabilizationProgress: {
    width: '80%',
    marginBottom: SPACING['2xl'],
  },
  progressLabel: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  stabilizationBar: {
    height: 6,
    backgroundColor: '#00FF00',
    borderRadius: 3,
    transformOrigin: 'left',
  },
  victoryButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  victoryGradient: {
    padding: SPACING.lg,
    paddingHorizontal: SPACING['2xl'],
  },
  victoryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },

  // Victory Phase
  victoryContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  victoryOrb: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: SPACING['2xl'],
  },
  victoryOrbGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 75,
  },
  victoryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00FF00',
    marginBottom: SPACING.sm,
    letterSpacing: 2,
  },
  victorySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: SPACING['2xl'],
    textAlign: 'center',
  },
  victoryStats: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    marginBottom: SPACING['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.3)',
  },
  victoryStat: {
    flex: 1,
    alignItems: 'center',
  },
  victoryStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  victoryStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: SPACING.xs,
  },
  victoryMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING['2xl'],
  },
  returnButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  returnGradient: {
    padding: SPACING.lg,
    paddingHorizontal: SPACING['2xl'],
  },
  returnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },
});

export default DysonShieldMode; 