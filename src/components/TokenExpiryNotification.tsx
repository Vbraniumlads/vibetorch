import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { authService } from '../features/auth/services/auth.service';
import { useAuth } from '../features/auth';

export function TokenExpiryNotification() {
  const { isAuthenticated, logout } = useAuth();
  const [expiryCheckInterval, setExpiryCheckInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (expiryCheckInterval) {
        clearInterval(expiryCheckInterval);
        setExpiryCheckInterval(null);
      }
      return;
    }

    // Clear existing interval before setting new one
    if (expiryCheckInterval) {
      clearInterval(expiryCheckInterval);
    }

    // 5분마다 토큰 만료 시간 확인
    const interval = setInterval(() => {
      const expiry = authService.getTokenExpiry();
      if (!expiry) return;

      const now = Date.now();
      const timeUntilExpiry = expiry.getTime() - now;
      
      // 30분 이내 만료 예정
      if (timeUntilExpiry <= 30 * 60 * 1000 && timeUntilExpiry > 0) {
        const minutesLeft = Math.floor(timeUntilExpiry / (60 * 1000));
        
        toast.warning(
          `Your session expires in ${minutesLeft} minutes. Please save your work.`,
          {
            duration: 10000,
            action: {
              label: 'Refresh Session',
              onClick: () => {
                // TODO: 토큰 갱신 로직
                console.log('TODO: Refresh token');
              }
            }
          }
        );
      }
      
      // 이미 만료된 경우
      if (timeUntilExpiry <= 0) {
        toast.error('Your session has expired. Please log in again.');
        logout();
      }
    }, 5 * 60 * 1000); // 5분마다 확인

    setExpiryCheckInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated, logout]);

  // 컴포넌트는 UI를 렌더링하지 않음 (notification only)
  return null;
}