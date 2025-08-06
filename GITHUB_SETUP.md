# GitHub Integration Setup Guide

This guide will help you set up GitHub App integration for VibeTorch.

## Prerequisites

- A GitHub account
- Admin access to repositories you want to integrate

## Step 1: Create a GitHub App

1. Go to [GitHub Settings > Developer settings > GitHub Apps](https://github.com/settings/apps)
2. Click **"New GitHub App"**
3. Fill in the following details:

### Basic Information
- **GitHub App name**: `VibeTorch` (or your preferred name)
- **Homepage URL**: `http://localhost:5173` (for development)
- **Callback URL**: `http://localhost:5173/auth/callback`

### Permissions
Grant the following **Repository permissions**:
- **Contents**: Read
- **Metadata**: Read
- **Pull requests**: Read & Write
- **Issues**: Read & Write

Grant the following **Account permissions**:
- **Email addresses**: Read

### Where can this GitHub App be installed?
- Select **"Only on this account"** for testing

4. Click **"Create GitHub App"**

## Step 2: Get Your Credentials

After creating the app, you'll see the app settings page:

1. **Copy the Client ID** - you'll need this for `VITE_GITHUB_CLIENT_ID`
2. **Copy the App ID** - you'll need this for `VITE_GITHUB_APP_ID`
3. **Generate a Client Secret** - click "Generate a new client secret" and copy it
4. **Generate a Private Key** - scroll down and click "Generate a private key"

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials in `.env`:
   ```
   VITE_GITHUB_CLIENT_ID=your_client_id_here
   VITE_GITHUB_APP_ID=your_app_id_here
   GITHUB_CLIENT_SECRET=your_client_secret_here
   GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
   your_private_key_content_here
   -----END RSA PRIVATE KEY-----"
   GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
   VITE_APP_URL=http://localhost:5173
   ```

## Step 4: Install the App

1. Go to your GitHub App settings
2. Click **"Install App"** in the left sidebar
3. Choose your account/organization
4. Select **"All repositories"** or choose specific repositories
5. Click **"Install"**

## Step 5: Deploy (Production)

For production deployment, you have several options:

### Option A: Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Update callback URL to your production domain

### Option B: Netlify
1. Use Netlify Functions for the OAuth endpoint
2. Update the API endpoint in the code accordingly

### Option C: Custom Backend
1. Set up your own backend server
2. Implement the OAuth flow on your backend
3. Update the frontend to use your backend endpoints

## Step 6: Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:5173`
3. Click **"Connect GitHub"**
4. You should be redirected to GitHub for authorization
5. After authorization, you should see your repositories

## Troubleshooting

### Common Issues

1. **"Application not found" error**
   - Check that your Client ID is correct
   - Ensure the app is not suspended

2. **"Callback URL mismatch" error**
   - Verify the callback URL in your GitHub App settings matches your local URL

3. **"Client secret not found" error**
   - Make sure you've generated and copied the client secret correctly

4. **"Private key" issues**
   - Ensure the private key includes the header and footer lines
   - Make sure there are no extra spaces or line breaks

5. **Repository list not loading**
   - Check browser console for API errors
   - Verify the user has access to repositories
   - Ensure proper permissions are granted to the app

### Development vs Production

- In development, use `http://localhost:5173`
- In production, update all URLs to your domain
- Make sure to update GitHub App settings when deploying

## Security Notes

- Never commit your `.env` file to version control
- Keep your client secret and private key secure
- Use environment variables for all sensitive data
- Consider using a secrets management service in production