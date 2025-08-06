import React, { useEffect, useState } from 'react';
import { testBackendConnection } from '../utils/test-connection';

const OAuthCallback: React.FC = () => {
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    // 중복 처리 방지
    if (processed) return;

    const handleCallback = async () => {
      setProcessed(true);
      
      // URL에서 code와 error 파라미터 추출
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      console.log('🔍 OAuth Callback received:', { code, error, url: window.location.href });
      
      // 백엔드 연결 테스트
      const healthCheck = await testBackendConnection();
      console.log('Backend health check result:', healthCheck);
      
      // URL을 즉시 정리해서 재사용 방지
      if (code) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // 부모 윈도우에 결과 전달
      if (window.opener) {
        console.log('💬 Sending message to parent window');
        window.opener.postMessage({
          type: 'OAUTH_CALLBACK',
          code,
          error
        }, window.location.origin);
        
        // 조금 기다렸다가 팝업 윈도우 닫기
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        // opener가 없으면 일반 페이지로 리다이렉트
        console.warn('No opener found, redirecting to main page');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    };
    
    handleCallback();
  }, [processed]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          {/* Loading spinner */}
          <div className="w-16 h-16 border-4 border-cta-200 border-t-cta-600 rounded-full animate-spin mx-auto mb-4"></div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-foreground">
          Processing Login...
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Please wait while we complete your GitHub authentication.
        </p>
        
        <p className="text-sm text-muted-foreground">
          This window will close automatically.
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;