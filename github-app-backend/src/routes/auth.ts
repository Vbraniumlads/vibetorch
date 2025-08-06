import { Router, Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const router = Router();

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GitHubUserResponse {
  id: number;
  login: string;
  avatar_url: string;
  name: string;
  email: string;
}

// OAuth callback endpoint - exchange authorization code for access token
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    
    if (!code) {
      res.status(400).json({ error: 'Authorization code is required' });
      return;
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('❌ GitHub OAuth credentials not configured');
      res.status(500).json({ error: 'OAuth not configured' });
      return;
    }

    // Exchange code for access token
    const tokenResponse = await axios.post<GitHubTokenResponse>(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const { access_token } = tokenResponse.data;
    
    if (!access_token) {
      console.error('❌ Failed to get access token from GitHub', tokenResponse.data, code);
      res.status(400).json({ error: 'Failed to get access token from GitHub' });
      return;
    }

    // Get user info from GitHub
    const userResponse = await axios.get<GitHubUserResponse>(
      'https://api.github.com/user',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    const user = userResponse.data;

    // Create session token (you can use any secret for JWT signing)
    const sessionToken = jwt.sign(
      {
        userId: user.id,
        username: user.login,
        githubToken: access_token,
      },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '24h' }
    );

    // Return user info and session token
    res.json({
      token: sessionToken,
      user: {
        id: user.id,
        username: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('❌ OAuth login error:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('GitHub API Error:', error.response?.data);
      res.status(500).json({ 
        error: 'GitHub authentication failed',
        details: error.response?.data?.error_description || error.message
      });
      return;
    }
    
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Logout endpoint
router.post('/logout', (_req: Request, res: Response) => {
  // Since we're using JWT tokens, logout is handled client-side
  // by removing the token from storage
  res.json({ message: 'Logged out successfully' });
});

// Verify token endpoint
router.get('/verify', (req: Request, res: Response): void => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret') as any;
    
    res.json({
      valid: true,
      user: {
        id: decoded.userId,
        username: decoded.username,
      },
    });

  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export { router as authRouter };