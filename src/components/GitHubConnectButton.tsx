import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { authService } from '../features/auth/services/auth.service';
import { toast } from 'sonner';

interface GitHubConnectButtonProps {
  isLoading: boolean;
  onLoginStart: () => void;
  onLoginSuccess: (token: string, user: any) => void;
}

export function GitHubConnectButton({ 
  isLoading, 
  onLoginStart, 
  onLoginSuccess 
}: GitHubConnectButtonProps) {
  const [authPopup, setAuthPopup] = useState<Window | null>(null);
  const [processedCodes, setProcessedCodes] = useState<Set<string>>(new Set());
  
  const handleConnect = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    
    if (!clientId) {
      toast.error('GitHub client ID not configured');
      return;
    }

    onLoginStart();
    
    // 팝업 윈도우로 OAuth 처리
    const redirectUri = `${window.location.origin}/oauth-callback`;
    const scope = 'read:user,repo';
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    
    // 팝업 윈도우 설정
    const popup = window.open(
      githubAuthUrl,
      'github-oauth',
      'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes'
    );
    
    setAuthPopup(popup);
    
    if (popup) {
      // 팝업이 닫혔는지 주기적으로 확인
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setAuthPopup(null);
          // 만약 성공하지 못했으면 로딩 상태 해제
          // (성공했으면 이미 onLoginSuccess가 호출되어서 상관없음)
        }
      }, 1000);
    }
  };

  // postMessage를 통한 OAuth 콜백 처리
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // 보안: origin 체크
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'OAUTH_CALLBACK') {
        const { code, error } = event.data;
        
        if (error) {
          toast.error('GitHub authentication was cancelled or failed');
          if (authPopup) {
            authPopup.close();
            setAuthPopup(null);
          }
          return;
        }

        if (code) {
          // 중복 처리 방지 - 이미 처리한 코드인지 확인
          if (processedCodes.has(code)) {
            console.log('⚠️ Code already processed, ignoring:', code);
            return;
          }
          
          // 처리할 코드로 등록
          setProcessedCodes(prev => new Set(prev.add(code)));
          
          try {
            console.log('🔄 Exchanging GitHub code for token...', code);
            const result = await authService.login({ code });
            console.log('✅ Login successful:', result);
            
            // 팝업 닫기
            if (authPopup) {
              authPopup.close();
              setAuthPopup(null);
            }
            
            onLoginSuccess(result.token, result.user);
            
            toast.success('Successfully logged in with GitHub!');
          } catch (error) {
            console.error('❌ Login error:', error);
            toast.error(`Failed to login with GitHub: ${error instanceof Error ? error.message : 'Unknown error'}`);
            
            // 실패한 코드는 제거해서 재시도 가능하게 함
            setProcessedCodes(prev => {
              const newSet = new Set(prev);
              newSet.delete(code);
              return newSet;
            });
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [authPopup, onLoginSuccess, processedCodes]);

  return (
    <Button 
      onClick={handleConnect}
      disabled={isLoading}
      className="w-full py-4 px-6 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 text-white font-medium transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <span className="flex items-center gap-2">
            Opening GitHub...
            <span className="animate-pulse">🚀</span>
          </span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span className="flex items-center gap-2">
            Connect GitHub
            <span className="text-sm opacity-75">✨</span>
          </span>
        </>
      )}
      
      {/* Subtle gradient overlay for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
    </Button>
  );
}