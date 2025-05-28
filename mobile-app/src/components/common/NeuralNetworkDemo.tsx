import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import EnhancedNeuralNetwork from './EnhancedNeuralNetwork';
import { COLORS, SPACING } from '../../constants/theme';

interface DemoStage {
  days: number;
  label: string;
  description: string;
  recoveryPercentage: number;
}

const DEMO_STAGES: DemoStage[] = [
  {
    days: 0,
    label: 'Day 0 - Starting',
    description: 'Your brain is ready to begin healing',
    recoveryPercentage: 0,
  },
  {
    days: 1,
    label: 'Day 1 - First Steps',
    description: 'Dopamine pathways starting to rebalance',
    recoveryPercentage: 5,
  },
  {
    days: 3,
    label: 'Day 3 - Early Recovery',
    description: 'Reward circuits strengthening daily',
    recoveryPercentage: 15,
  },
  {
    days: 7,
    label: 'Week 1 - Building Momentum',
    description: 'Neural pathways rapidly recovering',
    recoveryPercentage: 25,
  },
  {
    days: 14,
    label: 'Week 2 - Accelerating',
    description: 'Brain chemistry rebalancing significantly',
    recoveryPercentage: 40,
  },
  {
    days: 30,
    label: 'Month 1 - Major Progress',
    description: 'Dopamine system largely restored',
    recoveryPercentage: 60,
  },
  {
    days: 60,
    label: 'Month 2 - Thriving',
    description: 'Neural network expanding rapidly',
    recoveryPercentage: 75,
  },
  {
    days: 90,
    label: 'Month 3 - Transformed',
    description: 'Brain fully optimized and resilient',
    recoveryPercentage: 90,
  },
  {
    days: 365,
    label: 'Year 1 - Mastery',
    description: 'Complete neural transformation achieved',
    recoveryPercentage: 100,
  },
];

const NeuralNetworkDemo: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(() => {
        setCurrentStage(prev => (prev + 1) % DEMO_STAGES.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [autoPlay]);

  const stage = DEMO_STAGES[currentStage];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Neural Recovery Journey</Text>
          <Text style={styles.subtitle}>
            Watch your brain transform as it heals from nicotine addiction
          </Text>
        </View>

        {/* Neural Network Display */}
        <View style={styles.networkContainer}>
          <EnhancedNeuralNetwork
            daysClean={stage.days}
            recoveryPercentage={stage.recoveryPercentage}
            centerText={stage.days.toString()}
            centerSubtext="Days"
            size={300}
            showStats={true}
          />
        </View>

        {/* Stage Info */}
        <View style={styles.stageInfo}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
            style={styles.stageCard}
          >
            <Text style={styles.stageLabel}>{stage.label}</Text>
            <Text style={styles.stageDescription}>{stage.description}</Text>
            <View style={styles.recoveryBar}>
              <View style={styles.recoveryBarBg}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={[styles.recoveryBarFill, { width: `${stage.recoveryPercentage}%` }]}
                />
              </View>
              <Text style={styles.recoveryText}>{stage.recoveryPercentage}% Recovery</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.autoPlayButton}
            onPress={() => setAutoPlay(!autoPlay)}
          >
            <LinearGradient
              colors={autoPlay ? [COLORS.accent, COLORS.primary] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.autoPlayGradient}
            >
              <Ionicons 
                name={autoPlay ? 'pause' : 'play'} 
                size={20} 
                color={autoPlay ? COLORS.text : COLORS.textMuted} 
              />
              <Text style={[styles.autoPlayText, { color: autoPlay ? COLORS.text : COLORS.textMuted }]}>
                {autoPlay ? 'Pause' : 'Auto Play'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stage Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.stageSelector}
          contentContainerStyle={styles.stageSelectorContent}
        >
          {DEMO_STAGES.map((demoStage, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.stageButton,
                currentStage === index && styles.stageButtonActive
              ]}
              onPress={() => {
                setCurrentStage(index);
                setAutoPlay(false);
              }}
            >
              <Text style={[
                styles.stageButtonText,
                currentStage === index && styles.stageButtonTextActive
              ]}>
                {demoStage.days === 0 ? 'Start' : 
                 demoStage.days < 30 ? `${demoStage.days}d` :
                 demoStage.days < 365 ? `${Math.floor(demoStage.days / 30)}m` :
                 `${Math.floor(demoStage.days / 365)}y`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Science Note */}
        <View style={styles.scienceNote}>
          <Ionicons name="flask" size={16} color={COLORS.primary} />
          <Text style={styles.scienceText}>
            Based on peer-reviewed research on neuroplasticity and addiction recovery
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  networkContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  stageInfo: {
    marginBottom: SPACING.xl,
  },
  stageCard: {
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  stageLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  stageDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  recoveryBar: {
    alignItems: 'center',
  },
  recoveryBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  recoveryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  recoveryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  controls: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  autoPlayButton: {
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  autoPlayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  autoPlayText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  stageSelector: {
    marginBottom: SPACING.lg,
  },
  stageSelectorContent: {
    paddingHorizontal: SPACING.sm,
  },
  stageButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stageButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: COLORS.primary,
  },
  stageButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  stageButtonTextActive: {
    color: COLORS.primary,
  },
  scienceNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: SPACING.xl,
  },
  scienceText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
    fontStyle: 'italic',
  },
});

export default NeuralNetworkDemo; 