import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface NicotineProductOption {
  id: string;
  name: string;
  iconName: string;
  iconColor: string;
  iconBg: string;
  category: string;
  description: string;
  avgCostPerDay: number;
}

const NICOTINE_PRODUCTS: NicotineProductOption[] = [
  { 
    id: 'cigarettes', 
    name: 'Cigarettes', 
    iconName: 'flame-outline',
    iconColor: '#FF6B6B',
    iconBg: 'rgba(255, 107, 107, 0.15)',
    category: 'cigarettes', 
    description: 'Traditional cigarettes', 
    avgCostPerDay: 15 
  },
  { 
    id: 'vape', 
    name: 'Vape', 
    iconName: 'cloud-outline',
    iconColor: '#4ECDC4',
    iconBg: 'rgba(78, 205, 196, 0.15)',
    category: 'vape', 
    description: 'E-cigarettes, pods', 
    avgCostPerDay: 8 
  },
  { 
    id: 'zyn', 
    name: 'Zyn Pouches', 
    iconName: 'ellipse-outline',
    iconColor: '#A8E6CF',
    iconBg: 'rgba(168, 230, 207, 0.15)',
    category: 'pouches', 
    description: 'Nicotine pouches', 
    avgCostPerDay: 6 
  },
  { 
    id: 'chewing', 
    name: 'Chew/Dip', 
    iconName: 'leaf-outline',
    iconColor: '#DDA0DD',
    iconBg: 'rgba(221, 160, 221, 0.15)',
    category: 'chewing', 
    description: 'Chewing tobacco', 
    avgCostPerDay: 6 
  },
  { 
    id: 'other', 
    name: 'Other', 
    iconName: 'help-circle-outline',
    iconColor: '#FFB347',
    iconBg: 'rgba(255, 179, 71, 0.15)',
    category: 'other', 
    description: 'Something else', 
    avgCostPerDay: 10 
  },
];



const NicotineProfileStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);

  const [selectedProduct, setSelectedProduct] = useState<NicotineProductOption | null>(
    stepData.nicotineProduct ? NICOTINE_PRODUCTS.find(p => p.id === stepData.nicotineProduct?.id) || null : null
  );
  const [customProduct, setCustomProduct] = useState(stepData.customNicotineProduct || '');
  const [dailyAmount, setDailyAmount] = useState(stepData?.dailyAmount !== undefined && stepData?.dailyAmount !== null ? stepData.dailyAmount.toString() : '');

  const handleProductSelect = (product: NicotineProductOption) => {
    setSelectedProduct(product);
    // Clear the amount when switching products
    setDailyAmount('');
    console.log('🎯 User selected nicotine product:', {
      id: product.id,
      name: product.name,
      category: product.category,
      avgCostPerDay: product.avgCostPerDay
    });
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

    const profileData = {
      nicotineProduct: {
        id: selectedProduct.id,
        name: selectedProduct.name,
        category: selectedProduct.category,
        avgCostPerDay: selectedProduct.avgCostPerDay,
        nicotineContent: 0, // Could be enhanced later
        harmLevel: 5, // Default value,
      },
      customNicotineProduct: selectedProduct.id === 'other' ? customProduct : '',
      usageDuration: '1_to_3_years', // Default value
      dailyAmount: parseFloat(dailyAmount),
      dailyCost: selectedProduct.avgCostPerDay, // Use default cost
    };

    console.log('💾 Saving nicotine profile data:', profileData);

    dispatch(updateStepData(profileData));
    await dispatch(saveOnboardingProgress(profileData));
    
    console.log('✅ Nicotine profile saved successfully');
    
    dispatch(nextStep());
  };

  const handleBack = () => {
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
      case 'cigars':
        return 'Cigars per day';
      case 'chewing':
        return 'Cans/pouches per week';
      default:
        return 'Amount per day';
    }
  };

  const getHelperText = () => {
    if (!selectedProduct) return 'Just a rough estimate - we\'ll use this to track your progress!';
    
    switch (selectedProduct.category) {
      case 'cigarettes':
        return 'How many cigarettes do you typically smoke per day? (e.g., 20 = 1 pack)';
      case 'pouches':
        return 'How many pouches do you use per day? Most people use 8-15 pouches daily.';
      case 'vape':
        return 'How many pods or cartridges do you go through per day? (e.g., 0.5 = half a pod)';
      case 'chewing':
        return 'How many cans or pouches do you use per week? (e.g., 3.5 = about half a can daily)';
      default:
        return 'How much do you typically use per day? Just your best estimate.';
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
        return '3.5';
      default:
        return 'Enter amount';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
    >
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={[styles.progressFill, { width: '25%' }]}
          />
        </View>
        <Text style={styles.progressText}>Step 2 of 9</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>What's your nicotine of choice?</Text>
          <Text style={styles.subtitle}>
            Just the basics so we can personalize your journey. No judgment, just support.
          </Text>
          {selectedProduct && !dailyAmount && (
            <Text style={styles.scrollHint}>
              ⬇️ Scroll down to enter your daily usage
            </Text>
          )}
        </View>

        {/* Product Selection */}
        <View style={styles.section}>
          <View style={styles.productsGrid}>
            {NICOTINE_PRODUCTS.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={[
                  styles.productCard,
                  selectedProduct?.id === product.id && styles.productCardSelected
                ]}
                onPress={() => handleProductSelect(product)}
              >
                <View style={[styles.productIconContainer, { backgroundColor: product.iconBg }]}>
                  <Ionicons name={product.iconName as any} size={28} color={product.iconColor} />
                </View>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDescription}>{product.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Product Input */}
          {selectedProduct?.id === 'other' && (
            <View style={styles.customInputContainer}>
              <Text style={styles.inputLabel}>Please specify:</Text>
              <TextInput
                style={styles.textInput}
                value={customProduct}
                onChangeText={setCustomProduct}
                placeholder="e.g., Specific brand or product"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          )}
        </View>

        {/* Daily Amount - Only show if product selected */}
        {selectedProduct && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{getAmountLabel()}</Text>
            <Text style={styles.helperText}>
              {getHelperText()}
            </Text>
            <View style={styles.inputContainer}>
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
              />
              <Text style={styles.inputUnit}>
                {selectedProduct.category === 'chewing' ? 'per week' : 'per day'}
              </Text>
            </View>
          </View>
        )}

        {/* Encouragement - Only show when both product and amount are filled */}
        {selectedProduct && dailyAmount && parseFloat(dailyAmount) > 0 && (
          <View style={styles.encouragementContainer}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
              style={styles.encouragementCard}
            >
              <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
              <Text style={styles.encouragementText}>
                Perfect! We'll use this to create your personalized quit strategy and track your amazing progress.
              </Text>
            </LinearGradient>
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textSecondary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.continueButton,
            (!selectedProduct || !dailyAmount || parseFloat(dailyAmount) <= 0) && styles.continueButtonDisabled
          ]} 
          onPress={handleContinue}
          disabled={!selectedProduct || !dailyAmount || parseFloat(dailyAmount) <= 0}
        >
          <LinearGradient
            colors={
              selectedProduct && dailyAmount && parseFloat(dailyAmount) > 0
                ? [COLORS.primary, COLORS.secondary]
                : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
            }
            style={styles.continueButtonGradient}
          >
            <Text style={[
              styles.continueButtonText,
              (!selectedProduct || !dailyAmount || parseFloat(dailyAmount) <= 0) && styles.continueButtonTextDisabled
            ]}>
              Next: Your Motivations
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color={
                selectedProduct && dailyAmount && parseFloat(dailyAmount) > 0
                  ? COLORS.text
                  : COLORS.textMuted
              } 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  progressContainer: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Reduced padding for better keyboard experience
    flexGrow: 1,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  scrollHint: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  helperText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  productIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  productDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  customInputContainer: {
    marginTop: SPACING.md,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionsContainer: {
    gap: SPACING.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: SPACING.sm,
  },
  inputUnit: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
    minWidth: 80, // Ensure consistent spacing
  },
  numberInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    fontSize: 18,
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.primary,
    textAlign: 'center',
    fontWeight: 'bold',
    minWidth: 120, // Consistent width whether empty or filled
    maxWidth: 120,
    height: 48, // Fixed height to prevent jumping
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  encouragementContainer: {
    marginBottom: SPACING.xl,
  },
  encouragementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  encouragementText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.md,
    flex: 1,
    lineHeight: 18,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xl, // More space from content
    paddingBottom: SPACING['2xl'], // More space for safe area
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginTop: SPACING.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  continueButton: {
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  continueButtonTextDisabled: {
    color: COLORS.textMuted,
  },
});

export default NicotineProfileStep; 