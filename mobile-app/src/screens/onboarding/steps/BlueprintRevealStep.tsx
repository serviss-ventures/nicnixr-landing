import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
  Dimensions,
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BlueprintRevealStep: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const onboardingData = useSelector((state: RootState) => selectOnboardingData(state));
  const { successProbability = 85 } = onboardingData;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered reveal animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.95,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

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
          {/* Clean Success Indicator */}
          <View style={styles.successIndicator}>
            <Text style={styles.successRate}>{successProbability}%</Text>
            <Text style={styles.successLabel}>Success Probability</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Your Recovery Blueprint</Text>
            <Text style={styles.subtitle}>
              Personalized for quitting {productName.toLowerCase()}
            </Text>
          </View>

          {/* Key Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${yearlySavings.toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Yearly Savings</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>24hr</Text>
              <Text style={styles.metricLabel}>Health Tracking</Text>
            </View>
          </View>

          {/* Core Features - Compact */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureRow}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="pulse" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Real-Time Health Recovery</Text>
                <Text style={styles.featureDescription}>
                  Track your body's recovery progress 24/7
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="people" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Matched Buddy System</Text>
                <Text style={styles.featureDescription}>
                  Connect with {productName.toLowerCase()} quitters like you
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="sparkles" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>AI Recovery Coach</Text>
                <Text style={styles.featureDescription}>
                  Personalized insights & craving predictions
                </Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="trophy" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Milestone Rewards</Text>
                <Text style={styles.featureDescription}>
                  Unlock achievements & celebrate progress
                </Text>
              </View>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaContainer}>
            <Animated.View style={{ transform: [{ scale: buttonScaleAnim }], width: '100%' }}>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={handleComplete}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.ctaGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.ctaText}>Start Your Journey</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.trustSignals}>
              <Text style={styles.trustText}>Free for 7 days</Text>
              <Text style={styles.trustDivider}>•</Text>
              <Text style={styles.trustText}>Cancel anytime</Text>
            </View>
          </View>
        </Animated.View>
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
    paddingBottom: 16,
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
  content: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: 'space-between',
  },
  successIndicator: {
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT < 700 ? 8 : 16,
  },
  successRate: {
    fontSize: 48,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  successLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT < 700 ? 16 : 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: SCREEN_HEIGHT < 700 ? 20 : 32,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  featuresContainer: {
    marginTop: SCREEN_HEIGHT < 700 ? 20 : 32,
    gap: SCREEN_HEIGHT < 700 ? 16 : 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139,92,246,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 18,
  },
  ctaContainer: {
    marginTop: SCREEN_HEIGHT < 700 ? 24 : 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
    letterSpacing: -0.3,
  },
  trustSignals: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  trustText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  trustDivider: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
});

export default BlueprintRevealStep; 