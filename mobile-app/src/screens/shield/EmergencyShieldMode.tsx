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
  Alert,
  Vibration,
  Linking
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface EmergencyShieldModeProps {
  visible: boolean;
  onClose: () => void;
}

const EmergencyShieldMode: React.FC<EmergencyShieldModeProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.progress);
  
  const [phase, setPhase] = useState<'crisis' | 'disruption' | 'tactics' | 'victory'>('crisis');
  const [cravingIntensity, setCravingIntensity] = useState(10);
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5 minutes - peak craving time
  const [currentTactic, setCurrentTactic] = useState<string | null>(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const countdownAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && phase === 'crisis') {
      // Immediate vibration to break the pattern
      Vibration.vibrate([0, 500, 200, 500]);
      
      // Start countdown
      const timer = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase('victory');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [visible, phase]);

  useEffect(() => {
    // Pulse animation for urgency
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Get Help Now',
      'Choose your support:',
      [
        { text: 'Crisis Text Line', onPress: () => Linking.openURL('sms:741741') },
        { text: 'Call 988', onPress: () => Linking.openURL('tel:988') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const startDisruption = () => {
    setPhase('disruption');
    Vibration.vibrate([0, 200, 100, 200, 100, 200]);
  };

  const startTactic = (tacticName: string) => {
    setCurrentTactic(tacticName);
    setPhase('tactics');
    Vibration.vibrate(100);
  };

  const reduceCraving = () => {
    setCravingIntensity(prev => Math.max(1, prev - 1));
    Vibration.vibrate(50);
  };

  const renderCrisisPhase = () => (
    <View style={styles.crisisContainer}>
      <Animated.View style={[styles.urgentAlert, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.urgentText}>STOP</Text>
        <Text style={styles.urgentSubtext}>Your hand is moving toward nicotine</Text>
      </Animated.View>

      <View style={styles.countdownContainer}>
        <Text style={styles.countdownLabel}>Craving peaks in:</Text>
        <Text style={styles.countdownTime}>{formatTime(secondsRemaining)}</Text>
        <Text style={styles.countdownSubtext}>Then it WILL get easier</Text>
      </View>

      <View style={styles.cravingMeter}>
        <Text style={styles.cravingLabel}>Craving Intensity: {cravingIntensity}/10</Text>
        <View style={styles.meterContainer}>
          {[...Array(10)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.meterBar,
                { backgroundColor: i < cravingIntensity ? '#FF4444' : '#333' }
              ]}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.disruptButton} onPress={startDisruption}>
        <LinearGradient colors={['#FF6B6B', '#FF8E53']} style={styles.disruptButtonGradient}>
          <Ionicons name="flash" size={32} color="white" />
          <Text style={styles.disruptButtonText}>BREAK THE PATTERN NOW</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.helpButton} onPress={handleEmergencyCall}>
        <Text style={styles.helpButtonText}>🆘 I need to talk to someone RIGHT NOW</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDisruptionPhase = () => (
    <View style={styles.disruptionContainer}>
      <Text style={styles.disruptionTitle}>PHYSICAL DISRUPTION</Text>
      <Text style={styles.disruptionSubtext}>Break the automatic pattern. Do this NOW:</Text>

      <View style={styles.disruptionActions}>
        <TouchableOpacity style={styles.disruptionAction} onPress={() => {
          Vibration.vibrate([0, 100, 50, 100, 50, 100]);
          Alert.alert('Clench Your Fists', 'Squeeze as hard as you can for 10 seconds. Feel the tension. This is your strength.');
        }}>
          <Ionicons name="fitness" size={24} color="#FF6B6B" />
          <Text style={styles.disruptionActionText}>CLENCH FISTS HARD</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.disruptionAction} onPress={() => {
          Alert.alert('Cold Shock', 'Put your hands in cold water, hold ice, or splash cold water on your face. Do it NOW.');
        }}>
          <Ionicons name="snow" size={24} color="#4ECDC4" />
          <Text style={styles.disruptionActionText}>COLD SHOCK</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.disruptionAction} onPress={() => {
          Alert.alert('Move Your Body', 'Do 10 jumping jacks, run in place, or do pushups. Move until you feel your heart rate change.');
        }}>
          <Ionicons name="walk" size={24} color="#45B7D1" />
          <Text style={styles.disruptionActionText}>INTENSE MOVEMENT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.disruptionAction} onPress={() => {
          Alert.alert('Change Location', 'Go to a different room, step outside, or change your environment completely. Move your body away from the trigger.');
        }}>
          <Ionicons name="exit" size={24} color="#96CEB4" />
          <Text style={styles.disruptionActionText}>CHANGE LOCATION</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.nextPhaseButton} onPress={() => setPhase('tactics')}>
        <Text style={styles.nextPhaseButtonText}>I've disrupted the pattern →</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTacticsPhase = () => (
    <ScrollView style={styles.tacticsContainer}>
      <Text style={styles.tacticsTitle}>TACTICAL INTERVENTIONS</Text>
      <Text style={styles.tacticsSubtext}>Choose what feels right for this moment:</Text>

      <TouchableOpacity style={styles.tacticCard} onPress={() => startTactic('breathing')}>
        <Ionicons name="leaf" size={24} color={COLORS.primary} />
        <View style={styles.tacticContent}>
          <Text style={styles.tacticTitle}>4-7-8 Breathing</Text>
          <Text style={styles.tacticDescription}>Inhale 4, hold 7, exhale 8. Repeat 4 times.</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tacticCard} onPress={() => startTactic('grounding')}>
        <Ionicons name="eye" size={24} color={COLORS.primary} />
        <View style={styles.tacticContent}>
          <Text style={styles.tacticTitle}>5-4-3-2-1 Grounding</Text>
          <Text style={styles.tacticDescription}>5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tacticCard} onPress={() => startTactic('replacement')}>
        <Ionicons name="hand-left" size={24} color={COLORS.primary} />
        <View style={styles.tacticContent}>
          <Text style={styles.tacticTitle}>Hand-to-Mouth Replacement</Text>
          <Text style={styles.tacticDescription}>Drink water, chew gum, use a toothpick, or eat something crunchy</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tacticCard} onPress={() => startTactic('reality')}>
        <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
        <View style={styles.tacticContent}>
          <Text style={styles.tacticTitle}>Reality Check</Text>
          <Text style={styles.tacticDescription}>Remember why you quit and how far you've come</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tacticCard} onPress={() => startTactic('social')}>
        <Ionicons name="call" size={24} color={COLORS.primary} />
        <View style={styles.tacticContent}>
          <Text style={styles.tacticTitle}>Immediate Social Support</Text>
          <Text style={styles.tacticDescription}>Text or call someone who supports your quit journey</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.cravingTracker}>
        <Text style={styles.cravingTrackerText}>How's your craving now? {cravingIntensity}/10</Text>
        <TouchableOpacity style={styles.reduceButton} onPress={reduceCraving}>
          <Text style={styles.reduceButtonText}>It's getting easier ↓</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderVictoryPhase = () => (
    <View style={styles.victoryContainer}>
      <Animated.View style={[styles.victoryIcon, { transform: [{ scale: pulseAnim }] }]}>
        <Ionicons name="trophy" size={80} color="#FFD700" />
      </Animated.View>
      
      <Text style={styles.victoryTitle}>YOU DID IT!</Text>
      <Text style={styles.victoryText}>You survived the peak craving. You're stronger than nicotine.</Text>
      
      <View style={styles.victoryStats}>
        <Text style={styles.victoryStatsText}>🔥 Craving defeated</Text>
        <Text style={styles.victoryStatsText}>💪 Strength proven</Text>
        <Text style={styles.victoryStatsText}>🎯 Goal protected</Text>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={onClose}>
        <Text style={styles.continueButtonText}>Continue Being Awesome</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentPhase = () => {
    switch (phase) {
      case 'crisis': return renderCrisisPhase();
      case 'disruption': return renderDisruptionPhase();
      case 'tactics': return renderTacticsPhase();
      case 'victory': return renderVictoryPhase();
      default: return renderCrisisPhase();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shield Mode</Text>
          <TouchableOpacity onPress={handleEmergencyCall} style={styles.emergencyButton}>
            <Ionicons name="call" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        {renderCurrentPhase()}
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  emergencyButton: {
    padding: SPACING.sm,
  },
  crisisContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: SPACING.xl,
  },
  urgentAlert: {
    alignItems: 'center' as const,
    marginBottom: SPACING['3xl'],
  },
  urgentText: {
    fontSize: 72,
    fontWeight: 'bold' as const,
    color: '#FF4444',
    textAlign: 'center' as const,
  },
  urgentSubtext: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center' as const,
    marginTop: SPACING.md,
  },
  countdownContainer: {
    alignItems: 'center' as const,
    marginBottom: SPACING['3xl'],
  },
  countdownLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.sm,
  },
  countdownTime: {
    fontSize: 48,
    fontWeight: 'bold' as const,
    color: '#FFD700',
  },
  countdownSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: SPACING.sm,
  },
  cravingMeter: {
    alignItems: 'center' as const,
    marginBottom: SPACING['3xl'],
  },
  cravingLabel: {
    fontSize: 16,
    color: 'white',
    marginBottom: SPACING.md,
  },
  meterContainer: {
    flexDirection: 'row' as const,
    gap: 4,
  },
  meterBar: {
    width: 20,
    height: 8,
    borderRadius: 4,
  },
  disruptButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden' as const,
    marginBottom: SPACING.lg,
    width: '100%',
  },
  disruptButtonGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  disruptButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  helpButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  helpButtonText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
  },
  disruptionContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  disruptionTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: 'white',
    textAlign: 'center' as const,
    marginBottom: SPACING.md,
  },
  disruptionSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center' as const,
    marginBottom: SPACING['3xl'],
  },
  disruptionActions: {
    gap: SPACING.lg,
    marginBottom: SPACING['3xl'],
  },
  disruptionAction: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  disruptionActionText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: 'white',
    marginLeft: SPACING.md,
  },
  nextPhaseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: SPACING.lg,
    alignItems: 'center' as const,
  },
  nextPhaseButtonText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  tacticsContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  tacticsTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: 'white',
    textAlign: 'center' as const,
    marginBottom: SPACING.md,
  },
  tacticsSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center' as const,
    marginBottom: SPACING.xl,
  },
  tacticCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tacticContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  tacticTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  tacticDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  cravingTracker: {
    alignItems: 'center' as const,
    marginVertical: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: SPACING.lg,
  },
  cravingTrackerText: {
    fontSize: 16,
    color: 'white',
    marginBottom: SPACING.md,
  },
  reduceButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
  },
  reduceButtonText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  victoryContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: SPACING.xl,
  },
  victoryIcon: {
    marginBottom: SPACING.xl,
  },
  victoryTitle: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#FFD700',
    textAlign: 'center' as const,
    marginBottom: SPACING.md,
  },
  victoryText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center' as const,
    marginBottom: SPACING.xl,
  },
  victoryStats: {
    alignItems: 'center' as const,
    marginBottom: SPACING['3xl'],
  },
  victoryStatsText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.sm,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING['3xl'],
    borderRadius: SPACING.lg,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: 'white',
  },
});

export default EmergencyShieldMode; 