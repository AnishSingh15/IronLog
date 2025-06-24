import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Cookies from 'js-cookie';
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

      setUser((response.data as any)?.user);
      router.push('/dashboard');
      return { success: true };
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
    const token = Cookies.get('accessToken');
    if (!token) {
      logout();
      return false;
    }

    try {
      const response = await apiClient.refreshToken();
      setUser((response.data as any)?.user);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  // Auto-check authentication on mount
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, []);

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
