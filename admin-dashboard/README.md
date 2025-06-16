# NixR Admin Dashboard 🧠

## Overview

The NixR Admin Dashboard is the "Central Brain" for managing the entire NixR nicotine recovery platform. Built with modern web technologies, it provides AI-powered insights and comprehensive management tools.

## Tech Stack

- **Framework**: Next.js 15.3.3 with Turbopack
- **Styling**: Tailwind CSS v3 (not v4)
- **Database**: Supabase
- **State Management**: React hooks
- **UI Components**: Custom glass-morphism design
- **Icons**: Lucide React

## Architecture

```
admin-dashboard/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── ai-brain/          # AI marketing insights
│   │   ├── ai-coach/          # AI coach performance
│   │   ├── analytics/         # User analytics
│   │   ├── app-control/       # Mobile app management
│   │   ├── business/          # Business intelligence
│   │   ├── marketing/         # Marketing campaigns
│   │   ├── moderation/        # Content moderation
│   │   ├── reports/           # Financial reports
│   │   ├── support/           # Customer support
│   │   ├── system/            # System health
│   │   └── users/             # User management
│   ├── components/
│   │   ├── layout/            # Layout components
│   │   └── ui/                # Reusable UI components
│   ├── lib/                   # Utilities and services
│   └── types/                 # TypeScript definitions
├── supabase/
│   └── enhanced_schema.sql    # Database schema
└── public/                    # Static assets
```

## Key Features

### 1. AI Brain Dashboard
- Real-time marketing insights
- Channel performance analysis
- Budget optimization recommendations
- Predictive analytics

### 2. User Management
- Real-time user tracking
- Subscription management
- User journey analytics
- Cohort analysis

### 3. Analytics Dashboard
- Acquisition metrics
- Retention analysis
- Revenue tracking
- A/B test results

### 4. AI Coach Management
- Performance monitoring
- A/B testing interface
- User satisfaction metrics
- Conversation analytics

### 5. Business Intelligence
- Financial forecasting
- LTV predictions
- Market analysis
- Competitor insights

## Design System

### Colors
```css
- Background: #000000 → #0A0F1C → #0F172A (gradient)
- Primary: #C084FC (purple)
- Secondary: #06B6D4 (cyan)
- Success: #22C55E (green)
- Warning: #F59E0B (amber)
- Destructive: #EF4444 (red)
```

### Glass Morphism
All cards use a subtle glass effect:
```css
background: rgba(255, 255, 255, 0.03)
backdrop-filter: blur(12px)
border: 1px solid rgba(255, 255, 255, 0.08)
```

## Environment Setup

Create `.env.local` in the admin-dashboard directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Analytics
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
```

## Getting Started

```bash
cd admin-dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Code Quality Standards

- **File Size**: All files < 800 lines (most < 500)
- **Components**: Single responsibility principle
- **Types**: Full TypeScript coverage
- **Styling**: Tailwind utilities only
- **Performance**: Optimized re-renders

## API Integration

The dashboard uses a service-oriented architecture:

```typescript
// Example service
import { supabase } from '@/lib/supabase';

export const userService = {
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
```

## Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Docker
```bash
docker build -t nixr-admin .
docker run -p 3000:3000 nixr-admin
```

## Security

- Service role key only on server
- Row Level Security (RLS) enabled
- Admin authentication required
- API rate limiting

## Future Enhancements

1. **Real-time Updates**: WebSocket integration
2. **Advanced Analytics**: Custom SQL queries
3. **Export Features**: CSV/PDF reports
4. **Mobile App**: Admin mobile app
5. **Notifications**: Slack/Discord integration

## Contributing

1. Keep files under 500 lines
2. Use TypeScript strictly
3. Follow the design system
4. Write descriptive commits
5. Test before pushing

## Support

For issues or questions:
- Create an issue in the repository
- Contact the development team

---

Built with ❤️ for the NixR recovery community
