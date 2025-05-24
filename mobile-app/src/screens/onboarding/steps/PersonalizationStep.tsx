import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { nextStep, previousStep } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const PersonalizationStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={[styles.progressFill, { width: '87.5%' }]} />
        </View>
        <Text style={styles.progressText}>Step 7 of 8</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Final Touches</Text>
        <Text style={styles.subtitle}>Personalizing your experience (coming soon)</Text>
      </View>
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => dispatch(previousStep())}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton} onPress={() => dispatch(nextStep())}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.continueButtonGradient}>
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.text} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: SPACING.lg },
  progressContainer: { paddingTop: SPACING.xl, paddingBottom: SPACING.lg },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: SPACING.sm },
  progressFill: { height: '100%', borderRadius: 2 },
  progressText: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.md },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center' },
  navigationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.lg },
  backButton: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md },
  backButtonText: { fontSize: 16, color: COLORS.textSecondary, marginLeft: SPACING.sm },
  continueButton: { borderRadius: SPACING.md, overflow: 'hidden' },
  continueButtonGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
  continueButtonText: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginRight: SPACING.sm },
});

export default PersonalizationStep; 