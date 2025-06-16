import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { nextStep } from '../../../store/slices/onboardingSlice';
import { setUser } from '../../../store/slices/authSlice';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../../lib/supabase';

/**
 * AuthenticationStep - The Gateway to Tracking Everything
 * 
 * This is where we capture users and start tracking their journey
 * Critical for attribution, LTV calculation, and marketing optimization
 */
const AuthenticationStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password.');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      let authResult;
      
      if (mode === 'signup') {
        // Sign up new user
        authResult = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              // Track signup source for attribution
              signup_channel: 'organic_app',
              app_version: '1.0.0',
              platform: Platform.OS,
            }
          }
        });
        
        if (authResult.error) throw authResult.error;
        
        // Log signup event for analytics
        console.log('New user signup:', email);
        
      } else {
        // Log in existing user
        authResult = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (authResult.error) throw authResult.error;
      }

      if (authResult.data.user) {
        // Update Redux state
        dispatch(setUser({
          id: authResult.data.user.id,
          email: authResult.data.user.email!,
          created_at: authResult.data.user.created_at,
        }));
        
        // Continue onboarding
        dispatch(nextStep());
      }
      
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // User-friendly error messages
      let message = 'An error occurred. Please try again.';
      if (error.message?.includes('already registered')) {
        message = 'This email is already registered. Please log in instead.';
        setMode('login');
      } else if (error.message?.includes('Invalid login')) {
        message = 'Invalid email or password.';
      } else if (error.message?.includes('valid email')) {
        message = 'Please enter a valid email address.';
      }
      
      Alert.alert('Authentication Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Create anonymous session
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) throw error;
      
      if (data.user) {
        dispatch(setUser({
          id: data.user.id,
          email: null,
          isAnonymous: true,
          created_at: data.user.created_at,
        }));
        
        // Log anonymous signup for tracking
        console.log('Anonymous user created:', data.user.id);
        
        dispatch(nextStep());
      }
    } catch (error: any) {
      console.error('Anonymous auth error:', error);
      Alert.alert('Error', 'Unable to continue anonymously. Please try creating an account.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(mode === 'signup' ? 'login' : 'signup');
    setEmail('');
    setPassword('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ translateY }]
          }
        ]}
      >
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressText}>Step 2 of 10</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-add" size={28} color={COLORS.primary} />
          </View>
          
          <Text style={styles.title}>
            {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
          </Text>
          
          <Text style={styles.subtitle}>
            {mode === 'signup' 
              ? 'Track your progress and unlock personalized insights'
              : 'Continue your journey to freedom'
            }
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={mode === 'signup' ? 'Create password' : 'Password'}
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!isLoading}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color={COLORS.textMuted} 
              />
            </TouchableOpacity>
          </View>

          {mode === 'signup' && (
            <Text style={styles.passwordHint}>
              Use at least 8 characters with a mix of letters and numbers
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.disabledButton]} 
            onPress={handleAuth}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>
                  {mode === 'signup' ? 'Create Account' : 'Log In'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.text} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toggleButton} 
            onPress={toggleMode}
            disabled={isLoading}
          >
            <Text style={styles.toggleText}>
              {mode === 'signup' 
                ? 'Already have an account? Log in'
                : "Don't have an account? Sign up"
              }
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.anonymousButton} 
            onPress={handleAnonymous}
            disabled={isLoading}
          >
            <Ionicons name="glasses-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.anonymousText}>Continue Anonymously</Text>
          </TouchableOpacity>

          <Text style={styles.privacyNote}>
            Your data is encrypted and never shared
          </Text>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl * 1.5,
  },
  progressContainer: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 1,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  progressFill: {
    width: '20%', // 2/10 steps
    height: '100%',
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
    borderRadius: 1,
  },
  progressText: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONTS['2xl'],
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.sm,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONTS.base,
    color: COLORS.text,
    fontWeight: '400',
  },
  eyeIcon: {
    padding: SPACING.sm,
  },
  passwordHint: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  actions: {
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: SPACING.xl * 2,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    width: '100%',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: FONTS.base,
    fontWeight: '500',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  toggleButton: {
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  toggleText: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: '400',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  dividerText: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.md,
    fontWeight: '500',
  },
  anonymousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  anonymousText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  privacyNote: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default AuthenticationStep; 