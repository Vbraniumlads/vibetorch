import express from 'express';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { App } from '@octokit/app';
import { Webhooks } from '@octokit/webhooks';
// import { webhookController } from './controllers/webhookController.js';
import { setupRoutes } from './routes/index.js';
import type { AppConfig } from './types/index.js';

config();

// Read private key from file or environment variable
let privateKey = process.env.GITHUB_PRIVATE_KEY || '';
if (process.env.GITHUB_PRIVATE_KEY_PATH && !privateKey) {
  try {
    privateKey = readFileSync(process.env.GITHUB_PRIVATE_KEY_PATH, 'utf8');
  } catch (error) {
    console.error('❌ Failed to read private key file:', error);
  }
}

const appConfig: AppConfig = {
  githubAppId: process.env.GITHUB_APP_ID || '',
  githubPrivateKey: privateKey,
  githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET || '',
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  claudeApiKey: process.env.CLAUDE_API_KEY
};

if (!appConfig.githubAppId || !appConfig.githubPrivateKey || !appConfig.githubWebhookSecret) {
  console.error('❌ Missing required environment variables. Please check your .env file.');
  process.exit(1);
}

const app = express();

// GitHub App configuration
const githubApp = new App({
  appId: appConfig.githubAppId,
  privateKey: appConfig.githubPrivateKey,
  webhooks: {
    secret: appConfig.githubWebhookSecret
  }
});

// Webhooks instance
const webhooks = new Webhooks({
  secret: appConfig.githubWebhookSecret
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
setupRoutes(app, githubApp, webhooks);

// Start server
app.listen(appConfig.port, () => {
  console.log(`🚀 Claude Todo GitHub App server running on port ${appConfig.port}`);
  console.log(`📋 Ready to process todo lists and create repositories!`);
  console.log(`🌍 Environment: ${appConfig.nodeEnv}`);
});