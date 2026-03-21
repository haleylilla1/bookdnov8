import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './queryClient';
import { setSentryUser, clearSentryUser, addSentryBreadcrumb } from './sentry';
import { setRevenueCatUser, logoutRevenueCatUser } from './revenuecat';
import React from 'react';

// User type for traditional auth
export interface User {
  id: number;
  email: string;
  name: string;
  subscriptionTier?: string;
  profileImageUrl?: string;
}

// Auth status response
export interface AuthStatus {
  authenticated: boolean;
  user?: User;
}

// Custom hook for authentication status
export function useAuth() {
  const queryClient = useQueryClient();
  
  // Authentication state tracking for Sentry
  const debugAuth = (action: string, data?: any) => {
    // Production: Only use Sentry, no console logs
  };

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/user'],
    retry: false,
    staleTime: 0, // No stale time - always fresh auth check
    gcTime: 0, // No garbage collection time - always fresh auth check
  });

  // Debug authentication state changes and update Sentry & RevenueCat
  React.useEffect(() => {
    if (user) {
      debugAuth('User authenticated', { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      });
      // Set Sentry user context
      setSentryUser({
        id: user.id,
        email: user.email,
        name: user.name
      });
      addSentryBreadcrumb('User authenticated', 'auth', { userId: user.id });
      
      // Set RevenueCat user ID for subscription tracking
      setRevenueCatUser(user.id.toString()).catch(err => {
        console.error('Failed to set RevenueCat user:', err);
      });
    } else if (error) {
      debugAuth('Authentication failed', { error: error.message });
      addSentryBreadcrumb('Authentication failed', 'auth.error', { error: error.message });
    } else if (!isLoading && !user) {
      debugAuth('No authenticated user', {});
      clearSentryUser();
    }
  }, [user, error, isLoading]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: (data) => {
      addSentryBreadcrumb('User logged in', 'auth', { email: data.email });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/logout');
      return response.json();
    },
    onSuccess: async () => {
      addSentryBreadcrumb('User logged out', 'auth');
      clearSentryUser();
      await logoutRevenueCatUser().catch(err => {
        console.error('Failed to logout RevenueCat user:', err);
      });
      localStorage.removeItem('bookd_session');
      queryClient.clear();
      window.location.href = '/';
    },
    onError: () => {
      // Force logout even if API call fails
      localStorage.removeItem('bookd_session');
      queryClient.clear();
      window.location.href = '/';
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}



// Auth guard component
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#00b4d8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve reset_token param so password reset links still work after redirect
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get('reset_token');
    const target = resetToken ? `/auth?reset_token=${resetToken}` : '/auth';
    window.location.href = target;
    return null;
  }

  return <>{children}</>;
}

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}

