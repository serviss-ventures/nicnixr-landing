import React, { createContext, useContext, ReactNode } from 'react';
import { DefaultTheme } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS, GRADIENTS } from '../../constants/theme';

// Create theme object that matches React Navigation's expected structure
const navigationTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.cardBorder,
    notification: COLORS.primary,
  },
  fonts: {
    regular: {
      fontFamily: FONTS.regular || 'System',
      fontWeight: 'normal' as const,
    },
    medium: {
      fontFamily: FONTS.medium || 'System',
      fontWeight: '500' as const,
    },
    bold: {
      fontFamily: FONTS.bold || 'System',
      fontWeight: 'bold' as const,
    },
    heavy: {
      fontFamily: FONTS.black || 'System',
      fontWeight: '900' as const,
    },
  },
};

const ThemeContext = createContext({
  theme: navigationTheme,
  colors: COLORS,
  fonts: FONTS,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  shadows: SHADOWS,
  gradients: GRADIENTS,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const value = {
    theme: navigationTheme,
    colors: COLORS,
    fonts: FONTS,
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    gradients: GRADIENTS,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { navigationTheme }; 