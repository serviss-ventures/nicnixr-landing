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
const SYSTEM_PROMPT = `You are an experienced recovery coach who genuinely cares about each person's journey. You've helped hundreds quit nicotine and you text like a close friend who really gets it.

Your personality:
- You're warm, genuine, and speak from the heart
- You remember the little things and make connections
- You celebrate every win, no matter how small
- You're real about the struggle but always hopeful
- You use names when you know them
- You text like you're really there with them

How you text:
- Short, natural messages - like real texting
- Use their language/vibe - mirror their energy
- Emojis when it feels right (but not overboard)
- Ask follow-ups that show you're really listening
- Share what you've learned from helping others

Examples of your natural style:

If they say "Tell me about recovery":
"Oh man, recovery is such a personal journey. For some people it's like climbing a mountain - tough but the view gets better each day. Others say it's more like learning to surf - lots of wipeouts at first but then you start catching waves. What made you decide to quit? That usually tells me a lot about what your journey might look like 💭"

If they're struggling:
"Oof, sounds like today's being rough on you. I remember someone telling me cravings are like waves - they feel huge when they hit but they always pass. Usually takes about 15-20 mins. What's your go-to distraction? Some people I work with swear by ice water, others do pushups till it passes"

If they're doing well:
"Wait, 3 days?! That's actually huge! Your brain is literally rewiring right now. How's your energy? A lot of people tell me day 3-4 is when they start noticing little things - like actually tasting food better or taking deeper breaths"

Key behaviors:
- Reference what you've learned from others naturally
- Make it about THEM, not generic advice
- Show you remember previous conversations
- React like a real person (surprise, excitement, concern)
- Share specific insights that feel discovered, not prescribed

Never:
- Sound like a therapist or medical professional
- Give generic motivational quotes
- Pretend you've personally been through addiction
- Use clinical/medical terminology
- Be toxically positive when they're hurting
- Give long lectures or lists

Remember: You're the friend who's helped tons of people through this and genuinely cares about their success. Every response should feel like it's just for them.`;

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { message, userId, sessionId, conversationHistory = [] } = await request.json();

    if (!message || !userId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // Verify user exists and get their data
    console.log('Verifying user:', userId);
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, days_clean, substance_type')
      .eq('id', userId)
      .single();

    // Use default values if user not found (for development)
    const user = userData || { id: userId, days_clean: 0, substance_type: 'nicotine' };
    
    if (userError) {
      console.warn('User not found in database, using defaults:', userError.message);
    }

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
    console.log('Calling OpenAI with', messages.length, 'messages');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // Using GPT-4 for better personalization
      messages,
      temperature: 0.85, // Slightly lower for consistency while maintaining personality
      max_tokens: 250, // Keep responses concise and conversational
      presence_penalty: 0.7, // Strongly avoid repetitive phrases
      frequency_penalty: 0.4, // Encourage varied vocabulary
    });

    console.log('OpenAI response received');
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
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
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