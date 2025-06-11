import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  // Brand Colors
  primary: '#8B5CF6', // Purple (was Emerald)
  secondary: '#EC4899', // Pink - complementary to purple
  accent: '#06B6D4', // Cyan - for contrast
  
  // Background Colors
  background: '#000000',
  surface: '#111827',
  card: '#1F2937',
  
  // Text Colors
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  
  // Status Colors
  success: '#10B981', // Green for positive states
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Shield Mode Colors
  shield: '#1E40AF',
  shieldGlow: '#3B82F6',
  
  // Progress Colors
  progressGreen: '#10B981',
  progressBlue: '#06B6D4',
  progressPurple: '#8B5CF6',
  
  // Transparent Colors
  overlay: 'rgba(0, 0, 0, 0.8)',
  glassMorphism: 'rgba(255, 255, 255, 0.05)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
};

export const FONTS = {
  // Font Families - Using system fonts with fallbacks
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
  black: 'System',
  
  // Font Sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  medium: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  glow: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
};

export const SCREEN_DIMENSIONS = {
  width,
  height,
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 414,
  isLargeDevice: width >= 414,
};

export const ANIMATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  spring: {
    damping: 15,
    stiffness: 200,
  },
};

// Gradient Presets
export const GRADIENTS = {
  primary: [COLORS.primary, COLORS.secondary], // Purple to Pink
  accent: [COLORS.accent, COLORS.primary], // Cyan to Purple
  shield: [COLORS.shield, COLORS.shieldGlow],
  progress: [COLORS.progressGreen, COLORS.progressBlue, COLORS.progressPurple],
  background: ['#000000', '#111827'],
};

export default {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  SCREEN_DIMENSIONS,
  ANIMATIONS,
  GRADIENTS,
}; 