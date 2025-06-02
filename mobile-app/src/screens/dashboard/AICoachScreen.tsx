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
  Keyboard,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';
import Svg, { Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop, G } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

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

  // Modern AI Avatar component
  const AIAvatar = ({ size = 40 }: { size?: number }) => (
    <View style={[styles.modernAiAvatar, { width: size, height: size, borderRadius: size * 0.5 }]}>
      <LinearGradient
        colors={['#10B981', '#06B6D4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.modernAiAvatarGradient, { borderRadius: size * 0.5 }]}
      >
        <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
          <Defs>
            <SvgLinearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.7" />
            </SvgLinearGradient>
          </Defs>
          
          {/* Simplified modern AI icon */}
          <G>
            {/* Central core */}
            <Circle cx={12} cy={12} r={2} fill="url(#aiGrad)" />
            
            {/* Neural connections */}
            <Path 
              d="M12 6 L18 9 L18 15 L12 18 L6 15 L6 9 Z" 
              stroke="url(#aiGrad)" 
              strokeWidth="1.5" 
              fill="none"
              opacity="0.8"
            />
            
            {/* Connection nodes */}
            <Circle cx={12} cy={6} r={1.5} fill="url(#aiGrad)" opacity="0.9" />
            <Circle cx={18} cy={9} r={1.5} fill="url(#aiGrad)" opacity="0.7" />
            <Circle cx={18} cy={15} r={1.5} fill="url(#aiGrad)" opacity="0.9" />
            <Circle cx={12} cy={18} r={1.5} fill="url(#aiGrad)" opacity="0.7" />
            <Circle cx={6} cy={15} r={1.5} fill="url(#aiGrad)" opacity="0.9" />
            <Circle cx={6} cy={9} r={1.5} fill="url(#aiGrad)" opacity="0.7" />
          </G>
        </Svg>
      </LinearGradient>
      
      {/* Active status indicator */}
      <View style={styles.modernStatusIndicator}>
        <View style={styles.modernStatusDot} />
      </View>
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

  const ModernTypingIndicator = () => (
    <View style={styles.modernMessageRow}>
      <View style={styles.modernAvatarContainer}>
        <AIAvatar size={36} />
      </View>
      <View style={[styles.modernMessageBubble, styles.modernAiMessageBubble]}>
        <Animated.View style={[styles.modernTypingContainer, { opacity: typingAnimation }]}>
          <View style={styles.modernTypingDots}>
            <Animated.View style={[
              styles.modernTypingDot,
              {
                opacity: typingAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3]
                })
              }
            ]} />
            <Animated.View style={[
              styles.modernTypingDot,
              {
                opacity: typingAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3]
                })
              }
            ]} />
            <Animated.View style={[
              styles.modernTypingDot,
              {
                opacity: typingAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3]
                })
              }
            ]} />
          </View>
        </Animated.View>
      </View>
    </View>
  );

  return (
    <View style={styles.modernContainer}>
      <LinearGradient
        colors={['#000000', '#111827', '#1F2937']}
        style={styles.modernGradient}
      >
        <SafeAreaView style={styles.modernSafeArea} edges={['top']}>
          {/* Modern Clean Header */}
          <View style={styles.modernHeader}>
            <TouchableOpacity 
              style={styles.modernBackButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            
            <View style={styles.modernHeaderContent}>
              <AIAvatar size={40} />
              <View style={styles.modernHeaderInfo}>
                <Text style={styles.modernHeaderTitle}>AI Recovery Coach</Text>
                <View style={styles.modernStatusRow}>
                  <View style={styles.modernOnlineDot} />
                  <Text style={styles.modernHeaderSubtitle}>Active • Always here to help</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={styles.modernMenuButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Modern Messages Area */}
          <View style={styles.modernMessagesWrapper}>
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
              <ScrollView 
                ref={scrollViewRef}
                style={styles.modernMessagesContainer}
                contentContainerStyle={styles.modernMessagesContent}
                showsVerticalScrollIndicator={false}
                keyboardDismissMode="interactive"
                keyboardShouldPersistTaps="handled"
              >
                {messages.map((message) => (
                  <View key={message.id} style={[
                    styles.modernMessageRow,
                    message.isUser && styles.modernUserMessageRow
                  ]}>
                    {!message.isUser && (
                      <View style={styles.modernAvatarContainer}>
                        <AIAvatar size={36} />
                      </View>
                    )}
                    
                    <View style={[
                      styles.modernMessageBubble,
                      message.isUser ? styles.modernUserMessageBubble : styles.modernAiMessageBubble
                    ]}>
                      <Text style={[
                        styles.modernMessageText,
                        message.isUser ? styles.modernUserMessageText : styles.modernAiMessageText
                      ]}>
                        {message.text}
                      </Text>
                      <Text style={[
                        styles.modernTimestamp,
                        message.isUser ? styles.modernUserTimestamp : styles.modernAiTimestamp
                      ]}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                  </View>
                ))}
                
                {isTyping && <ModernTypingIndicator />}
              </ScrollView>
            </TouchableWithoutFeedback>
          </View>

          {/* Modern Quick Suggestions */}
          {messages.length === 1 && !isTyping && (
            <View style={styles.modernSuggestionsContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.modernSuggestionsContent}
              >
                {quickSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.modernSuggestionChip}
                    onPress={() => setInputText(suggestion)}
                  >
                    <Text style={styles.modernSuggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Modern Input Area */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
            style={styles.modernInputKeyboardContainer}
          >
            <View style={styles.modernInputContainer}>
              <View style={styles.modernInputRow}>
                <View style={styles.modernTextInputContainer}>
                  <TextInput
                    style={styles.modernTextInput}
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
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.modernSendButton,
                    inputText.trim() ? styles.modernSendButtonActive : styles.modernSendButtonInactive
                  ]}
                  onPress={sendMessage}
                  disabled={!inputText.trim() || isTyping}
                >
                  {inputText.trim() ? (
                    <LinearGradient
                      colors={['#10B981', '#06B6D4']}
                      style={styles.modernSendButtonGradient}
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
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  // Modern Container Styles
  modernContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modernGradient: {
    flex: 1,
  },
  modernSafeArea: {
    flex: 1,
  },

  // Modern Header Styles
  modernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.3)',
  },
  modernBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modernHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  modernHeaderTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  modernStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  modernOnlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  modernHeaderSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  modernMenuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // Modern AI Avatar Styles
  modernAiAvatar: {
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modernAiAvatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernStatusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#111827',
  },
  modernStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },

  // Modern Messages Area Styles
  modernMessagesWrapper: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modernMessagesContainer: {
    flex: 1,
  },
  modernMessagesContent: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  modernMessageRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  modernUserMessageRow: {
    flexDirection: 'row-reverse',
  },
  modernAvatarContainer: {
    marginHorizontal: 8,
  },

  // Modern Message Bubble Styles
  modernMessageBubble: {
    maxWidth: screenWidth * 0.75,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  modernAiMessageBubble: {
    backgroundColor: '#1F2937',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  modernUserMessageBubble: {
    backgroundColor: '#10B981',
    borderBottomRightRadius: 4,
  },

  // Modern Message Text Styles
  modernMessageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    marginBottom: 6,
  },
  modernAiMessageText: {
    color: '#F9FAFB',
  },
  modernUserMessageText: {
    color: '#FFFFFF',
  },
  modernTimestamp: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.7,
  },
  modernAiTimestamp: {
    color: '#9CA3AF',
  },
  modernUserTimestamp: {
    color: '#FFFFFF',
    textAlign: 'right',
  },

  // Modern Typing Indicator Styles
  modernTypingContainer: {
    paddingVertical: 4,
  },
  modernTypingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modernTypingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },

  // Modern Suggestions Styles
  modernSuggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(55, 65, 81, 0.3)',
  },
  modernSuggestionsContent: {
    gap: 8,
  },
  modernSuggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    marginRight: 8,
  },
  modernSuggestionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F9FAFB',
  },

  // Modern Input Styles
  modernInputKeyboardContainer: {
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
  },
  modernInputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(55, 65, 81, 0.3)',
  },
  modernInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  modernTextInputContainer: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  modernTextInput: {
    fontSize: 16,
    color: '#F9FAFB',
    fontWeight: '400',
    lineHeight: 20,
    maxHeight: 100,
    minHeight: 20,
  },
  modernSendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  },
  modernSendButtonActive: {
    backgroundColor: '#10B981',
  },
  modernSendButtonInactive: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
  },
  modernSendButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AICoachScreen; 