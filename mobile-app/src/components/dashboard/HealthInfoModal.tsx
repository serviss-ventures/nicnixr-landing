import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../constants/theme';
import * as Progress from 'react-native-progress';
import * as Haptics from 'expo-haptics';

interface HealthInfoModalProps {
  visible: boolean;
  onClose: () => void;
  healthScore: number;
}

const healthMilestones = [
  { score: 5, title: "Heart Rate Normalizes", description: "Your resting heart rate returns to normal", icon: 'heart-outline' },
  { score: 15, title: "Oxygen Levels Restored", description: "Blood oxygen saturation improves", icon: 'fitness-outline' },
  { score: 30, title: "Lungs Begin to Clear", description: "Airways open up and breathing improves", icon: 'leaf-outline' },
  { score: 50, title: "Heart Attack Risk Halved", description: "Cardiovascular system strengthens", icon: 'shield-checkmark-outline' },
  { score: 75, title: "Cancer Risk Reduces", description: "Cell damage reverses significantly", icon: 'body-outline' },
  { score: 100, title: "Full System Recovery", description: "Your body has healed remarkably", icon: 'star-outline' }
];

const HealthInfoModal: React.FC<HealthInfoModalProps> = ({ visible, onClose, healthScore: rawHealthScore }) => {
  const [slideAnimation] = useState(new Animated.Value(0));
  const healthScore = Math.round(rawHealthScore || 0);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnimation, {
        toValue: 1,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      }).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      slideAnimation.setValue(0);
    }
  }, [visible]);

  const getPhase = (score: number) => {
    if (score < 30) return { name: 'Initial Healing', color: '#10B981' };
    if (score < 75) return { name: 'System Recovery', color: '#3B82F6' };
    return { name: 'Risk Reduction', color: '#8B5CF6' };
  };

  const currentPhase = getPhase(healthScore);
  const nextMilestone = healthMilestones.find(m => m.score > healthScore);
  const achievedMilestones = healthMilestones.filter(m => m.score <= healthScore);
  const recentAchievements = achievedMilestones.slice(-2); // Show last 2 achieved

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle={Platform.OS === 'ios' ? 'formSheet' : 'pageSheet'} 
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient colors={['#000000', '#0A0F1C']} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea}>
            {/* Minimal Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Animated.View 
              style={[
                styles.contentContainer,
                {
                  opacity: slideAnimation,
                  transform: [{
                    translateY: slideAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }]
                }
              ]}
            >
              <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
                scrollEnabled={false}
              >
                {/* Health Score Hero */}
                <View style={styles.heroSection}>
                  <Text style={styles.heroLabel}>Recovery Score</Text>
                  <View style={styles.scoreContainer}>
                    <Progress.Circle
                      size={140}
                      progress={healthScore / 100}
                      thickness={6}
                      color={currentPhase.color}
                      unfilledColor="rgba(255, 255, 255, 0.06)"
                      borderWidth={0}
                      showsText={false}
                    />
                    <View style={styles.scoreTextOverlay}>
                      <Text style={styles.scoreValue}>{healthScore}</Text>
                      <Text style={styles.scoreUnit}>%</Text>
                    </View>
                  </View>
                  <Text style={styles.phaseText}>{currentPhase.name}</Text>
                </View>

                {/* Progress Summary */}
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>{achievedMilestones.length}</Text>
                      <Text style={styles.summaryLabel}>milestones reached</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>
                        {nextMilestone ? `${nextMilestone.score - healthScore}%` : '0%'}
                      </Text>
                      <Text style={styles.summaryLabel}>to next milestone</Text>
                    </View>
                  </View>
                </View>

                {/* Milestones Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Your Journey</Text>
                  
                  {/* Next Milestone */}
                  {nextMilestone && (
                    <View style={[styles.milestoneCard, styles.nextMilestoneCard]}>
                      <View style={styles.milestoneIcon}>
                        <Ionicons name={nextMilestone.icon as any} size={20} color={currentPhase.color} />
                      </View>
                      <View style={styles.milestoneContent}>
                        <View style={styles.milestoneHeader}>
                          <Text style={styles.milestoneTitle}>{nextMilestone.title}</Text>
                          <Text style={styles.milestoneScore}>at {nextMilestone.score}%</Text>
                        </View>
                        <Text style={styles.milestoneDescription}>{nextMilestone.description}</Text>
                      </View>
                    </View>
                  )}

                  {/* Recent Achievements */}
                  {recentAchievements.map((milestone) => (
                    <View key={milestone.title} style={styles.milestoneCard}>
                      <View style={[styles.milestoneIcon, styles.achievedIcon]}>
                        <Ionicons name="checkmark" size={16} color="#10B981" />
                      </View>
                      <View style={styles.milestoneContent}>
                        <View style={styles.milestoneHeader}>
                          <Text style={[styles.milestoneTitle, styles.achievedTitle]}>{milestone.title}</Text>
                          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        </View>
                        <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Motivational Note */}
                <View style={styles.motivationCard}>
                  <Ionicons name="heart-outline" size={16} color="#EC4899" />
                  <Text style={styles.motivationText}>
                    Your body is healing and recovering every single day
                  </Text>
                </View>
              </ScrollView>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: SPACING.md,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  heroLabel: {
    fontSize: FONTS.sm,
    fontWeight: '500',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.lg,
  },
  scoreContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreTextOverlay: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: FONTS['4xl'],
    fontWeight: '300',
    color: COLORS.text,
    letterSpacing: -1,
  },
  scoreUnit: {
    fontSize: FONTS.xl,
    fontWeight: '300',
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  phaseText: {
    fontSize: FONTS.base,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: SPACING.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  summaryValue: {
    fontSize: FONTS.xl,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: FONTS.xs,
    fontWeight: '400',
    color: COLORS.textMuted,
    textTransform: 'lowercase',
  },

  // Section
  section: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: FONTS.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },

  // Milestone Cards
  milestoneCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: SPACING.sm,
  },
  nextMilestoneCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  milestoneIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  achievedIcon: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  milestoneTitle: {
    fontSize: FONTS.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  achievedTitle: {
    color: COLORS.textSecondary,
  },
  milestoneScore: {
    fontSize: FONTS.xs,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
  milestoneDescription: {
    fontSize: FONTS.xs,
    fontWeight: '400',
    color: COLORS.textMuted,
    lineHeight: 16,
  },

  // Motivation Card
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.15)',
  },
  motivationText: {
    fontSize: FONTS.sm,
    color: COLORS.text,
    fontWeight: '400',
    marginLeft: SPACING.sm,
    flex: 1,
    textAlign: 'center',
  },
});

export default HealthInfoModal; 