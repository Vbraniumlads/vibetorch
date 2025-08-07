import { apiClient } from '../../../shared/services/api.service';
import type { GitHubRepository, SyncResponse } from '../types/github.types';

export class GitHubService {
  async getRepositories(): Promise<GitHubRepository[]> {
    return apiClient.get<GitHubRepository[]>('/repositories');
  }

  async syncRepositories(): Promise<SyncResponse> {
    return apiClient.post<SyncResponse>('/repositories/sync');
  }
}

export const githubService = new GitHubService();