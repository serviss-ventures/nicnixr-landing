import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { completeOnboarding, selectOnboardingData } from '../../../store/slices/onboardingSlice';
import { setUser } from '../../../store/slices/authSlice';
import { RootState } from '../../../store/store';
import { COLORS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const BlueprintRevealStep: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const onboardingData = useSelector((state: RootState) => selectOnboardingData(state));
  const { successProbability = 85 } = onboardingData;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initial reveal animation
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
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for CTA button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleComplete = () => {
    // Create user from onboarding data
    const user = {
      id: `user_${Date.now()}`,
      email: onboardingData.email || `user_${Date.now()}@nixr.app`,
      username: onboardingData.firstName || 'NixR User',
      firstName: onboardingData.firstName || '',
      lastName: onboardingData.lastName || '',
      dateJoined: new Date().toISOString(),
      quitDate: onboardingData.quitDate || new Date().toISOString(),
      nicotineProduct: onboardingData.nicotineProduct || {
        id: 'other',
        name: 'Nicotine Product',
        avgCostPerDay: 10,
        nicotineContent: 0,
        category: 'other' as const,
        harmLevel: 5,
      },
      dailyCost: onboardingData.dailyCost || 10,
      packagesPerDay: onboardingData.packagesPerDay || 1,
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
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              style={styles.progressFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.progressText}>Complete</Text>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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
            {/* Success Badge */}
            <View style={styles.successBadge}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.badgeGradient}
              >
                <Text style={styles.successRate}>{successProbability}%</Text>
                <Text style={styles.successLabel}>Success Rate</Text>
              </LinearGradient>
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Your Personal Blueprint</Text>
              <Text style={styles.subtitle}>
                Based on your profile, we've created a custom recovery plan with an {successProbability}% success probability
              </Text>
            </View>

            {/* Personalized Insights */}
            <View style={styles.insightsContainer}>
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Ionicons name="trending-up" size={20} color="#10B981" />
                  <Text style={styles.insightTitle}>Financial Freedom</Text>
                </View>
                <Text style={styles.insightValue}>${yearlySavings}</Text>
                <Text style={styles.insightLabel}>saved per year</Text>
              </View>

              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <Ionicons name="heart" size={20} color="#EF4444" />
                  <Text style={styles.insightTitle}>Health Recovery</Text>
                </View>
                <Text style={styles.insightValue}>20%</Text>
                <Text style={styles.insightLabel}>better in 24 hours</Text>
              </View>
            </View>

            {/* Key Features */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Your Recovery Toolkit</Text>
              
              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name="shield-checkmark" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>AI Craving Predictor</Text>
                  <Text style={styles.featureDescription}>
                    Alerts you 30 minutes before cravings typically hit
                  </Text>
                </View>
              </View>

              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name="people" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>24/7 Support Network</Text>
                  <Text style={styles.featureDescription}>
                    Connect with {productName} quitters who understand
                  </Text>
                </View>
              </View>

              <View style={styles.feature}>
                <View style={styles.featureIcon}>
                  <Ionicons name="trophy" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Milestone Rewards</Text>
                  <Text style={styles.featureDescription}>
                    Unlock achievements and track your progress
                  </Text>
                </View>
              </View>
            </View>

            {/* CTA Section */}
            <View style={styles.ctaContainer}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={handleComplete}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.ctaGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.ctaText}>Start Free Trial</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <View style={styles.trialInfo}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.trialText}>7 days free • No credit card required</Text>
              </View>

              <Text style={styles.disclaimer}>
                Join 50,000+ people who quit successfully
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 40,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1.5,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '100%',
  },
  progressText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
  },
  successBadge: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  badgeGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successRate: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  insightsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  insightCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  insightValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  insightLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139,92,246,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
  },
  ctaContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  trialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  trialText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  disclaimer: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
  },
});

export default BlueprintRevealStep; 