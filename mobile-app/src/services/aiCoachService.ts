import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AICoachSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'crisis';
  helpfulness_rating?: number;
  intervention_triggered: boolean;
  topics_discussed: string[];
}

export interface AICoachMessage {
  id: string;
  session_id: string;
  user_id: string;
  message_text: string;
  is_user_message: boolean;
  sentiment?: string;
  topics?: string[];
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  response_time_ms?: number;
  created_at: string;
}

export const AI_COACH_SESSION_KEY = '@ai_coach_session';

class AICoachService {
  private currentSession: AICoachSession | null = null;

  async startSession(userId: string): Promise<AICoachSession | null> {
    try {
      const { data, error } = await supabase
        .from('ai_coach_sessions')
        .insert({
          user_id: userId,
          started_at: new Date().toISOString(),
          topics_discussed: []
        })
        .select()
        .single();

      if (error) throw error;

      this.currentSession = data;
      await AsyncStorage.setItem(AI_COACH_SESSION_KEY, JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('Error starting AI coach session:', error);
      return null;
    }
  }

  async endSession(sessionId: string, rating?: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_coach_sessions')
        .update({
          ended_at: new Date().toISOString(),
          helpfulness_rating: rating
        })
        .eq('id', sessionId);

      if (error) throw error;

      this.currentSession = null;
      await AsyncStorage.removeItem(AI_COACH_SESSION_KEY);
      
      return true;
    } catch (error) {
      console.error('Error ending AI coach session:', error);
      return false;
    }
  }

  async sendMessage(
    sessionId: string,
    userId: string,
    messageText: string,
    isUserMessage: boolean,
    responseTimeMs?: number
  ): Promise<AICoachMessage | null> {
    try {
      const sentiment = this.analyzeSentiment(messageText);
      const topics = this.extractTopics(messageText);
      const riskLevel = this.assessRiskLevel(messageText);

      const { data, error } = await supabase
        .from('ai_coach_messages')
        .insert({
          session_id: sessionId,
          user_id: userId,
          message_text: messageText,
          is_user_message: isUserMessage,
          sentiment,
          topics,
          risk_level: riskLevel,
          response_time_ms: responseTimeMs
        })
        .select()
        .single();

      if (error) throw error;

      // Update session with topics and intervention status
      if (!isUserMessage && riskLevel === 'critical') {
        await this.triggerIntervention(sessionId);
      }

      if (topics.length > 0) {
        await this.updateSessionTopics(sessionId, topics);
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  async getCurrentSession(userId: string): Promise<AICoachSession | null> {
    try {
      // First check local storage
      const stored = await AsyncStorage.getItem(AI_COACH_SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }

      // Check for active session in database
      const { data, error } = await supabase
        .from('ai_coach_sessions')
        .select('*')
        .eq('user_id', userId)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      this.currentSession = data;
      await AsyncStorage.setItem(AI_COACH_SESSION_KEY, JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  async getSessionMessages(sessionId: string): Promise<AICoachMessage[]> {
    try {
      const { data, error } = await supabase
        .from('ai_coach_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting session messages:', error);
      return [];
    }
  }

  async getRecentMessages(sessionId: string, limit: number = 50): Promise<AICoachMessage[]> {
    try {
      const { data, error } = await supabase
        .from('ai_coach_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting recent messages:', error);
      return [];
    }
  }

  async getSessionMessageCount(sessionId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('ai_coach_messages')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error getting message count:', error);
      return 0;
    }
  }

  async cleanupOldSessions(userId: string, daysOld: number): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await supabase
        .from('ai_coach_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('user_id', userId)
        .is('ended_at', null)
        .lt('started_at', cutoffDate.toISOString());

      if (error) throw error;
    } catch (error) {
      console.error('Error cleaning up old sessions:', error);
    }
  }

  // Archive old messages (can be called by a scheduled job)
  async archiveOldMessages(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      // First, get count of messages to be archived
      const { count } = await supabase
        .from('ai_coach_messages')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', cutoffDate.toISOString());

      // In a real implementation, you'd move these to an archive table
      // For now, we'll just log what would be archived
      console.log(`Would archive ${count} messages older than ${daysToKeep} days`);

      return count || 0;
    } catch (error) {
      console.error('Error archiving old messages:', error);
      return 0;
    }
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' | 'crisis' {
    const lowerText = text.toLowerCase();
    
    // Crisis keywords
    if (lowerText.includes('give up') || lowerText.includes('relapse') || 
        lowerText.includes('can\'t do this') || lowerText.includes('hopeless')) {
      return 'crisis';
    }
    
    // Negative keywords
    if (lowerText.includes('struggle') || lowerText.includes('hard') || 
        lowerText.includes('craving') || lowerText.includes('difficult')) {
      return 'negative';
    }
    
    // Positive keywords
    if (lowerText.includes('proud') || lowerText.includes('good') || 
        lowerText.includes('better') || lowerText.includes('success')) {
      return 'positive';
    }
    
    return 'neutral';
  }

  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('crav')) topics.push('cravings');
    if (lowerText.includes('trigger')) topics.push('triggers');
    if (lowerText.includes('stress') || lowerText.includes('anxi')) topics.push('stress');
    if (lowerText.includes('withdraw')) topics.push('withdrawal');
    if (lowerText.includes('relapse')) topics.push('relapse');
    if (lowerText.includes('sleep')) topics.push('sleep');
    if (lowerText.includes('motiv')) topics.push('motivation');
    if (lowerText.includes('support')) topics.push('support');
    
    return topics;
  }

  private assessRiskLevel(text: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('relapse') || lowerText.includes('give up') || 
        lowerText.includes('cant do this')) {
      return 'critical';
    }
    
    if (lowerText.includes('strong craving') || lowerText.includes('really struggling')) {
      return 'high';
    }
    
    if (lowerText.includes('craving') || lowerText.includes('difficult')) {
      return 'medium';
    }
    
    return 'low';
  }

