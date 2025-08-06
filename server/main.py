from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.middleware.sessions import SessionMiddleware
import httpx
import os
import redis
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="VibeTorch Backend API",
    description="Backend API for VibeTorch GitHub integration",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Session middleware
app.add_middleware(
    SessionMiddleware, 
    secret_key=os.getenv("SESSION_SECRET", "your-secret-key")
)

# Redis connection
redis_client = None
if os.getenv("REDIS_URL"):
    try:
        redis_client = redis.from_url(os.getenv("REDIS_URL"), decode_responses=True)
        redis_client.ping()
        logger.info("✅ Connected to Redis")
    except Exception as e:
        logger.error(f"❌ Redis connection failed: {e}")
        redis_client = None
else:
    logger.warning("⚠️ No Redis URL provided, using memory sessions")

# In-memory fallback for sessions
memory_sessions: Dict[str, Dict[str, Any]] = {}

# Pydantic models
class GitHubCodeRequest(BaseModel):
    code: str

class GitHubUser(BaseModel):
    id: int
    login: str
    name: Optional[str]
    email: Optional[str]
    avatar_url: str

class Repository(BaseModel):
    id: int
    name: str
    full_name: str
    description: Optional[str]
    private: bool
    html_url: str
    updated_at: str
    language: Optional[str]
    stargazers_count: int
    forks_count: int

# Session helpers
def get_session_data(session_id: str) -> Optional[Dict[str, Any]]:
    if redis_client:
        try:
            data = redis_client.get(f"session:{session_id}")
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"Redis get error: {e}")
            return None
    else:
        return memory_sessions.get(session_id)

def set_session_data(session_id: str, data: Dict[str, Any], ttl: int = 86400):
    if redis_client:
        try:
            redis_client.setex(f"session:{session_id}", ttl, json.dumps(data))
        except Exception as e:
            logger.error(f"Redis set error: {e}")
            # Fallback to memory
            memory_sessions[session_id] = data
    else:
        memory_sessions[session_id] = data

def delete_session_data(session_id: str):
    if redis_client:
        try:
            redis_client.delete(f"session:{session_id}")
        except Exception as e:
            logger.error(f"Redis delete error: {e}")
    if session_id in memory_sessions:
        del memory_sessions[session_id]

# Dependency to get current user
async def get_current_user(request: Request) -> Optional[Dict[str, Any]]:
    session_id = request.session.get("session_id")
    if not session_id:
        return None
    
    return get_session_data(session_id)

# Routes
@app.get("/api/health")
async def health_check():
    session_count = len(memory_sessions)
    if redis_client:
        try:
            # Count Redis sessions
            keys = redis_client.keys("session:*")
            session_count = len(keys)
        except:
            pass
    
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "sessions": session_count,
        "redis_connected": redis_client is not None
    }

@app.post("/api/auth/github")
async def github_oauth(request: Request, github_request: GitHubCodeRequest):
    try:
        # Exchange code for access token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://github.com/login/oauth/access_token",
                json={
                    "client_id": os.getenv("GITHUB_CLIENT_ID"),
                    "client_secret": os.getenv("GITHUB_CLIENT_SECRET"),
                    "code": github_request.code,
                },
                headers={"Accept": "application/json"}
            )
            
            token_data = token_response.json()
            
            if "access_token" not in token_data:
                raise HTTPException(
                    status_code=400, 
                    detail=token_data.get("error_description", "Failed to get access token")
                )
            
            access_token = token_data["access_token"]
            
            # Get user info from GitHub
            user_response = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                }
            )
            
            if user_response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to get user info")
            
            user_data = user_response.json()
            
            # Create session
            session_id = f"session_{user_data['id']}_{datetime.utcnow().timestamp()}"
            session_data = {
                "user_id": user_data["id"],
                "login": user_data["login"],
                "name": user_data.get("name"),
                "email": user_data.get("email"),
                "avatar_url": user_data["avatar_url"],
                "access_token": access_token,
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Store session
            set_session_data(session_id, session_data)
            request.session["session_id"] = session_id
            
            # Return user info (without access token)
            user_info = {k: v for k, v in session_data.items() if k != "access_token"}
            
            return {
                "success": True,
                "user": user_info,
                "access_token": access_token
            }
            
    except httpx.RequestError as e:
        logger.error(f"HTTP request error: {e}")
        raise HTTPException(status_code=500, detail="Network error during GitHub authentication")
    except Exception as e:
        logger.error(f"GitHub OAuth error: {e}")
        raise HTTPException(status_code=500, detail="Authentication failed")

@app.get("/api/auth/user")
async def get_current_user_info(current_user: Optional[Dict[str, Any]] = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Return user info without access token
    user_info = {k: v for k, v in current_user.items() if k != "access_token"}
    return {"user": user_info}

@app.post("/api/auth/logout")
async def logout(request: Request, current_user: Optional[Dict[str, Any]] = Depends(get_current_user)):
    session_id = request.session.get("session_id")
    if session_id:
        delete_session_data(session_id)
        request.session.clear()
    
    return {"success": True}

@app.get("/api/github/repositories")
async def get_repositories(current_user: Optional[Dict[str, Any]] = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        access_token = current_user.get("access_token")
        if not access_token:
            raise HTTPException(status_code=401, detail="No access token found")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.github.com/user/repos",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                params={
                    "sort": "updated",
                    "per_page": 50
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to fetch repositories")
            
            repos_data = response.json()
            
            repositories = []
            for repo in repos_data:
                repositories.append({
                    "id": repo["id"],
                    "name": repo["name"],
                    "full_name": repo["full_name"],
                    "description": repo.get("description", ""),
                    "private": repo["private"],
                    "html_url": repo["html_url"],
                    "updated_at": repo["updated_at"],
                    "language": repo.get("language", "Unknown"),
                    "stargazers_count": repo["stargazers_count"],
                    "forks_count": repo["forks_count"]
                })
            
            return {"repositories": repositories}
            
    except httpx.RequestError as e:
        logger.error(f"HTTP request error: {e}")
        raise HTTPException(status_code=500, detail="Network error while fetching repositories")
    except Exception as e:
        logger.error(f"Error fetching repositories: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch repositories")

@app.get("/api/github/repositories/{owner}/{repo}")
async def get_repository(
    owner: str, 
    repo: str, 
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        access_token = current_user.get("access_token")
        if not access_token:
            raise HTTPException(status_code=401, detail="No access token found")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="Repository not found")
            
            repo_data = response.json()
            
            repository = {
                "id": repo_data["id"],
                "name": repo_data["name"],
                "full_name": repo_data["full_name"],
                "description": repo_data.get("description", ""),
                "private": repo_data["private"],
                "html_url": repo_data["html_url"],
                "updated_at": repo_data["updated_at"],
                "language": repo_data.get("language", "Unknown"),
                "stargazers_count": repo_data["stargazers_count"],
                "forks_count": repo_data["forks_count"]
            }
            
            return {"repository": repository}
            
    except httpx.RequestError as e:
        logger.error(f"HTTP request error: {e}")
        raise HTTPException(status_code=500, detail="Network error while fetching repository")
    except Exception as e:
        logger.error(f"Error fetching repository: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch repository")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=port, 
        reload=os.getenv("NODE_ENV") != "production"
    )