# iOS Authentication Fix - Build Instructions

## Problem Identified
The iOS app was loading from `capacitor://localhost` (bundled files) instead of `https://app.bookd.tools` because of App Bound Domains configuration. This caused all `/api/auth/*` requests to fail locally (404) instead of reaching the backend server.

## Root Cause
1. `limitsNavigationsToAppBoundDomains: true` in capacitor.config.ts blocked remote URL loading
2. Missing NSAppTransportSecurity configuration in Info.plist prevented network access to app.bookd.tools
3. iOS fell back to bundled files which don't contain the backend API

## Files Changed
1. **capacitor.config.ts** - Changed `limitsNavigationsToAppBoundDomains` from `true` to `false`
2. **ios/App/App/Info.plist** - Added NSAppTransportSecurity exception for app.bookd.tools

## Build Steps (Use Same Mac as Before)

### 1. Sync Capacitor Changes
```bash
npx cap sync ios
```

### 2. Open Xcode
```bash
npx cap open ios
```

### 3. In Xcode (Version 16)
1. **Clean Build Folder**: Shift+Cmd+K (CRITICAL - clears old configuration cache)
2. **Increment Build Number**: 
   - Select "App" target
   - Go to "General" tab
   - Change Build number from `6` to `7`
   - Keep Version at `1.0.1`
3. **Archive the App**:
   - Product → Archive
   - Wait for build to complete
4. **Distribute to App Store**:
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Upload with same signing as before (Apple Distribution: Haley Lilla)

### 4. App Store Connect
1. Go to App Store Connect
2. Select your app
3. Create new version or update existing TestFlight build
4. Submit for review with note: "Critical bug fix - authentication now works correctly"

## Testing After Upload

### Before Submitting to App Store:
1. Install the new build from TestFlight on your iPhone
2. Delete the old app first if installed
3. Open the new TestFlight build
4. Try to register a NEW account (not demo@bookd.app)
5. Watch the Replit logs - you should now see:
   ```
   📱 Registration attempt from: ...
   📱 Request origin: ...
   ✅ Creating user: ...
   ✅ User created, ID: ...
   ```

### If Logs Appear = SUCCESS!
The app is now loading from app.bookd.tools and authentication works.

### If No Logs = PROBLEM
The app is still using bundled files. Double-check:
- Clean Build Folder was done
- Capacitor sync completed successfully
- Info.plist changes are present in Xcode

## What Changed Technically

**Before:**
- App tried to load https://app.bookd.tools
- iOS blocked it due to App Bound Domains restrictions
- Fell back to bundled files at capacitor://localhost
- All `/api/*` requests went to non-existent local endpoints
- Result: "registration failed" with no server logs

**After:**
- App loads https://app.bookd.tools successfully
- NSAppTransportSecurity allows secure connection
- All `/api/*` requests reach the backend server
- Result: Authentication works, logs appear, users can register/login

## Version Info
- **Current Live Version**: 1.0.1 (Build 6) - BROKEN AUTH
- **New Fixed Version**: 1.0.1 (Build 7) - WORKING AUTH
- **Bundle ID**: com.haley.bookd
- **Certificate**: Apple Distribution: Haley Lilla LX8FDT7R2G

## Notes
- This is a CRITICAL bug fix that affects all users
- Users cannot register or login until this fix is live
- The fix enables the "live updates" feature properly for future changes
- Once this build is approved, future code changes will update automatically without App Store resubmission
