import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, RefreshCw, ExternalLink } from "lucide-react";
import { TestWebhookButton } from "./test-webhook-button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Capacitor } from "@capacitor/core";
import { purchasePackage, restorePurchases, getOfferings } from "@/lib/revenuecat";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: string;
}

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$5',
    duration: '/month',
    trialText: '7-day free trial',
    description: 'Perfect for getting started',
    features: [
      '7-day free trial included',
      'Unlimited gigs & expenses',
      'Advanced tax reporting',
      'Export to Excel',
      'Mileage tracking with Google Maps',
      'Goal setting & tracking',
      'Receipt photo uploads',
      'Priority support'
    ],
    limitations: [],
    popular: true,
    savings: null
  },
  {
    id: 'annual',
    name: 'Annual',
    price: '$50',
    duration: '/year',
    trialText: '7-day free trial',
    description: 'Best value - save $10/year',
    features: [
      '7-day free trial included',
      'Everything in Monthly',
      'Save $10 per year',
      'Pay once, use all year',
      'Priority feature requests',
      'Early access to new features'
    ],
    limitations: [],
    popular: false,
    savings: 'Save $10/year'
  }
];

export function SubscriptionModal({ isOpen, onClose, currentTier = 'trial' }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>(currentTier);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { toast } = useToast();
  const isNative = Capacitor.isNativePlatform();

  const handlePlanSelect = async (planId: string) => {
    if (planId === currentTier || planId === 'trial') return;
    
    setIsLoading(true);
    try {
      if (isNative) {
        // Native iOS purchase flow
        const packageId = planId === 'monthly' ? '$rc_monthly' : '$rc_annual';
        await purchasePackage(packageId);
        
        toast({
          title: "Purchase Successful!",
          description: `Welcome to ${plans.find(p => p.id === planId)?.name}!`,
        });
      } else {
        // Web flow - use backend API for testing
        await apiRequest('POST', '/api/subscription/setup');
        await apiRequest('POST', '/api/subscription/update', {
          tier: planId,
          status: 'active',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

        toast({
          title: "Subscription Updated!",
          description: `You're now on the ${plans.find(p => p.id === planId)?.name} plan.`,
        });
      }

      // Refresh subscription status and user data
      await queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      await queryClient.invalidateQueries({ queryKey: ['native-entitlement'] });
      
      onClose();
    } catch (error: any) {
      console.error('Subscription update failed:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Unable to update subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    if (!isNative) {
      toast({
        title: "Not Available",
        description: "Restore purchases is only available on iOS.",
      });
      return;
    }

    setIsRestoring(true);
    try {
      await restorePurchases();
      toast({
        title: "Purchases Restored!",
        description: "Your subscription has been restored.",
      });
      
      // Refresh subscription status and user data
      await queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      await queryClient.invalidateQueries({ queryKey: ['native-entitlement'] });
    } catch (error: any) {
      console.error('Restore failed:', error);
      toast({
        title: "Restore Failed",
        description: "No purchases found to restore.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Choose Your Plan
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Start with a <span className="font-semibold text-green-600">7-day free trial</span>, then just $5/month
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${
                plan.popular 
                  ? 'border-blue-500 shadow-md' 
                  : 'border-gray-200'
              } ${
                selectedPlan === plan.id 
                  ? 'ring-2 ring-blue-500' 
                  : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  <Crown className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}

              {currentTier === plan.id && (
                <Badge className="absolute -top-3 right-4 bg-green-500">
                  Current Plan
                </Badge>
              )}

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                {'trialText' in plan && (
                  <div className="mt-1">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {plan.trialText}
                    </Badge>
                  </div>
                )}
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">{plan.duration}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                
                {plan.limitations.map((limitation, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{limitation}</span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full ${
                  plan.popular 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-800 hover:bg-gray-900'
                }`}
                onClick={() => handlePlanSelect(plan.id)}
                disabled={isLoading || currentTier === plan.id}
              >
                {isLoading ? (
                  "Processing..."
                ) : currentTier === plan.id ? (
                  "Current Plan"
                ) : (
                  `Start 7-Day Free Trial`
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p className="font-medium text-green-600 mb-1">Start with 7 days free - cancel anytime!</p>
          <p>All plans include unlimited gigs, expense tracking, and tax reporting.</p>
        </div>

        {/* Restore Purchases & Manage Subscription */}
        <div className="flex gap-3 mt-4">
          {isNative && (
            <Button
              variant="outline"
              onClick={handleRestorePurchases}
              disabled={isRestoring}
              className="flex-1"
              data-testid="button-restore-purchases"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRestoring ? 'animate-spin' : ''}`} />
              {isRestoring ? 'Restoring...' : 'Restore Purchases'}
            </Button>
          )}
          {currentTier !== 'trial' && (
            <Button
              variant="outline"
              onClick={() => {
                if (isNative) {
                  window.open('https://apps.apple.com/account/subscriptions', '_blank');
                } else {
                  toast({
                    title: "Manage Subscription",
                    description: "Visit your account settings to manage your subscription.",
                  });
                }
              }}
              className="flex-1"
              data-testid="button-manage-subscription"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          )}
        </div>

        {/* Development Testing Section */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <TestWebhookButton />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}