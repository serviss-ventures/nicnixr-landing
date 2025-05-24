import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { generateQuitBlueprint, completeOnboarding } from '../../../store/slices/onboardingSlice';
import { completeOnboarding as authCompleteOnboarding } from '../../../store/slices/authSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const BlueprintRevealStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData, quitBlueprint, isGeneratingBlueprint } = useSelector((state: RootState) => state.onboarding);
  
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Generate the blueprint when component mounts
    if (stepData && !quitBlueprint && !isGeneratingBlueprint) {
      // Create a complete onboarding data object with defaults
      const completeData = {
        firstName: stepData.firstName || 'Warrior',
        lastName: stepData.lastName || '',
        email: stepData.email || '',
        nicotineProduct: stepData.nicotineProduct || { id: 'cigarettes', name: 'Cigarettes', category: 'cigarettes', avgCostPerDay: 15, nicotineContent: 12, harmLevel: 5 },
        customNicotineProduct: stepData.customNicotineProduct || '',
        usageDuration: stepData.usageDuration || '1_to_3_years',
        dailyAmount: stepData.dailyAmount || 10,
        packagesPerDay: stepData.packagesPerDay || 1,
        dailyCost: stepData.dailyCost || 15,
        reasonsToQuit: stepData.reasonsToQuit || ['health'],
        customReasonToQuit: stepData.customReasonToQuit || '',
        fearsAboutQuitting: stepData.fearsAboutQuitting || [],
        customFearAboutQuitting: stepData.customFearAboutQuitting || '',
        cravingTriggers: stepData.cravingTriggers || ['stress'],
        customCravingTrigger: stepData.customCravingTrigger || '',
        highRiskSituations: stepData.highRiskSituations || [],
        currentCopingMechanisms: stepData.currentCopingMechanisms || [],
        hasTriedQuittingBefore: stepData.hasTriedQuittingBefore || false,
        previousAttempts: stepData.previousAttempts || 0,
        whatWorkedBefore: stepData.whatWorkedBefore || [],
        whatMadeItDifficult: stepData.whatMadeItDifficult || [],
        longestQuitPeriod: stepData.longestQuitPeriod || '',
        quitDate: new Date().toISOString(),
        quitApproach: stepData.quitApproach || 'immediate',
        preparationDays: stepData.preparationDays || 0,
        motivationalGoals: stepData.motivationalGoals || stepData.reasonsToQuit || ['health'],
        preferredCommunicationStyle: stepData.preferredCommunicationStyle || 'encouraging',
        reminderFrequency: stepData.reminderFrequency || 'moderate',
        hasSupportSystem: stepData.hasSupportSystem || false,
        supportTypes: stepData.supportTypes || [],
        tellOthersAboutQuit: stepData.tellOthersAboutQuit || false,
        healthConcerns: stepData.healthConcerns || ['energy', 'breathing'],
        currentHealthIssues: stepData.currentHealthIssues || [],
        stressLevel: stepData.stressLevel || 3,
        typicalDayStructure: stepData.typicalDayStructure || 'routine',
        exerciseFrequency: stepData.exerciseFrequency || 'weekly',
        sleepQuality: stepData.sleepQuality || 'good',
        completedAt: new Date().toISOString(),
        onboardingVersion: '1.0',
      };

      dispatch(generateQuitBlueprint(completeData));
    }
  }, [dispatch, stepData, quitBlueprint, isGeneratingBlueprint]);

  useEffect(() => {
    if (quitBlueprint && !showBlueprint) {
      // Show blueprint with animation after generation
      setTimeout(() => {
        setShowBlueprint(true);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1000);
    }
  }, [quitBlueprint, showBlueprint, fadeAnim, slideAnim]);

  const handleGetStarted = async () => {
    try {
      // Complete onboarding in auth slice with the complete data
      const onboardingData = {
        quitDate: new Date().toISOString(),
        nicotineProduct: stepData.nicotineProduct!,
        dailyCost: stepData.dailyCost || 15,
        packagesPerDay: stepData.dailyAmount || 10,
        motivationalGoals: stepData.reasonsToQuit || ['health'],
        previousAttempts: stepData.previousAttempts || 0,
        reasonsToQuit: stepData.reasonsToQuit || ['health'],
      };
      
      // Complete auth first to ensure navigation works
      const result = await dispatch(authCompleteOnboarding(onboardingData));
      
      if (authCompleteOnboarding.fulfilled.match(result)) {
        // Mark onboarding as complete only after auth succeeds
        dispatch(completeOnboarding());
        console.log('Onboarding completed successfully - user is now authenticated');
      } else {
        throw new Error('Failed to complete authentication');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  if (isGeneratingBlueprint) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.3)', 'rgba(6, 182, 212, 0.3)']}
            style={styles.loadingIcon}
          >
            <Ionicons name="bulb" size={48} color={COLORS.primary} />
          </LinearGradient>
          <Text style={styles.loadingTitle}>Creating Your Personalized Blueprint...</Text>
          <Text style={styles.loadingSubtitle}>
            We're analyzing your responses and crafting strategies that work specifically for you.
          </Text>
          <View style={styles.loadingSteps}>
            <Text style={styles.loadingStep}>✓ Understanding your motivations</Text>
            <Text style={styles.loadingStep}>✓ Identifying your triggers</Text>
            <Text style={styles.loadingStep}>✓ Building coping strategies</Text>
            <Text style={styles.loadingStep}>✓ Personalizing your journey</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!quitBlueprint || !showBlueprint) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {/* Progress Indicator - Complete */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={[styles.progressFill, { width: '100%' }]}
          />
        </View>
        <Text style={styles.progressText}>Your Blueprint is Ready! 🎉</Text>
      </View>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Celebration Header */}
          <View style={styles.celebrationHeader}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.3)', 'rgba(6, 182, 212, 0.3)']}
              style={styles.celebrationIcon}
            >
              <Ionicons name="checkmark-circle" size={64} color={COLORS.primary} />
            </LinearGradient>
            <Text style={styles.celebrationTitle}>Your Quit Blueprint is Ready!</Text>
            <Text style={styles.celebrationSubtitle}>
              Based on your unique journey, here's your personalized path to freedom:
            </Text>
          </View>

          {/* Your Motivators */}
          <View style={styles.blueprintSection}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
              style={styles.sectionCard}
            >
              <View style={styles.sectionHeader}>
                <Ionicons name="heart" size={24} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Your Powerful Motivators</Text>
              </View>
              <Text style={styles.sectionDescription}>
                These are your why - we'll remind you of them when you need it most:
              </Text>
              {quitBlueprint.primaryMotivators.map((motivator, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="star" size={16} color={COLORS.primary} />
                  <Text style={styles.listItemText}>{motivator}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>

          {/* Personal Mantra */}
          <View style={styles.blueprintSection}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)']}
              style={styles.mantraCard}
            >
              <Ionicons name="quote" size={24} color="#8B5CF6" />
              <Text style={styles.mantraTitle}>Your Personal Mantra</Text>
              <Text style={styles.mantraText}>"{quitBlueprint.personalMantra}"</Text>
              <Text style={styles.mantraSubtext}>
                Repeat this when cravings hit - these words are your strength.
              </Text>
            </LinearGradient>
          </View>

          {/* First Week Focus */}
          <View style={styles.blueprintSection}>
            <LinearGradient
              colors={['rgba(245, 158, 11, 0.15)', 'rgba(239, 68, 68, 0.15)']}
              style={styles.sectionCard}
            >
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar" size={24} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Your First Week Focus</Text>
              </View>
              <Text style={styles.sectionDescription}>
                These are your priorities for the crucial first 7 days:
              </Text>
              {quitBlueprint.suggestedFirstWeekFocus.map((focus, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#F59E0B" />
                  <Text style={styles.listItemText}>{focus}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>

          {/* Emergency Action Plan */}
          <View style={styles.blueprintSection}>
            <LinearGradient
              colors={['rgba(239, 68, 68, 0.15)', 'rgba(220, 38, 127, 0.15)']}
              style={styles.sectionCard}
            >
              <View style={styles.sectionHeader}>
                <Ionicons name="shield" size={24} color="#EF4444" />
                <Text style={styles.sectionTitle}>Craving Emergency Plan</Text>
              </View>
              <Text style={styles.sectionDescription}>
                When a strong craving hits, follow these steps:
              </Text>
              {quitBlueprint.cravingEmergencyPlan.map((step, index) => (
                <View key={index} style={styles.emergencyStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.listItemText}>{step}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>

          {/* Milestones to Celebrate */}
          <View style={styles.blueprintSection}>
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.15)', 'rgba(16, 185, 129, 0.15)']}
              style={styles.sectionCard}
            >
              <View style={styles.sectionHeader}>
                <Ionicons name="trophy" size={24} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Milestones to Celebrate</Text>
              </View>
              <Text style={styles.sectionDescription}>
                These victories deserve recognition:
              </Text>
              {quitBlueprint.celebrationMilestones.map((milestone, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="gift" size={16} color="#3B82F6" />
                  <Text style={styles.listItemText}>{milestone}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>

          {/* Final Encouragement */}
          <View style={styles.finalEncouragement}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.2)', 'rgba(139, 92, 246, 0.2)']}
              style={styles.encouragementCard}
            >
              <Text style={styles.encouragementTitle}>You've Got This! 💪</Text>
              <Text style={styles.encouragementText}>
                This blueprint is uniquely yours, based on everything you've shared. 
                Remember: every craving resisted is a victory, every day clean is a triumph, 
                and every moment of freedom is proof of your strength.
              </Text>
              <Text style={styles.encouragementSubtext}>
                Your journey to freedom starts now. We'll be with you every step of the way.
              </Text>
            </LinearGradient>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Get Started Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary, '#06B6D4']}
            style={styles.getStartedButtonGradient}
          >
            <Text style={styles.getStartedButtonText}>Start My Freedom Journey</Text>
            <Ionicons name="rocket" size={24} color={COLORS.text} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  progressContainer: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING['2xl'],
  },
  loadingSteps: {
    alignItems: 'flex-start',
  },
  loadingStep: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  celebrationHeader: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  celebrationIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  blueprintSection: {
    marginBottom: SPACING.lg,
  },
  sectionCard: {
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  listItemText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 18,
  },
  mantraCard: {
    padding: SPACING['2xl'],
    borderRadius: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  mantraTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  mantraText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.md,
    lineHeight: 26,
  },
  mantraSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  emergencyStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  finalEncouragement: {
    marginBottom: SPACING['2xl'],
  },
  encouragementCard: {
    padding: SPACING['2xl'],
    borderRadius: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  encouragementTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  encouragementText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  encouragementSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomContainer: {
    paddingVertical: SPACING.lg,
  },
  getStartedButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  getStartedButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: SPACING.md,
  },
});

export default BlueprintRevealStep; 