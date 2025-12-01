# Bookd Project Context

## Overview
Bookd is a mobile-first gig worker companion app focused on financial tracking and calendar-based gig management. It aims to provide a reliable, scalable, and user-friendly solution for gig workers, transitioning from a prototype to a production-ready application. Key capabilities include gig and client management, financial tracking, and tax-smart workflows. The app is being prepared for iOS App Store launch using Capacitor for native functionality and RevenueCat for subscription monetization at **$5/month or $50/year with 7-day free trial**.

## Recent Changes (December 01, 2025)
### iOS Keyboard Improvements
- **Done Button Toolbar**: Added global "Done" button that appears above the iOS keyboard for all text inputs throughout the app
- **Auto-Scroll to Input**: When tapping on any input field, the screen automatically scrolls so the input is visible above the keyboard
- **Keyboard Height Detection**: Uses visualViewport API when available, with 320px fallback for WebViews and external keyboards
- **Files Changed**: 
  - `client/src/components/keyboard-toolbar.tsx` - New component with Done button and auto-scroll logic
  - `client/src/lib/ios-fixes.ts` - Consolidated zoom prevention, removed duplicate scroll handlers
  - `client/src/index.css` - Added keyboard toolbar styles, removed position:fixed from keyboard-open class
  - `client/src/App.tsx` - Integrated KeyboardToolbar globally

## Previous Changes (November 09, 2025)
### iOS App Store Submission Complete
- **iOS Build Complete**: Successfully built iOS app in Xcode 16 with iOS 18 SDK and uploaded to App Store Connect for review
- **Certificate & Provisioning**: Resolved all signing issues - manually created Distribution Certificate (Apple Distribution: Haley Lilla LX8FDT7R2G) and App Store provisioning profile
- **Bundle ID**: Changed to com.haley.bookd (com.bookd.app was already taken by another developer)
- **Xcode Compatibility**: Fixed User Script Sandboxing error by disabling sandboxing (required for CocoaPods compatibility)
- **Demo Account Created**: Successfully created demo@bookd.app account with realistic sample data for Apple Review:
  - Email: demo@bookd.app / Password: password123
  - 5 sample gigs: photographer ($500), model ($350), actor ($800), brand ambassador ($400), magician ($600 - completed)
  - 3 business expenses: gas ($45.50), supplies ($35.99), meals ($6.75)
  - Home address: 313 16th Street, Huntington Beach CA 92648
  - Default tax rate: 30%
  - Onboarding completed
- **Next Steps**: Complete App Store listing (screenshots, description, metadata) and submit for review

### Previous Updates (November 08, 2025)
#### App Store Launch Strategy - Path B: FREE v1.0
- **Launch Decision**: Submitting v1.0 as completely FREE app (no subscriptions) for faster Apple approval. RevenueCat subscriptions will be enabled POST-APPROVAL via environment variables without resubmission.
- **RevenueCat Status**: Fully integrated (90% complete) but dormant. Code present but disabled via missing secrets: VITE_REVENUECAT_IOS_KEY and VITE_ENABLE_SUBSCRIPTIONS. Subscription UI hidden behind feature flags.
- **Post-Approval Plan**: After v1.0 approval, will create In-App Purchase products ($5/month, $50/year), configure RevenueCat dashboard, and enable subscriptions by adding environment variables.
- **Legal Protection Enhanced**: Added comprehensive tax disclaimers in 3 locations (profile page, dashboard tax breakdown dialog, generated reports) clearly stating users enter own tax rates, Bookd doesn't provide tax advice, and users should consult tax professionals.
- **App Icon Complete**: User created 1024x1024px app icon (app icon_1762627406091.png in attached_assets) - navy blue background with white "bookd" text and cyan checkmark accent. Ready for Xcode.
- **iOS Build Strategy**: User chose LIVE UPDATES model - iOS app will load app.bookd.tools so all code changes in Replit go live instantly without App Store resubmission. Capacitor configured for live updates.
- **Build Environment**: User has Apple Developer account ($99/year paid). Will use someone else's Mac (can update to macOS 15.7.2) to install Xcode 16 and build iOS app. TestFlight app will be installed on user's iPhone for testing.

