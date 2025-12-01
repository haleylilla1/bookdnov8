import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/replit-auth';
import { KeyboardToolbar } from '@/components/keyboard-toolbar';
import HomePage from '@/pages/home';
import ProfilePage from '@/pages/profile';
import BAProfilePage from '@/pages/ba-profile';
import EmergencyFeedPage from '@/pages/emergency-feed';
import EmergencyPostPage from '@/pages/emergency-post';
import PrivacyPolicy from '@/pages/privacy-policy';
import TermsOfService from '@/pages/terms-of-service';
import Support from '@/pages/support';

import AgencyPortal from '@/pages/agency';
import WaitlistPage from '@/pages/waitlist';
import AdminWaitlist from '@/pages/admin-waitlist';
import NotFound from '@/pages/not-found';
import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

function AppRouter() {
  // Auto-redirect agency subdomain to agency portal
  useEffect(() => {
    if (window.location.hostname === 'agency.bookd.tools' && window.location.pathname === '/') {
      window.location.pathname = '/agency';
    }
  }, []);

  return (
    <Switch>
      {/* Public routes - no auth required */}
      <Route path="/agency" component={AgencyPortal} />
      <Route path="/waitlist" component={WaitlistPage} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/support" component={Support} />
      
      {/* All other routes require regular user authentication */}
      <Route path="/*">
        <AuthProvider>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/ba-profile" component={BAProfilePage} />
            <Route path="/emergency-feed" component={EmergencyFeedPage} />
            <Route path="/emergency-post" component={EmergencyPostPage} />
            <Route path="/admin/waitlist" component={AdminWaitlist} />

            <Route component={NotFound} />
          </Switch>
        </AuthProvider>
      </Route>
    </Switch>
  );
}

function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white px-4 py-3 shadow-lg">
      <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto">
        <WifiOff className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">
          No internet connection. Bookd requires internet to work properly.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OfflineBanner />
      <AppRouter />
      <Toaster />
      <KeyboardToolbar />
    </QueryClientProvider>
  );
}

export default App;