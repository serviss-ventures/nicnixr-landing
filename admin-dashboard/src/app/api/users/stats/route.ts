import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '30');
    
    // If specific user requested
    if (userId) {
      const { data: stats, error } = await supabaseAdmin
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(days);
        
      if (error) throw error;
      
      // Also get achievements
      const { data: achievements } = await supabaseAdmin
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });
      
      return NextResponse.json({ 
        stats: stats || [],
        achievements: achievements || []
      });
    }
    
    // Get aggregate stats for all users
    const { data: latestStats, error: statsError } = await supabaseAdmin
      .from('user_stats')
      .select(`
        user_id,
        date,
        money_saved,
        substances_avoided,
        health_improvements
      `)
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: false });
      
    if (statsError) throw statsError;
    
    // Group by user and get latest stats
    const userStats = new Map();
    latestStats?.forEach(stat => {
      if (!userStats.has(stat.user_id)) {
        userStats.set(stat.user_id, stat);
      }
    });
    
    // Calculate totals
    const totals = {
      totalUsers: userStats.size,
      totalMoneySaved: 0,
      totalSubstancesAvoided: 0,
      averageHealthScore: 0,
      activeUsers: 0
    };
    
    userStats.forEach(stat => {
      totals.totalMoneySaved += parseFloat(stat.money_saved || 0);
      totals.totalSubstancesAvoided += parseInt(stat.substances_avoided || 0);
      
      const healthScore = stat.health_improvements?.health_score || 0;
      totals.averageHealthScore += healthScore;
      
      // Consider active if they have stats in last 7 days
      const statDate = new Date(stat.date);
      const daysSinceLastStat = (Date.now() - statDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastStat <= 7) {
        totals.activeUsers++;
      }
    });
    
    if (userStats.size > 0) {
      totals.averageHealthScore = totals.averageHealthScore / userStats.size;
    }
    
    return NextResponse.json({
      totals,
      userStats: Array.from(userStats.values())
    });
    
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
} 