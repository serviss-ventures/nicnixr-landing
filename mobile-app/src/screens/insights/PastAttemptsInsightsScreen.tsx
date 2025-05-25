import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { COLORS, SPACING, SHADOWS } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { pastAttemptsService, PastAttemptInsights, QuitMethodAnalysis } from '../../services/pastAttemptsService';

const { width } = Dimensions.get('window');

const PastAttemptsInsightsScreen: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { stepData } = useSelector((state: RootState) => state.onboarding);
  
  const [insights, setInsights] = useState<PastAttemptInsights | null>(null);
  const [methodAnalysis, setMethodAnalysis] = useState<QuitMethodAnalysis[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [currentSection, setCurrentSection] = useState<'overview' | 'patterns' | 'methods' | 'recommendations'>('overview');

  useEffect(() => {
    // Analyze user's past attempts when component mounts
    const userAttemptData = {
      hasTriedQuittingBefore: stepData.hasTriedQuittingBefore,
      previousAttempts: stepData.previousAttempts,
      whatWorkedBefore: stepData.whatWorkedBefore,
      whatMadeItDifficult: stepData.whatMadeItDifficult,
      longestQuitPeriod: stepData.longestQuitPeriod,
      cravingTriggers: stepData.cravingTriggers,
      reasonsToQuit: stepData.reasonsToQuit,
    };

    const analysisResults = pastAttemptsService.analyzeUserAttempts(userAttemptData);
    const methodsAnalysis = pastAttemptsService.analyzeQuitMethods(userAttemptData);
    
    setInsights(analysisResults);
    setMethodAnalysis(methodsAnalysis);

    // Animate in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [stepData, fadeAnim]);

  const renderUserTypeCard = () => {
    if (!insights) return null;

    const typeColors = {
      first_timer: { bg: '#E8F5E8', border: '#27AE60', icon: '#27AE60' },
      returner: { bg: '#E3F2FD', border: '#2196F3', icon: '#2196F3' },
      experienced: { bg: '#FFF3E0', border: '#FF9800', icon: '#FF9800' },
      persistent: { bg: '#F3E5F5', border: '#9C27B0', icon: '#9C27B0' },
    };

    const colors = typeColors[insights.userType];

    return (
      <View style={[styles.card, { borderColor: colors.border }]}>
        <LinearGradient
          colors={[colors.bg + '40', colors.bg + '20']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: colors.icon + '20' }]}>
              <Ionicons name="person-outline" size={28} color={colors.icon} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Your Quit Profile</Text>
              <Text style={[styles.userType, { color: colors.icon }]}>
                {insights.userType.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>
            {insights.userTypeDescription}
          </Text>
          <Text style={styles.overallPattern}>
            <Text style={styles.patternLabel}>Pattern: </Text>
            {insights.overallPattern}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  const renderStatisticalCard = () => {
    if (!insights) return null;

    return (
      <View style={styles.card}>
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.1)', 'rgba(6, 182, 212, 0.1)']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name="analytics-outline" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Your Success Odds</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{insights.statisticalContext.successRateAfterAttempts}%</Text>
              <Text style={styles.statLabel}>Success Rate This Time</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{insights.statisticalContext.averageAttempts}</Text>
              <Text style={styles.statLabel}>Average Attempts</Text>
            </View>
          </View>

          <Text style={styles.encouragementText}>
            {insights.encouragement}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  const renderStrengthsCard = () => {
    if (!insights) return null;

    return (
      <View style={styles.card}>
        <LinearGradient
          colors={['rgba(39, 174, 96, 0.1)', 'rgba(46, 204, 113, 0.1)']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#27AE60' + '20' }]}>
              <Ionicons name="shield-checkmark-outline" size={28} color="#27AE60" />
            </View>
            <Text style={styles.cardTitle}>Your Strengths</Text>
          </View>
          
          {insights.strengths.map((strength, index) => (
            <View key={index} style={styles.listItem}>
              <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
              <Text style={styles.listItemText}>{strength}</Text>
            </View>
          ))}
        </LinearGradient>
      </View>
    );
  };

  const renderChallengesCard = () => {
    if (!insights || insights.challenges.length === 0) return null;

    return (
      <View style={styles.card}>
        <LinearGradient
          colors={['rgba(231, 76, 60, 0.1)', 'rgba(255, 107, 107, 0.1)']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: '#E74C3C' + '20' }]}>
              <Ionicons name="warning-outline" size={28} color="#E74C3C" />
            </View>
            <Text style={styles.cardTitle}>Areas to Watch</Text>
          </View>
          
          {insights.challenges.map((challenge, index) => (
            <View key={index} style={styles.listItem}>
              <Ionicons name="alert-circle" size={20} color="#E74C3C" />
              <Text style={styles.listItemText}>{challenge}</Text>
            </View>
          ))}
        </LinearGradient>
      </View>
    );
  };

  const renderPatternsSection = () => {
    if (!insights) return null;

    return (
      <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Your Quit Patterns</Text>
        <Text style={styles.sectionSubtitle}>
          Understanding your patterns helps predict and prevent future challenges.
        </Text>

        {/* Success Predictors */}
        {insights.successPredictors.length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>🎯 Success Predictors</Text>
            {insights.successPredictors.map((pattern) => (
              <View key={pattern.id} style={styles.patternCard}>
                <View style={styles.patternHeader}>
                  <Ionicons name={pattern.iconName as any} size={24} color={pattern.iconColor} />
                  <Text style={styles.patternDescription}>{pattern.description}</Text>
                </View>
                <Text style={styles.patternInsight}>{pattern.insight}</Text>
                <Text style={styles.patternRecommendation}>
                  💡 {pattern.recommendation}
                </Text>
                <View style={styles.confidenceBar}>
                  <Text style={styles.confidenceLabel}>Confidence: {pattern.confidenceScore}%</Text>
                  <View style={styles.confidenceBarContainer}>
                    <View 
                      style={[
                        styles.confidenceBarFill, 
                        { width: `${pattern.confidenceScore}%`, backgroundColor: pattern.iconColor }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Risk Factors */}
        {insights.riskFactors.length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>⚠️ Risk Factors</Text>
            {insights.riskFactors.map((pattern) => (
              <View key={pattern.id} style={styles.patternCard}>
                <View style={styles.patternHeader}>
                  <Ionicons name={pattern.iconName as any} size={24} color={pattern.iconColor} />
                  <Text style={styles.patternDescription}>{pattern.description}</Text>
                </View>
                <Text style={styles.patternInsight}>{pattern.insight}</Text>
                <Text style={styles.patternRecommendation}>
                  🛡️ {pattern.recommendation}
                </Text>
                <View style={styles.confidenceBar}>
                  <Text style={styles.confidenceLabel}>Risk Level: {pattern.confidenceScore}%</Text>
                  <View style={styles.confidenceBarContainer}>
                    <View 
                      style={[
                        styles.confidenceBarFill, 
                        { width: `${pattern.confidenceScore}%`, backgroundColor: pattern.iconColor }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    );
  };

  const renderMethodsSection = () => {
    return (
      <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Quit Method Analysis</Text>
        <Text style={styles.sectionSubtitle}>
          Based on your history and challenges, here's how different methods might work for you.
        </Text>

        {methodAnalysis
          .sort((a, b) => b.effectiveness - a.effectiveness)
          .map((method) => (
            <View key={method.methodId} style={styles.methodCard}>
              <LinearGradient
                colors={
                  method.recommendForUser
                    ? [method.iconColor + '20', method.iconColor + '10']
                    : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
                }
                style={styles.methodCardGradient}
              >
                <View style={styles.methodHeader}>
                  <View style={[styles.methodIcon, { backgroundColor: method.iconColor + '20' }]}>
                    <Ionicons name={method.iconName as any} size={24} color={method.iconColor} />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    <Text style={styles.methodDescription}>{method.description}</Text>
                  </View>
                  <View style={styles.effectivenessContainer}>
                    <Text style={styles.effectivenessNumber}>{method.effectiveness}%</Text>
                    <Text style={styles.effectivenessLabel}>for you</Text>
                  </View>
                </View>

                <Text style={styles.methodReasoning}>{method.reasoning}</Text>

                <View style={styles.methodTags}>
                  {method.userTriedBefore && (
                    <View style={[styles.tag, { backgroundColor: '#9B59B6' + '20' }]}>
                      <Text style={[styles.tagText, { color: '#9B59B6' }]}>Previously Tried</Text>
                    </View>
                  )}
                  {method.recommendForUser && (
                    <View style={[styles.tag, { backgroundColor: '#27AE60' + '20' }]}>
                      <Text style={[styles.tagText, { color: '#27AE60' }]}>Recommended</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </View>
          ))}
      </ScrollView>
    );
  };

  const renderRecommendationsSection = () => {
    if (!insights) return null;

    return (
      <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Personalized Strategy</Text>
        <Text style={styles.sectionSubtitle}>
          Based on your unique quit profile, here's your personalized action plan.
        </Text>

        {/* Main Strategy */}
        <View style={styles.strategyCard}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.15)']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: COLORS.primary + '20' }]}>
                <Ionicons name="bulb-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.cardTitle}>Your Personalized Strategy</Text>
            </View>
            <Text style={styles.strategyText}>{insights.personalizedStrategy}</Text>
          </LinearGradient>
        </View>

        {/* Key Recommendations */}
        <Text style={styles.subsectionTitle}>🎯 Key Recommendations</Text>
        {insights.recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationItem}>
            <View style={styles.recommendationNumber}>
              <Text style={styles.recommendationNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        ))}

        {/* Your Advantages */}
        <Text style={styles.subsectionTitle}>🌟 Your Advantages with NixR</Text>
        {insights.statisticalContext.yourAdvantages.map((advantage, index) => (
          <View key={index} style={styles.listItem}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.listItemText}>{advantage}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderOverviewSection = () => {
    return (
      <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
        {renderUserTypeCard()}
        {renderStatisticalCard()}
        {renderStrengthsCard()}
        {renderChallengesCard()}
      </ScrollView>
    );
  };

  if (!insights) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Analyzing your quit journey...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Quit Insights</Text>
        <Text style={styles.headerSubtitle}>
          Understanding your patterns for success
        </Text>
      </View>

      {/* Section Tabs */}
      <View style={styles.sectionTabs}>
        <TouchableOpacity
          style={[styles.sectionTab, currentSection === 'overview' && styles.sectionTabActive]}
          onPress={() => setCurrentSection('overview')}
        >
          <Text style={[styles.sectionTabText, currentSection === 'overview' && styles.sectionTabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionTab, currentSection === 'patterns' && styles.sectionTabActive]}
          onPress={() => setCurrentSection('patterns')}
        >
          <Text style={[styles.sectionTabText, currentSection === 'patterns' && styles.sectionTabTextActive]}>
            Patterns
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionTab, currentSection === 'methods' && styles.sectionTabActive]}
          onPress={() => setCurrentSection('methods')}
        >
          <Text style={[styles.sectionTabText, currentSection === 'methods' && styles.sectionTabTextActive]}>
            Methods
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sectionTab, currentSection === 'recommendations' && styles.sectionTabActive]}
          onPress={() => setCurrentSection('recommendations')}
        >
          <Text style={[styles.sectionTabText, currentSection === 'recommendations' && styles.sectionTabTextActive]}>
            Strategy
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {currentSection === 'overview' && renderOverviewSection()}
        {currentSection === 'patterns' && renderPatternsSection()}
        {currentSection === 'methods' && renderMethodsSection()}
        {currentSection === 'recommendations' && renderRecommendationsSection()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  sectionTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: SPACING.lg,
    borderRadius: SPACING.md,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: SPACING.sm,
    alignItems: 'center',
  },
  sectionTabActive: {
    backgroundColor: COLORS.primary,
  },
  sectionTabText: {
    fontSize: 12,
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
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  card: {
    borderRadius: SPACING.lg,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  cardGradient: {
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  userType: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  overallPattern: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  patternLabel: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  encouragementText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  listItemText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SPACING.md,
    flex: 1,
    lineHeight: 20,
  },
  patternCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: SPACING.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  patternDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.md,
    flex: 1,
  },
  patternInsight: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  patternRecommendation: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  confidenceBar: {
    marginTop: SPACING.sm,
  },
  confidenceLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  confidenceBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  methodCard: {
    borderRadius: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  methodCardGradient: {
    padding: SPACING.lg,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  effectivenessContainer: {
    alignItems: 'center',
  },
  effectivenessNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  effectivenessLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  methodReasoning: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  methodTags: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.lg,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  strategyCard: {
    borderRadius: SPACING.lg,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  strategyText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  recommendationNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  recommendationNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  recommendationText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default PastAttemptsInsightsScreen; 