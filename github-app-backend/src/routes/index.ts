import type { Express } from 'express';
import type { Octokit } from '@octokit/rest';
import type { Webhooks } from '@octokit/webhooks';
import { webhookController } from '../controllers/webhookController.js';
import { issueGeneratorController } from '../controllers/issueGeneratorController.js';

export function setupRoutes(app: Express, github: Octokit, webhooks: Webhooks): void {
  // Webhook endpoint
  app.post('/webhook', webhookController(github, webhooks));
  
  // Issue generation webhook endpoint
  app.post('/generate-issue', issueGeneratorController(github));
  
  // GitHub user callback (no longer needed for installations)
  app.get('/callback', (_req, res) => {
    res.json({ message: 'GitHub user authentication successful!' });
  });
}