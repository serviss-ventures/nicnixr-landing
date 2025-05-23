import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { updateProgress } from '../../store/slices/progressSlice';
import { COLORS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.progress);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    dispatch(updateProgress());
    
    // Pulse animation for the main circle
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
  }, [dispatch]);

  return (
    <LinearGradient
      colors={['#000000', '#0F172A', '#1E293B']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header with Marketing Site Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoTextNic}>NIC</Text>
              <View style={styles.logoNixContainer}>
                <Text style={styles.logoTextNix}>NIX</Text>
                <LinearGradient
                  colors={['#10B981', '#06B6D4']}
                  style={styles.logoSlash}
                />
              </View>
              <Text style={styles.logoTextR}>R</Text>
            </View>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.3)', 'rgba(6, 182, 212, 0.3)']}
              style={styles.logoUnderline}
            />
          </View>
        </View>

        {/* MASSIVE Progress Circle - BEATING QUITTR */}
        <View style={styles.mainProgressSection}>
          <Animated.View style={[styles.progressCircleContainer, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={['#10B981', '#06B6D4', '#8B5CF6', '#EC4899']}
              style={styles.progressCircleOuter}
            >
              <View style={styles.progressCircleInner}>
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.1)', 'rgba(139, 92, 246, 0.1)']}
                  style={styles.progressCircleBackground}
                >
                  <Text style={styles.mainProgressNumber}>{stats.daysClean}</Text>
                  <Text style={styles.mainProgressLabel}>Days Strong</Text>
                  <Text style={styles.mainProgressSubtext}>
                    {Math.floor(stats.hoursClean)}h {Math.floor(stats.minutesClean % 60)}m clean
                  </Text>
                </LinearGradient>
              </View>
            </LinearGradient>
          </Animated.View>
          
          {/* Health Score Ring */}
          <View style={styles.healthScoreContainer}>
            <Text style={styles.healthScoreText}>{Math.round(stats.healthScore)}% Recovered</Text>
          </View>
        </View>

        {/* Premium Stats Grid - Glassmorphism */}
        <View style={styles.statsGrid}>
          {/* Money Saved */}
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
            style={styles.statCard}
          >
            <View style={styles.statCardInner}>
              <Ionicons name="cash-outline" size={24} color="#10B981" />
              <Text style={styles.statValue}>${Math.round(stats.moneySaved)}</Text>
              <Text style={styles.statLabel}>Money Saved</Text>
            </View>
          </LinearGradient>

          {/* Life Regained */}
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)']}
            style={styles.statCard}
          >
            <View style={styles.statCardInner}>
              <Ionicons name="time-outline" size={24} color="#8B5CF6" />
              <Text style={styles.statValue}>{Math.round(stats.lifeRegained)}h</Text>
              <Text style={styles.statLabel}>Life Regained</Text>
            </View>
          </LinearGradient>

          {/* Cigarettes Avoided */}
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.15)', 'rgba(16, 185, 129, 0.15)']}
            style={styles.statCard}
          >
            <View style={styles.statCardInner}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#3B82F6" />
              <Text style={styles.statValue}>{stats.cigarettesAvoided}</Text>
              <Text style={styles.statLabel}>Avoided</Text>
            </View>
          </LinearGradient>

          {/* Streak */}
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.15)', 'rgba(239, 68, 68, 0.15)']}
            style={styles.statCard}
          >
            <View style={styles.statCardInner}>
              <Ionicons name="flame-outline" size={24} color="#F59E0B" />
              <Text style={styles.statValue}>{stats.streakDays}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Premium Action Buttons */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          {/* Shield Mode - Premium */}
          <TouchableOpacity style={styles.primaryActionButton}>
            <LinearGradient
              colors={['#1E40AF', '#3B82F6', '#06B6D4']}
              style={styles.primaryActionGradient}
            >
              <View style={styles.actionButtonContent}>
                <Ionicons name="shield" size={28} color="#FFFFFF" />
                <View style={styles.actionTextContainer}>
                  <Text style={styles.primaryActionText}>Shield Mode</Text>
                  <Text style={styles.primaryActionSubtext}>Instant craving support</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary Actions */}
          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity style={styles.secondaryActionButton}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
                style={styles.secondaryActionGradient}
              >
                <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
                <Text style={styles.secondaryActionText}>Daily Check-in</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryActionButton}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
                style={styles.secondaryActionGradient}
              >
                <Ionicons name="people-outline" size={24} color="#8B5CF6" />
                <Text style={styles.secondaryActionText}>Community</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Motivation Card */}
        <LinearGradient
          colors={['rgba(245, 158, 11, 0.1)', 'rgba(239, 68, 68, 0.1)']}
          style={styles.motivationCard}
        >
          <View style={styles.motivationContent}>
            <LinearGradient
              colors={['#F59E0B', '#EF4444']}
              style={styles.motivationIcon}
            >
              <Ionicons name="star" size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.motivationText}>
              "Every moment without nicotine is a victory. You're rewriting your story, one breath at a time."
            </Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING['3xl'],
    paddingBottom: SPACING['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  logoTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTextNic: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  logoNixContainer: {
    position: 'relative',
    marginHorizontal: 2,
  },
  logoTextNix: {
    fontSize: 26,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: -0.5,
  },
  logoTextR: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  logoSlash: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2.5,
    transform: [{ translateY: -1.5 }, { rotate: '-12deg' }],
    borderRadius: 1,
  },
  logoUnderline: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 1,
    borderRadius: 0.5,
  },
  mainProgressSection: {
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  progressCircleContainer: {
    marginBottom: SPACING.lg,
  },
  progressCircleOuter: {
    width: 280,
    height: 280,
    borderRadius: 140,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleInner: {
    width: 268,
    height: 268,
    borderRadius: 134,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 134,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainProgressNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -3,
  },
  mainProgressLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: SPACING.xs,
  },
  mainProgressSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: SPACING.xs,
  },
  healthScoreContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  healthScoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#06B6D4',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING['2xl'],
  },
  statCard: {
    width: '48%',
    marginBottom: SPACING.lg,
    borderRadius: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statCardInner: {
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: SPACING.xl,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: SPACING['2xl'],
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  primaryActionButton: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.xl,
    overflow: 'hidden',
  },
  primaryActionGradient: {
    borderRadius: SPACING.xl,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  primaryActionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  primaryActionSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryActionButton: {
    width: '48%',
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  secondaryActionGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  motivationCard: {
    borderRadius: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  motivationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: SPACING.xl,
  },
  motivationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  motivationText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 22,
  },
});

export default DashboardScreen; 