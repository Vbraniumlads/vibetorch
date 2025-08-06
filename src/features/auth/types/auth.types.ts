export interface User {
  id: number;
  username: string;
  name?: string;
  avatar_url?: string;
  email?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  code: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}