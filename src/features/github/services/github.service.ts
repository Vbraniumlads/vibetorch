import { apiClient } from '../../../shared/services/api.service';
import type { GitHubRepository, SyncResponse } from '../types/github.types';

export class GitHubService {
  async getRepositories(): Promise<GitHubRepository[]> {
    return apiClient.get<GitHubRepository[]>('/repos');
  }

  async syncRepositories(): Promise<SyncResponse> {
    return apiClient.post<SyncResponse>('/repos/sync');
  }
}

export const githubService = new GitHubService();