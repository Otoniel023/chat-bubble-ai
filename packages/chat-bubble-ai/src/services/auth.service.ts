/**
 * Authentication service
 * Handles all authentication-related API calls
 */

import { apiClient } from '../utils/api';
import { storage } from '../utils/storage';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from '../types/auth.types';

export class AuthService {
  /**
   * Register a new user
   * POST /auth/register
   */
  async register(email: string, password: string): Promise<User> {
    const requestBody: RegisterRequest = { email, password };

    const response = await apiClient.post<AuthResponse>(
      '/auth/register',
      requestBody
    );

    // Store tokens and user data
    storage.setAccessToken(response.accessToken);
    storage.setRefreshToken(response.refreshToken);

    const user: User = {
      id: response.userId,
      email: response.email,
    };

    storage.setUser(user);

    return user;
  }

  /**
   * Login an existing user
   * POST /auth/login
   */
  async login(email: string, password: string): Promise<User> {
    const requestBody: LoginRequest = { email, password };

    const response = await apiClient.post<AuthResponse>(
      '/auth/login',
      requestBody
    );

    // Store tokens and user data
    storage.setAccessToken(response.accessToken);
    storage.setRefreshToken(response.refreshToken);

    const user: User = {
      id: response.userId,
      email: response.email,
    };

    storage.setUser(user);

    return user;
  }

  /**
   * Logout the current user
   */
  logout(): void {
    storage.clearAuth();
  }

  /**
   * Get the currently authenticated user from storage
   */
  getCurrentUser(): User | null {
    return storage.getUser();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return storage.isAuthenticated();
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return storage.getAccessToken();
  }

  /**
   * Get the current refresh token
   */
  getRefreshToken(): string | null {
    return storage.getRefreshToken();
  }

  /**
   * Refresh the access token using refresh token
   * POST /auth/refresh
   */
  async refreshToken(): Promise<AuthResponse> {
    const accessToken = storage.getAccessToken();
    const refreshToken = storage.getRefreshToken();

    if (!refreshToken || !accessToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<AuthResponse>(
      '/auth/refresh',
      { accessToken, refreshToken }
    );

    // Store new tokens
    storage.setAccessToken(response.accessToken);
    storage.setRefreshToken(response.refreshToken);

    return response;
  }
}

// Export singleton instance
export const authService = new AuthService();
