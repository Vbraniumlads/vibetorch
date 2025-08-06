import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth as useFeatureAuth } from '@/features/auth/hooks/useAuth';

interface AuthContextType {
  isAuthenticated: boolean;
  githubUsername: string | null;
  setIsAuthenticated: (value: boolean) => void;
  setGithubUsername: (username: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const featureAuth = useFeatureAuth();

  useEffect(() => {
    if (featureAuth.isAuthenticated && featureAuth.user) {
      setIsAuthenticated(true);
      setGithubUsername(featureAuth.user.login || featureAuth.user.username || 'github-user');
    } else if (!featureAuth.isLoading) {
      setIsAuthenticated(false);
      setGithubUsername(null);
    }
  }, [featureAuth.isAuthenticated, featureAuth.user, featureAuth.isLoading]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, githubUsername, setIsAuthenticated, setGithubUsername }}>
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
