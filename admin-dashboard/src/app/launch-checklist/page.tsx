"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader, StatusBadge } from "@/components";
import {
  Rocket,
  CheckCircle,
  Circle,
  AlertCircle,
  Clock,
  Users,
  Shield,
  Smartphone,
  Globe,
  DollarSign,
  FileCheck,
  Mail,
  Lock,
  Zap,
  Heart,
  MessageSquare,
  Settings,
  ChevronRight,
  ChevronDown,
  Target,
  TrendingUp,
  Activity,
  Sparkles,
  AlertTriangle,
  Calendar,
  BarChart3
} from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'completed' | 'in-progress' | 'not-started';
  completedDate?: Date;
  estimatedTime?: string;
  assignee?: string;
  dependencies?: string[];
  details?: {
    steps: string[];
    tools?: string[];
    tips?: string[];
    deliverables?: string[];
  };
}

const launchChecklist: ChecklistItem[] = [
  // ========== APP STORE SUBMISSION ==========
  {
    id: '1',
    title: 'Apple Developer Account',
    description: 'Ensure Apple Developer account is active and payment is current ($99/year)',
    category: 'App Store',
    priority: 'critical',
    status: 'completed',
    completedDate: new Date('2025-01-05')
  },
  {
    id: '2',
    title: 'App Store Screenshots',
    description: 'Create 6.5", 5.5", and iPad screenshots for all required orientations',
    category: 'App Store',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '1 day',
    dependencies: ['app-final-build'],
    details: {
      steps: [
        '1. Set up iPhone 15 Pro Max simulator (6.7" for 6.5" screenshots)',
        '2. Set up iPhone 8 Plus simulator (5.5" screenshots)',
        '3. Launch app and navigate to these 5-8 key screens:',
        '   - Onboarding welcome screen',
        '   - Dashboard showing progress',
        '   - Community feed with posts',
        '   - AI Recovery Coach conversation',
        '   - Journal entry screen',
        '   - Avatar customization',
        '   - Milestone achievement',
        '4. Take screenshots using Cmd+S in simulator',
        '5. Export at exact sizes:',
        '   - 6.5": 1284 x 2778 pixels (iPhone 15 Pro Max)',
        '   - 5.5": 1242 x 2208 pixels (iPhone 8 Plus)',
        '6. Add minimal text overlays (optional):',
        '   - "Track Your Progress"',
        '   - "Connect with Community"',
        '   - "24/7 AI Support"',
        '7. Save as PNG or JPG (under 10MB each)',
        '8. Name files descriptively: 01_dashboard.png, 02_community.png, etc.'
      ],
      tools: [
        'Xcode Simulator',
        'Sketch/Figma for text overlays (optional)',
        'macOS Screenshot app (Cmd+Shift+5)'
      ],
      tips: [
        'Use actual app data, not lorem ipsum',
        'Show diverse avatars and usernames',
        'Highlight best features in first 3 screenshots',
        'Keep text minimal and legible',
        'Screenshots can be updated after launch'
      ],
      deliverables: [
        'Minimum 4 screenshots per size',
        'Maximum 10 screenshots per size',
        'Both portrait orientations',
        'PNG or JPG format'
      ]
    }
  },
  {
    id: '3',
    title: 'App Store Preview Video',
    description: 'Create 30-second app preview video showing key features',
    category: 'App Store',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '2 days',
    details: {
      steps: [
        '1. Plan 30-second flow showcasing core features:',
        '   - 0-5s: App launch and branding',
        '   - 5-10s: Dashboard and progress tracking',
        '   - 10-15s: AI Coach conversation',
        '   - 15-20s: Community feed interaction',
        '   - 20-25s: Achievement celebration',
        '   - 25-30s: Call to action',
        '2. Set up screen recording:',
        '   - Use QuickTime Player or ScreenFlow',
        '   - Record on iPhone 15 Pro Max simulator',
        '   - Hide mouse cursor',
        '   - Use smooth, deliberate gestures',
        '3. Record each segment separately',
        '4. Edit in iMovie or Final Cut Pro:',
        '   - Trim to exactly 15-30 seconds',
        '   - Add subtle transitions (0.5s max)',
        '   - Include captions for key features',
        '   - Add background music (optional)',
        '5. Export specifications:',
        '   - Resolution: 1920 x 886 (landscape) or 886 x 1920 (portrait)',
        '   - Format: H.264, .mov or .mp4',
        '   - Frame rate: 30 fps',
        '   - Max file size: 500 MB'
      ],
      tools: [
        'QuickTime Player (free)',
        'ScreenFlow ($149) or OBS (free)',
        'iMovie (free) or Final Cut Pro',
        'Simulator or physical device'
      ],
      tips: [
        'Keep it simple - show real app usage',
        'No need for fancy effects',
        'Focus on user journey, not features list',
        'Test video on muted (many watch without sound)',
        'Can submit app without video and add later'
      ],
      deliverables: [
        '15-30 second video',
        'H.264 format',
        '1920x886 or 886x1920 resolution',
        'Under 500MB file size'
      ]
    }
  },
  {
    id: '4',
    title: 'App Store Description',
    description: 'Write compelling app description with keywords optimization',
    category: 'App Store',
    priority: 'critical',
    status: 'completed',
    completedDate: new Date('2025-01-12'),
    estimatedTime: '4 hours'
  },
  {
    id: '5',
    title: 'Apple App Store Submission',
    description: 'Submit app for review with all required assets',
    category: 'App Store',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '3-7 days review',
    details: {
      steps: [
        '1. Log into App Store Connect',
        '2. Create New App:',
        '   - Bundle ID: com.nixr.app (must match Xcode)',
        '   - SKU: NIXR001',
        '   - Primary Language: English (U.S.)',
        '3. Fill in App Information:',
        '   - Name: NixR - Quit Nicotine',
        '   - Subtitle: Your Journey to Freedom',
        '   - Category: Health & Fitness',
        '   - Content Rating: 12+ (for community features)',
        '4. Set Pricing:',
        '   - Base: Free',
        '   - In-App Purchases: Add all RevenueCat products',
        '5. Upload Build:',
        '   - Archive in Xcode (Product > Archive)',
        '   - Upload via Xcode Organizer',
        '   - Select build in App Store Connect',
        '6. Add Screenshots:',
        '   - Upload for each required size',
        '   - Add app preview video (optional)',
        '7. Complete App Review Info:',
        '   - Demo account: Create test user',
        '   - Notes: Explain community moderation',
        '   - Contact info: Your details',
        '8. Submit for Review'
      ],
      tools: [
        'Xcode 15+',
        'App Store Connect',
        'Apple Developer Account ($99/year)'
      ],
      tips: [
        'Double-check bundle ID matches exactly',
        'Have backup contact ready for review team',
        'Mention any third-party services (Supabase, OpenAI)',
        'Review typically takes 24-72 hours',
        'Can request expedited review if needed'
      ],
      deliverables: [
        'Completed app listing',
        'Uploaded build',
        'All screenshots uploaded',
        'Submitted for review'
      ]
    }
  },
  {
    id: '6',
    title: 'Google Play Console Setup',
    description: 'Complete Google Play Console account setup ($25 one-time)',
    category: 'App Store',
    priority: 'critical',
    status: 'completed',
    completedDate: new Date('2025-01-06')
  },
  {
    id: '7',
    title: 'Google Play Store Listing',
    description: 'Create feature graphic, screenshots, and store listing',
    category: 'App Store',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '1 day',
    details: {
      steps: [
        '1. Log into Google Play Console',
        '2. Create Store Listing:',
        '   - App name: NixR - Quit Nicotine',
        '   - Short description: Break free from nicotine with AI support & community (80 chars)',
        '   - Full description: Use App Store description',
        '3. Create Graphic Assets:',
        '   - Feature Graphic: 1024 x 500px (required)',
        '   - Icon: 512 x 512px',
        '   - Screenshots: Min 2, max 8 per device type',
        '   - Phone: 16:9 to 9:16 aspect ratios accepted',
        '4. Screenshot Requirements:',
        '   - Minimum 320px on shortest side',
        '   - Maximum 3840px on longest side',
        '   - JPG or PNG (no alpha)',
        '5. Set Content Rating:',
        '   - Complete questionnaire',
        '   - Likely "Teen" for community features',
        '6. Select Category:',
        '   - Primary: Health & Fitness',
        '   - Tags: Add relevant keywords',
        '7. Add Contact Details:',
        '   - Support email',
        '   - Privacy policy URL',
        '   - Terms of service URL'
      ],
      tools: [
        'Google Play Console',
        'Image editor for feature graphic',
        'Same screenshots as iOS (different sizes ok)'
      ],
      tips: [
        'Feature graphic is most important - shows in search',
        'Can reuse iOS screenshots with different dimensions',
        'Short description is crucial for conversions',
        'Add Spanish/French translations later for growth',
        'Google review is typically faster (2-3 hours)'
      ],
      deliverables: [
        'Feature graphic (1024x500)',
        'Minimum 2 screenshots',
        'Store listing text',
        'Content rating completed'
      ]
    }
  },
  {
    id: '8',
    title: 'Google Play Submission',
    description: 'Submit app to Google Play with content rating',
    category: 'App Store',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '2-3 days review',
    details: {
      steps: [
        '1. Build Release APK/AAB:',
        '   - Run: eas build --platform android --profile production',
        '   - Or use: ./gradlew bundleRelease',
        '   - Sign with upload key',
        '2. Create Release:',
        '   - Go to Production > Create new release',
        '   - Upload AAB file (recommended over APK)',
        '   - Name version (e.g., 1.0.0)',
        '3. Complete Release Notes:',
        '   - What\'s new in this version',
        '   - Keep it user-friendly',
        '4. Set Rollout Percentage:',
        '   - Start at 100% for initial release',
        '   - Can do staged rollout for updates',
        '5. Review and Submit:',
        '   - Check all warnings',
        '   - Ensure content rating is set',
        '   - Submit for review',
        '6. Post-Submission:',
        '   - Monitor review status',
        '   - Respond quickly to any issues',
        '   - Typical review: 2-3 hours'
      ],
      tools: [
        'EAS CLI or Android Studio',
        'Google Play Console',
        'Signing keys (store securely!)'
      ],
      tips: [
        'AAB format is preferred over APK',
        'Test on multiple Android versions',
        'Include arm64-v8a architecture',
        'Set minimum SDK to 21 (Android 5.0)',
        'Keep signing keys backed up safely!'
      ],
      deliverables: [
        'Signed AAB/APK file',
        'Release notes',
        'Submitted for review',
        'Signing keys backed up'
      ]
    }
  },

  // ========== BACKEND & INFRASTRUCTURE ==========
  {
    id: '9',
    title: 'Production Environment Setup',
    description: 'Create production Supabase project with proper tier',
    category: 'Backend',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '2 hours',
    details: {
      steps: [
        '1. Create new Supabase project:',
        '   - Go to supabase.com/dashboard',
        '   - Click "New Project"',
        '   - Name: nixr-production',
        '   - Database Password: Generate strong password (save in 1Password!)',
        '   - Region: Choose closest to target users (us-east-1)',
        '   - Pricing Plan: Pro ($25/month) for production',
        '2. Copy database schema:',
        '   - Export dev database: pg_dump > schema.sql',
        '   - Import to production via SQL editor',
        '   - Or use Supabase migration files',
        '3. Configure Auth settings:',
        '   - Enable Email auth',
        '   - Set up email templates',
        '   - Configure redirect URLs',
        '   - Add JWT secret',
        '4. Set up Storage buckets:',
        '   - Create "avatars" bucket (public)',
        '   - Create "user-uploads" bucket (private)',
        '   - Set size limits and allowed MIME types',
        '5. Configure Row Level Security:',
        '   - Review all RLS policies',
        '   - Test with different user roles',
        '   - Ensure no security holes',
        '6. Get connection strings:',
        '   - Copy anon key for mobile app',
        '   - Copy service role key for admin',
        '   - Copy database URL'
      ],
      tools: [
        'Supabase Dashboard',
        'pg_dump (for schema export)',
        '1Password or secure password manager'
      ],
      tips: [
        'Use Pro tier for auto-backups and better performance',
        'Keep service role key super secure - never commit!',
        'Test auth flow immediately after setup',
        'Enable point-in-time recovery',
        'Set up monitoring alerts'
      ],
      deliverables: [
        'Production Supabase project',
        'All tables and RLS policies',
        'Environment variables documented',
        'Backups configured'
      ]
    }
  },
  {
    id: '10',
    title: 'Database Migration & Seeding',
    description: 'Migrate schema and seed initial data to production',
    category: 'Backend',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '4 hours',
    dependencies: ['production-env'],
    details: {
      steps: [
        '1. Export development database:',
        '   - Run: supabase db dump > dev_schema.sql',
        '   - Or use migration files in /supabase folder',
        '2. Clean up development data:',
        '   - Remove test users',
        '   - Clear test messages/posts',
        '   - Keep only essential seed data',
        '3. Prepare seed data:',
        '   - Default avatar configurations',
        '   - Achievement badge definitions',
        '   - Support style options',
        '   - Initial community guidelines post',
        '4. Run migrations in production:',
        '   - Connect to production DB',
        '   - Run schema creation',
        '   - Verify all tables created',
        '   - Check RLS policies active',
        '5. Seed initial data:',
        '   - Insert badge definitions',
        '   - Create system user for announcements',
        '   - Add default avatar options',
        '6. Verify migration:',
        '   - Test user registration',
        '   - Check all features work',
        '   - Verify no missing tables'
      ],
      tools: [
        'Supabase CLI',
        'pgAdmin or TablePlus',
        'SQL migration scripts'
      ],
      tips: [
        'Always backup before migrating',
        'Test migrations on staging first',
        'Keep migration scripts versioned',
        'Document any manual steps'
      ],
      deliverables: [
        'Production database schema',
        'Seed data inserted',
        'Migration documented',
        'Rollback plan ready'
      ]
    }
  },
  {
    id: '11',
    title: 'Environment Variables',
    description: 'Set all production environment variables for mobile and admin apps',
    category: 'Backend',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '1 hour',
    details: {
      steps: [
        '1. Mobile App (.env):',
        '   - EXPO_PUBLIC_SUPABASE_URL=https://[project].supabase.co',
        '   - EXPO_PUBLIC_SUPABASE_ANON_KEY=[anon-key]',
        '   - EXPO_PUBLIC_SENTRY_DSN=[sentry-dsn]',
        '   - EXPO_PUBLIC_REVENUECAT_API_KEY=[revenue-key]',
        '   - EXPO_PUBLIC_ADMIN_API_URL=https://admin.nixr.app',
        '2. Admin Dashboard (.env.local):',
        '   - NEXT_PUBLIC_SUPABASE_URL=[same-as-mobile]',
        '   - NEXT_PUBLIC_SUPABASE_ANON_KEY=[same-as-mobile]',
        '   - SUPABASE_SERVICE_ROLE_KEY=[service-key]',
        '   - OPENAI_API_KEY=[openai-key]',
        '   - NEXTAUTH_SECRET=[generate-secret]',
        '   - NEXTAUTH_URL=https://admin.nixr.app',
        '3. Build environment (EAS):',
        '   - Add secrets in eas.json',
        '   - Configure for production profile',
        '   - Set up env vars in Expo dashboard',
        '4. Vercel deployment:',
        '   - Add all env vars in Vercel dashboard',
        '   - Set up preview vs production',
        '   - Configure domain settings',
        '5. Security checks:',
        '   - Never commit .env files',
        '   - Use different keys for dev/prod',
        '   - Rotate keys regularly',
        '   - Document in password manager'
      ],
      tools: [
        'Expo dashboard',
        'Vercel dashboard',
        '1Password for secrets',
        'dotenv for local testing'
      ],
      tips: [
        'Generate strong secrets with: openssl rand -base64 32',
        'Test with production keys before launch',
        'Keep backup of all keys securely',
        'Set up key rotation reminders'
      ],
      deliverables: [
        'All production env vars set',
        'Keys documented securely',
        'Build configs updated',
        'Deployment tested'
      ]
    }
  },
  {
    id: '12',
    title: 'API Rate Limiting',
    description: 'Configure rate limiting for all API endpoints',
    category: 'Backend',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '2 hours'
  },
  {
    id: '13',
    title: 'Database Backups',
    description: 'Set up automated daily backups with 30-day retention',
    category: 'Backend',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '1 hour'
  },
  {
    id: '14',
    title: 'CDN Configuration',
    description: 'Set up CloudFlare or similar CDN for assets',
    category: 'Backend',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '2 hours'
  },
  {
    id: '14b',
    title: 'Database Optimization',
    description: 'Implement indexes, message limits, and cleanup strategies',
    category: 'Backend',
    priority: 'high',
    status: 'completed',
    completedDate: new Date('2025-01-18'),
    estimatedTime: '2 hours'
  },
  {
    id: '14c',
    title: 'Authentication System',
    description: 'Complete auth with email/password and anonymous users',
    category: 'Backend',
    priority: 'critical',
    status: 'completed',
    completedDate: new Date('2025-01-10'),
    estimatedTime: '1 day'
  },
  {
    id: '14d',
    title: 'AI Coach Integration',
    description: 'Integrate OpenAI API for recovery coach with clean chat UI',
    category: 'Backend',
    priority: 'critical',
    status: 'completed',
    completedDate: new Date('2025-01-18'),
    estimatedTime: '2 days'
  },

  // ========== PAYMENT & REVENUE ==========
  {
    id: '15',
    title: 'RevenueCat Production',
    description: 'Configure RevenueCat with production API keys',
    category: 'Revenue',
    priority: 'critical',
    status: 'completed',
    completedDate: new Date('2025-01-10')
  },
  {
    id: '16',
    title: 'In-App Purchase Products',
    description: 'Create all IAP products in App Store Connect & Google Play',
    category: 'Revenue',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '2 hours',
    details: {
      steps: [
        '1. App Store Connect Products:',
        '   - Log into App Store Connect',
        '   - Go to App > Features > In-App Purchases',
        '   - Create Non-Consumable Products:',
        '     • premium_avatars ($4.99)',
        '     • avatar_pack_pro ($9.99)',
        '   - Create Auto-Renewable Subscriptions:',
        '     • nixr_premium_monthly ($9.99/month)',
        '     • nixr_premium_yearly ($79.99/year - 33% off)',
        '   - For each product set:',
        '     • Reference Name (internal)',
        '     • Product ID (must match RevenueCat)',
        '     • Price Schedule',
        '     • Localized Display Name',
        '     • Description',
        '2. Google Play Products:',
        '   - Go to Monetization > Products > In-app products',
        '   - Create same products with same IDs',
        '   - Set prices (can be different from iOS)',
        '   - Add product descriptions',
        '3. RevenueCat Configuration:',
        '   - Add products to RevenueCat dashboard',
        '   - Create Offerings',
        '   - Set up Entitlements:',
        '     • premium_features',
        '     • avatar_customization',
        '   - Configure trial periods if desired',
        '4. Subscription Groups (iOS):',
        '   - Create subscription group',
        '   - Add both monthly/yearly',
        '   - Set upgrade/downgrade rules',
        '5. Testing setup:',
        '   - Create sandbox testers',
        '   - Add test accounts to RevenueCat',
        '   - Document test scenarios'
      ],
      tools: [
        'App Store Connect',
        'Google Play Console',
        'RevenueCat Dashboard',
        'Spreadsheet for tracking'
      ],
      tips: [
        'Product IDs must be unique and can\'t be changed',
        'Keep IDs consistent across platforms',
        'Price in USD, auto-converts to other currencies',
        'Consider introductory offers for launch',
        'Test restore purchases thoroughly'
      ],
      deliverables: [
        'All IAP products created',
        'RevenueCat configured',
        'Pricing strategy documented',
        'Test accounts ready'
      ]
    }
  },
  {
    id: '17',
    title: 'Subscription Tiers Testing',
    description: 'Test all subscription flows with sandbox accounts',
    category: 'Revenue',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '4 hours'
  },
  {
    id: '18',
    title: 'Tax & Banking Info',
    description: 'Complete tax forms and banking info for both app stores',
    category: 'Revenue',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '2 hours',
    details: {
      steps: [
        '1. Apple Tax Setup:',
        '   - Go to Agreements, Tax, and Banking',
        '   - Complete tax forms:',
        '     • W-9 for US entities',
        '     • W-8BEN for individuals',
        '   - Add bank account:',
        '     • Routing number',
        '     • Account number',
        '     • Verify test deposit',
        '   - Sign agreements:',
        '     • Paid Applications',
        '     • Free Applications',
        '2. Google Tax Setup:',
        '   - Go to Payments profile',
        '   - Add tax information',
        '   - Select business type',
        '   - Add payment method:',
        '     • Bank account details',
        '     • Verify with micro-deposits',
        '3. Important considerations:',
        '   - Use business bank account',
        '   - Keep EIN/SSN secure',
        '   - Understand tax obligations',
        '   - Set aside 30% for taxes',
        '4. Payment schedules:',
        '   - Apple: Monthly (NET 30)',
        '   - Google: Monthly (15th)',
        '   - Minimum payout thresholds',
        '5. Financial tracking:',
        '   - Set up accounting system',
        '   - Track all revenue',
        '   - Monitor payment reports',
        '   - Plan for tax payments'
      ],
      tools: [
        'App Store Connect',
        'Google Play Console',
        'Business bank account',
        'QuickBooks or similar'
      ],
      tips: [
        'Complete before app submission',
        'Use separate business accounts',
        'Consult with accountant',
        'Keep all tax documents',
        'Set up revenue tracking early'
      ],
      deliverables: [
        'Tax forms completed',
        'Bank accounts verified',
        'Agreements signed',
        'Accounting system ready'
      ]
    }
  },

  // ========== SECURITY & COMPLIANCE ==========
  {
    id: '19',
    title: 'SSL Certificates',
    description: 'Configure SSL for all domains and subdomains',
    category: 'Security',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '2 hours'
  },
  {
    id: '20',
    title: 'Security Headers',
    description: 'Implement HSTS, CSP, X-Frame-Options, etc.',
    category: 'Security',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '2 hours'
  },
  {
    id: '21',
    title: 'API Security Audit',
    description: 'Audit all endpoints for authentication and authorization',
    category: 'Security',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '1 day',
    details: {
      steps: [
        '1. List all API endpoints:',
        '   - /api/ai-coach/* (requires auth)',
        '   - /api/users/* (mixed auth)',
        '   - /api/analytics/* (admin only)',
        '   - /api/mobile/* (app auth)',
        '   - Supabase auto-generated APIs',
        '2. Check authentication:',
        '   - Verify JWT validation',
        '   - Check token expiration',
        '   - Test with expired tokens',
        '   - Verify anonymous user limits',
        '3. Test authorization:',
        '   - User can only access own data',
        '   - Admin endpoints require service key',
        '   - Community posts respect privacy',
        '   - Buddy system permissions',
        '4. Rate limiting verification:',
        '   - AI Coach: 100 msgs/day',
        '   - API calls: 1000/hour',
        '   - Upload limits: 10MB',
        '   - Implement IP-based limits',
        '5. Input validation:',
        '   - SQL injection tests',
        '   - XSS prevention',
        '   - File upload validation',
        '   - Request size limits',
        '6. Security headers:',
        '   - CORS properly configured',
        '   - CSP headers set',
        '   - X-Frame-Options',
        '   - HSTS enabled'
      ],
      tools: [
        'Postman for API testing',
        'OWASP ZAP scanner',
        'Burp Suite (optional)',
        'Jest for automated tests'
      ],
      tips: [
        'Test as different user types',
        'Try common attack vectors',
        'Check for data leakage',
        'Verify error messages don\'t expose info',
        'Document all findings'
      ],
      deliverables: [
        'Security audit report',
        'Fixed vulnerabilities',
        'Penetration test results',
        'Security checklist completed'
      ]
    }
  },
  {
    id: '22',
    title: 'Data Encryption',
    description: 'Verify all sensitive data is encrypted at rest and in transit',
    category: 'Security',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '4 hours'
  },
  {
    id: '23',
    title: 'OWASP Security Check',
    description: 'Run OWASP mobile security checklist',
    category: 'Security',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '1 day'
  },

  // ========== LEGAL & COMPLIANCE ==========
  {
    id: '24',
    title: 'Privacy Policy',
    description: 'Finalize privacy policy with GDPR/CCPA compliance',
    category: 'Legal',
    priority: 'critical',
    status: 'completed',
    completedDate: new Date('2025-01-12'),
    estimatedTime: '1 day'
  },
  {
    id: '25',
    title: 'Terms of Service',
    description: 'Complete terms of service with subscription terms',
    category: 'Legal',
    priority: 'critical',
    status: 'completed',
    completedDate: new Date('2025-01-12'),
    estimatedTime: '1 day'
  },
  {
    id: '26',
    title: 'Cookie Policy',
    description: 'Create cookie policy for website',
    category: 'Legal',
    priority: 'high',
    status: 'completed',
    completedDate: new Date('2025-01-12'),
    estimatedTime: '2 hours'
  },
  {
    id: '27',
    title: 'EULA',
    description: 'Draft End User License Agreement',
    category: 'Legal',
    priority: 'high',
    status: 'completed',
    completedDate: new Date('2025-01-12'),
    estimatedTime: '4 hours'
  },
  {
    id: '28',
    title: 'Age Verification',
    description: 'Implement age verification (13+ requirement)',
    category: 'Legal',
    priority: 'high',
    status: 'completed',
    completedDate: new Date('2025-01-15'),
    estimatedTime: '4 hours'
  },

  // ========== MONITORING & ANALYTICS ==========
  {
    id: '29',
    title: 'Error Tracking (Sentry)',
    description: 'Configure Sentry for production with alerts',
    category: 'Monitoring',
    priority: 'critical',
    status: 'completed',
    completedDate: new Date('2025-01-07')
  },
  {
    id: '30',
    title: 'Analytics Events',
    description: 'Verify all critical user flows have analytics',
    category: 'Monitoring',
    priority: 'high',
    status: 'completed',
    completedDate: new Date('2025-01-09')
  },
  {
    id: '31',
    title: 'Performance Monitoring',
    description: 'Set up API and app performance monitoring',
    category: 'Monitoring',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '4 hours'
  },
  {
    id: '32',
    title: 'Uptime Monitoring',
    description: 'Configure uptime monitoring with alerts',
    category: 'Monitoring',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '1 hour'
  },
  {
    id: '33',
    title: 'Custom Dashboards',
    description: 'Create launch day monitoring dashboards',
    category: 'Monitoring',
    priority: 'medium',
    status: 'completed',
    completedDate: new Date('2025-01-16'),
    estimatedTime: '4 hours'
  },

  // ========== TESTING ==========
  {
    id: '34',
    title: 'Device Testing Matrix',
    description: 'Test on multiple iOS and Android devices',
    category: 'Testing',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '2 days',
    details: {
      steps: [
        '1. iOS Device Testing:',
        '   - iPhone 15 Pro Max (latest)',
        '   - iPhone 14 (mainstream)',
        '   - iPhone 12 (older but common)',
        '   - iPhone SE (small screen)',
        '   - iPad (if supporting tablets)',
        '2. iOS Version Testing:',
        '   - iOS 17 (latest)',
        '   - iOS 16 (common)',
        '   - iOS 15 (minimum supported)',
        '3. Android Device Testing:',
        '   - Pixel 8 (stock Android)',
        '   - Samsung Galaxy S23',
        '   - OnePlus (OxygenOS)',
        '   - Budget device (test performance)',
        '4. Android Version Testing:',
        '   - Android 14 (latest)',
        '   - Android 12-13 (common)',
        '   - Android 10 (minimum)',
        '5. Test scenarios per device:',
        '   - Fresh install flow',
        '   - Onboarding completion',
        '   - All main features',
        '   - Push notifications',
        '   - Background timers',
        '   - Camera/permissions',
        '6. Performance testing:',
        '   - App launch time',
        '   - Screen transitions',
        '   - Memory usage',
        '   - Battery impact'
      ],
      tools: [
        'Physical devices (ideal)',
        'BrowserStack or Sauce Labs',
        'Firebase Test Lab',
        'Xcode Simulator / Android Emulator'
      ],
      tips: [
        'Test on real devices when possible',
        'Pay attention to older/slower devices',
        'Check different screen sizes',
        'Test with poor network conditions',
        'Document any device-specific issues'
      ],
      deliverables: [
        'Testing matrix completed',
        'Bug report for issues',
        'Performance benchmarks',
        'Device compatibility list'
      ]
    }
  },
  {
    id: '35',
    title: 'Load Testing',
    description: 'Simulate 10,000 concurrent users',
    category: 'Testing',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '1 day'
  },
  {
    id: '36',
    title: 'Penetration Testing',
    description: 'Basic security penetration testing',
    category: 'Testing',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '2 days'
  },
  {
    id: '37',
    title: 'Beta Testing Program',
    description: 'Run beta with 100+ testers via TestFlight',
    category: 'Testing',
    priority: 'high',
    status: 'in-progress',
    estimatedTime: '1 week'
  },
  {
    id: '38',
    title: 'Accessibility Testing',
    description: 'Ensure WCAG 2.1 AA compliance',
    category: 'Testing',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '1 day'
  },
  {
    id: '38b',
    title: 'Core Features Testing',
    description: 'Test dashboard, progress tracking, journal, community features',
    category: 'Testing',
    priority: 'critical',
    status: 'completed',
    completedDate: new Date('2025-01-17'),
    estimatedTime: '3 days'
  },
  {
    id: '38c',
    title: 'Onboarding Flow Testing',
    description: 'Complete testing of personalized onboarding with analytics',
    category: 'Testing',
    priority: 'critical',
    status: 'completed',
    completedDate: new Date('2025-01-15'),
    estimatedTime: '1 day'
  },

  // ========== MARKETING ==========
  {
    id: '39',
    title: 'App Store Optimization (ASO)',
    description: 'Optimize keywords, title, and description for discovery',
    category: 'Marketing',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '1 day',
    details: {
      steps: [
        '1. Keyword Research:',
        '   - Primary: quit smoking, nicotine, vaping',
        '   - Secondary: recovery, addiction, health',
        '   - Long-tail: quit vaping app, nicotine tracker',
        '   - Use App Annie or Sensor Tower',
        '2. App Title Optimization:',
        '   - Format: NixR - Quit Nicotine',
        '   - Include main keyword in subtitle',
        '   - Keep under 30 characters',
        '3. Description Optimization:',
        '   - First 3 lines are crucial',
        '   - Include keywords naturally',
        '   - Highlight unique features',
        '   - Social proof if available',
        '   - Clear call-to-action',
        '4. Visual Optimization:',
        '   - A/B test different screenshots',
        '   - Show key features first',
        '   - Include text overlays',
        '   - Test different color schemes',
        '5. Localization prep:',
        '   - Identify top markets',
        '   - Translate keywords',
        '   - Cultural adaptation',
        '6. Competition analysis:',
        '   - Study top quit-smoking apps',
        '   - Identify gaps in market',
        '   - Differentiation strategy'
      ],
      tools: [
        'App Annie (ASO insights)',
        'Sensor Tower',
        'AppTweak',
        'Google Keyword Planner'
      ],
      tips: [
        'Update keywords based on trends',
        'Monitor competitor changes',
        'Test different screenshots quarterly',
        'Track keyword rankings',
        'Optimize based on data, not guesses'
      ],
      deliverables: [
        'Keyword strategy document',
        'Optimized store listing',
        'Competitor analysis',
        'A/B test plan'
      ]
    }
  },
  {
    id: '40',
    title: 'SEO Optimization',
    description: 'Optimize website for search engines',
    category: 'Marketing',
    priority: 'medium',
    status: 'completed',
    completedDate: new Date('2025-01-12'),
    estimatedTime: '1 day'
  },
  {
    id: '41',
    title: 'Social Media Setup',
    description: 'Create accounts: Instagram, TikTok, Twitter, Facebook',
    category: 'Marketing',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '4 hours'
  },
  {
    id: '42',
    title: 'Launch Email Campaign',
    description: 'Prepare launch announcement email sequence',
    category: 'Marketing',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '1 day'
  },
  {
    id: '43',
    title: 'Press Kit',
    description: 'Create press kit with screenshots, logos, description',
    category: 'Marketing',
    priority: 'medium',
    status: 'completed',
    completedDate: new Date('2025-01-12'),
    estimatedTime: '4 hours'
  },
  {
    id: '44',
    title: 'Product Hunt Launch',
    description: 'Prepare Product Hunt launch materials',
    category: 'Marketing',
    priority: 'medium',
    status: 'not-started',
    estimatedTime: '4 hours'
  },

  // ========== SUPPORT & OPERATIONS ==========
  {
    id: '45',
    title: 'Support Email',
    description: 'Set up support@nixr.com with auto-responder',
    category: 'Support',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '2 hours'
  },
  {
    id: '46',
    title: 'Help Documentation',
    description: 'Create FAQ and help documentation',
    category: 'Support',
    priority: 'high',
    status: 'completed',
    completedDate: new Date('2025-01-12'),
    estimatedTime: '1 day'
  },
  {
    id: '47',
    title: 'Support Ticket System',
    description: 'Set up Zendesk or similar for support',
    category: 'Support',
    priority: 'medium',
    status: 'not-started',
    estimatedTime: '4 hours'
  },
  {
    id: '48',
    title: 'Community Guidelines',
    description: 'Write community guidelines and moderation rules',
    category: 'Support',
    priority: 'high',
    status: 'completed',
    completedDate: new Date('2025-01-12'),
    estimatedTime: '2 hours'
  },
  {
    id: '48b',
    title: 'Admin Dashboard',
    description: 'Complete admin dashboard for user management and analytics',
    category: 'Support',
    priority: 'critical',
    status: 'completed',
    completedDate: new Date('2025-01-17'),
    estimatedTime: '3 days'
  },

  // ========== NOTIFICATIONS & COMMS ==========
  {
    id: '49',
    title: 'Push Notification Certs',
    description: 'Generate and configure iOS/Android push certificates',
    category: 'Communications',
    priority: 'critical',
    status: 'completed',
    completedDate: new Date('2025-01-08')
  },
  {
    id: '50',
    title: 'Email Templates',
    description: 'Design welcome, password reset, subscription emails',
    category: 'Communications',
    priority: 'high',
    status: 'completed',
    completedDate: new Date('2025-01-12'),
    estimatedTime: '1 day'
  },
  {
    id: '51',
    title: 'SMS Integration',
    description: 'Set up Twilio for critical notifications',
    category: 'Communications',
    priority: 'medium',
    status: 'not-started',
    estimatedTime: '4 hours'
  },
  {
    id: '52',
    title: 'Email Deliverability',
    description: 'Configure SPF, DKIM, DMARC for email',
    category: 'Communications',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '2 hours'
  },
  {
    id: '52b',
    title: 'Push Notification System',
    description: 'Implement check-in reminders and milestone notifications',
    category: 'Communications',
    priority: 'high',
    status: 'completed',
    completedDate: new Date('2025-01-14'),
    estimatedTime: '2 days'
  },

  // ========== FINAL PREPARATIONS ==========
  {
    id: '53',
    title: 'App Store Optimization',
    description: 'Research and implement ASO keywords',
    category: 'Launch Prep',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '4 hours'
  },
  {
    id: '54',
    title: 'Launch Day Runbook',
    description: 'Create detailed launch day procedures',
    category: 'Launch Prep',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '2 hours'
  },
  {
    id: '55',
    title: 'Rollback Plan',
    description: 'Document emergency rollback procedures',
    category: 'Launch Prep',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '2 hours'
  },
  {
    id: '56',
    title: 'Team Training',
    description: 'Train support team on app features and FAQs',
    category: 'Launch Prep',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '4 hours'
  },
  {
    id: '57',
    title: 'Launch Metrics Dashboard',
    description: 'Set up real-time launch metrics monitoring',
    category: 'Launch Prep',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '4 hours'
  },
  {
    id: '58',
    title: 'Soft Launch Plan',
    description: 'Plan soft launch in specific market (Canada/Australia)',
    category: 'Launch Prep',
    priority: 'medium',
    status: 'not-started',
    estimatedTime: '2 hours'
  },
  {
    id: '59',
    title: 'Final App Build',
    description: 'Create final production builds for both platforms',
    category: 'Launch Prep',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '4 hours'
  },
  {
    id: '60',
    title: 'Launch Announcement',
    description: 'Prepare launch announcement for all channels',
    category: 'Launch Prep',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '2 hours'
  },
  {
    id: '60b',
    title: 'Core App Features',
    description: 'Complete all core features: dashboard, progress, journal, community, buddy system',
    category: 'Launch Prep',
    priority: 'critical',
    status: 'completed',
    completedDate: new Date('2025-01-17'),
    estimatedTime: '2 weeks'
  },
  {
    id: '60c',
    title: 'Avatar System',
    description: 'Complete avatar customization with IAP integration',
    category: 'Launch Prep',
    priority: 'high',
    status: 'completed',
    completedDate: new Date('2025-01-11'),
    estimatedTime: '3 days'
  },
  {
    id: '60d',
    title: 'Supabase Integration',
    description: 'Complete backend integration with auth, storage, and real-time features',
    category: 'Launch Prep',
    priority: 'critical',
    status: 'completed',
    completedDate: new Date('2025-01-12'),
    estimatedTime: '1 week'
  },
  {
    id: '60e',
    title: 'Launch Day Checklist',
    description: 'Final checklist for launch day execution',
    category: 'Launch Prep',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '1 day',
    details: {
      steps: [
        '1. Pre-Launch (Day Before):',
        '   - Final app store review status',
        '   - Production servers tested',
        '   - Support team briefed',
        '   - Social media scheduled',
        '   - Press release ready',
        '2. Launch Morning:',
        '   - Check app store approval',
        '   - Verify app is downloadable',
        '   - Test complete user flow',
        '   - Monitor error tracking',
        '   - Team standup meeting',
        '3. Launch Announcement:',
        '   - Send press release',
        '   - Post on all social channels',
        '   - Email to wait list',
        '   - Update website',
        '   - Notify beta testers',
        '4. First Hour Monitoring:',
        '   - Watch crash reports',
        '   - Monitor server load',
        '   - Check user registrations',
        '   - Review initial feedback',
        '   - Respond to urgent issues',
        '5. First Day Tasks:',
        '   - Respond to reviews',
        '   - Fix critical bugs',
        '   - Monitor social mentions',
        '   - Track download numbers',
        '   - Team check-ins',
        '6. End of Day Review:',
        '   - Download statistics',
        '   - User feedback summary',
        '   - Bug priority list',
        '   - Tomorrow\'s action plan',
        '   - Celebrate launch!'
      ],
      tools: [
        'App Store Connect',
        'Google Play Console',
        'Analytics dashboards',
        'Social media scheduler',
        'Team communication tool'
      ],
      tips: [
        'Have rollback plan ready',
        'Keep team available all day',
        'Prepare canned responses',
        'Don\'t panic about small issues',
        'Document everything for next launch'
      ],
      deliverables: [
        'Launch executed',
        'Metrics documented',
        'Issue log created',
        'Lessons learned'
      ]
    }
  },

  // ========== ADMIN DASHBOARD ==========
  {
    id: '61',
    title: 'Admin Dashboard Deployment',
    description: 'Deploy admin dashboard to production with proper authentication',
    category: 'Admin Dashboard',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '1 day',
    details: {
      steps: [
        '1. Update Authentication (2-4 hours):',
        '   - Replace simple cookie auth with Supabase Auth',
        '   - Update middleware to check real admin status',
        '   - Add proper session management',
        '   - Implement role-based access control',
        '   - Test all protected routes',
        '2. Environment Setup (30 minutes):',
        '   - Create .env.local with production values:',
        '     NEXT_PUBLIC_SUPABASE_URL=your_url',
        '     SUPABASE_SERVICE_ROLE_KEY=your_key',
        '     OPENAI_API_KEY=your_openai_key',
        '     NEXT_PUBLIC_MOBILE_API_KEY=your_api_key',
        '3. Build and Test (30 minutes):',
        '   - Run: npm run build',
        '   - Test build locally: npm start',
        '   - Verify all pages load without errors',
        '   - Check API endpoints work',
        '4. Deploy to Vercel (30 minutes):',
        '   - Push code to GitHub',
        '   - Import project in Vercel',
        '   - Add all environment variables',
        '   - Configure custom domain (admin.nixr.app)',
        '   - Enable HTTPS',
        '5. Post-Deployment (30 minutes):',
        '   - Test all features with real data',
        '   - Verify monitoring dashboards work',
        '   - Check AI Coach integration',
        '   - Test mobile app logs endpoint',
        '   - Set up error monitoring'
      ],
      tools: [
        'Vercel Dashboard',
        'GitHub',
        'Domain registrar for DNS'
      ],
      tips: [
        'Mock data will auto-switch to real data when Supabase connected',
        'All features work without code changes',
        'Can deploy immediately with mock data for demos',
        'Update auth before exposing to internet'
      ],
      deliverables: [
        'Admin dashboard live at admin.nixr.app',
        'Authentication secured',
        'All environment variables set',
        'SSL certificate active'
      ]
    }
  },
  {
    id: '62',
    title: 'Admin Dashboard Database Setup',
    description: 'Run all SQL migrations for admin dashboard tables',
    category: 'Admin Dashboard',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '2 hours',
    dependencies: ['production-env'],
    details: {
      steps: [
        '1. Connect to Production Database:',
        '   - Use Supabase SQL Editor or pgAdmin',
        '   - Have connection string ready',
        '2. Run Migrations in Order:',
        '   - 01_initial_schema.sql (users, profiles)',
        '   - 02_auth_triggers.sql (auth functions)',
        '   - 03_journal_entries_fix.sql',
        '   - 04_onboarding_analytics.sql',
        '   - 05_onboarding_funnel_rpc_clean.sql',
        '   - 06_achievements_tables.sql',
        '   - 07_buddy_system_tables.sql',
        '   - 08_community_tables.sql',
        '   - 09_monitoring_tables.sql',
        '   - 10_ai_coach_tables.sql',
        '   - 11_admin_users_separation_simple.sql',
        '3. Verify Tables Created:',
        '   - Check all tables exist',
        '   - Verify RLS policies active',
        '   - Test basic queries',
        '4. Create Admin User:',
        '   - Insert first admin user',
        '   - Set proper role (super_admin)',
        '   - Test login works'
      ],
      tools: [
        'Supabase SQL Editor',
        'Migration files in /admin-dashboard/supabase/'
      ],
      tips: [
        'Run migrations one at a time',
        'Check for errors after each',
        'Some tables may already exist from mobile app',
        'Keep migration order sequential'
      ],
      deliverables: [
        'All database tables created',
        'RLS policies active',
        'Admin user can log in',
        'No migration errors'
      ]
    }
  },
  {
    id: '63',
    title: 'Configure Admin Dashboard APIs',
    description: 'Set up all API endpoints and integrations',
    category: 'Admin Dashboard',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '2 hours',
    details: {
      steps: [
        '1. Mobile App Integration:',
        '   - Generate secure API key',
        '   - Configure CORS for mobile app domain',
        '   - Test /api/mobile/logs endpoint',
        '   - Verify /api/mobile/stats works',
        '2. OpenAI Integration:',
        '   - Add OpenAI API key to env',
        '   - Test AI Coach chat endpoint',
        '   - Monitor usage and costs',
        '   - Set up rate limiting',
        '3. Monitoring Webhooks:',
        '   - Configure Sentry webhook URL',
        '   - Set up crash report ingestion',
        '   - Test error logging',
        '4. Analytics APIs:',
        '   - Verify database queries work',
        '   - Test all chart data endpoints',
        '   - Check performance on large datasets',
        '5. Rate Limiting:',
        '   - Implement rate limiting middleware',
        '   - Set appropriate limits per endpoint',
        '   - Add API key validation'
      ],
      tools: [
        'Postman for API testing',
        'OpenAI Dashboard',
        'Vercel Analytics'
      ],
      tips: [
        'Start with read-only endpoints',
        'Test with mobile app immediately',
        'Monitor API response times',
        'Document all API keys securely'
      ],
      deliverables: [
        'All APIs functional',
        'Mobile app can send logs',
        'AI Coach working',
        'Rate limiting active'
      ]
    }
  },
  {
    id: '64',
    title: 'Admin Dashboard Documentation',
    description: 'Ensure all documentation is complete and accessible',
    category: 'Admin Dashboard',
    priority: 'medium',
    status: 'completed',
    completedDate: new Date('2025-01-13'),
    estimatedTime: '4 hours',
    details: {
      steps: [
        '1. API Documentation:',
        '   - Complete API reference with examples',
        '   - Document all endpoints',
        '   - Include authentication requirements',
        '   - Add rate limiting info',
        '2. Deployment Guide:',
        '   - Step-by-step deployment checklist',
        '   - Environment variable reference',
        '   - Troubleshooting section',
        '3. User Guide:',
        '   - How to use each dashboard feature',
        '   - Understanding metrics',
        '   - Managing users',
        '   - Monitoring system health',
        '4. Developer Documentation:',
        '   - Code structure overview',
        '   - How to add new features',
        '   - Database schema reference',
        '   - Mock data system explanation'
      ],
      tools: [
        'Markdown files',
        'README.md',
        'Inline code comments'
      ],
      tips: [
        'Keep docs with code for easy updates',
        'Include screenshots where helpful',
        'Document gotchas and workarounds',
        'Update docs as features change'
      ],
      deliverables: [
        'API_DOCUMENTATION.md',
        'DEPLOYMENT_CHECKLIST.md',
        'README.md updated',
        'MONITORING_SYSTEM_DOCUMENTATION.md'
      ]
    }
  },
  {
    id: '65',
    title: 'Admin Dashboard Security Audit',
    description: 'Ensure admin dashboard is secure before launch',
    category: 'Admin Dashboard',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '4 hours',
    details: {
      steps: [
        '1. Authentication Security:',
        '   - Remove simple auth completely',
        '   - Implement proper session timeout',
        '   - Add 2FA for admin accounts',
        '   - Test for auth bypass vulnerabilities',
        '2. API Security:',
        '   - Validate all inputs',
        '   - Prevent SQL injection',
        '   - Add CSRF protection',
        '   - Implement proper CORS',
        '3. Data Protection:',
        '   - Ensure service role key not exposed',
        '   - Audit all database queries',
        '   - Check for data leaks in responses',
        '   - Implement audit logging',
        '4. Infrastructure Security:',
        '   - Enable HTTPS only',
        '   - Set security headers',
        '   - Configure CSP policy',
        '   - Set up DDoS protection',
        '5. Access Control:',
        '   - Test role-based permissions',
        '   - Verify admin-only routes protected',
        '   - Audit user management features',
        '   - Test with different user roles'
      ],
      tools: [
        'Security scanner tools',
        'Penetration testing',
        'Browser dev tools'
      ],
      tips: [
        'Test with security mindset',
        'Try to break authentication',
        'Check for exposed secrets',
        'Monitor for suspicious activity'
      ],
      deliverables: [
        'Security audit complete',
        'All vulnerabilities fixed',
        'Authentication hardened',
        'Monitoring configured'
      ]
    }
  }
];

