import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, StatusBar, Platform, SafeAreaView, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { nextStep } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

/**
 * WelcomeStep Component - Elegant Introduction
 * 
 * Minimal, powerful design inspired by Apple and Tesla's aesthetic
 * Clean typography, purposeful spacing, and subtle animations
 */
const WelcomeStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Subtle fade animation only
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  useEffect(() => {
    // Elegant entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(nextStep());
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Gradient background matching the app */}
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Progress Bar at Top */}
        <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressText}>Step 1 of 9</Text>
        </Animated.View>

        {/* Scrollable Content */}
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
                transform: [{ translateY }]
              }
            ]}
          >
            {/* Logo and Hero */}
            <View style={styles.topSection}>
              {/* Minimal Logo */}
              <View style={styles.logoMark}>
                <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
              </View>

              {/* Hero Statement */}
              <Text style={styles.heroText}>
                Freedom from nicotine{'\n'}starts with understanding
              </Text>
              
              <Text style={styles.subText}>
                We'll create your personalized recovery path in under 2 minutes
              </Text>
            </View>

            {/* Product Grid - Compact */}
            <View style={styles.productGrid}>
              <View style={styles.productRow}>
                <View style={styles.productItem}>
                  <View style={styles.productIcon}>
                    <Ionicons name="flame-outline" size={28} color={COLORS.textSecondary} />
                  </View>
                  <Text style={styles.productName}>Cigarettes</Text>
                </View>
                <View style={styles.productItem}>
                  <View style={styles.productIcon}>
                    <Ionicons name="cloud-outline" size={28} color={COLORS.textSecondary} />
                  </View>
                  <Text style={styles.productName}>Vaping</Text>
                </View>
              </View>
              <View style={styles.productRow}>
                <View style={styles.productItem}>
                  <View style={styles.productIcon}>
                    <Ionicons name="ellipse-outline" size={28} color={COLORS.textSecondary} />
                  </View>
                  <Text style={styles.productName}>Pouches</Text>
                </View>
                <View style={styles.productItem}>
                  <View style={styles.productIcon}>
                    <Ionicons name="leaf-outline" size={28} color={COLORS.textSecondary} />
                  </View>
                  <Text style={styles.productName}>Chew</Text>
                </View>
              </View>
            </View>

            {/* Bottom Action */}
            <View style={styles.bottomSection}>
              <TouchableOpacity 
                style={styles.continueButton} 
                onPress={handleContinue}
                activeOpacity={0.7}
              >
                <Text style={styles.continueText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.text} />
              </TouchableOpacity>
              
              <Text style={styles.privacyText}>
                Private • Personalized • Science-based
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    width: '11.1%', // 1/9 steps
    height: '100%',
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
    paddingBottom: SPACING.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl * 1.5,
    paddingTop: SPACING.sm,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  heroText: {
    fontSize: FONTS['2xl'],
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: SPACING.sm,
  },
  subText: {
    fontSize: FONTS.sm,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: -0.1,
    paddingHorizontal: SPACING.md,
  },
  productGrid: {
    marginVertical: SPACING.lg,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  productItem: {
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
  },
  productIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  productName: {
    fontSize: FONTS.sm,
    fontWeight: '400',
    color: COLORS.textMuted,
    letterSpacing: 0.1,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: SPACING.md,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.xl * 2,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  continueText: {
    fontSize: FONTS.base,
    fontWeight: '500',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  privacyText: {
    fontSize: FONTS.xs,
    fontWeight: '400',
    color: COLORS.textMuted,
    letterSpacing: 0.1,
  },
});

export default WelcomeStep; 