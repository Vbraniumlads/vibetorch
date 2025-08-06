#!/usr/bin/env python3
"""
Development server startup script for VibeTorch FastAPI backend
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    # Check if we're in the server directory
    if not Path("main.py").exists():
        print("❌ main.py not found. Make sure you're in the server directory.")
        sys.exit(1)
    
    # Check if requirements are installed
    try:
        import fastapi
        import uvicorn
        import httpx
        import redis
    except ImportError as e:
        print(f"❌ Missing dependencies: {e}")
        print("📦 Installing requirements...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    
    # Load environment variables
    if Path(".env").exists():
        print("✅ Found .env file")
    else:
        print("⚠️ No .env file found. Using defaults.")
    
    # Start the server
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Starting FastAPI server on port {port}")
    print(f"📊 Environment: {os.getenv('NODE_ENV', 'development')}")
    print(f"🔗 Frontend URL: {os.getenv('FRONTEND_URL', 'http://localhost:5173')}")
    print(f"📡 API URL: http://localhost:{port}")
    print(f"🩺 Health check: http://localhost:{port}/api/health")
    print("-" * 50)
    
    # Run uvicorn
    subprocess.run([
        sys.executable, "-m", "uvicorn", 
        "main:app", 
        "--host", "0.0.0.0", 
        "--port", str(port),
        "--reload"
    ])

if __name__ == "__main__":
    main()