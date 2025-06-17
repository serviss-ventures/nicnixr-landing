import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '7d';
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    // Fetch sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('ai_coach_sessions')
      .select('*')
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString());

    if (sessionsError) throw sessionsError;

    // Fetch messages
    const { data: messages, error: messagesError } = await supabase
      .from('ai_coach_messages')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (messagesError) throw messagesError;

    // Calculate metrics
    const totalSessions = sessions?.length || 0;
    const totalMessages = messages?.length || 0;
    const uniqueUsers = new Set(sessions?.map(s => s.user_id)).size;
    
    // Crisis interventions
    const crisisInterventions = sessions?.filter(s => s.intervention_triggered).length || 0;
    const crisisMessages = messages?.filter(m => m.risk_level === 'critical').length || 0;
    
    // Sentiment analysis
    const sentimentCounts = {
      positive: 0,
      negative: 0,
      neutral: 0,
      crisis: 0
    };
    
    sessions?.forEach(session => {
      if (session.sentiment) {
        sentimentCounts[session.sentiment as keyof typeof sentimentCounts]++;
      }
    });
    
    // Topics frequency
    const topicsMap = new Map<string, number>();
    sessions?.forEach(session => {
      session.topics_discussed?.forEach((topic: string) => {
        topicsMap.set(topic, (topicsMap.get(topic) || 0) + 1);
      });
    });
    
    // User satisfaction
    const ratedSessions = sessions?.filter(s => s.helpfulness_rating) || [];
    const avgRating = ratedSessions.length > 0
      ? ratedSessions.reduce((sum, s) => sum + (s.helpfulness_rating || 0), 0) / ratedSessions.length
      : 0;
    const satisfactionRate = avgRating > 0 ? (avgRating / 5) * 100 : 0;
    
    // Response times
    const responseTimes = messages
      ?.filter(m => m.response_time_ms)
      ?.map(m => m.response_time_ms) || [];
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;
    
    // Recent conversations for display
    const recentSessions = await supabase
      .from('ai_coach_sessions')
      .select(`
        *,
        users (
          id,
          email,
          days_clean
        ),
        ai_coach_messages (
          message_text,
          is_user_message,
          created_at
        )
      `)
      .order('started_at', { ascending: false })
      .limit(10);
    
    const conversations = recentSessions.data?.map(session => {
      const lastMessage = session.ai_coach_messages
        ?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      
      return {
        id: session.id,
        user: session.users?.email?.split('@')[0] || 'Anonymous',
        daysClean: session.users?.days_clean || 0,
        lastMessage: lastMessage?.message_text || 'No messages',
        time: getRelativeTime(new Date(session.started_at)),
        sentiment: session.sentiment || 'neutral',
        responseTime: `${Math.round(avgResponseTime / 1000)}s`,
        topic: session.topics_discussed?.[0] || 'General',
        riskLevel: getRiskLevel(session)
      };
    }) || [];

    return NextResponse.json({
      metrics: {
        totalSessions,
        totalMessages,
        uniqueUsers,
        crisisInterventions,
        successfulInterventions: crisisInterventions, // For now, assume all are successful
        satisfactionRate,
        avgResponseTime: Math.round(avgResponseTime),
        livesImpacted: uniqueUsers
      },
      sentimentDistribution: sentimentCounts,
      topicsFrequency: Object.fromEntries(topicsMap),
      conversations,
      chartData: {
        sessionTrend: generateSessionTrend(sessions || [], startDate, endDate),
        sentimentTrend: generateSentimentTrend(sessions || [], startDate, endDate)
      }
    });
    
  } catch (error) {
    console.error('Error fetching AI coach data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI coach data' },
      { status: 500 }
    );
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function getRiskLevel(session: any): string {
  if (session.intervention_triggered) return 'critical';
  if (session.sentiment === 'crisis') return 'critical';
  if (session.sentiment === 'negative') return 'high';
  if (session.topics_discussed?.includes('relapse')) return 'high';
  if (session.topics_discussed?.includes('cravings')) return 'medium';
  return 'low';
}

function generateSessionTrend(sessions: any[], startDate: Date, endDate: Date) {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const trend = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    const daySessions = sessions.filter(s => 
      s.started_at.startsWith(dateStr)
    );
    
    trend.push({
      date: dateStr,
      sessions: daySessions.length
    });
  }
  
  return trend;
}

function generateSentimentTrend(sessions: any[], startDate: Date, endDate: Date) {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const trend = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    const daySessions = sessions.filter(s => 
      s.started_at.startsWith(dateStr)
    );
    
    const sentiments = {
      positive: daySessions.filter(s => s.sentiment === 'positive').length,
      negative: daySessions.filter(s => s.sentiment === 'negative').length,
      neutral: daySessions.filter(s => s.sentiment === 'neutral').length,
      crisis: daySessions.filter(s => s.sentiment === 'crisis').length
    };
    
    trend.push({
      date: dateStr,
      ...sentiments
    });
  }
  
  return trend;
} 