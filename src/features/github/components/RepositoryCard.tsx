import React from 'react';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { ExternalLink, Clock, GitBranch } from 'lucide-react';
import { formatRelativeTime, formatDate } from '../../../shared/utils/date';
import type { GitHubRepository } from '../types/github.types';

interface RepositoryCardProps {
  repository: GitHubRepository;
  compact?: boolean;
}

export function RepositoryCard({ repository, compact = false }: RepositoryCardProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium truncate">{repository.repo_name}</span>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {formatRelativeTime(repository.last_synced_at)}
            </Badge>
          </div>
          {repository.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
              {repository.description}
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          asChild
        >
          <a
            href={repository.repo_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <h3 className="font-semibold truncate">{repository.repo_name}</h3>
            </div>
            
            {repository.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {repository.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Updated {formatDate(repository.last_synced_at)}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {formatRelativeTime(repository.last_synced_at)}
              </Badge>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            asChild
          >
            <a
              href={repository.repo_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}