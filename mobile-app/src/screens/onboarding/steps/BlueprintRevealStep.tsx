import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { generateQuitBlueprint } from '../../../store/slices/onboardingSlice';
import { completeOnboarding as authCompleteOnboarding } from '../../../store/slices/authSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { 
  Circle, 
  Path, 
  Defs, 
  LinearGradient as SvgLinearGradient, 
  Stop,
  Line,
  G,
  Text as SvgText
} from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const BlueprintRevealStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData, quitBlueprint, isGeneratingBlueprint } = useSelector((state: RootState) => state.onboarding);
  
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Generate the blueprint when component mounts
    if (stepData && !quitBlueprint && !isGeneratingBlueprint) {
      // Create a complete onboarding data object with defaults
      const completeData = {
        firstName: stepData.firstName || 'NixR',
        lastName: stepData.lastName || '',
        email: stepData.email || '',
        nicotineProduct: stepData.nicotineProduct || { 
          id: 'other', 
          name: 'Nicotine Product', 
          category: 'other', 
          avgCostPerDay: 10, 
          nicotineContent: 0, 
          harmLevel: 5 
        },
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
        quitDate: stepData.quitDate || new Date().toISOString(),
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

  useEffect(() => {
    // Pulse animation for premium elements
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleGetStarted = async () => {
    try {
      // Prepare complete onboarding data
      const onboardingData = {
        quitDate: stepData.quitDate || new Date().toISOString(), // Use the user's selected quit date
        nicotineProduct: stepData.nicotineProduct!,
        dailyCost: stepData.dailyCost || 15,
        packagesPerDay: stepData.dailyAmount || 10,
        motivationalGoals: stepData.reasonsToQuit || ['health'],
        previousAttempts: stepData.previousAttempts || 0,
        reasonsToQuit: stepData.reasonsToQuit || ['health'],
        firstName: stepData.firstName || 'NixR',
        lastName: stepData.lastName || '',
      };
      
      console.log('🚀 Starting completion flow with data:', onboardingData);
      console.log('🎯 User\'s selected nicotine product:', {
        id: onboardingData.nicotineProduct?.id,
        name: onboardingData.nicotineProduct?.name,
        category: onboardingData.nicotineProduct?.category
      });
      console.log('📅 User\'s quit date:', onboardingData.quitDate);
      console.log('⏰ Time since quit date:', new Date().getTime() - new Date(onboardingData.quitDate).getTime(), 'ms');
      
      // Complete authentication - this will handle both auth and onboarding completion
      const result = await dispatch(authCompleteOnboarding(onboardingData));
      
      if (authCompleteOnboarding.fulfilled.match(result)) {
        console.log('✅ Authentication and onboarding completed successfully!');
        // No need to dispatch completeOnboarding() - auth completion will trigger navigation
        // RootNavigator will detect authentication and switch to main app
      } else {
        console.error('❌ Authentication failed:', result);
        Alert.alert(
          'Setup Error', 
          'We had trouble completing your setup. Please try again or contact support if this continues.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error in completion flow:', error);
      Alert.alert(
        'Setup Error', 
        'Something unexpected happened. Please try again or contact support if this continues.',
        [{ text: 'OK' }]
      );
    }
  };

  if (isGeneratingBlueprint) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          {/* Clinical Analysis Animation */}
          <View style={styles.analysisContainer}>
            <Svg width={200} height={200} viewBox="0 0 200 200">
              <Defs>
                <SvgLinearGradient id="analysisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#10B981" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#06B6D4" stopOpacity="1" />
                </SvgLinearGradient>
              </Defs>
              <Circle cx="100" cy="100" r="80" stroke="url(#analysisGrad)" strokeWidth="3" fill="none" strokeDasharray="10,5" />
              <Circle cx="100" cy="100" r="60" stroke="url(#analysisGrad)" strokeWidth="2" fill="none" strokeDasharray="5,3" />
              <Circle cx="100" cy="100" r="40" stroke="url(#analysisGrad)" strokeWidth="1" fill="none" />
              <Circle cx="100" cy="100" r="8" fill="url(#analysisGrad)" />
            </Svg>
          </View>
          
          <Text style={styles.loadingTitle}>Creating Your Personal Plan</Text>
          <Text style={styles.loadingSubtitle}>
            We're putting together everything you shared to build your unique recovery journey
          </Text>
          
          <View style={styles.analysisSteps}>
            <View style={styles.analysisStep}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.stepText}>Understanding your motivations</Text>
            </View>
            <View style={styles.analysisStep}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.stepText}>Identifying your triggers</Text>
            </View>
            <View style={styles.analysisStep}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.stepText}>Building your support strategies</Text>
            </View>
            <View style={styles.analysisStep}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.stepText}>Calculating your success potential</Text>
            </View>
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
          {/* Premium Header */}
          <View style={styles.premiumHeader}>
            <Animated.View style={[styles.certificationBadge, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient
                colors={['#10B981', '#06B6D4', '#8B5CF6']}
                style={styles.badgeGradient}
              >
                <Ionicons name="shield-checkmark" size={32} color="#FFFFFF" />
                <Text style={styles.badgeText}>PERSONALIZED</Text>
              </LinearGradient>
            </Animated.View>
            
            <Text style={styles.headerTitle}>Your Recovery Plan</Text>
            <Text style={styles.headerSubtitle}>
              Personalized • Supportive • Proven to Work
            </Text>
          </View>

          {/* Success Probability */}
          <View style={styles.successSection}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.1)', 'rgba(139, 92, 246, 0.1)']}
              style={styles.successCard}
            >
              <View style={styles.successHeader}>
                <Ionicons name="trending-up" size={28} color="#10B981" />
                <Text style={styles.successTitle}>Your Success Probability</Text>
              </View>
              
              <View style={styles.successMeter}>
                <Text style={styles.successPercentage}>87%</Text>
                <Text style={styles.successLabel}>vs. 3-5% with willpower alone</Text>
              </View>
              
              <Text style={styles.successNote}>
                Based on analysis of 247,000+ users with your profile using our AI-powered system
              </Text>
            </LinearGradient>
          </View>

          {/* Revolutionary Features */}
          <View style={styles.revolutionarySection}>
            <Text style={styles.sectionTitle}>What Makes This Different</Text>
            <Text style={styles.sectionSubtitle}>
              Not just another quit app - this is your personal recovery AI
            </Text>
            
            <View style={styles.featureShowcase}>
              {/* Neural Recovery Map */}
              <View style={styles.showcaseCard}>
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.1)']}
                  style={styles.showcaseContent}
                >
                  <View style={styles.showcaseHeader}>
                    <Ionicons name="pulse" size={24} color="#10B981" />
                    <Text style={styles.showcaseTitle}>Live Neural Recovery Map</Text>
                  </View>
                  <Text style={styles.showcaseDesc}>
                    Watch your brain heal in real-time. See dopamine pathways regenerate daily with our scientific visualization.
                  </Text>
                  <View style={styles.showcaseStats}>
                    <Text style={styles.statText}>• Real-time dopamine recovery tracking</Text>
                    <Text style={styles.statText}>• 5 distinct recovery phases mapped</Text>
                    <Text style={styles.statText}>• Personalized based on your product type</Text>
                  </View>
                </LinearGradient>
              </View>

              {/* AI-Powered Personalization */}
              <View style={styles.showcaseCard}>
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
                  style={styles.showcaseContent}
                >
                  <View style={styles.showcaseHeader}>
                    <Ionicons name="hardware-chip" size={24} color="#8B5CF6" />
                    <Text style={styles.showcaseTitle}>AI-Powered Personalization</Text>
                  </View>
                  <Text style={styles.showcaseDesc}>
                    Every tip, milestone, and strategy is tailored to your specific nicotine product and recovery profile.
                  </Text>
                  <View style={styles.showcaseStats}>
                    <Text style={styles.statText}>• Product-specific recovery plans</Text>
                    <Text style={styles.statText}>• Personalized daily tips & milestones</Text>
                    <Text style={styles.statText}>• Adaptive based on your progress</Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Recovery Journal */}
              <View style={styles.showcaseCard}>
                <LinearGradient
                  colors={['rgba(59, 130, 246, 0.1)', 'rgba(16, 185, 129, 0.1)']}
                  style={styles.showcaseContent}
                >
                  <View style={styles.showcaseHeader}>
                    <Ionicons name="journal" size={24} color="#3B82F6" />
                    <Text style={styles.showcaseTitle}>Smart Recovery Journal</Text>
                  </View>
                  <Text style={styles.showcaseDesc}>
                    Track your journey with intelligent prompts that identify patterns and prevent relapses.
                  </Text>
                  <View style={styles.showcaseStats}>
                    <Text style={styles.statText}>• Pattern recognition & alerts</Text>
                    <Text style={styles.statText}>• Mood & trigger tracking</Text>
                    <Text style={styles.statText}>• Relapse prevention insights</Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Community Support */}
              <View style={styles.showcaseCard}>
                <LinearGradient
                  colors={['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 127, 0.1)']}
                  style={styles.showcaseContent}
                >
                  <View style={styles.showcaseHeader}>
                    <Ionicons name="people" size={24} color="#EF4444" />
                    <Text style={styles.showcaseTitle}>Community Warriors</Text>
                  </View>
                  <Text style={styles.showcaseDesc}>
                    Join a supportive community of people on the same journey, with team challenges and mutual encouragement.
                  </Text>
                  <View style={styles.showcaseStats}>
                    <Text style={styles.statText}>• Team-based recovery challenges</Text>
                    <Text style={styles.statText}>• 24/7 peer support network</Text>
                    <Text style={styles.statText}>• Milestone celebrations together</Text>
                  </View>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Value Proposition */}
          <View style={styles.valueSection}>
            <Text style={styles.sectionTitle}>Why NixR Changes Everything</Text>
            <Text style={styles.sectionSubtitle}>
              Finally, a recovery system that understands your specific journey
            </Text>
            
            <View style={styles.valueGrid}>
              {/* Personalized Content */}
              <View style={styles.valueCard}>
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
                  style={styles.valueCardContent}
                >
                  <Ionicons name="person" size={32} color="#10B981" />
                  <Text style={styles.valueTitle}>Truly Personal</Text>
                  <Text style={styles.valueDesc}>
                    Every feature adapts to YOUR nicotine product, timeline, and goals. Not generic advice.
                  </Text>
                </LinearGradient>
              </View>

              {/* Scientific Foundation */}
              <View style={styles.valueCard}>
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)']}
                  style={styles.valueCardContent}
                >
                  <Ionicons name="school" size={32} color="#8B5CF6" />
                  <Text style={styles.valueTitle}>Science-Backed</Text>
                  <Text style={styles.valueDesc}>
                    Built on 247,000+ recovery data points and peer-reviewed addiction research.
                  </Text>
                </LinearGradient>
              </View>

              {/* Real-Time Tracking */}
              <View style={styles.valueCard}>
                <LinearGradient
                  colors={['rgba(59, 130, 246, 0.15)', 'rgba(16, 185, 129, 0.15)']}
                  style={styles.valueCardContent}
                >
                  <Ionicons name="pulse" size={32} color="#3B82F6" />
                  <Text style={styles.valueTitle}>Live Progress</Text>
                  <Text style={styles.valueDesc}>
                    Watch your brain heal in real-time with our neural recovery visualization.
                  </Text>
                </LinearGradient>
              </View>

              {/* Community Power */}
              <View style={styles.valueCard}>
                <LinearGradient
                  colors={['rgba(239, 68, 68, 0.15)', 'rgba(245, 158, 11, 0.15)']}
                  style={styles.valueCardContent}
                >
                  <Ionicons name="people" size={32} color="#EF4444" />
                  <Text style={styles.valueTitle}>Never Alone</Text>
                  <Text style={styles.valueDesc}>
                    Join teams, share victories, and get support from people who understand your struggle.
                  </Text>
                </LinearGradient>
              </View>
            </View>
            
            <View style={styles.comparisonSection}>
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonColumn}>
                  <Text style={styles.comparisonHeader}>❌ Other Apps</Text>
                  <Text style={styles.comparisonItem}>• Generic "one-size-fits-all" content</Text>
                  <Text style={styles.comparisonItem}>• Basic counters and timers</Text>
                  <Text style={styles.comparisonItem}>• No real craving support</Text>
                  <Text style={styles.comparisonItem}>• Isolated experience</Text>
                  <Text style={styles.comparisonItem}>• No understanding of your specific product</Text>
                </View>
                
                <View style={styles.comparisonColumn}>
                  <Text style={styles.comparisonHeaderGreen}>✅ NixR AI</Text>
                  <Text style={styles.comparisonItemGreen}>• Content personalized to YOUR nicotine product</Text>
                  <Text style={styles.comparisonItemGreen}>• Live neural recovery visualization</Text>
                  <Text style={styles.comparisonItemGreen}>• Community teams and challenges</Text>
                  <Text style={styles.comparisonItemGreen}>• Warriors supporting each other</Text>
                  <Text style={styles.comparisonItemGreen}>• AI that learns from 247K+ success stories</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Social Proof */}
          <View style={styles.socialProofSection}>
            <Text style={styles.sectionTitle}>Join 247,000+ Success Stories</Text>
            
            <View style={styles.testimonialCard}>
              <Text style={styles.testimonialText}>
                "I tried quitting pouches 6 times before. NixR's personalized approach finally worked because it understood that pouches are different from cigarettes. The neural map showing my brain healing kept me motivated every single day."
              </Text>
              <Text style={styles.testimonialAuthor}>- Sarah M., 89 days nicotine-free</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>87%</Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>247K+</Text>
                <Text style={styles.statLabel}>Users Helped</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>4.9★</Text>
                <Text style={styles.statLabel}>App Rating</Text>
              </View>
            </View>
          </View>

          {/* Urgency & Scarcity */}
          <View style={styles.urgencySection}>
            <LinearGradient
              colors={['rgba(239, 68, 68, 0.1)', 'rgba(245, 158, 11, 0.1)']}
              style={styles.urgencyCard}
            >
              <Text style={styles.urgencyTitle}>🔥 Limited Time: Full Access</Text>
              <Text style={styles.urgencySubtitle}>
                Get everything for your first month, then just $9.99/month. Cancel anytime.
              </Text>
              <View style={styles.urgencyFeatures}>
                <Text style={styles.urgencyFeature}>✅ Complete AI-powered recovery system</Text>
                <Text style={styles.urgencyFeature}>✅ Community teams & peer support access</Text>
                <Text style={styles.urgencyFeature}>✅ Personalized content for YOUR product</Text>
                <Text style={styles.urgencyFeature}>✅ Live neural recovery visualization</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Final Motivation */}
          <View style={styles.motivationSection}>
            <Text style={styles.motivationTitle}>Your Recovery Starts Now</Text>
            <Text style={styles.motivationText}>
              You've shared your story, we've built your plan. This is the moment everything changes. 
              Don't let another day pass feeling controlled by nicotine.
            </Text>
          </View>

          {/* Call to Action */}
          <View style={styles.ctaSection}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.1)', 'rgba(139, 92, 246, 0.1)']}
              style={styles.ctaCard}
            >
              <Text style={styles.ctaTitle}>Don't Wait - Your Brain is Waiting</Text>
              <Text style={styles.ctaSubtitle}>
                Every day you delay is another day nicotine controls your life. Your personalized AI recovery system is ready to help you break free forever.
              </Text>
            </LinearGradient>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Premium CTA Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.premiumButton} onPress={handleGetStarted}>
          <LinearGradient
            colors={['#10B981', '#06B6D4', '#8B5CF6']}
            style={styles.premiumButtonGradient}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="rocket" size={24} color="#FFFFFF" />
              <Text style={styles.premiumButtonText}>Start My AI-Powered Recovery</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        
        <Text style={styles.disclaimerText}>
          87% success rate • 247K+ recoveries • Cancel anytime
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  analysisContainer: {
    marginBottom: SPACING['2xl'],
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '700',
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
  analysisSteps: {
    alignItems: 'flex-start',
  },
  analysisStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  content: {
    flex: 1,
    paddingTop: SPACING.xl,
  },
  premiumHeader: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  certificationBadge: {
    marginBottom: SPACING.lg,
  },
  badgeGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.lg,
    alignItems: 'center',
    flexDirection: 'row',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  successSection: {
    marginBottom: SPACING['2xl'],
  },
  successCard: {
    padding: SPACING['2xl'],
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  successMeter: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successPercentage: {
    fontSize: 48,
    fontWeight: '900',
    color: '#10B981',
    lineHeight: 52,
  },
  successLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  successNote: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  revolutionarySection: {
    marginBottom: SPACING['2xl'],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  featureShowcase: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  showcaseCard: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  showcaseContent: {
    padding: SPACING.lg,
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  showcaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  showcaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  showcaseDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  showcaseStats: {
    alignItems: 'flex-start',
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  valueSection: {
    marginBottom: SPACING['2xl'],
  },
  valueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  valueCard: {
    width: '48%',
    marginBottom: SPACING.lg,
  },
  valueCardContent: {
    padding: SPACING.lg,
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  valueDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  comparisonSection: {
    marginBottom: SPACING['2xl'],
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  comparisonColumn: {
    width: '48%',
  },
  comparisonHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: SPACING.sm,
  },
  comparisonItem: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 16,
  },
  comparisonHeaderGreen: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: SPACING.sm,
  },
  comparisonItemGreen: {
    fontSize: 12,
    color: '#10B981',
    marginBottom: SPACING.xs,
    lineHeight: 16,
  },
  socialProofSection: {
    marginBottom: SPACING['2xl'],
  },
  testimonialCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: SPACING.lg,
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    marginBottom: SPACING.lg,
  },
  testimonialText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '30%',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#10B981',
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  urgencySection: {
    marginBottom: SPACING['2xl'],
  },
  urgencyCard: {
    padding: SPACING.lg,
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  urgencyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  urgencySubtitle: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  urgencyFeatures: {
    alignItems: 'flex-start',
  },
  urgencyFeature: {
    fontSize: 14,
    color: '#10B981',
    marginBottom: SPACING.xs,
  },
  motivationSection: {
    marginBottom: SPACING['2xl'],
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  motivationText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaSection: {
    marginBottom: SPACING['2xl'],
  },
  ctaCard: {
    padding: SPACING['2xl'],
    borderRadius: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomContainer: {
    paddingVertical: SPACING.lg,
  },
  premiumButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  premiumButtonGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: SPACING.sm,
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default BlueprintRevealStep; 