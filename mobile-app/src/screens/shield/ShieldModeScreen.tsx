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
  Alert 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface ShieldModeProps {
  visible: boolean;
  onClose: () => void;
}

const ShieldModeScreen: React.FC<ShieldModeProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.progress);
  
  // Shield Mode States
  const [currentPhase, setCurrentPhase] = useState<'assessment' | 'breathing' | 'motivation' | 'distraction' | 'success'>('assessment');
  const [cravingIntensity, setCravingIntensity] = useState<number>(5);
  const [breathingCount, setBreathingCount] = useState<number>(0);
  const [sessionTimer, setSessionTimer] = useState<number>(0);
  const [isBreathing, setIsBreathing] = useState<boolean>(false);
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  
  // Timer for session tracking
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      // Start session timer
      timerRef.current = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setCurrentPhase('assessment');
      setSessionTimer(0);
      setBreathingCount(0);
      setIsBreathing(false);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [visible]);

  // Breathing exercise animation
  const startBreathingExercise = () => {
    setIsBreathing(true);
    setCurrentPhase('breathing');
    
    const breatheIn = () => {
      Animated.timing(breatheAnim, {
        toValue: 1.3,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        breatheOut();
      });
    };

    const breatheOut = () => {
      Animated.timing(breatheAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        setBreathingCount(prev => {
          const newCount = prev + 1;
          if (newCount < 6) {
            breatheIn();
          } else {
            setIsBreathing(false);
            setCurrentPhase('motivation');
          }
          return newCount;
        });
      });
    };

    breatheIn();
  };

  // Get user's motivations from onboarding
  const getPersonalMotivations = () => {
    // This would come from user's onboarding data
    return [
      "Your health is healing every day",
      "Your family is proud of your strength", 
      "You're saving money for your future",
      "You're proving you're stronger than addiction",
      "Every 'no' is a victory"
    ];
  };

  // Distraction techniques
  const distractionTechniques = [
    {
      title: "5-4-3-2-1 Grounding",
      description: "Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste",
      icon: "eye-outline"
    },
    {
      title: "Cold Water",
      description: "Splash cold water on your face or hold an ice cube",
      icon: "water-outline"
    },
    {
      title: "Call Support",
      description: "Reach out to your support network or crisis line",
      icon: "call-outline"
    },
    {
      title: "Physical Activity", 
      description: "Do 20 jumping jacks or take a quick walk",
      icon: "fitness-outline"
    }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEmergencyExit = () => {
    Alert.alert(
      "Need Immediate Help?",
      "Remember: This craving will pass. You've overcome them before, and you can do it again.",
      [
        { text: "Keep Fighting", style: "cancel" },
        { text: "Call Support", onPress: () => {/* Handle support call */} }
      ]
    );
  };

  const renderAssessmentPhase = () => (
    <ScrollView contentContainerStyle={styles.phaseContainer}>
      <Animated.View style={[styles.shieldIcon, { transform: [{ scale: pulseAnim }] }]}>
        <LinearGradient
          colors={['#1E40AF', '#3B82F6', '#06B6D4']}
          style={styles.shieldIconGradient}
        >
          <Ionicons name="shield" size={60} color="white" />
        </LinearGradient>
      </Animated.View>

      <Text style={styles.phaseTitle}>Shield Mode Activated</Text>
      <Text style={styles.phaseSubtitle}>You're safe. Let's get through this together.</Text>

      <View style={styles.intensityContainer}>
        <Text style={styles.intensityLabel}>How intense is your craving right now?</Text>
        <View style={styles.intensityScale}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.intensityButton,
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
        <View style={styles.intensityLabels}>
          <Text style={styles.intensityLabelText}>Mild</Text>
          <Text style={styles.intensityLabelText}>Severe</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={startBreathingExercise}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.continueButtonGradient}
        >
          <Text style={styles.continueButtonText}>Start Defense Protocol</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderBreathingPhase = () => (
    <View style={styles.breathingContainer}>
      <Text style={styles.breathingTitle}>Breathing Defense</Text>
      <Text style={styles.breathingSubtitle}>Follow the circle - breathe with me</Text>
      
      <Animated.View style={[styles.breathingCircle, { transform: [{ scale: breatheAnim }] }]}>
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.3)', 'rgba(6, 182, 212, 0.3)']}
          style={styles.breathingCircleInner}
        >
          <Text style={styles.breathingText}>
            {breathingCount < 6 ? (breatheAnim._value > 1.1 ? 'Breathe Out' : 'Breathe In') : 'Complete!'}
          </Text>
        </LinearGradient>
      </Animated.View>

      <Text style={styles.breathingCount}>{breathingCount}/6 breaths</Text>
      
      <Text style={styles.breathingInstructions}>
        {breathingCount < 6 
          ? "Inhale for 4 seconds, exhale for 4 seconds. You're stronger than this craving."
          : "Well done! You're taking control back."
        }
      </Text>

      {/* Skip and Continue Options */}
      <View style={styles.breathingActions}>
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => setCurrentPhase('motivation')}
        >
          <Text style={styles.skipButtonText}>Skip Breathing</Text>
        </TouchableOpacity>
        
        {(breathingCount >= 6 || !isBreathing) && (
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => setCurrentPhase('motivation')}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderMotivationPhase = () => (
    <ScrollView contentContainerStyle={styles.phaseContainer}>
      <Text style={styles.phaseTitle}>Remember Why You Started</Text>
      
      <View style={styles.statsReminder}>
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
          style={styles.statsReminderGradient}
        >
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.daysClean}</Text>
            <Text style={styles.statLabel}>Days Strong</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>${Math.round(stats.moneySaved)}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.cigarettesAvoided}</Text>
            <Text style={styles.statLabel}>Avoided</Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.motivationsContainer}>
        {getPersonalMotivations().map((motivation, index) => (
          <LinearGradient
            key={index}
            colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)']}
            style={styles.motivationCard}
          >
            <Ionicons name="heart" size={20} color={COLORS.primary} />
            <Text style={styles.motivationText}>{motivation}</Text>
          </LinearGradient>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.motivationActions}>
        <TouchableOpacity 
          style={styles.motivationSkipButton}
          onPress={() => setCurrentPhase('success')}
        >
          <Text style={styles.skipButtonText}>Skip to Victory</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.motivationContinueButton} 
          onPress={() => setCurrentPhase('distraction')}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>I Need More Help</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.successButton} 
        onPress={() => setCurrentPhase('success')}
      >
        <Text style={styles.successButtonText}>I'm Feeling Stronger</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderDistractionPhase = () => (
    <ScrollView contentContainerStyle={styles.phaseContainer}>
      <Text style={styles.phaseTitle}>Emergency Techniques</Text>
      <Text style={styles.phaseSubtitle}>Choose what feels right for you right now</Text>

      {/* Skip Option */}
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={() => setCurrentPhase('success')}
      >
        <Text style={styles.skipButtonText}>Skip Techniques</Text>
      </TouchableOpacity>

      {distractionTechniques.map((technique, index) => (
        <TouchableOpacity key={index} style={styles.techniqueCard}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
            style={styles.techniqueCardGradient}
          >
            <Ionicons name={technique.icon as any} size={24} color={COLORS.primary} />
            <View style={styles.techniqueContent}>
              <Text style={styles.techniqueTitle}>{technique.title}</Text>
              <Text style={styles.techniqueDescription}>{technique.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </LinearGradient>
        </TouchableOpacity>
      ))}

      <TouchableOpacity 
        style={styles.successButton} 
        onPress={() => setCurrentPhase('success')}
      >
        <Text style={styles.successButtonText}>That Helped - I'm Ready</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSuccessPhase = () => (
    <View style={styles.successContainer}>
      <Animated.View style={[styles.successIcon, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.successIconGradient}
        >
          <Ionicons name="checkmark-circle" size={80} color="white" />
        </LinearGradient>
      </Animated.View>

      <Text style={styles.successTitle}>Victory!</Text>
      <Text style={styles.successSubtitle}>
        You just proved you're stronger than your cravings. 
        Session time: {formatTime(sessionTimer)}
      </Text>

      <LinearGradient
        colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
        style={styles.victoryCard}
      >
        <Text style={styles.victoryText}>
          "Every time you resist a craving, you're rewiring your brain for freedom. 
          You just took another step toward the person you're becoming."
        </Text>
      </LinearGradient>

      <TouchableOpacity style={styles.continueButton} onPress={onClose}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.continueButtonGradient}
        >
          <Text style={styles.continueButtonText}>Return to Dashboard</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 'assessment':
        return renderAssessmentPhase();
      case 'breathing':
        return renderBreathingPhase();
      case 'motivation':
        return renderMotivationPhase();
      case 'distraction':
        return renderDistractionPhase();
      case 'success':
        return renderSuccessPhase();
      default:
        return renderAssessmentPhase();
    }
  };

  // Start pulse animation for shield icon
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    if (visible && currentPhase === 'assessment') {
      pulse.start();
    }
    
    return () => pulse.stop();
  }, [visible, currentPhase]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Shield Mode</Text>
            <Text style={styles.headerTimer}>{formatTime(sessionTimer)}</Text>
          </View>

          <TouchableOpacity onPress={handleEmergencyExit} style={styles.emergencyButton}>
            <Ionicons name="warning" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDots}>
            {['assessment', 'breathing', 'motivation', 'success'].map((phase, index) => (
              <View
                key={phase}
                style={[
                  styles.progressDot,
                  (phase === currentPhase || 
                   (currentPhase === 'distraction' && phase === 'motivation') ||
                   (currentPhase === 'success' && index < 3)) && styles.progressDotActive
                ]}
              />
            ))}
          </View>
        </View>

        {/* Main Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {renderCurrentPhase()}
        </Animated.View>
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
    color: COLORS.text,
  },
  headerTimer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emergencyButton: {
    padding: SPACING.sm,
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  phaseContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  shieldIcon: {
    marginBottom: SPACING['2xl'],
  },
  shieldIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  phaseSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
  },
  intensityContainer: {
    width: '100%',
    marginBottom: SPACING['2xl'],
  },
  intensityLabel: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  intensityButtonActive: {
    backgroundColor: COLORS.primary,
  },
  intensityButtonText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  intensityButtonTextActive: {
    color: 'white',
  },
  intensityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intensityLabelText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  continueButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    marginTop: SPACING.lg,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING['2xl'],
    gap: SPACING.sm,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  successButton: {
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  successButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginVertical: SPACING.sm,
  },
  skipButtonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  breathingActions: {
    marginTop: SPACING['2xl'],
    width: '100%',
    alignItems: 'center',
    gap: SPACING.md,
  },
  motivationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  motivationSkipButton: {
    flex: 0.4,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  motivationContinueButton: {
    flex: 0.6,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  breathingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  breathingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  breathingSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING['3xl'],
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: SPACING['2xl'],
  },
  breathingCircleInner: {
    flex: 1,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  breathingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  breathingCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  breathingInstructions: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsReminder: {
    width: '100%',
    marginBottom: SPACING['2xl'],
  },
  statsReminderGradient: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  motivationsContainer: {
    width: '100%',
    marginBottom: SPACING['2xl'],
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  motivationText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.md,
    flex: 1,
    lineHeight: 18,
  },
  techniqueCard: {
    width: '100%',
    marginBottom: SPACING.md,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  techniqueCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  techniqueContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  techniqueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  techniqueDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  successIcon: {
    marginBottom: SPACING['2xl'],
  },
  successIconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  successSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
    lineHeight: 22,
  },
  victoryCard: {
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    marginBottom: SPACING['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  victoryText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default ShieldModeScreen; 