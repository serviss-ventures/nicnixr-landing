import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CommunityStackParamList } from '../../navigation/CommunityStackNavigator';
import { COLORS, SPACING } from '../../constants/theme';
import * as Haptics from 'expo-haptics';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'buddy';
  timestamp: Date;
  type?: 'system' | 'check-in';
}

interface RouteParams {
  buddy: {
    id: string;
    name: string;
    avatar: string;
    daysClean: number;
    status: 'online' | 'offline';
  };
}

type NavigationProp = StackNavigationProp<CommunityStackParamList, 'BuddyChat'>;

const BuddyChatScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { buddy } = (route.params as RouteParams) || {
    buddy: {
      id: '1',
      name: 'Sarah M.',
      avatar: '👩‍🦰',
      daysClean: 12,
      status: 'online',
    }
  };
  
  const [message, setMessage] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey! So glad we matched. How are you doing today?',
      sender: 'buddy',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      text: "Hi Sarah! I'm doing okay, day 8 is tough but pushing through. How about you?",
      sender: 'me',
      timestamp: new Date(Date.now() - 3000000),
    },
    {
      id: '3',
      text: "I remember day 8! The cravings were intense. What's helping you cope?",
      sender: 'buddy',
      timestamp: new Date(Date.now() - 2400000),
    },
    {
      id: '4',
      text: "I've been going for walks when it gets bad. Also the breathing exercises in the app help!",
      sender: 'me',
      timestamp: new Date(Date.now() - 1800000),
    },
    {
      id: '5',
      text: "That's great! Walking saved me so many times. Want to do a daily check-in? We could message each evening to see how we did?",
      sender: 'buddy',
      timestamp: new Date(Date.now() - 1200000),
    },
    {
      id: '6',
      text: "🎯 Daily Check-in Scheduled",
      sender: 'buddy',
      timestamp: new Date(Date.now() - 600000),
      type: 'system',
    },
  ]);
  
  const flatListRef = useRef<FlatList>(null);
  
  // Scroll to bottom when component mounts or messages change
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, [messages]);
  
  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: 'me',
        timestamp: new Date(),
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate buddy response
      setTimeout(() => {
        const responses = [
          "That's awesome! Keep it up! 💪",
          "I'm here if you need to talk more.",
          "You've got this! One day at a time.",
          "Thanks for sharing. How can I support you?",
        ];
        
        const buddyResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: 'buddy',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, buddyResponse]);
      }, 2000);
    }
  };
  
  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';
    
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }
    
    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        {!isMe && <Text style={styles.messageAvatar}>{buddy.avatar}</Text>}
        <View style={[styles.messageBubble, isMe && styles.messageBubbleMe]}>
          <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };
  
  const quickResponses = [
    "How are you today? 👋",
    "Having a craving right now 😰",
    "Just wanted to check in ✅",
    "Thanks for the support! 🙏",
    "Feeling strong today! 💪",
    "Need some motivation 🎯",
  ];
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#000000', '#0A0F1C', '#0F172A']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <View style={styles.headerTitleRow}>
                <Text style={styles.headerAvatar}>{buddy.avatar}</Text>
                <View>
                  <Text style={styles.headerName}>{buddy.name}</Text>
                  <View style={styles.headerStatus}>
                    <Text style={styles.statusText}>
                      Day {buddy.daysClean}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <TouchableOpacity onPress={() => setShowOptionsMenu(true)}>
              <Ionicons name="ellipsis-vertical" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
          />
        </SafeAreaView>
        
        {/* Quick Responses */}
        <View style={styles.quickResponsesWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickResponsesContainer}
            contentContainerStyle={styles.quickResponsesContent}
          >
            {quickResponses.map((text, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickResponse}
                onPress={() => {
                  setMessage(text);
                  // Just populate the message box, don't send
                }}
              >
                <Text style={styles.quickResponseText}>{text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor={COLORS.textMuted}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={sendMessage}
                disabled={!message.trim()}
              >
                <LinearGradient
                  colors={message.trim() ? ['#8B5CF6', '#EC4899'] : ['#374151', '#374151']}
                  style={styles.sendButtonGradient}
                >
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        
        {/* Options Menu Modal */}
        <Modal
          visible={showOptionsMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowOptionsMenu(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1}
            onPress={() => setShowOptionsMenu(false)}
          >
            <View style={styles.optionsMenu}>
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowOptionsMenu(false);
                  // Navigate to buddy profile
                  navigation.navigate('BuddyProfile', { buddy });
                }}
              >
                <Ionicons name="person-outline" size={20} color={COLORS.text} />
                <Text style={styles.optionText}>View Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowOptionsMenu(false);
                  Alert.alert(
                    'Mute Notifications',
                    'You can temporarily mute notifications from this buddy.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Mute for 1 hour', onPress: () => {} },
                      { text: 'Mute for 24 hours', onPress: () => {} },
                    ]
                  );
                }}
              >
                <Ionicons name="notifications-off-outline" size={20} color={COLORS.text} />
                <Text style={styles.optionText}>Mute Notifications</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowOptionsMenu(false);
                  Alert.alert(
                    'Report Issue',
                    'Is there something wrong? We take all reports seriously.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Report', style: 'destructive', onPress: () => {
                        Alert.alert('Report Submitted', 'Thank you. We will review this and take appropriate action.');
                      }},
                    ]
                  );
                }}
              >
                <Ionicons name="flag-outline" size={20} color="#F59E0B" />
                <Text style={[styles.optionText, { color: '#F59E0B' }]}>Report Issue</Text>
              </TouchableOpacity>
              
              <View style={styles.optionDivider} />
              
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setShowOptionsMenu(false);
                  Alert.alert(
                    'End Buddy Connection?',
                    `Are you sure you want to disconnect from ${buddy.name}?\n\nThis will remove them from your buddy list. You can always match with new buddies later.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'End Connection', 
                        style: 'destructive',
                        onPress: async () => {
                          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          Alert.alert(
                            'Connection Ended',
                            'We hope you find the right buddy match for your journey. Stay strong! 💪',
                            [{ 
                              text: 'OK', 
                              onPress: () => navigation.goBack() 
                            }]
                          );
                        }
                      },
                    ]
                  );
                }}
              >
                <Ionicons name="person-remove-outline" size={20} color="#EF4444" />
                <Text style={[styles.optionText, { color: '#EF4444' }]}>End Buddy Connection</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </LinearGradient>
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
  headerInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerAvatar: {
    fontSize: 32,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  messagesList: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    fontSize: 24,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: SPACING.md,
    borderBottomLeftRadius: 4,
  },
  messageBubbleMe: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 20,
  },
  messageTextMe: {
    color: COLORS.text,
  },
  messageTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  messageTimeMe: {
    color: COLORS.textMuted,
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  systemMessageText: {
    fontSize: 12,
    color: COLORS.textMuted,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  quickResponsesWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickResponsesContainer: {
    height: 50,
  },
  quickResponsesContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  quickResponse: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginRight: SPACING.sm,
  },
  quickResponseText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: SPACING.lg,
  },
  optionsMenu: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  optionText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  optionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: SPACING.xs,
  },
});

export default BuddyChatScreen; 