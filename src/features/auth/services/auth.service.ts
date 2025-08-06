import { apiClient } from '../../../shared/services/api.service';
import { secureStorage } from '../../../utils/secure-storage';
import type { AuthResponse, LoginRequest, User } from '../types/auth.types';

export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly TOKEN_EXPIRY_MINUTES = 1440; // 24시간

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    
    // 로그인 성공 시 토큰과 사용자 정보를 안전하게 저장
    if (response.token) {
      this.setToken(response.token);
      if (response.user) {
        this.setUser(response.user);
      }
    }
    
    return response;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>('/auth/verify');
  }

  async logout(): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<{ message: string }>('/auth/logout');
      return response;
    } finally {
      // 로그아웃 시 모든 데이터 정리
      this.clearAuthData();
    }
  }

  setToken(token: string): void {
    secureStorage.setToken(this.TOKEN_KEY, token, this.TOKEN_EXPIRY_MINUTES);
    
    // API 클라이언트에도 토큰 설정
    apiClient.setToken(token);
  }

  getToken(): string | null {
    const token = secureStorage.getToken(this.TOKEN_KEY);
    
    // 토큰이 곧 만료되는 경우 알림
    if (token && secureStorage.isTokenExpiringSoon(this.TOKEN_KEY)) {
      console.warn('⚠️ Token expires soon, consider refreshing');
      // TODO: 토큰 갱신 로직 구현
    }
    
    return token;
  }

  removeToken(): void {
    secureStorage.removeToken(this.TOKEN_KEY);
    apiClient.removeToken();
  }

  setUser(user: User): void {
    secureStorage.setUser(user, this.TOKEN_EXPIRY_MINUTES);
  }

  getUser(): User | null {
    return secureStorage.getUser();
  }

  clearAuthData(): void {
    secureStorage.removeToken(this.TOKEN_KEY);
    secureStorage.removeUser();
    apiClient.removeToken();
  }

  /**
   * 토큰 만료 시간 확인
   */
  getTokenExpiry(): Date | null {
    const expiry = secureStorage.getTokenExpiry(this.TOKEN_KEY);
    return expiry ? new Date(expiry) : null;
  }

  /**
   * 토큰이 유효한지 확인
   */
  isTokenValid(): boolean {
    return this.getToken() !== null;
  }
}

export const authService = new AuthService();