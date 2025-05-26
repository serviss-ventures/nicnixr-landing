import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { COLORS, SPACING } from '../../constants/theme';
import { AppDispatch } from '../../store/store';
import { setUser } from '../../store/slices/authSlice';

const AuthScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    // Simple mock login for demo
    if (email && password) {
      try {
        const mockUser = {
          id: `user_${Date.now()}`,
          email: email,
          username: 'demo_user',
          firstName: 'Demo',
          lastName: 'User',
          dateJoined: new Date().toISOString(),
          quitDate: new Date().toISOString(),
          nicotineProduct: {
            id: 'other',
            name: 'Nicotine Product',
            avgCostPerDay: 10,
            nicotineContent: 0,
            category: 'other' as const,
            harmLevel: 5,
          },
          dailyCost: 10,
          packagesPerDay: 1,
          motivationalGoals: ['health', 'money', 'freedom'],
          isAnonymous: false,
        };
        
        console.log('🔐 Attempting login with mock user:', mockUser);
        dispatch(setUser(mockUser));
        console.log('✅ Mock user set successfully');
      } catch (error) {
        console.error('❌ Login error:', error);
        Alert.alert('Error', 'Login failed. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Please enter email and password');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Epic NIXR Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <View style={styles.nixContainer}>
              <Text style={styles.nixText}>NIX</Text>
              <View style={styles.epicSlash} />
            </View>
            <Text style={styles.rText}>R</Text>
          </View>
          <Text style={styles.tagline}>BREAK FREE. LIVE EPIC.</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <Text style={styles.title}>Welcome Back</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          
          <Text style={styles.demoText}>
            Demo: Enter any email and password to continue
          </Text>
        </View>
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
    paddingHorizontal: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  nixContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nixText: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -3,
    color: COLORS.text,
    textShadowColor: 'rgba(16, 185, 129, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  rText: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -3,
    color: COLORS.primary,
    textShadowColor: 'rgba(16, 185, 129, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
    marginLeft: SPACING.sm,
  },
  epicSlash: {
    position: 'absolute',
    width: 60,
    height: 6,
    backgroundColor: '#FF0000',
    top: '50%',
    left: 0,
    marginTop: -3,
    borderRadius: 3,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
    transform: [{ rotate: '-15deg' }],
    zIndex: 10,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(16, 185, 129, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  form: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: SPACING.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: SPACING.md,
    marginTop: SPACING.lg,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.background,
    textAlign: 'center',
  },
  demoText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontStyle: 'italic',
  },
});

export default AuthScreen; 