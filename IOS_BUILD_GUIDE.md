# iOS Build & App Store Guide

## Quick Reference
- **Bundle ID**: com.haley.bookd
- **Certificate**: Apple Distribution: Haley Lilla LX8FDT7R2G
- **App URL**: https://app.bookd.tools (live updates)
- **Demo Account**: demo@bookd.app / password123

## Build Steps

### 1. Sync Capacitor
```bash
npx cap sync ios
```

### 2. Open in Xcode
```bash
npx cap open ios
```

### 3. In Xcode
1. **Clean Build Folder**: Shift+Cmd+K
2. **Set Build Number**: Increment for each upload
3. **Archive**: Product → Archive
4. **Upload**: Distribute App → App Store Connect

## Configuration

### Capacitor Config
- `server.url: 'https://app.bookd.tools'` - Live updates enabled
- `limitsNavigationsToAppBoundDomains: false` - Required for remote loading

### Info.plist
- NSLocationWhenInUseUsageDescription: For mileage tracking
- NSAppTransportSecurity: Configured for app.bookd.tools

## App Store Metadata

**Name**: Bookd - Gig Worker Tracker
**Subtitle**: Track gigs, expenses, and taxes
**Category**: Finance / Business
**Age Rating**: 4+

**Keywords**: gig worker, income tracker, expense, tax, freelance, contractor, mileage, deduction, self employed, 1099

## Testing

### TestFlight
1. Wait 5-10 minutes for processing after upload
2. Install via TestFlight on iPhone
3. Test with demo account or create new account

### Verify Live Updates Working
Watch Replit logs when user registers/logs in - you should see server activity.

## Troubleshooting

**No server logs when user registers**: App loading from bundled files instead of server. Clean build folder and re-sync capacitor.

**Signing issues**: Xcode → Preferences → Accounts → Download Manual Profiles

**Upload fails**: Increment build number in Xcode

## Post-Approval: Enable Subscriptions

After FREE v1.0 is approved:
1. Create In-App Purchase products in App Store Connect ($5/month, $50/year)
2. Configure RevenueCat dashboard
3. Add VITE_REVENUECAT_IOS_KEY and VITE_ENABLE_SUBSCRIPTIONS to environment
4. Subscriptions go live via live updates (no resubmission needed)
