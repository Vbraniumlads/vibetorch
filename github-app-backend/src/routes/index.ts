import type { Express } from 'express';
import type { Octokit } from '@octokit/rest';
import type { App } from '@octokit/app';
import type { Webhooks } from '@octokit/webhooks';
import { issueGeneratorController } from '../controllers/issueGeneratorController.js';
import { webhookController } from '../controllers/webhookController.js';
import { authRouter } from './auth.js';
import { repositoriesRouter } from './repositories.js';

export function setupRoutes(app: Express, githubApp: App | null, webhooks: Webhooks | null): void {
  // OAuth authentication routes
  app.use('/api/auth', authRouter);
  
  // GitHub repositories routes
  app.use('/api/repositories', repositoriesRouter);
  
  // GitHub App routes (only if configured)
  if (githubApp && webhooks) {
    // Webhook endpoint
    app.post('/webhook', webhookController(githubApp, webhooks));
    
    // Issue generation webhook endpoint
    app.post('/generate-issue', issueGeneratorController(githubApp));
    
    // GitHub App installation callback
    app.get('/callback', (_req, res) => {
      res.json({ message: 'GitHub App installation successful!' });
    });
  } else {
    console.log('🔄 GitHub App routes skipped (not configured)');
  }
}