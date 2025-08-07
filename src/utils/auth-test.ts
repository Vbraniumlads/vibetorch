// 인증 시스템 테스트 유틸리티
import { authService } from '../features/auth/services/auth.service';

export class AuthTestUtil {
  /**
   * 현재 인증 상태 출력
   */
  static logAuthState() {
    const token = authService.getToken();
    const expiry = authService.getTokenExpiry();
    const isValid = authService.isTokenValid();
    
    console.log('🔍 Current Auth State:');
    console.log('- Token exists:', !!token);
    console.log('- Token valid:', isValid);
    console.log('- Token expiry:', expiry);
    console.log('- Time until expiry:', expiry ? Math.round((expiry.getTime() - Date.now()) / 1000 / 60) + ' minutes' : 'N/A');
  }

  /**
   * 스토리지 상태 확인
   */
  static checkStorageState() {
    console.log('🗄️ Storage State:');
    
    // sessionStorage 확인
    const sessionKeys = Object.keys(sessionStorage).filter(key => key.startsWith('vibetorch_'));
    console.log('- SessionStorage keys:', sessionKeys);
    
    // localStorage 확인
    const localKeys = Object.keys(localStorage).filter(key => key.startsWith('vibetorch_'));
    console.log('- LocalStorage keys:', localKeys);
  }

  /**
   * 인증 상태 완전 초기화 (테스트용)
   */
  static clearAllAuthData() {
    authService.clearAuthData();
    
    // 추가로 모든 vibetorch 관련 데이터 정리
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('vibetorch_')) {
        sessionStorage.removeItem(key);
      }
    });
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('vibetorch_')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('🧹 All auth data cleared');
  }

  /**
   * 만료 시간 시뮬레이션 (테스트용)
   */
  static simulateTokenExpiry() {
    const storagePrefix = 'vibetorch_';
    const tokenKey = `${storagePrefix}auth_token`;
    
    // 현재 토큰을 만료된 상태로 변경
    const itemStr = sessionStorage.getItem(tokenKey) || localStorage.getItem(tokenKey);
    if (itemStr) {
      try {
        const item = JSON.parse(itemStr);
        item.expiry = Date.now() - 1000; // 1초 전에 만료
        
        const newItemStr = JSON.stringify(item);
        if (sessionStorage.getItem(tokenKey)) {
          sessionStorage.setItem(tokenKey, newItemStr);
        } else {
          localStorage.setItem(tokenKey, newItemStr);
        }
        
        console.log('⏰ Token expiry simulated');
      } catch (error) {
        console.error('Error simulating token expiry:', error);
      }
    }
  }
}

// 개발 환경에서 전역으로 사용할 수 있도록 설정
if (import.meta.env.DEV) {
  (window as any).authTest = AuthTestUtil;
  console.log('🔧 AuthTestUtil available as window.authTest');
}