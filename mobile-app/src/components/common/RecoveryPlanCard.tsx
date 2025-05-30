import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';
import { DashboardStackParamList } from '../../types';
import { StackNavigationProp } from '@react-navigation/stack';
import NixRLogo from './NixRLogo';

const { width } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<DashboardStackParamList, 'DashboardMain'>;

interface RecoveryPlanCardProps {
  currentPlan?: string;
  daysClean?: number;
}

const RecoveryPlanCard: React.FC<RecoveryPlanCardProps> = ({
  currentPlan,
  daysClean = 0
}) => {
  const navigation = useNavigation<NavigationProp>();

  const handleExplorePlans = () => {
    navigation.navigate('RecoveryPlans');
  };

  const getPlanMessage = () => {
    if (currentPlan) {
      return `Your ${currentPlan} plan is active`;
    }
    if (daysClean < 7) {
      return "Build momentum with your first recovery plan";
    } else if (daysClean < 30) {
      return "Strengthen your foundation with targeted goals";
    } else {
      return "Level up your recovery journey";
    }
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
    <TouchableOpacity 
      style={styles.container}
      onPress={handleExplorePlans}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={['rgba(16, 185, 129, 0.05)', 'rgba(16, 185, 129, 0.02)']}
        style={styles.card}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <View style={styles.titleWithLogo}>
              <NixRLogo size="small" variant="icon-only" />
              <Text style={styles.sectionTitle}>My Plan</Text>
            </View>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot, 
                { backgroundColor: currentPlan ? COLORS.primary : COLORS.textMuted }
              ]} />
              <Text style={styles.statusText}>
                {currentPlan ? 'Active' : 'Get Started'}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Build Your New Self</Text>
          <Text style={styles.subtitle}>
            {getPlanMessage()}
          </Text>
          <Text style={styles.motivationalText}>
            {getMotivationalText()}
          </Text>
        </View>

        {/* Action Section */}
        <View style={styles.actionSection}>
          <View style={styles.exploreButton}>
            <Text style={styles.exploreText}>
              {currentPlan ? 'MANAGE PLAN' : 'EXPLORE PLANS'}
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={16} 
              color={COLORS.primary} 
              style={styles.arrowIcon}
            />
          </View>
        </View>

        {/* Progress Indicators */}
        <View style={styles.progressSection}>
          <View style={styles.progressItem}>
            <View style={styles.progressIcon}>
              <Ionicons name="target-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.progressLabel}>Goals</Text>
          </View>
          
          <View style={styles.progressItem}>
            <View style={styles.progressIcon}>
              <Ionicons name="trending-up-outline" size={20} color={COLORS.secondary} />
            </View>
            <Text style={styles.progressLabel}>Progress</Text>
          </View>
          
          <View style={styles.progressItem}>
            <View style={styles.progressIcon}>
              <Ionicons name="trophy-outline" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.progressLabel}>Wins</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  header: {
    marginBottom: SPACING.sm,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  content: {
    marginBottom: SPACING.md,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
  motivationalText: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  actionSection: {
    marginBottom: SPACING.sm,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  exploreText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  arrowIcon: {
    marginLeft: SPACING.xs,
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  titleWithLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
});

export default RecoveryPlanCard; 