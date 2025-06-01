import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  TextInput,
  Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { nextStep, previousStep, updateStepData, saveOnboardingProgress } from '../../../store/slices/onboardingSlice';
import { COLORS, SPACING } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface TriggerOption {
  id: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  description: string;
  category: 'timing' | 'emotional' | 'situational';
}

interface SituationOption {
  id: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  description: string;
}

interface CopingOption {
  id: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  description: string;
}

const CRAVING_TRIGGERS: TriggerOption[] = [
  // Timing Triggers
  { 
    id: 'morning_routine', 
    label: 'Morning Routine', 
    iconName: 'sunny-outline',
    iconColor: '#FFD700',
    iconBg: 'rgba(255, 215, 0, 0.15)',
    description: 'First thing in the morning',
    category: 'timing'
  },
  { 
    id: 'after_meals', 
    label: 'After Eating', 
    iconName: 'restaurant-outline',
    iconColor: '#FF6B6B',
    iconBg: 'rgba(255, 107, 107, 0.15)',
    description: 'After meals or snacks',
    category: 'timing'
  },
  { 
    id: 'with_coffee', 
    label: 'With Coffee/Drinks', 
    iconName: 'cafe-outline',
    iconColor: '#8B4513',
    iconBg: 'rgba(139, 69, 19, 0.15)',
    description: 'While drinking coffee or other beverages',
    category: 'timing'
  },
  { 
    id: 'work_breaks', 
    label: 'Work Breaks', 
    iconName: 'briefcase-outline',
    iconColor: '#4682B4',
    iconBg: 'rgba(70, 130, 180, 0.15)',
    description: 'During work breaks or downtime',
    category: 'timing'
  },
  { 
    id: 'evening_wind_down', 
    label: 'Evening Routine', 
    iconName: 'moon-outline',
    iconColor: '#9370DB',
    iconBg: 'rgba(147, 112, 219, 0.15)',
    description: 'Evening wind-down time',
    category: 'timing'
  },

  // Emotional Triggers
  { 
    id: 'stress', 
    label: 'Stress', 
    iconName: 'flash-outline',
    iconColor: '#FF4500',
    iconBg: 'rgba(255, 69, 0, 0.15)',
    description: 'When feeling overwhelmed or pressured',
    category: 'emotional'
  },
  { 
    id: 'boredom', 
    label: 'Boredom', 
    iconName: 'time-outline',
    iconColor: '#808080',
    iconBg: 'rgba(128, 128, 128, 0.15)',
    description: 'When nothing interesting is happening',
    category: 'emotional'
  },
  { 
    id: 'anxiety', 
    label: 'Anxiety', 
    iconName: 'heart-outline',
    iconColor: '#DC143C',
    iconBg: 'rgba(220, 20, 60, 0.15)',
    description: 'When feeling nervous or anxious',
    category: 'emotional'
  },
  { 
    id: 'sadness', 
    label: 'Sadness', 
    iconName: 'sad-outline',
    iconColor: '#4682B4',
    iconBg: 'rgba(70, 130, 180, 0.15)',
    description: 'When feeling down or depressed',
    category: 'emotional'
  },
  { 
    id: 'anger', 
    label: 'Anger/Frustration', 
    iconName: 'warning-outline',
    iconColor: '#FF6347',
    iconBg: 'rgba(255, 99, 71, 0.15)',
    description: 'When feeling angry or frustrated',
    category: 'emotional'
  },

  // Situational Triggers
  { 
    id: 'social_events', 
    label: 'Social Events', 
    iconName: 'people-outline',
    iconColor: '#32CD32',
    iconBg: 'rgba(50, 205, 50, 0.15)',
    description: 'Parties, gatherings, or social situations',
    category: 'situational'
  },
  { 
    id: 'driving', 
    label: 'Driving', 
    iconName: 'car-outline',
    iconColor: '#20B2AA',
    iconBg: 'rgba(32, 178, 170, 0.15)',
    description: 'While driving or in traffic',
    category: 'situational'
  },
  { 
    id: 'alcohol', 
    label: 'With Alcohol', 
    iconName: 'wine-outline',
    iconColor: '#8B0000',
    iconBg: 'rgba(139, 0, 0, 0.15)',
    description: 'When drinking alcohol',
    category: 'situational'
  },
  { 
    id: 'phone_calls', 
    label: 'Phone Calls', 
    iconName: 'call-outline',
    iconColor: '#4169E1',
    iconBg: 'rgba(65, 105, 225, 0.15)',
    description: 'During phone conversations',
    category: 'situational'
  }
];

