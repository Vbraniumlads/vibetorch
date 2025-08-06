import { App } from '@octokit/app';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config();

// Read private key
const privateKey = readFileSync('./vibe-torch.2025-08-05.private-key.pem', 'utf8');

// Initialize GitHub App
const app = new App({
  appId: process.env.GITHUB_APP_ID,
  privateKey: privateKey,
});

async function createTestIssue() {
  try {
    // Get installation access token
    const octokit = await app.getInstallationOctokit(1734153);
    
    console.log('🚀 Creating test issue...');
    
    // Create a new issue
    const response = await octokit.request('POST /repos/{owner}/{repo}/issues', {
      owner: 'Vbraniumlads',
      repo: 'vibetorch',
      title: 'Test Issue Created by Claude Bot',
      body: `# Test Issue

This issue was created by the Claude Todo GitHub App bot to test functionality.

Hey @claude, can you help me understand this codebase?

## What I need help with:
- Understanding the project structure
- Learning about the main features
- Getting started with development

Please provide guidance!

---
*Created automatically by Claude Bot test script*`
    });
    
    console.log('✅ Successfully created issue!');
    console.log(`📋 Issue URL: ${response.data.html_url}`);
    console.log(`📋 Issue Number: ${response.data.number}`);
    
  } catch (error) {
    console.error('❌ Error creating issue:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

createTestIssue();