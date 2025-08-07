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

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  head: {
    ref: string;
  };
  base: {
    ref: string;
  };
  created_at: string;
  updated_at: string;
}