const HIGH_RISK_SITUATIONS: SituationOption[] = [
  { 
    id: 'bad_day_at_work', 
    label: 'Bad Day at Work', 
    iconName: 'briefcase-outline',
    iconColor: '#FF6B6B',
    iconBg: 'rgba(255, 107, 107, 0.15)',
    description: 'Stressful work situations'
  },
  { 
    id: 'arguments', 
    label: 'Arguments/Conflict', 
    iconName: 'warning-outline',
    iconColor: '#FF4500',
    iconBg: 'rgba(255, 69, 0, 0.15)',
    description: 'Fights or disagreements'
  },
  { 
    id: 'financial_stress', 
    label: 'Financial Pressure', 
    iconName: 'card-outline',
    iconColor: '#DC143C',
    iconBg: 'rgba(220, 20, 60, 0.15)',
    description: 'Money worries or bills'
  },
  { 
    id: 'family_events', 
    label: 'Family Gatherings', 
    iconName: 'home-outline',
    iconColor: '#4ECDC4',
    iconBg: 'rgba(78, 205, 196, 0.15)',
    description: 'Family holidays or reunions'
  },
  { 
    id: 'relationship_issues', 
    label: 'Relationship Problems', 
    iconName: 'heart-dislike-outline',
    iconColor: '#FF69B4',
    iconBg: 'rgba(255, 105, 180, 0.15)',
    description: 'Romantic or friendship issues'
  },
  { 
    id: 'health_concerns', 
    label: 'Health Worries', 
    iconName: 'medical-outline',
    iconColor: '#9370DB',
    iconBg: 'rgba(147, 112, 219, 0.15)',
    description: 'Health scares or medical issues'
  },
  { 
    id: 'travel', 
    label: 'Travel/Airports', 
    iconName: 'airplane-outline',
    iconColor: '#20B2AA',
    iconBg: 'rgba(32, 178, 170, 0.15)',
    description: 'Traveling or waiting in airports'
  },
  { 
    id: 'celebrations', 
    label: 'Celebrations', 
    iconName: 'gift-outline',
    iconColor: '#FFD700',
    iconBg: 'rgba(255, 215, 0, 0.15)',
    description: 'Birthdays, achievements, good news'
  }
];

