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
import Svg, { 
  Circle, 
  Path, 
  Defs, 
  LinearGradient as SvgLinearGradient, 
  Stop,
  Line,
  G,
  Polygon,
  Text as SvgText
} from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const AuthScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Advanced animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 20 }, () => new Animated.Value(0))
  ).current;
  const neuralAnims = useRef(
    Array.from({ length: 12 }, () => new Animated.Value(0))
  ).current;
  const hologramAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation sequence
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation
    const rotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );

    // Particle system
    const particles = Animated.loop(
      Animated.stagger(100, 
        particleAnims.map(anim => 
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: true,
            }),
          ])
        )
      )
    );

    // Neural network animation
    const neural = Animated.loop(
      Animated.stagger(200,
        neuralAnims.map(anim =>
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        )
      )
    );

    // Hologram effect
    const hologram = Animated.loop(
      Animated.sequence([
        Animated.timing(hologramAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(hologramAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    rotation.start();
    particles.start();
    neural.start();
    hologram.start();

    return () => {
      pulse.stop();
      rotation.stop();
      particles.stop();
      neural.stop();
      hologram.stop();
    };
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

  // Neural Network Background Component
  const NeuralNetworkBackground = () => (
    <Svg height="400" width={width} style={styles.neuralBackground}>
      <Defs>
        <SvgLinearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#00FFFF" stopOpacity="0.6" />
          <Stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.4" />
          <Stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
        </SvgLinearGradient>
      </Defs>
      
      {/* Neural connections */}
      {neuralAnims.map((anim, index) => {
        const startX = (index * width / 12) + 20;
        const endX = ((index + 3) * width / 12) + 20;
        const y = 200 + Math.sin(index) * 80;
        
        return (
          <Animated.View key={index} style={{ opacity: anim }}>
            <Line
              x1={startX}
              y1={y}
              x2={endX}
              y2={y + Math.cos(index) * 40}
              stroke="url(#neuralGrad)"
              strokeWidth="1.5"
            />
          </Animated.View>
        );
      })}
      
      {/* Neural nodes */}
      {neuralAnims.slice(0, 8).map((anim, index) => {
        const x = (index * width / 8) + 40;
        const y = 200 + Math.sin(index * 0.7) * 60;
        
        return (
          <Animated.View key={index} style={{ opacity: anim }}>
            <Circle
              cx={x}
              cy={y}
              r="4"
              fill="#00FFFF"
              opacity="0.8"
            />
            <Circle
              cx={x}
              cy={y}
              r="8"
              fill="none"
              stroke="#00FFFF"
              strokeWidth="1"
              opacity="0.4"
            />
          </Animated.View>
        );
      })}
    </Svg>
  );

  // Futuristic Logo Component
  const FuturisticLogo = () => (
    <Animated.View 
      style={[
        styles.logoContainer,
        {
          opacity: logoAnim,
          transform: [
            { scale: pulseAnim },
            {
              rotateY: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        },
      ]}
    >
      {/* Holographic Ring */}
      <Animated.View
        style={[
          styles.holographicRing,
          {
            opacity: hologramAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.3, 1, 0.3],
            }),
            transform: [
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#00FFFF', 'transparent', '#8B5CF6', 'transparent', '#00FFFF']}
          style={styles.holographicGradient}
        />
      </Animated.View>

      {/* Central Logo */}
      <View style={styles.centralLogo}>
        {/* Particle System */}
        {particleAnims.slice(0, 12).map((anim, index) => {
          const angle = (index * 30) * (Math.PI / 180);
          const radius = 80;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  left: x + 100,
                  top: y + 60,
                  opacity: anim,
                  transform: [
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 1.5, 0],
                      }),
                    },
                  ],
                },
              ]}
            />
          );
        })}

        {/* Main Logo Text */}
        <View style={styles.logoTextContainer}>
          <LinearGradient
            colors={['#00FFFF', '#8B5CF6', '#10B981']}
            style={styles.logoTextGradient}
          >
            <Text style={styles.nixText}>NIC</Text>
          </LinearGradient>
          
          <View style={styles.nixrSeparator}>
            <LinearGradient
              colors={['#FF0080', '#FF4444', '#FF0080']}
              style={styles.separatorGradient}
            />
          </View>
          
          <LinearGradient
            colors={['#10B981', '#00FFFF', '#8B5CF6']}
            style={styles.logoTextGradient}
          >
            <Text style={styles.nixrText}>NIXR</Text>
          </LinearGradient>
        </View>

        {/* Medical Cross Icon */}
        <View style={styles.medicalIcon}>
          <LinearGradient
            colors={['#00FFFF', '#10B981']}
            style={styles.medicalIconGradient}
          >
            <Ionicons name="medical" size={24} color="#FFFFFF" />
          </LinearGradient>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>NEURAL RECOVERY SYSTEM</Text>
        <Text style={styles.subtitle}>POWERED BY QUANTUM MEDICINE</Text>
      </View>

      {/* Outer Ring Elements */}
      <View style={styles.outerRing}>
        {[0, 1, 2, 3].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.ringElement,
              {
                transform: [
                  { rotate: `${index * 90}deg` },
                  {
                    rotateZ: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#00FFFF', 'transparent']}
              style={styles.ringElementGradient}
            />
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#1A1A2E', '#16213E']}
        style={styles.background}
      >
        {/* Neural Network Background */}
        <NeuralNetworkBackground />

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Futuristic Logo */}
          <FuturisticLogo />

          {/* Login Form */}
          <View style={styles.form}>
            <Text style={styles.title}>NEURAL ACCESS PORTAL</Text>
            <Text style={styles.subtitle}>Authenticate to continue your recovery journey</Text>
            
            <View style={styles.inputContainer}>
              <LinearGradient
                colors={['rgba(0, 255, 255, 0.1)', 'rgba(139, 92, 246, 0.1)']}
                style={styles.inputGradient}
              >
                <Ionicons name="mail-outline" size={20} color="#00FFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Neural ID (Email)"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </LinearGradient>
            </View>
            
            <View style={styles.inputContainer}>
              <LinearGradient
                colors={['rgba(0, 255, 255, 0.1)', 'rgba(139, 92, 246, 0.1)']}
                style={styles.inputGradient}
              >
                <Ionicons name="lock-closed-outline" size={20} color="#00FFFF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Security Code"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </LinearGradient>
            </View>
            
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <LinearGradient
                colors={['#00FFFF', '#8B5CF6', '#10B981']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>INITIATE NEURAL LINK</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.demoContainer}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.1)']}
                style={styles.demoGradient}
              >
                <Ionicons name="information-circle-outline" size={16} color="#10B981" />
                <Text style={styles.demoText}>
                  Demo Mode: Enter any credentials to access the neural recovery system
                </Text>
              </LinearGradient>
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
  neuralBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING['4xl'],
    position: 'relative',
  },
  holographicRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  holographicGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 140,
  },
  centralLogo: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00FFFF',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  logoTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoTextGradient: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm,
  },
  nixText: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -2,
    color: '#FFFFFF',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  nixrSeparator: {
    width: 40,
    height: 4,
    marginHorizontal: SPACING.sm,
    borderRadius: 2,
    overflow: 'hidden',
  },
  separatorGradient: {
    width: '100%',
    height: '100%',
  },
  nixrText: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -2,
    color: '#FFFFFF',
    textShadowColor: '#10B981',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  medicalIcon: {
    marginBottom: SPACING.md,
    borderRadius: 20,
    overflow: 'hidden',
  },
  medicalIconGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00FFFF',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
    textAlign: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    top: -100,
    left: -100,
  },
  ringElement: {
    position: 'absolute',
    width: 60,
    height: 2,
    top: 99,
    left: 170,
    transformOrigin: '-70px 0px',
  },
  ringElementGradient: {
    width: '100%',
    height: '100%',
  },
  form: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FFFF',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: 1,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  inputGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    borderRadius: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  button: {
    marginTop: SPACING.lg,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginRight: SPACING.sm,
  },
  demoContainer: {
    marginTop: SPACING.xl,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  demoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  demoText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 16,
  },
});

export default AuthScreen; 