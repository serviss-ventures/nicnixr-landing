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

interface EmergencyShieldProps {
  visible: boolean;
  onClose: () => void;
}

const EmergencyShieldMode: React.FC<EmergencyShieldProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.progress);
  
  // Emergency Shield States
  const [currentPhase, setCurrentPhase] = useState<'crisis' | 'grounding' | 'reality' | 'strength' | 'victory'>('crisis');
  const [cravingIntensity, setCravingIntensity] = useState<number>(10);
  const [emotionalState, setEmotionalState] = useState<string>('');
  const [sessionTimer, setSessionTimer] = useState<number>(0);
  const [isGrounding, setIsGrounding] = useState<boolean>(false);
  const [groundingStep, setGroundingStep] = useState<number>(0);
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  
  // Timer for session tracking
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      // Start session timer
      timerRef.current = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
      
      // Start emergency pulse
      startEmergencyPulse();
    } else {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setCurrentPhase('crisis');
      setSessionTimer(0);
      setGroundingStep(0);
      setIsGrounding(false);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [visible]);

  const startEmergencyPulse = () => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
  };

  const startGroundingExercise = () => {
    setIsGrounding(true);
    setCurrentPhase('grounding');
    setGroundingStep(0);
    
    // Vibration pattern for grounding
    Vibration.vibrate([0, 200, 100, 200]);
  };

  const groundingSteps = [
    {
      instruction: "Look around you. Name 5 things you can SEE right now.",
      examples: ["The wall", "Your phone", "A chair", "The ceiling", "Your hands"],
      sense: "👁️ SIGHT"
    },
    {
      instruction: "Listen carefully. Name 4 things you can HEAR right now.",
      examples: ["Traffic outside", "Your breathing", "Air conditioning", "Footsteps"],
      sense: "👂 SOUND"
    },
    {
      instruction: "Feel around you. Name 3 things you can TOUCH right now.",
      examples: ["Your clothes", "The chair you're sitting on", "Your phone screen"],
      sense: "✋ TOUCH"
    },
    {
      instruction: "Breathe in deeply. Name 2 things you can SMELL right now.",
      examples: ["Fresh air", "Coffee", "Soap", "Food"],
      sense: "👃 SMELL"
    },
    {
      instruction: "If possible, name 1 thing you can TASTE right now.",
      examples: ["Mint", "Coffee", "Water", "Nothing - that's okay too"],
      sense: "👅 TASTE"
    }
  ];

  const emergencyAffirmations = [
    "This feeling is temporary. It WILL pass.",
    "You are stronger than this craving.",
    "You have survived 100% of your worst days so far.",
    "This is your addiction lying to you. You know the truth.",
    "Every second you resist, you're rewiring your brain for freedom.",
    "You are not your thoughts. You are not your cravings.",
    "You have people who believe in you, even when you can't see them.",
    "Your future self is counting on you right now.",
    "This pain is temporary. Your strength is permanent.",
    "You are breaking generational cycles. You are a warrior."
  ];

  const emergencyTechniques = [
    {
      title: "ICE SHOCK",
      description: "Hold ice cubes or splash ice water on your face/wrists",
      icon: "snow-outline",
      urgent: true
    },
    {
      title: "CALL SOMEONE NOW",
      description: "Call a friend, family member, or crisis line immediately",
      icon: "call",
      urgent: true,
      action: () => {
        Alert.alert(
          "Emergency Support",
          "Choose your support option:",
          [
            { text: "Crisis Text Line", onPress: () => Linking.openURL('sms:741741') },
            { text: "National Suicide Prevention", onPress: () => Linking.openURL('tel:988') },
            { text: "Call a Friend", onPress: () => Linking.openURL('tel:') },
            { text: "Cancel", style: "cancel" }
          ]
        );
      }
    },
    {
      title: "INTENSE MOVEMENT",
      description: "Do 50 jumping jacks, run in place, or do pushups until exhausted",
      icon: "fitness",
      urgent: true
    },
    {
      title: "SCREAM INTO PILLOW",
      description: "Find a pillow and scream as loud as you can into it",
      icon: "megaphone-outline",
      urgent: false
    },
    {
      title: "COLD SHOWER",
      description: "Take the coldest shower you can handle for 2-3 minutes",
      icon: "water",
      urgent: false
    },
    {
      title: "LEAVE THE LOCATION",
      description: "Get up and go somewhere else immediately - anywhere else",
      icon: "exit-outline",
      urgent: true
    }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      "🚨 EMERGENCY SUPPORT",
      "You don't have to face this alone. Choose immediate help:",
      [
        { 
          text: "Crisis Text Line (Text HOME to 741741)", 
          onPress: () => Linking.openURL('sms:741741?body=HOME') 
        },
        { 
          text: "Call 988 (Suicide & Crisis Lifeline)", 
          onPress: () => Linking.openURL('tel:988') 
        },
        { 
          text: "I'm Safe For Now", 
          style: "cancel" 
        }
      ]
    );
  };

  const renderCrisisPhase = () => (
    <ScrollView contentContainerStyle={styles.crisisContainer}>
      <Animated.View style={[styles.shieldIcon, { transform: [{ scale: pulseAnim }] }]}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.shieldIconGradient}
        >
          <Ionicons name="shield-checkmark" size={60} color="white" />
        </LinearGradient>
      </Animated.View>

      <Text style={styles.crisisTitle}>Shield Activated</Text>
      <Text style={styles.crisisSubtitle}>You're safe here. Let's work through this together, one step at a time.</Text>

      <View style={styles.intensityContainer}>
        <Text style={styles.intensityLabel}>How overwhelming is this feeling? (1-10)</Text>
        <View style={styles.intensityScale}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.intensityButton,
                level <= 7 ? styles.intensityButtonNormal : styles.intensityButtonCrisis,
                cravingIntensity >= level && styles.intensityButtonActive
              ]}
              onPress={() => setCravingIntensity(level)}
            >
              <Text style={[
                styles.intensityButtonText,
                cravingIntensity >= level && styles.intensityButtonTextActive
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.emotionalCheckContainer}>
        <Text style={styles.emotionalLabel}>What's making this harder right now?</Text>
        <View style={styles.emotionalOptions}>
          {['People being mean', 'Feeling alone', 'Stress/pressure', 'Anger', 'Sadness', 'Anxiety', 'Physical pain'].map((emotion) => (
            <TouchableOpacity
              key={emotion}
              style={[
                styles.emotionalButton,
                emotionalState === emotion && styles.emotionalButtonActive
              ]}
              onPress={() => setEmotionalState(emotion)}
            >
              <Text style={[
                styles.emotionalButtonText,
                emotionalState === emotion && styles.emotionalButtonTextActive
              ]}>
                {emotion}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={startGroundingExercise}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.primaryButtonGradient}
        >
          <Ionicons name="hand-left" size={24} color="white" />
          <Text style={styles.primaryButtonText}>Start Grounding</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.supportButton} onPress={handleEmergencyCall}>
        <Ionicons name="people" size={20} color={COLORS.primary} />
        <Text style={styles.supportButtonText}>I need to talk to someone</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderGroundingPhase = () => {
    const currentStep = groundingSteps[groundingStep];
    
    return (
      <View style={styles.groundingContainer}>
        <Text style={styles.groundingTitle}>🧠 GROUNDING EXERCISE</Text>
        <Text style={styles.groundingSubtitle}>This will bring you back to the present moment</Text>
        
        <View style={styles.groundingProgress}>
          <Text style={styles.groundingProgressText}>Step {groundingStep + 1} of 5</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((groundingStep + 1) / 5) * 100}%` }]} />
          </View>
        </View>

        <View style={styles.groundingStepContainer}>
          <Text style={styles.groundingSense}>{currentStep.sense}</Text>
          <Text style={styles.groundingInstruction}>{currentStep.instruction}</Text>
          
          <View style={styles.groundingExamples}>
            <Text style={styles.groundingExamplesTitle}>Examples:</Text>
            {currentStep.examples.map((example, index) => (
              <Text key={index} style={styles.groundingExample}>• {example}</Text>
            ))}
          </View>
        </View>

        <View style={styles.groundingActions}>
          <TouchableOpacity 
            style={styles.groundingSkipButton}
            onPress={() => setCurrentPhase('reality')}
          >
            <Text style={styles.skipButtonText}>Skip to Reality Check</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.groundingNextButton}
            onPress={() => {
              if (groundingStep < 4) {
                setGroundingStep(groundingStep + 1);
                Vibration.vibrate(100);
              } else {
                setCurrentPhase('reality');
              }
            }}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.groundingNextGradient}
            >
              <Text style={styles.groundingNextText}>
                {groundingStep < 4 ? 'Next Step' : 'Continue'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderRealityPhase = () => (
    <ScrollView contentContainerStyle={styles.realityContainer}>
      <Text style={styles.realityTitle}>💪 REALITY CHECK</Text>
      <Text style={styles.realitySubtitle}>Let's remember what's actually true right now</Text>

      <View style={styles.realityStats}>
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
          style={styles.realityStatsGradient}
        >
          <View style={styles.realityStatItem}>
            <Text style={styles.realityStatNumber}>{stats.daysClean}</Text>
            <Text style={styles.realityStatLabel}>Days You've Already Won</Text>
          </View>
          <View style={styles.realityStatItem}>
            <Text style={styles.realityStatNumber}>${Math.round(stats.moneySaved)}</Text>
            <Text style={styles.realityStatLabel}>Money You've Saved</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.affirmationsContainer}>
        <Text style={styles.affirmationsTitle}>🔥 TRUTH BOMBS</Text>
        {emergencyAffirmations.slice(0, 5).map((affirmation, index) => (
          <LinearGradient
            key={index}
            colors={['rgba(220, 38, 38, 0.15)', 'rgba(239, 68, 68, 0.15)']}
            style={styles.affirmationCard}
          >
            <Text style={styles.affirmationText}>{affirmation}</Text>
          </LinearGradient>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.strengthButton} 
        onPress={() => setCurrentPhase('strength')}
      >
        <LinearGradient
          colors={['#DC2626', '#EF4444']}
          style={styles.strengthButtonGradient}
        >
          <Text style={styles.strengthButtonText}>I NEED MORE STRENGTH</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.victoryButton} 
        onPress={() => setCurrentPhase('victory')}
      >
        <Text style={styles.victoryButtonText}>I'M FEELING STRONGER</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderStrengthPhase = () => (
    <ScrollView contentContainerStyle={styles.strengthContainer}>
      <Text style={styles.strengthTitle}>Coping Techniques</Text>
      <Text style={styles.strengthSubtitle}>Choose what feels right for you right now</Text>

      {emergencyTechniques.map((technique, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.techniqueCard}
          onPress={technique.action}
        >
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
            style={styles.techniqueCardGradient}
          >
            <View style={styles.techniqueHeader}>
              <Ionicons 
                name={technique.icon as any} 
                size={24} 
                color={COLORS.primary} 
              />
              <Text style={styles.techniqueTitle}>
                {technique.title}
              </Text>
            </View>
            <Text style={styles.techniqueDescription}>{technique.description}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}

      <TouchableOpacity 
        style={styles.victoryButton} 
        onPress={() => setCurrentPhase('victory')}
      >
        <Text style={styles.victoryButtonText}>THAT HELPED - I'M READY</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderVictoryPhase = () => (
    <View style={styles.victoryContainer}>
      <Animated.View style={styles.victoryIcon}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.victoryIconGradient}
        >
          <Ionicons name="trophy" size={80} color="white" />
        </LinearGradient>
      </Animated.View>

      <Text style={styles.victoryTitle}>🏆 YOU DID IT!</Text>
      <Text style={styles.victorySubtitle}>
        You just survived one of your hardest moments. 
        Time in crisis: {formatTime(sessionTimer)}
      </Text>

      <LinearGradient
        colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
        style={styles.victoryMessageCard}
      >
        <Text style={styles.victoryMessage}>
          "You didn't just resist a craving - you proved to yourself that you can handle anything. 
          You are literally rewiring your brain for freedom right now. Every time you choose recovery, 
          you become stronger. You are a warrior."
        </Text>
      </LinearGradient>

      <TouchableOpacity style={styles.returnButton} onPress={onClose}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.returnButtonGradient}
        >
          <Text style={styles.returnButtonText}>Return to Safety</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 'crisis':
        return renderCrisisPhase();
      case 'grounding':
        return renderGroundingPhase();
      case 'reality':
        return renderRealityPhase();
      case 'strength':
        return renderStrengthPhase();
      case 'victory':
        return renderVictoryPhase();
      default:
        return renderCrisisPhase();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Shield Mode</Text>
            <Text style={styles.headerTimer}>{formatTime(sessionTimer)}</Text>
          </View>

          <TouchableOpacity onPress={handleEmergencyCall} style={styles.helpButton}>
            <Ionicons name="help-circle" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {renderCurrentPhase()}
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING['3xl'],
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
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
    color: 'white',
  },
  headerTimer: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  helpButton: {
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  crisisContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  shieldIcon: {
    marginBottom: SPACING.xl,
  },
  shieldIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crisisTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  crisisSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  intensityContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  intensityLabel: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontWeight: '600',
  },
  intensityScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  intensityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  intensityButtonNormal: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  intensityButtonCrisis: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  intensityButtonActive: {
    backgroundColor: 'white',
  },
  intensityButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  intensityButtonTextActive: {
    color: '#DC2626',
  },
  emotionalCheckContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  emotionalLabel: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontWeight: '600',
  },
  emotionalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  emotionalButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  emotionalButtonActive: {
    backgroundColor: 'white',
  },
  emotionalButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  emotionalButtonTextActive: {
    color: '#DC2626',
  },
  primaryButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    width: '100%',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: SPACING.sm,
  },
  supportButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  groundingContainer: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  groundingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  groundingSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  groundingProgress: {
    marginBottom: SPACING.xl,
  },
  groundingProgressText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  groundingStepContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  groundingSense: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  groundingInstruction: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  groundingExamples: {
    marginTop: SPACING.md,
  },
  groundingExamplesTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  groundingExample: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  groundingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  groundingSkipButton: {
    flex: 0.4,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groundingNextButton: {
    flex: 0.6,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  groundingNextGradient: {
    paddingVertical: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groundingNextText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  skipButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  realityContainer: {
    padding: SPACING.lg,
  },
  realityTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  realitySubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  realityStats: {
    marginBottom: SPACING.xl,
  },
  realityStatsGradient: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
  },
  realityStatItem: {
    alignItems: 'center',
  },
  realityStatNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  realityStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  affirmationsContainer: {
    marginBottom: SPACING.xl,
  },
  affirmationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  affirmationCard: {
    padding: SPACING.md,
    borderRadius: SPACING.md,
    marginBottom: SPACING.sm,
  },
  affirmationText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  strengthButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  strengthButtonGradient: {
    paddingVertical: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  strengthButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  victoryButton: {
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  victoryButtonText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  strengthContainer: {
    padding: SPACING.lg,
  },
  strengthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  strengthSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  techniqueCard: {
    marginBottom: SPACING.md,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  techniqueCardGradient: {
    padding: SPACING.lg,
  },
  techniqueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  techniqueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: SPACING.md,
  },
  techniqueDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  victoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  victoryIcon: {
    marginBottom: SPACING.xl,
  },
  victoryIconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  victoryTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SPACING.md,
  },
  victorySubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  victoryMessageCard: {
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  victoryMessage: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  returnButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  returnButtonGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  returnButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default EmergencyShieldMode; 