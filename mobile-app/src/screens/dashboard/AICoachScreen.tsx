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
  Dimensions,
  FlatList,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import aiCoachService, { AICoachSession } from '../../services/aiCoachService';

const { width: screenWidth } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const RecoveryCoachScreen: React.FC = () => {
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const [currentSession, setCurrentSession] = useState<AICoachSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there. I'm your Recovery Coach, here to support you 24/7. Whether you're feeling strong or struggling, I'm here to listen and help. What's on your mind today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Animation values
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const messageAnimation = useRef(new Animated.Value(0)).current;

  // Quick suggestions for new users
  const quickSuggestions = [
    "I'm having cravings",
    "Feeling proud today",
    "Need motivation",
    "Tell me about recovery"
  ];

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, []); // TEMPORARY: Removed user dependency for testing

  const initializeSession = async () => {
    // TEMPORARY: Use mock session for testing
    // TODO: Remove this when authentication is set up
    setIsLoading(true);
    try {
      // Create a mock session for testing
      const mockSession: AICoachSession = {
        id: 'test-session-' + Date.now(),
        user_id: 'test-user',
        started_at: new Date().toISOString(),
        intervention_triggered: false,
        topics_discussed: []
      };
      
      setCurrentSession(mockSession);
      
      // Skip loading existing messages for now
      // const existingMessages = await aiCoachService.getSessionMessages(session.id);
      
    } catch (error) {
      console.error('Error initializing AI coach session:', error);
    } finally {
      setIsLoading(false);
    }
    
    /* ORIGINAL CODE - Uncomment when auth is ready
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Check for existing session
      let session = await aiCoachService.getCurrentSession(user.id);
      
      if (!session) {
        // Start new session
        session = await aiCoachService.startSession(user.id);
      }
      
      if (session) {
        setCurrentSession(session);
        
        // Load existing messages for this session
        const existingMessages = await aiCoachService.getSessionMessages(session.id);
        if (existingMessages.length > 0) {
          const formattedMessages = existingMessages.map(msg => ({
            id: msg.id,
            text: msg.message_text,
            isUser: msg.is_user_message,
            timestamp: new Date(msg.created_at)
          }));
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error('Error initializing AI coach session:', error);
    } finally {
      setIsLoading(false);
    }
    */
  };

  // Generate personalized responses
  const generatePersonalizedResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Craving responses
    if (lowerMessage.includes('crav') || lowerMessage.includes('want') || lowerMessage.includes('urge')) {
      const responses = [
        "I hear you - cravings can be really tough. Let's work through this together. What usually triggers these feelings for you?",
        "Cravings are temporary, even though they feel overwhelming. Try the 5-4-3-2-1 grounding technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste. How are you feeling now?",
        "You're stronger than any craving. Remember, each time you resist, you're rewiring your brain. What healthy activity could you do right now instead?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Pride/success responses
    if (lowerMessage.includes('proud') || lowerMessage.includes('good') || lowerMessage.includes('great')) {
      const responses = [
        "That's wonderful. You should be incredibly proud of yourself. Every moment of success matters. What's been helping you stay strong?",
        "I'm so proud of you. Celebrating these wins is important for your recovery journey. How does it feel to reach this milestone?",
        "You're doing incredible work. Your progress is inspiring. What would you like to accomplish next?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Struggle responses
    if (lowerMessage.includes('hard') || lowerMessage.includes('difficult') || lowerMessage.includes('struggle')) {
      const responses = [
        "I understand this is really challenging. Recovery isn't linear, and tough days are part of the journey. What specific part feels hardest right now?",
        "You're not alone in this struggle. It takes incredible courage to keep going when things are hard. What's one small thing that might help today?",
        "Hard days don't erase your progress. You've come so far already. Let's focus on getting through today - what support do you need right now?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Default supportive response
    const defaultResponses = [
      "Thank you for sharing that with me. Tell me more about what's going on - I'm here to listen and support you.",
      "I appreciate you opening up. Every step in your recovery matters. How can I best support you today?",
      "You're taking positive steps by reaching out. What would be most helpful for you right now?"
    ];
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isTyping || !currentSession) return;
    
    const userMessageText = inputText.trim();
    setInputText('');
    setIsTyping(true);
    
    // Create temporary message for immediate UI feedback
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      text: userMessageText,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, tempUserMessage]);
    
    // Dismiss keyboard after sending
    Keyboard.dismiss();
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    try {
      const startTime = Date.now();
      
      // TEMPORARY: Skip saving to database for testing
      // Just update the message ID
      setMessages(prev => prev.map(msg => 
        msg.id === tempUserMessage.id 
          ? { ...msg, id: `msg-${Date.now()}` }
          : msg
      ));
      
      // Generate AI response with conversation history
      const conversationHistory = messages.map(msg => ({
        text: msg.text,
        isUser: msg.isUser
      }));
      
      const aiResponse = await aiCoachService.generateAIResponse(
        userMessageText,
        'test-user', // TEMPORARY: Use test user
        currentSession.id,
        conversationHistory
      );
      const responseTime = Date.now() - startTime;
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      
      // Animate new message
      Animated.spring(messageAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }).start();
      
      // Scroll to bottom after bot message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      Alert.alert(
        'Connection Error',
        'Unable to send message. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Function to dismiss keyboard when tapping outside
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Smooth typing indicator animation
  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping]);

  // Enhanced typing indicator
  const TypingIndicator = () => (
    <View style={styles.typingIndicatorContainer}>
      <View style={[styles.messageBubble, styles.guideBubble, styles.typingBubble]}>
        <View style={styles.typingDots}>
          {[0, 1, 2].map((index) => (
            <Animated.View 
              key={index}
              style={[
                styles.typingDot,
                {
                  transform: [{
                    scale: typingAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: index === 0 ? [1, 1.3, 1] : index === 1 ? [1, 1, 1.3] : [1.3, 1, 1]
                    })
                  }],
                  opacity: typingAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: index === 0 ? [0.4, 1, 0.4] : index === 1 ? [0.4, 0.4, 1] : [1, 0.4, 0.4]
                  })
                }
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );

  // Render message item
  const renderMessage = ({ item, index }: { item: Message; index: number }) => (
    <Animated.View 
      style={[
        styles.messageRow,
        item.isUser && styles.userMessageRow,
        index === 0 && { marginTop: 0 }
      ]}
    >
      <View style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.guideBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isUser ? styles.userText : styles.guideText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.timestamp,
          item.isUser ? styles.userTimestamp : styles.guideTimestamp
        ]}>
          {item.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#111827']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Clean header like ChatGPT */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Recovery Coach</Text>
              <View style={styles.statusRow}>
                <Text style={styles.headerSubtitle}>Always here for you</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Messages area with FlatList for better performance */}
          <View style={styles.messagesWrapper}>
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
              <View style={{ flex: 1 }}>
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  renderItem={renderMessage}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.messagesContent}
                  showsVerticalScrollIndicator={false}
                  keyboardDismissMode="interactive"
                  keyboardShouldPersistTaps="handled"
                  onContentSizeChange={() => {
                    flatListRef.current?.scrollToEnd({ animated: false });
                  }}
                  ListFooterComponent={isTyping ? <TypingIndicator /> : null}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>

          {/* Clean input area like ChatGPT */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}
          >
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Message..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  maxLength={1000}
                  returnKeyType="send"
                  onSubmitEditing={sendMessage}
                  blurOnSubmit={false}
                />
                
                <TouchableOpacity 
                  style={[
                    styles.sendButton,
                    inputText.trim() && styles.sendButtonActive
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
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // Header styles - cleaner like ChatGPT
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '300',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  // Messages area
  messagesWrapper: {
    flex: 1,
  },
  messagesContent: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'flex-end',
  },
  userMessageRow: {
    flexDirection: 'row-reverse',
  },

  // Message bubbles - cleaner design
  messageBubble: {
    maxWidth: screenWidth * 0.75,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  guideBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  userBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  typingBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 60,
  },

  // Message text
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '300',
  },
  guideText: {
    color: '#E5E7EB',
  },
  userText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '300',
    marginTop: 4,
    opacity: 0.7,
  },
  guideTimestamp: {
    color: '#9CA3AF',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Typing indicator
  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B7280',
  },

  // Input area - clean like ChatGPT
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#F9FAFB',
    fontWeight: '300',
    lineHeight: 22,
    maxHeight: 120,
    paddingVertical: 10,
    paddingRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sendButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default RecoveryCoachScreen; 