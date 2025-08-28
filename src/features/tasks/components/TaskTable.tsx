import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  X,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { Task, TASK_STATUS_COLORS } from '../types/task.types';

interface TaskTableProps {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
  onCancelTask: (id: number) => void;
  isLoading?: boolean;
  showRepository?: boolean;
}

const getStatusIcon = (status: Task['status']) => {
  const iconProps = { size: 16 };
  
  switch (status) {
    case 'queued':
      return <Clock {...iconProps} className="text-blue-600" />;
    case 'running':
      return <Play {...iconProps} className="text-yellow-600" />;
    case 'succeeded':
      return <CheckCircle {...iconProps} className="text-green-600" />;
    case 'failed':
      return <XCircle {...iconProps} className="text-red-600" />;
    case 'canceled':
      return <X {...iconProps} className="text-gray-600" />;
    default:
      return <AlertCircle {...iconProps} className="text-gray-600" />;
  }
};

const formatTaskType = (type: string) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const getAttemptDisplay = (attempt: number, maxAttempts: number) => {
  if (attempt === 0) return '—';
  return `${attempt}/${maxAttempts}`;
};

export function TaskTable({ 
  tasks, 
  onTaskSelect, 
  onCancelTask, 
  isLoading = false,
  showRepository = true
}: TaskTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No tasks found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks ({tasks.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Status</TableHead>
                <TableHead>Type</TableHead>
                {showRepository && <TableHead>Repository</TableHead>}
                <TableHead>Created</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      <Badge 
                        variant="secondary" 
                        className={TASK_STATUS_COLORS[task.status]}
                      >
                        {task.status}
                      </Badge>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {formatTaskType(task.type)}
                      </div>
                      {task.error && (
                        <div className="text-sm text-red-600 truncate max-w-xs">
                          {task.error}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {showRepository && (
                    <TableCell>
                      {task.repository?.owner?.login && task.repository?.repo_name ? (
                        <Link 
                          to={`/repository/${task.repository.owner.login}/${task.repository.repo_name}`}
                          className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
                        >
                          {task.repository.owner.avatar_url && (
                            <img
                              src={task.repository.owner.avatar_url}
                              alt={task.repository.owner.login}
                              className="w-5 h-5 rounded-full"
                            />
                          )}
                          <span className="truncate max-w-xs underline-offset-2 hover:underline">
                            {`${task.repository.owner.login}/${task.repository.repo_name}`}
                          </span>
                        </Link>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-500">
                          <span className="truncate max-w-xs">
                            Repo #{task.repo_id}
                          </span>
                        </div>
                      )}
                    </TableCell>
                  )}

                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {getAttemptDisplay(task.attempt, task.max_attempts)}
                      </span>
                      {task.attempt > 0 && task.status === 'queued' && (
                        <RotateCcw size={14} className="text-orange-500" title="Retrying" />
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onTaskSelect(task)}
                        className="h-8 w-8 p-0"
                        title="View details"
                      >
                        <Eye size={14} />
                      </Button>
                      
                      {task.status === 'queued' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onCancelTask(task.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                          title="Cancel task"
                        >
                          <X size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}