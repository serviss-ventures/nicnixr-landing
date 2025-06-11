import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { completeOnboarding } from '../../../store/slices/onboardingSlice';
import { COLORS } from '../../../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../../../navigation/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const BlueprintRevealStep: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleComplete = () => {
    dispatch(completeOnboarding());
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.step}>Step 9 of 9</Text>
          </View>

          <Text style={styles.title}>Begin your recovery</Text>
          
          <Text style={styles.subtitle}>
            Join thousands who've transformed their lives with our science-backed approach
          </Text>

          <View style={styles.benefitsContainer}>
            <View style={styles.benefit}>
              <Icon name="brain" size={24} color={COLORS.accent} />
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Neural healing</Text>
                <Text style={styles.benefitDescription}>
                  Track dopamine recovery in real-time
                </Text>
              </View>
            </View>

            <View style={styles.benefit}>
              <Icon name="shield-check" size={24} color={COLORS.accent} />
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>AI-powered support</Text>
                <Text style={styles.benefitDescription}>
                  Get help before cravings hit
                </Text>
              </View>
            </View>

            <View style={styles.benefit}>
              <Icon name="account-group" size={24} color={COLORS.accent} />
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Community strength</Text>
                <Text style={styles.benefitDescription}>
                  Connect with your success network
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.socialProof}>
            <Text style={styles.socialProofText}>
              Loved by 247,000+ people • 4.8★ rating
            </Text>
          </View>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.accent, '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.ctaText}>Start Your Recovery</Text>
              <Icon name="arrow-right" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.freeTrialText}>
            Free for 7 days • Cancel anytime
          </Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  step: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  benefitsContainer: {
    marginBottom: 40,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  benefitText: {
    marginLeft: 16,
    flex: 1,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  socialProof: {
    alignItems: 'center',
    marginBottom: 32,
  },
  socialProofText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  ctaButton: {
    marginBottom: 16,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 30,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
  freeTrialText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});

export default BlueprintRevealStep; 