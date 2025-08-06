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
    try {
      // 토큰만 저장하고 사용자 정보는 저장하지 않음
      authService.setToken(token);
      
      setState({
        isAuthenticated: true,
        user: userData,
        isLoading: false,
      });
      
      console.log('✅ Login successful, token stored securely');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // 서버에 로그아웃 요청
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // 서버 에러가 있어도 클라이언트는 로그아웃 처리
    } finally {
      // 완전한 페이지 리로드로 모든 상태 초기화
      console.log('👋 Logout successful, reloading page...');
      window.location.reload();
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const token = authService.getToken();
      if (!token) {
        setState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
        return;
      }

      // 토큰이 있으면 서버에서 사용자 정보 검증 및 가져오기
      const response = await authService.getCurrentUser();
      
      setState({
        isAuthenticated: true,
        user: response.user,
        isLoading: false,
      });
      
      console.log('✅ Auth verification successful, user data loaded from server');
    } catch (error) {
      console.error('Auth verification failed:', error);
      
      // 토큰이 유효하지 않거나 서버 에러 시 완전 초기화
      authService.clearAuthData();
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  }, []);

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 페이지 포커스 시 토큰 유효성 재확인 (옵션)
  useEffect(() => {
    const handleFocus = () => {
      if (state.isAuthenticated && authService.getToken()) {
        checkAuth();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [state.isAuthenticated, checkAuth]);

  return {
    ...state,
    login,
    logout,
    checkAuth,
  };
}