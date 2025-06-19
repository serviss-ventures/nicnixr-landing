/**
 * API Registry - Central registry of all API endpoints
 * Automatically tracks and categorizes all endpoints
 */

export type ApiCategory = 
  | 'auth'
  | 'ai'
  | 'mobile'
  | 'admin'
  | 'payment'
  | 'content'
  | 'monitoring'
  | 'user'
  | 'community';

export interface ApiEndpoint {
  path: string;
  category: ApiCategory;
  description: string;
  methods: string[];
  isPublic?: boolean;
  requiresAuth?: boolean;
  rateLimit?: number; // requests per minute
}

export const API_ENDPOINTS: ApiEndpoint[] = [
  // Authentication & User Management
  {
    path: '/api/auth',
    category: 'auth',
    description: 'User authentication (login/logout)',
    methods: ['POST'],
    isPublic: true,
    requiresAuth: false,
    rateLimit: 10,
  },
  {
    path: '/api/auth/login',
    category: 'auth',
    description: 'User login',
    methods: ['POST'],
    isPublic: true,
    requiresAuth: false,
    rateLimit: 10,
  },
  {
    path: '/api/auth/register',
    category: 'auth',
    description: 'User registration',
    methods: ['POST'],
    isPublic: true,
    requiresAuth: false,
    rateLimit: 5,
  },
  {
    path: '/api/user/onboarding',
    category: 'user',
    description: 'User onboarding data',
    methods: ['POST', 'GET'],
    requiresAuth: true,
  },
  {
    path: '/api/user/[id]',
    category: 'user',
    description: 'User profile management',
    methods: ['GET', 'PUT', 'PATCH'],
    requiresAuth: true,
  },
  {
    path: '/api/users/stats',
    category: 'user',
    description: 'Aggregated user statistics',
    methods: ['GET'],
    requiresAuth: true,
  },

  // AI & Coach
  {
    path: '/api/ai-coach',
    category: 'ai',
    description: 'AI Coach main endpoint',
    methods: ['GET', 'POST'],
    requiresAuth: true,
    rateLimit: 100,
  },
  {
    path: '/api/ai-coach/chat',
    category: 'ai',
    description: 'AI Coach chat conversations',
    methods: ['POST'],
    requiresAuth: true,
    rateLimit: 60,
  },

  // Mobile App Specific
  {
    path: '/api/mobile-app',
    category: 'mobile',
    description: 'Mobile app control (start/stop)',
    methods: ['GET', 'POST'],
    requiresAuth: true,
  },
  {
    path: '/api/mobile/logs',
    category: 'mobile',
    description: 'Mobile app remote logging',
    methods: ['POST'],
    requiresAuth: false,
    rateLimit: 1000,
  },
  {
    path: '/api/mobile/stats',
    category: 'mobile',
    description: 'Mobile app statistics',
    methods: ['GET'],
    requiresAuth: true,
  },

  // Community & Social
  {
    path: '/api/community',
    category: 'community',
    description: 'Community posts and interactions',
    methods: ['GET', 'POST'],
    requiresAuth: true,
  },
  {
    path: '/api/buddy',
    category: 'community',
    description: 'Buddy system management',
    methods: ['GET', 'POST', 'PUT'],
    requiresAuth: true,
  },

  // Progress & Journal
  {
    path: '/api/progress',
    category: 'user',
    description: 'User progress tracking',
    methods: ['GET', 'POST'],
    requiresAuth: true,
  },
  {
    path: '/api/journal',
    category: 'user',
    description: 'Recovery journal entries',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    requiresAuth: true,
  },

  // Payments & Subscriptions
  {
    path: '/api/subscriptions/verify',
    category: 'payment',
    description: 'Subscription verification',
    methods: ['POST'],
    requiresAuth: true,
  },
  {
    path: '/api/users/subscription',
    category: 'payment',
    description: 'User subscription updates',
    methods: ['PUT'],
    requiresAuth: true,
  },
  {
    path: '/api/iap/verify',
    category: 'payment',
    description: 'In-app purchase verification',
    methods: ['POST'],
    requiresAuth: true,
  },
  {
    path: '/api/users/avatars',
    category: 'payment',
    description: 'User avatar purchases',
    methods: ['GET', 'POST'],
    requiresAuth: true,
  },
  {
    path: '/api/avatars/limited/[avatarKey]/purchase',
    category: 'payment',
    description: 'Limited avatar purchases',
    methods: ['POST'],
    requiresAuth: true,
  },

  // Admin & Monitoring
  {
    path: '/api/health',
    category: 'monitoring',
    description: 'System health check',
    methods: ['GET'],
    isPublic: true,
    requiresAuth: false,
  },
  {
    path: '/api/monitoring',
    category: 'monitoring',
    description: 'System monitoring data',
    methods: ['GET', 'POST'],
    requiresAuth: true,
  },
  {
    path: '/api/analytics',
    category: 'admin',
    description: 'Analytics data',
    methods: ['GET'],
    requiresAuth: true,
  },
  {
    path: '/api/webhooks/monitoring',
    category: 'monitoring',
    description: 'Monitoring webhooks (Sentry, etc)',
    methods: ['POST'],
    isPublic: true,
    requiresAuth: false,
  },

  // Content Management
  {
    path: '/api/website',
    category: 'content',
    description: 'Website content management',
    methods: ['GET', 'POST'],
    requiresAuth: true,
  },
  {
    path: '/api/website/content',
    category: 'content',
    description: 'Website content CRUD',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    requiresAuth: true,
  },

  // Testing & Debug (only in development)
  {
    path: '/api/test-db',
    category: 'admin',
    description: 'Database connection testing',
    methods: ['GET'],
    requiresAuth: true,
  },
  {
    path: '/api/test-middleware',
    category: 'admin',
    description: 'Middleware testing',
    methods: ['GET', 'POST'],
    requiresAuth: true,
  },
];

// Helper functions
export function getEndpointsByCategory(category: ApiCategory): ApiEndpoint[] {
  return API_ENDPOINTS.filter(endpoint => endpoint.category === category);
}

export function getEndpointByPath(path: string): ApiEndpoint | undefined {
  // Handle dynamic routes
  const normalizedPath = path.replace(/\/\d+/g, '/[id]').replace(/\/[\w-]+$/g, '/[id]');
  return API_ENDPOINTS.find(endpoint => {
    const endpointPattern = endpoint.path.replace(/\[[\w]+\]/g, '[id]');
    return endpointPattern === normalizedPath || endpoint.path === path;
  });
}

export function getCategoryColor(category: ApiCategory): string {
  const colors: Record<ApiCategory, string> = {
    auth: '#22C55E',      // green
    ai: '#C084FC',        // purple
    mobile: '#3B82F6',    // blue
    admin: '#F59E0B',     // amber
    payment: '#EF4444',   // red
    content: '#8B5CF6',   // violet
    monitoring: '#10B981', // emerald
    user: '#6366F1',      // indigo
    community: '#EC4899', // pink
  };
  return colors[category] || '#6B7280';
}

export function getCategoryIcon(category: ApiCategory): string {
  const icons: Record<ApiCategory, string> = {
    auth: 'Shield',
    ai: 'Cpu',
    mobile: 'Smartphone',
    admin: 'Settings',
    payment: 'CreditCard',
    content: 'FileText',
    monitoring: 'Activity',
    user: 'User',
    community: 'Users',
  };
  return icons[category] || 'Circle';
} 