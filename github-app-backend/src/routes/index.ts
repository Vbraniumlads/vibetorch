import type { Express } from 'express';
import type { App } from '@octokit/app';
import type { Webhooks } from '@octokit/webhooks';
import { webhookController } from '../controllers/webhookController.js';
import { issueGeneratorController } from '../controllers/issueGeneratorController.js';
import { authRouter } from './auth.js';

export function setupRoutes(app: Express, githubApp: App | null, webhooks: Webhooks | null): void {
  // OAuth authentication routes
  app.use('/api/auth', authRouter);
  
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