import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

    console.log('🔗 API Client initialized with baseURL:', baseURL);

    this.client = axios.create({
      baseURL,
      withCredentials: true,
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(config => {
      const token = Cookies.get('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await this.client.post('/auth/refresh');
            const { accessToken } = response.data.data;

            Cookies.set('accessToken', accessToken, {
              expires: 1 / 96, // 15 minutes
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
            });

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            Cookies.remove('accessToken');
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async register(data: { name: string; email: string; password: string }) {
    const response = await this.client.post('/auth/register', data);
    const { accessToken } = response.data.data;

    Cookies.set('accessToken', accessToken, {
      expires: 1 / 96, // 15 minutes
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return response.data;
  }

  async login(data: { email: string; password: string }) {
    console.log('� Attempting login...');
    const response = await this.client.post('/auth/login', data);
    console.log('✅ Login successful');
    
    const { accessToken } = response.data.data;

    Cookies.set('accessToken', accessToken, {
      expires: 1 / 96, // 15 minutes
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } finally {
      Cookies.remove('accessToken');
    }
  }

  async refreshToken() {
    const response = await this.client.post('/auth/refresh');
    return response.data;
  }

  // Workout methods
  async getTodayWorkout() {
    const response = await this.client.get('/workouts/today');
    return response.data;
  }

  async completeWorkout(workoutDayId: string) {
    const response = await this.client.patch(`/workouts/${workoutDayId}/complete`);
    return response.data;
  }

  // Set record methods
  async createSetRecord(data: {
    workoutDayId: string;
    exerciseId: string;
    setIndex: number;
    plannedWeight?: number;
    plannedReps?: number;
    actualWeight?: number;
    actualReps?: number;
    secondsRest?: number;
  }) {
    const response = await this.client.post('/set-records', data);
    return response.data;
  }

  // Exercise methods
  async getExercises() {
    const response = await this.client.get('/exercises');
    return response.data;
  }

  // Generic methods
  async get<T = any>(url: string): Promise<AxiosResponse<T>> {
    return this.client.get(url);
  }

  async post<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.post(url, data);
  }

  async put<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.put(url, data);
  }

  async patch<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data);
  }

  async delete<T = any>(url: string): Promise<AxiosResponse<T>> {
    return this.client.delete(url);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
