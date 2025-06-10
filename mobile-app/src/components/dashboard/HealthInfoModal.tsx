import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

interface HealthInfoModalProps {
  visible: boolean;
  onClose: () => void;
  healthScore: number;
}

const HealthInfoModal: React.FC<HealthInfoModalProps> = ({ 
  visible, 
  onClose,
  healthScore: rawHealthScore
}) => {
  const healthScore = Math.round(rawHealthScore || 0); // Round to whole number
  
  // Get current phase info
  const getCurrentPhase = () => {
    if (healthScore < 10) return { name: 'Starting Out', color: '#10B981', icon: 'leaf-outline', next: 10 };
    if (healthScore < 30) return { name: 'Early Progress', color: '#06B6D4', icon: 'trending-up-outline', next: 30 };
    if (healthScore < 60) return { name: 'Building Strength', color: '#8B5CF6', icon: 'barbell-outline', next: 60 };
    if (healthScore < 85) return { name: 'Major Recovery', color: '#F59E0B', icon: 'shield-checkmark-outline', next: 85 };
    return { name: 'Freedom', color: '#EF4444', icon: 'star-outline', next: 100 };
  };
  
  const phase = getCurrentPhase();
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'formSheet' : 'pageSheet'}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#000000', '#0A0F1C', '#0F172A']}
          style={styles.modalGradient}
        >
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            {/* Premium Header */}
            <View style={styles.premiumModalHeader}>
              <TouchableOpacity 
                style={styles.premiumModalBackButton}
                onPress={onClose}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                  style={styles.premiumModalBackGradient}
                >
                  <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.premiumModalTitle}>Recovery Overview</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            {/* Content - Optimized Single Page Design */}
            <View style={styles.optimizedContent}>
              {/* Optimized Hero Section */}
              <View style={styles.optimizedHero}>
                {/* Progress Circle and Info Side by Side */}
                <View style={styles.optimizedTopRow}>
                  {/* Progress Ring */}
                  <View style={styles.optimizedProgressRing}>
                    <View style={styles.optimizedRingBackground} />
                    <View 
                      style={[
                        styles.optimizedRingProgress,
                        { 
                          transform: [
                            { rotate: '-90deg' },
                            { translateX: 0 },
                            { translateY: 0 },
                            { rotate: `${(healthScore / 100) * 360}deg` }
                          ]
                        }
                      ]}
                    >
                      <View style={[styles.optimizedRingFill, { backgroundColor: phase.color }]} />
                    </View>
                    <View style={styles.optimizedRingInner}>
                      <Text style={[styles.optimizedScoreText, { color: '#FFFFFF' }]}>{healthScore || '0'}</Text>
                      <Text style={styles.optimizedScoreLabel}>SCORE</Text>
                    </View>
                  </View>
                  
                  {/* Phase Info */}
                  <View style={styles.optimizedPhaseInfo}>
                    <View style={[styles.optimizedPhaseBadge, { backgroundColor: `${phase.color}15` }]}>
                      <Ionicons name={phase.icon as keyof typeof Ionicons.glyphMap} size={16} color={phase.color} />
                      <Text style={[styles.optimizedPhaseText, { color: phase.color }]}>{phase.name}</Text>
                    </View>
                    <Text style={styles.optimizedPhaseDescription}>
                      {phase.name === 'Starting Out' ? 'First steps taken' :
                       phase.name === 'Early Progress' ? 'Body adapting' :
                       phase.name === 'Building Strength' ? 'Habits forming' :
                       phase.name === 'Major Recovery' ? 'Life transformed' :
                       'Living free'}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.optimizedProgressBar}>
                  <View style={styles.optimizedProgressTrack}>
                    <View 
                      style={[
                        styles.optimizedProgressFill,
                        { 
                          width: `${healthScore}%`,
                          backgroundColor: phase.color 
                        }
                      ]} 
                    />
                  </View>
                  <View style={styles.optimizedMilestones}>
                    {[10, 30, 60, 85].map((milestone) => (
                      <View 
                        key={milestone}
                        style={[
                          styles.optimizedMilestone,
                          { left: `${milestone}%` }
                        ]}
                      >
                        <View style={[
                          styles.optimizedMilestoneDot,
                          healthScore >= milestone && { backgroundColor: phase.color }
                        ]} />
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Journey Phases */}
              <View style={styles.optimizedJourney}>
                <Text style={styles.optimizedSectionTitle}>YOUR JOURNEY</Text>
                
                <View style={styles.optimizedPhasesList}>
                  {[
                    { name: 'Starting Out', score: 10, icon: 'leaf-outline' },
                    { name: 'Early Progress', score: 30, icon: 'trending-up-outline' },
                    { name: 'Building Strength', score: 60, icon: 'barbell-outline' },
                    { name: 'Major Recovery', score: 85, icon: 'shield-checkmark-outline' },
                    { name: 'Freedom', score: 100, icon: 'star-outline' }
                  ].map((p, index) => {
                    const isActive = healthScore >= (index === 0 ? 0 : [10, 30, 60, 85][index - 1]) && 
                                   healthScore < [10, 30, 60, 85, 101][index];
                    const isComplete = healthScore >= [10, 30, 60, 85, 100][index];
                    
                    return (
                      <View 
                        key={index} 
                        style={[
                          styles.optimizedPhaseItem,
                          isActive && styles.optimizedPhaseItemActive,
                          isComplete && styles.optimizedPhaseItemComplete
                        ]}
                      >
                        <View style={[
                          styles.optimizedPhaseIcon,
                          isActive && { backgroundColor: `${phase.color}20` },
                          isComplete && { backgroundColor: 'rgba(16, 185, 129, 0.2)' }
                        ]}>
                          <Ionicons 
                            name={isComplete ? 'checkmark-circle' : p.icon as keyof typeof Ionicons.glyphMap} 
                            size={20} 
                            color={isComplete ? '#10B981' : isActive ? phase.color : '#6B7280'} 
                          />
                        </View>
                        <View style={styles.optimizedPhaseTextContainer}>
                          <Text style={[
                            styles.optimizedPhaseName,
                            (isActive || isComplete) && styles.optimizedPhaseNameActive
                          ]}>
                            {p.name}
                          </Text>
                          <Text style={styles.optimizedPhaseScore}>
                            {isComplete ? 'Complete' : `${p.score}%`}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Next Goal */}
              {healthScore < 100 && (
                <View style={styles.optimizedNextGoal}>
                  <View style={[styles.optimizedNextGoalBar, { backgroundColor: `${phase.color}15` }]}>
                    <Ionicons name="flag" size={16} color={phase.color} />
                    <Text style={styles.optimizedNextGoalText}>
                      Next: {phase.name === 'Starting Out' ? '10%' :
                             phase.name === 'Early Progress' ? '30%' :
                             phase.name === 'Building Strength' ? '60%' :
                             phase.name === 'Major Recovery' ? '85%' : '100%'} • {Math.max(0, (phase.name === 'Starting Out' ? 10 :
                                     phase.name === 'Early Progress' ? 30 :
                                     phase.name === 'Building Strength' ? 60 :
                                     phase.name === 'Major Recovery' ? 85 : 100) - healthScore)}% to go
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Glassmorphism Footer */}
            <View style={styles.glassmorphismFooter}>
              <TouchableOpacity 
                style={styles.glassmorphismActionButton}
                onPress={onClose}
              >
                <LinearGradient
                  colors={[phase.color, `${phase.color}CC`]}
                  style={styles.glassmorphismActionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.glassmorphismActionText}>Got It!</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal Container
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F172A', // Match the gradient end color to hide any gaps
  },
  modalGradient: {
    flex: 1,
  },
  modalHeaderSpacer: {
    width: 40,
  },

  // Premium Modal Header
  premiumModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  premiumModalBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumModalBackGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
  },
  premiumModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },

  // Optimized Content
  optimizedContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: 40, // Increased to ensure no black bar
  },
  optimizedHero: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  optimizedTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  optimizedProgressRing: {
    width: 90,
    height: 90,
    position: 'relative',
    marginRight: SPACING.lg,
  },
  optimizedRingBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 45,
    borderWidth: 6,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optimizedRingProgress: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 45,
    overflow: 'hidden',
  },
  optimizedRingFill: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    borderWidth: 6,
    borderColor: 'transparent',
    borderTopColor: '#10B981',
  },
  optimizedRingInner: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: 39,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optimizedScoreText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  optimizedScoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginTop: -2,
  },
  optimizedPhaseInfo: {
    flex: 1,
  },
  optimizedPhaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    marginBottom: SPACING.sm,
  },
  optimizedPhaseText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: SPACING.xs,
  },
  optimizedPhaseDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
    lineHeight: 24,
  },
  optimizedProgressBar: {
    height: 32,
    position: 'relative',
  },
  optimizedProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  optimizedProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  optimizedMilestones: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  optimizedMilestone: {
    position: 'absolute',
    top: -5,
    width: 16,
    height: 16,
    marginLeft: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optimizedMilestoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#000000',
  },

  // Journey Section
  optimizedJourney: {
    marginBottom: SPACING.md,
  },
  optimizedSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },
  optimizedPhasesList: {
    gap: SPACING.sm,
  },
  optimizedPhaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  optimizedPhaseItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optimizedPhaseItemComplete: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  optimizedPhaseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  optimizedPhaseTextContainer: {
    flex: 1,
  },
  optimizedPhaseName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  optimizedPhaseNameActive: {
    color: COLORS.text,
    fontWeight: '700',
  },
  optimizedPhaseScore: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // Next Goal
  optimizedNextGoal: {
    marginBottom: SPACING.md,
  },
  optimizedNextGoalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 10,
    gap: SPACING.xs,
  },
  optimizedNextGoalText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },

  // Glassmorphism Footer
  glassmorphismFooter: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  glassmorphismActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  glassmorphismActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  glassmorphismActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default HealthInfoModal; 