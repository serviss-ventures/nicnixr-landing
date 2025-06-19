# NixR Admin Dashboard

A comprehensive admin dashboard for managing the NixR nicotine cessation app, built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

### 📊 Real-time Analytics
- User engagement metrics and recovery journey tracking
- Sobriety cohort analysis with retention rates
- Substance distribution breakdown
- Recovery tools effectiveness monitoring

### 🤖 AI Coach Management
- Monitor AI chat sessions and performance
- Sentiment analysis of user interactions
- A/B testing for conversation strategies
- Real-time intervention tracking

### 👥 User Management
- Comprehensive user profiles and activity tracking
- Role-based access control
- User journey visualization
- Bulk actions and exports

### 📱 Mobile App Integration
- Real-time log streaming from mobile apps
- Platform-specific error tracking
- Performance metrics and crash reports
- Remote configuration capabilities

### 🔍 System Monitoring
- Server health and performance metrics
- API endpoint monitoring
- Infrastructure cost tracking
- Automated health checks

### 📈 Business Intelligence
- Investor dashboards with key metrics
- Automated report generation
- Revenue and growth tracking
- Customizable data exports

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (optional for development)

### Installation

1. Clone the repository:
```bash
cd admin-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Default Login
- Email: `admin@nixrapp.com`
- Password: `NixrAdmin2025!`

## Project Structure

```
admin-dashboard/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # Reusable UI components
│   ├── lib/             # Utility functions and services
│   └── types/           # TypeScript type definitions
├── supabase/            # Database migrations
├── public/              # Static assets
└── docs/                # Additional documentation
```

## Key Technologies

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **AI**: OpenAI GPT-4
- **Deployment**: Vercel-ready

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking
npm run type-check
```

### Mock Data Mode

The dashboard works without any backend configuration using comprehensive mock data:
- All charts and metrics display realistic sample data
- API endpoints gracefully fallback to mock responses
- Perfect for development and demos

### Database Setup

For production use, run the migrations in order:
```bash
cd supabase
psql -U postgres -d your_database < 01_initial_schema.sql
# ... run all migrations in sequence
```

## API Integration

The dashboard provides REST APIs for mobile app integration:

- `/api/monitoring` - System monitoring data
- `/api/analytics` - User analytics and metrics
- `/api/mobile/logs` - Mobile app log ingestion
- `/api/ai-coach/chat` - AI coach interactions

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker build -t nixr-admin .
docker run -p 3000:3000 nixr-admin
```

### Manual Deployment

```bash
npm run build
npm start
```

## Security Considerations

- Simple auth is for development only
- Implement proper authentication for production
- All API endpoints should validate permissions
- Use environment variables for sensitive data
- Enable CORS appropriately for mobile app

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## Troubleshooting

### Common Issues

**Blank charts/no data**
- Check browser console for errors
- Verify API endpoints are accessible
- Clear browser cache

**Login issues**
- Ensure cookies are enabled
- Check for correct credentials
- Clear browser storage

**Performance issues**
- Disable auto-refresh on monitoring pages
- Reduce data range in analytics
- Check network tab for slow requests

## Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Monitoring System](./MONITORING_SYSTEM_DOCUMENTATION.md)
- [Architecture Overview](./ARCHITECTURE.md)

## License

Private and confidential. All rights reserved.

## Support

For issues or questions:
- Check existing documentation
- Review error logs in monitoring
- Contact the development team

---

Built with ❤️ for the NixR team
