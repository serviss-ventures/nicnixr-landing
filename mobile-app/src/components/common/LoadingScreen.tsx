import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* NixR Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            NIX
            <Text style={styles.logoAccent}>R</Text>
          </Text>
          <View style={styles.logoUnderline} />
        </View>
        
        {/* Loading Indicator */}
        <ActivityIndicator 
          size="large" 
          color={COLORS.primary} 
          style={styles.spinner}
        />
        
        {/* Loading Message */}
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -2,
  },
  logoAccent: {
    color: COLORS.primary,
    position: 'relative',
  },
  logoUnderline: {
    width: 120,
    height: 3,
    backgroundColor: COLORS.primary,
    marginTop: SPACING.sm,
    borderRadius: 2,
  },
  spinner: {
    marginBottom: SPACING.lg,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default LoadingScreen; 