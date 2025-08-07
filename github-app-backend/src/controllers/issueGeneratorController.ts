import type { Request, Response } from 'express';
import type { Octokit } from '@octokit/rest';

interface IssueGenerationRequest {
  repository: {
    owner: string;
    name: string;
  };
  issue: {
    title: string;
    body: string;
    labels?: string[];
    assignees?: string[];
  };
}

export function issueGeneratorController(github: Octokit) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const payload: IssueGenerationRequest = req.body;

      // Validate required fields
      if (!payload.repository || !payload.issue) {
        res.status(400).json({
          error: 'Missing required fields: repository and issue are required'
        });
        return;
      }

      const { repository, issue } = payload;

      console.log(`🚀 Generating issue: "${issue.title}" in ${repository.owner}/${repository.name}`);
      console.log(`✅ Using personal access token for GitHub API`);

      // Create the issue
      const response = await github.rest.issues.create({
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
          error: 'Repository not found',
          message: 'Make sure the repository exists and you have access to it'
        });
      } else if (error.status === 403) {
        const errorMessage = error.response?.data?.message || error.message;
        if (errorMessage?.includes('Resource not accessible by personal access token')) {
          res.status(403).json({
            error: 'Insufficient token permissions',
            message: 'The personal access token lacks the "issues" write permission. Please update your token at: https://github.com/settings/tokens',
            fix: 'Enable the "issues" scope in your GitHub token settings'
          });
        } else {
          res.status(403).json({
            error: 'Permission denied',
            message: errorMessage || 'The personal access token does not have permission to create issues in this repository'
          });
        }
      } else {
        res.status(500).json({
          error: 'Issue generation failed',
          message: error?.message || 'Unknown error occurred'
        });
      }
    }
  };
}