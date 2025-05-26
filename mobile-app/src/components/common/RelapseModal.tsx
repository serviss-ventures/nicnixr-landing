import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { handleRelapse } from '../../store/slices/progressSlice';
import { COLORS, SPACING } from '../../constants/theme';

interface RelapseModalProps {
  visible: boolean;
  onClose: () => void;
}

const RelapseModal: React.FC<RelapseModalProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  const [step, setStep] = useState(1);
  const [relapseData, setRelapseData] = useState({
    trigger: '',
    emotion: '',
    amount: 1,
    duration: '5-minutes',
    learnings: '',
    recoveryPlan: [] as string[]
  });

  const triggers = [
    { id: 'stress', label: 'Work Stress', icon: 'briefcase-outline' },
    { id: 'social', label: 'Social Situation', icon: 'people-outline' },
    { id: 'boredom', label: 'Boredom', icon: 'time-outline' },
    { id: 'anxiety', label: 'Anxiety', icon: 'alert-circle-outline' },
    { id: 'celebration', label: 'Celebration', icon: 'happy-outline' },
    { id: 'habit', label: 'Old Habit', icon: 'refresh-outline' },
    { id: 'craving', label: 'Strong Craving', icon: 'flash-outline' },
    { id: 'other', label: 'Other', icon: 'help-circle-outline' }
  ];

  const emotions = [
    { id: 'stressed', label: 'Stressed', color: '#EF4444' },
    { id: 'anxious', label: 'Anxious', color: '#F59E0B' },
    { id: 'sad', label: 'Sad', color: '#3B82F6' },
    { id: 'angry', label: 'Angry', color: '#DC2626' },
    { id: 'lonely', label: 'Lonely', color: '#6B7280' },
    { id: 'excited', label: 'Excited', color: '#10B981' },
    { id: 'overwhelmed', label: 'Overwhelmed', color: '#8B5CF6' },
    { id: 'neutral', label: 'Neutral', color: '#6B7280' }
  ];

  const durations = [
    { id: '5-minutes', label: '5 minutes', description: 'Brief slip' },
    { id: '30-minutes', label: '30 minutes', description: 'Short episode' },
    { id: '1-hour', label: '1 hour', description: 'Extended use' },
    { id: 'half-day', label: 'Half day', description: 'Significant relapse' },
    { id: 'full-day', label: 'Full day', description: 'Major setback' }
  ];

  const recoveryStrategies = [
    'Remove triggers from environment',
    'Call a support person',
    'Practice breathing exercises',
    'Go for a walk or exercise',
    'Use a distraction technique',
    'Review my reasons for quitting',
    'Plan better for this situation',
    'Seek professional support'
  ];

  const handleSubmit = async () => {
    try {
      await dispatch(handleRelapse({
        date: new Date().toISOString(),
        trigger: relapseData.trigger,
        emotion: relapseData.emotion,
        amount: relapseData.amount,
        duration: relapseData.duration,
        learnings: relapseData.learnings,
        recoveryPlan: relapseData.recoveryPlan,
        isMinorSlip: relapseData.duration === 'brief' || relapseData.duration === 'single'
      }));

      Alert.alert(
        "Thank You for Your Honesty",
        "Your courage to track this setback will make you stronger. Every recovery journey has ups and downs - what matters is getting back on track.",
        [{ text: "Continue Recovery", onPress: onClose }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save relapse data. Please try again.");
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What triggered this moment?</Text>
      <Text style={styles.stepSubtitle}>Understanding triggers helps prevent future relapses</Text>
      
      <View style={styles.optionsGrid}>
        {triggers.map((trigger) => (
          <TouchableOpacity
            key={trigger.id}
            style={[
              styles.optionCard,
              relapseData.trigger === trigger.id && styles.optionSelected
            ]}
            onPress={() => setRelapseData({ ...relapseData, trigger: trigger.id })}
          >
            <Ionicons 
              name={trigger.icon as any} 
              size={24} 
              color={relapseData.trigger === trigger.id ? COLORS.primary : COLORS.textMuted} 
            />
            <Text style={[
              styles.optionText,
              relapseData.trigger === trigger.id && styles.optionTextSelected
            ]}>
              {trigger.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>How were you feeling?</Text>
      <Text style={styles.stepSubtitle}>Emotions are important recovery data</Text>
      
      <View style={styles.emotionsGrid}>
        {emotions.map((emotion) => (
          <TouchableOpacity
            key={emotion.id}
            style={[
              styles.emotionCard,
              relapseData.emotion === emotion.id && styles.emotionSelected,
              { borderColor: emotion.color }
            ]}
            onPress={() => setRelapseData({ ...relapseData, emotion: emotion.id })}
          >
            <View style={[styles.emotionDot, { backgroundColor: emotion.color }]} />
            <Text style={[
              styles.emotionText,
              relapseData.emotion === emotion.id && styles.emotionTextSelected
            ]}>
              {emotion.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>How long did it last?</Text>
      <Text style={styles.stepSubtitle}>This helps us understand the severity and plan better</Text>
      
      <View style={styles.durationList}>
        {durations.map((duration) => (
          <TouchableOpacity
            key={duration.id}
            style={[
              styles.durationCard,
              relapseData.duration === duration.id && styles.durationSelected
            ]}
            onPress={() => setRelapseData({ ...relapseData, duration: duration.id })}
          >
            <View style={styles.durationContent}>
              <Text style={[
                styles.durationLabel,
                relapseData.duration === duration.id && styles.durationLabelSelected
              ]}>
                {duration.label}
              </Text>
              <Text style={[
                styles.durationDescription,
                relapseData.duration === duration.id && styles.durationDescriptionSelected
              ]}>
                {duration.description}
              </Text>
            </View>
            {relapseData.duration === duration.id && (
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What did you learn?</Text>
      <Text style={styles.stepSubtitle}>Every setback is a learning opportunity</Text>
      
      <TextInput
        style={styles.textInput}
        placeholder="What would you do differently next time?"
        placeholderTextColor={COLORS.textMuted}
        value={relapseData.learnings}
        onChangeText={(text) => setRelapseData({ ...relapseData, learnings: text })}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Text style={styles.recoveryTitle}>Choose your recovery strategies:</Text>
      <View style={styles.strategiesContainer}>
        {recoveryStrategies.map((strategy, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.strategyCard,
              relapseData.recoveryPlan.includes(strategy) && styles.strategySelected
            ]}
            onPress={() => {
              const newPlan = relapseData.recoveryPlan.includes(strategy)
                ? relapseData.recoveryPlan.filter(s => s !== strategy)
                : [...relapseData.recoveryPlan, strategy];
              setRelapseData({ ...relapseData, recoveryPlan: newPlan });
            }}
          >
            <Text style={[
              styles.strategyText,
              relapseData.recoveryPlan.includes(strategy) && styles.strategyTextSelected
            ]}>
              {strategy}
            </Text>
            {relapseData.recoveryPlan.includes(strategy) && (
              <Ionicons name="checkmark" size={16} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const canProceed = () => {
    switch (step) {
      case 1: return relapseData.trigger !== '';
      case 2: return relapseData.emotion !== '';
      case 3: return relapseData.duration !== '';
      case 4: return relapseData.learnings.trim() !== '' && relapseData.recoveryPlan.length > 0;
      default: return false;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={['#000000', '#0F172A', '#1E293B']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Recovery Support</Text>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>{step}/4</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]}
              />
            </View>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.compassionMessage}>
              <Ionicons name="heart" size={20} color="#EF4444" />
              <Text style={styles.compassionText}>
                Recovery is a journey, not a destination. You're brave for tracking this.
              </Text>
            </View>

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {step > 1 && (
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => setStep(step - 1)}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.nextButton,
                !canProceed() && styles.nextButtonDisabled
              ]}
              onPress={() => {
                if (step === 4) {
                  handleSubmit();
                } else {
                  setStep(step + 1);
                }
              }}
              disabled={!canProceed()}
            >
              <LinearGradient
                colors={canProceed() ? [COLORS.primary, COLORS.accent] : ['#374151', '#374151']}
                style={styles.nextButtonGradient}
              >
                <Text style={[
                  styles.nextButtonText,
                  !canProceed() && styles.nextButtonTextDisabled
                ]}>
                  {step === 4 ? 'Complete' : 'Next'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  compassionMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: SPACING.md,
    borderRadius: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  compassionText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 20,
  },
  stepContainer: {
    marginBottom: SPACING.xl,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: COLORS.text,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emotionCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
  },
  emotionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  emotionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  emotionText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  emotionTextSelected: {
    color: COLORS.text,
  },
  durationList: {
    gap: SPACING.md,
  },
  durationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  durationSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: COLORS.primary,
  },
  durationContent: {
    flex: 1,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  durationLabelSelected: {
    color: COLORS.text,
  },
  durationDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  durationDescriptionSelected: {
    color: COLORS.textSecondary,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    color: COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.xl,
    minHeight: 100,
  },
  recoveryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  strategiesContainer: {
    gap: SPACING.sm,
  },
  strategyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: SPACING.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  strategySelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: COLORS.primary,
  },
  strategyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    flex: 1,
    fontWeight: '500',
  },
  strategyTextSelected: {
    color: COLORS.text,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SPACING.md,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  nextButton: {
    flex: 2,
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  nextButtonTextDisabled: {
    color: COLORS.textMuted,
  },
});

export default RelapseModal; 