import express from 'express';
import { config } from 'dotenv';
import { Octokit } from '@octokit/rest';
import { Webhooks } from '@octokit/webhooks';
import { setupRoutes } from './routes/index.js';
import type { AppConfig } from './types/index.js';

config();

// GitHub Personal Access Token
const githubToken = process.env.GITHUB_TOKEN || '';

const appConfig: AppConfig = {
  githubToken: githubToken,
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  claudeApiKey: process.env.CLAUDE_API_KEY
};

if (!appConfig.githubToken) {
  console.error('❌ Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

const app = express();

// GitHub API client with personal access token
const github = new Octokit({
  auth: appConfig.githubToken
});

// Validate GitHub token permissions on startup
async function validateGitHubPermissions() {
  try {
    console.log('🔍 Validating GitHub token permissions...');
    await github.rest.users.getAuthenticated();
    console.log('✅ GitHub token is valid');
  } catch (error: any) {
    console.error('❌ GitHub token validation failed:', error.message);
    if (error.status === 401) {
      console.error('💡 Please check your GITHUB_TOKEN in the .env file');
      console.error('💡 Ensure your token has the required scopes: issues (write)');
      console.error('💡 Update token at: https://github.com/settings/tokens');
    }
    process.exit(1);
  }
}

// Webhooks instance
const webhooks = new Webhooks({
  secret: appConfig.githubToken
});

// Middleware
app.use(express.json());
app.use(express.raw({ type: 'application/json' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: appConfig.nodeEnv
  });
});

// Setup routes
setupRoutes(app, github, webhooks);

// Start server with validation
async function startServer() {
  await validateGitHubPermissions();
  
  app.listen(appConfig.port, () => {
    console.log(`🚀 Claude GitHub User server running on port ${appConfig.port}`);
    console.log(`📋 Ready to process todo lists and create repositories!`);
    console.log(`🌍 Environment: ${appConfig.nodeEnv}`);
  });
}

startServer().catch(console.error);