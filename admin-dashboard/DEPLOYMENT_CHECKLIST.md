# Admin Dashboard Deployment Checklist

## Pre-Deployment Requirements

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations
- [ ] `NEXT_PUBLIC_MOBILE_API_KEY` - API key for mobile app integration (optional)
- [ ] `OPENAI_API_KEY` - For AI Coach functionality

### Database Setup
- [ ] Run all migrations in order:
  ```bash
  01_initial_schema.sql
  02_auth_triggers.sql
  03_journal_entries_fix.sql
  04_onboarding_analytics.sql
  05_onboarding_funnel_rpc_clean.sql
  06_achievements_tables.sql
  07_buddy_system_tables.sql
  08_community_tables.sql
  09_monitoring_tables.sql
  10_ai_coach_tables.sql
  11_admin_users_separation_simple.sql
  ```

### Authentication
- [ ] Update simple auth to proper authentication system
- [ ] Configure admin user roles and permissions
- [ ] Set up 2FA for admin accounts
- [ ] Configure session management

## Deployment Steps

### 1. Build Configuration
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test the build locally
npm run start
```

### 2. Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 3. Environment Configuration
- [ ] Add all environment variables in Vercel dashboard
- [ ] Configure custom domain
- [ ] Set up SSL certificates
- [ ] Configure CORS for mobile app

### 4. Post-Deployment Testing

#### Core Features
- [ ] Login functionality
- [ ] Dashboard metrics loading
- [ ] User management
- [ ] AI Coach chat
- [ ] Analytics data display
- [ ] Monitoring system
- [ ] Mobile app logs

#### API Endpoints
- [ ] `/api/health` - Health check
- [ ] `/api/monitoring` - System monitoring
- [ ] `/api/analytics` - Analytics data
- [ ] `/api/ai-coach/chat` - AI chat functionality
- [ ] `/api/mobile/logs` - Mobile app logs
- [ ] `/api/mobile/stats` - Mobile statistics

#### Security
- [ ] Test authentication flow
- [ ] Verify API key protection
- [ ] Check CORS configuration
- [ ] Test rate limiting

## Production Configuration

### Performance Optimization
- [ ] Enable caching headers
- [ ] Configure CDN for static assets
- [ ] Set up database connection pooling
- [ ] Enable compression

### Monitoring Setup
- [ ] Configure error tracking (Sentry)
- [ ] Set up uptime monitoring
- [ ] Configure performance monitoring
- [ ] Enable real user monitoring (RUM)

### Backup Strategy
- [ ] Database backup schedule
- [ ] Backup retention policy
- [ ] Disaster recovery plan
- [ ] Test restore procedures

## Security Checklist

### Application Security
- [ ] Remove all console.log statements
- [ ] Disable source maps in production
- [ ] Configure security headers
- [ ] Enable HTTPS only
- [ ] Set up CSP (Content Security Policy)

### API Security
- [ ] Rate limiting on all endpoints
- [ ] Input validation
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF protection

### Access Control
- [ ] Admin-only middleware
- [ ] Role-based permissions
- [ ] Audit logging
- [ ] Session timeout

## Maintenance Mode

### During Deployment
- [ ] Enable maintenance page
- [ ] Notify users of downtime
- [ ] Disable write operations
- [ ] Queue background jobs

### Post-Deployment
- [ ] Verify all services are running
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Test critical user flows

## Rollback Plan

### If Issues Occur
1. Revert to previous deployment
2. Restore database from backup
3. Clear CDN cache
4. Notify team of rollback
5. Investigate root cause

### Rollback Commands
```bash
# Vercel rollback
vercel rollback

# Database rollback (example)
psql -h your-db-host -U postgres -d your-db-name < backup.sql
```

## Go-Live Checklist

### Final Checks
- [ ] All tests passing
- [ ] No critical bugs in production
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Documentation updated

### Communication
- [ ] Notify development team
- [ ] Update status page
- [ ] Prepare incident response team
- [ ] Customer support briefed

### Post-Launch Monitoring (First 24 Hours)
- [ ] Monitor error rates
- [ ] Check system resources
- [ ] Review user feedback
- [ ] Track key metrics
- [ ] Be ready for hotfixes

## Notes

### Current State
- Simple auth is temporary - needs production auth system
- Mock data will be replaced by real data when Supabase is connected
- All features are functional with graceful fallbacks

### Known Limitations
- Mobile app logs are in-memory (need database persistence)
- Some charts use static mock data
- Email notifications not implemented
- Push notifications pending

### Future Enhancements
- Real-time collaboration features
- Advanced analytics with ML
- Automated reporting
- Mobile app remote configuration 