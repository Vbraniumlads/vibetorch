import type { Express } from 'express';
import type { App } from '@octokit/app';
import type { Webhooks } from '@octokit/webhooks';
import { webhookController } from '../controllers/webhookController.js';

export function setupRoutes(app: Express, githubApp: App, webhooks: Webhooks): void {
  // Webhook endpoint
  app.post('/webhook', webhookController(githubApp, webhooks));
  
  // GitHub App installation callback
  app.get('/callback', (_req, res) => {
    res.json({ message: 'GitHub App installation successful!' });
  });
}