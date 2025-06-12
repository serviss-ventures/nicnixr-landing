import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';
import * as Progress from 'react-native-progress';

interface HealthInfoModalProps {
  visible: boolean;
  onClose: () => void;
  healthScore: number;
}

const healthMilestones = [
  { score: 5, title: "Heart Rate Normalizes", icon: 'heart-outline' },
  { score: 15, title: "Oxygen Levels Restored", icon: 'fitness-outline' },
  { score: 30, title: "Lungs Begin to Clear", icon: 'leaf-outline' },
  { score: 50, title: "Heart Attack Risk Halved", icon: 'shield-checkmark-outline' },
  { score: 75, title: "Cancer Risk Reduces", icon: 'body-outline' },
  { score: 100, title: "Full System Recovery", icon: 'star-outline' }
];

const HealthInfoModal: React.FC<HealthInfoModalProps> = ({ visible, onClose, healthScore: rawHealthScore }) => {
  const healthScore = Math.round(rawHealthScore || 0);

  const getPhase = (score: number) => {
    if (score < 30) return { name: 'Initial Healing', color: '#34D399' };
    if (score < 75) return { name: 'System Recovery', color: '#60A5FA' };
    return { name: 'Risk Reduction', color: '#A78BFA' };
  };

  const currentPhase = getPhase(healthScore);
  const nextMilestone = healthMilestones.find(m => m.score > healthScore);
  const achievedMilestones = healthMilestones.filter(m => m.score <= healthScore).slice(-2);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <LinearGradient colors={['#0F172A', '#0A0F1C', '#000000']} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Recovery Snapshot</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close-circle" size={28} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              {/* Score Section */}
              <View style={styles.scoreSection}>
                <Progress.Circle
                  size={160}
                  progress={healthScore / 100}
                  thickness={10}
                  color={currentPhase.color}
                  unfilledColor="rgba(255, 255, 255, 0.08)"
                  borderWidth={0}
                  showsText={true}
                  formatText={() => (
                    <View style={styles.scoreTextContainer}>
                      <Text style={styles.scoreValue}>{healthScore}%</Text>
                      <Text style={styles.scoreLabel}>Health Score</Text>
                    </View>
                  )}
                />
              </View>

              {/* Wins Section */}
              <View style={styles.winsSection}>
                {nextMilestone && (
                  <View style={[styles.winCard, styles.nextWinCard, { borderColor: `${currentPhase.color}40` }]}>
                     <View style={[styles.winIconContainer, { backgroundColor: `${currentPhase.color}33` }]}>
                       <Ionicons name="flag-outline" size={24} color={currentPhase.color} />
                     </View>
                     <View style={styles.winTextContainer}>
                       <Text style={styles.winTitle}>Next Up: {nextMilestone.title}</Text>
                       <Text style={styles.winSubtitle}>You're almost there! Keep going.</Text>
                     </View>
                  </View>
                )}
                {achievedMilestones.map((milestone) => (
                  <View key={milestone.title} style={styles.winCard}>
                     <View style={styles.winIconContainer}>
                       <Ionicons name={milestone.icon as any} size={24} color={COLORS.textSecondary} />
                     </View>
                     <View style={styles.winTextContainer}>
                       <Text style={styles.winTitle}>{milestone.title}</Text>
                       <Text style={styles.winSubtitle}>Accomplished</Text>
                     </View>
                     <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  </View>
                ))}
              </View>
              
              <View style={styles.footer}>
                 <Text style={styles.footerText}>Your body is healing every single day.</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'center', // Center title
    alignItems: 'center',
    padding: SPACING.md,
    position: 'relative',
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.md,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  scoreSection: {
    alignItems: 'center',
  },
  scoreContainer: {
    //
  },
  scoreTextContainer: {
    alignItems: 'center',
  },
  scoreValue: {
    color: COLORS.text,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  scoreLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  winsSection: {
    gap: SPACING.md,
  },
  winCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  nextWinCard: {
     backgroundColor: 'rgba(139, 92, 246, 0.1)',
     borderWidth: 1.5,
  },
  winIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  winTextContainer: {
    flex: 1,
  },
  winTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  winSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  }
});

export default HealthInfoModal; 