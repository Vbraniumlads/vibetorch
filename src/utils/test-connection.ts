// 백엔드 연결 테스트 유틸리티
export async function testBackendConnection() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  
  try {
    console.log('🔍 Testing backend connection...');
    console.log('API_BASE_URL:', API_BASE_URL);
    
    const healthUrl = 'http://localhost:3001/health';
    console.log('Testing health endpoint:', healthUrl);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('Health check response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is healthy:', data);
      return { success: true, data };
    } else {
      console.log('❌ Backend health check failed');
      return { success: false, status: response.status };
    }
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// OAuth API 테스트
export async function testOAuthEndpoint(code: string) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  
  try {
    console.log('🔍 Testing OAuth endpoint...');
    
    const oauthUrl = `${API_BASE_URL}/auth/login`;
    console.log('Testing OAuth endpoint:', oauthUrl);
    
    const response = await fetch(oauthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    
    console.log('OAuth response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    const data = await response.json().catch(() => null);
    console.log('OAuth response data:', data);
    
    return { 
      success: response.ok, 
      status: response.status, 
      data 
    };
    
  } catch (error) {
    console.error('❌ OAuth endpoint test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}