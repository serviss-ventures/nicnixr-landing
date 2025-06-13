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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { completeOnboarding, selectOnboardingData } from '../../../store/slices/onboardingSlice';
import { setUser } from '../../../store/slices/authSlice';
import { RootState } from '../../../store/store';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../../navigation/types';
import * as Haptics from 'expo-haptics';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BlueprintRevealStep: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const onboardingData = useSelector((state: RootState) => selectOnboardingData(state));
  const { successProbability = 85 } = onboardingData;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

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

  const handleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Create user from onboarding data
    const user = {
      id: `user_${Date.now()}`,
      email: onboardingData.email || `user_${Date.now()}@nixr.app`,
      username: onboardingData.firstName || 'NixR User',
      firstName: onboardingData.firstName || '',
      lastName: onboardingData.lastName || '',
      gender: onboardingData.gender || 'prefer-not-to-say',
      dateJoined: new Date().toISOString(),
      quitDate: onboardingData.quitDate || new Date().toISOString(),
      nicotineProduct: onboardingData.nicotineProduct || {
        id: 'pouches',
        name: 'Nicotine Pouches',
        avgCostPerDay: 10,
        nicotineContent: 0,
        category: 'pouches' as const,
        harmLevel: 5,
      },
      dailyCost: onboardingData.dailyCost || 10,
      packagesPerDay: onboardingData.packagesPerDay || 1,
      podsPerDay: onboardingData.podsPerDay,
      tinsPerDay: onboardingData.tinsPerDay,
      dailyAmount: onboardingData.dailyAmount,
      motivationalGoals: onboardingData.reasonsToQuit || [],
      isAnonymous: !onboardingData.email,
    };
    
    // Set the user in auth state
    dispatch(setUser(user));
    
    // Complete onboarding
    dispatch(completeOnboarding());
    
    // Navigate to main app
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
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
                <Ionicons name="checkmark" size={32} color="#10B981" />
              </View>
            </View>

            {/* Header - Simplified */}
            <View style={styles.header}>
              <Text style={styles.title}>You're all set</Text>
              <Text style={styles.subtitle}>
                Your personalized recovery plan is ready
              </Text>
            </View>

            {/* Key Info - Minimal Grid */}
            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <Ionicons name="trending-up-outline" size={18} color="#10B981" />
                  <Text style={styles.infoValue}>{successProbability}%</Text>
                </View>
                <Text style={styles.infoLabel}>Success Rate</Text>
              </View>
              
              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <Ionicons name="cash-outline" size={18} color="#EC4899" />
                  <Text style={styles.infoValue}>${Math.round(yearlySavings/1000)}k</Text>
                </View>
                <Text style={styles.infoLabel}>Annual Savings</Text>
              </View>
            </View>

            {/* What's Included - Ultra Minimal */}
            <View style={styles.includedSection}>
              <Text style={styles.includedTitle}>What you get</Text>
              
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>24/7 AI recovery coach</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>Real-time health tracking</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>Matched buddy support</Text>
                </View>
                
                <View style={styles.featureItem}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>Progress milestones</Text>
                </View>
              </View>
            </View>

            {/* CTA Section - Clean */}
            <View style={styles.ctaContainer}>
              <Animated.View style={{ transform: [{ scale: buttonScaleAnim }], width: '100%' }}>
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={handleComplete}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  activeOpacity={1}
                >
                  <View style={styles.ctaContent}>
                    <Text style={styles.ctaText}>Begin Recovery</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </Animated.View>

              <Text style={styles.disclaimer}>
                Start free • No credit card required
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
    backgroundColor: 'rgba(16, 185, 129, 0.5)',
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
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
  
  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    fontSize: FONTS.xl,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  infoLabel: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    fontWeight: '400',
    textAlign: 'center',
    textTransform: 'lowercase',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
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
  disclaimer: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    fontWeight: '400',
  },
});

export default BlueprintRevealStep; 