const CURRENT_COPING: CopingOption[] = [
  { 
    id: 'exercise', 
    label: 'Exercise', 
    iconName: 'fitness-outline',
    iconColor: '#32CD32',
    iconBg: 'rgba(50, 205, 50, 0.15)',
    description: 'Physical activity or sports'
  },
  { 
    id: 'food', 
    label: 'Eating/Snacking', 
    iconName: 'pizza-outline',
    iconColor: '#FF6347',
    iconBg: 'rgba(255, 99, 71, 0.15)',
    description: 'Comfort eating or snacks'
  },
  { 
    id: 'social_media', 
    label: 'Social Media', 
    iconName: 'phone-portrait-outline',
    iconColor: '#4169E1',
    iconBg: 'rgba(65, 105, 225, 0.15)',
    description: 'Scrolling apps or browsing'
  },
  { 
    id: 'tv_gaming', 
    label: 'TV/Gaming', 
    iconName: 'game-controller-outline',
    iconColor: '#9370DB',
    iconBg: 'rgba(147, 112, 219, 0.15)',
    description: 'Entertainment and games'
  },
  { 
    id: 'music', 
    label: 'Music', 
    iconName: 'musical-notes-outline',
    iconColor: '#FF69B4',
    iconBg: 'rgba(255, 105, 180, 0.15)',
    description: 'Listening to music'
  },
  { 
    id: 'sleep', 
    label: 'Sleep/Rest', 
    iconName: 'bed-outline',
    iconColor: '#4682B4',
    iconBg: 'rgba(70, 130, 180, 0.15)',
    description: 'Taking naps or going to bed'
  },
  { 
    id: 'shopping', 
    label: 'Shopping', 
    iconName: 'bag-outline',
    iconColor: '#FFD700',
    iconBg: 'rgba(255, 215, 0, 0.15)',
    description: 'Retail therapy or browsing'
  },
  { 
    id: 'talking', 
    label: 'Talking to Others', 
    iconName: 'chatbubbles-outline',
    iconColor: '#20B2AA',
    iconBg: 'rgba(32, 178, 170, 0.15)',
    description: 'Calling friends or family'
  }
];

