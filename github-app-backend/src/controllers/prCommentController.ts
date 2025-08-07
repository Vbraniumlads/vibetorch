import type { Request, Response } from 'express';
import type { Octokit } from '@octokit/rest';

interface PrCommentRequest {
  repository: {
    owner: string;
    name: string;
  };
  pull_request: {
    number: number;
  };
  comment: {
    body: string;
  };
}

export function prCommentController(github: Octokit) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const payload: PrCommentRequest = req.body;

      // Validate required fields
      if (!payload.repository || !payload.pull_request || !payload.comment) {
        res.status(400).json({ 
          error: 'Missing required fields: repository, pull_request, and comment are required' 
        });
        return;
      }

      const { repository, pull_request, comment } = payload;

      console.log(`💬 Adding comment to PR #${pull_request.number} in ${repository.owner}/${repository.name}`);
      console.log(`✅ Using personal access token for GitHub API`);

      // Create the comment on the pull request
      const response = await github.rest.issues.createComment({
        owner: repository.owner,
        repo: repository.name,
        issue_number: pull_request.number, // GitHub treats PR comments as issue comments
        body: comment.body
      });

      console.log(`✅ Successfully created PR comment #${response.data.id}`);
      console.log(`📋 Comment URL: ${response.data.html_url}`);

      res.status(201).json({
        success: true,
        comment: {
          id: response.data.id,
          body: response.data.body,
          url: response.data.html_url,
          created_at: response.data.created_at,
          user: response.data.user?.login
        },
        message: 'Pull request comment created successfully'
      });

    } catch (error: any) {
      console.error('❌ PR comment creation error:', error);
      
      if (error.status === 404) {
        res.status(404).json({ 
          error: 'Pull request or repository not found',
          message: 'Make sure the pull request exists and you have access to the repository'
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
            message: errorMessage || 'The personal access token does not have permission to comment on pull requests in this repository'
          });
        }
      } else {
        res.status(500).json({ 
          error: 'PR comment creation failed',
          message: error.message || 'Unknown error occurred'
        });
      }
    }
  };
}