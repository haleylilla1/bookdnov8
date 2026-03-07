# Bookd Project Context

## Overview
Bookd is a mobile-first gig worker companion app designed for financial tracking and calendar-based gig management. It aims to provide a reliable, scalable, and user-friendly solution, transitioning from a prototype to a production-ready application. Its core purpose is to help gig workers manage gigs and clients, track finances, and streamline tax-smart workflows. The project vision includes launching on the iOS App Store with subscription monetization at $5/month or $50/year, including a 7-day free trial.

## User Preferences
- Focus on mobile-first experience optimization
- Prioritize authentication reliability for user onboarding
- Maintain simple, clean interface design
- CRITICAL: Prevent authentication changes from affecting existing users' data access
- Require comprehensive testing before any authentication modifications
- PREFER SIMPLE SOLUTIONS: Choose simple, reliable implementations over complex feature-rich ones
- NEVER BUILD OVER-ENGINEERED GARBAGE: Always choose the simplest solution that works. Avoid complex abstractions, fake metrics, and unnecessary layers
- DETAILED PLANNING: User requests extremely detailed hour-by-hour breakdowns for development tasks
- PRODUCTION FOCUS: Prioritize production readiness with comprehensive testing and monitoring
- SCALING PRIORITY: User confirmed app works well currently and needs it ready for 1000 people
- THIRD-PARTY SERVICES: Open to using external services like Supabase, Redis, Cloudinary for production scaling
- PAYMENT INTEGRATION: Considering Stripe payments with either Replit Auth (MVP) or Supabase (scale phase)
- NO PHOTO/CAMERA FUNCTIONALITY: App does NOT use camera or photo library - expenses are text-only (merchant, amount, category). Only location permission needed for mileage tracking
- EXCEL EXPORT PREFERENCE: User prefers Excel-only export functionality for simplicity and tax preparation focus
- TAX PHILOSOPHY: Gig workers should pay appropriate taxes on their income during the year, then get money back through deductions at tax time. Tax estimates calculated on full taxable income, business deductions tracked separately for filing.
- FEATURE ROLLOUT CONTROL: User wants to hide new agency portal and rescue roster features from public users until ready for launch. Features remain in code but are temporarily hidden from navigation.
- EMERGENCY OPPORTUNITIES HIDDEN: Emergency BA opportunity features (Rescue Roster) are currently hidden from user interface while keeping backend functionality intact for future launch.

## System Architecture
- **Frontend**: React with TypeScript, optimized for a mobile-first experience.
- **Backend**: Express.js with Node.js and PostgreSQL.
- **UI/UX Decisions**:
    - Mobile-only, responsive design for small screens.
    - Simplified expense tracking uses text.
    - Implemented iOS-specific optimizations for keyboard behavior (auto-scroll, native done button) and touch.
    - App icon: Navy blue background with white "bookd" text and cyan checkmark accent.
- **Technical Implementations**:
    - **Performance & Scalability**: Node.js memory tracking, scalable cache system (5,000 entries with LRU eviction), 12 production-critical database indexes, Neon serverless for connection pooling, API pagination, multi-tier rate limiting, and enterprise-grade Artillery.js load testing.
    - **Data Handling**: RESTful API endpoints, normalized database tables, consistent UTC date parsing, comprehensive backup infrastructure, and user data export functionality.
    - **Authentication & Security**: Consolidated `auth.ts` with database-backed sessions, password reset, secure session management, comprehensive audit logging, input sanitization (XSS, SQL injection prevention), and advanced rate limiting. Dual-track auth: session accepted from cookie OR `Authorization: Bearer` header — `sessionId` stored in `localStorage` on login so Safari cookie-blocking users are fully supported. All API requests send the token as a header via `getAuthHeaders()` in `queryClient.ts`. Login/register use `setQueryData` for instant cache population + `invalidateQueries` for a background full-user refresh.
    - **Google OAuth**: Implemented without passport — raw fetch-based OAuth 2.0 flow. `GET /api/auth/google` redirects to Google; `GET /auth/google/callback` exchanges code for token, finds/creates user by email, creates session, redirects to `/?google_session=<id>`. `GoogleSessionHandler` in `App.tsx` picks up the param, writes to `localStorage`, reloads. Existing email accounts are automatically linked to Google on first Google login (matched by email). Google users have `passwordHash: null` and `emailVerified: true`. Redirect URI registered in Google Console: `https://app.bookd.tools/auth/google/callback`.
    - **Core Features**:
        - **Mileage System**: Streamlined service with intelligent fallback and Google Maps API integration.
        - **"Got Paid" Workflow**: Tracks income and expenses, calculates actual pay and business deductions (including IRS standard mileage rate), supports multi-day gig payments, and handles different tax treatments (default, custom, W2).
        - **Expense Management**: Comprehensive tracking with business category classification, gig linking, mobile-optimized forms, and full CRUD functionality.
        - **First-Time User Onboarding**: 3-step setup (address, tax rate, gig types) + 4-step tooltip tour (+ FAB → $ FAB → Tax card → Download Report) + completion modal. Tour state tracked per user in localStorage (`bookd_tour_seen_<userId>`). Dashboard always renders even with zero data — no empty-state early return.
        - **Reporting**: Generates 1099 and W2 gig reports, with platform-aware download (blob for web, Capacitor Filesystem + Share for native).
    - **Monitoring & Reliability**: Real-time frontend performance tracking, Sentry integration, health check endpoints for UptimeRobot, and a robust recovery system.
    - **Production Readiness**: Complete production server setup with security headers, CORS, optimized request limits, and a clean build process.
    - **iOS Specifics**: Capacitor for native functionality and live updates, requiring `NSLocationWhenInUseUsageDescription` for mileage tracking.

## External Dependencies
- **Klaviyo**: Email marketing, user behavior tracking, and analytics.
- **SendGrid**: Transactional emails (e.g., password resets, emergency BA notifications).
- **Google Maps API**: Address autocomplete and mileage calculation (Places API, Distance Matrix API).
- **Supabase**: Database, authentication.
- **Sentry**: Error monitoring and performance tracking.
- **RevenueCat**: Subscription management and in-app purchases.
- **Capacitor**: Native mobile functionality including Filesystem and Share plugins.