# Bookd - Gig Worker Finance Tracker

A mobile-first iOS app for gig workers to track income, expenses, and taxes.

## Quick Links
- **Live App**: https://app.bookd.tools
- **Marketing Site**: https://bookd.tools
- **Demo Account**: demo@bookd.app / password123

## Features

### Financial Tracking
- Calendar-based gig management with status tracking (upcoming, completed, paid)
- Expense tracking with business category classification
- Automatic mileage calculation using Google Maps API
- Real-time tax liability estimation with customizable rates

### Tax-Smart Workflows
- "Got Paid" workflow tracks income and calculates deductions
- IRS standard mileage rate applied automatically
- Excel export for tax preparation
- Business vs. reimbursed expense separation

### Mobile-First Design
- iOS Safari optimized with zoom prevention
- Touch-friendly 44px minimum targets
- Native iOS keyboard handling with auto-scroll

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Native**: Capacitor for iOS with live updates
- **Monitoring**: Sentry for error tracking

## Development

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run db:push    # Push schema changes to database
```

## iOS Build

See [IOS_BUILD_GUIDE.md](./IOS_BUILD_GUIDE.md) for build and App Store submission instructions.

## Services

See [SERVICES_SETUP.md](./SERVICES_SETUP.md) for integration configuration (Sentry, Klaviyo, SendGrid, RevenueCat).

## App Store Status

- **Bundle ID**: com.haley.bookd
- **Launch Strategy**: FREE v1.0, enable subscriptions ($5/month or $50/year) post-approval via live updates
- **Live Updates**: App loads from app.bookd.tools for instant code updates without resubmission

## Contact

haley.bookd@gmail.com
