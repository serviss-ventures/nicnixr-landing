import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client if credentials are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Webhook secret for validation (set this in your monitoring service)
const WEBHOOK_SECRET = process.env.MONITORING_WEBHOOK_SECRET || 'your-webhook-secret';

interface SentryWebhookPayload {
  id: string;
  project: string;
  project_name: string;
  project_slug: string;
  level: string;
  error?: {
    type?: string;
    value?: string;
  };
  culprit?: string;
  message?: string;
  platform?: string;
  datetime?: string;
  tags?: Array<[string, string]>;
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
  request?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
  };
  exception?: {
    values?: Array<{
      type: string;
      value: string;
      stacktrace?: any;
    }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const signature = request.headers.get('x-webhook-signature') || 
                     request.headers.get('sentry-hook-signature');
    
    if (signature !== WEBHOOK_SECRET && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Parse the webhook payload
    const payload: SentryWebhookPayload = await request.json();
    
    // Extract relevant information
    const errorData = {
      error_id: payload.id,
      timestamp: payload.datetime || new Date().toISOString(),
      level: payload.level || 'error',
      platform: payload.platform || 'unknown',
      error_type: payload.error?.type || payload.exception?.values?.[0]?.type || 'Unknown',
      error_message: payload.error?.value || payload.exception?.values?.[0]?.value || payload.message || 'No message',
      culprit: payload.culprit || 'Unknown',
      user_id: payload.user?.id,
      user_email: payload.user?.email,
      user_username: payload.user?.username,
      url: payload.request?.url,
      method: payload.request?.method,
      tags: payload.tags ? Object.fromEntries(payload.tags) : {},
      project: payload.project_name || payload.project_slug || 'unknown',
    };

    // Store in database if Supabase is configured
    if (supabase) {
      const { error: dbError } = await supabase
        .from('error_logs')
        .insert({
          ...errorData,
          raw_payload: payload, // Store full payload for debugging
        });

      if (dbError) {
        console.error('Failed to store error in database:', dbError);
      }

      // Check if this is a critical error that needs immediate attention
      if (payload.level === 'fatal' || payload.level === 'critical') {
        // Trigger alerts (in production, this could send emails/SMS)
        await triggerCriticalAlert(errorData);
      }

      // Update monitoring metrics
      await updateMonitoringMetrics(errorData);
    }

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Received monitoring webhook:', errorData);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      error_id: payload.id,
    });

  } catch (error) {
    console.error('Error processing monitoring webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Handle Sentry webhook verification
export async function GET(request: NextRequest) {
  // Sentry sends a GET request to verify the webhook endpoint
  return NextResponse.json({
    status: 'ok',
    message: 'Monitoring webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}

// Trigger alerts for critical errors
async function triggerCriticalAlert(errorData: any) {
  // In production, this would:
  // 1. Send email to admin team
  // 2. Send SMS for fatal errors
  // 3. Post to Slack channel
  // 4. Create PagerDuty incident
  
  console.error('🚨 CRITICAL ERROR ALERT:', {
    type: errorData.error_type,
    message: errorData.error_message,
    user: errorData.user_id,
    timestamp: errorData.timestamp,
  });

  // Store critical alert in database
  if (supabase) {
    await supabase
      .from('critical_alerts')
      .insert({
        error_id: errorData.error_id,
        alert_type: 'critical_error',
        alert_data: errorData,
        alerted_at: new Date().toISOString(),
        resolved: false,
      });
  }
}

// Update monitoring metrics
async function updateMonitoringMetrics(errorData: any) {
  if (!supabase) return;

  // Update daily error counts
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Get current metrics
    const { data: metrics } = await supabase
      .from('monitoring_metrics')
      .select('*')
      .eq('date', today)
      .eq('metric_type', 'error_count')
      .single();

    if (metrics) {
      // Update existing metrics
      await supabase
        .from('monitoring_metrics')
        .update({
          value: metrics.value + 1,
          metadata: {
            ...metrics.metadata,
            last_error_id: errorData.error_id,
            last_error_time: errorData.timestamp,
            error_levels: {
              ...metrics.metadata?.error_levels,
              [errorData.level]: (metrics.metadata?.error_levels?.[errorData.level] || 0) + 1,
            },
          },
        })
        .eq('id', metrics.id);
    } else {
      // Create new metrics entry
      await supabase
        .from('monitoring_metrics')
        .insert({
          date: today,
          metric_type: 'error_count',
          value: 1,
          metadata: {
            last_error_id: errorData.error_id,
            last_error_time: errorData.timestamp,
            error_levels: {
              [errorData.level]: 1,
            },
          },
        });
    }
  } catch (error) {
    console.error('Failed to update monitoring metrics:', error);
  }
} 