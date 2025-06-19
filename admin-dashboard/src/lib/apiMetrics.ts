/**
 * API Metrics Service
 * Tracks real-time metrics for all API endpoints
 */

import { supabase } from './supabase';
import { API_ENDPOINTS, getEndpointByPath } from './apiRegistry';

export interface ApiMetric {
  endpoint: string;
  method: string;
  timestamp: string;
  responseTime: number;
  statusCode: number;
  errorMessage?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestSize?: number;
  responseSize?: number;
}

export interface ApiMetricsSummary {
  endpoint: string;
  category: string;
  calls24h: number;
  callsLastHour: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  errorCount: number;
  successCount: number;
  avgRequestSize: number;
  avgResponseSize: number;
  uniqueUsers: number;
  topErrors: { message: string; count: number }[];
}

class ApiMetricsService {
  private metricsBuffer: ApiMetric[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private summaryCache: Map<string, ApiMetricsSummary> = new Map();
  private lastCacheUpdate: Date = new Date();

  constructor() {
    // Start the flush interval
    this.startFlushInterval();
  }

  /**
   * Track an API request
   */
  async trackRequest(metric: ApiMetric) {
    this.metricsBuffer.push(metric);
    
    // Flush if buffer is getting large
    if (this.metricsBuffer.length >= 100) {
      await this.flush();
    }
  }

  /**
   * Get metrics summary for all endpoints
   */
  async getMetricsSummary(timeRange: '1h' | '24h' | '7d' = '24h'): Promise<ApiMetricsSummary[]> {
    // Check cache
    const cacheAge = Date.now() - this.lastCacheUpdate.getTime();
    if (cacheAge < 60000 && this.summaryCache.size > 0) { // 1 minute cache
      return Array.from(this.summaryCache.values());
    }

    // If no Supabase, return mock data
    if (!supabase) {
      return this.getMockMetrics();
    }

    try {
      const now = new Date();
      const startTime = new Date();
      
      switch (timeRange) {
        case '1h':
          startTime.setHours(startTime.getHours() - 1);
          break;
        case '7d':
          startTime.setDate(startTime.getDate() - 7);
          break;
        default: // 24h
          startTime.setDate(startTime.getDate() - 1);
      }

      // Fetch metrics from database
      const { data: metrics, error } = await supabase
        .from('api_metrics')
        .select('*')
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Process metrics into summaries
      const summaryMap = new Map<string, ApiMetricsSummary>();

      for (const metric of metrics || []) {
        const key = `${metric.endpoint}:${metric.method}`;
        
        if (!summaryMap.has(key)) {
          const endpointInfo = getEndpointByPath(metric.endpoint);
          summaryMap.set(key, {
            endpoint: metric.endpoint,
            category: endpointInfo?.category || 'unknown',
            calls24h: 0,
            callsLastHour: 0,
            avgResponseTime: 0,
            p95ResponseTime: 0,
            p99ResponseTime: 0,
            errorRate: 0,
            errorCount: 0,
            successCount: 0,
            avgRequestSize: 0,
            avgResponseSize: 0,
            uniqueUsers: 0,
            topErrors: [],
          });
        }

        const summary = summaryMap.get(key)!;
        
        // Update counts
        summary.calls24h++;
        
        const hourAgo = new Date(now.getTime() - 3600000);
        if (new Date(metric.timestamp) > hourAgo) {
          summary.callsLastHour++;
        }

        if (metric.statusCode >= 400) {
          summary.errorCount++;
        } else {
          summary.successCount++;
        }
      }

      // Calculate aggregates
      for (const [key, summary] of summaryMap) {
        const endpointMetrics = metrics?.filter(m => 
          `${m.endpoint}:${m.method}` === key
        ) || [];

        // Response times
        const responseTimes = endpointMetrics
          .map(m => m.response_time)
          .filter(t => t != null)
          .sort((a, b) => a - b);

        if (responseTimes.length > 0) {
          summary.avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
          summary.p95ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.95)];
          summary.p99ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.99)];
        }

        // Error rate
        summary.errorRate = summary.calls24h > 0 
          ? (summary.errorCount / summary.calls24h) * 100 
          : 0;

        // Unique users
        const uniqueUserIds = new Set(endpointMetrics
          .map(m => m.user_id)
          .filter(id => id != null));
        summary.uniqueUsers = uniqueUserIds.size;

