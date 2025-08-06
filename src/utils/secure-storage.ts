// 브라우저 보안 저장소 유틸리티
interface StorageItem<T> {
  value: T;
  expiry: number;
  created: number;
}

class SecureStorage {
  private prefix = 'vibetorch_';

  /**
   * 토큰을 안전하게 저장 (만료 시간 포함)
   */
  setToken(key: string, value: string, expiryMinutes: number = 1440): void { // 기본 24시간
    const item: StorageItem<string> = {
      value,
      expiry: Date.now() + (expiryMinutes * 60 * 1000),
      created: Date.now()
    };

    try {
      // sessionStorage 우선 시도 (보다 안전)
      sessionStorage.setItem(`${this.prefix}${key}`, JSON.stringify(item));
      console.log(`🔐 Token stored securely (expires in ${expiryMinutes} minutes)`);
    } catch (error) {
      // sessionStorage 실패 시 localStorage 사용
      console.warn('⚠️ SessionStorage failed, falling back to localStorage');
      localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(item));
    }
  }

  /**
   * 토큰 가져오기 (만료 시간 확인)
   */
  getToken(key: string): string | null {
    try {
      // sessionStorage 먼저 확인
      let itemStr = sessionStorage.getItem(`${this.prefix}${key}`);
      
      // sessionStorage에 없으면 localStorage 확인
      if (!itemStr) {
        itemStr = localStorage.getItem(`${this.prefix}${key}`);
      }

      if (!itemStr) return null;

      const item: StorageItem<string> = JSON.parse(itemStr);
      
      // 만료 시간 확인
      if (Date.now() > item.expiry) {
        console.log('🔓 Token expired, removing from storage');
        this.removeToken(key);
        return null;
      }

      console.log('🔑 Valid token found in storage');
      return item.value;
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
      this.removeToken(key);
      return null;
    }
  }

  /**
   * 토큰 삭제
   */
  removeToken(key: string): void {
    sessionStorage.removeItem(`${this.prefix}${key}`);
    localStorage.removeItem(`${this.prefix}${key}`);
    console.log('🗑️ Token removed from storage');
  }

  /**
   * 사용자 정보 저장 (민감하지 않은 데이터)
   */
  setUser(userData: any, expiryMinutes: number = 1440): void {
    const item: StorageItem<any> = {
      value: userData,
      expiry: Date.now() + (expiryMinutes * 60 * 1000),
      created: Date.now()
    };

    try {
      localStorage.setItem(`${this.prefix}user`, JSON.stringify(item));
    } catch (error) {
      console.error('❌ Error storing user data:', error);
    }
  }

  /**
   * 사용자 정보 가져오기
   */
  getUser(): any | null {
    try {
      const itemStr = localStorage.getItem(`${this.prefix}user`);
      if (!itemStr) return null;

      const item: StorageItem<any> = JSON.parse(itemStr);
      
      if (Date.now() > item.expiry) {
        this.removeUser();
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('❌ Error retrieving user data:', error);
      this.removeUser();
      return null;
    }
  }

  /**
   * 사용자 정보 삭제
   */
  removeUser(): void {
    localStorage.removeItem(`${this.prefix}user`);
  }

  /**
   * 모든 데이터 삭제
   */
  clearAll(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });

    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        sessionStorage.removeItem(key);
      }
    });

    console.log('🧹 All VibeTorch data cleared from storage');
  }

  /**
   * 토큰 만료 시간 확인
   */
  getTokenExpiry(key: string): number | null {
    try {
      let itemStr = sessionStorage.getItem(`${this.prefix}${key}`);
      if (!itemStr) {
        itemStr = localStorage.getItem(`${this.prefix}${key}`);
      }

      if (!itemStr) return null;

      const item: StorageItem<string> = JSON.parse(itemStr);
      return item.expiry;
    } catch (error) {
      return null;
    }
  }

  /**
   * 토큰이 곧 만료되는지 확인 (30분 이내)
   */
  isTokenExpiringSoon(key: string): boolean {
    const expiry = this.getTokenExpiry(key);
    if (!expiry) return false;
    
    const thirtyMinutes = 30 * 60 * 1000;
    return (expiry - Date.now()) < thirtyMinutes;
  }
}

export const secureStorage = new SecureStorage();