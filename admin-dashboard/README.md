# NixR Admin Dashboard

A comprehensive admin dashboard for managing the NixR recovery platform, built with Next.js 15.3.3, TypeScript, and Tailwind CSS v3.

## Overview

The NixR Admin Dashboard serves as the central management system for AI and human operators to monitor, analyze, and support users on their recovery journey. It provides real-time insights, user management, AI coach monitoring, and business intelligence tools.

## Features

### 🏠 Dashboard
- Real-time user metrics and recovery statistics
- User growth and retention charts
- Feature adoption tracking
- Platform distribution analysis
- Quick access to key actions

### 👥 User Management
- Comprehensive user directory with recovery-specific data
- Track days clean, journal streaks, and engagement
- Risk level monitoring (low, medium, high, critical)
- User search and filtering
- Support for different user tiers (free, premium, enterprise)

### 🤖 AI Coach Management
- Monitor AI support sessions and effectiveness
- Track crisis interventions and response times
- Conversation topic analysis with sentiment tracking
- Compare AI model performance (Empathetic vs Motivational)
- Real-time crisis protocol monitoring

### 📊 Recovery Analytics
- Recovery journey funnel analysis
- Sobriety retention cohorts
- Trigger pattern analysis by time of day
- Recovery tool effectiveness metrics
- Substance distribution insights

### 💼 Business Intelligence
- Social impact metrics (lives touched, relapses prevented)
- Unit economics with recovery-specific KPIs
- Revenue projections tied to recovery outcomes
- Recovery market positioning
- Partnership channel performance

### 🛍️ Marketing
- Campaign performance tracking
- Content analytics
- Social media metrics
- Conversion optimization
- Recovery-focused messaging insights

### 🎮 App Control
- Feature flag management
- Remote configuration
- A/B test management
- App version deployment tracking

### 🎫 Support Center
- Ticket management with recovery-specific categories
- AI-assisted responses
- Response templates
- User communication tools
- Priority handling for crisis situations

### 🛡️ Moderation
- AI-powered content flagging
- Review queue management
- Ban/suspension management
- Report trend analysis
- Community safety metrics

### 🖥️ System Monitoring
- Infrastructure health dashboard
- API performance metrics
- Error tracking and analysis
- Cost monitoring
- Service status tracking

### 📈 Reports
- Scheduled report generation
- Custom report templates
- Investor dashboard
- Data export functionality

## Data Architecture

### Recovery-Specific Data Types

The dashboard is built with a comprehensive type system that reflects the unique needs of a recovery platform:

#### User Data
- **Recovery Information**: Sobriety date, days clean, primary/secondary substances
- **Engagement Metrics**: Journal streak, community posts, buddy connections
- **Risk Assessment**: Dynamic risk level calculation based on multiple factors
- **Subscription**: Tier management (free, premium, enterprise)

#### Substance Types
- Alcohol, Opioids, Stimulants, Cannabis, Nicotine, Gambling, Other

#### Mood Tracking
- Excellent, Good, Neutral, Struggling, Crisis

#### Support Categories
- Technical, Billing, Recovery Support, Feature Request, Account, Other

### Database Schema

A complete PostgreSQL schema is provided in `src/lib/database-schema.sql` for Supabase implementation. Key features:

- **Comprehensive Tables**: Users, journal entries, community posts, AI sessions, support tickets, metrics
- **Enum Types**: All status types, categories, and classifications
- **Row Level Security**: Built-in RLS policies for user data protection
- **Performance Indexes**: Optimized for common query patterns
- **Trigger Functions**: Automatic engagement tracking and risk level calculations
- **Calculated Fields**: Auto-computed days clean and other metrics

## Tech Stack

- **Framework**: Next.js 15.3.3 with TypeScript
- **Styling**: Tailwind CSS v3 (not v4)
- **UI Components**: Custom glass morphism design system
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Database**: Designed for Supabase (PostgreSQL)

## Design System

### Color Palette
- **Background Gradient**: `#000000` → `#0A0F1C` → `#0F172A`
- **Primary (Purple)**: `#C084FC` and variations
- **Success (Green)**: `#22C55E`
- **Warning (Yellow)**: `#F59E0B`
- **Destructive (Red)**: `#EF4444`

### Typography
- Font weights: 300-500 only
- White opacity variations for text hierarchy
- Minimal, clean aesthetic

### Components
- Glass morphism cards with subtle borders
- Custom button variants (primary, secondary, ghost, destructive, success, warning)
- Responsive data tables
- Interactive charts and visualizations

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
cd admin-dashboard
npm install
```

### Development
```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## Project Structure

```
admin-dashboard/
├── src/
│   ├── app/              # Next.js app directory pages
│   ├── components/       # Reusable UI components
│   ├── lib/             # Utilities, API config, formatters
│   ├── types/           # TypeScript type definitions
│   └── styles/          # Global styles
├── public/              # Static assets
└── package.json         # Dependencies and scripts
```

## API Integration

The dashboard includes API configuration in `src/lib/api.ts` with endpoints for:
- User management
- Analytics data
- AI coach metrics
- Support tickets
- System health
- Business metrics

All data is currently mocked for demonstration. Engineers can replace mock data with real Supabase queries.

## Mock Data

Comprehensive mock data generators are provided in `src/lib/mockData.ts` for:
- User profiles with recovery-specific fields
- Journal entries with mood and triggers
- Community posts with moderation status
- AI coach sessions with sentiment analysis
- Support tickets with priority levels
- Analytics and business metrics

## Security Considerations

- Row Level Security policies included in database schema
- Admin role separation for sensitive operations
- User data isolation by default
- Audit logging capabilities built into schema

## Performance Optimizations

- Database indexes on frequently queried fields
- Efficient data aggregation functions
- Lazy loading for large datasets
- Optimized chart rendering
- Minimal bundle size with tree shaking

## Future Enhancements

1. Real-time data updates with Supabase subscriptions
2. Advanced analytics with machine learning insights
3. Mobile app dashboard companion
4. White-label customization options
5. Integration with third-party recovery resources
6. Advanced reporting and export features

## Support

For questions or issues, please contact the NixR development team.

---

Built with ❤️ for the recovery community
