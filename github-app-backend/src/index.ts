import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { Octokit } from '@octokit/rest';
import { issueGeneratorController } from './controllers/issueGeneratorController.js';
import { issueCommentController } from './controllers/issueCommentController.js';
import { prCommentController } from './controllers/prCommentController.js';

config();

// GitHub Personal Access Token
const githubToken = process.env.GITHUB_TOKEN || '';

if (!githubToken) {
  console.error('❌ Missing GITHUB_TOKEN environment variable');
  console.log('Please set GITHUB_TOKEN in your .env file');
  process.exit(1);
}

const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

// Initialize GitHub client with personal access token
const github = new Octokit({
  auth: githubToken,
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.post('/generate-issue', issueGeneratorController(github));
app.post('/issue-comment', issueCommentController(github));
app.post('/pr-comment', prCommentController(github));

app.get('/callback', (_req, res) => {
  res.json({ message: 'GitHub authentication successful!' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 GitHub API server running on port ${port}`);
  console.log(`📋 Ready to process GitHub API requests!`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log(`🔗 Available endpoints:`);
  console.log(`  POST /generate-issue - Create GitHub issues`);
  console.log(`  POST /issue-comment - Comment on issues`);
  console.log(`  POST /pr-comment - Comment on pull requests`);
});