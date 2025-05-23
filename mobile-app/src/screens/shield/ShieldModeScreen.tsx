import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const ShieldModeScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.shieldContainer}>
          <Ionicons name="shield" size={120} color={COLORS.primary} />
          <Text style={styles.title}>Shield Mode Activated</Text>
          <Text style={styles.subtitle}>
            Take a deep breath. You've got this. This craving will pass.
          </Text>

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>Breathing Exercise</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>Quick Meditation</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>Movement Break</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: 50,
    borderTopLeftRadius: SPACING.xl,
    borderTopRightRadius: SPACING.xl,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    zIndex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.full,
    padding: SPACING.sm,
  },
  shieldContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
  },
  actionsContainer: {
    width: '100%',
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  actionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.background,
    textAlign: 'center',
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});

export default ShieldModeScreen; 