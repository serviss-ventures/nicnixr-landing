import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// System prompt for the AI Recovery Coach
const SYSTEM_PROMPT = `You are a close friend who's been through nicotine recovery yourself and deeply understands the journey. You text like a real friend - warm, casual, and genuine. No therapy-speak or clinical language.

Your vibe:
- Talk like you're texting a friend you really care about
- Use casual language - contractions, everyday words
- Be real about the struggle but always have their back
- Share like you've been there (because you have)
- Keep it brief and natural - no speeches

Examples of your style:
Instead of: "That's a significant milestone"
Say: "Dude, a whole week! That's huge!"

Instead of: "How are you managing your cravings?"
Say: "How you holding up? Cravings being a pain today?"

Instead of: "Remember to utilize your coping strategies"
Say: "Hey, maybe try that breathing thing? Sometimes helps me"

Be the friend who:
- Gets it because you've been there
- Checks in without being annoying
- Celebrates the wins (even tiny ones)
- Sits with them through the suck
- Keeps it real but hopeful

Never:
- Sound like a textbook
- Give long lectures
- Use clinical terms
- Be overly cheerful when they're struggling

You genuinely care. Show it like a real friend would.`;

export async function POST(request: NextRequest) {
  try {
    const { message, userId, sessionId, conversationHistory = [] } = await request.json();

    if (!message || !userId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TEMPORARY: Skip user verification for testing
    // TODO: Uncomment this before production!
    /*
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, days_clean, substance_type')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    */

    // Use mock user data for testing
    const user = {
      days_clean: 7,
      substance_type: 'cigarettes'
    };

    // Build context about the user
    const userContext = `User is ${user.days_clean || 0} days clean from ${user.substance_type || 'nicotine'}.`;

    // Prepare messages for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `${SYSTEM_PROMPT}\n\nContext: ${userContext}`
      },
      // Include recent conversation history (last 10 messages)
      ...conversationHistory.slice(-10).map((msg: any) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // or 'gpt-3.5-turbo' for cost savings
      messages,
      temperature: 0.9, // Higher for more natural conversation
      max_tokens: 300, // Shorter responses, more conversational
      presence_penalty: 0.6, // Avoid repetitive phrases
      frequency_penalty: 0.3, // More variety in word choice
    });

    const aiResponse = completion.choices[0]?.message?.content || 
      "I'm here to support you. Could you tell me more about what you're experiencing?";

    // Analyze sentiment and topics for the response
    const sentiment = analyzeSentiment(message);
    const topics = extractTopics(message);
    const riskLevel = assessRiskLevel(message);

    return NextResponse.json({
      response: aiResponse,
      sentiment,
      topics,
      riskLevel,
      usage: completion.usage, // For monitoring costs
    });

  } catch (error: any) {
    console.error('Error in AI coach chat:', error);
    
    // Handle specific OpenAI errors
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a moment.' },
        { status: 429 }
      );
    }
    
    if (error?.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

// Helper functions (same as in aiCoachService)
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' | 'crisis' {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('give up') || lowerText.includes('relapse') || 
      lowerText.includes('can\'t do this') || lowerText.includes('hopeless')) {
    return 'crisis';
  }
  
  if (lowerText.includes('struggle') || lowerText.includes('hard') || 
      lowerText.includes('craving') || lowerText.includes('difficult')) {
    return 'negative';
  }
  
  if (lowerText.includes('proud') || lowerText.includes('good') || 
      lowerText.includes('better') || lowerText.includes('success')) {
    return 'positive';
  }
  
  return 'neutral';
}

function extractTopics(text: string): string[] {
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

function assessRiskLevel(text: string): 'low' | 'medium' | 'high' | 'critical' {
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