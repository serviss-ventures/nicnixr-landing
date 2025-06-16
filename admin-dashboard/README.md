# NixR Admin Dashboard

A comprehensive admin dashboard for managing the NixR recovery platform. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### 📊 Analytics & Insights
- **User Analytics**: Deep insights into user behavior, engagement patterns, and retention metrics
- **Cohort Analysis**: Track user retention across different time periods
- **Funnel Visualization**: Monitor user journey from signup to long-term retention
- **Behavioral Heatmaps**: Understand when and how users engage with features

### 💼 Business Intelligence
- **Revenue Tracking**: MRR, growth trends, and financial projections
- **Unit Economics**: CAC, LTV, payback period, and other key metrics
- **Market Analysis**: Competitive positioning and market share tracking
- **Investor Dashboard**: Ready-to-share metrics and reports for stakeholders

### 🎯 Marketing Tools
- **Campaign Performance**: Track ROI across all marketing channels
- **Content Analytics**: Monitor content engagement and virality
- **Social Media Growth**: Cross-platform follower and engagement tracking
- **Conversion Optimization**: A/B testing insights and funnel analysis

### 🤖 AI Coach Management
- **Performance Monitoring**: Track AI response times and quality
- **A/B Testing**: Experiment with different AI behaviors
- **Conversation Analysis**: Review and improve AI interactions
- **Feedback Loop**: Integrate user feedback to improve AI responses

### 🛡️ Content Moderation
- **Automated Detection**: AI-powered content flagging system
- **Review Queue**: Efficient workflow for content moderation
- **User Reports**: Handle community-reported content
- **Ban Management**: Track and manage user violations

### 🎛️ App Control Center
- **Feature Flags**: Toggle features on/off without deployments
- **Remote Config**: Update app behavior in real-time
- **A/B Testing**: Run experiments across user segments
- **Deployment Management**: Monitor app versions and rollouts

### 💬 Support System
- **Ticket Management**: Track and resolve user issues efficiently
- **Automated Responses**: AI-powered initial responses
- **Template Library**: Quick responses for common issues
- **User Communication**: Direct messaging with users

### 🖥️ System Monitoring
- **Infrastructure Health**: Real-time system status monitoring
- **API Performance**: Track endpoint response times and errors
- **Cost Analysis**: Monitor and optimize infrastructure spending
- **Error Tracking**: Identify and resolve issues quickly

### 📈 Automated Reporting
- **Scheduled Reports**: Automated investor and team updates
- **Custom Templates**: Build reports for different audiences
- **Export Options**: PDF, Excel, and CSV exports
- **Report History**: Access all previously generated reports

## Tech Stack

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Hooks
- **API Integration**: REST API with fetch

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Navigate to the admin dashboard directory:
```bash
cd admin-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
admin-dashboard/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── analytics/       # Analytics dashboard
│   │   ├── business/        # Business intelligence
│   │   ├── marketing/       # Marketing dashboard
│   │   ├── ai-coach/        # AI coach management
│   │   ├── support/         # Support system
│   │   ├── moderation/      # Content moderation
│   │   ├── app-control/     # Feature flags & config
│   │   ├── system/          # System monitoring
│   │   └── reports/         # Reporting system
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI components
│   │   └── layout/         # Layout components
│   └── lib/                # Utility functions
│       ├── api.ts          # API configuration
│       ├── constants.ts    # App constants
│       └── utils.ts        # Helper functions
├── public/                 # Static assets
└── ...config files
```

## Key Features Implementation

### Real-time Updates
The dashboard uses polling for real-time data updates. Configure refresh intervals in `lib/constants.ts`.

### Data Visualization
Charts are built with Recharts for responsive, interactive visualizations.

### Dark Theme
The entire dashboard uses a dark theme optimized for extended viewing sessions.

### Responsive Design
All pages are fully responsive and work on desktop, tablet, and mobile devices.

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Ensure all required environment variables are set in production:
- `NEXT_PUBLIC_API_URL`: Your API endpoint
- `NEXTAUTH_SECRET`: Authentication secret
- Database credentials
- Third-party service keys

## Security

- All admin routes should be protected with authentication
- Implement role-based access control (RBAC)
- Use HTTPS in production
- Sanitize all user inputs
- Implement rate limiting on API endpoints

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - NixR © 2024
