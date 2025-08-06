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
    authService.setUser(userData);
    setState(prev => ({
      ...prev,
      isAuthenticated: true,
      user: userData,
    }));
    
    console.log('✅ Login successful, data stored securely');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // AuthService.logout()에서 이미 clearAuthData()를 호출함
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
      }));
      console.log('👋 Logout successful, all data cleared');
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const token = authService.getToken();
    if (!token) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // 저장된 사용자 정보 먼저 로드
    const savedUser = authService.getUser();
    if (savedUser) {
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: savedUser,
        isLoading: false,
      }));
    }

    // 백그라운드에서 토큰 검증
    try {
      const response = await authService.getCurrentUser();
      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: response.user,
        isLoading: false,
      }));
      
      // 사용자 정보 업데이트
      authService.setUser(response.user);
    } catch (error) {
      console.error('Auth verification failed:', error);
      authService.clearAuthData();
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