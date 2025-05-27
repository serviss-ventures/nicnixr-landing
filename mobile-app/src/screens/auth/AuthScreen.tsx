import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Animated, 
  Dimensions,
  Platform 
} from 'react-native';
import { useDispatch } from 'react-redux';
import { COLORS, SPACING } from '../../constants/theme';
import { AppDispatch } from '../../store/store';
import { setUser } from '../../store/slices/authSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const AuthScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Simple, subtle animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Clean entrance animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#1A1A2E']}
        style={styles.background}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Clean, Premium Logo */}
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: logoAnim,
                transform: [
                  {
                    translateY: logoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.logoWrapper}>
              <Text style={styles.nicText}>NIC</Text>
              <View style={styles.separator} />
              <Text style={styles.nixrText}>NIXR</Text>
            </View>
            <Text style={styles.tagline}>Recovery. Simplified.</Text>
          </Animated.View>

          {/* Clean Login Form */}
          <View style={styles.form}>
            <Text style={styles.title}>Welcome Back</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.demoContainer}>
              <Text style={styles.demoText}>
                Demo: Enter any email and password to continue
              </Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING['4xl'],
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  nicText: {
    fontSize: 48,
    fontWeight: '300',
    letterSpacing: -1,
    color: '#FFFFFF',
  },
  separator: {
    width: 32,
    height: 2,
    backgroundColor: '#10B981',
    marginHorizontal: SPACING.md,
    borderRadius: 1,
  },
  nixrText: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
    color: '#10B981',
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
  },
  form: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
  },
  inputIcon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  button: {
    marginTop: SPACING.lg,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  demoContainer: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  demoText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AuthScreen; 