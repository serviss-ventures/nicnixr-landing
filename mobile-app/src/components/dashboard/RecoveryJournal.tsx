import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPACING } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface JournalData {
  // Core Mental Health
  moodPositive: boolean | null;
  hadCravings: boolean | null;
  cravingIntensity: number; // 1-10 scale
  stressHigh: boolean | null;
  anxietyLevel: number; // 1-10 scale
  
  // Core Physical
  sleepQuality: boolean | null;
  sleepHours: number;
  energyLevel: number; // 1-10 scale
  
  // Core Behavioral
  triggersEncountered: boolean | null;
  copingStrategiesUsed: boolean | null;
  
  // Additional Mental Health
  usedBreathing: boolean | null;
  meditationMinutes: number;
  moodSwings: boolean | null;
  irritability: boolean | null;
  concentration: number; // 1-10 scale
  
  // Additional Physical
  waterGlasses: number;
  exercised: boolean | null;
  exerciseMinutes: number;
  appetite: number; // 1-10 scale
  headaches: boolean | null;
  
  // Additional Behavioral
  socialSupport: boolean | null;
  avoidedTriggers: boolean | null;
  productiveDay: boolean | null;
  
  // Additional Wellness
  gratefulFor: string;
  biggestChallenge: string;
  tomorrowGoal: string;
  
  // Custom Notes
  notes: string;
}

interface EnabledFactors {
  // Core factors (enabled by default)
  moodState: boolean;
  cravingTracking: boolean;
  cravingIntensity: boolean;
  stressLevel: boolean;
  anxietyLevel: boolean;
  sleepQuality: boolean;
  sleepDuration: boolean;
  energyLevel: boolean;
  triggersEncountered: boolean;
  copingStrategiesUsed: boolean;
  
  // Additional factors (opt-in)
  breathingExercises: boolean;
  meditationTime: boolean;
  moodSwings: boolean;
  irritability: boolean;
  concentration: boolean;
  hydrationLevel: boolean;
  physicalActivity: boolean;
  exerciseDuration: boolean;
  appetite: boolean;
  headaches: boolean;
  socialInteractions: boolean;
  avoidedTriggers: boolean;
  productiveDay: boolean;
  gratefulFor: boolean;
  biggestChallenge: boolean;
  tomorrowGoal: boolean;
}

interface RecoveryJournalProps {
  visible: boolean;
  onClose: () => void;
  daysClean: number;
}

const STORAGE_KEY = '@recovery_journal_factors';

