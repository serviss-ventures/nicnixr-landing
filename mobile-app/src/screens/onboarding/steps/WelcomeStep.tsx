import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, StatusBar, Platform, SafeAreaView } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { nextStep } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
  const translateY = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    // Elegant entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
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

        {/* Content */}
        <Animated.View 
          style={[
            styles.content,
            { 
              opacity: fadeAnim,
              transform: [{ translateY }]
            }
          ]}
        >
          {/* Top Section */}
          <View style={styles.topSection}>
            {/* Minimal Logo */}
            <View style={styles.logoSection}>
              <View style={styles.logoMark}>
                <Ionicons name="shield-checkmark" size={28} color={COLORS.primary} />
              </View>
            </View>

            {/* Hero Statement */}
            <View style={styles.heroSection}>
              <Text style={styles.heroText}>
                Freedom from nicotine{'\n'}starts with understanding
              </Text>
              
              <Text style={styles.subText}>
                We'll create your personalized recovery{'\n'}path in under 5 minutes.
              </Text>
            </View>
          </View>

          {/* Middle Section - Product Grid */}
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
                <Text style={styles.productName}>Chew/Dip</Text>
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
              <Text style={styles.continueText}>Begin</Text>
            </TouchableOpacity>
            
            <Text style={styles.privacyText}>
              Private • Personalized • Science-based
            </Text>
          </View>
        </Animated.View>
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
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    width: '11.1%', // 1/9 steps
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroText: {
    fontSize: 32,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  subText: {
    fontSize: 17,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  productGrid: {
    marginVertical: 20,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  productItem: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  productIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
    letterSpacing: -0.1,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 80,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 20,
  },
  continueText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  privacyText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textMuted,
    letterSpacing: 0.2,
  },
});

export default WelcomeStep; 