# Railway 배포 가이드 (FastAPI)

VibeTorch를 Railway에 배포하기 위한 단계별 가이드입니다.

## 🚀 Railway 배포 준비

### 1. Railway 계정 생성
1. [Railway.app](https://railway.app) 접속
2. GitHub 계정으로 로그인
3. 새 프로젝트 생성

### 2. 서비스 구성

Railway에서 다음 서비스들을 생성해야 합니다:

#### A. FastAPI Backend 서비스
- **소스**: `./server` 폴더
- **프레임워크**: FastAPI + Uvicorn
- **포트**: 8000
- **헬스체크**: `/api/health`

#### B. Redis 서비스 (세션 저장용)
- Railway Template에서 Redis 추가
- 자동으로 `REDIS_URL` 환경변수 생성됨

#### C. Frontend 서비스 (선택사항)
- **소스**: 루트 폴더
- Vite 빌드 후 정적 호스팅

## 🔧 환경 변수 설정

### FastAPI Backend 서비스 환경변수:
```
PORT=8000
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
SESSION_SECRET=your_super_secret_session_key
FRONTEND_URL=https://your-frontend-domain.railway.app
REDIS_URL=redis://... (Railway가 자동 생성)
```

### Frontend 서비스 환경변수:
```
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GITHUB_APP_ID=your_github_app_id
VITE_APP_URL=https://your-frontend-domain.railway.app
VITE_API_URL=https://your-backend-domain.railway.app
```

## 📝 배포 단계

### 1. Repository 연결
```bash
# Railway CLI 설치 (선택사항)
npm install -g @railway/cli

# 프로젝트 연결
railway login
railway link
```

### 2. 서비스별 배포

#### Backend 배포:
1. Railway 대시보드에서 "New Service" 클릭
2. "Deploy from GitHub repo" 선택
3. 이 repository 선택
4. Root Directory를 `./server`로 설정
5. 환경변수 추가
6. Deploy 클릭

#### Redis 추가:
1. "New Service" → "Database" → "Add Redis"
2. 자동으로 `REDIS_URL` 생성됨

#### Frontend 배포:
1. 새 서비스 생성
2. Root Directory를 `.` (루트)로 설정
3. Build Command: `npm run build`
4. Start Command: `npm run preview` 또는 정적 호스팅 사용

### 3. 도메인 설정
1. 각 서비스에서 "Settings" → "Domains"
2. 커스텀 도메인 추가 또는 Railway 도메인 사용
3. 환경변수에서 도메인 URL 업데이트

### 4. GitHub App 설정 업데이트
1. GitHub Developer Settings로 이동
2. GitHub App 설정에서 URLs 업데이트:
   - **Homepage URL**: `https://your-frontend-domain.railway.app`
   - **Callback URL**: `https://your-frontend-domain.railway.app/auth/callback`

## 🔍 배포 확인

### 1. 백엔드 헬스체크
```bash
curl https://your-backend-domain.railway.app/api/health
```

응답 예시:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "sessions": 0
}
```

### 2. 프론트엔드 접속
- `https://your-frontend-domain.railway.app` 접속
- GitHub 로그인 테스트

### 3. 세션 테스트
1. GitHub 로그인
2. 페이지 새로고침 후 로그인 상태 유지 확인
3. 리포지토리 목록 로딩 확인

## 🛠 트러블슈팅

### 자주 발생하는 문제들:

#### 1. CORS 오류
```javascript
// server/index.js에서 CORS 설정 확인
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

#### 2. 세션 문제
- Redis 연결 상태 확인
- `REDIS_URL` 환경변수 확인
- 쿠키 설정 확인 (secure, sameSite)

#### 3. GitHub OAuth 오류
- Callback URL이 정확한지 확인
- Client ID/Secret이 올바른지 확인
- GitHub App이 활성화되어 있는지 확인

#### 4. 빌드 실패
```bash
# 로컬에서 테스트
cd server
npm install
npm start

# 프론트엔드 빌드 테스트
npm run build
```

## 📊 모니터링

Railway 대시보드에서 확인할 수 있는 항목들:
- 서비스 상태 및 로그
- 리소스 사용량
- 배포 기록
- 환경변수 설정

## 🔐 보안 권장사항

1. **환경변수 보안**:
   - `SESSION_SECRET`은 강력한 랜덤 문자열 사용
   - GitHub 시크릿은 절대 코드에 포함하지 말 것

2. **도메인 보안**:
   - HTTPS 강제 사용
   - CORS 정확히 설정

3. **세션 보안**:
   - Redis에 TTL 설정
   - 적절한 쿠키 설정

## 💡 팁

- Railway는 자동으로 코드 변경시 재배포됩니다
- 로그는 Railway 대시보드에서 실시간으로 확인 가능
- 환경변수 변경시 서비스 재시작 필요
- Redis 메모리 사용량 모니터링 권장