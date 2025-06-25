/**
 * API client for IronLog application with authentication handling
 */

// Base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Token management utilities
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly EXPIRES_AT_KEY = 'expiresAt';

  static setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    
    // Set tokens in localStorage with 7-day expiry
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
    
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString());
  }

  static getTokens(): AuthTokens | null {
    if (typeof window === 'undefined') return null;
    
    const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);

    if (!accessToken || !refreshToken || !expiresAt) {
      return null;
    }

    // Check if tokens have expired
    if (Date.now() > parseInt(expiresAt)) {
      this.clearTokens();
      return null;
    }

    return {
      accessToken,
      refreshToken,
      expiresAt: parseInt(expiresAt)
    };
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
  }

  static getAccessToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.accessToken || null;
  }
}

// API client class
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    // Remove any existing /api/v1 suffix to avoid duplication
    const cleanBaseURL = baseURL.replace(/\/api\/v1\/?$/, '');
    this.baseURL = `${cleanBaseURL}/api/v1`;
    
    // Debug logging (remove in production)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('API Base URL Setup:', { 
        originalBaseURL: baseURL, 
        cleanBaseURL, 
        finalBaseURL: this.baseURL 
      });
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Add authorization header if token exists
    const accessToken = TokenManager.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 unauthorized - token might be expired
      if (response.status === 401 && accessToken) {
        // Clear invalid tokens
        TokenManager.clearTokens();
        
        // Redirect to login if in browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return {
          success: false,
          error: { message: 'Authentication required' }
        };
      }

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: {
            message: data.error?.message || 'Request failed',
            code: data.error?.code
          }
        };
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Network error'
        }
      };
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await this.makeRequest<{ user: User; tokens: AuthTokens }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );

    // Store tokens on successful login
    if (response.success && response.data?.tokens) {
      TokenManager.setTokens(response.data.tokens);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response = await this.makeRequest<{ user: User; tokens: AuthTokens }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );

    // Store tokens on successful registration
    if (response.success && response.data?.tokens) {
      TokenManager.setTokens(response.data.tokens);
    }

    return response;
  }

  async refreshToken(): Promise<ApiResponse<{ tokens: AuthTokens }>> {
    const refreshToken = TokenManager.getTokens()?.refreshToken;
    if (!refreshToken) {
      return {
        success: false,
        error: { message: 'No refresh token available' }
      };
    }

    const response = await this.makeRequest<{ tokens: AuthTokens }>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }
    );

    // Store new tokens on successful refresh
    if (response.success && response.data?.tokens) {
      TokenManager.setTokens(response.data.tokens);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate tokens on server
      await this.makeRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Always clear local tokens
      TokenManager.clearTokens();
    }
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.makeRequest<{ user: User }>('/auth/me');
  }

  // Workout-specific endpoints
  async getTodayWorkout(): Promise<ApiResponse<any>> {
    return this.get('/workouts/today');
  }

  // Generic GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Generic PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Generic DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}

// Default API client instance
export const api = new ApiClient();

// Auth utility functions
export const isAuthenticated = (): boolean => {
  return TokenManager.getTokens() !== null;
};

export const getAuthTokens = (): AuthTokens | null => {
  return TokenManager.getTokens();
};

export const clearAuthTokens = (): void => {
  TokenManager.clearTokens();
};

// Export the token manager for direct access if needed
export { TokenManager };

// Legacy API client wrapper for backward compatibility
export const apiClient = {
  async login(credentials: LoginRequest) {
    return api.login(credentials);
  },
  
  async register(userData: RegisterRequest) {
    return api.register(userData);
  },
  
  async logout() {
    return api.logout();
  },
  
  async refreshToken() {
    return api.refreshToken();
  },
  
  async getTodayWorkout() {
    return api.getTodayWorkout();
  },
  
  async get(endpoint: string) {
    return api.get(endpoint);
  },
  
  async post(endpoint: string, data?: any) {
    return api.post(endpoint, data);
  },
  
  async put(endpoint: string, data?: any) {
    return api.put(endpoint, data);
  },
  
  async patch(endpoint: string, data?: any) {
    return api.patch(endpoint, data);
  },
  
  async delete(endpoint: string) {
    return api.delete(endpoint);
  }
};

// Default export for backward compatibility
export default apiClient;
