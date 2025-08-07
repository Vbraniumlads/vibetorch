import type { Request, Response } from 'express';
import type { Octokit } from '@octokit/rest';

interface IssueCommentRequest {
  repository: {
    owner: string;
    name: string;
  };
  issue: {
    number: number;
  };
  comment: {
    body: string;
  };
}

export function issueCommentController(github: Octokit) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const payload: IssueCommentRequest = req.body;

      // Validate required fields
      if (!payload.repository || !payload.issue || !payload.comment) {
        res.status(400).json({ 
          error: 'Missing required fields: repository, issue, and comment are required' 
        });
        return;
      }

      const { repository, issue, comment } = payload;

      console.log(`💬 Adding comment to issue #${issue.number} in ${repository.owner}/${repository.name}`);
      console.log(`✅ Using personal access token for GitHub API`);

      // Create the comment
      const response = await github.rest.issues.createComment({
        owner: repository.owner,
        repo: repository.name,
        issue_number: issue.number,
        body: comment.body
      });

      console.log(`✅ Successfully created comment #${response.data.id}`);
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
        message: 'Comment created successfully'
      });

    } catch (error: any) {
      console.error('❌ Comment creation error:', error);
      
      if (error.status === 404) {
        res.status(404).json({ 
          error: 'Issue or repository not found',
          message: 'Make sure the issue exists and you have access to the repository'
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
            message: errorMessage || 'The personal access token does not have permission to comment on issues in this repository'
          });
        }
      } else {
        res.status(500).json({ 
          error: 'Comment creation failed',
          message: error.message || 'Unknown error occurred'
        });
      }
    }
  };
}