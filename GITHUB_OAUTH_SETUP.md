# 🔐 GitHub OAuth Setup Guide

## Overview
This guide will help you set up GitHub OAuth authentication for VibeTorch, allowing users to connect their GitHub accounts and access their repositories.

## 1. Create GitHub OAuth App

### Step 1: Navigate to GitHub Developer Settings
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on "OAuth Apps" in the left sidebar
3. Click "New OAuth App"

### Step 2: Configure OAuth App
Fill in the following information:

**Application name:** `VibeTorch`
**Homepage URL:** `http://localhost:5173` (for development)
**Application description:** `AI-powered code assistant and automation platform`
**Authorization callback URL:** `http://localhost:5173/`

For production:
- **Homepage URL:** `https://your-production-domain.com`
- **Authorization callback URL:** `https://your-production-domain.com/`

### Step 3: Get Client ID and Secret
After creating the app, you'll see:
- **Client ID**: Copy this value
- **Client Secret**: Click "Generate a new client secret" and copy the value

## 2. Environment Variables Setup

### Frontend (.env)
Create or update `.env` file in the root directory:

```bash
# GitHub OAuth
VITE_GITHUB_CLIENT_ID=your_client_id_here

# API Configuration  
VITE_API_URL=http://localhost:3001/api

# Google Analytics (optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

### Backend (github-app-backend/.env)
Create or update `.env` file in the `github-app-backend` directory:

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/vibetorch

# GitHub OAuth (for user authentication)
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here

# GitHub App (existing webhook functionality)
GITHUB_APP_ID=1734153
GITHUB_PRIVATE_KEY_PATH=./vibe-torch.2025-08-05.private-key.pem
GITHUB_WEBHOOK_SECRET=torchtorch

# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Claude API (optional)
CLAUDE_API_KEY=your_claude_api_key_here
```

## 3. Railway Production Environment Variables

For Railway deployment, set these environment variables:

### Frontend Service:
```bash
VITE_GITHUB_CLIENT_ID=your_production_client_id
VITE_API_URL=https://your-backend-service.railway.app/api
NODE_ENV=production
```

### Backend Service:
```bash
# Database (automatically provided by Railway PostgreSQL)
DATABASE_URL=postgresql://postgres:password@hostname:port/database

# GitHub OAuth
GITHUB_CLIENT_ID=your_production_client_id
GITHUB_CLIENT_SECRET=your_production_client_secret

# Existing GitHub App settings
GITHUB_APP_ID=1734153
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n[full private key content]\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=torchtorch

# Server
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-service.railway.app

# Claude API
CLAUDE_API_KEY=your_claude_api_key_here
```

## 4. OAuth Flow Explanation

### How it works:

1. **User clicks "Connect GitHub"** → Redirects to GitHub OAuth
2. **User authorizes** → GitHub redirects back with authorization code
3. **Frontend sends code to backend** → Backend exchanges code for access token
4. **Backend stores user info** → Returns session token to frontend
5. **Frontend stores session token** → User is now authenticated

### Security Features:

- **Session-based authentication** with secure tokens
- **CORS protection** configured for your domains
- **Token expiration** (24 hours by default)
- **Secure cookie storage** for session tokens

## 5. Testing the Integration

### Local Development:
1. Start the backend: `cd github-app-backend && npm run dev`
2. Start the frontend: `npm run dev`
3. Visit `http://localhost:5173`
4. Click "Connect GitHub" button
5. Authorize the app
6. Should redirect back and show authenticated state

### Common Issues:

#### "Client ID not configured"
- Check `VITE_GITHUB_CLIENT_ID` in frontend `.env`
- Restart the dev server after adding environment variables

#### "OAuth callback URL mismatch"
- Ensure callback URL in GitHub app matches exactly
- For local dev: `http://localhost:5173/`
- For production: `https://yourdomain.com/`

#### "CORS errors"
- Check `FRONTEND_URL` in backend environment
- Ensure it matches your actual frontend URL

## 6. Production Deployment

### Update OAuth App for Production:
1. Go to your GitHub OAuth App settings
2. Update **Homepage URL** to production domain
3. Update **Authorization callback URL** to production domain
4. Update environment variables in Railway

### Security Checklist:
- [ ] Use HTTPS for production
- [ ] Set secure `FRONTEND_URL` in backend
- [ ] Use strong database passwords
- [ ] Keep GitHub Client Secret secure
- [ ] Monitor authentication logs

## 7. Features Enabled by OAuth

Once OAuth is working, users can:

- ✅ **View GitHub repositories** in the dashboard
- ✅ **Sync repository data** automatically
- ✅ **Manage notes** and automation settings
- ✅ **Access billing information**
- ✅ **Persistent sessions** across browser sessions

## Need Help?

- Check the browser console for error messages
- Verify all environment variables are set correctly
- Ensure GitHub OAuth app URLs match exactly
- Test locally before deploying to production

The floating navigation bar will automatically show the user's login status and provide access to billing and profile management once authentication is working! 🚀