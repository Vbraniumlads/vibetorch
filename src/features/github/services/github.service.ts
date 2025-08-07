import { apiClient } from '../../../shared/services/api.service';
import type { GitHubRepository, SyncResponse, GitHubIssue, GitHubPullRequest } from '../types/github.types';

export class GitHubService {
  async getRepositories(): Promise<GitHubRepository[]> {
    return apiClient.get<GitHubRepository[]>('/repositories');
  }

  async syncRepositories(): Promise<SyncResponse> {
    return apiClient.post<SyncResponse>('/repositories/sync');
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return apiClient.get<GitHubRepository>(`/repositories/${owner}/${repo}`);
  }

  async getRepositoryIssues(owner: string, repo: string, params?: {
    page?: number;
    state?: 'open' | 'closed' | 'all';
  }): Promise<GitHubIssue[]> {
    return apiClient.get<GitHubIssue[]>(`/repositories/${owner}/${repo}/issues`, { params });
  }

  async getRepositoryPullRequests(owner: string, repo: string, params?: {
    page?: number;
    state?: 'open' | 'closed' | 'all';
  }): Promise<GitHubPullRequest[]> {
    return apiClient.get<GitHubPullRequest[]>(`/repositories/${owner}/${repo}/pulls`, { params });
  }

  async createIssue(owner: string, repo: string, issueData: {
    title: string;
    description: string;
    labels?: string[];
  }): Promise<GitHubIssue> {
    const payload = {
      repository: {
        owner,
        name: repo
      },
      issue: {
        title: issueData.title,
        body: issueData.description,
        labels: issueData.labels || []
      }
    };
    
    const response = await apiClient.post<{
      success: boolean;
      issue: {
        number: number;
        title: string;
        url: string;
        created_at: string;
      };
      message: string;
    }>('/generate-issue', payload);
    
    // Transform the response to match GitHubIssue interface
    return {
      id: response.issue.number,
      number: response.issue.number,
      title: response.issue.title,
      body: issueData.description,
      state: 'open' as const,
      html_url: response.issue.url,
      user: {
        login: 'vibe-torch-bot',
        avatar_url: ''
      },
      labels: issueData.labels?.map(name => ({ name, color: 'cta-500' })) || [],
      created_at: response.issue.created_at,
      updated_at: response.issue.created_at
    };
  }
}

export const githubService = new GitHubService();