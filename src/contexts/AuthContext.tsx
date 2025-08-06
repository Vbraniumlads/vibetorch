import React, { createContext, useContext, useState, ReactNode } from 'react';

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