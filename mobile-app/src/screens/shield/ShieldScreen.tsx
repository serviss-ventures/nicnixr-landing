import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ShieldModeScreen from './ShieldModeScreen';
import EmergencyShieldMode from './EmergencyShieldMode';

const ShieldScreen: React.FC = () => {
  const [shieldModeVisible, setShieldModeVisible] = useState(false);
  const [emergencyModeVisible, setEmergencyModeVisible] = useState(false);

  return (
    <>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.container}
      >
        <View style={styles.content}>
          <Ionicons name="shield-checkmark" size={80} color={COLORS.primary} />
          <Text style={styles.title}>Shield Mode</Text>
          <Text style={styles.subtitle}>Instant craving defense when you need it most</Text>
          
          {/* Emergency Shield Button - For Crisis Situations */}
          <TouchableOpacity 
            style={styles.emergencyButton} 
            onPress={() => setEmergencyModeVisible(true)}
          >
            <LinearGradient
              colors={['#DC2626', '#EF4444', '#F87171']}
              style={styles.emergencyButtonGradient}
            >
              <Ionicons name="warning" size={40} color="white" />
              <Text style={styles.emergencyButtonText}>🚨 EMERGENCY SHIELD</Text>
              <Text style={styles.emergencyButtonSubtext}>For intense cravings & emotional distress</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Regular Shield Button */}
          <TouchableOpacity 
            style={styles.shieldButton} 
            onPress={() => setShieldModeVisible(true)}
          >
            <LinearGradient
              colors={['#1E40AF', '#3B82F6', '#06B6D4']}
              style={styles.shieldButtonGradient}
            >
              <Ionicons name="shield" size={40} color="white" />
              <Text style={styles.shieldButtonText}>REGULAR SHIELD</Text>
              <Text style={styles.shieldButtonSubtext}>For standard cravings</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>How Shield Mode Works:</Text>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>Guided breathing exercises</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>Personal motivations reminder</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>Emergency distraction techniques</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>Craving intensity tracking</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Emergency Shield Mode Modal */}
      <EmergencyShieldMode 
        visible={emergencyModeVisible} 
        onClose={() => setEmergencyModeVisible(false)} 
      />

      {/* Regular Shield Mode Modal */}
      <ShieldModeScreen 
        visible={shieldModeVisible} 
        onClose={() => setShieldModeVisible(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING['3xl'],
  },
  emergencyButton: {
    borderRadius: SPACING.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    borderWidth: 3,
    borderColor: '#DC2626',
  },
  emergencyButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING['2xl'],
  },
  emergencyButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  emergencyButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  shieldButton: {
    borderRadius: SPACING.xl,
    overflow: 'hidden',
    marginBottom: SPACING['3xl'],
  },
  shieldButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING['3xl'],
  },
  shieldButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  shieldButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoContainer: {
    width: '100%',
    paddingHorizontal: SPACING.lg,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: SPACING.md,
    flex: 1,
  },
});

export default ShieldScreen; 