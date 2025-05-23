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

  const handleLogin = () => {
    // Simple mock login for demo
    if (email && password) {
      const mockUser = {
        id: '1',
        email,
        username: 'demo_user',
        firstName: 'Demo',
        lastName: 'User',
        dateJoined: new Date().toISOString(),
        quitDate: new Date().toISOString(),
        nicotineProduct: {
          id: 'cigarettes',
          name: 'Cigarettes',
          avgCostPerDay: 15,
          nicotineContent: 12,
          category: 'cigarettes' as const,
          harmLevel: 9,
        },
        dailyCost: 15,
        packagesPerDay: 1,
        motivationalGoals: ['health', 'money', 'freedom'],
        isAnonymous: false,
      };
      
      dispatch(setUser(mockUser));
    } else {
      Alert.alert('Error', 'Please enter email and password');
    }
  };

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
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -2,
  },
  logoAccent: {
    color: COLORS.primary,
  },
  logoUnderline: {
    width: 100,
    height: 3,
    backgroundColor: COLORS.primary,
    marginTop: SPACING.sm,
    borderRadius: 2,
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