### Previous Updates (September 30, 2025)
- **Legal Documents Updated**: Privacy policy and terms of service updated with correct contact email (haley.bookd@gmail.com) and current subscription pricing ($5/month or $50/year with 7-day free trial). Effective date updated to September 30, 2025.
- **iOS Permissions Clarified**: Confirmed app only needs NSLocationWhenInUseUsageDescription for mileage tracking. Removed camera and photo library permissions from Info.plist requirements as app uses text-only expense tracking.
- **App Store Metadata Created**: Complete metadata ready in APP_STORE_METADATA.txt including title, subtitle, description (optimized for search), keywords, support URL (haley.bookd@gmail.com), and privacy policy URL.
- **Date Validation Bug Fixed**: Added Zod schema validation to prevent users from selecting end dates before start dates in multi-day gig form. Error displays: "End date cannot be before start date".
- **Income Report Downloads with Capacitor**: Replaced SendGrid email delivery with platform-aware download system to eliminate $20/month cost. Web browsers use blob download, iOS/Android use Capacitor Filesystem + Share plugins for native share sheet integration. Users can save HTML reports directly or print as PDF.

### Files Updated (November 08, 2025)
- `client/src/pages/profile.tsx` - Added tax disclaimer below default tax percentage slider
- `client/src/components/dashboard.tsx` - Added tax disclaimer to Tax Estimate Breakdown dialog
- `server/professional-html-generator.ts` - Enhanced legal disclaimer section in generated reports with comprehensive tax advice warnings
- `replit.md` - Updated with Path B launch strategy and legal protection enhancements

### Files Updated (September 30, 2025)
- `client/src/pages/privacy-policy.tsx` - Updated contact email and date language
- `client/src/pages/terms-of-service.tsx` - Updated contact email, pricing, and dates
- `ios-build-instructions.md` - Removed camera/photo permissions, kept only location permission
- `client/src/components/simple-gig-form.tsx` - Added date validation with .refine()
- `APP_STORE_METADATA.txt` - Created complete App Store submission metadata
- `server/routes.ts` - Added POST /api/reports/generate endpoint with Zod validation
- `client/src/components/dashboard.tsx` - Platform-aware download: blob for web, Capacitor Filesystem/Share for native
- `package.json` - Installed @capacitor/filesystem and @capacitor/share packages

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
- **UI/UX Decisions**: Mobile-only, responsive design for small screens. Simplified expense tracking uses text. Comprehensive iOS Safari zoom prevention and touch optimization are implemented.
- **Technical Implementations**:
    - **Performance & Scalability**: Real-time Node.js memory tracking, scalable cache system (5,000 entries with LRU eviction, ready for Redis integration), 12 production-critical database indexes for 1,000+ users, Neon serverless for connection pooling, API pagination with limit/offset, multi-tier rate limiting, and enterprise-grade Artillery.js load testing for 1,000+ concurrent users.
    - **Data Handling**: 41+ RESTful API endpoints, 15+ normalized database tables, consistent UTC date parsing, and comprehensive backup infrastructure with user data export functionality.
    - **Authentication & Security**: Consolidated `auth.ts` with database-backed sessions, password reset, secure session management, comprehensive audit logging, input sanitization (XSS, SQL injection prevention), and advanced rate limiting.
    - **Core Features**:
        - **Mileage System**: Streamlined service with intelligent fallback and Google Maps API integration.
        - **"Got Paid" Workflow**: Tracks income and expenses, calculates actual pay and business deductions (including IRS standard mileage rate), and supports multi-day gig payments.
        - **Expense Management**: Comprehensive tracking with business category classification, gig linking, mobile-optimized forms, and full edit/delete functionality for all expenses.
        - **First-Time User Onboarding**: 8-step flow including setup questionnaire and feature tour, saving data to user profiles.
        - **Emergency BA Email Notifications**: Automatic email notifications to agencies via SendGrid for emergency gig applications.
    - **Monitoring & Reliability**: Real-time frontend performance tracking, Sentry integration for error and performance monitoring, health check endpoints for UptimeRobot, and a robust recovery system with intelligent storage selection.
    - **Production Readiness**: Complete production server setup with security headers, CORS, optimized request limits, and a clean build process. Achieved 100% LSP diagnostic resolution for a fault-tolerant development environment.

## External Dependencies
- **Klaviyo**: Email marketing, user behavior tracking, and analytics.
- **SendGrid**: Transactional emails (e.g., password resets, emergency BA notifications). No longer used for income reports (switched to Capacitor-based downloads).
- **Google Maps API**: Address autocomplete and mileage calculation (Places API, Distance Matrix API).
- **Supabase**: Database, authentication.
- **Sentry**: Error monitoring and performance tracking.
- **RevenueCat**: Subscription management and in-app purchases (API keys securely stored in environment variables).
- **Capacitor**: Native mobile functionality including Filesystem (file storage) and Share (native share sheet) for iOS/Android report downloads.
- **Redis**: Considered for caching.
- **Cloudinary**: Considered for media management.
- **Stripe**: Considered for payment integration.