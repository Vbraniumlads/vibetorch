import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/components/ui/table';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { ExternalLink, Clock, ArrowUpDown } from 'lucide-react';
import { formatDate, formatRelativeTime } from '../../../shared/utils/date';
import type { GitHubRepository, RepositoryFilters } from '../types/github.types';

interface RepositoryTableProps {
  repositories: GitHubRepository[];
  filters: RepositoryFilters;
  onFiltersChange: (filters: Partial<RepositoryFilters>) => void;
  isLoading?: boolean;
}

export function RepositoryTable({ 
  repositories, 
  filters, 
  onFiltersChange, 
  isLoading = false 
}: RepositoryTableProps) {
  const handleSort = (sortBy: RepositoryFilters['sortBy']) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    onFiltersChange({ sortBy, sortOrder: newSortOrder });
  };

  const getSortIcon = (column: string) => {
    if (filters.sortBy !== column) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return <ArrowUpDown className={`h-4 w-4 ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} />;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No repositories found. Try adjusting your search or sync your repositories.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button 
              variant="ghost" 
              onClick={() => handleSort('name')}
              className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              Repository
              {getSortIcon('name')}
            </Button>
          </TableHead>
          <TableHead>Description</TableHead>
          <TableHead>
            <Button 
              variant="ghost" 
              onClick={() => handleSort('updated')}
              className="h-auto p-0 font-semibold hover:bg-transparent"
            >
              Last Updated
              {getSortIcon('updated')}
            </Button>
          </TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {repositories.map((repo) => (
          <TableRow key={repo.id}>
            <TableCell className="font-medium">
              <div className="flex flex-col">
                <span className="font-semibold">{repo.repo_name}</span>
                <Badge variant="secondary" className="w-fit mt-1 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatRelativeTime(repo.last_synced_at)}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-sm text-muted-foreground line-clamp-2">
                {repo.description || 'No description'}
              </span>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(repo.last_synced_at)}
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="ghost"
                asChild
              >
                <a
                  href={repo.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}