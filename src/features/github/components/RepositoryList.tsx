import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { RefreshCw, Search } from 'lucide-react';
import { RepositoryTable } from './RepositoryTable';
import { useRepositories } from '../hooks/useRepositories';

interface RepositoryListProps {
  viewMode?: 'table' | 'grid';
}

export function RepositoryList({ viewMode = 'table' }: RepositoryListProps) {
  const {
    repositories,
    isLoading,
    isSyncing,
    error,
    filters,
    syncRepositories,
    updateFilters,
  } = useRepositories();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">GitHub Projects</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-9 w-64"
              />
            </div>
            <Button
              onClick={syncRepositories}
              disabled={isSyncing}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {error && (
          <div className="p-4 bg-destructive/10 border-l-4 border-destructive text-destructive">
            {error}
          </div>
        )}
        
        <RepositoryTable
          repositories={repositories}
          filters={filters}
          onFiltersChange={updateFilters}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}