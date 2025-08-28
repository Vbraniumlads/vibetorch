import React from 'react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Card, CardContent } from '../../../components/ui/card';
import { 
  Filter, 
  X, 
  Search,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { TaskFilters as TaskFiltersType, TASK_TYPES } from '../types/task.types';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFiltersChange: (filters: Partial<TaskFiltersType>) => void;
  onRefresh: () => void;
  realTimeEnabled: boolean;
  onToggleRealTime: () => void;
  repositoryOptions?: Array<{ id: number; name: string; }>;
  isLoading?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'queued', label: 'Queued' },
  { value: 'running', label: 'Running' },
  { value: 'succeeded', label: 'Succeeded' },
  { value: 'failed', label: 'Failed' },
  { value: 'canceled', label: 'Canceled' },
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Created' },
  { value: 'updated_at', label: 'Updated' },
  { value: 'priority', label: 'Priority' },
  { value: 'type', label: 'Type' },
];

const TASK_TYPE_OPTIONS = Object.entries(TASK_TYPES).map(([key, value]) => ({
  value,
  label: key.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}));

export function TaskFilters({
  filters,
  onFiltersChange,
  onRefresh,
  realTimeEnabled,
  onToggleRealTime,
  repositoryOptions = [],
  isLoading = false
}: TaskFiltersProps) {
  const activeFiltersCount = [
    filters.status,
    filters.type,
    filters.repo_id,
    filters.search
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onFiltersChange({
      status: undefined,
      type: undefined,
      repo_id: undefined,
      search: undefined,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Top row - Search and Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={filters.search || ''}
                onChange={(e) => onFiltersChange({ search: e.target.value || undefined })}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleRealTime}
                className={realTimeEnabled ? 'bg-green-50 border-green-200' : ''}
              >
                {realTimeEnabled ? (
                  <Wifi className="h-4 w-4 mr-2 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 mr-2 text-gray-400" />
                )}
                Real-time
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filter controls */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <Select
              value={filters.status as string || 'all'}
              onValueChange={(value) => onFiltersChange({ 
                status: value === 'all' ? undefined : value as any
              })}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.type || 'all'}
              onValueChange={(value) => onFiltersChange({ 
                type: value === 'all' ? undefined : value 
              })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {TASK_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {repositoryOptions.length > 0 && (
              <Select
                value={filters.repo_id?.toString() || 'all'}
                onValueChange={(value) => onFiltersChange({ 
                  repo_id: value === 'all' ? undefined : parseInt(value) 
                })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Repository" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Repositories</SelectItem>
                  {repositoryOptions.map((repo) => (
                    <SelectItem key={repo.id} value={repo.id.toString()}>
                      {repo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select
                value={filters.sortBy || 'created_at'}
                onValueChange={(value: any) => onFiltersChange({ sortBy: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.sortOrder || 'desc'}
                onValueChange={(value: any) => onFiltersChange({ sortOrder: value })}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">↓</SelectItem>
                  <SelectItem value="asc">↑</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeFiltersCount > 0 && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {activeFiltersCount} active
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}