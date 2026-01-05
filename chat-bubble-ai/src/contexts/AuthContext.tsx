/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import type { AuthContextValue, User } from '../types/auth.types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from storage on mount and auto-login if needed
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuth = authService.isAuthenticated();
        const storedUser = authService.getCurrentUser();
        const storedAccessToken = authService.getAccessToken();
        const storedRefreshToken = authService.getRefreshToken();

        if (isAuth && storedUser && storedAccessToken) {
          setIsAuthenticated(true);
          setUser(storedUser);
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setIsLoading(false);
          return;
        }

        // Auto-login with credentials from environment variables
        const envEmail = import.meta.env.VITE_AUTH_EMAIL;
        const envPassword = import.meta.env.VITE_AUTH_PASSWORD;

        if (envEmail && envPassword) {
          console.log('Auto-login with credentials from environment variables...');
          try {
            const loggedInUser = await authService.login(envEmail, envPassword);
            const token = authService.getAccessToken();
            const refresh = authService.getRefreshToken();

            setUser(loggedInUser);
            setAccessToken(token);
            setRefreshToken(refresh);
            setIsAuthenticated(true);
          } catch (err) {
            console.error('Auto-login failed:', err);
            setError('Auto-login failed. Check credentials in .env file.');
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const loggedInUser = await authService.login(email, password);
      const token = authService.getAccessToken();
      const refresh = authService.getRefreshToken();

      setUser(loggedInUser);
      setAccessToken(token);
      setRefreshToken(refresh);
      setIsAuthenticated(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to login';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const registeredUser = await authService.register(email, password);
      const token = authService.getAccessToken();
      const refresh = authService.getRefreshToken();

      setUser(registeredUser);
      setAccessToken(token);
      setRefreshToken(refresh);
      setIsAuthenticated(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to register';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextValue = {
    isAuthenticated,
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
