import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';
import NixRLogo from '../../components/common/NixRLogo';
import Svg, { Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop, G } from 'react-native-svg';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

const AICoachScreen: React.FC = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI recovery coach. I've analyzed your progress and I'm here to support you on your journey. How are you feeling today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  // Quick suggestions for users
  const quickSuggestions = [
    "I'm feeling strong today",
    "Having some cravings",
    "Tell me about my progress",
    "Need motivation"
  ];

  // AI Avatar component with hexagonal pattern
  const AIAvatar = ({ size = 36 }: { size?: number }) => (
    <View style={[styles.aiAvatar, { width: size, height: size }]}>
      <LinearGradient
        colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.12)', 'rgba(99, 102, 241, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.aiAvatarGradient, { borderRadius: size * 0.4 }]}
      >
        <Svg width={size * 0.8} height={size * 0.8} viewBox="0 0 48 48">
          <Defs>
            <SvgLinearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.9" />
              <Stop offset="100%" stopColor={COLORS.secondary} stopOpacity="0.9" />
            </SvgLinearGradient>
          </Defs>
          
          {/* AI Brain Pattern */}
          <G>
            {/* Central core */}
            <Circle cx={24} cy={24} r={3} fill="url(#aiGrad)" />
            
            {/* Neural pathways - hexagonal pattern */}
            <Path 
              d="M24 12 L32 16 L32 24 L24 28 L16 24 L16 16 Z" 
              stroke="url(#aiGrad)" 
              strokeWidth="1.5" 
              fill="none"
              opacity="0.8"
            />
            
            {/* Outer connections */}
            <Path 
              d="M24 4 L40 12 L40 28 L24 36 L8 28 L8 12 Z" 
              stroke="url(#aiGrad)" 
              strokeWidth="1" 
              fill="none"
              opacity="0.4"
            />
            
            {/* Data nodes */}
            <Circle cx={24} cy={12} r={2} fill="url(#aiGrad)" opacity="0.8" />
            <Circle cx={32} cy={16} r={1.5} fill="url(#aiGrad)" opacity="0.6" />
            <Circle cx={32} cy={24} r={1.5} fill="url(#aiGrad)" opacity="0.8" />
            <Circle cx={24} cy={28} r={1.5} fill="url(#aiGrad)" opacity="0.6" />
            <Circle cx={16} cy={24} r={1.5} fill="url(#aiGrad)" opacity="0.8" />
            <Circle cx={16} cy={16} r={1.5} fill="url(#aiGrad)" opacity="0.6" />
            
            {/* Connection lines */}
            <Path 
              d="M24 24 L24 12 M24 24 L32 16 M24 24 L32 24 M24 24 L24 28 M24 24 L16 24 M24 24 L16 16" 
              stroke="url(#aiGrad)" 
              strokeWidth="0.8" 
              opacity="0.5"
            />
          </G>
        </Svg>
        
        {/* AI indicator pulse */}
        <Animated.View style={[
          styles.aiIndicatorPulse,
          {
            opacity: typingAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.8]
            }),
            transform: [{
              scale: typingAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1.2]
              })
            }]
          }
        ]} />
      </LinearGradient>
    </View>
  );

  // Mock AI responses based on common recovery topics
  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('craving') || lowerMessage.includes('urge')) {
      return "I understand you're experiencing cravings. Remember, they're temporary and will pass. Try the 4-7-8 breathing technique: breathe in for 4, hold for 7, exhale for 8. What usually helps you get through tough moments?";
    }
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('anxious')) {
      return "Stress can be challenging during recovery. Your brain is rewiring itself, which is actually a sign of progress. Have you tried any of the stress management techniques we discussed? A 5-minute walk or some deep breathing can work wonders.";
    }
    
    if (lowerMessage.includes('progress') || lowerMessage.includes('day')) {
      return "Your progress is impressive! Every day clean is rebuilding your neural pathways. Your dopamine receptors are healing, and your risk of relapse decreases with each passing day. What positive changes have you noticed?";
    }
    
    if (lowerMessage.includes('good') || lowerMessage.includes('great') || lowerMessage.includes('fine')) {
      return "That's wonderful to hear! Positive momentum builds on itself. When you're feeling good, it's a great time to reinforce healthy habits. What's been contributing to these positive feelings?";
    }
    
    if (lowerMessage.includes('difficult') || lowerMessage.includes('hard') || lowerMessage.includes('struggle')) {
      return "Recovery isn't linear, and difficult days are part of the process. Your brain is healing from years of nicotine dependence - give yourself credit for showing up. What's one small thing that might help you feel more centered right now?";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return "I'm here to support you. Based on your journal entries, I notice you're strongest when you focus on your health goals. Remember why you started this journey. Would you like me to remind you of your personal motivations?";
    }
    
    // Default responses
    const defaultResponses = [
      "Thank you for sharing that with me. Your openness about your recovery journey shows real strength. How can I best support you right now?",
      "I appreciate you checking in. Recovery is about small, consistent choices. What's one positive step you can take today?",
      "Your commitment to this conversation shows you're serious about your recovery. Based on your progress, you're building real momentum. Tell me more about what's on your mind.",
      "Every day you choose recovery, you're rewiring your brain for freedom. I'm here to help you navigate any challenges. What would be most helpful to discuss?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    // Dismiss keyboard after sending
    Keyboard.dismiss();

    // Simulate AI typing delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(inputText.trim()),
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  };

  // Function to dismiss keyboard when tapping outside
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Typing indicator animation
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping]);

  const TypingIndicator = () => (
    <View style={styles.messageContainer}>
      <View style={styles.avatarContainer}>
        <AIAvatar size={36} />
      </View>
      <View style={[styles.messageBubble, styles.aiMessage]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.08)']}
          style={styles.aiMessageGradient}
        >
          <Animated.View style={[styles.typingDots, { opacity: typingAnimation }]}>
            <View style={styles.typingContainer}>
              <Animated.View style={[
                styles.typingDot,
                {
                  opacity: typingAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3]
                  })
                }
              ]} />
              <Animated.View style={[
                styles.typingDot,
                styles.typingDotMiddle,
                {
                  opacity: typingAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3]
                  })
                }
              ]} />
              <Animated.View style={[
                styles.typingDot,
                {
                  opacity: typingAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3]
                  })
                }
              ]} />
            </View>
          </Animated.View>
        </LinearGradient>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Enhanced Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.backButtonGradient}
              >
                <Ionicons name="chevron-back" size={24} color={COLORS.text} />
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <View style={styles.headerAvatar}>
                <AIAvatar size={44} />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>AI Recovery Coach</Text>
                <View style={styles.statusContainer}>
                  <View style={styles.statusDot} />
                  <Text style={styles.headerSubtitle}>Active • Always here to help</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={styles.menuButton}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.menuButtonGradient}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textMuted} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Messages Area with Keyboard Dismissal */}
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.messagesWrapper}>
              <ScrollView 
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="interactive"
                keyboardShouldPersistTaps="handled"
              >
                {messages.map((message) => (
                  <View key={message.id} style={[
                    styles.messageContainer,
                    message.isUser && styles.userMessageContainer
                  ]}>
                    {!message.isUser && (
                      <View style={styles.avatarContainer}>
                        <AIAvatar size={36} />
                      </View>
                    )}
                    
                    <View style={[
                      styles.messageBubble,
                      message.isUser ? styles.userMessage : styles.aiMessage
                    ]}>
                      {message.isUser ? (
                        <LinearGradient
                          colors={[COLORS.primary, '#0891B2']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.userMessageGradient}
                        >
                          <Text style={[styles.messageText, styles.userMessageText]}>
                            {message.text}
                          </Text>
                          <Text style={[styles.timestamp, styles.userTimestamp]}>
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <LinearGradient
                          colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.08)']}
                          style={styles.aiMessageGradient}
                        >
                          <Text style={[styles.messageText, styles.aiMessageText]}>
                            {message.text}
                          </Text>
                          <Text style={[styles.timestamp, styles.aiTimestamp]}>
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Text>
                        </LinearGradient>
                      )}
                    </View>
                  </View>
                ))}
                
                {isTyping && <TypingIndicator />}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>

          {/* Quick Suggestions */}
          {messages.length === 1 && !isTyping && (
            <View style={styles.suggestionsContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsContent}
              >
                {quickSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => setInputText(suggestion)}
                  >
                    <LinearGradient
                      colors={['rgba(16, 185, 129, 0.15)', 'rgba(6, 182, 212, 0.1)']}
                      style={styles.suggestionGradient}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Improved Input Area */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            style={styles.inputKeyboardContainer}
          >
            <LinearGradient
              colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.9)']}
              style={styles.inputGradientContainer}
            >
              <View style={styles.inputContainer}>
                <View style={styles.inputRow}>
                  <View style={styles.textInputContainer}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.05)']}
                      style={styles.textInputGradient}
                    >
                      <TextInput
                        style={styles.textInput}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Share what's on your mind..."
                        placeholderTextColor={COLORS.textMuted}
                        multiline
                        maxLength={500}
                        returnKeyType="send"
                        onSubmitEditing={sendMessage}
                        blurOnSubmit={false}
                      />
                    </LinearGradient>
                  </View>
                  
                  <TouchableOpacity 
                    style={[
                      styles.sendButton,
                      inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
                    ]}
                    onPress={sendMessage}
                    disabled={!inputText.trim() || isTyping}
                  >
                    {inputText.trim() ? (
                      <LinearGradient
                        colors={[COLORS.primary, COLORS.secondary]}
                        style={styles.sendButtonGradient}
                      >
                        <Ionicons 
                          name="arrow-up" 
                          size={20} 
                          color="#FFFFFF" 
                        />
                      </LinearGradient>
                    ) : (
                      <Ionicons 
                        name="arrow-up" 
                        size={20} 
                        color={COLORS.textMuted} 
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: SPACING.md,
    shadowColor: '#6B7280',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  menuButton: {
    marginLeft: SPACING.md,
  },
  messagesWrapper: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  messagesContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
    alignItems: 'flex-end',
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  aiAvatar: {
    borderRadius: 18,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  userMessage: {
    borderBottomRightRadius: 6,
    overflow: 'hidden',
  },
  aiMessage: {
    borderBottomLeftRadius: 6,
    overflow: 'hidden',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.7,
  },
  userTimestamp: {
    color: '#FFFFFF',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: COLORS.textMuted,
  },
  typingDots: {
    paddingVertical: SPACING.sm,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.text,
    marginHorizontal: SPACING.xs,
  },
  typingDotMiddle: {
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.text,
  },
  inputKeyboardContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  inputGradientContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.md,
  },
  textInputContainer: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  textInputGradient: {
    borderRadius: 22,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  textInput: {
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 120,
    fontWeight: '500',
    lineHeight: 22,
    minHeight: 22,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sendButtonInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMessageContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
  },
  backButtonGradient: {
    borderRadius: 20,
    padding: SPACING.sm,
  },
  logoContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  suggestionsContent: {
    gap: SPACING.sm,
  },
  suggestionChip: {
    marginRight: SPACING.sm,
  },
  suggestionGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.xs,
  },
  menuButtonGradient: {
    borderRadius: 20,
    padding: SPACING.sm,
  },
  aiAvatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    overflow: 'hidden',
  },
  aiAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aiAvatarGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  aiIndicatorPulse: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: '#000000',
  },
  aiMessageGradient: {
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  userMessageGradient: {
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
});

export default AICoachScreen; 