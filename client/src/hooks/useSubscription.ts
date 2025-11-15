import { useQuery } from '@tanstack/react-query';
import { Capacitor } from '@capacitor/core';
import { getCustomerInfo, hasActiveEntitlement } from '@/lib/revenuecat';

export interface SubscriptionStatus {
  tier: string;
  status: string;
  expiresAt: string | null;
  hasActiveSubscription: boolean;
  isPro: boolean;
  isPremium: boolean;
}

export function useSubscription() {
  const isNative = Capacitor.isNativePlatform();

  const { data: subscriptionData, isLoading, refetch } = useQuery<SubscriptionStatus>({
    queryKey: ['/api/subscription/status'],
    staleTime: 30000, // 30 seconds
  });

  // Check native entitlements for iOS
  const { data: nativeEntitlement } = useQuery({
    queryKey: ['native-entitlement'],
    queryFn: async () => {
      if (!isNative) return null;
      const isPro = await hasActiveEntitlement('pro_access');
      const isPremium = await hasActiveEntitlement('premium_access');
      return { isPro, isPremium };
    },
    enabled: isNative,
    staleTime: 30000,
  });

  // Determine subscription status
  const tier = subscriptionData?.tier || 'trial';
  const status = subscriptionData?.status || 'trial';
  const expiresAt = subscriptionData?.expiresAt || null;

  // Check if user has active subscription (web or native)
  const hasActiveSubscription = isNative
    ? (nativeEntitlement?.isPro || nativeEntitlement?.isPremium || false)
    : (subscriptionData?.hasActiveSubscription || false);

  const isPro = isNative
    ? (nativeEntitlement?.isPro || false)
    : (tier === 'pro' && hasActiveSubscription);

  const isPremium = isNative
    ? (nativeEntitlement?.isPremium || false)
    : (tier === 'premium' && hasActiveSubscription);

  return {
    tier,
    status,
    expiresAt,
    hasActiveSubscription,
    isPro,
    isPremium,
    isLoading,
    refetch,
  };
}
