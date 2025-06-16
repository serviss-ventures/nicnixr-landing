# NixR Admin Dashboard - Central Brain

## Overview

This is the admin dashboard for the NixR recovery platform. It serves as the "Central Brain" for managing users, monitoring AI performance, analyzing metrics, and controlling the overall system.

## Features Built

### 🏠 Main Dashboard
- Real-time metrics (active users, success rate, days saved)
- User growth visualization
- Retention curves
- Feature adoption analytics
- Platform distribution (iOS vs Android)
- System alerts and warnings
- Recent support tickets
- AI Coach performance status

### 👥 User Management
- Comprehensive user directory with search
- User progress tracking
- Activity monitoring
- Platform breakdown
- Quick actions (view profile, message, more options)
- Export functionality

### 🤖 AI Coach Management
- Performance metrics (response time, satisfaction)
- A/B testing interface
- Recent conversation monitoring
- Sentiment analysis
- Flagged response tracking

### 🎨 Design System
- Dark theme matching the NixR mobile app aesthetic
- Glass morphism effects
- Gradient backgrounds: `#000000` → `#0A0F1C` → `#0F172A`
- Primary color: `#C084FC` (purple)
- Success color: `#22C55E` (green)
- Warning color: `#F59E0B` (amber)
- Minimalist typography (font weights 300-500)

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **UI Components**: Custom glass morphism components

## Getting Started

1. Navigate to the admin dashboard:
   ```bash
   cd admin-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Pages Created

- `/` - Main dashboard with key metrics and visualizations
- `/users` - User management and directory
- `/ai-coach` - AI Coach performance and management
- `/analytics` - (Placeholder)
- `/support` - (Placeholder)
- `/moderation` - (Placeholder)
- `/business` - (Placeholder)
- `/system` - (Placeholder)
- `/app-control` - (Placeholder)
- `/reports` - (Placeholder)
- `/marketing` - (Placeholder)

## Next Steps

To connect this to your backend:

1. Replace mock data with real Supabase queries
2. Implement authentication (admin login)
3. Add real-time updates using Supabase subscriptions
4. Connect AI Coach metrics to your AI service
5. Implement user actions (ban, message, etc.)
6. Add export functionality
7. Set up role-based access control

## Design Philosophy

The admin dashboard follows the same minimalist, dark aesthetic as the NixR mobile app:
- Clean, uncluttered interface
- Subtle animations and transitions
- Focus on data visualization
- Glass morphism for depth
- High contrast for readability

This creates a cohesive experience across all NixR platforms while providing powerful tools for managing the recovery platform.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
