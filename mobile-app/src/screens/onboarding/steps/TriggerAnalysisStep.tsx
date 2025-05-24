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
  const [currentSection, setCurrentSection] = useState<'triggers' | 'situations' | 'coping'>('triggers');

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
    if (selectedTriggers.length === 0 && !customTrigger.trim()) {
      Alert.alert(
        'Help us understand your triggers', 
        'Identifying what makes you crave nicotine helps us create better strategies to overcome those moments.'
      );
      return;
    }

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
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>When do you usually crave nicotine?</Text>
      <Text style={styles.sectionSubtitle}>
        Select all situations that trigger your cravings. Understanding your patterns is the first step to freedom.
      </Text>

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
    </ScrollView>
  );

  const renderSituationsSection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>What are your highest risk situations?</Text>
      <Text style={styles.sectionSubtitle}>
        These are the challenging moments when cravings hit hardest. Knowing them helps us prepare defenses.
      </Text>

      <View style={styles.optionsGrid}>
        {HIGH_RISK_SITUATIONS.map(renderSituationOption)}
      </View>
    </ScrollView>
  );

  const renderCopingSection = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>How do you currently handle stress?</Text>
      <Text style={styles.sectionSubtitle}>
        Understanding your current coping strategies helps us suggest healthier alternatives and build on what already works.
      </Text>

      <View style={styles.optionsGrid}>
        {CURRENT_COPING.map(renderCopingOption)}
      </View>
    </ScrollView>
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
        <Text style={styles.progressText}>Step 4 of 8 - Understanding Your Triggers</Text>
      </View>

      {/* Section Navigation */}
      <View style={styles.sectionTabs}>
        <TouchableOpacity
          style={[
            styles.sectionTab,
            currentSection === 'triggers' && styles.sectionTabActive
          ]}
          onPress={() => setCurrentSection('triggers')}
        >
          <Text style={[
            styles.sectionTabText,
            currentSection === 'triggers' && styles.sectionTabTextActive
          ]}>
            Triggers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sectionTab,
            currentSection === 'situations' && styles.sectionTabActive
          ]}
          onPress={() => setCurrentSection('situations')}
        >
          <Text style={[
            styles.sectionTabText,
            currentSection === 'situations' && styles.sectionTabTextActive
          ]}>
            High Risk
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sectionTab,
            currentSection === 'coping' && styles.sectionTabActive
          ]}
          onPress={() => setCurrentSection('coping')}
        >
          <Text style={[
            styles.sectionTabText,
            currentSection === 'coping' && styles.sectionTabTextActive
          ]}>
            Current Coping
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section Content */}
      <View style={styles.content}>
        {currentSection === 'triggers' && renderTriggersSection()}
        {currentSection === 'situations' && renderSituationsSection()}
        {currentSection === 'coping' && renderCopingSection()}
      </View>

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
            <Text style={styles.continueButtonText}>Continue</Text>
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
    fontWeight: '500',
  },
  sectionTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.md,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.sm,
    alignItems: 'center',
  },
  sectionTabActive: {
    backgroundColor: COLORS.primary,
  },
  sectionTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  sectionTabTextActive: {
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 30,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xl,
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
});

export default TriggerAnalysisStep; 