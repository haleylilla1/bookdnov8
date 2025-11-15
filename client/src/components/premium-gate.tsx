import { ReactNode, useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionModal } from './subscription-modal';
import { Lock, Crown } from 'lucide-react';
import { Button } from './ui/button';

interface PremiumGateProps {
  children: ReactNode;
  feature: 'pro' | 'premium';
  fallback?: ReactNode;
  showUpgradeButton?: boolean;
}

export function PremiumGate({ 
  children, 
  feature, 
  fallback,
  showUpgradeButton = true 
}: PremiumGateProps) {
  const { isPro, isPremium, tier } = useSubscription();
  const [showModal, setShowModal] = useState(false);

  // Check if user has required access
  const hasAccess = feature === 'pro' 
    ? (isPro || isPremium) 
    : isPremium;

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show fallback or default locked message
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      <div className="relative" data-testid="premium-gate">
        {/* Blurred preview */}
        <div className="blur-sm pointer-events-none opacity-50">
          {children}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
          <div className="text-center p-6 max-w-md">
            <div className="mb-4 flex justify-center">
              {feature === 'premium' ? (
                <Crown className="w-12 h-12 text-yellow-500" />
              ) : (
                <Lock className="w-12 h-12 text-blue-500" />
              )}
            </div>
            <h3 className="text-xl font-bold mb-2">
              {feature === 'premium' ? 'Premium Feature' : 'Pro Feature'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upgrade to {feature === 'premium' ? 'Premium' : 'Pro'} to unlock this feature and
              take your gig business to the next level.
            </p>
            {showUpgradeButton && (
              <Button
                onClick={() => setShowModal(true)}
                className="bg-blue-500 hover:bg-blue-600"
                data-testid="button-upgrade"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            )}
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentTier={tier}
      />
    </>
  );
}

// Simple hook for checking feature access
export function usePremiumFeature(feature: 'pro' | 'premium'): boolean {
  const { isPro, isPremium } = useSubscription();
  
  return feature === 'pro' 
    ? (isPro || isPremium) 
    : isPremium;
}