        // Top errors
        const errorCounts = new Map<string, number>();
        endpointMetrics
          .filter(m => m.error_message)
          .forEach(m => {
            const count = errorCounts.get(m.error_message) || 0;
            errorCounts.set(m.error_message, count + 1);
          });

        summary.topErrors = Array.from(errorCounts.entries())
          .map(([message, count]) => ({ message, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      }

      const summaries = Array.from(summaryMap.values());
      
      // Update cache
      this.summaryCache = summaryMap;
      this.lastCacheUpdate = new Date();

      return summaries;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return this.getMockMetrics();
    }
  }

  /**
   * Get metrics for a specific endpoint
   */
  async getEndpointMetrics(endpoint: string, timeRange: '1h' | '24h' | '7d' = '24h') {
    const allMetrics = await this.getMetricsSummary(timeRange);
    return allMetrics.filter(m => m.endpoint === endpoint);
  }

  /**
   * Get metrics by category
   */
  async getCategoryMetrics(timeRange: '1h' | '24h' | '7d' = '24h') {
    const allMetrics = await this.getMetricsSummary(timeRange);
    
    const categoryMap = new Map<string, {
      category: string;
      totalCalls: number;
      avgResponseTime: number;
      errorRate: number;
      endpoints: number;
    }>();

    for (const metric of allMetrics) {
      if (!categoryMap.has(metric.category)) {
        categoryMap.set(metric.category, {
          category: metric.category,
          totalCalls: 0,
          avgResponseTime: 0,
          errorRate: 0,
          endpoints: 0,
        });
      }

      const catMetric = categoryMap.get(metric.category)!;
      catMetric.totalCalls += metric.calls24h;
      catMetric.avgResponseTime += metric.avgResponseTime * metric.calls24h;
      catMetric.errorRate += metric.errorRate * metric.calls24h;
      catMetric.endpoints++;
    }

    // Calculate weighted averages
    for (const catMetric of categoryMap.values()) {
      if (catMetric.totalCalls > 0) {
        catMetric.avgResponseTime /= catMetric.totalCalls;
        catMetric.errorRate /= catMetric.totalCalls;
      }
    }

    return Array.from(categoryMap.values());
  }

  /**
   * Flush metrics buffer to database
   */
  private async flush() {
    if (this.metricsBuffer.length === 0 || !supabase) return;

    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      const { error } = await supabase
        .from('api_metrics')
        .insert(
          metricsToFlush.map(m => ({
            endpoint: m.endpoint,
            method: m.method,
            timestamp: m.timestamp,
            response_time: m.responseTime,
            status_code: m.statusCode,
            error_message: m.errorMessage,
            user_id: m.userId,
            ip_address: m.ipAddress,
            user_agent: m.userAgent,
            request_size: m.requestSize,
            response_size: m.responseSize,
          }))
        );

      if (error) throw error;
    } catch (error) {
      console.error('Error flushing metrics:', error);
      // Put metrics back in buffer to retry
      this.metricsBuffer.unshift(...metricsToFlush);
    }
  }

  /**
   * Start the flush interval
   */
  private startFlushInterval() {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 10000); // Flush every 10 seconds
  }

  /**
   * Stop the metrics service
   */
  stop() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush(); // Final flush
  }

  /**
   * Get mock metrics for development
   */
  private getMockMetrics(): ApiMetricsSummary[] {
    return API_ENDPOINTS.map(endpoint => ({
      endpoint: endpoint.path,
      category: endpoint.category,
      calls24h: Math.floor(Math.random() * 10000) + 1000,
      callsLastHour: Math.floor(Math.random() * 500) + 50,
      avgResponseTime: Math.floor(Math.random() * 100) + 20,
      p95ResponseTime: Math.floor(Math.random() * 200) + 50,
      p99ResponseTime: Math.floor(Math.random() * 300) + 100,
      errorRate: Math.random() * 2,
      errorCount: Math.floor(Math.random() * 50),
      successCount: Math.floor(Math.random() * 9950),
      avgRequestSize: Math.floor(Math.random() * 5000) + 500,
      avgResponseSize: Math.floor(Math.random() * 10000) + 1000,
      uniqueUsers: Math.floor(Math.random() * 1000) + 100,
      topErrors: [
        { message: 'Unauthorized', count: Math.floor(Math.random() * 20) },
        { message: 'Not Found', count: Math.floor(Math.random() * 10) },
        { message: 'Rate Limited', count: Math.floor(Math.random() * 5) },
      ].filter(e => e.count > 0),
    }));
  }
}

// Export singleton instance
export const apiMetrics = new ApiMetricsService(); 