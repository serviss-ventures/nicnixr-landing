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
          <Text style={styles.avatarText}>AI</Text>
        </View>
      </View>
      <View style={[styles.messageBubble, styles.aiMessage]}>
        <Animated.View style={[styles.typingDots, { opacity: typingAnimation }]}>
          <Text style={styles.typingText}>Coach is thinking...</Text>
        </Animated.View>
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>AI</Text>
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>Recovery Coach</Text>
                <Text style={styles.headerSubtitle}>Always here to help</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textMuted} />
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
                      <Text style={styles.avatarText}>AI</Text>
                    </View>
                  </View>
                )}
                
                <View style={[
                  styles.messageBubble,
                  message.isUser ? styles.userMessage : styles.aiMessage
                ]}>
                  <Text style={[
                    styles.messageText,
                    message.isUser ? styles.userMessageText : styles.aiMessageText
                  ]}>
                    {message.text}
                  </Text>
                  <Text style={[
                    styles.timestamp,
                    message.isUser ? styles.userTimestamp : styles.aiTimestamp
                  ]}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
              </View>
            ))}
            
            {isTyping && <TypingIndicator />}
          </ScrollView>

          {/* Input Area */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.inputContainer}
          >
            <View style={styles.inputRow}>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type your message..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  maxLength={500}
                  returnKeyType="send"
                  onSubmitEditing={sendMessage}
                />
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
                ]}
                onPress={sendMessage}
                disabled={!inputText.trim() || isTyping}
              >
                <Ionicons 
                  name="arrow-up" 
                  size={20} 
                  color={inputText.trim() ? '#FFFFFF' : COLORS.textMuted} 
                />
              </TouchableOpacity>
            </View>
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
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  menuButton: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    alignItems: 'flex-end',
  },
  avatarContainer: {
    marginRight: SPACING.sm,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
    maxWidth: '75%',
  },
  aiMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: SPACING.xs,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: COLORS.text,
  },
  timestamp: {
    fontSize: 11,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: COLORS.textMuted,
  },
  typingDots: {
    paddingVertical: SPACING.xs,
  },
  typingText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textInput: {
    fontSize: 16,
    color: COLORS.text,
    maxHeight: 100,
    paddingVertical: SPACING.xs,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sendButtonInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  userMessageContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
  },
});

export default AICoachScreen; 