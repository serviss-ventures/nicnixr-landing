import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { selectOnboardingData } from '../../../store/slices/onboardingSlice';
import { completeOnboarding } from '../../../store/slices/authSlice';
import { RootState } from '../../../store/store';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../../navigation/types';
import * as Haptics from 'expo-haptics';
import subscriptionService from '../../../services/subscriptionService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BlueprintRevealStep: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const onboardingData = useSelector((state: RootState) => selectOnboardingData(state));
  const { successProbability = 85 } = onboardingData;
  
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Gentle reveal animation
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 10,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.98,
      friction: 10,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      friction: 10,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  const handleComplete = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Simulate a smooth processing delay for testing
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    try {
      // Initialize subscription service
      await subscriptionService.initialize();
      const result = await subscriptionService.startFreeTrial();
      
      // For development only - simulate successful subscription if no Revenuecat key
      // const result = { success: true };
      
      if (result.success) {
        // Show success state
        setShowSuccess(true);
        
        // Subtle success haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Animate success state
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
        
        // Brief pause to show success
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Don't create a new user - the user already exists from anonymous auth!
        // Just complete onboarding with the collected data
        const result = await dispatch(completeOnboarding(onboardingData));
        
        if (completeOnboarding.rejected.match(result)) {
          throw new Error(result.payload as string || 'Failed to complete onboarding');
        }
        
        // Smooth fade out before navigation
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          // Navigate to main app
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error:', error);
    }
  };

  // Calculate personalized stats
  const dailySavings = onboardingData.dailyCost || 10;
  const yearlySavings = Math.round(dailySavings * 365);
  const productName = onboardingData.nicotineProduct?.name || 'nicotine';

  return (
    <LinearGradient
      colors={['#000000', '#0A0F1C', '#0F172A']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Minimal Progress Complete */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressText}>Setup Complete</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ],
              },
            ]}
          >
            {/* Completion Icon */}
            <View style={styles.completionIcon}>
              <View style={styles.iconCircle}>
                <Ionicons name="checkmark" size={32} color={COLORS.primary} />
              </View>
            </View>

            {/* Header - Simplified */}
            <View style={styles.header}>
              <Text style={styles.title}>You're all set</Text>
              <Text style={styles.subtitle}>
                Your personalized recovery plan is ready
              </Text>
            </View>

            {/* Key Stats - Clear & Meaningful */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>${dailySavings}</Text>
                <Text style={styles.statLabel}>saved daily</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{Math.round(onboardingData.dailyAmount || 10)}</Text>
                <Text style={styles.statLabel}>
                  {productName.toLowerCase().replace('nicotine pouches', 'pouches').replace('e-cigarettes', 'vapes')} avoided
                </Text>
              </View>
            </View>

            {/* What's Included - Clear Benefits */}
            <View style={styles.includedSection}>
              <Text style={styles.includedTitle}>Your recovery toolkit</Text>
              
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>Track health improvements in real-time</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>Get instant support when cravings hit</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>Celebrate milestones with your community</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>See money saved grow every day</Text>
                </View>
              </View>
            </View>

            {/* CTA Section - Clean */}
            <View style={styles.ctaContainer}>
              <Animated.View style={{ transform: [{ scale: buttonScaleAnim }], width: '100%' }}>
                <TouchableOpacity
                  style={[
                    styles.ctaButton, 
                    isLoading && styles.ctaButtonDisabled,
                    showSuccess && styles.ctaButtonSuccess
                  ]}
                  onPress={handleComplete}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  activeOpacity={1}
                  disabled={isLoading}
                >
                  <View style={styles.ctaContent}>
                    {showSuccess ? (
                      <Animated.View style={[
                        styles.successContent,
                        { opacity: successOpacity }
                      ]}>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        <Text style={styles.ctaText}>Welcome to Recovery</Text>
                      </Animated.View>
                    ) : isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.ctaText}>Begin Recovery</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>

              <Text style={styles.disclaimer}>
                {/* 3 days free • Then $4.99/month */}
                Premium recovery experience
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  progressContainer: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.xl * 2,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 1,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
    borderRadius: 1,
  },
  progressText: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl * 2,
    paddingTop: SPACING.md,
  },
  
  // Completion Icon
  completionIcon: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS['2xl'],
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
  },
  
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS['2xl'],
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -0.5,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '300',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: SPACING.lg,
  },
  
  // Included Section
  includedSection: {
    marginBottom: SPACING.xl * 1.5,
  },
  includedTitle: {
    fontSize: FONTS.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  featuresList: {
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
  },
  featureText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  
  // CTA Section
  ctaContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    overflow: 'hidden',
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaButtonSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  ctaText: {
    fontSize: FONTS.base,
    fontWeight: '500',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  disclaimer: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    fontWeight: '400',
  },
});

export default BlueprintRevealStep; 