const RecoveryJournal: React.FC<RecoveryJournalProps> = ({ visible, onClose, daysClean }) => {
  const [showCustomize, setShowCustomize] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Text input modal state
  const [textInputModalVisible, setTextInputModalVisible] = useState(false);
  const [textInputModalConfig, setTextInputModalConfig] = useState<{
    title: string;
    placeholder: string;
    value: string;
    dataKey: keyof JournalData;
    maxLength: number;
  }>({
    title: '',
    placeholder: '',
    value: '',
    dataKey: 'notes',
    maxLength: 500,
  });
  const [tempTextValue, setTempTextValue] = useState('');
  
  const [journalData, setJournalData] = useState<JournalData>({
    // Core Mental Health
    moodPositive: null,
    hadCravings: null,
    cravingIntensity: 5,
    stressHigh: null,
    anxietyLevel: 5,
    
    // Core Physical
    sleepQuality: null,
    sleepHours: 7,
    energyLevel: 5,
    
    // Core Behavioral
    triggersEncountered: null,
    copingStrategiesUsed: null,
    
    // Additional Mental Health
    usedBreathing: null,
    meditationMinutes: 0,
    moodSwings: null,
    irritability: null,
    concentration: 5,
    
    // Additional Physical
    waterGlasses: 0,
    exercised: null,
    exerciseMinutes: 0,
    appetite: 5,
    headaches: null,
    
    // Additional Behavioral
    socialSupport: null,
    avoidedTriggers: null,
    productiveDay: null,
    
    // Additional Wellness
    gratefulFor: '',
    biggestChallenge: '',
    tomorrowGoal: '',
    
    // Custom Notes
    notes: '',
  });

  const [enabledFactors, setEnabledFactors] = useState<EnabledFactors>({
    // Core factors (enabled by default)
    moodState: true,
    cravingTracking: true,
    cravingIntensity: true,
    stressLevel: true,
    anxietyLevel: true,
    sleepQuality: true,
    sleepDuration: true,
    energyLevel: true,
    triggersEncountered: true,
    copingStrategiesUsed: true,
    
    // Additional factors (opt-in)
    breathingExercises: false,
    meditationTime: false,
    moodSwings: false,
    irritability: false,
    concentration: false,
    hydrationLevel: false,
    physicalActivity: false,
    exerciseDuration: false,
    appetite: false,
    headaches: false,
    socialInteractions: false,
    avoidedTriggers: false,
    productiveDay: false,
    gratefulFor: false,
    biggestChallenge: false,
    tomorrowGoal: false,
  });

  // Load saved preferences
  useEffect(() => {
    loadEnabledFactors();
  }, []);

  // Handle customize animation
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showCustomize ? -SCREEN_WIDTH : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showCustomize]);

  // Removed keyboard event listeners - might be interfering

  const loadEnabledFactors = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const savedFactors = JSON.parse(saved);
        // Ensure core factors are always enabled
        const factorsWithCore = {
          ...savedFactors,
          // Core factors must always be enabled
          moodState: true,
          cravingTracking: true,
          cravingIntensity: true,
          stressLevel: true,
          anxietyLevel: true,
          sleepQuality: true,
          sleepDuration: true,
          energyLevel: true,
          triggersEncountered: true,
          copingStrategiesUsed: true,
        };
        setEnabledFactors(factorsWithCore);
      }
      // If no saved preferences, the default state already has core factors enabled
    } catch (error) {
      console.error('Failed to load journal preferences:', error);
    }
  };

  const saveEnabledFactors = async (factors: EnabledFactors) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(factors));
    } catch (error) {
      console.error('Failed to save journal preferences:', error);
    }
  };

  const updateJournalData = useCallback((key: keyof JournalData, value: boolean | number | string | null) => {
    setJournalData(prev => ({ ...prev, [key]: value }));
    // Only haptic feedback for non-text inputs
    if (typeof value !== 'string') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handleComplete = useCallback(async () => {
    // Check if at least some data was entered
    const hasData = Object.values(journalData).some(val => val !== null && val !== 0);
    
    if (!hasData) {
      Alert.alert('No Data', 'Please track at least one factor before saving.');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // TODO: Save to analytics database
    console.log('💾 Journal Data:', journalData);
    
    // Reset data
    setJournalData({
      // Core Mental Health
      moodPositive: null,
      hadCravings: null,
      cravingIntensity: 5,
      stressHigh: null,
      anxietyLevel: 5,
      
      // Core Physical
      sleepQuality: null,
      sleepHours: 7,
      energyLevel: 5,
      
      // Core Behavioral
      triggersEncountered: null,
      copingStrategiesUsed: null,
      
      // Additional Mental Health
      usedBreathing: null,
      meditationMinutes: 0,
      moodSwings: null,
      irritability: null,
      concentration: 5,
      
      // Additional Physical
      waterGlasses: 0,
      exercised: null,
      exerciseMinutes: 0,
      appetite: 5,
      headaches: null,
      
      // Additional Behavioral
      socialSupport: null,
      avoidedTriggers: null,
      productiveDay: null,
      
      // Additional Wellness
      gratefulFor: '',
      biggestChallenge: '',
      tomorrowGoal: '',
      
      // Custom Notes
      notes: '',
    });
    
    onClose();
    
    setTimeout(() => {
      Alert.alert('Journal Saved', 'Great job tracking your recovery today! 🎉');
    }, 300);
  }, [journalData, onClose]);

  const handleCustomizeSave = useCallback((factors: EnabledFactors) => {
    setEnabledFactors(factors);
    saveEnabledFactors(factors);
    setShowCustomize(false);
  }, []);

  // Open text input modal
  const openTextInputModal = useCallback((config: {
    title: string;
    placeholder: string;
    value: string;
    dataKey: keyof JournalData;
    maxLength: number;
  }) => {
    setTextInputModalConfig(config);
    setTempTextValue(config.value);
    setTextInputModalVisible(true);
  }, []);

  // Save text from modal
  const saveTextFromModal = useCallback(() => {
    updateJournalData(textInputModalConfig.dataKey, tempTextValue);
    setTextInputModalVisible(false);
  }, [textInputModalConfig.dataKey, tempTextValue, updateJournalData]);

  // Quick toggle component
  const QuickToggle = ({ 
    question, 
    dataKey, 
    value 
  }: { 
    question: string; 
    dataKey: keyof JournalData; 
    value: boolean | null;
  }) => (
    <View style={styles.quickItem}>
      <Text style={styles.quickQuestion}>{question}</Text>
      <View style={styles.quickToggleGroup}>
        <TouchableOpacity 
          style={[
            styles.quickToggle,
            value === false && styles.quickToggleNo
          ]}
          onPress={() => updateJournalData(dataKey, false)}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color={value === false ? "#FFFFFF" : "#6B7280"} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.quickToggle,
            value === true && styles.quickToggleYes
          ]}
          onPress={() => updateJournalData(dataKey, true)}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark" size={18} color={value === true ? "#FFFFFF" : "#6B7280"} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Scale component for 1-10 ratings
  const QuickScale = ({ 
    title, 
    dataKey, 
    value,
    lowLabel = 'Low',
    highLabel = 'High'
  }: { 
    title: string; 
    dataKey: keyof JournalData; 
    value: number;
    lowLabel?: string;
    highLabel?: string;
  }) => (
    <View style={styles.scaleContainer}>
      <Text style={styles.scaleTitle}>{title}</Text>
      <View style={styles.scaleLabels}>
        <Text style={styles.scaleLabelText}>{lowLabel}</Text>
        <Text style={styles.scaleValue}>{value}</Text>
        <Text style={styles.scaleLabelText}>{highLabel}</Text>
      </View>
      <View style={styles.scaleRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.scaleButton,
              value === num && styles.scaleButtonActive
            ]}
            onPress={() => updateJournalData(dataKey, num)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.scaleButtonText,
              value === num && styles.scaleButtonTextActive
            ]}>
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Replace the existing QuickTextInput component with this simpler version
  const QuickTextInput = ({ 
    title, 
    dataKey, 
    value,
    placeholder
  }: { 
    title: string; 
    dataKey: keyof JournalData; 
    value: string;
    placeholder: string;
  }) => {
    const maxLength = dataKey === 'notes' ? 500 : 200;
    
    return (
      <TouchableOpacity
        style={styles.textInputContainer}
        onPress={() => openTextInputModal({
          title: title || 'Add your thoughts',
          placeholder,
          value,
          dataKey,
          maxLength,
        })}
        activeOpacity={0.7}
      >
        {title ? <Text style={styles.textInputTitle}>{title}</Text> : null}
        <View style={[styles.textInputButton, value && styles.textInputButtonFilled]}>
          {value ? (
            <Text style={styles.textInputValue} numberOfLines={dataKey === 'notes' ? 4 : 2}>
              {value}
            </Text>
          ) : (
            <Text style={styles.textInputPlaceholder}>
              {placeholder}
            </Text>
          )}
          <Ionicons 
            name={value ? "create-outline" : "add-circle-outline"} 
            size={20} 
            color={value ? "#10B981" : "#6B7280"} 
          />
        </View>
        {dataKey === 'notes' && value && (
          <Text style={styles.inputHelper}>{value.length}/500 characters</Text>
        )}
      </TouchableOpacity>
    );
  };

  // Counter component
  const QuickCounter = ({ 
    title, 
    dataKey, 
    value, 
    unit, 
    min = 0, 
    max = 24, 
    step = 1 
  }: { 
    title: string; 
    dataKey: keyof JournalData; 
    value: number; 
    unit: string;
    min?: number;
    max?: number;
    step?: number;
  }) => (
    <View style={styles.counterContainer}>
      <Text style={styles.counterTitle}>{title}</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity 
          style={[
            styles.counterButton,
            value <= min && styles.counterButtonDisabled
          ]}
          onPress={() => updateJournalData(dataKey, Math.max(min, value - step))}
          activeOpacity={0.7}
          disabled={value <= min}
        >
          <Ionicons name="remove" size={20} color={value <= min ? "#374151" : "#FFFFFF"} />
        </TouchableOpacity>
        
        <View style={styles.counterValue}>
          <Text style={styles.counterNumber}>{value}</Text>
          <Text style={styles.counterUnit}>{unit}</Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.counterButton,
            value >= max && styles.counterButtonDisabled
          ]}
          onPress={() => updateJournalData(dataKey, Math.min(max, value + step))}
          activeOpacity={0.7}
          disabled={value >= max}
        >
          <Ionicons name="add" size={20} color={value >= max ? "#374151" : "#FFFFFF"} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      transparent={false}
      onRequestClose={() => {
        if (showCustomize) {
          setShowCustomize(false);
        } else {
          onClose();
        }
      }}
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#000000', '#0A0F1C']}
          style={styles.gradient}
        >
          <KeyboardAvoidingView 
            style={styles.modalContent}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            {/* Sliding Container */}
            <Animated.View 
              style={[
                styles.slidingContainer,
                {
                  transform: [{ translateX: slideAnim }]
                }
              ]}
            >
              {/* Journal View */}
              <View style={styles.panelContainer}>
                {/* Header */}
                <View style={styles.header}>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={onClose}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  
                  <View style={styles.titleContainer}>
                    <Text style={styles.title}>Recovery Journal</Text>
                    <View style={styles.dateNavigation}>
                      <TouchableOpacity 
                        style={styles.dateArrow}
                        onPress={() => {
                          const newDate = new Date(selectedDate);
                          newDate.setDate(newDate.getDate() - 1);
                          setSelectedDate(newDate);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="chevron-back" size={20} color="#6B7280" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.dateButton}
                        onPress={() => {
                          setSelectedDate(new Date());
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dateText}>
                          {selectedDate.toDateString() === new Date().toDateString() 
                            ? 'Today' 
                            : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[
                          styles.dateArrow,
                          selectedDate.toDateString() === new Date().toDateString() && styles.dateArrowDisabled
                        ]}
                        onPress={() => {
                          if (selectedDate.toDateString() !== new Date().toDateString()) {
                            const newDate = new Date(selectedDate);
                            newDate.setDate(newDate.getDate() + 1);
                            setSelectedDate(newDate);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                        }}
                        activeOpacity={0.7}
                        disabled={selectedDate.toDateString() === new Date().toDateString()}
                      >
                        <Ionicons 
                          name="chevron-forward" 
                          size={20} 
                          color={selectedDate.toDateString() === new Date().toDateString() ? "#374151" : "#6B7280"} 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.settingsButton}
                    onPress={() => setShowCustomize(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="options-outline" size={22} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView 
                  ref={scrollViewRef}
                  style={styles.content}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="none"
                >
                  {/* Insights Preview - Moved to top for visibility */}
                  <TouchableOpacity 
                    style={styles.insightsPreview}
                    onPress={() => {
                      Alert.alert(
                        '🧠 AI-Powered Insights',
                        'Your journal data will unlock:\n\n• Personalized craving patterns\n• Trigger identification & predictions\n• Mood & energy correlations\n• Custom recovery recommendations\n• Weekly progress reports\n• Milestone celebrations\n\nTrack for 5 days to unlock insights!',
                        [{ text: 'Awesome!', style: 'default' }]
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)']}
                      style={styles.insightsGradient}
                    >
                      <Ionicons name="analytics-outline" size={20} color="#10B981" />
                      <View style={styles.insightsTextContainer}>
                        <Text style={styles.insightsTitle}>Unlock AI Insights</Text>
                        <Text style={styles.insightsSubtitle}>
                          {daysClean >= 5 
                            ? 'Insights now available! Tap to view' 
                            : `Track for ${Math.max(0, 5 - daysClean)} more ${Math.max(0, 5 - daysClean) === 1 ? 'day' : 'days'} to unlock insights`}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#10B981" />
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Core Mental Health Section */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mental Health</Text>
                    
                    {enabledFactors.moodState && (
                      <QuickToggle 
                        question="Feeling positive today?"
                        dataKey="moodPositive"
                        value={journalData.moodPositive}
                      />
                    )}
                    
                    {enabledFactors.cravingTracking && (
                      <QuickToggle 
                        question="Had nicotine cravings?"
                        dataKey="hadCravings"
                        value={journalData.hadCravings}
                      />
                    )}
                    
                    {enabledFactors.cravingIntensity && journalData.hadCravings && (
                      <QuickScale 
                        title="Craving intensity"
                        dataKey="cravingIntensity"
                        value={journalData.cravingIntensity}
                        lowLabel="Mild"
                        highLabel="Intense"
                      />
                    )}
                    
                    {enabledFactors.stressLevel && (
                      <QuickToggle 
                        question="High stress today?"
                        dataKey="stressHigh"
                        value={journalData.stressHigh}
                      />
                    )}
                    
                    {enabledFactors.anxietyLevel && (
                      <QuickScale 
                        title="Anxiety level"
                        dataKey="anxietyLevel"
                        value={journalData.anxietyLevel}
                        lowLabel="Calm"
                        highLabel="Anxious"
                      />
                    )}
                    
                    {enabledFactors.moodSwings && (
                      <QuickToggle 
                        question="Experienced mood swings?"
                        dataKey="moodSwings"
                        value={journalData.moodSwings}
                      />
                    )}
                    
                    {enabledFactors.irritability && (
                      <QuickToggle 
                        question="Feeling irritable?"
                        dataKey="irritability"
                        value={journalData.irritability}
                      />
                    )}
                    
                    {enabledFactors.concentration && (
                      <QuickScale 
                        title="Focus & concentration"
                        dataKey="concentration"
                        value={journalData.concentration}
                        lowLabel="Poor"
                        highLabel="Sharp"
                      />
                    )}
                    
                    {enabledFactors.breathingExercises && (
                      <QuickToggle 
                        question="Used breathing exercises?"
                        dataKey="usedBreathing"
                        value={journalData.usedBreathing}
                      />
                    )}
                    
                    {enabledFactors.meditationTime && (
                      <QuickCounter 
                        title="Meditation time"
                        dataKey="meditationMinutes"
                        value={journalData.meditationMinutes}
                        unit="minutes"
                        min={0}
                        max={60}
                        step={5}
                      />
                    )}
                  </View>

                  {/* Physical Recovery Section */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Physical Recovery</Text>
                    
                    {enabledFactors.sleepQuality && (
                      <QuickToggle 
                        question="Good sleep quality?"
                        dataKey="sleepQuality"
                        value={journalData.sleepQuality}
                      />
                    )}
                    
                    {enabledFactors.sleepDuration && (
                      <QuickCounter 
                        title="Hours of sleep"
                        dataKey="sleepHours"
                        value={journalData.sleepHours}
                        unit="hours"
                        min={0}
                        max={24}
                        step={0.5}
                      />
                    )}
                    
                    {enabledFactors.energyLevel && (
                      <QuickScale 
                        title="Energy level"
                        dataKey="energyLevel"
                        value={journalData.energyLevel}
                        lowLabel="Exhausted"
                        highLabel="Energetic"
                      />
                    )}
                    
                    {enabledFactors.appetite && (
                      <QuickScale 
                        title="Appetite"
                        dataKey="appetite"
                        value={journalData.appetite}
                        lowLabel="Poor"
                        highLabel="Normal"
                      />
                    )}
                    
                    {enabledFactors.headaches && (
                      <QuickToggle 
                        question="Had headaches?"
                        dataKey="headaches"
                        value={journalData.headaches}
                      />
                    )}
                    
                    {enabledFactors.hydrationLevel && (
                      <QuickCounter 
                        title="Water intake"
                        dataKey="waterGlasses"
                        value={journalData.waterGlasses}
                        unit="glasses"
                        min={0}
                        max={20}
                        step={1}
                      />
                    )}
                    
                    {enabledFactors.physicalActivity && (
                      <QuickToggle 
                        question="Exercised today?"
                        dataKey="exercised"
                        value={journalData.exercised}
                      />
                    )}
                    
                    {enabledFactors.exerciseDuration && journalData.exercised && (
                      <QuickCounter 
                        title="Exercise duration"
                        dataKey="exerciseMinutes"
                        value={journalData.exerciseMinutes}
                        unit="minutes"
                        min={0}
                        max={180}
                        step={15}
                      />
                    )}
                  </View>

                  {/* Behavioral Tracking Section */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Behavioral Tracking</Text>
                    
                    {enabledFactors.triggersEncountered && (
                      <QuickToggle 
                        question="Encountered triggers?"
                        dataKey="triggersEncountered"
                        value={journalData.triggersEncountered}
                      />
                    )}
                    
                    {enabledFactors.copingStrategiesUsed && (
                      <QuickToggle 
                        question="Used coping strategies?"
                        dataKey="copingStrategiesUsed"
                        value={journalData.copingStrategiesUsed}
                      />
                    )}
                    
                    {enabledFactors.avoidedTriggers && (
                      <QuickToggle 
                        question="Successfully avoided triggers?"
                        dataKey="avoidedTriggers"
                        value={journalData.avoidedTriggers}
                      />
                    )}
                    
                    {enabledFactors.productiveDay && (
                      <QuickToggle 
                        question="Had a productive day?"
                        dataKey="productiveDay"
                        value={journalData.productiveDay}
                      />
                    )}
                  </View>

                  {/* Wellness Section */}
                  {(enabledFactors.socialInteractions || enabledFactors.gratefulFor || enabledFactors.biggestChallenge || enabledFactors.tomorrowGoal) && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Wellness & Reflection</Text>
                      
                      {enabledFactors.socialInteractions && (
                        <QuickToggle 
                          question="Had social support?"
                          dataKey="socialSupport"
                          value={journalData.socialSupport}
                        />
                      )}
                      
                      {enabledFactors.gratefulFor && (
                        <QuickTextInput 
                          title="What are you grateful for today?"
                          dataKey="gratefulFor"
                          value={journalData.gratefulFor}
                          placeholder="Share something positive from your day..."
                        />
                      )}
                      
                      {enabledFactors.biggestChallenge && (
                        <QuickTextInput 
                          title="What was your biggest challenge?"
                          dataKey="biggestChallenge"
                          value={journalData.biggestChallenge}
                          placeholder="Describe any difficulties you faced..."
                        />
                      )}
                      
                      {enabledFactors.tomorrowGoal && (
                        <QuickTextInput 
                          title="What's your goal for tomorrow?"
                          dataKey="tomorrowGoal"
                          value={journalData.tomorrowGoal}
                          placeholder="Set an intention for tomorrow..."
                        />
                      )}
                    </View>
                  )}

                  {/* Custom Notes Section */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Journal Notes</Text>
                    <QuickTextInput 
                      title=""
                      dataKey="notes"
                      value={journalData.notes}
                      placeholder="Add any additional thoughts, observations, or reflections about your recovery journey today..."
                    />
                  </View>
                </ScrollView>

                {/* Save Button */}
                <View style={styles.footer}>
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleComplete}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={styles.saveGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.saveText}>Save Journal Entry</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Customize View */}
              <CustomizePanel 
                enabledFactors={enabledFactors}
                onSave={handleCustomizeSave}
                onClose={() => setShowCustomize(false)}
              />
            </Animated.View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </SafeAreaView>

      {/* Text Input Modal */}
      <Modal
        visible={textInputModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTextInputModalVisible(false)}
      >
        <View style={styles.textModalOverlay}>
          <TouchableOpacity 
            style={styles.textModalBackdrop} 
            activeOpacity={1} 
            onPress={() => setTextInputModalVisible(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.textModalKeyboardView}
          >
            <View style={styles.textModalContent}>
              <View style={styles.textModalDragIndicator} />
              <View style={styles.textModalHeader}>
                <Text style={styles.textModalTitle}>{textInputModalConfig.title}</Text>
                <TouchableOpacity 
                  onPress={() => setTextInputModalVisible(false)} 
                  style={styles.textModalCloseButton}
                >
                  <Ionicons name="close-circle" size={28} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.textModalInput}
                placeholder={textInputModalConfig.placeholder}
                placeholderTextColor="#6B7280"
                value={tempTextValue}
                onChangeText={setTempTextValue}
                multiline
                numberOfLines={textInputModalConfig.dataKey === 'notes' ? 6 : 4}
                maxLength={textInputModalConfig.maxLength}
                autoFocus
                textAlignVertical="top"
              />
              
              <View style={styles.textModalFooter}>
                <Text style={styles.textModalCharacterCount}>
                  {tempTextValue.length}/{textInputModalConfig.maxLength} characters
                </Text>
                <TouchableOpacity 
                  style={[
                    styles.textModalSaveButton,
                    tempTextValue.trim().length === 0 && styles.textModalSaveButtonDisabled
                  ]}
                  onPress={saveTextFromModal}
                  disabled={tempTextValue.trim().length === 0}
                >
                  <Text style={[
                    styles.textModalSaveButtonText,
                    tempTextValue.trim().length === 0 && styles.textModalSaveButtonTextDisabled
                  ]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </Modal>
  );
};

// Customize Panel Component
const CustomizePanel: React.FC<{
  enabledFactors: EnabledFactors;
  onSave: (factors: EnabledFactors) => void;
  onClose: () => void;
}> = ({ enabledFactors, onSave, onClose }) => {
  const [localFactors, setLocalFactors] = useState(enabledFactors);

  useEffect(() => {
    setLocalFactors(enabledFactors);
  }, [enabledFactors]);

  const toggleFactor = (factor: keyof EnabledFactors) => {
    // Core factors cannot be disabled
    const coreFactors: (keyof EnabledFactors)[] = [
      'moodState', 'cravingTracking', 'cravingIntensity', 'stressLevel', 
      'anxietyLevel', 'sleepQuality', 'sleepDuration', 'energyLevel', 
      'triggersEncountered', 'copingStrategiesUsed'
    ];
    
    if (coreFactors.includes(factor) && localFactors[factor]) {
      // Don't allow disabling core factors
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    
    setLocalFactors(prev => ({
      ...prev,
      [factor]: !prev[factor]
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave(localFactors);
  };

  const FactorToggle = ({ 
    icon, 
    title, 
    description, 
    factorKey,
    isCore = false 
  }: { 
    icon: string; 
    title: string; 
    description: string; 
    factorKey: keyof EnabledFactors;
    isCore?: boolean;
  }) => {
    const isEnabled = localFactors[factorKey];
    
    return (
      <TouchableOpacity
        style={[
          styles.factorCard,
          isEnabled && styles.factorCardActive
        ]}
        onPress={() => toggleFactor(factorKey)}
        activeOpacity={0.7}
      >
        <View style={styles.factorIcon}>
          <Ionicons 
            name={icon as keyof typeof Ionicons.glyphMap} 
            size={24} 
            color={isEnabled ? "#10B981" : "#6B7280"} 
          />
        </View>
        
        <View style={styles.factorInfo}>
          <View style={styles.factorHeader}>
            <Text style={[
              styles.factorName,
              isEnabled && styles.factorNameActive
            ]}>
              {title}
            </Text>
            {isCore && (
              <View style={styles.factorBadge}>
                <Text style={styles.factorBadgeText}>CORE</Text>
              </View>
            )}
          </View>
          <Text style={styles.factorDesc}>{description}</Text>
        </View>
        
        <View style={[
          styles.factorCheck,
          isEnabled && styles.factorCheckActive
        ]}>
          <Ionicons 
            name={isEnabled ? "checkmark-circle" : "ellipse-outline"} 
            size={24} 
            color={isEnabled ? "#10B981" : "#374151"} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.panelContainer}>
      {/* Header */}
      <View style={styles.customizeHeader}>
        <TouchableOpacity 
          style={styles.customizeCancel}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={styles.customizeCancelText}>Cancel</Text>
        </TouchableOpacity>
        
        <Text style={styles.customizeTitle}>Customize Tracking</Text>
        
        <TouchableOpacity 
          style={styles.customizeSave}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text style={styles.customizeSaveText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={20} color="#10B981" />
        <Text style={styles.infoText}>
          Select the factors you want to track daily. Start with core factors and add more as needed.
        </Text>
      </View>

      {/* Factors List */}
      <ScrollView 
        style={styles.customizeContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        {/* Core Factors */}
        <View style={styles.customizeSection}>
          <Text style={styles.customizeSectionTitle}>Core Tracking (Recommended)</Text>
          
          <FactorToggle 
            icon="happy-outline"
            title="Mood"
            description="Track if you're feeling positive"
            factorKey="moodState"
            isCore={true}
          />
          
          <FactorToggle 
            icon="flash-outline"
            title="Cravings"
            description="Monitor nicotine cravings"
            factorKey="cravingTracking"
            isCore={true}
          />
          
          <FactorToggle 
            icon="speedometer-outline"
            title="Craving Intensity"
            description="Rate craving strength (1-10)"
            factorKey="cravingIntensity"
            isCore={true}
          />
          
          <FactorToggle 
            icon="trending-up-outline"
            title="Stress Level"
            description="Track high stress days"
            factorKey="stressLevel"
            isCore={true}
          />
          
          <FactorToggle 
            icon="pulse-outline"
            title="Anxiety Level"
            description="Monitor anxiety (1-10 scale)"
            factorKey="anxietyLevel"
            isCore={true}
          />
          
          <FactorToggle 
            icon="moon-outline"
            title="Sleep Quality"
            description="Rate your sleep quality"
            factorKey="sleepQuality"
            isCore={true}
          />
          
          <FactorToggle 
            icon="time-outline"
            title="Sleep Hours"
            description="Track hours of sleep"
            factorKey="sleepDuration"
            isCore={true}
          />
          
          <FactorToggle 
            icon="battery-charging-outline"
            title="Energy Level"
            description="Rate your energy (1-10)"
            factorKey="energyLevel"
            isCore={true}
          />
          
          <FactorToggle 
            icon="warning-outline"
            title="Triggers"
            description="Track trigger encounters"
            factorKey="triggersEncountered"
            isCore={true}
          />
          
          <FactorToggle 
            icon="shield-checkmark-outline"
            title="Coping Strategies"
            description="Log strategy usage"
            factorKey="copingStrategiesUsed"
            isCore={true}
          />
        </View>

        {/* Additional Mental Health */}
        <View style={styles.customizeSection}>
          <Text style={styles.customizeSectionTitle}>Additional Mental Health</Text>
          
          <FactorToggle 
            icon="leaf-outline"
            title="Breathing Exercises"
            description="Log breathing practice"
            factorKey="breathingExercises"
          />
          
          <FactorToggle 
            icon="flower-outline"
            title="Meditation Time"
            description="Track meditation minutes"
            factorKey="meditationTime"
          />
          
          <FactorToggle 
            icon="swap-horizontal-outline"
            title="Mood Swings"
            description="Monitor mood changes"
            factorKey="moodSwings"
          />
          
          <FactorToggle 
            icon="flame-outline"
            title="Irritability"
            description="Track irritability levels"
            factorKey="irritability"
          />
          
          <FactorToggle 
            icon="bulb-outline"
            title="Concentration"
            description="Rate focus ability (1-10)"
            factorKey="concentration"
          />
        </View>

        {/* Additional Physical */}
        <View style={styles.customizeSection}>
          <Text style={styles.customizeSectionTitle}>Additional Physical</Text>
          
          <FactorToggle 
            icon="water-outline"
            title="Hydration"
            description="Monitor water intake"
            factorKey="hydrationLevel"
          />
          
          <FactorToggle 
            icon="restaurant-outline"
            title="Appetite"
            description="Track appetite levels (1-10)"
            factorKey="appetite"
          />
          
          <FactorToggle 
            icon="flash-off-outline"
            title="Headaches"
            description="Monitor headache occurrence"
            factorKey="headaches"
          />
          
          <FactorToggle 
            icon="fitness-outline"
            title="Exercise"
            description="Log physical activity"
            factorKey="physicalActivity"
          />
          
          <FactorToggle 
            icon="timer-outline"
            title="Exercise Duration"
            description="Track workout minutes"
            factorKey="exerciseDuration"
          />
        </View>

        {/* Behavioral */}
        <View style={styles.customizeSection}>
          <Text style={styles.customizeSectionTitle}>Behavioral Tracking</Text>
          
          <FactorToggle 
            icon="people-outline"
            title="Social Support"
            description="Track social connections"
            factorKey="socialInteractions"
          />
          
          <FactorToggle 
            icon="shield-outline"
            title="Avoided Triggers"
            description="Log trigger avoidance success"
            factorKey="avoidedTriggers"
          />
          
          <FactorToggle 
            icon="trending-up-outline"
            title="Productive Day"
            description="Rate daily productivity"
            factorKey="productiveDay"
          />
        </View>


      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    overflow: 'hidden',
  },
  slidingContainer: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * 2,
    flex: 1,
  },
  panelContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  quickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  quickQuestion: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: -0.2,
  },
  quickToggleGroup: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  quickToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickToggleNo: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  quickToggleYes: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  counterContainer: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  counterTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
    letterSpacing: -0.2,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonDisabled: {
    opacity: 0.3,
  },
  counterValue: {
    alignItems: 'center',
    minWidth: 80,
  },
  counterNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  counterUnit: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  insightsPreview: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  insightsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  insightsTextContainer: {
    flex: 1,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    letterSpacing: -0.2,
  },
  insightsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  // Customize Panel Styles
  customizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  customizeCancel: {
    padding: SPACING.xs,
  },
  customizeCancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  customizeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  customizeSave: {
    padding: SPACING.xs,
  },
  customizeSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#10B981',
    lineHeight: 20,
  },
  customizeContent: {
    flex: 1,
  },
  customizeSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  customizeSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  factorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  factorCardActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  factorIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  factorInfo: {
    flex: 1,
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  factorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: -0.2,
  },
  factorNameActive: {
    color: '#FFFFFF',
  },
  factorBadge: {
    marginLeft: SPACING.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 4,
  },
  factorBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  factorDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  factorCheck: {
    marginLeft: SPACING.md,
  },
  factorCheckActive: {
    // Active state handled by icon color
  },
  
  // Scale component styles
  scaleContainer: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  scaleTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
    letterSpacing: -0.2,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  scaleLabelText: {
    fontSize: 12,
    color: '#6B7280',
  },
  scaleValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  scaleButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scaleButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  scaleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  scaleButtonTextActive: {
    color: '#FFFFFF',
  },
  
  // Text input styles
  textInputContainer: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  textInputTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: SPACING.sm,
    letterSpacing: -0.2,
  },
  textInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 60,
  },
  textInputButtonFilled: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  textInputPlaceholder: {
    fontSize: 15,
    color: '#6B7280',
    flex: 1,
    marginRight: SPACING.sm,
  },
  textInputValue: {
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
    marginRight: SPACING.sm,
    lineHeight: 20,
  },
  inputHelper: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: SPACING.xs,
  },
  
  // Date navigation styles
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: SPACING.sm,
  },
  dateArrow: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dateArrowDisabled: {
    opacity: 0.3,
  },
  dateButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Text Input Modal styles - matching onboarding pattern
  textModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  textModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  textModalKeyboardView: {
    justifyContent: 'flex-end',
  },
  textModalContent: {
    backgroundColor: '#1f1f1f',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xl * 2 : SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  textModalDragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  textModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  textModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  textModalCloseButton: {
    padding: SPACING.sm,
  },
  textModalInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 16,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: SPACING.lg,
  },
  textModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textModalCharacterCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  textModalSaveButton: {
    backgroundColor: '#10B981',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: SPACING.lg,
  },
  textModalSaveButtonDisabled: {
    opacity: 0.5,
  },
  textModalSaveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  textModalSaveButtonTextDisabled: {
    color: '#6B7280',
  },
});

export default RecoveryJournal; 