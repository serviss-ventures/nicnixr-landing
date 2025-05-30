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
              ? ['rgba(16, 185, 129, 0.08)', 'rgba(6, 182, 212, 0.08)']
              : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
          }
          style={styles.cardGradient}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <View style={styles.titleWithLogo}>
                <NixRLogo size="small" variant="icon-only" />
                <Text style={styles.sectionTitle}>
                  {activePlan ? 'My Active Plan' : 'My Plan'}
                </Text>
              </View>
              <View style={styles.statusIndicator}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: activePlan ? COLORS.primary : COLORS.textMuted }
                ]} />
                <Text style={styles.statusText}>
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
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${activePlan.progress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{activePlan.progress}%</Text>
              </View>
            )}
          </View>

          {/* Action Section */}
          <View style={styles.actionSection}>
            <View style={styles.exploreButton}>
              <Text style={styles.exploreText}>
                {activePlan ? 'MANAGE PLAN' : 'EXPLORE PLANS'}
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={16} 
                color={COLORS.textMuted} 
                style={{ marginLeft: SPACING.xs }} 
              />
            </View>
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.sm,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleWithLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  content: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  motivationalText: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginRight: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    minWidth: 35,
  },
  actionSection: {
    alignItems: 'flex-end',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
  },
  exploreText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
});

export default RecoveryPlanCard; 