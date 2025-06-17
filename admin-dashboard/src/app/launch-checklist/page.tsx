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
    dependencies: ['app-final-build']
  },
  {
    id: '3',
    title: 'App Store Preview Video',
    description: 'Create 30-second app preview video showing key features',
    category: 'App Store',
    priority: 'high',
    status: 'not-started',
    estimatedTime: '2 days'
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
    estimatedTime: '3-7 days review'
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
    estimatedTime: '1 day'
  },
  {
    id: '8',
    title: 'Google Play Submission',
    description: 'Submit app to Google Play with content rating',
    category: 'App Store',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '2-3 days review'
  },

  // ========== BACKEND & INFRASTRUCTURE ==========
  {
    id: '9',
    title: 'Production Environment Setup',
    description: 'Create production Supabase project with proper tier',
    category: 'Backend',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '2 hours'
  },
  {
    id: '10',
    title: 'Database Migration & Seeding',
    description: 'Migrate schema and seed initial data to production',
    category: 'Backend',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '4 hours',
    dependencies: ['production-env']
  },
  {
    id: '11',
    title: 'Environment Variables',
    description: 'Set all production environment variables for mobile and admin apps',
    category: 'Backend',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '1 hour'
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
    estimatedTime: '2 hours'
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
    estimatedTime: '2 hours'
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
    estimatedTime: '1 day'
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
    status: 'not-started',
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
    status: 'not-started',
    estimatedTime: '4 hours'
  },

  // ========== TESTING & QA ==========
  {
    id: '34',
    title: 'Device Testing Matrix',
    description: 'Test on iPhone 12-16, various Android devices',
    category: 'Testing',
    priority: 'critical',
    status: 'not-started',
    estimatedTime: '2 days'
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

  // ========== MARKETING & LAUNCH ==========
  {
    id: '39',
    title: 'Marketing Website',
    description: 'Deploy nixr.com with SSL',
    category: 'Marketing',
    priority: 'high',
    status: 'in-progress',
    estimatedTime: '1 day'
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
  }
];

export default function LaunchChecklistPage() {
  const [checklist, setChecklist] = useState(launchChecklist);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['App Store', 'Backend', 'Security', 'Revenue', 'Launch Prep']);
  const [filter, setFilter] = useState<'all' | 'critical' | 'incomplete'>('incomplete');

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
      'Launch Prep': Rocket
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
                          className="flex items-start gap-4 p-4 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
                        >
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
                              <div>
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
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="ml-4"
                              >
                                Details
                              </Button>
                            </div>
                          </div>
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