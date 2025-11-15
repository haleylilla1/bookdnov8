# iOS Build & TestFlight Deployment Instructions

## Prerequisites
- ✅ Apple Developer Account ($99/year)
- ✅ Xcode installed (latest version from Mac App Store)
- ✅ Capacitor configured with RevenueCat plugin
- ✅ App bundle ID: `com.bookd.app`

## Step 1: Build the Web App for Production

```bash
# Build the production web app
npm run build

# This creates optimized files in dist/public/
```

## Step 2: Sync Capacitor with iOS

```bash
# Copy web assets to iOS project and sync plugins
npx cap sync ios

# This updates:
# - Web assets in ios/App/App/public/
# - Native plugins configuration
# - Capacitor runtime
```

## Step 3: Configure Production Server URL

### Option A: Live Updates (Recommended for Development)
Set the server URL to point to your published Replit app:

```bash
# Set environment variable for Capacitor
export CAPACITOR_SERVER_URL="https://your-app.replit.app"
npx cap sync ios
```

### Option B: Embedded Build (For App Store)
Leave server URL undefined - app will use embedded web files from `dist/public/`

## Step 4: Open in Xcode

```bash
# Open the iOS project in Xcode
npx cap open ios
```

## Step 5: Configure App in Xcode

### A. Signing & Capabilities
1. Select `App` target in project navigator
2. Go to **Signing & Capabilities** tab
3. Select your **Team** (Apple Developer account)
4. Xcode will auto-generate provisioning profile
5. Ensure **Bundle Identifier** is `com.bookd.app`

### B. Add In-App Purchase Capability
1. Click **+ Capability** button
2. Add **In-App Purchase**

### C. Configure App Icons & Splash Screens
1. Click `Assets.xcassets` in project navigator
2. Add your app icon (1024x1024 PNG) to `AppIcon`
3. Add splash screen images to `Splash`

### D. Set Version & Build Number
1. Select `App` target
2. Go to **General** tab
3. Set **Version**: `1.0.0`
4. Set **Build**: `1` (increment for each TestFlight upload)

## Step 6: Configure Info.plist

Open `ios/App/App/Info.plist` and verify/add:

```xml
<!-- Location permission for mileage tracking -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Bookd needs location access to calculate accurate mileage for your gigs</string>

<!-- IMPORTANT: If using live updates (server.url in capacitor.config.ts) -->
<!-- Add your Replit domain to WKAppBoundDomains for iOS 14+ -->
<!-- Only needed if capacitor.config.ts has: limitsNavigationsToAppBoundDomains: true -->
<!--
<key>WKAppBoundDomains</key>
<array>
    <string>your-app.replit.app</string>
</array>
-->

<!-- Alternative: For embedded builds (no live updates), remove server.url entirely -->
<!-- This makes the app use only the bundled web files in dist/public/ -->
```

**Important Decision: Live Updates vs Embedded Build**

1. **Live Updates (Recommended for Development)**
   - Keep `server.url` in capacitor.config.ts pointing to your Replit app
   - Add your domain to `WKAppBoundDomains` in Info.plist
   - Users get instant updates when you deploy to Replit
   - Faster iteration for bug fixes and features

2. **Embedded Build (Required for App Store)**
   - Remove `server.url` from capacitor.config.ts (or set to undefined)
   - App uses bundled files from `dist/public/`
   - Requires App Store review for any updates
   - More stable, works offline

## Step 7: Build for Testing

### Local Testing (Simulator)
1. Select a simulator device (e.g., iPhone 15 Pro)
2. Click **Run** button (▶️) or press `Cmd + R`
3. Test the app functionality

### Device Testing
1. Connect your iPhone via USB
2. Select your device from device menu
3. Click **Run** button
4. First time: Trust the developer certificate on your iPhone

## Step 8: Archive for TestFlight

1. Select **Any iOS Device (arm64)** as destination
2. Menu: **Product** → **Archive**
3. Wait for archive to complete
4. Xcode Organizer will open automatically

## Step 9: Upload to App Store Connect

1. In Xcode Organizer, select your archive
2. Click **Distribute App**
3. Select **App Store Connect**
4. Click **Upload**
5. Select **Automatically manage signing**
6. Click **Upload**
7. Wait for processing to complete

## Step 10: TestFlight Configuration

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app **Bookd**
3. Go to **TestFlight** tab
4. Wait for build to process (10-30 minutes)
5. Once processed, click the build number
6. Fill in **What to Test** description
7. Add test information if needed

## Step 11: Add RevenueCat API Keys

### For iOS Testing:
1. Get your RevenueCat **iOS API Key** (starts with `appl_`)
2. Add to your code or Replit secrets as `VITE_REVENUECAT_IOS_KEY`
3. Rebuild and re-upload to TestFlight

### Create Entitlements in RevenueCat:
1. Go to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Create entitlement: `pro_access` (for both monthly and annual subscribers)
3. Link to iOS app via bundle ID: `com.bookd.app`

## Step 12: Create In-App Purchase Products

1. Go to App Store Connect → **Your App** → **In-App Purchases**
2. Click **+** to create new product
3. Select **Auto-Renewable Subscription**
4. Create subscription group: "Bookd Pro"
5. Create products:
   - **Monthly**: `com.bookd.app.monthly` - **$5.00/month**
   - **Annual**: `com.bookd.app.annual` - **$50.00/year**
