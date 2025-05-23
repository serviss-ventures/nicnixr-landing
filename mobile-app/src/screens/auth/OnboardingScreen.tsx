import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            NIC<Text style={styles.logoAccent}>NIX</Text>R
          </Text>
          <View style={styles.logoUnderline} />
        </View>

        {/* Welcome Text */}
        <Text style={styles.title}>Welcome to NicNixr</Text>
        <Text style={styles.subtitle}>
          Your journey to freedom from nicotine addiction starts here.
        </Text>

        {/* Get Started Button */}
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Auth' as never)}
        >
          <Text style={styles.buttonText}>Get Started</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -2,
  },
  logoAccent: {
    color: COLORS.primary,
  },
  logoUnderline: {
    width: 120,
    height: 3,
    backgroundColor: COLORS.primary,
    marginTop: SPACING.sm,
    borderRadius: 2,
  },
  title: {
    fontSize: 30,
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
    marginBottom: SPACING['3xl'],
    lineHeight: 24,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING['2xl'],
    borderRadius: SPACING.lg,
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.background,
    textAlign: 'center',
  },
});

export default OnboardingScreen; 