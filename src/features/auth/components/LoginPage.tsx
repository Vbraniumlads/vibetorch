import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Github } from 'lucide-react';
import { GitHubLoginButton } from './GitHubLoginButton';
import { authService } from '../services/auth.service';
import { toast } from 'sonner';
import type { User } from '../types/auth.types';

interface LoginPageProps {
  onLoginSuccess: (token: string, user: User) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthCallback = async (code: string) => {
    try {
      setIsLoading(true);
      const result = await authService.login({ code });
      onLoginSuccess(result.token, result.user);
      toast.success('Successfully logged in!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login with GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      toast.error('GitHub authentication was cancelled or failed');
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code) {
      handleAuthCallback(code);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Github className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>
            Sign in with your GitHub account to access your project dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GitHubLoginButton 
            isLoading={isLoading}
            onLoginStart={() => setIsLoading(true)}
          />
        </CardContent>
      </Card>
    </div>
  );
}