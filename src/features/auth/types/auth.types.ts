export interface User {
  id: number;
  github_id: string;
  username: string;
  login?: string;
  name?: string;
  avatar_url?: string;
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
