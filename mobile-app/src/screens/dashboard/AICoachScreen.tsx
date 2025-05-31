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
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';
import NixRLogo from '../../components/common/NixRLogo';

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
        <View style={styles.aiAvatar}>
          {/* Enhanced Grey Logo for AI Avatar */}
          <LinearGradient
            colors={['#6B7280', '#4B5563']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiAvatarGradient}
          >
            <Text style={styles.aiAvatarText}>NX</Text>
            <View style={styles.aiAvatarGlow} />
          </LinearGradient>
        </View>
      </View>
      <View style={[styles.messageBubble, styles.aiMessage]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.08)']}
          style={styles.aiMessageGradient}
        >
          <Animated.View style={[styles.typingDots, { opacity: typingAnimation }]}>
            <Text style={styles.typingText}>Coach is thinking...</Text>
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
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
                {/* Enhanced Grey Logo */}
                <LinearGradient
                  colors={['#6B7280', '#4B5563']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoContainer}
                >
                  <Text style={styles.logoText}>NX</Text>
                  <View style={styles.logoGlow} />
                </LinearGradient>
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

          {/* Messages */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View key={message.id} style={[
                styles.messageContainer,
                message.isUser && styles.userMessageContainer
              ]}>
                {!message.isUser && (
                  <View style={styles.avatarContainer}>
                    <View style={styles.aiAvatar}>
                      {/* Enhanced Grey Logo for AI Avatar */}
                      <LinearGradient
                        colors={['#6B7280', '#4B5563']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.aiAvatarGradient}
                      >
                        <Text style={styles.aiAvatarText}>NX</Text>
                        <View style={styles.aiAvatarGlow} />
                      </LinearGradient>
                    </View>
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

          {/* Enhanced Input Area */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.inputContainer}
          >
            <LinearGradient
              colors={['rgba(0, 0, 0, 0.8)', 'rgba(10, 15, 28, 0.9)']}
              style={styles.inputBackground}
            >
              <View style={styles.inputRow}>
                <View style={styles.textInputContainer}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.08)']}
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
                      colors={[COLORS.primary, '#0891B2']}
                      style={styles.sendButtonGradient}
                    >
                      <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
                    </LinearGradient>
                  ) : (
                    <View style={styles.sendButtonInactiveContainer}>
                      <Ionicons name="arrow-up" size={20} color={COLORS.textMuted} />
                    </View>
                  )}
                </TouchableOpacity>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    shadowColor: '#6B7280',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
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
  typingText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  textInputContainer: {
    flex: 1,
  },
  textInput: {
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 120,
    fontWeight: '500',
    lineHeight: 22,
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
  },
  sendButtonActive: {
    transform: [{ scale: 1 }],
  },
  sendButtonInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    transform: [{ scale: 0.95 }],
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
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  aiMessageGradient: {
    padding: SPACING.md,
    borderRadius: 16,
  },
  userMessageGradient: {
    padding: SPACING.md,
    borderRadius: 16,
  },
  inputBackground: {
    borderRadius: 20,
    padding: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  textInputGradient: {
    flex: 1,
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sendButtonGradient: {
    borderRadius: 20,
    padding: SPACING.md,
  },
  sendButtonInactiveContainer: {
    borderRadius: 20,
    padding: SPACING.md,
  },
});

export default AICoachScreen; 