6. Set pricing for all territories
7. Add localized descriptions:
   - Monthly: "Track unlimited gigs and expenses. Advanced tax reporting. $5/month."
   - Annual: "All monthly features. Save $10/year. $50/year."
8. Submit for review (or save as draft for sandbox testing)

## Step 12b: Link Products in RevenueCat

1. Go to RevenueCat Dashboard → **Products**
2. Add App Store products:
   - Link `com.bookd.app.monthly` → `pro_access` entitlement
   - Link `com.bookd.app.annual` → `pro_access` entitlement
3. Create Offerings:
   - Default offering with both Monthly ($rc_monthly) and Annual ($rc_annual) packages
4. Save and test

## Step 13: Add Internal Testers

1. In TestFlight tab, click **Internal Testing**
2. Click **+** next to testers
3. Add internal testers by email
4. They'll receive email invitation
5. They can install TestFlight app and test

## Step 14: Add External Testers (Beta)

1. Click **External Testing**
2. Create new group: "Public Beta"
3. Add external testers by email
4. Submit for Beta App Review (required for external testing)
5. Wait for Apple approval (24-48 hours)

## Testing Subscription Flow

### Sandbox Testing:
1. Create sandbox test account in App Store Connect
2. On test device: Settings → App Store → Sandbox Account
3. Sign in with sandbox account
4. Purchase subscriptions (free in sandbox)
5. Test restore purchases functionality

### Production Testing:
1. Use real App Store account
2. Create actual subscriptions
3. Verify RevenueCat webhooks are working
4. Test upgrade/downgrade flows

## Live Updates Configuration

For **instant updates without App Store review**:

1. Keep server.url in capacitor.config.ts pointing to Replit
2. Deploy changes to Replit
3. Users get updates on next app launch
4. No rebuild/resubmit needed!

**Note**: Live updates only work for web code (HTML/CSS/JS), not native changes.

## Common Issues & Solutions

### Build Fails: "Provisioning profile doesn't include signing certificate"
- Solution: Xcode → Preferences → Accounts → Download Manual Profiles

### TestFlight Upload Fails: "Invalid bundle"
- Solution: Increment build number in Xcode

### RevenueCat Not Working: "SDK not configured"
- Solution: Verify iOS API key is correct and app bundle ID matches

### App Crashes on Launch
- Solution: Check Xcode console logs, verify server URL is correct

### Subscriptions Not Working in Sandbox
- Solution: Sign out of App Store, sign in with sandbox account

## TestFlight Submission Checklist

### Pre-Submission (Do These First):
- [ ] **Agreements Signed**: Go to App Store Connect → Agreements, Tax, and Banking
- [ ] **App Created**: Create app in App Store Connect with bundle ID `com.bookd.app`
- [ ] **In-App Purchases**: Create Monthly ($5) and Annual ($50) subscription products
- [ ] **RevenueCat**: Link App Store products to `pro_access` entitlement
- [ ] **API Keys**: Add `VITE_REVENUECAT_IOS_KEY` to Replit secrets

### Build & Upload:
- [ ] Run `npm run build` to create production web app
- [ ] Run `npx cap sync ios` to update native project
- [ ] Open in Xcode: `npx cap open ios`
- [ ] Configure signing with your Apple Developer account
- [ ] Add In-App Purchase capability
- [ ] Update Info.plist with permissions (camera, photo, location)
- [ ] Set version to 1.0.0, build to 1
- [ ] Archive for iOS: Product → Archive
- [ ] Upload to App Store Connect

### TestFlight Configuration:
- [ ] Wait for build to process (10-30 minutes)
- [ ] Add "What to Test" notes
- [ ] Add internal testers
- [ ] Test subscription flow with sandbox account
- [ ] Verify restore purchases works
- [ ] Test all core features on real device

### Before Public Beta/App Store:
- [ ] All features tested on real device
- [ ] Subscription flow working end-to-end (iOS native purchases)
- [ ] Receipt uploads working
- [ ] Mileage tracking with GPS working
- [ ] Icons and splash screens look good (1024x1024 app icon)
- [ ] Privacy policy URL ready
- [ ] Terms of service URL ready
- [ ] Support email/URL configured
- [ ] Screenshots prepared (6.7", 6.5", 5.5" sizes minimum)
- [ ] App Store description written
- [ ] Keywords optimized for ASO
- [ ] Age rating: 4+ (no objectionable content)
- [ ] Export compliance: No encryption beyond HTTPS

## Quick Reference: Pricing

**Current Subscription Pricing:**
- Monthly: **$5.00/month** (`com.bookd.app.monthly`)
- Annual: **$50.00/year** (`com.bookd.app.annual`) - saves $10/year
- Free Trial: **7 days** (handled in app, not App Store)

**RevenueCat Configuration:**
- Entitlement: `pro_access` (grants access to all premium features)
- Packages: `$rc_monthly` and `$rc_annual`
- Both packages unlock the same `pro_access` entitlement

## Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [RevenueCat iOS SDK](https://www.revenuecat.com/docs/getting-started/installation/ios)
- [App Store Connect](https://appstoreconnect.apple.com)
- [TestFlight Beta Testing](https://developer.apple.com/testflight/)
