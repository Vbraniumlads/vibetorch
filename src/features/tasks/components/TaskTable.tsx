import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/components/ui/table';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Eye, X, Clock, ArrowUpDown, Activity, CheckCircle, XCircle, Pause } from 'lucide-react';
import { formatDate, formatRelativeTime } from '../../../shared/utils/date';
import type { TaskQueue, TaskListFilters, TaskStatus } from '../types/task.types';

interface TaskTableProps {
  tasks: TaskQueue[];
  filters: TaskListFilters;
  onFiltersChange: (filters: Partial<TaskListFilters>) => void;
  onViewDetails: (task: TaskQueue) => void;
  onCancelTask?: (taskId: number) => void;
  isLoading?: boolean;
}

const getStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case 'queued':
      return <Clock className="h-3 w-3" />;
    case 'running':
      return <Activity className="h-3 w-3" />;
    case 'succeeded':
      return <CheckCircle className="h-3 w-3" />;
    case 'failed':
      return <XCircle className="h-3 w-3" />;
    case 'canceled':
      return <Pause className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

const getStatusColor = (status: TaskStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'queued':
      return 'secondary';
    case 'running':
      return 'default';
    case 'succeeded':
      return 'outline';
    case 'failed':
      return 'destructive';
    case 'canceled':
      return 'outline';
    default:
      return 'secondary';
  }
};

const formatDuration = (startTime: string | undefined, endTime: string | undefined): string => {
  if (!startTime) return '-';
  
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const durationMs = end.getTime() - start.getTime();
  
  if (durationMs < 1000) return '< 1s';
  if (durationMs < 60000) return `${Math.floor(durationMs / 1000)}s`;
  if (durationMs < 3600000) return `${Math.floor(durationMs / 60000)}m`;
  return `${Math.floor(durationMs / 3600000)}h`;
};

export function TaskTable({ 
  tasks, 
  filters, 
  onFiltersChange, 
  onViewDetails,
  onCancelTask,
  isLoading = false 
}: TaskTableProps) {
  const handleSort = (sortBy: 'created_at' | 'priority' | 'status') => {
    // Simple toggle for now - can be extended with more sophisticated sorting
    onFiltersChange({ 
      ...filters,
      // Add client-side sorting logic or server-side sort params
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tasks found. Tasks will appear here when created.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Repository</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Attempts</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead className="w-20">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="font-medium">
              <div className="flex flex-col">
                <span className="font-semibold">{task.type}</span>
                {task.priority > 0 && (
                  <Badge variant="outline" className="w-fit mt-1 text-xs">
                    Priority: {task.priority}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusColor(task.status)} className="flex items-center gap-1 w-fit">
                {getStatusIcon(task.status)}
                {task.status}
              </Badge>
              {task.error && (
                <div className="text-xs text-destructive mt-1 truncate max-w-48" title={task.error}>
                  {task.error}
                </div>
              )}
            </TableCell>
            <TableCell>
              <span className="text-sm">Repo #{task.repo_id}</span>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              <div className="flex flex-col">
                <span>{formatRelativeTime(task.created_at)}</span>
                <span className="text-xs">{formatDate(task.created_at)}</span>
              </div>
            </TableCell>
            <TableCell className="text-sm">
              <div className="flex items-center gap-1">
                <span>{task.attempt}/{task.max_attempts}</span>
                {task.attempt > 1 && (
                  <Badge variant="outline" className="text-xs">
                    retry
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDuration(task.started_at, task.finished_at)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewDetails(task)}
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {task.status === 'queued' && onCancelTask && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onCancelTask(task.id)}
                    title="Cancel task"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}