import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

// RevenueCat Public API Key for iOS
// Note: This should be the iOS-specific public key from RevenueCat dashboard
// Format: appl_xxxxxx for Apple platforms
const REVENUECAT_IOS_PUBLIC_KEY = import.meta.env.VITE_REVENUECAT_IOS_KEY || '';

export async function initRevenueCat() {
  // Only initialize on native platforms (iOS/Android)
  if (!Capacitor.isNativePlatform()) {
    console.log('RevenueCat: Skipping initialization on web platform');
    return;
  }

  try {
    if (!REVENUECAT_IOS_PUBLIC_KEY) {
      console.warn('RevenueCat: iOS public key not configured');
      return;
    }

    // Configure RevenueCat
    await Purchases.configure({
      apiKey: REVENUECAT_IOS_PUBLIC_KEY,
      appUserID: undefined, // Will be set after user logs in
    });

    // Set log level based on environment
    const logLevel = import.meta.env.DEV ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR;
    await Purchases.setLogLevel({ level: logLevel });

    console.log('✅ RevenueCat initialized successfully');
  } catch (error) {
    console.error('❌ RevenueCat initialization failed:', error);
  }
}

// Set user ID after authentication
export async function setRevenueCatUser(userId: string) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await Purchases.logIn({ appUserID: userId });
    console.log(`✅ RevenueCat user identified: ${userId}`);
  } catch (error) {
    console.error('❌ RevenueCat user identification failed:', error);
  }
}

// Log out user
export async function logoutRevenueCatUser() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await Purchases.logOut();
    console.log('✅ RevenueCat user logged out');
  } catch (error) {
    console.error('❌ RevenueCat logout failed:', error);
  }
}

// Get current offerings
export async function getOfferings() {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('❌ Failed to get RevenueCat offerings:', error);
    return null;
  }
}

// Purchase a package
export async function purchasePackage(packageIdentifier: string) {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Purchases only available on native platforms');
  }

  try {
    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.current;
    
    if (!currentOffering) {
      throw new Error('No current offering available');
    }

    const packageToPurchase = currentOffering.availablePackages.find(
      pkg => pkg.identifier === packageIdentifier
    );

    if (!packageToPurchase) {
      throw new Error('Package not found');
    }

    const result = await Purchases.purchasePackage({
      aPackage: packageToPurchase,
    });

    console.log('✅ Purchase successful:', result);
    return result;
  } catch (error: any) {
    console.error('❌ Purchase failed:', error);
    throw error;
  }
}

// Restore purchases
export async function restorePurchases() {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Restore only available on native platforms');
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    console.log('✅ Purchases restored:', customerInfo);
    return customerInfo;
  } catch (error) {
    console.error('❌ Restore purchases failed:', error);
    throw error;
  }
}

// Check if user has active entitlement
export async function hasActiveEntitlement(entitlementId: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return false;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.customerInfo.entitlements.active[entitlementId] !== undefined;
  } catch (error) {
    console.error('❌ Failed to check entitlement:', error);
    return false;
  }
}

// Get customer info
export async function getCustomerInfo() {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  try {
    const result = await Purchases.getCustomerInfo();
    return result.customerInfo;
  } catch (error) {
    console.error('❌ Failed to get customer info:', error);
    return null;
  }
}
