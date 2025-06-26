'use client';

import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth';
import { ReactNode, useEffect, useState } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { checkAuth } = useAuth();
  const { isLoading } = useAuthStore();
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (authInitialized) return; // Prevent multiple initializations

      console.log('🔐 Initializing authentication...');

      try {
        await checkAuth();
        console.log('🔐 Auth initialization complete');
      } catch (error) {
        console.error('🔐 Auth initialization error:', error);
      } finally {
        if (mounted) {
          setAuthInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []); // Only run once

  // Show loading state during auth initialization
  if (!authInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#F46036',
        }}
      >
        🏋️ Loading IronLog...
      </div>
    );
  }

  return <>{children}</>;
}
