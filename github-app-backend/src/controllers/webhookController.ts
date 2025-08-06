import type { Request, Response } from 'express';
import type { App } from '@octokit/app';
import type { Webhooks } from '@octokit/webhooks';
import type { WebhookPayload, GitHubRepository, OctokitInstance } from '../types/index.js';

import { todoParser } from '../services/todoParser.js';
import { repositoryService } from '../services/repositoryService.js';
import { claudeService } from '../services/claudeService.js';

export function webhookController(githubApp: App, webhooks: Webhooks) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const signature = req.get('X-Hub-Signature-256');
      const event = req.get('X-GitHub-Event');
      const payload: WebhookPayload = req.body;

      if (!signature || !event) {
        res.status(400).json({ error: 'Missing required headers' });
        return;
      }

      // Verify webhook signature
      await webhooks.verifyAndReceive({
        id: req.get('X-GitHub-Delivery') || '',
        name: event,
        signature,
        payload: JSON.stringify(payload)
      });

      console.log(`📨 Received ${event} event`);

      // Handle different webhook events
      switch (event) {
        case 'push':
          await handlePushEvent(payload, githubApp);
          break;
        case 'issues':
          await handleIssuesEvent(payload, githubApp);
          break;
        case 'installation':
          await handleInstallationEvent(payload);
          break;
        default:
          console.log(`🤷 Unhandled event: ${event}`);
      }

      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('❌ Webhook processing error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  };
}

async function handlePushEvent(payload: WebhookPayload, githubApp: App): Promise<void> {
  const { repository, installation } = payload;

  if (!installation) {
    console.log('❌ No installation found in push event');
    return;
  }

  console.log(`🔄 Push event in ${repository.full_name}`);

  try {
    // Get installation access token
    const octokit = await githubApp.getInstallationOctokit(installation.id);
    console.log(`✅ Successfully authenticated for installation ${installation.id}`);

    // Check for todo files in the push
    const modifiedFiles = payload.commits?.flatMap(commit =>
      [...(commit.added || []), ...(commit.modified || [])]
    ) || [];

    const todoFiles = modifiedFiles.filter(file =>
      file.toLowerCase().includes('todo') ||
      file.toLowerCase().includes('task') ||
      file.endsWith('.md')
    );

    if (todoFiles.length > 0) {
      console.log(`📋 Found ${todoFiles.length} potential todo files`);

      for (const file of todoFiles) {
        try {
          await processTodoFile(octokit, repository, file);
        } catch (error) {
          console.error(`❌ Error processing todo file ${file}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error handling push event:', error);
  }
}

async function handleIssuesEvent(payload: WebhookPayload, githubApp: App): Promise<void> {
  const { action, issue, repository, installation } = payload;

  console.log('🔍 Issues event payload:', payload);

  if (!issue || !installation) {
    console.log('❌ Missing issue or installation in issues event');
    return;
  }

  if (action === 'opened' || action === 'edited') {
    console.log(`📝 Issue ${action} in ${repository.full_name}: ${issue.title}`);

    // Check if issue mentions @claude
    const body = issue.body || '';
    if (body.toLowerCase().includes('@claude')) {
      console.log('🤖 Claude mentioned in issue!');

      try {
        const octokit = await githubApp.getInstallationOctokit(installation.id);
        await claudeService.handleClaudeMention(octokit, repository, issue);
      } catch (error) {
        console.error('❌ Error handling Claude mention:', error);
      }
    }
  }
}

async function handleInstallationEvent(payload: WebhookPayload): Promise<void> {
  const { action, installation } = payload;

  if (!installation) {
    console.log('❌ No installation found in installation event');
    return;
  }

  console.log(`🔧 Installation ${action} for account: ${installation.account.login}`);
}

async function processTodoFile(
  octokit: any,
  repository: GitHubRepository,
  filePath: string
): Promise<void> {
  try {
    // For demo/test purposes, simulate processing without making real API calls
    if (repository.name === 'vibetorch' && repository.owner.login === 'Vbraniumlads') {
      console.log('📋 Demo mode: Simulating todo file processing for', filePath);
      console.log('📋 In a real scenario, this would parse todos from', filePath);
      return;
    }

    // Get file content using direct request method
    if (!octokit || !octokit.request) {
      console.error('❌ Invalid octokit instance');
      return;
    }

    const { data: fileData } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: repository.owner.login,
      repo: repository.name,
      path: filePath
    });

    // Handle file data which could be an array or single file
    if (Array.isArray(fileData)) {
      console.log(`❌ ${filePath} is a directory, skipping`);
      return;
    }

    if (fileData.type !== 'file' || !fileData.content) {
      console.log(`❌ ${filePath} is not a file or has no content`);
      return;
    }

    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');

    // Parse todos from the file
    const todos = todoParser.extractTodos(content);

    if (todos.length > 0) {
      console.log(`📋 Found ${todos.length} todos in ${filePath}`);

      // Process each todo that mentions Claude
      for (const todo of todos) {
        if (todo.claudeMentioned) {
          console.log('🤖 Processing Claude-mentioned todo:', todo.text);
          try {
            await repositoryService.createImplementationRepo(octokit, repository, todo);
          } catch (error) {
            console.error(`❌ Error creating repo for todo "${todo.text}":`, error);
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error processing todo file ${filePath}:`, error);
  }
}