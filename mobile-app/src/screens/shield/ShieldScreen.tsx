import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const ShieldScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="shield-checkmark" size={80} color={COLORS.primary} />
        <Text style={styles.title}>Shield Mode</Text>
        <Text style={styles.subtitle}>Tap the shield when you need support with cravings</Text>
        
        <TouchableOpacity style={styles.shieldButton}>
          <Ionicons name="shield" size={40} color={COLORS.background} />
          <Text style={styles.shieldButtonText}>ACTIVATE SHIELD</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
  },
  shieldButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING['2xl'],
    borderRadius: SPACING.xl,
    alignItems: 'center',
    flexDirection: 'row',
  },
  shieldButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.background,
    marginLeft: SPACING.md,
  },
});

export default ShieldScreen; 