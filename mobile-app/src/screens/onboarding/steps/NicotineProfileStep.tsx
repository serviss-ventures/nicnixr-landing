import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface NicotineProductOption {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  avgCostPerDay: number;
}

const NICOTINE_PRODUCTS: NicotineProductOption[] = [
  { id: 'cigarettes', name: 'Cigarettes', icon: '🚬', category: 'cigarettes', description: 'Traditional cigarettes', avgCostPerDay: 15 },
  { id: 'vape', name: 'Vape', icon: '💨', category: 'vape', description: 'E-cigarettes, pods', avgCostPerDay: 8 },
  { id: 'zyn', name: 'Zyn Pouches', icon: '⚪', category: 'pouches', description: 'Nicotine pouches', avgCostPerDay: 6 },
  { id: 'chewing', name: 'Chew/Dip', icon: '🫠', category: 'chewing', description: 'Chewing tobacco', avgCostPerDay: 6 },
  { id: 'other', name: 'Other', icon: '❓', category: 'other', description: 'Something else', avgCostPerDay: 10 },
];



const NicotineProfileStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);

  const [selectedProduct, setSelectedProduct] = useState<NicotineProductOption | null>(
    stepData.nicotineProduct ? NICOTINE_PRODUCTS.find(p => p.id === stepData.nicotineProduct?.id) || null : null
  );
  const [customProduct, setCustomProduct] = useState(stepData.customNicotineProduct || '');
  const [dailyAmount, setDailyAmount] = useState(stepData.dailyAmount?.toString() || '');

  const handleProductSelect = (product: NicotineProductOption) => {
    setSelectedProduct(product);
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
        harmLevel: 5, // Default value
      },
      customNicotineProduct: selectedProduct.id === 'other' ? customProduct : '',
      usageDuration: '1_to_3_years', // Default value
      dailyAmount: parseFloat(dailyAmount),
      dailyCost: selectedProduct.avgCostPerDay, // Use default cost
    };

    dispatch(updateStepData(profileData));
    await dispatch(saveOnboardingProgress(profileData));
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

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={[styles.progressFill, { width: '25%' }]}
          />
        </View>
        <Text style={styles.progressText}>Step 2 of 8</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
                <Text style={styles.productIcon}>{product.icon}</Text>
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
              Just a rough estimate - we'll use this to track your progress!
            </Text>
            <TextInput
              style={styles.numberInput}
              value={dailyAmount}
              onChangeText={setDailyAmount}
              placeholder="Enter amount"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              autoFocus={selectedProduct ? true : false}
            />
          </View>
        )}

        {/* Encouragement - Only show when both product and amount are filled */}
        {selectedProduct && dailyAmount && (
          <View style={styles.encouragementContainer}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
              style={styles.encouragementCard}
            >
              <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
              <Text style={styles.encouragementText}>
                Perfect! We'll use this to create your personalized quit strategy.
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

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>Next: Your Motivations</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.text} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingBottom: SPACING['2xl'],
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
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  productCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  productIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
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
  numberInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    fontSize: 20,
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.primary,
    textAlign: 'center',
    fontWeight: 'bold',
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
    paddingVertical: SPACING.lg,
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
});

export default NicotineProfileStep; 