  private async triggerIntervention(sessionId: string): Promise<void> {
    try {
      await supabase
        .from('ai_coach_sessions')
        .update({ intervention_triggered: true })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error triggering intervention:', error);
    }
  }

  private async updateSessionTopics(sessionId: string, newTopics: string[]): Promise<void> {
    try {
      const { data: session } = await supabase
        .from('ai_coach_sessions')
        .select('topics_discussed')
        .eq('id', sessionId)
        .single();

      if (session) {
        const allTopics = [...new Set([...(session.topics_discussed || []), ...newTopics])];
        
        await supabase
          .from('ai_coach_sessions')
          .update({ topics_discussed: allTopics })
          .eq('id', sessionId);
      }
    } catch (error) {
      console.error('Error updating session topics:', error);
    }
  }

  // Generate AI response using OpenAI via our API
  async generateAIResponse(
    userMessage: string, 
    userId: string, 
    sessionId: string,
    conversationHistory: Array<{ text: string; isUser: boolean }> = []
  ): Promise<string> {
    try {
      // Get the admin dashboard URL
      // For physical devices, use your network IP. For simulators, localhost might work
      const API_URL = process.env.EXPO_PUBLIC_ADMIN_API_URL || 
        (__DEV__ ? 'http://192.168.1.171:3000' : 'https://your-production-api.com');
      
      console.log('Calling AI coach API at:', `${API_URL}/api/ai-coach/chat`);
      
      const requestBody = {
        message: userMessage,
        userId,
        sessionId,
        conversationHistory
      };
      
      console.log('Sending request to AI Coach API:', requestBody);
      
      const response = await fetch(`${API_URL}/api/ai-coach/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      console.log('API Response status:', response.status);
      console.log('API Response text:', responseText);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      
      // Log usage for monitoring (you might want to store this)
      if (data.usage) {
        console.log('OpenAI usage:', data.usage);
      }

      return data.response;
      
    } catch (error) {
      console.error('Error calling AI coach API:', error);
      
      // Fallback to a helpful response if API fails
      return this.getFallbackResponse(userMessage);
    }
  }

  // Fallback responses if API is unavailable
  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('crav') || lowerMessage.includes('want') || lowerMessage.includes('urge')) {
      return "Ugh, cravings are the worst 😤 They usually peak around 15-20 minutes then start fading. What usually triggers yours? Sometimes knowing the pattern helps us outsmart them";
    }
    
    if (lowerMessage.includes('proud') || lowerMessage.includes('good') || lowerMessage.includes('great')) {
      return "Yes!! This is amazing! 🎉 Seriously, every single hour without nicotine is your brain healing. What's feeling different for you? I love hearing what people notice first";
    }
    
    if (lowerMessage.includes('hard') || lowerMessage.includes('difficult') || lowerMessage.includes('struggle')) {
      return "I hear you - this IS hard. No sugarcoating that. Most people tell me days 3-5 are the roughest, then it slowly gets easier. Where are you at in your quit? And what's the toughest part right now?";
    }

    if (lowerMessage.includes('day 1') || lowerMessage.includes('first day') || lowerMessage.includes('just quit')) {
      return "Day 1! You're doing it! 💪 The first 24 hours can be intense - your body's like 'hey, where's my nicotine?' How are you feeling so far? Any surprises?";
    }

    if (lowerMessage.includes('relapse') || lowerMessage.includes('failed') || lowerMessage.includes('gave in')) {
      return "Hey, you're here and that's what matters. Seriously. Most people try several times before it sticks - each attempt teaches you something. What happened this time? No judgment, just learning";
    }
    
    return "Tell me more about that - I want to make sure I really understand what you're going through right now 💭";
  }
}

export default new AICoachService(); 