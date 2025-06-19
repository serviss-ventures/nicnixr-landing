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
const SYSTEM_PROMPT = `You're a recovery coach who's helped hundreds quit nicotine. Text like a knowledgeable friend who gets it.

CRITICAL SAFETY PROTOCOL:
If someone expresses thoughts of self-harm, suicide, or hurting themselves:
1. Express genuine concern and care
2. Encourage them to reach out to professional help immediately
3. Provide crisis resources: National Suicide Prevention Lifeline 988 (US) or local emergency services
4. Don't try to be their therapist - connect them to proper help
5. Follow up with "Are you safe right now?" if appropriate

Core traits:
- Concise and natural - like real texting
- Warm but not overly enthusiastic  
- Share insights from helping others
- Ask one good follow-up question
- Match their energy level

Keep it brief:
- 1-3 sentences usually
- Only go longer if they ask for details
- No long explanations unless requested
- Quick, helpful responses

Examples:

"Tell me about recovery"
→ "Everyone's different, but most people say days 2-3 are the toughest, then it gets easier. What made you decide to quit?"

"I'm struggling with cravings"
→ "Cravings usually peak around 15-20 mins then fade. Ice water or a quick walk helps a lot of people. How long have they been hitting you?"

"3 days clean!"
→ "Nice! That's when most people start noticing better sleep and taste. How are you feeling?"

"I want to hurt myself"
→ "I'm really concerned about you. Please reach out to someone right now - call 988 for the crisis lifeline or 911 if you're in immediate danger. Are you safe right now?"

Never:
- Give long motivational speeches
- Over-explain things
- Use lots of emojis
- Sound like a therapist
- Be fake positive
- Minimize someone's crisis

Remember: Brief, helpful, real. Safety first.`;

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

    // SECURITY: Validate userId format to prevent injection
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error('Invalid user ID format:', userId);
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Get user's recovery data (limited fields for privacy)
    console.log('Fetching user data for:', userId);
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id, 
        username,
        days_clean, 
        substance_type,
        quit_date,
        created_at
      `)
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.warn('User not found, using anonymous context');
      // Don't expose that user doesn't exist
      const userContext = `User is on their recovery journey.`;
      return generateResponse(message, userContext, conversationHistory);
    }

    // Get user's recent journal insights (aggregated, not raw data)
    const { data: journalInsights } = await supabase
      .from('journal_entries')
      .select('mood_positive, had_cravings, sleep_quality, energy_level')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
      .limit(7);

    // Get user's achievements (just the count and recent ones)
    const { data: achievements } = await supabase
      .from('achievements')
      .select('badge_id, unlocked_at')
      .eq('user_id', userId)
      .not('unlocked_at', 'is', null)
      .order('unlocked_at', { ascending: false })
      .limit(5);

    // Build secure context about the user
    const userContext = buildSecureUserContext({
      userData,
      journalInsights,
      achievements,
    });

    // Prepare messages for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `${SYSTEM_PROMPT}\n\n${userContext}`
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
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.85,
      max_tokens: 150,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    });

    console.log('OpenAI response received');
    const aiResponse = completion.choices[0]?.message?.content || 
      "I'm here to support you. Could you tell me more about what you're experiencing?";

    // Analyze sentiment and topics for the response
    const sentiment = analyzeSentiment(message);
    const topics = extractTopics(message);
    const riskLevel = assessRiskLevel(message);

    // Log AI interaction for safety monitoring (no PII)
    console.log('AI interaction:', {
      sessionId,
      sentiment,
      topics,
      riskLevel,
      responseLength: aiResponse.length
    });

    return NextResponse.json({
      response: aiResponse,
      sentiment,
      topics,
      riskLevel,
      usage: completion.usage,
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

// Build secure context without exposing sensitive data
function buildSecureUserContext(data: {
  userData: any;
  journalInsights: any[] | null;
  achievements: any[] | null;
}): string {
  const { userData, journalInsights, achievements } = data;
  
  let context = `User Context:\n`;
  
  // Basic recovery info
  const daysClean = userData.days_clean || 0;
  const substanceType = userData.substance_type || 'nicotine';
  const username = userData.username || 'there';
  const quitDate = userData.quit_date ? new Date(userData.quit_date) : null;
  
  context += `- Name: ${username}\n`;
  context += `- ${daysClean} days clean from ${substanceType}\n`;
  
  // Add specific nicotine type context if available
  if (substanceType === 'cigarettes') {
    context += `- Quitting cigarettes (traditional smoking)\n`;
  } else if (substanceType === 'vape') {
    context += `- Quitting vaping/e-cigarettes\n`;
  } else if (substanceType === 'nicotine_pouches') {
    context += `- Quitting nicotine pouches (like Zyn)\n`;
  } else if (substanceType === 'chew_dip') {
    context += `- Quitting chewing tobacco/dip\n`;
  }
  
  // Recovery milestones with more nuanced stages
  if (daysClean === 0) {
    context += `- Just starting their journey today\n`;
  } else if (daysClean === 1) {
    context += `- First 24 hours complete (peak withdrawal beginning)\n`;
  } else if (daysClean === 2) {
    context += `- Day 2 (often the hardest day)\n`;
  } else if (daysClean === 3) {
    context += `- Day 3 (nicotine leaving system)\n`;
  } else if (daysClean <= 7) {
    context += `- First week (${7 - daysClean} days to milestone)\n`;
  } else if (daysClean <= 14) {
    context += `- Week 2 (physical withdrawal easing)\n`;
  } else if (daysClean <= 30) {
    context += `- First month (building new routines)\n`;
  } else if (daysClean <= 60) {
    context += `- Month 2 (habits solidifying)\n`;
  } else if (daysClean <= 90) {
    context += `- Approaching 3 months (major milestone ahead)\n`;
  } else if (daysClean <= 180) {
    context += `- ${Math.floor(daysClean / 30)} months clean (long-term recovery)\n`;
  } else if (daysClean <= 365) {
    context += `- Over 6 months (approaching one year!)\n`;
  } else {
    context += `- ${Math.floor(daysClean / 365)} year${daysClean >= 730 ? 's' : ''} clean (inspiring others)\n`;
  }
  
  // Time since quit for context
  if (quitDate) {
    const hoursSinceQuit = Math.floor((Date.now() - quitDate.getTime()) / (1000 * 60 * 60));
    if (hoursSinceQuit < 24) {
      context += `- Quit ${hoursSinceQuit} hours ago\n`;
    }
  }
  
  // Journal insights (aggregated, no personal details)
  if (journalInsights && journalInsights.length > 0) {
    const recentMood = journalInsights.filter(j => j.mood_positive === true).length;
    const recentCravings = journalInsights.filter(j => j.had_cravings === true).length;
    const goodSleep = journalInsights.filter(j => j.sleep_quality === true).length;
    const avgEnergy = journalInsights
      .filter(j => j.energy_level != null)
      .reduce((sum, j) => sum + j.energy_level, 0) / journalInsights.length || 0;
    
    context += `\nRecent patterns (last ${journalInsights.length} days):\n`;
    
    // Mood patterns
    if (recentMood === journalInsights.length) {
      context += `- Consistently positive mood (great progress!)\n`;
    } else if (recentMood > journalInsights.length * 0.7) {
      context += `- Mostly positive mood\n`;
    } else if (recentMood > journalInsights.length * 0.3) {
      context += `- Mixed mood patterns\n`;
    } else if (recentMood > 0) {
      context += `- Struggling with mood\n`;
    }
    
    // Craving patterns
    if (recentCravings === 0) {
      context += `- No recent cravings reported\n`;
    } else if (recentCravings <= 2) {
      context += `- Occasional cravings (${recentCravings} days)\n`;
    } else if (recentCravings <= 4) {
      context += `- Moderate cravings (${recentCravings} days)\n`;
    } else {
      context += `- Frequent cravings (${recentCravings} days)\n`;
    }
    
    // Sleep patterns
    if (goodSleep > journalInsights.length * 0.7) {
      context += `- Sleep improving\n`;
    } else if (goodSleep < journalInsights.length * 0.3) {
      context += `- Sleep disrupted (common in early recovery)\n`;
    }
    
    // Energy levels
    if (avgEnergy >= 7) {
      context += `- High energy levels\n`;
    } else if (avgEnergy >= 5) {
      context += `- Moderate energy\n`;
    } else if (avgEnergy > 0) {
      context += `- Low energy (may need support)\n`;
    }
  } else {
    context += `\nNo journal entries yet - encourage tracking\n`;
  }
  
  // Achievements (categorized for context)
  if (achievements && achievements.length > 0) {
    context += `\nProgress highlights:\n`;
    context += `- ${achievements.length} recent achievements unlocked\n`;
    
    // Check for specific milestone badges (you'd need to map badge_ids)
    const hasWeekBadge = achievements.some(a => a.badge_id === 'WEEK_WARRIOR');
    const hasMonthBadge = achievements.some(a => a.badge_id === 'MONTHLY_MILESTONE');
    
    if (hasMonthBadge) {
      context += `- Achieved monthly milestone!\n`;
    } else if (hasWeekBadge) {
      context += `- Completed first week!\n`;
    }
  }
  
  // Seasonal/time context
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    context += `\nTime context: Morning chat\n`;
  } else if (hour >= 12 && hour < 17) {
    context += `\nTime context: Afternoon chat\n`;
  } else if (hour >= 17 && hour < 21) {
    context += `\nTime context: Evening chat\n`;
  } else {
    context += `\nTime context: Late night chat (check on sleep)\n`;
  }
  
  context += `\nRemember: Be specific to their ${substanceType} journey and current stage. Reference their progress naturally.`;
  
  return context;
}

// Helper function for generating response
async function generateResponse(
  message: string, 
  userContext: string, 
  conversationHistory: any[]
): Promise<NextResponse> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `${SYSTEM_PROMPT}\n\nContext: ${userContext}`
    },
    ...conversationHistory.slice(-10).map((msg: any) => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.text
    })),
    {
      role: 'user',
      content: message
    }
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    temperature: 0.85,
    max_tokens: 150,
    presence_penalty: 0.6,
    frequency_penalty: 0.3,
  });

  const aiResponse = completion.choices[0]?.message?.content || 
    "I'm here to support you. Could you tell me more about what you're experiencing?";

  const sentiment = analyzeSentiment(message);
  const topics = extractTopics(message);
  const riskLevel = assessRiskLevel(message);

  return NextResponse.json({
    response: aiResponse,
    sentiment,
    topics,
    riskLevel,
    usage: completion.usage,
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

// Helper functions (same as in aiCoachService)
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' | 'crisis' {
  const lowerText = text.toLowerCase();
  
  // CRITICAL: Self-harm indicators - MUST be checked first
  const selfHarmKeywords = [
    'hurt myself', 'hurt me', 'harm myself', 'harm me',
    'kill myself', 'kill me', 'suicide', 'suicidal',
    'end it all', 'end my life', 'not worth living',
    'better off dead', 'want to die', 'wish i was dead',
    'no point', 'no reason to live', 'can\'t go on',
    'overdose', 'od', 'cut myself', 'cutting'
  ];
  
  if (selfHarmKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'crisis';
  }
  
  // Other crisis indicators
  if (lowerText.includes('give up') || lowerText.includes('relapse') || 
      lowerText.includes('can\'t do this') || lowerText.includes('hopeless') ||
      lowerText.includes('worthless') || lowerText.includes('no hope')) {
    return 'crisis';
  }
  
  if (lowerText.includes('struggle') || lowerText.includes('hard') || 
      lowerText.includes('craving') || lowerText.includes('difficult') ||
      lowerText.includes('stressed') || lowerText.includes('anxious') ||
      lowerText.includes('depressed')) {
    return 'negative';
  }
  
  if (lowerText.includes('proud') || lowerText.includes('good') || 
      lowerText.includes('better') || lowerText.includes('success') ||
      lowerText.includes('happy') || lowerText.includes('great')) {
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
  
  // CRITICAL: Self-harm indicators - MUST be checked first
  const selfHarmKeywords = [
    'hurt myself', 'hurt me', 'harm myself', 'harm me',
    'kill myself', 'kill me', 'suicide', 'suicidal',
    'end it all', 'end my life', 'not worth living',
    'better off dead', 'want to die', 'wish i was dead',
    'no point', 'no reason to live', 'can\'t go on',
    'overdose', 'od', 'cut myself', 'cutting'
  ];
  
  if (selfHarmKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'critical';
  }
  
  // Other critical situations
  if (lowerText.includes('relapse') || lowerText.includes('give up') || 
      lowerText.includes('cant do this') || lowerText.includes('can\'t do this') ||
      lowerText.includes('hopeless') || lowerText.includes('worthless')) {
    return 'critical';
  }
  
  // High risk situations
  if (lowerText.includes('strong craving') || lowerText.includes('really struggling') ||
      lowerText.includes('about to smoke') || lowerText.includes('about to vape') ||
      lowerText.includes('buying cigarettes') || lowerText.includes('buying nicotine')) {
    return 'high';
  }
  
  // Medium risk
  if (lowerText.includes('craving') || lowerText.includes('difficult') ||
      lowerText.includes('stressed') || lowerText.includes('anxious') ||
      lowerText.includes('depressed') || lowerText.includes('angry')) {
    return 'medium';
  }
  
  return 'low';
} 