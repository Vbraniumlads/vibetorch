import React from 'react';
import { Button } from '../../../shared/components/ui/button';
import { Github, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GitHubLoginButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
  onLoginStart?: () => void;
}

export function GitHubLoginButton({ 
  isLoading = false, 
  disabled = false,
  onLoginStart 
}: GitHubLoginButtonProps) {
  const handleLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    
    if (!clientId) {
      toast.error('GitHub client ID not configured');
      return;
    }

    onLoginStart?.();
    
    const redirectUri = `${window.location.origin}/oauth-callback`;
    const scope = 'read:user,repo';
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    
    window.location.href = githubAuthUrl;
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading || disabled}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <Github className="mr-2 h-4 w-4" />
          Sign in with GitHub
        </>
      )}
    </Button>
  );
}