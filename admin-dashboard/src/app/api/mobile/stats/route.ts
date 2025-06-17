import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

interface QuickStats {
  totalUsers: number;
  activeToday: number;
  newThisWeek: number;
  totalSaved: number; // Money saved by users
  avgDaysClean: number;
  topSavedUser: {
    amount: number;
    days: number;
  };
  communityActivity: {
    postsToday: number;
    activeChats: number;
    supportGiven: number;
  };
  trending: {
    substanceType: string;
    percentage: number;
  };
  successRate: number; // 30-day success rate
  lastUpdated: string;
}

export async function GET(request: Request) {
  try {
    // Check for API key in headers for security
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.MOBILE_API_KEY && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getQuickStats();
    
    // Cache for 5 minutes
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Quick stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

async function getQuickStats(): Promise<QuickStats> {
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Parallel queries for better performance
  const [
    totalUsersResult,
    activeTodayResult,
    newThisWeekResult,
    savingsResult,
    communityResult,
    substanceResult,
    successResult,
  ] = await Promise.all([
    // Total users
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true }),
    
    // Active today
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', today.toISOString()),
    
    // New this week
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString()),
    
    // Total savings and average days clean
    supabase
      .from('users')
      .select('total_money_saved, days_clean')
      .not('total_money_saved', 'is', null),
    
    // Community activity (mock for now)
    Promise.resolve({
      postsToday: Math.floor(Math.random() * 50) + 100,
      activeChats: Math.floor(Math.random() * 30) + 20,
      supportGiven: Math.floor(Math.random() * 200) + 150,
    }),
    
    // Substance distribution
    supabase
      .from('users')
      .select('substance_type')
      .not('substance_type', 'is', null),
    
    // Success rate (users still active after 30 days)
    supabase
      .from('users')
      .select('created_at, last_active')
      .lte('created_at', monthAgo.toISOString()),
  ]);

  // Calculate total savings
  const totalSaved = savingsResult.data?.reduce((sum, user) => {
    return sum + (user.total_money_saved || 0);
  }, 0) || 0;

  // Calculate average days clean
  const avgDaysClean = savingsResult.data?.length
    ? Math.round(
        savingsResult.data.reduce((sum, user) => sum + (user.days_clean || 0), 0) /
        savingsResult.data.length
      )
    : 0;

  // Find top saved user
  const topUser = savingsResult.data?.reduce((top, user) => {
    if ((user.total_money_saved || 0) > top.amount) {
      return {
        amount: user.total_money_saved || 0,
        days: user.days_clean || 0,
      };
    }
    return top;
  }, { amount: 0, days: 0 }) || { amount: 0, days: 0 };

  // Calculate trending substance
  const substanceCounts: Record<string, number> = {};
  substanceResult.data?.forEach(user => {
    if (user.substance_type) {
      substanceCounts[user.substance_type] = (substanceCounts[user.substance_type] || 0) + 1;
    }
  });

  const trendingSubstance = Object.entries(substanceCounts).reduce(
    (max, [type, count]) => {
      if (count > max.count) {
        return { type, count };
      }
      return max;
    },
    { type: 'cigarettes', count: 0 }
  );

  const trendingPercentage = substanceResult.data?.length
    ? Math.round((trendingSubstance.count / substanceResult.data.length) * 100)
    : 0;

  // Calculate 30-day success rate
  const successfulUsers = successResult.data?.filter(user => {
    if (!user.last_active) return false;
    const lastActive = new Date(user.last_active);
    const created = new Date(user.created_at);
    const daysSinceCreated = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreated >= 30 && daysSinceActive < 7; // Still active in last week
  }).length || 0;

  const successRate = successResult.data?.length
    ? Math.round((successfulUsers / successResult.data.length) * 100)
    : 0;

  return {
    totalUsers: totalUsersResult.count || 0,
    activeToday: activeTodayResult.count || 0,
    newThisWeek: newThisWeekResult.count || 0,
    totalSaved: Math.round(totalSaved),
    avgDaysClean,
    topSavedUser: topUser,
    communityActivity: communityResult,
    trending: {
      substanceType: trendingSubstance.type,
      percentage: trendingPercentage,
    },
    successRate,
    lastUpdated: new Date().toISOString(),
  };
} 