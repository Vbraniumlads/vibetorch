import type { Request, Response } from 'express';
import type { App } from '@octokit/app';

interface IssueGenerationRequest {
  repository: {
    owner: string;
    name: string;
  };
  installation_id: number;
  issue: {
    title: string;
    body: string;
    labels?: string[];
    assignees?: string[];
  };
}

export function issueGeneratorController(githubApp: App) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const payload: IssueGenerationRequest = req.body;

      // Validate required fields
      if (!payload.repository || !payload.installation_id || !payload.issue) {
        res.status(400).json({ 
          error: 'Missing required fields: repository, installation_id, and issue are required' 
        });
        return;
      }

      const { repository, installation_id, issue } = payload;

      console.log(`🚀 Generating issue: "${issue.title}" in ${repository.owner}/${repository.name}`);

      // Get installation access token
      const octokit = await githubApp.getInstallationOctokit(installation_id);
      console.log(`✅ Successfully authenticated for installation ${installation_id}`);

      // Create the issue
      const response = await octokit.request('POST /repos/{owner}/{repo}/issues', {
        owner: repository.owner,
        repo: repository.name,
        title: issue.title,
        body: issue.body,
        labels: issue.labels || [],
        assignees: issue.assignees || []
      });

      console.log(`✅ Successfully created issue #${response.data.number}`);
      console.log(`📋 Issue URL: ${response.data.html_url}`);

      res.status(201).json({
        success: true,
        issue: {
          number: response.data.number,
          title: response.data.title,
          url: response.data.html_url,
          created_at: response.data.created_at
        },
        message: 'Issue created successfully'
      });

    } catch (error: any) {
      console.error('❌ Issue generation error:', error);
      
      if (error?.status === 404) {
        res.status(404).json({ 
          error: 'Repository not found or app not installed',
          message: 'Make sure the GitHub App is installed on the repository'
        });
      } else if (error?.status === 403) {
        res.status(403).json({ 
          error: 'Permission denied',
          message: 'The app does not have permission to create issues in this repository'
        });
      } else {
        res.status(500).json({ 
          error: 'Issue generation failed',
          message: error?.message || 'Unknown error occurred'
        });
      }
    }
  };
}