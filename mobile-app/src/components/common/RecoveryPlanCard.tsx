import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { COLORS, SPACING } from '../../constants/theme';
import { DashboardStackParamList } from '../../types';
import { StackNavigationProp } from '@react-navigation/stack';
import NixRLogo from './NixRLogo';

const { width } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<DashboardStackParamList>;

interface RecoveryPlanCardProps {
  daysClean: number;
}

const RecoveryPlanCard: React.FC<RecoveryPlanCardProps> = ({ daysClean }) => {
  const navigation = useNavigation<NavigationProp>();
  const { activePlan } = useSelector((state: RootState) => state.plan);
  
  // Calculate days since plan started
  const daysSincePlanStart = activePlan 
    ? Math.floor((Date.now() - new Date(activePlan.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleExplorePlans = () => {
    if (activePlan) {
      // User has active plan - take them to manage their current plan
      navigation.navigate('RecoveryPlans', { 
        mode: 'manage',
        activePlanId: activePlan.id 
      });
    } else {
      // User exploring new plans
      navigation.navigate('RecoveryPlans', { 
        mode: 'explore' 
      });
    }
  };

  const getPlanMessage = () => {
    if (activePlan) {
      const weekText = activePlan.weekNumber > 1 ? `Week ${activePlan.weekNumber}` : 'Week 1';
      return `${activePlan.title} • ${weekText} • ${activePlan.progress}% complete`;
    }
    if (daysClean < 7) {
      return "Perfect timing to start your first plan";
    }
    return "Ready to level up your recovery journey";
  };

  const getSubMessage = () => {
    if (activePlan) {
      const completedGoals = activePlan.completedGoals.length;
      const totalGoals = activePlan.goals.length;
      return `${completedGoals}/${totalGoals} weekly goals completed`;
    }
    return "Choose a focused plan designed for your recovery stage";
  };

  const getMotivationalText = () => {
    if (daysClean < 7) {
      return "Every choice builds your new identity";
    } else if (daysClean < 30) {
      return "Transform challenges into lasting strength"; 
    } else {
      return "Turn small wins into life-changing habits";
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.card} onPress={handleExplorePlans} activeOpacity={0.8}>
        <LinearGradient
          colors={
            activePlan 
              ? ['rgba(16, 185, 129, 0.12)', 'rgba(6, 182, 212, 0.08)', 'rgba(99, 102, 241, 0.04)']
              : ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.02)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <View style={styles.titleWithLogo}>
                <View style={styles.logoContainer}>
                  <LinearGradient
                    colors={activePlan ? [COLORS.primary, '#0891B2'] : ['#6B7280', '#4B5563']}
                    style={styles.logoGradient}
                  >
                    <Text style={styles.logoText}>NX</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.sectionTitle}>
                  {activePlan ? 'My Active Plan' : 'My Plan'}
                </Text>
              </View>
              <View style={styles.statusIndicator}>
                <LinearGradient
                  colors={activePlan ? [COLORS.primary, '#0891B2'] : ['#6B7280', '#4B5563']}
                  style={styles.statusDotGradient}
                >
                  <View style={styles.statusDotInner} />
                </LinearGradient>
                <Text style={[styles.statusText, activePlan && { color: COLORS.primary }]}>
                  {activePlan ? 'Active' : 'Get Started'}
                </Text>
              </View>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.content}>
            <Text style={styles.title}>{getPlanMessage()}</Text>
            <Text style={styles.subtitle}>{getSubMessage()}</Text>
            
            {/* Progress bar for active plan */}
            {activePlan && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={[COLORS.primary, '#0891B2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressFill, 
                      { width: `${activePlan.progress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{activePlan.progress}%</Text>
              </View>
            )}

            {/* Motivational quote for new users */}
            {!activePlan && (
              <View style={styles.motivationalContainer}>
                <View style={styles.quoteIcon}>
                  <Ionicons name="bulb-outline" size={14} color={COLORS.primary} />
                </View>
                <Text style={styles.motivationalText}>{getMotivationalText()}</Text>
              </View>
            )}
          </View>

          {/* Action Section */}
          <View style={styles.actionSection}>
            <LinearGradient
              colors={
                activePlan 
                  ? ['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.1)']
                  : ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)']
              }
              style={styles.exploreButton}
            >
              <View style={styles.buttonContent}>
                <Text style={[styles.exploreText, activePlan && { color: COLORS.primary }]}>
                  {activePlan ? 'MANAGE PLAN' : 'EXPLORE PLANS'}
                </Text>
                <View style={styles.arrowContainer}>
                  <Ionicons 
                    name="arrow-forward" 
                    size={16} 
                    color={activePlan ? COLORS.primary : COLORS.textMuted}
                  />
                </View>
              </View>
            </LinearGradient>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.md,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleWithLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logoContainer: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoGradient: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusDotGradient: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: -0.1,
  },
  content: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
    marginBottom: SPACING.sm,
    letterSpacing: -0.1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  progressBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  motivationalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
  },
  quoteIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  motivationalText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  actionSection: {
    alignItems: 'flex-end',
  },
  exploreButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  exploreText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.3,
  },
  arrowContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RecoveryPlanCard; 