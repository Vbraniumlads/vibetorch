import React from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '../../../components/ui/drawer';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Separator } from '../../../components/ui/separator';
import { X, Clock, Activity, CheckCircle, XCircle, Pause, Copy, User, Settings, AlertCircle } from 'lucide-react';
import { formatDate, formatRelativeTime } from '../../../shared/utils/date';
import type { TaskQueue, TaskEvent } from '../types/task.types';

interface TaskDetailsDrawerProps {
  task: TaskQueue | null;
  events: TaskEvent[];
  isOpen: boolean;
  onClose: () => void;
  onCancel?: (taskId: number) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'queued':
      return <Clock className="h-4 w-4" />;
    case 'running':
      return <Activity className="h-4 w-4" />;
    case 'succeeded':
      return <CheckCircle className="h-4 w-4" />;
    case 'failed':
      return <XCircle className="h-4 w-4" />;
    case 'canceled':
      return <Pause className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
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

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export function TaskDetailsDrawer({ 
  task, 
  events, 
  isOpen, 
  onClose, 
  onCancel 
}: TaskDetailsDrawerProps) {
  if (!task) return null;

  const formatDuration = (startTime: string | undefined, endTime: string | undefined): string => {
    if (!startTime) return 'Not started';
    
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const durationMs = end.getTime() - start.getTime();
    
    if (durationMs < 1000) return '< 1 second';
    if (durationMs < 60000) return `${Math.floor(durationMs / 1000)} seconds`;
    if (durationMs < 3600000) return `${Math.floor(durationMs / 60000)} minutes`;
    return `${Math.floor(durationMs / 3600000)} hours`;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DrawerTitle className="flex items-center gap-2">
                Task #{task.id} - {task.type}
                <Badge variant={getStatusColor(task.status)} className="flex items-center gap-1">
                  {getStatusIcon(task.status)}
                  {task.status}
                </Badge>
              </DrawerTitle>
              <DrawerDescription>
                Created {formatRelativeTime(task.created_at)} • Repository #{task.repo_id}
              </DrawerDescription>
            </div>
            <div className="flex gap-2">
              {task.status === 'queued' && onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(task.id)}
                >
                  Cancel Task
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant="outline" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Task Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Task Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="font-mono">{task.type}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Priority</div>
                  <div>{task.priority}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Attempts</div>
                  <div>{task.attempt} of {task.max_attempts}</div>
                </div>
                {task.dedupe_key && (
                  <div>
                    <div className="text-sm text-muted-foreground">Dedupe Key</div>
                    <div className="font-mono text-xs flex items-center gap-2">
                      <span className="truncate">{task.dedupe_key}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(task.dedupe_key!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div className="text-sm">{formatDate(task.created_at)}</div>
                </div>
                {task.started_at && (
                  <div>
                    <div className="text-sm text-muted-foreground">Started</div>
                    <div className="text-sm">{formatDate(task.started_at)}</div>
                  </div>
                )}
                {task.finished_at && (
                  <div>
                    <div className="text-sm text-muted-foreground">Finished</div>
                    <div className="text-sm">{formatDate(task.finished_at)}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="text-sm">{formatDuration(task.started_at, task.finished_at)}</div>
                </div>
                {task.claimed_by && (
                  <div>
                    <div className="text-sm text-muted-foreground">Worker</div>
                    <div className="font-mono text-xs">{task.claimed_by}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payload */}
          {task.payload && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Payload</CardTitle>
                <CardDescription>Input data for the task</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                  {JSON.stringify(task.payload, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Result */}
          {task.result && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-green-600">Result</CardTitle>
                <CardDescription>Output data from the task</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                  {JSON.stringify(task.result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {task.error && (
            <Card className="border-destructive">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Error
                </CardTitle>
                <CardDescription>Error information from the task</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {task.error}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Events Log */}
          {events.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Event Log</CardTitle>
                <CardDescription>Task lifecycle events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {events.map((event, index) => (
                    <div key={event.id} className="flex items-start gap-3 pb-2">
                      <div className="text-xs text-muted-foreground min-w-20">
                        {formatDate(event.created_at)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{event.event_type}</div>
                        {event.event_data && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {JSON.stringify(event.event_data)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}