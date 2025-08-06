// GitHub feature exports
export { useRepositories } from './hooks/useRepositories';
export { githubService } from './services/github.service';
export { RepositoryCard } from './components/RepositoryCard';
export { RepositoryTable } from './components/RepositoryTable';
export { RepositoryList } from './components/RepositoryList';

// Types
export type { 
  GitHubRepository, 
  SyncResponse, 
  RepositoryFilters, 
  RepositoryState 
} from './types/github.types';