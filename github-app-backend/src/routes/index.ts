import type { Express } from 'express';
import type { Octokit } from '@octokit/rest';
import { issueGeneratorController } from '../controllers/issueGeneratorController.js';
import { issueCommentController } from '../controllers/issueCommentController.js';
import { prCommentController } from '../controllers/prCommentController.js';

export function setupRoutes(app: Express, github: Octokit): void {
  // Issue generation webhook endpoint
  app.post('/generate-issue', issueGeneratorController(github));

  // Issue comment endpoint
  app.post('/issue-comment', issueCommentController(github));

  // Pull request comment endpoint
  app.post('/pr-comment', prCommentController(github));

  // GitHub user callback (no longer needed for installations)
  app.get('/callback', (_req, res) => {
    res.json({ message: 'GitHub user authentication successful!' });
  });
}