const TriggerAnalysisStep: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stepData } = useSelector((state: RootState) => state.onboarding);

  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(stepData.cravingTriggers || []);
  const [selectedSituations, setSelectedSituations] = useState<string[]>(stepData.highRiskSituations || []);
  const [selectedCoping, setSelectedCoping] = useState<string[]>(stepData.currentCopingMechanisms || []);
  const [customTrigger, setCustomTrigger] = useState(stepData.customCravingTrigger || '');

  // Calculate completion status for each section
  const triggersComplete = selectedTriggers.length > 0 || customTrigger.trim().length > 0;
  const situationsComplete = selectedSituations.length > 0;
  const copingComplete = selectedCoping.length > 0;
  const sectionsCompleted = [triggersComplete, situationsComplete, copingComplete].filter(Boolean).length;

  const handleTriggerToggle = (triggerId: string) => {
    setSelectedTriggers(prev => 
      prev.includes(triggerId) 
        ? prev.filter(id => id !== triggerId)
        : [...prev, triggerId]
    );
  };

  const handleSituationToggle = (situationId: string) => {
    setSelectedSituations(prev => 
      prev.includes(situationId) 
        ? prev.filter(id => id !== situationId)
        : [...prev, situationId]
    );
  };

  const handleCopingToggle = (copingId: string) => {
    setSelectedCoping(prev => 
      prev.includes(copingId) 
        ? prev.filter(id => id !== copingId)
        : [...prev, copingId]
    );
  };

  const handleContinue = async () => {
    const triggerData = {
      cravingTriggers: selectedTriggers,
      customCravingTrigger: customTrigger.trim(),
      highRiskSituations: selectedSituations,
      currentCopingMechanisms: selectedCoping,
    };

    dispatch(updateStepData(triggerData));
    await dispatch(saveOnboardingProgress(triggerData));
    dispatch(nextStep());
  };

  const handleBack = () => {
    dispatch(previousStep());
  };

  const getCategoryTriggers = (category: 'timing' | 'emotional' | 'situational') => {
    return CRAVING_TRIGGERS.filter(trigger => trigger.category === category);
  };

  const renderTriggerOption = (trigger: TriggerOption) => (
    <TouchableOpacity
      key={trigger.id}
      style={[
        styles.optionCard,
        selectedTriggers.includes(trigger.id) && styles.optionCardSelected
      ]}
      onPress={() => handleTriggerToggle(trigger.id)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          selectedTriggers.includes(trigger.id)
            ? [trigger.iconColor + '40', trigger.iconColor + '20']
            : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
        }
        style={styles.optionCardGradient}
      >
        <View style={[styles.optionIcon, { backgroundColor: trigger.iconBg }]}>
          <Ionicons name={trigger.iconName} size={24} color={trigger.iconColor} />
        </View>
        <View style={styles.optionContent}>
          <Text style={[
            styles.optionLabel,
            selectedTriggers.includes(trigger.id) && styles.optionLabelSelected
          ]}>
            {trigger.label}
          </Text>
          <Text style={styles.optionDescription}>{trigger.description}</Text>
        </View>
        {selectedTriggers.includes(trigger.id) && (
          <Ionicons name="checkmark-circle" size={24} color={trigger.iconColor} />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSituationOption = (situation: SituationOption) => (
    <TouchableOpacity
      key={situation.id}
      style={[
        styles.optionCard,
        selectedSituations.includes(situation.id) && styles.optionCardSelected
      ]}
      onPress={() => handleSituationToggle(situation.id)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          selectedSituations.includes(situation.id)
            ? [situation.iconColor + '40', situation.iconColor + '20']
            : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
        }
        style={styles.optionCardGradient}
      >
        <View style={[styles.optionIcon, { backgroundColor: situation.iconBg }]}>
          <Ionicons name={situation.iconName} size={24} color={situation.iconColor} />
        </View>
        <View style={styles.optionContent}>
          <Text style={[
            styles.optionLabel,
            selectedSituations.includes(situation.id) && styles.optionLabelSelected
          ]}>
            {situation.label}
          </Text>
          <Text style={styles.optionDescription}>{situation.description}</Text>
        </View>
        {selectedSituations.includes(situation.id) && (
          <Ionicons name="checkmark-circle" size={24} color={situation.iconColor} />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCopingOption = (coping: CopingOption) => (
    <TouchableOpacity
      key={coping.id}
      style={[
        styles.optionCard,
        selectedCoping.includes(coping.id) && styles.optionCardSelected
      ]}
      onPress={() => handleCopingToggle(coping.id)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          selectedCoping.includes(coping.id)
            ? [coping.iconColor + '40', coping.iconColor + '20']
            : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
        }
        style={styles.optionCardGradient}
      >
        <View style={[styles.optionIcon, { backgroundColor: coping.iconBg }]}>
          <Ionicons name={coping.iconName} size={24} color={coping.iconColor} />
        </View>
        <View style={styles.optionContent}>
          <Text style={[
            styles.optionLabel,
            selectedCoping.includes(coping.id) && styles.optionLabelSelected
          ]}>
            {coping.label}
          </Text>
          <Text style={styles.optionDescription}>{coping.description}</Text>
        </View>
        {selectedCoping.includes(coping.id) && (
          <Ionicons name="checkmark-circle" size={24} color={coping.iconColor} />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderTriggersSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>1</Text>
          </View>
          <View style={styles.sectionInfo}>
            <Text style={styles.sectionTitle}>When do you usually crave nicotine?</Text>
            <Text style={styles.sectionSubtitle}>
              Select all situations that trigger your cravings
            </Text>
          </View>
          {triggersComplete && (
            <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
          )}
        </View>
      </View>

      {/* Timing Triggers */}
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>⏰ Daily Timing</Text>
        {getCategoryTriggers('timing').map(renderTriggerOption)}
      </View>

      {/* Emotional Triggers */}
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>💭 Emotional States</Text>
        {getCategoryTriggers('emotional').map(renderTriggerOption)}
      </View>

      {/* Situational Triggers */}
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>🏠 Situations</Text>
        {getCategoryTriggers('situational').map(renderTriggerOption)}
      </View>

      {/* Custom Trigger Input */}
      <View style={styles.customInputSection}>
        <Text style={styles.customInputLabel}>Other triggers not listed?</Text>
        <TextInput
          style={styles.customInput}
          placeholder="Describe your unique trigger..."
          placeholderTextColor={COLORS.textMuted}
          value={customTrigger}
          onChangeText={setCustomTrigger}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderSituationsSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>2</Text>
          </View>
          <View style={styles.sectionInfo}>
            <Text style={styles.sectionTitle}>What are your highest risk situations?</Text>
            <Text style={styles.sectionSubtitle}>
              Moments when cravings hit hardest
            </Text>
          </View>
          {situationsComplete && (
            <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
          )}
        </View>
      </View>

      <View style={styles.optionsGrid}>
        {HIGH_RISK_SITUATIONS.map(renderSituationOption)}
      </View>
    </View>
  );

  const renderCopingSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>3</Text>
          </View>
          <View style={styles.sectionInfo}>
            <Text style={styles.sectionTitle}>How do you currently handle stress?</Text>
            <Text style={styles.sectionSubtitle}>
              Your existing coping strategies
            </Text>
          </View>
          {copingComplete && (
            <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
          )}
        </View>
      </View>

      <View style={styles.optionsGrid}>
        {CURRENT_COPING.map(renderCopingOption)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={[styles.progressFill, { width: '50%' }]}
          />
        </View>
        <Text style={styles.progressText}>Step 4 of 8</Text>
      </View>

      {/* Header with completion status */}
      <View style={styles.header}>
        <Text style={styles.title}>Understanding Your Triggers</Text>
        <View style={styles.completionStatus}>
          <View style={[
            styles.completionBadge,
            sectionsCompleted === 3 && styles.completionBadgeComplete
          ]}>
            <Text style={[
              styles.completionText,
              sectionsCompleted === 3 && styles.completionTextComplete
            ]}>
              {sectionsCompleted} of 3 sections complete
            </Text>
          </View>
          {sectionsCompleted < 3 && (
            <Text style={styles.completionHint}>Complete all sections to continue</Text>
          )}
        </View>
      </View>

      {/* Section Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderTriggersSection()}
        <View style={styles.sectionDivider} />
        {renderSituationsSection()}
        <View style={styles.sectionDivider} />
        {renderCopingSection()}
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
            (!triggersComplete || !situationsComplete || !copingComplete) && styles.continueButtonDisabled
          ]} 
          onPress={handleContinue}
          disabled={!triggersComplete || !situationsComplete || !copingComplete}
        >
          <LinearGradient
            colors={
              (triggersComplete && situationsComplete && copingComplete)
                ? [COLORS.primary, COLORS.secondary]
                : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
            }
            style={styles.continueButtonGradient}
          >
            <Text style={[
              styles.continueButtonText,
              (!triggersComplete || !situationsComplete || !copingComplete) && styles.continueButtonTextDisabled
            ]}>
              {sectionsCompleted < 3 ? `Complete ${3 - sectionsCompleted} more section${3 - sectionsCompleted > 1 ? 's' : ''}` : 'Continue'}
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color={(triggersComplete && situationsComplete && copingComplete) ? COLORS.text : COLORS.textMuted} 
            />
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
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  sectionNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  categorySection: {
    marginBottom: SPACING.xl,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  optionsGrid: {
    marginBottom: SPACING.xl,
  },
  optionCard: {
    marginBottom: SPACING.md,
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  optionCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  optionCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: SPACING.lg,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: COLORS.text,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  customInputSection: {
    marginBottom: SPACING.xl,
  },
  customInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  customInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    fontSize: 16,
    color: COLORS.text,
    textAlignVertical: 'top',
    minHeight: 80,
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
    fontWeight: '500',
  },
  continueButton: {
    borderRadius: SPACING.lg,
    overflow: 'hidden',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  continueButtonTextDisabled: {
    color: COLORS.textMuted,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
    lineHeight: 32,
  },
  completionStatus: {
    alignItems: 'center',
  },
  completionBadge: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  completionBadgeComplete: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: COLORS.primary,
  },
  completionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  completionTextComplete: {
    color: COLORS.primary,
  },
  completionHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: SPACING.xl,
  },
});

export default TriggerAnalysisStep; 