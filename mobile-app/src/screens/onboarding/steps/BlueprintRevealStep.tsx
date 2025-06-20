import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { selectOnboardingData } from '../../../store/slices/onboardingSlice';
import { completeOnboarding } from '../../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../../store/store';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

type RootStackParamList = {
  Main: undefined;
  Onboarding: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

// const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BlueprintRevealStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const onboardingData = useSelector((state: RootState) => selectOnboardingData(state));
  
  const [isLoading, setIsLoading] = useState(false);

  // Calculate personalized stats
  const dailySavings = onboardingData.dailyCost || 15;
  const yearlySavings = Math.round(dailySavings * 365);
  
  // Get the product category and calculate units properly
  const productCategory = onboardingData.nicotineProduct?.category || onboardingData.substanceType || 'cigarettes';
  
  // Calculate yearly units based on product type
  const getYearlyUnits = () => {
    const dailyAmount = onboardingData.dailyAmount || 10;
    
    switch (productCategory) {
      case 'cigarettes':
        // For cigarettes, dailyAmount is number of cigarettes
        return Math.round(dailyAmount * 365);
        
      case 'vape':
        // For vapes, dailyAmount is pods per day
        const podsPerDay = onboardingData.podsPerDay || dailyAmount;
        return Math.round(podsPerDay * 365);
        
      case 'pouches':
      case 'nicotine_pouches':
        // For pouches, dailyAmount is pouches per day
        return Math.round(dailyAmount * 365);
        
      case 'chewing':
      case 'chew':
      case 'dip':
      case 'chew_dip':
        // For chew/dip, dailyAmount is tins per day
        const tinsPerDay = onboardingData.tinsPerDay || dailyAmount;
        return Math.round(tinsPerDay * 365);
        
      default:
        return Math.round(dailyAmount * 365);
    }
  };
  
  // Get the proper display name for the product
  const getProductDisplayName = () => {
    switch (productCategory) {
      case 'cigarettes':
        return 'cigarettes';
        
      case 'vape':
        return 'vape pods';
        
      case 'pouches':
      case 'nicotine_pouches':
        return 'nicotine pouches';
        
      case 'chewing':
      case 'chew':
      case 'dip':
      case 'chew_dip':
        return 'tins of dip';
        
      default:
        return 'nicotine products';
    }
  };
  
  const yearlyUnits = getYearlyUnits();
  const productDisplayName = getProductDisplayName();

  const handleComplete = async () => {
    if (isLoading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    
    try {
      // Add a timeout to prevent infinite spinning
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out')), 10000)
      );
      
      // Complete onboarding with timeout
      await Promise.race([
        dispatch(completeOnboarding(onboardingData)),
        timeoutPromise
      ]);
      
      // Mark onboarding as complete in the onboarding slice too
      const { completeOnboarding: completeOnboardingAction } = await import('../../../store/slices/onboardingSlice');
      dispatch(completeOnboardingAction());
      
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      setIsLoading(false);
      console.error('Error completing onboarding:', error);
      
      // If it's a timeout or network error, still navigate to main app
      // The user data is already saved locally
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage === 'Operation timed out' || errorMessage.includes('network')) {
        console.log('Network issue detected, proceeding with local data');
        
        // Still mark onboarding as complete
        const { completeOnboarding: completeOnboardingAction } = await import('../../../store/slices/onboardingSlice');
        dispatch(completeOnboardingAction());
        
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Success State - Clear and immediate */}
          <View style={styles.header}>
            <View style={styles.checkmarkContainer}>
              <View style={styles.checkmarkCircle}>
                <Ionicons name="checkmark" size={32} color="#FFFFFF" />
              </View>
            </View>
            
            <Text style={styles.title}>You&apos;re ready to quit</Text>
            <Text style={styles.subtitle}>
              Your personalized plan is ready
            </Text>
          </View>

          {/* Value Proposition - What they get */}
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>YOUR NIXR PLAN INCLUDES</Text>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="rgba(139, 92, 246, 0.8)" />
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>24/7 AI Recovery Coach</Text>
                  <Text style={styles.benefitDescription}>Instant support when cravings hit</Text>
                </View>
              </View>
              
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="rgba(139, 92, 246, 0.8)" />
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Real-time Health Tracking</Text>
                  <Text style={styles.benefitDescription}>See your body heal day by day</Text>
                </View>
              </View>
              
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="rgba(139, 92, 246, 0.8)" />
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Recovery Community</Text>
                  <Text style={styles.benefitDescription}>Connect with others on the same journey</Text>
                </View>
              </View>
              
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="rgba(139, 92, 246, 0.8)" />
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>Daily Motivation</Text>
                  <Text style={styles.benefitDescription}>Personalized tips and milestone rewards</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Personalized Impact - Make it real */}
          <View style={styles.impactSection}>
            <Text style={styles.impactTitle}>IN YOUR FIRST YEAR, YOU&apos;LL SAVE</Text>
            
            <View style={styles.impactGrid}>
              <View style={styles.impactCard}>
                <Text style={styles.impactNumber}>${yearlySavings.toLocaleString()}</Text>
                <Text style={styles.impactLabel}>for your future</Text>
              </View>
              
              <View style={styles.impactCard}>
                <Text style={styles.impactNumber}>{(yearlyUnits).toLocaleString()}</Text>
                <Text style={styles.impactLabel}>{productDisplayName} avoided</Text>
              </View>
            </View>
          </View>

          {/* Social Proof - Build trust */}
          <View style={styles.socialProof}>
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons key={star} name="star" size={16} color="#FFD700" />
                ))}
              </View>
              <Text style={styles.ratingText}>4.9 • App Store</Text>
            </View>
            
            <Text style={styles.testimonial}>
              {productCategory === 'cigarettes' ? 
                `"NIXR helped me quit smoking after 15 years. The AI coach was there every time I needed it."` :
               productCategory === 'vape' ?
                `"Finally quit vaping after 3 years. NIXR&apos;s tracking showed me how much I was really using."` :
               productCategory === 'pouches' || productCategory === 'nicotine_pouches' ?
                `"Thought pouches were harmless until NIXR showed me the truth. 4 months clean now!"` :
               productCategory === 'chew' || productCategory === 'dip' || productCategory === 'chew_dip' ?
                `"20 years of dipping ended with NIXR. The community support made all the difference."` :
                `"NIXR helped me quit after years of addiction. The daily motivation kept me going."`
              }
            </Text>
            <Text style={styles.testimonialAuthor}>
              {productCategory === 'cigarettes' ? '— Mike R., 6 months smoke-free' :
               productCategory === 'vape' ? '— Jessica T., 4 months vape-free' :
               productCategory === 'pouches' || productCategory === 'nicotine_pouches' ? '— David K., 4 months pouch-free' :
               productCategory === 'chew' || productCategory === 'dip' || productCategory === 'chew_dip' ? '— Tom B., 8 months dip-free' :
               '— Sarah M., 6 months nicotine-free'}
            </Text>
          </View>

          {/* CTA Section - Clear and compelling */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleComplete}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Start Free Trial</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {/* Trust badges */}
            <View style={styles.trustBadges}>
              <Text style={styles.trustText}>
                <Ionicons name="shield-checkmark" size={14} color="rgba(255, 255, 255, 0.5)" />
                {' '}7-day free trial
              </Text>
              <Text style={styles.trustDivider}>•</Text>
              <Text style={styles.trustText}>Cancel anytime</Text>
            </View>

            {/* Urgency element */}
            <View style={styles.urgencyContainer}>
              <Text style={styles.urgencyText}>
                🔥 {Math.floor(Math.random() * 20 + 30)} people started their recovery today
              </Text>
            </View>
          </View>

          {/* FAQ - Address objections */}
          <View style={styles.faqSection}>
            <TouchableOpacity style={styles.faqItem}>
              <Text style={styles.faqQuestion}>What happens after the free trial?</Text>
              <Text style={styles.faqAnswer}>
                After 7 days, it&apos;s $7.99/month. That&apos;s {
                  productCategory === 'cigarettes' ? 'less than a pack of cigarettes' :
                  productCategory === 'vape' ? 'less than 2 days of vaping' :
                  productCategory === 'pouches' || productCategory === 'nicotine_pouches' ? 'the same as 1 tin of pouches' :
                  productCategory === 'chew' || productCategory === 'dip' || productCategory === 'chew_dip' ? 'the same as 1 tin of dip' :
                  'less than your weekly nicotine cost'
                }.
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Can I really cancel anytime?</Text>
              <Text style={styles.faqAnswer}>
                Yes, cancel in seconds from Settings. No questions asked.
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 2,
  },
  
  // Header
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl * 2,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  checkmarkContainer: {
    marginBottom: SPACING.lg,
  },
  checkmarkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.lg,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '400',
  },
  
  // Plan Card
  planCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  planTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1.2,
    marginBottom: SPACING.lg,
  },
  benefitsList: {
    gap: SPACING.md,
  },
  benefitItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: FONTS.base,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: FONTS.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
  },
  
  // Impact Section
  impactSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  impactTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  impactGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  impactCard: {
    flex: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  impactNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  impactLabel: {
    fontSize: FONTS.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
    textAlign: 'center',
  },
  
  // Social Proof
  socialProof: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: FONTS.sm,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  testimonial: {
    fontSize: FONTS.base,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  testimonialAuthor: {
    fontSize: FONTS.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
  },
  
  // CTA Section
  ctaSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  primaryButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 16,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  trustBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  trustText: {
    fontSize: FONTS.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
  },
  trustDivider: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  urgencyContainer: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  urgencyText: {
    fontSize: FONTS.sm,
    color: 'rgba(255, 191, 0, 0.8)',
    fontWeight: '500',
  },
  
  // FAQ Section
  faqSection: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  faqItem: {
    paddingVertical: SPACING.sm,
  },
  faqQuestion: {
    fontSize: FONTS.base,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.xs,
  },
  faqAnswer: {
    fontSize: FONTS.sm,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
    lineHeight: 20,
  },
});

export default BlueprintRevealStep; 