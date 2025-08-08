import React, { useState, useMemo } from 'react';
import { Search, ExternalLink, Star, GitFork, Eye, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { GitHubRepository } from '../features/github/types/github.types';
import { useNavigate } from 'react-router-dom';

interface RepositorySearchProps {
  repositories: GitHubRepository[];
  className?: string;
}

export function RepositorySearch({ repositories, className = '' }: RepositorySearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Filter repositories based on search query
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.trim().toLowerCase();
    return repositories.filter(repo =>
      repo.repo_name.toLowerCase().includes(searchTerm) ||
      repo.description?.toLowerCase().includes(searchTerm)
    );
  }, [repositories, query]);

  const clearSearch = () => {
    setQuery('');
  };

  const handleViewDetails = (repo: GitHubRepository) => {
    // Extract owner from repo_url
    const urlParts = repo.repo_url.split('/');
    const owner = urlParts[urlParts.length - 2];
    navigate(`/repository/${owner}/${repo.repo_name}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search your repositories by name or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {query && (
          <Button
            onClick={clearSearch}
            variant="outline"
            className="px-4"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Results Overlay */}
      {query.trim() && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-background border border-border rounded-lg shadow-lg">
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Results Header */}
          {filteredResults.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {filteredResults.length} of {repositories.length} repositories
              </p>
            </div>
          )}

          {/* Results List */}
          {filteredResults.length > 0 ? (
            <div className="space-y-3">
              {filteredResults.map((repo) => (
                <Card 
                  key={repo.id}
                  className="hover:shadow-md transition-all duration-200 border-border/50 hover:border-cta-500/50 group"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Repository Name */}
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground group-hover:text-cta-600 transition-colors truncate">
                            {repo.repo_name}
                          </h4>
                          {repo.private && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              Private
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {repo.description || 'No description available'}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {repo.language && (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-cta-500"></div>
                              <span>{repo.language}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            <span>{repo.stargazers_count || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <GitFork className="w-3 h-3" />
                            <span>{repo.forks_count || 0}</span>
                          </div>
                          <span>Updated {formatDate(repo.updated_at)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleViewDetails(repo)}
                          className="bg-cta-500 hover:bg-cta-600 text-white"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a
                            href={repo.repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium text-foreground mb-2">No repositories found</h4>
                <p className="text-muted-foreground">
                  Try a different search term or check your spelling
                </p>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
