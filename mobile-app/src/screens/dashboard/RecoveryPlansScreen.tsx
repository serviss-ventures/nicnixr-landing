import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';

interface RecoveryPlan {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradientColors: string[];
  duration: string;
  goals: string[];
}

const RecoveryPlansScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const recoveryPlans: RecoveryPlan[] = [
    {
      id: 'craving-control',
      title: 'Craving Control',
      description: 'Master urge management with proven techniques, breathing exercises, and instant coping strategies.',
      icon: 'shield-checkmark',
      color: '#EF4444',
      gradientColors: ['#EF4444', '#DC2626'],
      duration: '2-4 weeks',
      goals: ['5-4-3-2-1 grounding technique', 'Breathing mastery', 'Trigger identification', 'Emergency coping kit']
    },
    {
      id: 'energy-rebuild',
      title: 'Energy Rebuild',
      description: 'Restore natural energy and mental clarity without nicotine dependence.',
      icon: 'flash',
      color: '#10B981',
      gradientColors: ['#10B981', '#059669'],
      duration: '3-6 weeks',
      goals: ['Sleep optimization', 'Natural energy boosters', 'Focus training', 'Fatigue management']
    },
    {
      id: 'stress-recovery',
      title: 'Stress Recovery',
      description: 'Build healthy stress management habits to replace nicotine as your go-to coping mechanism.',
      icon: 'leaf',
      color: '#06B6D4',
      gradientColors: ['#06B6D4', '#0891B2'],
      duration: '4-8 weeks',
      goals: ['Mindfulness practice', 'Stress reframing', 'Relaxation techniques', 'Emotional regulation']
    },
    {
      id: 'habit-replacement',
      title: 'Habit Replacement',
      description: 'Replace smoking moments with positive alternatives that satisfy your behavioral patterns.',
      icon: 'refresh',
      color: '#8B5CF6',
      gradientColors: ['#8B5CF6', '#7C3AED'],
      duration: '2-6 weeks',
      goals: ['Trigger mapping', 'Healthy swaps', 'Routine redesign', 'Habit stacking']
    },
    {
      id: 'confidence-boost',
      title: 'Social Confidence',
      description: 'Navigate social situations and peer pressure with confidence and authenticity.',
      icon: 'people',
      color: '#F59E0B',
      gradientColors: ['#F59E0B', '#D97706'],
      duration: '3-5 weeks',
      goals: ['Conversation skills', 'Peer pressure tactics', 'Self-advocacy', 'Social identity']
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleStartPlan = () => {
    if (!selectedPlan) {
      Alert.alert('Select a Plan', 'Please choose a recovery plan to get started.');
      return;
    }
    
    const plan = recoveryPlans.find(p => p.id === selectedPlan);
    Alert.alert(
      'Plan Selected!',
      `You've chosen the ${plan?.title} plan. This feature will be available soon with personalized goals and tracking.`,
      [{ text: 'Got it!', style: 'default' }]
    );
  };

  const renderPlanCard = (plan: RecoveryPlan) => (
    <TouchableOpacity
      key={plan.id}
      style={[
        styles.planCard,
        selectedPlan === plan.id && styles.selectedPlanCard
      ]}
      onPress={() => handlePlanSelect(plan.id)}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={selectedPlan === plan.id ? plan.gradientColors : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
        style={styles.planGradient}
      >
        <View style={styles.planHeader}>
          <View style={[styles.planIcon, { backgroundColor: plan.color }]}>
            <Ionicons name={plan.icon as any} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.planTitleSection}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planDuration}>{plan.duration}</Text>
          </View>
          {selectedPlan === plan.id && (
            <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
          )}
        </View>
        
        <Text style={styles.planDescription}>{plan.description}</Text>
        
        <View style={styles.goalsSection}>
          <Text style={styles.goalsTitle}>Key Goals:</Text>
          {plan.goals.slice(0, 2).map((goal, index) => (
            <View key={index} style={styles.goalItem}>
              <View style={styles.goalBullet} />
              <Text style={styles.goalText}>{goal}</Text>
            </View>
          ))}
          {plan.goals.length > 2 && (
            <Text style={styles.moreGoals}>+{plan.goals.length - 2} more goals</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recovery Plans</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Choose Your Recovery Path</Text>
          <Text style={styles.heroSubtitle}>
            Select a focused plan to build targeted skills and achieve lasting freedom from nicotine. 
            Each plan is designed with proven strategies for your recovery journey.
          </Text>
        </View>

        {/* Plans Section */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>CHOOSE A PLAN</Text>
          {recoveryPlans.map(renderPlanCard)}
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.startButton,
              !selectedPlan && styles.startButtonDisabled
            ]}
            onPress={handleStartPlan}
            disabled={!selectedPlan}
          >
            <LinearGradient
              colors={selectedPlan ? [COLORS.primary, '#059669'] : ['#374151', '#374151']}
              style={styles.startButtonGradient}
            >
              <Text style={[
                styles.startButtonText,
                !selectedPlan && styles.startButtonTextDisabled
              ]}>
                Start My Plan
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={20} 
                color={selectedPlan ? "#FFFFFF" : "#9CA3AF"} 
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.md,
    lineHeight: 36,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textMuted,
    lineHeight: 24,
  },
  plansSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: SPACING.lg,
  },
  planCard: {
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedPlanCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  planGradient: {
    padding: SPACING.lg,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  planTitleSection: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  planDuration: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  planDescription: {
    fontSize: 15,
    fontWeight: '400',
    color: COLORS.textMuted,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  goalsSection: {
    marginTop: SPACING.sm,
  },
  goalsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  goalBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textMuted,
    flex: 1,
  },
  moreGoals: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  actionSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  startButtonTextDisabled: {
    color: '#9CA3AF',
  },
});

export default RecoveryPlansScreen; 