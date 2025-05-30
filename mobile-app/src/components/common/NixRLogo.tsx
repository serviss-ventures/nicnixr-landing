import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';

interface NixRLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'compact' | 'icon-only';
  showTagline?: boolean;
}

const NixRLogo: React.FC<NixRLogoProps> = ({ 
  size = 'medium', 
  variant = 'default',
  showTagline = false 
}) => {
  const dimensions = {
    small: { width: 28, height: 28, fontSize: 11 },
    medium: { width: 36, height: 36, fontSize: 14 },
    large: { width: 48, height: 48, fontSize: 18 }
  };

  const { width, height, fontSize } = dimensions[size];

  if (variant === 'icon-only') {
    return (
      <LinearGradient
        colors={['#10B981', '#06B6D4']}
        style={[styles.iconContainer, { width, height, borderRadius: width / 2 }]}
      >
        <Text style={[styles.iconText, { fontSize }]}>N</Text>
      </LinearGradient>
    );
  }

  if (variant === 'compact') {
    return (
      <View style={styles.compactContainer}>
        <LinearGradient
          colors={['#10B981', '#06B6D4']}
          style={[styles.compactIcon, { width, height, borderRadius: width * 0.3 }]}
        >
          <Text style={[styles.compactIconText, { fontSize: fontSize * 0.9 }]}>N</Text>
        </LinearGradient>
        <Text style={[styles.brandText, { fontSize: fontSize * 1.1 }]}>ixR</Text>
      </View>
    );
  }

  // Default variant - full logo
  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <LinearGradient
          colors={['#10B981', '#06B6D4']}
          style={[styles.logoIcon, { width: width * 1.2, height: height * 1.2, borderRadius: width * 0.3 }]}
        >
          <Text style={[styles.logoIconText, { fontSize: fontSize * 1.1 }]}>N</Text>
        </LinearGradient>
        <Text style={[styles.logoText, { fontSize: fontSize * 1.3 }]}>ixR</Text>
      </View>
      {showTagline && (
        <Text style={styles.tagline}>Freedom Technology</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  logoIconText: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  logoText: {
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 8,
    fontWeight: '500',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  // Compact variant styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 3,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  compactIconText: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  brandText: {
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  // Icon-only variant styles
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  iconText: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default NixRLogo; 