import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useFeatureAuth } from '@/features/auth/hooks/useAuth';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useFeatureAuth();
  const { setIsAuthenticated, setGithubUsername } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        toast.error('GitHub authentication was cancelled or failed');
        navigate('/');
        return;
      }

      if (code) {
        try {
          const authService = await import('@/features/auth/services/auth.service');
          const result = await authService.authService.login({ code });
          
          await login(result.token, result.user);
          setGithubUsername(result.user.login || result.user.username || 'github-user');
          setIsAuthenticated(true);
          
          toast.success('Successfully logged in!');
          navigate('/?auth=success');
        } catch (error) {
          console.error('Login error:', error);
          toast.error('Failed to login with GitHub');
          navigate('/');
        }
      } else {
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, login, setIsAuthenticated, setGithubUsername]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-cta-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing GitHub authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
