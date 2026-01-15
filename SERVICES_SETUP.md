# Services Integration Guide

## Active Services

### Sentry (Error Monitoring)
- **Status**: Configured and operational
- **DSN**: Set via SENTRY_DSN environment variable
- **Features**: Frontend/backend error tracking, user context, performance monitoring

### Klaviyo (Email Marketing)
- **Status**: Configured
- **API Keys**: KLAVIYO_PRIVATE_API_KEY, KLAVIYO_PUBLIC_API_KEY
- **Events Tracked**: User signup, gig reminders, payment reminders

### SendGrid (Transactional Email)
- **Status**: Configured
- **API Key**: SENDGRID_API_KEY
- **Used For**: Password reset emails

### RevenueCat (Subscriptions)
- **Status**: Integrated but dormant (FREE v1.0 launch)
- **API Key**: REVENUECAT_API_KEY
- **Pricing**: $5/month or $50/year with 7-day trial
- **Enable After Approval**: Add VITE_REVENUECAT_IOS_KEY and VITE_ENABLE_SUBSCRIPTIONS

## Database
- **Provider**: Neon PostgreSQL (via Replit)
- **ORM**: Drizzle
- **Migrations**: Use `npm run db:push` (never write raw SQL migrations)

## Monitoring
- **Health Check**: `/api/health` endpoint for UptimeRobot
- **Sentry**: Real-time error alerts and performance tracking

## Environment Variables Required

### Secrets (User Must Provide)
- DATABASE_URL
- SENTRY_DSN
- KLAVIYO_PRIVATE_API_KEY
- KLAVIYO_PUBLIC_API_KEY
- SENDGRID_API_KEY
- REVENUECAT_API_KEY
- REVENUECAT_WEBHOOK_SECRET

### Feature Flags
- VITE_ENABLE_SUBSCRIPTIONS: Enable subscription UI (post-approval)
- VITE_REVENUECAT_IOS_KEY: iOS RevenueCat key (post-approval)
