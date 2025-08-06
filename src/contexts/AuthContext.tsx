import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '../features/auth';
import type { User } from '../features/auth/types/auth.types';

interface AuthContextType {
  isAuthenticated: boolean;
  githubUsername: string | null;
  user: User | null;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook();

  const contextValue: AuthContextType = {
    isAuthenticated: auth.isAuthenticated,
    githubUsername: auth.user?.username || null,
    user: auth.user,
    login: auth.login,
    logout: auth.logout,
    checkAuth: auth.checkAuth,
    isLoading: auth.isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}