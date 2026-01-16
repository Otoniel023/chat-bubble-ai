/**
 * API client configuration and utilities
 */

import { storage } from './storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private subscribeTokenRefresh(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  private async refreshTokens(): Promise<string> {
    const accessToken = storage.getAccessToken();
    const refreshToken = storage.getRefreshToken();

    if (!refreshToken || !accessToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken, refreshToken }),
    });

    if (!response.ok) {
      storage.clearAuth();
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    storage.setAccessToken(data.accessToken);
    storage.setRefreshToken(data.refreshToken);

    return data.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization token if available
    const token = storage.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
        if (!this.isRefreshing) {
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshTokens();
            this.isRefreshing = false;
            this.onRefreshed(newToken);

            // Retry original request with new token
            headers['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(url, { ...config, headers });

            const contentType = retryResponse.headers.get('content-type');
            if (contentType && !contentType.includes('application/json')) {
              return retryResponse as unknown as T;
            }

            const retryData = await retryResponse.json();

            if (!retryResponse.ok) {
              throw new Error(retryData.error || `HTTP error! status: ${retryResponse.status}`);
            }

            return retryData as T;
          } catch (refreshError) {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
            throw refreshError;
          }
        } else {
          // Wait for token refresh to complete
          return new Promise((resolve, reject) => {
            this.subscribeTokenRefresh(async (newToken: string) => {
              try {
                headers['Authorization'] = `Bearer ${newToken}`;
                const retryResponse = await fetch(url, { ...config, headers });

                const contentType = retryResponse.headers.get('content-type');
                if (contentType && !contentType.includes('application/json')) {
                  resolve(retryResponse as unknown as T);
                  return;
                }

                const retryData = await retryResponse.json();

                if (!retryResponse.ok) {
                  reject(new Error(retryData.error || `HTTP error! status: ${retryResponse.status}`));
                  return;
                }

                resolve(retryData as T);
              } catch (error) {
                reject(error);
              }
            });
          });
        }
      }

      // Handle non-JSON responses (like streaming)
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        return response as unknown as T;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { API_BASE_URL };
