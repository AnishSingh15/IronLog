import apiClient, { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Login attempt started:', { email });
      setLoading(true);

      const response = await apiClient.login({ email, password });
      console.log('✅ Login successful:', response);

      if (response.success && response.data?.user) {
        setUser(response.data.user);
        router.push('/dashboard');
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Login failed - invalid response',
        };
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('Error response:', error.response?.data);

      // Handle different types of errors
      let errorMessage = 'Login failed';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      console.log('🔄 Setting loading to false');
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('📝 Registration attempt started:', { name, email });
      setLoading(true);

      const response = await apiClient.register({ name, email, password });
      console.log('✅ Registration successful:', response);

      setUser((response.data as any)?.user);
      router.push('/dashboard');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('Error response:', error.response?.data);

      // Handle different types of errors
      let errorMessage = 'Registration failed';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      console.log('🔄 Setting loading to false');
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      logout();
      router.push('/');
    }
  };

  const checkAuth = async () => {
    console.log('🔐 checkAuth called');

    // Check if we have stored tokens in localStorage
    const tokens = apiClient.getStoredTokens();
    console.log('🔐 Stored tokens check:', {
      hasTokens: !!tokens,
      hasAccessToken: !!tokens?.accessToken,
      hasRefreshToken: !!tokens?.refreshToken,
    });

    if (!tokens) {
      console.log('🔐 No tokens found, logging out');
      logout();
      return false;
    }

    try {
      console.log('🔐 Attempting token refresh...');
      // Try to refresh the token to verify it's still valid
      const refreshResponse = await apiClient.refreshToken();
      console.log('🔐 Token refresh response:', refreshResponse);

      if (refreshResponse.success) {
        console.log('🔐 Token refreshed, now getting user profile...');
        // Get user profile with the new token
        const profileResponse = await api.get('/auth/profile');
        console.log('🔐 Profile response:', profileResponse);

        if (profileResponse.success && profileResponse.data) {
          setUser(profileResponse.data as any);
          console.log('🔐 Auth restored successfully');
          return true;
        } else {
          console.log('🔐 Failed to get user profile');
          logout();
          return false;
        }
      } else {
        console.log('🔐 Token refresh failed');
        logout();
        return false;
      }
    } catch (error) {
      console.error('🔐 Token refresh error:', error);
      logout();
      return false;
    }
  };

  // Auto-check authentication on mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      console.log('🔐 useAuth effect triggered:', { isAuthenticated, isLoading });

      if (!isAuthenticated && !isLoading && mounted) {
        console.log('🔐 Not authenticated and not loading, checking auth...');
        await checkAuth();
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout: logoutUser,
    checkAuth,
  };
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}
