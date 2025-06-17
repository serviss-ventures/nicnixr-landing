import { NextResponse } from 'next/server';
import {
  getRecoveryEngagementData,
  getSobrietyCohortData,
  getRecoveryFunnelData,
  getKeyMetrics,
  getSubstanceDistribution,
} from '@/lib/analytics';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    // Fetch all data in parallel
    const [engagement, cohorts, funnel, metrics, substances] = await Promise.all([
      getRecoveryEngagementData(daysBack),
      getSobrietyCohortData(),
      getRecoveryFunnelData(),
      getKeyMetrics(),
      getSubstanceDistribution(),
    ]);
    
    return NextResponse.json({
      engagement,
      cohorts,
      funnel,
      metrics,
      substances,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 