import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, Animated, ScrollView, SafeAreaView, StatusBar, Keyboard } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface NicotineProductOption {
  id: string;
  name: string;
  iconName: keyof typeof Ionicons.glyphMap;
  category: 'cigarettes' | 'vape' | 'pouches' | 'chewing';
  description: string;
  avgCostPerDay: number;
}

const NICOTINE_PRODUCTS: NicotineProductOption[] = [
  { 
    id: 'cigarettes', 
    name: 'Cigarettes', 
    iconName: 'flame-outline',
    category: 'cigarettes', 
    description: 'Traditional cigarettes', 
    avgCostPerDay: 15 
  },
  { 
    id: 'vape', 
    name: 'Vape', 
    iconName: 'cloud-outline',
    category: 'vape', 
    description: 'E-cigarettes, pods', 
    avgCostPerDay: 8 
  },
  { 
    id: 'zyn', 
    name: 'Nicotine Pouches', 
    iconName: 'ellipse-outline',
    category: 'pouches', 
    description: 'Nicotine pouches', 
    avgCostPerDay: 6 
  },
  { 
    id: 'chewing', 
    name: 'Chew', 
    iconName: 'leaf-outline',
    category: 'chewing', 
    description: 'Chewing tobacco', 
    avgCostPerDay: 6 
  },
];

const NicotineProfileStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);

  const [selectedProduct, setSelectedProduct] = useState<NicotineProductOption | null>(
    stepData.nicotineProduct ? NICOTINE_PRODUCTS.find(p => p.id === stepData.nicotineProduct?.id) || null : null
  );
  const [dailyAmount, setDailyAmount] = useState(stepData?.dailyAmount !== undefined && stepData?.dailyAmount !== null ? stepData.dailyAmount.toString() : '');
  const [showAmountInput, setShowAmountInput] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const amountFadeAnim = useRef(new Animated.Value(0)).current;

  // If we already have a selected product, show the amount input immediately
  useEffect(() => {
    if (selectedProduct && !showAmountInput) {
      setShowAmountInput(true);
      // Animate in the amount input
      Animated.parallel([
        Animated.timing(amountFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, []);

  const handleProductSelect = (product: NicotineProductOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (selectedProduct?.id === product.id && showAmountInput) {
      // If clicking the same product, go back to product selection
      setShowAmountInput(false);
      setSelectedProduct(null);
      setDailyAmount('');
      
      // Animate back to product selection
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(amountFadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setSelectedProduct(product);
      setDailyAmount('');
      
      // Animate transition to amount input
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(amountFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setShowAmountInput(true);
      });
    }
  };

  const handleAmountChange = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const numericText = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = numericText.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit to reasonable numbers (max 999)
    const number = parseFloat(numericText);
    if (number > 999) {
      return;
    }
    
    setDailyAmount(numericText);
  };

  const handleContinue = async () => {
    if (!selectedProduct) {
      Alert.alert('Please select your nicotine product', 'This helps us create your personalized plan.');
      return;
    }

    if (!dailyAmount || parseFloat(dailyAmount) <= 0) {
      Alert.alert('Please enter your daily usage', 'We need this to calculate your progress milestones.');
      return;
    }

    // Haptic feedback for successful input
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Dismiss keyboard before transitioning
    Keyboard.dismiss();

    const profileData: any = {
      nicotineProduct: {
        id: selectedProduct.id,
        name: selectedProduct.name,
        category: selectedProduct.category,
        avgCostPerDay: selectedProduct.avgCostPerDay,
        nicotineContent: 0,
        harmLevel: 5,
      },
      customNicotineProduct: '',
      usageDuration: '1_to_3_years',
      dailyAmount: parseFloat(dailyAmount),
      dailyCost: selectedProduct.avgCostPerDay,
    };

    // Add product-specific data
    if (selectedProduct.category === 'vape') {
      profileData.podsPerDay = parseFloat(dailyAmount);
    } else if (selectedProduct.category === 'cigarettes') {
      profileData.packagesPerDay = parseFloat(dailyAmount) / 20; // Convert cigarettes to packs
    } else if (selectedProduct.category === 'chewing') {
      profileData.tinsPerDay = parseFloat(dailyAmount);
    } else if (selectedProduct.category === 'pouches' || selectedProduct.id === 'zyn') {
      // For pouches - save dailyAmount as pouches per day
      profileData.tinsPerDay = parseFloat(dailyAmount) / 15; // Convert pouches to tins
    }

    dispatch(updateStepData(profileData));
    await dispatch(saveOnboardingProgress(profileData));
    
    dispatch(nextStep());
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(previousStep());
  };

  const getAmountLabel = () => {
    if (!selectedProduct) return 'Amount per day';
    
    switch (selectedProduct.category) {
      case 'cigarettes':
        return 'Cigarettes per day';
      case 'pouches':
        return 'Pouches per day';
      case 'vape':
        return 'Pods/cartridges per day';
      case 'chewing':
        return 'Tins per day';
      default:
        return 'Amount per day';
    }
  };

  const getHelperText = () => {
    if (!selectedProduct) return '';
    
    switch (selectedProduct.category) {
      case 'cigarettes':
        return 'Most people smoke about 20 cigarettes (1 pack) per day';
      case 'pouches':
        return 'Most people use 8-15 pouches daily';
      case 'vape':
        return 'A typical pod lasts 1-2 days for most users';
      case 'chewing':
        return 'Most users go through 0.5-1 tin per day';
      default:
        return 'Just your best estimate';
    }
  };

  const getPlaceholder = () => {
    if (!selectedProduct) return 'Enter amount';
    
    switch (selectedProduct.category) {
      case 'cigarettes':
        return '20';
      case 'pouches':
        return '10';
      case 'vape':
        return '1';
      case 'chewing':
        return '0.7';
      default:
        return 'Enter amount';
    }
  };

  return (
    <>
      {!showAmountInput ? (
        <View style={styles.container}>
          {/* Gradient background */}
          <LinearGradient
            colors={['#000000', '#0A0F1C', '#0F172A']}
            style={StyleSheet.absoluteFillObject}
          />

          <SafeAreaView style={styles.safeArea}>
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(3/9) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>Step 3 of 9</Text>
            </View>

            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>What's your nicotine of choice?</Text>
                  <Text style={styles.subtitle}>Select your primary nicotine product</Text>
                </View>

                {/* Product Grid */}
                <Animated.View 
                  style={[
                    styles.productsContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ scale: scaleAnim }],
                    }
                  ]}
                >
                  <View style={styles.productsGrid}>
                    {NICOTINE_PRODUCTS.map((product) => (
                      <TouchableOpacity
                        key={product.id}
                        style={[
                          styles.productCard,
                          selectedProduct?.id === product.id && styles.productCardSelected,
                        ]}
                        onPress={() => handleProductSelect(product)}
                        activeOpacity={0.7}
                      >
                        <View style={[
                          styles.productIconContainer,
                          selectedProduct?.id === product.id && styles.productIconContainerSelected
                        ]}>
                          <Ionicons 
                            name={product.iconName} 
                            size={28} 
                            color={selectedProduct?.id === product.id ? COLORS.primary : COLORS.textSecondary} 
                          />
                        </View>
                        <Text style={[
                          styles.productName,
                          selectedProduct?.id === product.id && styles.productNameSelected,
                        ]}>
                          {product.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Animated.View>
              </View>
            </ScrollView>

            {/* Navigation */}
            <View style={styles.navigationContainer}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={18} color={COLORS.textSecondary} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.continueButton,
                  (!selectedProduct || !dailyAmount || parseFloat(dailyAmount) <= 0) && styles.continueButtonDisabled
                ]} 
                onPress={handleContinue}
                disabled={!selectedProduct || !dailyAmount || parseFloat(dailyAmount) <= 0}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.continueButtonText,
                  (!selectedProduct || !dailyAmount || parseFloat(dailyAmount) <= 0) && styles.continueButtonTextDisabled
                ]}>
                  Continue
                </Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={18} 
                  color={(!selectedProduct || !dailyAmount || parseFloat(dailyAmount) <= 0) ? COLORS.textMuted : COLORS.text} 
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      ) : null}

      {/* Amount Input Overlay */}
      {selectedProduct && showAmountInput && (
        <Animated.View 
          style={[
            styles.amountInputOverlay,
            {
              opacity: amountFadeAnim,
            }
          ]}
        >
          {/* Gradient background */}
          <LinearGradient
            colors={['#000000', '#0A0F1C', '#0F172A']}
            style={StyleSheet.absoluteFillObject}
          />

          <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#000000" barStyle="light-content" />
            
            <View style={styles.amountContainer}>
              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(3/9) * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>Step 3 of 9</Text>
              </View>

              {/* Compact layout optimized for keyboard */}
              <View style={styles.keyboardOptimizedContent}>
                {/* Product icon and change hint */}
                <TouchableOpacity
                  style={styles.compactProductDisplay}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowAmountInput(false);
                    setSelectedProduct(null);
                    setDailyAmount('');
                    Keyboard.dismiss();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.compactIconContainer}>
                    <Ionicons name={selectedProduct.iconName} size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.changeProductHint}>Tap to change</Text>
                </TouchableOpacity>

                {/* Compact label */}
                <Text style={styles.compactAmountLabel}>{getAmountLabel()}</Text>
                <Text style={styles.compactHelperText}>{getHelperText()}</Text>
                
                {/* Input field - the main focus */}
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.numberInput}
                    value={dailyAmount}
                    onChangeText={handleAmountChange}
                    placeholder={getPlaceholder()}
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="decimal-pad"
                    autoFocus={true}
                    selectTextOnFocus={true}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    onSubmitEditing={handleContinue}
                  />
                  <Text style={styles.inputUnit}>
                    per day
                  </Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      )}
    </>
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
  progressContainer: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.xl * 2,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 1,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  progressFill: {
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl * 1.5,
    paddingTop: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl * 2,
    alignItems: 'center',
  },
  title: {
    fontSize: FONTS['2xl'],
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONTS.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '400',
  },
  productsContainer: {
    flex: 1,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  productCard: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    minHeight: 140,
    justifyContent: 'center',
  },
  productCardSelected: {
    borderColor: 'rgba(139, 92, 246, 0.3)',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  productIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  productIconContainerSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  productName: {
    fontSize: FONTS.sm,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  productNameSelected: {
    color: COLORS.text,
    fontWeight: '500',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl * 1.5,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    marginLeft: -SPACING.sm,
  },
  backButtonText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
    fontWeight: '400',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  continueButtonText: {
    fontSize: FONTS.base,
    fontWeight: '500',
    color: COLORS.text,
  },
  continueButtonTextDisabled: {
    color: COLORS.textMuted,
  },
  // Amount Input Overlay Styles
  amountInputOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  amountContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  keyboardOptimizedContent: {
    paddingHorizontal: SPACING.xl * 1.5,
    paddingTop: SPACING.sm,
    alignItems: 'center',
  },
  compactProductDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  compactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  changeProductHint: {
    fontSize: FONTS.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '300',
  },
  compactAmountLabel: {
    fontSize: FONTS.lg,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
    fontWeight: '400',
  },
  compactHelperText: {
    fontSize: FONTS.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: SPACING.lg,
    fontWeight: '300',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  numberInput: {
    fontSize: 56,
    fontWeight: '300',
    color: COLORS.text,
    textAlign: 'center',
    minWidth: 120,
    letterSpacing: -2,
    marginBottom: 0,
    paddingBottom: 0,
  },
  inputUnit: {
    fontSize: FONTS.lg,
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: SPACING.sm,
    fontWeight: '300',
  },

});

export default NicotineProfileStep; 