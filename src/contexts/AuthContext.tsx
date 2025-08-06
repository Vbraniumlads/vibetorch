import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { githubService, GitHubUser } from '@/lib/github';

interface AuthContextType {
  user: GitHubUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  handleAuthCallback: (code: string, state: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing session with backend
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/auth/user`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const { user: sessionUser } = await response.json();
          setUser(sessionUser);
        } else {
          // Fallback to local storage check
          if (githubService.isAuthenticated()) {
            try {
              const currentUser = await githubService.getCurrentUser();
              setUser(currentUser);
            } catch (error) {
              console.error('Failed to get current user:', error);
              githubService.clearToken();
            }
          }
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
        // Fallback to local auth check
        if (githubService.isAuthenticated()) {
          try {
            const currentUser = await githubService.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            console.error('Failed to get current user:', error);
            githubService.clearToken();
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = () => {
    const loginUrl = githubService.getLoginUrl();
    window.location.href = loginUrl;
  };

  const logout = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      githubService.clearToken();
      setUser(null);
    }
  };

  const handleAuthCallback = async (code: string, state: string) => {
    try {
      setIsLoading(true);
      await githubService.exchangeCodeForToken(code, state);
      const currentUser = await githubService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    handleAuthCallback,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};