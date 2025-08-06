export interface GitHubRepository {
  id: number;
  user_id: number;
  repo_name: string;
  repo_url: string;
  description?: string;
  last_synced_at: string;
  created_at: string;
}

export interface SyncResponse {
  message: string;
  repositories: GitHubRepository[];
}

export interface RepositoryFilters {
  search?: string;
  sortBy?: 'name' | 'updated' | 'created';
  sortOrder?: 'asc' | 'desc';
}

export interface RepositoryState {
  repositories: GitHubRepository[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  filters: RepositoryFilters;
}