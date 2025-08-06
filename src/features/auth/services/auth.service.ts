import { apiClient } from '../../../shared/services/api.service';
import type { AuthResponse, LoginRequest, User } from '../types/auth.types';

export class AuthService {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/github', data);
    return response;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>('/auth/me');
  }

  async logout(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/logout');
    return response;
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  removeToken(): void {
    localStorage.removeItem('auth_token');
  }
}

export const authService = new AuthService();