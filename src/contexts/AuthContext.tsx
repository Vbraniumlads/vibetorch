import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth as useNewAuth } from '../features/auth';
import type { User } from '../features/auth/types/auth.types';

interface AuthContextType {
  isAuthenticated: boolean;
  githubUsername: string | null;
  user: User | null;
  setIsAuthenticated: (value: boolean) => void;
  setGithubUsername: (username: string | null) => void;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [legacyAuthenticated, setLegacyAuthenticated] = useState(false);
  const [legacyUsername, setLegacyUsername] = useState<string | null>(null);
  
  // Use the new auth system
  const newAuth = useNewAuth();

  // Merge legacy and new auth states
  const isAuthenticated = newAuth.isAuthenticated || legacyAuthenticated;
  const user = newAuth.user;
  const githubUsername = user?.username || legacyUsername;

  const login = (token: string, userData: User) => {
    newAuth.login(token, userData);
    setLegacyAuthenticated(true);
    setLegacyUsername(userData.username);
  };

  const logout = async () => {
    await newAuth.logout();
    setLegacyAuthenticated(false);
    setLegacyUsername(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      githubUsername, 
      user,
      setIsAuthenticated: setLegacyAuthenticated, 
      setGithubUsername: setLegacyUsername,
      login,
      logout,
      isLoading: newAuth.isLoading
    }}>
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