// API Configuration for Admin Dashboard
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.nixr.app';

// API Endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/admin/auth/login',
    logout: '/admin/auth/logout',
    refresh: '/admin/auth/refresh',
  },
  
  // Dashboard
  dashboard: {
    overview: '/admin/dashboard/overview',
    metrics: '/admin/dashboard/metrics',
    alerts: '/admin/dashboard/alerts',
  },
  
  // Users
  users: {
    list: '/admin/users',
    detail: (id: string) => `/admin/users/${id}`,
    update: (id: string) => `/admin/users/${id}`,
    delete: (id: string) => `/admin/users/${id}`,
    export: '/admin/users/export',
  },
  
  // Analytics
  analytics: {
    overview: '/admin/analytics/overview',
    engagement: '/admin/analytics/engagement',
    cohorts: '/admin/analytics/cohorts',
    funnel: '/admin/analytics/funnel',
    behavior: '/admin/analytics/behavior',
  },
  
  // Business
  business: {
    metrics: '/admin/business/metrics',
    revenue: '/admin/business/revenue',
    costs: '/admin/business/costs',
    projections: '/admin/business/projections',
  },
  
  // Marketing
  marketing: {
    campaigns: '/admin/marketing/campaigns',
    performance: '/admin/marketing/performance',
    social: '/admin/marketing/social',
    content: '/admin/marketing/content',
  },
  
  // AI Coach
  aiCoach: {
    performance: '/admin/ai-coach/performance',
    experiments: '/admin/ai-coach/experiments',
    conversations: '/admin/ai-coach/conversations',
    feedback: '/admin/ai-coach/feedback',
  },
  
  // Support
  support: {
    tickets: '/admin/support/tickets',
    ticket: (id: string) => `/admin/support/tickets/${id}`,
    templates: '/admin/support/templates',
    automation: '/admin/support/automation',
  },
  
  // Moderation
  moderation: {
    queue: '/admin/moderation/queue',
    reports: '/admin/moderation/reports',
    users: '/admin/moderation/users',
    rules: '/admin/moderation/rules',
  },
  
  // System
  system: {
    health: '/admin/system/health',
    metrics: '/admin/system/metrics',
    errors: '/admin/system/errors',
    logs: '/admin/system/logs',
  },
  
  // App Control
  appControl: {
    flags: '/admin/app-control/flags',
    experiments: '/admin/app-control/experiments',
    config: '/admin/app-control/config',
    deployments: '/admin/app-control/deployments',
  },
  
  // Reports
  reports: {
    scheduled: '/admin/reports/scheduled',
    generate: '/admin/reports/generate',
    templates: '/admin/reports/templates',
    export: '/admin/reports/export',
  },
};

// Helper function to make API requests
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    // Add auth token from storage/context
    // 'Authorization': `Bearer ${getAuthToken()}`,
  };
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// Specific API functions
export const api = {
  // Dashboard
  getDashboardOverview: () => apiRequest(endpoints.dashboard.overview),
  getDashboardMetrics: () => apiRequest(endpoints.dashboard.metrics),
  
  // Users
  getUsers: (params?: any) => apiRequest(endpoints.users.list, {
    method: 'GET',
    // Add query params
  }),
  getUser: (id: string) => apiRequest(endpoints.users.detail(id)),
  updateUser: (id: string, data: any) => apiRequest(endpoints.users.update(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Analytics
  getAnalyticsOverview: () => apiRequest(endpoints.analytics.overview),
  getEngagementData: () => apiRequest(endpoints.analytics.engagement),
  getCohortData: () => apiRequest(endpoints.analytics.cohorts),
  
  // Add more specific functions as needed
}; 