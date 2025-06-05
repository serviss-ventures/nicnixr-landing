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
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING } from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const RecoveryGuideScreen: React.FC = () => {
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey there! 👋 I'm your Recovery Guide, here to support you 24/7. Whether you're feeling strong or struggling, I'm here to listen and help. What's on your mind today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
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

  // Guide Avatar Component
  const GuideAvatar = ({ size = 40 }: { size?: number }) => (
    <View style={[styles.guideAvatar, { width: size, height: size }]}>
      <LinearGradient
        colors={['#10B981', '#06B6D4']}
        style={[styles.guideAvatarGradient, { borderRadius: size / 2 }]}
      >
        <Text style={[styles.guideAvatarText, { fontSize: size * 0.5 }]}>✨</Text>
      </LinearGradient>
      <View style={[styles.guidePulse, { 
        width: 12, 
        height: 12, 
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#000000'
      }]} />
    </View>
  );

  // Generate personalized responses
  const generatePersonalizedResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Craving responses
    if (lowerMessage.includes('crav') || lowerMessage.includes('want') || lowerMessage.includes('urge')) {
      const responses = [
        "I hear you - cravings can be really tough. 💪 Let's work through this together. What usually triggers these feelings for you?",
        "Cravings are temporary, even though they feel overwhelming. Try the 5-4-3-2-1 grounding technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste. How are you feeling now?",
        "You're stronger than any craving! 🌟 Remember, each time you resist, you're rewiring your brain. What healthy activity could you do right now instead?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Pride/success responses
    if (lowerMessage.includes('proud') || lowerMessage.includes('good') || lowerMessage.includes('great')) {
      const responses = [
        "That's amazing! 🎉 You should be incredibly proud of yourself. Every moment of success matters. What's been helping you stay strong?",
        "I'm so proud of you! 🌟 Celebrating these wins is important for your recovery journey. How does it feel to reach this milestone?",
        "You're doing incredible work! 💪 Your progress is inspiring. What would you like to accomplish next?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Struggle responses
    if (lowerMessage.includes('hard') || lowerMessage.includes('difficult') || lowerMessage.includes('struggle')) {
      const responses = [
        "I understand this is really challenging. 💙 Recovery isn't linear, and tough days are part of the journey. What specific part feels hardest right now?",
        "You're not alone in this struggle. 🤗 It takes incredible courage to keep going when things are hard. What's one small thing that might help today?",
        "Hard days don't erase your progress. You've come so far already. Let's focus on getting through today - what support do you need right now?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Default supportive response
    const defaultResponses = [
      "Thank you for sharing that with me. 💚 Tell me more about what's going on - I'm here to listen and support you.",
      "I appreciate you opening up. Every step in your recovery matters. How can I best support you today?",
      "You're taking positive steps by reaching out. 🌟 What would be most helpful for you right now?"
    ];
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isTyping) return;
    
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
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    // Simulate response delay
    const baseDelay = 800;
    const randomDelay = Math.random() * 700;
    const lengthDelay = Math.min(inputText.length * 20, 1000);
    
    setTimeout(() => {
      const response = generatePersonalizedResponse(userMessage.text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
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
    }, baseDelay + randomDelay + lengthDelay);
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
      <View style={styles.avatarContainer}>
        <GuideAvatar size={36} />
      </View>
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
      {!item.isUser && (
        <View style={styles.avatarContainer}>
          <GuideAvatar size={36} />
        </View>
      )}
      
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
              <Text style={styles.headerTitle}>Recovery Guide</Text>
              <View style={styles.statusRow}>
                <View style={styles.onlineDot} />
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
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
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
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  // Guide avatar styles
  guideAvatar: {
    position: 'relative',
  },
  guideAvatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideAvatarText: {
    fontWeight: 'bold',
  },
  guidePulse: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
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
  avatarContainer: {
    marginRight: 8,
    marginLeft: 0,
  },

  // Message bubbles - cleaner design
  messageBubble: {
    maxWidth: screenWidth * 0.75,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  guideBubble: {
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    marginRight: 40,
  },
  userBubble: {
    backgroundColor: '#10B981',
    marginLeft: 40,
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
    fontWeight: '400',
  },
  guideText: {
    color: '#F9FAFB',
  },
  userText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '400',
    marginTop: 4,
    opacity: 0.7,
  },
  guideTimestamp: {
    color: '#9CA3AF',
  },
  userTimestamp: {
    color: '#FFFFFF',
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },

  // Input area - clean like ChatGPT
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#F9FAFB',
    fontWeight: '400',
    lineHeight: 22,
    maxHeight: 120,
    paddingVertical: 10,
    paddingRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
  },
  sendButtonActive: {
    backgroundColor: '#10B981',
  },
});

export default RecoveryGuideScreen; 