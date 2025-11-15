import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.haley.bookd',
  appName: 'Bookd',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    // Production URL - iOS app will load from here for live updates
    url: 'https://app.bookd.tools',
    cleartext: false
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#ffffff',
    // Enable live updates for faster iterations
    webContentsDebuggingEnabled: process.env.NODE_ENV === 'development',
    // CRITICAL: Must be false to allow loading from remote server
    limitsNavigationsToAppBoundDomains: false
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ffffff',
      overlaysWebView: false
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
      spinnerColor: '#2563eb'
    }
  }
};

export default config;