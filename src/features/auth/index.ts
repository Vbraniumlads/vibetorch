// Auth feature exports
export { useAuth } from './hooks/useAuth';
export { authService } from './services/auth.service';
export { GitHubLoginButton } from './components/GitHubLoginButton';
export { LoginPage } from './components/LoginPage';
export { UserProfile } from './components/UserProfile';

// Types
export type { User, AuthResponse, LoginRequest, AuthState } from './types/auth.types';