import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';
import type { User, AuthState } from '../types/auth.types';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  const login = useCallback(async (token: string, userData: User) => {
    authService.setToken(token);
    setState(prev => ({
      ...prev,
      isAuthenticated: true,
      user: userData,
    }));
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.removeToken();
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
      }));
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const token = authService.getToken();
    if (!token) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const response = await authService.getCurrentUser();
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: response.user,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Auth check failed:', error);
      authService.removeToken();
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        isLoading: false,
      }));
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...state,
    login,
    logout,
    checkAuth,
  };
}