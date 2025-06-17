"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, Card, CardContent, CardHeader, MetricCard } from "@/components";
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Clock,
  BarChart3,
  Target,
  AlertCircle,
  Activity
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts';

interface FunnelData {
  step_number: number;
  step_name: string;
  users_reached: number;
  users_completed: number;
  avg_time_seconds: number;
  conversion_rate?: number;
}

interface RealtimeData {
  activeUsers: number;
  todaySignups: number;
  conversionRate: number;
  avgOnboardingTime: number;
}

export default function OnboardingAnalyticsPage() {
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [realtimeData, setRealtimeData] = useState<RealtimeData>({
    activeUsers: 0,
    todaySignups: 0,
    conversionRate: 0,
    avgOnboardingTime: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Fetch funnel data
  const fetchFunnelData = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_onboarding_funnel_data')
        .select('*');
        
      if (error) throw error;
      
      // Calculate conversion rates
      const processedData = data?.map((step: any, index: number) => ({
        ...step,
        conversion_rate: index === 0 ? 100 : (step.users_completed / data[0].users_reached * 100)
      })) || [];
      
      setFunnelData(processedData);
    } catch (error) {
      console.error('Error fetching funnel data:', error);
    }
  };

  // Fetch realtime metrics
  const fetchRealtimeData = async () => {
    try {
      // Get today's signups
      const today = new Date().toISOString().split('T')[0];
      const { count: signupCount } = await supabase
        .from('conversion_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'signup')
        .gte('created_at', today);
        
      // Get active users (in onboarding)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { count: activeCount } = await supabase
        .from('onboarding_analytics')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fifteenMinutesAgo);
        
      // Get conversion rate
      const { data: conversionData } = await supabase
        .from('onboarding_analytics')
        .select('user_id, step_number')
        .eq('step_number', 10)
        .eq('action', 'completed');
        
      const { data: totalUsers } = await supabase
        .from('users')
        .select('id');
        
      const conversionRate = totalUsers?.length ? 
        (conversionData?.length || 0) / totalUsers.length * 100 : 0;
        
      // Get average onboarding time
      const { data: timeData } = await supabase
        .from('onboarding_analytics')
        .select('time_spent_seconds')
        .not('time_spent_seconds', 'is', null);
        
      const avgTime = timeData?.length ?
        timeData.reduce((sum, row) => sum + row.time_spent_seconds, 0) / timeData.length : 0;
      
      setRealtimeData({
        activeUsers: activeCount || 0,
        todaySignups: signupCount || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgOnboardingTime: Math.round(avgTime / 60) // Convert to minutes
      });
    } catch (error) {
      console.error('Error fetching realtime data:', error);
    }
  };

  useEffect(() => {
    fetchFunnelData();
    fetchRealtimeData();
    setIsLoading(false);
    
    // Set up real-time subscriptions
    const subscription = supabase
      .channel('onboarding-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'onboarding_analytics' },
        () => {
          fetchFunnelData();
          fetchRealtimeData();
        }
      )
      .subscribe();
      
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRealtimeData();
    }, 30000);
    
    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

  // Prepare data for charts
  const dropOffData = funnelData.map((step, index) => ({
    name: step.step_name,
    dropOff: index === 0 ? 0 : 
      ((funnelData[index - 1].users_reached - step.users_reached) / funnelData[index - 1].users_reached * 100)
  }));

  const timePerStepData = funnelData.map(step => ({
    name: step.step_name.split(' ')[0], // Shorten names
    time: Math.round(step.avg_time_seconds / 60) // Convert to minutes
  }));

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <PageHeader
          title="Onboarding Analytics"
          subtitle="Track user conversion through your onboarding funnel in real-time"
        />

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Active Now"
            value={realtimeData.activeUsers}
            icon={Activity}
            trend={realtimeData.activeUsers > 0 ? 'up' : 'neutral'}
            subtitle="Users in onboarding"
          />
          <MetricCard
            title="Today's Signups"
            value={realtimeData.todaySignups}
            icon={Users}
            trend={realtimeData.todaySignups > 10 ? 'up' : 'down'}
            subtitle="New registrations"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${realtimeData.conversionRate}%`}
            icon={Target}
            trend={realtimeData.conversionRate > 60 ? 'up' : 'down'}
            subtitle="Complete onboarding"
          />
          <MetricCard
            title="Avg. Time"
            value={`${realtimeData.avgOnboardingTime}m`}
            icon={Clock}
            trend="neutral"
            subtitle="To complete"
          />
        </div>

        {/* Conversion Funnel */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-lg font-medium">Conversion Funnel</h3>
            <p className="text-sm text-white/60">User progression through onboarding steps</p>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="step_name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <Bar dataKey="users_reached" fill="#8B5CF6" name="Users Reached" />
                  <Bar dataKey="users_completed" fill="#10B981" name="Users Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Drop-off Analysis */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Drop-off Points</h3>
              <p className="text-sm text-white/60">Where users abandon onboarding</p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dropOffData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
                      formatter={(value: any) => `${value.toFixed(1)}%`}
                    />
                    <Bar dataKey="dropOff" fill="#EF4444" name="Drop-off %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Time per Step */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Time per Step</h3>
              <p className="text-sm text-white/60">Average minutes spent on each step</p>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timePerStepData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
                      formatter={(value: any) => `${value} min`}
                    />
                    <Bar dataKey="time" fill="#F59E0B" name="Minutes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Feed */}
        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Live Activity Feed
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm">New user signed up</span>
                </div>
                <span className="text-xs text-white/40">Just now</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm">User completed Demographics step</span>
                </div>
                <span className="text-xs text-white/40">2 min ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-sm">User completed full onboarding!</span>
                </div>
                <span className="text-xs text-white/40">5 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 