export default function LaunchChecklistPage() {
  const [checklist, setChecklist] = useState(launchChecklist);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['App Store', 'Backend', 'Security', 'Revenue', 'Launch Prep', 'Admin Dashboard']);
  const [filter, setFilter] = useState<'all' | 'critical' | 'incomplete'>('incomplete');
  const [expandedDetails, setExpandedDetails] = useState<string[]>([]);

  const categories = [...new Set(checklist.map(item => item.category))].sort();
  
  const getProgress = () => {
    const completed = checklist.filter(item => item.status === 'completed').length;
    return Math.round((completed / checklist.length) * 100);
  };

  const getCriticalProgress = () => {
    const criticalItems = checklist.filter(item => item.priority === 'critical');
    const completedCritical = criticalItems.filter(item => item.status === 'completed').length;
    return Math.round((completedCritical / criticalItems.length) * 100);
  };

  const getDaysToLaunch = () => {
    // More sophisticated estimate based on task priorities and time
    const incompleteTasks = checklist.filter(item => item.status !== 'completed');
    const criticalDays = incompleteTasks
      .filter(item => item.priority === 'critical')
      .reduce((acc, item) => {
        if (item.estimatedTime?.includes('day')) {
          const days = parseInt(item.estimatedTime) || 3;
          return acc + days;
        }
        return acc + 0.5; // Half day for hour tasks
      }, 0);
    
    const highPriorityDays = incompleteTasks
      .filter(item => item.priority === 'high')
      .length * 0.25; // Can be done in parallel
    
    return Math.ceil(Math.max(criticalDays, 7) + highPriorityDays);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'App Store': Smartphone,
      'Backend': Settings,
      'Revenue': DollarSign,
      'Security': Shield,
      'Legal': FileCheck,
      'Monitoring': Activity,
      'Testing': Target,
      'Marketing': TrendingUp,
      'Support': Heart,
      'Communications': MessageSquare,
      'Launch Prep': Rocket,
      'Admin Dashboard': BarChart3
    };
    return icons[category] || Circle;
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleDetails = (itemId: string) => {
    setExpandedDetails(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const updateItemStatus = (itemId: string, status: ChecklistItem['status']) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              status,
              completedDate: status === 'completed' ? new Date() : undefined
            }
          : item
      )
    );
  };

  const filteredChecklist = checklist.filter(item => {
    if (filter === 'critical') return item.priority === 'critical';
    if (filter === 'incomplete') return item.status !== 'completed';
    return true;
  });

  const getStatusIcon = (status: ChecklistItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-warning animate-pulse" />;
      default:
        return <Circle className="h-5 w-5 text-white/40" />;
    }
  };

  const getPriorityColor = (priority: ChecklistItem['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-destructive';
      case 'high':
        return 'text-warning';
      case 'medium':
        return 'text-primary';
      default:
        return 'text-white/60';
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <PageHeader
          title="Launch Checklist"
          subtitle="Track your progress towards launch"
          actions={
            <div className="flex items-center gap-3">
              <StatusBadge 
                status={`${getDaysToLaunch()} days to launch`} 
                variant="warning" 
              />
              <Button variant="primary">
                <Rocket className="mr-2 h-4 w-4" />
                Launch Status Report
              </Button>
            </div>
          }
        />

        {/* Launch Progress Milestones */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Launch Progress Milestones
              </h3>
              <span className="text-sm text-white/60">{getProgress()}% Complete</span>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-1 bg-white/10 rounded-full" />
                <div 
                  className="absolute h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
              <div className="relative flex justify-between">
                {[
                  { label: 'Development', percent: 90, icon: Settings },
                  { label: 'Testing', percent: 60, icon: Target },
                  { label: 'Legal', percent: 40, icon: FileCheck },
                  { label: 'App Store', percent: 15, icon: Smartphone },
                  { label: 'Launch', percent: 8, icon: Rocket }
                ].map((milestone, index) => {
                  const MilestoneIcon = milestone.icon;
                  const isCompleted = getProgress() >= milestone.percent;
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                        ${isCompleted 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-110' 
                          : 'bg-white/10 border border-white/20'}
                      `}>
                        <MilestoneIcon className={`h-5 w-5 ${isCompleted ? 'text-white' : 'text-white/40'}`} />
                      </div>
                      <span className={`text-xs mt-2 ${isCompleted ? 'text-white' : 'text-white/40'}`}>
                        {milestone.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="h-8 w-8 text-primary/40" />
                <span className="text-2xl font-light text-white">{getProgress()}%</span>
              </div>
              <p className="text-sm text-white/60">Overall Progress</p>
              <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <AlertCircle className="h-8 w-8 text-destructive/40" />
                <span className="text-2xl font-light text-white">{getCriticalProgress()}%</span>
              </div>
              <p className="text-sm text-white/60">Critical Items</p>
              <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${getCriticalProgress()}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="h-8 w-8 text-warning/40" />
                <span className="text-2xl font-light text-white">
                  {checklist.filter(item => item.status === 'in-progress').length}
                </span>
              </div>
              <p className="text-sm text-white/60">In Progress</p>
              <p className="text-xs text-white/40 mt-2">Active tasks</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="h-8 w-8 text-success/40" />
                <span className="text-2xl font-light text-white">
                  {checklist.filter(item => item.status === 'completed').length}/{checklist.length}
                </span>
              </div>
              <p className="text-sm text-white/60">Completed</p>
              <p className="text-xs text-white/40 mt-2">Total tasks</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Tasks
          </Button>
          <Button
            variant={filter === 'critical' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('critical')}
          >
            Critical Only
          </Button>
          <Button
            variant={filter === 'incomplete' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('incomplete')}
          >
            Incomplete
          </Button>
        </div>

        {/* Checklist by Category */}
        <div className="space-y-4">
          {categories.map(category => {
            const categoryItems = filteredChecklist.filter(item => item.category === category);
            if (categoryItems.length === 0) return null;

            const isExpanded = expandedCategories.includes(category);
            const completedCount = categoryItems.filter(item => item.status === 'completed').length;

            const CategoryIcon = getCategoryIcon(category);
            
            return (
              <Card key={category}>
                <CardHeader 
                  className="cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-white/60" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-white/60" />
                      )}
                      <CategoryIcon className="h-5 w-5 text-primary/60" />
                      <h3 className="text-lg font-medium text-white">{category}</h3>
                      <span className="text-sm text-white/60">
                        {completedCount}/{categoryItems.length} completed
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/40">
                        {Math.round((completedCount / categoryItems.length) * 100)}%
                      </span>
                      <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                          style={{ width: `${(completedCount / categoryItems.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent>
                    <div className="space-y-3">
                      {categoryItems.map(item => (
                        <div 
                          key={item.id}
                          className="rounded-lg bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
                        >
                          <div className="flex items-start gap-4 p-4">
                            <button
                              onClick={() => {
                                const nextStatus = 
                                  item.status === 'not-started' ? 'in-progress' :
                                  item.status === 'in-progress' ? 'completed' : 
                                  'not-started';
                                updateItemStatus(item.id, nextStatus);
                              }}
                              className="mt-0.5"
                            >
                              {getStatusIcon(item.status)}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className={`font-medium ${
                                    item.status === 'completed' ? 'text-white/60 line-through' : 'text-white'
                                  }`}>
                                    {item.title}
                                  </p>
                                  <p className="text-sm text-white/60 mt-1">{item.description}</p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <span className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                                      {item.priority.toUpperCase()}
                                    </span>
                                    {item.estimatedTime && item.status !== 'completed' && (
                                      <span className="text-xs text-white/40">
                                        Est: {item.estimatedTime}
                                      </span>
                                    )}
                                    {item.completedDate && (
                                      <span className="text-xs text-success">
                                        Completed {item.completedDate.toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {item.details && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="ml-4"
                                    onClick={() => toggleDetails(item.id)}
                                  >
                                    <ChevronDown className={`h-4 w-4 transition-transform ${
                                      expandedDetails.includes(item.id) ? 'rotate-180' : ''
                                    }`} />
                                    Details
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Detailed Instructions */}
                          {item.details && expandedDetails.includes(item.id) && (
                            <div className="px-4 pb-4 border-t border-white/[0.06] mt-2">
                              <div className="mt-4 space-y-4">
                                {/* Steps */}
                                <div>
                                  <h5 className="text-sm font-medium text-white mb-2">Step-by-Step Instructions</h5>
                                  <div className="space-y-1">
                                    {item.details.steps.map((step, index) => (
                                      <p key={index} className="text-sm text-white/80 leading-relaxed">
                                        {step}
                                      </p>
                                    ))}
                                  </div>
                                </div>

                                {/* Tools */}
                                {item.details.tools && (
                                  <div>
                                    <h5 className="text-sm font-medium text-white mb-2">Required Tools</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {item.details.tools.map((tool, index) => (
                                        <span key={index} className="px-3 py-1 bg-white/[0.06] rounded-full text-xs text-white/80">
                                          {tool}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Tips */}
                                {item.details.tips && (
                                  <div>
                                    <h5 className="text-sm font-medium text-white mb-2">Pro Tips</h5>
                                    <ul className="space-y-1">
                                      {item.details.tips.map((tip, index) => (
                                        <li key={index} className="text-sm text-white/70 flex items-start gap-2">
                                          <span className="text-primary mt-1">•</span>
                                          <span>{tip}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Deliverables */}
                                {item.details.deliverables && (
                                  <div>
                                    <h5 className="text-sm font-medium text-white mb-2">Deliverables</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                      {item.details.deliverables.map((deliverable, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                          <CheckCircle className="h-3 w-3 text-success/60" />
                                          <span className="text-sm text-white/70">{deliverable}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Launch Readiness Summary */}
        <Card className="mt-8 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Rocket className="h-6 w-6 text-primary animate-pulse" />
                <h3 className="text-xl font-medium text-white">Launch Readiness Report</h3>
              </div>
              <StatusBadge 
                status={getProgress() >= 90 ? "Ready to Launch" : getProgress() >= 70 ? "Almost Ready" : "In Progress"} 
                variant={getProgress() >= 90 ? "success" : getProgress() >= 70 ? "warning" : "default"} 
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Critical Systems Status */}
            <div>
              <h4 className="text-sm font-medium text-white mb-4">Critical Systems Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="h-5 w-5 text-white/60" />
                    {checklist.filter(i => i.category === 'Security' && i.status === 'completed').length === 
                     checklist.filter(i => i.category === 'Security').length ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-warning" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-white">Security</p>
                  <p className="text-xs text-white/60 mt-1">
                    {checklist.filter(i => i.category === 'Security' && i.status === 'completed').length}/
                    {checklist.filter(i => i.category === 'Security').length} tasks complete
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="h-5 w-5 text-white/60" />
                    {checklist.filter(i => i.category === 'Revenue' && i.status === 'completed').length === 
                     checklist.filter(i => i.category === 'Revenue').length ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-white">Payments</p>
                  <p className="text-xs text-white/60 mt-1">RevenueCat ready, IAPs pending</p>
                </div>

                <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <Smartphone className="h-5 w-5 text-white/60" />
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  </div>
                  <p className="text-sm font-medium text-white">App Stores</p>
                  <p className="text-xs text-white/60 mt-1">Submissions pending</p>
                </div>

                <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <Globe className="h-5 w-5 text-white/60" />
                    <Clock className="h-4 w-4 text-yellow-500" />
                  </div>
                  <p className="text-sm font-medium text-white">Infrastructure</p>
                  <p className="text-xs text-white/60 mt-1">Production setup needed</p>
                </div>
              </div>
            </div>

            {/* Launch Timeline */}
            <div>
              <h4 className="text-sm font-medium text-white mb-4">Estimated Launch Timeline</h4>
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-white/60">Based on current progress and task estimates</p>
                  <Clock className="h-5 w-5 text-primary/60" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-light text-white">{getDaysToLaunch()}</p>
                    <p className="text-sm text-white/60">Days to launch</p>
                  </div>
                  <div>
                    <p className="text-2xl font-light text-white">
                      {checklist.filter(i => i.priority === 'critical' && i.status !== 'completed').length}
                    </p>
                    <p className="text-sm text-white/60">Critical tasks remaining</p>
                  </div>
                  <div>
                    <p className="text-2xl font-light text-white">
                      {new Date(Date.now() + getDaysToLaunch() * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-white/60">Target launch date</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div>
              <h4 className="text-sm font-medium text-white mb-4">Next Action Items</h4>
              <div className="space-y-2">
                {checklist
                  .filter(item => item.priority === 'critical' && item.status !== 'completed')
                  .slice(0, 5)
                  .map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03]">
                      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-white">{item.title}</p>
                        <p className="text-xs text-white/60">{item.category} • {item.estimatedTime}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Launch Checklist Download */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <p className="text-sm text-white/60">
                Remember: A successful launch is a marathon, not a sprint. Take time to get it right!
              </p>
              <Button variant="primary" size="sm">
                <FileCheck className="mr-2 h-4 w-4" />
                Export Checklist
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 